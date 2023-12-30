import type {
  Client,
  MessageCreateOptions,
  MessagePayload,
  TextChannel,
} from "discord.js";
import config from "config";

export default function log(
  client: Client,
  msg: string | MessagePayload | MessageCreateOptions,
) {
  const channel = client.channels.resolve(config.get("loggingChannel"));
  if (!channel) {
    console.warn("Logging channel not found!");
    return;
  } else if (!channel.isTextBased()) {
    console.warn("Logging channel is not a text channel!");
    return;
  } else {
    console.log("Logging channel", (<TextChannel>channel).name);
  }

  channel.send(msg);
}
