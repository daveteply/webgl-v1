import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject, of } from 'rxjs';
import { ShareManagerService } from '@rikkle/graphics';
import { AnalyticsManagerService, provideTranslocoTesting } from '@rikkle/shared';
import { ShareContent } from './share-content';

describe('ShareContent', () => {
  let component: ShareContent;
  let fixture: ComponentFixture<ShareContent>;
  let shareManagerMock: Partial<ShareManagerService>;
  let analyticsManagerMock: Partial<AnalyticsManagerService>;

  beforeEach(async () => {
    shareManagerMock = {
      CanShare: vi.fn().mockReturnValue(of(true)),
      ShareInitiated: new Subject<void>(),
      ShareFailed: new Subject<void>(),
      RequestScreenShot: vi.fn(),
    };

    analyticsManagerMock = {
      Log: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [ShareContent],
      providers: [
        { provide: ShareManagerService, useValue: shareManagerMock },
        { provide: AnalyticsManagerService, useValue: analyticsManagerMock },
        provideTranslocoTesting(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ShareContent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should trigger screenshot request and log analytics on Share()', () => {
    component.Share();
    expect(analyticsManagerMock.Log).toHaveBeenCalled();
    expect(shareManagerMock.RequestScreenShot).toHaveBeenCalled();
    expect(component.Loading()).toBe(true);
  });
});
