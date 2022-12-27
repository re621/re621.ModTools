import { PageDefinition } from "../models/data/Page";
import Records from "../models/data/Records";
import Util from "../utilities/Util";
import Component from "./Component";

export default class RecordBuilder extends Component {

    private input: JQuery<HTMLElement>;

    public constructor() {
        super({
            constraint: [PageDefinition.user_feedbacks.new, PageDefinition.bans.new],
            waitForDOM: "textarea[name='user_feedback[body]'], textarea[name='ban[reason]']",
        });
    }

    protected create(): Promise<void> {

        this.input = $("textarea[name='user_feedback[body]'], textarea[name='ban[reason]']");
        const anchor = $("form#new_user_feedback, form#new_ban").parent();
        const wrapper = $("<div>")
            .addClass("record-wrapper")
            .appendTo(anchor);

        $("<button>")
            .attr("type", "button")
            .text("+ Section")
            .appendTo(wrapper)
            .on("click", (event) => {
                event.preventDefault();
                this.buildInterface(wrapper);
                return false;
            });

        this.buildInterface(wrapper);

        return;
    }

    private buildInterface(wrapper: JQuery<HTMLElement>): JQuery<HTMLElement> {
        const id = Util.ID.make();

        const container = $("<form>")
            .addClass("record-builder")
            .data({
                reason: "",
                sources: "",
                buttons: [],
            })
            .appendTo(wrapper);
        let reasonSelector: JQuery<HTMLElement> = null,
            reasonInput: JQuery<HTMLElement> = null;

        // Header
        const header = $("<div>")
            .addClass("record-header")
            .appendTo(container);


        // Prebuilt
        const prebuiltContainer = $("<div>")
            .addClass("record-prebuilt")
            .appendTo(header);
        for (const prebuilt of Records.Prebuilt) {
            $("<a>")
                .text(prebuilt.title)
                .appendTo(prebuiltContainer)
                .on("click", (event) => {
                    event.preventDefault();

                    reasonSelector
                        .val(prebuilt.reason)
                        .trigger("remt:change", true);

                    container.find("button.rules-button").removeClass("active");
                    for (const rule of [prebuilt.rules])
                        container.find("button.rules-button[name='" + rule + "']").addClass("active");
                    container.trigger("remt:buttons", true);

                    this.generateRecordText();

                    return false;
                })
        }


        // Remove
        $("<button>")
            .attr("type", "button")
            .text("Remove Section")
            .appendTo(header)
            .on("click", (event) => {
                event.preventDefault();
                container.remove();
                this.generateRecordText();
                return false;
            });


        // Reason
        const reasonContainer = $("<div>")
            .appendTo(container);

        $("<label>")
            .attr("for", "record-reason-" + id)
            .text("Reason")
            .appendTo(reasonContainer);

        reasonSelector = $("<select>")
            .attr("id", "record-reason-" + id)
            .addClass("record-reason")
            .appendTo(reasonContainer)
            .on("change remt:change", (event, preventChange) => {
                reasonInput
                    .val(Records.Reasons[reasonSelector.val() + ""] || "")
                    .trigger("remt:input", preventChange);
            });

        $("<option>")
            .attr("value", "null")
            .appendTo(reasonSelector);
        for (const [id, text] of Object.entries(Records.Reasons)) {
            $("<option>")
                .attr("value", id)
                .text(text.split("\n")[0])
                .appendTo(reasonSelector);
        }

        let reasonInputTimer = null;
        reasonInput = $("<textarea>")
            .attr({
                id: "custom-reason-" + id,
                class: "custom-reason",
                placeholder: "Custom Reason",
            })
            .appendTo(reasonContainer)
            .on("input", (event, preventChange) => {
                clearTimeout(reasonInputTimer);
                reasonInputTimer = setTimeout(() => {
                    reasonInput.trigger("remt:input", preventChange);
                }, 200);
            })
            .on("propertychange remt:input", (event, preventChange) => {
                container.data("reason", reasonInput.val() + "");
                if (!preventChange) this.generateRecordText();
            });


        // Sources
        const sourcesContainer = $("<div>")
            .appendTo(container);

        $("<label>")
            .attr("for", "record-sources-" + id)
            .text("Sources")
            .appendTo(sourcesContainer);


        let sourcesInputTimer = null;
        const sourcesInput = $("<textarea>")
            .attr({
                id: "record-sources-" + id,
                placeholder: "One source link per line"
            })
            .appendTo(sourcesContainer)
            .on("input propertychange", () => {
                clearTimeout(sourcesInputTimer);
                sourcesInputTimer = setTimeout(() => {
                    container.data("sources", sourcesInput.val() + "")
                    this.generateRecordText();
                }, 200);
            });



        // Rules
        const commonRuleContainer = $("<div>")
            .appendTo(container);
        $("<label>")
            .attr("for", "rules-buttons")
            .text("Common Rules")
            .appendTo(commonRuleContainer);

        const otherRuleContainer = $("<div>")
            .appendTo(container);
        $("<label>")
            .attr("for", "rules-buttons")
            .text("Other Rules")
            .appendTo(otherRuleContainer);

        for (const [name, data] of Object.entries(Records.Rules)) {
            $("<button>")
                .attr({
                    class: "rules-button",
                    type: "button",
                    name: name,
                })
                .text(data.title)
                .appendTo(data.common ? commonRuleContainer : otherRuleContainer)
                .on("click", (event) => {
                    event.preventDefault();
                    const button = $(event.currentTarget);
                    button.toggleClass("active");

                    container.trigger("remt:buttons");
                });
        }

        container.on("remt:buttons", (event, preventChange) => {
            const buttons = [];
            for (const btn of commonRuleContainer.find("button.active"))
                buttons.push((btn as HTMLInputElement).name);
            for (const btn of otherRuleContainer.find("button.active"))
                buttons.push((btn as HTMLInputElement).name);

            container.data("buttons", buttons);
            if (!preventChange) this.generateRecordText();
        });


        return container;
    }

    private generateRecordText() {
        // console.log("%c[RE621.ModTools]%c Updating Record Text", "color: maroon", "color: unset");

        const result = [];

        for (const form of $("form.record-builder")) {
            result.push(this.processForm($(form)));
        }

        this.input.val(result.join("\n"));
    }

    private processForm(form: JQuery<HTMLElement>): string {
        // console.log(form.data());

        // Reason
        const reason = form.data("reason") || "";


        // Sources
        const sourceList = (form.data("sources") || "").split("\n").filter(n => n);
        let sourceOutput = [];
        if (sourceList.length == 0) sourceOutput = [];
        else if (sourceList.length == 1) sourceOutput = [`"[Source]":${processSource(sourceList[0])}`];
        else
            for (const [index, source] of sourceList.entries()) sourceOutput.push(`"[${index + 1}]":${processSource(source)}`);

        // Append rules excerpts
        const rulesOutput = [];
        for (const name of (form.data("buttons") || [])) {
            const ruleData = Records.Rules[name];

            const ruleLines = [];
            for (const ruleLine of ruleData.rules)
                ruleLines.push((ruleLine.startsWith("*") ? "*" : "* ") + ruleLine);
            rulesOutput.push(`[section=${ruleData.title}]\n` +
                `[b]This category includes:[/b]\n\n` +
                `${ruleLines.join("\n")}\n\n` +
                `"[Code of Conduct - ${ruleData.title}]":${ruleData.link ? ruleData.link : `/wiki_pages/e621:rules#${name.toLowerCase()}`}\n` +
                `[/section]`
            );
        }

        // Compose the record text
        const
            sourceOutputJoined = sourceOutput.join(" "),
            sourceReason = reason.includes("%SOURCES%")
                ? reason.replace("%SOURCES%", sourceOutputJoined)
                : ((reason.length > 0 ? (reason + " ") : "") + sourceOutputJoined),
            rulesOutputJoined = rulesOutput.join("\n");
        return sourceReason + (rulesOutputJoined ? ("\n\n" + rulesOutputJoined + "\n") : "");

        /**
         * Convert a source link into a common format
         * @param {string} source Source link
         */
        function processSource(source: string): string {
            return decodeURI(source)
                .replace(/https:\/\/e(?:621|926).net\//g, "/")              // Make links relative
                .replace(/\/posts\/(\d+)#comment-(\d+)/g, "/comments/$2")   // Convert comment links
                .replace(/\?lr=\d+&/, "?")                                  // Trim the tag history links

                .replace(/post #(\d+)/, "/posts/$1")
                .replace(/comment #(\d+)/, "/comments/$1")
                .replace(/topic #(\d+)/, "/forum_topics/$1")
                .replace(/post changes #(\d+)/, "/post_versions?search[post_id]=$1")
                ;
        }
    }

}
