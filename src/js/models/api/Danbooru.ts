/* Type definitions for the Danbooru Javascript methods */

import XM from "./XM";

export default class Danbooru {

    private static _cachedModules: any;
    private static get Modules(): any {
        if (!this._cachedModules) this._cachedModules = XM.Window["Danbooru"];
        return this._cachedModules;
    }

    private static get hasModules(): boolean {
        return !!this.Modules && Object.keys(this.Modules).length > 0;
    }

    public static Autocomplete = {
        initialize_all(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Autocomplete.initialize_all();
        }
    }

    public static Blacklist = {
        apply(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.apply();
        },

        initialize_anonymous_blacklist(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.initialize_anonymous_blacklist();
        },

        initialize_all(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.initialize_all();
        },

        initialize_disable_all_blacklists(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.initialize_disable_all_blacklists();
        },

        stub_vanilla_functions(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.apply = (): void => { return; };
            Danbooru.Modules.Blacklist.initialize_disable_all_blacklists = (): void => { return; };
            Danbooru.Modules.Blacklist.initialize_all = (): void => { return; };
        },

        postShow(post: JQuery<HTMLElement>) {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.postShow(post);
        },

        postHide(post: JQuery<HTMLElement>) {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.postHide(post);
        },
    }

    public static get DTextFormatter() { return this.Modules?.DTextFormatter; }

    /** The page-side jQuery instance. Required when interacting with page-side jQuery state (e.g. `.data()`), since the userscript runs in a sandbox with its own jQuery. */
    public static get jQuery(): typeof $ | undefined { return XM.Window["jQuery"]; }

    public static notice(input: string, permanent?: boolean): void {
        this.Modules?.notice(input, permanent);
    }

    public static error(input: string): void {
        this.Modules?.error(input);
    }
}
