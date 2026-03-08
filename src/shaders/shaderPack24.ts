import type { DitherShaderDef } from './ditherShaders';

export const shaderPack24: DitherShaderDef[] = [
  {
    id: 'neon-grid-drive',
    name: 'Neon Grid Drive',
    description: 'Retro synthwave perspective grid racing into the horizon with neon sun.',
    tags: ['2d', 'animated', 'retro', 'premium'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        vec3 col = vec3(0.0);

        // Sky gradient
        col = mix(vec3(0.0, 0.0, 0.08), vec3(0.15, 0.0, 0.25), uv.y);

        // Sun
        float sunY = 0.55 + u_mouse.y * 0.1;
        float sunDist = length((uv - vec2(0.5, sunY)) * vec2(1.0, 1.8));
        col += vec3(1.0, 0.3, 0.1) * smoothstep(0.15, 0.0, sunDist);
        col += vec3(1.0, 0.6, 0.0) * smoothstep(0.08, 0.0, sunDist);
        // Sun scanlines
        float scanline = step(0.5, fract(uv.y * 60.0)) * smoothstep(0.15, 0.05, sunDist);
        col -= scanline * 0.3;

        // Ground plane
        if(uv.y < 0.45) {
          float horizon = 0.45;
          float depth = (horizon - uv.y) / horizon;
          float perspX = (uv.x - 0.5) / (depth + 0.01);
          
          // Grid lines
          float gridX = abs(fract(perspX * 2.0) - 0.5);
          float gridZ = abs(fract(depth * 8.0 - t * 2.0) - 0.5);
          float lineX = smoothstep(0.02, 0.0, gridX * depth);
          float lineZ = smoothstep(0.03, 0.0, gridZ);
          
          vec3 gridCol = vec3(0.8, 0.0, 1.0) * lineX + vec3(0.0, 0.8, 1.0) * lineZ;
          gridCol *= (1.0 - depth * 0.7);
          col = mix(col, col + gridCol, step(uv.y, horizon));
        }

        // Dither
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        col += (mod(dp.x + dp.y, 2.0) - 0.5) * 0.03;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'ink-bleed',
    name: 'Ink Bleed',
    description: 'Organic ink bleeding and spreading across paper with beautiful diffusion.',
    tags: ['2d', 'animated', 'organic', 'premium'],
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
        float a = hash(i), b = hash(i + vec2(1.0, 0.0));
        float c = hash(i + vec2(0.0, 1.0)), d = hash(i + vec2(1.0, 1.0));
        return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for(int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.1;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 0.3;

        float ink = 0.0;
        for(int i = 0; i < 4; i++) {
          float fi = float(i);
          vec2 center = vec2(0.3 + fi * 0.15, 0.4 + sin(fi * 2.3) * 0.15);
          float spread = smoothstep(0.0, 1.0, t - fi * 0.5) * 0.3;
          float n = fbm(uv * 6.0 + fi * 3.0 + t * 0.2);
          float d = length(uv - center) - spread * n;
          ink += smoothstep(0.05, -0.02, d);
        }
        ink = clamp(ink, 0.0, 1.0);

        // Paper texture
        float paper = 0.92 + noise(uv * 40.0) * 0.08;
        float grain = noise(uv * 200.0) * 0.04;

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0) * 0.5;

        vec3 paperCol = vec3(paper) - grain;
        vec3 inkCol = vec3(0.02, 0.02, 0.06);
        float edge = smoothstep(0.4, 0.6, ink + dither * 0.15);
        vec3 col = mix(paperCol, inkCol, edge);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'crystal-prism',
    name: 'Crystal Prism',
    description: 'Light refracting through rotating crystal facets with rainbow dispersion.',
    tags: ['2d', 'animated', 'light', 'premium'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float polygon(vec2 p, float sides, float r) {
        float a = atan(p.y, p.x);
        float slice = 6.28318 / sides;
        float d = cos(floor(0.5 + a / slice) * slice - a) * length(p);
        return d - r;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float t = u_time;

        vec3 col = vec3(0.02, 0.02, 0.05);

        // Multiple crystal layers
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          float rot = t * (0.3 + fi * 0.1) * (mod(fi, 2.0) == 0.0 ? 1.0 : -1.0);
          float c = cos(rot), s = sin(rot);
          vec2 rp = vec2(uv.x * c - uv.y * s, uv.x * s + uv.y * c);
          
          float sides = 3.0 + fi;
          float size = 0.35 - fi * 0.05;
          float d = polygon(rp, sides, size);
          
          // Rainbow based on angle
          float angle = atan(rp.y, rp.x) / 6.28318 + 0.5;
          vec3 rainbow;
          rainbow.r = 0.5 + 0.5 * sin(angle * 6.28 + fi * 0.8);
          rainbow.g = 0.5 + 0.5 * sin(angle * 6.28 + fi * 0.8 + 2.094);
          rainbow.b = 0.5 + 0.5 * sin(angle * 6.28 + fi * 0.8 + 4.189);

          // Edge glow
          float edge = smoothstep(0.02, 0.0, abs(d));
          col += rainbow * edge * 0.6;
          
          // Facet fill
          float fill = smoothstep(0.01, -0.01, d);
          col += rainbow * fill * 0.08;
        }

        // Light beam from mouse
        vec2 lightDir = normalize(u_mouse - vec2(0.5));
        float beam = pow(max(dot(normalize(uv), lightDir), 0.0), 8.0) * 0.3;
        col += vec3(1.0, 0.95, 0.8) * beam;

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        col += (mod(dp.x + dp.y, 2.0) - 0.5) * 0.02;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'topographic-map',
    name: 'Topographic Map',
    description: 'Animated topographic contour map with shifting elevation lines.',
    tags: ['2d', 'animated', 'data', 'premium'],
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
        return mix(
          mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for(int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 0.15;

        float elevation = fbm(uv * 4.0 + t) + fbm(uv * 8.0 - t * 0.5) * 0.3;
        float contours = abs(fract(elevation * 12.0) - 0.5);
        float lines = smoothstep(0.02, 0.0, contours);

        // Color by elevation
        vec3 low = vec3(0.15, 0.35, 0.2);
        vec3 mid = vec3(0.6, 0.5, 0.3);
        vec3 high = vec3(0.85, 0.8, 0.75);
        vec3 elCol = elevation < 0.4 ? mix(low, mid, elevation / 0.4) : mix(mid, high, (elevation - 0.4) / 0.6);

        // Paper texture
        float paper = 0.95 + noise(uv * 80.0) * 0.05;
        vec3 col = elCol * paper;
        col = mix(col, vec3(0.1, 0.08, 0.05), lines * 0.8);

        // Index contours (thicker every 5th)
        float indexLine = abs(fract(elevation * 2.4) - 0.5);
        float idx = smoothstep(0.03, 0.0, indexLine);
        col = mix(col, vec3(0.05, 0.03, 0.0), idx * 0.6);

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        col += (mod(dp.x + dp.y, 2.0) - 0.5) * 0.02;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'glitch-city',
    name: 'Glitch City',
    description: 'A cyberpunk cityscape skyline with glitch distortion and neon signs.',
    tags: ['2d', 'animated', 'cyber', 'premium'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(float n) { return fract(sin(n) * 43758.5453); }
      float hash2(vec2 p) { return fract(sin(dot(p, vec2(41.1, 289.7))) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;

        // Glitch offset
        float glitchLine = step(0.98, hash(floor(uv.y * 40.0) + floor(t * 8.0)));
        uv.x += glitchLine * (hash(floor(t * 12.0)) - 0.5) * 0.1;

        vec3 col = vec3(0.0);

        // Sky
        col = mix(vec3(0.0, 0.02, 0.08), vec3(0.05, 0.0, 0.15), uv.y);

        // Stars
        float star = step(0.997, hash2(floor(uv * 200.0)));
        col += star * 0.5;

        // Buildings
        float skyline = 0.0;
        for(int i = 0; i < 20; i++) {
          float fi = float(i);
          float bx = fi * 0.055 - 0.05;
          float bw = 0.03 + hash(fi * 7.0) * 0.025;
          float bh = 0.15 + hash(fi * 13.0) * 0.35;
          
          if(uv.x > bx && uv.x < bx + bw && uv.y < bh) {
            skyline = 1.0;
            // Windows
            float wx = fract((uv.x - bx) * 80.0);
            float wy = fract(uv.y * 40.0);
            float window = step(0.3, wx) * step(wx, 0.7) * step(0.2, wy) * step(wy, 0.8);
            float lit = step(0.4, hash(floor(vec2((uv.x - bx) * 80.0, uv.y * 40.0)) + floor(t * 0.5)));
            col = vec3(0.03, 0.03, 0.06);
            col += window * lit * vec3(1.0, 0.8, 0.3) * 0.6;
          }
        }

        // Neon signs
        float neon1 = smoothstep(0.008, 0.002, abs(uv.y - 0.25 - sin(uv.x * 20.0 + t) * 0.02)) 
                     * step(0.3, uv.x) * step(uv.x, 0.5) * (1.0 - skyline);
        col += neon1 * vec3(1.0, 0.1, 0.4) * (0.7 + 0.3 * sin(t * 10.0));

        float neon2 = smoothstep(0.006, 0.002, abs(uv.y - 0.18))
                     * step(0.6, uv.x) * step(uv.x, 0.8) * skyline;
        col += neon2 * vec3(0.1, 0.5, 1.0) * (0.8 + 0.2 * sin(t * 7.0 + 1.0));

        // Chromatic aberration on glitch
        if(glitchLine > 0.0) {
          col.r += 0.15;
          col.b -= 0.1;
        }

        // Scanlines
        col *= 0.92 + 0.08 * sin(gl_FragCoord.y * 2.5);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'aurora-curtain',
    name: 'Aurora Curtain',
    description: 'Flowing northern lights curtain effect with layered green and purple waves.',
    tags: ['2d', 'animated', 'nature', 'premium'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 0.4;
        vec3 col = vec3(0.0, 0.02, 0.05);

        // Stars
        float star = step(0.998, hash(floor(uv * 300.0)));
        col += star * vec3(0.8, 0.85, 1.0) * 0.5;

        // Aurora layers
        for(int i = 0; i < 4; i++) {
          float fi = float(i);
          float wave = sin(uv.x * (3.0 + fi) + t * (0.5 + fi * 0.2) + noise(uv * 3.0 + fi) * 2.0);
          float curtain = smoothstep(0.0, 0.3, uv.y - 0.4 - wave * 0.08 - fi * 0.04);
          curtain *= smoothstep(1.0, 0.5, uv.y);
          float flicker = noise(vec2(uv.x * 5.0, t + fi * 10.0));
          
          vec3 auroraCol = fi < 2.0 
            ? mix(vec3(0.1, 0.8, 0.3), vec3(0.0, 1.0, 0.5), flicker)
            : mix(vec3(0.4, 0.1, 0.8), vec3(0.8, 0.2, 0.6), flicker);
          
          col += auroraCol * curtain * 0.2 * (0.6 + flicker * 0.4);
        }

        // Ground silhouette
        float ground = smoothstep(0.12, 0.08, uv.y + sin(uv.x * 8.0) * 0.02);
        col = mix(col, vec3(0.01, 0.01, 0.02), ground);

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        col += (mod(dp.x + dp.y, 2.0) - 0.5) * 0.015;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'circuit-board',
    name: 'Circuit Board',
    description: 'Animated PCB traces with data pulses flowing through circuit pathways.',
    tags: ['2d', 'animated', 'tech', 'premium'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float gridSize = 20.0;
        vec2 cell = floor(uv * gridSize);
        vec2 f = fract(uv * gridSize);
        
        vec3 col = vec3(0.0, 0.12, 0.08);

        // Traces
        float h = hash(cell);
        float trace = 0.0;
        
        // Horizontal traces
        if(h > 0.3) {
          trace += smoothstep(0.08, 0.04, abs(f.y - 0.5));
        }
        // Vertical traces
        if(h > 0.5) {
          trace += smoothstep(0.08, 0.04, abs(f.x - 0.5));
        }
        // Corner turns
        if(h > 0.7) {
          float corner = length(f - vec2(0.5)) - 0.15;
          trace += smoothstep(0.06, 0.02, abs(corner));
        }

        // Pads at intersections
        float pad = smoothstep(0.15, 0.1, length(f - vec2(0.5)));
        if(h > 0.85) trace += pad;

        // Data pulse
        float pulsePos = fract(t * 0.5 + h * 3.0);
        float pulse = 0.0;
        if(h > 0.3) {
          pulse = smoothstep(0.1, 0.0, abs(f.x - pulsePos)) * step(0.3, h);
          pulse += smoothstep(0.1, 0.0, abs(f.y - pulsePos)) * step(0.5, h);
        }

        vec3 traceCol = vec3(0.0, 0.6, 0.3);
        vec3 pulseCol = vec3(0.2, 1.0, 0.5);
        col += traceCol * trace * 0.5;
        col += pulseCol * pulse * trace * 0.8;
        col += vec3(0.8, 0.6, 0.2) * pad * step(0.85, h) * 0.6;

        // Solder mask texture
        float mask = hash(floor(uv * 200.0)) * 0.04;
        col += mask;

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        col += (mod(dp.x + dp.y, 2.0) - 0.5) * 0.015;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'liquid-lava',
    name: 'Liquid Lava',
    description: 'Flowing volcanic lava with glowing cracks and cooling dark crust.',
    tags: ['2d', 'animated', 'nature', 'premium'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for(int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 0.2;

        vec2 flow = vec2(t * 0.3, t * 0.1);
        float n1 = fbm(uv * 4.0 + flow);
        float n2 = fbm(uv * 8.0 - flow * 1.3 + n1);
        float crust = smoothstep(0.35, 0.55, n2);

        // Lava glow
        vec3 hotLava = mix(vec3(1.0, 0.8, 0.0), vec3(1.0, 0.2, 0.0), n1);
        vec3 darkCrust = vec3(0.08, 0.03, 0.02);

        vec3 col = mix(hotLava, darkCrust, crust);

        // Bright cracks
        float crack = smoothstep(0.48, 0.45, n2) * smoothstep(0.35, 0.42, n2);
        col += vec3(1.0, 0.9, 0.3) * crack * 2.0;

        // Glow underneath
        col += vec3(0.5, 0.1, 0.0) * (1.0 - crust) * 0.3;

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        col += (mod(dp.x + dp.y, 2.0) - 0.5) * 0.02;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
