import { MessageEmbed } from "discord.js";

export function success(msg?: string) {
  let embed = new MessageEmbed().setColor("GREEN").setTitle("Success");
  if (msg) embed.setDescription(msg);
  return embed;
}

export function error(msg?: string) {
  let embed = new MessageEmbed().setColor("RED").setTitle("Error");
  if (msg) embed.setDescription(msg);
  return embed;
}
