import REMT from "../../REMT";
import { PageDefinition } from "../models/data/Page";
import Debug from "../models/Debug";
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
	}

	public Settings = {
		enabled: true,
    doShow: true,
    addAnthro: false,
    forceConfirm: false,
	};

	protected override create() {
    try {
      Util.DOM.addSettingsButton({
        id: "RemoveHumanoidSettings",
        name: "Mod Tools Settings",
        onClick: () => this.onSettingsButton(),
      });
    } catch (error) {
      Debug.log(error);
    }
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
    const button = html`<button id=remove-humanoid-tags-button title="Deletes all tags matching '*humanoid'${this.Settings.addAnthro ? " & adds the 'anthro' tag" : ""}.">Delete <code>*humanoid</code> tags</button>` as HTMLButtonElement;
    button.onclick = () => {
      if (this.Settings.forceConfirm && !confirm(`Are you sure you want to remove all of the following tags${this.Settings.addAnthro ? " & add the 'anthro' tag" : ""}?\n${humanoid.join("\n")}`))
        return;
      REMT.API.Posts.update(idNum, {
        tag_string_diff: `${humanoid.map(e => `-${e}`).join(" ")}${this.Settings.addAnthro ? " anthro" : ""}`.trimStart(),
      }).then(() => location.reload());
    };
    const sidebar = Util.DOM.querySelector<HTMLDivElement>(".sidebar");
    sidebar.insertAdjacentElement("afterbegin", button);
    sidebar.insertAdjacentElement("afterbegin", html`<br />`);
    sidebar.insertAdjacentElement("afterbegin", html`<br />`);
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
        $(`<label for="setting-doShow" title="Should the button be loaded onto this page next time?">Show remove humanoid button? <input type="checkbox" id="setting-doShow" name="setting-doShow" value="true" ${this.Settings.doShow ? "checked" : ""}></input></label>`),
        $(`<br />`),
        $(`<label for="setting-addAnthro" title="Should the button also add anthro next time?">Add anthro? <input type="checkbox" id="setting-addAnthro" name="setting-addAnthro" value="true" ${this.Settings.addAnthro ? "checked" : ""}></input></label>`),
        $(`<br />`),
        $(`<label for="setting-forceConfirm" title="Should you need to confirm the edit first?">Force Confirm? <input type="checkbox" id="setting-forceConfirm" name="setting-forceConfirm" value="true" ${this.Settings.forceConfirm ? "checked" : ""}></input></label>`),
        $(`<br />`),
      ],
      "Mod Tools Settings",
      (e: FormData) => {
        this.Settings.doShow = e.get("setting-doShow") === "true";
        this.Settings.addAnthro = e.get("setting-addAnthro") === "true";
        this.Settings.forceConfirm = e.get("setting-forceConfirm") === "true";
      },
    );

    // Stop propagation & prevent default.
    return false;
  }
}
