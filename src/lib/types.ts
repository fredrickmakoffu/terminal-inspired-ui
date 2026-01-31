export interface Theme {
  name: string;
  season: string;
  colors: {
    primary: string;
    primaryDark: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    border: string;
    text: string;
    textMuted: string;
    success: string;
    terminal: {
      bg: string;
      text: string;
      prompt: string;
    };
  };
}

export interface Particle {
  id: number;
  x: number;
  y: number;
  rotation: number;
  speed: number;
  opacity: number;
  size: number;
  character: string;
  color: string;
}

export interface Command {
  id: string;
  name: string;
  description: string;
  shortcut: string;
  action: () => void;
}

export interface CommandHistory {
  command: string;
  timestamp: Date;
  result: string;
}
