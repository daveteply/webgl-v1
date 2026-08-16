import { TestBed } from '@angular/core/testing';
import { GameEngineService } from './game-engine';
import { GamePiece } from '../models/game-piece/game-piece';
import { GameWheel } from '../models/game-wheel';
import { LevelGeometryType } from '../level-geometry-type';
import { LevelMaterialType } from '../level-material-type';
import { GravityType } from '../models/gravity-type';
import { PowerMoveType } from '../models/power-move-type';
import { PLAYABLE_TEXTURE_COUNT } from '../game-constants';
import { PRNG } from '../../shared/utils/prng';

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
    it('should initialize level 1 material to ColorBumpShape and gravity to None', () => {
      service.InitLevelTypes(1);
      expect(service.LevelMaterialType).toBe(LevelMaterialType.ColorBumpShape);
      expect(service.LevelGeometryType).toBe(LevelGeometryType.Cube);
      expect(service.GravityType).toBe(GravityType.None);
    });

    it('should deterministically initialize level types given the same PRNG seed', () => {
      const rng1 = new PRNG(424242);
      service.InitLevelTypes(5, rng1);
      const res1 = {
        geo: service.LevelGeometryType,
        mat: service.LevelMaterialType,
        gravity: service.GravityType,
      };

      const rng2 = new PRNG(424242);
      service.InitLevelTypes(5, rng2);
      const res2 = {
        geo: service.LevelGeometryType,
        mat: service.LevelMaterialType,
        gravity: service.GravityType,
      };

      expect(res1).toEqual(res2);
    });

    it('should initialize levels 1-2 to ColorBumpShape, levels 3-4 to ColorBumpShape or Color, levels 5-8 with BumpMaterial, and levels 9+ with Emoji', () => {
      for (let i = 0; i < 20; i++) {
        service.InitLevelTypes(2);
        expect(service.GravityType).toBe(GravityType.None);
        expect(service.LevelGeometryType).toBe(LevelGeometryType.Cube);
        expect(service.LevelMaterialType).toBe(LevelMaterialType.ColorBumpShape);
      }

      const l4Materials = new Set<LevelMaterialType>();
      for (let i = 0; i < 50; i++) {
        service.InitLevelTypes(4);
        l4Materials.add(service.LevelMaterialType);
      }
      expect(l4Materials.has(LevelMaterialType.ColorBumpShape)).toBe(true);
      expect(l4Materials.has(LevelMaterialType.Color)).toBe(true);
      expect(l4Materials.has(LevelMaterialType.ColorBumpMaterial)).toBe(false);
      expect(l4Materials.has(LevelMaterialType.Emoji)).toBe(false);

      const l8Materials = new Set<LevelMaterialType>();
      for (let i = 0; i < 50; i++) {
        service.InitLevelTypes(8);
        l8Materials.add(service.LevelMaterialType);
      }
      expect(l8Materials.has(LevelMaterialType.ColorBumpMaterial)).toBe(true);
      expect(l8Materials.has(LevelMaterialType.Emoji)).toBe(false);

      const l9Materials = new Set<LevelMaterialType>();
      for (let i = 0; i < 100; i++) {
        service.InitLevelTypes(9);
        l9Materials.add(service.LevelMaterialType);
      }
      expect(l9Materials.has(LevelMaterialType.Emoji)).toBe(true);
    });

    it('should initialize level 6 gravity to None or Down', () => {
      const foundTypes = new Set<GravityType>();
      for (let i = 0; i < 50; i++) {
        service.InitLevelTypes(6);
        foundTypes.add(service.GravityType);
      }
      for (const t of foundTypes) {
        expect([GravityType.None, GravityType.Down]).toContain(t);
      }
    });

    it('should initialize level 14+ gravity to None, Down, Up, or Mix', () => {
      const foundTypes = new Set<GravityType>();
      for (let i = 0; i < 100; i++) {
        service.InitLevelTypes(14);
        foundTypes.add(service.GravityType);
      }
      expect(foundTypes.size).toBeGreaterThan(1);
    });

    it('should keep Cube geometry for levels 1 to 6, introduce Cylinder at level 7, and Dodecahedron at level 12+', () => {
      for (let i = 0; i < 30; i++) {
        service.InitLevelTypes(6);
        expect(service.LevelGeometryType).toBe(LevelGeometryType.Cube);
      }

      const l7Geos = new Set<LevelGeometryType>();
      for (let i = 0; i < 50; i++) {
        service.InitLevelTypes(7);
        l7Geos.add(service.LevelGeometryType);
      }
      expect(l7Geos.has(LevelGeometryType.Cube)).toBe(true);
      expect(l7Geos.has(LevelGeometryType.Cylinder)).toBe(true);
      expect(l7Geos.has(LevelGeometryType.Dodecahedron)).toBe(false);

      const l12Geos = new Set<LevelGeometryType>();
      for (let i = 0; i < 100; i++) {
        service.InitLevelTypes(12);
        l12Geos.add(service.LevelGeometryType);
      }
      expect(l12Geos.has(LevelGeometryType.Dodecahedron)).toBe(true);
    });

    it('should restore gravity type in RestoreLevelTypes', () => {
      service.RestoreLevelTypes(LevelMaterialType.Emoji, LevelGeometryType.Cylinder, GravityType.Up);
      expect(service.GravityType).toBe(GravityType.Up);
    });

    it('should return a fair, constant playable texture count for adequate gameplay', () => {
      expect(service.PlayableTextureCount).toBe(PLAYABLE_TEXTURE_COUNT);
    });

    it('should filter vertical power moves when geometry is Cylinder or Dodecahedron', () => {
      service.RestoreLevelTypes(LevelMaterialType.ColorBumpMaterial, LevelGeometryType.Cylinder);
      const selectedMovesCylinder = new Set<PowerMoveType>();
      for (let i = 0; i < 50; i++) {
        selectedMovesCylinder.add(service.PowerMoveSelection(10));
      }
      expect(selectedMovesCylinder.has(PowerMoveType.VerticalDown)).toBe(false);
      expect(selectedMovesCylinder.has(PowerMoveType.VerticalMix)).toBe(false);
      expect(selectedMovesCylinder.has(PowerMoveType.VerticalUp)).toBe(false);

      service.RestoreLevelTypes(LevelMaterialType.ColorBumpMaterial, LevelGeometryType.Dodecahedron);
      const selectedMovesDodecahedron = new Set<PowerMoveType>();
      for (let i = 0; i < 50; i++) {
        selectedMovesDodecahedron.add(service.PowerMoveSelection(10));
      }
      expect(selectedMovesDodecahedron.has(PowerMoveType.VerticalDown)).toBe(false);
      expect(selectedMovesDodecahedron.has(PowerMoveType.VerticalMix)).toBe(false);
      expect(selectedMovesDodecahedron.has(PowerMoveType.VerticalUp)).toBe(false);
    });

    it('should constrain Dodecahedron geometry levels to ColorBumpShape, Color, or ColorBumpMaterial', () => {
      for (let i = 0; i < 100; i++) {
        service.InitLevelTypes(12);
        if (service.LevelGeometryType === LevelGeometryType.Dodecahedron) {
          expect([
            LevelMaterialType.ColorBumpShape,
            LevelMaterialType.Color,
            LevelMaterialType.ColorBumpMaterial,
          ]).toContain(service.LevelMaterialType);
        }
      }
    });
  });

  describe('FindMatches Algorithm', () => {
    it('should find adjacent matching pieces horizontally (Next/Prev)', () => {
      const mockWheel = {
        Above: undefined,
        Below: undefined,
        ResetIsMatch: () => {
          if (p1) p1.IsMatch = false;
          if (p2) p2.IsMatch = false;
          if (p3) p3.IsMatch = false;
        },
      } as unknown as GameWheel;

      const createMockPiece = (key: number) => {
        const piece = {
          MatchKey: key,
          IsMatch: false,
          IsRemoved: false,
          Next: null,
          Prev: null,
          parent: mockWheel,
        } as unknown as GamePiece;
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

  describe('Power Move Selection & Progression', () => {
    it('should return None for levels 1 and 2', () => {
      expect(service.PowerMoveSelection(1)).toBe(PowerMoveType.None);
      expect(service.PowerMoveSelection(2)).toBe(PowerMoveType.None);
    });

    it('should only select Horizontal moves (or None) for levels 3 to 5', () => {
      service.RestoreLevelTypes(LevelMaterialType.ColorBumpShape, LevelGeometryType.Cube);
      const allowed = new Set([PowerMoveType.None, PowerMoveType.HorizontalRight, PowerMoveType.HorizontalLeft]);
      for (let i = 0; i < 50; i++) {
        const move = service.PowerMoveSelection(4);
        expect(allowed.has(move)).toBe(true);
      }
    });

    it('should introduce Vertical moves at level 6+', () => {
      service.RestoreLevelTypes(LevelMaterialType.ColorBumpShape, LevelGeometryType.Cube);
      const moves = new Set<PowerMoveType>();
      for (let i = 0; i < 100; i++) {
        moves.add(service.PowerMoveSelection(7));
      }
      expect(moves.has(PowerMoveType.VerticalUp) || moves.has(PowerMoveType.VerticalDown)).toBe(true);
    });

    it('should introduce Mix moves at level 9+', () => {
      service.RestoreLevelTypes(LevelMaterialType.ColorBumpShape, LevelGeometryType.Cube);
      const moves = new Set<PowerMoveType>();
      for (let i = 0; i < 100; i++) {
        moves.add(service.PowerMoveSelection(10));
      }
      expect(moves.has(PowerMoveType.HorizontalMix) || moves.has(PowerMoveType.VerticalMix)).toBe(true);
    });

    it('should introduce Bomb power move at level 12+', () => {
      service.RestoreLevelTypes(LevelMaterialType.ColorBumpShape, LevelGeometryType.Cube);
      const moves = new Set<PowerMoveType>();
      for (let i = 0; i < 100; i++) {
        moves.add(service.PowerMoveSelection(15));
      }
      expect(moves.has(PowerMoveType.Bomb)).toBe(true);
    });

    it('should return None if match count is below threshold in EvaluatePowerMove', () => {
      expect(service.EvaluatePowerMove(2, 5)).toBe(PowerMoveType.None);
      expect(service.EvaluatePowerMove(3, 5)).toBe(PowerMoveType.None); // below 4 for Tier 1
    });

    it('should evaluate candidate moves when match threshold is met', () => {
      service.RestoreLevelTypes(LevelMaterialType.ColorBumpShape, LevelGeometryType.Cube);
      const results = new Set<PowerMoveType>();
      for (let i = 0; i < 100; i++) {
        results.add(service.EvaluatePowerMove(5, 15));
      }
      expect(results.size).toBeGreaterThan(1);
    });
  });

  describe('FindBombTargets Algorithm', () => {
    it('should find circular targets around bomb piece and omit corner positions', () => {
      const wheels: GameWheel[] = [];

      // Create 5 mock wheels to test +/- 2 vertical span
      for (let w = 0; w < 5; w++) {
        const pieces: GamePiece[] = [];
        const mockWheel = {
          Theta: 0,
          children: pieces,
        } as unknown as GameWheel;

        for (let p = 0; p < 10; p++) {
          const piece = {
            id: w * 10 + p,
            ThetaOffset: p * 0.1,
            IsRemoved: false,
            Next: null,
            Prev: null,
            parent: mockWheel,
          } as unknown as GamePiece;
          pieces.push(piece);
        }

        // Link next/prev circularly
        for (let p = 0; p < 10; p++) {
          pieces[p].Next = pieces[(p + 1) % 10];
          pieces[p].Prev = pieces[(p + 9) % 10];
        }

        wheels.push(mockWheel);
      }

      // Bomb is on center wheel (index 2), center piece (index 5)
      const centerWheel = wheels[2];
      const bombPiece = centerWheel.children[5] as GamePiece;

      const targets = service.FindBombTargets(bombPiece, wheels, 20);

      expect(targets).toContain(bombPiece);
      // Verify pieces at +/- 1 on same wheel are included
      expect(targets).toContain(bombPiece.Next);
      expect(targets).toContain(bombPiece.Prev);

      // Verify corner piece at dy = +2, dx = +2 is omitted
      const topWheel = wheels[4]; // dy = +2
      const topCenter = topWheel.children[5] as GamePiece;
      const cornerPiece = topCenter.Next.Next; // dx = +2
      expect(targets).not.toContain(cornerPiece);

      // Total targets should be <= 21
      expect(targets.length).toBeLessThanOrEqual(21);
      expect(targets.length).toBeGreaterThanOrEqual(5);
    });
  });
});
