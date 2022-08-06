import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { AboutComponent } from 'src/app/shared/components/about/about.component';

import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { DialogAnimationService } from '../dialog-animation.service';
import { ObjectManagerService } from 'src/app/game/services/object-manager.service';

@Component({
  selector: 'wgl-intro-dialog',
  templateUrl: './intro-dialog.component.html',
  styleUrls: ['./intro-dialog.component.scss'],
})
export class IntroDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dialogCanvas')
  dialogCanvas!: ElementRef<HTMLCanvasElement>;

  materialsUpdating: boolean = true;
  progress: number = 100;

  private notifier = new Subject();

  constructor(
    private objectManager: ObjectManagerService,
    private audioManager: AudioManagerService,
    private dialogAnimation: DialogAnimationService,
    private dialog: MatDialog
  ) {
    this.objectManager.LevelMaterialsUpdated.pipe(takeUntil(this.notifier)).subscribe(() => {
      this.materialsUpdating = false;
    });

    // start-up music
    this.audioManager.PlayLevelComplete();
  }

  ngOnDestroy(): void {
    this.dialogAnimation.Dispose();

    this.notifier.next(undefined);
    this.notifier.complete();
  }

  ngAfterViewInit(): void {
    this.dialogAnimation.SetScene(this.dialogCanvas.nativeElement);
    this.dialogAnimation.CreateIntroDialogBoxes();
    this.dialogAnimation.Animate();
  }

  openAbout(): void {
    this.dialog.open(AboutComponent, { data: { hideLevelInfo: true }, panelClass: 'cdk-overlay-pane__show' });
  }
}
