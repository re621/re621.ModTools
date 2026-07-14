import Danbooru from "../models/api/Danbooru";
import { PageDefinition } from "../models/data/Page";
import { html } from "../utilities/HtmlTemplate";
import Util from "../utilities/Util";
import Component from "./Component";
    
/**
 * @todo What does this do?
 */
export default class RipStaffNotes extends Component {
  private static readonly staffNoteSelector = ".staff-note";
  private static readonly staffNoteDTextSelector = "textarea[name=\"staff_note\\[body\\]\"]";
  private readonly noteTextCache: { [id: number]: string } = {};
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
    function addToClipboard(text: string, prompt = true) {
      if (prompt && !confirm("Ready to copy! Sorry for the pop-up, but I can't access your clipboard unless directly triggered by a user action, & apparently, network delays don't count.")) return;
      navigator.clipboard.writeText(text).then(
        () => Danbooru.Toast.notice(`Copied staff notes to the clipboard!`),
        err => {
          Danbooru.Toast.alert(`Failed to copy staff notes to the clipboard${err?.message ? `(${err.message})` : ""}; trying it again usually works.`);
          console.error(err);
        },
      );
    }
    if ((this.textToCopy ??= this.constructTextSync())) {
      addToClipboard(this.textToCopy, false);
      return;
    }
    Danbooru.Toast.notice(`Retrieving raw staff notes...`);
    this.constructText().then(
      addToClipboard,
      err => {
        Danbooru.Toast.alert(`Failed to retrieve contents of staff notes.`);
        console.error(err);
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
          Danbooru.Toast.alert(`Failed to retrieve contents of staff notes.`);
          console.error(err);
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
      e => e.json().then(
        e => {
          if (e["body"]) return e["body"] as string;
          Danbooru.Toast.alert(`Failed to retrieve staff note #${id} from server (empty body).`);
          console.error("Staff note body was empty")
          throw new Error("Staff note body was empty");
        },
        e => {
          Danbooru.Toast.alert(`Failed to retrieve staff note #${id} from server (error parsing response as json).`);
          console.error(e);
          throw e;
        },
      ),
    );
  }
  private retrieveStaffNoteContentsFromHtml(note: HTMLElement) { return note.querySelector<HTMLTextAreaElement>(RipStaffNotes.staffNoteDTextSelector)?.value; }
  private async retrieveStaffNoteContentsAsync(note: HTMLElement, id: number = this.pullIdFromStaffNote(note)) {
    return this.noteTextCache[id] = this.retrieveStaffNoteContents(note, id, false) ?? await this.retrieveStaffNoteContentsFromServer(id);
  }

  private retrieveStaffNoteContents(note: HTMLElement, id: number = this.pullIdFromStaffNote(note), retrieveInBackground = true) {
    if ((id ?? -1) >= 0 && this.noteTextCache[id]) return this.noteTextCache[id];
    const fromEditBox = this.retrieveStaffNoteContentsFromHtml(note);
    // It might have been altered; only store it from this source once.
    if (fromEditBox) return this.noteTextCache[id] ??= fromEditBox;
    if (retrieveInBackground) this.retrieveStaffNoteContentsFromServer(id).then(e => this.noteTextCache[id] = e);
    return;
  }

  private constructTextSync() {
    const staffNotes = Array.from(document.querySelectorAll<HTMLElement>(RipStaffNotes.staffNoteSelector));
    if (this.Settings.reverseOrder) staffNotes.reverse();
    let text = "";
    function cb(this: RipStaffNotes, note: HTMLElement) {
      const id = parseInt(/^staff-note-([0-9]+)$/.exec(note.id)?.[1] ?? "-1");
      if (id < 0) return true;
      const contents = this.retrieveStaffNoteContents(note, id, false);
      if (!contents) return true;
      const authorName = note.querySelector<HTMLTextAreaElement>(".author-name")?.innerText;
      if (!authorName) return true;
      text += `${this.buildText(contents, id, authorName)}\n`;
      return false;
    }
    // staffNotes.some(note => {
    //   const id = parseInt(/^staff-note-([0-9]+)$/.exec(note.id)?.[1] ?? "-1");
    //   const contents = this.retrieveStaffNoteContents(note, id);
    //   if (!contents) return true;
    //   if (id < 0) return true;
    //   const authorName = note.querySelector<HTMLTextAreaElement>(".author-name")?.innerText;
    //   if (!authorName) return true;
    //   text += this.buildText(contents, id, authorName);
    //   return false;
    // });
    if (staffNotes.some(cb.bind(this))) return;
    return text.trimEnd();
  }

  private async constructText() {
    const staffNotes = Array.from(document.querySelectorAll<HTMLElement>(RipStaffNotes.staffNoteSelector));
    if (this.Settings.reverseOrder) staffNotes.reverse();
    return (await Promise.all(staffNotes.map(async note => {
      const id = this.pullIdFromStaffNote(note);
      if (id < 0) return "";
      const contents = await this.retrieveStaffNoteContentsAsync(note, id);
      if (!contents) return "";
      const authorName = note.querySelector<HTMLTextAreaElement>(".author-name")?.innerText;
      if (!authorName) return "";
      return this.buildText(contents, id, authorName);
    }))).join("\n");
  }

  /**
   * @todo Make template string?
   * @param contents 
   * @param id 
   * @param authorName 
   * @returns 
   */
  private buildText(contents: string, id: number, authorName: string) {
    return `[section=From staff note #${id} by ${authorName}]\n` +
    `Originally from "staff note #${id}":[/staff_notes/${id}] by ${authorName}:\n` +
    `[quote]\n` +
    `${contents}\n` +
    `[/quote]\n` +
    `[/section]`;
  }

  protected create(): Promise<void> {
    this.initSettingsMenu();
    return Promise.resolve();
  }

}
