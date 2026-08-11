import { describe, it, expect } from 'vitest';
import { COLOR_SCHEMES, INTRO_DIALOG_COLORS } from './color-schemes';

describe('Curated Color Schemes', () => {
  it('should have 15 curated color schemes', () => {
    expect(COLOR_SCHEMES.length).toBe(15);
  });

  it('should ensure each color scheme contains exactly 8 valid hex colors', () => {
    COLOR_SCHEMES.forEach((scheme) => {
      expect(scheme.name).toBeTruthy();
      expect(scheme.emoji).toBeTruthy();
      expect(scheme.colors.length).toBe(8);
      scheme.colors.forEach((hex) => {
        expect(hex).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  it('should contain unique hex colors within each 8-color scheme', () => {
    COLOR_SCHEMES.forEach((scheme) => {
      const uniqueColors = new Set(scheme.colors);
      expect(uniqueColors.size).toBe(8);
    });
  });

  it('should have valid intro dialog colors', () => {
    expect(INTRO_DIALOG_COLORS.length).toBeGreaterThan(0);
    INTRO_DIALOG_COLORS.forEach((hex) => {
      expect(hex).toMatch(/^#[0-9a-fA-F]{6}$/);
    });
  });
});
