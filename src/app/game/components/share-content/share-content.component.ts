import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Subject, take, takeUntil } from 'rxjs';
import { ShareManagerService } from 'src/app/game/services/share-manager.service';

@Component({
  selector: 'wgl-share-content',
  templateUrl: './share-content.component.html',
  styleUrls: ['./share-content.component.scss'],
})
export class ShareContentComponent implements OnInit, OnDestroy {
  constructor(public shareManager: ShareManagerService, @Inject(DOCUMENT) private document: Document) {}

  ShowSelf: boolean = false;
  Loading: boolean = false;

  private notifier = new Subject();

  ngOnInit(): void {
    this.shareManager
      .CanShare()
      .pipe(take(1))
      .subscribe((result) => {
        this.ShowSelf = result;
      });

    this.shareManager.ShareInitiated.pipe(takeUntil(this.notifier)).subscribe(() => {
      this.Loading = false;
    });
    this.shareManager.ShareFailed.pipe(takeUntil(this.notifier)).subscribe(() => {
      this.Loading = false;
    });
  }

  ngOnDestroy(): void {
    this.notifier.next(undefined);
    this.notifier.complete();
  }

  Share(): void {
    this.Loading = true;
    this.shareManager.RequestScreenShot(this.document);
  }
}
