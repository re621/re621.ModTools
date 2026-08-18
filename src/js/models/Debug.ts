import XM from "./api/XM";
import Script from "./data/Script";

/** @todo Support granular log levels */
export default class Debug {

  public static get Enabled(): boolean { return XM.Storage.getValue("Debug.enabled", false); }
  public static set Enabled(value: boolean) {
    if (!value) XM.Storage.deleteValue("Debug.enabled");
    else XM.Storage.setValue("Debug.enabled", true);
  }

  public static get Connect(): boolean { return XM.Storage.getValue("Debug.connect", false); }
  public static set Connect(value: boolean) {
    if (!value) XM.Storage.deleteValue("Debug.connect");
    else XM.Storage.setValue("Debug.connect", true);
  }

  public static get Perform(): boolean { return XM.Storage.getValue("Debug.perform", false); }
  public static set Perform(value: boolean) {
    if (!value) XM.Storage.deleteValue("Debug.perform");
    else XM.Storage.setValue("Debug.perform", true);
  }

  public static get Vivaldi(): boolean { return XM.Storage.getValue("Debug.vivaldi", false); }
  public static set Vivaldi(value: boolean) {
    if (!value) XM.Storage.deleteValue("Debug.vivaldi");
    else XM.Storage.setValue("Debug.vivaldi", true);
  }


  /** Logs the provided data into the console log if debug is enabled */
  public static log(message?: any, ...optionalParams: any[]): void {
    if (Debug.Enabled) console.log(message, ...optionalParams);
  }

  public static prefixAlwaysPrints = true;
  /** 
   * Some consoles add a delimiting space between trailing concatenated
   * parameters to `console.log` et al; this accounts for that.
   */
  public static omitSpaceWhenNonFormatted = true;

  /**
   * Logs the provided data into the console log with the colored project name
   * prefix if {@link Enabled} is enabled or {@link prefixAlwaysPrints} is true.
   */
  public static logPrefix(message?: any, ...optionalParams: any[]): void {
    if (!Debug.prefixAlwaysPrints && !Debug.Enabled) return;
    if (typeof message === "string" && /%(?:(?:\.[0-9]+)?[dif]|[oOsc])/.test(message))
      console.log(`%c[${Script.projectNameFormatted}]%c ` + message, "color: maroon", "color: unset", ...optionalParams);
    else
      console.log(`%c[${Script.projectNameFormatted}]%c${this.omitSpaceWhenNonFormatted ? "" : " "}`, "color: maroon", "color: unset", message, ...optionalParams);
  }

  /** Logs the provided data as a table */
  public static table(obj: any, properties?: readonly string[]): void {
    if (!Debug.Enabled) return;
    console.table(obj, properties as string[]);
  }

  /** Logs the provided data into the console log if connections logging is enabled */
  public static connectLog(...data: any[]): void {
    if (Debug.Connect) console.log("CONNECT", ...data);
  }

  /** Logs the provided data into the console log if performance logging is enabled */
  public static perfStart(input: string): void {
    if (Debug.Perform) console.time(input);
  }

  /** Logs the provided data into the console log if performance logging is enabled */
  public static perfEnd(input: string): void {
    if (Debug.Perform) console.timeEnd(input);
  }

}