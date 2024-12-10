export default class Records {


    public static readonly Reasons = {
        vandalism: {
            text: "Don't remove valid tags from posts.",
            rules: "tagging",
        },
        tagging: {
            text: `[s]Strikethrough[/s] tags were invalid or inapplicable and have been removed or changed. $S\nPlease use the "Wiki":/wiki/show?title=help:home if you need help understanding the usage of any tags, or ask directly at the Helpdesk on our "Discord":/static/discord. You can also search our "Forum":/forum_topics.`,
            rules: "tagging",
        },
        mintags: {
            text: `You are expected to add at least 10 general category tags when uploading posts. $S\nPlease see our "Tagging Checklist":/help/tagging_checklist, view our "Uploading Guidelines":/help/uploading_guidelines, and consider using the "Related Tags" function on the upload form.\nUse the "Wiki":/wiki/show?title=help:home if you need help understanding the usage of any tags, or ask directly at the Helpdesk on our "Discord":/static/discord. You can also search our "Forum":/forum_topics.`,
            rules: "tagging",
        },
        inappropriate: {
            text: "Please don't make comments like this.",
            rules: "inappropriate",
        },
        tmi: {
            text: "We don't need to know that, please keep it to yourself.",
            rules: "inappropriate",
        },
        spamming: {
            text: "Don't spam.",
            rules: "spamming",
        },
        trolling: {
            text: "Don't be a troll.",
            rules: "disruptive",
        },
        blacklist: {
            text: "Please use your [[e621:blacklist|blacklist]].",
            rules: "blacklist",
        },
        blacklist2: {
            text: "[[e621:blacklist|Blacklist]] quietly, please.",
            rules: "blacklist",
        },
        roleplay: {
            text: "Please don't role-play in the comments.",
            rules: "roleplay",
        },
        roleplay2: {
            text: "This is not the place to look for roleplay partners.",
            rules: "roleplay",
        },
        plagiarism: {
            text: "We do not tolerate plagiarism.",
            rules: "plagiarism",
        },
        dnp: {
            text: "[[artist]] is Do Not Post.",
            rules: "posting",
        },
        cdnp: {
            text: "[[artist]] is conditionally DNP.",
            rules: "posting",
        },
        paysite: {
            text: "Paysite/commercial content is Do Not Post.",
            rules: "posting",
        },
        deleted: {
            text: "Don't reupload previously deleted posts. $S\nIf they were deleted once, they will be deleted again.",
            rules: "posting",
        },
        banevasion: {
            text: "Ban evasion.",
            rules: "sitetools",
        },
        votecheating: {
            text: "Do not use alt accounts to cheat the voting system.",
            rules: "sitetools",
        },
        votecheating1: {
            text: "Vote cheating alt.",
            rules: "sitetools",
        },
        underage: {
            text: "You need to be 18 to access this page.\nThis ban won't expire, but if you have reached the sufficient age you can request your ban to be lifted by writing an email to management@e621.net.",
            rules: "underage",
        },
    };

    public static readonly RuleGroups: { [name: string]: string } = {
        messages: "Messages – Private and Public",
        posts: "Posts and Tags",
        tools: "Abuse of Site Tools",
        illegal: "Illegal Activities",

        other: "Other Rules",
    }

    public static readonly Rules: { [name: string]: SiteRule } = {

        // Messages, Private and Public
        disruptive: {
            title: "Disruptive Behavior",
            group: this.RuleGroups.messages,
            preface: `e621 is an open and friendly community that people visit to share and enjoy furry artwork.\nPeople can have different opinions, but that does not give them permission to make someone else feel uncomfortable or unwanted.`,
            rules: [
                "Do not make messages with the apparent purpose of upsetting someone. That includes picking fights, baiting arguments, calling names, or making remarks regarding personal grievances, quarrels, or malicious rumors.",
                "Do not purposefully or repeatedly spread false or defamatory information.",
                "Do not mention any actions of suicide, self harm / mutilation, depression-induced pain, or other malicious acts directed towards the self.",
                "Do not encourage others to engage in harmful behaviors, including suicide, eating disorders, or other forms of self harm.",
                "Do not give others medical or legal advice that could result in harm coming to themselves or others.",
                "Do not promote ideologies that are harmful to public safety.",
                "Do not brag about saving DNP or pirated material, and do not encourage others to do so.",
                "Do not maliciously impersonate any individuals or organizations.",
                "Do not demand that certain administrative actions be taken against another user. Do not claim personal influence over staff decisions.",
                "Do not disobey any direct instructions made by staff members.",
            ]
        },
        harassment: {
            title: "Harassment, Doxxing, and Real-Life Threats",
            group: this.RuleGroups.messages,
            rules: [
                "Do not stalk or harass anyone. Do not try to contact someone if they have expressed that they do not wish to speak with you.",
                "Do not make any messages that call for or may lead to harassment.",
                "Do not promote or threaten violence in any capacity.",
                "Do not share or try to obtain any personal or identifiable information. That includes any privileged or personal information of other individuals or businesses, such as real-life names, addresses, unlisted contact information, social security numbers (or equivalents), credit card numbers, and correspondence (logs, emails, notes, etc.).",
            ],
        },
        hatred: {
            title: "National, Racial, or Ethnic Hatred",
            group: this.RuleGroups.messages,
            rules: [
                "Do not promote, allude to, or express national, racial, or ethnic hatred. That also includes usage or allusions to slurs or symbols.",
                "Do not identify with, allude to, or promote terrorist organizations, mass murderers, serial killers, or their ideologies.",
            ],
            postface: "Usage of these themes in artwork will be decided on a case-by-case basis.",
        },
        identity: {
            title: "Sexual Identity and Orientation",
            group: this.RuleGroups.messages,
            rules: [
                "Do not insultingly refer to any aspect of sexual identity or orientation, both in reference to yourself or to others.",
                "Do not purposefully misgender or deadname users, characters, or anyone else.",
            ],
        },
        blacklist: {
            title: "Refusal to Use Blacklist",
            group: this.RuleGroups.messages,
            preface: "This site hosts a wide variety of content, and not all of it may appeal to everyone.",
            rules: [
                "Do not complain about content that could be blacklisted. Simply add the corresponding tag to your blacklist. If you believe that a post is missing a valid tag, add the tag yourself.",
                "Do not make messages announcing that you have blacklisted a specific tag or certain kinds of content.",
            ],
        },
        inappropriate: {
            title: "Inappropriate Comments",
            group: this.RuleGroups.messages,
            preface: "Everyone who browses the website has the right, within realistic expectations, to not encounter sexualized comments that may make them uncomfortable.",
            rules: [
                "Do not create messages that share explicit details about sexual encounters, fantasies, fetishes, or actions.",
                "Do not create comments that exceed the post's rating.",
            ],
            postface: "You may find a few detailed examples of what kind of comments are considered inappropriate \"here\":/help/inappropriate_comments.",
        },
        roleplay: {
            title: "Role-Play",
            group: this.RuleGroups.messages,
            rules: [
                "Do not initiate, encourage, or partake in public role-play sessions, either between users or by yourself.",
                "Do not impersonate or partake in roleplay with either fictional or non-fictional characters.",
                "Minor cases of role-playing may be excused if they are short, either humorous or otherwise non-disruptive, and are made in response to a situation or joke set up by the content of a post, or in similar context.",
                "Do not solicit roleplay from other users.",
            ],
        },
        spamming: {
            title: "Spamming",
            group: this.RuleGroups.messages,
            rules: [
                "Do not excessively communicate the same phrase, similar phrases, or gibberish.",
                `Do not make non-constructive or derailing messages, including fad statements like "first", "TL;DR", "ITT", and so on.`,
                "Do not excessively post in old threads without adding anything to the discussion.",
                "Do not create pointless threads like forum games, asking for free art, and so on.",
            ],
        },
        advertising: {
            title: "Advertising",
            group: this.RuleGroups.messages,
            rules: [
                "Do not promote any external sites, resources, products, or services.",
                `If you are an artist or content owner, you are permitted to advertise products and services you may offer. You may do so in the "description" field of your posts, on the artist page, and in your profile description.`,
            ],
            postface: "If you wish to promote your products or services through a banner ad, please contact `ads@dragonfru.it` with any questions. See the \"advertisement help page\":/help/advertising for more information.",
        },


        // 2. Posts and Tags
        posting: {
            title: "Posting Abuse",
            group: this.RuleGroups.posts,
            rules: [
                "Do not knowingly or repeatedly upload content that goes against the \"Uploading Guidelines\":/help/uploading_guidelines.",
                "* Do not post works made by any of the artists or publishers on the \"Avoid Posting list\":/help/avoid_posting or break any uploading conditions set there.",
                "* Do not post any commercial or pay-to-view content. \"Free\" pay-to-view content – where you are allowed to set the price to $0 if you so choose – cannot be posted unless 60 days have passed after it was made available for free.",
                "* Do not knowingly upload or share previously deleted content. If you wish to dispute a post's removal, contact the staff member responsible for the deletion via a private message.",
                "Do not knowingly or repeatedly upload or share unauthorized edits of artwork after the original artist or character owner asked others not to.",
                "Do not knowingly or repeatedly upload content made by minors or featuring characters created or owned by minors.",
                "* Do not upload content that was made when the artist was underage, even if they are of age now.",
                "Do not upscale or otherwise manipulate images to artificially create a \"better\" version of an existing image.",
                "Do not upload content that is associated with recent real-life tragedies.",
            ]
        },
        tagging: {
            title: "Tagging, Rating, and Sourcing Abuse",
            group: this.RuleGroups.posts,
            rules: [
                "Do not add any tags that are invalid, and do not remove tags that are valid.",
                "* Tags in the general category are considered valid if they follow the \"Tag What You See principle\":/help/twys – that is, they must be describing what is visible in the post.",
                "* Tags in the lore category convey the artist's intentions or other background information.",
                "* Tags in other categories are valid if the information that they convey is objectively true, such as the artist's name or the image's aspect ratio.",
                "Do not upload posts with fewer than ten general, non-implied tags.",
                "* This restriction will be eased if the post does not have ten distinct tags that are reasonably applicable to it.",
                "Do not use tag or description edits to be disruptive.",
                "Do not change tags to incorrect categories.",
                "Do not apply post ratings that go against the \"Rating Guidelines\":/help/ratings.",
                null,
                "Do not add any sources that are invalid, and do not remove any sources that are valid.",
                "* Valid sources are defined as web pages where the artwork can be found.",
                "* At least one source page should be publicly available, unless you are the artist, commissioner, or copyright owner of the artwork.",
                "* Do not use links to piracy sites as sources.",
                "* Links to the exact submission page where the artwork can be found should be prioritized. This is not the same as the direct image link, which isn’t helpful. Links to the artist's gallery pages should be added to their artist page.",
                "* Do not add source links that redirect to a different URL (eg. URL shorteners).",
                "* Dead links to pages where the artwork could be found in the past are still considered valid and should instead be disabled by prefixing them with `-`.",
            ]
        },
        noteabuse: {
            title: "Note Abuse",
            group: this.RuleGroups.posts,
            rules: [
                "Do not edit post notes with irrelevant information or remove existing valid notes. Examples of valid notes include, but are not limited to:",
                "* Identifying characters in images with an especially high number of characters.",
                "* Linking to a picture that is featured inside another picture.",
                "* Translating non-English text into English.",
                "* Deciphering a coded message.",
                "* Correcting spelling and grammatical mistakes in text.",
                "Do not add any notes in languages other than English or that go against the \"Translation Guidelines\":/help/translation_guidelines.",
            ]
        },
        plagiarism: {
            title: "Plagiarism or Character Theft",
            group: this.RuleGroups.posts,
            rules: [
                "Do not claim ownership of any artwork or characters that don't belong to you.",
                "Do not upload or share any traced artwork without the consent of the copyright owner.",
                "Do not upload or share any artwork that had original watermarks or signatures removed from it. Similarly, do not add third-party watermarks or signatures to unrelated content.",
            ]
        },


        // Abuse of Site Tools
        sitetools: {
            title: "Abuse of Site Tools",
            group: this.RuleGroups.tools,
            rules: [
                "Do not use any site tools in a manner that could be construed as disruptive.",
                "Do not submit invalid or unnecessary requests, such as incorrect tickets or flags.",
                "Do not encourage other users to make duplicate reports for the same violation.",
                "Do not indiscriminately downvote posts based on their content. Blacklist the offending subject matter instead.",
                "Do not target users by downvoting their comments on unrelated posts. Blacklist the user instead.",
                "Do not attempt to game the voting system by offering incentives in exchange for upvotes, downvotes, or favorite counts.",
            ]
        },
        banevasion: {
            title: "Circumventing Site Restrictions or Suspensions",
            group: this.RuleGroups.tools,
            rules: [
                "Do not use alternate accounts to circumvent any site restrictions.",
                "* This includes, but is not limited to: bans, upload limits, time-based action limits, and so on.",
                "* Do not use alternate accounts to abuse the voting system or manipulate public opinion.",
                "Do not have others act on your behalf while currently under a suspension or a ban.",
                "Do not delete and re-create an account to get rid of previous records.",
            ]
        },


        // Illegal Activities
        illegalcontent: {
            title: "Illegal Activities or Content",
            group: this.RuleGroups.illegal,
            rules: [
                "Do not engage in, promote, encourage, plan, post, or link to any content or activities that violate US law or anything that could be used as directions for committing a crime.",
                "Do not discuss details or experiences of committing illegal acts, such as drug use, non-consensual sex, violence, or abuse against any human or creature.",
                "Do not post images or videos depicting real-life minors in sexual situations or acts.",
            ]
        },
        extremecontent: {
            title: "Extreme Activities or Content",
            group: this.RuleGroups.illegal,
            rules: [
                "Do not upload or link to real-life material featuring animal genitalia or animals in sexual situations.",
                "Do not express or indicate any degree of attraction to real-life minors or animals.",
                "Do not link to any content featuring or referring to extreme real-life violence or violent sexual activities.",
                "Do not discuss the details, morality, or attraction towards any of the aforementioned subjects.",
            ]
        },
        piracy: {
            title: "Posting Unreleased Content / Hacking Data Files",
            group: this.RuleGroups.illegal,
            rules: [
                "Do not share any content or data that has been obtained through unauthorized or illegal means. Do not discuss or share methods or resources used to obtain such content.",
                "Do not link to content only available through paid subscription services. Do not quote or otherwise reference other users doing that either – simply report them and move on.",
            ]
        },
        underage: {
            title: "Age Restrictions",
            group: this.RuleGroups.illegal,
            preface: "By using e621 and/or registering an account, you agree that you are at least eighteen years of age. No individual under the age of eighteen may register an account, use our services, provide any personal information to e621, or otherwise upload or transmit personal information through our services.",
            rules: [],
            postface: "Even though laws may vary depending on your location, e621.net's management and service office is located in Arizona, USA, and it is those laws that we are required to abide by. We cannot knowingly allow any minors to view pornographic content, so we must be proactive in preventing underage access. This includes accounts that are either legally or illegally accessed by minors. Furthermore, we require official, government-issued photo identification as proof of you turning eighteen in order to release access to your account. Please email us at `management@e621.net` for further details.",
        },
    };

    public static readonly Prebuilt: Prebuilt[] = [
        {
            title: "Tagging",
            reason: "vandalism",
            rules: "tagging",
        },
        {
            title: "Creepy",
            reason: "inappropriate",
            rules: "inappropriate",
        },
        {
            title: "Roleplay",
            reason: "roleplay",
            rules: "roleplay",
        },
        {
            title: "Spam",
            reason: "spamming",
            rules: "spamming",
        },
        {
            title: "Trolling",
            reason: "trolling",
            rules: "disruptive",
        },
        {
            title: "Blacklist",
            reason: "blacklist",
            rules: "blacklist",
        },
        {
            title: "DNP",
            reason: "dnp",
            rules: "posting",
        },
        {
            title: "CDNP",
            reason: "cdnp",
            rules: "posting",
        },
        {
            title: "Paysite",
            reason: "paysite",
            rules: "posting",
        },
        {
            title: "Underage",
            reason: "underage",
            rules: "underage",
        },
    ];

}

interface SiteRule {
    /** Display name of the rule */
    title: string,

    /** Rule group name */
    group?: string,

    /* Rule text */
    preface?: string,
    rules: string[],
    postface?: string,

    /** Override for the rules link anchor */
    link?: string,
}

interface Prebuilt {
    title: string,
    reason: string,
    rules: string | string[],
}
