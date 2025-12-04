type SizeName = 'small' | 'medium' | 'large';

type SizePreset = {
  width: number;
  height: number;
};

export class Size {
  readonly width: number;
  readonly height: number;

  private static readonly PRESET: Record<SizeName, SizePreset> = {
    small: { width: 600, height: 300 },
    medium: { width: 800, height: 400 },
    large: { width: 1000, height: 500 },
  } as const;

  constructor(name: string = 'medium') {
    const preset = Size.PRESET[name as keyof typeof Size.PRESET] ?? Size.PRESET.medium;

    this.width = preset.width;
    this.height = preset.height;
  }
}
