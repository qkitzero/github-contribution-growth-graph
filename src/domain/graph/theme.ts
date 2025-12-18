import { ContributionType } from '../contribution/contribution';

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
  [K in ContributionType]: string;
};

type ThemePreset = {
  background: string;
  typeColors: ContributionTypeColors;
};

export class Theme {
  readonly backgroundColor: string;
  private readonly typeColors: ContributionTypeColors;

  private static readonly PRESET: Record<ThemeName, ThemePreset> = {
    default: {
      background: 'transparent',
      typeColors: {
        commit: '#2da44e',
        issue: '#cf222e',
        pull_request: '#0969da',
        pull_request_review: '#d29922',
      },
    },
    blue: {
      background: 'transparent',
      typeColors: {
        commit: '#1e40af',
        issue: '#3b82f6',
        pull_request: '#60a5fa',
        pull_request_review: '#93c5fd',
      },
    },
    red: {
      background: 'transparent',
      typeColors: {
        commit: '#991b1b',
        issue: '#dc2626',
        pull_request: '#ef4444',
        pull_request_review: '#f87171',
      },
    },
    green: {
      background: 'transparent',
      typeColors: {
        commit: '#166534',
        issue: '#16a34a',
        pull_request: '#22c55e',
        pull_request_review: '#4ade80',
      },
    },
    purple: {
      background: 'transparent',
      typeColors: {
        commit: '#6b21a8',
        issue: '#9333ea',
        pull_request: '#a855f7',
        pull_request_review: '#c084fc',
      },
    },
    orange: {
      background: 'transparent',
      typeColors: {
        commit: '#9a3412',
        issue: '#ea580c',
        pull_request: '#f97316',
        pull_request_review: '#fb923c',
      },
    },
    pink: {
      background: 'transparent',
      typeColors: {
        commit: '#9f1239',
        issue: '#e11d48',
        pull_request: '#f43f5e',
        pull_request_review: '#fb7185',
      },
    },
    dark: {
      background: '#000000',
      typeColors: {
        commit: '#ffffff',
        issue: '#d0d0d0',
        pull_request: '#a0a0a0',
        pull_request_review: '#707070',
      },
    },
    light: {
      background: '#ffffff',
      typeColors: {
        commit: '#000000',
        issue: '#404040',
        pull_request: '#707070',
        pull_request_review: '#a0a0a0',
      },
    },
  } as const;

  constructor(name: string = 'default') {
    const key: ThemeName = name in Theme.PRESET ? (name as ThemeName) : 'default';
    const preset = Theme.PRESET[key];

    this.backgroundColor = preset.background;
    this.typeColors = preset.typeColors;
  }

  getColorForType(type: ContributionType): string {
    return this.typeColors[type] ?? '#999999';
  }
}
