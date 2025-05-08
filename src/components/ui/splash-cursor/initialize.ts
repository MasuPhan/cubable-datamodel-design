
import { Program, Material } from './types';
import { compileShader } from './renderer-utils';
import {
  baseVertexShader,
  clearShader,
  displayShader,
  splatShader,
  advectionShader,
  divergenceShader,
  curlShader,
  vorticityShader,
  pressureShader,
  gradientSubtractShader
} from './shaders';

interface ShaderPrograms {
  blurProgram: Program;
  copyProgram: Program;
  clearProgram: Program;
  colorProgram: Program;
  checkerboardProgram: Program;
  bloomPrefilterProgram: Program | null;
  bloomBlurProgram: Program | null;
  bloomFinalProgram: Program | null;
  sunraysMaskProgram: Program | null;
  sunraysProgram: Program | null;
  splatProgram: Program;
  advectionProgram: Program;
  divergenceProgram: Program;
  curlProgram: Program;
  vorticityProgram: Program;
  pressureProgram: Program;
  gradientSubtractProgram: Program;
  displayMaterial: Material;
}

export function initializeWebGL(gl: WebGLRenderingContext | WebGL2RenderingContext) {
  const quadVertex = [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,
    1.0, 1.0,
  ];

  const vertexBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVertex), gl.STATIC_DRAW);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(0);
}

export function initShaders(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  config: { SHADING: boolean }
): ShaderPrograms {
  const baseVertexShaderObj = compileShader(gl, gl.VERTEX_SHADER, baseVertexShader);

  const blurProgram = new Program(
    gl,
    baseVertexShaderObj,
    compileShader(gl, gl.FRAGMENT_SHADER, clearShader)
  );
  
  const copyProgram = new Program(
    gl,
    baseVertexShaderObj,
    compileShader(gl, gl.FRAGMENT_SHADER, clearShader)
  );
  
  const clearProgram = new Program(
    gl,
    baseVertexShaderObj,
    compileShader(gl, gl.FRAGMENT_SHADER, clearShader)
  );
  
  const colorProgram = new Program(
    gl,
    baseVertexShaderObj,
    compileShader(gl, gl.FRAGMENT_SHADER, clearShader)
  );
  
  const checkerboardProgram = new Program(
    gl,
    baseVertexShaderObj,
    compileShader(gl, gl.FRAGMENT_SHADER, clearShader)
  );

  const displayMaterial = new Material(
    gl,
    baseVertexShaderObj,
    displayShader
  );
  displayMaterial.setKeywords(config.SHADING ? ["SHADING"] : []);

  const splatProgram = new Program(
    gl,
    baseVertexShaderObj,
    compileShader(gl, gl.FRAGMENT_SHADER, splatShader)
  );
  
  const advectionProgram = new Program(
    gl,
    baseVertexShaderObj,
    compileShader(
      gl,
      gl.FRAGMENT_SHADER,
      advectionShader
    )
  );
  
  const divergenceProgram = new Program(
    gl,
    baseVertexShaderObj,
    compileShader(gl, gl.FRAGMENT_SHADER, divergenceShader)
  );
  
  const curlProgram = new Program(
    gl,
    baseVertexShaderObj,
    compileShader(gl, gl.FRAGMENT_SHADER, curlShader)
  );
  
  const vorticityProgram = new Program(
    gl,
    baseVertexShaderObj,
    compileShader(gl, gl.FRAGMENT_SHADER, vorticityShader)
  );
  
  const pressureProgram = new Program(
    gl,
    baseVertexShaderObj,
    compileShader(gl, gl.FRAGMENT_SHADER, pressureShader)
  );
  
  const gradientSubtractProgram = new Program(
    gl,
    baseVertexShaderObj,
    compileShader(gl, gl.FRAGMENT_SHADER, gradientSubtractShader)
  );

  return {
    blurProgram,
    copyProgram,
    clearProgram,
    colorProgram,
    checkerboardProgram,
    bloomPrefilterProgram: null,
    bloomBlurProgram: null,
    bloomFinalProgram: null,
    sunraysMaskProgram: null,
    sunraysProgram: null,
    splatProgram,
    advectionProgram,
    divergenceProgram,
    curlProgram,
    vorticityProgram,
    pressureProgram,
    gradientSubtractProgram,
    displayMaterial
  };
}

export function updateKeywords(displayMaterial: Material, config: { SHADING: boolean }) {
  if (displayMaterial) {
    displayMaterial.setKeywords(config.SHADING ? ["SHADING"] : []);
  }
}

export function blit(gl: WebGLRenderingContext | WebGL2RenderingContext, target: WebGLFramebuffer | null) {
  gl.bindFramebuffer(gl.FRAMEBUFFER, target);
  gl.drawArrays(gl.TRIANGLES, 0, 6);
}
