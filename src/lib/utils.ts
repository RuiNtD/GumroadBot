import * as config from "./config.js";
import { GuildMember, User } from "discord.js";

export function formatUser(user: User) {
  return `${user.tag} (${user.id})`;
}

export function hasVerifiedRole(member: GuildMember) {
  const role = config.getVerifiedRole(member.guild);
  return member.roles.cache.has(role);
}

export async function giveVerifiedRole(member: GuildMember, reason?: string) {
  const role = config.getVerifiedRole(member.guild);
  await member.roles.add(role, reason);
}
