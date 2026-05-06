import Modal from "./Modal";

export interface ConfirmOptions {
	title?: string;
	confirmLabel?: string;
	cancelLabel?: string;
	/** Styles the confirm button as a destructive action. */
	danger?: boolean;
}

/**
 * A yes/no dialog. Resolves true on confirm, false on cancel or close.
 */
export class Confirm extends Modal {

	private _promise: Promise<boolean>;
	public get promise(): Promise<boolean> { return this._promise; }

	constructor(message: string, opts: ConfirmOptions = {}) {
		super({
			title: opts.title ?? "Confirm",
			autoOpen: true,
			width: "auto",
			minHeight: 50,
		});

		const $body = Confirm.buildBody(message, opts);
		this.addContent($body);

		this._promise = new Promise((resolve) => {
			let closed = false;
			const done = (value: boolean) => {
				if (closed) return;
				closed = true;
				this.destroy();
				resolve(value);
			};
			$body.find("[data-confirm-action='cancel']").on("click", () => done(false));
			$body.find("[data-confirm-action='confirm']").on("click", () => done(true));
			this.getElement().on("dialogclose", () => done(false));
		});
	}

	private static buildBody(message: string, opts: ConfirmOptions): JQuery<HTMLElement> {
		const $root = $("<div>").addClass("confirm");
		$("<div>").addClass("confirm__message").text(message).appendTo($root);

		const $buttons = $("<div>").addClass("confirm__buttons").appendTo($root);
		$("<button>")
			.attr({ type: "button", "data-confirm-action": "cancel" })
			.text(opts.cancelLabel ?? "Cancel")
			.appendTo($buttons);
		const $confirm = $("<button>")
			.attr({ type: "button", "data-confirm-action": "confirm" })
			.text(opts.confirmLabel ?? "OK");
		if (opts.danger) $confirm.addClass("confirm__danger");
		$confirm.appendTo($buttons);

		return $root;
	}

	public static ask(message: string, opts?: ConfirmOptions): Promise<boolean> {
		return new Confirm(message, opts).promise;
	}
}
