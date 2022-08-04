import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatSliderModule } from '@angular/material/slider';

import { GainControlComponent } from './gain-control.component';

describe('GainControlComponent', () => {
  let component: GainControlComponent;
  let fixture: ComponentFixture<GainControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GainControlComponent],
      imports: [MatSliderModule],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GainControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
