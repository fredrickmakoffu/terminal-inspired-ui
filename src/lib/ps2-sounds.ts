import { useEffect, useRef, useCallback, useState } from "react";

type SoundAction = "click" | "reveal" | "confirm" | "confirm-final" | "nav";

type ToneSpec = {
  freq: number;
  duration?: number;
  type?: OscillatorType;
  gain?: number;
  delay?: number; // ms delay from action
};

type ActionSpec = {
  tones: ToneSpec[];
};

type SoundThemeSpec = {
  [K in SoundAction]?: ActionSpec;
};

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

  // Default theme specs — each action maps to 0+ tones (sequence)
  const defaultThemes: Record<string, SoundThemeSpec> = {
    neutral: {
      click: {
        tones: [{ freq: 1600, duration: 0.02, type: "square", gain: 0.06 }],
      },
      reveal: {
        tones: [{ freq: 700, duration: 0.06, type: "sine", gain: 0.06 }],
      },
      confirm: {
        tones: [
          { freq: 900, duration: 0.06, type: "sawtooth", gain: 0.08 },
          { freq: 1200, duration: 0.08, type: "sine", gain: 0.06, delay: 70 },
        ],
      },
      "confirm-final": {
        tones: [
          { freq: 700, duration: 0.06, type: "sawtooth", gain: 0.08 },
          { freq: 900, duration: 0.06, type: "square", gain: 0.08, delay: 65 },
          { freq: 1400, duration: 0.12, type: "sine", gain: 0.09, delay: 140 },
        ],
      },
      nav: { tones: [{ freq: 480, duration: 0.05, type: "sine", gain: 0.06 }] },
    },
    spring: {
      click: {
        tones: [{ freq: 1700, duration: 0.02, type: "square", gain: 0.07 }],
      },
      reveal: {
        tones: [{ freq: 900, duration: 0.06, type: "sine", gain: 0.07 }],
      },
      confirm: {
        tones: [
          { freq: 1000, duration: 0.06, type: "sawtooth", gain: 0.09 },
          { freq: 1400, duration: 0.08, type: "sine", gain: 0.07, delay: 70 },
        ],
      },
      "confirm-final": {
        tones: [
          { freq: 800, duration: 0.06, type: "sawtooth", gain: 0.09 },
          { freq: 1100, duration: 0.06, type: "square", gain: 0.09, delay: 65 },
          { freq: 1600, duration: 0.12, type: "sine", gain: 0.1, delay: 140 },
        ],
      },
      nav: { tones: [{ freq: 520, duration: 0.05, type: "sine", gain: 0.06 }] },
    },
    winter: {
      click: {
        tones: [{ freq: 1300, duration: 0.02, type: "triangle", gain: 0.05 }],
      },
      reveal: {
        tones: [{ freq: 650, duration: 0.08, type: "sine", gain: 0.05 }],
      },
      confirm: {
        tones: [
          { freq: 760, duration: 0.07, type: "sawtooth", gain: 0.06 },
          { freq: 980, duration: 0.09, type: "sine", gain: 0.05, delay: 80 },
        ],
      },
      "confirm-final": {
        tones: [
          { freq: 500, duration: 0.08, type: "sawtooth", gain: 0.06 },
          { freq: 720, duration: 0.08, type: "square", gain: 0.07, delay: 80 },
          { freq: 1100, duration: 0.14, type: "sine", gain: 0.08, delay: 170 },
        ],
      },
      nav: { tones: [{ freq: 420, duration: 0.05, type: "sine", gain: 0.05 }] },
    },
    dark: {
      click: {
        tones: [{ freq: 1100, duration: 0.02, type: "square", gain: 0.05 }],
      },
      reveal: {
        tones: [{ freq: 480, duration: 0.06, type: "sine", gain: 0.05 }],
      },
      confirm: {
        tones: [
          { freq: 600, duration: 0.06, type: "sawtooth", gain: 0.06 },
          { freq: 820, duration: 0.08, type: "sine", gain: 0.05, delay: 80 },
        ],
      },
      "confirm-final": {
        tones: [
          { freq: 420, duration: 0.06, type: "sawtooth", gain: 0.06 },
          { freq: 600, duration: 0.06, type: "square", gain: 0.07, delay: 65 },
          { freq: 1000, duration: 0.12, type: "sine", gain: 0.08, delay: 140 },
        ],
      },
      nav: { tones: [{ freq: 380, duration: 0.05, type: "sine", gain: 0.05 }] },
    },
  };

  // Load custom themes from localStorage and merge with defaults
  const loadThemes = (): Record<string, SoundThemeSpec> => {
    try {
      const raw = localStorage.getItem("soundThemes");
      if (!raw) return defaultThemes;
      const parsed = JSON.parse(raw) as Record<string, SoundThemeSpec>;
      return { ...defaultThemes, ...parsed };
    } catch {
      return defaultThemes;
    }
  };

  const themesRef = useRef<Record<string, SoundThemeSpec>>(loadThemes());

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
    (t: SoundAction) => {
      const ctx = ensureContext();
      if (!ctx) return;
      // Resume context if suspended (required by some browsers on first gesture)
      if (ctx.state === "suspended") ctx.resume();

      // Read current theme from ref-like closure. If the consumer updated theme via setSoundTheme,
      // we will try to read the value from localStorage as a single source of truth too.
      // Determine active theme name and spec
      const activeThemeName = (() => {
        try {
          const v = localStorage.getItem("soundTheme");
          return (v as string) || soundTheme || "neutral";
        } catch {
          return soundTheme || "neutral";
        }
      })();

      const themeSpec =
        themesRef.current[activeThemeName] || themesRef.current["neutral"];

      // For backward compatibility map some action names
      const actionKey: SoundAction = ((): SoundAction => {
        if (t === "nav") return "nav";
        return t as SoundAction;
      })();

      const actionSpec = themeSpec[actionKey] || themeSpec["click"];

      if (actionSpec && Array.isArray(actionSpec.tones)) {
        actionSpec.tones.forEach((tone) => {
          const d = tone.delay || 0;
          setTimeout(() => {
            playTone(
              tone.freq,
              tone.duration ?? 0.08,
              tone.type ?? "sine",
              tone.gain ?? 0.08,
            );
          }, d);
        });
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

      const sound = el.dataset.sound as string | undefined as
        | SoundAction
        | undefined;
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

  return {
    play,
    soundTheme,
    setSoundTheme: setTheme,
    getThemes: () => themesRef.current,
    setThemeSpec: (name: string, spec: SoundThemeSpec) => {
      themesRef.current[name] = spec;
      try {
        // persist only custom themes (merge defaults omitted for simplicity)
        const save = { ...themesRef.current };
        localStorage.setItem("soundThemes", JSON.stringify(save));
      } catch {
        // ignore
      }
    },
  } as {
    play: (t: SoundAction) => void;
    soundTheme: string;
    setSoundTheme: (t: string) => void;
    getThemes: () => Record<string, SoundThemeSpec>;
    setThemeSpec: (name: string, spec: SoundThemeSpec) => void;
  };
}
