import type { DitherShaderDef } from './ditherShaders';

const U = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
`;

export const shaderPack44: DitherShaderDef[] = Array.from({ length: 20 }, (_, i) => ({
  id: `procedural-gen-44-${i}`,
  name: `Procedural Form ${4400 + i}`,
  description: `Procedurally generated geometric form ${i}.`,
  tags: ['procedural', 'geometric', 'generated'],
  fragmentShader: `${U}
    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float t = u_time * 0.5 + float(${i});
      vec2 p = uv * 2.0 - 1.0;
      p.x *= u_resolution.x / u_resolution.y;
      
      float d = length(p);
      float a = atan(p.y, p.x);
      
      float f = sin(a * float(${i % 5 + 2}) + t) * cos(d * float(${i * 2 + 5}) - t);
      vec3 col = 0.5 + 0.5 * cos(u_time + uv.xyx + vec3(0, 2, 4) + float(${i}));
      
      gl_FragColor = vec4(col * abs(f), 1.0);
    }
  `
}));
