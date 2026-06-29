// #region Json Types
// #region Nullable
export type JsonPrimitive = boolean | number | string | null;
export type JsonPrimitiveSerializable = boolean | number | string | { toJSON(): string } | null;
export type JsonValue = JsonPrimitive | Array<JsonPrimitive | JsonValue> | { [key: string]: JsonPrimitive | JsonValue };
export type JsonFlatObject = { [key: string]: JsonPrimitive };
export type JsonObject = { [key: string]: JsonValue };
export type JsonFlatArray = JsonPrimitive[];
export type JsonArray = JsonValue[];
export type JsonOutput = JsonObject | JsonArray;

// #region Typed
export type TypedJsonFlatObject<T extends JsonPrimitive> = { [key: string]: T };
export type TypedJsonObject<T extends JsonPrimitive> = { [key: string]: T | T[] | TypedJsonFlatObject<T> };
export type TypedJsonFlatArray<T extends JsonPrimitive> = T[];
export type TypedJsonArray<T extends JsonPrimitive> = Array<T | TypedJsonArray<T> | TypedJsonObject<T>>;
export type TypedJsonOutput<T extends JsonPrimitive> = TypedJsonObject<T> | TypedJsonArray<T>;
export type TypedJsonFlatOutput<T extends JsonPrimitive> = TypedJsonFlatObject<T> | TypedJsonArray<T>;
// #endregion Typed
// #endregion Nullable

// #region Non-null
export type JsonStrictPrimitive = boolean | number | string;
export type JsonStrictPrimitiveSerializable = boolean | number | string | { toJSON(): string };
export type JsonStrictValue = JsonStrictPrimitive | Array<JsonStrictPrimitive | JsonStrictValue> | { [key: string]: JsonStrictPrimitive | JsonStrictValue };
export type JsonStrictFlatObject = { [key: string]: JsonStrictPrimitive };
export type JsonStrictObject = { [key: string]: JsonStrictValue };
export type JsonStrictFlatArray = JsonStrictPrimitive[];
export type JsonStrictArray = JsonStrictValue[];
export type JsonStrictOutput = JsonStrictObject | JsonStrictArray;

// #region Typed
export type TypedJsonStrictFlatObject<T extends JsonStrictPrimitive> = { [key: string]: T };
export type TypedJsonStrictObject<T extends JsonStrictPrimitive> = { [key: string]: T | T[] | TypedJsonStrictFlatObject<T> };
export type TypedJsonStrictFlatArray<T extends JsonStrictPrimitive> = T[];
export type TypedJsonStrictArray<T extends JsonStrictPrimitive> = Array<T | TypedJsonStrictArray<T> | TypedJsonStrictObject<T>>;
export type TypedJsonStrictOutput<T extends JsonStrictPrimitive> = TypedJsonStrictObject<T> | TypedJsonStrictArray<T>;
export type TypedJsonStrictFlatOutput<T extends JsonStrictPrimitive> = TypedJsonStrictFlatObject<T> | TypedJsonStrictArray<T>;
// #endregion Typed
// #endregion Non-null
// #endregion Json Types