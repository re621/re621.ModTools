import { PageDefinition } from "../models/data/Page";
import Debug from "../models/Debug";
import { DialogForm } from "../models/structure/DialogForm";
import { UtilDOM } from "../utilities/UtilDOM";
import Component, { JSONObject } from "./Component";

/** A pseudo-enum used to determine what special action is performed when selecting a button. */
export class SelectionState {
	private constructor(public readonly index: number, public readonly label: string) {}
	public static readonly none = new SelectionState(0, "none");
	public static readonly edit = new SelectionState(1, "edit");
	public static readonly remove = new SelectionState(2, "remove");
	public static readonly reorder = new SelectionState(3, "reorder");
	public static from(v: number | string): SelectionState {
		switch (v) {
			case this.none.index:
			case this.none.label:
			case this.none.index.toString():
				return this.none;
			case this.edit.index:
			case this.edit.label:
			case this.edit.index.toString():
				return this.edit;
			case this.remove.index:
			case this.remove.label:
			case this.remove.index.toString():
				return this.remove;
			case this.reorder.index:
			case this.reorder.label:
			case this.reorder.index.toString():
				return this.reorder;
			default:
				throw new Error(`Invalid input: ${v} doesn't correspond to a SelectionState.`);
		}
	}
	public static tryFrom(v: number | string): SelectionState | undefined {
		try {
			return this.from(v);
		} catch (error) {
			return undefined;
		}
	}
}

/**
 * Allows building personalized DMails from an assortment of smaller piecemeal values.
 * @todo Allow custom & dynamic template variable substitution (e.g. allow buttons to define template variables & have a pop-up that allows the user to enter them if they haven't already been defined on this DMail).
 * @todo Allow reordering via click & drag?
 */
export default class DMailBuilder extends Component {
	// #region Template Variable Stuff
	private static readonly queryParametersToTemplateVariables: JSONObject = {
		"dmail[to_id]": "recipientId",
		"dmail[to_name]": "recipientName",
		"dmail[title]": "initialTitle",
		"dmail[body]": "initialBody",
		"respond_to_id": "repliedDMailId",
	};
	private readonly templateVariables: JSONObject = {};

	private retrieveTemplateVariables() {
		throw new Error("Method not implemented.");
	}
	// #endregion Template Variable Stuff

	private container: JQuery<HTMLDivElement>;
	/** The main text entry box. */
	private input: JQuery<HTMLTextAreaElement>;

	// #region States
	private state = SelectionState.none;
	public get inRemovalState() {
		return this.state === SelectionState.remove;
	}
	public get inEditState() {
		return this.state === SelectionState.edit;
	}
	public get inReorderState() {
		return this.state === SelectionState.reorder;
	}

	private onSettingsButton(_$element: JQuery<HTMLElement>) {
		DialogForm.getRequestedInput(
			[
				$(`<button type="submit" name="selectedAction" value="${SelectionState.none.index}">Add New Button...</button>`),
				$(`<button type="submit" name="selectedAction" value="${SelectionState.edit.index}">Edit Button...</button>`),
				$(`<button type="submit" name="selectedAction" value="${SelectionState.remove.index}">Remove Buttons...</button>`),
				$(`<button type="submit" name="selectedAction" value="${SelectionState.reorder.index}">Reorder Buttons...</button>`),
				$(`<button type="submit" name="selectedAction" value="resetButtons">Reset Buttons</button>`),
				$(`<button type="submit" name="selectedAction" value="-1">Cancel</button>`),
			],
			{
				title: "DMail Builder Settings",
				defaultElements: [],
			},
			(e: FormData) => {
				Debug.log(`Return from DMail Builder Settings w/ value of ${e.get("selectedAction")}`);
				const v = SelectionState.tryFrom(e.get("selectedAction").toString());
				switch (v) {
					case SelectionState.none: // Add
						this.makeAddButtonDialog();
						break;
					case SelectionState.edit:
					case SelectionState.remove:
					case SelectionState.reorder:
						this.selectButtonMode(v);
						break;
					default:
						switch (e.get("selectedAction")) {
							case "resetButtons":
								this.promptAndReset();
								break;
						
							default:
								break;
						}
						break;
				}
			},
			() => this.clearState(),
		);

		// Stop propagation & prevent default.
		return false;
	}

	private cancelButton?: JQuery<HTMLButtonElement>;
	private selectButtonMode(mode: SelectionState) {
		this.state = mode;
		alert(`Select the button to ${mode.label}, or select "CANCEL" to cancel the operation.`);
		this.cancelButton = $<HTMLButtonElement>("<button>")
			.text("CANCEL");
		this.cancelButton.on("click", (e) => {
				e.preventDefault();
				e.stopImmediatePropagation();
				this.clearState();
				return false;
			})
			.appendTo(this.container);
	}

	private clearState() {
		this.state = SelectionState.none;
		this.cancelButton?.remove();
		this.buildButtons();
	}
	// #endregion States

	public constructor() {
		super({
			constraint: PageDefinition.dmails.new,
			waitForDOM: "form.new_dmail .dtext_formatter",
		});
		Debug.log("Constructing DMail Builder...");
	}

	public static get defaultButtons(): Array<IBuilderItem> {
		return [
			{
				label: "Outreach",
				text: `Thank you for reaching out.`,
			},
			{
				label: "Attempt",
				text: `Thank you for attempting to resolve this.`,
			},
			{
				label: "Contesting Deletions",
				text: [
					`Our rules for contesting deletions are as follows:`,
					`1. [b][i]Politely[/i] contact the janitor who deleted the post[/b]: If they are no longer staff, have requested to not be contacted regarding deletions (e.g. "Mairo":[/users/38571]), or decline to reinstate the post, you may advance to the next step.`,
					`2. [b][i]Politely[/i] "contact our Janitor Lead":[/help/staff#list:~:text=Janitor%20Lead][/b]: They will review the matter & make a decision. If they decline to reinstate the post, you may advance to the next step.`,
					`3. [b][i]Politely[/i] "contact an Admin":[/help/staff#list:~:text=Administrator%20Team][/b]: They will review the matter & make a decision. If they decline to reinstate the post, you may advance to the next step.`,
					`4. [b][i]Politely[/i] "contact our Staff Lead":[/help/staff#list:~:text=Staff%20Lead][/b]: They will review the matter & make a decision. If they decline to reinstate the post, you may advance to the next step.`,
					`5. [b][i]Politely[/i] "contact our Site Lead":[/help/staff#list:~:text=Site%20Lead][/b]: They will review the matter & make a decision. [b][u]If our Site Lead declines to reinstate the post, then that is the end of the matter[/u][/b].`,
				].join("\n"),
			},
			{
				label: "AI: Exceptions",
				text: [
					`We allow for [[ai_assisted|3 narrow exceptions]] to our ban on AI assisted/generated content:`,
					`* [[ai_generated_audio|AI generated/assisted audio]]`,
					`* [[ai_generated_backgrounds|AI generated/assisted backgrounds]]`,
					`* [[ai_generated_reference|AI generated/assisted reference material]]`,
				].join("\n"),
			},
			{
				label: "AI: Flag",
				text: [
					`We do not tolerate public AI accusations outside of flags. If you genuinely think something uses some form of AI assistance/generation, then "flag it":[/help/flag_for_deletion] for "not meeting the Uploading Guidelines":[/help/uploading_guidelines#bad:~:text=AI%20Generated,Webm] & move on with your day; that actually brings it to our attention so we can investigate & resolve the matter. It's a lot more productive than throwing around accusations in the comments, & with 99% less drama, in-fighting, hurt feelings, & baseless reputational harm.`,
					``,
					`To be 100% clear, [b][i]the one and only place on this site to accuse posts of being AI is [u]in a flag[/u][/i][/b]. Not in the comments, forums, blips, user profiles, post/pool/set descriptions, or any other location.`,
				].join("\n"),
			},
			{
				label: "AI: Too Early",
				text: `The earliest appearance of this exact image file makes the use of AI image materials extremely unlikely; OpenAI's first release of DALL-E was January 2021, and open-source furry-oriented models did not appear until December (with a few of the longest-enduring models not existing until 2023.) An additional thing to keep in mind about these early resources is that they produced lower-quality results, as people hadn't gotten to fine-tuning them yet, nor developing techniques for both image generation & how to best hide their giveaways.`,
			},
			{
				label: "AI: Detectors",
				text: `AI detection services (especially those that analyze the content itself instead of a file's metadata) are not particular reliable. The most cynical answer would be that these services may pretend to be able to detect AI-generated text and media in order to sell you a product, but a simpler answer is that the nature of human-made images is extremely broad, and so is the nature of how people use AI image generation; some prompt using text and then post their AI images as-is, some use their own art to inform an AI-generated image, and others still will simply trace AI-generated images to mask the most obvious details.`,
			},
			{
				label: "AI: How to spot",
				text: `If learning to detect AI images is something of legitimate interest to you, we suggest you browse AI-oriented sites, collect samples from those sites, and note what makes them different from human-made art. We can't provide any further guidance to you, since our own AI investigation team keeps their methods secret in order to avoid giving artists hints on how to elude them.`,
			},
			{
				label: "Takedown: No Third-party",
				text: `Only artists, character owners, & commissioners may issue takedown requests for their material, & they must do so directly; we do not accept third party takedown requests.`,
			},
			{
				label: "Takedown: Required",
				text: `This requires a takedown request.`,
			},
			{
				label: "Takedown: See here",
				text: `See "here":[/static/takedown] for details about takedown requests.`,
			},
			{
				label: "Translation tags",
				text: [
					`For all posts with non-English text, they are in 1 of 3 states of translation:`,
					`* [[translation_request]] - The post [b]has some non-English text[/b] that [b]does not have "notes":[/help/notes][/b] translating it into English.`,
					`* [[partially_translated]] - The post [b]has non-English text[/b] & [b]has "notes":[/help/notes][/b] translating [b][i]some[/i] of it, but not [i]all[/i] of it,[/b] into English.`,
					`** All \`partially_translated\` posts also have \`translation_request\`.`,
					`* [[translated]] - The post [b]has non-English text[/b] & [b]has "notes":[/help/notes][/b] translating [b][i]all[/i] of it into[/b] English.`,
					`If \`partially_translated\` or \`translated\` the post might [b][i]also[/i][/b] have:`,
					`* [[translation_check]] - The post [b]has non-English text[/b], [b]has "notes":[/help/notes][/b] translating [b][i]some[/i] or [i]all[/i] of it[/b] into English, but the [b]translation is suspected of being poor quality[/b].`,
					`** Basically, "This [b]has a translation[/b], but I think it's a [b][i]bad[/i] translation that [i]needs to be corrected[/i][/b]."`,
					`If the [b][i]original image[/i] had non-English text[/b] & an [b][i]alternate version[/i] of the [i]same image[/i] with [i]translations to English[/i][/b] was uploaded, in addition to some combination of the above tags, the [b]edited version[/b] would have:`,
					`* [[hard_translated]] - The post is an [b]edited version[/b] of an image which [b]translates the original text[/b] from a non-English language to English.`,
					`** If this translated version was not created by the same person who made the original image, then it is also a 3rd party [[translation edit]].`,
				].join("\n"),
			},
		];
	}

	public Settings: {enabled: boolean, buttons: Array<IBuilderItem>} = {
		enabled: true,
		buttons: DMailBuilder.defaultButtons,
	};

	protected create(): Promise<void> {
		Debug.log("Creating DMail Builder...");
		UtilDOM.addStyle(`
			form.new_dmail .dmail_body .responses {
				display: flex;
				flex-wrap: wrap;
			}
			form.new_dmail .dmail_body .responses button {
				margin: 0px .25rem;
				flex: none;
			}
		`);
		this.input = $("textarea[name='dmail[body]']");
		const wrapper = $("form.new_dmail .dmail_body");
		UtilDOM.addSettingsButton({
			id: "dmail-responses-settings",
			name: "Responses Settings",
			onClick: (e) => this.onSettingsButton(e),
		}, true);
		this.container = $<HTMLDivElement>("<div>")
			.addClass("responses")
			.appendTo(wrapper)
			.on("click", "button", (e) => this.onResponseClick(e));

		// TODO: Find template variables

		this.buildButtons();

		return;
	}

	private onResponseClick(event: JQuery.ClickEvent<HTMLElement, undefined, any, HTMLButtonElement>) {
		const button = $(event.currentTarget);
		const priorState = this.state;
		this.state = SelectionState.none;
		switch (priorState) {
			case SelectionState.remove:
				this.promptAndRemove(event);
				break;
			case SelectionState.edit:
				this.makeEditButtonDialog(Number(event.target.dataset["index"]));
				break;
			case SelectionState.reorder:
				this.makeReorderButtonDialog(Number(event.target.dataset["index"]));
				break;
			default:
				Debug.log("Invalid State!?!?");
			// eslint-disable-next-line no-fallthrough
			case SelectionState.none:
				this.input.val(`${this.input.val()}${button.attr("text")}`);
				this.input[0].focus();
				break;
		}

		event.stopImmediatePropagation();
		event.preventDefault();
		// Stop propagation & prevent default.
		return false;
	}

	private buildButtons() {
		this.container.html("");

		// for (const button of this.Settings.buttons) {
		for (let i = 0; i < this.Settings.buttons.length; i++) {
			const button = this.Settings.buttons[i];
			$("<button>")
				.attr({
					class: "response-button",
					name: button.label,
					text: button.text,
					title: button.description,
				})
				// .data("index", i)
				.attr("data-index", i)
				.text(button.label)
				.appendTo(this.container);
		}
	}

	/**
	 * 
	 * @param input 
	 * @todo Filter out duplicates
	 */
	private bulkImport(input: string) {
		const buttons = JSON.parse(input);
		const t = this.Settings.buttons
		t.concat(buttons);
		this.Settings.buttons = t;
		this.buildButtons();
	}

	// #region Make Dialogs
	private makeAddButtonDialog() {
		DialogForm.getRequestedInput(
			BuilderItem.buildInput({}, false, this.Settings.buttons.length),
			"Add Button",
			(e: FormData) => {
				const temp = [...this.Settings.buttons];
				temp.push(BuilderItem.parseInput(e));
				this.Settings.buttons = temp;
				this.buildButtons();
			},
		);
	}

	private makeEditButtonDialog(index: number) {
		const button = this.Settings.buttons[index];
		DialogForm.getRequestedInput(
			BuilderItem.buildInput(button, false, this.Settings.buttons.length - 1),
			{ title: `Edit "${button.label}" Button`, rejectOnClose: true },
			(e: FormData) => {
				const temp = this.Settings.buttons;
				temp[index] = BuilderItem.parseInput(e);
				this.Settings.buttons = temp;
				this.buildButtons();
			},
			() => this.clearState(),
		);
	}

	private makeReorderButtonDialog(index: number) {
		const button = this.Settings.buttons[index];
		DialogForm.getRequestedInput(
			BuilderItem.buildIndexInput(index, this.Settings.buttons.length - 1),
			{ title: `Reorder "${button.label}"`, rejectOnClose: true },
			(e: FormData) => {
				const newIndex = Number(e.get("button-index"));
				if (newIndex === index) return;
				const temp = [...this.Settings.buttons];
				temp[index] = temp[newIndex];
				temp[newIndex] = button;
				this.Settings.buttons = temp;
				this.buildButtons();
			},
			() => this.clearState(),
		);
	}
	// #endregion Make Dialogs

	/**
	 * Prompts for confirmation & removes the button if given.
	 * @param event 
	 */
	private promptAndRemove(event: JQuery.ClickEvent<HTMLElement, undefined, any, HTMLButtonElement>) {
		if (confirm(`Are you sure you want to delete this button?\n\n\tNAME: ${event.target.name}\n\tDESCRIPTION: ${event.target.title}\n\tTEXT: "${event.target.getAttribute("text")}"`)) {
			this.Settings.buttons = BuilderItem.removeButtonAt([...this.Settings.buttons], Number(event.target.dataset["index"]));
			this.buildButtons();
		}
	}

	/**
	 * Prompts for confirmation & resets to the default buttons if given.
	 * @param event 
	 */
	private promptAndReset() {
		if (confirm("Are you sure you want to reset the buttons to the defaults?\n\nThis will permanently remove your custom buttons.")) {
			this.Settings.buttons = DMailBuilder.defaultButtons;
			this.buildButtons();
		}
	}
}

interface IBuilderItem extends JSONObject {
	label: string;
	text: string;
	description?: string;
}

class BuilderItem implements IBuilderItem {
	[ prop: string ]: JSONObject | import("./Component").PrimitiveType | import("./Component").PrimitiveType[] | JSONObject[];
	label: string;
	text: string;
	description?: string;
	/**
	 * 
	 * @param maxIndex The upper bound (inclusive) for the @see IBuilderItem.index field
	 * @param param0 The starting values for the fields of @see IBuilderItem
	 * @param index 
	 * @returns An ordered array of elements compatible for usage with @see DialogForm.getRequestedInput
	 */
	static buildInput({label = "", text = "", description = ""}, index?: number | false, maxIndex?: number): JQuery<HTMLElement>[] {
		return [
			$('<label for="button-label">Label</label>'),
			$('<input id="button-label" name="button-label" required min=1 placeholder="The text that appears on the button." />').val(label || ""),
			$('<br />'),
			$('<label for="button-text">Text (whitespace matters)</label>'),
			$('<textarea id="button-text" name="button-text" required min=1 placeholder="The text that is entered into the message when the button is clicked."></textarea>').val(text || ""),
			$('<br />'),
			$('<label for="button-description">Description</label>'),
			$('<textarea id="button-description" name="button-description"></textarea>').val(description || ""),
			...(index || index === 0 ? [
				$('<br />'),
				...BuilderItem.buildIndexInput(index, maxIndex),
			] : [])
		];
	}
	static buildIndexInput(index?: number, maxIndex?: number): JQuery<HTMLElement>[] {
		return [
			$('<label for="button-index">Position in listing (First button is at index 0, etc.)</label>'),
			$(`<input type="number" id="button-index" name="button-index" min=0 ${maxIndex ? `max=${maxIndex} ` : ""}value=${index || 0}/>`),
		];
	}
	/**
	 * Parses the form generated by @see BuilderItem.buildInput into a @see IBuilderItem
	 * @param e The data returned by the form generated by @see BuilderItem.buildInput
	 * @returns The @see IBuilderItem specified by the given data.
	 */
	static parseInput(e: FormData, includeIndex = false): IBuilderItem {
		return {
			label: e.get("button-label").toString(),
			text: e.get("button-text").toString(),
			description: e.get("button-description").toString(),
			index: includeIndex ? Number(e.get("button-index")) : undefined,
		};
	}

	/**
	 * Parses the form generated by @see BuilderItem.buildInput into a @see IBuilderItem
	 * @param e The data returned by the form generated by @see BuilderItem.buildInput
	 * @returns The @see IBuilderItem specified by the given data.
	 */
	static parseInputSlim(e: FormData): IBuilderItem {
		return {
			label: e.get("button-label").toString(),
			text: e.get("button-text").toString(),
			description: e.get("button-description").toString(),
		};
	}

	static filterButtonMatch(collection: IBuilderItem[], {label, text, description}: {label: string, text: string, description?: string}) {
		return collection.filter((e) => e.name !== label || e.text !== text || e.description !== description);
	}

	static removeButtonAt(collection: IBuilderItem[], index: number): IBuilderItem[] {
		return collection.splice(index, 1);
	}

	static constructButtonUi(button: IBuilderItem, index?: number): JQuery<HTMLButtonElement> {
		return ((index || index === 0) ? $<HTMLButtonElement>("<button>").attr("data-index", index) : $<HTMLButtonElement>("<button>"))
				.attr({
					class: "response-button",
					name: button.label,
					text: button.text,
					title: button.description,
				})
				.text(button.label);
	}

	static retrieveButtonInfoFromUi(button: HTMLButtonElement): IBuilderItem {
		return {
			label: button.name,
			text: button.getAttribute("text"),
			description: button.title,
		};
	}
	static tryRetrieveAllButtonInfoFromUi(button: HTMLButtonElement): [IBuilderItem, number] | IBuilderItem {
		const o = this.retrieveButtonInfoFromUi(button), i = button.dataset["index"];
		return ((typeof(i) === "string" && i.length <= 0) || !i) ? o : [o, Number(i)];
	}
	static retrieveAllButtonInfoFromUi(button: HTMLButtonElement, failSilently = true): [IBuilderItem, number] {
		const i = button.dataset["index"];
		if (failSilently ||
			((typeof(i) === "string" && i.length > 0) ||
			(typeof(i) === "number" && Number.isFinite(i))))
			return [this.retrieveButtonInfoFromUi(button), Number(i)];
		throw new Error(`Index not found ("${i}" retrieved)`);
	}
}
