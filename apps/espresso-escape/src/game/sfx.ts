/**
 * Same-tick café SFX. Creative can replace the wavs in assets/sfx/.
 * expo-av is optional — hops still juice with haptics if audio is missing.
 */
export type Tone =
  | "hop"
  | "bean"
  | "land"
  | "steam"
  | "death"
  | "retry"
  | "roast"
  | "warn"
  | "whoosh"
  | "stamp";

type Loaded = { play: () => Promise<void> };

/** Per-tone gain — cloth hop quiet, cardboard land louder, steam a hush. */
export const SFX_GAIN: Record<Tone, number> = {
  hop: 0.46,
  whoosh: 0.3,
  land: 0.64,
  stamp: 0.52,
  bean: 0.5,
  steam: 0.26,
  death: 0.7,
  retry: 0.44,
  roast: 0.58,
  warn: 0.38,
};

const bank: Partial<Record<Tone, Loaded>> = {};
let booted = false;
let muted = false;

export function muteSfx(next: boolean): void {
  muted = next;
}

export function bootSfx(): void {
  if (booted) return;
  booted = true;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const av = require("expo-av") as {
      Audio: {
        setAudioModeAsync: (m: object) => Promise<void>;
        Sound: {
          createAsync: (
            src: number,
            opts: object
          ) => Promise<{ sound: { replayAsync: () => Promise<void> } }>;
        };
      };
    };
    void av.Audio.setAudioModeAsync({
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch(() => undefined);
    const files: Record<Tone, number> = {
      hop: require("../../assets/sfx/hop.wav"),
      bean: require("../../assets/sfx/bean.wav"),
      land: require("../../assets/sfx/land.wav"),
      steam: require("../../assets/sfx/steam.wav"),
      death: require("../../assets/sfx/death.wav"),
      retry: require("../../assets/sfx/retry.wav"),
      roast: require("../../assets/sfx/roast.wav"),
      warn: require("../../assets/sfx/warn.wav"),
      whoosh: require("../../assets/sfx/whoosh.wav"),
      stamp: require("../../assets/sfx/stamp.wav"),
    };
    (Object.keys(files) as Tone[]).forEach((name) => {
      void av.Audio.Sound.createAsync(files[name], { shouldPlay: false, volume: SFX_GAIN[name] })
        .then(({ sound }) => {
          bank[name] = { play: () => sound.replayAsync().then(() => undefined) };
        })
        .catch(() => undefined);
    });
  } catch {
    // Native module not present (web / unit). Haptics still fire.
  }
}

export function playSfx(name: Tone): void {
  if (muted) return;
  const clip = bank[name];
  if (!clip) return;
  void clip.play().catch(() => undefined);
}
