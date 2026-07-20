import { UtilNetwork } from '../../utilities/UtilNetwork';
/**
 * Basic script parameters, both hard-coded and derived from the userscript header.
 * GM_info is used here because of XM.Connect initialization issues.
 */
export default class Script {
  public static readonly displayName = GM_info.script.name;
  public static readonly version = GM_info.script.version;
  public static readonly handler = Object.freeze({
    name: GM_info.scriptHandler,
    version: GM_info.version,
  });
  public static readonly url = {
    website: "https://re621.app",
    repo: "https://github.com/re621/re621.ModTools",
    issues: "https://github.com/re621/re621.ModTools/issues",
    thread: "https://e621.net/forum_topics/25872",
    latest: "https://api.github.com/repos/re621/re621.ModTools/releases/latest",
    kofi: "https://ko-fi.com/bitWolfy",
  }

  /**
   * Changes the script's name to match the pre-established User Agent format.
   * E.g. If the package's name (& consequently script's name) is `RE621 Mod Tools`, that becomes `re621.ModTools`.
   * @deprecated Use {@link UtilNetwork.projectNameFormatted} instead.
   */
  private static projectNameFormatted = this.displayName.split(" ").reduce((p, e) => p + (p ? e.toLowerCase().replace(/^./, (e) => e.toUpperCase()) : e.toLowerCase() + "."), "");

  /**
   * 
   * @deprecated Use {@link UtilNetwork.userAgent} instead.
   */
  public static readonly userAgent = this.projectNameFormatted + this.trimVersion(Script.version);

  /**
   * @deprecated Use {@link UtilNetwork.trimVersion} instead
   */
  private static trimVersion(value: string): string {
    const match = value.match(/(\d\.\d+)\.\d+/);
    if (!match || !match[1]) return "0.0";
    return match[1];
  }

  public static readonly domains = GM_info.script.matches.map(e => e.match(/^https:\/\/(.+)\/\*/)?.[1]).reduce<string[]>((p,e) => {
    if (e) p.push(e);
    return p;
  }, []);
  public static readonly primaryDomain = this.domains[0] ?? "e621.net";
  public static readonly staticDomains = GM_info.script.options.override.orig_connects.filter(e => e && e !== "*");
  public static readonly primaryStaticDomain = this.staticDomains[0] ?? `static1.${this.primaryDomain}`;
}
