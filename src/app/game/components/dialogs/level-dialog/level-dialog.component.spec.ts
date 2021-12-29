import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LevelDialogComponent } from './level-dialog.component';

describe('LevelDialogComponent', () => {
  let component: LevelDialogComponent;
  let fixture: ComponentFixture<LevelDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LevelDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LevelDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
