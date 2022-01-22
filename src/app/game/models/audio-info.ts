import { Howl } from 'howler';

export enum AudioType {
  LEVEL_START_1 = 1,
  LEVEL_START_2,
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
    url: 'assets/audio/piece-move.mp3',
    audioType: AudioType.PIECE_MOVE,
  },
  {
    url: 'assets/audio/piece-remove.mp3',
    audioType: AudioType.PIECE_REMOVE,
  },
  {
    url: 'assets/audio/piece-select.mp3',
    audioType: AudioType.PIECE_SELECT,
  },
  {
    url: 'assets/audio/match-fail.mp3',
    audioType: AudioType.MATCH_FAIL,
  },
  {
    url: 'assets/audio/level-complete/Assasins.mp3',
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
