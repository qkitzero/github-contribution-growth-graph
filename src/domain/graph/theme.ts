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

type ContributionTypeColors = {
  commit: string;
  issue: string;
  pull_request: string;
  pull_request_review: string;
  repository: string;
};

type ThemePreset = {
  background: string;
  line: string;
  typeColors: ContributionTypeColors;
};

export class Theme {
  readonly backgroundColor: string;
  readonly lineColor: string;
  private readonly typeColors: ContributionTypeColors;

  private static readonly PRESET: Record<ThemeName, ThemePreset> = {
    default: {
      background: 'transparent',
      line: '#4bc0c0',
      typeColors: {
        commit: '#562358',
        issue: '#4f46e5',
        pull_request: '#16a34a',
        pull_request_review: '#f59e0b',
        repository: '#f5380b',
      },
    },
    blue: {
      background: 'transparent',
      line: '#4bc0c0',
      typeColors: {
        commit: '#1e40af',
        issue: '#3b82f6',
        pull_request: '#60a5fa',
        pull_request_review: '#93c5fd',
        repository: '#dbeafe',
      },
    },
    red: {
      background: 'transparent',
      line: '#ff4444',
      typeColors: {
        commit: '#991b1b',
        issue: '#dc2626',
        pull_request: '#ef4444',
        pull_request_review: '#f87171',
        repository: '#fca5a5',
      },
    },
    green: {
      background: 'transparent',
      line: '#36a64f',
      typeColors: {
        commit: '#166534',
        issue: '#16a34a',
        pull_request: '#22c55e',
        pull_request_review: '#4ade80',
        repository: '#86efac',
      },
    },
    purple: {
      background: 'transparent',
      line: '#9966ff',
      typeColors: {
        commit: '#6b21a8',
        issue: '#9333ea',
        pull_request: '#a855f7',
        pull_request_review: '#c084fc',
        repository: '#e9d5ff',
      },
    },
    orange: {
      background: 'transparent',
      line: '#ff9933',
      typeColors: {
        commit: '#9a3412',
        issue: '#ea580c',
        pull_request: '#f97316',
        pull_request_review: '#fb923c',
        repository: '#fdba74',
      },
    },
    pink: {
      background: 'transparent',
      line: '#ff6b9d',
      typeColors: {
        commit: '#9f1239',
        issue: '#e11d48',
        pull_request: '#f43f5e',
        pull_request_review: '#fb7185',
        repository: '#fda4af',
      },
    },
    dark: {
      background: '#1a1a1a',
      line: '#ffffff',
      typeColors: {
        commit: '#a78bfa',
        issue: '#60a5fa',
        pull_request: '#34d399',
        pull_request_review: '#fbbf24',
        repository: '#f87171',
      },
    },
    light: {
      background: '#ffffff',
      line: '#1a1a1a',
      typeColors: {
        commit: '#7c3aed',
        issue: '#2563eb',
        pull_request: '#059669',
        pull_request_review: '#d97706',
        repository: '#dc2626',
      },
    },
  } as const;

  constructor(name: string = 'default') {
    const key: ThemeName = name in Theme.PRESET ? (name as ThemeName) : 'default';
    const preset = Theme.PRESET[key];

    this.backgroundColor = preset.background;
    this.lineColor = preset.line;
    this.typeColors = preset.typeColors;
  }

  getColorForType(type: string): string {
    return this.typeColors[type as keyof ContributionTypeColors] ?? '#999999';
  }
}
