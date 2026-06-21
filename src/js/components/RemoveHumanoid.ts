import REMT from "../../REMT";
import { PageDefinition } from "../models/data/Page";
import { DialogForm } from "../models/structure/DialogForm";
import { html } from "../utilities/HtmlTemplate";
import Util from "../utilities/Util";
import Component from "./Component";

export default class RemoveHumanoid extends Component {
	public constructor() {
		super({
			constraint: PageDefinition.posts.view,
			waitForDOM: ".sidebar",
		});
    console.log("Ctor");
	}

	public Settings = {
		enabled: true,
    doShow: true,
	};

	protected create(): Promise<void> {
    console.log("create");
    Util.DOM.addSettingsButton({
      id: "ReportContentDataSettings",
      name: "Mod Tools Settings",
      onClick: () => this.onSettingsButton(),
    });
    if (!this.Settings.doShow) return Promise.resolve();
    const id = /^\/posts\/([0-9]+)/.exec(window.location.pathname)?.[1];
    if (!id) return Promise.resolve();
    const idNum = Number.parseInt(id);
    const tags = Array.from(document.querySelectorAll<HTMLLIElement>(".tag-list-item")).reduce((p, e) => {
      const tag = e.dataset["name"];
      if (tag) p.push(tag);
      return p;
    }, [] as string[]);
    const humanoid = tags.filter(e => e && /humanoid$/.test(e));
    const button = html`<button>Delete *Humanoid, add anthro</button>` as HTMLButtonElement;
    button.onclick = () => {
      REMT.API.Posts.update(idNum, {
        tag_string_diff: `${humanoid.map(e => `-${e}`).join(" ")} anthro`,
      }).then(() => location.reload());
    };
    Util.DOM.querySelector<HTMLDivElement>(".sidebar").insertAdjacentElement("afterbegin", button);
		return Promise.resolve();
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
        $(`<label for="setting-doShow" title="Should the button be loaded onto this page next time?">Show remove humanoid button? <input type="checkbox" id="setting-doShow" name="setting-doShow" value="true" ${this.Settings.doShow ? "checked" : ""}></input></label><br />`),
      ],
      "Mod Tools Settings",
      (e: FormData) => this.Settings.doShow = e.get("setting-doShow") === "true",
    );

    // Stop propagation & prevent default.
    return false;
  }
}
