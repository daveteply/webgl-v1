import { Injectable } from '@angular/core';
import { EmojiInfo, EmojiInfoSequence } from '../models/emoji-info';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  private _levelColors!: string[];
  get LevelColors(): string[] {
    return this._levelColors;
  }
  public UpdateLevelColors(colorList: string[]): void {
    this.resetAll();
    this._levelColors = colorList;
  }

  private _emojiInfo: EmojiInfo;
  get EmojiInfo(): EmojiInfo {
    return this._emojiInfo;
  }

  public UpdateEmojiGroup(group: string): void {
    this.resetAll();
    this._emojiInfo.group = group;
  }

  public UpdateEmojiSubGroups(groups: string[]): void {
    this._emojiInfo.subGroups = groups;
  }

  public UpdateEmojiList(list: EmojiInfoSequence[]): void {
    this._emojiInfo.emojiList = list;
    this._emojiInfo.emojiList.forEach((e) => (e.emojiCode = String.fromCodePoint(...e.sequence)));
  }

  constructor() {
    this._emojiInfo = {};
  }

  private resetAll(): void {
    this._emojiInfo = {};
    this._levelColors = [];
  }
}
