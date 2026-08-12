import { RESTPostAPIApplicationCommandsJSONBody } from "discord.js";

export const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
    {
        name: "bot-status",
        description: "Track when a bot or user comes online.",
        options: [
            {
                name: "target",
                type: 6,
                description: "The bot or user to track",
                required: true,
            },
        ],
    },
    {
        name: "bot-status-remove",
        description: "Stop tracking a bot or user.",
        options: [
            {
                name: "target",
                type: 6,
                description: "The bot or user to stop tracking",
                required: true,
            },
        ],
    },
    {
        name: "reset-bot-status",
        description: "Stop tracking all bots and users.",
    },
    {
        name: "edit-webhook",
        description: "Update the editable webhook URL for logs.",
        options: [
            {
                name: "url",
                type: 3,
                description: "The webhook URL to use for editable logs.",
                required: true,
            },
        ],
    },
    {
        name: "xfollowers-set",
        description: "Set the Twitter followers count.",
        options: [
            {
                name: "count",
                type: 3,
                description: "New followers count.",
                required: true,
            },
        ],
    },
    {
        name: "xfollowing-set",
        description: "Set the Twitter following count.",
        options: [
            {
                name: "count",
                type: 3,
                description: "New following count.",
                required: true,
            },
        ],
    },
    {
        name: "xtweets-set",
        description: "Set the Twitter tweets count.",
        options: [
            {
                name: "count",
                type: 3,
                description: "New tweets count.",
                required: true,
            },
        ],
    },
    {
        name: "set-twitter-followers",
        description: "Set the Twitter followers count (alias).",
        options: [
            {
                name: "count",
                type: 3,
                description: "New followers count.",
                required: true,
            },
        ],
    },
    {
        name: "set-twitter-following",
        description: "Set the Twitter following count (alias).",
        options: [
            {
                name: "count",
                type: 3,
                description: "New following count.",
                required: true,
            },
        ],
    },
    {
        name: "set-twitter-tweets",
        description: "Set the Twitter tweets count (alias).",
        options: [
            {
                name: "count",
                type: 3,
                description: "New tweets count.",
                required: true,
            },
        ],
    },
    {
        name: "set-current-activity",
        description: "Update the Discord activity text.",
        options: [
            {
                name: "text",
                type: 3,
                description: "Activity text to display when sync is off.",
                required: true,
            },
        ],
    },
    {
        name: "sync",
        description: "Turn Discord activity syncing on or off.",
        options: [
            {
                name: "state",
                type: 3,
                description: "Sync state",
                required: true,
                choices: [
                    { name: "on", value: "on" },
                    { name: "off", value: "off" },
                ],
            },
        ],
    },
    {
        name: "change-server-link",
        description: "Update the Discord invite link.",
        options: [
            {
                name: "link",
                type: 3,
                description: "New invite or server link.",
                required: true,
            },
        ],
    },
    {
        name: "set-community-announcement",
        description: "Set the Facebook community announcement text and date.",
        options: [
            {
                name: "text",
                type: 3,
                description: "Announcement text.",
                required: true,
            },
            {
                name: "date",
                type: 3,
                description: "Announcement date.",
                required: true,
            },
        ],
    },
    {
        name: "set-connections",
        description: "Set LinkedIn connections count.",
        options: [
            {
                name: "count",
                type: 3,
                description: "Number of connections.",
                required: true,
            },
        ],
    },
    {
        name: "set-followers",
        description: "Set LinkedIn followers count.",
        options: [
            {
                name: "count",
                type: 3,
                description: "Number of followers.",
                required: true,
            },
        ],
    },
    {
        name: "set-recommendations",
        description: "Set LinkedIn recommendations count.",
        options: [
            {
                name: "count",
                type: 3,
                description: "Number of recommendations.",
                required: true,
            },
        ],
    },
    {
        name: "edit-headline",
        description: "Edit the LinkedIn headline.",
        options: [
            {
                name: "text",
                type: 3,
                description: "Updated headline text.",
                required: true,
            },
        ],
    },
    {
        name: "edit-headline-bio",
        description: "Edit the LinkedIn headline bio.",
        options: [
            {
                name: "text",
                type: 3,
                description: "Updated headline bio text.",
                required: true,
            },
        ],
    },
    {
        name: "set-location",
        description: "Set the hero profile location.",
        options: [
            {
                name: "text",
                type: 3,
                description: "New location text.",
                required: true,
            },
        ],
    },
    {
        name: "avalable",
        description: "Set the hero status to Available.",
    },
    {
        name: "unavalable",
        description: "Set the hero status to Unavailable.",
    },
    {
        name: "status",
        description: "Show or hide the hero status badge.",
        options: [
            {
                name: "state",
                type: 3,
                description: "on or off",
                required: true,
                choices: [
                    { name: "on", value: "on" },
                    { name: "off", value: "off" },
                ],
            },
        ],
    },
    {
        name: "add-admin",
        description: "Grant another user permission to run bot commands (developer only).",
        options: [
            {
                name: "userid",
                type: 3,
                description: "Discord user id to grant admin access",
                required: true,
            },
        ],
    },
    {
        name: "set-email",
        description: "Set the hero profile email.",
        options: [
            {
                name: "email",
                type: 3,
                description: "New email address.",
                required: true,
            },
        ],
    },
    {
        name: "bot-logs",
        description: "Enable or disable bot log persistence.",
        options: [
            {
                name: "state",
                type: 3,
                description: "Turn bot logs on or off.",
                required: true,
                choices: [
                    { name: "on", value: "on" },
                    { name: "off", value: "off" },
                ],
            },
        ],
    },
    {
        name: "portfolio-logs",
        description: "Set or create the portfolio log channel for bot errors and logs.",
        options: [
            {
                name: "channelid",
                type: 3,
                description: "Existing text channel ID for portfolio logs.",
                required: false,
            },
            {
                name: "channelname",
                type: 3,
                description: "New channel name to create for portfolio logs.",
                required: false,
            },
        ],
    },
    {
        name: "display-viewer",
        description: "Enable or disable visitor counter.",
        options: [
            {
                name: "state",
                type: 3,
                description: "on or off",
                required: true,
                choices: [
                    { name: "on", value: "on" },
                    { name: "off", value: "off" },
                ],
            },
        ],
    },
    {
        name: "display-total-viewers",
        description: "Show total visitor counts and breakdown.",
    },
    {
        name: "display-total-viewers-logs",
        description: "Send new visitor logs to specified channel.",
        options: [
            { name: "channelid", type: 3, description: "Channel ID to send logs to", required: true },
        ],
    },
    {
        name: "show-visitors-list",
        description: "Show paginated visitor list.",
        options: [{ name: "page", type: 4, description: "Page number", required: false }],
    },
    {
        name: "visitor-stats",
        description: "Show visitor analytics stats.",
    },
    {
        name: "logs",
        description: "Create or remove per-type log channels in this guild.",
        options: [
            {
                name: "state",
                type: 3,
                description: "on or off",
                required: true,
                choices: [
                    { name: "on", value: "on" },
                    { name: "off", value: "off" },
                ],
            },
        ],
    },
    {
        name: "purge",
        description: "Delete a number of messages from this channel.",
        options: [
            { name: "count", type: 4, description: "Number of messages to delete (max 100)", required: true },
        ],
    },
    {
        name: "auto-role",
        description: "Manage automatic role assignment for new members.",
        options: [
            { name: "action", type: 3, description: "add or remove", required: true, choices: [{ name: "add", value: "add" }, { name: "remove", value: "remove" }] },
            { name: "roleid", type: 3, description: "Role ID to add/remove", required: true },
        ],
    },
    {
        name: "ping",
        description: "Show recent pings and register pings related to site/bot.",
    },
    {
        name: "pin",
        description: "Pin a message by link.",
        options: [{ name: "link", type: 3, description: "Message link to pin", required: true }],
    },
];