import { PageDefinition } from "../models/data/Page";
import { DialogForm } from "../models/structure/DialogForm";
import Component from "./Component";

/**
 * @todo Add red styling in removal mode.
 * @todo Uncomment hover-over.
 */
export default class TicketReasons extends Component {

	private input: JQuery<HTMLElement>;
	private _addButton?: JQuery<HTMLElement>;
	private _removeButton?: JQuery<HTMLElement>;
	private _resetButton?: JQuery<HTMLElement>;
	private _greetingButton?: JQuery<HTMLElement>;
	private container: JQuery<HTMLElement>;
	/** 
	 * The name of the user that filed the report ticket.
	 * Used for template variable replacement across both greetings & button text.
	 **/
	private reporterName: string;
	private inRemovalState = false;
	/** @returns {boolean} The resultant state. */
	private toggleState(): boolean { return this.inRemovalState = !this.inRemovalState; }

	public constructor() {
		super({
			constraint: PageDefinition.tickets.view,
			waitForDOM: "textarea[name='ticket[response]']",
			dependencies: ["TicketData"],
		});
	}

	static readonly flagText = "Thank you for the report. However, when a post is not suited for our site, a [i]\"flag\":[/help/flag_for_deletion][/i] is the correct remedy, as the moderators who handle reports can't delete posts (that's our janitors' job). [i]Reports[/i] are for when the [i]conduct[/i] relating to the post is disallowed (e.g. tag warring, removal of valid sources, uploaded with not enough tags, etc.), not for when the post's [i]content[/i] itself is disallowed.\n\n"
	static readonly flagTextEnd = ", but for future reference, you can flag posts by selecting `Flag` instead of `Report` in the sidebar. If you have trouble remembering, selecting the appropriate reason on either page will redirect you to the correct mechanism if the current one is incorrect."
	private static createDefaultSettingsButtons() {
		return [
			{ name: "Handled", text: "This ticket has been handled, thank you!" },
			{ name: "Reviewed", text: "This ticket has been reviewed, thank you!" },
			{ name: "NAT", text: `Thank you for the heads-up! We've reviewed the ticket and completed our investigation into the matter; however, we've decided it does not warrant action at this time.` },
			{ name: "Closed", text: "This ticket has been closed." },
			{ name: "Old (NAT)", text: "Thank you for your report, but that comment is from N years ago, & we do not punish people for comments older than 6 months." },
			{ name: "Old (Hide)", text: "Thank you for your report, but that comment is from N years ago, & we do not punish people for comments older than 6 months. We've removed the comment." },
			{ name: "Reply", text: "I believe that you tried to reply to a comment, but reported it instead.\nPlease, be more careful in the future." },
			{ name: "Already (Rec)", text: "Thank you for your report, but this user has already received a record for this matter." },
			{ name: "Already (Ban)", text: "Thank you for your report, but this user is already banned." },
			{ name: "Blacklist", text: "Thank you for your report, but this post's content does not violate our \"\":[/help/uploading_guidelines].\nIf you find the contents of the post objectionable, we'd ask you to add the relevant tags (or the post's id itself) to your \"blacklist\":[/help/blacklist]." },
			{ name: "Takedown", text: "Thank you for your report, but this matter needs to be handled via a takedown request.\nArtists and character owners may request a takedown \"here\":/static/takedown.\nWe do not accept third party takedowns." },
			{ name: "DMed", text: "Thank you for your report, we've discussed the matter with them." },
			{ name: "Flag (Del)", text: `${TicketReasons.flagText}The post has already been deleted by our janitors${TicketReasons.flagTextEnd}` },
			{ name: "Flag (Flag)", text: `${TicketReasons.flagText}The post has already been flagged${TicketReasons.flagTextEnd}` },
		];
	}
	public Settings = {
		enabled: true,
		buttons: TicketReasons.createDefaultSettingsButtons(),
		greeting: "Hi %reporterName%,\n\n",
	};

	protected create(): Promise<void> {
		this.input = $("textarea[name='ticket[response]']");

		const wrapper = this.input.parents("td");
		this.container = $("<div>")
			.addClass("ticket-responses")
			.prependTo(wrapper)
			.on("click", "button", (event) => {
				const button = $(event.currentTarget);
				if (!this.inRemovalState) {
					// Prepend a greeting to the user before stating the response
					this.input.val(`${this.Settings.greeting}${button.attr("text")}`.replace(/%reporterName%/g, this.reporterName || ""));
				} else if (confirm(`Are you sure you want to delete this button?\n\n\tNAME: ${event.target.name}\n\tTEXT: "${event.target.getAttribute("text")}"`)) {
					let temp = this.Settings.buttons;
					temp = temp.filter((e) => e.name !== event.target.name || e.text !== event.target.getAttribute("text"));
					this.Settings.buttons = temp;
					this.buildButtons();
				}

				// Stop propagation & prevent default.
				return false;
			});

		
        // Get the name of the reporting user
        const rows = [...document.querySelectorAll<HTMLElement>("#c-tickets .section tr")];
        const req = rows.find(e=>e.innerText.includes("Requested by"));
        this.reporterName = req.querySelector<HTMLElement>("td a").innerText;

		this.buildButtons();

		return;
	}

	private buildButtons(): void {
		// Preserve buttons; doesn't preserve their events.
		this.container.detach("div.ticket-responses > add-ticket-response-button, div.ticket-responses > remove-ticket-response-button");
		this.container.html("");

		for (const button of this.Settings.buttons) {
			$("<button>")
				.attr({
					class: "ticket-response-button",
					name: button.name,
					text: button.text,
					// title: button.text,
				})
				.text(button.name)
				.appendTo(this.container);
		}
		this.addButton.appendTo(this.container);
		this.removeButton.appendTo(this.container);
		this.resetButton.appendTo(this.container);
		this.greetingButton.appendTo(this.container);
		// (Re)bind the events
		this.bindButtons();
	}

	private get addButton() {
		return this._addButton ||= $("<button>")
			.attr({
				class: "add-ticket-response-button",
				name: "Add Custom Button",
				text: "...You shouldn't see this...",
			})
			.text("+");
	}

	private get removeButton() {
		return this._removeButton ||= $("<button>")
			.attr({
				class: "remove-ticket-response-button",
				name: "Remove Buttons",
				text: "...You shouldn't see this...",
				title: "Enter button removal mode.",
			})
			.text("-");
	}

	private get resetButton() {
		return this._resetButton ||= $("<button>")
			.attr({
				class: "reset-ticket-response-button",
				name: "Reset Buttons",
				text: "...You shouldn't see this...",
				title: "Reset buttons to their default values.",
			})
			.text("Reset");
	}

	private get greetingButton() {
		return this._greetingButton ||= $("<button>")
			.attr({
				class: "greeting-ticket-response-button",
				name: "Edit Greeting",
				text: "...You shouldn't see this...",
			})
			.text("Edit");
	}

	private bindButtons() {
		this.addButton.on("click", () => {
			DialogForm.getRequestedInput(
				[
					$('<label for="new-button-name">Name</label>'),
					$('<input id="new-button-name" name="new-button-name" required min=1 />'),
					$('<br />'),
					$('<label for="new-button-text">Text</label>'),
					$('<textarea id="new-button-text" name="new-button-text" required min=1></textarea>'),
				],
				"Add Button...",
				(e: FormData) => {
					const temp = [...this.Settings.buttons];
					temp.push({
						name: e.get("new-button-name").toString(),
						text: e.get("new-button-text").toString(),
					});
					this.Settings.buttons = temp;
					this.buildButtons();
				},
			);

			// Stop propagation & prevent default.
			return false;
		});
		this.removeButton.on("click", (e) => {
			if (this.toggleState()) {
				e.target.innerText = "x";
				e.target.title = "Exit button removal mode.";
				this.addButton.attr("disabled", "true");
			} else {
				e.target.innerText = "-";
				e.target.title = "Enter button removal mode.";
				this.addButton.removeAttr("disabled");
			}

			// Stop propagation & prevent default.
			return false;
		});
		this.resetButton.on("click", () => {
			if (confirm("Are you sure you want to reset the buttons to the defaults?\n\nThis will permanently remove your custom buttons.")) {
				this.Settings.buttons = TicketReasons.createDefaultSettingsButtons();
				this.buildButtons();
			}

			// Stop propagation & prevent default.
			return false;
		});
		this.greetingButton.on("click", () => {
			DialogForm.getRequestedInput(
				[
					$('<label for="greeting-text">Greeting Text</label>'),
					$(`<textarea id="greeting-text" name="greeting-text"></textarea>`).text(this.Settings.greeting),
				],
				"Edit Greeting...",
				(e: FormData) => this.Settings.greeting = e.get("greeting-text").toString(),
			);

			// Stop propagation & prevent default.
			return false;
		});
	}
}
