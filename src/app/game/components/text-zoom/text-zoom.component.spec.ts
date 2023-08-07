import { DecimalPipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextZoomComponent } from './text-zoom.component';

describe('TextZoomComponent', () => {
  let component: TextZoomComponent;
  let fixture: ComponentFixture<TextZoomComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextZoomComponent],
      providers: [DecimalPipe],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TextZoomComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
