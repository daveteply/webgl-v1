import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { of } from 'rxjs';

import { GameMenu } from './game-menu';

describe('GameMenu', () => {
  let component: GameMenu;
  let fixture: ComponentFixture<GameMenu>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GameMenu],
      providers: [
        {
          provide: MatDialog,
          useValue: {
            open: () => ({ afterClosed: () => of(true) }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GameMenu);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should open install pwa dialog when InstallAppClick is called', () => {
    const openSpy = vi.spyOn((component as any).dialog, 'open').mockReturnValue({ afterClosed: () => of(true) } as any);
    component.InstallAppClick();
    expect(openSpy).toHaveBeenCalled();
  });
});
