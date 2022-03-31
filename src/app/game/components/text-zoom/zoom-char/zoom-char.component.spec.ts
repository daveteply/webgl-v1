import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomCharComponent } from './zoom-char.component';

describe('ZoomCharComponent', () => {
  let component: ZoomCharComponent;
  let fixture: ComponentFixture<ZoomCharComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ZoomCharComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ZoomCharComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
