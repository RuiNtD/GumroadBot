import {
  EmbedBuilder,
  type MessageCreateOptions,
  type MessagePayload,
  type TextChannel,
  User,
  Guild,
} from "discord.js";
import config from "config";
import { formatUser } from "./utils.js";

export default function log(
  guild: Guild,
  msg: string | MessagePayload | MessageCreateOptions,
) {
  const channel = guild.channels.resolve(config.get("loggingChannel"));
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

export type EmbedData = Partial<{
  title: string;
  user: User;
  uses: number;
  key: string;
  staff: User;
}>;

export function createEmbed(data: EmbedData): EmbedBuilder {
  const { title, user, uses, key, staff } = data;
  const embed = new EmbedBuilder({ title }).setTimestamp();

  if (user) {
    embed.setThumbnail(user.displayAvatarURL());
    embed.addFields([
      { name: "User", value: user.toString(), inline: true },
      { name: "User ID", value: user.id, inline: true },
    ]);
  }

  if (uses) embed.addFields([{ name: "Uses", value: `${uses}`, inline: true }]);

  if (key) embed.addFields([{ name: "License Key", value: key }]);

  if (staff)
    embed.setFooter({
      text: formatUser(staff),
      iconURL: staff.displayAvatarURL(),
    });

  return embed;
}
