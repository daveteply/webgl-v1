import { Component, Input } from '@angular/core';
import {
  MOVES_REMAINING_COUNT_DANGER,
  MOVES_REMAINING_COUNT_PANIC,
  MOVES_REMAINING_COUNT_WARNING,
} from '../../game-constants';

@Component({
  selector: 'wgl-moves-left',
  imports: [],
  templateUrl: './moves-left.html',
  styleUrl: './moves-left.scss',
})
export class MovesLeft {
  moves = 0;

  get IsWarn(): boolean {
    return this.moves === MOVES_REMAINING_COUNT_WARNING;
  }
  get IsDanger(): boolean {
    return this.moves === MOVES_REMAINING_COUNT_DANGER;
  }
  get IsPanic(): boolean {
    return this.moves === MOVES_REMAINING_COUNT_PANIC;
  }

  @Input() set amount(movesLeft: number) {
    this.moves = movesLeft;
  }
}

export { MovesLeft as MovesLeftComponent };
