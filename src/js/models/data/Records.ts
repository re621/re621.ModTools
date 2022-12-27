export default class Records {


    public static readonly Reasons = {
        vandalism: "Don't remove valid tags from posts.",
        tagging: `[s]Strikethrough[/s] tags were invalid or inapplicable and have been removed or changed. %SOURCES%\nPlease use the "Wiki":/wiki/show?title=help:home if you need help understanding the usage of any tags, or ask directly at the Helpdesk on our "Discord":/static/discord. You can also search our "Forum":/forum_topics.`,
        inappropriate: "Please don't make comments like this.",
        tmi: "We don't need to know that, please keep it to yourself.",
        spamming: "Don't spam.",
        trolling: "Don't be a troll.",
        blacklist: "Please use your blacklist.",
        roleplay: "Please don't role-play in the comments.",
        roleplay2: "This is not the place to look for roleplay partners.",
        plagiarism: "We do not tolerate plagiarism.",
        dnp: "[[artist]] is Do Not Post.",
        cdnp: "[[artist]] is conditionally DNP.",
        paysite: "Paysite/commercial content is Do Not Post.",
        banevasion: "Ban evasion.",
        underage: "You need to be 18 to access this page.\nThis ban won't expire, but if you have reached the sufficient age you can request your ban to be lifted by writing an email to management@e621.net.",

    };

    public static readonly Rules: { [name: string]: SiteRule } = {
        abuseOfSiteTools: {
            title: "Abuse of Site Tools",
            rules: [
                "Using any of the site tools, such as Flag for Deletion, ticket reporting system, takedowns, notes, or any other site tool in a fashion that can be construed as disruptive, spamming, or defamatory",
                "Putting gibberish in any of the description fields",
                "Repeatedly submitting invalid, incorrect, or unnecessary requests",
                "Repeatedly submitting username change requests",
                "Using any of the site tools to \"“backseat moderate”\":/wiki_pages/e621:rules#backseatMod",
                "Reporting forum posts, threads, comments, blips, or any other site media that is older than 6 months",
                "Voting with multiple accounts on the same posts or comments"
            ]
        },
        advertising: {
            title: "Advertising",
            rules: [
                "Any non-beneficial, non-approved related businesses, organizations, or websites",
                "Can be linked with Spamming or Trolling if it is used multiple times in a short period of time"
            ]
        },
        underage: {
            title: "Age Restrictions",
            rules: [
                "Any persons under the age of 18, or as determined by local laws",
                "Any comment or evidence of being under the age of 18"
            ]
        },
        backseatMod: {
            title: "Backseat Moderating",
            rules: [
                "Implying moderator/administrator privileges where none exist",
                "Non-administrator/moderator/staff threatening to use disciplinary actions against another user",
                "Demanding, ordering, or otherwise stating to an administrator/moderator/staff certain administrative actions to be taken against another user"
            ]
        },
        bestiality: {
            title: "Bestiality",
            rules: [
                "Creating a post, forum post, or thread that is an inappropriate reference to real-life bestiality, sexual relations, or bodily functions",
                "Linking or commenting on a website that promotes material that contains inappropriate references to real-life bestiality, sexual relations, or bodily functions",
                "Linking to explicit, real-life material involving animal genitalia or animals mating"
            ]
        },
        blacklist: {
            title: "Refusal to Use Blacklist",
            rules: [
                "Creating posts, threads, or comments that complain about artwork that can be blacklisted",
                "Wrongfully claiming lack of knowledge about the blacklist system to avoid punishment from the previous rule"
            ],
            common: true,
        },
        banEvading: {
            title: "Circumventing a Suspension / Ban",
            rules: [
                "Posting anything on another account",
                "Having someone post on your behalf"
            ]
        },
        inappropriate: {
            title: "Inappropriate Comments",
            rules: [
                "Creating forum posts, threads, or comments that share explicit details about personal sexual fantasies or actions",
                "Creating comments that exceed the rating of the submission",
                "* For a few examples and elaborations please see \"here\":/help/inappropriate_comments"
            ],
            common: true,
        },
        disregardOfAdmin: {
            title: "Disregard of the Site Administration",
            rules: [
                "Failure to abide by direct instructions by an administrator, moderator, and/or employee of Bad Dragon or Dragonfruit"
            ]
        },
        distributionOfRlInfo: {
            title: "Distribution of Real-Life Personal Information",
            rules: [
                "Releasing or assisting in releasing any real-life information about other members or employees of Bad Dragon, Dragonfruit, or e621, or anyone else"
            ]
        },
        extremeSexualityViolence: {
            title: "Extreme Sexuality / Violence",
            rules: [
                "Linking to websites that refer to extreme real-life violent sexual activity",
                "Linking to websites that refer to extreme real-life violence",
                "Linking to websites that refer to extreme kinks and/or fetishes"
            ]
        },
        harassing: {
            title: "Harassing or Defamatory",
            rules: [
                "Insultingly refer to any individuals, including users, site staff, or Bad Dragon employees",
                "Performing actions which result in ongoing harassment to any individuals, including users, site staff, or Bad Dragon employees",
                "Using a User-requested ticket to publicly mock them"
            ]
        },
        illegalActivities: {
            title: "Illegal Activities or Drugs",
            rules: [
                "Forum threads or comments that references to abusing illegal drugs",
                "Forum threads or comments that references to performing illegal activities"
            ]
        },
        impersonatingAnEmployee: {
            title: "Impersonating an Employee or Moderator",
            rules: [
                "Passing yourself off as a current or past employee of Bad Dragon, Dragonfruit, or e621, especially to post false information",
                "Passing yourself off as a current or past moderator of Bad Dragon, Dragonfruit, or e621, especially to post false information",
                "Passing yourself off as another user to harass or besmirch them or their reputation"
            ]
        },
        religiousHatred: {
            title: "Major Religions, Religious Figures, Political Parties, or Political Figures",
            rules: [
                "Any discussion in forum posts, threads, or comments regarding major religions or religious figures",
                "Any discussion in forum posts, threads, or comments regarding major political parties or political figures"
            ]
        },
        hatred: {
            title: "National, Racial, or Ethnic Hatred",
            rules: [
                "Promoting national, racial, or ethnic hatred",
                "Creating posts, threads, or comments with recognized national, racial, or ethnic slurs",
                "Creating posts, threads, or comments with hateful content",
                "Alluding to symbols of national, racial, or ethnic hatred"
            ]
        },
        plagiarism: {
            title: "Plagiarism",
            rules: [
                "Wrongfully claiming ownership of artwork",
                "Tracing artwork without the consent of the original owner or artist",
                "Repeatedly creating unauthorized edits after the original artist asked to stop"
            ]
        },
        postingAbuse: {
            title: "Posting Abuse",
            rules: [
                "Posting works made by one of the artists or publishers on the [[avoid_posting|Avoid Posting List]]",
                "Posting any commercial or pay-to-view content",
                "Posting real pornography / real images or videos depicting illegal activities (such as bestiality, child pornography, etc.)",
                "Knowingly uploading previously deleted content",
                "Removing any watermark(s) or signature(s) from submissions",
                "Knowingly or repeatedly uploading a lower-resolution image, if there is a higher-resolution of that image available",
                "Knowingly or repeatedly uploading screenshots, images under 200x200 pixels, images with artifacts or large watermarks, and/or non-artistic images (motivational posters, Second Life, memes, image macros, etc.)",
                "* See our \"Uploading Guidelines\":/wiki/show/uploading_guidelines#bad for a full list of things that are bad to upload",
                "Editing/creating post descriptions (if you are not the artist, uploader, character owner, or commissioner) to create information",
                "Using post descriptions to express personal feelings, create drama, or otherwise take away from describing the attached post",
                "Please try to use proper spelling and grammar in post descriptions"
            ],
            common: true,
        },
        postingHacks: {
            title: "Posting Hacks, Trojan Horses, or Malicious Programs",
            rules: [
                "Creating posts, threads, or comments that link to hacks or malicious programs/viruses"
            ]
        },
        postingUnreleasedContent: {
            title: "Posting Unreleased Content / Hacking Data Files",
            rules: [
                "Showing unreleased content from anyone that has been discovered through unauthorized means",
                "Showing the results of successful or attempted hacks of the Bad Dragon, Dragonfruit, or e621 servers, websites, or affiliates",
                "Showing paid content, or creating forum posts or comments that link to content only available through paid subscription services",
                "Discuss, or display any data not available via public websites",
                "Quoting, or otherwise referencing, another user who posts illegal/paid content or data"
            ]
        },
        rlThreats: {
            title: "Real-Life Threats",
            rules: [
                "Language that refers to violence in any capacity against a person or persons"
            ]
        },
        rp: {
            title: "Role-Play",
            rules: [
                "Initiating or partaking in explicit role-play of any type",
                "Impersonating fictional/nonfictional characters or people",
                "Initiating or partaking in role-play with characters in the related thread/post"
            ],
            common: true,
        },
        sexualOrientation: {
            title: "Sexual Orientation",
            rules: [
                "Insultingly refer to any aspect of sexual orientation pertaining to themselves or other members"
            ]
        },
        solicitation: {
            title: "Solicitation",
            rules: [
                "Soliciting personal or otherwise confidential information of another user or users.",
                "Requesting, demanding, or offering to trade real life photographs, videos, or any other form of media from another user or users",
                "Requesting, demanding, or offering to trade information from another user or users"
            ]
        },
        spamming: {
            title: "Spamming or Trolling",
            rules: [
                "Excessively communicating the same phrase, similar phrases, or pure gibberish",
                "Creating comments, forum posts, or threads for the sole purpose of causing unrest",
                "Causing disturbances in forum threads or comments, such as picking fights, making off topic posts that ruin the thread, and/or insult other members",
                "Making non-constructive or derailing forum posts or comments.",
                "Bragging about saving DNP material, or encouraging others to save it",
                "Abusing the Report system or other website tools by sending false information or nonsensical messages",
                "Creating forum threads about existing topics less than six months old",
                "Creating a separate forum thread about an existing topic for further discussion in another forum category",
                "Creating a separate forum thread about an existing locked topic for further discussion in any forum or site",
                "Excessively posting old threads without adding anything to the discussion",
                "Excessively creating pointless threads like forum games, asking for opinions on site irrelevant themes, asking for free art, etc",
                "Numbering a thread, IBTL, ITT, TL;DR, or any other fad statements"
            ],
            common: true,
        },
        taggingAbuse: {
            title: "Tagging Abuse / Tagging Vandalism",
            rules: [
                "Failure to cite a minimum of 4 tags to an uploaded post",
                "Adding a tag to a post that is not either clearly visible, or reasonably assumed",
                "Removing a valid tag, either as part of a dispute/argument, or to place one that is not correct",
                "Failure to properly set the rating of your upload (https://e621.net/help/ratings)",
                "Knowingly adding or editing a post source to an incorrect link",
                "Adding invalid/disruptive tags, or any tags that could be considered as defamatory or spam",
                "Using Unicode in tags, with the exception of foreign artist/character names"
            ],
            "common": true,
            "hotkey": "6"
        }
    };

    public static readonly Prebuilt: Prebuilt[] = [
        {
            title: "Tagging",
            reason: "vandalism",
            rules: "taggingAbuse",
        },
        {
            title: "Creepy",
            reason: "inappropriate",
            rules: "inappropriate",
        },
        {
            title: "Roleplay",
            reason: "roleplay",
            rules: "rp",
        },
        {
            title: "Spam",
            reason: "spamming",
            rules: "spamming",
        },
        {
            title: "Trolling",
            reason: "trolling",
            rules: "spamming",
        },
        {
            title: "Blacklist",
            reason: "blacklist",
            rules: "blacklist",
        },
        {
            title: "DNP",
            reason: "dnp",
            rules: "postingAbuse",
        },
        {
            title: "CDNP",
            reason: "cdnp",
            rules: "postingAbuse",
        },
        {
            title: "Paysite",
            reason: "paysite",
            rules: "postingAbuse",
        },
        {
            title: "Underage",
            reason: "underage",
            rules: "underage",
        },
    ];

}

interface SiteRule {
    title: string,
    rules: string[],
    common?: boolean,
    hotkey?: string,
    link?: string,
}

interface Prebuilt {
    title: string,
    reason: string,
    rules: string | string[],
}
