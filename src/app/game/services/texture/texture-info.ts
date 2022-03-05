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
