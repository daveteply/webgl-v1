import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { vi } from 'vitest';

import { GameMenu } from './game-menu';
import { InstallPwaDialog } from '../dialogs/components/install-pwa/install-pwa';

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

  it('should open install pwa dialog when InstallAppClick is called', async () => {
    const dialog = component['dialog'];
    const openSpy = vi
      .spyOn(dialog, 'open')
      .mockReturnValue({ afterClosed: () => of(true) } as unknown as MatDialogRef<InstallPwaDialog>);
    await component.InstallAppClick();
    expect(openSpy).toHaveBeenCalled();
  });
});
