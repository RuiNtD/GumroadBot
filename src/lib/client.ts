import type { Client } from "discord.js";

let instance: Client;
let resolvers: Array<(value: Client | PromiseLike<Client>) => void> = [];

export async function getClient() {
  return instance
    ? Promise.resolve(instance)
    : new Promise<Client>((resolve) => {
        resolvers.push(resolve);
      });
}

export function setClient(client: Client) {
  instance = client;
  resolveAll();
}

function resolveAll() {
  for (const resolve of resolvers) {
    resolve(instance);
  }
}
