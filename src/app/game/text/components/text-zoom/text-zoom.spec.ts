import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TextZoom } from './text-zoom';

describe('TextZoom', () => {
  let component: TextZoom;
  let fixture: ComponentFixture<TextZoom>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextZoom],
    }).compileComponents();

    fixture = TestBed.createComponent(TextZoom);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
