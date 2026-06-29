import ZestyAPI from "@re621/zestyapi";
import css from "./css/style.module.scss";

import { ComponentList, SettingsDialogConfig } from "./js/components/Component";
import LinkGrabber from "./js/components/LinkGrabber";
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

export default class REMT {

    public static Registry: ComponentListAnnotated = {};
    public static API: ZestyAPI;

    private loadOrder = [
        AutoTaggingButtons,
        RecordBuilder,

        TicketData,
        TicketReasons,

        AppealReasons,

        LinkGrabber,
		
		DMailToStaffNote,
    ReportContentData,
		DMailBuilder,
		ForumBuilder,
    ];

    public async run(): Promise<void> {

        if (Page.matches(IgnoredPages)) return;

        console.log("%c[RE621.ModTools]%c v." + Script.version, "color: maroon", "color: unset");

        // Set up the API connection
        // TODO Temporary instantiation method
        REMT.API = window["ZestyAPI"].connect({
            userAgent: Script.userAgent,
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
                $("body").attr("remt", Script.version);
                Util.DOM.setupDialogContainer(); // TODO Move to the dialog class
                User.init();
            });

            PageObserver.watch("head meta[name=csrf-token]").then((result) => {
                if (!result) {
                    Debug.log("+ API logged out");
                    return;
                }
                const token = $("head meta[name=csrf-token]");
                if (token) REMT.API.login(token.attr("content") ?? "");
            });
        } catch (error) {
            ErrorHandler.write("An error occurred during script initialization", error);
            return;
        }


        // Start loading components
        await Promise.all([headLoaded, bodyLoaded]);

        // Bootstrap settings (synchronous)
        for (const module of this.loadOrder) {
            const instance = new module();
            REMT.Registry[instance.getName()] = instance;
            await instance.bootstrapSettings();
        }
        Util.Events.trigger("re621-mt:bootstrap");

        // Load modules (asynchronous)
        const promises: Promise<void>[] = [];
        for (const instance of Object.values(REMT.Registry))
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            promises.push(instance!.load());
        Promise.all(promises).then(() => {
            const allConfigs = Object.values(REMT.Registry).reduce<SettingsDialogConfig[]>((p, e) => {
              if (e?.settingsMenuDialogParameters) p.push(e!.settingsMenuDialogParameters!); return p; }, []);
            const configs = allConfigs.filter(e => e) as SettingsDialogConfig[];
            if (configs.length <= 0) {
              console.log("%c[RE621.ModTools]%c loaded; no settings to load", "color: maroon", "color: unset");
              return;
            }
            console.log("%c[RE621.ModTools]%c loaded; loading %s settings...", "color: maroon", "color: unset", configs.length);
            Util.DOM.addSettingsButton({
              id: "remt-component-settings",
              icon: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" name="settings"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>',
              name: "REMT",
              onClick: () => MultiDialogForm.getRequestedInput(configs),
            });
            console.log("%c[RE621.ModTools]%c fully loaded.", "color: maroon", "color: unset");
        });
    }

}
new REMT().run();

interface ComponentListAnnotated extends Partial<ComponentList> {
    AutoTaggingButtons?: AutoTaggingButtons,
    RecordBuilder?: RecordBuilder,

    TicketData?: TicketData,
    TicketReasons?: TicketReasons,

    AppealReasons?: AppealReasons,

    LinkGrabber?: LinkGrabber,

    DMailToStaffNote?: DMailToStaffNote,
    ReportContentData?: ReportContentData,
    DMailBuilder?: DMailBuilder,
    ForumBuilder?: ForumBuilder,
}
