import { Injectable } from '@angular/core';
import { Device } from '@capacitor/device';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class DeviceManagerService {
  private _isWeb = false;
  get IsWeb(): boolean {
    return this._isWeb;
  }

  constructor() {
    Device.getInfo().then((info) => {
      if (!environment.production) {
        console.info('device getInfo:', info);
      }
      this._isWeb = info.platform === 'web';
    });
  }
}
