import { html } from "./HtmlTemplate";
import Util from "./Util";

/** @todo Unit test */
export default class HtmlBuilder {
  public static valueLabelNormalizer(value: string | readonly [string, string] | Readonly<{ label?: string, value: string }>, label?: string) {
    if (typeof value === "string") {
      return { value: value, label: label || Util.camelToTitle(value) };
    } else if (value instanceof Array) {
      return { value: value[0], label: value[1] || label || Util.camelToTitle(value[0]) };
    } else {
      // value.label ||= label || Util.camelToTitle(value.value);
      // return value as { value: string, label: string };
      return { value: value.value, label: value.label || label || Util.camelToTitle(value.value) };
    }
  }
  // #region HTML Elements
  // #region Attribute helpers
  private static serializeDataset(data: Record<string | number | symbol, unknown>, prefixWith = "data-", preserveNull = false) {
    const r: string[] = [];
    for (const [key, value] of Object.entries(data)) {
      const p = `${prefixWith}${key}`;
      switch (typeof value) {
        case "object":
          if (!value) {
            if (preserveNull) r.push(`${p}="null"`);
            break;
          }
          // IDEA: Handle arrays differently?
          r.push(...this.serializeDataset(value as Record<string | number | symbol, unknown>, `${p}-`));
          break;
      
        case "undefined":
        case "function":
          break;
        case "string":
          // TODO: Escape HTML?
          r.push(`${p}="${value}"`);
          break;
        case "bigint":
        case "boolean":
        case "number":
        case "symbol":
          // IDEA: Better handle bigint?
          r.push(`${p}="${value.toString()}"`);
          break;
      }
    }
    return r;
  }
  private static buildBaseParams<T extends BaseHtmlParams>(obj: Partial<T>) {
    return [
      obj.id ? ` id="${obj.id}"` : "",
      obj.className ? ` class="${obj.className}"` : "",
      obj.title ? ` title="${obj.title}"` : "",
      // obj.data ? (" " + Object.entries(obj.data).reduce((p, e) => p + ` data-${e[0]}="${e[1]}"`, "")) : "",
      obj.data ? this.serializeDataset(obj.data, ` data-`).join() : "",
    ].reduce((p, e) => p + e, "");
  }
  private static buildBaseInputParams<T extends BaseInputParams>(obj: Partial<T>, recurse = false) {
    const { disabled, form, name, type, ...remainder } = obj;
    return [
      recurse ? this.buildBaseParams(remainder) : "",
      type ? ` type="${type}"` : "",
      name ? ` name="${name}"` : "",
      form ? ` form="${form}"` : "",
      disabled ? " disabled" : "",
    ].reduce((p, e) => p + e, "");
  }
  private static buildCommonInputParams<T extends CommonInputParams>(obj: Partial<T>, recurse = false) {
    const {
      autocapitalize,
      autocomplete,
      list,
      readonly,
      required,
      value,
      ...remainder
    } = obj;
    return [
      recurse ? this.buildBaseInputParams(remainder) : "",
      autocapitalize ? ` autocapitalize="${autocapitalize}"` : "",
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      autocomplete ? ` autocomplete="${autocomplete instanceof Array ? autocomplete.map(e => e.replace(/\s/g, "-")).join(" ") : autocomplete}"` : "",
      list ? ` list="${list}"` : "",
      value ? ` value="${value}"` : "",
      readonly ? " readonly" : "",
      required ? " required" : "",
    ].reduce((p, e) => p + e, "");
  }
  private static buildNumericInputParams<T extends NumericInputParams>(obj: Partial<T>) {
    const {
      max,
      min,
      step,
    } = obj;
    return [
      max ? ` max="${max}"` : "",
      min ? ` min="${min}"` : "",
      step ? ` step="${step}"` : "",
    ].reduce((p, e) => p + e, "");
  }
  private static buildTextualInputParams<T extends TextualInputParams>(obj: Partial<T>) {
    const {
      dirname,
      maxlength,
      minlength,
      pattern,
      placeholder,
      size,
    } = obj;
    return [
      (dirname !== undefined) ? ` dirname="${dirname}"` : "",
      (maxlength !== undefined) ? ` maxlength="${maxlength}"` : "",
      (minlength !== undefined) ? ` minlength="${minlength}"` : "",
      (pattern !== undefined) ? ` pattern="${pattern}"` : "",
      (placeholder !== undefined) ? ` placeholder="${placeholder}"` : "",
      (size !== undefined) ? ` size="${size}"` : "",
    ].reduce<string>((p, e) => p + e, "");
  }
  private static assignExplicitParameter<T extends Readonly<Record<string, unknown>>, K extends keyof T>(o: T, key: K, value: T[K]) {
    const r = {...o};
    r[key] = value;
    return r;
  }
  // #endregion Attribute helpers
  public static inputCheckboxBuilder(obj: Readonly<Partial<InputCheckboxParams>> = {}): HTMLInputElement {
    obj = this.assignExplicitParameter(obj, "type", "checkbox");
    return html`<input
      ${this.buildBaseInputParams(obj)}
      ${this.buildBaseParams(obj)}
      ${obj.checked ? "checked" : ""}
    />`;
  }
  public static inputNumberBuilder(obj: Readonly<Partial<InputNumberParams>> = {}): HTMLInputElement {
    obj = this.assignExplicitParameter(obj, "type", "number");
    return html`<input
      ${this.buildBaseParams(obj)}
      ${this.buildBaseInputParams(obj)}
      ${this.buildCommonInputParams(obj)}
      ${this.buildNumericInputParams(obj)}
      ${obj.placeholder ? ` placeholder="${obj.placeholder}"` : ""}
    />`;
  }
  public static inputTextBuilder(obj: Readonly<Partial<InputTextParams>> = {}): HTMLInputElement {
    obj = this.assignExplicitParameter(obj, "type", "text");
    return html`<input
      ${this.buildBaseParams(obj)}
      ${this.buildBaseInputParams(obj)}
      ${this.buildCommonInputParams(obj)}
      ${this.buildTextualInputParams(obj)}
    />`;
  }
  public static labelBuilder(obj: Partial<LabelParam>): HTMLLabelElement {
    return html`<label
      ${this.buildBaseParams(obj)}
      ${obj.forElement ? ` for="${obj.forElement}"` : ""}
    >${obj.innerHtml ?? ""}</label>`;
  }

  public static optionBuilder(obj: Partial<OptionParam>): HTMLOptionElement {
    return html`<option
      ${this.buildBaseParams(obj)}
      ${obj.value ? ` value="${obj.value}"` : ""}
      ${obj.label ? ` label="${obj.label}"` : ""}
      ${obj.selected ? " selected" : ""}
      ${obj.disabled ? " disabled" : ""}
    >${obj.innerHtml ?? ""}</option>`;
  }
  public static selectBuilder(obj: Partial<SelectParam>): HTMLSelectElement {
    return html`<select
        ${this.buildBaseParams(obj)}
        ${obj.name ? `name="${obj.name}"` : ""}
        ${obj.autocomplete ? `autocomplete="${obj.autocomplete}"` : ""}
        ${obj.autofocus ? "autofocus" : ""}
        ${obj.form ? `form="${obj.form}"` : ""}
        ${obj.multiple ? "multiple" : ""}
        ${(obj.size !== undefined) ? `size="${obj.size}"` : ""}
        ${obj.required ? "required" : ""}
        ${obj.disabled ? "disabled" : ""}
      >${obj.innerHtml ?? ""}</select>`;
  }
  public static button<Cmd extends string = "">(obj: Partial<ButtonAttributes<Cmd>>): HTMLButtonElement {
    return html`<button
        ${this.buildBaseParams(obj)}
        ${this.buildBaseInputParams(obj)}
        ${this.buildCommonInputParams(obj)}
        ${obj.autofocus ? "autofocus" : ""}
        ${obj.formaction ? `formaction="${obj.formaction}"` : ""}
        ${obj.formenctype ? `formenctype="${obj.formenctype}"` : ""}
        ${obj.formtarget ? `formtarget="${obj.formtarget}"` : ""}
        ${obj.command ? `command="${obj.command}"` : ""}
        ${obj.commandfor ? `commandfor="${obj.commandfor}"` : ""}
        ${obj.interestfor ? `interestfor="${obj.interestfor}"` : ""}
        ${obj.popovertarget ? `popovertarget="${obj.popovertarget}"` : ""}
        ${obj.popovertargetaction ? `popovertargetaction="${obj.popovertargetaction}"` : ""}
        ${obj.formnovalidate ? "formnovalidate" : ""}
      >${obj.innerHtml ?? ""}</button>`;
  }
  public static textArea(obj: Readonly<Partial<TextAreaAttributes>>): HTMLTextAreaElement {
    return html`<textarea
        ${this.buildBaseParams(obj)}
        ${this.buildBaseInputParams(obj)}
        ${this.buildCommonInputParams(obj)}
        ${this.buildTextualInputParams(obj)}
        ${obj.autofocus ? "autofocus" : ""}
        ${obj.cols ? `cols="${obj.cols}"` : ""}
        ${obj.rows ? `rows="${obj.rows}"` : ""}
        ${obj.spellcheck ? `spellcheck="${obj.spellcheck}"` : ""}
        ${obj.wrap ? `wrap="${obj.wrap}"` : ""}
      >${obj.innerHtml ?? ""}</textarea>`;
  }
  // #endregion HTML Elements
}
/** Joins a `&` collection of types into a flat collection of properties w/o interfaces. */
type Union<T1 extends Record<string, unknown>> = { [K in keyof T1]: T1[K] };
type BaseHtmlParams = {
  id: string,
  className: string,
  title: string,
  data: Record<string, unknown>,
  // data: DOMStringMap,
};
type ParentHtmlParams = { innerHtml: string | HTMLElement | string[] | HTMLElement[] | (string | HTMLElement)[] } & BaseHtmlParams;
// #region <input> elements
type InputTypes = "button" | "checkbox" | "color" | "date" | "datetime-local" | "email" | "file" | "hidden" | "image" | "month" | "number" | "password" | "radio" | "range" | "reset" | "search" | "submit" | "tel" | "text" | "time" | "url" | "week"/*  | "datetime " */;
type BaseInputParams = {
  type: InputTypes,
  name: string,
  // required: boolean,
  form: string,
  disabled: string,
} & BaseHtmlParams;
type CommonInputParams = {
  /** All except `url`, `email`, & `password` */
  autocapitalize: `none` | "off" | "sentences" | "on" | "words" | "characters",
  /**
   * See [the spec](https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill-detail-tokens) for valid values.
   *
   * All except `checkbox`, `radio`, & buttons; for `hidden`, can't be `"on"` or `"off".
   * 
   * Case insensitive, and can be a space-separated list of {@link AutofillDetailToken}
   */
  autocomplete: CaseInsensitive<"on" | "off" | AutofillDetailToken> | CaseInsensitive<AutofillDetailToken>[]/*  | string */,
  /** All except `hidden`, `password`, `checkbox`, `radio`, & buttons */
  list: string,
  /** All except `hidden`, `range`, `color`, `checkbox`, `radio`, & buttons */
  readonly: boolean,
  /** All except `hidden`, `range`, `color`, & buttons */
  required: boolean,
  /** All except `image` */
  value: string,
} & BaseInputParams;
type NumericInputParams = {
  max: number;
  min: number;
  step: number | "any";
};
/** `text`, `search`, `url`, `tel`, `email`, & usually `password` */
type TextualInputParams = {
  /** Not for `password`, also for `hidden` */
  dirname: string;
  maxlength: number;
  minlength: number;
  pattern: string;
  /** Also for `number` */
  placeholder: string;
  size: number;
} & CommonInputParams;
type InputCheckboxParams = Union<Pick<CommonInputParams,
  "value" |
  "required" |
  "autocapitalize"> & BaseInputParams & {
  type: "checkbox",
  checked: boolean,
  /**
   * Render as a switch?
   *
   * Limited browser support; ignored on unsupported browsers. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#switch)
   */
  switch: boolean,
}>;
type InputTextParams = Union<BaseInputParams & TextualInputParams & CommonInputParams & {
  type: "text",
  required: boolean,
}>;
export type InputNumberParams = Union<BaseInputParams & NumericInputParams & CommonInputParams & {
  type: "number",
  placeholder: string,
  required: boolean,
}>;
// #endregion <input> elements
type InputLikeAttributes = Pick<BaseInputParams, "disabled" | "form" | "name"> & { autofocus: boolean };
export type SelectParam = Union<{
  autocomplete: string,
  multiple: boolean,
  required: boolean,
  size: number,
} & InputLikeAttributes & ParentHtmlParams>;
export type OptionParam = {
  disabled: boolean,
  label: string,
  selected: boolean,
  value: string,
} & ParentHtmlParams;
type ButtonAttributes<Command extends string = ""> = Union<InputLikeAttributes & ParentHtmlParams & {
  type: "button" | "submit" | "reset",
  command: "show-modal" | "close" | "request-close" | "show-popover" | "hide-popover" | "toggle-popover" | `--${Command}`,
  commandfor: string,
  formaction: string,
  formenctype: "application/x-www-form-urlencoded" | "multipart/form-data" | "text/plain",
  formmethod: "post" | "get" | "dialog",
  formnovalidate: boolean,
  formtarget: "post" | "get" | "dialog",
  interestfor: string,
  popovertarget: string,
  popovertargetaction: "hide" | "show" | "toggle",
  value: string,
}>;
export type LabelParam = { forElement: string } & ParentHtmlParams;
export type TextAreaAttributes = Union<
  {
    cols: number,
    rows: number,
    spellcheck: boolean | "default",
    wrap: "hard" | "soft"/*  | "off" */,
  } &
  Omit<TextualInputParams, "type" | "pattern" | "size" | "list" | "value"> & 
  Pick<InputLikeAttributes, "autofocus"> & 
  {innerHtml: ParentHtmlParams["innerHtml"]}
>;
type CaseInsensitive<S extends string> = Uppercase<S> | Lowercase<S>;
/**
 * https://html.spec.whatwg.org/multipage/form-control-infrastructure.html#autofill-detail-tokens
 */
//`section-${S}` | "shipping" | "billing" | "name" | "honorific-prefix" | "given-name" | "additional-name" | "family-name" | "honorific-suffix" | "nickname" | "username" | "new-password" | "current-password" | "one-time-code" | "organization-title" | "organization" | "street-address" | "address-line1" | "address-line2" | "address-line3" | "address-level4" | "address-level3" | "address-level2" | "address-level1" | "country" | "country-name" | "postal-code" | "cc-name" | "cc-given-name" | "cc-additional-name" | "cc-family-name" | "cc-number" | "cc-exp" | "cc-exp-month" | "cc-exp-year" | "cc-csc" | "cc-type" | "transaction-currency" | "transaction-amount" | "language" | "bday" | "bday-day" | "bday-month" | "bday-year" | "sex" | "url" | "photo" | "home" | "work" | "mobile" | "fax" | "pager" | "tel" | "tel-country-code" | "tel-national" | "tel-area-code" | "tel-local" | "tel-local-prefix" | "tel-local-suffix" | "tel-extension" | "email" | "impp" | "webauthn";
type AutofillDetailToken<S extends string = string> = `section-${S}` | "shipping" | "billing" | "name" | "honorific-prefix" | `${"given" | "additional" | "family"}-name` | "honorific-suffix" | "nickname" | "username" | `${"new-" | "current-"}password` | "one-time-code" | `organization${"-title" | ""}` | "street-address" | `address-line${"1" | "2" | "3"}` | `address-level${"4" | "3" | "2" | "1"}` | "country" | "country-name" | "postal-code" | `cc-${`${"" | "given-" | "additional-" | "family-"}name` | "number" | `exp${"" | "-month" | "-year"}` | "csc" | "type"}` | `transaction-${"currency" | "amount"}` | "language" | `bday${"" | "-day" | "-month" | "-year"}` | "sex" | "url" | "photo" | "home" | "work" | "mobile" | "fax" | "pager" | "tel" | "tel-country-code" | "tel-national" | "tel-area-code" | "tel-local" | "tel-local-prefix" | "tel-local-suffix" | "tel-extension" | "email" | "impp" | "webauthn";
