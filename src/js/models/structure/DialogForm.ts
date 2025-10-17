import Modal from "./Modal";

/**
 * Creates a draggable window asking for user input
 */
export class DialogForm extends Modal {

    private _promise: Promise<string | number | string[] | FormData>;
	private elements: JQuery<HTMLElement>[];

    public get promise(): Promise<string | number | string[] | FormData> {
        return this._promise;
    }

    private $form: JQuery<HTMLFormElement>;

    constructor(title = "DialogForm", elements: JQuery<HTMLElement>[]) {
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

    private createForm(): void {
        this.$form = $<HTMLFormElement>("<form>")
            .addClass("form-input");

		for (const element of this.elements) {
			this.$form.append(element);
		}

        $("<button>")
            .attr("type", "submit")
            .html("Submit")
            .appendTo(this.$form);
    }
}
