import 'react-native-url-polyfill/auto';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import {
  Fraunces_500Medium,
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  useFonts as useFraunces,
} from '@expo-google-fonts/fraunces';
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  useFonts as useSourceSans,
} from '@expo-google-fonts/source-sans-3';
import {
  ColorScheme,
  ShopifyCheckoutSheetProvider,
} from '@shopify/checkout-sheet-kit';
import { CartProvider } from '../src/cart/CartProvider';
import { colors } from '../src/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function RootLayout() {
  const [frauncesLoaded] = useFraunces({
    Fraunces_500Medium,
    Fraunces_600SemiBold,
    Fraunces_700Bold,
  });
  const [sourceLoaded] = useSourceSans({
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
  });

  const ready = frauncesLoaded && sourceLoaded;

  useEffect(() => {
    if (ready) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [ready]);

  if (!ready) return null;

  return (
    <ShopifyCheckoutSheetProvider
      configuration={{
        colorScheme: ColorScheme.automatic,
        preloading: true,
      }}
    >
      <CartProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.cream },
            headerTintColor: colors.espresso,
            headerTitleStyle: {
              fontFamily: 'Fraunces_600SemiBold',
              fontSize: 18,
            },
            headerShadowVisible: false,
            contentStyle: { backgroundColor: colors.cream },
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="product/[handle]"
            options={{ title: 'Product' }}
          />
        </Stack>
      </CartProvider>
    </ShopifyCheckoutSheetProvider>
  );
}
