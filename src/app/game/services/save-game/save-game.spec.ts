import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SaveGameService } from './save-game';
import { StorageService } from '../../../shared/services/storage/storage.service';

class MockStorageService {
  private store: Record<string, string> = {};

  getItem<T>(key: string): T | null {
    return this.store[key] ? (JSON.parse(this.store[key]) as T) : null;
  }

  setItem(key: string, value: unknown): void {
    this.store[key] = JSON.stringify(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }
}

describe('SaveGameService', () => {
  let service: SaveGameService;
  let mockStorage: MockStorageService;

  beforeEach(() => {
    mockStorage = new MockStorageService();
    TestBed.configureTestingModule({
      providers: [SaveGameService, { provide: StorageService, useValue: mockStorage }],
    });
    service = TestBed.inject(SaveGameService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return false for HasSaveState when no save state exists', async () => {
    const hasSave = await firstValueFrom(service.HasSaveState());
    expect(hasSave).toBe(false);
    expect(service.SavedGameData).toBeNull();
  });

  it('should save game checkpoint with custom seed and detect it via HasSaveState', async () => {
    await firstValueFrom(service.SaveState(3, 1250, 8, 987654));

    const hasSave = await firstValueFrom(service.HasSaveState());
    expect(hasSave).toBe(true);
    expect(service.SavedGameData).toEqual(
      expect.objectContaining({
        level: 3,
        score: 1250,
        moves: 8,
        seed: 987654,
      }),
    );
  });

  it('should generate a positive 32-bit seed if none is provided when saving', async () => {
    await firstValueFrom(service.SaveState(2, 600, 6));

    const state = service.GetSaveState();
    expect(state?.seed).toBeDefined();
    expect(state!.seed).toBeGreaterThan(0);
  });

  it('should retrieve save state via GetSaveState', async () => {
    await firstValueFrom(service.SaveState(5, 3400, 12, 112233));

    const state = service.GetSaveState();
    expect(state?.level).toBe(5);
    expect(state?.score).toBe(3400);
    expect(state?.moves).toBe(12);
    expect(state?.seed).toBe(112233);
  });

  it('should clear save state and update HasSaveState', async () => {
    await firstValueFrom(service.SaveState(2, 500, 5));
    expect(await firstValueFrom(service.HasSaveState())).toBe(true);

    service.ClearSaveState();
    expect(await firstValueFrom(service.HasSaveState())).toBe(false);
    expect(service.SavedGameData).toBeNull();
  });
});
