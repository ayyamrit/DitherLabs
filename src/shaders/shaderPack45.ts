import type { DitherShaderDef } from './ditherShaders';

const U = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
`;

export const shaderPack45: DitherShaderDef[] = Array.from({ length: 20 }, (_, i) => ({
  id: `procedural-gen-45-${i}`,
  name: `Procedural Pattern ${4500 + i}`,
  description: `Procedurally generated abstract pattern ${i}.`,
  tags: ['procedural', 'abstract', 'generated'],
  fragmentShader: `${U}
    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float t = u_time * 0.2 + float(${i});
      vec2 p = uv * 5.0;
      
      float x = sin(p.x * float(${i % 3 + 1}) + t) * cos(p.y * float(${i % 4 + 2}) - t);
      float y = cos(p.x * float(${i % 5 + 2}) - t) * sin(p.y * float(${i % 2 + 1}) + t);
      
      vec3 col = vec3(abs(x), abs(y), abs(x+y)/2.0);
      
      gl_FragColor = vec4(col, 1.0);
    }
  `
}));
