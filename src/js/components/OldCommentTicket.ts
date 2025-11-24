import { PageDefinition } from "../models/data/Page";
import Util from "../utilities/Util";
import { UtilDOM } from "../utilities/UtilDOM";
import Component from "./Component";

/**
 * 
 */
export default class OldCommentTicket extends Component {
	private static readonly tableSelector = "body.c-tickets.a-show.resp > div#page > div#c-tickets > div#a-show > div.section > table";
	public constructor() {
		super({
			constraint: PageDefinition.tickets.view,
			waitForDOM: `${OldCommentTicket.tableSelector} tr td:nth-child(2) a:first-child[href^="/comments/"]`,//"form.edit_ticket",
		});
	}

	public Settings = {
		enabled: true,
		actionableColor: 'rgb(64, 255, 64)',
		notActionableColor: 'rgb(255, 64, 64)',
	};

	/**
	 * 
	 * @returns 
	 * @todo Allow changing settings.
	 */
	protected create(): Promise<void> {
		const table = document.querySelector(OldCommentTicket.tableSelector);
		const rows: HTMLCollectionOf<HTMLTableRowElement> = (table.childElementCount === 1 ? table.children[0].children : table.children) as HTMLCollectionOf<HTMLTableRowElement>;
		for (const row of rows) {
			if ((row.children[0] as HTMLElement).innerText === "Reported Comment") {
				const commentPath = new URL((row.children[1].children[0] as HTMLAnchorElement).href).pathname + ".json";
				const spinner = UtilDOM.makeSpinnerDOM({size: `${row.children[1].children[0].clientHeight}px`, spinnerWidth: "3px"});
				row.children[1].appendChild(spinner);
				// TODO: Replace w/ ZestyAPI when it gets a `get` method for `CommentsEndpoint`.
				fetch(commentPath).then(async (e) => {
					const e1 = await e.json();
					const created = new Date(e1["created_at"]);
					row.children[1].removeChild(spinner);
					const time = document.createElement("time");
					time.dateTime = e1["created_at"];
					time.innerText = created.toDateString();
					const warnText = document.createElement("span");
					if (Util.isDatePastCommentStatute(created)) {
						// row.style.border = `1rem solid ${this.Settings.notActionableColor}`;
						warnText.innerText = " Past";
						time.style.color = warnText.style.color = this.Settings.notActionableColor;
					} else {
						// row.style.border = `1rem solid ${this.Settings.actionableColor}`;
						warnText.innerText = " Within";
						time.style.color = warnText.style.color = this.Settings.actionableColor;
					}
					warnText.innerText += " 6 month statute of limitations."
					row.title = `Actionable from ${created} - ${Util.advanceDate(created, {})})`;
					row.children[1].appendChild(time);
					row.children[1].appendChild(warnText);
				});
				return;
			}
		}

		return;
	}

}
