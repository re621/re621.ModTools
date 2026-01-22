import { DialogForm } from "../models/structure/DialogForm";
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
 * A generic object that simplifies the process of creating a system like `TicketReasons` & `DMailBuilder`
 */
export abstract class IInputBuilder<T extends IInputBuilderData> {
	public constructor(readonly instance: T) {}
	/** Builds the actual HTML. */
	abstract buildUi(): JQuery<HTMLButtonElement>;
	abstract get editDialogTitle(): string;
	abstract get removeDialogTitle(): string;
	abstract get reorderDialogTitle(): string;
	get addDialogTitle(): string { return "Add Button..."; }
	/**
	 * Builds the actual HTML with the index.
	 * @param index The index of the element in the container.
	 */
	abstract buildFullUi(index?: number): JQuery<HTMLButtonElement>;
	abstract buildInput(): JQuery<HTMLElement>[];
	abstract buildFullInput(maxIndex?: number, index?: number): JQuery<HTMLElement>[];
	abstract buildIndexInput(maxIndex?: number, index?: number): JQuery<HTMLElement>[];
	/** Should really be static... */
	abstract buildEmptyInput(maxIndex?: number): JQuery<HTMLElement>[];
	abstract updateFromFormData(form: FormData, overwriteMissing?: boolean): T;
	// parseFormData(form: FormData, overwriteMissing?: boolean): T;
}

export interface IInputBuilderFull<T extends IInputBuilderIndexedData> extends IInputBuilder<T> {
	buildFullUI(): JQuery<HTMLButtonElement>;
	buildFullInput(maxIndex?: number): JQuery<HTMLElement>[];
	buildIndexInput(maxIndex?: number): JQuery<HTMLElement>[];
}

interface IInputBuilderData extends JSONObject {
	index?: number;
}
type EmptyIInputBuilderDataFactory<T extends IInputBuilderData> = () => T;
type IInputBuilderFactory<T extends IInputBuilderData, U extends IInputBuilder<T>> = (data: T) => U;

interface IInputBuilderIndexedData extends IInputBuilderData {
	index: number;
}
abstract class IComponentBuilder<T extends IInputBuilderData> extends Component {
	Settings: { enabled: boolean, buttons: T[] };
	defaultButtons: T[];
}
export abstract class InputBuilderComponent<T extends IInputBuilderData, U extends IInputBuilder<T>> {
	constructor(
		protected readonly parentObj: IComponentBuilder<T>,
		public readonly container: JQuery<HTMLElement>,
		protected readonly defaultDataFactory: EmptyIInputBuilderDataFactory<T>,
		protected readonly instanceFactory: IInputBuilderFactory<T, U>,
		protected readonly settingsLabel = "Builder Settings",
	) {}
	// #region States
	protected state = SelectionState.none;
	public get inRemovalState() { return this.state === SelectionState.remove; }
	public get inEditState() { return this.state === SelectionState.edit; }
	public get inReorderState() { return this.state === SelectionState.reorder; }

	protected onSettingsButton(_$element: JQuery<HTMLElement>)/* : void */ {
		DialogForm.getRequestedInput(
			[
				$(`<button type="submit" name="selectedAction" value="${SelectionState.none.index}">Add New Button...</button>`),
				$(`<button type="submit" name="selectedAction" value="${SelectionState.edit.index}">Edit Button...</button>`),
				$(`<button type="submit" name="selectedAction" value="${SelectionState.remove.index}">Remove Buttons...</button>`),
				$(`<button type="submit" name="selectedAction" value="${SelectionState.reorder.index}">Reorder Buttons...</button>`),
				$(`<button type="submit" name="selectedAction" value="reset">Reset Buttons...</button>`),
				$(`<button type="submit" name="selectedAction" value="-1">Cancel</button>`),
			],
			"DMail Builder Settings",
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
							case "reset":
								this.promptAndReset();
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
			// button.buildInput({}, false, this.parentObj.Settings.buttons.length),
			button.buildInput(),
			button.addDialogTitle,
			(e: FormData) => {
				const temp = [...this.parentObj.Settings.buttons];
				temp.push(button.updateFromFormData(e));
				this.parentObj.Settings.buttons = temp;
				this.buildButtons();
			},
		);
	}

	protected makeEditButtonDialog(index: number) {
		const button = this.instanceFactory(this.parentObj.Settings.buttons[index]);
		DialogForm.getRequestedInput(
			// BuilderItem.buildInput(button, false, this.parentObj.Settings.buttons.length - 1),
			button.buildInput(),
			button.editDialogTitle,
			(e: FormData) => {
				const temp = [...this.parentObj.Settings.buttons];
				temp[index] = button.updateFromFormData(e);
				this.parentObj.Settings.buttons = temp;
				this.buildButtons();
			},
		);
	}

	protected makeReorderButtonDialog(index: number) {
		const button = this.instanceFactory(this.parentObj.Settings.buttons[index]);
		DialogForm.getRequestedInput(
			button.buildIndexInput(this.parentObj.Settings.buttons.length - 1, index),
			button.reorderDialogTitle,
			(e: FormData) => {
				const newIndex = Number(e.get("button-index"));
				const temp = [...this.parentObj.Settings.buttons];
				if (newIndex === index) return;
				let d = temp.splice(newIndex, 0, button.updateFromFormData(e));
				console.assert(d.length === 0);
				d = temp.splice(index + (newIndex < index ? 1 : 0), 1);
				console.assert(d.length === 1);
				this.parentObj.Settings.buttons = temp;
				this.buildButtons();
			},
		);
	}
	// #endregion Make Dialogs
	

	protected buildButtons() {
		this.container.html("");

		for (let i = 0; i < this.parentObj.Settings.buttons.length; i++) {
			const button = this.parentObj.Settings.buttons[i];
			this
				.instanceFactory(button)
				.buildFullUi(button.index !== undefined ? button.index : i)
				.appendTo(this.container);
		}
	}

	/**
	 * Prompts for confirmation & resets to the default buttons if given.
	 * @param event 
	 */
	private promptAndReset() {
		if (confirm("Are you sure you want to reset the buttons to the defaults?\n\nThis will permanently remove your custom buttons.")) {
			this.parentObj.Settings.buttons = [...this.parentObj.defaultButtons];
			this.buildButtons();
		}
	}
}
