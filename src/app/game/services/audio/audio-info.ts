import { Howl } from 'howler';

export enum AudioType {
  LEVEL_START_1 = 1,
  LEVEL_START_2,
  LEVEL_START_3,
  LEVEL_START_4,
  PIECE_MOVE,
  PIECE_REMOVE,
  PIECE_SELECT,
  MATCH_FAIL,
  LEVEL_END_1,
  LEVEL_END_2,
  LEVEL_END_3,
}

export interface AudioInfo {
  url: string;
  audioType: AudioType;
  howl?: Howl;
}

const pieceMoveSrc = 'assets/audio/piece-move.mp3';
const pieceSelectSrc = 'assets/audio/piece-select.mp3';
const matchFailSrc = 'assets/audio/match-fail.mp3';

// some of these are pre-loaded
export const AUDIO_LIST: AudioInfo[] = [
  {
    url: 'assets/audio/intro-01.mp3',
    audioType: AudioType.LEVEL_START_1,
  },
  {
    url: 'assets/audio/intro-02.mp3',
    audioType: AudioType.LEVEL_START_2,
  },
  {
    url: 'assets/audio/intro-03.mp3',
    audioType: AudioType.LEVEL_START_3,
  },
  {
    url: 'assets/audio/intro-04.mp3',
    audioType: AudioType.LEVEL_START_4,
  },
  {
    url: pieceMoveSrc,
    howl: new Howl({ src: pieceMoveSrc }),
    audioType: AudioType.PIECE_MOVE,
  },
  {
    url: 'assets/audio/piece-remove.mp3',
    audioType: AudioType.PIECE_REMOVE,
  },
  {
    url: pieceSelectSrc,
    howl: new Howl({ src: pieceSelectSrc }),
    audioType: AudioType.PIECE_SELECT,
  },
  {
    url: matchFailSrc,
    howl: new Howl({ src: matchFailSrc }),
    audioType: AudioType.MATCH_FAIL,
  },
  {
    url: 'assets/audio/level-complete/Assassins.mp3',
    audioType: AudioType.LEVEL_END_1,
  },
  {
    url: 'assets/audio/level-complete/Essence.mp3',
    audioType: AudioType.LEVEL_END_2,
  },
  {
    url: 'assets/audio/level-complete/Sk8board.mp3',
    audioType: AudioType.LEVEL_END_3,
  },
];
