import { Injectable, signal } from '@angular/core';
import { EmojiInfo, EmojiInfoSequence } from '../models/emoji-info';

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  readonly levelColors = signal<string[]>([]);
  readonly emojiInfo = signal<EmojiInfo>({});

  get LevelColors(): string[] {
    return this.levelColors();
  }

  public UpdateLevelColors(colorList: string[]): void {
    this.resetAll();
    this.levelColors.set(colorList);
  }

  get EmojiInfo(): EmojiInfo {
    return this.emojiInfo();
  }

  public UpdateEmojiGroup(group: string): void {
    this.resetAll();
    this.emojiInfo.update((info) => ({ ...info, group }));
  }

  public UpdateEmojiSubGroups(groups: string[]): void {
    this.emojiInfo.update((info) => ({ ...info, subGroups: groups }));
  }

  public UpdateEmojiList(list: EmojiInfoSequence[]): void {
    const updatedList = list.map((e) => ({
      ...e,
      emojiCode: String.fromCodePoint(...e.sequence),
    }));
    this.emojiInfo.update((info) => ({ ...info, emojiList: updatedList }));
  }

  private resetAll(): void {
    this.emojiInfo.set({});
    this.levelColors.set([]);
  }
}
