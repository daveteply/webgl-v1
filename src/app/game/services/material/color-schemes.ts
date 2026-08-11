export interface ColorSchemeData {
  id: number;
  name: string;
  emoji: string;
  colors: string[];
}

/**
 * 15 Curated 8-Color Level Schemes with names and emoji badges.
 */
export const COLOR_SCHEMES: ColorSchemeData[] = [
  // 1. Signature Glassmorphic Purple / Blue (Level 1 Theme)
  {
    id: 1,
    name: 'Glassmorphic Purple',
    emoji: '💜',
    colors: ['#0078AB', '#1122BA', '#24005C', '#3C0099', '#66D1FF', '#7482FF', '#A266FF', '#E6F7FF'],
  },
  // 2. Sunset Fire
  {
    id: 2,
    name: 'Sunset Fire',
    emoji: '🌅',
    colors: ['#4A000B', '#991100', '#E63900', '#FF7700', '#FFB800', '#FFF2D6', '#800040', '#E60073'],
  },
  // 3. Deep Ocean Sapphire
  {
    id: 3,
    name: 'Deep Ocean Sapphire',
    emoji: '🌊',
    colors: ['#001D3D', '#003566', '#0077B6', '#00B4D8', '#90E0EF', '#03045E', '#48CAE4', '#CAF0F8'],
  },
  // 4. Emerald Forest
  {
    id: 4,
    name: 'Emerald Forest',
    emoji: '🌲',
    colors: ['#0B2B1B', '#1B4931', '#2D6A4F', '#40916C', '#52B788', '#74C69D', '#B7E4C7', '#D8F3DC'],
  },
  // 5. Cyberpunk Neon
  {
    id: 5,
    name: 'Cyberpunk Neon',
    emoji: '🌆',
    colors: ['#2B0038', '#6A007A', '#B500D6', '#FF007F', '#00F0FF', '#0099FF', '#FFE600', '#FFFFFF'],
  },
  // 6. Royal Jewels
  {
    id: 6,
    name: 'Royal Jewels',
    emoji: '💎',
    colors: ['#3A0007', '#800020', '#124029', '#0F2C59', '#701460', '#D4AF37', '#E5C158', '#F4E8C1'],
  },
  // 7. Autumn Amber
  {
    id: 7,
    name: 'Autumn Amber',
    emoji: '🍂',
    colors: ['#361700', '#6B2D00', '#A04300', '#D95D00', '#F28500', '#FFB347', '#556B2F', '#8B9A46'],
  },
  // 8. Midnight Berry
  {
    id: 8,
    name: 'Midnight Berry',
    emoji: '🍇',
    colors: ['#190B28', '#381652', '#5C1D73', '#8C1D82', '#BE267D', '#E65C9C', '#FFA8D3', '#FFF0F5'],
  },
  // 9. Tropical Citrus
  {
    id: 9,
    name: 'Tropical Citrus',
    emoji: '🍊',
    colors: ['#004D40', '#00897B', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FF9800', '#FF5722'],
  },
  // 10. Ice Glacier
  {
    id: 10,
    name: 'Ice Glacier',
    emoji: '🧊',
    colors: ['#0A192F', '#112240', '#1E3A8A', '#2563EB', '#60A5FA', '#93C5FD', '#BFDBFE', '#E0F2FE'],
  },
  // 11. Retro Synthwave
  {
    id: 11,
    name: 'Retro Synthwave',
    emoji: '🕹️',
    colors: ['#1A002C', '#3D0066', '#700099', '#B800E6', '#FF00AA', '#FF6600', '#FFCC00', '#00FFFF'],
  },
  // 12. Pastel Meadow
  {
    id: 12,
    name: 'Pastel Meadow',
    emoji: '🌸',
    colors: ['#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA', '#F6E6E8', '#D4F0F0', '#FCF6BD'],
  },
  // 13. Vintage Gold & Charcoal
  {
    id: 13,
    name: 'Vintage Gold & Charcoal',
    emoji: '👑',
    colors: ['#1A1A1A', '#333333', '#4D4D4D', '#8C7853', '#C5A059', '#E5C158', '#F5E6AD', '#FFFFFF'],
  },
  // 14. Dark Rainbow
  {
    id: 14,
    name: 'Dark Rainbow',
    emoji: '🌈',
    colors: ['#800000', '#804000', '#808000', '#008020', '#006080', '#000080', '#500080', '#800050'],
  },
  // 15. Neon Lime & Violet
  {
    id: 15,
    name: 'Neon Lime & Violet',
    emoji: '⚡',
    colors: ['#12002B', '#2E0066', '#5900B3', '#8C00FF', '#76FF03', '#AEEA00', '#CCFF90', '#F4FF81'],
  },
];

export const INTRO_DIALOG_COLORS = ['#1919B3', '#E9E9FF', '#400099', '#7B7BFF', '#0F0F6B'];
