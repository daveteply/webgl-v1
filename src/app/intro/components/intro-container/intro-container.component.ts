import { Component } from '@angular/core';
import { MINIMUM_MATCH_COUNT } from 'src/app/game/game-constants';

@Component({
  selector: 'wgl-intro-container',
  templateUrl: './intro-container.component.html',
  styleUrls: ['./intro-container.component.scss'],
})
export class IntroContainerComponent {
  matchTarget = MINIMUM_MATCH_COUNT;
}
