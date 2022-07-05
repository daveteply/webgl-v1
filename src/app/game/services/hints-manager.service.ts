import { Injectable } from '@angular/core';
import { GetResult, Storage } from '@capacitor/storage';

@Injectable({
  providedIn: 'root',
})
export class HintsManagerService {
  public SetHintViewed(target: string): void {
    Storage.set({ key: target, value: 'true' });
  }
  public GetHintViewed(target: string): Promise<GetResult> {
    return Storage.get({ key: target });
  }
}
