import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'wgl-moves-remaining',
  imports: [CommonModule, MatButtonModule, MatDialogModule],
  templateUrl: './moves-remaining.html',
  styleUrl: './moves-remaining.scss',
})
export class MovesRemaining {
  indexFingerPointingUp = String.fromCodePoint(0x261d, 0xfe0f);
  showIncrease: boolean = inject(MAT_DIALOG_DATA);
}
