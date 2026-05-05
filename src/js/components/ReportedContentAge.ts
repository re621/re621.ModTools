import { PageDefinition } from "../models/data/Page";
import Util from "../utilities/Util";
import { UtilTime } from "../utilities/UtilTime";
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

export default class ReportedContentAge extends Component {
	private static readonly tableSelector = "body.c-tickets.a-show.resp > div#page > div#c-tickets > div#a-show > div.section > table";

	public constructor() {
		const linkSelectors = RESOURCE_TYPES
			.map((r) => `${ReportedContentAge.tableSelector} tr td:nth-child(2) a:first-child[href^="${r.urlPrefix}"]`)
			.join(", ");
		super({
			constraint: PageDefinition.tickets.view,
			waitForDOM: linkSelectors,
		});
	}

	protected async create(): Promise<void> {
		const found = ReportedContentAge.findReportedRow();
		if (!found) return;
		const { row, type } = found;

		const link = row.children[1].querySelector<HTMLAnchorElement>(`a[href^="${type.urlPrefix}"]`);
		if (!link) return;

		const ageRow = ReportedContentAge.makeAgeRow(row, type.ageLabel);
		row.after(ageRow);

		const valueCell = ageRow.children[1] as HTMLElement;
		const time = document.createElement("time");
		time.classList.add("reported-content-age-loading");
		for (let i = 0; i < 3; i++) {
			const dot = document.createElement("span");
			dot.textContent = ".";
			time.appendChild(dot);
		}
		valueCell.appendChild(time);

		// TODO: Replace w/ ZestyAPI when it gets generic resource fetching.
		const response = await fetch(new URL(link.href).pathname + ".json");
		const data = await response.json();
		const created = new Date(data["created_at"]);

		time.classList.remove("reported-content-age-loading");
		time.replaceChildren(document.createTextNode(UtilTime.ago(created)));
		time.dateTime = data["created_at"];
		time.title = created.toString();
		// IDEA: Add icon when past statute to show the actionable time range.
		// `Actionable from ${created} - ${Util.advanceDate(created, {})})`

		valueCell.classList.add(
			Util.isDatePastCommentStatute(created) ? "reported-content-age-past" : "reported-content-age-within",
		);
	}

	private static findReportedRow(): { row: HTMLTableRowElement; type: ResourceType } | null {
		const table = document.querySelector(ReportedContentAge.tableSelector);
		if (!table) return null;
		const rows = table.childElementCount === 1 ? table.children[0].children : table.children;
		for (const row of rows) {
			const labelText = (row.children[0] as HTMLElement).innerText;
			const type = RESOURCE_TYPES.find((t) => t.rowLabel === labelText);
			if (type) return { row: row as HTMLTableRowElement, type };
		}
		return null;
	}

	private static makeAgeRow(referenceRow: HTMLTableRowElement, ageLabel: string): HTMLTableRowElement {
		const row = document.createElement("tr");
		const label = document.createElement(referenceRow.children[0].tagName.toLowerCase());
		label.textContent = ageLabel;
		const value = document.createElement(referenceRow.children[1].tagName.toLowerCase());
		row.appendChild(label);
		row.appendChild(value);
		return row;
	}
}
