import { Injectable } from '@angular/core';
import { Color, Object3D, PerspectiveCamera, Scene, Vector2, WebGLRenderer } from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';

@Injectable({
  providedIn: 'root',
})
export class PostProcessingManagerService {
  private _composer!: EffectComposer;
  private _renderPass!: RenderPass;
  private _outlinePass!: OutlinePass;
  private _smaaPass!: SMAAPass;

  get Composer(): EffectComposer {
    return this._composer;
  }

  get SMAAPass(): SMAAPass {
    return this._smaaPass;
  }

  public InitPostProcessing(
    scene: Scene,
    camera: PerspectiveCamera,
    renderer: WebGLRenderer,
    width: number,
    height: number
  ): void {
    // render pass
    this._renderPass = new RenderPass(scene, camera);
    this._renderPass.clearAlpha = 0;

    // outline pass
    this._outlinePass = new OutlinePass(new Vector2(width, height), scene, camera);
    this._outlinePass.edgeGlow = 1;
    this._outlinePass.edgeThickness = 10;
    this._outlinePass.edgeStrength = 20;
    this._outlinePass.renderToScreen = true;

    // smaa
    this._smaaPass = new SMAAPass(width, height);

    // composer
    this._composer = new EffectComposer(renderer);
    this._composer.addPass(this._renderPass);
    this._composer.addPass(this._outlinePass);
    this._composer.addPass(this._smaaPass);
  }

  public UpdateOutlinePassObjects(selectedObjects: Object3D[]): void {
    this._outlinePass.selectedObjects = selectedObjects;
  }

  public UpdateOutlinePassColor(colorHex: number): void {
    this._outlinePass.visibleEdgeColor = new Color(colorHex);
  }
}
