import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EmojiInfo } from 'src/app/app-store/models/emoji-info';
import { StoreService } from 'src/app/app-store/services/store.service';

@Component({
  selector: 'wgl-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
  levelColors!: string[];
  levelEmojis!: EmojiInfo;

  hideLevelInfoData: boolean;

  creditsData: any;

  constructor(private store: StoreService, @Inject(MAT_DIALOG_DATA) public hideLevelInfo: boolean) {
    this.hideLevelInfoData = hideLevelInfo;
  }

  ngOnInit(): void {
    this.levelColors = this.store.LevelColors;
    this.levelEmojis = this.store.EmojiInfo;
  }
}
