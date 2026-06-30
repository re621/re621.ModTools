import Danbooru from "../models/api/Danbooru";
import { html } from "../utilities/HtmlTemplate";
import Component from "./Component";
    
/**
 * @todo What does this do?
 */
export default class DTextCodeCopy extends Component {

  public constructor() {
    super({
      // constraint: PageDefinition.tickets.view,
      waitForDOM: DTextCodeCopy.codeBlockSelector,
    });
  }

  Settings = {
    enabled: true,
    watchForChanges: false,
  };

  private static readonly codeBlockSelector = ".styled-dtext pre";
  protected create(): Promise<void> {
    this.initSettingsMenu();
    const elements = document.querySelectorAll<HTMLPreElement>(DTextCodeCopy.codeBlockSelector);
    if (elements.length <= 0) return Promise.resolve();
    elements.forEach(e => this.createButton(e));
    return Promise.resolve();
  }

  private createButton(element: HTMLPreElement, watch = this.Settings.watchForChanges) {
    // const button = html`
    //   <a class="dtext-copy" style="position: absolute; right: 1rem; padding-top: .25rem;">
    //     <!-- @license lucide-static v1.14.0 - ISC -->
    //     <svg class="lucide lucide-copy" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    //       <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
    //       <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
    //     </svg>
    //   </a>` as HTMLAnchorElement;
    // element.insertAdjacentElement("beforebegin", button);
    const button = html`
      <a class="dtext-copy" style="position: absolute; right: 1rem; padding-top: .25rem; width: min-content; height: min-content; display: block;">
        <!-- @license lucide-static v1.14.0 - ISC -->
        <svg class="lucide lucide-copy" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="position: absolute; top: 0; right: 0;">
          <rect width="14" height="14" x="8" y="8" rx="2" ry="2"></rect>
          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"></path>
        </svg>
      </a>` as HTMLAnchorElement;
    element.insertAdjacentElement("afterbegin", button);
    button.onclick = () => navigator.clipboard.writeText(element.innerText).then(() => Danbooru.Toast.notice("Copied to clipboard", 500));
    /* if (!watch) return;
    new MutationObserver((mutations: MutationRecord[], observer: MutationObserver) => {
      if (!mutations.some(e => Array.from(e.removedNodes).some(e1 => e1 == element)))
        return;
      button.remove();
      observer.disconnect();
    }).observe(element.parentElement!, { childList: true }); */
  }
  private initSettingsMenu() {
    this._settingsMenuDialogParameters = {
      elements:[
        $(html`<label for="setting-enabled" title="Enable this feature?">Enable this feature? <input type="checkbox" id="setting-enabled" name="setting-enabled" value="true" ${this.Settings.enabled ? "checked" : ""} /></label>` as HTMLElement),
        $(html`<label for="setting-watchForChanges" title="Watch the DOM for changes to the DText elements?">Watch the DOM for changes to the DText elements? <input type="checkbox" id="setting-watchForChanges" name="setting-watchForChanges" value="true" ${this.Settings.watchForChanges ? "checked" : ""} /></label>` as HTMLElement),
        $(`<br />`),
      ],
      optionsOrTitle: "DText Code Copy",
      then: (e: FormData) => {
        this.Settings.watchForChanges = e.get("setting-watchForChanges") === "true";
        if (e.get("setting-enabled") !== "true" && confirm("Are you sure you want to disable the copy button? There is no UI to undo this."))
          this.Settings.enabled = false;
      }};
  }
}
