import { PageDefinition } from "../models/data/Page";
import { DialogForm } from "../models/structure/DialogForm";
import Component from "./Component";

/**
 * @todo Add button removal mode.
 * @todo Add button reset mode.
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
			{ name: "Old", text: "That comment is from N years ago.\nWe do not punish people for comments older than 6 months." },
			{ name: "Reply", text: "I believe that you tried to reply to a comment, but reported it instead.\nPlease, be more careful in the future." },
			{ name: "Already", text: "User already received a record for that message." },
			{ name: "Banned", text: "This user is already banned." },
			{ name: "Blacklist", text: "If you find the contents of that post objectionable, [[e621:blacklist|blacklist]] it." },
			{ name: "Takedown", text: "Artists and character owners may request a takedown here: https://e621.net/static/takedown.\nWe do not accept third party takedowns." }
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
		this.container = $("<div>")
			.addClass("ticket-responses")
			.prependTo(wrapper)
			.on("click", "button", (event) => {
				event.stopPropagation();
				console.log(`Wrapper caught click event; inRemovalState = ${this.inRemovalState}`);

				try { throw new Error(""); } catch (error) { }
				const button = $(event.currentTarget);
				if (!this.inRemovalState) {
					this.input.val(button.attr("text"));
				} else {
					let temp = this.Settings.buttons;
					temp = temp.filter((e) => e.name !== event.target.name || e.text !== event.target.getAttribute("text"));
					// temp = temp.filter((e, i) => i.toString() !== button.attr("index"));
					this.Settings.buttons = temp;
					this.rebuildButtons();
				}

				return false;
			});

		this.rebuildButtons();

		return;
	}

	private rebuildButtons(): void {
		this.container.detach("div.ticket-responses > add-ticket-response-button, div.ticket-responses > remove-ticket-response-button");
		this.container.html("");

		this.Settings.buttons.forEach((button, i) => {
			$("<button>")
				.attr({
					class: "ticket-response-button",
					index: i,
					name: button.name,
					text: button.text,
				})
				.text(button.name)
				.appendTo(this.container);
		});
		this.addButton.appendTo(this.container);
		this.removeButton.appendTo(this.container);
		this.resetButton.appendTo(this.container);
	}

	private get addButton() {
		return this._addButton ||= $("<button>")
			.attr({
				class: "add-ticket-response-button",
				name: "Add Custom Button",
				text: "...You shouldn't see this...",
			})
			.text("+")
			.on("click", (e) => {
				e.preventDefault();
				e.stopImmediatePropagation();
				try { throw new Error(""); } catch (error) { }
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
						this.rebuildButtons();
					},
				);
			});
	}

	private get removeButton() {
		return this._removeButton ||= $("<button>")
			.attr({
				class: "remove-ticket-response-button",
				name: "Remove Buttons",
				text: "...You shouldn't see this...",
				title: "Enter button removal mode.",
			})
			.text("-")
			.on("click", (e) => {
				e.preventDefault();
				e.stopImmediatePropagation();

				// console.log(`toggling state from ${this.inRemovalState} to ${!this.inRemovalState}`);
				// try { throw new Error(""); } catch (error) { }
				if (this.toggleState()) {
					e.target.innerText = "x";
					e.target.title = "Exit button removal mode.";
					this.addButton.attr("disabled", "true");
				} else {
					e.target.innerText = "-";
					e.target.title = "Enter button removal mode.";
					this.addButton.removeAttr("disabled");
				}

				// // Stop propagation & prevent default.
				// return false;
			});
	}

	private get resetButton() {
		return this._resetButton ||= $("<button>")
			.attr({
				class: "reset-ticket-response-button",
				name: "Reset Buttons",
				text: "...You shouldn't see this...",
				title: "Reset buttons to their default values.",
			})
			.text("Reset")
			.on("click", (e) => {
				e.preventDefault();
				e.stopImmediatePropagation();

				if (confirm("Are you sure you want to reset the buttons to the defaults?\n\nThis will permanently remove your custom buttons.")) {
					this.Settings.buttons = TicketReasons.createDefaultSettingsButtons();
					this.rebuildButtons();
				}

				// // Stop propagation & prevent default.
				// return false;
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
