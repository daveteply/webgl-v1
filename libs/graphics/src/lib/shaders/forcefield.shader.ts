import { Color, MeshBasicMaterial, MeshPhongMaterial } from 'three';

export interface ForcefieldPreset {
  name: string;
  color: number;
  power: number;
  pulseSpeed: number;
}

export const FORCEFIELD_PRESETS: ForcefieldPreset[] = [
  { name: 'Electric Cyan', color: 0x00e5ff, power: 2.2, pulseSpeed: 7.0 },
  { name: 'Plasma Violet', color: 0xb5179e, power: 2.5, pulseSpeed: 5.5 },
  { name: 'Laser Pink', color: 0xff007f, power: 2.0, pulseSpeed: 8.0 },
  { name: 'Solar Amber', color: 0xffa200, power: 2.8, pulseSpeed: 6.0 },
  { name: 'Matrix Emerald', color: 0x00ff88, power: 2.3, pulseSpeed: 9.0 },
  { name: 'Hyper Cobalt', color: 0x4361ee, power: 2.4, pulseSpeed: 6.5 },
];

export const SharedForcefieldUniforms = {
  uLockIntensity: { value: 0.0 },
  uLockColor: { value: new Color(0x00e5ff) },
  uLockTime: { value: 0.0 },
  uLockPower: { value: 2.0 },
  uLockPulseSpeed: { value: 7.0 },
};

export function attachForcefieldShader(material: MeshPhongMaterial | MeshBasicMaterial): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms['uLockIntensity'] = SharedForcefieldUniforms.uLockIntensity;
    shader.uniforms['uLockColor'] = SharedForcefieldUniforms.uLockColor;
    shader.uniforms['uLockTime'] = SharedForcefieldUniforms.uLockTime;
    shader.uniforms['uLockPower'] = SharedForcefieldUniforms.uLockPower;
    shader.uniforms['uLockPulseSpeed'] = SharedForcefieldUniforms.uLockPulseSpeed;

    shader.fragmentShader =
      `
      uniform float uLockIntensity;
      uniform vec3 uLockColor;
      uniform float uLockTime;
      uniform float uLockPower;
      uniform float uLockPulseSpeed;
    ` + shader.fragmentShader;

    const targetChunk = '#include <dithering_fragment>';
    const forcefieldChunk = `
      #include <dithering_fragment>
      if (uLockIntensity > 0.001) {
        vec3 vDir = normalize(-vViewPosition);
        vec3 norm = normalize(vNormal);
        float fresnel = 1.0 - abs(dot(norm, vDir));
        fresnel = pow(clamp(fresnel, 0.0, 1.0), uLockPower);

        // Holographic scanline & grid waves visible across flat cube faces
        float scanlineY = sin(vViewPosition.y * 24.0 - uLockTime * uLockPulseSpeed) * 0.5 + 0.5;
        float scanlineX = sin(vViewPosition.x * 24.0 + uLockTime * (uLockPulseSpeed * 0.7)) * 0.5 + 0.5;
        float holoGrid = max(scanlineY, scanlineX) * 0.45 + 0.15;

        // Rhythmic breathing pulse
        float pulse = sin(uLockTime * 6.0) * 0.2 + 0.8;

        // Combined shield: powerful 3D rim + active face holographic energy
        float totalShield = (fresnel * 0.85 + holoGrid * 0.5) * pulse * uLockIntensity;

        // High-contrast electric cyan plasma blend
        gl_FragColor.rgb *= (1.0 - 0.25 * uLockIntensity);
        gl_FragColor.rgb = mix(gl_FragColor.rgb, uLockColor, clamp(totalShield * 0.7, 0.0, 1.0)) + uLockColor * (totalShield * 0.8);
      }
    `;

    if (shader.fragmentShader.includes(targetChunk)) {
      shader.fragmentShader = shader.fragmentShader.replace(targetChunk, forcefieldChunk);
    } else {
      shader.fragmentShader = shader.fragmentShader.replace('}', forcefieldChunk + '\n}');
    }
  };
}
