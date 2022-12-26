import REMT from "../../REMT";
import XM from "../models/api/XM";
import KeybindManager, { Keybind, ResponseFunction } from "../models/data/Keybinds";
import Page from "../models/data/Page";
import PageObserver from "../models/structure/PageObserver";
import ErrorHandler from "../utilities/ErrorHandler";
import Util from "../utilities/Util";

export default class Component {

    protected name: string;                         // Unique identifier for this component. Defaults to the class name.

    private initialized = false;                    // Whether or not the component is currently running
    private eventIndex = 0;                         // Used to provide IDs to the component event listeners
    private constraintMatches: boolean;             // Whether or not the declared page constraints match
    private DOMLoadConditions: boolean | string;    // DOM conditions that must be met for the component to load
    private waitForFocus: boolean;                  // Wait for the window to come into focus before loading
    private dependencies: string[];                 // List of components names that need to be enabled

    // Component settings
    // The Settings object defines default values and is used to access them via dynamic setters and getters
    // The SettingsCache object stores the current values of the settings
    public Settings: Settings = {
        enabled: true,
    };
    private SettingsDefaults: Settings;
    private SettingsCache: Settings;

    public Keybinds: KeybindDefinition[] = [];

    public constructor(options: ComponentOptions = {}) {

        // Validate the options
        if (options.name) this.name = options.name;
        else this.name = this.constructor.name;

        if (!options.constraint) options.constraint = [];
        else if (!Array.isArray(options.constraint)) options.constraint = [options.constraint];
        this.constraintMatches = options.constraint.length == 0 || Page.matches(options.constraint);

        if (!options.waitForDOM) options.waitForDOM = false;
        this.DOMLoadConditions = options.waitForDOM;
        this.waitForFocus = options.waitForFocus || false;

        this.dependencies = options.dependencies || [];

        // Initialize the settings cache
        this.SettingsCache = {
            enabled: true,
        };
    }

    /** Loads the settings from storage, and sets up listeners to sync them across tabs */
    public async bootstrapSettings(settings?: Settings): Promise<void> {
        this.SettingsDefaults = { enabled: true };

        // Load in the saved settings values
        for (const [key, defaultValue] of Object.entries(settings || this.Settings)) {

            const savedValue = XM.Storage.getValue(this.name + "." + key, defaultValue);
            this.SettingsCache[key] = savedValue;
            this.SettingsDefaults[key] = defaultValue;
            delete this.Settings[key];

            // Define custom setters and getters
            Object.defineProperty(this.Settings, key, {
                get: () => {
                    // Debug.log("- fetching", passedThis.name + "." + key);
                    return this.SettingsCache[key];
                },
                set: (newValue) => {
                    // Debug.log("- setting", passedThis.name + "." + key, newValue);
                    if (JSON.stringify(newValue) == JSON.stringify(defaultValue)) {
                        this.SettingsCache[key] = defaultValue;
                        XM.Storage.deleteValue(this.name + "." + key);
                    } else {
                        this.SettingsCache[key] = newValue;
                        XM.Storage.setValue(this.name + "." + key, newValue);
                    }
                }
            })

            // Sync settings between tabs
            XM.Storage.addListener(this.name + "." + key, (settingsTag, oldValue, newValue, remote) => {
                // Reset to default
                if (typeof newValue == "undefined") newValue = this.SettingsDefaults[key];

                // Only update if the event came from another tab
                // Otherwise, the value is already correct, and we don't need an infinite loop
                if (remote) this.SettingsCache[key] = newValue;
                else newValue = this.SettingsCache[key];

                this.trigger("settings." + key + "-" + (remote ? "remote" : "local"), newValue);
                this.trigger("settings." + key, newValue);
            });
        }

        this.trigger("bootstrap");
    }

    /**
     * Loads the component's functionality.  
     * Aborted if some of the load conditions do not match.
     */
    public async load(): Promise<void> {
        if (!this.constraintMatches || !this.Settings.enabled) return Promise.resolve();

        for (const one of this.dependencies) {
            if (!REMT.Registry[one].Settings.enabled)
                return Promise.resolve();
        }

        return this.execPrepare()
            .then(async () => {
                // Wait for the window to come into focus
                if (this.waitForFocus)
                    await PageObserver.awaitFocus();

                // Determine when to create the DOM structure
                if (typeof this.DOMLoadConditions == "string") {
                    PageObserver.watch(this.DOMLoadConditions).then((status) => {
                        if (!status) {
                            // TODO Page loaded, but the element was not found
                            return;
                        }
                        this.execCreate();
                    });
                } else if (this.DOMLoadConditions) {
                    $(() => this.execCreate());
                } else this.execCreate();
                this.trigger("load");
            });
    }

    /** Unloads the component's functionality and returns the DOM to its original state */
    public async unload(): Promise<void> {
        await this.execDestroy();
        this.trigger("unload");
    }

    /** Restarts the component. Shorthand for running `unload()` and `load()`. */
    public async reload(delay?: number): Promise<void> {
        await this.unload();
        if (delay)
            await Util.sleep(delay);
        await this.load();
    }

    /**
     * Loads necessary component data.
     * Executed before any initialization occurs, and runs even if the load conditions do not match
     */
    protected async prepare(): Promise<void> { }

    /** Runs the component's `prepare()` function and loads settings */
    private async execPrepare(): Promise<void> {
        try { await this.prepare(); }
        catch (error) {
            ErrorHandler.write(`[${this.name}] Fatal crash during "prepare"`, error)
            return;
        }
        this.trigger("prepare");
    }

    /**
     * Creates the component's DOM structure.  
     * Executed as soon as the load conditions match.
     */
    protected async create(): Promise<void> { }

    /** Runs the component's `create()` function, sets corresponding variables and triggers events. */
    private async execCreate(): Promise<void> {
        if (this.initialized) {
            ErrorHandler.write(`[${this.name}] Attempted to create an initialized module`, new Error());
            return;
        }

        try { await this.create(); }
        catch (error) {
            ErrorHandler.write(`[${this.name}] Fatal crash during "create"`, error);
            return;
        }
        this.resetHotkeys();
        this.initialized = true;
        this.trigger("create");
    }

    /**
     * Completely removes the component's DOM structure and restores the original state.  
     * Typically executed when a component is disabled.
     */
    protected async destroy(): Promise<void> { }

    private async execDestroy(): Promise<void> {
        if (!this.initialized) {
            // TODO Throw an error?
            return;
        }

        try { await this.destroy(); }
        catch (error) {
            // TODO Error handling
        }
        this.initialized = false;
        this.trigger("destroy");
    }

    public async resetHotkeys(): Promise<void> {
        const keyMeta: string[] = [];
        const keybindObj: Keybind[] = [];

        const enabled = this.constraintMatches && this.Settings.enabled;
        for (const keybind of this.Keybinds) {
            const meta = this.getName() + "." + keybind.keys;

            const keys = (this.Settings[keybind.keys] as string).split("|");
            if (keybind.ignoreShift) {
                // This is dumb, but it works for most cases
                // The function will be executed even if shift is also pressed
                for (const key of [...keys]) keys.push("shift+" + key);
            }

            keybindObj.push({
                keys: keys,
                fnct: keybind.response,
                bindMeta: meta,
                enabled: enabled && (!keybind.page || Page.matches(keybind.page)),
                element: keybind.element,
                selector: keybind.selector,
                holdable: keybind.holdable,
            });

            keyMeta.push(meta);
        }

        KeybindManager.unregister(keyMeta);
        KeybindManager.register(keybindObj);
    }

    /** Execute all handlers for the specified component event */
    public trigger(event: string, data?: PrimitiveType | PrimitiveType[] | PrimitiveMap): void {
        $(document).trigger(`remt.${this.name}.${event}`, data);
    }

    /** 
     * Attach a handler function for the specified event to the component
     * @returns Event ID, unique to this component, that can be used to unbind this handler
     */
    public on(event: string, handler: (event: JQuery.TriggeredEvent, data?: PrimitiveType | PrimitiveType[] | PrimitiveMap) => void): number {
        const eventList = event.split(" ");
        for (const one of eventList)
            $(document).on(`remt.${this.name}.${one}.${this.eventIndex}`, handler);
        return this.eventIndex++;
    }

    /** Executes a handler function exactly once whe encountering a specified event */
    public one(event: string, handler: (event: JQuery.TriggeredEvent, data?: PrimitiveType | PrimitiveType[] | PrimitiveMap) => void): void {
        $(document).one(`remt.${this.name}.${event}`, handler);
    }

    /** Detaches handlers from the specified component event */
    public off(event: string, eventID?: number): void {
        $(document).off(`remt.${this.name}.${event}` + (eventID ? `.${eventID}` : ""));
    }

    public getName(): string { return this.name; }

    public updateContentHeader(headers: { [name: string]: boolean }, selector = "body") {
        const content = $(selector);

        for (const [name, value] of Object.entries(headers))
            setContentParameter(name, value);

        function setContentParameter(name: string, value: boolean): void {
            if (value) content.attr(name, "true");
            else content.removeAttr(name);
        }
    }
}

/**
 * Component options.  
 * Not a lot of validation is done on these, so make sure the provided values are correct.
 */
export interface ComponentOptions {

    /**
     * By default, the settings use the component's class name to prefix the variable name.  
     * Useful for maintaining backwards compatibility, or to standardize more unusual class names.
     */
    name?: string;

    /**
     * Regular expressions that matches the pages the component should run on.  
     * Raw RegExp are acceptable, but using the pre-saved `PageDefinition` values is recommended.
     * */
    constraint?: RegExp | RegExp[],

    /**
     * Defines when the component initializes.  
     * * `true`: the component waits for the page to load before initializing
     * * `[string]`: query selector that must exist for the component to start loading
     * * `false`: start loading the component as soon as possible
     */
    waitForDOM?: string | boolean;

    /**
     * Delays the component creation until the window comes into focus.  
     * This is usually relevant for components that make extensive changes to DOM,
     * or make requests to the API on page load.
     * * `true`: the component will wait for the window to come into focus
     * * `false`: the component will begin loading immediately
     */
    waitForFocus?: boolean;

    /**
     * Other components that must be enabled in order for this one to initialize.
     */
    dependencies?: string[];
}

export interface ComponentList {
    [name: string]: Component;
}

export type PrimitiveType = string | number | boolean;
export type PrimitiveMap = {
    [prop: string]: PrimitiveType | PrimitiveType[];
}

export type JSONObject = {
    [prop: string]: PrimitiveType | PrimitiveType[] | JSONObject | JSONObject[];
}

interface Settings extends JSONObject {
    enabled: boolean;
}

interface KeybindDefinition {
    keys: string;               // Key the triggers the function
    response: ResponseFunction; // Function that is executed when the key is pressed
    element?: string;           // Element to which the listener gets bound. Defaults to `document`
    selector?: string;          // Selector within the element for deferred listeners. Defaults to `null`
    page?: RegExp | RegExp[];   // Pages on which the shortcuts must work. Leave blank for all.
    ignoreShift?: boolean;      // If true, the hotkey will work regardless if it's accompanied by a shift
    holdable?: boolean;         // If true, the function will run repeatedly as long as the key is held
}
