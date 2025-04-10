
export const baseVertexShader = `
  precision highp float;
  attribute vec2 aPosition;
  varying vec2 vUv;
  varying vec2 vL;
  varying vec2 vR;
  varying vec2 vT;
  varying vec2 vB;
  uniform vec2 texelSize;
  void main () {
      vUv = aPosition * 0.5 + 0.5;
      vL = vUv - vec2(texelSize.x, 0.0);
      vR = vUv + vec2(texelSize.x, 0.0);
      vT = vUv + vec2(0.0, texelSize.y);
      vB = vUv - vec2(0.0, texelSize.y);
      gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

export const clearShader = `
  precision mediump float;
  precision mediump sampler2D;
  varying highp vec2 vUv;
  uniform sampler2D uTexture;
  uniform float value;
  void main () {
      gl_FragColor = value * texture2D(uTexture, vUv);
  }
`;

export const displayShader = `
  precision highp float;
  precision highp sampler2D;
  varying vec2 vUv;
  uniform sampler2D uTexture;
  void main () {
      vec3 C = texture2D(uTexture, vUv).rgb;
      float a = max(C.r, max(C.g, C.b));
      gl_FragColor = vec4(C, a);
  }
`;

// Add additional shader code as needed...
