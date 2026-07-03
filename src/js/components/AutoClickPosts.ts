import Danbooru from "../models/api/Danbooru";
import { PageDefinition } from "../models/data/Page";
import { html } from "../utilities/HtmlTemplate";
import Component from "./Component";
    
/**
 * @todo What does this do?
 */
export default class AutoClickPosts extends Component {
  private static readonly modeBoxSelector = "#mode-box";
  private static readonly matchesBlacklistClass = "filter-matches";
  private static readonly isBlacklistedClass = "blacklisted";
  private static readonly re621Matcher = ".post-index #content post";
  private static readonly buttonLabel = "Auto-Click Posts";
  private static readonly buttonLabelWaiting = "Cancel Auto-Clicks";
  public constructor() {
    super({
      constraint: PageDefinition.posts.list,
      waitForDOM: ".posts-container article.thumbnail",
    });
  }

  Settings = {
    enabled: true,
    clickBlacklisted: false,
    clickDisabledFilter: true,
    rateLimit: false,
    rateLimitValue: 2500,
    testMode: false,
  };

  private get modifierSelector() {
    if (this.Settings.clickBlacklisted) return "";
    if (this.Settings.clickDisabledFilter) return `:not(.${AutoClickPosts.isBlacklistedClass})`;
    return `:not(.${AutoClickPosts.matchesBlacklistClass})`;
  }

  private timeout?: number;
  private timeouts: number[] = [];
  private get isWaiting(): boolean { return this.button?.dataset["waiting"] === "true"; }
  private set isWaiting(value) {
    const button = this.button;
    if (!button) return;
    if (value) {
      button.dataset["waiting"] = "true";
      button.innerText = AutoClickPosts.buttonLabelWaiting;
    } else {
      button.dataset["waiting"] = "false";
      button.innerText = AutoClickPosts.buttonLabel;

      window.clearTimeout(this.timeout);
      this.timeouts.splice(0, this.timeouts.length);
    }
  }
  private button?: HTMLButtonElement;
  private modeBox?: HTMLDivElement;
  protected create(): Promise<void> {
    const modeBox = this.modeBox = document.querySelector<HTMLDivElement>(AutoClickPosts.modeBoxSelector) ?? undefined;
    if (!modeBox) return Promise.resolve();
    this.initSettingsMenu();
    const button = this.button = html`<button id="auto-click-button">${AutoClickPosts.buttonLabel}</button>` as HTMLButtonElement;
    button.onclick = () => this.onButtonClick();
    modeBox.insertAdjacentElement("afterend", button);
    return Promise.resolve();
  }

  private onButtonClick() {
    const elements = Array.from(document.querySelectorAll<HTMLElement>(`.posts-container > article.thumbnail${this.modifierSelector}`));
    if (elements.length <= 0) {
      Danbooru.Toast.notice("No posts match criteria!");
      return;
    }
    if (!this.isWaiting) {
      if (this.Settings.testMode) {
        console.log("%s Elements to click; %o", elements.length, elements);
        if (!confirm(`Do you want to click ${elements.length} elements?`)) return;
      }
      if (!this.Settings.rateLimit) {
        // if (this.Settings.testMode) {
        //   console.log("Simulating click of every post (no rate limit)...");
        //   return;
        // }
        if (this.Settings.testMode) console.log("Simulating click of every post (no rate limit)...");
        // Click all posts on the page.
        elements.forEach(
          this.Settings.testMode ? 
            ((e, i) => console.log("Simulated click #%s (post #%s; %o)", i + 1, e.dataset["id"], e)) : 
            (e => e.click()),
        );
        return;
      }
      Danbooru.Toast.notice(`Rate limiting; will take ${(this.Settings.rateLimitValue * elements.length) / 1000} seconds to complete.`);
      this.isWaiting = true;
      // Click all posts on the page with delay; be sure to cancel the operation if you get warnings about going too fast.
      elements.forEach((e, i) => this.timeouts.push(window.setTimeout(
        this.Settings.testMode ?
          (() => console.log("Simulated click #%s (post #%s; %o) w/ a delay of %s", i + 1, e.dataset["id"], e, i * this.Settings.rateLimitValue)) :
          (() => e.click()),
        i * this.Settings.rateLimitValue,
      )));
      // Reverses the order for cancellation (to cancel the most likely to be unfinished ones first).
      this.timeouts.reverse();
      this.timeout = window.setTimeout(() => this.isWaiting = false, (elements.length - 1) * this.Settings.rateLimitValue);
      return;
    }
    if (this.Settings.testMode) {
      console.log("%s Elements to cancel; %o", elements.length, elements);
      if (!confirm(`Do you want to cancel ${elements.length} clicks?`)) return;
    }
    Danbooru.Toast.notice("Canceling!");
    this.timeouts.forEach(e => clearTimeout(e));
    this.isWaiting = false;
  }

  private initSettingsMenu() {
    this.settingsMenuDialogParameters = {
      elements:[
        $(this.simpleSettingsCheckbox("testMode", undefined)),
        $(`<br />`),
        $(this.simpleSettingsCheckbox("clickBlacklisted", undefined, "Should posts currently hidden by your active blacklist filters be clicked?")),
        $(`<br />`),
        $(this.simpleSettingsCheckbox("clickDisabledFilter", undefined, "Should any posts that match your blacklist filters (disabled or not) be clicked?")),
        $(`<br />`),
        $(this.simpleSettingsCheckbox("rateLimit", undefined, "Should the clicks be rate-limited? Required to avoid errors when favoriting/unfavoriting.")),
        $(`<br />`),
        $(this.simpleSettingsNumber("rateLimitValue", "Rate Limit (in Milliseconds)", "How long should we wait between button clicks?", {min: 2000})),
        // $(`<label for="${this.settingsIdPrefix}buttons" title=""><textarea id="${this.settingsIdPrefix}buttons" name="${this.settingsIdPrefix}buttons">${JSON.stringify(this.Settings.buttons, undefined, 2)}</textarea></label>`),
        $(`<br />`),
        $(this.resetSettingsDialogElement),
        $(`<br />`),
      ],
      optionsOrTitle: "Auto-Click Posts Settings",
      then: (e: FormData) => {
        if (this.handleResetSettingsDialogElement(e)) return;
        this.Settings.testMode = e.get(`${this.settingsIdPrefix}testMode`) === "true";
        this.Settings.clickBlacklisted = e.get(`${this.settingsIdPrefix}clickBlacklisted`) === "true";
        this.Settings.clickDisabledFilter = e.get(`${this.settingsIdPrefix}clickDisabledFilter`) === "true";
        this.Settings.rateLimit = e.get(`${this.settingsIdPrefix}rateLimit`) === "true";
        this.Settings.rateLimitValue = Number(e.get(`${this.settingsIdPrefix}rateLimitValue`) ?? this.Settings.rateLimitValue);
      }};
  }
}
