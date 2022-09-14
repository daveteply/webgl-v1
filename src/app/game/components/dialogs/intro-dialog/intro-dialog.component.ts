import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { Subject, takeUntil } from 'rxjs';

import { AudioManagerService } from 'src/app/shared/services/audio/audio-manager.service';
import { DialogAnimationService } from '../dialog-animation.service';
import { ObjectManagerService } from 'src/app/game/services/object-manager.service';
import { SaveGameService } from 'src/app/game/services/save-game/save-game.service';

@Component({
  selector: 'wgl-intro-dialog',
  templateUrl: './intro-dialog.component.html',
  styleUrls: ['./intro-dialog.component.scss'],
})
export class IntroDialogComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('dialogCanvas')
  dialogCanvas!: ElementRef<HTMLCanvasElement>;

  materialsUpdating: boolean = true;
  progress: number = 100;

  hasRestoreData!: boolean;

  private notifier = new Subject();

  constructor(
    private objectManager: ObjectManagerService,
    private audioManager: AudioManagerService,
    private dialogAnimation: DialogAnimationService,
    private saveGame: SaveGameService,
    public dialogRef: MatDialogRef<IntroDialogComponent>
  ) {
    this.objectManager.LevelMaterialsUpdated.pipe(takeUntil(this.notifier)).subscribe(() => {
      this.materialsUpdating = false;
    });

    // start-up music
    this.audioManager.PlayLevelComplete();
  }

  ngOnInit(): void {
    this.saveGame
      .HasSaveState()
      .pipe(takeUntil(this.notifier))
      .subscribe((hasSaveData) => {
        this.hasRestoreData = hasSaveData;
      });
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

  restoreGame(): void {
    this.saveGame.RestoreState();
    this.dialogRef.close({ isRestoring: true });
  }
}
