import { html } from "./HtmlTemplate";

export default class HtmlBuilder {
  // #region HTML Elements
  // #region Attribute helpers
  private static buildBaseParams<T extends BaseHtmlParams>(obj: Partial<T>) {
    return [
      obj.id ? ` id="${obj.id}"` : "",
      obj.className ? ` class="${obj.className}"` : "",
      obj.title ? ` title="${obj.title}"` : "",
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
      autocomplete ? ` autocomplete="${autocomplete}"` : "",
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
  // #endregion Attribute helpers
  public static inputCheckboxBuilder(obj: Partial<InputCheckboxParams> = {}) {
    obj.type = "checkbox";
    return html`<input
      ${this.buildBaseInputParams(obj)}
      ${this.buildBaseParams(obj)}
      ${obj.checked ? "checked" : ""}
    />` as HTMLInputElement;
  }
  public static inputNumberBuilder(obj: Partial<InputNumberParams> = {}) {
    obj.type = "number";
    return html`<input
      ${this.buildBaseParams(obj)}
      ${this.buildBaseInputParams(obj)}
      ${this.buildCommonInputParams(obj)}
      ${this.buildNumericInputParams(obj)}
    />` as HTMLInputElement;
  }
  public static inputTextBuilder(obj: Partial<InputTextParams> = {}) {
    obj.type = "text";
    return html`<input
      ${this.buildBaseParams(obj)}
      ${this.buildBaseInputParams(obj)}
      ${this.buildCommonInputParams(obj)}
      ${this.buildTextualInputParams(obj)}
    />` as HTMLInputElement;
  }
  public static labelBuilder(obj: Partial<LabelParam>) {
    return html`<label
      ${this.buildBaseParams(obj)}
      ${obj.forElement ? ` for="${obj.forElement}"` : ""}
    >${obj.innerHtml ?? ""}</label>` as HTMLLabelElement;
  }

  public static optionBuilder(obj: Partial<OptionParam>) {
    return html`<option
      ${this.buildBaseParams(obj)}
      ${obj.value ? ` value="${obj.value}"` : ""}
      ${obj.label ? ` label="${obj.label}"` : ""}
      ${obj.selected ? " selected" : ""}
      ${obj.disabled ? " disabled" : ""}
    >${obj.innerHtml ?? ""}</option>` as HTMLOptionElement;
  }
  public static selectBuilder(obj: Partial<SelectParam>) {
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
      >${obj.innerHtml ?? ""}</select>` as HTMLSelectElement;
  }
  public static button(obj: Partial<ButtonAttributes>) {
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
      >${obj.innerHtml ?? ""}</button>` as HTMLButtonElement;
  }
  // #endregion HTML Elements
}
type BaseHtmlParams = { id: string, className: string, title: string };
type ParentHtmlParams = { innerHtml: string | HTMLElement | (string | HTMLElement)[] } & BaseHtmlParams;
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
  /** All except `checkbox`, `radio`, & buttons */
  autocomplete: string,
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
interface InputCheckboxParams extends Pick<CommonInputParams,
  "value" |
  "required" |
  "autocapitalize">, BaseInputParams {
  type: "checkbox",
  checked: boolean,
  /**
   * Render as a switch?
   *
   * Limited browser support; ignored on unsupported browsers. [MDN](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input#switch)
   */
  switch: boolean,
}
interface InputTextParams extends BaseInputParams, TextualInputParams, CommonInputParams {
  type: "text",
  required: boolean,
}
interface InputNumberParams extends BaseInputParams, NumericInputParams, CommonInputParams {
  type: "number",
  placeholder: string,
  required: boolean,
}
// #endregion <input> elements
type InputLikeAttributes = Pick<BaseInputParams, "disabled" | "form" | "name"> & { autofocus: boolean };
type SelectParam = {
  autocomplete: string,
  multiple: boolean,
  required: boolean,
  size: number,
} & InputLikeAttributes & ParentHtmlParams;
type OptionParam = {
  disabled: boolean,
  label: string,
  selected: boolean,
  value: string,
} & ParentHtmlParams;
type ButtonAttributes<Command extends string = ""> = /* Pick<BaseInputParams, "type"> &  */InputLikeAttributes & ParentHtmlParams & {
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
};
type LabelParam = { forElement: string } & ParentHtmlParams;
