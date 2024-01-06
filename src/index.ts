import process from "node:process";
import config from "config";
import { SapphireClient } from "@sapphire/framework";
import "@sapphire/plugin-i18next/register";

const client = new SapphireClient({
  intents: ["Guilds", "GuildMembers"],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
});

client.on("warn", (m) => console.warn(m));
client.on("error", (m) => console.error(m));

process.on("SIGINT", () => {
  client.destroy();
});

console.log("Connecting...");
client.login(config.get("token"));
