import { Injectable } from '@angular/core';

export interface HintResult {
  value: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class HintsManagerService {
  public SetHintViewed(target: string): void {
    localStorage.setItem(target, 'true');
  }

  public GetHintViewed(target: string): Promise<HintResult> {
    const value = localStorage.getItem(target);
    return Promise.resolve({ value });
  }
}

export { HintsManagerService as HintsManager };
