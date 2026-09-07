import AsyncStorage from "@react-native-async-storage/async-storage";
import { type FeelPrefs, setFeelPrefs } from "./feel";

export const HIGH_SCORE_KEY = "@casa-rustico/escape-best-v1";
export const FIRST_RUN_KEY = "@casa-rustico/escape-first-run-v1";
export const SETTINGS_KEY = "@casa-rustico/escape-settings-v1";

export async function loadBestScore(): Promise<number> {
  try {
    const raw = await AsyncStorage.getItem(HIGH_SCORE_KEY);
    const n = Number.parseInt(raw ?? "", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export async function saveBestScore(score: number): Promise<number> {
  const prev = await loadBestScore();
  const next = Math.max(prev, score);
  try {
    await AsyncStorage.setItem(HIGH_SCORE_KEY, String(next));
  } catch {
    // Keep the in-memory best even if disk write fails.
  }
  return next;
}

export async function loadSeenFirstRun(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(FIRST_RUN_KEY)) === "1";
  } catch {
    return false;
  }
}

export async function markFirstRunSeen(): Promise<void> {
  try {
    await AsyncStorage.setItem(FIRST_RUN_KEY, "1");
  } catch {
    // Menu still works if persistence fails.
  }
}

export async function clearFirstRun(): Promise<void> {
  try {
    await AsyncStorage.removeItem(FIRST_RUN_KEY);
  } catch {
    // Replay still works in-memory.
  }
}

export async function loadSettings(): Promise<FeelPrefs> {
  const fallback: FeelPrefs = { haptics: true, sfx: true };
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      setFeelPrefs(fallback);
      return fallback;
    }
    const parsed = JSON.parse(raw) as Partial<FeelPrefs>;
    const next: FeelPrefs = {
      haptics: parsed.haptics !== false,
      sfx: parsed.sfx !== false,
    };
    setFeelPrefs(next);
    return next;
  } catch {
    setFeelPrefs(fallback);
    return fallback;
  }
}

export async function saveSettings(next: FeelPrefs): Promise<void> {
  setFeelPrefs(next);
  try {
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
  } catch {
    // In-memory prefs still apply this session.
  }
}
