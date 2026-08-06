import { Component, computed, input } from '@angular/core';
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
  amount = input<number>(0);

  isWarn = computed(() => this.amount() === MOVES_REMAINING_COUNT_WARNING);
  isDanger = computed(() => this.amount() === MOVES_REMAINING_COUNT_DANGER);
  isPanic = computed(() => this.amount() === MOVES_REMAINING_COUNT_PANIC);
}

export { MovesLeft as MovesLeftComponent };
