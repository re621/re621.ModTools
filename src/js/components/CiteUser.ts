import Danbooru from "../models/api/Danbooru";
import { html } from "../utilities/HtmlTemplate";
import Component from "./Component";
    
/**
 * Copies a reference to the given user into the clipboard in the following format: `"USERNAME":[/users/USER_ID]`.
 */
export default class CiteUser extends Component {
  public static readonly rootPattern = `a[href^="/users/"]`;
  /** Finds user links in comment, forum, & blip sidebars */
  public static readonly publicMessageSelector = `h4.author-name > ${this.rootPattern}`;
  /** Finds user links on their profile */
  public static readonly profileSelector = `.profile-name > ${this.rootPattern}`;
  /** Finds presumptively proper user links in DText */
  public static readonly dtextSelector = `${this.rootPattern}.dtext-link`;
  /** Finds users referenced in staff wikis */
  public static readonly staffWikiSelector = `.reference-user > ${this.rootPattern}`;
  public static readonly collectiveSelector = `${CiteUser.publicMessageSelector}, ${CiteUser.profileSelector}, ${CiteUser.dtextSelector}, ${this.staffWikiSelector}`;
  public constructor() {
    super({
      waitForDOM: CiteUser.collectiveSelector,
    });
  }

  private onClick(){
    alert("Click any of the highlighted user links to select them.");
    this.userLinkData?.forEach(e => {
      e[0].style.color = "black";
      e[0].style.backgroundColor = "white";
      e[0].style.textShadow = ".125rem .125rem .125rem red";
      e[0].style.cursor = "copy";
      e[0].onclick = (ev) => {
        ev.preventDefault();
        ev.stopImmediatePropagation();
        navigator.clipboard.writeText(e[2]).then(() => Danbooru.Toast.notice(`Copied \`${e[2]}\` to the clipboard!`), () => Danbooru.Toast.alert(`Failed to copy \`${e[2]}\` to the clipboard.`));
        this.userLinkData?.forEach(e1 => {
          e1[0].style.color = "";
          e1[0].style.backgroundColor = "";
          e1[0].style.textShadow = "";
          e1[0].style.cursor = "";
        });
      };
    });
  }

  private initSettingsMenu() {
    const button = html`<button type="submit">Copy User Citation to Clipboard</button>` as HTMLButtonElement;
    button.addEventListener("click", () => this.onClick());
    this.settingsMenuDialogParameters = {
      elements:[$(button), $("<br />")],
      optionsOrTitle: "Cite User",
    };
  }

  private userLinkData?: [HTMLAnchorElement, string, string][];

  private static processLink(e: HTMLAnchorElement) {
    return [e, new URL(e.href).pathname, `"${e.innerText}":[${new URL(e.href).pathname}]`] as [HTMLAnchorElement, string, string];
  }

  protected create(): Promise<void> {
    this.userLinkData = Array.from(document.querySelectorAll<HTMLAnchorElement>(CiteUser.collectiveSelector)).map(CiteUser.processLink).filter(e => /^\/users\/[0-9]+\/?/.test(e[1]));
    if (this.userLinkData.length <= 0) return Promise.resolve();
    this.initSettingsMenu();
    return Promise.resolve();
  }

}
