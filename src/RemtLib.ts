import Component, { ComponentList, ComponentOptions, JSONObject, PrimitiveMap, PrimitiveType, Settings } from "./js/components/Component";
import XM from "./js/models/api/XM";
import Lib, { buildLib } from "./js/models/structure/Lib";
import Util from "./js/utilities/Util";

export type {
  Util,
  Component,
  Lib,
  ComponentOptions,
  ComponentList,
  PrimitiveType,
  PrimitiveMap,
  JSONObject,
  Settings,
}
// export default interface RemtLib {
//   Util: typeof Util,
//   Component: typeof Component,
//   Structure: typeof Lib,
//   ComponentOptions: ComponentOptions,
//   ComponentList: ComponentList,
//   PrimitiveType: PrimitiveType,
//   PrimitiveMap: PrimitiveMap,
//   JSONObject: JSONObject,
//   Settings: Settings,
// }
export default interface RemtLib {
  Util: typeof Util,
  Component: typeof Component,
  Structure: typeof Lib,
}
export function buildRemtLib (): RemtLib {
  return Object.freeze({
    Util,
    Component,
    Structure: buildLib(),
  });
}
export function initRemtLib() {
  XM.Window["Remt"] = buildRemtLib();
}
