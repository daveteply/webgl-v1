export interface ColorSchemeData {
  id: number;
  name: string;
  emoji: string;
  colors: string[];
}

/**
 * Curated 6-Color Level Schemes with names and emoji badges.
 * Formulated with high perceptual color distance (Delta E) and distinct lightness/hue
 * values to ensure ADA distinguishability under 3D lighting.
 */
export const COLOR_SCHEMES: ColorSchemeData[] = [
  // 1. Signature Glassmorphic Purple / Blue (Level 1 Theme - Skipped / Preserved)
  {
    id: 1,
    name: 'Glassmorphic Purple',
    emoji: '💜',
    colors: ['#0078AB', '#1122BA', '#24005C', '#3C0099', '#66D1FF', '#7482FF'],
  },
  // 2. Sunset Fire
  {
    id: 2,
    name: 'Sunset Fire',
    emoji: '🌅',
    colors: ['#6B0F2B', '#E01E26', '#FF6600', '#FFB800', '#FF9E79', '#FFF3A1'],
  },
  // 3. Deep Ocean Sapphire
  {
    id: 3,
    name: 'Deep Ocean Sapphire',
    emoji: '🌊',
    colors: ['#0A1C42', '#1A56C4', '#009BE8', '#00C9A7', '#8CE2FF', '#E8F8FF'],
  },
  // 4. Emerald Forest
  {
    id: 4,
    name: 'Emerald Forest',
    emoji: '🌲',
    colors: ['#0D3823', '#008A4B', '#72B01D', '#C8963E', '#56E39F', '#D8F8E1'],
  },
  // 5. Cyberpunk Neon
  {
    id: 5,
    name: 'Cyberpunk Neon',
    emoji: '🌆',
    colors: ['#4D0076', '#FF007F', '#FF6B00', '#FFE600', '#10E03C', '#00F0FF'],
  },
  // 6. Royal Jewels
  {
    id: 6,
    name: 'Royal Jewels',
    emoji: '💎',
    colors: ['#3B1459', '#C90838', '#0059B3', '#00A859', '#FFB800', '#F4EFFF'],
  },
  // 7. Autumn Amber
  {
    id: 7,
    name: 'Autumn Amber',
    emoji: '🍂',
    colors: ['#4A1504', '#B81B1B', '#E65C00', '#E6B800', '#5C8A22', '#FBF1D5'],
  },
  // 8. Midnight Berry
  {
    id: 8,
    name: 'Midnight Berry',
    emoji: '🍇',
    colors: ['#1C0F38', '#6A1B6B', '#C4145A', '#9E47D6', '#FF7AB8', '#FFF0F6'],
  },
  // 9. Tropical Citrus
  {
    id: 9,
    name: 'Tropical Citrus',
    emoji: '🍊',
    colors: ['#004D40', '#38B000', '#FFD600', '#FF6D00', '#FF006E', '#00C2D1'],
  },
  // 10. Ice Glacier
  {
    id: 10,
    name: 'Ice Glacier',
    emoji: '🧊',
    colors: ['#071738', '#1A53D8', '#00A3FF', '#00BFA5', '#8EA7FF', '#EAF7FF'],
  },
  // 11. Retro Synthwave
  {
    id: 11,
    name: 'Retro Synthwave',
    emoji: '🕹️',
    colors: ['#23074D', '#6B2DFF', '#F706CF', '#FF5E00', '#FFD000', '#00F5D4'],
  },
  // 12. Pastel Meadow
  {
    id: 12,
    name: 'Pastel Meadow',
    emoji: '🌸',
    colors: ['#FF6B97', '#A875FF', '#4AA3FF', '#2FD499', '#FFD13B', '#FF8E53'],
  },
  // 13. Vintage Gold & Charcoal
  {
    id: 13,
    name: 'Vintage Gold & Charcoal',
    emoji: '👑',
    colors: ['#181818', '#5A6577', '#8C5828', '#D4A017', '#E8CF8A', '#F8F6F0'],
  },
  // 14. Dark Rainbow
  {
    id: 14,
    name: 'Dark Rainbow',
    emoji: '🌈',
    colors: ['#D00028', '#FF6B00', '#FFC700', '#009E49', '#1054E8', '#8E16D4'],
  },
  // 15. Neon Lime & Violet
  {
    id: 15,
    name: 'Neon Lime & Violet',
    emoji: '⚡',
    colors: ['#220042', '#7C1FFF', '#D16BFF', '#1C7300', '#52E800', '#E6FF40'],
  },
  // 16. Cosmic Nebula
  {
    id: 16,
    name: 'Cosmic Nebula',
    emoji: '🌌',
    colors: ['#0C0A26', '#3D28A8', '#E0218A', '#00E5FF', '#FFA3D7', '#F0F4FF'],
  },
  // 17. Volcanic Magma
  {
    id: 17,
    name: 'Volcanic Magma',
    emoji: '🌋',
    colors: ['#1C1919', '#8B1500', '#E83600', '#FF8000', '#FFDA24', '#FFF6E6'],
  },
  // 18. Coral Reef
  {
    id: 18,
    name: 'Coral Reef',
    emoji: '🪸',
    colors: ['#05204A', '#FF4D6D', '#FF7F11', '#00B4D8', '#FFD166', '#EBFBFF'],
  },
  // 19. Desert Dunes
  {
    id: 19,
    name: 'Desert Dunes',
    emoji: '🏜️',
    colors: ['#5C2018', '#BA4A2B', '#E09F3E', '#4F772D', '#38A3A5', '#F9F1DC'],
  },
  // 20. Tokyo Shibuya Lights
  {
    id: 20,
    name: 'Tokyo Shibuya Lights',
    emoji: '🏮',
    colors: ['#1A1D20', '#E6194B', '#FF66B2', '#00D2D3', '#FFD32A', '#EFFFFB'],
  },
];

export const INTRO_DIALOG_COLORS = ['#1919B3', '#E9E9FF', '#400099', '#7B7BFF', '#0F0F6B'];
