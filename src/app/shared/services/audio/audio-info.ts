import { Howl } from 'howler';

export enum AudioType {
  LEVEL_START_1 = 1,
  LEVEL_START_2,
  LEVEL_START_3,
  LEVEL_START_4,
  LEVEL_START_5,
  LEVEL_STAT,
  LEVEL_ENABLE_CTA,
  PIECE_MOVE,
  PIECE_MOVE_REMAINING_PANIC,
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
  LEVEL_END_4,
  LEVEL_END_5,
  LEVEL_END_6,
  LEVEL_END_7,
}

export interface AudioInfo {
  url: string;
  audioType: AudioType;
  howl?: Howl;
}

export const AUDIO_LIST: AudioInfo[] = [
  {
    url: 'assets/audio/level-start/s1.mp3',
    audioType: AudioType.LEVEL_START_1,
  },
  {
    url: 'assets/audio/level-start/s2.mp3',
    audioType: AudioType.LEVEL_START_2,
  },
  {
    url: 'assets/audio/level-start/s3.mp3',
    audioType: AudioType.LEVEL_START_3,
  },
  {
    url: 'assets/audio/level-start/s4.mp3',
    audioType: AudioType.LEVEL_START_4,
  },
  {
    url: 'assets/audio/level-start/s5.mp3',
    audioType: AudioType.LEVEL_START_5,
  },

  {
    url: 'assets/audio/level-dialog-stat.mp3',
    audioType: AudioType.LEVEL_STAT,
  },
  {
    url: 'assets/audio/mixkit-arcade-player-select-2036.mp3',
    audioType: AudioType.LEVEL_ENABLE_CTA,
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
    url: 'assets/audio/moves-remaining-panic.mp3',
    audioType: AudioType.PIECE_MOVE_REMAINING_PANIC,
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
    url: 'assets/audio/level-complete/l1.mp3',
    audioType: AudioType.LEVEL_END_1,
  },
  {
    url: 'assets/audio/level-complete/l2.mp3',
    audioType: AudioType.LEVEL_END_2,
  },
  {
    url: 'assets/audio/level-complete/l3.mp3',
    audioType: AudioType.LEVEL_END_3,
  },
  {
    url: 'assets/audio/level-complete/l4.mp3',
    audioType: AudioType.LEVEL_END_4,
  },
  {
    url: 'assets/audio/level-complete/l5.mp3',
    audioType: AudioType.LEVEL_END_5,
  },
  {
    url: 'assets/audio/level-complete/l6.mp3',
    audioType: AudioType.LEVEL_END_6,
  },
  {
    url: 'assets/audio/level-complete/l7.mp3',
    audioType: AudioType.LEVEL_END_7,
  },
];
