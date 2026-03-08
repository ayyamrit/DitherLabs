// Collection of dither shader fragment sources

export interface DitherShaderDef {
  id: string;
  name: string;
  description: string;
  tags: string[];
  fragmentShader: string;
  featured?: boolean;
}

const BAYER_DITHER: DitherShaderDef = {
  id: 'bayer',
  name: 'Bayer Matrix',
  description: 'Classic ordered dithering using a 4×4 Bayer threshold matrix. Creates structured patterns with retro charm.',
  tags: ['ordered', 'classic', 'retro'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float bayer4(vec2 p) {
      vec2 i = floor(mod(p, 4.0));
      int x = int(i.x);
      int y = int(i.y);
      float m[16];
      m[0]=0.0; m[1]=8.0; m[2]=2.0; m[3]=10.0;
      m[4]=12.0; m[5]=4.0; m[6]=14.0; m[7]=6.0;
      m[8]=3.0; m[9]=11.0; m[10]=1.0; m[11]=9.0;
      m[12]=15.0; m[13]=7.0; m[14]=13.0; m[15]=5.0;
      int idx = y * 4 + x;
      for(int k = 0; k < 16; k++) {
        if(k == idx) return m[k] / 16.0;
      }
      return 0.0;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float dist = length(uv - u_mouse);
      float wave = sin(dist * 20.0 - u_time * 3.0) * 0.5 + 0.5;
      float gradient = mix(wave, length(uv - 0.5), 0.3);
      float threshold = bayer4(gl_FragCoord.xy);
      float col = step(threshold, gradient);
      vec3 c1 = vec3(0.0, 0.95, 0.6);
      vec3 c2 = vec3(0.05, 0.05, 0.08);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const HALFTONE_DITHER: DitherShaderDef = {
  id: 'halftone',
  name: 'Halftone Dots',
  description: 'Print-inspired circular dot dithering. Dot size varies with luminance for a classic newspaper look.',
  tags: ['print', 'dots', 'cmyk'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float scale = 12.0 + sin(u_time * 0.5) * 4.0;
      vec2 cell = floor(gl_FragCoord.xy / scale) * scale + scale * 0.5;
      vec2 cellUV = cell / u_resolution;
      float dist = length(uv - u_mouse);
      float brightness = sin(dist * 15.0 - u_time * 2.0) * 0.5 + 0.5;
      brightness = mix(brightness, 1.0 - length(cellUV - 0.5) * 1.4, 0.4);
      float dotSize = brightness * scale * 0.55;
      float d = length(gl_FragCoord.xy - cell);
      float col = 1.0 - step(dotSize, d);
      vec3 c1 = vec3(1.0, 0.3, 0.5);
      vec3 c2 = vec3(0.04, 0.02, 0.06);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const NOISE_DITHER: DitherShaderDef = {
  id: 'noise',
  name: 'White Noise',
  description: 'Random threshold dithering with animated noise. Raw and chaotic, like a detuned CRT signal.',
  tags: ['random', 'noise', 'glitch'],
  featured: true,
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
      float dist = length(uv - u_mouse);
      float gradient = sin(dist * 12.0 - u_time * 2.5) * 0.5 + 0.5;
      gradient = mix(gradient, uv.y, 0.3);
      float noise = hash(gl_FragCoord.xy + floor(u_time * 8.0));
      float col = step(noise, gradient);
      vec3 c1 = vec3(0.95, 0.9, 0.8);
      vec3 c2 = vec3(0.08, 0.06, 0.04);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const CROSSHATCH_DITHER: DitherShaderDef = {
  id: 'crosshatch',
  name: 'Crosshatch',
  description: 'Pen-and-ink style cross-hatching shader. Lines layer at different angles based on tone.',
  tags: ['artistic', 'lines', 'sketch'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float line(vec2 p, float angle, float freq) {
      float s = sin(angle), c = cos(angle);
      vec2 r = vec2(c * p.x - s * p.y, s * p.x + c * p.y);
      return smoothstep(0.4, 0.5, abs(sin(r.x * freq)));
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

const BLUE_NOISE_DITHER: DitherShaderDef = {
  id: 'blue-noise',
  name: 'Blue Noise',
  description: 'Simulated blue-noise dithering for perceptually smooth gradients with less visible patterning.',
  tags: ['smooth', 'perceptual', 'modern'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash(vec2 p) {
      vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
      p3 += dot(p3, p3.yzx + 33.33);
      return fract((p3.x + p3.y) * p3.z);
    }

    float blueNoise(vec2 p) {
      float n = 0.0;
      float amp = 1.0;
      for(int i = 0; i < 4; i++) {
        n += hash(p) * amp;
        p *= 2.0;
        amp *= 0.5;
      }
      return n / 1.875;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      vec2 mouse = u_mouse;
      float d = length(uv - mouse);
      float ripple = sin(d * 25.0 - u_time * 3.0) * 0.5 + 0.5;
      float gradient = mix(ripple, uv.x * uv.y, 0.3);
      float noise = blueNoise(gl_FragCoord.xy + sin(u_time * 0.3) * 10.0);
      float col = step(noise, gradient);
      vec3 c1 = vec3(0.3, 0.5, 1.0);
      vec3 c2 = vec3(0.02, 0.02, 0.08);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const STIPPLE_DITHER: DitherShaderDef = {
  id: 'stipple',
  name: 'Stipple',
  description: 'Pointillism-inspired stipple dithering. Dense clusters of dots create organic tonal variations.',
  tags: ['artistic', 'organic', 'dots'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    float hash21(vec2 p) {
      p = fract(p * vec2(234.34, 435.345));
      p += dot(p, p + 34.23);
      return fract(p.x * p.y);
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float scale = 6.0;
      vec2 id = floor(gl_FragCoord.xy / scale);
      vec2 gv = fract(gl_FragCoord.xy / scale) - 0.5;
      float n = hash21(id);
      float dist = length(uv - u_mouse);
      float val = sin(dist * 18.0 - u_time * 2.0) * 0.5 + 0.5;
      val = mix(val, 1.0 - length(uv - 0.5) * 1.2, 0.5);
      vec2 offset = vec2(hash21(id + 1.0), hash21(id + 2.0)) * 0.4 - 0.2;
      float dotDist = length(gv - offset);
      float dotSize = val * 0.45;
      float col = 1.0 - smoothstep(dotSize - 0.05, dotSize, dotDist);
      vec3 c1 = vec3(0.9, 0.6, 0.2);
      vec3 c2 = vec3(0.06, 0.04, 0.02);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const CHECKERBOARD_DITHER: DitherShaderDef = {
  id: 'checkerboard',
  name: 'Checkerboard',
  description: 'Simple 1-bit checkerboard dithering pattern. The most minimal form of spatial dithering.',
  tags: ['minimal', '1-bit', 'pattern'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float dist = length(uv - u_mouse);
      float wave = sin(dist * 20.0 - u_time * 4.0) * 0.5 + 0.5;
      float gradient = mix(wave, uv.x, 0.2);
      vec2 p = floor(gl_FragCoord.xy / 3.0);
      float checker = mod(p.x + p.y, 2.0);
      float col = step(mix(checker * 0.5, gradient, 0.6), 0.5);
      vec3 c1 = vec3(0.0, 1.0, 0.8);
      vec3 c2 = vec3(0.0, 0.05, 0.1);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const VORONOI_DITHER: DitherShaderDef = {
  id: 'voronoi',
  name: 'Voronoi Cells',
  description: 'Organic cell-based dithering using Voronoi tessellation. Nature-inspired with dynamic cell boundaries.',
  tags: ['organic', 'cells', 'generative'],
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
      float scale = 15.0;
      vec2 st = gl_FragCoord.xy / scale;
      vec2 i_st = floor(st);
      vec2 f_st = fract(st);
      float minDist = 1.0;
      for(int y = -1; y <= 1; y++) {
        for(int x = -1; x <= 1; x++) {
          vec2 neighbor = vec2(float(x), float(y));
          vec2 point = hash2(i_st + neighbor);
          point = 0.5 + 0.5 * sin(u_time * 0.8 + 6.2831 * point);
          float d = length(neighbor + point - f_st);
          minDist = min(minDist, d);
        }
      }
      float dist = length(uv - u_mouse);
      float val = sin(dist * 12.0 - u_time * 2.0) * 0.5 + 0.5;
      float col = step(minDist, val);
      vec3 c1 = vec3(0.8, 0.2, 0.9);
      vec3 c2 = vec3(0.04, 0.01, 0.06);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const SCANLINE_DITHER: DitherShaderDef = {
  id: 'scanline',
  name: 'Scanlines',
  description: 'CRT-style scanline dithering with phosphor glow simulation. A nostalgic nod to retro displays.',
  tags: ['retro', 'crt', 'display'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float dist = length(uv - u_mouse);
      float val = sin(dist * 15.0 - u_time * 3.0) * 0.5 + 0.5;
      val = mix(val, 1.0 - length(uv - 0.5), 0.3);
      float scanline = step(0.5, fract(gl_FragCoord.y / 3.0));
      float vline = step(0.5, fract(gl_FragCoord.x / 3.0));
      float mask = scanline * 0.7 + 0.3;
      float col = val * mask;
      float r = col * (0.8 + 0.2 * vline);
      float g = col * 1.2;
      float b = col * (0.6 + 0.4 * (1.0 - vline));
      float flicker = 0.97 + 0.03 * sin(u_time * 60.0);
      gl_FragColor = vec4(vec3(r, g, b) * flicker, 1.0);
    }
  `,
};

export const ALL_SHADERS: DitherShaderDef[] = [
  BAYER_DITHER,
  HALFTONE_DITHER,
  NOISE_DITHER,
  CROSSHATCH_DITHER,
  BLUE_NOISE_DITHER,
  STIPPLE_DITHER,
  CHECKERBOARD_DITHER,
  VORONOI_DITHER,
  SCANLINE_DITHER,
];

export const FEATURED_SHADERS = ALL_SHADERS.filter(s => s.featured);
