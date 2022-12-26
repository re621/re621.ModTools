import ZestyAPI from "@re621/zestyapi";
import css from "./css/style.module.scss";

import { ComponentList } from "./js/components/Component";
import RecordBuilder from "./js/components/RecordBuilder";
import TicketData from "./js/components/TicketData";
import TicketReasons from "./js/components/TicketReasons";
import Danbooru from "./js/models/api/Danbooru";
import Page, { IgnoredPages } from "./js/models/data/Page";
import Script from "./js/models/data/Script";
import User from "./js/models/data/User";
import Version from "./js/models/data/Version";
import Debug from "./js/models/Debug";
import PageObserver from "./js/models/structure/PageObserver";
import ErrorHandler from "./js/utilities/ErrorHandler";
import Util from "./js/utilities/Util";

export default class REMT {

    public static Registry: ComponentListAnnotated = {};
    public static API: ZestyAPI;

    private loadOrder = [
        RecordBuilder,

        TicketData,
        TicketReasons,
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

        // Load assets
        await Version.init();

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
                Danbooru.Utility.disableShortcuts(true);
                Util.DOM.setupDialogContainer(); // TODO Move to the dialog class
                User.init();
            });

            PageObserver.watch("head meta[name=csrf-token]").then((result) => {
                if (!result) {
                    Debug.log("+ API logged out");
                    return;
                }
                const token = $("head meta[name=csrf-token]");
                if (token) REMT.API.login(token.attr("content"));
            });
        } catch (error) {
            ErrorHandler.write("An error ocurred during script initialization", error);
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
            promises.push(instance.load());
        Promise.all(promises).then(() => {
            console.log("%c[RE621.ModTools]%c loaded", "color: maroon", "color: unset");
        });
    }

}
new REMT().run();

interface ComponentListAnnotated extends ComponentList {
    RecordBuilder?: RecordBuilder,

    TicketData?: TicketData,
    TicketReasons?: TicketReasons,
}
