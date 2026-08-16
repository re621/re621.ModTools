// #region Json Types
// #region Nullable
export type JsonPrimitive = boolean | number | string | null;
export type JsonPrimitiveSerializable = boolean | number | string | { toJSON(): string } | null;
export type JsonValue<T extends JsonPrimitive = JsonPrimitive> = T | Array<T | JsonValue<T>> | { [key: string]: T | JsonValue<T> };
export type JsonFlatObject<T extends JsonPrimitive = JsonPrimitive> = { [key: string]: T };
export type JsonObject<T extends JsonPrimitive = JsonPrimitive> = { [key: string]: JsonValue<T> };
export type JsonFlatArray<T extends JsonPrimitive = JsonPrimitive> = T[];
export type JsonArray<T extends JsonPrimitive = JsonPrimitive> = JsonValue<T>[] | T[] | JsonArray<T>[] | JsonObject<T>[];
export type JsonOutput<T extends JsonPrimitive = JsonPrimitive> = JsonObject<T> | JsonArray<T>;
export type JsonFlatOutput<T extends JsonPrimitive = JsonPrimitive> = JsonFlatObject<T> | JsonFlatArray<T>;

// #region Typed
/** @deprecated Use {@linkcode JsonFlatObject} */
export type TypedJsonFlatObject<T extends JsonPrimitive> = JsonFlatObject<T>;
/** @deprecated Use {@linkcode JsonObject} */
export type TypedJsonObject<T extends JsonPrimitive> = JsonObject<T>;
/** @deprecated Use {@linkcode JsonFlatArray} */
export type TypedJsonFlatArray<T extends JsonPrimitive> = JsonFlatArray<T>;
/** @deprecated Use {@linkcode JsonArray} */
export type TypedJsonArray<T extends JsonPrimitive> = JsonArray<T>;
/** @deprecated Use {@linkcode JsonOutput} */
export type TypedJsonOutput<T extends JsonPrimitive> = JsonOutput<T>;
/** @deprecated Use {@linkcode JsonFlatOutput} */
export type TypedJsonFlatOutput<T extends JsonPrimitive> = JsonFlatOutput<T>;
// #endregion Typed
// #endregion Nullable

// #region Non-null
export type JsonStrictPrimitive = boolean | number | string;
export type JsonStrictPrimitiveSerializable = boolean | number | string | { toJSON(): string };

export type JsonStrictValue<T extends JsonStrictPrimitive = JsonStrictPrimitive> = JsonValue<T>;
export type JsonStrictFlatObject<T extends JsonStrictPrimitive = JsonStrictPrimitive> = JsonFlatObject<T>;
export type JsonStrictObject<T extends JsonStrictPrimitive = JsonStrictPrimitive> = JsonObject<T>;
export type JsonStrictFlatArray<T extends JsonStrictPrimitive = JsonStrictPrimitive> = JsonFlatArray<T>;
export type JsonStrictArray<T extends JsonStrictPrimitive = JsonStrictPrimitive> = JsonArray<T>;
export type JsonStrictOutput<T extends JsonStrictPrimitive = JsonStrictPrimitive> = JsonOutput<T>;
export type JsonStrictFlatOutput<T extends JsonStrictPrimitive = JsonStrictPrimitive> = JsonFlatOutput<T>;

// #region Typed
/** @deprecated Use {@linkcode JsonStrictFlatObject} */
export type TypedJsonStrictFlatObject<T extends JsonStrictPrimitive> = JsonFlatObject<T>;
/** @deprecated Use {@linkcode JsonStrictObject} */
export type TypedJsonStrictObject<T extends JsonStrictPrimitive> = JsonObject<T>;
/** @deprecated Use {@linkcode JsonStrictFlatArray} */
export type TypedJsonStrictFlatArray<T extends JsonStrictPrimitive> = JsonFlatArray<T>;
/** @deprecated Use {@linkcode JsonStrictArray} */
export type TypedJsonStrictArray<T extends JsonStrictPrimitive> = JsonArray<T>;
/** @deprecated Use {@linkcode JsonStrictOutput} */
export type TypedJsonStrictOutput<T extends JsonStrictPrimitive> = JsonOutput<T>;
/** @deprecated Use {@linkcode JsonStrictFlatOutput} */
export type TypedJsonStrictFlatOutput<T extends JsonStrictPrimitive> = JsonStrictFlatOutput<T>;
// #endregion Typed
// #endregion Non-null
// #endregion Json Types