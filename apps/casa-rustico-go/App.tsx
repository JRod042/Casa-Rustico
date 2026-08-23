import { View } from "react-native";
import { Fraunces_600SemiBold, Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
  useFonts,
} from "@expo-google-fonts/source-sans-3";
import { ShopProvider } from "./src/store";
import { WelcomeGate } from "./src/welcome/WelcomeGate";
import { ShopShell } from "./src/shop/ShopShell";
import { colors } from "./src/theme";

/**
 * Casa Rústico Go — brand shop.
 * Shopify catalog + rusticopr.com checkout permalinks.
 * Cart persists on-device (AsyncStorage). No auth.
 */
export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }

  return (
    <ShopProvider>
      <WelcomeGate>
        <ShopShell />
      </WelcomeGate>
    </ShopProvider>
  );
}
