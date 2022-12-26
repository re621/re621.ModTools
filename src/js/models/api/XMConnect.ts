import Script from "../data/Script";
import Debug from "../Debug";

declare const GM_xmlhttpRequest: any;
declare const GM_download: any;

export default class XMConnect {

    /**
     * Make a cross-domain xmlHttpRequest.  
     * For userscripts, the domain name MUST be defined in @resource tag.  
     * For extensions, the domain name MUST be listed in the permissions.
     * @param details Request details
     */
    public static xmlHttpRequest(details: XMConnectRequest): void {
        Debug.connectLog(details.url);
        GM_xmlhttpRequest(XMConnect.validateXHRDetails(details));
    }

    /**
     * Cross-domain xmlHttpRequest, wrapped in a Promise.  
     * For userscripts, the domain name MUST be defined in @resource tag.  
     * For extensions, the domain name MUST be listed in the permissions.
     * @param details Request details
     */
    public static xmlHttpPromise(details: XMConnectRequest): Promise<GMxmlHttpRequestResponse> {
        const validDetails = XMConnect.validateXHRDetails(details);
        return new Promise((resolve, reject) => {
            const callbacks = {
                onabort: validDetails.onabort,
                onerror: validDetails.onerror,
                onload: validDetails.onload,
                onloadstart: validDetails.onloadstart,
                onprogress: validDetails.onprogress,
                onreadystatechange: validDetails.onreadystatechange,
                ontimeout: validDetails.ontimeout,
            };

            details.onabort = (event): void => { callbacks.onabort(event); reject(event); };
            details.onerror = (event): void => { callbacks.onerror(event); reject(event); };
            details.onload = (event): void => { callbacks.onload(event); resolve(event); };
            details.onloadstart = (event): void => { callbacks.onloadstart(event); };
            details.onprogress = (event): void => { callbacks.onprogress(event); };
            details.onreadystatechange = (event): void => { callbacks.onreadystatechange(event); };
            details.ontimeout = (event): void => { callbacks.ontimeout(event); reject(event); };

            XMConnect.xmlHttpRequest(validDetails);
        });
    }

    /**
     * Validates the xmlHttpRequest details, returning a valid set
     * @param details Request details
     */
    private static validateXHRDetails(details: XMConnectRequest): XMConnectRequest {
        if (details.headers === undefined) details.headers = {};
        if (details.headers["User-Agent"] === undefined) {
            details.headers["User-Agent"] = Script.userAgent;
            details.headers["X-User-Agent"] = Script.userAgent;
        }

        if (details.onabort === undefined) details.onabort = (): void => { return; };
        if (details.onerror === undefined) details.onerror = (): void => { return; };
        if (details.onload === undefined) details.onload = (): void => { return; };
        if (details.onloadstart === undefined) details.onloadstart = (): void => { return; };
        if (details.onprogress === undefined) details.onprogress = (): void => { return; };
        if (details.onreadystatechange === undefined) details.onreadystatechange = (): void => { return; };
        if (details.ontimeout === undefined) details.ontimeout = (): void => { return; };

        return details;
    }

    /** Downloads a given URL to the local disk. */
    public static download(url: string, name: string): void;
    public static download(defaults: GMDownloadDetails): void;
    public static download(a: any, b?: any): void {
        if (typeof a === "string") {
            a = {
                url: a,
                name: b,
            };
        }

        if (a.headers === undefined) a.headers = {
            "User-Agent": Script.userAgent,
            "X-User-Agent": Script.userAgent,
        };

        if (a.onerror === undefined) a.onerror = (): void => { return; }
        if (a.onload === undefined) a.onload = (): void => { return; }
        if (a.onprogress === undefined) a.onprogress = (): void => { return; }
        if (a.ontimeout === undefined) a.ontimeout = (): void => { return; }

        let timer: number;
        XMConnect.xmlHttpRequest({
            url: a.url,
            method: "GET",
            headers: a.headers,
            responseType: "blob",
            onerror: (event) => { a.onerror(event); },
            ontimeout: (event) => { a.ontimeout(event); },
            onprogress: (event) => {
                if (timer) clearTimeout(timer);
                timer = window.setTimeout(() => { a.onprogress(event) }, 500);
            },
            onload: (event) => {
                a.onload(event);
                const btn = $("<a>")
                    .attr({
                        href: URL.createObjectURL(event.response as Blob),
                        download: a.name,
                    })
                    .html("download")
                    .on("click", () => { btn.remove(); });
                btn[0].click();
            }
        });
    }

    /**
     * Alternative to the normal download method above, using GM_download method.
     */
    public static browserDownload(url: string, name?: string, saveAs?: boolean): void;
    public static browserDownload(defaults: GMDownloadDetails): void;
    public static browserDownload(a: any, b?: string, c?: boolean): void {

        // Fallback to avoid a crash in Vivaldi
        if (Debug.Vivaldi) return XMConnect.download(a, b);

        const downloadDetails: GMDownloadDetails = typeof a === "string"
            ? { url: a, name: b, saveAs: c }
            : a;

        // Workaround to SWF files not being whitelisted by default in Tampermonkey
        downloadDetails.onerror = (event): void => {
            if (event.error == "not_whitelisted")
                XMConnect.download(a, b);
            else if (a.onerror) a.onerror(event);
            else throw "Error: unable to download file" + (event.error ? (` [${event.error}]`) : "");
        }

        // All script managers should have a GM_download function
        GM_download(a);
    }

}

interface XMConnectDetails {
    /** **method** Request method - either GET, HEAD, or POST */
    method: "GET" | "HEAD" | "POST";

    /** **url** the destination URL */
    url: string;

    /** **headers** ie. user-agent, referer, ... */
    headers?: any | string;

    /** **data** some string to send via a POST request */
    data?: string;

    /** **cookie** a cookie to be patched into the sent cookie set */
    cookie?: string;

    /** **binary** send the data string in binary mode */
    binary?: boolean;

    /** **timeout** a timeout in ms */
    timeout?: number;

    /** **context** a property which will be added to the response object */
    context?: any;

    /** **responseType** one of arraybuffer, blob, json */
    responseType?: "arraybuffer" | "blob" | "json";

    /** **overrideMimeType** a MIME type for the request */
    overrideMimeType?: string;

    /** **anonymous** don't send cookies with the requests */
    anonymous?: boolean;

    /** **fetch** (beta) use a fetch instead of a xhr request */
    fetch?: boolean;

    /** **username** a username for authentication */
    username?: string;

    /** **password** a password */
    password?: string;
}

interface XMConnectRequestCallbacks {

    /** **onabort** callback to be executed if the request was aborted */
    onabort?(event: GMxmlHttpRequestEvent): void;

    /** **onerror** callback to be executed if the request ended up with an error */
    onerror?(event: GMxmlHttpRequestEvent): void;

    /** **onloadstart** callback to be executed if the request started to load */
    onloadstart?(event: GMxmlHttpRequestEvent): void;

    /** **onprogress** callback to be executed if the request made some progress */
    onprogress?(event: GMxmlHttpRequestProgressEvent): void;

    /** **onreadystatechange** callback to be executed if the request's ready state changed */
    onreadystatechange?(event: GMxmlHttpRequestEvent): void;

    /** **ontimeout** callback to be executed if the request failed due to a timeout */
    ontimeout?(event: GMxmlHttpRequestEvent): void;

    /**
     * **onload** callback to be executed if the request was loaded.  
     *   It gets one argument with the following attributes:
     *   - **finalUrl** - the final URL after all redirects from where the data was loaded
     *   - **readyState** - the ready state
     *   - **status** - the request status
     *   - **statusText** - the request status text
     *   - **responseHeaders** - the request response headers
     *   - **response** - the response data as object if details.responseType was set
     *   - **responseXML** - the response data as XML document
     *   - **responseText** - the response data as plain string
     */
    onload?(event: GMxmlHttpRequestResponse): void;
}

interface XMConnectRequest extends XMConnectDetails, XMConnectRequestCallbacks { }

export interface GMxmlHttpRequestEvent {
    /** **finalUrl** - the final URL after all redirects from where the data was loaded */
    finalURL: string;

    /**
     * **readyState** - returns the state an XMLHttpRequest client is in:  
     * 0	UNSENT              client has been created, open() not called yet  
     * 1	OPENED	            open() has been called  
     * 2	HEADERS_RECEIVED	send() has been called, headers and status available  
     * 3	LOADING             downloading; responseText holds partial data  
     * 4	DONE	            the operation is complete  
     */
    readyState: 0 | 1 | 2 | 3 | 4;

    /**
     * **status** - returns the numerical HTTP status code of the response.  
     * Before the request completes, the value of **status** is always 0.  
     * Browsers also report a status of 0 in case of XMLHttpRequest errors.
     */
    status: number;

    /**
     * **statusText** - returns a DOMString containing the response's status message.  
     * Unlike **status**, this property contains the _text_ of the response status, such as "OK" or "Not Found".
     */
    statusText: string;
}

export interface GMxmlHttpRequestChromeEvent extends GMxmlHttpRequestResponse {
    /** **event** which event caused the provided feedback */
    event: string;
}

export interface GMxmlHttpRequestProgressEvent extends GMxmlHttpRequestEvent {
    /** **lengthComputable** - sometimes, total is 0. No idea why, but if it is, this is false. */
    lengthComputable: boolean;

    /** **loaded** - size of data loaded, in bytes */
    loaded: number;

    /** **total** - total size of the download, in bytes */
    total: number;
}

export interface GMxmlHttpRequestResponse extends GMxmlHttpRequestEvent {
    /** **responseHeaders** - the request response headers */
    responseHeaders: string;

    /**
     * **response** -  returns the response's body content as an ArrayBuffer, Blob, Document, JavaScript Object, or DOMString,
     * depending on the value of the request's responseType property.
     */
    response: any;

    /**
     * **responseXML** - returns a Document containing the HTML or XML retrieved by the request;
     * or null if the request was unsuccessful, has not yet been sent, or if the data can't be parsed as XML or HTML.  
     * **Note:** The name responseXML is an artifact of this property's history; it works for both HTML and XML.
     */
    responseXML: Document;

    /**
     * **responseText** - Returns a DOMString that contains the response to the request as text,
     * or null if the request was unsuccessful or has not yet been sent.
     */
    responseText: string;
}

export interface GMxmlHttpRequestError extends GMxmlHttpRequestEvent {
    /** Error message sometimes returned by Tampermonkey */
    error: string;
}

export interface GMDownloadDetails {
    /** **url** - the URL from where the data should be downloaded (required) */
    url: string;

    /** **name** - the filename - for security reasons the file extension needs to be whitelisted at Tampermonkey options page (required) */
    name: string;

    /** **headers** - see GM_xmlhttpRequest for more details */
    headers?: string;

    /** **saveAs** - boolean value, show a saveAs dialog */
    saveAs?: boolean;

    /** **onerror** callback to be executed if this download ended up with an error */
    onerror?(event: GMxmlHttpRequestError): void;

    /** **onprogress** callback to be executed if this download made some progress */
    onprogress?(event: GMxmlHttpRequestProgressEvent): void;

    /** **ontimeout** callback to be executed if this download failed due to a timeout */
    ontimeout?(event: GMxmlHttpRequestEvent): void;

    /** **onload** callback to be executed if this download finished */
    onload?(event: GMxmlHttpRequestResponse): void;
}
