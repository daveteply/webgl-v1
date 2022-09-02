import { Component, OnInit } from '@angular/core';
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

  constructor(private store: StoreService) {}

  ngOnInit(): void {
    this.levelColors = this.store.LevelColors;
    this.levelEmojis = this.store.EmojiInfo;
  }
}
