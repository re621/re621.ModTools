import Page, { PageDefinition } from "../models/data/Page";
import Component from "./Component";

export default class RecordBuilder extends Component {

    public constructor() {
        super({
            constraint: [PageDefinition.changes, PageDefinition.comments.list],
            waitForDOM: true,
        });
    }

    protected create(): Promise<void> {
        const menu = $("nav > menu:last-of-type");
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
        } else return;

        if(!id) return;

        menu.append("<li>|</li>");
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
