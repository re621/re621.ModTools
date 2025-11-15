import { PageDefinition } from "../models/data/Page";
import Component from "./Component";
import REMT from "../../REMT";
import Danbooru from "../models/api/Danbooru";
import Util from "../utilities/Util";
import { DialogForm } from "../models/structure/DialogForm";

export default class DMailToStaffNote extends Component {
	public static readonly TICKET_MATCHER = /^"Your ticket":\/tickets\/([0-9]+) has been updated by /;
	private readonly templateVariables = new Map<string|RegExp, string|((key: string, ...args: any[]) => string)>([
		["dmailId", () => this.dmailJson["id"].toString()],
		["title", () => this.dmailJson["title"].toString()],
		["ticketId", (v) => {
			if (!this.dmailJson || !(this.dmailJson["body"])) return v; // `%${v}%`;
			const b: string = this.dmailJson["body"].toString();
			return DMailToStaffNote.TICKET_MATCHER.test(b) ? DMailToStaffNote.TICKET_MATCHER.exec(b)[1].toString() : v; // `%${v}%`;
		}],
	]);
	private dmailJson: any | undefined;
	/** Indicates if we're currently getting the DMail JSON. */
	private isFetching = false;
	/** Indicates if we've previously gotten the DMail JSON. */
	private wasFetched = false;

	public constructor() {
		super({
			constraint: [PageDefinition.dmails.view],
			waitForDOM: true,
		});
	}

	public Settings = {
		enabled: true,
		header: '"DMail":[/dmails/%dmailId%] sent regarding ticket #%ticketId%\n[section=$title]',
		footer: "[/section]\n",
	};

	private revealSettingsDialog(): boolean {
		DialogForm.getRequestedInput(
			[
				$('<label for="setting-header">Default Staff Note Header</label>'),
				$(`<textarea id="setting-header" name="setting-header"></textarea>`).text(this.Settings.header),
				$('<br />'),
				$('<label for="setting-footer">Default Staff Note Footer</label>'),
				$(`<textarea id="setting-footer" name="setting-footer"></textarea>`).text(this.Settings.footer),
			],
			"Settings",
			(e: FormData) => {
				this.Settings.header = e.get("setting-header").toString();
				this.Settings.footer = e.get("setting-footer").toString();
				// TODO: Update text boxes
			},
		);
		return false;
	}

	/**
	 * NOTE: Currently needs to get the body's raw DText from server.
	 * IDEA: Add option to edit a preexisting staff note.
	 * @todo: Disable textarea & reenable it when the submit button is pressed so it's actually included in the form's output.
	 */
	protected create(): Promise<void> {
		const dmailInfo = DMailToStaffNote.findDMailIds();
		this.dmailJson = {};
		this.dmailJson.id = dmailInfo.id;
		this.dmailJson.title = dmailInfo.title;

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
			// staff_note_body.value = `${Util.replaceTemplateVariables(noteHeader.value, this.templateVariables)}\n${this.dmailBodyText || ""}\n${Util.replaceTemplateVariables(noteFooter.value, this.templateVariables)}`;
			staff_note_body.value = `${Util.replaceTemplateVariables(noteHeader.value, this.templateVariables)}\n${this.dmailJson["body"] || ""}\n${Util.replaceTemplateVariables(noteFooter.value, this.templateVariables)}`;
			$(staff_note_body).trigger("input.danbooru.formatter");
		}

		const fetchDMailJSON = async () => {
			const t = await (await fetch(`/dmails/${dmailInfo.id}.json`)).json();
			this.dmailJson = t;
			userDropdownRecipient.innerText = t["to_name"];
			userDropdownSender.innerText = t["from_name"];
			userDropdownRecipient.value = t["to_id"];
			userDropdownSender.value = t["from_id"];
			submit.disabled = false;
			this.isFetching = false;
			this.wasFetched = true;
			// Update header/footer values
			// IDEA: Somehow also move cursor accordingly if currently being edited?
			noteHeader.value = Util.replaceTemplateVariables(noteHeader.value, this.templateVariables);
			noteFooter.value = Util.replaceTemplateVariables(noteFooter.value, this.templateVariables);
			// Update body
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
		userDropdown.onchange = () => form.action = `/staff_notes?user_id=${Number(userDropdown.value)}`;
		userDropdownRecipient.innerText = dmailInfo.recipientName;
		userDropdownRecipient.value = dmailInfo.recipientId;
		userDropdownSender.innerText = dmailInfo.senderName;
		userDropdownSender.value = dmailInfo.senderId;
		// #endregion Dropdown

		// #region noteHeaderLabel & noteHeader
		noteHeaderLabel.innerText = "Staff Note Header";
		noteHeaderLabel.htmlFor = noteHeader.id = noteHeader.name = "note-header-input";
		noteHeader.value = Util.replaceTemplateVariables(this.Settings.header, this.templateVariables);
		noteHeader.oninput = updateStaffNoteBodyDisplay;

		noteHeader.style.width = "100%";
		// #endregion noteHeaderLabel & noteHeader

		// #region noteFooterLabel & noteFooter
		noteFooterLabel.innerText = "Staff Note Footer";
		noteFooterLabel.htmlFor = noteFooter.id = noteFooter.name = "note-footer-input";
		noteFooter.value = Util.replaceTemplateVariables(this.Settings.footer, this.templateVariables);
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
				if (!this.wasFetched && !this.isFetching) {
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
		// #region Settings Button
		const settingsButton = document.createElement("button");
		settingsButton.innerText = "Edit Settings";
		settingsButton.onclick = () => this.revealSettingsDialog();
		content.insertAdjacentElement("beforeend", settingsButton);
		// #endregion Settings Button
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

	/**
	 * Pulls some info about DMail from the HTML.
	 * @todo Refactor elsewhere?
	 * @returns An object containing all the info about the DMail exchange that could be pulled from the page's HTML w/o querying the server.
	 */
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
		const recipient = this.pullIdAndName(2);
		retVal.recipientId = recipient.id;
		retVal.recipientName = recipient.name;
		const sender = this.pullIdAndName(1);
		retVal.senderId = sender.id;
		retVal.senderName = sender.name;
		retVal.title = document.querySelector<HTMLAnchorElement>(".dmail h2").innerText;
		return retVal;
	}

	/**
	 * 
	 * @param number 
	 * @returns 
	 */
	private static pullIdAndName(number: number) {
		const user = document.querySelector<HTMLAnchorElement>(`.dmail ul li:nth-of-type(${number}) a[href^='/users/']`);
		return {
			id: /^\/users\/([0-9]+)/.exec(new URL(user.href).pathname)[1],
			name: user.innerText,
		};
	}
}
