import Util from '../../utilities/Util';

/**
 * Basic script parameters (both hard-coded and derived from the userscript
 * header), & miscellaneous site-specific configuration.
 *
 * GM_info is used here because of XM.Connect initialization issues.
 * 
 * If not directly modified by downstream maintainers, expects the following from the script metadata:
 * * `GM_info.script.name`: At least 2 space-separated terms.
 * * `GM_info.script.version`: A proper SemVer version; can have any prefix.
 * * `GM_info.script.homepage`: A proper GitHub repository URL.
 *
 * # IMPORTANT
 * If this is modified to utilize external resources from this library (e.g. the use of {@link Util.Network.normalizeUrl}), make certain to account for circular dependencies (e.g. {@link Util.Network.userAgent} is lazily initialized).
 */
export default class Script {
  public static readonly displayName = GM_info.script.name;
  /**
   * The raw version; expected to contain a
   * [SemVer](https://semver.org/)-formatted string.
   *
   * @deprecated Will be replaced with {@link versionObj} next major release; use {@link versionObj.raw} instead.
   * @todo Replace w/ copy of `versionObj`; deprecate current `versionObj`.
   */
  public static readonly version = GM_info.script.version;
  /**
   * An object containing the parsed version info.
   */
  public static readonly versionObj = Object.freeze(Util.parseVersion(this.version));
  public static readonly handler = Object.freeze({
    name: GM_info.scriptHandler,
    version: GM_info.version,
  });
  public static readonly url = {
    website: "https://re621.app",
    repo: GM_info.script.homepage ? Util.Network.normalizeUrl(GM_info.script.homepage) : "~~HOMEPAGE_MISSING~~",
    issues: (GM_info.script.homepage ? Util.Network.normalizeUrl(GM_info.script.homepage) : "~~HOMEPAGE_MISSING~~") + "/issues",
    thread: "https://e621.net/forum_topics/25872",
    latest: "https://api.github.com/repos/re621/re621.ModTools/releases/latest",
    kofi: "https://ko-fi.com/bitWolfy",
  }

  // #region Internal Project Identifiers
  /**
   * Changes the script's name to match the pre-established console logging format.
   *
   * E.g. If the package's name (& consequently script's name) is `RE621 Mod
   * Tools`, that becomes `RE621.ModTools`.
   */
  public static readonly projectNameFormatted = Script.displayName.split(" ").reduce((p, e) => p + (p ? e.toLowerCase().replace(/^./, e => e.toUpperCase()) : e + "."), "");

  /**
   * Changes the script's name to match the pre-established User Agent format.
   *
   * E.g. If the package's name (& consequently script's name) is `RE621 Mod
   * Tools`, that becomes `re621.ModTools`.
   */
  public static readonly projectNameCamelFormatted = Script.displayName.split(" ").reduce((p, e) => p + (p ? e.toLowerCase().replace(/^./, e => e.toUpperCase()) : e.toLowerCase() + "."), "");

  /**
   * Changes the script's name to match an old pre-established event prefix format.
   *
   * E.g. If the package's name (& consequently script's name) is `RE621 Mod
   * Tools`, that becomes `re621-mt`.
   */
  public static readonly eventPrefixLegacy = Script.displayName.split(" ").reduce((p, e) => p + (p ? e[0].toLowerCase() : e.toLowerCase() + "-"), "");
  // #endregion Internal Project Identifiers
  /**
   * 
   * @deprecated Use {@link Util.Network.userAgent} instead.
   */
  public static readonly userAgent = this.projectNameFormatted + this.trimVersion(Script.versionObj.raw);

  /**
   * @deprecated Use {@link Util.parseVersion} instead
   */
  private static trimVersion(value: string): string {
    const match = value.match(/(\d\.\d+)\.\d+/);
    if (!match || !match[1]) return "0.0";
    return match[1];
  }

  // #region Domains
  /** E.g. For e621, should be `["e621.net", "e926.net"]`. */
  public static readonly domains = Object.freeze(
    GM_info
      .script
      .matches
      .map(e => e.match(/^https:\/\/(.+)\/\*/)?.[1]).reduce<string[]>((p,e) => {
        if (e) p.push(e);
        return p;
      }, []),
  );
  public static readonly primaryDomain = this.domains[0] ?? "e621.net";

  /** E.g. for e621, should be `["static1.e621.net", "static1.e926.net", "*"]` */
  public static readonly staticDomains = Object.freeze(
    GM_info.script.options.override.orig_connects.filter(e => e && e !== "*"),
  );
  public static readonly primaryStaticDomain = this.staticDomains[0] ?? `static1.${this.primaryDomain}`;

  /** E.g. For e621, should be `["e621", "e926"]`. */
  public static readonly secondLevelDomains = Object.freeze(
    this.domains.map(e => e.split(".").at(-2) ?? e.split(".")[0] ?? e),
  );
  public static readonly primarySecondLevelDomain = this.secondLevelDomains[0] ?? "e621";

  /**
   * What do important wiki pages have as their prefix by convention?
   *
   * E.g. For e621 & e926, `e621` (as used for `[[e621:rules]]`, et. al.).
   */
  public static readonly siteNameWikiPrefix = this.primarySecondLevelDomain;

  // #region Misc
  /**
   * Used to reference the name of the companion userscript; should one exist.
   *
   * This project started as a slimmer version of re621; this is used for log
   * messages related to its expected presence or lack thereof.
   */
  public static readonly companionProjectName = "re621";
  // #endregion Misc
}
