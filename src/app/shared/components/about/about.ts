import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ColorSchemeMeta, EmojiInfo, GameStateStore } from '@rikkle/state';
import { AnalyticsEventType, AnalyticsManagerService } from '../../services/analytics-manager';

@Component({
  selector: 'wgl-about',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {
  private store = inject(GameStateStore);
  private analyticsManager = inject(AnalyticsManagerService);

  levelColors = signal<string[]>([]);
  levelColorScheme = signal<ColorSchemeMeta | undefined>(undefined);
  levelEmojis = signal<EmojiInfo | undefined>(undefined);

  ngOnInit(): void {
    const colors = this.store.levelColors();
    const colorScheme = this.store.levelColorScheme();
    const emojiInfo = this.store.emojiInfo();

    this.levelColors.set(colors);
    this.levelColorScheme.set(colorScheme);
    this.levelEmojis.set(emojiInfo);

    this.analyticsManager.Log(AnalyticsEventType.AboutDialogViewed, {
      colorScheme: colorScheme?.name,
      colorCount: colors?.length ?? 0,
      emojiGroup: emojiInfo?.group,
    });
  }
}
