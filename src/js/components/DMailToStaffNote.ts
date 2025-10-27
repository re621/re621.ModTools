import { PageDefinition } from "../models/data/Page";
import Component from "./Component";
import REMT from "../../REMT";
import Danbooru from "../models/api/Danbooru";

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
	// TODO: Disable textarea & reenable it when the submit button is pressed so it's actually included in the form's output.
	protected create(): Promise<void> {
		const dmailInfo = DMailToStaffNote.findDMailIds();
		this.dmailTitleText = dmailInfo.title;

		const cBox = document.createElement("input"),
			cBoxLabel = document.createElement("label"),

			inputBox = document.createElement("div"),
			userDropdownLabel = document.createElement("label"),
			userDropdown = document.createElement("select"),
			userDropdownRecipient = document.createElement("option"),
			userDropdownSender = document.createElement("option"),
			noteHeaderLabel = document.createElement("label"),
			noteHeader = document.createElement("textarea"),
			noteFooterLabel = document.createElement("label"),
			noteFooter = document.createElement("textarea"),

			form = document.createElement("form"),
			authToken = document.createElement("input"),
			staff_note_body = document.createElement("textarea"),
			staff_note_bodyLabel = document.createElement("label"),
			submit = document.createElement("input");

		const updateStaffNoteBodyDisplay = () => {
			staff_note_body.value = `${noteHeader.value.replace("$title", this.dmailTitleText || "")}\n${this.dmailBodyText || ""}\n${noteFooter.value}`;
			$(staff_note_body).trigger("input.danbooru.formatter");
		}

		const fetchDMailJSON = async () => {
			const t = await (await fetch(`/dmails/${dmailInfo.id}.json`)).json();
			this.dmailJson = t;
			this.dmailTitleText = t["title"];
			this.dmailBodyText = t["body"];
			userDropdownRecipient.innerText = t["to_name"];
			userDropdownSender.innerText = t["from_name"];
			userDropdownRecipient.value = t["to_id"];
			userDropdownSender.value = t["from_id"];
			submit.disabled = false;
			this.isFetching = false;
			updateStaffNoteBodyDisplay();
		};

		// #region form
		form.action = `/staff_notes?user_id=${dmailInfo.recipientId}`;
		form.noValidate = true;
		form.acceptCharset = "UTF-8";
		form.method = "post";
		form.style.display = "none";

		form.id = "staff-note-data-form";
		form.style.width = "100%";
		// #endregion form

		// #region authToken
		authToken.type = "hidden";
		authToken.name = "authenticity_token";
		authToken.autocomplete = "off";
		authToken.value = REMT.API.getAuthToken();
		// #endregion authToken

		// #region staff_note_body & label
		staff_note_body.id = "staff_note_body";
		staff_note_body.className = "dtext-formatter-input";
		staff_note_body.name = staff_note_bodyLabel.htmlFor = "staff_note[body]";

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

		// #region Dropdown
		userDropdownLabel.innerText = "User to add staff note to: ";
		userDropdownLabel.htmlFor = userDropdown.id = userDropdown.name = "user-dropdown-input";
		userDropdown.appendChild(userDropdownRecipient);
		userDropdown.appendChild(userDropdownSender);
		userDropdown.selectedIndex = 0;
		userDropdown.onchange = () => form.action = `/staff_notes?user_id=${userDropdown.value}`;
		userDropdownRecipient.innerText = dmailInfo.recipientName;
		userDropdownRecipient.value = dmailInfo.recipientId;
		userDropdownSender.innerText = dmailInfo.senderName;
		userDropdownSender.value = dmailInfo.senderId;
		// #endregion Dropdown

		// #region noteHeaderLabel & noteHeader
		noteHeaderLabel.innerText = "Staff Note Header";
		noteHeaderLabel.htmlFor = noteHeader.id = noteHeader.name = "note-header-input";
		noteHeader.value = `"DMail":[/dmails/${dmailInfo.id}] sent regarding ticket #\n[section=$title]`;
		noteHeader.oninput = updateStaffNoteBodyDisplay;

		noteHeader.style.width = "100%";
		// #endregion noteHeaderLabel & noteHeader

		// #region noteFooterLabel & noteFooter
		noteFooterLabel.innerText = "Staff Note Footer";
		noteFooterLabel.htmlFor = noteFooter.id = noteFooter.name = "note-footer-input";
		noteFooter.value = "[/section]\n";
		noteFooter.oninput = updateStaffNoteBodyDisplay;

		noteFooter.style.width = "100%";
		// #endregion noteFooterLabel & noteFooter

		// #region cBox & cBoxLabel
		cBox.type = "checkbox";
		cBoxLabel.htmlFor = cBox.id = cBox.name = "add-staff-note";
		cBoxLabel.innerText = "Add Staff Note?";
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
		inputBox.appendChild(userDropdownLabel);
		inputBox.appendChild(userDropdown);
		inputBox.appendChild(document.createElement("br"));
		inputBox.appendChild(noteHeaderLabel);
		inputBox.appendChild(noteHeader);
		inputBox.appendChild(noteFooterLabel);
		inputBox.appendChild(noteFooter);
		form.appendChild(authToken);
		form.appendChild(staff_note_bodyLabel);
		form.appendChild(staff_note_body);
		Danbooru.DTextFormatter.buildFromTextarea($(staff_note_body));
		form.appendChild(submit);
		return;
	}

	public static findDMailIds() {
		const retVal = {
			id: undefined,
			recipientId: undefined,
			senderId: undefined,
			recipientName: undefined,
			senderName: undefined,
			title: undefined,
		};
		const id = /^\/dmails\/([0-9]+)/.exec(window.location.pathname);
		if (!id) return null;
		retVal.id = id[1];
		const recipient = document.querySelector<HTMLAnchorElement>(".dmail ul li:nth-of-type(2) a[href^='/users/']");
		retVal.recipientId = /^\/users\/([0-9]+)/.exec(new URL(recipient.href).pathname)[1];
		retVal.recipientName = recipient.innerText;
		const sender = document.querySelector<HTMLAnchorElement>(".dmail ul li:nth-of-type(1) a[href^='/users/']");
		retVal.senderId = /^\/users\/([0-9]+)/.exec(new URL(sender.href).pathname)[1];
		retVal.senderName = sender.innerText;
		retVal.title = document.querySelector<HTMLAnchorElement>(".dmail h2").innerText;
		return retVal;
	}
}
