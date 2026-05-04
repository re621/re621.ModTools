import { PageDefinition } from "../models/data/Page";
import { TemplateBuilder, TemplateData } from "../models/structure/TemplateBuilder";
import Component from "./Component";

export default class ForumBuilder extends Component {
	public Settings: { enabled: boolean; templates: TemplateData[] } = {
		enabled: true,
		templates: [],
	};

	private builder?: TemplateBuilder;

	public constructor() {
		super({
			constraint: PageDefinition.forums.view_or_post,
			waitForDOM: ".new_forum_post .dtext_formatter",
		});
	}

	protected create(): Promise<void> {
		const host = document.querySelector("form.new_forum_post .forum_post_body");
		const target = document.querySelector<HTMLTextAreaElement>("form.new_forum_post textarea[name='forum_post[body]']");
		if (!(host instanceof HTMLElement) || !target) return Promise.resolve();

		this.builder = new TemplateBuilder({
			hostElement: host,
			targetField: target,
			label: "Forum templates",
			getTemplates: () => this.Settings.templates,
			setTemplates: (next) => { this.Settings.templates = next; },
		});
		this.builder.mount();
		return Promise.resolve();
	}

	protected async destroy(): Promise<void> {
		this.builder?.destroy();
	}
}
