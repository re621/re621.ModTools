import ZestyAPI from "@re621/zestyapi";
import css from "./css/style.module.scss";

import { ComponentList, SettingsDialogConfig } from "./js/components/Component";
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Used for documentation
import type Component from "./js/components/Component";
import RecordBuilder from "./js/components/RecordBuilder";
import TicketData from "./js/components/TicketData";
import TicketReasons from "./js/components/TicketReasons";
import AppealReasons from "./js/components/AppealReasons";
import Page, { IgnoredPages } from "./js/models/data/Page";
import Script from "./js/models/data/Script";
import User from "./js/models/data/User";
import Debug from "./js/models/Debug";
import PageObserver from "./js/models/structure/PageObserver";
import ErrorHandler from "./js/utilities/ErrorHandler";
import Util from "./js/utilities/Util";
import DMailToStaffNote from "./js/components/DMailToStaffNote";
import ReportContentData from "./js/components/ReportContentData";
import DMailBuilder from "./js/components/DMailBuilder";
import ForumBuilder from "./js/components/ForumBuilder";
import AutoTaggingButtons from "./js/components/AutoTaggingButtons";
import { MultiDialogForm } from "./js/models/structure/MultiDialogForm";
import AutoClickPosts from "./js/components/AutoClickPosts";
import FilterOldFeedbacks from "./js/components/FilterOldFeedbacks";
import CiteUser from "./js/components/CiteUser";
import RipStaffNotes from "./js/components/RipStaffNotes";
import TimeKeeper from "./js/components/TimeKeeper";
import HtmlBuilder from "./js/utilities/HtmlBuilder";
import XM from "./js/models/api/XM";
import { html } from "./js/utilities/HtmlTemplate";

export default class REMT {

  private static _Registry: ComponentListAnnotated = {};
  public static get Registry(): Readonly<ComponentListAnnotated> { return Object.freeze({...this._Registry}); }
  public static API: ZestyAPI;

  private loadOrder = [
    AutoTaggingButtons,
    RecordBuilder,

    TicketData,
    TicketReasons,

    AppealReasons,

    DMailToStaffNote,
    ReportContentData,
    DMailBuilder,
    ForumBuilder,
    AutoClickPosts,
    FilterOldFeedbacks,
    CiteUser,
    RipStaffNotes,
    TimeKeeper,
  ];

  public async run(): Promise<void> {

    if (Page.matches(IgnoredPages)) return;

    Debug.logPrefix("v." + Script.versionObj.full);

    // Set up the API connection
    // TODO: Temporary instantiation method
    REMT.API = window["ZestyAPI"].connect({
      userAgent: Util.Network.userAgent,
      debug: Debug.Connect,
    });

    // Initialize basic functionality
    let headLoaded: Promise<void>, bodyLoaded: Promise<void>;
    try {
      Debug.log("+ Page Observer");
      PageObserver.init();

      // Append the CSS to head, and make sure it overrides other styles
      headLoaded = PageObserver.watch("head").then(() => {
        Debug.log("+ HEAD is ready");
        const styleElement = Util.DOM.addStyle(css);
        $(() => { styleElement.appendTo("head"); });
      });

      bodyLoaded = PageObserver.watch("body").then(() => {
        Debug.log("+ BODY is ready");
        $("body").attr(Script.htmlPrefix, Script.versionObj.full);
        Util.DOM.setupDialogContainer(); // TODO Move to the dialog class
        User.init();
      });

      /** @todo Figure out if handling this promise screws stuff up. */
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      PageObserver.watch("head meta[name=csrf-token]").then(result => {
        if (!result) {
          Debug.log("+ API logged out");
          return;
        }
        const token = $("head meta[name=csrf-token]");
        if (token) REMT.API.login(token.attr("content") ?? "");
      }/* , error => {
        void ErrorHandler.write("An error occurred during API initialization", error);
      } */);
    } catch (error) {
      void ErrorHandler.write("An error occurred during script initialization", error);
      return;
    }


    // Start loading components
    await Promise.all([headLoaded, bodyLoaded]);

    // #region Bootstrap settings (synchronous)
    for (const module of this.loadOrder) {
      const instance = new module();
      REMT._Registry[instance.getName()] = instance;
      await instance.bootstrapSettings();
    }
    Util.Events.trigger(`${Script.eventPrefixLegacy}:bootstrap`);
    // #endregion Bootstrap settings (synchronous)

    // #region Load modules (asynchronous)
    const promises: Promise<void>[] = [];
    for (const instance of Object.values(REMT._Registry))
      promises.push(instance?.load() ?? Promise.resolve());
    await Promise.all(promises).then(() => {
      Debug.logPrefix("Loaded.");
      this.buildSettingsButton(true);
      Debug.logPrefix("Fully loaded.");
    }, error => {
      void ErrorHandler.write("An error occurred during component initialization", error);
      return;
    });
    // #endregion Load modules (asynchronous)
  }

  private settingsButton?: JQuery<HTMLElement>;
  // private configs?: SettingsDialogConfig[];
  /**
   * @param addListeners Whether to add event handlers for if
   * {@link Component.settingsMenuDialogParameters} changes. Should only happen
   * once.
   * @todo Convert to just storing & refresh the configs, & removing/adding the button if need be.
   */
  private buildSettingsButton(addListeners = false) {
    this.settingsButton?.remove();
    Debug.logPrefix("Checking for component settings menus...");
    const configs: SettingsDialogConfig[] = [], cbs: JQuery<HTMLElement>[] = [], setTo: ((v: boolean, setCb?: boolean) => void)[] = [];
    let areAnyEnabled = false;
    for (const [k, v] of Object.entries(REMT._Registry)) {
      if (!v) continue;
      if (addListeners) v.on("settingsConfigured", () => this.buildSettingsButton());
      const menuParams = v.settingsMenuDialogParameters;
      if (menuParams) configs.push(menuParams);
      // Debug.logPrefix("%s.Settings.enabled:\n\tInstance's accessor: %o\n\tRaw Stored Value: %o", k, v?.Settings.enabled, XM.Storage.getValue<any>(k + "." + "enabled", undefined));
      const cb = HtmlBuilder.inputCheckboxBuilder({
        checked: XM.Storage.getValue(k + "." + "enabled", v?.Settings.enabled),
        value: k,
        id: `${Script.htmlPrefix}-enable-${k}`,
        name: `${Script.htmlPrefix}-enable-${k}`,
      });
      areAnyEnabled ||= cb.checked;
      const st = (value: boolean, setCb = false) => { XM.Storage.setValue(k + "." + "enabled", v.Settings.enabled = value); if (setCb) cb.checked = value; };
      setTo.push(st);
      cb.addEventListener("change", () => st(cb.checked));
      const resetSettingsButton = HtmlBuilder.button({
        id: `${Script.htmlPrefix}-reset-${k}`,
        name: `${Script.htmlPrefix}-reset-${k}`,
        type: "button",
        innerHtml: "Reset",
        title: "Reset to Default Settings?",
      });
      resetSettingsButton.addEventListener("click", () => v.requestResetSettings());
      cbs.push($(html`<div>${HtmlBuilder.labelBuilder({
        forElement: `${Script.htmlPrefix}-enable-${k}`,
        title: `Fully enable/disable the ${Util.pascalToTitle(k)} component?`,
        innerHtml: [k, ":&nbsp;", cb],
      })}&nbsp;${resetSettingsButton}</div>` as HTMLDivElement));
    }
    if (configs.length <= 0) {
      Debug.logPrefix("No settings menus registered currently.");
      // Must draw the menu if it has no chance of being drawn otherwise.
      if (areAnyEnabled) return;
      Debug.logPrefix("All components disabled; creating global settings menu...");
    } else
      Debug.logPrefix("Creating settings menu for %s components...", configs.length);
    const enableAll = HtmlBuilder.button({
        id: `${Script.htmlPrefix}-enable-all`,
        type: "button",
        innerHtml: "Enable All",
      }), disableAll = HtmlBuilder.button({
        id: `${Script.htmlPrefix}-disable-all`,
        type: "button",
        innerHtml: "Disable All",
      });
    enableAll.addEventListener("click", () => setTo.forEach(e => e(true, true)));
    disableAll.addEventListener("click", () => setTo.forEach(e => e(false, true)));
    configs.push({
      elements: [
        $("<label>Select which components should be enabled.</label>"),
        $(`<br />`),
        ...cbs,
        $(enableAll),
        $(disableAll),
      ],
      optionsOrTitle: {
        title: "Global Settings",
        defaultElements: [],
      },
    });
    this.settingsButton = Util.DOM.addSettingsButton({
      id: `${Script.htmlPrefix}-component-settings`,
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" name="settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
      name: Script.shortName,
      onClick: () => void MultiDialogForm.getRequestedInput(configs),
    });
    Debug.logPrefix("Settings button built.");
  }

}
void new REMT().run();

interface ComponentListAnnotated extends Partial<ComponentList> {
    AutoTaggingButtons?: AutoTaggingButtons,
    RecordBuilder?: RecordBuilder,

    TicketData?: TicketData,
    TicketReasons?: TicketReasons,

    AppealReasons?: AppealReasons,

    DMailToStaffNote?: DMailToStaffNote,
    ReportContentData?: ReportContentData,
    DMailBuilder?: DMailBuilder,
    ForumBuilder?: ForumBuilder,
    AutoClickPosts?: AutoClickPosts,
    FilterOldFeedbacks?: FilterOldFeedbacks,
    CiteUser?: CiteUser,
    RipStaffNotes?: RipStaffNotes,
    TimeKeeper?: TimeKeeper,
}
