import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  addCartLines,
  createCart,
  fetchCart,
  removeCartLines,
  updateCartLine,
} from '../shopify/client';
import type { Cart } from '../shopify/types';

const CART_ID_KEY = 'casa-rustico.cartId';

type CartContextValue = {
  cart: Cart | null;
  loading: boolean;
  busy: boolean;
  error: string | null;
  itemCount: number;
  addVariant: (variantId: string, quantity?: number) => Promise<void>;
  setLineQuantity: (lineId: string, quantity: number) => Promise<void>;
  removeLine: (lineId: string) => Promise<void>;
  clearLocalCart: () => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const cartId = await AsyncStorage.getItem(CART_ID_KEY);
    if (!cartId) {
      setCart(null);
      return;
    }
    const next = await fetchCart(cartId);
    if (!next) {
      await AsyncStorage.removeItem(CART_ID_KEY);
      setCart(null);
      return;
    }
    setCart(next);
  }, []);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await refresh();
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load cart');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [refresh]);

  const addVariant = useCallback(
    async (variantId: string, quantity = 1) => {
      setBusy(true);
      setError(null);
      try {
        let next: Cart;
        if (cart?.id) {
          next = await addCartLines(cart.id, variantId, quantity);
        } else {
          next = await createCart(variantId, quantity);
          await AsyncStorage.setItem(CART_ID_KEY, next.id);
        }
        setCart(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not update cart');
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [cart?.id],
  );

  const setLineQuantity = useCallback(
    async (lineId: string, quantity: number) => {
      if (!cart?.id) return;
      setBusy(true);
      setError(null);
      try {
        const next =
          quantity <= 0
            ? await removeCartLines(cart.id, [lineId])
            : await updateCartLine(cart.id, lineId, quantity);
        setCart(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not update cart');
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [cart?.id],
  );

  const removeLine = useCallback(
    async (lineId: string) => {
      if (!cart?.id) return;
      setBusy(true);
      setError(null);
      try {
        const next = await removeCartLines(cart.id, [lineId]);
        setCart(next);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Could not remove item');
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [cart?.id],
  );

  const clearLocalCart = useCallback(async () => {
    await AsyncStorage.removeItem(CART_ID_KEY);
    setCart(null);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      cart,
      loading,
      busy,
      error,
      itemCount: cart?.totalQuantity ?? 0,
      addVariant,
      setLineQuantity,
      removeLine,
      clearLocalCart,
      refresh,
    }),
    [
      cart,
      loading,
      busy,
      error,
      addVariant,
      setLineQuantity,
      removeLine,
      clearLocalCart,
      refresh,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used within CartProvider');
  }
  return ctx;
}
