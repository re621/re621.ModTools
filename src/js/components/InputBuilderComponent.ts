/** @module InputBuilderComponent Simplifies the process of creating a system like `TicketReasons` & `DMailBuilder`. */

import Debug from "../models/Debug";
import { DialogForm } from "../models/structure/DialogForm";
import { UtilDOM } from "../utilities/UtilDOM";
import Component, { JSONObject, Settings } from "./Component";

/**
 * A pseudo-enum used to determine what special action is performed when selecting a button.
 * 
 * @todo Make sister enum for selectable actions in the settings popup.
 */
export class SelectionState {
	private constructor(public readonly index: number, public readonly label: string) {}
	/** Index: 0 */
	public static readonly none = new SelectionState(0, "none");
	/** Index: 1 */
	public static readonly edit = new SelectionState(1, "edit");
	/** Index: 2 */
	public static readonly remove = new SelectionState(2, "remove");
	/** Index: 3 */
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

// #region Data Interfaces
export interface IInputBuilderData extends JSONObject {
	index?: number;
}
export interface IInputBuilderIndexedData extends IInputBuilderData {
	index: number;
}
// #endregion Data Interfaces
type IInputBuilderSettings = {
	/** The title for the button editing dialog. */
	get editDialogTitle(): string;
	/** The title for the button removal dialog. */
	get removeDialogTitle(): string;
	/** The title for the button editing dialog. */
	get reorderDialogTitle(): string;
	/** The title for the button creation dialog. */
	get addDialogTitle(): string;
}
const defaultInputBuilderSettings: IInputBuilderSettings = Object.freeze({
	editDialogTitle: "Edit Button...",
	removeDialogTitle: "Remove Button...",
	reorderDialogTitle: "Reorder Button...",
	addDialogTitle: "Add Button...",
});
export abstract class IInputBuilder<T extends IInputBuilderData> {
	public constructor(readonly instance: T) {}

	// #region Dialog Titles
	/**
	 * The info for dialog titles.
	 * 
	 * NOTE: Should really be static, just here to force an implementation.
	 */
	get dialogTitleSettings(): IInputBuilderSettings { return defaultInputBuilderSettings; }

	// /**
	//  * The title for the button editing dialog.
	//  * 
	//  * NOTE: Should really be static, just here to force an implementation.
	//  */
	// abstract get editDialogTitle(): string;

	// /**
	//  * The title for the button removal dialog.
	//  * 
	//  * NOTE: Should really be static, just here to force an implementation.
	//  */
	// abstract get removeDialogTitle(): string;

	// /**
	//  * The title for the button editing dialog.
	//  * 
	//  * NOTE: Should really be static, just here to force an implementation.
	//  */
	// abstract get reorderDialogTitle(): string;

	// /**
	//  * The title for the button creation dialog.
	//  * 
	//  * NOTE: Should really be static, just here to force an implementation.
	//  */
	// get addDialogTitle(): string { return "Add Button..."; }
	// #endregion Dialog Titles

	/** Builds the actual HTML button. */
	abstract buildUi(): JQuery<HTMLButtonElement>;

	/**
	 * Builds the actual HTML button with the index.
	 * @param index The index of the element in the container.
	 */
	abstract buildFullUi(index?: number): JQuery<HTMLButtonElement>;

	/** Builds the UI fields for entering the element's data. */
	abstract buildInput(): JQuery<HTMLElement>[];

	/**
	 * Builds all the UI fields for entering the element's data, complete with index field.
	 * @param maxIndex The highest value that can be accepted by `index`.
	 * @param index The current value of index (if unused by `T`).
	 */
	abstract buildFullInput(maxIndex?: number, index?: number): JQuery<HTMLElement>[];

	/**
	 * Builds just the UI fields for entering the element's index.
	 * @param maxIndex The highest value that can be accepted by `index`.
	 * @param index The current value of index (if unused by `T`).
	 */
	abstract buildIndexInput(maxIndex?: number, index?: number): JQuery<HTMLElement>[];

	/**
	 * NOTE: Should really be static, just here to force an implementation.
	 * @param maxIndex The highest value that can be accepted by `index`.
	 */
	abstract buildEmptyInput(maxIndex?: number): JQuery<HTMLElement>[];

	/**
	 * NOTE: Should really be static, just here to force an implementation.
	 * @param maxIndex The highest value that can be accepted by `index`.
	 */
	abstract buildFullEmptyInput(maxIndex?: number): JQuery<HTMLElement>[];

	/**
	 * Updates this instance with the data from the form.
	 * @param form The data to update.
	 * @param overwriteMissing Should missing/unassigned values in `form` overwrite their corresponding values in the object(?)
	 * @returns The updated raw data object.
	 */
	abstract updateFromFormData(form: FormData, overwriteMissing?: boolean): T;
	// parseFormData(form: FormData, overwriteMissing?: boolean): T;

	abstract isEqualTo(other: T): boolean;
}

export abstract class IInputBuilderFull<T extends IInputBuilderIndexedData> extends IInputBuilder<T> {
	abstract buildFullUI(): JQuery<HTMLButtonElement>;
	abstract buildFullInput(maxIndex?: number): JQuery<HTMLElement>[];
	abstract buildIndexInput(maxIndex?: number): JQuery<HTMLElement>[];
}

// #region Component
/** Just for typing */
interface IComponentBuilderSettings<T extends IInputBuilderData> extends Settings { buttons: T[] }

/**
 * The `Component` that defers the builder management to `InputBuilderComponent`.
 * 
 * Generic is the plain data object.
 */
export interface IComponentBuilder<T extends IInputBuilderData> extends Component {
	get defaultButtons(): T[];

	Settings: IComponentBuilderSettings<T>;
}

export type EmptyIInputBuilderDataFactory<T extends IInputBuilderData> = () => T;
export type IInputBuilderFactory<T extends IInputBuilderData, U extends IInputBuilder<T>> = (data: T) => U;

/** 
 * Simplifies the process of creating a system like `TicketReasons` & `DMailBuilder`.
 * 
 * @todo Add template support
 * @todo Allow reordering while editing.
 */
export abstract class InputBuilderComponent<T extends IInputBuilderData, U extends IInputBuilder<T>> {
	public static readonly defaultStyle = `
		.re6-mod-tools-button-container {
			display: flex;
			flex-wrap: wrap;
		}
		.re6-mod-tools-button-container > button {
			margin: 0px .25rem;
			flex: none;
		}
	`;
	protected readonly settingsButton: JQuery<HTMLElement>;
	public readonly buttonsChangedEvent: VoidFunction[] = [];

	/** Shorthand for `this.parentObj.Settings.buttons`. */
	protected get buttons(): T[] { return this.parentObj.Settings.buttons; }

	/**
	 * 
	 * @param cb The callback to wrap the access & assignment operations in.
	 * @param param1 
	 * @param {boolean} [param1.giveCopied=true] Send a shallow copy of the array to the callback?
	 * @param {boolean} [param1.rerenderButtons=true] Call @see InputBuilderComponent.buildButtons after?
	 * @param {boolean} [param1.fireEvent=true] Execute @see InputBuilderComponent.buttonsChangedEvent callbacks after?
	 */
	protected modifyButtons(cb: { (buttons: T[]): T[] }, param1: { giveCopied?: boolean, rerenderButtons?: boolean, fireEvent?: boolean } = { giveCopied: true, rerenderButtons: true, fireEvent: true }) {
		const { giveCopied, rerenderButtons, fireEvent } = param1;
		this.parentObj.Settings.buttons = cb(giveCopied ? [...this.parentObj.Settings.buttons] : this.parentObj.Settings.buttons);
		if (rerenderButtons) this.buildButtons();
		if (fireEvent) this.buttonsChangedEvent.forEach(e => e());
	}

	/**
	 * 
	 * @param parentObj The actual @see Component . Solely used for accessing & assigning to @see Component.Settings
	 * @param container The element that contains the input buttons.
	 * @param input The main text entry box.
	 * @param defaultDataFactory Function that creates the default new, empty button instance.
	 * @param instanceFactory Function that instantiates a new `U` instance from a `T` instance. Required to construct generics.
	 * @param settingsLabel The label for the settings button.
	 * @param settingsId The id for the settings button.
	 */
	constructor(
		protected readonly parentObj: IComponentBuilder<T>,
		public readonly container: JQuery<HTMLDivElement>,
		public readonly input: JQuery<HTMLTextAreaElement>,
		protected readonly defaultDataFactory: EmptyIInputBuilderDataFactory<T>,
		protected readonly instanceFactory: IInputBuilderFactory<T, U>,
		protected readonly settingsLabel = "Builder Settings",
		protected readonly settingsId = settingsLabel.toLowerCase().replace(/(\s+)|[^-a-z]+/g, (_, g1) => g1 ? "-" : ""),
		public readonly style = InputBuilderComponent.defaultStyle,
	) {
		UtilDOM.addStyle(style);
		this.settingsButton = UtilDOM.addSettingsButton({
			id: settingsId,
			name: settingsLabel,
			onClick: e => this.onSettingsButton(e),
		}, true);
		if (input.length < 1) {
			Debug.log("No input selected; canceling proper initialization.");
			return;
		}
		container.on("click", "button", (e) => this.onResponseClick(e));
		this.buildButtons();
	}

	// #region States
	protected state = SelectionState.none;
	public get inRemovalState() { return this.state === SelectionState.remove; }
	public get inEditState() { return this.state === SelectionState.edit; }
	public get inReorderState() { return this.state === SelectionState.reorder; }

	/**
	 * The callback to execute when the settings button is pressed.
	 * 
	 * NOTE: Dependent on proper `this` binding.
	 * @param _$element The settings button.
	 * @returns false to stop propagation & prevent default.
	 */
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	protected onSettingsButton(_$element: JQuery<HTMLElement> = this.settingsButton): false {
		DialogForm.getRequestedInput(
			[
				$(`<button type="submit" name="selectedAction" value="${SelectionState.none.index}">Add New Button...</button>`),
				$(`<button type="submit" name="selectedAction" value="${SelectionState.edit.index}">Edit Button...</button>`),
				$(`<button type="submit" name="selectedAction" value="${SelectionState.remove.index}">Remove Buttons...</button>`),
				$(`<button type="submit" name="selectedAction" value="${SelectionState.reorder.index}">Reorder Buttons...</button>`),
				$(`<button type="submit" name="selectedAction" value="resetButtons">Reset Buttons</button>`),
				$(`<button type="submit" name="selectedAction" value="exportButtons">Export Buttons</button>`),
				$(`<button type="submit" name="selectedAction" value="importButtons">Import Buttons</button>`),
				$(`<button type="submit" name="selectedAction" value="-1">Cancel</button>`),
			],
			this.settingsLabel,
			(e: FormData) => {
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
							case "importButtons":
								this.makeImportButtonDialog();
								break;
							case "exportButtons":
								this.makeExportDialog();
								break;
						
							default:
								break;
						}
						break;
				}
			},
		);

		// Stop propagation & prevent default.
		return false;
	}

	private cancelButton?: JQuery<HTMLButtonElement>;
	protected selectButtonMode(mode: SelectionState) {
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

	// #region Make Dialogs
	protected makeAddButtonDialog() {
		const button = this.instanceFactory(this.defaultDataFactory());
		DialogForm.getRequestedInput(
			button.buildInput(),
			button.dialogTitleSettings.addDialogTitle,
			(e: FormData) => {
				this.modifyButtons(temp => {
					temp.push(button.updateFromFormData(e));
					return temp;
				});
			},
		);
	}

	protected makeEditButtonDialog(index: number) {
		const button = this.instanceFactory(this.buttons[index]);
		DialogForm.getRequestedInput(
			button.buildInput(),
			button.dialogTitleSettings.editDialogTitle,
			(e: FormData) => {
				this.modifyButtons(temp => {
					temp[index] = button.updateFromFormData(e);
					return temp;
				});
			},
		);
	}

	protected makeReorderButtonDialog(index: number) {
		const button = this.instanceFactory(this.buttons[index]);
		DialogForm.getRequestedInput(
			button.buildIndexInput(this.buttons.length - 1, index),
			button.dialogTitleSettings.reorderDialogTitle,
			(e: FormData) => {
				const newIndex = Number(e.get("button-index"));
				if (newIndex === index) return;
				this.modifyButtons(temp => {
					/* temp.splice(newIndex, 0, button.updateFromFormData(e));
					temp.splice(index + (newIndex < index ? 1 : 0), 1);
					return temp; */
					temp[index] = button.updateFromFormData(e);
					return InputBuilderComponent.changeElementPosition(temp, index, newIndex);
				});
			},
		);
	}

	private makeImportButtonDialog() {
		DialogForm.getRequestedInput(
			[
				$('<label for="json-string">Buttons to import (in form provided by exporter):</label>'),
				$('<textarea id="json-string" name="json-string" required min=1></textarea>'),
			],
			"Import Buttons...",
			(e: FormData) => this.promptAndImport(e.get("json-string").toString()),
		);
	}

	private makeExportDialog() {
		alert(`The following is the string representation of your buttons; this can be used to import them.\n\n${JSON.stringify(this.buttons, undefined, 4)}`);
	}
	// #endregion Make Dialogs

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
				Debug.log("InputBuilderComponent: Invalid State!?!?");
			// eslint-disable-next-line no-fallthrough
			case SelectionState.none: {
				/** @todo Template variables */
				const priorLength = this.input.val()?.toString()?.length || 0,
					textLength = button.attr("text").length;
				this.input.val(`${this.input.val()}${button.attr("text")}`);
				// If the user can't hover, then auto-select the added text so they can easily delete it.
				/** @todo Make this a setting you can toggle on desktop. */
				if (!matchMedia("(hover: hover)").matches) {
					this.input[0].setSelectionRange(priorLength, priorLength + textLength, "forward");
				}
				this.input[0].focus();
				break;
			}
		}

		event.stopImmediatePropagation();
		event.preventDefault();
		// Stop propagation & prevent default.
		return false;
	}

	/**
	 * Prompts for confirmation & resets to the default buttons if given.
	 * @param event 
	 */
	private promptAndReset() {
		if (confirm("Are you sure you want to reset the buttons to the defaults?\n\nThis will permanently remove your custom buttons.")) {
			this.modifyButtons(buttons => buttons);
		}
	}


	/**
	 * Prompts for confirmation & removes the button if given.
	 * @param event 
	 */
	protected promptAndRemove(event: JQuery.ClickEvent<HTMLElement, undefined, any, HTMLButtonElement>) {
		const [button, index] = GenericItem.retrieveAllButtonInfoFromUi(event.target);
		if (confirm(`Are you sure you want to delete this button?\n\n\tLabel: ${button.label}\n\tDescription: ${button.description}\n\tText: "${button.text}"`)) {
			this.modifyButtons(temp => {
				temp.splice(index, 1);
				return temp;
			});
		}
	}

	/**
	 * Deserializes the given buttons & prompts the user to add the given buttons to the collection, filtering pre-existing buttons.
	 * 
	 * @todo Filter duplicates within the input itself.
	 */
	private promptAndImport(jsonString: string) {
		const t = [...this.buttons],
			buttons: T[] = (JSON.parse(jsonString) as T[]).filter(e => !t.find(e2 => this.instanceFactory(e).isEqualTo(e2)));
		if (confirm(`Add the following buttons?\n\n${buttons.map((e) => `Label: ${e.label}\nDescription: ${e.description}, Text: ${e.text}`).join("\n")}`)) {
			this.parentObj.Settings.buttons = t.concat(buttons);
			this.buildButtons();
		}
	}

	// #region Minor Utility Functions
	/** Empties the `container` & fills it with the full UI for `parentObj.Settings.buttons`. */
	protected buildButtons() {
		this.container.html("");

		for (let i = 0; i < this.buttons.length; i++) {
			const button = this.buttons[i];
			this
				.instanceFactory(button)
				.buildFullUi(button.index !== undefined ? button.index : i)
				.appendTo(this.container);
		}
	}

	public static changeElementPosition<A>(array: A[], oldIndex: number, newIndex: number) {
		array.splice(newIndex, 0, array[oldIndex]);
		array.splice(oldIndex + (newIndex < oldIndex ? 1 : 0), 1);
		return array;
	}
	// #endregion Minor Utility Functions
}
// #endregion Component

// #region Generic Button Impl.
export interface GenericItemData extends IInputBuilderData { // JSONObject {
	label: string;
	text: string;
	description?: string;
}

export class GenericItem extends IInputBuilder<GenericItemData> /* implements IBuilderItem */ {
	public static instanceFactory(instance: GenericItemData): GenericItem { return new GenericItem(instance); }
	public static defaultEmptyInstance(): GenericItemData { return { name: "", label: "", text: "" }; }
	isEqualTo(other: GenericItemData): boolean {
		return GenericItem.doMatch(this.instance, other);
	}
	get label(): string { return this.instance.label; }
	get text(): string { return this.instance.text; }
	get description(): string | undefined { return this.instance.description; }
	// get index(): number | undefined { return this.instance.index; }
	buildUi(): JQuery<HTMLButtonElement> {
		return GenericItem.buildUi(this.instance, this.instance.index);
	}
	buildFullUi(index: number = this.instance.index): JQuery<HTMLButtonElement> {
		return GenericItem.buildUi(this.instance, index);
	}
	buildInput(): JQuery<HTMLElement>[] {
		return GenericItem.buildInput(this.instance, false);
	}
	buildFullInput(maxIndex?: number, index: number = this.instance.index): JQuery<HTMLElement>[] {
		return GenericItem.buildInput(this.instance, index, maxIndex);
	}
	buildIndexInput(maxIndex?: number, index: number = this.instance.index): JQuery<HTMLElement>[] {
		// isFinite(index) ? index : this.instance.index
		return GenericItem.buildIndexInput(index, maxIndex);
	}
	buildEmptyInput(maxIndex?: number): JQuery<HTMLElement>[] {
		return GenericItem.buildInput({}, false, maxIndex);
		// throw new Error("Method not implemented.");
	}
	buildFullEmptyInput(maxIndex?: number): JQuery<HTMLElement>[] {
		return GenericItem.buildInput({}, false, maxIndex);
		// throw new Error("Method not implemented.");
	}
	updateFromFormData(form: FormData, overwriteMissing?: boolean): GenericItemData {
		const parsed = GenericItem.parseInput(form, true);
		if (overwriteMissing || parsed.label?.length > 0) this.instance.label = parsed.description;
		if (overwriteMissing || parsed.text?.length > 0) this.instance.text = parsed.description;
		if (overwriteMissing || parsed.description?.length > 0) this.instance.description = parsed.description;
		if (overwriteMissing || !Number.isNaN(parsed.index)) this.instance.index = parsed.index;
		return { ...this.instance };
	}
	// [ prop: string ]: JSONObject | import("./Component").PrimitiveType | import("./Component").PrimitiveType[] | JSONObject[];
	// label: string;
	// text: string;
	// description?: string;
	/**
	 * 
	 * @param maxIndex The upper bound (inclusive) for the @see GenericItemData.index field
	 * @param param0 The starting values for the fields of @see GenericItemData
	 * @param index 
	 * @returns An ordered array of elements compatible for usage with @see DialogForm.getRequestedInput
	 */
	static buildInput({label = "", text = "", description = undefined}: {label?: string, text?: string, description?: string} | undefined, index?: number | false, maxIndex?: number): JQuery<HTMLElement>[] {
		return [
			$('<label for="button-label">Label</label>'),
			$('<input id="button-label" name="button-label" required min=1 placeholder="The text that appears on the button." />').val(label || ""),
			$('<br />'),
			$('<label for="button-text">Text (whitespace matters)</label>'),
			$('<textarea id="button-text" name="button-text" required min=1 placeholder="The text that is entered into the message when the button is clicked."></textarea>').val(text || ""),
			$('<br />'),
			$('<label for="button-description">Description (Shown on hover)</label>'),
			$(`<textarea id="button-description" name="button-description"${text ? ` placeholder='"${text}"'` : ""}></textarea>`).val(description || ""),
			...(index || index === 0 ? [
				$('<br />'),
				...GenericItem.buildIndexInput(index, maxIndex),
			] : [])
		];
	}
	static addReactiveDescriptionPlaceholder(builtInput: JQuery<HTMLElement>[]) {
		const text = builtInput[4], desc = builtInput[7];
		if (text[0] instanceof HTMLTextAreaElement && desc[0] instanceof HTMLTextAreaElement)
			text[0].addEventListener(
				"change",
				(e: InputEvent) => desc.attr("placeholder", `"${(e.target as HTMLTextAreaElement).value}"`),
			);
		console.assert(
			text[0] instanceof HTMLTextAreaElement && desc[0] instanceof HTMLTextAreaElement,
			"Didn't make description placeholder reactive, not textarea elements.",
		);
		return builtInput;
	}
	static buildIndexInput(index?: number, maxIndex?: number): JQuery<HTMLElement>[] {
		return [
			$('<label for="button-index">Position in listing (First button is at index 0, etc.)</label>'),
			$(`<input type="number" id="button-index" name="button-index" min=0 ${maxIndex ? `max=${maxIndex} ` : ""}value=${index || 0}/>`),
		];
	}
	/**
	 * Parses the form generated by @see GenericItem.buildInput into a @see GenericItemData
	 * @param e The data returned by the form generated by @see GenericItem.buildInput
	 * @returns The @see GenericItemData specified by the given data.
	 */
	static parseInput(e: FormData, includeIndex = false): GenericItemData {
		return {
			label: e.get("button-label").toString(),
			text: e.get("button-text").toString(),
			description: e.get("button-description").toString(),
			index: includeIndex ? Number(e.get("button-index")) : undefined,
		};
	}

	/**
	 * Parses the form generated by @see GenericItem.buildInput into a @see GenericItemData
	 * @param e The data returned by the form generated by @see GenericItem.buildInput
	 * @returns The @see GenericItemData specified by the given data.
	 */
	static parseInputSlim(e: FormData): GenericItemData {
		return {
			label: e.get("button-label").toString(),
			text: e.get("button-text").toString(),
			description: e.get("button-description").toString(),
		};
	}

	/**
	 * Removes the given `IBuilderItem` from the given array.
	 * @param collection 
	 * @param param1 The `IBuilderItem` fields to filter on
	 * @returns The given `collection` with all elements matching all of the given properties removed.
	 */
	static filterButtonMatch(collection: GenericItemData[], {label, text, description}: GenericItemData) {
		return collection.filter((e) => !GenericItem.doMatch(e, {label, text, description}));
	}

	/**
	 * Checks if 2 `IBuilderItem`s are the same.
	 * @param button1 
	 * @param button2 
	 * @returns True if the 2 represent the same item, false otherwise.
	 */
	static doMatch(button1: GenericItemData, button2: GenericItemData) {
		return button1.label === button2.label && button1.text === button2.text && button1.description === button2.description;
	}

	static buildUi(button: GenericItemData, index?: number, options?: {classes?: string[]}): JQuery<HTMLButtonElement> {
		return (
			(typeof index === "number") ?
				$<HTMLButtonElement>("<button>").attr("data-index", index) :
				(typeof button.index === "number") ?
					$<HTMLButtonElement>("<button>").attr("data-index", button.index) :
					$<HTMLButtonElement>("<button>"))
				.attr({
					class: `re6-mod-tools-input-builder-button ${options?.classes?.length ? ` ${options.classes.join(" ")}`: ""}`,
					name: button.label,
					text: button.text,
					title: button.description || `"${button.text}"`,
					"data-description": button.description,
				})
				.text(button.label);
	}

	// #region HTMLButtonElement -> IBuilderItem
	static retrieveButtonInfoFromUi(button: HTMLButtonElement): GenericItemData {
		return {
			label: button.name,
			text: button.getAttribute("text"),
			description: button.dataset.description,
			// index: button.dataset.index,
		};
	}
	static tryRetrieveAllButtonInfoFromUi(button: HTMLButtonElement): [GenericItemData, number] | GenericItemData {
		const o = this.retrieveButtonInfoFromUi(button), i = button.dataset.index;
		return ((typeof(i) === "string" && i.length <= 0) || !i) ? o : [o, Number(i)];
	}
	static retrieveAllButtonInfoFromUi(button: HTMLButtonElement, failSilently = true): [GenericItemData, number] {
		const i = button.dataset["index"];
		if (failSilently ||
			((typeof(i) === "string" && i.length > 0) ||
			(typeof(i) === "number" && Number.isFinite(i))))
			return [this.retrieveButtonInfoFromUi(button), Number(i)];
		throw new Error(`Index not found ("${i}" retrieved)`);
	}
	// #endregion HTMLButtonElement -> IBuilderItem
}

export class GenericBuilderComponent extends InputBuilderComponent<GenericItemData, GenericItem> {}
// #endregion Generic Button Impl.

