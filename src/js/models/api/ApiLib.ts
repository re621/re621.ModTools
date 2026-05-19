import Danbooru from "./Danbooru";
import LocalStorage from "./LocalStorage";
import XM from "./XM";

export interface ApiLib {
  Danbooru: typeof Danbooru,
  LocalStorage: typeof LocalStorage,
  XM: typeof XM,
}

export function buildApiLib (): ApiLib {
  return Object.freeze({
    Danbooru,
    LocalStorage,
    XM,
  });
}
