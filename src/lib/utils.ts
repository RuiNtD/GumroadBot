import { GuildMember, User } from "discord.js";
import { Product } from "./db.js";

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
