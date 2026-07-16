import REMT from "../../REMT";
import XM from "../models/api/XM";

export class UtilNetwork {

  public static async isOnline(): Promise<boolean> {

    // Not terribly reliable.
    // If the computer is connected to any network, including LAN, this
    // will return true. So, if there's a connection to the router, but
    // not to the internet as a whole, this will not work.
    if (!navigator.onLine) return Promise.resolve(false);

    // Fallback method
    // Tries to make a HEAD request to e621.net, and checks if it works
    return new Promise((resolve) => {
      XM.Connect.xmlHttpRequest({
        method: "HEAD",
        url: window.location.host == "e621.net" ? "https://e621.net/" : "https://e926.net/",
        onerror: () => { resolve(false); },
        onload: () => { resolve(true); },
      });
    })
  }

  /**
   * Gives a User Agent & the required header for an authenticated GET request.
   */
  public static get simpleAuthHeaders() {
    return {
      "User-Agent": `${XM.Info.script.name}/${XM.Info.script.version} (by ${XM.Info.script.author} on e621)`,
      "X-CSRF-Token": REMT.API.getAuthToken() ?? document.querySelector("meta[name=csrf-token]")?.getAttribute("content") ?? "~~FAILED TO GET TOKEN~~",
    };
  }
}
