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

const DIAMOND_DITHER: DitherShaderDef = {
  id: 'diamond',
  name: 'Diamond Grid',
  description: 'Diamond-shaped threshold pattern creating a woven fabric-like dithering effect with geometric precision.',
  tags: ['geometric', 'pattern', 'grid'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float dist = length(uv - u_mouse);
      float wave = sin(dist * 16.0 - u_time * 2.5) * 0.5 + 0.5;
      float gradient = mix(wave, uv.y, 0.25);
      vec2 p = mod(gl_FragCoord.xy, 8.0) - 4.0;
      float diamond = (abs(p.x) + abs(p.y)) / 8.0;
      float col = step(diamond, gradient);
      vec3 c1 = vec3(1.0, 0.8, 0.0);
      vec3 c2 = vec3(0.06, 0.04, 0.0);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const SPIRAL_DITHER: DitherShaderDef = {
  id: 'spiral',
  name: 'Spiral Flow',
  description: 'Hypnotic spiral-based dithering with rotating threshold patterns that follow your cursor.',
  tags: ['animated', 'hypnotic', 'spiral'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      vec2 center = u_mouse;
      vec2 d = uv - center;
      float angle = atan(d.y, d.x);
      float dist = length(d);
      float spiral = sin(angle * 5.0 + dist * 30.0 - u_time * 3.0) * 0.5 + 0.5;
      float radialGrad = 1.0 - dist * 1.5;
      float val = spiral * radialGrad;
      vec2 p = floor(gl_FragCoord.xy / 3.0);
      float pattern = mod(p.x + p.y, 2.0) * 0.3;
      float col = step(pattern, val);
      vec3 c1 = vec3(0.2, 1.0, 0.8);
      vec3 c2 = vec3(0.0, 0.08, 0.12);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const PIXEL_SORT_DITHER: DitherShaderDef = {
  id: 'pixel-sort',
  name: 'Pixel Sort',
  description: 'Glitch-art inspired pixel sorting effect combined with threshold dithering for a corrupted digital aesthetic.',
  tags: ['glitch', 'digital', 'sort'],
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
      float dist = length(uv - u_mouse);
      float val = sin(dist * 10.0 - u_time * 2.0) * 0.5 + 0.5;
      
      float sortThreshold = 0.3 + sin(u_time * 0.5) * 0.2;
      float row = floor(gl_FragCoord.y / 2.0);
      float offset = step(sortThreshold, val) * sin(row * 0.1 + u_time * 5.0) * 50.0;
      vec2 sortedUV = vec2((gl_FragCoord.x + offset) / u_resolution.x, uv.y);
      
      float sortedDist = length(sortedUV - u_mouse);
      float sortedVal = sin(sortedDist * 10.0 - u_time * 2.0) * 0.5 + 0.5;
      float noise = hash(vec2(floor(gl_FragCoord.x + offset), row));
      float col = step(noise * 0.5, sortedVal);
      
      vec3 c1 = vec3(1.0, 0.1, 0.3);
      vec3 c2 = vec3(0.0, 0.02, 0.05);
      vec3 c3 = vec3(0.1, 0.0, 0.3);
      gl_FragColor = vec4(mix(c2, mix(c3, c1, uv.x), col), 1.0);
    }
  `,
};

const WAVE_DITHER: DitherShaderDef = {
  id: 'wave',
  name: 'Wave Interference',
  description: 'Overlapping sine wave patterns creating moiré-like interference dithering with flowing motion.',
  tags: ['waves', 'moiré', 'interference'],
  featured: true,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float t = u_time * 1.5;
      
      float w1 = sin(uv.x * 40.0 + t) * 0.5 + 0.5;
      float w2 = sin(uv.y * 35.0 - t * 0.7) * 0.5 + 0.5;
      float w3 = sin((uv.x + uv.y) * 25.0 + t * 0.5) * 0.5 + 0.5;
      
      float mouseDist = length(uv - u_mouse);
      float mouseWave = sin(mouseDist * 30.0 - t * 3.0) * 0.5 + 0.5;
      
      float combined = (w1 + w2 + w3 + mouseWave) / 4.0;
      
      vec2 p = floor(gl_FragCoord.xy / 2.0);
      float checker = mod(p.x + p.y, 2.0);
      float col = step(checker * 0.4 + 0.1, combined);
      
      vec3 c1 = vec3(0.4, 0.6, 1.0);
      vec3 c2 = vec3(0.0, 0.02, 0.08);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const ERROR_DIFFUSION: DitherShaderDef = {
  id: 'error-diffusion',
  name: 'Error Diffusion',
  description: 'Approximation of Floyd-Steinberg error diffusion in real-time. Smooth gradients with organic noise distribution.',
  tags: ['floyd-steinberg', 'smooth', 'organic'],
  featured: false,
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

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float dist = length(uv - u_mouse);
      float val = sin(dist * 14.0 - u_time * 2.0) * 0.3 + 0.5;
      val = mix(val, uv.x * 0.8 + uv.y * 0.2, 0.4);
      
      // Simulated error diffusion
      float pixelSize = 2.0;
      vec2 pixelPos = floor(gl_FragCoord.xy / pixelSize);
      float n1 = hash(pixelPos) * 0.15;
      float n2 = hash(pixelPos + vec2(1.0, 0.0)) * 0.07;
      float n3 = hash(pixelPos + vec2(-1.0, 1.0)) * 0.03;
      float n4 = hash(pixelPos + vec2(0.0, 1.0)) * 0.05;
      float error = (n1 + n2 + n3 + n4) - 0.15;
      
      float col = step(0.5, val + error);
      vec3 c1 = vec3(0.92, 0.88, 0.82);
      vec3 c2 = vec3(0.1, 0.08, 0.06);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const MATRIX_RAIN: DitherShaderDef = {
  id: 'matrix-rain',
  name: 'Matrix Rain',
  description: 'Digital rain effect with cascading dithered columns. A tribute to the iconic falling code aesthetic.',
  tags: ['digital', 'rain', 'cascade'],
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
      float colWidth = 8.0;
      float col = floor(gl_FragCoord.x / colWidth);
      float speed = hash(vec2(col, 0.0)) * 2.0 + 1.0;
      float offset = hash(vec2(col, 1.0)) * 100.0;
      float y = fract((gl_FragCoord.y / u_resolution.y) + u_time * speed * 0.1 + offset);
      float brightness = pow(y, 3.0);
      
      float mouseDist = abs(uv.x - u_mouse.x);
      float mouseGlow = exp(-mouseDist * 8.0) * 0.5;
      brightness += mouseGlow;
      
      float cellY = floor(gl_FragCoord.y / colWidth);
      float charHash = hash(vec2(col, cellY + floor(u_time * speed)));
      float pattern = step(0.3, charHash) * brightness;
      
      vec3 c = vec3(0.0, pattern * 0.9, pattern * 0.3);
      c += vec3(0.0, mouseGlow * 0.5, mouseGlow * 0.2);
      gl_FragColor = vec4(c, 1.0);
    }
  `,
};

const PLASMA_DITHER: DitherShaderDef = {
  id: 'plasma',
  name: 'Plasma Burn',
  description: 'Retro demoscene-inspired plasma effect with multi-frequency sine waves dithered through a threshold grid.',
  tags: ['demoscene', 'retro', 'colorful'],
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
      float t = u_time;
      float v1 = sin(uv.x * 10.0 + t);
      float v2 = sin(uv.y * 8.0 - t * 0.7);
      float v3 = sin((uv.x + uv.y) * 6.0 + t * 0.5);
      float v4 = sin(length(uv - u_mouse) * 12.0 - t * 2.0);
      float val = (v1 + v2 + v3 + v4) / 4.0 * 0.5 + 0.5;
      float threshold = bayer4(gl_FragCoord.xy);
      float r = step(threshold, val);
      float g = step(threshold, val * 0.7 + 0.15);
      float b = step(threshold, val * 0.5 + 0.3);
      gl_FragColor = vec4(r * 0.9, g * 0.4, b * 0.8, 1.0);
    }
  `,
};

const HEXAGONAL_DITHER: DitherShaderDef = {
  id: 'hexagonal',
  name: 'Hex Grid',
  description: 'Hexagonal tile-based dithering with honeycomb geometry. Each hex cell carries its own threshold value.',
  tags: ['geometric', 'hex', 'tiled'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    vec2 hexCenter(vec2 p) {
      float s = 12.0;
      vec2 a = mod(p, vec2(s * 1.732, s * 3.0));
      vec2 b = mod(p - vec2(s * 0.866, s * 1.5), vec2(s * 1.732, s * 3.0));
      float da = length(a - vec2(s * 0.866, s * 1.5));
      float db = length(b - vec2(s * 0.866, s * 1.5));
      return da < db ? a : b;
    }

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      vec2 hex = hexCenter(gl_FragCoord.xy);
      float dist = length(uv - u_mouse);
      float val = sin(dist * 15.0 - u_time * 2.5) * 0.5 + 0.5;
      val = mix(val, 1.0 - length(uv - 0.5) * 1.2, 0.3);
      float hexDist = length(hex - vec2(6.0));
      float col = step(hexDist * 0.08, val);
      vec3 c1 = vec3(1.0, 0.7, 0.0);
      vec3 c2 = vec3(0.05, 0.03, 0.0);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const RADIAL_DITHER: DitherShaderDef = {
  id: 'radial',
  name: 'Radial Burst',
  description: 'Concentric ring dithering radiating from the cursor position. Creates radar-like scanning patterns.',
  tags: ['radial', 'radar', 'rings'],
  featured: false,
  fragmentShader: `
    precision mediump float;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;

    void main() {
      vec2 uv = gl_FragCoord.xy / u_resolution;
      float dist = length(uv - u_mouse);
      float rings = sin(dist * 60.0 - u_time * 4.0) * 0.5 + 0.5;
      float fade = exp(-dist * 3.0);
      float val = rings * fade;
      vec2 p = floor(gl_FragCoord.xy / 2.0);
      float pattern = fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
      float col = step(pattern * 0.6, val);
      vec3 c1 = vec3(0.0, 0.8, 1.0);
      vec3 c2 = vec3(0.0, 0.03, 0.06);
      gl_FragColor = vec4(mix(c2, c1, col), 1.0);
    }
  `,
};

const GRAIN_DITHER: DitherShaderDef = {
  id: 'grain',
  name: 'Film Grain',
  description: 'Photographic film grain simulation with temporal noise and exposure-dependent grain density.',
  tags: ['film', 'analog', 'grain'],
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
      float dist = length(uv - u_mouse);
      float light = sin(dist * 8.0 - u_time * 1.5) * 0.3 + 0.5;
      light = mix(light, 1.0 - length(uv - 0.5) * 1.0, 0.5);
      
      // Multi-scale grain
      float grain1 = hash(gl_FragCoord.xy + floor(u_time * 24.0) * 0.1) * 0.4;
      float grain2 = hash(gl_FragCoord.xy * 0.5 + floor(u_time * 12.0) * 0.2) * 0.3;
      float grain3 = hash(gl_FragCoord.xy * 2.0 + floor(u_time * 6.0) * 0.3) * 0.3;
      float grain = grain1 + grain2 + grain3;
      
      // Grain is more visible in midtones
      float grainStrength = 1.0 - abs(light - 0.5) * 2.0;
      float val = light + (grain - 0.5) * grainStrength * 0.5;
      
      float col = step(0.5, val);
      vec3 warm = vec3(0.95, 0.9, 0.8);
      vec3 dark = vec3(0.12, 0.1, 0.08);
      gl_FragColor = vec4(mix(dark, warm, col), 1.0);
    }
  `,
};

const CIRCUIT_DITHER: DitherShaderDef = {
  id: 'circuit',
  name: 'Circuit Board',
  description: 'PCB-inspired dithering with orthogonal line patterns mimicking electronic circuit traces.',
  tags: ['tech', 'circuit', 'digital'],
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
      float cellSize = 16.0;
      vec2 cell = floor(gl_FragCoord.xy / cellSize);
      vec2 local = mod(gl_FragCoord.xy, cellSize) / cellSize;
      
      float h = hash(cell);
      float dist = length(uv - u_mouse);
      float energy = sin(dist * 12.0 - u_time * 3.0) * 0.5 + 0.5;
      energy = mix(energy, 1.0 - dist, 0.3);
      
      float trace = 0.0;
      // Horizontal or vertical trace based on hash
      if(h > 0.5) {
        trace = step(abs(local.y - 0.5), 0.08);
      } else {
        trace = step(abs(local.x - 0.5), 0.08);
      }
      // Junction dots
      float dot = step(length(local - 0.5), 0.12);
      float pattern = max(trace, dot) * step(0.3, energy);
      
      // Pad areas
      float pad = step(length(local - 0.5), 0.25) * step(0.7, h + energy * 0.3);
      pattern = max(pattern, pad * 0.6);
      
      vec3 boardColor = vec3(0.0, 0.15, 0.08);
      vec3 traceColor = vec3(0.0, 0.9, 0.4);
      gl_FragColor = vec4(mix(boardColor, traceColor, pattern), 1.0);
    }
  `,
};

const WARP_DITHER: DitherShaderDef = {
  id: 'warp',
  name: 'Space Warp',
  description: 'Gravity-warped dithering field with distorted space-time. The cursor acts as a gravitational lens.',
  tags: ['space', 'warp', 'distortion'],
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
      vec2 d = uv - u_mouse;
      float dist = length(d);
      // Gravitational lens distortion
      float warpStrength = 0.05 / (dist + 0.05);
      vec2 warped = uv + d * warpStrength * 0.3;
      
      float t = u_time;
      float v = sin(warped.x * 15.0 + t) * sin(warped.y * 15.0 - t * 0.8);
      v = v * 0.5 + 0.5;
      v += sin(dist * 20.0 - t * 3.0) * 0.2;
      
      float threshold = bayer4(gl_FragCoord.xy);
      float col = step(threshold, v);
      
      vec3 c1 = vec3(0.7, 0.5, 1.0);
      vec3 c2 = vec3(0.02, 0.0, 0.06);
      vec3 c3 = vec3(1.0, 0.3, 0.6);
      float colorMix = sin(dist * 10.0 + t) * 0.5 + 0.5;
      gl_FragColor = vec4(mix(c2, mix(c1, c3, colorMix), col), 1.0);
    }
  `,
};

export const ALL_SHADERS: DitherShaderDef[] = [
  BAYER_DITHER,
  HALFTONE_DITHER,
  NOISE_DITHER,
  CROSSHATCH_DITHER,
  BLUE_NOISE_DITHER,
  SPIRAL_DITHER,
  WAVE_DITHER,
  PLASMA_DITHER,
  WARP_DITHER,
  STIPPLE_DITHER,
  CHECKERBOARD_DITHER,
  VORONOI_DITHER,
  SCANLINE_DITHER,
  DIAMOND_DITHER,
  HEXAGONAL_DITHER,
  RADIAL_DITHER,
  GRAIN_DITHER,
  CIRCUIT_DITHER,
  PIXEL_SORT_DITHER,
  ERROR_DIFFUSION,
  MATRIX_RAIN,
];

export const FEATURED_SHADERS = ALL_SHADERS.filter(s => s.featured);
