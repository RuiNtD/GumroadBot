import type {
  MessageOptions,
  MessagePayload,
  TextBasedChannel,
} from "discord.js";
import config from "config";
import { getClient } from "./client.js";

let loggingChannel: TextBasedChannel;

(async () => {
  const client = await getClient();
  const channel = client.channels.resolve(config.get("loggingChannel"));
  if (!channel) {
    console.warn("Logging channel not found!");
  } else if (!channel.isText()) {
    console.warn("Logging channel is not a text channel!");
  } else {
    loggingChannel = channel;
  }
})();

export default function log(msg: string | MessagePayload | MessageOptions) {
  if (!loggingChannel) return;
  loggingChannel.send(msg);
}
