import { Confirm } from "./Confirm";
import { DialogForm } from "./DialogForm";
import { Form, FormElement } from "./Form";
import Modal from "./Modal";
import PageObserver from "./PageObserver";
import { Prompt } from "./Prompt";
import { TemplateBuilder } from "./TemplateBuilder";

export interface StructureLib {
  Confirm: typeof Confirm,
  DialogForm: typeof DialogForm,
  Form: typeof Form,
  FormElement: typeof FormElement,
  Modal: typeof Modal,
  PageObserver: typeof PageObserver,
  Prompt: typeof Prompt,
  TemplateBuilder: typeof TemplateBuilder,
}

export function buildStructureLib (): StructureLib {
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
