import { View } from "react-native";
import { Fraunces_600SemiBold, Fraunces_700Bold } from "@expo-google-fonts/fraunces";
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
  useFonts,
} from "@expo-google-fonts/source-sans-3";
import { WelcomeGate } from "./src/welcome/WelcomeGate";
import { GameApp } from "./src/game/GameApp";
import { escapeWelcomeTheme as t } from "./src/welcome/theme";

/** Espresso Escape — complete free runner. No store, no IAP, no payments. */
export default function App() {
  const [fontsLoaded] = useFonts({
    Fraunces_600SemiBold,
    Fraunces_700Bold,
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
  });

  if (!fontsLoaded) {
    return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  }

  return (
    <WelcomeGate>
      <GameApp />
    </WelcomeGate>
  );
}
