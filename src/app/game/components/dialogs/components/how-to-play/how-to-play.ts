import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'wgl-how-to-play',
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './how-to-play.html',
  styleUrl: './how-to-play.scss',
})
export class HowToPlay {
  rightArrow = String.fromCodePoint(0x27a1, 0xfe0f);
  leftArrow = String.fromCodePoint(0x2b05, 0xfe0f);
}
