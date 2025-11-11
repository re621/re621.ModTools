import Modal from "./Modal";

/**
 * Creates a draggable window creating a form with the given elements that resolves a promise with the contents of the input elements in a `FormData` object on completion.
 */
export class DialogForm extends Modal {

	private elements: JQuery<HTMLElement>[];
	private _promise: Promise<FormData>; // Promise<string | number | string[] | FormData>;

    public get promise(): Promise<FormData> {
        return this._promise;
    }

    private $form: JQuery<HTMLFormElement>;

    constructor(elements: JQuery<HTMLElement>[], title = "DialogForm") {
        super({
            title: title,
            minHeight: 50,
        });

		this.elements = elements;
        this.createForm();
        this.addContent(this.$form);
        this.open();

        this._promise = new Promise((resolve) => {
            this.$form.on("formdata", (event) => {
				event.preventDefault();
				event.stopImmediatePropagation();
                this.destroy();
                resolve((event.originalEvent as FormDataEvent).formData);
            });
        });
    }

	public static getRequestedInput<T>(
		elements: JQuery<HTMLElement>[],
		title = "DialogForm",
		then?: { (e: FormData): T },
	): Promise<FormData | T> {
		return then
			? (new DialogForm(elements, title)).promise.then(then)
			: (new DialogForm(elements, title)).promise;
	}

    private createForm(): void {
        this.$form = $<HTMLFormElement>("<form>")
            .addClass("form-input re6-mod-tools");

		for (const element of this.elements) {
			this.$form.append(element);
		}

        $("<button>")
            .attr("type", "submit")
            .html("Submit")
            .appendTo(this.$form);
    }
}
