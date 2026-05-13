import { PageDefinition } from "../models/data/Page";
import User from "../models/data/User";
import { TemplateBuilder, TemplateData } from "../models/structure/TemplateBuilder";
import Component from "./Component";

interface StoredButton extends TemplateData {
}

const DEFAULT_GREETING = "Hi %reporterName%,\n\n";

export default class AppealReasons extends Component {

	private builder?: TemplateBuilder;
	/** The name of the user who filed the appeal. Used for `%reporterName%` substitution. */
	private reporterName = "";
	private isEnabled: boolean;

	public constructor() {
		super({
			constraint: PageDefinition.appeals.view,
			waitForDOM: "textarea[name='appeal[response]']",
			dependencies: [],
		});
		this.isEnabled = User.isJanitor ||  User.isModerator || User.isAdmin;
	}

	public static get defaultTemplates(): TemplateData[] {
		return [
			{ title: "Approved", body: "Your appeal has been accepted, and the post has been restored." },
			{ title: "Rejected", body: "Your appeal has been rejected, and the post will remain deleted." },
		];
	}

	public Settings: { enabled: boolean; buttons: StoredButton[]; greeting: string } = {
		enabled: true,
		buttons: AppealReasons.defaultTemplates,
		greeting: DEFAULT_GREETING,
	};

	protected create(): Promise<void> {
		if (!this.isEnabled) return Promise.resolve();

		const target = document.querySelector<HTMLTextAreaElement>("textarea[name='appeal[response]']");
		if (!target) return Promise.resolve();

		this.reporterName = document.querySelector<HTMLElement>("#c-appeals .appeal-display-report-creator .user-post-uploader")?.innerText ?? "";

		this.builder = new TemplateBuilder({
			targetField: target,
			label: "Appeal reply templates",
			insertMode: "replace",
			defaults: AppealReasons.defaultTemplates,
			getTemplates: () => this.Settings.buttons,
			setTemplates: (next) => { this.Settings.buttons = next; },
			transform: (template) => {
				const greeting = this.Settings.greeting;
				const text = greeting.includes("%body%")
					? greeting.replace("%body%", template.body)
					: `${greeting}${template.body}`;
				return text.replace(/%reporterName%/g, this.reporterName);
			},
			pinnedChip: {
				title: "Greeting",
				getBody: () => this.Settings.greeting,
				setBody: (body) => { this.Settings.greeting = body; },
				defaultBody: DEFAULT_GREETING,
			},
		});
		this.builder.mount();
		return Promise.resolve();
	}

	protected async destroy(): Promise<void> {
		this.builder?.destroy();
	}
}
