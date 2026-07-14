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

  Settings = { enabled: true, reverseOrder: true, };

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
      elements:[$(retrieveButton), $(button), $("<br />")],
      optionsOrTitle: "Rip Staff Notes",
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
  private async retrieveStaffNoteContentsAsync(note: HTMLElement, id: number = this.pullIdFromStaffNote(note)) {
    // return this.noteTextCache[id] = this.retrieveStaffNoteContents(note, id, false) ?? await this.retrieveStaffNoteContentsFromServer(id);
    return (this.noteCache[id] ??= StaffNote.extractJsonFromHtml(note)).body ??= StaffNote.retrieveStaffNoteContentsFromHtml(note) ?? await this.retrieveStaffNoteContentsFromServer(id);
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

  private async constructText() {
    const staffNotes = Array.from(document.querySelectorAll<HTMLElement>(RipStaffNotes.staffNoteSelector));
    if (this.Settings.reverseOrder) staffNotes.reverse();
    return (await Promise.all(staffNotes.map(async note => {
      const data = StaffNote.extractAllDataFromHtml(note);
      if (data.id === undefined || data.id < 0) return "";
      this.noteCache[data.id] = data;
      if (!(data.body ??= await this.retrieveStaffNoteContentsAsync(note, data.id))) return "";
      if (!data.creator_name) return "";
      return this.buildText(data as StaffNoteExtended<true>);
    }))).join("\n\n");
  }

  /**
   * @todo Make template string?
   */
  // private buildText({ body, id, creator_name }: { body: string, id: number, creator_name: string }) {
  private buildText({ body, id, creator_name, creator_id }: StaffNoteExtended<true>) {
    return `[section=From staff note #${id} by ${creator_name}]\n` +
    `Originally from "staff note #${id}":[/staff_notes/${id}] by "${creator_name}":[/users/${creator_id}]:\n` +
    `[quote]\n` +
    `${body}\n` +
    `[/quote]\n` +
    `[/section]`;
  }

  protected create(): Promise<void> {
    this.initSettingsMenu();
    return Promise.resolve();
  }

}
