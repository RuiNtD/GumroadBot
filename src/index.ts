import config from "config";
import { SapphireClient } from "@sapphire/framework";
import { setClient } from "./lib/client.js";

const client = new SapphireClient({
  intents: ["GUILDS"],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user?.tag}!`);
  setClient(client);
});

client.on("warn", (m) => console.warn(m));
client.on("error", (m) => console.error(m));

process.on("SIGINT", () => {
  client.destroy();
});

console.log("Connecting...");
client.login(config.get("token"));
