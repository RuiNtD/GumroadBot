import { EmbedBuilder } from "discord.js";

export function success(msg?: string) {
  const embed = new EmbedBuilder().setColor("Green").setTitle("Success");
  if (msg) embed.setDescription(msg);
  return embed;
}

export function error(msg?: string) {
  const embed = new EmbedBuilder().setColor("Red").setTitle("Error");
  if (msg) embed.setDescription(msg);
  return embed;
}
