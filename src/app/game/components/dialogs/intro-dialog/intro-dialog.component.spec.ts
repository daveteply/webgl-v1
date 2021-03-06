import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { TextureManagerService } from 'src/app/game/services/texture/texture-manager.service';

import { IntroDialogComponent } from './intro-dialog.component';

describe('IntroDialogComponent', () => {
  let component: IntroDialogComponent;
  let fixture: ComponentFixture<IntroDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MatDialogModule],
      declarations: [IntroDialogComponent],
      providers: [TextureManagerService],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IntroDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
