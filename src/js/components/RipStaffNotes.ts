import REMT from "../../REMT";
import Danbooru from "../models/api/Danbooru";
import { PageDefinition } from "../models/data/Page";
import { html } from "../utilities/HtmlTemplate";
import Component from "./Component";
    
/**
 * @todo What does this do?
 */
export default class RipStaffNotes extends Component {

  private static readonly staffNoteSelector = ".staff-note";
  private static readonly staffNoteDTextSelector = "textarea[name=\"staff_note\\[body\\]\"]";
  public constructor() {
    super({
      constraint: [PageDefinition.users.view, PageDefinition.staff_notes.list],
      waitForDOM: RipStaffNotes.staffNoteDTextSelector,
    });
  }

  private onClick(){
    // navigator.clipboard.writeText(this.constructText()).then(() => Danbooru.Toast.notice(`Copied staff notes to the clipboard!`), () => Danbooru.Toast.alert(`Failed to copy staff notes to the clipboard.`));
    Danbooru.Toast.notice(`Retrieving raw staff notes...`);
    this.constructText().then(e => navigator.clipboard.writeText(e).then(() => Danbooru.Toast.notice(`Copied staff notes to the clipboard!`), () => Danbooru.Toast.alert(`Failed to copy staff notes to the clipboard.`)), () => Danbooru.Toast.alert(`Failed to copy staff notes to the clipboard.`));
  }

  private initSettingsMenu() {
    const button = html`<button type="submit">Rip Staff Notes</button>` as HTMLButtonElement;
    button.addEventListener("click", () => this.onClick());
    this.settingsMenuDialogParameters = {
      elements:[$(button), $("<br />")],
      optionsOrTitle: "Rip Staff Notes",
    };
  }

  // private constructText() {
  //   const staffNotes = document.querySelectorAll(RipStaffNotes.staffNoteSelector);
  //   let text = "";
  //   staffNotes.forEach(note => {
  //     const contents = note.querySelector<HTMLTextAreaElement>(RipStaffNotes.staffNoteDTextSelector)?.value;
  //     if (!contents) return;
  //     const id = parseInt(/^staff-note-([0-9]+)$/.exec(note.id)?.[1] ?? "-1");
  //     if (id < 0) return;
  //     const authorName = note.querySelector<HTMLTextAreaElement>(".author-name")?.innerText;
  //     if (!authorName) return;
  //     text += `[section=From staff note #${id} by ${authorName}]\nOriginally from "staff note #${id}":[/staff_notes/${id}] by ${authorName}:\n[quote]\n${contents}\n[/quote]\n[/section]`;
  //   });
  //   return text;
  // }
  private async constructText() {
    const staffNotes = document.querySelectorAll(RipStaffNotes.staffNoteSelector);
    return (await Promise.all(Array.from(staffNotes).map(async note => {
      const id = parseInt(/^staff-note-([0-9]+)$/.exec(note.id)?.[1] ?? "-1");
      if (id < 0) return "";
      const contents = note.querySelector<HTMLTextAreaElement>(RipStaffNotes.staffNoteDTextSelector)?.value ?? (await (await fetch(`/staff_notes/${id}`, { body: encodeURIComponent(REMT.API.getAuthToken()) })).json())["body"];
      if (!contents) return "";
      const authorName = note.querySelector<HTMLTextAreaElement>(".author-name")?.innerText;
      if (!authorName) return "";
      return `[section=From staff note #${id} by ${authorName}]\nOriginally from "staff note #${id}":[/staff_notes/${id}] by ${authorName}:\n[quote]\n${contents}\n[/quote]\n[/section]`;
    }))).join("\n");
  }

  protected create(): Promise<void> {
    this.initSettingsMenu();
    return Promise.resolve();
  }

}
