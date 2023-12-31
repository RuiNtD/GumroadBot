import axios from "axios";
import { z } from "zod";
import * as config from "./db.js";
import { Product } from "./db.js";

const debug: boolean = config.get("debug");

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
  baseURL: "https://api.gumroad.com/v2",
  validateStatus: (status) => status < 500,
});
const increment_uses_count: boolean = config.get("incrementUses");

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

export async function verify(
  product: Product,
  key: string,
  use?: boolean,
): Promise<LicenseResponse> {
  if (use === undefined) use = increment_uses_count;
  return LicenseResponse.parse(
    debugKey(key, use) ||
      (
        await api.post("licenses/verify", {
          product_id: product.value,
          license_key: key,
          increment_uses_count: `${use}`,
        })
      ).data,
  );
}

export async function enable(
  product: Product,
  key: string,
): Promise<LicenseResponse> {
  return LicenseResponse.parse(
    debugKey(key) ||
      (
        await api.put("licenses/enable", {
          access_token: product.accessToken,
          product_id: product.value,
          license_key: key,
        })
      ).data,
  );
}

export async function disable(
  product: Product,
  key: string,
): Promise<LicenseResponse> {
  return LicenseResponse.parse(
    debugKey(key) ||
      (
        await api.put("licenses/disable", {
          access_token: product.accessToken,
          product_id: product.value,
          license_key: key,
        })
      ).data,
  );
}

export async function decUses(
  product: Product,
  key: string,
): Promise<LicenseResponse> {
  return LicenseResponse.parse(
    debugKey(key) ||
      (
        await api.put("licenses/decrement_uses_count", {
          access_token: product.accessToken,
          product_id: product.value,
          license_key: key,
        })
      ).data,
  );
}
