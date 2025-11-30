import Modal, { ModalConfig } from "./Modal";

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

    constructor(elements: JQuery<HTMLElement>[], title?: string);
    constructor(elements: JQuery<HTMLElement>[], options?: DialogConfig);
    constructor(elements: JQuery<HTMLElement>[], options?: string|DialogConfig);
    constructor(elements: JQuery<HTMLElement>[], options: string|DialogConfig = {title: "DialogForm"}) {
		if (typeof(options) === "string") options = {title: options};
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
			this.$form.on("close", (event) => {
				event.preventDefault();
				event.stopImmediatePropagation();
                this.destroy();
                reject("Canceled");
			})
        });
    }

	public static getRequestedInput<T>(
		elements: JQuery<HTMLElement>[],
		title: string | DialogConfig = "DialogForm",
		then?: { (e: FormData): T },
	): Promise<FormData | T> {
		return then
			? (new DialogForm(elements, title)).promise.then(then)
			: (new DialogForm(elements, title)).promise;
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
}
