
"use client";
import React, { useEffect, useRef } from "react";
import { SplashCursorProps } from './types';
import { getWebGLContext } from './webgl-utils';
import { createPointerPrototype, generateColor } from './pointer-utils';
import {
  Material,
  Program,
  compileShader,
  createDoubleFBO,
  createFBO
} from './renderer-utils';
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

function SplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1024,
  CAPTURE_RESOLUTION = 512,
  DENSITY_DISSIPATION = 3.5,
  VELOCITY_DISSIPATION = 2,
  PRESSURE = 0.1,
  PRESSURE_ITERATIONS = 20,
  CURL = 3,
  SPLAT_RADIUS = 0.2,
  SPLAT_FORCE = 6000,
  SHADING = true,
  COLOR_UPDATE_SPEED = 10,
  BACK_COLOR = { r: 0, g: 0, b: 0 },
  TRANSPARENT = true,
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const PointerPrototype = createPointerPrototype();
    
    // Config
    const config = {
      SIM_RESOLUTION,
      DYE_RESOLUTION,
      CAPTURE_RESOLUTION,
      DENSITY_DISSIPATION,
      VELOCITY_DISSIPATION,
      PRESSURE,
      PRESSURE_ITERATIONS,
      CURL,
      SPLAT_RADIUS,
      SPLAT_FORCE,
      SHADING,
      COLOR_UPDATE_SPEED,
      PAUSED: false,
      BACK_COLOR,
      TRANSPARENT,
    };

    let pointers = [new PointerPrototype()];
    let splatStack: number[] = [];
    let bloomFramebuffers: any[] = [];
    
    const { gl, ext } = getWebGLContext(canvas);
    
    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 512;
      config.SHADING = false;
    }

    // Move these outside to be accessed in animation loop
    let dye: any;
    let velocity: any;
    let divergence: any;
    let curl: any;
    let pressure: any;
    let bloom: any;
    let ditheringTexture: WebGLTexture | null = null;
    let blurProgram: Program | null = null;
    let copyProgram: Program | null = null;
    let clearProgram: Program | null = null;
    let colorProgram: Program | null = null;
    let checkerboardProgram: Program | null = null;
    let bloomPrefilterProgram: Program | null = null;
    let bloomBlurProgram: Program | null = null;
    let bloomFinalProgram: Program | null = null;
    let sunraysMaskProgram: Program | null = null;
    let sunraysProgram: Program | null = null;
    let splatProgram: Program | null = null;
    let advectionProgram: Program | null = null;
    let divergenceProgram: Program | null = null;
    let curlProgram: Program | null = null;
    let vorticityProgram: Program | null = null;
    let pressureProgram: Program | null = null;
    let gradientSubtractProgram: Program | null = null;
    let displayMaterial: Material | null = null;

    function initFramebuffers() {
      const simRes = getResolution(config.SIM_RESOLUTION);
      const dyeRes = getResolution(config.DYE_RESOLUTION);

      const texType = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const rg = ext.formatRG;
      const r = ext.formatR;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

      if (dye == null) {
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
        dye.read = createFBO(
          gl,
          dyeRes.width,
          dyeRes.height,
          rgba.internalFormat,
          rgba.format,
          texType,
          filtering
        );
        dye.write = createFBO(
          gl,
          dyeRes.width,
          dyeRes.height,
          rgba.internalFormat,
          rgba.format,
          texType,
          filtering
        );
      }

      if (velocity == null) {
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
        velocity.read = createFBO(
          gl,
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering
        );
        velocity.write = createFBO(
          gl,
          simRes.width,
          simRes.height,
          rg.internalFormat,
          rg.format,
          texType,
          filtering
        );
      }

      divergence = createFBO(
        gl,
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      );
      curl = createFBO(
        gl,
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      );
      pressure = createDoubleFBO(
        gl,
        simRes.width,
        simRes.height,
        r.internalFormat,
        r.format,
        texType,
        gl.NEAREST
      );

      initBloomFramebuffers();
    }

    function initBloomFramebuffers() {
      let res = getResolution(config.CAPTURE_RESOLUTION);

      const texType = ext.halfFloatTexType;
      const rgba = ext.formatRGBA;
      const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

      bloom = createFBO(
        gl,
        res.width,
        res.height,
        rgba.internalFormat,
        rgba.format,
        texType,
        filtering
      );

      bloomFramebuffers.length = 0;
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
    }

    function getResolution(resolution: number) {
      let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
      if (aspectRatio < 1) aspectRatio = 1.0 / aspectRatio;

      let width = Math.round(resolution * aspectRatio);
      let height = resolution;

      return { width, height };
    }

    function createTextureAsync(url: string): Promise<WebGLTexture> {
      return new Promise((resolve, reject) => {
        let texture = gl.createTexture();
        if (!texture) {
          reject(new Error("Failed to create texture"));
          return;
        }
        
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([255, 255, 255, 255]));

        let img = new Image();
        img.onload = () => {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
          resolve(texture);
        };
        img.onerror = () => {
          reject(new Error(`Failed to load image: ${url}`));
        };
        img.src = url;
      });
    }

    function initShaders() {
      const baseVertexShaderObj = compileShader(gl, gl.VERTEX_SHADER, baseVertexShader);

      blurProgram = new Program(
        gl,
        baseVertexShaderObj,
        compileShader(gl, gl.FRAGMENT_SHADER, clearShader)
      );
      copyProgram = new Program(
        gl,
        baseVertexShaderObj,
        compileShader(gl, gl.FRAGMENT_SHADER, clearShader)
      );
      clearProgram = new Program(
        gl,
        baseVertexShaderObj,
        compileShader(gl, gl.FRAGMENT_SHADER, clearShader)
      );
      colorProgram = new Program(
        gl,
        baseVertexShaderObj,
        compileShader(gl, gl.FRAGMENT_SHADER, clearShader)
      );
      checkerboardProgram = new Program(
        gl,
        baseVertexShaderObj,
        compileShader(gl, gl.FRAGMENT_SHADER, clearShader)
      );

      displayMaterial = new Material(
        gl,
        baseVertexShaderObj,
        displayShader
      );
      displayMaterial.setKeywords(config.SHADING ? ["SHADING"] : []);

      splatProgram = new Program(
        gl,
        baseVertexShaderObj,
        compileShader(gl, gl.FRAGMENT_SHADER, splatShader)
      );
      advectionProgram = new Program(
        gl,
        baseVertexShaderObj,
        compileShader(
          gl,
          gl.FRAGMENT_SHADER,
          advectionShader
        )
      );
      divergenceProgram = new Program(
        gl,
        baseVertexShaderObj,
        compileShader(gl, gl.FRAGMENT_SHADER, divergenceShader)
      );
      curlProgram = new Program(
        gl,
        baseVertexShaderObj,
        compileShader(gl, gl.FRAGMENT_SHADER, curlShader)
      );
      vorticityProgram = new Program(
        gl,
        baseVertexShaderObj,
        compileShader(gl, gl.FRAGMENT_SHADER, vorticityShader)
      );
      pressureProgram = new Program(
        gl,
        baseVertexShaderObj,
        compileShader(gl, gl.FRAGMENT_SHADER, pressureShader)
      );
      gradientSubtractProgram = new Program(
        gl,
        baseVertexShaderObj,
        compileShader(gl, gl.FRAGMENT_SHADER, gradientSubtractShader)
      );
    }

    function updateKeywords() {
      if (displayMaterial) {
        displayMaterial.setKeywords(config.SHADING ? ["SHADING"] : []);
      }
    }

    function update() {
      const dt = Math.min(0.016, 0.016);
      
      // Apply forces to velocity field
      if (splatStack.length > 0) {
        for (let i = 0; i < splatStack.pop()!; i++) {
          const color = generateColor();
          const x = Math.random();
          const y = Math.random();
          const dx = 1000 * (Math.random() - 0.5);
          const dy = 1000 * (Math.random() - 0.5);
          splat(x, y, dx, dy, color);
        }
      }

      // Update simulation
      if (!config.PAUSED) {
        step(dt);
      }
      render(null);
      requestAnimationFrame(update);
    }

    function splat(x: number, y: number, dx: number, dy: number, color: { r: number, g: number, b: number }) {
      if (!splatProgram) return;
      
      gl.viewport(0, 0, velocity.width, velocity.height);
      splatProgram.bind();
      gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
      gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas.width / canvas.height);
      gl.uniform2f(splatProgram.uniforms.point, x, y);
      gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
      gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
      blit(velocity.write.fbo);
      velocity.swap();

      gl.viewport(0, 0, dye.width, dye.height);
      gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
      gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
      blit(dye.write.fbo);
      dye.swap();
    }

    function correctRadius(radius: number) {
      const aspectRatio = canvas.width / canvas.height;
      if (aspectRatio > 1) {
        radius *= aspectRatio;
      }
      return radius;
    }

    function step(dt: number) {
      if (!advectionProgram || !divergenceProgram || !curlProgram || !vorticityProgram || !pressureProgram || !gradientSubtractProgram) return;

      gl.viewport(0, 0, velocity.width, velocity.height);

      if (velocity && advectionProgram) {
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
      }

      if (velocity && dye && advectionProgram) {
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
      }

      if (velocity && curl && curlProgram && vorticityProgram) {
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
      }

      if (velocity && divergence && divergenceProgram) {
        gl.viewport(0, 0, velocity.width, velocity.height);
        divergenceProgram.bind();
        gl.uniform2f(
          divergenceProgram.uniforms.texelSize,
          1.0 / velocity.width,
          1.0 / velocity.height
        );
        gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
        blit(divergence.fbo);
      }

      if (pressure && clearProgram && pressureProgram) {
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
      }

      if (velocity && pressure && gradientSubtractProgram) {
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
    }

    function render(target: WebGLFramebuffer | null) {
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

    function blit(target: WebGLFramebuffer | null) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, target);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    }

    function multipleSplats(amount: number) {
      for (let i = 0; i < amount; i++) {
        const color = generateColor();
        color.r *= 10.0;
        color.g *= 10.0;
        color.b *= 10.0;
        const x = Math.random();
        const y = Math.random();
        const dx = 1000 * (Math.random() - 0.5);
        const dy = 1000 * (Math.random() - 0.5);
        splat(x, y, dx, dy, color);
      }
    }

    function resizeCanvas() {
      if (
        canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight
      ) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        initFramebuffers();
      }
    }

    function updatePointerDownData(pointer: any, id: number, posX: number, posY: number) {
      pointer.id = id;
      pointer.down = true;
      pointer.moved = false;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1.0 - posY / canvas.height;
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.deltaX = 0;
      pointer.deltaY = 0;
      pointer.color = generateColor();
    }

    function updatePointerMoveData(pointer: any, posX: number, posY: number) {
      pointer.prevTexcoordX = pointer.texcoordX;
      pointer.prevTexcoordY = pointer.texcoordY;
      pointer.texcoordX = posX / canvas.width;
      pointer.texcoordY = 1.0 - posY / canvas.height;
      pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
      pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
      pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
    }

    function correctDeltaX(delta: number) {
      const aspectRatio = canvas.width / canvas.height;
      if (aspectRatio < 1) delta *= aspectRatio;
      return delta;
    }

    function correctDeltaY(delta: number) {
      const aspectRatio = canvas.width / canvas.height;
      if (aspectRatio > 1) delta /= aspectRatio;
      return delta;
    }

    function applyInputs() {
      if (splatStack.length > 0) return;

      for (let i = 0; i < pointers.length; i++) {
        const pointer = pointers[i];
        if (pointer.moved) {
          splat(
            pointer.texcoordX,
            pointer.texcoordY,
            pointer.deltaX * config.SPLAT_FORCE,
            pointer.deltaY * config.SPLAT_FORCE,
            pointer.color
          );
          pointer.moved = false;
        }
      }
    }

    // Event Listeners
    function setupEventListeners() {
      canvas.addEventListener('mousedown', (e) => {
        let posX = scaleByPixelRatio(e.offsetX);
        let posY = scaleByPixelRatio(e.offsetY);
        let pointer = pointers.find((p) => p.id === -1);
        if (pointer == null) pointer = new PointerPrototype();
        updatePointerDownData(pointer, -1, posX, posY);
      });

      canvas.addEventListener('mousemove', (e) => {
        let pointer = pointers[0];
        if (!pointer.down) return;
        let posX = scaleByPixelRatio(e.offsetX);
        let posY = scaleByPixelRatio(e.offsetY);
        updatePointerMoveData(pointer, posX, posY);
      });

      window.addEventListener('mouseup', () => {
        pointers[0].down = false;
      });

      canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touches = e.targetTouches;
        for (let i = 0; i < touches.length; i++) {
          let posX = scaleByPixelRatio(touches[i].pageX - canvas.getBoundingClientRect().left);
          let posY = scaleByPixelRatio(touches[i].pageY - canvas.getBoundingClientRect().top);
          let pointer = pointers.find((p) => p.id === -1) || new PointerPrototype();
          updatePointerDownData(pointer, touches[i].identifier, posX, posY);
          if (!pointers.includes(pointer)) {
            pointers.push(pointer);
          }
        }
      });

      canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const touches = e.targetTouches;
        for (let i = 0; i < touches.length; i++) {
          let pointer = pointers.find((p) => p.id === touches[i].identifier);
          if (!pointer) continue;
          let posX = scaleByPixelRatio(touches[i].pageX - canvas.getBoundingClientRect().left);
          let posY = scaleByPixelRatio(touches[i].pageY - canvas.getBoundingClientRect().top);
          updatePointerMoveData(pointer, posX, posY);
        }
      }, false);

      window.addEventListener('touchend', (e) => {
        const touches = e.changedTouches;
        for (let i = 0; i < touches.length; i++) {
          let pointer = pointers.find((p) => p.id === touches[i].identifier);
          if (pointer) {
            pointer.down = false;
          }
        }
      });

      window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyP') config.PAUSED = !config.PAUSED;
        if (e.key === ' ') splatStack.push(parseInt((Math.random() * 20) + "")); // Random number of splats
      });

      // Make canvas actually usable with pointer events
      canvas.style.pointerEvents = 'auto';
    }

    function scaleByPixelRatio(input: number) {
      const pixelRatio = window.devicePixelRatio || 1;
      return Math.floor(input * pixelRatio);
    }

    // Initialize GL
    function initializeWebGL() {
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

    function startAnimation() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;

      initializeWebGL();
      initShaders();
      initFramebuffers();
      
      setupEventListeners();
      
      // Initial splats
      multipleSplats(Math.random() * 10 + 5);
      
      update();
    }

    startAnimation();

    // Cleanup function
    return () => {
      canvas.removeEventListener("mousedown", () => {});
      canvas.removeEventListener("mousemove", () => {});
      window.removeEventListener("mouseup", () => {});
      canvas.removeEventListener("touchstart", () => {});
      canvas.removeEventListener("touchmove", () => {});
      window.removeEventListener("touchend", () => {});
      window.removeEventListener("keydown", () => {});
    };
  }, [
    SIM_RESOLUTION,
    DYE_RESOLUTION,
    CAPTURE_RESOLUTION,
    DENSITY_DISSIPATION,
    VELOCITY_DISSIPATION,
    PRESSURE,
    PRESSURE_ITERATIONS,
    CURL,
    SPLAT_RADIUS,
    SPLAT_FORCE,
    SHADING,
    COLOR_UPDATE_SPEED,
    BACK_COLOR,
    TRANSPARENT,
  ]);

  return (
    <div className="fixed top-0 left-0 z-50 pointer-events-none">
      <canvas ref={canvasRef} id="fluid" className="w-screen h-screen" />
    </div>
  );
}

export { SplashCursor };
