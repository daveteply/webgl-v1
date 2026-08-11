import { Injectable, signal } from '@angular/core';
import { EmojiInfo, EmojiInfoSequence } from '../models/emoji-info';

export interface ColorSchemeMeta {
  name?: string;
  emoji?: string;
  colors: string[];
}

@Injectable({
  providedIn: 'root',
})
export class StoreService {
  readonly levelColors = signal<string[]>([]);
  readonly levelColorScheme = signal<ColorSchemeMeta | undefined>(undefined);
  readonly emojiInfo = signal<EmojiInfo>({});

  get LevelColors(): string[] {
    return this.levelColors();
  }

  get LevelColorScheme(): ColorSchemeMeta | undefined {
    return this.levelColorScheme();
  }

  public UpdateLevelColors(colorList: string[], meta?: { name?: string; emoji?: string }): void {
    this.resetAll();
    this.levelColors.set(colorList);
    this.levelColorScheme.set({
      colors: colorList,
      name: meta?.name,
      emoji: meta?.emoji,
    });
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
    this.levelColorScheme.set(undefined);
  }
}
