import { html } from "./HtmlTemplate";

export default class HtmlBuilder {
  private static buildBaseParams<T extends BaseHtmlParams>(obj: Partial<T>) {
    return `${obj.id ? ` id="${obj.id}"` : ""}${obj.className ? ` class="${obj.className}"` : ""}${obj.title ? ` title="${obj.title}"` : ""}`;
  }
  public static inputCheckboxBuilder(obj: Partial<InputCheckboxParams> = {}) {
    return html`<input
        type="checkbox"
        ${this.buildBaseParams(obj)}
        ${obj.name ? `name="${obj.name}"` : ""}
        ${obj.checked ? "checked" : ""}
        value="${obj.value}" />` as HTMLInputElement;
  }
  public static inputNumberBuilder(obj: Partial<InputNumberParams> = {}) {
    return html`<input
        type="number"
        ${this.buildBaseParams(obj)}
        ${obj.name ? `name="${obj.name}"` : ""}
        ${(obj.min !== undefined) ? `min="${obj.min}"` : ""}
        ${(obj.max !== undefined) ? `max="${obj.max}"` : ""}
        ${(obj.step !== undefined) ? `step="${obj.step}"` : ""}
        ${obj.placeholder ? `placeholder="${obj.placeholder}"` : ""}
        ${obj.required ? "required" : ""}
        value="${obj.value}" />` as HTMLInputElement;
  }
  public static inputTextBuilder(obj: Partial<InputTextParams> = {}) {
    return html`<input
        type="text"
        ${this.buildBaseParams(obj)}
        ${obj.name ? `name="${obj.name}"` : ""}
        ${(obj.minlength !== undefined) ? `minlength="${obj.minlength}"` : ""}
        ${(obj.maxlength !== undefined) ? `maxlength="${obj.maxlength}"` : ""}
        ${obj.placeholder ? `placeholder="${obj.placeholder}"` : ""}
        ${obj.required ? "required" : ""}
        value="${obj.value}" />` as HTMLInputElement;
  }
  public static labelBuilder(obj: Partial<LabelParam>) {
    return html`<label
      ${this.buildBaseParams(obj)}
      ${obj.forElement ? ` for="${obj.forElement}"` : ""}>
        ${obj.innerHtml}
      </label>` as HTMLLabelElement;
  }

  public static optionBuilder(obj: Partial<OptionParam>) {
    return html`<option
      ${this.buildBaseParams(obj)}
      ${obj.value ? ` value="${obj.value}"` : ""}
      ${obj.label ? ` label="${obj.label}"` : ""}
      ${obj.selected ? " selected" : ""}
      ${obj.disabled ? " disabled" : ""}
    >${typeof obj.innerHtml}</option>`;
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
      >${obj.innerHtml}</select>`;
  }
}
type BaseHtmlParams = { id: string, className: string, title: string };
type ParentHtmlParams = { innerHtml: string | HTMLElement | (string | HTMLElement)[] } & BaseHtmlParams;
type LabelParam = { forElement: string } & ParentHtmlParams;
type SelectParam = {
  autocomplete: string,
  autofocus: boolean,
  disabled: boolean,
  form: string,
  multiple: boolean,
  name: string,
  required: boolean,
  size: number,
} & ParentHtmlParams;
type OptionParam = {
  disabled: boolean,
  label: string,
  selected: boolean,
  value: string,
} & ParentHtmlParams;
type InputParams = {
  type: string,
  name: string,
  // required: boolean,
  value: string,
} & BaseHtmlParams;
interface InputCheckboxParams extends InputParams {
  type: "checkbox",
  // required: boolean,
  checked: boolean,
}
interface InputTextParams extends InputParams {
  type: "text",
  maxlength: number,
  minlength: number,
  placeholder: string,
  required: boolean,
}
interface InputNumberParams extends InputParams {
  type: "number",
  max: number,
  min: number,
  step: number | any,
  placeholder: string,
  required: boolean,
}