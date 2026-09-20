import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgressBar } from './progress-bar';
import { provideTranslocoTesting } from '@rikkle/shared';

describe('ProgressBar', () => {
  let component: ProgressBar;
  let fixture: ComponentFixture<ProgressBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProgressBar],
      providers: [provideTranslocoTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ProgressBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render translated remaining count', () => {
    fixture.componentRef.setInput('remaining', 5);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const remainingEl = compiled.querySelector('.remaining');
    expect(remainingEl?.textContent?.trim()).toBe('5 remaining');
  });
});
