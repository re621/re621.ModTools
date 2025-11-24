import Danbooru from "../models/api/Danbooru";
import Util from "./Util";

export class UtilDOM {

    /**
     * Adds the given style to the document and returns the injected style element
     * @param css string CSS styles
     */
    public static addStyle(css: string): JQuery<HTMLElement> {
        return $("<style>")
            .attr({
                "id": Util.ID.make(),
                "type": "text/css"
            })
            .html(css)
            .appendTo("head");
    }

    /** Sets up a container to load modals into */
    public static setupDialogContainer(): void {
        $("<div>")
            .attr("id", "remt-container")
            .prependTo("body");
    }

    /**
     * Adds a button to the top-right of the navbar
     * @param config Button configuration
     * @param target Target element
     */
    public static addSettingsButton(config: SettingsButton, target = "menu.extra"): JQuery<HTMLElement> {
        if (config.name === undefined) config.name = "T";
        if (config.href === undefined) config.href = "";
        if (config.title === undefined) config.title = "";

        if (config.tabClass === undefined) config.tabClass = "";
        if (config.linkClass === undefined) config.linkClass = "";

        if (config.attr === undefined) config.attr = {};

        const $tab = $(`<li>`).appendTo(target);
        const $link = $("<a>")
            .html(config.name)
            .attr({
                "title": config.title,
                "id": config.id,
            })
            .appendTo($tab);

        if (config.onClick !== undefined)
            $link.on("click", () => { config.onClick($link); });

        if (config.href) { $link.attr("href", config.href); }
        if (config.tabClass) { $tab.addClass(config.tabClass); }
        if (config.linkClass) { $link.addClass(config.linkClass); }
        if (config.attr) { $link.attr(config.attr); }

        return $link;
    }

	/**
	 * 
	 * @param param0 
	 * @returns 
	 * @copyright https://cssloaders.github.io/
	 */
	public static makeSpinnerJQuery({
		size = "48px",
		mainColor = "#FFF",
		secondaryColor = "#FF3D00",
		animationLength = "1s",
		spinnerWidth = "5px",
	}) {
		return $(`<span class="spinner"></span>`).css({
			"width": size,
			"height": size,
			"border": `${spinnerWidth} solid ${mainColor}`,
			"border-bottom-color": secondaryColor,
			"border-radius": "50%",
			"display": "inline-block",
			"box-sizing": "border-box",
			"animation": `rotation ${animationLength} linear infinite`,
		});
	}

	/**
	 * 
	 * @param param0 
	 * @returns 
	 * @copyright https://cssloaders.github.io/
	 */
	public static makeSpinnerDOM({
		size = "48px",
		mainColor = "#FFF",
		secondaryColor = "#FF3D00",
		animationLength = "1s",
		spinnerWidth = "5px",
	}) {
		const s = document.createElement("span");
		s.className = "spinner";
		s.style.width = s.style.height = size;
		s.style.border = `${spinnerWidth} solid ${mainColor}`;
		s.style.borderBottomColor = secondaryColor;
		s.style.borderRadius = "50%";
		s.style.display = "inline-block";
		s.style.boxSizing = "border-box";
		s.style.animation = `rotation ${animationLength} linear infinite`;
		return s;
	}

	// /**
	//  * Build a DText input element with the same style, form, & function of the ones supplied by the server.
	//  * @param textarea The main text entry element.
	//  * @param options 
	//  * @returns Either the root element or an array w/ the root element & the help text.
	//  * @todo Better utilize `innerHTML` to slim down.
	//  * @todo Turn into a web component for consistent interop.
	//  */
	// public static buildDTextInput(textarea: HTMLTextAreaElement, options?: DTextInputOptions): HTMLDivElement | HTMLElement[] {
	// 	const root = document.createElement("div");
	// 	root.className = "dtext-formatter"
	// 	root.dataset.editing = "true"
	// 	root.dataset.initialized = "false"
	// 	root.setAttribute("data-allow-color", (options?.allow_color || false) + "");
	// 	const tabs = document.createElement("div");
	// 	root.appendChild(tabs);
	// 	tabs.className = "dtext-formatter-tabs";
	// 	const write = document.createElement("a");
	// 	tabs.appendChild(write)
	// 	write.dataset.action = "edit";
	// 	write.setAttribute("role", "tab");
	// 	write.innerText = "Write";
	// 	const previewTab = document.createElement("a");
	// 	tabs.appendChild(previewTab)
	// 	previewTab.dataset.action = "show";
	// 	previewTab.setAttribute("role", "tab");
	// 	previewTab.innerText = "Preview";

	// 	const toolbar = document.createElement("div");
	// 	root.appendChild(toolbar);
	// 	toolbar.className = "dtext-formatter-buttons";
	// 	toolbar.setAttribute("role", "toolbar");
		
	// 	const bBold = document.createElement("a");
	// 	toolbar.appendChild(bBold);
	// 	bBold.title = "Bold";
	// 	bBold.dataset.content = "[b]%selection%[/b]";
	// 	const bBoldI = document.createElement("i");
	// 	bBold.appendChild(bBoldI);
	// 	bBoldI.className = "fa-solid fa-bold";

	// 	const bItalics = document.createElement("a");
	// 	toolbar.appendChild(bItalics);
	// 	bItalics.title = "Italics";
	// 	bItalics.dataset.content = "[i]%selection%[/i]";
	// 	const bItalicsI = document.createElement("i");
	// 	bItalics.appendChild(bItalicsI);
	// 	bItalicsI.className = "fa-solid fa-italic";

	// 	const bStrikethrough = document.createElement("a");
	// 	toolbar.appendChild(bStrikethrough);
	// 	bStrikethrough.title = "Strikethrough";
	// 	bStrikethrough.dataset.content = "[s]%selection%[/s]";
	// 	const bStrikethroughI = document.createElement("i");
	// 	bStrikethrough.appendChild(bStrikethroughI);
	// 	bStrikethroughI.className = "fa-solid fa-strikethrough";

	// 	const bUnderline = document.createElement("a");
	// 	toolbar.appendChild(bUnderline);
	// 	bUnderline.title = "Underline";
	// 	bUnderline.dataset.content = "[u]%selection%[/u]";
	// 	const bUnderlineI = document.createElement("i");
	// 	bUnderline.appendChild(bUnderlineI);
	// 	bUnderlineI.className = "fa-solid fa-underline";
		
	// 	const spacer = document.createElement("span");
	// 	toolbar.appendChild(spacer);
	// 	spacer.className = "spacer";

	// 	const bHeader = document.createElement("a");
	// 	toolbar.appendChild(bHeader);
	// 	bHeader.title = "Header";
	// 	bHeader.dataset.content = "h2.%selection%";
	// 	const bHeaderI = document.createElement("i");
	// 	bHeader.appendChild(bHeaderI);
	// 	bHeaderI.className = "fa-solid fa-heading";

	// 	const bSpoiler = document.createElement("a");
	// 	toolbar.appendChild(bSpoiler);
	// 	bSpoiler.title = "Spoiler";
	// 	bSpoiler.dataset.content = "[spoiler]%selection%[/spoiler]";
	// 	const bSpoilerI = document.createElement("i");
	// 	bSpoiler.appendChild(bSpoilerI);
	// 	bSpoilerI.className = "fa-solid fa-eye-slash";

	// 	const bCode = document.createElement("a");
	// 	toolbar.appendChild(bCode);
	// 	bCode.title = "Code";
	// 	bCode.dataset.content = "[code]%selection%[/code]";
	// 	const bCodeI = document.createElement("i");
	// 	bCode.appendChild(bCodeI);
	// 	bCodeI.className = "fa-solid fa-code";

	// 	const bQuote = document.createElement("a");
	// 	toolbar.appendChild(bQuote);
	// 	bQuote.title = "Quote";
	// 	bQuote.dataset.content = "[quote]%selection%[/quote]";
	// 	const bQuoteI = document.createElement("i");
	// 	bQuote.appendChild(bQuoteI);
	// 	bQuoteI.className = "fa-solid fa-quote-right";

	// 	root.appendChild(textarea);
	// 	if (!textarea.classList.contains("dtext-formatter-input"))
	// 		textarea.classList.add("dtext-formatter-input");
	// 	if ((!options?.limit) || options.limit < 0) {
	// 		textarea.removeAttribute("maxlength");
	// 	} else {
	// 		textarea.maxLength = options.limit;
	// 	}

	// 	const preview = document.createElement("div");
	// 	root.appendChild(preview);
	// 	preview.className = "dtext-formatter-preview dtext-container";

	// 	const charCount = document.createElement("div");
	// 	root.appendChild(charCount);
	// 	charCount.className = "dtext-formatter-charcount";
	// 	charCount.dataset.limit = `${options?.limit || 0}`;
	// 	charCount.dataset.count = `${options?.count || 0}`;

	// 	if (!options?.showHelpText) {
	// 		if (options?.container) {
	// 			options.container.appendChild(root);
	// 			Danbooru.DText.initialize_input($(root));
	// 		}
	// 		return root;
	// 	}
	// 	const help = document.createElement("span");
	// 	help.className = "hint";
	// 	help.innerHTML = 'All text is formatted using <a href="/help/dtext" target="_blank" rel="noopener" tabindex="-1">DText</a>';
	// 	if (options?.container) {
	// 		options.container.appendChild(root);
	// 		options.container.appendChild(help);
	// 		Danbooru.DText.initialize_input($(root));
	// 	}
	// 	return [root, help];
	// }

	/**
	 * Build a DText input element with the same style, form, & function of the ones supplied by the server.
	 * @param textarea The main text entry element.
	 * @param options 
	 * @returns Either the root element or an array w/ the root element & the help text.
	 * @todo Better utilize `innerHTML` to slim down.
	 * @todo Turn into a web component for consistent interop.
	 */
	public static buildDTextInput(textarea: HTMLTextAreaElement, options?: DTextInputOptions): HTMLDivElement | HTMLElement[] {
			return Danbooru.DTextFormatter.buildFromTextarea(textarea);
		const root = document.createElement("div");
		root.className = "dtext-formatter"
		root.dataset.editing = "true"
		root.dataset.initialized = "false"
		root.setAttribute("data-allow-color", (options?.allow_color || false) + "");
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
		if (!textarea.classList.contains("dtext-formatter-input"))
			textarea.classList.add("dtext-formatter-input");
		if ((!options?.limit) || options.limit < 0) {
			textarea.removeAttribute("maxlength");
		} else {
			textarea.maxLength = options.limit;
		}

		const preview = document.createElement("div");
		root.appendChild(preview);
		preview.className = "dtext-formatter-preview dtext-container";

		const charCount = document.createElement("div");
		root.appendChild(charCount);
		charCount.className = "dtext-formatter-charcount";
		charCount.dataset.limit = `${options?.limit || 0}`;
		charCount.dataset.count = `${options?.count || 0}`;

		if (!options?.showHelpText) {
			if (options?.container) {
				options.container.appendChild(root);
				// Danbooru.DText.initialize_input($(root));
			}
			return root;
		}
		const help = document.createElement("span");
		help.className = "hint";
		help.innerHTML = 'All text is formatted using <a href="/help/dtext" target="_blank" rel="noopener" tabindex="-1">DText</a>';
		if (options?.container) {
			options.container.appendChild(root);
			options.container.appendChild(help);
			// Danbooru.DText.initialize_input($(root));
		}
		return [root, help];
	}

	// public static getDTextInput(textarea: string, limit: number, allow_color = false) {
	// 	return `
	// 	<div class="dtext-formatter" data-editing="true" data-initialized="false" data-allow-color="${allow_color}">
	// 	  <div class="dtext-formatter-tabs">
	// 	    <a data-action="edit" role="tab">Write</a>
	// 	    <a data-action="show" role="tab">Preview</a>
	// 	  </div>
	// 	  <div class="dtext-formatter-buttons" role="toolbar">
	// 	    <a title="Bold" data-content="[b]%selection%[/b]"><i class="fa-solid fa-bold"></i></a>
	// 	    <a title="Italics" data-content="[i]%selection%[/i]"><i class="fa-solid fa-italic"></i></a>
	// 	    <a title="Strikethrough" data-content="[s]%selection%[/s]"><i class="fa-solid fa-strikethrough"></i></a>
	// 	    <a title="Underline" data-content="[u]%selection%[/u]"><i class="fa-solid fa-underline"></i></a>
	// 	    <span class="spacer"></span>
	// 	    <a title="Header" data-content="h2.%selection%"><i class="fa-solid fa-heading"></i></a>
	// 	    <a title="Spoiler" data-content="[spoiler]%selection%[/spoiler]"><i class="fa-solid fa-eye-slash"></i></a>
	// 	    <a title="Code" data-content="[code]%selection%[/code]"><i class="fa-solid fa-code"></i></a>
	// 	    <a title="Quote" data-content="[quote]%selection%[/quote]"><i class="fa-solid fa-quote-right"></i></a>
	// 	  </div>
	// 	  ${textarea}
	// 	  <div class="dtext-formatter-preview dtext-container"></div>
	// 	  <div class="dtext-formatter-charcount" data-limit="${limit || 0}"></div>
	// 	</div>
	// 	<span class="hint">All text is formatted using <a href="/help/dtext" target="_blank" rel="noopener" tabindex="-1">DText</a></span>
	// 	`;
	// }

    static getPlaceholderImage(): string {
        return "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";
    }

    static getPizza(): string {
        return "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABEAAAARCAYAAAA7bUf6AAAAAklEQVR4AewaftIAAAFOSURBVL3BMWrcQBiA0W82OoVg6wWJPcL+7RQC3WCLPYeauNA53PgEAyqUIsXMEQYJjDsPiOB0voCigRUMQk5iCHmPf0GxuJyPMwnng+ITMu5sXyPaYPMCgZmE80HxGxk7bF4g04jtayLRZibhfFAkFIvL+TjbviYSbYhsX/MR0YaV80F9YfH69v7w/duPr7fridv1xO16IiXa8Pj0zO16Inp8eqapStzLT17f3h8O/IFog80LbF4g2rDnwCeJNjRVSerAhmiDaMPK9jUyjcg0YvuaVdsNOB8UC0Xicj7ONi+IZBqxfU1KtKGpSqK2G3A+KBYH/pJoQ1OVRG034HxQ3GVsyDQS2b5mJdrQVCVR2w04HxSJjA3b16xEG6KmKonabsD5oNhQbFzOx5m7pipZtd2A80GxI2NHU5Ws2m4gcj4oPpCxo+0GVs4Hxf/wCzeQgfpPWb9hAAAAAElFTkSuQmCC";
    }

}

export interface DTextInputOptions {
	/** Character limit; used for indicator text (& for our inputs, validation). */
	limit?: number;
	/** Starting character count. */
	count?: number;
	allow_color?: boolean;
	showHelpText?: boolean;
	/** If provided, will automatically add it to the element & attempt to initialize the DTextInput; this will fail if this container element is not already attached to the DOM tree. */
    container?: HTMLElement;
}
interface SettingsButton {

    /** Unique button ID */
    id: string;

    /** Text inside the link */
    name?: string;
    /** Link address */
    href?: string;
    /** Hover text */
    title?: string;

    /** Extra class to append to the tab */
    tabClass?: string;
    /** Extra class to append to the link */
    linkClass?: string;

    /** Name-value pairs of the attribute to set */
    attr?: { [prop: string]: string };

    onClick?: ($element: JQuery<HTMLElement>) => void;
}
