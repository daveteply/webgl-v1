import { Component } from '@angular/core';
import { MINIMUM_MATCH_COUNT } from 'src/app/game/game-constants';

@Component({
  selector: 'wgl-tutorial-dialog',
  templateUrl: './tutorial-dialog.component.html',
  styleUrls: ['./tutorial-dialog.component.scss'],
})
export class TutorialDialogComponent {
  matchTarget = MINIMUM_MATCH_COUNT;
}
