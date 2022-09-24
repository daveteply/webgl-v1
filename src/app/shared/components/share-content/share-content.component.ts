import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs';
import { ShareManagerService } from '../../services/share-manager.service';

@Component({
  selector: 'wgl-share-content',
  templateUrl: './share-content.component.html',
  styleUrls: ['./share-content.component.scss'],
})
export class ShareContentComponent implements OnInit {
  constructor(private shareManager: ShareManagerService) {}

  CanShare: boolean = false;

  ngOnInit(): void {
    this.shareManager
      .CanShare()
      .pipe(take(1))
      .subscribe((result) => {
        this.CanShare = result;
      });
  }

  Share(): void {
    this.shareManager.RequestScreenShot();
  }
}
