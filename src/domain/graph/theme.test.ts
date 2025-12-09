import { Theme } from './theme';

describe('Theme', () => {
  describe('constructor', () => {
    it('should use default theme when no name is provided', () => {
      const theme = new Theme();

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.lineColor).toBe('#4bc0c0');
    });

    it('should use default theme when name is "default"', () => {
      const theme = new Theme('default');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.lineColor).toBe('#4bc0c0');
    });

    it('should use blue theme', () => {
      const theme = new Theme('blue');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.lineColor).toBe('#4bc0c0');
    });

    it('should use red theme', () => {
      const theme = new Theme('red');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.lineColor).toBe('#ff4444');
    });

    it('should use green theme', () => {
      const theme = new Theme('green');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.lineColor).toBe('#36a64f');
    });

    it('should use purple theme', () => {
      const theme = new Theme('purple');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.lineColor).toBe('#9966ff');
    });

    it('should use orange theme', () => {
      const theme = new Theme('orange');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.lineColor).toBe('#ff9933');
    });

    it('should use pink theme', () => {
      const theme = new Theme('pink');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.lineColor).toBe('#ff6b9d');
    });

    it('should use dark theme', () => {
      const theme = new Theme('dark');

      expect(theme.backgroundColor).toBe('#1a1a1a');
      expect(theme.lineColor).toBe('#ffffff');
    });

    it('should use light theme', () => {
      const theme = new Theme('light');

      expect(theme.backgroundColor).toBe('#ffffff');
      expect(theme.lineColor).toBe('#1a1a1a');
    });

    it('should fallback to default theme for invalid theme name', () => {
      const theme = new Theme('invalid-theme');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.lineColor).toBe('#4bc0c0');
    });

    it('should fallback to default theme for empty string', () => {
      const theme = new Theme('');

      expect(theme.backgroundColor).toBe('transparent');
      expect(theme.lineColor).toBe('#4bc0c0');
    });
  });
});
