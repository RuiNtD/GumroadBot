import config from "config";
import {
  Client,
  Guild,
  SelectMenuComponentOptionData,
  Team,
  TeamMember,
  User,
} from "discord.js";

export function get<T>(setting: string): T {
  return config.get(setting);
}

export const debug: boolean = get("debug");

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function getVerifiedRole(product: Product): string {
  return product.role;
}

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
    return `\`${owner.tag}\``;
  } else return "???";
}

export async function getDevPing(client: Client<true>): Promise<string>;
export async function getDevPing(guild: Guild): Promise<string>;
export async function getDevPing(
  clientOrGuild: Client<true> | Guild,
): Promise<string> {
  const isGuild = clientOrGuild instanceof Guild;
  const guild = isGuild ? clientOrGuild : undefined;
  const client = isGuild ? clientOrGuild.client : clientOrGuild;

  const application = await client.application.fetch();
  const owner = application.owner;

  return getOwnerPing(owner, guild);
}

export type Product = SelectMenuComponentOptionData & {
  role: string;
};

export async function getProducts(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  guild: Guild,
): Promise<Product[]> {
  return [
    {
      label: "The Hybrid v2",
      value: "HybridV2",
      emoji: "🍆",
      role: "959986800347197440",
    },
  ];
}
