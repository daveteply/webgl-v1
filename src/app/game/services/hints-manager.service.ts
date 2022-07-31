import { Injectable } from '@angular/core';
import { GetResult, Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class HintsManagerService {
  public SetHintViewed(target: string): void {
    Preferences.set({ key: target, value: 'true' });
  }
  public GetHintViewed(target: string): Promise<GetResult> {
    return Preferences.get({ key: target });
  }
}
