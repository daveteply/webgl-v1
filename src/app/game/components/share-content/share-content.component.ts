import { DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { ShareManagerService } from 'src/app/game/services/share-manager.service';
import { AnalyticsManagerService } from 'src/app/shared/services/analytics-manager.service';

@Component({
  selector: 'wgl-share-content',
  templateUrl: './share-content.component.html',
  styleUrls: ['./share-content.component.scss'],
})
export class ShareContentComponent implements OnInit {
  constructor(
    private analyticsManager: AnalyticsManagerService,
    public shareManager: ShareManagerService,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ShowSelf: boolean = false;

  ngOnInit(): void {
    this.shareManager
      .CanShare()
      .pipe(take(1))
      .subscribe((result) => {
        this.ShowSelf = result;
      });
  }

  Share(): void {
    this.shareManager.RequestScreenShot(this.document);
  }
}
