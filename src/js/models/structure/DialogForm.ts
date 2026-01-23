import Modal, { ModalConfig } from "./Modal";

type PromiseCallbacks<T, Err> = { then?: { (e: FormData): T }, onError?: { (e: unknown): Err }, onComplete?: { (): void } }
/**
 * Creates a draggable window creating a form with the given elements that resolves a promise with the contents of the input elements in a `FormData` object on completion.
 */
export class DialogForm extends Modal {

	private elements: JQuery<HTMLElement>[];
	private _promise: Promise<FormData>;

    public get promise(): Promise<FormData> {
        return this._promise;
    }

    private $form: JQuery<HTMLFormElement>;

	/** Normalizes parameters by converting a string parameter for the title to a @see DialogConfig compliant object/preserving the object. */
	private static _fixTitle(title: string | DialogConfig) { return (typeof(title) === "string") ? { title: title } : title;}
    constructor(elements: JQuery<HTMLElement>[], title?: string);
    constructor(elements: JQuery<HTMLElement>[], options?: DialogConfig);
    constructor(
		elements: JQuery<HTMLElement>[],
		options: string | DialogConfig = { title: "DialogForm" },
	) {
		options = DialogForm._fixTitle(options);
        super(Object.assign({
            title: "DialogForm",
            minHeight: 50,
        } as DialogConfig, options));

		this.elements = elements;
        this.createForm(options.defaultElements);
        this.addContent(this.$form);
        this.open();

        this._promise = new Promise((resolve, reject) => {
            this.$form.on("formdata", (event) => {
				event.preventDefault();
				event.stopImmediatePropagation();
                this.destroy();
                resolve((event.originalEvent as FormDataEvent).formData);
            });
			if ((options as DialogConfig).rejectOnClose) {
				this.getElement().on("dialogclose", (options as DialogConfig).onClose ?? ((event) => {
					event.preventDefault();
					event.stopImmediatePropagation();
					this.destroy();
					reject("Canceled");
				}));
			}
        });
    }

	public static getRequestedInput<T, Err>(
		elements: JQuery<HTMLElement>[],
		title: string | DialogConfig,
		then?: { (e: FormData): T },
		onError?: { (e: unknown): Err | T },
		onComplete?: { (): void },
	): Promise<FormData | T | Err>;
	public static getRequestedInput<T, Err>(
		elements: JQuery<HTMLElement>[],
		title: string | DialogConfig,
		callbacks?: PromiseCallbacks<T, Err>,
	): Promise<FormData | T | Err>;
	public static getRequestedInput<T, Err>(
		elements: JQuery<HTMLElement>[],
		title: string | DialogConfig,
		then?: { (e: FormData): T } | PromiseCallbacks<T, Err>,
		onError?: { (e: unknown): Err | T },
		onComplete?: { (): void },
	): Promise<FormData | T | Err> {
		let r: Promise<FormData | T | Err> = (new DialogForm(elements, DialogForm._fixTitle(title))).promise;
		if (!("call" in then)) ({then, onError, onComplete} = then);
		if (then) r = r.then(then);
		if (onError) r = r.catch(onError);
		if (onComplete) r = r.finally(onComplete);
		return r;
	}

	/**
	 * 
	 * @param defaultElements 
	 * @todo Make static?
	 */
    private createForm(defaultElements?: JQuery<HTMLElement>[]): void {
        this.$form = $<HTMLFormElement>("<form>")
            .addClass("form-input re6-mod-tools");

		for (const element of this.elements) {
			this.$form.append(element);
		}

        for (const element of defaultElements || [$("<button>")
            .attr("type", "submit")
            .html("Submit")]) {
			element.appendTo(this.$form);
		}
    }
}

interface DialogConfig extends ModalConfig {
	defaultElements?: JQuery<HTMLElement>[];
	// onClose?: JQueryUI.DialogEvent;
	onClose?: JQuery.TypeEventHandler<HTMLElement, undefined, HTMLElement, HTMLElement, "dialogclose">;
	/** Used to disable rejecting the promise when the form is closed with the dialog's `Close` button. */
	rejectOnClose?: boolean;
}
