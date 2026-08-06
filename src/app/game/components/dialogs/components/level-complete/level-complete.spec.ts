import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelComplete } from './level-complete';

describe('LevelComplete', () => {
  let component: LevelComplete;
  let fixture: ComponentFixture<LevelComplete>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LevelComplete],
    }).compileComponents();

    fixture = TestBed.createComponent(LevelComplete);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
