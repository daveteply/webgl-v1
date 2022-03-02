import { Texture } from 'three';

interface BumpData {
  src: string;
  texture?: Texture;
}

export const BumpMaterials: BumpData[] = [
  { src: 'assets/maps/bump/material/bark-1.webp' },
  { src: 'assets/maps/bump/material/bark-2.webp' },
  { src: 'assets/maps/bump/material/brick-1.webp' },
  { src: 'assets/maps/bump/material/brick-2.webp' },
  { src: 'assets/maps/bump/material/concrete-1.webp' },
  { src: 'assets/maps/bump/material/fabric-1.webp' },
  { src: 'assets/maps/bump/material/fabric-2.webp' },
  { src: 'assets/maps/bump/material/fabric-3.webp' },
  { src: 'assets/maps/bump/material/gravel-1.webp' },
  { src: 'assets/maps/bump/material/metal-1.webp' },
  { src: 'assets/maps/bump/material/metal-2.webp' },
  { src: 'assets/maps/bump/material/plastic-1.webp' },
  { src: 'assets/maps/bump/material/rubber-1.webp' },
];

export const BumpSymbols: BumpData[] = [
  { src: 'assets/maps/bump/symbol/box.webp' },
  { src: 'assets/maps/bump/symbol/diamond.webp' },
  { src: 'assets/maps/bump/symbol/dits.webp' },
  { src: 'assets/maps/bump/symbol/flake.webp' },
  { src: 'assets/maps/bump/symbol/plus.webp' },
  { src: 'assets/maps/bump/symbol/sun.webp' },
];

export const EmojiCodes: number[][] = [
  [0x1f600, 0x1f604, 0x1f609, 0x1f60a, 0x1f607, 0x1f923],
  [0x1f637, 0x1f634, 0x1f925, 0x1f970, 0x1f928, 0x1f92b],
  [0x1f917, 0x1f911, 0x1f61d, 0x1f92a, 0x1f60b, 0x1f60f],
  [0x1f975, 0x1f976, 0x1f974, 0x1f92f, 0x1f920, 0x1f978],
];
