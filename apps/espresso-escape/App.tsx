import { View } from "react-native";
import { WelcomeGate } from "./src/welcome/WelcomeGate";
import { GameApp } from "./src/game/GameApp";
import { useBrandFonts } from "./src/welcome/fonts";
import { escapeWelcomeTheme as t } from "./src/welcome/theme";

/** Espresso Escape — complete free runner. No store, no IAP, no payments. */
export default function App() {
  const fontsReady = useBrandFonts();

  if (!fontsReady) {
    return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  }

  return (
    <WelcomeGate>
      <GameApp />
    </WelcomeGate>
  );
}
