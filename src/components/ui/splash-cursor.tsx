"use client";
import { useEffect, useRef } from "react";

// Define interfaces for TypeScript
interface Material {
  vertexShader: any;
  fragmentShaderSource: string;
  programs: any[];
  activeProgram: any;
  uniforms: Record<string, any>;
  
  setKeywords(keywords: string[]): void;
  bind(): void;
}

interface Program {
  uniforms: Record<string, any>;
  program: any;
  
  bind(): void;
}

interface WebGLContext {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  ext: {
    formatRGBA: any;
    formatRG: any;
    formatR: any;
    halfFloatTexType: any;
    supportLinearFiltering: boolean;
  };
}

interface Pointer {
  id: number;
  texcoordX: number;
  texcoordY: number;
  prevTexcoordX: number;
  prevTexcoordY: number;
  deltaX: number;
  deltaY: number;
  down: boolean;
  moved: boolean;
  color: RGB;
}

interface RGB {
  r: number;
  g: number;
  b: number;
}

interface SplashCursorProps {
  SIM_RESOLUTION?: number;
  DYE_RESOLUTION?: number;
  CAPTURE_RESOLUTION?: number;
  DENSITY_DISSIPATION?: number;
  VELOCITY_DISSIPATION?: number;
  PRESSURE?: number;
  PRESSURE_ITERATIONS?: number;
  CURL?: number;
  SPLAT_RADIUS?: number;
  SPLAT_FORCE?: number;
  SHADING?: boolean;
  COLOR_UPDATE_SPEED?: number;
  BACK_COLOR?: RGB;
  TRANSPARENT?: boolean;
}

function SplashCursor({
  SIM_RESOLUTION = 128,
  DYE_RESOLUTION = 1440,
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
  BACK_COLOR = { r: 0.5, g: 0, b: 0 },
  TRANSPARENT = true,
}: SplashCursorProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    function pointerPrototype(this: Pointer) {
      this.id = -1;
      this.texcoordX = 0;
      this.texcoordY = 0;
      this.prevTexcoordX = 0;
      this.prevTexcoordY = 0;
      this.deltaX = 0;
      this.deltaY = 0;
      this.down = false;
      this.moved = false;
      this.color = { r: 0, g: 0, b: 0 };
    }

    let config = {
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

    let pointers: Pointer[] = [new (pointerPrototype as any)()];

    const { gl, ext } = getWebGLContext(canvas);
    if (!ext.supportLinearFiltering) {
      config.DYE_RESOLUTION = 256;
      config.SHADING = false;
    }

    function getWebGLContext(canvas: HTMLCanvasElement): WebGLContext {
      const params = {
        alpha: true,
        depth: false,
        stencil: false,
        antialias: false,
        preserveDrawingBuffer: false,
      };
      
      let gl = canvas.getContext("webgl2", params) as WebGL2RenderingContext | null;
      const isWebGL2 = !!gl;
      
      let webGLContext: WebGLRenderingContext | WebGL2RenderingContext;
      
      if (isWebGL2) {
        webGLContext = gl as WebGL2RenderingContext;
      } else {
        const fallbackContext = canvas.getContext("webgl", params) || 
                                canvas.getContext("experimental-webgl", params);
        
        if (!fallbackContext) {
          throw new Error("WebGL not supported");
        }
        
        webGLContext = fallbackContext as WebGLRenderingContext;
      }
      
      let halfFloat: any;
      let supportLinearFiltering: any;
      
      if (isWebGL2) {
        (webGLContext as WebGL2RenderingContext).getExtension("EXT_color_buffer_float");
        supportLinearFiltering = (webGLContext as WebGL2RenderingContext).getExtension("OES_texture_float_linear");
      } else {
        halfFloat = (webGLContext as WebGLRenderingContext).getExtension("OES_texture_half_float");
        supportLinearFiltering = (webGLContext as WebGLRenderingContext).getExtension("OES_texture_half_float_linear");
      }
      
      webGLContext.clearColor(0.0, 0.0, 0.0, 1.0);
      const halfFloatTexType = isWebGL2
        ? (webGLContext as WebGL2RenderingContext).HALF_FLOAT
        : halfFloat && halfFloat.HALF_FLOAT_OES;
      
      let formatRGBA;
      let formatRG;
      let formatR;

      if (isWebGL2) {
        const webgl2 = webGLContext as WebGL2RenderingContext;
        formatRGBA = getSupportedFormat(
          webGLContext,
          webgl2.RGBA16F,
          webGLContext.RGBA,
          halfFloatTexType
        );
        formatRG = getSupportedFormat(webGLContext, webgl2.RG16F, webgl2.RG, halfFloatTexType);
        formatR = getSupportedFormat(webGLContext, webgl2.R16F, webgl2.RED, halfFloatTexType);
      } else {
        formatRGBA = getSupportedFormat(webGLContext, webGLContext.RGBA, webGLContext.RGBA, halfFloatTexType);
        formatRG = getSupportedFormat(webGLContext, webGLContext.RGBA, webGLContext.RGBA, halfFloatTexType);
        formatR = getSupportedFormat(webGLContext, webGLContext.RGBA, webGLContext.RGBA, halfFloatTexType);
      }

      return {
        gl: webGLContext,
        ext: {
          formatRGBA,
          formatRG,
          formatR,
          halfFloatTexType,
          supportLinearFiltering: !!supportLinearFiltering,
        },
      };
    }

    function getSupportedFormat(gl: WebGLRenderingContext | WebGL2RenderingContext, internalFormat: number, format: number, type: number) {
      if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
        const isWebGL2 = !!(gl as WebGL2RenderingContext).bindBufferBase;
        if (isWebGL2) {
          const webgl2 = gl as WebGL2RenderingContext;
          switch (internalFormat) {
            case webgl2.R16F:
              return getSupportedFormat(gl, webgl2.RG16F, webgl2.RG, type);
            case webgl2.RG16F:
              return getSupportedFormat(gl, webgl2.RGBA16F, gl.RGBA, type);
            default:
              return null;
          }
        } else {
          return null;
        }
      }
      return {
        internalFormat,
        format,
      };
    }

    function supportRenderTextureFormat(gl: WebGLRenderingContext | WebGL2RenderingContext, internalFormat: number, format: number, type: number) {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        internalFormat,
        4,
        4,
        0,
        format,
        type,
        null
      );
      const fbo = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        texture,
        0
      );
      const status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
      return status === gl.FRAMEBUFFER_COMPLETE;
    }

    // ... rest of the component remains unchanged
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
