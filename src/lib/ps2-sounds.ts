import { useEffect, useRef, useCallback, useState } from "react";

type SoundType = "click" | "confirm" | "nav" | "confirm-final";

// Small WebAudio-based PS2-like sounds. No external assets required.
export function usePs2Sounds(initialTheme: string = "neutral") {
  const ctxRef = useRef<AudioContext | null>(null);
  const [soundTheme, setSoundTheme] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("soundTheme");
      return (saved as string) || initialTheme;
    } catch {
      return initialTheme;
    }
  });

  const ensureContext = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const win = window as unknown as {
      AudioContext?: typeof AudioContext;
      webkitAudioContext?: typeof AudioContext;
    };
    const Ctx = win.AudioContext || win.webkitAudioContext;
    if (!Ctx) return null;
    const ctx = new Ctx();
    ctxRef.current = ctx;
    return ctx;
  }, []);

  const playTone = useCallback(
    (
      freq: number,
      duration = 0.08,
      type: OscillatorType = "sine",
      gainVal = 0.08,
    ) => {
      const ctx = ensureContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      gain.gain.setValueAtTime(gainVal, now);
      // quick envelope
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + duration + 0.02);
    },
    [ensureContext],
  );

  const play = useCallback(
    (t: SoundType) => {
      const ctx = ensureContext();
      if (!ctx) return;
      // Resume context if suspended (required by some browsers on first gesture)
      if (ctx.state === "suspended") ctx.resume();

      // Read current theme from ref-like closure. If the consumer updated theme via setSoundTheme,
      // we will try to read the value from localStorage as a single source of truth too.
      const activeTheme = (() => {
        try {
          const v = localStorage.getItem("soundTheme");
          return v || soundTheme || "neutral";
        } catch {
          return soundTheme || "neutral";
        }
      })();

      const switchForTheme = (themeName: string) => {
        // returns small modifier object for frequencies/durations
        switch (themeName) {
          case "winter":
            return { detune: 1.05, bright: 1.1, offset: 0 };
          case "spring":
            return { detune: 1.12, bright: 1.25, offset: 0 };
          case "dark":
            return { detune: 0.85, bright: 0.8, offset: -80 };
          default:
            return { detune: 1, bright: 1, offset: 0 };
        }
      };

      const modifiers = switchForTheme(activeTheme);

      const toneWithMods = (
        freq: number,
        duration = 0.08,
        type: OscillatorType = "sine",
        gainVal = 0.08,
      ) => {
        const f = Math.max(
          40,
          Math.round(freq * modifiers.detune) + modifiers.offset,
        );
        const g = Math.min(0.18, gainVal * modifiers.bright);
        playTone(f, duration, type, g);
      };

      switch (t) {
        case "click":
          // short bright click
          toneWithMods(1600, 0.025, "square", 0.06);
          break;
        case "confirm":
          // two-tone confirming sound
          toneWithMods(900, 0.06, "sawtooth", 0.08);
          // small delay for second tone
          setTimeout(() => toneWithMods(1200, 0.08, "sine", 0.06), 70);
          break;
        case "confirm-final":
          // more pronounced final confirmation: quick arpeggio + rising tone
          toneWithMods(700, 0.06, "sawtooth", 0.08);
          setTimeout(() => toneWithMods(900, 0.06, "square", 0.08), 65);
          setTimeout(() => toneWithMods(1400, 0.12, "sine", 0.09), 140);
          break;
        case "nav":
          // lower click for navigation
          toneWithMods(480, 0.05, "sine", 0.06);
          break;
        default:
          toneWithMods(1200, 0.03, "sine", 0.05);
      }
    },
    [ensureContext, playTone, soundTheme],
  );

  useEffect(() => {
    // Global click listener that plays on button clicks or any element with data-sound.
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      // Look for a button or any element annotated with data-sound
      const el = target.closest("button, [data-sound]") as HTMLElement | null;
      if (!el) return;

      const sound = el.dataset.sound as SoundType | undefined;
      if (sound) {
        play(sound);
        return;
      }

      // If it's a button without a data-sound, play default click
      if (el.tagName.toLowerCase() === "button") {
        play("click");
      }
    };

    const options: AddEventListenerOptions = { capture: true };
    document.addEventListener("click", handler, options);
    return () => document.removeEventListener("click", handler, options);
  }, [play]);

  // expose play and a simple setter for sound theme. We persist to localStorage so page reloads keep the choice.
  const setTheme = (t: string) => {
    try {
      localStorage.setItem("soundTheme", t);
    } catch {
      // ignore
    }
    setSoundTheme(t);
  };

  return { play, soundTheme, setSoundTheme: setTheme } as {
    play: (t: SoundType) => void;
    soundTheme: string;
    setSoundTheme: (t: string) => void;
  };
}
