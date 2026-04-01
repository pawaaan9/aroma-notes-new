import crypto from "crypto";

export interface PayzyFieldValues {
  x_test_mode: string;
  x_shopid: string;
  x_amount: string;
  x_order_id: string;
  x_response_url: string;
  x_first_name: string;
  x_last_name: string;
  x_company: string;
  x_address: string;
  x_country: string;
  x_state: string;
  x_city: string;
  x_zip: string;
  x_phone: string;
  x_email: string;
  x_ship_to_first_name: string;
  x_ship_to_last_name: string;
  x_ship_to_company: string;
  x_ship_to_address: string;
  x_ship_to_country: string;
  x_ship_to_state: string;
  x_ship_to_city: string;
  x_ship_to_zip: string;
  x_freight: string;
  x_version: string;
  x_platform: string;
}

export const CHECKOUT_SIGNED_FIELD_NAMES =
  "x_test_mode,x_shopid,x_amount,x_order_id,x_response_url," +
  "x_first_name,x_last_name,x_company,x_address,x_country,x_state,x_city,x_zip," +
  "x_phone,x_email," +
  "x_ship_to_first_name,x_ship_to_last_name,x_ship_to_company," +
  "x_ship_to_address,x_ship_to_country,x_ship_to_state,x_ship_to_city,x_ship_to_zip," +
  "x_freight,x_platform,x_version,signed_field_names";

export const VERIFY_SIGNED_FIELD_NAMES =
  "response_code,x_test_mode,x_shopid,x_amount,x_order_id,x_response_url," +
  "x_first_name,x_last_name,x_company,x_address,x_country,x_state,x_city,x_zip," +
  "x_phone,x_email," +
  "x_ship_to_first_name,x_ship_to_last_name,x_ship_to_company," +
  "x_ship_to_address,x_ship_to_country,x_ship_to_state,x_ship_to_city,x_ship_to_zip," +
  "x_freight,x_platform,signed_field_names";

export const PAYZY_API_URL =
  process.env.PAYZY_API_URL?.trim() ||
  "https://api.payzy.lk/checkout/custom-checkout";

/** Live: off. Sandbox: set PAYZY_TEST_MODE=on (or true / 1). */
function payzyTestModeFlag(): "on" | "off" {
  const v = (process.env.PAYZY_TEST_MODE ?? "").trim().toLowerCase();
  if (v === "on" || v === "true" || v === "1" || v === "yes") return "on";
  return "off";
}

function hmacSha256Base64(data: string, key: string): string {
  return crypto.createHmac("sha256", key).update(data).digest("base64");
}

/**
 * Build checkout HMAC signature.
 * Matches PayZy docs exactly — note x_version uses NO "=" sign per their spec:
 *   ...,x_platform=VALUE,x_versionVALUE,signed_field_names=...
 */
export function buildCheckoutSignature(fields: PayzyFieldValues): string {
  const dataString =
    "x_test_mode=" + fields.x_test_mode +
    ",x_shopid=" + fields.x_shopid +
    ",x_amount=" + fields.x_amount +
    ",x_order_id=" + fields.x_order_id +
    ",x_response_url=" + fields.x_response_url +
    ",x_first_name=" + fields.x_first_name +
    ",x_last_name=" + fields.x_last_name +
    ",x_company=" + fields.x_company +
    ",x_address=" + fields.x_address +
    ",x_country=" + fields.x_country +
    ",x_state=" + fields.x_state +
    ",x_city=" + fields.x_city +
    ",x_zip=" + fields.x_zip +
    ",x_phone=" + fields.x_phone +
    ",x_email=" + fields.x_email +
    ",x_ship_to_first_name=" + fields.x_ship_to_first_name +
    ",x_ship_to_last_name=" + fields.x_ship_to_last_name +
    ",x_ship_to_company=" + fields.x_ship_to_company +
    ",x_ship_to_address=" + fields.x_ship_to_address +
    ",x_ship_to_country=" + fields.x_ship_to_country +
    ",x_ship_to_state=" + fields.x_ship_to_state +
    ",x_ship_to_city=" + fields.x_ship_to_city +
    ",x_ship_to_zip=" + fields.x_ship_to_zip +
    ",x_freight=" + fields.x_freight +
    ",x_platform=" + fields.x_platform +
    ",x_version" + fields.x_version +
    ",signed_field_names=" + CHECKOUT_SIGNED_FIELD_NAMES;

  return hmacSha256Base64(dataString, process.env.PAYZY_SECRET_KEY!);
}

const VERIFY_SIGNED_FIELD_NAMES_WITH_VERSION =
  "response_code,x_test_mode,x_shopid,x_amount,x_order_id,x_response_url," +
  "x_first_name,x_last_name,x_company,x_address,x_country,x_state,x_city,x_zip," +
  "x_phone,x_email," +
  "x_ship_to_first_name,x_ship_to_last_name,x_ship_to_company," +
  "x_ship_to_address,x_ship_to_country,x_ship_to_state,x_ship_to_city,x_ship_to_zip," +
  "x_freight,x_platform,x_version,signed_field_names";

/**
 * Try multiple verify signature formats because PayZy's docs are inconsistent
 * with their actual implementation. Returns all candidates so the verify
 * route can check if ANY match.
 */
export function buildVerifySignatureCandidates(
  fields: PayzyFieldValues,
  responseCode: string,
): { signature: string; variant: string }[] {
  const key = process.env.PAYZY_SECRET_KEY!;

  const baseFields =
    "response_code=" + responseCode +
    ",x_test_mode=" + fields.x_test_mode +
    ",x_shopid=" + fields.x_shopid +
    ",x_amount=" + fields.x_amount +
    ",x_order_id=" + fields.x_order_id +
    ",x_response_url=" + fields.x_response_url +
    ",x_first_name=" + fields.x_first_name +
    ",x_last_name=" + fields.x_last_name +
    ",x_company=" + fields.x_company +
    ",x_address=" + fields.x_address +
    ",x_country=" + fields.x_country +
    ",x_state=" + fields.x_state +
    ",x_city=" + fields.x_city +
    ",x_zip=" + fields.x_zip +
    ",x_phone=" + fields.x_phone +
    ",x_email=" + fields.x_email +
    ",x_ship_to_first_name=" + fields.x_ship_to_first_name +
    ",x_ship_to_last_name=" + fields.x_ship_to_last_name +
    ",x_ship_to_company=" + fields.x_ship_to_company +
    ",x_ship_to_address=" + fields.x_ship_to_address +
    ",x_ship_to_country=" + fields.x_ship_to_country +
    ",x_ship_to_state=" + fields.x_ship_to_state +
    ",x_ship_to_city=" + fields.x_ship_to_city +
    ",x_ship_to_zip=" + fields.x_ship_to_zip +
    ",x_freight=" + fields.x_freight +
    ",x_platform=" + fields.x_platform;

  // A: docs format — x_version= (with equals), x_version NOT in signed_field_names
  const dsA = baseFields + ",x_version=" + fields.x_version +
    ",signed_field_names=" + VERIFY_SIGNED_FIELD_NAMES;

  // B: no x_version at all
  const dsB = baseFields +
    ",signed_field_names=" + VERIFY_SIGNED_FIELD_NAMES;

  // C: x_version without = (matching checkout quirk), x_version NOT in signed_field_names
  const dsC = baseFields + ",x_version" + fields.x_version +
    ",signed_field_names=" + VERIFY_SIGNED_FIELD_NAMES;

  // D: x_version= (with equals), x_version IN signed_field_names
  const dsD = baseFields + ",x_version=" + fields.x_version +
    ",signed_field_names=" + VERIFY_SIGNED_FIELD_NAMES_WITH_VERSION;

  // E: x_version without = (checkout quirk), x_version IN signed_field_names
  const dsE = baseFields + ",x_version" + fields.x_version +
    ",signed_field_names=" + VERIFY_SIGNED_FIELD_NAMES_WITH_VERSION;

  return [
    { signature: hmacSha256Base64(dsA, key), variant: "A: x_version=, not in sfn" },
    { signature: hmacSha256Base64(dsB, key), variant: "B: no x_version" },
    { signature: hmacSha256Base64(dsC, key), variant: "C: x_version (no =), not in sfn" },
    { signature: hmacSha256Base64(dsD, key), variant: "D: x_version=, in sfn" },
    { signature: hmacSha256Base64(dsE, key), variant: "E: x_version (no =), in sfn" },
  ];
}

export function formatPayzyMoney(amount: number): string {
  const n = Number(amount);
  if (!Number.isFinite(n) || n < 0) return "0";
  return String(n);
}

export function buildPayzyFields(params: {
  orderId: string;
  amount: number;
  deliveryFee: number;
  firstName: string;
  lastName: string;
  company: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  responseUrl: string;
}): PayzyFieldValues {
  const company = params.company.trim() || "Aroma Notes";
  const state = params.state.trim() || params.city.trim();
  const zip = params.zip.trim() || "00000";
  return {
    x_test_mode: payzyTestModeFlag(),
    x_shopid: String(process.env.PAYZY_SHOP_ID ?? "").trim(),
    x_amount: formatPayzyMoney(params.amount),
    x_order_id: params.orderId,
    x_response_url: params.responseUrl,
    x_first_name: params.firstName.trim(),
    x_last_name: params.lastName.trim(),
    x_company: company,
    x_address: params.address.trim(),
    x_country: "LK",
    x_state: state,
    x_city: params.city.trim(),
    x_zip: zip,
    x_phone: params.phone.trim(),
    x_email: params.email.trim() || "customer@aromanotes.lk",
    x_ship_to_first_name: params.firstName.trim(),
    x_ship_to_last_name: params.lastName.trim(),
    x_ship_to_company: company,
    x_ship_to_address: params.address.trim(),
    x_ship_to_country: "LK",
    x_ship_to_state: state,
    x_ship_to_city: params.city.trim(),
    x_ship_to_zip: zip,
    x_freight: formatPayzyMoney(params.deliveryFee),
    x_version: "1.0",
    x_platform: "custom",
  };
}
