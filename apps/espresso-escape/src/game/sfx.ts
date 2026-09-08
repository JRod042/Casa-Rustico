import type { FeelEventId } from "./feelEvents";

/**
 * Same-tick café SFX via expo-audio (SDK 57). expo-av/EXAV is gone.
 * Casa sound owns P0 contract wavs — keep the same keys under assets/sfx/.
 */
export type Tone = FeelEventId | "bean" | "steam" | "death" | "retry" | "roast" | "warn" | "whoosh" | "stamp";

type Loaded = { play: () => Promise<void> };

/** Per-tone gain — cloth hop quiet, cardboard land louder, steam a hush. */
export const SFX_GAIN: Record<Tone, number> = {
  hop: 0.46,
  land: 0.64,
  death_stamp: 0.7,
  honey_bean: 0.5,
  near_miss: 0.38,
  menu_ui: 0.44,
  whoosh: 0.3,
  stamp: 0.52,
  bean: 0.5,
  steam: 0.26,
  death: 0.7,
  retry: 0.44,
  roast: 0.58,
  warn: 0.38,
};

const bank: Partial<Record<Tone, Loaded>> = {};
const pending = new Set<Tone>();
let booted = false;
let muted = false;
let music: { play: () => void; pause: () => void; loop?: boolean; volume?: number } | null = null;

export function muteSfx(next: boolean): void {
  muted = next;
  if (music) {
    try {
      if (next) music.pause();
      else music.play();
    } catch {
      /* native audio may be absent */
    }
  }
}

export function bootSfx(): void {
  if (booted) return;
  booted = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const audio = require("expo-audio") as {
      createAudioPlayer: (
        src: number
      ) => { play: () => void; seekTo: (s: number) => Promise<void> | void; volume: number };
      setAudioModeAsync: (m: object) => Promise<void>;
    };
    void audio
      .setAudioModeAsync({
        playsInSilentMode: false,
        shouldPlayInBackground: false,
        interruptionMode: "duckOthers",
      })
      .catch(() => undefined);
    const files: Record<Tone, number> = {
      hop: require("../../assets/sfx/hop.wav"),
      land: require("../../assets/sfx/land.wav"),
      death_stamp: require("../../assets/sfx/death.wav"),
      honey_bean: require("../../assets/sfx/bean.wav"),
      near_miss: require("../../assets/sfx/warn.wav"),
      menu_ui: require("../../assets/sfx/retry.wav"),
      bean: require("../../assets/sfx/bean.wav"),
      steam: require("../../assets/sfx/steam.wav"),
      death: require("../../assets/sfx/death.wav"),
      retry: require("../../assets/sfx/retry.wav"),
      roast: require("../../assets/sfx/roast.wav"),
      warn: require("../../assets/sfx/warn.wav"),
      whoosh: require("../../assets/sfx/whoosh.wav"),
      stamp: require("../../assets/sfx/stamp.wav"),
    };
    (Object.keys(files) as Tone[]).forEach((name) => {
      try {
        const player = audio.createAudioPlayer(files[name]);
        player.volume = SFX_GAIN[name];
        bank[name] = {
          play: async () => {
            await Promise.resolve(player.seekTo(0));
            player.play();
          },
        };
        if (pending.delete(name) && !muted) {
          void bank[name]?.play().catch(() => undefined);
        }
      } catch {
        // Soft-fail one clip — haptics still fire.
      }
    });
    try {
      const player = audio.createAudioPlayer(require("../../assets/sfx/theme.mp3"));
      player.volume = 0.28;
      (player as { loop?: boolean }).loop = true;
      music = player;
      if (!muted) player.play();
    } catch {
      music = null;
    }
  } catch {
    // Native module not present (web / unit). Haptics still fire.
  }
}

export function playSfx(name: Tone): void {
  if (muted) return;
  const clip = bank[name];
  if (!clip) {
    pending.add(name);
    return;
  }
  void clip.play().catch(() => undefined);
}
