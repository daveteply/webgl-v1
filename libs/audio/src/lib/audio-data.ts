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
  SPEED_BONUS,
  COMBO_BONUS,
  POWER_MOVE_APPEAR,
  POWER_MOVE_USE,
  POWER_MOVE_BOMB,
  GAME_OVER,
  GRAVITY_EFFECT,
  PERFECT_MATCH,
  HORIZONTAL_TURN,
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
}

export const BACKGROUND_MUSIC_AUDIO_LIST: AudioInfo[] = [
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

export const GAME_SFX_AUDIO_LIST: AudioInfo[] = [
  {
    url: 'assets/audio/sfx/level-dialog-stat.mp3',
    audioType: AudioType.LEVEL_STAT,
  },
  {
    url: 'assets/audio/sfx/player-select.mp3',
    audioType: AudioType.LEVEL_ENABLE_CTA,
  },
  {
    url: 'assets/audio/sfx/piece-move.mp3',
    audioType: AudioType.PIECE_MOVE,
  },
  {
    url: 'assets/audio/sfx/piece-non-move.mp3',
    audioType: AudioType.PIECE_NON_MOVE,
  },
  {
    url: 'assets/audio/sfx/moves-remaining-panic.mp3',
    audioType: AudioType.PIECE_MOVE_REMAINING_PANIC,
  },
  {
    url: 'assets/audio/sfx/piece-remove.mp3',
    audioType: AudioType.PIECE_REMOVE,
  },
  {
    url: 'assets/audio/sfx/piece-remove-2.mp3',
    audioType: AudioType.PIECE_REMOVE_2,
  },
  {
    url: 'assets/audio/sfx/piece-select.mp3',
    audioType: AudioType.PIECE_SELECT,
  },
  {
    url: 'assets/audio/sfx/match-fail.mp3',
    audioType: AudioType.MATCH_FAIL,
  },
  {
    url: 'assets/audio/sfx/long-match.mp3',
    audioType: AudioType.MATCH_LONG,
  },
  {
    url: 'assets/audio/sfx/speed-bonus.mp3',
    audioType: AudioType.SPEED_BONUS,
  },
  {
    url: 'assets/audio/sfx/combo-bonus.mp3',
    audioType: AudioType.COMBO_BONUS,
  },
  {
    url: 'assets/audio/sfx/power-move-appear.mp3',
    audioType: AudioType.POWER_MOVE_APPEAR,
  },
  {
    url: 'assets/audio/sfx/power-move-use.mp3',
    audioType: AudioType.POWER_MOVE_USE,
  },
  {
    url: 'assets/audio/sfx/power-move-bomb.mp3',
    audioType: AudioType.POWER_MOVE_BOMB,
  },
  {
    url: 'assets/audio/sfx/game-over.mp3',
    audioType: AudioType.GAME_OVER,
  },
  {
    url: 'assets/audio/sfx/gravity-effect.mp3',
    audioType: AudioType.GRAVITY_EFFECT,
  },
  {
    url: 'assets/audio/sfx/perfect-match.mp3',
    audioType: AudioType.PERFECT_MATCH,
  },
  {
    url: 'assets/audio/sfx/horizontal-turn.mp3',
    audioType: AudioType.HORIZONTAL_TURN,
  },
];

export const AUDIO_LIST: AudioInfo[] = [...BACKGROUND_MUSIC_AUDIO_LIST, ...GAME_SFX_AUDIO_LIST];

export const BACKGROUND_MUSIC_AUDIO_TYPES = new Set<AudioType>(
  BACKGROUND_MUSIC_AUDIO_LIST.map((info) => info.audioType),
);
