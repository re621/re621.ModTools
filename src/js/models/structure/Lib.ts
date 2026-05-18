import { Confirm, ConfirmOptions } from "./Confirm";
import { DialogForm } from "./DialogForm";
import { Form, FormElement } from "./Form";
import Modal from "./Modal";
import type { ModalConfig } from './Modal';
import PageObserver from "./PageObserver";
import type PreparedStructure from './PreparedStructure';
import { Prompt } from "./Prompt";
import type { PromptOptions } from "./Prompt";
import { TemplateBuilder } from "./TemplateBuilder";
import type { TemplateBuilderConfig, TemplateData } from "./TemplateBuilder";

export interface Lib {
  Confirm: typeof Confirm,
  DialogForm: typeof DialogForm,
  Form: typeof Form,
  FormElement: typeof FormElement,
  Modal: typeof Modal,
  PageObserver: typeof PageObserver,
  Prompt: typeof Prompt,
  TemplateBuilder: typeof TemplateBuilder,
}

export default {
  Confirm,
  DialogForm,
  Form,
  FormElement,
  Modal,
  PageObserver,
  Prompt,
  TemplateBuilder,
}

// export interface Lib {
//   Confirm: typeof Confirm,
//   ConfirmOptions: ConfirmOptions,
//   DialogForm: typeof DialogForm,
//   Form: typeof Form,
//   FormElement: typeof FormElement,
//   Modal: typeof Modal,
//   ModalConfig: ModalConfig,
//   PageObserver: typeof PageObserver,
//   PreparedStructure: PreparedStructure,
//   Prompt: typeof Prompt,
//   PromptOptions: PromptOptions,
//   TemplateBuilder: typeof TemplateBuilder,
//   TemplateBuilderConfig: TemplateBuilderConfig,
//   TemplateData: TemplateData,
// }

export type {
  Confirm,
  ConfirmOptions,
  DialogForm,
  Form,
  FormElement,
  Modal,
  ModalConfig,
  PageObserver,
  PreparedStructure,
  Prompt,
  PromptOptions,
  TemplateBuilder,
  TemplateBuilderConfig,
  TemplateData,
}

export function buildLib (): Lib {
  return Object.freeze({
    Confirm,
    DialogForm,
    Form,
    FormElement,
    Modal,
    PageObserver,
    Prompt,
    TemplateBuilder,
  });
}
