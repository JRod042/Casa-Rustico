import { useCallback, useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import {
  useShopifyCheckoutSheet,
  type CheckoutCompletedEvent,
} from '@shopify/checkout-sheet-kit';
import { useCart } from '../cart/CartProvider';

/**
 * Presents Shopify Checkout Kit when the native module is available,
 * otherwise opens the hosted checkout URL in an in-app browser.
 */
export function useCheckout(onComplete?: (event?: CheckoutCompletedEvent) => void) {
  const shopifyCheckout = useShopifyCheckoutSheet();
  const { cart, clearLocalCart } = useCart();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    const completed = shopifyCheckout.addEventListener('completed', async (event) => {
      await clearLocalCart();
      onCompleteRef.current?.(event);
    });
    const failed = shopifyCheckout.addEventListener('error', (error) => {
      const message =
        error && typeof error === 'object' && 'message' in error
          ? String((error as { message?: string }).message)
          : 'Something went wrong';
      Alert.alert('Checkout error', message);
    });
    return () => {
      completed?.remove();
      failed?.remove();
    };
  }, [shopifyCheckout, clearLocalCart]);

  const present = useCallback(async () => {
    const checkoutUrl = cart?.checkoutUrl;
    if (!checkoutUrl) {
      Alert.alert('Cart empty', 'Add a coffee or house-mark item first.');
      return;
    }

    try {
      // Preload is a hint; ignore failures on unsupported platforms.
      shopifyCheckout.preload?.(checkoutUrl);
      shopifyCheckout.present(checkoutUrl);
    } catch {
      // Expo Go / web fallback — still hits the same Shopify checkout + fulfillment.
      if (Platform.OS === 'web') {
        window.open(checkoutUrl, '_blank');
        return;
      }
      await WebBrowser.openBrowserAsync(checkoutUrl, {
        enableDefaultShareMenuItem: false,
      });
    }
  }, [cart?.checkoutUrl, shopifyCheckout]);

  return { present, checkoutUrl: cart?.checkoutUrl ?? null };
}
