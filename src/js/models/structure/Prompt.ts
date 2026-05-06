import Modal from "./Modal";

export interface PromptOptions {
	title?: string;
	placeholder?: string;
	defaultValue?: string;
	confirmLabel?: string;
	cancelLabel?: string;
}

/**
 * A single-line text input dialog. Resolves the entered string on submit, null on cancel or close.
 */
export class Prompt extends Modal {

	private _promise: Promise<string | null>;
	public get promise(): Promise<string | null> { return this._promise; }

	constructor(message: string, opts: PromptOptions = {}) {
		super({
			title: opts.title ?? "Prompt",
			autoOpen: true,
			width: "auto",
			minHeight: 50,
		});

		const $body = Prompt.buildBody(message, opts);
		this.addContent($body);

		const $input = $body.find<HTMLInputElement>(".prompt__input");
		$input.trigger("focus");

		this._promise = new Promise((resolve) => {
			let closed = false;
			const done = (value: string | null) => {
				if (closed) return;
				closed = true;
				this.destroy();
				resolve(value);
			};
			$body.find("[data-prompt-action='cancel']").on("click", () => done(null));
			$body.on("submit", (event) => {
				event.preventDefault();
				done($input.val() as string);
			});
			this.getElement().on("dialogclose", () => done(null));
		});
	}

	private static buildBody(message: string, opts: PromptOptions): JQuery<HTMLElement> {
		const $root = $("<form>").addClass("prompt");
		$("<div>").addClass("prompt__message").text(message).appendTo($root);
		$("<input>")
			.addClass("prompt__input")
			.attr({ type: "text", placeholder: opts.placeholder ?? "" })
			.val(opts.defaultValue ?? "")
			.appendTo($root);

		const $buttons = $("<div>").addClass("prompt__buttons").appendTo($root);
		$("<button>")
			.attr({ type: "button", "data-prompt-action": "cancel" })
			.text(opts.cancelLabel ?? "Cancel")
			.appendTo($buttons);
		$("<button>")
			.attr({ type: "submit", "data-prompt-action": "confirm" })
			.text(opts.confirmLabel ?? "Submit")
			.appendTo($buttons);

		return $root;
	}

	public static ask(message: string, opts?: PromptOptions): Promise<string | null> {
		return new Prompt(message, opts).promise;
	}
}
