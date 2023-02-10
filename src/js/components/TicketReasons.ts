import { PageDefinition } from "../models/data/Page";
import Component from "./Component";

export default class TicketReasons extends Component {

    private input: JQuery<HTMLElement>;
    private container: JQuery<HTMLElement>;

    public constructor() {
        super({
            constraint: PageDefinition.tickets.view,
            waitForDOM: "textarea[name='ticket[response]']",
            dependencies: ["TicketData"],
        });
    }

    public Settings = {
        enabled: true,
        buttons: [
            { name: "Handled", text: "Handled, thank you." },
            { name: "Reviewed", text: "Reviewed, thank you." },
            { name: "NAT", text: "Reviewed, no action taken." },
            { name: "Closed", text: "Ticket closed." },
            { name: "Old", text: "That comment is from N years ago.\nWe do not punish people for comments older than 6 months." },
            { name: "Reply", text: "I believe that you tried to reply to a comment, but reported it instead.\nPlease, be more careful in the future." },
            { name: "Already", text: "User already received a record for that message." },
            { name: "Banned", text: "This user is already banned." },
            { name: "Blacklist", text: "If you find the contents of that post objectionable, [[e621:blacklist|blacklist]] it." },
            { name: "Takedown", text: "Artists and character owners may request a takedown here: https://e621.net/static/takedown.\nWe do not accept third party takedowns." }
        ],
    }

    protected create(): Promise<void> {

        this.input = $("textarea[name='ticket[response]']");

        const wrapper = this.input.parents("td");
        this.container = $("<div>")
            .addClass("ticket-responses")
            .prependTo(wrapper)
            .on("click", "button", (event) => {
                event.stopPropagation();

                const button = $(event.currentTarget);
                this.input.val(button.attr("text"));

                return false;
            });

        this.rebuildButtons();

        return;
    }

    private rebuildButtons(): void {
        this.container.html("");

        for (const button of this.Settings.buttons) {
            $("<button>")
                .attr({
                    name: button.name,
                    text: button.text,
                })
                .text(button.name)
                .appendTo(this.container);
        }
    }

}
