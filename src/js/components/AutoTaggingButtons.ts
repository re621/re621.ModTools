import REMT from "../../REMT";
import Danbooru from "../models/api/Danbooru";
import { PageDefinition } from "../models/data/Page";
import ErrorHandler from "../utilities/ErrorHandler";
import { html } from "../utilities/HtmlTemplate";
import Util from "../utilities/Util";
import Component from "./Component";

type AutoTaggingAction = {
  removalPattern?: string,
  added?: string,
  // replacementPattern?: [string, string] | [string, { [k: string]: string }] | [string, { [k: string]: string }, string],
  reason?: string,
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

  private static readonly buttonTemplates = {
    replaceSubstring: {
      variables: ["FROM", "TO"],
      template: {
        replacementPattern: ["%FROM%", "$`%TO%$'"],
        label: "%FROM% to %TO%",
        title: "Replaces '%FROM%' with '%TO%' in all tags that contain the text '%FROM%'",
      } as AutoTaggingAction,
    },
  };

  private static fromButtonTemplate(templateName: keyof typeof this.buttonTemplates, variables: { [k: string]: string }) {
    const t = this.buttonTemplates[templateName], obj = structuredClone(t.template);
    // for (const v of t.variables) {
    //   if (!variables[v]) throw Error(`Missing required variable '${v}'`);
    //   // for (const key in obj) {
    //   //   if (!Object.hasOwn(obj, key)) continue;
    //   for (const key of Object.getOwnPropertyNames(obj)) {
    //     if (!obj[key]) continue;
    //     obj[key] = Util.replaceTemplateVariables(obj[key], variables)
    //   }
    // }
    for (const key of Object.getOwnPropertyNames(obj)) {
      if (!obj[key]) continue;
      obj[key] = Util.replaceTemplateVariables(obj[key], variables);
    }
    return obj;
  }

	public Settings: { enabled: boolean; doShow: boolean; forceConfirm: boolean; reloadAfterEdit: boolean; buttons: AutoTaggingAction[]; testMode: boolean } = {
		enabled: true,
    doShow: true,
    forceConfirm: false,
    reloadAfterEdit: true,
    testMode: true,
    buttons: [
      {
        removalPattern: "humanoid$",
        added: "anthro",
        label: "-*humanoid anthro",
        title: "Deletes all tags matching '*humanoid' & adds the 'anthro' tag",
      },
      {
        removalPattern: "humanoid$",
        label: "*humanoid",
        title: "Deletes all tags matching '*humanoid'",
      },
      {
        removalPattern: "andromorph",
        label: "-*andromorph*"
      },
      {
        removalPattern: "andromorph",
        added: "male",
        label: "-*andromorph* male"
      },
      /* {
        replacementPattern: ["humanoid", "$`anthro$'"],
        label: "humanoid to anthro",
        title: "Replaces 'humanoid' with 'anthro' in all tags that contain the text 'humanoid'",
      },
      {
        replacementPattern: ["andromorph", "$`male$'"],
        label: "andromorph to male"
      }, */
    ],
	};

	protected override create() {
    this.initSettingsMenu();
    if (!this.Settings.doShow) return Promise.resolve();
    const id = /^\/posts\/([0-9]+)/.exec(window.location.pathname)?.[1];
    if (!id) return Promise.resolve();
    const idNum = Number.parseInt(id);
    const tags = Array.from(document.querySelectorAll<HTMLLIElement>(".tag-list-item")).reduce((p, e) => {
      const tag = e.dataset["name"];
      if (tag) p.push(decodeURIComponent(tag));
      return p;
    }, [] as string[]);

    for (const element of this.Settings.buttons) {
      if (!(element.added || element.removalPattern)) continue;
      this.addButton(element, tags, idNum);
    }
		return Promise.resolve();
	}

  private static escapeHtml(s: string) {
    return encodeURIComponent(s).replace(/%([0-9a-fA-F]{2})/, (_, g1) => `&#x${g1}`);
  }

  private addButton(a: AutoTaggingAction, tags: string[], postId: number, showWhenInapplicable = this.Settings.testMode) {
    let diff: string | undefined, title: string | undefined = a.title, label: string | undefined = a.label;
    // this.processRemovalPattern
    if (a.removalPattern) {
      const regex = new RegExp(a.removalPattern);
      const matchedTags = tags.filter(e => e && regex.test(e));
      diff ??= "";
      if (matchedTags.length === 0) {
        if (!showWhenInapplicable) return;
      } else diff += ` ${matchedTags.map(e => `-${e}`).join(" ")}`;
      title ??= // a.label ??
        `Deletes all tags matching '${AutoTaggingButtons.escapeHtml(a.removalPattern)}'`;
      label ??= `<code>-&sol;${AutoTaggingButtons.escapeHtml(a.removalPattern)}&sol;</code>`;
    }
    if (a.added) {
      const tagsToAdd = a.added.split(" ").reduce((p, e) => {
        if (((e = e?.trim())?.length ?? 0) > 0 && !tags.includes(e)) p.push(e);
        return p;
      }, [] as string[]);
      if (tagsToAdd.length > 0) {
        if (diff) {
          if (!a.title) title += ` & adds '${tagsToAdd.join(", ")}'`;
          if (!a.label) label += ` <code>${tagsToAdd.join(" ")}</code>`;
        } else {
          title ??= `Adds '${tagsToAdd.join(", ")}'`;
          label ??= `<code>${tagsToAdd.join(" ")}</code>`;
        }
        diff ??= "";
        diff += ` ${tagsToAdd.join(" ")}`;
      } else if (!diff) {
        if (!showWhenInapplicable) return;
        if (!a.title) {
          if (title) title += ` & adds '${a.added.split(" ").join(", ")}'`;
          else title = `Adds '${a.added.split(" ").join(", ")}'`;
        }
        if (!a.label) {
          if (label) label += ` <code>${a.added}</code>`;
          else label = `<code>${a.added}</code>`;
        }
      }
    }
    if (!diff) {
      if (!showWhenInapplicable) return;
    } else diff = diff?.trimStart();
    this.addToSidebar(this.constructButton(postId, diff, title!, label!, a.reason), true);
  }

  private processRemovalPattern(removalPattern: string | undefined, tags: string[], showWhenInapplicable: boolean, state: { diff?: string | undefined, title?: string | undefined, label?: string | undefined }) {
    if (removalPattern) {
      const regex = new RegExp(removalPattern);
      const matchedTags = tags.filter(e => e && regex.test(e));
      state.diff ??= "";
      if (matchedTags.length === 0) {
        if (!showWhenInapplicable) return;
      } else state.diff += ` ${matchedTags.map(e => `-${e}`).join(" ")}`;
      state.title ??= `Deletes all tags matching '${AutoTaggingButtons.escapeHtml(removalPattern)}'`;
      state.label ??= `<code>-&sol;${AutoTaggingButtons.escapeHtml(removalPattern)}&sol;</code>`;
    }
    return state;
  }

  private processAddedTags(a: AutoTaggingAction, tags: string[], showWhenInapplicable: boolean, state: { diff?: string | undefined, title?: string | undefined, label?: string | undefined }) {
    if (a.added) {
      const tagsToAdd = a.added.split(" ").reduce((p, e) => {
        if (((e = e?.trim())?.length ?? 0) > 0 && !tags.includes(e)) p.push(e);
        return p;
      }, [] as string[]);
      if (tagsToAdd.length > 0) {
        if (state.diff) {
          if (!a.title) state.title += ` & adds '${tagsToAdd.join(", ")}'`;
          if (!a.label) state.label += ` <code>${tagsToAdd.join(" ")}</code>`;
        } else {
          state.title ??= `Adds '${tagsToAdd.join(", ")}'`;
          state.label ??= `<code>${tagsToAdd.join(" ")}</code>`;
        }
        state.diff ??= "";
        state.diff += ` ${tagsToAdd.join(" ")}`;
      } else if (!state.diff) {
        if (!showWhenInapplicable) return;
        if (!a.title) {
          if (state.title) state.title += ` & adds '${a.added.split(" ").join(", ")}'`;
          else state.title = `Adds '${a.added.split(" ").join(", ")}'`;
        }
        if (!a.label) {
          if (state.label) state.label += ` <code>${a.added}</code>`;
          else state.label = `<code>${a.added}</code>`;
        }
      }
    }
    return state;
  }

  private constructButton(postId: number, diff: string | undefined, title: string, label: string, reason?: string) {
    if (!Number.isInteger(postId)) throw new Error("Non-integer post id");
    const button = html`
    <button class="re6-auto-tag-button"
            title="${title}${reason ? `\nReason: ${reason}` : ""}"
            ${!diff ? " disabled" : ""}
    >
      ${label}
    </button>` as HTMLButtonElement;
    button.onclick = () => {
      if (this.Settings.forceConfirm && !confirm(`Are you sure you want to perform this edit?\n\t${reason ? `REASON: ${reason}\n\t` : ""}${diff}`))
        return;
      const body: /* PostUpdateParams */any = { tag_string_diff: diff };
      if (reason) body.edit_reason = reason;
      REMT.API.Posts.update(postId, body).then(() => {
        if (this.Settings.reloadAfterEdit) location.reload();
        else Danbooru.notice("REMT: Successfully edited tags!", false);
      });
    };
    return button;
  }
  
  private addToSidebar(e: HTMLElement, withBrs = false) {
    const sidebar = Util.DOM.querySelector<HTMLDivElement>(".sidebar");
    sidebar.insertAdjacentElement("afterbegin", e);
    if (withBrs) {
      sidebar.insertAdjacentElement("afterbegin", html`<br />`);
      sidebar.insertAdjacentElement("afterbegin", html`<br />`);
    }
  }

  private initSettingsMenu() {
    this._settingsMenuDialogParameters = {
      elements:[
        $(this.simpleSettingsCheckbox("doShow", "Show buttons?", "Should any button be loaded onto this page next time?")),
        $(`<br />`),
        $(this.simpleSettingsCheckbox("forceConfirm", "Force Confirm?", "Should you need to confirm the edit first?")),
        $(`<br />`),
        $(this.simpleSettingsCheckbox("testMode", undefined, "Show buttons even when they don't match?")),
        $(`<br />`),
        $(`<label for="${this.settingsIdPrefix}buttons" title="">Buttons in JSON<br /><textarea id="${this.settingsIdPrefix}buttons" name="${this.settingsIdPrefix}buttons">${JSON.stringify(this.Settings.buttons, undefined, 2)}</textarea></label>`),
        $(`<br />`),
        $(this.resetSettingsDialogElement),
        $(`<br />`),
      ],
      optionsOrTitle: "Auto Tag Edits Settings",
      then: (e: FormData) => {
        if (this.handleResetSettingsDialogElement(e)) return;
        this.Settings.doShow = e.get(`${this.settingsIdPrefix}doShow`) === "true";
        this.Settings.forceConfirm = e.get(`${this.settingsIdPrefix}forceConfirm`) === "true";
        this.Settings.testMode = e.get(`${this.settingsIdPrefix}testMode`) === "true";
        try {
          this.Settings.buttons = JSON.parse(e.get(`${this.settingsIdPrefix}buttons`)?.toString() ?? JSON.stringify(this.Settings.buttons)) as AutoTaggingAction[];
        } catch (error) {
          ErrorHandler.write("Failed to parse JSON input", error);
        }
      }};
  }
}
