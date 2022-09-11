import { Texture } from 'three';
import { PowerMoveType } from '../../models/power-move-type';

export interface BumpData {
  id: string;
  src: string;
  texture?: Texture;
}

export interface PowerMoveBumpData extends BumpData {
  moveType: PowerMoveType;
}

export const BumpTextures: BumpData[] = [
  { id: 'T01', src: 'assets/maps/material/bark-1.webp' },
  { id: 'T02', src: 'assets/maps/material/bark-2.webp' },
  { id: 'T03', src: 'assets/maps/material/brick-1.webp' },
  { id: 'T04', src: 'assets/maps/material/brick-2.webp' },
  { id: 'T05', src: 'assets/maps/material/concrete-1.webp' },
  { id: 'T06', src: 'assets/maps/material/fabric-1.webp' },
  { id: 'T07', src: 'assets/maps/material/fabric-2.webp' },
  { id: 'T08', src: 'assets/maps/material/fabric-3.webp' },
  { id: 'T09', src: 'assets/maps/material/gravel-1.webp' },
  { id: 'T10', src: 'assets/maps/material/metal-1.webp' },
  { id: 'T11', src: 'assets/maps/material/metal-2.webp' },
  { id: 'T12', src: 'assets/maps/material/plastic-1.webp' },
  { id: 'T13', src: 'assets/maps/material/rubber-1.webp' },
];

export const BumpSymbolTextures: BumpData[] = [
  { id: 'BS01', src: 'assets/maps/symbol/box.webp' },
  { id: 'BS02', src: 'assets/maps/symbol/diamond.webp' },
  { id: 'BS03', src: 'assets/maps/symbol/dits.webp' },
  { id: 'BS04', src: 'assets/maps/symbol/flake.webp' },
  { id: 'BS05', src: 'assets/maps/symbol/plus.webp' },
  { id: 'BS06', src: 'assets/maps/symbol/sun.webp' },
  { id: 'BS07', src: 'assets/maps/symbol/001.webp' },
  { id: 'BS08', src: 'assets/maps/symbol/002.webp' },
  { id: 'BS09', src: 'assets/maps/symbol/003.webp' },
  { id: 'BS10', src: 'assets/maps/symbol/004.webp' },
  { id: 'BS11', src: 'assets/maps/symbol/005.webp' },
  { id: 'BS12', src: 'assets/maps/symbol/006.webp' },
  { id: 'BS13', src: 'assets/maps/symbol/007.webp' },
  { id: 'BS14', src: 'assets/maps/symbol/008.webp' },
];

export const PowerMoveTextures: PowerMoveBumpData[] = [
  { id: 'PM01', src: 'assets/maps/power-move/right.webp', moveType: PowerMoveType.HorizontalRight },
  { id: 'PM02', src: 'assets/maps/power-move/left.webp', moveType: PowerMoveType.HorizontalLeft },
  { id: 'PM03', src: 'assets/maps/power-move/right-left.webp', moveType: PowerMoveType.HorizontalMix },
  { id: 'PM04', src: 'assets/maps/power-move/up.webp', moveType: PowerMoveType.VerticalUp },
  { id: 'PM05', src: 'assets/maps/power-move/down.webp', moveType: PowerMoveType.VerticalDown },
  { id: 'PM06', src: 'assets/maps/power-move/up-down.webp', moveType: PowerMoveType.VerticalMix },
];
