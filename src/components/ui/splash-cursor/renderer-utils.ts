
import { WebGLContext } from './types';
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

export class Material {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  vertexShader: WebGLShader;
  fragmentShaderSource: string;
  programs: WebGLProgram[] = [];
  activeProgram: WebGLProgram | null = null;
  uniforms: Record<string, any> = {};

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShaderSource: string) {
    this.gl = gl;
    this.vertexShader = vertexShader;
    this.fragmentShaderSource = fragmentShaderSource;
  }

  setKeywords(keywords: string[]) {
    let hash = 0;
    for (let i = 0; i < keywords.length; i++) {
      hash += keywords[i].hashCode();
    }

    let program = this.programs[hash];
    if (program == null) {
      let fragmentShader = compileShader(
        this.gl,
        this.gl.FRAGMENT_SHADER,
        this.fragmentShaderSource,
        keywords
      );
      program = createProgram(this.gl, this.vertexShader, fragmentShader);
      this.programs[hash] = program;
    }

    if (program === this.activeProgram) return;

    this.uniforms = getUniforms(this.gl, program);
    this.activeProgram = program;
  }

  bind() {
    if (this.activeProgram) {
      this.gl.useProgram(this.activeProgram);
    }
  }
}

export class Program {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  program: WebGLProgram;
  uniforms: Record<string, WebGLUniformLocation>;

  constructor(gl: WebGLRenderingContext | WebGL2RenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) {
    this.gl = gl;
    this.program = createProgram(gl, vertexShader, fragmentShader);
    this.uniforms = getUniforms(gl, this.program);
  }

  bind() {
    this.gl.useProgram(this.program);
  }
}

export function compileShader(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  type: number,
  source: string,
  keywords: string[] = []
): WebGLShader {
  source = addKeywords(source, keywords);

  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error("Failed to create shader");
  }
  
  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('Shader compile error: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    throw new Error("Failed to compile shader");
  }

  return shader;
}

export function createProgram(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram {
  const program = gl.createProgram();
  if (!program) {
    throw new Error("Failed to create program");
  }
  
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error: ' + gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    throw new Error("Failed to link program");
  }

  return program;
}

export function getUniforms(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  program: WebGLProgram
): Record<string, WebGLUniformLocation> {
  const uniforms: Record<string, WebGLUniformLocation> = {};
  const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);

  for (let i = 0; i < uniformCount; i++) {
    const uniformInfo = gl.getActiveUniform(program, i);
    if (!uniformInfo) continue;
    
    const location = gl.getUniformLocation(program, uniformInfo.name);
    if (location) {
      uniforms[uniformInfo.name] = location;
    }
  }

  return uniforms;
}

export function addKeywords(source: string, keywords: string[]): string {
  if (keywords.length === 0) return source;

  let keywordsString = '';
  keywords.forEach((keyword) => {
    keywordsString += '#define ' + keyword + '\n';
  });

  return keywordsString + source;
}

export function createTextureAsync(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  url: string
): Promise<WebGLTexture> {
  return new Promise((resolve, reject) => {
    const texture = gl.createTexture();
    if (!texture) {
      reject(new Error("Failed to create texture"));
      return;
    }
    
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([255, 255, 255, 255])
    );

    const img = new Image();
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

export function createFBO(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  width: number,
  height: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number
): { texture: WebGLTexture, fbo: WebGLFramebuffer, width: number, height: number, attach: (id: number) => void } {
  const texture = gl.createTexture();
  if (!texture) {
    throw new Error("Failed to create texture");
  }
  
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, width, height, 0, format, type, null);

  const fbo = gl.createFramebuffer();
  if (!fbo) {
    throw new Error("Failed to create framebuffer");
  }
  
  gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.viewport(0, 0, width, height);
  gl.clear(gl.COLOR_BUFFER_BIT);

  return {
    texture,
    fbo,
    width,
    height,
    attach(id: number) {
      gl.activeTexture(gl.TEXTURE0 + id);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      return id;
    }
  };
}

export function createDoubleFBO(
  gl: WebGLRenderingContext | WebGL2RenderingContext,
  width: number,
  height: number,
  internalFormat: number,
  format: number,
  type: number,
  param: number
): {
  read: ReturnType<typeof createFBO>,
  write: ReturnType<typeof createFBO>,
  swap: () => void
} {
  const fbo1 = createFBO(gl, width, height, internalFormat, format, type, param);
  const fbo2 = createFBO(gl, width, height, internalFormat, format, type, param);

  return {
    read: fbo1,
    write: fbo2,
    swap() {
      const temp = this.read;
      this.read = this.write;
      this.write = temp;
    }
  };
}

// Extend String prototype for hashing functionality
declare global {
  interface String {
    hashCode(): number;
  }
}

String.prototype.hashCode = function(): number {
  let hash = 0;
  for (let i = 0; i < this.length; i++) {
    hash = this.charCodeAt(i) + ((hash << 5) - hash);
  }
  return hash;
};
