import { Component, OnInit } from '@angular/core';
import { MINIMUM_MATCH_COUNT } from 'src/app/game/game-constants';

@Component({
  selector: 'wgl-intro-dialog',
  templateUrl: './intro-dialog.component.html',
  styleUrls: ['./intro-dialog.component.scss'],
})
export class IntroDialogComponent implements OnInit {
  matchTarget = MINIMUM_MATCH_COUNT;

  constructor() {}

  ngOnInit(): void {}
}
