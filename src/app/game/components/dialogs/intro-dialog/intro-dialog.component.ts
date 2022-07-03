import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { TutorialDialogComponent } from '../tutorial-dialog/tutorial-dialog.component';
import { AboutComponent } from 'src/app/shared/components/about/about.component';

import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';
import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { DialogAnimationService } from '../dialog-animation.service';

@Component({
  selector: 'wgl-intro-dialog',
  templateUrl: './intro-dialog.component.html',
  styleUrls: ['./intro-dialog.component.scss'],
})
export class IntroDialogComponent implements AfterViewInit, OnDestroy {
  @ViewChild('dialogCanvas')
  dialogCanvas!: ElementRef<HTMLCanvasElement>;

  texturesStillLoading: boolean = true;
  progress: number = 100;

  private notifier = new Subject();

  constructor(
    private textureManager: TextureManagerService,
    private audioManager: AudioManagerService,
    private dialogAnimation: DialogAnimationService,
    private dialog: MatDialog
  ) {
    this.textureManager.LevelTexturesLoaded.pipe(takeUntil(this.notifier)).subscribe(() => {
      this.texturesStillLoading = false;
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

  openTutorialDialog(): void {
    this.dialog.open(TutorialDialogComponent);
  }

  openAbout(): void {
    this.dialog.open(AboutComponent, { data: { hideLevelInfo: true } });
  }
}
