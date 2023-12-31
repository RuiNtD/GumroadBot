import * as config from "./config.js";
import { Guild, GuildMember, User } from "discord.js";
import { Product, getProducts } from "./config.js";

export function formatUser(user: User) {
  return `${user.tag} (${user.id})`;
}

export function hasVerifiedRole(member: GuildMember, product: Product) {
  const role = config.getVerifiedRole(product);
  return member.roles.cache.has(role);
}

export async function giveVerifiedRole(
  member: GuildMember,
  product: Product,
  reason?: string,
) {
  const role = config.getVerifiedRole(product);
  await member.roles.add(role, reason);
}

export async function getProduct(
  guild: Guild,
  id?: string,
): Promise<Product | undefined> {
  if (!id) return;

  const products = await getProducts(guild);
  return products.find((v) => v.value == id);
}

export function ephemeral(content: string) {
  return {
    content,
    ephemeral: true,
  };
}
