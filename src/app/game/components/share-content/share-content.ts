import { Component, DestroyRef, DOCUMENT, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { ShareManagerService } from '../../services/share-manager';

@Component({
  selector: 'wgl-share-content',
  imports: [CommonModule, MatIconModule, MatProgressBarModule, MatButtonModule],
  templateUrl: './share-content.html',
  styleUrl: './share-content.scss',
})
export class ShareContent implements OnInit {
  public shareManager = inject(ShareManagerService);
  private document = inject(DOCUMENT);
  private destroyRef = inject(DestroyRef);

  ShowSelf = false;
  Loading = false;

  ngOnInit(): void {
    this.shareManager
      .CanShare()
      .pipe(take(1))
      .subscribe((result) => {
        this.ShowSelf = result;
      });

    this.shareManager.ShareInitiated.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.Loading = false;
    });
    this.shareManager.ShareFailed.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.Loading = false;
    });
  }

  Share(): void {
    this.Loading = true;
    this.shareManager.RequestScreenShot(this.document);
  }
}

export { ShareContent as ShareContentComponent };
