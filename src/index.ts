import { getConfig } from "./lib/db.js";
import { LogLevel, SapphireClient } from "@sapphire/framework";
import "@sapphire/plugin-i18next/register";

const debug: boolean = getConfig("debug");

const client = new SapphireClient({
  intents: ["Guilds", "GuildMembers"],
  logger: {
    level: debug ? LogLevel.Debug : LogLevel.Info,
  },
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("warn", (m) => console.warn(m));
client.on("error", (m) => console.error(m));

console.log("Connecting...");
client.login(getConfig("token"));
