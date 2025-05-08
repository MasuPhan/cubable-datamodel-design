
import { Material, Program, WebGLContext } from './types';
import { createDoubleFBO, createFBO } from './renderer-utils';

interface FluidSimulationState {
  dye: any;
  velocity: any;
  divergence: any;
  curl: any;
  pressure: any;
}

export function getResolution(resolution: number, gl: WebGLRenderingContext | WebGL2RenderingContext) {
  let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
  if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

  let width = Math.round(resolution * aspectRatio);
  let height = resolution;

  return { width, height };
}

export function initFramebuffers(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  ext: WebGLContext['ext'],
  simResolution: number,
  dyeResolution: number,
  state: Partial<FluidSimulationState> = {}
): FluidSimulationState {
  const simRes = getResolution(simResolution, gl);
  const dyeRes = getResolution(dyeResolution, gl);

  const texType = ext.halfFloatTexType;
  const rgba = ext.formatRGBA;
  const rg = ext.formatRG;
  const r = ext.formatR;
  const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

  let dye;
  if (!state.dye) {
    dye = createDoubleFBO(
      gl,
      dyeRes.width,
      dyeRes.height,
      rgba.internalFormat,
      rgba.format,
      texType,
      filtering
    );
  } else {
    dye = {
      read: createFBO(
        gl,
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      ),
      write: createFBO(
        gl,
        dyeRes.width,
        dyeRes.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      ),
      swap: state.dye.swap
    };
  }

  let velocity;
  if (!state.velocity) {
    velocity = createDoubleFBO(
      gl,
      simRes.width,
      simRes.height,
      rg.internalFormat,
      rg.format,
      texType,
      filtering
    );
  } else {
    velocity = {
      read: createFBO(
        gl,
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      ),
      write: createFBO(
        gl,
        simRes.width,
        simRes.height,
        rg.internalFormat,
        rg.format,
        texType,
        filtering
      ),
      swap: state.velocity.swap
    };
  }

  const divergence = createFBO(
    gl,
    simRes.width,
    simRes.height,
    r.internalFormat,
    r.format,
    texType,
    gl.NEAREST
  );

  const curl = createFBO(
    gl,
    simRes.width,
    simRes.height,
    r.internalFormat,
    r.format,
    texType,
    gl.NEAREST
  );

  const pressure = createDoubleFBO(
    gl,
    simRes.width,
    simRes.height,
    r.internalFormat,
    r.format,
    texType,
    gl.NEAREST
  );

  return {
    dye,
    velocity,
    divergence,
    curl,
    pressure
  };
}

export function initBloomFramebuffers(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  ext: WebGLContext['ext'],
  resolution: number
): { bloom: any, bloomFramebuffers: any[] } {
  let res = getResolution(resolution, gl);

  const texType = ext.halfFloatTexType;
  const rgba = ext.formatRGBA;
  const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

  const bloom = createFBO(
    gl,
    res.width,
    res.height,
    rgba.internalFormat,
    rgba.format,
    texType,
    filtering
  );

  const bloomFramebuffers: any[] = [];
  for (let i = 0; i < 5; i++) {
    let width = res.width >> (i + 1);
    let height = res.height >> (i + 1);

    if (width < 2 || height < 2) break;

    let fbo = createFBO(
      gl,
      width,
      height,
      rgba.internalFormat,
      rgba.format,
      texType,
      filtering
    );
    bloomFramebuffers.push(fbo);
  }

  return { bloom, bloomFramebuffers };
}

export function correctRadius(radius: number, canvas: HTMLCanvasElement) {
  const aspectRatio = canvas.width / canvas.height;
  if (aspectRatio > 1) {
    radius *= aspectRatio;
  }
  return radius;
}

export function correctDeltaX(delta: number, canvas: HTMLCanvasElement) {
  const aspectRatio = canvas.width / canvas.height;
  if (aspectRatio < 1) delta *= aspectRatio;
  return delta;
}

export function correctDeltaY(delta: number, canvas: HTMLCanvasElement) {
  const aspectRatio = canvas.width / canvas.height;
  if (aspectRatio > 1) delta /= aspectRatio;
  return delta;
}

export function splat(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  x: number,
  y: number,
  dx: number,
  dy: number,
  color: { r: number, g: number, b: number },
  velocity: any,
  dye: any,
  canvas: HTMLCanvasElement,
  splatProgram: Program,
  blit: (target: WebGLFramebuffer | null) => void,
  splatRadius: number
) {
  gl.viewport(0, 0, velocity.width, velocity.height);
  splatProgram.bind();
  gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
  gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
  gl.uniform2f(splatProgram.uniforms.point, x, y);
  gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
  gl.uniform1f(splatProgram.uniforms.radius, correctRadius(splatRadius / 100.0, canvas));
  blit(velocity.write.fbo);
  velocity.swap();

  gl.viewport(0, 0, dye.width, dye.height);
  gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
  gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
  blit(dye.write.fbo);
  dye.swap();
}

export function step(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  dt: number,
  velocity: any,
  dye: any,
  curl: any,
  divergence: any,
  pressure: any,
  advectionProgram: Program,
  divergenceProgram: Program,
  curlProgram: Program,
  vorticityProgram: Program,
  pressureProgram: Program,
  gradientSubtractProgram: Program,
  clearProgram: Program,
  config: { VELOCITY_DISSIPATION: number, DENSITY_DISSIPATION: number, PRESSURE_ITERATIONS: number, CURL: number },
  blit: (target: WebGLFramebuffer | null) => void
) {
  gl.viewport(0, 0, velocity.width, velocity.height);

  advectionProgram.bind();
  gl.uniform2f(
    advectionProgram.uniforms.texelSize,
    1.0 / velocity.width,
    1.0 / velocity.height
  );
  gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
  gl.uniform1i(advectionProgram.uniforms.uSource, velocity.read.attach(1));
  gl.uniform1f(advectionProgram.uniforms.dt, dt);
  gl.uniform1f(
    advectionProgram.uniforms.dissipation,
    config.VELOCITY_DISSIPATION
  );
  blit(velocity.write.fbo);
  velocity.swap();

  gl.viewport(0, 0, dye.width, dye.height);
  gl.uniform2f(
    advectionProgram.uniforms.texelSize,
    1.0 / dye.width,
    1.0 / dye.height
  );
  gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
  gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
  gl.uniform1f(advectionProgram.uniforms.dt, dt);
  gl.uniform1f(
    advectionProgram.uniforms.dissipation,
    config.DENSITY_DISSIPATION
  );
  blit(dye.write.fbo);
  dye.swap();

  gl.viewport(0, 0, velocity.width, velocity.height);
  curlProgram.bind();
  gl.uniform2f(
    curlProgram.uniforms.texelSize,
    1.0 / velocity.width,
    1.0 / velocity.height
  );
  gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
  blit(curl.fbo);

  vorticityProgram.bind();
  gl.uniform2f(
    vorticityProgram.uniforms.texelSize,
    1.0 / velocity.width,
    1.0 / velocity.height
  );
  gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
  gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
  gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
  gl.uniform1f(vorticityProgram.uniforms.dt, dt);
  blit(velocity.write.fbo);
  velocity.swap();

  gl.viewport(0, 0, velocity.width, velocity.height);
  divergenceProgram.bind();
  gl.uniform2f(
    divergenceProgram.uniforms.texelSize,
    1.0 / velocity.width,
    1.0 / velocity.height
  );
  gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
  blit(divergence.fbo);

  pressureProgram.bind();
  gl.uniform2f(
    pressureProgram.uniforms.texelSize,
    1.0 / velocity.width,
    1.0 / velocity.height
  );
  gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
  
  clearProgram.bind();
  gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
  gl.uniform1f(clearProgram.uniforms.value, 0.0);
  blit(pressure.write.fbo);
  pressure.swap();

  for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
    pressureProgram.bind();
    gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(0));
    blit(pressure.write.fbo);
    pressure.swap();
  }

  gl.viewport(0, 0, velocity.width, velocity.height);
  gradientSubtractProgram.bind();
  gl.uniform2f(
    gradientSubtractProgram.uniforms.texelSize,
    1.0 / velocity.width,
    1.0 / velocity.height
  );
  gl.uniform1i(gradientSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
  gl.uniform1i(gradientSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
  blit(velocity.write.fbo);
  velocity.swap();
}

export function render(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  target: WebGLFramebuffer | null,
  dye: any,
  clearProgram: Program | null,
  colorProgram: Program | null,
  displayMaterial: Material | null,
  config: { TRANSPARENT: boolean, BACK_COLOR: { r: number, g: number, b: number } },
  blit: (target: WebGLFramebuffer | null) => void
) {
  if (config.TRANSPARENT) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    if (clearProgram) {
      clearProgram.bind();
      if (target) {
        gl.uniform1i(clearProgram.uniforms.uTexture, 0);
      }
      gl.uniform1f(clearProgram.uniforms.value, 0.0);
      blit(target);
    }
  } else {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    if (colorProgram) {
      colorProgram.bind();
      gl.uniform4f(colorProgram.uniforms.color, config.BACK_COLOR.r / 255, config.BACK_COLOR.g / 255, config.BACK_COLOR.b / 255, 1);
      blit(target);
    }
  }
        
  if (displayMaterial && dye) {
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    displayMaterial.bind();
    gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
    blit(target);
  }
}

export function multipleSplats(
  amount: number,
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  canvas: HTMLCanvasElement,
  velocity: any,
  dye: any,
  splatProgram: Program,
  blit: (target: WebGLFramebuffer | null) => void,
  splatRadius: number,
  generateColor: () => { r: number, g: number, b: number }
) {
  for (let i = 0; i < amount; i++) {
    const color = generateColor();
    color.r *= 10.0;
    color.g *= 10.0;
    color.b *= 10.0;
    const x = Math.random();
    const y = Math.random();
    const dx = 1000 * (Math.random() - 0.5);
    const dy = 1000 * (Math.random() - 0.5);
    splat(gl, x, y, dx, dy, color, velocity, dye, canvas, splatProgram, blit, splatRadius);
  }
}

export function scaleByPixelRatio(input: number) {
  const pixelRatio = window.devicePixelRatio || 1;
  return Math.floor(input * pixelRatio);
}
