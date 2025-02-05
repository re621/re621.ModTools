import Page, { PageDefinition } from "../models/data/Page";
import Util from "../utilities/Util";
import Component from "./Component";

export default class LinkGrabber extends Component {

    private pizzaDelivery = [
        /^\/users\/18776\/?$/,
        /^\/users\/203592\/?$/,
    ]

    public constructor() {
        super({
            constraint: [PageDefinition.changes, PageDefinition.comments.list, PageDefinition.votes.comment, PageDefinition.votes.post, PageDefinition.users.view],
            waitForDOM: true,
        });
    }

    protected create(): Promise<void> {
        const menu = $("menu.nav-secondary");
        if(!menu.length) return;

        let id: number = null;
        if(Page.matches(PageDefinition.changes)) {
            const latest = $("div.post-version").first();
            if(!latest.length) return;
            id = parseInt(latest.data("postVersionId")) || null;
        } else if(Page.matches(PageDefinition.comments.list)) {
            const latest = $("article.comment").first();
            if(!latest.length) return;
            id = parseInt(latest.data("commentId")) || null;
        } else if(Page.matches(PageDefinition.votes.comment) || Page.matches(PageDefinition.votes.post)) {
            const latest = $("#votes tbody tr td").first();
            if(!latest.length) return;
            id = parseInt(latest.text());
        } else if(Page.matches(this.pizzaDelivery)) {
            const separator = $(`<li class="divider"></li>`).appendTo(menu);
            const container = $("<li>").appendTo(menu);
            const link = $("<a>")
                .text("???")
                .appendTo(container)
                .on("click", () => {
                    $("body").css("cursor", `url(${Util.DOM.getPizza()}), auto`);
                    link.remove();
                    separator.remove();
                });
            return;

        } else return;

        if(!id) return;

        menu.append(`<li class="divider"></li>`);
        const container = $("<li>").appendTo(menu);
        const url = new URL(location.href);
        url.searchParams.set("page", "b" + (id + 1));
        $("<a>")
            .attr("href", url.toString())
            .text("Latest")
            .appendTo(container);

        return;
    }
}
