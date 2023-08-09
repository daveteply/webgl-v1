import { Injectable } from '@angular/core';
import { Object3D, PerspectiveCamera, Scene, Vector2, WebGLRenderer } from 'three';
import { Easing, Tween } from '@tweenjs/tween.js';
import { LevelTransitionType } from './level-transition-type';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';

import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass';
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass';

@Injectable({
  providedIn: 'root',
})
export class PostProcessingManagerService {
  private _composer!: EffectComposer;
  private _renderPass!: RenderPass;
  private _outlinePass!: OutlinePass;

  private _smaaPass!: SMAAPass;
  private _bokehPass!: BokehPass;
  private _unrealBloomPass!: UnrealBloomPass;

  private _bokehTween!: any;
  private _unrealBloomTween!: any;

  private _outlineColor!: number;
  get OutlineColor(): number {
    return this._outlineColor;
  }

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
    });
    this._bokehPass.enabled = false;

    // unreal bloom
    this._unrealBloomPass = new UnrealBloomPass(new Vector2(width, height), 1.6, 0.1, 0.1);
    this._unrealBloomPass.enabled = false;

    // composer
    this._composer = new EffectComposer(renderer);
    this._composer.addPass(this._renderPass);
    this._composer.addPass(this._outlinePass);
    this._composer.addPass(this._bokehPass);
    this._composer.addPass(this._unrealBloomPass);
    this._composer.addPass(this._smaaPass);
  }

  public UpdateOutlinePassObjects(selectedObjects: Object3D[]): void {
    this._outlinePass.selectedObjects = selectedObjects;
  }

  public UpdateOutlinePassColor(colorHex: number): void {
    this._outlineColor = colorHex;
    this._outlinePass.visibleEdgeColor.set(this._outlineColor);
  }

  public UpdateLevelTransitionPass(levelTransitionType: LevelTransitionType, start: boolean): void {
    this._smaaPass.enabled = true;
    this._bokehPass.enabled = false;
    this._unrealBloomPass.enabled = false;

    switch (levelTransitionType) {
      case LevelTransitionType.Bokeh:
        this._smaaPass.enabled = false;
        this._bokehPass.enabled = true;
        this._unrealBloomPass.enabled = false;

        this._bokehTween?.stop();
        this.initBokehTween(start);
        break;

      case LevelTransitionType.UnrealBloom:
        this._smaaPass.enabled = false;
        this._bokehPass.enabled = false;
        this._unrealBloomPass.enabled = true;

        this._unrealBloomTween?.stop();
        this.initUnrealBloomTween();
        break;
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
      .start();
  }

  private initUnrealBloomTween() {
    const delta = { strength: 0.0 };
    const target = { strength: 1.6 };
    this._unrealBloomTween = new Tween(delta)
      .to(target, 1500)
      .repeat(1)
      .yoyo(true)
      .easing(Easing.Quadratic.Out)
      .onUpdate(() => {
        this._unrealBloomPass.strength = delta.strength;
      })
      .start();
  }
}
