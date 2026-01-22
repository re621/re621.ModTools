import Page, { PageDefinition } from "../models/data/Page";
import Debug from "../models/Debug";
import { UtilDOM } from "../utilities/UtilDOM";
import Component from "./Component";
import { GenericBuilderComponent, GenericItem, GenericItemData, IComponentBuilder } from "./InputBuilderComponent";

export default class ForumBuilder extends Component implements IComponentBuilder<GenericItemData> {
	private builder: GenericBuilderComponent;
	public Settings: {enabled: boolean, buttons: Array<GenericItemData>} = {
		enabled: true,
		buttons: this.defaultButtons,
	};
	public constructor() {
		super({
			constraint: PageDefinition.forums.view_or_post,
			waitForDOM: ".dtext_formatter",
		});
		Debug.log(`Constructing Forum Builder? ${Page.matches(PageDefinition.forums.view_or_post)}`);
		console.log(`Constructing Forum Builder? ${Page.matches(PageDefinition.forums.view_or_post)}`);
	}
	get defaultButtons(): GenericItemData[] {
		return [
			{
				label: "test1",
				text: "This is test button #1"
			},
			{
				label: "test2",
				text: "This is test button #2"
			},
			{
				label: "test3",
				text: "This is test button #3"
			},
			{
				label: "test4",
				text: "This is test button #4"
			},
			{
				label: "test5",
				text: "This is test button #5"
			},
			{
				label: "test6",
				text: "This is test button #6"
			},
			{
				label: "test7",
				text: "This is test button #7"
			},
			{
				label: "test8",
				text: "This is test button #8"
			},
			{
				label: "test9",
				text: "This is test button #9"
			},
		];
	}

	protected create(): Promise<void> {
		Debug.log("Creating Forum Builder...");
		console.log("Creating Forum Builder...");
		UtilDOM.addStyle(`
			.re6-mod-tools-button-container {
				display: flex;
				flex-wrap: wrap;
			}
			.re6-mod-tools-button-container > button {
				margin: 0px .25rem;
				flex: none;
			}
		`);
		this.builder = new GenericBuilderComponent(
			this,
			$<HTMLDivElement>("<div>")
				.addClass("responses re6-mod-tools-button-container")
				.appendTo($(".forum_post_body")),
				// .appendTo($("form.new_forum_post .forum_post_body")),
			$("textarea[name='forum_post[body]']"),
			GenericItem.defaultEmptyInstance,
			GenericItem.instanceFactory,
			"Forum Responses Settings"
		);
		return;
	}
}