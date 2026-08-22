import { TestBed } from '@angular/core/testing';
import { FeatureFlagsService } from './feature-flags.service';
import { LevelMaterialType } from '../../models/level-material-type';
import { LevelOrientationType } from '../../models/level-orientation-type';
import { LevelGeometryType } from '../../models/level-geometry-type';
import { GravityType } from '../../models/gravity-type';

describe('FeatureFlagsService', () => {
  let service: FeatureFlagsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FeatureFlagsService);
    service.Reset();
  });

  afterEach(() => {
    service.Reset();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should set and reset material overrides', () => {
    service.SetMaterial(LevelMaterialType.Emoji);
    expect(service.materialOverride()).toBe(LevelMaterialType.Emoji);

    service.Reset();
    expect(service.materialOverride()).toBeNull();
  });

  it('should set and reset orientation overrides', () => {
    service.SetOrientation(LevelOrientationType.HorizontalRight);
    expect(service.orientationOverride()).toBe(LevelOrientationType.HorizontalRight);

    service.Reset();
    expect(service.orientationOverride()).toBeNull();
  });

  it('should set and reset geometry and gravity overrides', () => {
    service.SetGeometry(LevelGeometryType.Cylinder);
    service.SetGravity(GravityType.Mix);

    expect(service.geometryOverride()).toBe(LevelGeometryType.Cylinder);
    expect(service.gravityOverride()).toBe(GravityType.Mix);

    service.Reset();
    expect(service.geometryOverride()).toBeNull();
    expect(service.gravityOverride()).toBeNull();
  });
});
