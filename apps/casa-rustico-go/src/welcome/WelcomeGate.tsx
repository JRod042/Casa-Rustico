import { type ReactNode } from "react";
import { View } from "react-native";
import { useShop } from "../store";
import { CasaWelcome } from "./CasaWelcome";
import { goWelcomeTheme as t } from "./theme";

type Props = {
  children: ReactNode;
};

/** First launch (and Replay intro) shows the branded welcome; returning skips to the shop. */
export function WelcomeGate({ children }: Props) {
  const { hydrated, welcomeSeen, markWelcomeSeen } = useShop();

  if (!hydrated) {
    return <View style={{ flex: 1, backgroundColor: t.bg }} />;
  }

  if (!welcomeSeen) {
    return <CasaWelcome onFinished={markWelcomeSeen} />;
  }

  return <>{children}</>;
}
