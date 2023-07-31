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

    /**
     * Adds a button to the top-right of the navbar
     * @param config Button configuration
     * @param target Target element
     */
    public static addSettingsButton(config: SettingsButton, target = "menu.extra"): JQuery<HTMLElement> {
        if (config.name === undefined) config.name = "T";
        if (config.href === undefined) config.href = "";
        if (config.title === undefined) config.title = "";

        if (config.tabClass === undefined) config.tabClass = "";
        if (config.linkClass === undefined) config.linkClass = "";

        if (config.attr === undefined) config.attr = {};

        const $tab = $(`<li>`).appendTo(target);
        const $link = $("<a>")
            .html(config.name)
            .attr({
                "title": config.title,
                "id": config.id,
            })
            .appendTo($tab);

        if (config.onClick !== undefined)
            $link.on("click", () => { config.onClick($link); });

        if (config.href) { $link.attr("href", config.href); }
        if (config.tabClass) { $tab.addClass(config.tabClass); }
        if (config.linkClass) { $link.addClass(config.linkClass); }
        if (config.attr) { $link.attr(config.attr); }

        return $link;
    }

    static getPlaceholderImage(): string {
        return "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    }

    static getPizza(): string {
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAAklEQVR4AewaftIAAAFOSURBVL3BMWrcQBiA0W82OoVg6wWJPcL+7RQC3WCLPYeauNA53PgEAyqUIsXMEQYJjDsPiOB0voCigRUMQk5iCHmPf0GxuJyPMwnng+ITMu5sXyPaYPMCgZmE80HxGxk7bF4g04jtayLRZibhfFAkFIvL+TjbviYSbYhsX/MR0YaV80F9YfH69v7w/duPr7fridv1xO16IiXa8Pj0zO16Inp8eqapStzLT17f3h8O/IFog80LbF4g2rDnwCeJNjRVSerAhmiDaMPK9jUyjcg0YvuaVdsNOB8UC0Xicj7ONi+IZBqxfU1KtKGpSqK2G3A+KBYH/pJoQ1OVRG034HxQ3GVsyDQS2b5mJdrQVCVR2w04HxSJjA3b16xEG6KmKonabsD5oNhQbFzOx5m7pipZtd2A80GxI2NHU5Ws2m4gcj4oPpCxo+0GVs4Hxf/wCzeQgfpPWb9hAAAAAElFTkSuQmCC";
    }

}

interface SettingsButton {

    /** Unique button ID */
    id: string;

    /** Text inside the link */
    name?: string;
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
