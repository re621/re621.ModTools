import { PageDefinition } from "../models/data/Page";
import Records from "../models/data/Records";
import Util from "../utilities/Util";
import Component from "./Component";

export default class DMailToStaffNote extends Component {

	private dmailBodyText: undefined | string;
	private dmailTitleText: undefined | string;
	private dmailJson: any | undefined;
	private isFetching = false;

	public constructor() {
		super({
			constraint: [ PageDefinition.dmails.view ],
			waitForDOM: true,//"div.dmail",
		});
	}

	protected create(): Promise<void> {
		console.log("creating");
		// debugger;
		// const dmailInfo = { id: "2333319", recipientId: "900037", senderId: "248688", title: "Re: Regarding your recent post edits" };// DMailToStaffNote.findDMailIds();
		const dmailInfo = DMailToStaffNote.findDMailIds();
		this.dmailTitleText = dmailInfo.title;

		const form = document.createElement("form");
		const staff_note_body = document.createElement("textarea");
		form.appendChild(staff_note_body);
		const submit = document.createElement("input");
		form.appendChild(submit);

		form.action = `/staff_notes?user_id=${dmailInfo.senderId}`;

		staff_note_body.id = "staff_note_body";
		staff_note_body.name = "staff_note[body]";
		staff_note_body.disabled = true;

		submit.type = "submit";
		submit.innerText = "Create";
		submit.disabled = true;

		const cBox = document.createElement("input");
		const cBoxLabel = document.createElement("label");

		const inputBox = document.createElement("div");

		const noteHeader = document.createElement("textarea");
		inputBox.appendChild(noteHeader);
		const noteFooter = document.createElement("textarea");
		inputBox.appendChild(noteFooter);
		const noteHeaderLabel = document.createElement("label");
		inputBox.appendChild(noteHeaderLabel);
		const noteFooterLabel = document.createElement("label");
		inputBox.appendChild(noteFooterLabel);

		const headerCb = () => {
			staff_note_body.value = `${noteHeader.value}\n[section=${this.dmailTitleText || ""}]${this.dmailBodyText || ""}\n[/section]\n${noteFooter.value}`;
		}

		const dmailPromise = async () => {
			const t = await (await fetch(`/dmails/${dmailInfo.id}.json`)).json();
			this.dmailJson = t;
			this.dmailTitleText = t[ "title" ];
			this.dmailBodyText = t[ "body" ];
			submit.disabled = false;
			this.isFetching = false;
			headerCb();
		};

		form.style.display = inputBox.style.display = "none";

		// noteHeaderLabel.outerHTML = "<label for=\"note-header-input\" style=\"display: none;\">Staff Note Header</label>";
		noteHeaderLabel.innerText = "Staff Note Header";
		noteHeaderLabel.htmlFor = noteHeader.id = noteHeader.name = "note-header-input";
		noteHeader.innerText = `"DMail":[/dmails/${dmailInfo.id}] sent regarding ticket #`;
		noteHeader.oninput = headerCb;

		// noteFooterLabel.outerHTML = "<label for=\"note-footer-input\" style=\"display: none;\">Staff Note Footer</label>";
		noteFooterLabel.innerText = "Staff Note Footer";

		noteFooterLabel.htmlFor = noteFooter.id = noteFooter.name = "note-footer-input";
		noteFooter.innerText = "";
		noteFooter.oninput = headerCb;
		// noteFooter.outerHTML = "<textarea id=note-footer-input name=note-footer-input style=\"display: none;\">$dmail$ sent regarding ticket #</textarea>";

		cBox.type = "checkbox";
		cBoxLabel.htmlFor = cBox.id = cBox.name = "add-staff-note";
		cBoxLabel.innerText = "Add Staff Note to Recipient?";
		// cBox.ontoggle = (e) => {
		cBox.onchange = (e) => {
			if (/* e.newState */cBox.checked) {
				form.style.display = inputBox.style.display = "revert";
				if (!this.dmailJson && !this.isFetching) {
					this.isFetching = true;
					dmailPromise();
				} else {
					submit.disabled = false;
				}
			} else {
				submit.disabled = true;
				form.style.display = inputBox.style.display = "none";
			}
		};
		const content = document.querySelector(".dmail");
		content.insertAdjacentElement("afterend", cBoxLabel);
		content.insertAdjacentElement("afterend", cBox);
		content.insertAdjacentElement("afterend", inputBox);
		content.insertAdjacentElement("afterend", form);

		return;
	}

	public static findDMailIds() {
		const retVal = { id: undefined, recipientId: undefined, senderId: undefined, title: undefined };
		const id = /^\/dmails\/([0-9]+)/.exec(window.location.pathname);
		if (!id) return null;
		retVal.id = id[ 1 ]
		// retVal.recipientId = /^\/users\/([0-9]+)/.exec(document.querySelector<HTMLAnchorElement>(".dmail ul li:nth-of-type(2) a[href^='/users/']").href)[ 1 ];
		// retVal.senderId = /^\/users\/([0-9]+)/.exec(document.querySelector<HTMLAnchorElement>(".dmail ul li:nth-of-type(1) a[href^='/users/']").href)[ 1 ];
		retVal.recipientId = /^\/users\/([0-9]+)/.exec(new URL(document.querySelector<HTMLAnchorElement>(".dmail ul li:nth-of-type(2) a[href^='/users/']").href).pathname)[ 1 ];
		retVal.senderId = /^\/users\/([0-9]+)/.exec(new URL(document.querySelector<HTMLAnchorElement>(".dmail ul li:nth-of-type(1) a[href^='/users/']").href).pathname)[ 1 ];
		retVal.title = document.querySelector<HTMLAnchorElement>(".dmail h2").innerText;
		return retVal;
	}
}
