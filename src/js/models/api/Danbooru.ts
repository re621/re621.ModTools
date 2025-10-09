/* Type definitions for the Danbooru Javascript methods */

import XM from "./XM";

export default class Danbooru {

    private static _cachedModules: any;
    private static get Modules(): any {
        if (!this._cachedModules) {
            this._cachedModules = XM.Window["Danbooru"];
            if (!this._cachedModules) this._cachedModules = {};
        }
        return this._cachedModules;
    }

    private static _cachedModuleCount: number;
    private static get hasModules(): boolean {
        if (typeof this._cachedModuleCount == "undefined")
            this._cachedModuleCount = Object.keys(this.Modules).length;
        return this._cachedModuleCount > 0;
    }

    public static Autocomplete = {
        initialize_all(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Autocomplete.initialize_all();
        }
    }

    public static Blacklist = {
        apply(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.apply();

        },

        initialize_anonymous_blacklist(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.initialize_anonymous_blacklist();

        },

        initialize_all(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.initialize_all();

        },

        initialize_disable_all_blacklists(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.initialize_disable_all_blacklists();

        },

        stub_vanilla_functions(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.apply = (): void => { return; };
            Danbooru.Modules.Blacklist.initialize_disable_all_blacklists = (): void => { return; };
            Danbooru.Modules.Blacklist.initialize_all = (): void => { return; };
        },

        postShow(post: JQuery<HTMLElement>) {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.postShow(post);
        },

        postHide(post: JQuery<HTMLElement>) {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Blacklist.postHide(post);
        },
    }

    public static DText = {
        get buttons(): DTextButton[] {
            if (!Danbooru.hasModules) return;
            return Danbooru.Modules.DText.buttons;
        },
        set buttons(values: DTextButton[]) {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.DText.buttons = values;
        },
        override_formatting(fn: (content: string, input: JQuery<HTMLInputElement>) => void): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.DText.process_formatting = fn;
        },
        initialze_input($element: JQuery<HTMLDivElement>): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.DText.initialze_input($element);
        },
		// initialze_input($element: JQuery<HTMLDivElement>) {
		// 	const $preview = $(".dtext-formatter-preview", $element);
		// 	const $textarea = $(".dtext-formatter-input", $element);
		// 	const $charcount = $(".dtext-formatter-charcount", $element);
		// 	const allowColor = $element.attr("data-allow-color") === "true";

		// 	// Tab switching
		// 	$(".dtext-formatter-tabs a", $element).on("click", event => {
		// 		event.preventDefault();
		// 		if ($element.attr("data-editing") == "true") {
		// 			$preview.css("min-height", $textarea.outerHeight());
		// 			$element.attr("data-editing", "false");
		// 			Danbooru.Modules.DText.update_preview($textarea, $preview, allowColor);
		// 		} else {
		// 			$element.attr("data-editing", "true");
		// 			$preview.attr("loading", "false");
		// 		}
		// 	});
		
		// 	// Character count limit
		// 	const limit = parseInt($charcount.attr("data-limit") || "0");
		// 	$textarea.on("input.danbooru.formatter", () => {
		// 		const length = ($textarea.val() + "").length;
		// 		$charcount.toggleClass("overfill", length >= limit).attr("data-count", length);
		// 	});
		// 	$textarea.trigger("input.danbooru.formatter");
		
		// 	Danbooru.Modules.DText.initialize_formatting_buttons($element);
		// 	$element.attr("data-initialized", "true");
		// },

		// initialize_formatting_buttons(element) {
		// 	const $textarea = $(".dtext-formatter-input", element);
		
		// 	for (const button of $(".dtext-formatter-buttons a", element)) {
		// 		const $button = $(button);
		// 		const content = $button.attr("data-content");
		// 		$button.off("click");
		// 		$button.on("click", event => {
		// 			event.preventDefault();
		// 			Danbooru.Modules.DText.process_formatting(content, $textarea);
		// 		});
		// 	}
		// },

		// /** Refreshes the preview field to match the provided input */
		// update_preview (input, preview, allowColor = false) {
		// 	const currentText = input.val().trim();
		
		// 	// The input is empty, reset everything
		// 	if (!currentText) {
		// 		preview.text("");
		// 		input.removeData("cache");
		// 		return;
		// 	}
		
		// 	// The input is identical to the previous lookup
		// 	if (input.data("cache") == currentText) return;
		// 	input.data("cache", currentText);
		
		// 	preview
		// 		.html("")
		// 		.attr("loading", "true");
		// 	TaskQueue.add(() => {
		// 		$.ajax({
		// 			type: "post",
		// 			url: "/dtext_preview.json",
		// 			dataType: "json",
		// 			data: { body: currentText, allow_color: allowColor },
		// 			success: (response) => {
			
		// 			  // The loading was cancelled, since the user toggled back
		// 			  // to the editing tab and potentially changed the input
		// 			  if (preview.attr("loading") !== "true" || input.data("cache") !== currentText)
		// 			    return;
			
		// 			  preview
		// 			    .attr("loading", "false")
		// 			    .html(response.html);
		// 			  $(window).trigger("e621:add_deferred_posts", response.posts);
		// 			},
		// 			error: () => {
		// 			  preview
		// 			    .attr("loading", "false")
		// 			    .text("Unable to fetch DText preview.");
		// 			  input.removeData("cache");
		// 			},
		// 		}, { name: "DText.update_preview" });
		// 	});
		// },

		// /**
		//  * Processes a formatting button click.
		//  * @param {string} content Button action, ex. `[b]%selection%[/b]`
		//  * @param {JQuery<HTMLElement>} input Input element to alter
		//  */
		// process_formatting(content, input) {
		// 	const currentText = input.val() + "";
		// 	const position = {
		// 		start: input.prop("selectionStart"),
		// 		end: input.prop("selectionEnd"),
		// 	};
		
		// 	const offset = {
		// 		start: content.indexOf("%selection%"),
		// 		end: content.length - (content.indexOf("%selection%") + 11),
		// 	};
		
		// 	content = content.replace(/%selection%/g, currentText.substring(position.start, position.end));
		// 	input.trigger("focus");
		
		// 	// This is a workaround for a Firefox bug (prior to version 89)
		// 	// Check https://bugzilla.mozilla.org/show_bug.cgi?id=1220696 for more information
		// 	if (!document.execCommand("insertText", false, content))
		// 		input.val(currentText.substring(0, position.start) + content + currentText.substring(position.end, currentText.length));
		
		// 	input.prop("selectionStart", position.start + offset.start);
		// 	input.prop("selectionEnd", position.start + content.length - offset.end);
		// 	input.trigger("focus");
		// },

		// /** Add formatters to all appropriate inputs */
		// initialize_all_inputs() {
		// 	$(".dtext-formatter[data-initialized='false']").each((index, element) => {
		// 		Danbooru.Modules.DText.initialze_input($(element));
		// 	});
		// },
		/** Add formatters to all appropriate inputs */
		initialize_all_inputs() {
			if (!Danbooru.hasModules) return;
            Danbooru.Modules.DText.initialize_all_inputs();
		},
    };

    public static Post = {
        vote(post_id: number, scoreDifference: number, preventUnvote?: boolean): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Post.vote(post_id, scoreDifference, preventUnvote);
        },
        initialize_all(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Post.initialize_all();
        },
        update(post_id: number, params: any): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Post.update(post_id, params);
        },
        delete_with_reason(post_id: number, reason: string, reload_after_delete: boolean): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Post.delete_with_reason(post_id, reason, reload_after_delete);
        },
        undelete(post_id: number): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Post.undelete(post_id);
        },
        approve(post_id: number, should_reload = false): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Post.approve(post_id, should_reload);
        },
        disapprove(post_id: number, reason: string, should_reload = false): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Post.disapprove(post_id, reason, should_reload);
        },
        unapprove(post_id: number): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Post.unapprove(post_id);
        },
        resize_cycle_mode(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Post.resize_cycle_mode();
        },
        resize_to(size: string): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Post.resize_to(size);
        },
        resize_to_internal(size: string): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Post.resize_to_internal(size);
        },
        resize_notes(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Post.resize_notes();
        }
    };

    public static PostModeMenu = {
        change(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.PostModeMenu.change();
        },
        click(e: Event | any): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.PostModeMenu.click(e);
        },
        change_tag_script(script: number): void {
            if (!Danbooru.hasModules) return;
            const event = new CustomEvent("remt.dummy-event");
            event["key"] = script;
            Danbooru.Modules.PostModeMenu.change_tag_script(event);
        },
    };

    public static Note = {
        Box: {
            scale_all(): void {
                if (!Danbooru.hasModules) return;
                Danbooru.Modules.Note.Box.scale_all();

            }
        },

        TranslationMode: {
            active(state?: boolean): Promise<boolean> {
                if (!Danbooru.hasModules) return;
                if (state !== undefined) Danbooru.Modules.Note.TranslationMode.active = state;
                return Promise.resolve(Danbooru.Modules.Note.TranslationMode.active);

            },

            toggle(): void {
                if (!Danbooru.hasModules) return;
                Danbooru.Modules.Note.TranslationMode.toggle(new CustomEvent("remt.dummy-event"));

            },
        }
    };

    public static Thumbnails = {

        initialize(): void {
            if (!Danbooru.hasModules) return;
            Danbooru.Modules.Thumbnails.initialize();
        }

    }

    public static Shortcuts = {

        set disabled(value: boolean) {
            Danbooru.Modules.Shortcuts.disabled = value;
        }

    }

    public static E621 = {

        addDeferredPosts(posts: []): void {
            XM.Window["___deferred_posts"] = XM.Window["___deferred_posts"] || {}
            XM.Window["___deferred_posts"] = $.extend(XM.Window["___deferred_posts"], posts);
        }

    }

    public static notice(input: string, permanent?: boolean): void {
        Danbooru.Modules.notice(input, permanent);
    }

    public static error(input: string): void {
        Danbooru.Modules.error(input);
    }
}

export type DTextButton = {
    icon: string;
    title: string;
    content: string;
}
