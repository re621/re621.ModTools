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

  public static userAgent = Script.projectNameCamelFormatted + Script.versionObj.format`${"major"}.${"minor"}`;

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

  /**
   * 
   * @param url 
   * @param options 
   * @returns The given URL with the given options resolved
   */
  public static normalizeUrl(url: string, options = {
    preserveQuery: false,
    trailingPathSlash: false,
  }) {
    const parsed = new URL(url);
    if (!options?.preserveQuery) parsed.search = "";
    url = parsed.href;
    if (options?.trailingPathSlash && !url.endsWith("/")) url += "/";
    else if (!options?.trailingPathSlash && url.endsWith("/")) url = url.slice(0, url.length - 1);
    return url;
  }
}
