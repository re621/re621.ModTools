import { PageDefinition } from "../models/data/Page";
import User from "../models/data/User";
import { TemplateBuilder, TemplateData } from "../models/structure/TemplateBuilder";
import Component from "./Component";

interface StoredButton extends TemplateData {
	/** Legacy field kept for backward compatibility with stored data. */
	name?: string;
	/** Legacy field kept for backward compatibility with stored data. */
	text?: string;
}

const DEFAULT_GREETING = "Hi %reporterName%,\n\n";

const FLAG_TEXT = "Thank you for the report. However, when a post is not suited for our site, a [i]\"flag\":[/help/flag_for_deletion][/i] is the correct remedy, as the moderators who handle reports can't delete posts (that's our janitors' job). [i]Reports[/i] are for when the [i]conduct[/i] relating to the post is disallowed (e.g. tag warring, removal of valid sources, uploaded with not enough tags, etc.), not for when the post's [i]content[/i] itself is disallowed.\n\n";
const FLAG_TEXT_END = ", but for future reference, you can flag posts by selecting `Flag` instead of `Report` in the sidebar. If you have trouble remembering, selecting the appropriate reason on either page will redirect you to the correct mechanism if the current one is incorrect.";

export default class TicketReasons extends Component {

	private builder?: TemplateBuilder;
	/** The name of the user who filed the ticket. Used for `%reporterName%` substitution. */
	private reporterName = "";
	private isEnabled: boolean;

	public constructor() {
		super({
			constraint: PageDefinition.tickets.view,
			waitForDOM: "textarea[name='ticket[response]']",
			dependencies: ["TicketData"],
		});
		this.isEnabled = User.isModerator || User.isAdmin;
	}

	public static get defaultTemplates(): TemplateData[] {
		return [
			{ title: "Handled", body: "This ticket has been handled, thank you!" },
			{ title: "Reviewed", body: "This ticket has been reviewed, thank you!" },
			{ title: "NAT", body: "Thank you for the heads-up! We've reviewed the ticket and completed our investigation into the matter; however, we've decided it does not warrant action at this time." },
			{ title: "Closed", body: "This ticket has been closed." },
			{ title: "Old (NAT)", body: "Thank you for your report, but that comment is from N years ago, & we do not punish people for comments older than 6 months." },
			{ title: "Old (Hide)", body: "Thank you for your report, but that comment is from N years ago, & we do not punish people for comments older than 6 months. We've removed the comment." },
			{ title: "Reply", body: "I believe that you tried to reply to a comment, but reported it instead.\nPlease, be more careful in the future." },
			{ title: "Already (Rec)", body: "Thank you for your report, but this user has already received a record for this matter." },
			{ title: "Already (Ban)", body: "Thank you for your report, but this user is already banned." },
			{ title: "Blacklist", body: "Thank you for your report, but this post's content does not violate our \"\":[/help/uploading_guidelines].\nIf you find the contents of the post objectionable, we'd ask you to add the relevant tags (or the post's id itself) to your \"blacklist\":[/help/blacklist]." },
			{ title: "Takedown", body: "Thank you for your report, but this matter needs to be handled via a takedown request.\nArtists, character owners, & commissioners may request a takedown \"here\":/static/takedown.\nWe do not accept third party takedowns." },
			{ title: "DMed", body: "Thank you for your report, we've discussed the matter with them." },
			{ title: "Flag (Del)", body: `${FLAG_TEXT}The post has already been deleted by our janitors${FLAG_TEXT_END}` },
			{ title: "Flag (Flag)", body: `${FLAG_TEXT}The post has already been flagged${FLAG_TEXT_END}` },
		];
	}

	public Settings: { enabled: boolean; buttons: StoredButton[]; greeting: string } = {
		enabled: true,
		buttons: TicketReasons.defaultTemplates,
		greeting: DEFAULT_GREETING,
	};

	protected create(): Promise<void> {
		if (!this.isEnabled) return Promise.resolve();

		const target = document.querySelector<HTMLTextAreaElement>("textarea[name='ticket[response]']");
		if (!target) return Promise.resolve();

		// Lift the reporter name out of the ticket info table for `%reporterName%` substitution.
		const rows = Array.from(document.querySelectorAll<HTMLElement>("#c-tickets .section tr"));
		const req = rows.find((e) => e.innerText.includes("Requested by"));
		this.reporterName = req?.querySelector<HTMLElement>("td a")?.innerText ?? "";

		this.builder = new TemplateBuilder({
			targetField: target,
			label: "Ticket reply templates",
			defaults: TicketReasons.defaultTemplates,
			getTemplates: () => this.Settings.buttons.map((b) => ({
				title: b.title ?? b.name ?? "",
				body: b.body ?? b.text ?? "",
			})),
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
