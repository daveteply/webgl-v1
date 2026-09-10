import { MeshBasicMaterial, MeshPhongMaterial } from 'three';

export const SharedTensionUniforms = {
  uLockIntensity: { value: 0.0 },
  uLockTime: { value: 0.0 },
};

export function attachTensionShader(material: MeshPhongMaterial | MeshBasicMaterial): void {
  material.onBeforeCompile = (shader) => {
    shader.uniforms['uLockIntensity'] = SharedTensionUniforms.uLockIntensity;
    shader.uniforms['uLockTime'] = SharedTensionUniforms.uLockTime;

    shader.vertexShader =
      `
      uniform float uLockIntensity;
    ` + shader.vertexShader;

    const beginVertexChunk = '#include <begin_vertex>';
    const tensionVertexChunk = `
      #include <begin_vertex>
      if (uLockIntensity > 0.001) {
        // Magnetic Stasis Pinch: pull vertices inward by 8% to open gaps
        transformed *= (1.0 - 0.08 * uLockIntensity);
      }
    `;

    if (shader.vertexShader.includes(beginVertexChunk)) {
      shader.vertexShader = shader.vertexShader.replace(beginVertexChunk, tensionVertexChunk);
    }

    shader.fragmentShader =
      `
      uniform float uLockIntensity;
      uniform float uLockTime;
    ` + shader.fragmentShader;

    const ditheringChunk = '#include <dithering_fragment>';
    const gapGlowChunk = `
      #include <dithering_fragment>
      if (uLockIntensity > 0.001) {
        vec3 vDir = normalize(-vViewPosition);
        vec3 norm = normalize(vNormal);
        float fresnel = pow(clamp(1.0 - abs(dot(norm, vDir)), 0.0, 1.0), 2.2);

        // Electric cyan plasma conduits flowing through the opened gaps and bevels
        float pulse = sin(uLockTime * 6.0) * 0.15 + 0.85;
        float edgeGlow = fresnel * pulse * uLockIntensity;

        gl_FragColor.rgb += vec3(0.0, 0.9, 1.0) * (edgeGlow * 0.75);
      }
    `;

    if (shader.fragmentShader.includes(ditheringChunk)) {
      shader.fragmentShader = shader.fragmentShader.replace(ditheringChunk, gapGlowChunk);
    }
  };
}
