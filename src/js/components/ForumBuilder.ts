import { PageDefinition } from "../models/data/Page";
import { DialogForm } from "../models/structure/DialogForm";
import { TemplateBuilder, TemplateData } from "../models/structure/TemplateBuilder";
import { html } from "../utilities/HtmlTemplate";
import Util from "../utilities/Util";
import Component from "./Component";

export default class ForumBuilder extends Component {
	public Settings: { enabled: boolean; buttons: TemplateData[]; insertMode: "replace" | "insert"; } = {
		enabled: true,
		buttons: [],
    insertMode: "insert",
	};

	private builder?: TemplateBuilder;
	private builders?: TemplateBuilder[];

	public constructor() {
		super({
			constraint: PageDefinition.forums.view_or_post,
			waitForDOM: ".new_forum_post .dtext_formatter",
		});
	}

  private readonly settingsButtonLabel = "Forum Template Settings";
	protected create(): Promise<void> {
    Util.DOM.addSettingsButton({
      id: this.settingsButtonLabel.replace(/\s+/g, "-"),
      name: this.settingsButtonLabel,
      onClick: () => this.onSettingsButton(),
    });
		const target = document.querySelector<HTMLTextAreaElement>("form.new_forum_post textarea[name='forum_post[body]']");
		if (!target) return Promise.resolve();

		this.builder = this.instantiateAndMount(target);

    this.builders = Array.from(document.querySelectorAll<HTMLTextAreaElement>('form.edit_forum_post textarea[name="forum_post[body]"]')).map(target => this.instantiateAndMount(target));
		return Promise.resolve();
	}

	protected async destroy(): Promise<void> {
		this.builder?.destroy();
    this.builders?.forEach(e => e.destroy());
	}

  private instantiateAndMount(target: HTMLTextAreaElement, scopedInsertMode = () => this.Settings.insertMode) {
    const builder = new TemplateBuilder({
			targetField: target,
			label: "Forum templates",
      get insertMode() { return scopedInsertMode(); },
			getTemplates: () => this.Settings.buttons,
			setTemplates: (next) => { this.Settings.buttons = next; },
		});
		builder.mount();
    return builder;
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
