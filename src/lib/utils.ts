import {
  GuildMember,
  User,
  chatInputApplicationCommandMention,
} from "discord.js";
import { Product } from "./db.js";
import { container } from "@sapphire/framework";

export function formatUser(user: User) {
  return `${user.tag} (${user.id})`;
}

export function hasVerifiedRole(member: GuildMember, product: Product) {
  const { role } = product;
  return member.roles.cache.has(role);
}

export async function giveVerifiedRole(
  member: GuildMember,
  product: Product,
  reason?: string,
) {
  const { role } = product;
  await member.roles.add(role, reason);
}

export function ephemeral(content: string) {
  return {
    content,
    ephemeral: true,
  };
}

export function cmdMention(str: string) {
  const segs = str.split(" ");
  const name = segs[0];

  const { application } = container.client;
  if (!application) return `\`/${str}\``;

  const cmd = application.commands.cache.find((cmd) => cmd.name == name);
  if (!cmd) return `\`/${str}\``;

  return segs.length == 1
    ? chatInputApplicationCommandMention(name, cmd.id)
    : segs.length == 2
      ? chatInputApplicationCommandMention(name, segs[1], cmd.id)
      : chatInputApplicationCommandMention(name, segs[1], segs[2], cmd.id);
}
