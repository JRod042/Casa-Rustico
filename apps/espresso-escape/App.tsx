import { WelcomeGate } from "./src/welcome/WelcomeGate";
import { GameApp } from "./src/game/GameApp";

/** Espresso Escape — complete free runner. No store, no IAP, no payments. */
export default function App() {
  return (
    <WelcomeGate>
      <GameApp />
    </WelcomeGate>
  );
}
