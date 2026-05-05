import { PageDefinition } from "../models/data/Page";
import { TemplateBuilder, TemplateData } from "../models/structure/TemplateBuilder";
import Component from "./Component";

export default class ForumBuilder extends Component {
	public Settings: { enabled: boolean; buttons: TemplateData[] } = {
		enabled: true,
		buttons: [],
	};

	private builder?: TemplateBuilder;

	public constructor() {
		super({
			constraint: PageDefinition.forums.view_or_post,
			waitForDOM: ".new_forum_post .dtext_formatter",
		});
	}

	protected create(): Promise<void> {
		const target = document.querySelector<HTMLTextAreaElement>("form.new_forum_post textarea[name='forum_post[body]']");
		if (!target) return Promise.resolve();

		this.builder = new TemplateBuilder({
			targetField: target,
			label: "Forum templates",
			getTemplates: () => this.Settings.buttons,
			setTemplates: (next) => { this.Settings.buttons = next; },
		});
		this.builder.mount();
		return Promise.resolve();
	}

	protected async destroy(): Promise<void> {
		this.builder?.destroy();
	}
}
