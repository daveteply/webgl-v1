import { ComponentFixture, TestBed } from '@angular/core/testing';

import { About } from './about';
import { StoreService } from '../../../app-store/services/store.service';

describe('About', () => {
  let component: About;
  let fixture: ComponentFixture<About>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [About],
    }).compileComponents();

    fixture = TestBed.createComponent(About);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize levelColorScheme from StoreService', () => {
    const store = TestBed.inject(StoreService);
    store.UpdateLevelColors(['#0078AB'], { name: 'Glassmorphic Purple', emoji: '💜' });
    component.ngOnInit();
    expect(component.levelColorScheme()?.name).toBe('Glassmorphic Purple');
    expect(component.levelColorScheme()?.emoji).toBe('💜');
  });
});
