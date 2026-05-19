import KeybindManager from "./Keybinds";
import Page, { PageDefinition, IgnoredPages } from "./Page";
import Post, { FileExtension, PostFlag, PostRating } from "./Post";
import PostFilter from "./PostFilter";
import Records from "./Records";
import Script from "./Script";
import { Tag, TagTypes } from "./Tag";
import User, { ImageScalingMode } from "./User";

export interface DataLib {
  KeybindManager: typeof KeybindManager,

  Page: typeof Page,
  PageDefinition: typeof PageDefinition,
  IgnoredPages: typeof IgnoredPages,

  Post: typeof Post,
  FileExtension: typeof FileExtension,
  PostFlag: typeof PostFlag,
  PostRating: typeof PostRating,

  PostFilter: typeof PostFilter,

  Records: typeof Records,

  Script: typeof Script,

  Tag: typeof Tag,
  TagTypes: typeof TagTypes,
  
  User: typeof User,
  ImageScalingMode: typeof ImageScalingMode,
}

export function buildDataLib (): DataLib {
  return Object.freeze({
    KeybindManager,
    Page,
    PageDefinition,
    IgnoredPages,

    Post,
    FileExtension,
    PostFlag,
    PostRating,

    PostFilter,

    Records,

    Script,

    Tag,
    TagTypes,

    User,
    ImageScalingMode,
  });
}
