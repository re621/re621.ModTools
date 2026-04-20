import Page, { PageDefinition } from "../models/data/Page";
import Debug from "../models/Debug";
import Component from "./Component";
import { GenericBuilderComponent, GenericItem, GenericItemData, IComponentBuilder } from "./InputBuilderComponent";

/**
 * @todo Add for other forum DText inputs
 */
export default class ForumBuilder extends Component implements IComponentBuilder<GenericItemData> {
	private readonly builders: GenericBuilderComponent[] = [];
	private _builder?: GenericBuilderComponent;
	private get builder(): GenericBuilderComponent {
		if (!this._builder) throw Error("ForumBuilder.builder is not yet defined");
		return this._builder;
	}
	public Settings: {enabled: boolean, buttons: Array<GenericItemData>} = {
		enabled: true,
		buttons: this.defaultButtons,
	};
	public constructor() {
		super({
			constraint: PageDefinition.forums.view_or_post,
			waitForDOM: ".new_forum_post .dtext_formatter",
		});
		Debug.log(`Constructing Forum Builder? ${Page.matches(PageDefinition.forums.view_or_post)}`);
	}
	get defaultButtons(): GenericItemData[] {
		return [
			// {
			// 	label: "test1",
			// 	text: "This is test button #1"
			// },
		];
	}

	protected create(): Promise<void> {
		Debug.log("Creating Forum Builder...");
		this._builder = new GenericBuilderComponent(
			this,
			$<HTMLDivElement>("<div>")
				.addClass("responses re6-mod-tools-button-container")
				.appendTo($("form.new_forum_post .forum_post_body")),
			$("form.new_forum_post textarea[name='forum_post[body]']"),
			GenericItem.defaultEmptyInstance,
			GenericItem.instanceFactory,
			"Forum Responses Settings"
		);
		return Promise.resolve();
	}
}