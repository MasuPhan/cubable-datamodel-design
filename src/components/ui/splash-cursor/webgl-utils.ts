
import { WebGLContext } from './types';

export function getWebGLContext(canvas: HTMLCanvasElement): WebGLContext {
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

export function getSupportedFormat(gl: WebGLRenderingContext | WebGL2RenderingContext, internalFormat: number, format: number, type: number) {
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

export function supportRenderTextureFormat(gl: WebGLRenderingContext | WebGL2RenderingContext, internalFormat: number, format: number, type: number) {
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
