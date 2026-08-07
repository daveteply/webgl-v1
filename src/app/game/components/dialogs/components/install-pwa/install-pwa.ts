import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { PwaInstallService } from '../../../../../shared/services/pwa-install';

@Component({
  selector: 'wgl-install-pwa',
  imports: [CommonModule, MatButtonModule, MatDialogModule, MatIconModule],
  templateUrl: './install-pwa.html',
  styleUrl: './install-pwa.scss',
})
export class InstallPwaDialog {
  public pwaInstallService = inject(PwaInstallService);
  private dialogRef = inject(MatDialogRef<InstallPwaDialog>);

  public async onInstallClick(): Promise<void> {
    const result = await this.pwaInstallService.promptInstall();
    if (result === 'accepted') {
      this.dialogRef.close(true);
    }
  }
}

export { InstallPwaDialog as InstallPwaComponent };
