import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'wgl-save-game-confirm',
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './save-game-confirm.html',
  styleUrl: './save-game-confirm.scss',
})
export class SaveGameConfirm {
  private dialogRef = inject(MatDialogRef<SaveGameConfirm>);

  onConfirmSave(): void {
    this.dialogRef.close(true);
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }
}

export { SaveGameConfirm as SaveGameConfirmComponent };
