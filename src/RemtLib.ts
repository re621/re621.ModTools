import Component from "./js/components/Component";
import XM from "./js/models/api/XM";
import { ModelsLib, buildModelsLib } from "./js/models/ModelsLib";
import Util from "./js/utilities/Util";

export default interface RemtLib {
  Util: typeof Util,
  Component: typeof Component,
  Models: ModelsLib,
}
export function buildRemtLib (): RemtLib {
  return Object.freeze({
    Util,
    Component,
    Models: buildModelsLib(),
  });
}
export function initRemtLib(obj: any = buildRemtLib()) {
  XM.Window["REMT"] = obj;
}
