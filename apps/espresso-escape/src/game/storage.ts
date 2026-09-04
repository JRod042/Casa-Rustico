import AsyncStorage from "@react-native-async-storage/async-storage";

export const HIGH_SCORE_KEY = "@casa-rustico/escape-best-v1";

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
