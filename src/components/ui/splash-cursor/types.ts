
export interface RGB {
  r: number;
  g: number;
  b: number;
}

// These interfaces now only define the expected shape of Program and Material
// The actual implementations are in renderer-utils.ts
export interface Material {
  vertexShader: any;
  fragmentShaderSource: string;
  programs: any[];
  activeProgram: any;
  uniforms: Record<string, any>;
  
  setKeywords(keywords: string[]): void;
  bind(): void;
}

export interface Program {
  uniforms: Record<string, any>;
  program: any;
  
  bind(): void;
}

export interface WebGLContext {
  gl: WebGLRenderingContext | WebGL2RenderingContext;
  ext: {
    formatRGBA: any;
    formatRG: any;
    formatR: any;
    halfFloatTexType: any;
    supportLinearFiltering: boolean;
  };
}

export interface Pointer {
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

export interface SplashCursorProps {
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

export interface SplashCursorConfig extends Required<SplashCursorProps> {
  PAUSED: boolean;
}
