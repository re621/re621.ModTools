import { PageDefinition } from "../models/data/Page";
import User from "../models/data/User";
import { DialogForm } from "../models/structure/DialogForm";
import { TemplateBuilder, TemplateData } from "../models/structure/TemplateBuilder";
import { html } from "../utilities/HtmlTemplate";
import Util from "../utilities/Util";
import Component from "./Component";

const DEFAULT_GREETING = "Hi %reporterName%,\n\n";

export default class AppealReasons extends Component {

	private builder?: TemplateBuilder;
	/** The name of the user who filed the appeal. Used for `%reporterName%` substitution. */
	private reporterName = "";
	private isEnabled: boolean;

	public constructor() {
		super({
			constraint: PageDefinition.appeals.view,
			waitForDOM: "textarea[name='appeal[response]']",
			dependencies: [],
		});
		this.isEnabled = User.isJanitor || User.isModerator || User.isAdmin;
	}

	public static get defaultTemplates(): TemplateData[] {
		return [
			{ title: "Approved", body: "Your appeal has been accepted and the post has been restored." },
			{ title: "Rejected", body: "Your appeal has been rejected and the post will remain deleted." },
		];
	}

	public Settings: { enabled: boolean; buttons: TemplateData[]; insertMode: "replace" | "insert"; greeting: string; } = {
		enabled: true,
		buttons: AppealReasons.defaultTemplates,
    insertMode: "replace",
		greeting: DEFAULT_GREETING,
	};

  private readonly settingsButtonLabel = "Appeal Template Settings";
	protected create(): Promise<void> {
		if (!this.isEnabled) return Promise.resolve();
    Util.DOM.addSettingsButton({
      id: this.settingsButtonLabel.replace(/\s+/g, "-"),
      name: this.settingsButtonLabel,
      onClick: () => this.onSettingsButton(),
    });

		const target = document.querySelector<HTMLTextAreaElement>("textarea[name='appeal[response]']");
		if (!target) return Promise.resolve();

		this.reporterName = document.querySelector<HTMLElement>("#c-appeals .appeal-display-report-creator a")?.innerText ?? "";

    const scopedInsertMode = () => this.Settings.insertMode;
		this.builder = new TemplateBuilder({
			targetField: target,
			label: "Appeal reply templates",
			get insertMode() { return scopedInsertMode(); },
			defaults: AppealReasons.defaultTemplates,
			getTemplates: () => this.Settings.buttons,
			setTemplates: (next) => { this.Settings.buttons = next; },
			transform: (template) => {
				const greeting = this.Settings.greeting;
				const text = greeting.includes("%body%")
					? greeting.replace("%body%", template.body)
					: `${greeting}${template.body}`;
				return text.replace(/%reporterName%/g, this.reporterName);
			},
			pinnedChip: {
				title: "Greeting",
				getBody: () => this.Settings.greeting,
				setBody: (body) => { this.Settings.greeting = body; },
				defaultBody: DEFAULT_GREETING,
			},
		});
		this.builder.mount();
		return Promise.resolve();
	}

	protected async destroy(): Promise<void> {
		this.builder?.destroy();
	}
  
  /**
	 * The callback to execute when the settings button is pressed.
	 * 
	 * NOTE: Dependent on proper `this` binding; assign to events in a callback.
	 * @returns false to stop propagation & prevent default.
	 */
  protected onSettingsButton(): false {
    DialogForm.getRequestedInput(
      [
        $(html`<fieldset title="How should the button's text be added to the text box?">
            <legend>Text insertion mode</legend>
            <label for="setting-insertMode-insert" title="Insert the text at the cursor position.">Insert <input type="radio" id="setting-insertMode-insert" name="setting-insertMode" value="insert"${(this.Settings.insertMode ?? "insert") === "insert" ? " checked" : ""} /></label>
            <label for="setting-insertMode-replace" title="Replace the entire contents of the text box.">Replace <input type="radio" id="setting-insertMode-replace" name="setting-insertMode" value="replace"${this.Settings.insertMode === "replace" ? " checked" : ""} /></label>
          </fieldset>` as HTMLFieldSetElement),
        $(`<br />`),
      ],
      this.settingsButtonLabel,
      (e: FormData) => {
        const v = e.get("setting-insertMode");
        if (v && (v === "insert" || v === "replace")) this.Settings.insertMode = v;
      },
    );

    // Stop propagation & prevent default.
    return false;
  }
}
