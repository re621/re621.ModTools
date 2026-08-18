import Util from "../../utilities/Util";
import { makeIcon } from "../../utilities/UtilIcons";
import Script from "../data/Script";
import Debug from "../Debug";
import PreparedStructure from "./PreparedStructure";

export default class Modal {

  public static isReady = false;

  private id: string;
  private $modal: JQuery<HTMLElement>;
  /** The modal element */
  public get element() { return this.$modal; }

  // private config: ModalConfig;

  private triggers: ModalTrigger[] = [];
  private activeTrigger?: JQuery<HTMLElement>;
  private triggersMulti: boolean;

  public isDisabled = false;
  public enable(): void { this.isDisabled = false; }
  public disable(): void { this.isDisabled = true; }
  public get isOpen() { return this.$modal.dialog("isOpen") }
  public set isOpen(open: boolean) { this.$modal.dialog(open ? "open" : "close"); }
  public open(): void { this.isOpen = true; }
  /** Hides the modal window from view. To dispose the window, call {@link destroy}. */
  public close(): void { this.isOpen = false; }
  public toggle(): void { this.isOpen = !this.isOpen; }

  /**
   * @deprecated {@link ModalConfig.destroyOnClose} will default to `true` next
   * major release. Update calls to explicitly pass in `false` to preserve
   * current behavior, or `true` to preemptively opt into the new behavior.
   */
  public constructor(initialConfig: Omit<ModalConfig, "destroyOnClose"> | Omit<ModalConfig, "destroyOnClose"> & { destroyOnClose?: undefined });
  public constructor(initialConfig: Omit<ModalConfig, "destroyOnClose"> & { destroyOnClose: boolean });
  public constructor(initialConfig: ModalConfig) {
    this.id = Util.ID.make();
    const config = Object.freeze(this.validateConfig(initialConfig));

    this.triggersMulti = config.triggerMulti;
    this.isDisabled = config.disabled;

    Modal.ensureModalContainer();

    // Create the DOM structure for the modal window
    this.$modal = $("<div>")
      .attr("title", config.title)
      .append(config.content)
      .dialog({
        autoOpen: config.autoOpen,
        appendTo: "#modal-container",
        dialogClass: config.dialogClass,

        resizable: false,

        width: config.width,
        height: config.height,
        minWidth: config.minWidth,
        minHeight: config.minHeight,
        maxWidth: (config.maxWidth ?? 0) < 0 ? undefined : config.maxWidth,
        maxHeight: (config.maxHeight ?? 0) < 0 ? undefined : config.maxHeight,

        position: {
          my: config.position.my,
          at: config.position.at,
          of: "#modal-container",
          within: "#modal-container",
          // collision: "none",
        },

        classes: {
          "ui-dialog": "bg-foreground border-section color-text",
          "ui-dialog-titlebar": "color-text",
          "ui-dialog-titlebar-close": "border-foreground",
        }
      });

    if (config.destroyOnClose) this.$modal.on("dialogclose", () => this.destroy())
    const ui = this.$modal.closest('.ui-dialog');
    ui.draggable('option', 'containment', '#modal-container');

    const closeBtn = ui.find(".ui-dialog-titlebar-close")[0];
    if (closeBtn) closeBtn.replaceChildren(makeIcon("close"));

    // Replace the modal structure on window open, if necessary
    if (config.structure)
      this.$modal.one("dialogopen.lazyload", () => {
        this.$modal.html("");
        this.$modal.append(config.structure!.render());
      });

    this.registerTrigger(config.triggers);
  }

  /* private static readonly defaultConfig = {
		title: "Dialog",
		autoOpen: false,
		triggers: [],
		triggerMulti: false,
		content: $(""),
		structure: null,
		width: "auto",
		height: "auto",
		minWidth: 150,
		minHeight: 150,
		maxWidth: undefined,
		maxHeight: undefined,
		disabled: false,
		position: { my: "center", at: "center" },
	}; */
  /**
   * Parses the configuration and sets the default values for missing entries
   * @param config Configuration to parse
   * @todo Convert to using `Object.assign` with a default object instead.
   */
  private validateConfig(config: ModalConfig): RequiredModalConfig {
    // const result: ModalConfig = Object.assign({}, Modal.defaultConfig, config);

    return {
      title: config.title ?? "Dialog",
      autoOpen: config.autoOpen ?? false,
      destroyOnClose: config.destroyOnClose ?? false,
      triggers: config.triggers ?? [],
      triggerMulti: config.triggerMulti ?? false,

      content: config.content ?? $(""),
      structure: config.structure ?? null,

      width: config.width ?? "auto",
      height: config.height ?? "auto",
      minWidth: config.minWidth ?? 150,
      minHeight: config.minHeight ?? 150,
      maxWidth: config.maxWidth ?? undefined,
      maxHeight: config.maxHeight ?? undefined,

      disabled: config.disabled ?? false,
      dialogClass: config.dialogClass ?? "",
      position: (typeof config.position === "undefined") ? { my: "center", at: "center" } :
        {
          my: !config.position.my ? "center" : config.position.my,
          at: !config.position.at ? "center" : config.position.at,
        }
    };
  }

  /**
   * Appends more content to the modal
   * @param $content Content to add
   */
  public addContent($content: JQuery<HTMLElement>): void {
    this.$modal.append($content);
  }

  /**
   * Sets the modal content
   * @param $content Content to add
   */
  public setContent($content: JQuery<HTMLElement>): void {
    this.$modal.html("");
    this.$modal.append($content);
  }

  /**
   * Listens to the specified element in order to trigger the modal
   * @param trigger Element-event pair to listen to
   */
  public registerTrigger(trigger: ModalTrigger | ModalTrigger[]): void {
    if (!trigger) return;
    else if (Array.isArray(trigger)) {
      for (const one of trigger) this.registerTrigger(one);
      return;
    }

    if (typeof trigger.event === "undefined") trigger.event = "click";
    if (this.triggers.length == 0) this.activeTrigger = trigger.element;
    this.triggers.push(trigger);

    trigger.element.on(trigger.event + `.${Script.eventPrefix}.dialog-` + this.id, (event) => {
      if (this.isDisabled) return;
      event.preventDefault();

      const $target = $(event.currentTarget);
      if (this.triggersMulti && !this.activeTrigger?.is($target) && this.isOpen) {
        this.toggle(); // TODO Update the modal window instead of toggling
      }
      this.activeTrigger = $target;

      this.toggle();
      return false;
    });
  }

  public clearTriggers(): void {
    for (const trigger of this.triggers)
      trigger.element.off(trigger.event + `.${Script.eventPrefix}.dialog-` + this.id);
    this.triggers = [];
  }

  /**
	 * @deprecated Use {@linkcode element}
	 * @returns The modal element
	 */
  public getElement(): JQuery<HTMLElement> { return this.$modal; }


  /**
   * Completely and irreversibly destroys the modal window
   *
   * @param {boolean} [close=false] Should `close` be called first? Required to actually remove it from the DOM. Defaults to `false`.
   */
  public destroy(close = false): void {
    if (close) this.close();
    this.$modal.dialog("destroy");
    this.$modal.remove();
  }

  /**
   * Returns the element that triggered the modal
   * @returns {JQuery<HTMLElement> | undefined} trigger
   * @todo Replace with getter
   */
  public getActiveTrigger() {
    return this.activeTrigger;
  }

  /**
	 * This class doesn't work unless the companion script has added the
   * `#modal-container` element, so this manually ensures it's added to enable
   * it to work w/o the companion script.
	 */
  private static ensureModalContainer() {
    if (!document.querySelector("#modal-container")) {
      Debug.logPrefix(`No ${Script.companionProjectName} detected; manually creating 'div#modal-container'...`);
      $("<div>").attr("id", "modal-container").prependTo("div#page");
    }
  }
}

/**
 * @todo Make strict & require a `Partial<ModalConfig>` in the constructor for next major version.
 */
export interface ModalConfig {
    /** String displayed on top of the modal window */
    title?: string;

    /** Should the modal open on initialization */
    autoOpen?: boolean;

    /** Should the modal be destroyed (see {@link Modal.destroy}) when closed? */
    destroyOnClose?: boolean;

    /** Modal content, created on page load */
    content?: JQuery<HTMLElement>;
    /**
     * Optional. The modal content is replaced with this generated structure when the window is open.  
     * If used, the content parameter is used as a placeholder to properly size and center the window.
     */
    structure?: PreparedStructure | null;

    /** List of JQuery object & event name pairs that trigger the modal opening */
    triggers?: ModalTrigger | ModalTrigger[];
    /** Refreshes the modal instead of toggling it. Special case for HeaderCustomizer */
    triggerMulti?: boolean;

    width?: number | "auto";
    height?: number | "auto";
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number | undefined;
    maxHeight?: number | undefined;

    /** If true, triggers are disabled */
    disabled?: boolean;
    /** Extra CSS class added to the `.ui-dialog` wrapper. */
    dialogClass?: string;
    /** Initial position of the modal window */
    position?: {
        at: string;
        my: string;
    };
}
type RequiredModalConfig = Required<Omit<ModalConfig, "maxWidth" | "maxHeight">> & Pick<ModalConfig, "maxWidth" | "maxHeight">;

interface ModalTrigger {
    /** Query selector containing a trigger - or a collection of triggers */
    element: JQuery<HTMLElement>;
    /** Event that the trigger should respond to */
    event?: string;
}
