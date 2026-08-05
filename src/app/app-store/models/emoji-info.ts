export interface EmojiInfoSequence {
  desc: string;
  sequence: number[];
  ver: string;
  emojiCode?: string;
}

export interface EmojiInfo {
  group?: string;
  subGroups?: string[];
  emojiList?: EmojiInfoSequence[];
}
