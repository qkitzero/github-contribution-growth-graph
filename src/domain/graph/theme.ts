import { CONTRIBUTION_TYPES, ContributionType } from '../contribution/contribution';

type ContributionTypeColors = Record<ContributionType, string>;

const createTypeColors = (colors: Record<ContributionType, string>): ContributionTypeColors =>
  colors;

type ThemePreset = {
  background: string;
  typeColors: ContributionTypeColors;
};

const THEME_PRESETS = {
  default: {
    background: 'transparent',
    typeColors: createTypeColors({
      [CONTRIBUTION_TYPES.COMMIT]: '#2da44e',
      [CONTRIBUTION_TYPES.ISSUE]: '#cf222e',
      [CONTRIBUTION_TYPES.PR]: '#0969da',
      [CONTRIBUTION_TYPES.REVIEW]: '#d29922',
    }),
  },
  blue: {
    background: 'transparent',
    typeColors: createTypeColors({
      [CONTRIBUTION_TYPES.COMMIT]: '#1e40af',
      [CONTRIBUTION_TYPES.ISSUE]: '#3b82f6',
      [CONTRIBUTION_TYPES.PR]: '#60a5fa',
      [CONTRIBUTION_TYPES.REVIEW]: '#93c5fd',
    }),
  },
  red: {
    background: 'transparent',
    typeColors: createTypeColors({
      [CONTRIBUTION_TYPES.COMMIT]: '#991b1b',
      [CONTRIBUTION_TYPES.ISSUE]: '#dc2626',
      [CONTRIBUTION_TYPES.PR]: '#ef4444',
      [CONTRIBUTION_TYPES.REVIEW]: '#f87171',
    }),
  },
  green: {
    background: 'transparent',
    typeColors: createTypeColors({
      [CONTRIBUTION_TYPES.COMMIT]: '#166534',
      [CONTRIBUTION_TYPES.ISSUE]: '#16a34a',
      [CONTRIBUTION_TYPES.PR]: '#22c55e',
      [CONTRIBUTION_TYPES.REVIEW]: '#4ade80',
    }),
  },
  purple: {
    background: 'transparent',
    typeColors: createTypeColors({
      [CONTRIBUTION_TYPES.COMMIT]: '#6b21a8',
      [CONTRIBUTION_TYPES.ISSUE]: '#9333ea',
      [CONTRIBUTION_TYPES.PR]: '#a855f7',
      [CONTRIBUTION_TYPES.REVIEW]: '#c084fc',
    }),
  },
  orange: {
    background: 'transparent',
    typeColors: createTypeColors({
      [CONTRIBUTION_TYPES.COMMIT]: '#9a3412',
      [CONTRIBUTION_TYPES.ISSUE]: '#ea580c',
      [CONTRIBUTION_TYPES.PR]: '#f97316',
      [CONTRIBUTION_TYPES.REVIEW]: '#fb923c',
    }),
  },
  pink: {
    background: 'transparent',
    typeColors: createTypeColors({
      [CONTRIBUTION_TYPES.COMMIT]: '#9f1239',
      [CONTRIBUTION_TYPES.ISSUE]: '#e11d48',
      [CONTRIBUTION_TYPES.PR]: '#f43f5e',
      [CONTRIBUTION_TYPES.REVIEW]: '#fb7185',
    }),
  },
  dark: {
    background: '#000000',
    typeColors: createTypeColors({
      [CONTRIBUTION_TYPES.COMMIT]: '#ffffff',
      [CONTRIBUTION_TYPES.ISSUE]: '#d0d0d0',
      [CONTRIBUTION_TYPES.PR]: '#a0a0a0',
      [CONTRIBUTION_TYPES.REVIEW]: '#707070',
    }),
  },
  light: {
    background: '#ffffff',
    typeColors: createTypeColors({
      [CONTRIBUTION_TYPES.COMMIT]: '#000000',
      [CONTRIBUTION_TYPES.ISSUE]: '#404040',
      [CONTRIBUTION_TYPES.PR]: '#707070',
      [CONTRIBUTION_TYPES.REVIEW]: '#a0a0a0',
    }),
  },
} as const satisfies Record<string, ThemePreset>;

type ThemeName = keyof typeof THEME_PRESETS;

export class Theme {
  readonly backgroundColor: string;
  private readonly typeColors: ContributionTypeColors;

  constructor(name: string = 'default') {
    const key: ThemeName = name in THEME_PRESETS ? (name as ThemeName) : 'default';
    const preset = THEME_PRESETS[key];

    this.backgroundColor = preset.background;
    this.typeColors = preset.typeColors;
  }

  getColorForType(type: ContributionType): string {
    return this.typeColors[type] ?? '#999999';
  }
}
