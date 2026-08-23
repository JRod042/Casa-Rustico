const STORE_URL = "https://rusticopr.com";

export function productUrl(handle: string) {
  return `${STORE_URL}/products/${handle}`;
}

export function cartPermalink(lines: { variantId: string | number; qty: number }[]) {
  const valid = lines.filter((l) => l.qty > 0 && l.variantId);
  if (!valid.length) return `${STORE_URL}/cart`;
  const path = valid.map((l) => `${l.variantId}:${l.qty}`).join(",");
  return `${STORE_URL}/cart/${path}`;
}
