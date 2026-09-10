import { Vector2 } from 'three';

export interface ShockwaveUniforms {
  tDiffuse: { value: unknown };
  center: { value: Vector2 };
  progress: { value: number };
  maxRadius: { value: number };
  waveWidth: { value: number };
  waveDistortion: { value: number };
  waveAberration: { value: number };
  aspectRatio: { value: number };
}

export const ShockwaveShader = {
  name: 'ShockwaveShader',
  uniforms: {
    tDiffuse: { value: null },
    center: { value: new Vector2(0.5, 0.5) },
    progress: { value: 0.0 },
    maxRadius: { value: 0.75 },
    waveWidth: { value: 0.12 },
    waveDistortion: { value: 0.04 },
    waveAberration: { value: 0.015 },
    aspectRatio: { value: 1.0 },
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 center;
    uniform float progress;
    uniform float maxRadius;
    uniform float waveWidth;
    uniform float waveDistortion;
    uniform float waveAberration;
    uniform float aspectRatio;

    varying vec2 vUv;

    void main() {
      if (progress <= 0.0 || progress >= 1.0) {
        gl_FragColor = texture2D(tDiffuse, vUv);
        return;
      }

      vec2 aspectCorrection = vec2(aspectRatio, 1.0);
      vec2 uvDiff = (vUv - center) * aspectCorrection;
      float dist = length(uvDiff);

      float currentRadius = progress * maxRadius;
      float halfWidth = waveWidth * 0.5;

      float waveDist = abs(dist - currentRadius);
      if (waveDist < halfWidth) {
        float normDist = waveDist / halfWidth;
        // Cosine falloff for smooth organic ripple crest
        float waveStrength = cos(normDist * 1.5707963) * (1.0 - progress);

        vec2 dir = normalize(uvDiff);
        vec2 displacement = dir * waveDistortion * waveStrength;

        // Chromatic aberration along the shockwave crest
        vec2 redUv = vUv - displacement * (1.0 + waveAberration * 2.0);
        vec2 greenUv = vUv - displacement;
        vec2 blueUv = vUv - displacement * (1.0 - waveAberration * 2.0);

        float r = texture2D(tDiffuse, redUv).r;
        float g = texture2D(tDiffuse, greenUv).g;
        float b = texture2D(tDiffuse, blueUv).b;
        float a = texture2D(tDiffuse, greenUv).a;

        // Subtle luminance boost along the shockwave edge
        vec3 color = vec3(r, g, b) + vec3(0.08, 0.12, 0.2) * waveStrength;
        gl_FragColor = vec4(color, a);
      } else {
        gl_FragColor = texture2D(tDiffuse, vUv);
      }
    }
  `,
};
