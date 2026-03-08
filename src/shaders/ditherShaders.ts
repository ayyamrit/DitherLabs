// Collection of dither shader fragment sources
import { shaderPack2 } from './shaderPack2';
import { shaderPack3 } from './shaderPack3';
import { shaderPack4 } from './shaderPack4';
import { shaderPack5 } from './shaderPack5';
import { shaderPack6 } from './shaderPack6';
import { shaderPack7 } from './shaderPack7';
import { shaderPack8 } from './shaderPack8';
import { shaderPack9 } from './shaderPack9';
import { shaderPack10 } from './shaderPack10';
import { shaderPack11 } from './shaderPack11';
import { shaderPack12 } from './shaderPack12';
import { shaderPack13 } from './shaderPack13';
import { shaderPack14 } from './shaderPack14';
import { shaderPack15 } from './shaderPack15';
import { shaderPack16 } from './shaderPack16';
import { shaderPack17 } from './shaderPack17';
import { shaderPack18 } from './shaderPack18';
import { shaderPack19 } from './shaderPack19';
import { shaderPack20 } from './shaderPack20';
import { shaderPack3D } from './shaderPack3D';
import { shaderPack21 } from './shaderPack21';
import { shaderPack22 } from './shaderPack22';
import { shaderPack23 } from './shaderPack23';
import { shaderPackPeople } from './shaderPackPeople';
import { shaderPack24 } from './shaderPack24';
import { shaderPack25 } from './shaderPack25';
import { shaderPack26 } from './shaderPack26';
import { shaderPack27 } from './shaderPack27';

export interface DitherShaderDef {
  id: string;
  name: string;
  description: string;
  tags: string[];
  fragmentShader: string;
  featured?: boolean;
}

const BAYER_DITHER: DitherShaderDef = {
  id: 'bayer-8x8',
  name: 'Bayer 8×8',
  description: 'High-resolution ordered dithering with an 8×8 Bayer matrix. Smooth gradients with structured precision.',
  tags: ['ordered', 'classic', 'matrix'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float bayer(vec2 p) {
      float val = 0.0;
      vec2 q = p;
      float s = 0.5;
      for(int i = 0; i < 3; i++) {
        vec2 m = mod(floor(q), 2.0);
        val += s * (m.x + m.y * 2.0) / 3.0;
        q = floor(q / 2.0);
        s *= 0.25;
      }
      return val;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      vec2 center = u_mouse;
      float d = length(uv - center);
      
      float v = sin(d * 25.0 - u_time * 3.0) * 0.25;
      v += sin(uv.x * 8.0 + u_time) * sin(uv.y * 6.0 - u_time * 0.7) * 0.25;
      v += 0.5;
      v *= smoothstep(1.2, 0.0, d);
      
      float t = bayer(gl_FragCoord.xy);
      float col = step(t, v);
      
      vec3 c1 = vec3(0.0, 1.0, 0.65);
      vec3 c2 = vec3(0.01, 0.02, 0.04);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const HALFTONE_CMYK: DitherShaderDef = {
  id: 'halftone-cmyk',
  name: 'CMYK Halftone',
  description: 'Multi-layer CMYK halftone simulation with rotated dot screens, just like real offset printing.',
  tags: ['print', 'cmyk', 'color'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float halftone(vec2 p, float angle, float scale, float brightness) {
      float s = sin(angle), c = cos(angle);
      vec2 r = vec2(c*p.x - s*p.y, s*p.x + c*p.y);
      vec2 cell = floor(r / scale) * scale + scale * 0.5;
      float d = length(r - cell);
      return 1.0 - smoothstep(brightness * scale * 0.45, brightness * scale * 0.45 + 1.0, d);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float md = length(uv - u_mouse);
      float wave = sin(md * 15.0 - u_time * 2.5) * 0.3 + 0.5;
      float base = mix(wave, length(uv - 0.5), 0.3);
      
      float sc = 10.0 + sin(u_time * 0.3) * 2.0;
      float cyan = halftone(gl_FragCoord.xy, 0.26, sc, base * 0.9);
      float magenta = halftone(gl_FragCoord.xy, 1.31, sc, base * 0.7);
      float yellow = halftone(gl_FragCoord.xy, 0.0, sc, base * 0.5);
      float key = halftone(gl_FragCoord.xy, 0.79, sc, base * 0.85);
      
      vec3 col = vec3(1.0);
      col -= cyan * vec3(1.0, 0.0, 0.0) * 0.4;
      col -= magenta * vec3(0.0, 1.0, 0.0) * 0.4;
      col -= yellow * vec3(0.0, 0.0, 1.0) * 0.3;
      col -= key * vec3(0.3);
      col = clamp(col, 0.0, 1.0);
      
      gl_FragColor = vec4(col * 0.95, 1.0);
    }
  `,
};

const TERRAIN_CONTOUR: DitherShaderDef = {
  id: 'terrain',
  name: 'Terrain Contour',
  description: 'Topographic map-style contour dithering with elevation lines that shift with your cursor.',
  tags: ['map', 'contour', 'terrain'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float noise(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float smooth_noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      float a = noise(i);
      float b = noise(i + vec2(1.0, 0.0));
      float c = noise(i + vec2(0.0, 1.0));
      float d = noise(i + vec2(1.0, 1.0));
      return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0;
      float a = 0.5;
      for(int i = 0; i < 5; i++) {
        v += a * smooth_noise(p);
        p *= 2.0;
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      vec2 p = uv * 4.0 + u_mouse * 2.0;
      float elevation = fbm(p + u_time * 0.15);
      
      float contours = fract(elevation * 12.0);
      float line = smoothstep(0.02, 0.05, contours) * smoothstep(0.98, 0.95, contours);
      line = 1.0 - (1.0 - line) * 0.8;
      
      vec3 low = vec3(0.1, 0.3, 0.15);
      vec3 mid = vec3(0.6, 0.5, 0.2);
      vec3 high = vec3(0.95, 0.95, 0.9);
      vec3 tint = elevation < 0.4 ? mix(low, mid, elevation / 0.4) : mix(mid, high, (elevation - 0.4) / 0.6);
      
      gl_FragColor = vec4(tint * line, 1.0);
    }
  `,
};

const NEON_GRID: DitherShaderDef = {
  id: 'neon-grid',
  name: 'Neon Grid',
  description: 'Synthwave-inspired neon grid with perspective vanishing point and pulsing glow effects.',
  tags: ['synthwave', 'neon', '80s'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      vec2 p = uv - vec2(u_mouse.x, 0.6);
      
      // Perspective transform
      float perspective = 0.3 / (uv.y + 0.01);
      vec2 grid = vec2(p.x * perspective, perspective);
      grid.y += u_time * 0.5;
      
      vec2 lines = abs(fract(grid * 4.0) - 0.5);
      float gridLine = min(lines.x, lines.y);
      float glow = 0.015 / (gridLine + 0.01);
      glow *= smoothstep(0.0, 0.6, 1.0 - uv.y);
      glow = clamp(glow, 0.0, 1.0);
      
      // Sun
      float sunD = length(vec2(uv.x - u_mouse.x, uv.y - 0.75) * vec2(1.0, 2.0));
      float sun = smoothstep(0.25, 0.2, sunD);
      float sunLines = step(0.5, fract(uv.y * 30.0 - u_time * 0.5)) * sun;
      
      vec3 col = vec3(0.0);
      col += glow * vec3(0.2, 0.4, 1.0); // Blue grid
      col += glow * vec3(1.0, 0.1, 0.5) * sin(u_time * 2.0) * 0.3; // Pink pulse
      col += sun * vec3(1.0, 0.4, 0.1) * (1.0 - sunLines * 0.5); // Sun
      
      // Horizon glow
      float horizon = exp(-abs(uv.y - 0.6) * 15.0);
      col += horizon * vec3(1.0, 0.2, 0.6) * 0.4;
      
      // Dither
      vec2 dp = floor(gl_FragCoord.xy / 2.0);
      float dither = mod(dp.x + dp.y, 2.0) * 0.03;
      col += dither;
      
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

const INK_WASH: DitherShaderDef = {
  id: 'ink-wash',
  name: 'Ink Wash',
  description: 'East Asian ink wash painting simulation with flowing sumi-e brushstroke textures.',
  tags: ['artistic', 'ink', 'organic'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * 0.1031);
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(
        mix(hash(i), hash(i + vec2(1,0)), f.x),
        mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x),
        f.y
      );
    }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
      for(int i = 0; i < 6; i++) {
        v += a * noise(p);
        p = rot * p * 2.0 + vec2(u_time * 0.05);
        a *= 0.5;
      }
      return v;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      vec2 p = uv * 3.0;
      
      float md = length(uv - u_mouse);
      float influence = exp(-md * 4.0) * 0.5;
      
      float f = fbm(p + vec2(influence, -influence));
      float f2 = fbm(p * 1.5 + f * 0.8 + u_time * 0.08);
      
      float ink = smoothstep(0.3, 0.7, f2);
      ink = pow(ink, 1.5);
      
      // Paper texture
      float paper = 0.92 + noise(gl_FragCoord.xy * 0.5) * 0.08;
      
      vec3 paperCol = vec3(0.95, 0.92, 0.85) * paper;
      vec3 inkCol = vec3(0.08, 0.06, 0.1);
      
      gl_FragColor = vec4(mix(inkCol, paperCol, ink), 1.0);
    }
  `,
};

const ELECTRIC_FIELD: DitherShaderDef = {
  id: 'electric-field',
  name: 'Electric Field',
  description: 'Electromagnetic field visualization with force lines bending around the cursor as a charged particle.',
  tags: ['physics', 'field', 'electric'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      
      // Two charges: one at mouse, one orbiting
      vec2 c1 = u_mouse;
      vec2 c2 = vec2(0.5 + cos(u_time) * 0.25, 0.5 + sin(u_time * 0.7) * 0.25);
      
      vec2 d1 = uv - c1;
      vec2 d2 = uv - c2;
      float r1 = length(d1);
      float r2 = length(d2);
      
      // Potential field
      float potential = 1.0 / (r1 + 0.05) - 0.7 / (r2 + 0.05);
      
      // Field lines via angle
      float angle1 = atan(d1.y, d1.x);
      float angle2 = atan(d2.y, d2.x);
      float fieldLines = sin((angle1 - angle2) * 6.0 + potential * 2.0);
      
      // Equipotential
      float equipot = sin(potential * 3.0);
      float lines = smoothstep(0.1, 0.0, abs(equipot)) * 0.5;
      lines += smoothstep(0.15, 0.0, abs(fieldLines)) * 0.3;
      
      // Glow near charges
      float glow1 = 0.02 / (r1 * r1 + 0.001);
      float glow2 = 0.015 / (r2 * r2 + 0.001);
      
      // Dither the field
      vec2 dp = floor(gl_FragCoord.xy / 2.0);
      float dither = mod(dp.x + dp.y, 2.0);
      float dithered = step(dither * 0.3, lines);
      
      vec3 col = vec3(0.01, 0.01, 0.03);
      col += dithered * vec3(0.3, 0.6, 1.0);
      col += glow1 * vec3(0.5, 0.8, 1.0);
      col += glow2 * vec3(1.0, 0.3, 0.5);
      col = clamp(col, 0.0, 1.0);
      
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

const CELLULAR: DitherShaderDef = {
  id: 'cellular',
  name: 'Cellular Automata',
  description: 'Organic cellular growth pattern with evolving boundaries. Like watching life under a microscope.',
  tags: ['organic', 'cells', 'life'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    vec2 hash2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float scale = 20.0 + sin(u_time * 0.2) * 5.0;
      vec2 st = gl_FragCoord.xy / scale;
      vec2 i_st = floor(st);
      vec2 f_st = fract(st);
      
      float minDist = 1.0;
      float secDist = 1.0;
      vec2 minPoint;
      
      for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = hash2(i_st + neighbor);
          point = 0.5 + 0.4 * sin(u_time * 0.5 + 6.2831 * point);
          float d = length(neighbor + point - f_st);
          if(d < minDist) {
            secDist = minDist;
            minDist = d;
            minPoint = point;
          } else if(d < secDist) {
            secDist = d;
          }
        }
      }
      
      float edge = secDist - minDist;
      float membrane = smoothstep(0.0, 0.08, edge);
      
      float md = length(uv - u_mouse);
      float pulse = sin(md * 20.0 - u_time * 3.0) * 0.5 + 0.5;
      float cellColor = minPoint.x * 0.5 + pulse * 0.3;
      
      // Dither the cell interiors
      vec2 dp = floor(gl_FragCoord.xy / 2.0);
      float dither = fract(sin(dot(dp, vec2(12.9898, 78.233))) * 43758.5453);
      float dithered = step(dither * 0.5, cellColor * membrane);
      
      vec3 bg = vec3(0.02, 0.05, 0.03);
      vec3 cellCol = vec3(0.1, 0.9, 0.4) * (0.5 + cellColor * 0.5);
      vec3 edgeCol = vec3(0.0, 0.4, 0.2);
      
      vec3 col = mix(bg, cellCol, dithered);
      col = mix(edgeCol, col, membrane);
      
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

const NOISE_TV: DitherShaderDef = {
  id: 'analog-tv',
  name: 'Analog Static',
  description: 'Detuned analog television static with rolling bands, color fringing and signal interference.',
  tags: ['glitch', 'tv', 'analog'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float t = u_time;
      
      // Rolling band
      float band = smoothstep(0.0, 0.1, sin(uv.y * 3.14159 + t * 2.0)) * 0.3;
      
      // Horizontal distortion near mouse
      float md = abs(uv.y - u_mouse.y);
      float glitch = step(md, 0.05) * sin(t * 50.0) * 0.1;
      vec2 distorted = vec2(uv.x + glitch, uv.y);
      
      // Noise
      float noise = hash(floor(distorted * vec2(u_resolution.x * 0.5, u_resolution.y)) + floor(t * 15.0));
      
      // Scanlines
      float scan = 0.9 + 0.1 * sin(gl_FragCoord.y * 3.14159);
      
      // Color fringing
      float r = hash(floor(vec2(distorted.x - 0.003, distorted.y) * u_resolution * 0.5) + floor(t * 15.0));
      float g = noise;
      float b = hash(floor(vec2(distorted.x + 0.003, distorted.y) * u_resolution * 0.5) + floor(t * 15.0));
      
      vec3 col = vec3(r, g, b) * scan;
      col += band;
      col *= 0.8 + 0.2 * sin(uv.y * 100.0 + t * 10.0);
      
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

const STARFIELD: DitherShaderDef = {
  id: 'starfield',
  name: 'Warp Speed',
  description: 'Hyperspace starfield with dithered star trails zooming from the cursor position into infinity.',
  tags: ['space', 'stars', 'speed'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
      vec2 center = (u_mouse - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
      uv -= center * 0.5;
      
      float t = u_time * 0.8;
      vec3 col = vec3(0.0);
      
      for(int layer = 0; layer < 4; layer++) {
        float fl = float(layer);
        float speed = 1.0 + fl * 0.5;
        float scale = 15.0 - fl * 3.0;
        
        vec2 st = uv * scale;
        vec2 id = floor(st);
        vec2 gv = fract(st) - 0.5;
        
        for(int y = -1; y <= 1; y++) {
          for(int x = -1; x <= 1; x++) {
            vec2 offset = vec2(float(x), float(y));
            vec2 cellId = id + offset;
            float h = hash(cellId + fl * 100.0);
            if(h > 0.85) {
              vec2 starPos = offset + vec2(hash(cellId * 1.1), hash(cellId * 2.1)) - 0.5 - gv;
              float depth = fract(h * 10.0 + t * speed * 0.3);
              float size = (1.0 - depth) * 0.04;
              float star = smoothstep(size, 0.0, length(starPos));
              float trail = smoothstep(size * 3.0, 0.0, abs(starPos.y)) * 
                           smoothstep(-0.3, 0.0, starPos.x) * (1.0 - depth) * 0.3;
              float brightness = (1.0 - depth);
              col += (star + trail) * brightness * vec3(0.7 + h * 0.3, 0.8 + h * 0.2, 1.0);
            }
          }
        }
      }
      
      // Dither
      vec2 dp = floor(gl_FragCoord.xy / 2.0);
      float d = mod(dp.x + dp.y, 2.0) * 0.02;
      col = clamp(col + d, 0.0, 1.0);
      
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

const CROSSHATCH: DitherShaderDef = {
  id: 'crosshatch',
  name: 'Crosshatch',
  description: 'Engraving-style crosshatch with layered line angles responding to tonal values.',
  tags: ['engraving', 'lines', 'artistic'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float line(vec2 p, float angle, float freq) {
      float s = sin(angle), c = cos(angle);
      vec2 r = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
      return smoothstep(0.35, 0.5, abs(sin(r.x * freq)));
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float dist = length(uv - u_mouse);
      float val = sin(dist * 10.0 - u_time * 1.5) * 0.5 + 0.5;
      val = mix(val, 1.0 - length(uv - 0.5), 0.4);
      float freq = 40.0;
      float col = 1.0;
      if(val < 0.8) col *= line(gl_FragCoord.xy, 0.785, freq);
      if(val < 0.6) col *= line(gl_FragCoord.xy, -0.785, freq);
      if(val < 0.4) col *= line(gl_FragCoord.xy, 0.0, freq * 1.5);
      if(val < 0.2) col *= line(gl_FragCoord.xy, 1.57, freq * 1.5);
      vec3 paper = vec3(0.95, 0.92, 0.85);
      vec3 ink = vec3(0.12, 0.08, 0.15);
      gl_FragColor = vec4(mix(ink, paper, col), 1.0);
    }
  `,
};

const FIRE: DitherShaderDef = {
  id: 'fire',
  name: 'Dithered Flame',
  description: 'Procedural fire effect rendered through ordered dithering. Retro game aesthetic meets real-time flame simulation.',
  tags: ['fire', 'retro', 'game'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }

    float fbm(vec2 p) {
      float v = 0.0, a = 0.5;
      for(int i = 0; i < 5; i++) {
        v += a * noise(p);
        p = p * 2.1 + vec2(0.0, -u_time * 2.0);
        a *= 0.5;
      }
      return v;
    }

    float bayer(vec2 p) {
      vec2 m = mod(floor(p), 4.0);
      return (m.x * 4.0 + m.y + mod(m.x, 2.0) * 8.0) / 16.0 - 0.5;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      
      // Fire source near mouse X
      float fireX = uv.x - u_mouse.x;
      float fireShape = exp(-fireX * fireX * 8.0);
      
      float flame = fbm(vec2(uv.x * 4.0, uv.y * 3.0 - u_time * 1.5));
      flame *= fireShape;
      flame *= (1.0 - uv.y); // Fade at top
      flame = pow(flame, 0.8) * 2.0;
      
      // Dither
      float d = bayer(gl_FragCoord.xy) * 0.15;
      
      // Color ramp
      vec3 col = vec3(0.0);
      float v = flame + d;
      if(v > 0.2) col = vec3(0.5, 0.0, 0.0);
      if(v > 0.4) col = vec3(0.9, 0.2, 0.0);
      if(v > 0.6) col = vec3(1.0, 0.6, 0.0);
      if(v > 0.8) col = vec3(1.0, 0.9, 0.4);
      if(v > 1.0) col = vec3(1.0, 1.0, 0.8);
      
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

const LIQUID_METAL: DitherShaderDef = {
  id: 'liquid-metal',
  name: 'Liquid Metal',
  description: 'Mercury-like liquid metal surface with reflective dithered highlights and flowing deformation.',
  tags: ['metal', 'liquid', 'chrome'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float t = u_time * 0.5;
      
      // Distortion from mouse
      vec2 d = uv - u_mouse;
      float md = length(d);
      vec2 distorted = uv + d * 0.1 / (md + 0.1);
      
      // Surface normal approximation
      float n1 = noise(distorted * 8.0 + t);
      float n2 = noise(distorted * 8.0 + vec2(0.1, 0.0) + t);
      float n3 = noise(distorted * 8.0 + vec2(0.0, 0.1) + t);
      
      vec2 normal = vec2(n2 - n1, n3 - n1) * 10.0;
      
      // Fake reflection
      float reflection = sin(normal.x * 5.0 + t) * sin(normal.y * 5.0 - t);
      reflection = reflection * 0.5 + 0.5;
      reflection = pow(reflection, 2.0);
      
      // Specular highlight near mouse
      float spec = pow(max(0.0, 1.0 - md * 3.0), 4.0);
      
      // Dither
      vec2 dp = floor(gl_FragCoord.xy / 2.0);
      float dither = mod(dp.x + dp.y, 2.0);
      float val = reflection + spec * 0.5;
      float dithered = step(dither * 0.3, val);
      
      vec3 dark = vec3(0.15, 0.15, 0.2);
      vec3 bright = vec3(0.8, 0.85, 0.9);
      vec3 col = mix(dark, bright, dithered * val);
      col += spec * vec3(1.0, 0.95, 0.9) * 0.5;
      
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

const AURORA: DitherShaderDef = {
  id: 'aurora',
  name: 'Aurora Borealis',
  description: 'Northern lights with flowing curtains of dithered color dancing across a starlit sky.',
  tags: ['nature', 'aurora', 'sky'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float t = u_time * 0.3;
      
      // Aurora curtains
      float aurora = 0.0;
      for(int i = 0; i < 3; i++) {
        float fi = float(i);
        float wave = sin(uv.x * (3.0 + fi) + t * (0.5 + fi * 0.2) + u_mouse.x * 2.0) * 0.15;
        float curtain = smoothstep(0.3 + wave, 0.7 + wave, uv.y);
        curtain *= smoothstep(1.0, 0.5 + wave, uv.y);
        curtain *= noise(vec2(uv.x * 5.0 + t + fi, uv.y * 3.0)) * 0.8 + 0.2;
        aurora += curtain * (0.7 - fi * 0.15);
      }
      
      aurora *= smoothstep(0.0, 0.3, u_mouse.y + 0.2);
      
      // Stars
      vec2 starGrid = floor(gl_FragCoord.xy / 3.0);
      float star = step(0.98, hash(starGrid));
      float twinkle = sin(hash(starGrid * 2.0) * 100.0 + u_time * 2.0) * 0.5 + 0.5;
      star *= twinkle;
      
      // Dither aurora
      vec2 dp = floor(gl_FragCoord.xy / 2.0);
      float dither = mod(dp.x + dp.y, 2.0);
      float dithered = step(dither * 0.4, aurora);
      
      // Sky gradient
      vec3 skyTop = vec3(0.0, 0.02, 0.06);
      vec3 skyBot = vec3(0.02, 0.05, 0.1);
      vec3 sky = mix(skyBot, skyTop, uv.y);
      
      vec3 auroraCol = mix(vec3(0.1, 0.8, 0.3), vec3(0.2, 0.4, 1.0), uv.y);
      auroraCol = mix(auroraCol, vec3(0.8, 0.2, 0.5), sin(uv.x * 3.0 + t) * 0.3 + 0.1);
      
      vec3 col = sky + star * vec3(0.8, 0.85, 1.0) * 0.5;
      col += dithered * auroraCol * 0.6;
      
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

const MOSAIC: DitherShaderDef = {
  id: 'mosaic',
  name: 'Stained Glass',
  description: 'Cathedral stained glass effect with colored Voronoi cells and dark lead borders between them.',
  tags: ['glass', 'mosaic', 'color'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    vec2 hash2(vec2 p) {
      p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
      return fract(sin(p) * 43758.5453);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float scale = 25.0;
      vec2 st = gl_FragCoord.xy / scale;
      vec2 i_st = floor(st);
      vec2 f_st = fract(st);
      
      float minDist = 1.0;
      float secDist = 1.0;
      vec2 minId = vec2(0.0);
      
      for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = hash2(i_st + neighbor);
          point = 0.5 + 0.3 * sin(u_time * 0.3 + 6.2831 * point);
          float d = length(neighbor + point - f_st);
          if(d < minDist) {
            secDist = minDist;
            minDist = d;
            minId = i_st + neighbor;
          } else if(d < secDist) {
            secDist = d;
          }
        }
      }
      
      float edge = secDist - minDist;
      float lead = 1.0 - smoothstep(0.0, 0.06, edge);
      
      // Color per cell
      vec2 ch = hash2(minId);
      float hue = ch.x * 6.2831 + u_time * 0.2;
      vec3 cellColor = 0.5 + 0.5 * cos(hue + vec3(0.0, 2.094, 4.189));
      cellColor = pow(cellColor, vec3(0.6));
      
      // Light from mouse
      float md = length(uv - u_mouse);
      float light = exp(-md * 3.0) * 0.5 + 0.5;
      
      vec3 col = cellColor * light * (1.0 - lead);
      col += lead * vec3(0.02);
      
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

const WAVE_FUNCTION: DitherShaderDef = {
  id: 'wave-function',
  name: 'Wave Function',
  description: 'Quantum wave function probability density visualization with interference pattern dithering.',
  tags: ['quantum', 'physics', 'wave'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float t = u_time;
      
      // Double slit interference
      vec2 slit1 = vec2(0.3, u_mouse.y - 0.05);
      vec2 slit2 = vec2(0.3, u_mouse.y + 0.05);
      
      float d1 = length(uv - slit1);
      float d2 = length(uv - slit2);
      
      float freq = 40.0;
      float wave1 = sin(d1 * freq - t * 4.0) / (d1 + 0.1);
      float wave2 = sin(d2 * freq - t * 4.0) / (d2 + 0.1);
      
      float interference = (wave1 + wave2);
      float probability = interference * interference * 0.05;
      probability *= smoothstep(0.3, 0.5, uv.x);
      
      // Dither
      vec2 dp = floor(gl_FragCoord.xy / 2.0);
      float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 4.0) / 4.0;
      float dithered = step(bayer * 0.3, probability);
      
      // Source glow
      float sg = 0.005 / (d1 * d1 + 0.001) + 0.005 / (d2 * d2 + 0.001);
      
      vec3 col = vec3(0.01, 0.0, 0.03);
      col += dithered * vec3(0.3, 0.5, 1.0) * probability * 2.0;
      col += sg * vec3(0.5, 0.3, 1.0);
      col = clamp(col, 0.0, 1.0);
      
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

const REACTION_DIFFUSION: DitherShaderDef = {
  id: 'reaction-diffusion',
  name: 'Reaction Diffusion',
  description: 'Turing pattern approximation with organic spot and stripe formations emerging from noise.',
  tags: ['turing', 'organic', 'pattern'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p), f = fract(p);
      f = f * f * (3.0 - 2.0 * f);
      return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                 mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float t = u_time * 0.2;
      
      // Fake reaction-diffusion via layered noise
      float n1 = noise(uv * 8.0 + t);
      float n2 = noise(uv * 16.0 - t * 0.7);
      float n3 = noise(uv * 32.0 + t * 0.3);
      
      float pattern = sin(n1 * 12.0 + n2 * 6.0 + n3 * 3.0);
      pattern = smoothstep(-0.2, 0.2, pattern);
      
      // Mouse influence
      float md = length(uv - u_mouse);
      float influence = exp(-md * 5.0);
      pattern = mix(pattern, 1.0 - pattern, influence * 0.7);
      
      // Dither
      vec2 dp = floor(gl_FragCoord.xy / 2.0);
      float dither = mod(dp.x + dp.y, 2.0);
      float val = step(dither * 0.15, pattern);
      
      vec3 spots = vec3(0.9, 0.6, 0.2);
      vec3 bg = vec3(0.15, 0.08, 0.02);
      gl_FragColor = vec4(mix(bg, spots, val * pattern), 1.0);
    }
  `,
};

const MATRIX_RAIN: DitherShaderDef = {
  id: 'matrix-rain',
  name: 'Matrix Rain',
  description: 'Cascading digital rain with mouse-reactive brightness zones and temporal dithering.',
  tags: ['digital', 'rain', 'code'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float colWidth = 10.0;
      float col = floor(gl_FragCoord.x / colWidth);
      float speed = hash(vec2(col, 0.0)) * 3.0 + 1.0;
      float offset = hash(vec2(col, 1.0)) * 100.0;
      float y = fract((gl_FragCoord.y / u_resolution.y) + u_time * speed * 0.08 + offset);
      float brightness = pow(y, 4.0);
      
      float mouseDist = abs(uv.x - u_mouse.x);
      float mouseGlow = exp(-mouseDist * 8.0) * 0.6;
      brightness += mouseGlow * y;
      
      float cellY = floor(gl_FragCoord.y / colWidth);
      float charHash = hash(vec2(col, cellY + floor(u_time * speed)));
      float isChar = step(0.4, charHash);
      float pattern = isChar * brightness;
      
      vec3 c = vec3(0.0, pattern * 0.85, pattern * 0.25);
      c += vec3(0.0, mouseGlow * 0.3, mouseGlow * 0.1);
      c += brightness * vec3(0.0, 0.05, 0.0);
      gl_FragColor = vec4(c, 1.0);
    }
  `,
};

const SCANLINE: DitherShaderDef = {
  id: 'scanline-crt',
  name: 'CRT Phosphor',
  description: 'Faithful CRT display emulation with RGB phosphor subpixels, scanline gaps and barrel distortion.',
  tags: ['retro', 'crt', 'display'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      
      // Barrel distortion
      vec2 centered = uv - 0.5;
      float r2 = dot(centered, centered);
      vec2 distorted = uv + centered * r2 * 0.15;
      
      // Content: mouse-reactive pattern
      float dist = length(distorted - u_mouse);
      float val = sin(dist * 15.0 - u_time * 3.0) * 0.5 + 0.5;
      val = mix(val, 1.0 - length(distorted - 0.5), 0.3);
      
      // Phosphor mask (RGB subpixels)
      float px = mod(gl_FragCoord.x, 3.0);
      vec3 phosphor = vec3(
        step(px, 1.0),
        step(1.0, px) * step(px, 2.0),
        step(2.0, px)
      );
      
      // Scanlines
      float scan = 0.7 + 0.3 * cos(gl_FragCoord.y * 3.14159);
      
      // Flicker
      float flicker = 0.97 + 0.03 * sin(u_time * 120.0);
      
      // Vignette
      float vig = 1.0 - r2 * 2.0;
      
      // Border
      float border = step(0.0, distorted.x) * step(distorted.x, 1.0) *
                     step(0.0, distorted.y) * step(distorted.y, 1.0);
      
      vec3 col = phosphor * val * scan * flicker * vig * border;
      gl_FragColor = vec4(col, 1.0);
    }
  `,
};

const BASE_SHADERS: DitherShaderDef[] = [
  BAYER_DITHER,
  HALFTONE_CMYK,
  TERRAIN_CONTOUR,
  NEON_GRID,
  INK_WASH,
  ELECTRIC_FIELD,
  CELLULAR,
  FIRE,
  NOISE_TV,
  STARFIELD,
  CROSSHATCH,
  LIQUID_METAL,
  AURORA,
  MOSAIC,
  WAVE_FUNCTION,
  REACTION_DIFFUSION,
  MATRIX_RAIN,
  SCANLINE,
];

export const ALL_SHADERS: DitherShaderDef[] = [
  ...BASE_SHADERS,
  ...shaderPack2,
  ...shaderPack3,
  ...shaderPack4,
  ...shaderPack5,
  ...shaderPack6,
  ...shaderPack7,
  ...shaderPack8,
  ...shaderPack9,
  ...shaderPack10,
  ...shaderPack11,
  ...shaderPack12,
  ...shaderPack13,
  ...shaderPack14,
  ...shaderPack15,
  ...shaderPack16,
  ...shaderPack17,
  ...shaderPack18,
  ...shaderPack19,
  ...shaderPack20,
  ...shaderPack3D,
  ...shaderPack21,
  ...shaderPack22,
  ...shaderPack23,
  ...shaderPackPeople,
  ...shaderPack24,
  ...shaderPack25,
];

export const FEATURED_SHADERS = ALL_SHADERS.filter(s => s.featured);
