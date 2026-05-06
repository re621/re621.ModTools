import { JSONObject } from "../../components/Component";
import XM from "../api/XM";
import { IconName, makeIcon } from "../../utilities/UtilIcons";
import { Confirm } from "./Confirm";
import Modal from "./Modal";

export interface TemplateData extends JSONObject {
	title: string;
	body: string;
}

export interface TemplateBuilderConfig {
	/** The textarea that gets templates inserted into it. The row of template chips is placed immediately above it (or above its DText wrapper, when present). */
	targetField: HTMLTextAreaElement;
	/** Title shown on the manager modal. */
	label: string;
	/** Read the current template list (typically from Component.Settings). */
	getTemplates: () => TemplateData[];
	/** Persist the template list. */
	setTemplates: (next: TemplateData[]) => void;
	/** Templates restored when the user clicks "Reset to defaults". */
	defaults?: TemplateData[];
	/** Optional transform applied at insert time (e.g. greeting / variable expansion). */
	transform?: (template: TemplateData) => string;
	/** Extra entries appended to the manager's kebab menu (per-host actions). */
	extraMenuItems?: Array<{ icon: IconName; label: string; onClick: () => void }>;
	/** A non-deletable, non-draggable chip pinned next to the kebab. Edits a separate value (e.g. a greeting). */
	pinnedChip?: {
		title: string;
		getBody: () => string;
		setBody: (body: string) => void;
		/** Restored alongside the templates list when the user resets to defaults. */
		defaultBody?: string;
	};
}

/** Sentinel value for `selectedIndex` indicating the pinned chip is selected. */
const PINNED_INDEX = -2;

interface PageGlobals {
	E621?: { DTextFormatter?: { buildFromTextarea($textarea: JQuery<HTMLTextAreaElement>): unknown } };
	$?: typeof $;
}

export class TemplateBuilder {
	private rowEl?: HTMLElement;
	private modalEl?: HTMLElement;
	private modal?: Modal;
	private chipsAreaEl?: HTMLElement;
	private formAreaEl?: HTMLElement;
	private titleInputEl?: HTMLInputElement;
	private bodyTextareaEl?: HTMLTextAreaElement;
	private deleteBtnEl?: HTMLElement;
	private selectedIndex = -1;
	private dragSourceIndex = -1;
	/** A new template the user is authoring; not committed until they type something. */
	private pending?: TemplateData;

	public constructor(private readonly config: TemplateBuilderConfig) {}

	public mount(): void {
		this.rowEl?.remove();
		const row = document.createElement("div");
		row.className = "template-builder-row";
		this.rowEl = row;
		// Place the row above the textarea, or above its DText wrapper when there is one.
		const anchor = this.config.targetField.closest(".dtext-formatter") ?? this.config.targetField;
		anchor.before(row);
		this.renderRow();
	}

	public destroy(): void {
		this.closeManager();
		this.rowEl?.remove();
		this.rowEl = undefined;
	}

	// #region Host row

	private renderRow(): void {
		if (!this.rowEl) return;
		this.rowEl.replaceChildren();

		for (const template of this.config.getTemplates()) {
			const chip = document.createElement("button");
			chip.type = "button";
			chip.className = "template-builder-chip";
			chip.textContent = template.title || "(untitled)";
			if (template.body) chip.title = template.body;
			chip.addEventListener("click", () => this.insert(template));
			this.rowEl.appendChild(chip);
		}

		const trigger = document.createElement("button");
		trigger.type = "button";
		trigger.className = "template-builder-chip template-builder-chip--icon-only";
		trigger.title = this.config.label;
		trigger.appendChild(makeIcon("settings"));
		trigger.addEventListener("click", () => this.openManager());
		this.rowEl.appendChild(trigger);
	}

	private insert(template: TemplateData): void {
		const text = this.config.transform ? this.config.transform(template) : template.body;
		if (!text) return;
		const target = this.config.targetField;
		target.value = text;
		target.dispatchEvent(new Event("input", { bubbles: true }));
		target.focus();
	}

	// #endregion

	// #region Manager modal

	private openManager(): void {
		const root = document.createElement("div");
		root.className = "template-builder-manager";

		this.chipsAreaEl = document.createElement("div");
		this.chipsAreaEl.className = "template-builder-manager__chips";
		root.appendChild(this.chipsAreaEl);

		this.formAreaEl = document.createElement("div");
		this.formAreaEl.className = "template-builder-manager__form";
		root.appendChild(this.formAreaEl);

		this.modalEl = root;
		this.selectedIndex = -1;
		this.pending = undefined;
		this.titleInputEl = undefined;
		this.bodyTextareaEl = undefined;

		this.modal = new Modal({
			title: this.config.label,
			content: $(root),
			autoOpen: true,
			width: 880,
			height: "auto",
		});
		this.modal.getElement().on("dialogclose", () => this.disposeModal());

		this.refreshChips();
		this.refreshForm();
	}

	private closeManager(): void {
		this.modal?.close();
	}

	private disposeModal(): void {
		if (!this.modal) return;
		this.modal.destroy();
		this.modal = undefined;
		this.modalEl = undefined;
		this.chipsAreaEl = undefined;
		this.formAreaEl = undefined;
		this.titleInputEl = undefined;
		this.bodyTextareaEl = undefined;
		this.deleteBtnEl = undefined;
	}

	private refreshChips(): void {
		if (!this.chipsAreaEl) return;
		const templates = this.config.getTemplates();
		const pendingIndex = this.pending ? templates.length : -1;
		const totalChips = templates.length + (this.pending ? 1 : 0);

		this.chipsAreaEl.replaceChildren();

		const chipsArea = this.chipsAreaEl;
		if (totalChips === 0) {
			const empty = document.createElement("div");
			empty.className = "template-builder-manager__empty";
			empty.textContent = "No templates yet. Click + to add one.";
			chipsArea.appendChild(empty);
		} else {
			templates.forEach((t, i) => chipsArea.appendChild(this.createManagerChip(t, i)));
			if (this.pending) chipsArea.appendChild(this.createManagerChip(this.pending, pendingIndex));
		}

		const addChip = document.createElement("button");
		addChip.type = "button";
		addChip.className = "template-builder-manager__add";
		addChip.title = "Add template";
		addChip.appendChild(makeIcon("plus"));
		addChip.addEventListener("click", () => this.addTemplate());
		this.chipsAreaEl.appendChild(addChip);

		const spacer = document.createElement("div");
		spacer.className = "template-builder-manager__spacer";
		this.chipsAreaEl.appendChild(spacer);

		if (this.config.pinnedChip) {
			const pinned = document.createElement("button");
			pinned.type = "button";
			pinned.className = "template-builder-manager__chip template-builder-manager__chip--pinned template-builder-manager__pinned";
			if (this.selectedIndex === PINNED_INDEX) pinned.classList.add("template-builder-manager__chip--selected");
			pinned.textContent = this.config.pinnedChip.title;
			pinned.addEventListener("click", () => {
				this.discardEmptyPending(PINNED_INDEX);
				this.selectedIndex = PINNED_INDEX;
				this.refreshChips();
				this.refreshForm();
			});
			this.chipsAreaEl.appendChild(pinned);
		}

		const kebabBtn = this.iconButton("kebab", "More actions", (e) => this.openKebabMenu(e.currentTarget as HTMLElement));
		kebabBtn.classList.add("template-builder-manager__kebab");
		this.chipsAreaEl.appendChild(kebabBtn);
	}

	private refreshForm(): void {
		if (!this.formAreaEl) return;
		const templates = this.config.getTemplates();
		const pendingIndex = this.pending ? templates.length : -1;
		const totalChips = templates.length + (this.pending ? 1 : 0);
		const pinned = this.selectedIndex === PINNED_INDEX ? this.config.pinnedChip : undefined;
		const isPinned = !!pinned;
		const selected: TemplateData | undefined = pinned
			? { title: pinned.title, body: pinned.getBody() }
			: this.selectedIndex === pendingIndex ? this.pending : templates[this.selectedIndex];

		if (selected) {
			if (!this.titleInputEl || !this.bodyTextareaEl) {
				this.formAreaEl.replaceChildren(this.buildForm());
			}
			const titleInput = this.titleInputEl;
			const bodyTextarea = this.bodyTextareaEl;
			if (!titleInput || !bodyTextarea) return;
			// Reset DText tab to Write in case the previous template was left on Preview.
			bodyTextarea.closest(".dtext-formatter")
				?.querySelector<HTMLElement>('.dtext-formatter-tab[action="write"]')?.click();
			titleInput.value = selected.title;
			titleInput.readOnly = isPinned;
			bodyTextarea.value = selected.body;
			if (this.deleteBtnEl) this.deleteBtnEl.style.visibility = isPinned ? "hidden" : "";
			// Refresh DText preview by triggering its namespaced jQuery event.
			const pageWindow = XM.Window as unknown as PageGlobals;
			pageWindow.$?.(bodyTextarea).trigger("input.dtext_formatter");
		} else {
			this.titleInputEl = undefined;
			this.bodyTextareaEl = undefined;
			const empty = document.createElement("div");
			empty.className = "template-builder-manager__form-empty";
			empty.textContent = totalChips
				? "Select a template to edit, or click + to add a new one"
				: "Click + to add your first template";
			this.formAreaEl.replaceChildren(empty);
		}
	}

	private createManagerChip(template: TemplateData, index: number): HTMLElement {
		const chip = document.createElement("button");
		chip.type = "button";
		chip.className = "template-builder-manager__chip";
		if (index === this.selectedIndex) chip.classList.add("template-builder-manager__chip--selected");
		chip.textContent = template.title || "(untitled)";
		chip.dataset.index = String(index);
		chip.draggable = true;

		chip.addEventListener("click", () => {
			this.discardEmptyPending(index);
			this.selectedIndex = index;
			this.refreshChips();
			this.refreshForm();
		});

		chip.addEventListener("dragstart", (e) => {
			this.dragSourceIndex = index;
			chip.classList.add("template-builder-manager__chip--dragging");
			if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
		});

		chip.addEventListener("dragend", () => {
			chip.classList.remove("template-builder-manager__chip--dragging");
		});

		chip.addEventListener("dragover", (e) => {
			e.preventDefault();
			if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
			if (this.dragSourceIndex >= 0 && this.dragSourceIndex !== index) {
				chip.classList.add("template-builder-manager__chip--drop-target");
			}
		});

		chip.addEventListener("dragleave", () => {
			chip.classList.remove("template-builder-manager__chip--drop-target");
		});

		chip.addEventListener("drop", (e) => {
			e.preventDefault();
			chip.classList.remove("template-builder-manager__chip--drop-target");
			if (this.dragSourceIndex < 0 || this.dragSourceIndex === index) return;
			const next = [...this.config.getTemplates()];
			const [moved] = next.splice(this.dragSourceIndex, 1);
			next.splice(index, 0, moved);
			if (this.selectedIndex === this.dragSourceIndex) this.selectedIndex = index;
			else if (this.selectedIndex === index) this.selectedIndex = this.dragSourceIndex;
			this.dragSourceIndex = -1;
			this.config.setTemplates(next);
			this.renderRow();
			this.refreshChips();
			this.refreshForm();
		});

		return chip;
	}

	/** Built once per opened modal. Listeners read this.selectedIndex so they always target the right template. */
	private buildForm(): DocumentFragment {
		const form = document.createDocumentFragment();

		const titleField = document.createElement("div");
		titleField.className = "template-builder-manager__field";
		const titleLabel = document.createElement("label");
		titleLabel.textContent = "Title";

		const titleRow = document.createElement("div");
		titleRow.className = "template-builder-manager__title-row";
		const titleInput = document.createElement("input");
		titleInput.type = "text";
		this.titleInputEl = titleInput;
		titleInput.addEventListener("input", () => {
			if (this.selectedIndex === PINNED_INDEX) return;
			this.updateTemplate(this.selectedIndex, { title: titleInput.value });
		});
		const deleteBtn = this.iconButton("trash", "Delete template", () => this.deleteSelected());
		deleteBtn.classList.add("template-builder-icon-button--danger");
		this.deleteBtnEl = deleteBtn;
		titleRow.append(titleInput, deleteBtn);

		titleField.append(titleLabel, titleRow);
		form.appendChild(titleField);

		const bodyField = document.createElement("div");
		bodyField.className = "template-builder-manager__field";
		const bodyLabel = document.createElement("label");
		bodyLabel.textContent = "Body";
		const bodyTextarea = document.createElement("textarea");
		bodyTextarea.rows = 8;
		this.bodyTextareaEl = bodyTextarea;
		bodyTextarea.addEventListener("input", () => {
			if (this.selectedIndex === PINNED_INDEX) {
				this.config.pinnedChip?.setBody(bodyTextarea.value);
				return;
			}
			this.updateTemplate(this.selectedIndex, { body: bodyTextarea.value });
		});
		bodyField.append(bodyLabel, bodyTextarea);
		form.appendChild(bodyField);

		this.attachDText(bodyTextarea);

		return form;
	}

	private attachDText(textarea: HTMLTextAreaElement): void {
		// DTextFormatter lives on the page window, not the userscript sandbox.
		// Must use the page's jQuery instance too, otherwise it doesn't recognize the element.
		const pageWindow = XM.Window as unknown as PageGlobals;
		const formatter = pageWindow.E621?.DTextFormatter;
		const page$ = pageWindow.$;
		if (!formatter || !page$) return;
		// Marker class makes the formatter dispatch a native `input` event after its buttons
		// modify the textarea. Without it, only a namespaced jQuery event fires and our listener misses it.
		textarea.classList.add("dtext-vue");
		formatter.buildFromTextarea(page$(textarea) as JQuery<HTMLTextAreaElement>);
	}

	// #endregion

	// #region Mutations

	private updateTemplate(index: number, patch: Partial<TemplateData>): void {
		const current = this.config.getTemplates();

		// Editing the pending draft. Promote it to the saved list once the body has content.
		// (A title without a body inserts nothing, so it's not yet a useful template.)
		if (this.pending && index === current.length) {
			this.pending = { ...this.pending, ...patch };
			if (this.pending.body) {
				const next = [...current, this.pending];
				this.pending = undefined;
				this.config.setTemplates(next);
				this.renderRow();
			}
			this.updateChipText(index, patch.title);
			return;
		}

		if (!current[index]) return;
		const next = [...current];
		next[index] = { ...next[index], ...patch };
		this.config.setTemplates(next);
		this.updateChipText(index, patch.title);
		this.renderRow();
	}

	private updateChipText(index: number, title: string | undefined): void {
		if (title === undefined) return;
		const chip = this.modalEl?.querySelector<HTMLElement>(`.template-builder-manager__chip[data-index="${index}"]`);
		if (chip) chip.textContent = title || "(untitled)";
	}

	private addTemplate(): void {
		// If there's already a pending draft without a body, just focus it.
		if (this.pending && !this.pending.body) {
			this.selectedIndex = this.config.getTemplates().length;
			this.focusTitle();
			return;
		}
		this.pending = { title: "", body: "" };
		this.selectedIndex = this.config.getTemplates().length;
		this.refreshChips();
		this.refreshForm();
		this.focusTitle();
	}

	private focusTitle(): void {
		this.modalEl?.querySelector<HTMLInputElement>(".template-builder-manager__field input")?.focus();
	}

	/** Drop a pending draft that lacks a body when the user navigates to another chip. */
	private discardEmptyPending(targetIndex: number): void {
		const pendingIndex = this.config.getTemplates().length;
		if (this.pending && targetIndex !== pendingIndex && !this.pending.body) {
			this.pending = undefined;
		}
	}

	private async deleteSelected(): Promise<void> {
		const templates = this.config.getTemplates();

		// Pending draft: just discard. Nothing has been saved, so no confirm needed.
		if (this.pending && this.selectedIndex === templates.length) {
			this.pending = undefined;
			this.selectedIndex = -1;
			this.refreshChips();
			this.refreshForm();
			return;
		}

		const t = templates[this.selectedIndex];
		if (!t) return;
		const ok = await Confirm.ask(`Delete "${t.title || "(untitled)"}"?`, { confirmLabel: "Delete", danger: true });
		if (!ok) return;
		const next = templates.filter((_, i) => i !== this.selectedIndex);
		this.selectedIndex = -1;
		this.config.setTemplates(next);
		this.renderRow();
		this.refreshChips();
		this.refreshForm();
	}

	private async reset(): Promise<void> {
		const ok = await Confirm.ask("Reset all templates to defaults?", { confirmLabel: "Reset", danger: true });
		if (!ok) return;
		this.config.setTemplates([...(this.config.defaults ?? [])]);
		const pinned = this.config.pinnedChip;
		if (pinned && pinned.defaultBody !== undefined) pinned.setBody(pinned.defaultBody);
		this.selectedIndex = -1;
		this.pending = undefined;
		this.renderRow();
		this.refreshChips();
		this.refreshForm();
	}

	private exportToFile(): void {
		const json = JSON.stringify(this.config.getTemplates(), null, 2);
		const blob = new Blob([json], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = "templates.json";
		document.body.appendChild(a);
		a.click();
		a.remove();
		URL.revokeObjectURL(url);
		this.toast("Saved templates.json");
	}

	private importFromFile(): void {
		const input = document.createElement("input");
		input.type = "file";
		input.accept = "application/json,.json";
		input.addEventListener("change", () => {
			const file = input.files?.[0];
			if (!file) return;
			file.text().then((text) => this.applyImport(text));
		});
		input.click();
	}

	private applyImport(text: string): void {
		let parsed: unknown;
		try {
			parsed = JSON.parse(text);
		} catch {
			this.toast("Invalid JSON file");
			return;
		}
		if (!Array.isArray(parsed)) {
			this.toast("Expected an array of templates");
			return;
		}

		const valid = parsed.filter((v): v is TemplateData =>
			typeof v === "object" && v !== null
				&& typeof (v as Record<string, unknown>).title === "string"
				&& typeof (v as Record<string, unknown>).body === "string");

		const existing = this.config.getTemplates();
		const isDup = (a: TemplateData) => existing.some((b) => b.title === a.title && b.body === a.body);
		const additions = valid.filter((v) => !isDup(v));

		this.config.setTemplates([...existing, ...additions]);
		this.selectedIndex = -1;
		this.pending = undefined;
		this.renderRow();
		this.refreshChips();
		this.refreshForm();
		this.toast(`Imported ${additions.length} template${additions.length === 1 ? "" : "s"}`);
	}

	// #endregion

	// #region UI helpers

	private iconButton(icon: IconName, title: string, onClick: (e: MouseEvent) => void): HTMLButtonElement {
		const btn = document.createElement("button");
		btn.type = "button";
		btn.className = "template-builder-icon-button";
		btn.title = title;
		btn.appendChild(makeIcon(icon));
		btn.addEventListener("click", onClick);
		return btn;
	}

	private openKebabMenu(anchor: HTMLElement): void {
		const menu = document.createElement("div");
		menu.className = "template-builder-menu";

		const items: Array<{ icon: IconName; label: string; onClick: () => void }> = [
			{ icon: "reset", label: "Reset to defaults", onClick: () => this.reset() },
			{ icon: "copy", label: "Export to file", onClick: () => this.exportToFile() },
			{ icon: "paste", label: "Import from file", onClick: () => this.importFromFile() },
			...(this.config.extraMenuItems ?? []),
		];

		for (const item of items) {
			const btn = document.createElement("button");
			btn.type = "button";
			btn.appendChild(makeIcon(item.icon));
			const label = document.createElement("span");
			label.textContent = item.label;
			btn.appendChild(label);
			btn.addEventListener("click", () => {
				closeMenu();
				item.onClick();
			});
			menu.appendChild(btn);
		}

		document.body.appendChild(menu);
		const rect = anchor.getBoundingClientRect();
		menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
		// Right-align the menu's right edge with the anchor; clamp so the menu can't run off either edge of the viewport.
		const margin = 4;
		const idealLeft = rect.right + window.scrollX - menu.offsetWidth;
		const minLeft = window.scrollX + margin;
		const maxLeft = window.scrollX + window.innerWidth - menu.offsetWidth - margin;
		menu.style.left = `${Math.max(minLeft, Math.min(idealLeft, maxLeft))}px`;

		const onOutside = (e: MouseEvent) => {
			if (!menu.contains(e.target as Node)) closeMenu();
		};
		const onEscape = (e: KeyboardEvent) => {
			if (e.key === "Escape") closeMenu();
		};
		const closeMenu = () => {
			menu.remove();
			document.removeEventListener("mousedown", onOutside);
			document.removeEventListener("keydown", onEscape);
		};
		setTimeout(() => {
			document.addEventListener("mousedown", onOutside);
			document.addEventListener("keydown", onEscape);
		}, 0);
	}

	private toast(message: string): void {
		const el = document.createElement("div");
		el.className = "template-builder-toast";
		el.textContent = message;
		document.body.appendChild(el);
		requestAnimationFrame(() => el.classList.add("template-builder-toast--show"));
		setTimeout(() => {
			el.classList.remove("template-builder-toast--show");
			setTimeout(() => el.remove(), 300);
		}, 1800);
	}

	// #endregion
}
