import { useEffect, useState } from "react";
import {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
} from "@expo-google-fonts/fraunces";
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
  useFonts,
} from "@expo-google-fonts/source-sans-3";

export const BRAND_FONTS = {
  Fraunces_600SemiBold,
  Fraunces_700Bold,
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
};

/** Never block the playable demo on a font CDN stall. */
export function useBrandFonts(timeoutMs = 2500): boolean {
  const [loaded] = useFonts(BRAND_FONTS);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setTimedOut(true), timeoutMs);
    return () => clearTimeout(id);
  }, [timeoutMs]);

  return loaded || timedOut;
}
