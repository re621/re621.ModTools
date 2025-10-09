import Danbooru from "../models/api/Danbooru";
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
	protected create(): Promise<void> {
		const dmailInfo = DMailToStaffNote.findDMailIds();
		this.dmailTitleText = dmailInfo.title;
		
		const cBox = document.createElement("input");
		const cBoxLabel = document.createElement("label");

		const inputBox = document.createElement("div");
		const noteHeaderLabel = document.createElement("label");
		const noteHeader = document.createElement("textarea");
		const noteFooterLabel = document.createElement("label");
		const noteFooter = document.createElement("textarea");
		
		const form = document.createElement("form");
		const staff_note_body = document.createElement("textarea");
		const staff_note_bodyLabel = document.createElement("label");
		const submit = document.createElement("input");

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

		cBox.style.display = "block";
		cBox.style.marginTop = "4px";
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
		/* const fancyDText =  */UtilDOM.buildDTextInput(staff_note_body, {
			showHelpText: true,
			container: form,
		}) as HTMLDivElement;
		// form.appendChild(fancyDText);
		// Danbooru.DText.initialize_input($(fancyDText));
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

	public static buildDTextInputOld(textarea: HTMLElement, limit = 0, allow_color = false, showHelpText = false) {
		const root = document.createElement("div");
		root.className = "dtext-formatter"
		root.dataset.editing = "true"
		root.dataset.initialized = "false"
		root.setAttribute("data-allow-color", allow_color + "");// root.dataset["allow-color"] = allow_color ? "true" : "false";
		const tabs = document.createElement("div");
		root.appendChild(tabs);
		tabs.className = "dtext-formatter-tabs";
		const write = document.createElement("a");
		tabs.appendChild(write)
		write.dataset.action = "edit";
		write.setAttribute("role", "tab");
		write.innerText = "Write";
		const previewTab = document.createElement("a");
		tabs.appendChild(previewTab)
		previewTab.dataset.action = "show";
		previewTab.setAttribute("role", "tab");
		previewTab.innerText = "Preview";

		const toolbar = document.createElement("div");
		root.appendChild(toolbar);
		toolbar.className = "dtext-formatter-buttons";
		toolbar.setAttribute("role", "toolbar");
		
		const bBold = document.createElement("a");
		toolbar.appendChild(bBold);
		bBold.title = "Bold";
		bBold.dataset.content = "[b]%selection%[/b]";
		const bBoldI = document.createElement("i");
		bBold.appendChild(bBoldI);
		bBoldI.className = "fa-solid fa-bold";

		const bItalics = document.createElement("a");
		toolbar.appendChild(bItalics);
		bItalics.title = "Italics";
		bItalics.dataset.content = "[i]%selection%[/i]";
		const bItalicsI = document.createElement("i");
		bItalics.appendChild(bItalicsI);
		bItalicsI.className = "fa-solid fa-italic";

		const bStrikethrough = document.createElement("a");
		toolbar.appendChild(bStrikethrough);
		bStrikethrough.title = "Strikethrough";
		bStrikethrough.dataset.content = "[s]%selection%[/s]";
		const bStrikethroughI = document.createElement("i");
		bStrikethrough.appendChild(bStrikethroughI);
		bStrikethroughI.className = "fa-solid fa-strikethrough";

		const bUnderline = document.createElement("a");
		toolbar.appendChild(bUnderline);
		bUnderline.title = "Underline";
		bUnderline.dataset.content = "[u]%selection%[/u]";
		const bUnderlineI = document.createElement("i");
		bUnderline.appendChild(bUnderlineI);
		bUnderlineI.className = "fa-solid fa-underline";
		
		const spacer = document.createElement("span");
		toolbar.appendChild(spacer);
		spacer.className = "spacer";

		const bHeader = document.createElement("a");
		toolbar.appendChild(bHeader);
		bHeader.title = "Header";
		bHeader.dataset.content = "h2.%selection%";
		const bHeaderI = document.createElement("i");
		bHeader.appendChild(bHeaderI);
		bHeaderI.className = "fa-solid fa-heading";

		const bSpoiler = document.createElement("a");
		toolbar.appendChild(bSpoiler);
		bSpoiler.title = "Spoiler";
		bSpoiler.dataset.content = "[spoiler]%selection%[/spoiler]";
		const bSpoilerI = document.createElement("i");
		bSpoiler.appendChild(bSpoilerI);
		bSpoilerI.className = "fa-solid fa-eye-slash";

		const bCode = document.createElement("a");
		toolbar.appendChild(bCode);
		bCode.title = "Code";
		bCode.dataset.content = "[code]%selection%[/code]";
		const bCodeI = document.createElement("i");
		bCode.appendChild(bCodeI);
		bCodeI.className = "fa-solid fa-code";

		const bQuote = document.createElement("a");
		toolbar.appendChild(bQuote);
		bQuote.title = "Quote";
		bQuote.dataset.content = "[quote]%selection%[/quote]";
		const bQuoteI = document.createElement("i");
		bQuote.appendChild(bQuoteI);
		bQuoteI.className = "fa-solid fa-quote-right";

		root.appendChild(textarea);

		const preview = document.createElement("div");
		root.appendChild(preview);
		preview.className = "dtext-formatter-preview dtext-container";

		const charCount = document.createElement("div");
		root.appendChild(charCount);
		charCount.className = "dtext-formatter-charcount";
		charCount.dataset.limit = `${limit || 0}`;

		if (!showHelpText) return root;
		const help = document.createElement("span");
		help.className = "hint";
		help.innerHTML = 'All text is formatted using <a href="/help/dtext" target="_blank" rel="noopener" tabindex="-1">DText</a>';
		return [root, help];
	}
	public static getDTextInput(textarea: string, limit: number, allow_color = false) {
		return `
		<div class="dtext-formatter" data-editing="true" data-initialized="false" data-allow-color="${allow_color}">
		  <div class="dtext-formatter-tabs">
		    <a data-action="edit" role="tab">Write</a>
		    <a data-action="show" role="tab">Preview</a>
		  </div>
		  <div class="dtext-formatter-buttons" role="toolbar">
		    <a title="Bold" data-content="[b]%selection%[/b]"><i class="fa-solid fa-bold"></i></a>
		    <a title="Italics" data-content="[i]%selection%[/i]"><i class="fa-solid fa-italic"></i></a>
		    <a title="Strikethrough" data-content="[s]%selection%[/s]"><i class="fa-solid fa-strikethrough"></i></a>
		    <a title="Underline" data-content="[u]%selection%[/u]"><i class="fa-solid fa-underline"></i></a>
		    <span class="spacer"></span>
		    <a title="Header" data-content="h2.%selection%"><i class="fa-solid fa-heading"></i></a>
		    <a title="Spoiler" data-content="[spoiler]%selection%[/spoiler]"><i class="fa-solid fa-eye-slash"></i></a>
		    <a title="Code" data-content="[code]%selection%[/code]"><i class="fa-solid fa-code"></i></a>
		    <a title="Quote" data-content="[quote]%selection%[/quote]"><i class="fa-solid fa-quote-right"></i></a>
		  </div>
		  ${textarea}
		  <div class="dtext-formatter-preview dtext-container"></div>
		  <div class="dtext-formatter-charcount" data-limit="${limit || 0}"></div>
		</div>
		<span class="hint">All text is formatted using <a href="/help/dtext" target="_blank" rel="noopener" tabindex="-1">DText</a></span>
		`;
	}
}
