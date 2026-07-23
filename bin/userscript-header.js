const pkg = require('../package.json');
const pkgLock = (() => {
    try {
        return require('../package-lock.json');
    } catch (error) {
        return undefined;
    }
})();
const fs = require('node:fs');
const bunLock = (() => {
    try {
        const contents = fs.readFileSync("../bun.lock", { encoding: "utf-8" });
        return JSON.parse(contents.replace(/,$(?=\s+[}\]])/gm, ""));
    } catch (error) {
        return undefined;
    }
})();
// It's an indirect dependency, but it's not required.
const chalk = (() => {
    try {
        return require("chalk");
    } catch (error) {
        return undefined;
    }
})();
function tryChalk(funcName, text) {
    return chalk?.[funcName]?.(text) ?? text;
}

const fallbacks = {
    "jquery": "3.6.0",
    "jquery-ui": "1.12.1",
    "@re621/zestyapi": "latest",
    "jquery.hotkeys": "0.2.0",
}
/**
 * Attempts to retrieve the version of the dependency directly from the package
 * manager's lockfile.
 *
 * Ensures the dependency referenced by the script is exactly the same as the
 * one used in development; prior to this, both the `jquery-ui` &
 * `jquery.hotkeys` dependencies were actually referencing a newer & older
 * version (respectively) in the development environment than the version
 * requested by the userscript with the previously static `require` strings.
 *
 * Attempts to pull from both an NPM `package-lock.json` file and a Bun
 * `bun.lock` file to make a potential future package manager change smoother.
 * @param {string} key 
 * @returns {string}
 */
function getDependencyVersion(key) {
    console.info("Attempting to retrieve version info for %s; starting with 'package-lock.json'...", key);
    const fromPkgLock = pkgLock?.packages?.[`node_modules/${key}`]?.version;
    const fromBunLock = bunLock?.packages?.[key]?.[0]?.match(new RegExp(`^${RegExp.escape(key)}@([0-9.]+)$`))?.[1];
    if (fromPkgLock) {
        if (fromBunLock && fromPkgLock !== fromBunLock) console.warn(tryChalk("yellowBright", "[WARNING]") + ": version from 'package-lock.json' (%s) & 'bun.lock' (%s) are not the same; if you're using Bun for package installation, be sure to update 'package-lock.json' with NPM before submitting a PR.", fromPkgLock, fromBunLock);
        return fromPkgLock;
    }
    console.warn("Failed to find version from 'package-lock.json'...");
    
    if (fromBunLock) return fromBunLock;
    console.warn("Failed to find version from 'bun.lock'...");
    const fromFallbacks = fallbacks[key];
    if (fromFallbacks) return fromFallbacks;
    throw new Error(`Failed to find version for ${key}`);
}

module.exports = {
    name: pkg.displayName,
    namespace: pkg.namespace,
    version: pkg.version,
    author: pkg.author,
    description: pkg.description,
    license: pkg.license,

    homepageURL: pkg.homepage,
    supportURL: pkg.homepage + "/issues",
    icon: "https://cdn.jsdelivr.net/gh/re621/re621@master/assets/icon64.png",
    icon64: "https://cdn.jsdelivr.net/gh/re621/re621@master/assets/icon64.png",

    updateURL: pkg.homepage + "/releases/latest/download/script.meta.js",
    downloadURL: pkg.homepage + "/releases/latest/download/script.user.js",

    match: pkg.config.domains.map(e => `https://${e}/*`),

    require: [
        `https://cdnjs.cloudflare.com/ajax/libs/jquery/${getDependencyVersion("jquery")}/jquery.min.js`,
        `https://cdnjs.cloudflare.com/ajax/libs/jqueryui/${getDependencyVersion("jquery-ui")}/jquery-ui.min.js`,
        `https://cdn.jsdelivr.net/npm/@re621/zestyapi@${getDependencyVersion("@re621/zestyapi")}/dist/ZestyAPI.min.js`,
        `https://cdnjs.cloudflare.com/ajax/libs/jquery.hotkeys/${getDependencyVersion("jquery.hotkeys")}/jquery.hotkeys.min.js`,
    ],

    grant: [
        "GM_info",
        "GM_setValue",
        "GM_getValue",
        "GM_deleteValue",
        "GM_listValues",
        "GM_addValueChangeListener",
        "GM_removeValueChangeListener",
        "GM_setClipboard",
        "GM_getResourceText",
        "GM_xmlhttpRequest",
        "GM_openInTab",
        "GM_download",
    ],

    connect: [
        ...(pkg.config.staticDomains ?? pkg.config.domains.map(e => `static1.${e}`)),
        "*",
    ],

    "run-at": "document-start",
};
