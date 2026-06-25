import REMT from "../../REMT";
import { PageDefinition } from "../models/data/Page";
import Debug from "../models/Debug";
import { DialogForm } from "../models/structure/DialogForm";
import { html } from "../utilities/HtmlTemplate";
import Util from "../utilities/Util";
import Component from "./Component";

type AutoTaggingAction = {
  removalPattern?: string,
  added?: string,
  label?: string,
  title?: string,
};

export default class AutoTaggingButtons extends Component {
	public constructor() {
		super({
			constraint: PageDefinition.posts.view,
			waitForDOM: ".sidebar",
		});
	}

	public Settings = {
		enabled: true,
    doShow: true,
    forceConfirm: false,
    reloadAfterEdit: true,
    buttons: [
      {
        removalPattern: "humanoid$",
        added: "anthro",
        label: "-*humanoid anthro",
        title: "Deletes all tags matching '*humanoid' & adds the 'anthro' tag"
      },
      {
        removalPattern: "humanoid$",
        // label: "*humanoid",
        // title: "Deletes all tags matching '*humanoid'"
      },
    ] as AutoTaggingAction[],
	};

	protected override create() {
    try {
      Util.DOM.addSettingsButton({
        id: "AutoTaggingButtonsSettings",
        name: "Auto Tag Edits Settings",
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

    for (const element of this.Settings.buttons) {
      if (!(element.added ?? element.removalPattern)) continue;
      this.addButton(element, tags, idNum);
    }
		return Promise.resolve();
	}

  private static escapeHtml(s: string) {
    return encodeURIComponent(s).replace(/%([0-9a-fA-F]{2})/, (e, g1) => `&#x${g1}`);
  }

  private addButton(a: AutoTaggingAction, tags: string[], id: number, showWhenInapplicable = false) {
    let diff: string | undefined, title: string | undefined, label: string | undefined;
    if (a.removalPattern) {
      const regex = new RegExp(a.removalPattern);
      const matchedTags = tags.filter(e => e && regex.test(e));
      if (matchedTags.length === 0 && !showWhenInapplicable) return;
      diff ??= "";
      diff += ` ${matchedTags.map(e => `-${e}`).join(" ")}`;
      title ??= a.title ?? `Deletes all tags matching '${a.label ?? AutoTaggingButtons.escapeHtml(a.removalPattern)}`;
      label ??= a.label ?? `<code>-*humanoid</code>`;
    }
    if (a.added) {
      const tagsToAdd = a.added.split(" ").reduce((p, e) => {
        if (e && (e = e.trim()).length > 0 && !tags.includes(e)) p.push(e);
        return p;
      }, [] as string[]);
      if (tagsToAdd.length > 0) {
        if (diff) {
          if (!a.title) title += ` & adds '${tagsToAdd.join(", ")}`;
          else title ??= a.title;
          if (!a.label) label += ` <code>${tagsToAdd.join(" ")}</code>`;
          else label ??= a.label;
        } else {
          title ??= a.title ?? `Adds '${tagsToAdd.join(", ")}`;
          label ??= a.label ?? `<code>${tagsToAdd.join(" ")}</code>`;
        }
        diff ??= "";
        diff += ` ${tagsToAdd.join(" ")}`;
      } else if (showWhenInapplicable) {
        diff ??= "";
        diff += tagsToAdd.join(" ");
      }
    }
    if (!diff/*  && !showWhenInapplicable */) return;
    diff = diff.trimStart();
    const button = html`<button class="re6-auto-tag-button" title="${title}"${!diff ? " disabled" : ""}>${label}</button>` as HTMLButtonElement;
    button.onclick = () => {
      if (this.Settings.forceConfirm && !confirm(`Are you sure you want to perform this edit?\n${diff}`))
        return;
      REMT.API.Posts.update(id, {
        tag_string_diff: diff,
      }).then(() => {
        if (this.Settings.reloadAfterEdit) location.reload();
      });
    };
    this.addToSidebar(button, true);
  }
  
  private addToSidebar(e: HTMLElement, withBrs = false) {
    const sidebar = Util.DOM.querySelector<HTMLDivElement>(".sidebar");
    sidebar.insertAdjacentElement("afterbegin", e);
    if (withBrs) {
      sidebar.insertAdjacentElement("afterbegin", html`<br />`);
      sidebar.insertAdjacentElement("afterbegin", html`<br />`);
    }
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
        $(`<label for="setting-doShow" title="Should any button be loaded onto this page next time?">Show buttons? <input type="checkbox" id="setting-doShow" name="setting-doShow" value="true" ${this.Settings.doShow ? "checked" : ""}></input></label>`),
        $(`<br />`),
        $(`<label for="setting-forceConfirm" title="Should you need to confirm the edit first?">Force Confirm? <input type="checkbox" id="setting-forceConfirm" name="setting-forceConfirm" value="true" ${this.Settings.forceConfirm ? "checked" : ""}></input></label>`),
        $(`<br />`),
        $(`<label for="setting-buttons" title="">Buttons in JSON<br /><textarea id="setting-buttons" name="setting-buttons">${JSON.stringify(this.Settings.buttons, undefined, 2)}</textarea></label>`),
        $(`<br />`),
      ],
      "Auto Tag Edits Settings",
      (e: FormData) => {
        this.Settings.doShow = e.get("setting-doShow") === "true";
        this.Settings.forceConfirm = e.get("setting-forceConfirm") === "true";
        this.Settings.buttons = JSON.parse(e.get("setting-buttons")?.toString() ?? JSON.stringify(this.Settings.buttons)) as AutoTaggingAction[];
      },
    );

    // Stop propagation & prevent default.
    return false;
  }
}
