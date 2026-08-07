import { Injectable, inject } from '@angular/core';
import { StorageService } from '../../shared/services/storage/storage.service';

export interface HintResult {
  value: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class HintsManagerService {
  private storageService = inject(StorageService);

  public SetHintViewed(target: string): void {
    this.storageService.setItem(target, 'true');
  }

  public GetHintViewed(target: string): Promise<HintResult> {
    const value = this.storageService.getItem<string>(target);
    return Promise.resolve({ value });
  }
}

export { HintsManagerService as HintsManager };
