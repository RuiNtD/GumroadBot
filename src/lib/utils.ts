import { User } from "discord.js";

export function formatUser(user: User) {
  return `${user.tag} (${user.id})`;
}
