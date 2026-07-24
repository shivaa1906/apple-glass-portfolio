import http from "http";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";
import {
  Client,
  GatewayIntentBits,
  ActivityType,
  Activity,
  RESTPostAPIApplicationCommandsJSONBody,
  type PresenceStatus,
  ChannelType,
  EmbedBuilder,
  type TextChannel,
} from "discord.js";

dotenv.config({ path: path.join(process.cwd(), ".env") });
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

type DiscordProfileState = {
  username: string;
  globalDisplayName: string;
  guildNickname: string;
  displayName: string;
  avatarUrl: string;
  bannerUrl: string;
  status: PresenceStatus | "offline";
  activity: string;
  customStatus: string;
  desktopStatus: string;
  mobileStatus: string;
  webStatus: string;
  botOnline: boolean;
  serverCount: string;
  servers: string[];
  lastUpdated: string;
};

type CardState = {
  editableWebhookUrl?: string;
  botLogsEnabled?: boolean;
  discordInviteUrl?: string;
  discordSyncEnabled?: boolean;
  discordManualActivity?: string;
  twitterFollowers?: string;
  twitterFollowing?: string;
  twitterTweets?: string;
  facebookAnnouncementText?: string;
  facebookAnnouncementDate?: string;
  linkedinConnections?: string;
  linkedinFollowers?: string;
  linkedinRecommendations?: string;
  linkedinHeadline?: string;
  linkedinHeadlineBio?: string;
  heroLocation?: string;
  heroEmail?: string;
  heroStatus?: string;
  botLogChannelId?: string;
};

type CommandLogEntry = {
  timestamp: string;
  user: string;
  command: string;
  details: string;
};

const normalizeEnv = (value?: string) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  if (trimmed.startsWith("\"") && trimmed.endsWith("\"")) {
    return trimmed.slice(1, -1).trim();
  }
  return trimmed;
};

const BOT_TOKEN = normalizeEnv(process.env.DISCORD_BOT_TOKEN);
const USER_ID = normalizeEnv(process.env.DISCORD_USER_ID);
const GUILD_ID = normalizeEnv(process.env.DISCORD_GUILD_ID);
const DEFAULT_LOG_WEBHOOK_URL = normalizeEnv(process.env.DISCORD_DEFAULT_LOG_WEBHOOK_URL);

if (!BOT_TOKEN || !USER_ID) {
  throw new Error("DISCORD_BOT_TOKEN and DISCORD_USER_ID must be set in environment variables.");
}

const CACHE_PATH = path.join(process.cwd(), "bot", "discord-presence-cache.json");
const STATE_PATH = path.join(process.cwd(), "bot", "card-state.json");
const LOG_PATH = path.join(process.cwd(), "bot", "command-logs.json");


const DEFAULT_CARD_STATE: CardState = {
  editableWebhookUrl: "",
  botLogsEnabled: true,
  discordInviteUrl: "https://discord.gg",
  discordSyncEnabled: true,
  discordManualActivity: "",
  twitterFollowers: "0",
  twitterFollowing: "0",
  twitterTweets: "0",
  facebookAnnouncementText:
    "Welcome to our latest community update. Join us for new tutorials and design conversations!",
  facebookAnnouncementDate: "July 22, 2026",
  linkedinConnections: "19",
  linkedinFollowers: "0",
  linkedinRecommendations: "0",
  linkedinHeadline: "Frontend Developer | React & Next.js Developer | Spatial Computing Enthusiast",
  linkedinHeadlineBio:
    "Passionate about building modern web applications, interactive 3D experiences, and continuously learning React, Next.js, and modern web technologies.",
  heroLocation: "KPHB, Hyderabad, Telangana",
  botLogChannelId: "",
  heroEmail: "shivaa1906@gmail.com",
  heroStatus: "Available",
};

const readJsonFile = async <T>(filePath: string, fallback: T): Promise<T> => {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw) as T;
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), "utf8");
    return fallback;
  }
};

const writeJsonFile = async (filePath: string, data: unknown) => {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf8");
};

const savePresence = async (payload: DiscordProfileState) => {
  await writeJsonFile(CACHE_PATH, payload);
};

const readCardState = async (): Promise<CardState> => {
  return await readJsonFile<CardState>(STATE_PATH, DEFAULT_CARD_STATE);
};

const writeCardState = async (state: CardState) => {
  await writeJsonFile(STATE_PATH, state);

  // If a frontend URL is provided, attempt to PATCH the remote card-state
  // so a separately deployed frontend can reflect bot-driven updates.
  try {
    const frontend = normalizeEnv(process.env.FRONTEND_URL);
    if (frontend) {
      const url = `${frontend.replace(/\/+$/,'')}/api/card-state`;
      const headers: Record<string,string> = { "Content-Type": "application/json" };
      const secret = normalizeEnv(process.env.FRONTEND_UPDATE_SECRET);
      if (secret) headers["x-update-secret"] = secret;

      const resp = await fetch(url, {
        method: "PATCH",
        headers,
        body: JSON.stringify(state),
      });
      if (resp && resp.ok) {
        await sendServerLog(`Synchronized card state to frontend (${url}) - status ${resp.status}`, { title: "Card State Synced" });
      } else {
        await sendServerLog(`Failed to synchronize card state to frontend (${url}) - status ${resp?.status || "unknown"}`, { title: "Card State Sync Failed" });
      }
    }
  } catch (err) {
    // don't block on remote sync failures
    console.error("Failed to sync card state to frontend:", err);
  }
};

const appendCommandLog = async (entry: CommandLogEntry) => {
  const existing = await readJsonFile<CommandLogEntry[]>(LOG_PATH, []);
  existing.push(entry);
  await writeJsonFile(LOG_PATH, existing);
};

const sendServerLog = async (content: string, opts?: { title?: string }) => {
  try {
    const state = await readCardState();
    const channelId = state.botLogChannelId;
    if (!channelId || state.botLogsEnabled === false) return;

    const channel = await client.channels.fetch(channelId).catch(() => null);
    if (!channel) return;

    // Only send to text channels
    const text = channel as TextChannel;
    const embed = new EmbedBuilder()
      .setTitle(opts?.title || "Bot Log")
      .setDescription(content)
      .setTimestamp(new Date())
      .setColor(0x5865f2);

    await text.send({ embeds: [embed] }).catch(() => undefined);
  } catch (err) {
    console.error("Failed to send server log:", err);
  }
};

const buildDiscordWebhookBody = (log: CommandLogEntry) => {
  return {
    embeds: [
      {
        title: "Slash Command Executed",
        description: `**${log.command}** was executed by **${log.user}**`,
        color: 0x5865f2,
        fields: [
          { name: "Details", value: log.details || "No additional details.", inline: false },
          { name: "Time", value: log.timestamp, inline: false },
        ],
        timestamp: log.timestamp,
      },
    ],
  };
};

const sendDiscordWebhook = async (url: string | undefined, log: CommandLogEntry) => {
  if (!url || !url.startsWith("https://discord.com/api/webhooks/")) {
    return;
  }

  try {
    await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(buildDiscordWebhookBody(log)),
    });
  } catch (error) {
    console.error("Failed to send webhook log:", error);
  }
};

const logCommand = async (command: string, user: string, details: string) => {
  const now = new Date().toISOString();
  const entry: CommandLogEntry = {
    timestamp: now,
    user,
    command,
    details,
  };

  const state = await readCardState();

  if (state.botLogsEnabled !== false) {
    await appendCommandLog(entry);
  }

  await sendDiscordWebhook(DEFAULT_LOG_WEBHOOK_URL, entry);
  await sendDiscordWebhook(state.editableWebhookUrl, entry);
  // Also post to configured server channel when enabled
  await sendServerLog(`**${entry.command}** executed by **${entry.user}**\n\n${entry.details}`, { title: "Slash Command Executed" });
};

const commands: RESTPostAPIApplicationCommandsJSONBody[] = [
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
];

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildPresences, GatewayIntentBits.GuildMembers],
});

const formatActivity = (activity: Activity) => {
  if (activity.type === ActivityType.Custom) {
    return "";
  }

  const name = activity.name || "";
  const state = activity.state ? `: ${activity.state}` : "";

  switch (activity.type) {
    case ActivityType.Playing:
      return `Playing ${name}${state}`;
    case ActivityType.Streaming:
      return `Streaming ${name}`;
    case ActivityType.Listening:
      return `Listening to ${name}`;
    case ActivityType.Watching:
      return `Watching ${name}`;
    case ActivityType.Competing:
      return `Competing in ${name}`;
    default:
      return `${name}${state}`.trim();
  }
};

const saveCardState = async (updates: Partial<CardState>) => {
  const currentState = await readCardState();
  const nextState = {
    ...currentState,
    ...updates,
  };
  await writeCardState(nextState);
  return nextState;
};

const buildDiscordState = async (user: import("discord.js").User, member: import("discord.js").GuildMember | null, presence: import("discord.js").Presence | null): Promise<DiscordProfileState> => {
  const globalDisplayName = user.globalName || user.username;
  const guildNickname = member?.nickname || "";
  const displayName = globalDisplayName || user.username;
  const avatarUrl = user.displayAvatarURL({ extension: "png", size: 512 }) || "";
  const bannerUrl = user.bannerURL({ extension: "png", size: 1024 }) || "";
  const status = presence?.status || "offline";
  const customStatusActivity = presence?.activities.find((activity) => activity.type === ActivityType.Custom);
  const customStatus = customStatusActivity?.state || "";
  const otherActivities = presence?.activities.filter((activity) => activity.type !== ActivityType.Custom) || [];
  const activity = otherActivities.map(formatActivity).filter(Boolean).join(" • ");
  const clientStatus = presence?.clientStatus;
  const desktopStatus = clientStatus?.desktop || "offline";
  const mobileStatus = clientStatus?.mobile || "offline";
  const webStatus = clientStatus?.web || "offline";
  const guild = GUILD_ID ? await client.guilds.fetch(GUILD_ID).catch(() => null) : null;
  const serverCount = guild ? String(1) : String(client.guilds.cache.size);
  const servers = guild ? [guild.name] : client.guilds.cache.map((g) => g.name).slice(0, 6);

  return {
    username: `${user.username}#${user.discriminator}`,
    globalDisplayName,
    guildNickname,
    displayName,
    avatarUrl: avatarUrl || "/assets/profile_avatar1.jpg",
    bannerUrl,
    status,
    activity,
    customStatus,
    desktopStatus,
    mobileStatus,
    webStatus,
    botOnline: status !== "offline",
    serverCount,
    servers,
    lastUpdated: new Date().toISOString(),
  };
};

const syncPresenceForUser = async () => {
  const guild = GUILD_ID ? await client.guilds.fetch(GUILD_ID).catch(() => null) : null;
  const user = await client.users.fetch(USER_ID).catch(() => null);
  const member = guild ? await guild.members.fetch(USER_ID).catch(() => null) : null;
  const presence = member?.presence || null;

  if (!user) {
    throw new Error(`Unable to fetch Discord user for USER_ID=${USER_ID}`);
  }

  const state = await buildDiscordState(user, member, presence);
  await savePresence(state);
};

client.once("ready", async () => {
  console.log(`Discord bot ready as ${client.user?.tag}`);

  try {
    const rawCache = await fs.readFile(CACHE_PATH, "utf8");
    const parsed = JSON.parse(rawCache) as DiscordProfileState;
    if (parsed?.username) {
      // cache warmed; no memory state required
    }
  } catch {
    // ignore missing or invalid cache
  }

  try {
    await syncPresenceForUser();
  } catch (error) {
    console.error("Failed to sync presence on ready:", error);
  }

  try {
    await client.application?.commands.set(commands);
    console.log("Slash commands registered.");
  } catch (error) {
    console.error("Failed to register slash commands:", error);
  }
});

const updateDiscordState = async (user: import("discord.js").User, member: import("discord.js").GuildMember | null, presence: import("discord.js").Presence | null) => {
  const state = await buildDiscordState(user, member, presence);
  try {
    await savePresence(state);
  } catch (error) {
    console.error("Failed to write Discord presence cache:", error);
  }
};

client.on("presenceUpdate", async (_oldPresence, newPresence) => {
  if (!newPresence?.user?.id || newPresence.user.id !== USER_ID) {
    return;
  }

  const user = newPresence.user;
  const guild = GUILD_ID ? await client.guilds.fetch(GUILD_ID).catch(() => null) : null;
  const member = guild ? await guild.members.fetch(USER_ID).catch(() => null) : null;
  await updateDiscordState(user, member, newPresence);
});

client.on("userUpdate", async (_oldUser, newUser) => {
  if (newUser.id !== USER_ID) {
    return;
  }

  const guild = GUILD_ID ? await client.guilds.fetch(GUILD_ID).catch(() => null) : null;
  const member = guild ? await guild.members.fetch(USER_ID).catch(() => null) : null;
  const presence = member?.presence || null;
  await updateDiscordState(newUser, member, presence);
});

client.on("guildMemberUpdate", async (_oldMember, newMember) => {
  if (newMember.id !== USER_ID) {
    return;
  }

  const user = newMember.user;
  const presence = newMember.presence || null;
  await updateDiscordState(user, newMember, presence);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = interaction.commandName;
  const user = `${interaction.user.username}#${interaction.user.discriminator}`;

  const failReply = async (message: string) => {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message, ephemeral: true });
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  };

  const successReply = async (message: string) => {
    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({ content: message, ephemeral: true });
    } else {
      await interaction.reply({ content: message, ephemeral: true });
    }
  };

  try {
    switch (command) {
      case "edit-webhook": {
        const url = interaction.options.getString("url", true).trim();
        await saveCardState({ editableWebhookUrl: url });
        await successReply(`Editable webhook URL updated.`);
        await logCommand(command, user, `Updated editable webhook URL to ${url}`);
        break;
      }
      case "xfollowers-set": {
        const count = interaction.options.getString("count", true).trim();
        await saveCardState({ twitterFollowers: count });
        await successReply(`Twitter followers count updated to ${count}.`);
        await logCommand(command, user, `Twitter followers set to ${count}`);
        break;
      }
      case "xfollowing-set": {
        const count = interaction.options.getString("count", true).trim();
        await saveCardState({ twitterFollowing: count });
        await successReply(`Twitter following count updated to ${count}.`);
        await logCommand(command, user, `Twitter following set to ${count}`);
        break;
      }
      case "xtweets-set": {
        const count = interaction.options.getString("count", true).trim();
        await saveCardState({ twitterTweets: count });
        await successReply(`Twitter tweets count updated to ${count}.`);
        await logCommand(command, user, `Twitter tweets set to ${count}`);
        break;
      }
      case "set-current-activity": {
        const text = interaction.options.getString("text", true).trim();
        await saveCardState({ discordManualActivity: text });
        await successReply(`Discord manual activity set to: ${text}`);
        await logCommand(command, user, `Discord manual activity set to: ${text}`);
        break;
      }
      case "sync": {
        const stateValue = interaction.options.getString("state", true);
        const enabled = stateValue === "on";
        await saveCardState({ discordSyncEnabled: enabled });
        await successReply(`Discord activity sync turned ${enabled ? "on" : "off"}.`);
        await logCommand(command, user, `Discord sync ${enabled ? "enabled" : "disabled"}`);
        break;
      }
      case "change-server-link": {
        const link = interaction.options.getString("link", true).trim();
        await saveCardState({ discordInviteUrl: link });
        await successReply(`Discord server link updated.`);
        await logCommand(command, user, `Discord link updated to ${link}`);
        break;
      }
      case "set-community-announcement": {
        const text = interaction.options.getString("text", true).trim();
        const date = interaction.options.getString("date", true).trim();
        await saveCardState({ facebookAnnouncementText: text, facebookAnnouncementDate: date });
        await successReply(`Facebook announcement updated.`);
        await logCommand(command, user, `Facebook announcement text updated to "${text}" on ${date}`);
        break;
      }
      case "set-connections": {
        const count = interaction.options.getString("count", true).trim();
        await saveCardState({ linkedinConnections: count });
        await successReply(`LinkedIn connections updated to ${count}.`);
        await logCommand(command, user, `LinkedIn connections set to ${count}`);
        break;
      }
      case "set-followers": {
        const count = interaction.options.getString("count", true).trim();
        await saveCardState({ linkedinFollowers: count });
        await successReply(`LinkedIn followers updated to ${count}.`);
        await logCommand(command, user, `LinkedIn followers set to ${count}`);
        break;
      }
      case "set-recommendations": {
        const count = interaction.options.getString("count", true).trim();
        await saveCardState({ linkedinRecommendations: count });
        await successReply(`LinkedIn recommendations updated to ${count}.`);
        await logCommand(command, user, `LinkedIn recommendations set to ${count}`);
        break;
      }
      case "edit-headline": {
        const text = interaction.options.getString("text", true).trim();
        await saveCardState({ linkedinHeadline: text });
        await successReply(`LinkedIn headline updated.`);
        await logCommand(command, user, `LinkedIn headline updated to: ${text}`);
        break;
      }
      case "edit-headline-bio": {
        const text = interaction.options.getString("text", true).trim();
        await saveCardState({ linkedinHeadlineBio: text });
        await successReply(`LinkedIn headline bio updated.`);
        await logCommand(command, user, `LinkedIn headline bio updated to: ${text}`);
        break;
      }
      case "set-location": {
        const text = interaction.options.getString("text", true).trim();
        await saveCardState({ heroLocation: text });
        await successReply(`Hero location updated.`);
        await logCommand(command, user, `Hero location set to: ${text}`);
        break;
      }
      case "set-email": {
        const email = interaction.options.getString("email", true).trim();
        await saveCardState({ heroEmail: email });
        await successReply(`Hero email updated.`);
        await logCommand(command, user, `Hero email set to: ${email}`);
        break;
      }
      case "bot-logs": {
        const stateValue = interaction.options.getString("state", true);
        const enabled = stateValue === "on";

        const guild = interaction.guild;
        if (enabled) {
          // enable: create or find a text channel for logs and persist it
          let channelId = "";
          const currentState = await readCardState();
          if (currentState.botLogChannelId) {
            channelId = currentState.botLogChannelId;
          }

          let channel = null;
          if (channelId) {
            channel = await client.channels.fetch(channelId).catch(() => null);
          }

          if (!channel && guild) {
            // try find by name
            const found = guild.channels.cache.find((c) => c.name === "bot-logs" && c.type === ChannelType.GuildText);
            if (found) channel = found;
          }

          if (!channel && guild) {
            try {
              channel = await guild.channels.create({
                name: "bot-logs",
                type: ChannelType.GuildText,
                topic: "Bot command and site change logs",
              });
            } catch (err) {
              console.error("Failed to create log channel:", err);
              // fallback: still enable logging but without channel
            }
          }

          const newState: Partial<CardState> = { botLogsEnabled: true };
          if (channel && (channel as any).id) {
            newState.botLogChannelId = (channel as any).id;
          }

          await saveCardState(newState);
          await successReply(`Bot logs enabled.`);
          await logCommand(command, user, `Bot logs enabled`);
          if (channel) {
            await sendServerLog("Bot logs enabled in this channel.", { title: "Bot Logs Enabled" });
          }
        } else {
          // disable: stop posting logs
          const prevState = await readCardState();
          const oldChannelId = prevState.botLogChannelId;
          await saveCardState({ botLogsEnabled: false, botLogChannelId: "" });
          await successReply(`Bot logs disabled.`);
          await logCommand(command, user, `Bot logs disabled`);
          if (oldChannelId) {
            const ch = await client.channels.fetch(oldChannelId).catch(() => null);
            if (ch) {
              try {
                await (ch as TextChannel).send({ embeds: [new EmbedBuilder().setTitle("Bot Logs Disabled").setDescription("Logging has been turned off by an administrator.").setTimestamp(new Date()).setColor(0xff0000)] });
              } catch {}
            }
          }
        }
        break;
      }
      default: {
        await failReply("Unknown command.");
        break;
      }
    }
  } catch (error) {
    console.error(error);
    await failReply("There was an error processing that command.");
  }
});


client.login(BOT_TOKEN).catch((error) => {
  console.error("Discord bot failed to login:", error);
  process.exit(1);
});

const port = Number(process.env.PORT) || 3000;
const server = http.createServer((req, res) => {
  if (req.url === "/healthz" || req.url === "/") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", uptime: process.uptime() }));
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
});

server.listen(port, () => {
  console.log(`Bot HTTP health server listening on port ${port}`);
});
