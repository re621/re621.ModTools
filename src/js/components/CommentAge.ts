import { PageDefinition } from "../models/data/Page";
import Util from "../utilities/Util";
import { UtilTime } from "../utilities/UtilTime";
import Component from "./Component";

export default class CommentAge extends Component {
	private static readonly tableSelector = "body.c-tickets.a-show.resp > div#page > div#c-tickets > div#a-show > div.section > table";

	public constructor() {
		super({
			constraint: PageDefinition.tickets.view,
			waitForDOM: `${CommentAge.tableSelector} tr td:nth-child(2) a:first-child[href^="/comments/"]`,
		});
	}

	protected async create(): Promise<void> {
		const reportedRow = CommentAge.findReportedCommentRow();
		if (!reportedRow) return;

		const link = reportedRow.children[1].querySelector<HTMLAnchorElement>('a[href^="/comments/"]');
		if (!link) return;

		const ageRow = CommentAge.makeAgeRow(reportedRow);
		reportedRow.after(ageRow);

		const valueCell = ageRow.children[1] as HTMLElement;
		const time = document.createElement("time");
		time.classList.add("comment-age-loading");
		for (let i = 0; i < 3; i++) {
			const dot = document.createElement("span");
			dot.textContent = ".";
			time.appendChild(dot);
		}
		valueCell.appendChild(time);

		// TODO: Replace w/ ZestyAPI when it gets a `get` method for `CommentsEndpoint`.
		const response = await fetch(new URL(link.href).pathname + ".json");
		const data = await response.json();
		const created = new Date(data["created_at"]);

		time.classList.remove("comment-age-loading");
		time.replaceChildren(document.createTextNode(UtilTime.ago(created)));
		time.dateTime = data["created_at"];
		time.title = created.toString();

		valueCell.classList.add(
			Util.isDatePastCommentStatute(created) ? "comment-age-past" : "comment-age-within",
		);
	}

	private static findReportedCommentRow(): HTMLTableRowElement | null {
		const table = document.querySelector(CommentAge.tableSelector);
		if (!table) return null;
		const rows = table.childElementCount === 1 ? table.children[0].children : table.children;
		for (const row of rows) {
			if ((row.children[0] as HTMLElement).innerText === "Reported Comment") {
				return row as HTMLTableRowElement;
			}
		}
		return null;
	}

	private static makeAgeRow(referenceRow: HTMLTableRowElement): HTMLTableRowElement {
		const row = document.createElement("tr");
		const label = document.createElement(referenceRow.children[0].tagName.toLowerCase());
		label.textContent = "Comment Age";
		const value = document.createElement(referenceRow.children[1].tagName.toLowerCase());
		row.appendChild(label);
		row.appendChild(value);
		return row;
	}
}
