import axios from "axios";
import config from "config";

type LicenseResponse =
  | {
      success: true;
      uses: number;
    }
  | {
      success: false;
      message: string;
    };

const api = axios.create({
  baseURL: "https://api.gumroad.com/v2",
  validateStatus: (status) => status < 500,
});
const product_permalink: string = config.get("permalink");
const access_token: string = config.get("accessToken");
const increment_uses_count = `${config.get("incrementUses")}`;

export async function verify(license_key: string): Promise<LicenseResponse> {
  const response = await api.post("licenses/verify", {
    product_permalink,
    license_key,
    increment_uses_count,
  });
  return response.data;
}

export async function enable(license_key: string): Promise<LicenseResponse> {
  const response = await api.put("licenses/enable", {
    access_token,
    product_permalink,
    license_key,
  });
  return response.data;
}

export async function disable(license_key: string): Promise<LicenseResponse> {
  const response = await api.put("licenses/disable", {
    access_token,
    product_permalink,
    license_key,
  });
  return response.data;
}

export async function decUses(license_key: string): Promise<LicenseResponse> {
  const response = await api.put("licenses/decrement_uses_count", {
    access_token,
    product_permalink,
    license_key,
  });
  return await response.data;
}
