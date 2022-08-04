import { Injectable } from '@angular/core';
import { Color, Object3D, PerspectiveCamera, Scene, Vector2, WebGLRenderer } from 'three';
import { Easing, Tween } from '@tweenjs/tween.js';
import { LevelTransitionType } from './level-transition-type';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
import { HalftonePass } from 'three/examples/jsm/postprocessing/HalftonePass';

@Injectable({
  providedIn: 'root',
})
export class PostProcessingManagerService {
  private _composer!: EffectComposer;
  private _renderPass!: RenderPass;
  private _outlinePass!: OutlinePass;

  private _smaaPass!: SMAAPass;
  private _bokehPass!: BokehPass;
  private _halftonePass!: HalftonePass;

  private _bokehTween!: any;
  private _halfToneTween!: any;

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

    // bokeh
    this._bokehPass = new BokehPass(scene, camera, {
      focus: 1.0,
      aperture: 1.0,
      maxblur: 0.1,
      width: width,
      height: height,
    });
    this._bokehPass.enabled = false;

    // halftone
    this._halftonePass = new HalftonePass(width, height, { radius: 24, blending: 0.8, scatter: 0.5 });
    this._halftonePass.enabled = false;

    // composer
    this._composer = new EffectComposer(renderer);
    this._composer.addPass(this._renderPass);
    this._composer.addPass(this._outlinePass);
    this._composer.addPass(this._bokehPass);
    this._composer.addPass(this._halftonePass);
    this._composer.addPass(this._smaaPass);
  }

  public UpdateOutlinePassObjects(selectedObjects: Object3D[]): void {
    this._outlinePass.selectedObjects = selectedObjects;
  }

  public UpdateOutlinePassColor(colorHex: number): void {
    this._outlinePass.visibleEdgeColor = new Color(colorHex);
  }

  public UpdateLevelTransitionPass(levelTransitionType: LevelTransitionType, start: boolean): void {
    switch (levelTransitionType) {
      case LevelTransitionType.Bokeh:
        this._smaaPass.enabled = false;
        this._bokehPass.enabled = true;
        this._halftonePass.enabled = false;

        if (this._bokehTween) {
          this._bokehTween.stop();
        }
        this.initBokehTween(start);
        break;

      case LevelTransitionType.Halftone:
        this._smaaPass.enabled = true;
        this._bokehPass.enabled = false;
        this._halftonePass.enabled = true;

        if (this._halfToneTween) {
          this._halfToneTween.stop();
        }
        this.initHalftoneTween(start);
        break;

      default:
        this.resetPasses();
    }
  }

  private initBokehTween(start: boolean) {
    const delta = { maxblur: start ? 0.2 : 0 };
    const target = { maxblur: start ? 0 : 0.2 };
    this._bokehTween = new Tween(delta)
      .to(target, 2500)
      .easing(Easing.Quadratic.Out)
      .onUpdate(() => {
        this._bokehPass.materialBokeh.uniforms['maxblur'].value = delta.maxblur;
      })
      .onComplete(() => {
        if (start) {
          this.resetPasses();
        }
      })
      .start();
  }

  private initHalftoneTween(start: boolean) {
    const delta = { blending: start ? 1.8 : 0 };
    const target = { blending: start ? 0 : 1.8 };
    this._halfToneTween = new Tween(delta)
      .to(target, 2500)
      .easing(Easing.Quadratic.Out)
      .onUpdate(() => {
        this._halftonePass.material.uniforms['blending'].value = delta.blending;
      })
      .onComplete(() => {
        if (start) {
          this.resetPasses();
        }
      })
      .start();
  }

  private resetPasses(): void {
    this._smaaPass.enabled = true;
    this._bokehPass.enabled = false;
    this._halftonePass.enabled = false;
  }
}
