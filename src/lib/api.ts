import axios, { Method } from "axios";
import { z } from "zod";
import * as config from "./db.js";
import { Product } from "./db.js";

const debug: boolean = config.getConfig("debug");

export const LicenseResponse = z.discriminatedUnion("success", [
  z.object({
    success: z.literal(true),
    uses: z.number(),
  }),
  z.object({
    success: z.literal(false),
    message: z.string(),
  }),
]);
export type LicenseResponse = z.infer<typeof LicenseResponse>;

const api = axios.create({
  baseURL: "https://api.gumroad.com/v2/licenses",
  validateStatus: (status) => status < 500,
});
const increment_uses_count: boolean = config.getConfig("incrementUses");

function debugKey(
  key: string,
  use: boolean = increment_uses_count,
): LicenseResponse | undefined {
  if (!debug) return;
  if (!key.toLowerCase().startsWith("test")) return;

  const count = Number(key.substring(4)) || 0;
  return {
    success: true,
    uses: count + (use ? 1 : 0),
  };
}

async function request(
  url: string,
  method: Method,
  data: Record<string, string>,
) {
  const resp = await api(url, { method, data });
  return LicenseResponse.parse(resp.data);
}

export async function verify(
  product: Product,
  key: string,
  use: boolean = increment_uses_count,
): Promise<LicenseResponse> {
  return (
    debugKey(key) ||
    (await request("verify", "post", {
      product_id: product.value,
      license_key: key,
      increment_uses_count: `${use}`,
    }))
  );
}

export async function enable(
  product: Product,
  key: string,
  accessToken: string,
): Promise<LicenseResponse> {
  return (
    debugKey(key) ||
    (await request("enable", "put", {
      access_token: accessToken,
      product_id: product.value,
      license_key: key,
    }))
  );
}

export async function disable(
  product: Product,
  key: string,
  accessToken: string,
): Promise<LicenseResponse> {
  return (
    debugKey(key) ||
    (await request("disable", "put", {
      access_token: accessToken,
      product_id: product.value,
      license_key: key,
    }))
  );
}

export async function decUses(
  product: Product,
  key: string,
  accessToken: string,
): Promise<LicenseResponse> {
  return (
    debugKey(key) ||
    (await request("decrement_uses_count", "put", {
      access_token: accessToken,
      product_id: product.value,
      license_key: key,
    }))
  );
}
