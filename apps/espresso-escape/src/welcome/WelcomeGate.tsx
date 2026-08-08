import { type ReactNode, useEffect, useState } from "react";
import { View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { EscapeWelcome } from "./EscapeWelcome";
import { escapeWelcomeTheme as t, WELCOME_STORAGE_KEY } from "./theme";

type Props = {
  children: ReactNode;
  forceShow?: boolean;
};

export function WelcomeGate({ children, forceShow = false }: Props) {
  const [ready, setReady] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      if (forceShow) {
        if (alive) {
          setShowWelcome(true);
          setReady(true);
        }
        return;
      }
      try {
        const seen = await AsyncStorage.getItem(WELCOME_STORAGE_KEY);
        if (alive) setShowWelcome(seen !== "1");
      } catch {
        if (alive) setShowWelcome(true);
      } finally {
        if (alive) setReady(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [forceShow]);

  const finish = async () => {
    setShowWelcome(false);
    try {
      await AsyncStorage.setItem(WELCOME_STORAGE_KEY, "1");
    } catch {
      // Ignore persistence failures — still enter the app.
    }
  };

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  }

  if (showWelcome) {
    return <EscapeWelcome onFinished={finish} />;
  }

  return <>{children}</>;
}
