import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GameContainer } from './game-container';

describe('GameContainer', () => {
  let component: GameContainer;
  let fixture: ComponentFixture<GameContainer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameContainer],
    }).compileComponents();

    fixture = TestBed.createComponent(GameContainer);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
