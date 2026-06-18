import XM from "../models/api/XM";
import { PageDefinition } from "../models/data/Page";
import { DialogForm } from "../models/structure/DialogForm";
import Modal from "../models/structure/Modal";
import ErrorHandler from "../utilities/ErrorHandler";
import { html } from "../utilities/HtmlTemplate";
import Util from "../utilities/Util";
import Component from "./Component";

interface ResourceType {
	rowLabel: string;
	urlPrefix: string;
	ageLabel: string;
}

const RESOURCE_TYPES: ResourceType[] = [
  { rowLabel: "Reported Comment", urlPrefix: "/comments/", ageLabel: "Comment Age" },
  { rowLabel: "Reported Blip", urlPrefix: "/blips/", ageLabel: "Blip Age" },
  { rowLabel: "Reported Forum Post", urlPrefix: "/forum_posts/", ageLabel: "Forum Post Age" },
];

type CommentJson = {
  id: number,
  created_at: Date,
  updated_at: Date,
  post_id: number,
  creator_id: number,
  body: string,
  score: number,
  updater_id?: number | null,
  do_not_bump_post: boolean,
  is_hidden: boolean,
  is_sticky: boolean,
  warning_type?: string | null,
  warning_user_id?: number | null,
  creator_name: string,
  updater_name: string,
  vote: number,
};

const commentKeys = [
  "id",
  "created_at",
  "updated_at",
  "post_id",
  "creator_id",
  "body",
  "score",
  "updater_id",
  "do_not_bump_post",
  "is_hidden",
  "is_sticky",
  "warning_type",
  "warning_user_id",
  "creator_name",
  "updater_name",
  "vote",
];

export default class ReportContentData extends Component {
  private static readonly tableSelector = "body.c-tickets.a-show.resp > div#page > div#c-tickets > div#a-show > div.section > table";

  public constructor() {
    super({
      constraint: PageDefinition.tickets.view,
      waitForDOM: RESOURCE_TYPES
        .map((r) => `${ReportContentData.tableSelector} tr td:nth-child(2) a:first-child[href^="${r.urlPrefix}"]`)
        .join(", "),
    });
  }

  public Settings = {
    enabled: true,
    loadMessage: false,
  };

  protected async create(): Promise<void> {
    Util.DOM.addSettingsButton({
      id: "ReportContentDataSettings",
      name: "Mod Tools Settings",
      onClick: () => this.onSettingsButton(),
    });
    const found = ReportContentData.findReportedRow();
    if (!found) return;
    const { row, type } = found;

    const link = row.children[1].querySelector<HTMLAnchorElement>(`a[href^="${type.urlPrefix}"]`);
    if (!link) return;

    const ageRow = ReportContentData.findAgeRow(type);
    if (!ageRow) return;

    const valueCell = ageRow.children[1] as HTMLElement;
    const info = html`<a class="reported-content-age-loading"><span>.</span><span>.</span><span>.</span></a>` as HTMLAnchorElement;
    valueCell.appendChild(info);

    // TODO: Replace w/ ZestyAPI when it gets generic resource fetching.
    const response = await fetch(new URL(link.href).pathname + ".json");
    const data = await response.json() as CommentJson;
    const created = new Date(data["created_at"]);

    info.classList.remove("reported-content-age-loading");
    Array.from(info.children).forEach(e => e.remove());
    info.innerText = "ⓘ";
    info.onclick = () => new Modal({
      autoOpen: true,
      title: "Comment Information",
    }).addContent(
      $(`<table>${commentKeys.map(e => `<tr><th scope="row"><b>${e}</b></th><td>${data[e]}</td></tr>`).join("\n")}</table>`)
    );
    info.title = "Info";
    (valueCell.children[0] as HTMLElement).title += `\nActionable from ${created} - ${Util.Time.advanceDate(created, {})})`;

    if (!this.Settings.loadMessage) return;
    try {
      this.drawMessage(data);
    } catch(error) {
      ErrorHandler.write(`${error}`);
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
        $(`<label for="setting-loadMessage" title="Should the reported content be loaded onto this page next time?">Load Message? <input type="checkbox" id="setting-loadMessage" name="setting-loadMessage" value="true" ${this.Settings.loadMessage ? "checked" : ""}></input></label><br />`),
      ],
      "Mod Tools Settings",
      (e: FormData) => this.Settings.loadMessage = e.get("setting-loadMessage") === "true",
    );

    // Stop propagation & prevent default.
    return false;
  }

  private async drawMessage(data: CommentJson) {
    // Display comment
    const table = document.querySelector<HTMLTableElement>(ReportContentData.tableSelector);
    if (!table) return;
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const tableContainer = table.parentElement! as HTMLDivElement;
    let replacer: (e: HTMLDivElement) => void;
    if (tableContainer.firstElementChild === table) {
      replacer = e => tableContainer.insertAdjacentElement("afterbegin", e);
    } else if (tableContainer.lastElementChild !== table) {
      const index = Array.from(tableContainer.children).indexOf(table);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      replacer = e => tableContainer.children.item(index)!.insertAdjacentElement("beforebegin", e);
    } else {
      replacer = e => tableContainer.appendChild(e);
    }
    table.remove();
    const commentBox = html`<div id="future-comment-container" class="reported-content-age-loading">
        <span>.</span><span>.</span><span>.</span>
      </div>` as HTMLDivElement,
      flexBox = html`<div class="table-comment-wrapper" style="display: flex; flex-flow: row wrap; justify-content: start;">
        ${table}
        ${commentBox}
      </div>` as HTMLDivElement;
    replacer(flexBox);

    const dText = await (await fetch(`/dtext_preview.json?body=${encodeURIComponent(data.body)}&allow_color="false"`, { method: "POST", "body": JSON.stringify({ "body": data.body, "allow_color": "false" }), headers: {
      "User-Agent": `${XM.Info.script.name}/${XM.Info.script.version} (by ${XM.Info.script.author} on e621)`,
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      "X-CSRF-Token": document.querySelector("meta[name=csrf-token]")!.getAttribute("content") ?? "",
    } })).json();
    flexBox.removeChild(commentBox);
    if (dText["html"]) flexBox.appendChild(html`<div style="background-color: rgba(0,0,0,0.1); border-radius: 1rem; padding: 1rem;"><b>Message:</b><br />${dText["html"]}</div>`);
  }

  private static findReportedRow(): { row: HTMLTableRowElement; type: ResourceType } | null {
    const table = document.querySelector(ReportContentData.tableSelector);
    if (!table) return null;
    const rows = table.childElementCount === 1 ? table.children[0].children : table.children;
    for (const row of rows) {
      const labelText = (row.children[0] as HTMLElement).innerText;
      const type = RESOURCE_TYPES.find((t) => t.rowLabel === labelText);
      if (type) return { row: row as HTMLTableRowElement, type };
    }
    return null;
  }

  private static findAgeRow(type: ResourceType): HTMLTableRowElement | null {
    const table = document.querySelector(ReportContentData.tableSelector);
    if (!table) return null;
    const rows = table.childElementCount === 1 ? table.children[0].children : table.children;
    for (const row of rows) {
      const labelText = (row.children[0] as HTMLElement).innerText;
      if (type.ageLabel === labelText) return row as HTMLTableRowElement;
    }
    return null;
  }
}
