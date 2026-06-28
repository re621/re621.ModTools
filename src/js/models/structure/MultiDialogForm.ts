import { DialogConfig } from "./DialogForm";
import Modal, { ModalConfig } from "./Modal";

type PromiseCallbacks<T, Err> = { then?: { (e: FormData): T }, onError?: { (e: unknown): Err }, onComplete?: { (): void } }
/**
 * Creates a draggable window creating a form with the given elements that resolves a promise with the contents of the input elements in a `FormData` object on completion.
 */
export class MultiDialogForm extends Modal {
  private elements: JQuery<HTMLElement>[];
  private _promises: Promise<FormData>[];
  public get promises(): Promise<FormData>[] {
    return this._promises;
  }

  /** Normalizes parameters by converting a string parameter for the title to a @see DialogConfig compliant object/preserving the object. */
  private static _fixTitle(title: string | DialogConfig) { return (typeof(title) === "string") ? { title: title } : title;}
  constructor(params: Params[]) {
    params.forEach(e => e.optionsOrTitle = MultiDialogForm._fixTitle(e.optionsOrTitle ?? { title: "DialogForm" }));
    params.forEach(e => e.optionsOrTitle = Object.assign({
      title: "MultiDialogForm",
      minHeight: 50,
    } as DialogConfig, e.optionsOrTitle));
    const normalizedParams = params as { elements: JQuery<HTMLElement>[], optionsOrTitle: DialogConfig }[];
    /* super(Object.assign({
      title: "MultiDialogForm",
      minHeight: 50,
    } as DialogConfig, options)); */
     super({
      title: "MultiDialogForm",
      minHeight: 50,
    });

    this.elements = [];
    const forms = normalizedParams.map((e, i) => {
      const elementSet = [
        $(`<h3>${e.optionsOrTitle.title}</h3>`),
        ...e.elements,
        ...(e.optionsOrTitle.defaultElements ?? [$("<button>")
          .attr("type", "submit")
          .data("index", i)
          .html("Submit")]),
        $("<hr>"),
      ];
      const form = $<HTMLFormElement>("<form>")
        .addClass("form-input re6-mod-tools")
        .data("index", i);

      for (const element of elementSet) {
        form.append(element);
      }

      this.elements.push(...elementSet);
      this.addContent(form);
      return form;
    });
    this.open();

    this._promises = [];
    for (let i = 0; i < forms.length; i++) {
      const form = forms[i], params = normalizedParams[i];
      this._promises.push(
        new Promise((resolve, reject) => {
          form.on("formdata", (event) => {
            event.preventDefault();
            event.stopImmediatePropagation();
            this.destroy();
            resolve((event.originalEvent as FormDataEvent).formData);
          });
          if (params.optionsOrTitle.rejectOnClose) {
            this.getElement().on("dialogclose", params.optionsOrTitle.onClose ?? ((event) => {
              event.preventDefault();
              event.stopImmediatePropagation();
              this.destroy();
              reject("Canceled");
            }));
          }
        })
      );
    }
  }

  // public static getRequestedInput<T>(
  //   /* elements: JQuery<HTMLElement>[],
  //   title: string | DialogConfig, */
  //   params: Params[],
  //   then?: { (e: FormData): T }[],
  // ): Promise<FormData | T>[] {
  //   const r: Promise<any>[] = (new MultiDialogForm(params)).promises;
  //   for (let i = 0; i < r.length; i++) {
  //     const promise = r[i], t = then?.[i];
  //     if (t) r[i] = promise.then(t);
  //   }
  //   return r;
  // }
  public static getRequestedInput<T>(
    /* elements: JQuery<HTMLElement>[],
    title: string | DialogConfig, */
    params: (Params & { then?: (e: FormData) => T })[],
  ): Promise<any> {
    const r: Promise<any>[] = (new MultiDialogForm(params)).promises;
    for (let i = 0; i < r.length; i++) {
      const promise = r[i], t = params[i].then;
      if (t) r[i] = promise.then(t);
    }
    return Promise.race(r);
  }
}
interface Params {
  elements: JQuery<HTMLElement>[], optionsOrTitle?: string | DialogConfig
}
