import config from "config";
import { Client, Guild, Team, TeamMember, User } from "discord.js";

import { openKv } from "@deno/kv";
import { z } from "zod";

export const kv = await openKv("kv.db");
await kv.set(["guilds", get("guildID"), "products", get("productID")], <
  Product
>{
  label: "The Hybrid v2",
  value: get("productID"),
  emoji: "🍆",
  role: get("verifiedRole"),
  accessToken: get("accessToken"),
});
await kv.set(
  ["guilds", get("guildID"), "loggingChannel"],
  get("loggingChannel"),
);

export function get<T>(setting: string): T {
  return config.get(setting);
}

export const debug: boolean = get("debug");

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

const Snowflake = z.string().length(18);
type Snowflake = z.infer<typeof Snowflake>;
const APIMessageComponentEmoji = z.object({
  id: Snowflake.optional(),
  name: z.string().optional(),
  animated: z.boolean().optional(),
});
const ComponentEmojiResolvable = APIMessageComponentEmoji.or(z.string());

export const Product = z.object({
  label: z.string(),
  value: z.string(),
  emoji: ComponentEmojiResolvable.optional(),
  description: z.string().optional(),
  role: Snowflake,
  accessToken: z.string().optional(),
});
export type Product = z.infer<typeof Product>;

export async function getProducts(guild: Guild): Promise<Product[]> {
  const products: Product[] = [];
  for await (const entry of kv.list<Product>({
    prefix: ["guilds", guild.id, "products"],
  }))
    products.push(Product.parse(entry.value));
  return products;
}

export async function getProduct(
  guild: Guild,
  id?: string,
): Promise<Product | undefined> {
  if (!id) return;
  const entry = await kv.get<Product>(["guilds", guild.id, "products", id]);
  return Product.parse(entry.value);
}

export async function getLoggingChannel(guild: Guild) {
  const entry = await kv.get<Snowflake>(["guilds", guild.id, "loggingChannel"]);
  const id = entry.value;
  if (!id) return;
  return guild.channels.fetch(id);
}
