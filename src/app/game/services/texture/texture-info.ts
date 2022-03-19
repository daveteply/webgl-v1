import { Texture } from 'three';
import { PowerMoveType } from '../../models/power-move-type';

export interface BumpData {
  src: string;
  texture?: Texture;
}

export interface PowerMoveBumpData extends BumpData {
  moveType: PowerMoveType;
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

export const PowerMoveMaterials: PowerMoveBumpData[] = [
  { src: 'assets/maps/bump/power-move/right.webp', moveType: PowerMoveType.HorizontalRight },
  { src: 'assets/maps/bump/power-move/left.webp', moveType: PowerMoveType.HorizontalLeft },
  { src: 'assets/maps/bump/power-move/right-left.webp', moveType: PowerMoveType.HorizontalMix },
  { src: 'assets/maps/bump/power-move/up.webp', moveType: PowerMoveType.VerticalUp },
  { src: 'assets/maps/bump/power-move/down.webp', moveType: PowerMoveType.VerticalDown },
  { src: 'assets/maps/bump/power-move/up-down.webp', moveType: PowerMoveType.VerticalMix },
];
