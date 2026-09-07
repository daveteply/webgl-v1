import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ZoomChar } from './zoom-char';

describe('ZoomChar', () => {
  let component: ZoomChar;
  let fixture: ComponentFixture<ZoomChar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ZoomChar],
    }).compileComponents();

    fixture = TestBed.createComponent(ZoomChar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
