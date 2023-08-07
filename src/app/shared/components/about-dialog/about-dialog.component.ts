import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { EmojiInfo } from 'src/app/app-store/models/emoji-info';
import { StoreService } from 'src/app/app-store/services/store.service';

@Component({
  selector: 'wgl-about-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule],
  templateUrl: './about-dialog.component.html',
  styleUrls: ['./about-dialog.component.scss'],
})
export class AboutDialogComponent implements OnInit {
  levelColors!: string[];
  levelEmojis!: EmojiInfo;

  constructor(private store: StoreService) {}

  ngOnInit(): void {
    this.levelColors = this.store.LevelColors;
    this.levelEmojis = this.store.EmojiInfo;
  }
}
