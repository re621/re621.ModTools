import { ApiLib, buildApiLib } from "./api/ApiLib";
import { DataLib, buildDataLib } from "./data/DataLib";
import Debug from "./Debug";
import { StructureLib, buildStructureLib } from "./structure/StructureLib";

export interface ModelsLib {
  Api: ApiLib,
  Data: DataLib,
  Structure: StructureLib,
  Debug: typeof Debug,
}

export function buildModelsLib (): ModelsLib {
  return Object.freeze({
    Api: buildApiLib(),
    Data: buildDataLib(),
    Structure: buildStructureLib(),
    Debug,
  });
}
