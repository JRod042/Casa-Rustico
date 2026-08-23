import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { WELCOME_STORAGE_KEY } from "./welcome/theme";

export type CartLine = {
  productId: string;
  variantId: number;
  variantTitle: string;
  qty: number;
  price: number;
};

const CART_KEY = "casa-rustico-go.v4";

type ShopApi = {
  hydrated: boolean;
  welcomeSeen: boolean;
  toast: string | null;
  cart: CartLine[];
  markWelcomeSeen: () => void;
  replayWelcome: () => void;
  flash: (msg: string) => void;
  addToCart: (line: Omit<CartLine, "qty"> & { qty?: number }) => void;
  setCartQty: (productId: string, variantId: number, qty: number) => void;
  removeFromCart: (productId: string, variantId: number) => void;
  clearCart: () => void;
};

const ShopContext = createContext<ShopApi | null>(null);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [welcomeSeen, setWelcomeSeen] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [rawCart, welcome] = await Promise.all([
          AsyncStorage.getItem(CART_KEY),
          AsyncStorage.getItem(WELCOME_STORAGE_KEY),
        ]);
        if (!alive) return;
        if (rawCart) {
          const parsed = JSON.parse(rawCart) as { cart?: CartLine[] } | CartLine[];
          const lines = Array.isArray(parsed) ? parsed : parsed.cart;
          if (Array.isArray(lines)) setCart(lines);
        }
        setWelcomeSeen(welcome === "1");
      } catch {
        if (alive) setWelcomeSeen(false);
      } finally {
        if (alive) setHydrated(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(CART_KEY, JSON.stringify({ cart })).catch(() => undefined);
  }, [cart, hydrated]);

  const markWelcomeSeen = useCallback(() => {
    setWelcomeSeen(true);
    void AsyncStorage.setItem(WELCOME_STORAGE_KEY, "1").catch(() => undefined);
  }, []);

  const replayWelcome = useCallback(() => {
    setWelcomeSeen(false);
    void AsyncStorage.removeItem(WELCOME_STORAGE_KEY).catch(() => undefined);
  }, []);

  const flash = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast((cur) => (cur === msg ? null : cur));
    }, 1700);
  }, []);

  const addToCart = useCallback((line: Omit<CartLine, "qty"> & { qty?: number }) => {
    const qty = line.qty ?? 1;
    setCart((s) => {
      const i = s.findIndex((l) => l.productId === line.productId && l.variantId === line.variantId);
      if (i >= 0) {
        const next = [...s];
        next[i] = { ...next[i], qty: next[i].qty + qty };
        return next;
      }
      return [...s, { ...line, qty }];
    });
  }, []);

  const setCartQty = useCallback((productId: string, variantId: number, qty: number) => {
    setCart((s) =>
      qty <= 0
        ? s.filter((l) => !(l.productId === productId && l.variantId === variantId))
        : s.map((l) => (l.productId === productId && l.variantId === variantId ? { ...l, qty } : l)),
    );
  }, []);

  const removeFromCart = useCallback((productId: string, variantId: number) => {
    setCart((s) => s.filter((l) => !(l.productId === productId && l.variantId === variantId)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const api = useMemo<ShopApi>(
    () => ({
      hydrated,
      welcomeSeen,
      toast,
      cart,
      markWelcomeSeen,
      replayWelcome,
      flash,
      addToCart,
      setCartQty,
      removeFromCart,
      clearCart,
    }),
    [
      hydrated,
      welcomeSeen,
      toast,
      cart,
      markWelcomeSeen,
      replayWelcome,
      flash,
      addToCart,
      setCartQty,
      removeFromCart,
      clearCart,
    ],
  );

  return <ShopContext.Provider value={api}>{children}</ShopContext.Provider>;
}

export function useShop() {
  const ctx = useContext(ShopContext);
  if (!ctx) throw new Error("useShop must be used inside ShopProvider");
  return ctx;
}

export function cartCount(cart: CartLine[]) {
  return cart.reduce((n, l) => n + l.qty, 0);
}

export function cartSubtotal(cart: CartLine[]) {
  return cart.reduce((n, l) => n + l.price * l.qty, 0);
}
