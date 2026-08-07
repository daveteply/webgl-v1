import { TestBed } from '@angular/core/testing';
import { GameEngineService } from './game-engine';
import { GamePiece } from '../models/game-piece/game-piece';
import { GameWheel } from '../models/game-wheel';
import { LevelGeometryType } from '../level-geometry-type';
import { LevelMaterialType } from '../level-material-type';
import { PowerMoveType } from '../models/power-move-type';
import {
  DEFAULT_PLAYABLE_TEXTURE_COUNT,
  DIFFICULTY_TIER_1,
  DIFFICULTY_TIER_3,
  DIFFICULTY_TIER_4,
} from '../game-constants';

describe('GameEngineService', () => {
  let service: GameEngineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GameEngineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Level & Difficulty Initialization', () => {
    it('should initialize level 1 material to ColorBumpShape', () => {
      service.InitLevelTypes(1);
      expect(service.LevelMaterialType).toBe(LevelMaterialType.ColorBumpShape);
      expect(service.LevelGeometryType).toBe(LevelGeometryType.Cube);
    });

    it('should update playable texture count according to difficulty tiers', () => {
      // Tier 1
      service.UpdatePlayableTextureCount(DIFFICULTY_TIER_1);
      expect(service.PlayableTextureCount).toBe(DEFAULT_PLAYABLE_TEXTURE_COUNT);

      // Tier 2 (level > TIER_1 and <= TIER_3)
      service.UpdatePlayableTextureCount(DIFFICULTY_TIER_1 + 1);
      expect(service.PlayableTextureCount).toBe(DEFAULT_PLAYABLE_TEXTURE_COUNT + 1);

      // Tier 3
      service.UpdatePlayableTextureCount(DIFFICULTY_TIER_3 + 1);
      expect(service.PlayableTextureCount).toBe(DEFAULT_PLAYABLE_TEXTURE_COUNT + 2);

      // Tier 4
      service.UpdatePlayableTextureCount(DIFFICULTY_TIER_4 + 1);
      expect(service.PlayableTextureCount).toBe(DEFAULT_PLAYABLE_TEXTURE_COUNT + 3);
    });

    it('should filter vertical power moves when geometry is Cylinder', () => {
      service.RestoreLevelTypes(LevelMaterialType.ColorBumpMaterial, LevelGeometryType.Cylinder);
      const selectedMoves = new Set<PowerMoveType>();
      for (let i = 0; i < 50; i++) {
        selectedMoves.add(service.PowerMoveSelection(10));
      }
      expect(selectedMoves.has(PowerMoveType.VerticalDown)).toBe(false);
      expect(selectedMoves.has(PowerMoveType.VerticalMix)).toBe(false);
      expect(selectedMoves.has(PowerMoveType.VerticalUp)).toBe(false);
    });
  });

  describe('FindMatches Algorithm', () => {
    it('should find adjacent matching pieces horizontally (Next/Prev)', () => {
      const mockWheel: any = {
        Above: undefined,
        Below: undefined,
        ResetIsMatch: () => {
          if (p1) p1.IsMatch = false;
          if (p2) p2.IsMatch = false;
          if (p3) p3.IsMatch = false;
        },
      };

      const createMockPiece = (key: number) => {
        const piece: any = {
          MatchKey: key,
          IsMatch: false,
          IsRemoved: false,
          Next: null,
          Prev: null,
          parent: mockWheel,
        };
        return piece;
      };

      const p1 = createMockPiece(100);
      const p2 = createMockPiece(100); // Match
      const p3 = createMockPiece(200); // No match

      p1.Next = p2;
      p1.Prev = p3;

      p2.Next = p3;
      p2.Prev = p1;

      p3.Next = p1;
      p3.Prev = p2;

      const axle: GameWheel[] = [mockWheel];
      const matches = service.FindMatches(p1, axle);

      expect(matches.length).toBe(2);
      expect(matches).toContain(p1);
      expect(matches).toContain(p2);
      expect(matches).not.toContain(p3);
    });
  });
});

