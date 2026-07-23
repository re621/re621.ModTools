import REMT from "../../REMT";
import XM from "../models/api/XM";
import Script from "../models/data/Script";

export class UtilNetwork {

  /**
   * 
   * @returns Promise resolving to true if connected to the internet and false otherwise.
   * @deprecated Is unused here & was [removed from re621 itself
   * ](https://github.com/re621/re621.Legacy/commit/273ce5d1dd2c5bd3e1e27f96f0c065175cd9a876).
   */
  public static async isOnline(): Promise<boolean> {

    // Not terribly reliable.
    // If the computer is connected to any network, including LAN, this
    // will return true. So, if there's a connection to the router, but
    // not to the internet as a whole, this will not work.
    if (!navigator.onLine) return Promise.resolve(false);

    // Fallback method:
    // Tries to make a HEAD request to the site, and checks if it works.
    return new Promise((resolve) => {
      XM.Connect.xmlHttpRequest({
        method: "HEAD",
        url: (window.location.origin !== "null" ?
          window.location.origin :
          "https://" + window.location.host) + "/",
        onerror: () => { resolve(false); },
        onload: () => { resolve(true); },
      });
    })
  }

  /**
   * Changes the script's name to match the pre-established User Agent format.
   * E.g. If the package's name (& consequently script's name) is `RE621 Mod Tools`, that becomes `re621.ModTools`.
  */
  private static projectNameFormatted = Script.displayName.split(" ").reduce((p, e) => p + (p ? e.toLowerCase().replace(/^./, (e) => e.toUpperCase()) : e.toLowerCase() + "."), "");

  public static userAgent = this.projectNameFormatted + this.trimVersion(Script.version);

  private static trimVersion(value: string): string {
    const match = value.match(/(\d\.\d+)\.\d+/);
    if (!match || !match[1]) return "0.0";
    return match[1];
  }

  public static get authToken() {
    return REMT.API.getAuthToken() ?? document.querySelector("meta[name=csrf-token]")?.getAttribute("content") ?? "~~FAILED TO GET TOKEN~~";
  }

  /**
   * The value for the `Authorization` header or undefined if not available.
   * Will likely never be available in a browser context.
   */
  public static get authHeader() {
    const authLogin = REMT.API.getAuthLogin();
    return authLogin ? `Basic ${btoa(authLogin.username + ":" + authLogin.apiKey)}` : undefined;
  }

  /**
   * Gives a User Agent & the required header for an authenticated GET request.
   */
  public static get simpleAuthHeaders() {
    const base: {
      "User-Agent": string,
      "X-CSRF-Token": string,
      [k: string]: string,
    } = {
      "User-Agent": this.userAgent,
      "X-CSRF-Token": this.authToken,
    };
    const authHeader = this.authHeader;
    if (authHeader)
      base["Authorization"] = authHeader;
    return base;
  }
}
