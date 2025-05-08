
"use client";
import React, { useEffect, useRef } from "react";
import { SplashCursorProps } from './types';
import { getWebGLContext } from './webgl-utils';
import { createPointerPrototype, generateColor } from './pointer-utils';
import { initializeWebGL, initShaders, updateKeywords, blit } from './initialize';
import { 
  initFramebuffers, 
  initBloomFramebuffers, 
  splat, 
  step, 
  render,
  multipleSplats,
  scaleByPixelRatio
} from './fluid-simulation';
import { initializeEventListeners, applyInputs } from './event-handlers';

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

    // Initialize WebGL setup
    initializeWebGL(gl);
    
    // Initialize shaders
    const programs = initShaders(gl, config);
    
    // Set up canvas dimensions
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    
    // Initialize buffers
    let {
      dye,
      velocity,
      divergence,
      curl,
      pressure
    } = initFramebuffers(gl, ext, config.SIM_RESOLUTION, config.DYE_RESOLUTION);
    
    // Initialize bloom effect
    let { bloom, bloomFramebuffers: bloomFbs } = initBloomFramebuffers(gl, ext, config.CAPTURE_RESOLUTION);
    bloomFramebuffers = bloomFbs;
    
    // Set up event listeners
    initializeEventListeners(canvas, pointers, splatStack, PointerPrototype, config);
    
    // Create some initial splats
    multipleSplats(
      Math.random() * 10 + 5, 
      gl, 
      canvas, 
      velocity, 
      dye, 
      programs.splatProgram,
      (target) => blit(gl, target),
      config.SPLAT_RADIUS,
      generateColor
    );
    
    // Animation loop
    function update() {
      const dt = Math.min(0.016, 0.016);
      
      // Apply forces from splat stack
      if (splatStack.length > 0) {
        for (let i = 0; i < splatStack.pop()!; i++) {
          const color = generateColor();
          const x = Math.random();
          const y = Math.random();
          const dx = 1000 * (Math.random() - 0.5);
          const dy = 1000 * (Math.random() - 0.5);
          splat(
            gl, 
            x, 
            y, 
            dx, 
            dy, 
            color, 
            velocity, 
            dye, 
            canvas, 
            programs.splatProgram,
            (target) => blit(gl, target),
            config.SPLAT_RADIUS
          );
        }
      }
      
      // Apply forces from pointers
      applyInputs(
        pointers, 
        splatStack, 
        (x: number, y: number, dx: number, dy: number, color: { r: number, g: number, b: number }) => {
          splat(
            gl, 
            x, 
            y, 
            dx, 
            dy, 
            color, 
            velocity, 
            dye, 
            canvas, 
            programs.splatProgram,
            (target) => blit(gl, target),
            config.SPLAT_RADIUS
          );
        },
        config
      );

      // Update simulation
      if (!config.PAUSED) {
        step(
          gl, 
          dt, 
          velocity, 
          dye, 
          curl, 
          divergence, 
          pressure,
          programs.advectionProgram,
          programs.divergenceProgram,
          programs.curlProgram,
          programs.vorticityProgram,
          programs.pressureProgram,
          programs.gradientSubtractProgram,
          programs.clearProgram,
          config,
          (target) => blit(gl, target)
        );
      }
      
      // Render to screen
      render(
        gl,
        null, 
        dye, 
        programs.clearProgram, 
        programs.colorProgram, 
        programs.displayMaterial, 
        config,
        (target) => blit(gl, target)
      );
      
      requestAnimationFrame(update);
    }
    
    // Check if canvas needs to be resized
    function resizeCanvas() {
      if (
        canvas.width !== canvas.clientWidth ||
        canvas.height !== canvas.clientHeight
      ) {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
        
        // Recreate framebuffers with new dimensions
        const fluidState = initFramebuffers(
          gl, 
          ext, 
          config.SIM_RESOLUTION, 
          config.DYE_RESOLUTION,
          { dye, velocity }
        );
        
        dye = fluidState.dye;
        velocity = fluidState.velocity;
        divergence = fluidState.divergence;
        curl = fluidState.curl;
        pressure = fluidState.pressure;
        
        const bloomState = initBloomFramebuffers(gl, ext, config.CAPTURE_RESOLUTION);
        bloom = bloomState.bloom;
        bloomFramebuffers = bloomState.bloomFramebuffers;
      }
    }
    
    // Start animation
    update();
    
    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    
    resizeObserver.observe(canvas);
    
    // Cleanup function
    return () => {
      resizeObserver.disconnect();
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
