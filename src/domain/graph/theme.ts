type ThemeName =
  | 'default'
  | 'blue'
  | 'red'
  | 'green'
  | 'purple'
  | 'orange'
  | 'pink'
  | 'dark'
  | 'light';

type ThemePreset = {
  background: string;
  line: string;
};

export class Theme {
  readonly backgroundColor: string;
  readonly lineColor: string;

  private static readonly PRESET: Record<ThemeName, ThemePreset> = {
    default: { background: 'transparent', line: '#4bc0c0ff' },
    blue: { background: 'transparent', line: '#4bc0c0ff' },
    red: { background: 'transparent', line: '#ff4444ff' },
    green: { background: 'transparent', line: '#36a64fff' },
    purple: { background: 'transparent', line: '#9966ffff' },
    orange: { background: 'transparent', line: '#ff9933ff' },
    pink: { background: 'transparent', line: '#ff6b9dff' },
    dark: { background: '#1a1a1a', line: '#ffffff' },
    light: { background: '#ffffff', line: '#1a1a1a' },
  } as const;

  constructor(name: string = 'default') {
    const key: ThemeName = name in Theme.PRESET ? (name as ThemeName) : 'default';
    const preset = Theme.PRESET[key];

    this.backgroundColor = preset.background;
    this.lineColor = preset.line;
  }
}
