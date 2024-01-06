import config from "config";
import { Client, Guild, Team, TeamMember, User, inlineCode } from "discord.js";
import { KvKey, openKv } from "@deno/kv";
import { z } from "zod";

export const kv = await openKv("kv.db");

export async function get<T>(
  key: KvKey,
  type?: z.ZodType<T>,
): Promise<T | undefined> {
  const { value } = await kv.get<T>(key);
  if (value === null) return;
  if (type) return type.parse(value);
  else return value;
}

export function getConfig<T>(setting: string): T {
  return config.get(setting);
}

export const debug: boolean = getConfig("debug");

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
    return `${owner.name} or ${getOwnerPing(owner.owner, guild)}`;
  else if (owner instanceof TeamMember) return getOwnerPing(owner.user, guild);
  else if (owner instanceof User) {
    if (guild && guild.members.resolve(owner)) return `${owner}`;
    return inlineCode(`@${owner.tag}`);
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

const Snowflake = z.string().min(17).max(20);
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
  permalink: z.string().optional(),
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
  return await get(["guilds", guild.id, "products", id], Product);
}

export async function getLoggingChannel(guild: Guild) {
  const id = await get(["guilds", guild.id, "loggingChannel"], Snowflake);
  if (!id) return;
  return guild.channels.fetch(id);
}

export async function getAccessToken(
  guild: Guild,
  product?: Product,
): Promise<string | undefined> {
  if (product && product.accessToken) return product.accessToken;
  const token = await get(["guilds", guild.id, "accessToken"], z.string());
  return token;
}

await kv.set(
  ["guilds", getConfig("guildID"), "products", getConfig("productID")],
  Product.parse({
    label: getConfig("name"),
    value: getConfig("productID"),
    role: getConfig("verifiedRole"),
    accessToken: getConfig("accessToken"),
    permalink: getConfig("permalink"),
  }),
);
await kv.set(
  ["guilds", getConfig("guildID"), "loggingChannel"],
  getConfig("loggingChannel"),
);
