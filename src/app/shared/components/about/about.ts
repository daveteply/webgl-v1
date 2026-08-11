import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { EmojiInfo } from '../../../app-store/models/emoji-info';
import { StoreService } from '../../../app-store/services/store.service';

@Component({
  selector: 'wgl-about',
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './about.html',
  styleUrl: './about.scss',
})
export class About implements OnInit {
  private store = inject(StoreService);

  levelColors = signal<string[]>([]);
  levelEmojis = signal<EmojiInfo | undefined>(undefined);

  ngOnInit(): void {
    this.levelColors.set(this.store.LevelColors);
    this.levelEmojis.set(this.store.EmojiInfo);
  }
}

export { About as AboutDialogComponent, About as AboutDialog };
