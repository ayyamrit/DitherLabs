import type { DitherShaderDef } from './ditherShaders';

export const shaderPackBeach: DitherShaderDef[] = [
  {
    id: 'beach-ocean-waves',
    name: 'Beach Ocean Waves',
    description: 'Waves rolling onto a sandy beach with foam and receding water.',
    tags: ['beach', 'ocean', 'waves', 'nature'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                   mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float beachLine = -0.1 + sin(uv.x * 2.0) * 0.03;
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

        vec3 col;

        if(uv.y > beachLine + 0.15) {
          // Sky
          float t = (uv.y - beachLine) / 0.6;
          col = mix(vec3(0.5, 0.75, 0.95), vec3(0.2, 0.4, 0.8), t);
          // Clouds
          float cloud = noise(vec2(uv.x * 3.0 + u_time * 0.05, uv.y * 5.0));
          col = mix(col, vec3(0.95, 0.95, 1.0), smoothstep(0.5, 0.7, cloud) * 0.4);
        } else if(uv.y > beachLine) {
          // Sand
          float sandNoise = noise(uv * 30.0) * 0.1;
          float dithered = step(bayer, 0.5 + sandNoise);
          col = mix(vec3(0.76, 0.65, 0.45), vec3(0.85, 0.75, 0.55), dithered);
        } else {
          // Ocean
          float depth = beachLine - uv.y;
          vec2 waveUV = vec2(uv.x * 3.0, uv.y * 2.0);

          // Wave crests
          float wave = 0.0;
          for(int i = 0; i < 4; i++) {
            float fi = float(i);
            float phase = u_time * (0.5 + fi * 0.2) + fi * 1.3;
            float w = sin(waveUV.x * (2.0 + fi) + waveUV.y * 3.0 + phase);
            wave += w * (0.3 - fi * 0.05);
          }

          // Foam near shore
          float foam = smoothstep(0.1, 0.0, depth);
          float foamPattern = noise(vec2(uv.x * 15.0, u_time * 0.5 + uv.y * 10.0));
          foam *= step(0.4, foamPattern);

          float dithered = step(bayer, wave * 0.3 + 0.4 + foam * 0.4);
          vec3 deepOcean = vec3(0.05, 0.2, 0.4);
          vec3 shallowOcean = vec3(0.1, 0.5, 0.6);
          vec3 oceanCol = mix(shallowOcean, deepOcean, smoothstep(0.0, 0.3, depth));
          col = mix(oceanCol, vec3(0.9, 0.95, 1.0), dithered * foam);
          col = mix(col, oceanCol * (0.7 + 0.3 * step(bayer, wave * 0.3 + 0.5)), 1.0 - foam);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'beach-sunset',
    name: 'Beach Sunset',
    description: 'Golden sunset over the ocean with silhouetted palm trees and warm reflections.',
    tags: ['beach', 'sunset', 'tropical', 'nature'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float palmTree(vec2 uv, vec2 base) {
        // Trunk
        float trunk = smoothstep(0.02, 0.01, abs(uv.x - base.x - sin((uv.y - base.y) * 5.0) * 0.02));
        trunk *= step(base.y, uv.y) * step(uv.y, base.y + 0.25);

        // Fronds
        float fronds = 0.0;
        vec2 top = base + vec2(sin(0.25 * 5.0) * 0.02, 0.25);
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          float angle = -0.8 + fi * 0.4 + sin(u_time + fi) * 0.1;
          vec2 dir = vec2(cos(angle), sin(angle));
          float len = 0.12 + fi * 0.01;
          vec2 tip = top + dir * len;
          vec2 mid = top + dir * len * 0.5 + vec2(0.0, 0.02);
          float d = length(uv - mix(top, tip, clamp(dot(uv - top, tip - top) / dot(tip - top, tip - top), 0.0, 1.0)));
          fronds += smoothstep(0.015, 0.005, d);
        }

        return max(trunk, fronds);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float horizon = -0.1;
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

        vec3 col;

        // Sun position
        vec2 sunPos = vec2(-0.1, horizon + 0.08 + sin(u_time * 0.1) * 0.02);

        if(uv.y > horizon) {
          // Sky
          float t = (uv.y - horizon) / 0.6;
          vec3 low = vec3(1.0, 0.5, 0.15);
          vec3 mid = vec3(0.9, 0.3, 0.2);
          vec3 high = vec3(0.2, 0.1, 0.3);
          col = mix(low, mid, smoothstep(0.0, 0.3, t));
          col = mix(col, high, smoothstep(0.3, 0.8, t));

          // Sun
          float sunD = length(uv - sunPos);
          col += smoothstep(0.08, 0.02, sunD) * vec3(1.0, 0.9, 0.5);
          col += smoothstep(0.25, 0.05, sunD) * vec3(0.5, 0.2, 0.0) * 0.3;

          float dithered = step(bayer, length(col) * 0.35);
          col *= (0.75 + 0.25 * dithered);
        } else {
          // Ocean with sunset reflection
          float depth = horizon - uv.y;
          float wave = sin(uv.x * 8.0 + u_time * 1.5) * sin(uv.x * 12.0 - u_time) * 0.01;
          float reflX = uv.x - sunPos.x;
          float sunRefl = exp(-8.0 * abs(reflX + wave)) * exp(-3.0 * depth);

          vec3 ocean = mix(vec3(0.1, 0.15, 0.25), vec3(0.05, 0.08, 0.15), depth * 3.0);
          float dithered = step(bayer, sunRefl * 0.6 + 0.1);
          col = mix(ocean, vec3(1.0, 0.6, 0.2), dithered * sunRefl);
          col = max(col, ocean);
        }

        // Palm trees
        float tree1 = palmTree(uv, vec2(-0.5, horizon));
        float tree2 = palmTree(uv, vec2(0.45, horizon - 0.02));
        float trees = max(tree1, tree2);
        col = mix(col, vec3(0.02, 0.01, 0.03), trees);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'beach-tropical-lagoon',
    name: 'Tropical Lagoon',
    description: 'Crystal clear turquoise water with sandy bottom and gentle ripples.',
    tags: ['beach', 'tropical', 'water', 'nature'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                   mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

        // Water ripples
        vec2 waterUV = uv * 4.0;
        float ripple = sin(waterUV.x + u_time) * sin(waterUV.y + u_time * 0.7) * 0.02;
        vec2 distortedUV = uv + ripple;

        // Caustics on sandy bottom
        float c1 = sin(distortedUV.x * 10.0 + u_time * 1.5) * sin(distortedUV.y * 10.0 - u_time);
        float c2 = sin(distortedUV.x * 7.0 - u_time * 0.8) * sin(distortedUV.y * 8.0 + u_time * 1.2);
        float caustics = (c1 + c2) * 0.25 + 0.5;

        // Depth gradient
        float depth = smoothstep(-0.5, 0.3, uv.y);
        vec3 shallow = vec3(0.1, 0.7, 0.65);
        vec3 deep = vec3(0.02, 0.2, 0.4);
        vec3 waterCol = mix(deep, shallow, depth);

        // Sandy patches
        float sand = noise(distortedUV * 5.0);
        vec3 sandCol = vec3(0.7, 0.6, 0.4);
        waterCol = mix(waterCol, sandCol, smoothstep(0.6, 0.7, sand) * depth * 0.4);

        float dithered = step(bayer, caustics * 0.5 + depth * 0.2);
        vec3 col = mix(waterCol * 0.6, waterCol * 1.2, dithered);

        // Surface sparkle
        float sparkle = hash(floor(gl_FragCoord.xy / 3.0 + u_time * 2.0));
        col += step(0.97, sparkle) * vec3(0.5, 0.5, 0.4) * 0.5;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'beach-starry-night',
    name: 'Starry Beach Night',
    description: 'Peaceful nighttime beach with stars reflecting on calm dark water.',
    tags: ['beach', 'night', 'stars', 'peaceful'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float horizon = -0.05;
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

        vec3 col = vec3(0.005, 0.008, 0.02);

        if(uv.y > horizon) {
          // Night sky
          col = mix(vec3(0.01, 0.015, 0.04), vec3(0.005, 0.005, 0.02), (uv.y - horizon) / 0.5);

          // Stars
          vec2 starGrid = floor(uv * 60.0);
          float starVal = hash(starGrid);
          float twinkle = sin(u_time * (1.0 + starVal * 3.0) + starVal * 6.28) * 0.5 + 0.5;
          float star = step(0.96, starVal) * twinkle;

          // Milky way band
          float milky = smoothstep(0.3, 0.0, abs(uv.x + uv.y * 0.5 - 0.1)) * 0.08;

          float dithered = step(bayer, star * 0.6 + milky);
          col += dithered * vec3(0.6, 0.65, 0.8);

          // Moon
          float moonD = length(uv - vec2(0.35, 0.3));
          col += smoothstep(0.05, 0.03, moonD) * vec3(0.7, 0.75, 0.85);
          col += smoothstep(0.15, 0.05, moonD) * vec3(0.05, 0.08, 0.15);
        } else {
          // Dark water
          float depth = horizon - uv.y;
          float wave = sin(uv.x * 5.0 + u_time * 0.8) * 0.005;

          // Moon reflection
          float moonReflX = uv.x - 0.35;
          float moonRefl = exp(-10.0 * abs(moonReflX + wave)) * exp(-5.0 * depth);

          // Star reflections
          vec2 reflGrid = floor(vec2(uv.x, -uv.y + wave * 10.0) * 60.0);
          float reflStar = step(0.97, hash(reflGrid)) * 0.2;

          float dithered = step(bayer, moonRefl * 0.4 + reflStar + 0.02);
          col = mix(vec3(0.005, 0.01, 0.025), vec3(0.4, 0.45, 0.6), dithered);

          // Gentle wave foam at shore
          float shore = smoothstep(0.02, 0.0, depth);
          float foam = sin(uv.x * 20.0 + u_time * 2.0) * 0.5 + 0.5;
          col += shore * foam * step(bayer, 0.3) * vec3(0.1, 0.12, 0.15);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'beach-tidepool',
    name: 'Tidepool',
    description: 'Close-up of a rocky tidepool with swirling water and scattered pebbles.',
    tags: ['beach', 'water', 'nature', 'detail'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                   mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

        // Rock border
        float poolShape = length(uv * vec2(1.2, 1.0));
        float rock = smoothstep(0.35, 0.38, poolShape + noise(uv * 8.0) * 0.08);

        vec3 col;

        if(rock > 0.5) {
          // Rocky edge
          float rockN = noise(uv * 20.0);
          float dithered = step(bayer, rockN * 0.4 + 0.2);
          col = mix(vec3(0.2, 0.18, 0.15), vec3(0.35, 0.3, 0.25), dithered);
        } else {
          // Water
          vec2 swirl = uv;
          float a = atan(uv.y, uv.x) + u_time * 0.2;
          float r = length(uv);
          swirl = vec2(cos(a), sin(a)) * r;

          float caustic = sin(swirl.x * 15.0 + u_time) * sin(swirl.y * 15.0 - u_time * 0.7) * 0.5 + 0.5;

          // Pebbles
          float pebbles = 0.0;
          for(int i = 0; i < 8; i++) {
            float fi = float(i);
            vec2 pp = vec2(hash(vec2(fi, 0.0)) - 0.5, hash(vec2(fi, 1.0)) - 0.5) * 0.5;
            float ps = 0.02 + hash(vec2(fi, 2.0)) * 0.02;
            pebbles += smoothstep(ps, ps * 0.5, length(uv - pp));
          }

          float dithered = step(bayer, caustic * 0.4 + 0.15);
          vec3 waterCol = mix(vec3(0.05, 0.25, 0.3), vec3(0.15, 0.5, 0.5), dithered);

          // Pebble color
          float pDithered = step(bayer, pebbles * 0.6);
          col = mix(waterCol, vec3(0.4, 0.35, 0.25), pDithered);

          // Surface ripple
          float ripple = sin(length(uv - u_mouse + 0.5) * 30.0 - u_time * 4.0) * 0.5 + 0.5;
          col += smoothstep(0.7, 0.9, ripple) * 0.05;
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
