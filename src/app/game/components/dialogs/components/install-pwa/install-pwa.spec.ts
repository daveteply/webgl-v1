import { ComponentFixture, TestBed } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { InstallPwaDialog } from './install-pwa';

describe('InstallPwaDialog', () => {
  let component: InstallPwaDialog;
  let fixture: ComponentFixture<InstallPwaDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InstallPwaDialog],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {},
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(InstallPwaDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
