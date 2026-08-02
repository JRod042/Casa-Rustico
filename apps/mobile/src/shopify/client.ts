import Constants from 'expo-constants';
import type { Cart, Collection, Product } from './types';
import {
  CART_CREATE_MUTATION,
  CART_LINES_ADD_MUTATION,
  CART_LINES_REMOVE_MUTATION,
  CART_LINES_UPDATE_MUTATION,
  CART_QUERY,
  COLLECTION_BY_HANDLE_QUERY,
  COLLECTIONS_QUERY,
  PRODUCT_BY_HANDLE_QUERY,
  PRODUCTS_QUERY,
} from './queries';

type Extra = {
  shopifyStoreDomain?: string;
  shopifyStorefrontToken?: string;
  shopifyApiVersion?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

export const SHOP_DOMAIN =
  process.env.EXPO_PUBLIC_SHOPIFY_STORE_DOMAIN ??
  extra.shopifyStoreDomain ??
  'b84a47-3.myshopify.com';

export const STOREFRONT_TOKEN =
  process.env.EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN ??
  extra.shopifyStorefrontToken ??
  '';

export const API_VERSION =
  process.env.EXPO_PUBLIC_SHOPIFY_API_VERSION ??
  extra.shopifyApiVersion ??
  '2026-01';

export function isShopifyConfigured(): boolean {
  return Boolean(SHOP_DOMAIN && STOREFRONT_TOKEN);
}

type GraphQLResponse<T> = {
  data?: T;
  errors?: { message: string }[];
};

function unwrapEdges<T>(connection?: { edges?: { node: T }[] } | null): T[] {
  return connection?.edges?.map((edge) => edge.node) ?? [];
}

function normalizeProduct(node: any): Product {
  return {
    ...node,
    variants: unwrapEdges(node.variants),
  };
}

function normalizeCart(node: any): Cart {
  return {
    ...node,
    lines: unwrapEdges(node.lines),
  };
}

async function storefrontFetch<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  if (!STOREFRONT_TOKEN) {
    throw new Error(
      'Missing EXPO_PUBLIC_SHOPIFY_STOREFRONT_TOKEN. Copy .env.example to .env and add your Storefront API token.',
    );
  }

  const response = await fetch(
    `https://${SHOP_DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query, variables }),
    },
  );

  if (!response.ok) {
    throw new Error(`Storefront API HTTP ${response.status}`);
  }

  const payload = (await response.json()) as GraphQLResponse<T>;
  if (payload.errors?.length) {
    throw new Error(payload.errors[0].message);
  }
  if (!payload.data) {
    throw new Error('Storefront API returned no data');
  }
  return payload.data;
}

function assertNoUserErrors(userErrors?: { message: string }[]) {
  if (userErrors?.length) {
    throw new Error(userErrors[0].message);
  }
}

export async function fetchCollections(first = 20): Promise<
  Omit<Collection, 'products'>[]
> {
  const data = await storefrontFetch<{
    collections: { edges: { node: Omit<Collection, 'products'> }[] };
  }>(COLLECTIONS_QUERY, { first });
  return unwrapEdges(data.collections);
}

export async function fetchCollectionByHandle(
  handle: string,
  first = 50,
): Promise<Collection | null> {
  const data = await storefrontFetch<{ collection: any }>(
    COLLECTION_BY_HANDLE_QUERY,
    { handle, first },
  );
  if (!data.collection) return null;
  return {
    ...data.collection,
    products: unwrapEdges(data.collection.products).map(normalizeProduct),
  };
}

export async function fetchProducts(first = 50): Promise<Product[]> {
  const data = await storefrontFetch<{ products: any }>(PRODUCTS_QUERY, {
    first,
  });
  return unwrapEdges(data.products).map(normalizeProduct);
}

export async function fetchProductByHandle(
  handle: string,
): Promise<Product | null> {
  const data = await storefrontFetch<{ product: any }>(
    PRODUCT_BY_HANDLE_QUERY,
    { handle },
  );
  return data.product ? normalizeProduct(data.product) : null;
}

export async function fetchCart(cartId: string): Promise<Cart | null> {
  const data = await storefrontFetch<{ cart: any }>(CART_QUERY, { id: cartId });
  return data.cart ? normalizeCart(data.cart) : null;
}

export async function createCart(
  variantId: string,
  quantity = 1,
): Promise<Cart> {
  const data = await storefrontFetch<{
    cartCreate: { cart: any; userErrors: { message: string }[] };
  }>(CART_CREATE_MUTATION, {
    input: {
      lines: [{ merchandiseId: variantId, quantity }],
    },
  });
  assertNoUserErrors(data.cartCreate.userErrors);
  return normalizeCart(data.cartCreate.cart);
}

export async function addCartLines(
  cartId: string,
  variantId: string,
  quantity = 1,
): Promise<Cart> {
  const data = await storefrontFetch<{
    cartLinesAdd: { cart: any; userErrors: { message: string }[] };
  }>(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{ merchandiseId: variantId, quantity }],
  });
  assertNoUserErrors(data.cartLinesAdd.userErrors);
  return normalizeCart(data.cartLinesAdd.cart);
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
): Promise<Cart> {
  const data = await storefrontFetch<{
    cartLinesUpdate: { cart: any; userErrors: { message: string }[] };
  }>(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{ id: lineId, quantity }],
  });
  assertNoUserErrors(data.cartLinesUpdate.userErrors);
  return normalizeCart(data.cartLinesUpdate.cart);
}

export async function removeCartLines(
  cartId: string,
  lineIds: string[],
): Promise<Cart> {
  const data = await storefrontFetch<{
    cartLinesRemove: { cart: any; userErrors: { message: string }[] };
  }>(CART_LINES_REMOVE_MUTATION, { cartId, lineIds });
  assertNoUserErrors(data.cartLinesRemove.userErrors);
  return normalizeCart(data.cartLinesRemove.cart);
}

export function formatMoney(money?: { amount: string; currencyCode: string }) {
  if (!money) return '';
  const amount = Number(money.amount);
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: money.currencyCode,
    }).format(amount);
  } catch {
    return `$${amount.toFixed(2)}`;
  }
}
