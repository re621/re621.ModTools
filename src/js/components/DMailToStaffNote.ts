import { PageDefinition } from "../models/data/Page";
import Component from "./Component";
import { UtilDOM } from "../utilities/UtilDOM";

export default class DMailToStaffNote extends Component {
	private dmailBodyText: undefined | string;
	private dmailTitleText: undefined | string;
	private dmailJson: any | undefined;
	/** Indicates if we're currently getting the DMail JSON. */
	private isFetching = false;

	public constructor() {
		super({
			constraint: [PageDefinition.dmails.view],
			waitForDOM: true,
		});
	}

	// NOTE: Currently needs to get the body's raw DText from server.
	// IDEA: Add option to edit a preexisting staff note.
	protected create(): Promise<void> {
		const dmailInfo = DMailToStaffNote.findDMailIds();
		this.dmailTitleText = dmailInfo.title;
		
		const cBox = document.createElement("input"),
			cBoxLabel = document.createElement("label"),

			inputBox = document.createElement("div"),
			noteHeaderLabel = document.createElement("label"),
			noteHeader = document.createElement("textarea"),
			noteFooterLabel = document.createElement("label"),
			noteFooter = document.createElement("textarea"),
		
			form = document.createElement("form"),
			staff_note_body = document.createElement("textarea"),
			staff_note_bodyLabel = document.createElement("label"),
			submit = document.createElement("input");

		const updateStaffNoteBodyDisplay = () => {
			staff_note_body.value = `${noteHeader.value}\n[section=${this.dmailTitleText || ""}]\n${this.dmailBodyText || ""}\n[/section]\n${noteFooter.value}`;
			$(staff_note_body).trigger("input.danbooru.formatter");
		}

		const fetchDMailJSON = async () => {
			const t = await (await fetch(`/dmails/${dmailInfo.id}.json`)).json();
			this.dmailJson = t;
			this.dmailTitleText = t["title"];
			this.dmailBodyText = t["body"];
			submit.disabled = false;
			this.isFetching = false;
			updateStaffNoteBodyDisplay();
		};

		// #region form
		form.action = `/staff_notes?user_id=${dmailInfo.senderId}`;
		form.style.display = "none";

		form.id = "staff-note-data-form";
		form.style.width = "100%";
		// #endregion form

		// #region staff_note_body & label
		staff_note_body.id = "staff_note_body";
		staff_note_body.className = "dtext-formatter-input";
		staff_note_body.name = staff_note_bodyLabel.htmlFor = "staff_note[body]";
		staff_note_body.disabled = true;

		// staff_note_body.style.width = "100%";
		staff_note_body.style.overflowY = "scroll";
		staff_note_bodyLabel.innerText = "Final Staff Note Body";
		// #endregion staff_note_body & label

		// #region submit
		submit.type = "submit";
		submit.value = "Create Staff Note";
		submit.disabled = true;

		submit.style.display = "block";
		submit.style.marginTop = "4px";
		// #endregion submit

		// #region inputBox
		inputBox.style.display = "none";

		inputBox.style.width = "100%"
		// #endregion inputBox

		// #region noteHeaderLabel & noteHeader
		noteHeaderLabel.innerText = "Staff Note Header";
		noteHeaderLabel.htmlFor = noteHeader.id = noteHeader.name = "note-header-input";
		noteHeader.innerText = `"DMail":[/dmails/${dmailInfo.id}] sent regarding ticket #`;
		noteHeader.oninput = updateStaffNoteBodyDisplay;
		
		noteHeader.style.width = "100%";
		// #endregion noteHeaderLabel & noteHeader

		// #region noteFooterLabel & noteFooter
		noteFooterLabel.innerText = "Staff Note Footer";
		noteFooterLabel.htmlFor = noteFooter.id = noteFooter.name = "note-footer-input";
		noteFooter.innerText = "";
		noteFooter.oninput = updateStaffNoteBodyDisplay;
		
		noteFooter.style.width = "100%";
		// #endregion noteFooterLabel & noteFooter

		// #region cBox & cBoxLabel
		cBox.type = "checkbox";
		cBoxLabel.htmlFor = cBox.id = cBox.name = "add-staff-note";
		cBoxLabel.innerText = "Add Staff Note to Recipient?";
		// #endregion cBox & cBoxLabel
		cBox.onchange = () => {
			if (cBox.checked) {
				form.style.display = inputBox.style.display = "revert";
				if (!this.dmailJson && !this.isFetching) {
					this.isFetching = true;
					fetchDMailJSON();
				} else {
					submit.disabled = false;
				}
			} else {
				submit.disabled = true;
				form.style.display = inputBox.style.display = "none";
			}
		};
		const content = document.querySelector(".dmail");
		content.insertAdjacentElement("beforeend", cBoxLabel);
		content.insertAdjacentElement("beforeend", cBox);
		content.insertAdjacentElement("beforeend", inputBox);
		content.insertAdjacentElement("beforeend", form);
		inputBox.appendChild(noteHeaderLabel);
		inputBox.appendChild(noteHeader);
		inputBox.appendChild(noteFooterLabel);
		inputBox.appendChild(noteFooter);
		form.appendChild(staff_note_bodyLabel);
		UtilDOM.buildDTextInput(staff_note_body, {
			showHelpText: true,
			container: form,
		}) as HTMLDivElement;
		form.appendChild(submit);
		return;
	}

	public static findDMailIds() {
		const retVal = { id: undefined, recipientId: undefined, senderId: undefined, title: undefined };
		const id = /^\/dmails\/([0-9]+)/.exec(window.location.pathname);
		if (!id) return null;
		retVal.id = id[1];
		retVal.recipientId = /^\/users\/([0-9]+)/.exec(new URL(document.querySelector<HTMLAnchorElement>(".dmail ul li:nth-of-type(2) a[href^='/users/']").href).pathname)[1];
		retVal.senderId = /^\/users\/([0-9]+)/.exec(new URL(document.querySelector<HTMLAnchorElement>(".dmail ul li:nth-of-type(1) a[href^='/users/']").href).pathname)[1];
		retVal.title = document.querySelector<HTMLAnchorElement>(".dmail h2").innerText;
		return retVal;
	}
}
