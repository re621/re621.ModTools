import { PageDefinition } from "../models/data/Page";
import { TemplateBuilder, TemplateData } from "../models/structure/TemplateBuilder";
import Component from "./Component";

interface StoredButton extends TemplateData {
	/** Legacy field kept for backward compatibility with stored data. */
	label?: string;
	/** Legacy field kept for backward compatibility with stored data. */
	text?: string;
}

export default class DMailBuilder extends Component {
	public Settings: { enabled: boolean; buttons: StoredButton[] } = {
		enabled: true,
		buttons: DMailBuilder.defaultTemplates,
	};

	private builder?: TemplateBuilder;

	public constructor() {
		super({
			constraint: PageDefinition.dmails.new,
			waitForDOM: "form.new_dmail .dtext_formatter",
		});
	}

	public static get defaultTemplates(): TemplateData[] {
		return [
			{
				title: "Outreach",
				body: "Thank you for reaching out.",
			},
			{
				title: "Attempt",
				body: "Thank you for attempting to resolve this.",
			},
			{
				title: "Contesting Deletions",
				body: [
					`Our rules for contesting deletions are as follows:`,
					`1. [b][i]Politely[/i] contact the janitor who deleted the post[/b]: If they are no longer staff, have requested to not be contacted regarding deletions (e.g. "Mairo":[/users/38571]), or decline to reinstate the post, you may advance to the next step.`,
					`2. [b][i]Politely[/i] "contact our Janitor Lead":[/help/staff#list:~:text=Janitor%20Lead][/b]: They will review the matter & make a decision. If they decline to reinstate the post, you may advance to the next step.`,
					`3. [b][i]Politely[/i] "contact an Admin":[/help/staff#list:~:text=Administrator%20Team][/b]: They will review the matter & make a decision. If they decline to reinstate the post, you may advance to the next step.`,
					`4. [b][i]Politely[/i] "contact our Staff Lead":[/help/staff#list:~:text=Staff%20Lead][/b]: They will review the matter & make a decision. If they decline to reinstate the post, you may advance to the next step.`,
					`5. [b][i]Politely[/i] "contact our Site Lead":[/help/staff#list:~:text=Site%20Lead][/b]: They will review the matter & make a decision. [b][u]If our Site Lead declines to reinstate the post, then that is the end of the matter[/u][/b].`,
				].join("\n"),
			},
			{
				title: "AI: Exceptions",
				body: [
					`We allow for [[ai_assisted|3 narrow exceptions]] to our ban on AI assisted/generated content:`,
					`* [[ai_generated_audio|AI generated/assisted audio]]`,
					`* [[ai_generated_backgrounds|AI generated/assisted backgrounds]]`,
					`* [[ai_generated_reference|AI generated/assisted reference material]]`,
				].join("\n"),
			},
			{
				title: "AI: Flag",
				body: [
					`We do not tolerate public AI accusations outside of flags. If you genuinely think something uses some form of AI assistance/generation, then "flag it":[/help/flag_for_deletion] for "not meeting the Uploading Guidelines":[/help/uploading_guidelines#bad:~:text=AI%20Generated,Webm] & move on with your day; that actually brings it to our attention so we can investigate & resolve the matter. It's a lot more productive than throwing around accusations in the comments, & with 99% less drama, in-fighting, hurt feelings, & baseless reputational harm.`,
					``,
					`To be 100% clear, [b][i]the one and only place on this site to accuse posts of being AI is [u]in a flag[/u][/i][/b]. Not in the comments, forums, blips, user profiles, post/pool/set descriptions, or any other location.`,
				].join("\n"),
			},
			{
				title: "AI: Too Early", /* cspell:disable-next-line */
				body: `The earliest appearance of this exact image file makes the use of AI image materials extremely unlikely; OpenAI's first release of DALL-E was January 2021, and open-source furry-oriented models did not appear until December (with a few of the longest-enduring models not existing until 2023.) An additional thing to keep in mind about these early resources is that they produced lower-quality results, as people hadn't gotten to fine-tuning them yet, nor developing techniques for both image generation & how to best hide their giveaways.`,
			},
			{
				title: "AI: Detectors",
				body: `AI detection services (especially those that analyze the content itself instead of a file's metadata) are not particular reliable. The most cynical answer would be that these services may pretend to be able to detect AI-generated text and media in order to sell you a product, but a simpler answer is that the nature of human-made images is extremely broad, and so is the nature of how people use AI image generation; some prompt using text and then post their AI images as-is, some use their own art to inform an AI-generated image, and others still will simply trace AI-generated images to mask the most obvious details.`,
			},
			{
				title: "AI: How to spot",
				body: `If learning to detect AI images is something of legitimate interest to you, we suggest you browse AI-oriented sites, collect samples from those sites, and note what makes them different from human-made art. We can't provide any further guidance to you, since our own AI investigation team keeps their methods secret in order to avoid giving artists hints on how to elude them.`,
			},
			{
				title: "Takedown: No Third-party",
				body: `Only artists, character owners, & commissioners may issue takedown requests for their material, & they must do so directly; we do not accept third party takedown requests.`,
			},
			{
				title: "Takedown: Required",
				body: `This requires a takedown request.`,
			},
			{
				title: "Takedown: See here",
				body: `See "here":[/static/takedown] for details about takedown requests.`,
			},
			{
				title: "Translation tags",
				body: [
					`For all posts with non-English text, they are in 1 of 3 states of translation:`,
					`* [[translation_request]] - The post [b]has some non-English text[/b] that [b]does not have "notes":[/help/notes][/b] translating it into English.`,
					`* [[partially_translated]] - The post [b]has non-English text[/b] & [b]has "notes":[/help/notes][/b] translating [b][i]some[/i] of it, but not [i]all[/i] of it,[/b] into English.`,
					`** All \`partially_translated\` posts also have \`translation_request\`.`,
					`* [[translated]] - The post [b]has non-English text[/b] & [b]has "notes":[/help/notes][/b] translating [b][i]all[/i] of it into[/b] English.`,
					`If \`partially_translated\` or \`translated\` the post might [b][i]also[/i][/b] have:`,
					`* [[translation_check]] - The post [b]has non-English text[/b], [b]has "notes":[/help/notes][/b] translating [b][i]some[/i] or [i]all[/i] of it[/b] into English, but the [b]translation is suspected of being poor quality[/b].`,
					`** Basically, "This [b]has a translation[/b], but I think it's a [b][i]bad[/i] translation that [i]needs to be corrected[/i][/b]."`,
					`If the [b][i]original image[/i] had non-English text[/b] & an [b][i]alternate version[/i] of the [i]same image[/i] with [i]translations to English[/i][/b] was uploaded, in addition to some combination of the above tags, the [b]edited version[/b] would have:`,
					`* [[hard_translated]] - The post is an [b]edited version[/b] of an image which [b]translates the original text[/b] from a non-English language to English.`,
					`** If this translated version was not created by the same person who made the original image, then it is also a 3rd party [[translation edit]].`,
				].join("\n"),
			},
		];
	}

	protected create(): Promise<void> {
		const target = document.querySelector<HTMLTextAreaElement>("form.new_dmail textarea[name='dmail[body]']");
		if (!target) return Promise.resolve();

		this.builder = new TemplateBuilder({
			targetField: target,
			label: "DMail templates",
			defaults: DMailBuilder.defaultTemplates,
			getTemplates: () => this.Settings.buttons.map((b) => ({
				title: b.title ?? b.label ?? "",
				body: b.body ?? b.text ?? "",
			})),
			setTemplates: (next) => { this.Settings.buttons = next; },
		});
		this.builder.mount();
		return Promise.resolve();
	}

	protected async destroy(): Promise<void> {
		this.builder?.destroy();
	}
}
