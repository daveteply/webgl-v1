import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { HighScoreManagerService, provideTranslocoTesting } from '@rikkle/shared';
import { HighScores } from './high-scores';

describe('HighScores', () => {
  let component: HighScores;
  let fixture: ComponentFixture<HighScores>;
  let highScoreManagerMock: Partial<HighScoreManagerService>;

  beforeEach(async () => {
    highScoreManagerMock = {
      GetHighScores: vi.fn().mockReturnValue(of([])),
    };

    await TestBed.configureTestingModule({
      imports: [HighScores],
      providers: [{ provide: HighScoreManagerService, useValue: highScoreManagerMock }, provideTranslocoTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(HighScores);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
