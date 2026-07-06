import Page, { PageDefinition } from "../models/data/Page";
import Component from "./Component";
import REMT from "../../REMT";
import Danbooru from "../models/api/Danbooru";
import Util from "../utilities/Util";
import { DialogForm } from "../models/structure/DialogForm";
import Debug from "../models/Debug";
import { html } from "../utilities/HtmlTemplate";

export default class DMailToStaffNote extends Component {
  public static readonly TICKET_MATCHER = /^"Your ticket":\/tickets\/([0-9]+) has been updated by /;
  private readonly templateVariables = new Map<string|RegExp, string|((key: string, ...args: any[]) => string)>([
    ["dmailId", () => this.dmailJson["id"].toString()],
    ["dmailQuery", () => new URL(
      document.querySelector<HTMLAnchorElement>("a#share-link")?.href ?? location.href,
    ).search],
    ["title", () => this.dmailJson["title"].toString()],
    ["ticketId", (v) => {
      if (!this.dmailJson || !(this.dmailJson["body"])) return v;
      const b: string = this.dmailJson["body"].toString();
      return DMailToStaffNote.TICKET_MATCHER.exec(b)?.[1]?.toString() ?? v;
    }],
    ["sender", () => this.dmailJson["from_name"].toString()],
    ["recipient", () => this.dmailJson["to_name"].toString()],
    ["senderId", () => this.dmailJson["from_id"].toString()],
    ["recipientId", () => this.dmailJson["to_id"].toString()],
  ]);
  private dmailJson: any | undefined;
  /** Indicates if we're currently getting the DMail JSON. */
  private isFetching = false;
  /** Indicates if we've previously gotten the DMail JSON. */
  private wasFetched = false;

  public constructor() {
    super({
      constraint: [PageDefinition.dmails.view],
      waitForDOM: true,
    });
  }

  public Settings = {
    enabled: true,
    header: '"DMail":[/dmails/%dmailId%%dmailQuery%] sent regarding ticket #%ticketId%\n[section=$title]',
    footer: "[/section]\n",
  };

  private revealSettingsDialog(): boolean {
    DialogForm.getRequestedInput(
      [
        $('<label for="setting-header">Default Staff Note Header</label>'),
        $(`<textarea id="setting-header" name="setting-header" placeholder="Valid template parameters: ${Array.from(this.templateVariables.keys()).join(", ")}"></textarea>`).text(this.Settings.header),
        $('<br />'),
        $('<label for="setting-footer">Default Staff Note Footer</label>'),
        $(`<textarea id="setting-footer" name="setting-footer" placeholder="Valid template parameters: ${Array.from(this.templateVariables.keys()).join(", ")}"></textarea>`).text(this.Settings.footer),
      ],
      "Settings",
      (e: FormData) => {
        this.Settings.header = e.get("setting-header")?.toString() ?? "";
        this.Settings.footer = e.get("setting-footer")?.toString() ?? "";
        // TODO: Update text boxes
      },
    );
    return false;
  }

  /**
	 * NOTE: Currently needs to get the body's raw DText from server.
	 * IDEA: Add option to edit a preexisting staff note.
	 * @todo: Disable textarea & reenable it when the submit button is pressed so it's actually included in the form's output.
	 */
  protected async create(): Promise<void> {
    const dmailInfo = DMailToStaffNote.findDMailIds();
    if (!dmailInfo) {
      Debug.log("Failed to pull required info from URL in `DMailToStaffNote`.");
      return;
    }
    this.dmailJson = {};
    this.dmailJson.id = dmailInfo.id;
    this.dmailJson.title = dmailInfo.title;

    const cBox = html`<input type="checkbox" id="add-staff-note" name="add-staff-note" />` as HTMLInputElement,
      cBoxLabel = html`<label for="add-staff-note">Add Staff Note? </label>` as HTMLLabelElement,
      userDropdownRecipient = html`<option value="${dmailInfo.recipientId}" selected>${dmailInfo.recipientName}</option>` as HTMLOptionElement,
      userDropdownSender = html`<option value="${dmailInfo.senderId}">${dmailInfo.senderName}</option>` as HTMLOptionElement,
      userDropdown = html`<select id="user-dropdown-input" name="user-dropdown-input">${userDropdownRecipient}${userDropdownSender}</select>` as HTMLSelectElement,
      userDropdownLabel = html`<label for="user-dropdown-input">User to add staff note to: </label>` as HTMLLabelElement,
      noteHeader = html`<textarea
        id="note-header-input"
        name="note-header-input"
        style="width: 100%;">${
        Util.replaceTemplateVariables(this.Settings.header, this.templateVariables)
      }</textarea>` as HTMLTextAreaElement,
      noteHeaderLabel = html`<label for="note-header-input">Staff Note Header</label>` as HTMLLabelElement,
      noteFooter = html`<textarea
        id="note-footer-input"
        name="note-footer-input"
        style="width: 100%;">${
        Util.replaceTemplateVariables(this.Settings.footer, this.templateVariables)
      }</textarea>` as HTMLTextAreaElement,
      noteFooterLabel = html`<label for="note-footer-input">Staff Note Footer</label>` as HTMLLabelElement,
      inputBox = html`<div style="display: none; width: 100%;">
        ${userDropdownLabel}
        ${userDropdown}
        <br />
        ${noteHeaderLabel}
        ${noteHeader}
        ${noteFooterLabel}
        ${noteFooter}
      </div>` as HTMLDivElement,

      authToken = html`<input
        type="hidden"
        name="authenticity_token"
        autocomplete="off"
        value="${REMT.API.getAuthToken()}" />` as HTMLInputElement,
      staff_note_body = html`<textarea
        id="staff_note_body"
        class="dtext-formatter-input"
        name="staff_note[body]"
        style="overflow-y: scroll;"></textarea>` as HTMLTextAreaElement,
      staff_note_bodyLabel = html`<label for="staff_note[body]">Final Staff Note Body</label>` as HTMLLabelElement,
      submit = html`<input type="submit" value="Create Staff Note" disabled style="display: block; marginTop: 4px;" />` as HTMLInputElement,
      form = html`<form
        id="staff-note-data-form"
        action="/staff_notes?user_id=${dmailInfo.recipientId}"
        novalidate="true"
        accept-charset="UTF-8"
        method="post"
        style="display: none; width: 100%"
      >
        ${authToken}
        ${staff_note_bodyLabel}
        ${staff_note_body}
        ${submit}
      </form>` as HTMLFormElement;

    const updateStaffNoteBodyDisplay = noteHeader.oninput = noteFooter.oninput = () => {
      staff_note_body.value = `${Util.replaceTemplateVariables(noteHeader.value, this.templateVariables)}\n${this.dmailJson["body"] || ""}\n${Util.replaceTemplateVariables(noteFooter.value, this.templateVariables)}`;
      $(staff_note_body).trigger("input.danbooru.formatter");
    }

    const fetchDMailJSON = async () => {
      const t = await (await fetch(`/dmails/${dmailInfo.id}.json`)).json();
      this.dmailJson = t;
      userDropdownRecipient.innerText = t["to_name"];
      userDropdownSender.innerText = t["from_name"];
      userDropdownRecipient.value = t["to_id"];
      userDropdownSender.value = t["from_id"];
      submit.disabled = false;
      this.isFetching = false;
      this.wasFetched = true;
      // Update header/footer values
      // IDEA: Somehow also move cursor accordingly if currently being edited?
      noteHeader.value = Util.replaceTemplateVariables(noteHeader.value, this.templateVariables);
      noteFooter.value = Util.replaceTemplateVariables(noteFooter.value, this.templateVariables);
      // Update body
      updateStaffNoteBodyDisplay();
    };
    userDropdown.onchange = () => form.action = `/staff_notes?user_id=${Number(userDropdown.value)}`;

    cBox.onchange = () => {
      if (cBox.checked) {
        form.style.display = inputBox.style.display = "revert";
        if (!this.wasFetched && !this.isFetching) {
          this.isFetching = true;
          fetchDMailJSON();
        } else {
          submit.disabled = false;
        }
      } else {
        submit.disabled = true;
        form.style.display = inputBox.style.display = "none";
      }
    };
    // IDEA: Wrap in a single element that's appended to the preexisting HTML instead of slotting in multiple elements.
    const content = Util.DOM.querySelector(".dmail");
    content.insertAdjacentElement("beforeend", cBoxLabel);
    content.insertAdjacentElement("beforeend", cBox);
    // #region Settings Button
    const settingsButton = html`<button>Edit Settings</button>` as HTMLButtonElement;
    settingsButton.onclick = () => this.revealSettingsDialog();
    content.insertAdjacentElement("beforeend", settingsButton);
    // #endregion Settings Button
    content.insertAdjacentElement("beforeend", inputBox);
    content.insertAdjacentElement("beforeend", form);
    if (Danbooru.DTextFormatter?.buildFromTextarea) Danbooru.DTextFormatter.buildFromTextarea($(staff_note_body));
    return;
  }

  /**
	 * Pulls some info about DMail from the HTML.
	 * @returns An object containing all the info about the DMail exchange that could be pulled from the page's HTML w/o querying the server.
	 */
  public static findDMailIds() {
    const id = Page.getPageID();
    const { id: recipientId, name: recipientName } = this.pullIdAndName(2);
    const { id: senderId, name: senderName } = this.pullIdAndName(1);
    const title = Util.DOM.querySelector<HTMLAnchorElement>(".dmail h2").innerText;
    return {
      id,
      recipientId,
      senderId,
      recipientName,
      senderName,
      title,
    };
  }

  /**
	 * 
	 * @param number 
	 * @returns 
	 */
  private static pullIdAndName(number: number) {
    const user = Util.DOM.querySelector<HTMLAnchorElement>(`.dmail ul li:nth-of-type(${number}) a[href^='/users/']`);
    const id = /^\/users\/([0-9]+)/.exec(new URL(user.href).pathname)?.[1];
    if (!id) throw new Error("Expected URL path segment not found (`/users/:id`; no `:id` found).");
    return {
      id: id,
      name: user.innerText,
    };
  }
}
