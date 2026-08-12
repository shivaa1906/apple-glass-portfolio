import path from "path";
import dotenv from "dotenv";
import { REST, Routes, APIApplication } from "discord.js";
import { commands } from "./commands";

dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const normalizeEnv = (value?: string) => {
    if (!value) return undefined;
    const trimmed = value.trim();
    if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
        return trimmed.slice(1, -1).trim();
    }
    return trimmed;
};

const BOT_TOKEN = normalizeEnv(process.env.DISCORD_BOT_TOKEN);
const GUILD_ID = normalizeEnv(process.env.DISCORD_GUILD_ID);
const CLIENT_ID = normalizeEnv(process.env.DISCORD_CLIENT_ID);

if (!BOT_TOKEN) {
    throw new Error("DISCORD_BOT_TOKEN must be set in environment variables.");
}

const rest = new REST({ version: "10" }).setToken(BOT_TOKEN);

const syncAll = async () => {
    console.log(`Syncing ${commands.length} commands globally...`);

    // Resolve the application (client) ID from env or fetch it from the Discord API.
    let appId = CLIENT_ID;
    if (!appId) {
        console.log("DISCORD_CLIENT_ID not set - resolving application ID from token...");
        const app = (await rest.get(Routes.currentApplication())) as APIApplication;
        appId = app.id;
        console.log(`Resolved application ID: ${appId}`);
    }

    // 1) Replace ALL global commands so every new command is registered/updated.
    const globalResult = (await rest.put(Routes.applicationCommands(appId), {
        body: commands,
    })) as Array<{ name: string; id: string }>;
    console.log(
        `Global commands updated (${globalResult.length}): ${globalResult.map((c) => c.name).join(", ")}`
    );

    // 2) If a GUILD_ID is set, sync the same full set to that guild as well.
    if (GUILD_ID) {
        const guildResult = (await rest.put(Routes.applicationGuildCommands(appId, GUILD_ID), {
            body: commands,
        })) as Array<{ name: string; id: string }>;
        console.log(
            `Guild commands updated for ${GUILD_ID} (${guildResult.length}): ${guildResult.map((c) => c.name).join(", ")}`
        );
    }

    console.log("All commands are now up to date globally.");
};

syncAll()
    .catch((err) => {
        console.error("Failed to sync commands:", err);
        process.exit(1);
    })
    .finally(() => process.exit(0));