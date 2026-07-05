import { PageDefinition } from "../models/data/Page";
import Util from "../utilities/Util";
import Component from "./Component";
    
/**
 * @todo What does this do?
 */
export default class FilterOldFeedbacks extends Component {

  public constructor() {
    super({
      constraint: PageDefinition.user_feedbacks.list,
      waitForDOM: ".user-feedback",
    });
  }

  Settings: { enabled: boolean; filtering: "off" | "old" | "new"; fullHide: boolean; } = {
    enabled: true,
    filtering: "off",
    fullHide: false,
  };

  private table?: HTMLTableElement;
  private older: HTMLTableRowElement[] = [];
  private newer: HTMLTableRowElement[] = [];
  private all: HTMLTableRowElement[] = [];

  protected create(): Promise<void> {
    Util.DOM.addStyle(`
    tr.hiddenForAge, tr.hiddenForAge > *, tr.hiddenForAge > * > * {
      height: 1px;
      overflow-y: hidden;
    }
    table.fullHide tr.hiddenForAge {
      display: none;
    }
      `);
    this.initSettingsMenu();
    this.table = document.querySelector<HTMLTableElement>("table.striped:has(.user-feedback)") ?? undefined;
    document.querySelectorAll<HTMLTableRowElement>("tr.user-feedback").forEach(e => {
      this.all.push(e);
      const date = e.querySelector<HTMLTimeElement>("td:nth-child(3) time");
      if (!date) return;
      if (Util.Time.isDatePastCommentStatute(new Date(date.dateTime))) this.older.push(e);
      else this.newer.push(e);
    });
    this.update();
    return Promise.resolve();
  }

  private update(newValue: string = this.Settings.filtering) {
    switch (newValue) {
      case "new":
        this.Settings.filtering = "new";
        this.all.forEach(e => e.classList.remove("hiddenForAge"));
        this.newer.forEach(e => e.classList.add("hiddenForAge"));
        break;
      case "old":
        this.Settings.filtering = "old";
        this.all.forEach(e => e.classList.remove("hiddenForAge"));
        this.older.forEach(e => e.classList.add("hiddenForAge"));
        break;
        
      case "off":
        this.Settings.filtering = "off";
        this.all.forEach(e => e.classList.remove("hiddenForAge"));
        break;
      default:
        break;
    }
    if (this.Settings.fullHide) this.table?.classList.add("fullHide");
    else this.table?.classList.remove("fullHide");
  }

  private initSettingsMenu() {
    this.settingsMenuDialogParameters = {
      elements:[
        $(`<label for="setting-enabled" title="Enable this feature?">Enable this feature? <input type="checkbox" id="setting-enabled" name="setting-enabled" value="true" ${this.Settings.enabled ? "checked" : ""} /></label>`),
        $(`<br />`),
        $(this.simpleSettingsCheckbox("fullHide", "Fully hide the rows?", "This won't leave any indicator they're hidden; be careful.")),
        $(`<br />`),
        $(`<label for="${this.settingsIdPrefix}filtering" title="">Filtering: <select id="${this.settingsIdPrefix}filtering" name="${this.settingsIdPrefix}filtering">
          <option value="off"${this.Settings.filtering === "off" ? " selected" : ""}>Off</option>
          <option value="old"${this.Settings.filtering === "old" ? " selected" : ""}>Hide records older than 6 months</option>
          <option value="new"${this.Settings.filtering === "new" ? " selected" : ""}>Hide records newer than 6 months</option>
          </select></label>`),
        $(`<br />`),
        $(this.resetSettingsDialogElement),
        $(`<br />`),
      ],
      optionsOrTitle: "Filter Old Feedbacks Settings",
      then: (e: FormData) => {
        if (e.get("setting-enabled") !== "true" && confirm("Are you sure you want to disable the copy button? There is no UI to undo this.")) {
          this.Settings.enabled = false;
          this.all.forEach(e => e.classList.remove("hiddenForAge"));
          return;
        }
        if (this.handleResetSettingsDialogElement(e)) {
          this.update();
          return;
        }
        this.Settings.fullHide = e.get(`${this.settingsIdPrefix}fullHide`) === "true";
        this.update(e.get(`${this.settingsIdPrefix}filtering`)?.toString() ?? "");
      }};
  }
}
