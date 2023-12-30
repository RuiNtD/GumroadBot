import config from "config";
import { Client, Guild, Team, TeamMember, User } from "discord.js";

export function get<T>(setting: string): T {
  return config.get(setting);
}

export const debug: boolean = get("debug");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getVerifiedRole(guild: Guild): string {
  return get("verifiedRole");
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getAdminID(guild: Guild): string {
  return guild.ownerId;
}
export function getAdminPing(guild: Guild): string {
  const adminID = getAdminID(guild);
  return `<@${adminID}>`;
}

function getOwnerPing(
  owner: User | Team | TeamMember | null,
  guild?: Guild,
): string {
  if (owner instanceof Team)
    return owner.name + " or " + getOwnerPing(owner.owner, guild);
  else if (owner instanceof TeamMember) return getOwnerPing(owner.user, guild);
  else if (owner instanceof User) {
    if (guild && guild.members.resolve(owner)) return `${owner}`;
    return owner.tag;
  } else return "???";
}

export function getDevPing(client: Client<true>): string;
export function getDevPing(guild: Guild): string;
export function getDevPing(clientOrGuild: Guild | Client<true>): string {
  const isGuild = clientOrGuild instanceof Guild;
  const guild = isGuild ? clientOrGuild : undefined;
  const client = isGuild ? clientOrGuild.client : clientOrGuild;

  const owner = client.application.owner;
  return getOwnerPing(owner, guild);
}
