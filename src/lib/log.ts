import {
  EmbedBuilder,
  type MessageCreateOptions,
  type MessagePayload,
  User,
  Guild,
  hyperlink,
} from "discord.js";
import * as db from "./db.js";
import { formatUser } from "./utils.js";
import { Product } from "./db.js";

export default async function log(
  guild: Guild,
  msg: string | MessagePayload | MessageCreateOptions,
) {
  const channel = await db.getLoggingChannel(guild);
  if (!channel) throw "Logging channel not found!";
  else if (!channel.isTextBased())
    throw "Logging channel is not a text channel!";
  await channel.send(msg);
}

export type EmbedData = Partial<{
  title: string;
  user: User;
  uses: number;
  product: Product;
  key: string;
  staff: User;
}>;

export function createEmbed(data: EmbedData): EmbedBuilder {
  const { title, user, uses, product, key, staff } = data;
  const embed = new EmbedBuilder({ title }).setTimestamp();

  if (user) {
    embed.setThumbnail(user.displayAvatarURL());
    embed.addFields([
      { name: "User", value: user.toString(), inline: true },
      { name: "User ID", value: user.id, inline: true },
    ]);
  }

  if (product) {
    const { label, permalink } = product;
    const name = permalink
      ? hyperlink(label, `https://gum.co/${permalink}`)
      : label;
    embed.addFields([
      {
        name: "Product",
        value: name,
        inline: true,
      },
      {
        name: "Product ID",
        value: product.value,
        inline: true,
      },
    ]);
  }

  if (key) embed.addFields([{ name: "License Key", value: key, inline: true }]);
  if (uses) embed.addFields([{ name: "Uses", value: `${uses}`, inline: true }]);

  if (staff)
    embed.setFooter({
      text: formatUser(staff),
      iconURL: staff.displayAvatarURL(),
    });

  return embed;
}
