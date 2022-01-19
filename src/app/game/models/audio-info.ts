export enum AudioType {
  LEVEL_START = 1,
  GAME_PIECE_MOVE,
}

export interface AudioInfo {
  element: HTMLAudioElement;
  audioType: AudioType;
  track?: MediaElementAudioSourceNode;
}
