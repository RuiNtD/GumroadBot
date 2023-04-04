import { Client } from "discord.js";
const client = new Client({ intents: ["GUILDS"] });
client.on("ready", async () => {
  console.log(`Logged in as ${client.user.tag}!`);
  await client.guilds
    .resolve("906512794961199104")
    .members.resolve(client.user.id)
    .setNickname("Verification Bot");
  client.destroy();
});
client.login("OTU5NjUyNjkyNjI2NjY1NTIz.YkfANw.g9PCLhVwcDDapXE_-ueBvqAuLcQ");
