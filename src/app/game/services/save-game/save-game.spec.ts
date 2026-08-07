import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { SaveGameService } from './save-game';
import { StorageService } from '../../../shared/services/storage/storage.service';
import { GameWheel } from '../../models/game-wheel';
import { GamePiece } from '../../models/game-piece/game-piece';

class MockStorageService {
  private store: { [key: string]: any } = {};

  getItem<T>(key: string): T | null {
    return this.store[key] ? (JSON.parse(this.store[key]) as T) : null;
  }

  setItem(key: string, value: any): void {
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
  });

  it('should toggle restoration flag during RestoreState and RestoreComplete', () => {
    expect(service.IsRestoring).toBeFalsy();
    service.RestoreState();
    expect(service.IsRestoring).toBe(true);
    service.RestoreComplete();
    expect(service.IsRestoring).toBe(false);
  });

  it('should serialize and save game state to StorageService', async () => {
    // Mock game wheel and pieces
    const mockPiece: any = {
      IsRemoved: false,
      FlipTurns: 2,
      IsPowerMove: false,
    };

    const mockWheel: any = {
      Theta: 1.57,
      children: [mockPiece],
    };

    const levelMaterials: any[] = [{ matchKey: 1, colorStr: '#ff0000' }];
    const gameMaterials: any = {
      wheelMaterials: [{ pieceMaterials: [{ materials: [{ matchKey: 1 }] }] }],
    };
    const scoreData: any = { level: 3, score: 500, moves: 10 };

    await firstValueFrom(service.SaveState([mockWheel], levelMaterials, gameMaterials, 1, 1, scoreData, 0xffffff));

    const hasSave = await firstValueFrom(service.HasSaveState());
    expect(hasSave).toBe(true);
    expect(service.SavedGameData.wheelData.length).toBe(1);
    expect(service.SavedGameData.wheelData[0].theta).toBe(1.57);
    expect(service.SavedGameData.wheelData[0].piecesData[0].flipTurns).toBe(2);
  });
});
