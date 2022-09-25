import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { ShareManagerService } from 'src/app/game/services/share-manager.service';

@Component({
  selector: 'wgl-share-content',
  templateUrl: './share-content.component.html',
  styleUrls: ['./share-content.component.scss'],
})
export class ShareContentComponent implements OnInit {
  constructor(public shareManager: ShareManagerService) {}

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
    this.shareManager.RequestScreenShot();
  }
}
