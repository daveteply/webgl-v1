import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'wgl-moves-remaining-info',
  templateUrl: './moves-remaining-info.component.html',
  styleUrls: ['./moves-remaining-info.component.scss'],
})
export class MovesRemainingInfoComponent {
  indexFingerPointingUp = String.fromCodePoint(0x261d, 0xfe0f);
  showIncrease!: boolean;

  constructor(@Inject(MAT_DIALOG_DATA) public data: boolean) {
    this.showIncrease = data;
  }
}
