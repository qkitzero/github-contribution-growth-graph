import { Theme } from './theme';

describe('Theme', () => {
  describe('constructor', () => {
    it('should use default theme when no name is provided', () => {
      const theme = new Theme();

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.getColorForType('commit')).toBe('#2da44e');
      expect(theme.getColorForType('issue')).toBe('#cf222e');
      expect(theme.getColorForType('pr')).toBe('#0969da');
      expect(theme.getColorForType('review')).toBe('#d29922');
    });

    it('should use default theme when name is "default"', () => {
      const theme = new Theme('default');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.getColorForType('commit')).toBe('#2da44e');
      expect(theme.getColorForType('issue')).toBe('#cf222e');
      expect(theme.getColorForType('pr')).toBe('#0969da');
      expect(theme.getColorForType('review')).toBe('#d29922');
    });

    it('should use blue theme', () => {
      const theme = new Theme('blue');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.getColorForType('commit')).toBe('#1e40af');
      expect(theme.getColorForType('issue')).toBe('#3b82f6');
      expect(theme.getColorForType('pr')).toBe('#60a5fa');
      expect(theme.getColorForType('review')).toBe('#93c5fd');
    });

    it('should use red theme', () => {
      const theme = new Theme('red');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.getColorForType('commit')).toBe('#991b1b');
      expect(theme.getColorForType('issue')).toBe('#dc2626');
      expect(theme.getColorForType('pr')).toBe('#ef4444');
      expect(theme.getColorForType('review')).toBe('#f87171');
    });

    it('should use green theme', () => {
      const theme = new Theme('green');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.getColorForType('commit')).toBe('#166534');
      expect(theme.getColorForType('issue')).toBe('#16a34a');
      expect(theme.getColorForType('pr')).toBe('#22c55e');
      expect(theme.getColorForType('review')).toBe('#4ade80');
    });

    it('should use purple theme', () => {
      const theme = new Theme('purple');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.getColorForType('commit')).toBe('#6b21a8');
      expect(theme.getColorForType('issue')).toBe('#9333ea');
      expect(theme.getColorForType('pr')).toBe('#a855f7');
      expect(theme.getColorForType('review')).toBe('#c084fc');
    });

    it('should use orange theme', () => {
      const theme = new Theme('orange');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.getColorForType('commit')).toBe('#9a3412');
      expect(theme.getColorForType('issue')).toBe('#ea580c');
      expect(theme.getColorForType('pr')).toBe('#f97316');
      expect(theme.getColorForType('review')).toBe('#fb923c');
    });

    it('should use pink theme', () => {
      const theme = new Theme('pink');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.getColorForType('commit')).toBe('#9f1239');
      expect(theme.getColorForType('issue')).toBe('#e11d48');
      expect(theme.getColorForType('pr')).toBe('#f43f5e');
      expect(theme.getColorForType('review')).toBe('#fb7185');
    });

    it('should use dark theme', () => {
      const theme = new Theme('dark');

      expect(theme.backgroundColor).toBe('#000000');
      expect(theme.getColorForType('commit')).toBe('#ffffff');
      expect(theme.getColorForType('issue')).toBe('#d0d0d0');
      expect(theme.getColorForType('pr')).toBe('#a0a0a0');
      expect(theme.getColorForType('review')).toBe('#707070');
    });

    it('should use light theme', () => {
      const theme = new Theme('light');

      expect(theme.backgroundColor).toBe('#ffffff');
      expect(theme.getColorForType('commit')).toBe('#000000');
      expect(theme.getColorForType('issue')).toBe('#404040');
      expect(theme.getColorForType('pr')).toBe('#707070');
      expect(theme.getColorForType('review')).toBe('#a0a0a0');
    });

    it('should fallback to default theme for invalid theme name', () => {
      const theme = new Theme('invalid-theme');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.getColorForType('commit')).toBe('#2da44e');
      expect(theme.getColorForType('issue')).toBe('#cf222e');
      expect(theme.getColorForType('pr')).toBe('#0969da');
      expect(theme.getColorForType('review')).toBe('#d29922');
    });

    it('should fallback to default theme for empty string', () => {
      const theme = new Theme('');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.getColorForType('commit')).toBe('#2da44e');
      expect(theme.getColorForType('issue')).toBe('#cf222e');
      expect(theme.getColorForType('pr')).toBe('#0969da');
      expect(theme.getColorForType('review')).toBe('#d29922');
    });
  });
});
