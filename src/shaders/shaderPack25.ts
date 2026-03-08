import type { DitherShaderDef } from './ditherShaders';

export const shaderPack25: DitherShaderDef[] = [
  {
    id: 'holographic-foil',
    name: 'Holographic Foil',
    description: 'Iridescent holographic foil with rainbow diffraction and light-catching shimmer.',
    tags: ['artistic', 'premium', 'holographic'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= u_resolution.x / u_resolution.y;

        float angle = atan(p.y, p.x);
        float r = length(p);
        float md = length(uv - u_mouse);

        float wave1 = sin(p.x * 12.0 + u_time * 1.5 + p.y * 8.0) * 0.5 + 0.5;
        float wave2 = sin(r * 15.0 - u_time * 2.0 + angle * 3.0) * 0.5 + 0.5;
        float wave3 = sin((p.x + p.y) * 20.0 + u_time * 0.8) * 0.5 + 0.5;

        float shift = md * 6.0 + u_time * 0.5;
        vec3 col;
        col.r = sin(wave1 * 6.28 + shift) * 0.5 + 0.5;
        col.g = sin(wave2 * 6.28 + shift + 2.09) * 0.5 + 0.5;
        col.b = sin(wave3 * 6.28 + shift + 4.18) * 0.5 + 0.5;

        float shine = pow(max(0.0, 1.0 - md * 2.5), 3.0) * 0.6;
        col += shine;

        float scratch = sin(uv.x * 400.0 + uv.y * 100.0) * 0.02;
        col += scratch;

        col = clamp(col * 0.9 + 0.1, 0.0, 1.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'underwater-caustics',
    name: 'Underwater Caustics',
    description: 'Deep ocean caustic light patterns dancing on the seafloor with rippling water surface.',
    tags: ['nature', 'water', 'premium'],
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
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
                   mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
      }
      float caustic(vec2 p) {
        float c = 0.0;
        for (int i = 0; i < 3; i++) {
          float fi = float(i);
          vec2 q = p * (1.5 + fi * 0.5);
          q += vec2(u_time * (0.1 + fi * 0.05), u_time * (0.08 - fi * 0.03));
          float n = noise(q);
          c += pow(abs(sin(n * 6.28 + u_time)), 8.0) * (0.5 / (1.0 + fi));
        }
        return c;
      }
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 p = uv * 6.0 + u_mouse * 2.0;
        float c = caustic(p);
        float depth = 0.3 + uv.y * 0.4;
        vec3 deep = vec3(0.01, 0.05, 0.15);
        vec3 light = vec3(0.1, 0.6, 0.8);
        vec3 col = mix(deep, light, c * depth);
        float rays = pow(max(0.0, sin(uv.x * 8.0 + u_time * 0.3) * (1.0 - uv.y)), 3.0) * 0.15;
        col += rays * vec3(0.2, 0.8, 1.0);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'plasma-storm',
    name: 'Plasma Storm',
    description: 'Violent plasma energy storm with swirling vortexes and crackling energy discharges.',
    tags: ['space', 'premium', 'energy'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= u_resolution.x / u_resolution.y;

        float t = u_time * 0.6;
        vec2 m = (u_mouse * 2.0 - 1.0) * 0.5;

        float v = 0.0;
        v += sin(p.x * 3.0 + t);
        v += sin((p.y * 3.0 + t) * 0.7);
        v += sin((p.x * 3.0 + p.y * 3.0 + t) * 0.5);
        vec2 q = p + m;
        v += sin(length(q) * 5.0 - t * 2.0);
        v += sin(atan(q.y, q.x) * 4.0 + t) * 0.5;
        v *= 0.5;

        float crack = pow(abs(sin(v * 8.0 + t)), 12.0);
        vec3 col;
        col.r = sin(v * 3.14) * 0.5 + 0.5;
        col.g = sin(v * 3.14 + 1.0) * 0.3;
        col.b = sin(v * 3.14 + 2.0) * 0.5 + 0.5;
        col += crack * vec3(1.0, 0.8, 1.0) * 0.6;
        col *= 0.8 + 0.2 * sin(length(p - m) * 10.0 - t * 3.0);
        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }
    `,
  },
  {
    id: 'galaxy-spiral',
    name: 'Galaxy Spiral',
    description: 'Spiral galaxy with rotating arms, dense star clusters, and cosmic dust clouds.',
    tags: ['space', 'premium', 'galaxy'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= u_resolution.x / u_resolution.y;

        vec2 center = (u_mouse - 0.5) * 0.3;
        p -= center;

        float r = length(p);
        float a = atan(p.y, p.x);
        float t = u_time * 0.15;

        float arm = sin(a * 2.0 - r * 8.0 + t * 3.0) * 0.5 + 0.5;
        arm *= exp(-r * 1.5);
        float arm2 = sin(a * 2.0 - r * 6.0 + t * 2.0 + 3.14) * 0.5 + 0.5;
        arm2 *= exp(-r * 2.0);

        float stars = hash(floor(gl_FragCoord.xy * 0.5));
        stars = pow(stars, 20.0) * exp(-r * 0.5);

        float core = exp(-r * 8.0);
        float dust = sin(a * 5.0 + r * 12.0 - t) * 0.5 + 0.5;
        dust *= exp(-r * 3.0) * 0.3;

        vec3 col = vec3(0.0, 0.0, 0.02);
        col += arm * vec3(0.4, 0.5, 1.0) * 0.6;
        col += arm2 * vec3(0.8, 0.3, 0.6) * 0.4;
        col += core * vec3(1.0, 0.9, 0.7);
        col += stars * vec3(1.0, 0.95, 0.9);
        col += dust * vec3(0.6, 0.2, 0.1);
        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }
    `,
  },
  {
    id: 'diamond-rain',
    name: 'Diamond Rain',
    description: 'Sparkling diamond-shaped particles falling through prismatic light refractions.',
    tags: ['artistic', 'premium', 'particles'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      float diamond(vec2 p) {
        return abs(p.x) + abs(p.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec3 col = vec3(0.02, 0.01, 0.05);
        float t = u_time;

        for (int i = 0; i < 30; i++) {
          float fi = float(i);
          float speed = 0.3 + hash(vec2(fi, 0.0)) * 0.7;
          float x = hash(vec2(fi, 1.0));
          float y = fract(-t * speed * 0.2 + hash(vec2(fi, 2.0)));
          vec2 pos = vec2(x, y);
          float size = 0.008 + hash(vec2(fi, 3.0)) * 0.012;

          float d = diamond((uv - pos) / size);
          float shape = smoothstep(1.0, 0.3, d);

          float sparkle = sin(t * (3.0 + fi * 0.5) + fi) * 0.5 + 0.5;
          float md = length(uv - u_mouse);
          float proximity = exp(-md * 5.0) * 0.5;

          float hue = fract(fi * 0.13 + t * 0.05 + proximity);
          vec3 dc;
          dc.r = sin(hue * 6.28) * 0.5 + 0.5;
          dc.g = sin(hue * 6.28 + 2.09) * 0.5 + 0.5;
          dc.b = sin(hue * 6.28 + 4.18) * 0.5 + 0.5;

          col += shape * dc * (0.5 + sparkle * 0.5) * (0.7 + proximity);
        }
        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }
    `,
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    description: 'Shimmering aurora borealis with flowing curtains of green and purple light.',
    tags: ['nature', 'premium', 'aurora'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
                   mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
        return v;
      }
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 0.3;

        float aurora = 0.0;
        for (int i = 0; i < 4; i++) {
          float fi = float(i);
          float y = 0.5 + fi * 0.08;
          float wave = fbm(vec2(uv.x * 3.0 + t + fi, fi * 10.0)) * 0.15;
          float band = exp(-pow((uv.y - y - wave) * 8.0, 2.0));
          band *= 0.5 + 0.5 * sin(uv.x * 20.0 + t * 2.0 + fi * 3.0);
          aurora += band;
        }

        float md = length(uv - u_mouse);
        aurora *= 1.0 + exp(-md * 4.0) * 0.5;

        vec3 sky = mix(vec3(0.0, 0.0, 0.03), vec3(0.0, 0.02, 0.08), uv.y);
        vec3 green = vec3(0.1, 0.9, 0.3);
        vec3 purple = vec3(0.5, 0.1, 0.8);
        vec3 auroraCol = mix(green, purple, uv.y * 1.5 + sin(t) * 0.2);

        float stars = pow(hash(floor(gl_FragCoord.xy * 0.3)), 25.0);
        vec3 col = sky + auroraCol * aurora * 0.7 + stars * 0.5;
        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }
    `,
  },
  {
    id: 'cyberpunk-rain',
    name: 'Cyberpunk Rain',
    description: 'Neon-lit rain falling through a dark cityscape with reflections and glowing signs.',
    tags: ['retro', 'premium', 'cyberpunk'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        vec3 col = vec3(0.01, 0.01, 0.03);

        // Rain drops
        for (int i = 0; i < 40; i++) {
          float fi = float(i);
          float x = hash(vec2(fi, 0.0));
          float speed = 0.5 + hash(vec2(fi, 1.0)) * 1.0;
          float y = fract(-t * speed * 0.3 + hash(vec2(fi, 2.0)));
          float len = 0.02 + hash(vec2(fi, 3.0)) * 0.03;

          vec2 top = vec2(x, y);
          vec2 bot = vec2(x, y - len);
          float d = length(uv - clamp(uv, bot, top));
          // Approximate line distance
          vec2 dir = top - bot;
          float proj = clamp(dot(uv - bot, dir) / dot(dir, dir), 0.0, 1.0);
          vec2 closest = bot + dir * proj;
          d = length(uv - closest);

          float drop = smoothstep(0.003, 0.0, d);
          float neonHue = hash(vec2(fi, 4.0));
          vec3 neon;
          neon.r = sin(neonHue * 6.28) * 0.5 + 0.5;
          neon.g = sin(neonHue * 6.28 + 2.09) * 0.3;
          neon.b = sin(neonHue * 6.28 + 4.18) * 0.5 + 0.5;
          col += drop * (neon * 0.5 + 0.5) * 0.4;
        }

        // Neon glow zones
        float glow1 = exp(-pow((uv.x - 0.3) * 5.0, 2.0)) * exp(-pow((uv.y - 0.7) * 3.0, 2.0));
        float glow2 = exp(-pow((uv.x - 0.7) * 5.0, 2.0)) * exp(-pow((uv.y - 0.5) * 3.0, 2.0));
        col += glow1 * vec3(1.0, 0.1, 0.5) * (0.15 + 0.05 * sin(t * 3.0));
        col += glow2 * vec3(0.1, 0.5, 1.0) * (0.15 + 0.05 * sin(t * 2.0 + 1.0));

        // Mouse flashlight
        float md = length(uv - u_mouse);
        col += exp(-md * 6.0) * vec3(0.3, 0.3, 0.4) * 0.3;

        // Reflection on ground
        float ground = smoothstep(0.15, 0.0, uv.y);
        col += ground * col * 0.5;

        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }
    `,
  },
  {
    id: 'sacred-geometry',
    name: 'Sacred Geometry',
    description: 'Flower of life and Metatron\'s cube patterns with rotating golden ratio spirals.',
    tags: ['geometric', 'premium', 'sacred'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= u_resolution.x / u_resolution.y;

        float t = u_time * 0.3;
        vec2 m = (u_mouse - 0.5) * 0.5;

        // Flower of life
        float flower = 1.0;
        for (int i = 0; i < 7; i++) {
          float fi = float(i);
          float a = fi * 1.0472; // 60 degrees
          vec2 c = (i == 0) ? vec2(0.0) : vec2(cos(a + t * 0.2), sin(a + t * 0.2)) * 0.4;
          float circle = abs(length(p - c) - 0.4);
          flower = min(flower, circle);
        }
        float fLine = smoothstep(0.015, 0.005, flower);

        // Rotating triangles
        float tri = 1.0;
        for (int i = 0; i < 3; i++) {
          float fi = float(i);
          float a = fi * 2.094 + t;
          float cs = cos(a), sn = sin(a);
          vec2 rp = vec2(cs * p.x - sn * p.y, sn * p.x + cs * p.y);
          float s = abs(rp.x) * 0.866 + rp.y * 0.5;
          float edge = abs(s - 0.2 * (1.0 + fi * 0.3));
          tri = min(tri, edge);
        }
        float tLine = smoothstep(0.012, 0.004, tri);

        float r = length(p);
        float spiral = sin(atan(p.y, p.x) * 8.0 - r * 15.0 + t * 2.0);
        float sLine = smoothstep(0.3, 0.0, abs(spiral)) * exp(-r * 2.0) * 0.3;

        float md = length(uv - u_mouse);
        float glow = exp(-md * 4.0) * 0.3;

        vec3 gold = vec3(0.85, 0.65, 0.2);
        vec3 silver = vec3(0.7, 0.75, 0.85);
        vec3 bg = vec3(0.02, 0.02, 0.05);

        vec3 col = bg;
        col += fLine * gold * (0.6 + glow);
        col += tLine * silver * 0.5;
        col += sLine * mix(gold, silver, 0.5);
        col += glow * gold * 0.2;

        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }
    `,
  },
  {
    id: 'digital-ocean',
    name: 'Digital Ocean',
    description: 'Stylized ocean waves with foam, depth coloring, and wind-driven surface animation.',
    tags: ['nature', 'premium', 'ocean'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p); vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i + vec2(1,0)), f.x),
                   mix(hash(i + vec2(0,1)), hash(i + vec2(1,1)), f.x), f.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 0.5;
        vec2 wind = vec2(t * 0.3, 0.0) + u_mouse * 0.5;

        float wave = 0.0;
        float amp = 0.15;
        for (int i = 0; i < 5; i++) {
          float fi = float(i);
          float freq = 3.0 + fi * 2.0;
          float speed = 1.0 + fi * 0.3;
          wave += sin(uv.x * freq + t * speed + noise(uv * 4.0 + wind + fi) * 2.0) * amp;
          amp *= 0.6;
        }

        float surface = uv.y - 0.5 - wave;
        float foam = smoothstep(0.01, -0.005, surface) * smoothstep(-0.04, -0.01, surface);
        foam += pow(max(0.0, noise(uv * 30.0 + wind * 3.0) - 0.6), 2.0) * smoothstep(0.05, -0.02, surface) * 3.0;

        vec3 deep = vec3(0.0, 0.05, 0.2);
        vec3 shallow = vec3(0.0, 0.2, 0.4);
        vec3 sky = mix(vec3(0.5, 0.7, 1.0), vec3(0.9, 0.6, 0.3), pow(1.0 - uv.y, 3.0));

        float depth = clamp(-surface * 5.0, 0.0, 1.0);
        vec3 water = mix(shallow, deep, depth);

        float caustic = noise(uv * 15.0 + wind * 2.0) * noise(uv * 20.0 - wind);
        water += caustic * 0.1 * depth;

        vec3 col = surface > 0.0 ? sky : water;
        col += foam * vec3(0.9, 0.95, 1.0) * 0.8;

        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }
    `,
  },
  {
    id: 'pixel-fire',
    name: 'Pixel Fire',
    description: 'Retro pixel-art fire effect with rising embers and heat distortion.',
    tags: ['retro', 'premium', 'fire'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float pixelSize = 8.0;
        vec2 puv = floor(gl_FragCoord.xy / pixelSize) * pixelSize / u_resolution;

        float t = u_time;
        float fire = 0.0;

        // Fire columns
        for (int i = 0; i < 6; i++) {
          float fi = float(i);
          float x = 0.1 + fi * 0.15 + sin(t * 0.5 + fi) * 0.03;
          float base = 1.0 - puv.y;
          float dx = abs(puv.x - x);
          float flame = exp(-dx * 15.0) * base;
          float flicker = hash(vec2(fi, floor(t * 8.0))) * 0.3;
          flame *= 0.7 + flicker;
          float rise = sin(puv.y * 10.0 - t * 4.0 + fi * 2.0) * 0.1;
          flame *= smoothstep(0.0, 0.3, base + rise);
          fire += flame;
        }

        // Mouse heat source
        float md = length(puv - u_mouse);
        fire += exp(-md * 8.0) * 0.5;
        fire = clamp(fire, 0.0, 1.0);

        // Fire palette
        vec3 col;
        if (fire < 0.33) {
          col = mix(vec3(0.05, 0.0, 0.0), vec3(0.6, 0.1, 0.0), fire * 3.0);
        } else if (fire < 0.66) {
          col = mix(vec3(0.6, 0.1, 0.0), vec3(1.0, 0.6, 0.0), (fire - 0.33) * 3.0);
        } else {
          col = mix(vec3(1.0, 0.6, 0.0), vec3(1.0, 1.0, 0.5), (fire - 0.66) * 3.0);
        }

        // Embers
        for (int i = 0; i < 10; i++) {
          float fi = float(i);
          float ex = hash(vec2(fi, 0.0));
          float ey = fract(t * (0.1 + hash(vec2(fi, 1.0)) * 0.2) + hash(vec2(fi, 2.0)));
          vec2 ep = vec2(ex, ey);
          float ed = length(puv - ep);
          col += smoothstep(0.015, 0.0, ed) * vec3(1.0, 0.8, 0.3) * 0.4;
        }

        gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
      }
    `,
  },
];
