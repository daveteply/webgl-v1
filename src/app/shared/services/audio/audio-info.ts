import { Howl } from 'howler';

export enum AudioType {
  LEVEL_START_1 = 1,
  LEVEL_START_2,
  LEVEL_START_3,
  LEVEL_START_4,
  LEVEL_START_5,
  PIECE_MOVE,
  PIECE_NON_MOVE,
  PIECE_REMOVE,
  PIECE_REMOVE_2,
  PIECE_SELECT,
  MATCH_FAIL,
  MATCH_LONG,
  POWER_MOVE_APPEAR,
  POWER_MOVE_USE,
  GAME_OVER,
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
    url: 'assets/audio/level-start/mixkit-slow-tape-rewind-cinematic-transition-1089.mp3',
    audioType: AudioType.LEVEL_START_1,
  },
  {
    url: 'assets/audio/level-start/mixkit-cinematic-laser-gun-thunder-1287.mp3',
    audioType: AudioType.LEVEL_START_2,
  },
  {
    url: 'assets/audio/level-start/mixkit-epic-movie-trailer-whoosh-impact-2918.mp3',
    audioType: AudioType.LEVEL_START_3,
  },
  {
    url: 'assets/audio/level-start/mixkit-epic-movie-transition-2904.mp3',
    audioType: AudioType.LEVEL_START_4,
  },
  {
    url: 'assets/audio/level-start/mixkit-futuristic-machine-starting-2689.mp3',
    audioType: AudioType.LEVEL_START_5,
  },

  {
    url: 'assets/audio/piece-move.mp3',
    audioType: AudioType.PIECE_MOVE,
  },
  {
    url: 'assets/audio/piece-non-move.mp3',
    audioType: AudioType.PIECE_NON_MOVE,
  },

  {
    url: 'assets/audio/piece-remove.mp3',
    audioType: AudioType.PIECE_REMOVE,
  },
  {
    url: 'assets/audio/piece-remove-2.mp3',
    audioType: AudioType.PIECE_REMOVE_2,
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
    url: 'assets/audio/long-match.mp3',
    audioType: AudioType.MATCH_LONG,
  },
  {
    url: 'assets/audio/power-move-appear.mp3',
    audioType: AudioType.POWER_MOVE_APPEAR,
  },
  {
    url: 'assets/audio/power-move-use.mp3',
    audioType: AudioType.POWER_MOVE_USE,
  },
  {
    url: 'assets/audio/game-over.mp3',
    audioType: AudioType.GAME_OVER,
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
