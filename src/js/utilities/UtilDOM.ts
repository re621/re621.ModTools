import Danbooru from "../models/api/Danbooru";
import { html } from "./HtmlTemplate";
import Util from "./Util";

export class UtilDOM {

  /**
     * Adds the given style to the document and returns the injected style element
     * @param css string CSS styles
     */
  public static addStyle(css: string): JQuery<HTMLElement> {
    return $("<style>")
      .attr({
        "id": Util.ID.make(),
        "type": "text/css"
      })
      .html(css)
      .appendTo("head");
  }

  /** Sets up a container to load modals into */
  public static setupDialogContainer(): void {
    $("<div>")
      .attr("id", "remt-container")
      .prependTo("body");
  }

  protected static readonly SETTINGS_TARGET: string = ".nav-tools";
  /**
     * Adds a button to the top-right of the navbar
     * @param config Button configuration
     * @param {string} [target=UtilDOM.SETTINGS_TARGET] Target element
     * @param {boolean} [prepend=false] Prepend to `target`, or append?
     */
  public static addSettingsButton(config: SettingsButton, target: string, prepend?: boolean): JQuery<HTMLElement>;
  /**
     * Adds a button to the top-right of the navbar
     * @param config Button configuration
     * @param {boolean} [prepend=false] Prepend to `SETTINGS_TARGET`, or append?
     */
  public static addSettingsButton(config: SettingsButton, prepend?: boolean): JQuery<HTMLElement>;
  /**
     * Adds a button to the top-right of the navbar
     * @param config Button configuration
     * @param {string | boolean} [target=UtilDOM.SETTINGS_TARGET] Target element
     * @param prepend Prepend to `target`, or append?
     */
  public static addSettingsButton(config: SettingsButton, target: string | boolean = this.SETTINGS_TARGET, prepend = false): JQuery<HTMLElement> {
    if (typeof target !== "string") { prepend = target; target = UtilDOM.SETTINGS_TARGET; }
    if (config.name === undefined) config.name = "T";
    if (config.href === undefined) config.href = "";
    if (config.title === undefined) config.title = "";

    if (config.tabClass === undefined) config.tabClass = "";
    if (config.linkClass === undefined) config.linkClass = "";

    if (config.attr === undefined) config.attr = {};

    const $tab = $(`<li class="nav-remt-${config.id}">`)[prepend ? "prependTo" : "appendTo"](target);
    const $link = $("<a>")
      .html(config.icon ? `${config.icon}<span>${config.name}</span>` : config.name)
      .attr({
        "title": config.title,
        "id": config.id,
      })
      .appendTo($tab);

    if (config.onClick !== undefined)
      $link.on("click", () => { config.onClick?.($link); });

    if (config.href) { $link.attr("href", config.href); }
    if (config.tabClass) { $tab.addClass(config.tabClass); }
    if (config.linkClass) { $link.addClass(config.linkClass); }
    if (config.attr) { $link.attr(config.attr); }

    return $link;
  }

  /**
	 * 
	 * @param param0 
	 * @returns 
	 * @copyright https://cssloaders.github.io/
	 */
  public static makeSpinnerJQuery({
    size = "48px",
    mainColor = "#FFF",
    secondaryColor = "#FF3D00",
    animationLength = "1s",
    spinnerWidth = "5px",
  }) {
    return $(`<span class="spinner"></span>`).css({
      "width": size,
      "height": size,
      "border": `${spinnerWidth} solid ${mainColor}`,
      "border-bottom-color": secondaryColor,
      "border-radius": "50%",
      "display": "inline-block",
      "box-sizing": "border-box",
      "animation": `rotation ${animationLength} linear infinite`,
    });
  }

  /**
	 * 
	 * @param param0 
	 * @returns 
	 * @copyright https://cssloaders.github.io/
	 */
  public static makeSpinnerDOM({
    size = "48px",
    mainColor = "#FFF",
    secondaryColor = "#FF3D00",
    animationLength = "1s",
    spinnerWidth = "5px",
  }) {
    return html`<span
      class="spinner"
      style="
        width: ${size};
        height: ${size};
        border: ${spinnerWidth} solid ${mainColor};
        borderBottomColor: ${secondaryColor};
        borderRadius: 50%;
        display: inline-block;
        boxSizing: border-box;
        animation: rotation ${animationLength} linear infinite;
      "></span>` as HTMLSpanElement;
    /* const s = document.createElement("span");
    s.className = "spinner";
    s.style.width = s.style.height = size;
    s.style.border = `${spinnerWidth} solid ${mainColor}`;
    s.style.borderBottomColor = secondaryColor;
    s.style.borderRadius = "50%";
    s.style.display = "inline-block";
    s.style.boxSizing = "border-box";
    s.style.animation = `rotation ${animationLength} linear infinite`;
    return s; */
  }

  /**
	 * Build a DText input element with the same style, form, & function of the ones supplied by the server.
	 * @param textarea The main text entry element.
	 * @param options 
	 * @returns Either the root element or an array w/ the root element & the help text.
	 * @todo Better utilize `innerHTML` to slim down.
	 * @todo Turn into a web component for consistent interop.
	 */
  public static buildDTextInput(textarea: HTMLTextAreaElement): HTMLDivElement | HTMLElement[] {
    return Danbooru.DTextFormatter?.buildFromTextarea(textarea);
  }

  static getPlaceholderImage(): string {
    return "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
  }

  static getPizza(): string {
    return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAAklEQVR4AewaftIAAAFOSURBVL3BMWrcQBiA0W82OoVg6wWJPcL+7RQC3WCLPYeauNA53PgEAyqUIsXMEQYJjDsPiOB0voCigRUMQk5iCHmPf0GxuJyPMwnng+ITMu5sXyPaYPMCgZmE80HxGxk7bF4g04jtayLRZibhfFAkFIvL+TjbviYSbYhsX/MR0YaV80F9YfH69v7w/duPr7fridv1xO16IiXa8Pj0zO16Inp8eqapStzLT17f3h8O/IFog80LbF4g2rDnwCeJNjRVSerAhmiDaMPK9jUyjcg0YvuaVdsNOB8UC0Xicj7ONi+IZBqxfU1KtKGpSqK2G3A+KBYH/pJoQ1OVRG034HxQ3GVsyDQS2b5mJdrQVCVR2w04HxSJjA3b16xEG6KmKonabsD5oNhQbFzOx5m7pipZtd2A80GxI2NHU5Ws2m4gcj4oPpCxo+0GVs4Hxf/wCzeQgfpPWb9hAAAAAElFTkSuQmCC";
  }

  /** Throws an error if the element isn't found. */
  public static querySelector<K extends keyof HTMLElementTagNameMap>(selectors: K, parentElement?: Element | Document): HTMLElementTagNameMap[K];
  /** Throws an error if the element isn't found. */
  public static querySelector<K extends keyof SVGElementTagNameMap>(selectors: K, parentElement?: Element | Document): SVGElementTagNameMap[K];
  /** Throws an error if the element isn't found. */
  // public static querySelector<K extends keyof MathMLElementTagNameMap>(selectors: K, parentElement?: Element | Document): MathMLElementTagNameMap[K];
  /** Throws an error if the element isn't found. */
  public static querySelector<K extends Element>(selectors: string, parentElement?: Element | Document): K;
  /** Throws an error if the element isn't found. */
  public static querySelector<K extends string>(selectors: K, parentElement: Element | Document = document): Element {
    const e = parentElement.querySelector(selectors);
    if (!e) throw new Error(`Expected DOM element not found (\`${selectors}}\`).`);
    return e;
  }
}

export interface SettingsButton {

    /** Unique button ID */
    id: string;

    /** Text inside the link */
    name?: string;
    icon?: string;
    /** Link address */
    href?: string;
    /** Hover text */
    title?: string;

    /** Extra class to append to the tab */
    tabClass?: string;
    /** Extra class to append to the link */
    linkClass?: string;

    /** Name-value pairs of the attribute to set */
    attr?: { [prop: string]: string };

    onClick?: ($element: JQuery<HTMLElement>) => void;
}
