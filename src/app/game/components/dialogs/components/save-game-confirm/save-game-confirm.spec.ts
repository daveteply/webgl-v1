import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { SaveGameConfirm } from './save-game-confirm';

describe('SaveGameConfirm', () => {
  let component: SaveGameConfirm;
  let fixture: ComponentFixture<SaveGameConfirm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SaveGameConfirm],
      providers: [{ provide: MatDialogRef, useValue: { close: () => undefined } }],
    }).compileComponents();

    fixture = TestBed.createComponent(SaveGameConfirm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
