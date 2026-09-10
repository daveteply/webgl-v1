import { TestBed } from '@angular/core/testing';
import { PerspectiveCamera, Scene, Vector2, WebGLRenderer } from 'three';
import { PostProcessingManagerService } from './post-processing-manager';
import { mainTweenGroup } from './tween-group';

function createMockRenderer(width = 800, height = 600): WebGLRenderer {
  return {
    getContext: () => ({ getExtension: () => null, getParameter: () => 0 }),
    getPixelRatio: () => 1,
    getSize: (target?: Vector2) => (target ? target.set(width, height) : new Vector2(width, height)),
    getDrawingBufferSize: (target?: Vector2) => (target ? target.set(width, height) : new Vector2(width, height)),
    setSize: () => undefined,
    setViewport: () => undefined,
    setScissor: () => undefined,
    setScissorTest: () => undefined,
    setClearColor: () => undefined,
    getClearColor: () => ({ getHex: () => 0 }),
    getClearAlpha: () => 0,
    render: () => undefined,
    clear: () => undefined,
    autoClear: true,
    shadowMap: { enabled: false },
    capabilities: { isWebGL2: true },
  } as unknown as WebGLRenderer;
}

describe('PostProcessingManagerService', () => {
  let service: PostProcessingManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PostProcessingManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should initialize ShockwavePass with correct initial state', () => {
    const scene = new Scene();
    const camera = new PerspectiveCamera();
    const mockRenderer = createMockRenderer(800, 600);

    service.InitPostProcessing(scene, camera, mockRenderer, 800, 600);

    expect(service.ShockwavePass).toBeTruthy();
    expect(service.ShockwavePass.enabled).toBe(false);
    expect(service.ShockwavePass.uniforms['aspectRatio'].value).toBeCloseTo(800 / 600);
    expect(service.ShockwavePass.uniforms['progress'].value).toBe(0.0);
  });

  it('should update aspect ratio on UpdateAspectRatio', () => {
    const scene = new Scene();
    const camera = new PerspectiveCamera();
    const mockRenderer = createMockRenderer(800, 600);

    service.InitPostProcessing(scene, camera, mockRenderer, 800, 600);
    service.UpdateAspectRatio(1920, 1080);

    expect(service.ShockwavePass.uniforms['aspectRatio'].value).toBeCloseTo(1920 / 1080);
  });

  it('should enable ShockwavePass, set center, and animate progress on TriggerShockwave', () => {
    const scene = new Scene();
    const camera = new PerspectiveCamera();
    const mockRenderer = createMockRenderer(800, 600);

    service.InitPostProcessing(scene, camera, mockRenderer, 800, 600);

    const centerUv = new Vector2(0.4, 0.6);
    service.TriggerShockwave(centerUv, 200);

    expect(service.ShockwavePass.enabled).toBe(true);
    expect(service.ShockwavePass.uniforms['center'].value.x).toBe(0.4);
    expect(service.ShockwavePass.uniforms['center'].value.y).toBe(0.6);

    // Advance tween group
    mainTweenGroup.update(performance.now() + 1000);

    expect(service.ShockwavePass.enabled).toBe(false);
    expect(service.ShockwavePass.uniforms['progress'].value).toBe(0.0);
  });
});
