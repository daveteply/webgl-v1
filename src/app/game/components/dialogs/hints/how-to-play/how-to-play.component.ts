import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'wgl-how-to-play',
  standalone: true,
  imports: [MatButtonModule, MatDialogModule],
  templateUrl: './how-to-play.component.html',
  styleUrls: ['./how-to-play.component.scss'],
})
export class HowToPlayComponent {
  rightArrow = String.fromCodePoint(0x27a1, 0xfe0f);
  leftArrow = String.fromCodePoint(0x2b05, 0xfe0f);
}
