import Danbooru from "../models/api/Danbooru";
import { StaffNote, StaffNoteExtended } from "../models/api/e621/StaffNote";
import { PageDefinition } from "../models/data/Page";
import { html } from "../utilities/HtmlTemplate";
import Util from "../utilities/Util";
import Component from "./Component";
    
/**
 * Pulls all the staff notes on the page, & puts them into your clipboard.
 */
export default class RipStaffNotes extends Component {
  private static readonly staffNoteSelector = ".staff-note";
  private static readonly staffNoteDTextSelector = "textarea[name=\"staff_note\\[body\\]\"]";
  private readonly noteCache: { [id: number]: Partial<StaffNoteExtended<true>> } = {};
  private textToCopy?: string;
  /**
   * 
   * @param note The `<article>` representing the staff note; should have an `id` attribute containing the DB id.
   * @returns The id if found, -1 otherwise.
   */
  private pullIdFromStaffNote(note: HTMLElement) { return parseInt(/^staff-note-([0-9]+)$/.exec(note.id)?.[1] ?? "-1"); }
  public constructor() {
    super({
      constraint: [PageDefinition.users.view, PageDefinition.staff_notes.list],
      waitForDOM: RipStaffNotes.staffNoteDTextSelector,
    });
  }

  private onClick() {
    if ((this.textToCopy ??= this.constructTextSync())) {
      navigator.clipboard.writeText(this.textToCopy).then(
        () => Danbooru.Toast.notice(`Copied staff notes to the clipboard!`),
        err => {
          Danbooru.Toast.alert(`Failed to copy staff notes to the clipboard${err?.message ? `(${err.message})` : ""}; trying it again usually works.`);
          // console.error(err);
        },
      );
      return;
    }
    Danbooru.Toast.notice(`Retrieving raw staff notes...`);
    this.constructText().then(
      e => alert(
        `Ready to copy! I can't write to your clipboard unless directly triggered by a user action, but you can go click the button now, or copy the text manually from here:\n\n${this.textToCopy = e}`,
      ),
      err => {
        Danbooru.Toast.alert(`Failed to retrieve contents of staff notes${err?.message ? `(${err.message})` : ""}.`);
        // console.error(err);
      },
    );
  }

  Settings = {
    enabled: true,
    reverseOrder: true,
    staffNoteTemplate: `[section=From staff note #%id% by %creator_name%]\n` +
    `Originally from "staff note #%id%":[/staff_notes/%id%] by "%creator_name%":[/users/%creator_id%]:\n` +
    `[quote]\n` +
    `%body%\n` +
    `[/quote]\n` +
    `[/section]`
  };

  private initSettingsMenu() {
    const button = html`<button type="submit"${((this.textToCopy ??= this.constructTextSync())) ? "" : " disabled"}>Rip Staff Notes</button>` as HTMLButtonElement;
    const retrieveButton = html`<button>Retrieve Staff Notes</button>` as HTMLButtonElement;
    button.addEventListener("click", () => this.onClick());
    retrieveButton.addEventListener("click", () => {
      const cpy = (text: string) => {
        this.textToCopy = text;
        button.disabled = false;
        Danbooru.Toast.notice("Ready to copy!");
      };
      const text = this.constructTextSync();
      if (text) {
        cpy(text);
        return;
      }
      Danbooru.Toast.notice(`Retrieving raw staff notes...`);
      this.constructText().then(
        cpy,
        err => {
          Danbooru.Toast.alert(`Failed to retrieve contents of staff notes${err?.message ? `(${err.message})` : ""}.`);
          // console.error(err);
        },
      );
    });
    this.settingsMenuDialogParameters = {
      elements:[
        $(retrieveButton),
        $(button),
        $("<br />"),
        $(this.simpleSettingsTextArea(
          "staffNoteTemplate",
          undefined,
          undefined,
          { placeholder: `Valid template parameters: ${StaffNote.extendedJsonKeys.join(", ")}` },
        )),
        // $(`<textarea id="setting-header" name="setting-header" placeholder=""></textarea>`).text(this.Settings.staffNoteTemplate),
        $("<br />"),
        $(this.simpleSettingsCheckbox("reverseOrder")),
        $("<br />"),
        $(this.resetSettingsDialogElement),
        $("<br />"),
      ],
      optionsOrTitle: "Rip Staff Notes",
      then: (e: FormData) => {
        if (this.handleResetSettingsDialogElement(e)) return;
        this.Settings.reverseOrder = e.get(`${this.settingsIdPrefix}reverseOrder`) === "true";
      },
    };
  }

  private retrieveStaffNoteContentsFromServer(id: number) {
    if ((!id && id !== 0) || id < 0) throw new Error("Invalid ID for staff note.");
    // (await (await fetch(`/staff_notes/${id}.json`, { body: encodeURIComponent(REMT.API.getAuthToken()) })).json())["body"];
    return fetch(`/staff_notes/${id}.json`, { headers: Util.Network.simpleAuthHeaders }).then(
      response => response.json().then(
        e => {
          if (e["body"]) return e["body"] as string;
          Danbooru.Toast.alert(`Failed to retrieve staff note #${id} from server (empty body).`);
          throw new Error("Staff note body was empty");
        },
        err => {
          Danbooru.Toast.alert(`Failed to retrieve staff note #${id} from server (error parsing response as json${err?.message ? `; ${err.message}` : ""}).`);
          throw err;
        },
      ),
    );
  }
  private async retrieveStaffNoteContentsAsync(note: HTMLElement, id: number = this.pullIdFromStaffNote(note), timeout?: number) {
    return (this.noteCache[id] ??= StaffNote.extractJsonFromHtml(note)).body ??=
      StaffNote.retrieveStaffNoteContentsFromHtml(note) ?? 
      await ((timeout && timeout > 0) ?
        Util.sleep(timeout).then(() => this.retrieveStaffNoteContentsFromServer(id)) :
        this.retrieveStaffNoteContentsFromServer(id));
  }

  private constructTextSync() {
    const staffNotes = Array.from(document.querySelectorAll<HTMLElement>(RipStaffNotes.staffNoteSelector));
    if (this.Settings.reverseOrder) staffNotes.reverse();
    let text = "";
    function cb(this: RipStaffNotes, note: HTMLElement) {
      const data = StaffNote.extractAllDataFromHtml(note);
      if (data.id === undefined || data.id < 0) return true;
      this.noteCache[data.id] = data;
      if (!data.body) return true;
      if (!data.creator_name) return true;
      text += `${this.buildText(data as StaffNoteExtended<true>)}\n\n`;
      return false;
    }
    if (staffNotes.some(cb.bind(this))) return;
    return text.trimEnd();
  }

  /** Used as a simple way to toggle if failures are treated as fatal. */
  private reportFailure(message: string): string {
    // Danbooru.Toast.alert(message);
    // return "";
    throw new Error(message);
  }
  private async constructText() {
    const staffNotes = Array.from(document.querySelectorAll<HTMLElement>(RipStaffNotes.staffNoteSelector));
    if (this.Settings.reverseOrder) staffNotes.reverse();
    // TODO: Do as a batch operation.
    /* const toFetch: number[] = [];
    const buildNoteText = (data: StaffNoteExtended<true>) => {
      try {
        return this.buildText(data);
      } catch (err) {
        const m = err instanceof TypeError && err.message.match(/^can't access property "(.+?)" of undefined$/);
        if (m)
          return this.reportFailure(`Failed to retrieve key "${m[1]}" from staff note #${data.id}"`);
        throw err;
      }
    };
    const builtNotes = staffNotes.map((note, index) => {
      const data = StaffNote.extractAllDataFromHtml(note);
      if (data.id === undefined || data.id < 0) {
        return this.reportFailure(`Failed to retrieve staff note id #${data.id}"`);
      }
      this.noteCache[data.id] = data;
      if (!data.body) {
        toFetch.push(index);
        return undefined;
      }
      return buildNoteText(data as StaffNoteExtended<true>);
    });
    if (toFetch.length > 0) {
      await Promise.all(toFetch.map(e => {
        staffNotes[i]// 
      }))
    } */
    let asyncCount = 0;
    return (await Promise.all(staffNotes.map(async (note) => {
      const data = StaffNote.extractAllDataFromHtml(note);
      if (data.id === undefined || data.id < 0) {
        return this.reportFailure(`Failed to retrieve staff note id #${data.id}"`);
      }
      this.noteCache[data.id] = data;
      if (!(data.body ??= await this.retrieveStaffNoteContentsAsync(note, data.id, (asyncCount++ * 2000)))) {
        return this.reportFailure(`Failed to retrieve body from staff note #${data.id}"`);
      }
      /* for (const k in StaffNote.extendedJsonKeys) {
        if (data[k] === undefined) {
          return this.reportFailure(`Failed to retrieve key "${k}" from staff note #${data.id}"`);
        }
      } */
      try {
        return this.buildText(data as StaffNoteExtended<true>);
      } catch (err) {
        const m = err instanceof TypeError && err.message.match(/^can't access property "(.+?)" of undefined$/);
        if (m)
          return this.reportFailure(`Failed to retrieve key "${m[1]}" from staff note #${data.id}"`);
        throw err;
      }
    }))).join("\n\n");
  }

  /**
   * @todo Make template string?
   */
  // private buildText({ body, id, creator_name }: { body: string, id: number, creator_name: string }) {
  private buildText(options: StaffNoteExtended<true>) {
    return Util.replaceTemplateVariables(this.Settings.staffNoteTemplate, new Map<string, string>(Object.entries(options).map(e => [e[0], e[1].toString()])));
  }

  protected create(): Promise<void> {
    this.initSettingsMenu();
    return Promise.resolve();
  }

}
