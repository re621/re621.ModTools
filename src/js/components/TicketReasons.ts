import { PageDefinition } from "../models/data/Page";
import { DialogForm } from "../models/structure/DialogForm";
import Component from "./Component";

/**
 * @todo Add red styling in removal mode.
 */
export default class TicketReasons extends Component {

	private input: JQuery<HTMLElement>;
	private _addButton?: JQuery<HTMLElement>;
	private _removeButton?: JQuery<HTMLElement>;
	private _resetButton?: JQuery<HTMLElement>;
	private container: JQuery<HTMLElement>;
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

	private static createDefaultSettingsButtons() {
		return [
			{ name: "Handled", text: "Handled, thank you." },
			{ name: "Reviewed", text: "Reviewed, thank you." },
			{ name: "NAT", text: "Reviewed, no action taken." },
			{ name: "Closed", text: "Ticket closed." },
			{ name: "Old", text: "Thank you for your report, but that comment is from N years ago, & we do not punish people for comments older than 6 months." },
			{ name: "Reply", text: "I believe that you tried to reply to a comment, but reported it instead.\nPlease, be more careful in the future." },
			{ name: "Already", text: "Thank you for your report, but this user already received a record for that message." },
			{ name: "Banned", text: "Thank you for your report, but this user is already banned." },
			{ name: "Blacklist", text: "Thank you for your report, but this post's content does not violate our \"\":[/help/uploading_guidelines].\nIf you find the contents of the post objectionable, we'd ask you to add the relevant tags (or the post's id itself) to your \"blacklist\":[/help/blacklist]." },
			{ name: "Takedown", text: "Artists and character owners may request a takedown \"here\":/static/takedown.\nWe do not accept third party takedowns." }
		];
	}
	public Settings = {
		enabled: true,
		buttons: TicketReasons.createDefaultSettingsButtons(),
	};

	protected create(): Promise<void> {
		TicketReasons.ensureModalContainer();
		this.input = $("textarea[name='ticket[response]']");

		const wrapper = this.input.parents("td");
		wrapper.on("click", "button", (e) => {
			this.input.val("Would you look at that!");
		});
		this.container = $("<div>")
			.addClass("ticket-responses")
			.prependTo(wrapper)
			.on("click", "button", (event) => {
				const button = $(event.currentTarget);
				if (!this.inRemovalState) {
					this.input.val(button.attr("text"));
				} else if (confirm(`Are you sure you want to delete this button?\n\n\tNAME: ${event.target.name}\n\tTEXT: "${event.target.getAttribute("text")}"`)) {
					let temp = this.Settings.buttons;
					temp = temp.filter((e) => e.name !== event.target.name || e.text !== event.target.getAttribute("text"));
					this.Settings.buttons = temp;
					this.buildButtons();
				}

				// Stop propagation & prevent default.
				return false;
			});

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
				})
				.text(button.name)
				.appendTo(this.container);
		}
		this.addButton.appendTo(this.container);
		this.removeButton.appendTo(this.container);
		this.resetButton.appendTo(this.container);
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

	private bindButtons() {
		this.addButton.on("click", (e) => {
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
					const temp = this.Settings.buttons;
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
		this.resetButton.on("click", (e) => {
			if (confirm("Are you sure you want to reset the buttons to the defaults?\n\nThis will permanently remove your custom buttons.")) {
				this.Settings.buttons = TicketReasons.createDefaultSettingsButtons();
				this.buildButtons();
			}

			// Stop propagation & prevent default.
			return false;
		});
	}

	/**
	 * This class doesn't work unless re621 has added the `#modal-container` element, so this manually ensures it's added to enable it to work w/o re621.
	 */
	private static ensureModalContainer() {
		if (!document.querySelector("#modal-container")) {
			console.log("%c[RE621.ModTools]%c: no re621 detected; manually creating 'div#modal-container'...", "color: maroon", "color: unset");
			$("<div>").attr("id", "modal-container").prependTo("div#page");
		}
	}
}
