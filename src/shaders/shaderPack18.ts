import type { DitherShaderDef } from './ditherShaders';

export const shaderPack18: DitherShaderDef[] = [
  {
    id: 'clock-mechanism',
    name: 'Clock Mechanism',
    description: '2D animated clock with rotating hands, ticking second hand, and dithered face.',
    tags: ['2d', 'animated', 'mechanical'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float line(vec2 p, vec2 a, vec2 b, float w) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return smoothstep(w, w * 0.3, length(pa - ba * h));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 center = vec2(0.5);
        float t = u_time;
        float val = 0.0;
        
        float r = length(uv - center);
        
        // Clock face
        float face = smoothstep(0.32, 0.31, r) * (1.0 - smoothstep(0.3, 0.31, r) * 0.3);
        val += face * 0.3;
        
        // Hour markers
        for(int i = 0; i < 12; i++) {
          float a = float(i) * 3.14159 * 2.0 / 12.0;
          vec2 p1 = center + vec2(cos(a), sin(a)) * 0.27;
          vec2 p2 = center + vec2(cos(a), sin(a)) * 0.3;
          val += line(uv, p1, p2, 0.004);
        }
        
        // Hour hand
        float hourAngle = -t * 0.05 + 1.5708;
        vec2 hourEnd = center + vec2(cos(hourAngle), sin(hourAngle)) * 0.15;
        val += line(uv, center, hourEnd, 0.006);
        
        // Minute hand
        float minAngle = -t * 0.3 + 1.5708;
        vec2 minEnd = center + vec2(cos(minAngle), sin(minAngle)) * 0.22;
        val += line(uv, center, minEnd, 0.004);
        
        // Second hand
        float secAngle = -t * 3.14159 * 2.0 / 6.0 + 1.5708;
        vec2 secEnd = center + vec2(cos(secAngle), sin(secAngle)) * 0.25;
        val += line(uv, center, secEnd, 0.002) * 0.8;
        
        // Center dot
        val += smoothstep(0.008, 0.004, r);
        
        val = clamp(val, 0.0, 1.0);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        float dithered = step(dither * 0.2, val);
        
        vec3 col = mix(vec3(0.95, 0.92, 0.85), vec3(0.15, 0.12, 0.1), dithered);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'waving-flag',
    name: 'Waving Flag',
    description: '2D animated flag waving in the wind on a pole with cloth simulation.',
    tags: ['2d', 'animated', 'simulation'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        
        // Pole
        float pole = smoothstep(0.004, 0.001, abs(uv.x - 0.2)) * step(0.1, uv.y);
        
        // Flag area
        float flagX = (uv.x - 0.2) / 0.5;
        float flagY = (uv.y - 0.55) / 0.3;
        
        // Wave distortion
        float wave = sin(flagX * 6.0 - t * 3.0) * 0.03 * flagX;
        float wave2 = sin(flagX * 10.0 - t * 5.0 + 1.0) * 0.015 * flagX;
        flagY -= (wave + wave2);
        
        float inFlag = step(0.0, flagX) * step(flagX, 1.0) * step(-0.5, -abs(flagY));
        
        // Stripes
        float stripe = floor(flagY * 6.0 + 3.0);
        float stripeCol = mod(stripe, 2.0);
        
        // Shading from wave
        float shade = 0.8 + 0.2 * cos(flagX * 6.0 - t * 3.0);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 col = vec3(0.6, 0.75, 0.9); // sky
        
        if(inFlag > 0.5) {
          vec3 s1 = vec3(0.9, 0.2, 0.2);
          vec3 s2 = vec3(0.95, 0.95, 0.95);
          col = mix(s1, s2, stripeCol) * shade;
          col += dither * 0.03;
        }
        
        col = mix(col, vec3(0.3, 0.25, 0.2), pole);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'solar-system-2d',
    name: 'Solar System',
    description: '2D animated solar system with orbiting planets of different sizes and speeds.',
    tags: ['2d', 'animated', 'space'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 center = vec2(0.5);
        float t = u_time;
        float val = 0.0;
        
        // Sun
        float sunD = length(uv - center);
        val += smoothstep(0.05, 0.03, sunD);
        float sunGlow = 0.01 / (sunD * sunD + 0.001);
        
        // Planets
        float planets = 0.0;
        for(int i = 0; i < 6; i++) {
          float fi = float(i);
          float orbitR = 0.08 + fi * 0.06;
          float speed = 1.0 / (1.0 + fi * 0.5);
          float angle = t * speed + fi * 1.047;
          vec2 planetPos = center + vec2(cos(angle), sin(angle)) * orbitR;
          float planetR = 0.008 + fi * 0.003;
          planets += smoothstep(planetR, planetR * 0.4, length(uv - planetPos));
          
          // Orbit ring
          float orbitLine = abs(length(uv - center) - orbitR);
          val += smoothstep(0.002, 0.0005, orbitLine) * 0.2;
        }
        
        val += planets;
        val = clamp(val, 0.0, 1.0);
        
        // Stars background
        vec2 starGrid = floor(uv * 50.0);
        float star = step(0.97, fract(sin(dot(starGrid, vec2(127.1, 311.7))) * 43758.5453));
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 col = vec3(0.01, 0.01, 0.03) + star * 0.3;
        col += sunGlow * vec3(1.0, 0.6, 0.1) * 0.15;
        col += val * vec3(0.9, 0.85, 0.7);
        col += dither * 0.02;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'lava-lamp-2d',
    name: 'Lava Lamp',
    description: '2D animated lava lamp with morphing metaball blobs rising and falling.',
    tags: ['2d', 'animated', 'retro'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(float n) { return fract(sin(n) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        
        // Lamp shape (tall rectangle with rounded top/bottom)
        float lampX = smoothstep(0.3, 0.32, uv.x) * smoothstep(0.7, 0.68, uv.x);
        float lampY = smoothstep(0.05, 0.08, uv.y) * smoothstep(0.95, 0.92, uv.y);
        float inLamp = lampX * lampY;
        
        // Metaballs
        float meta = 0.0;
        for(int i = 0; i < 7; i++) {
          float fi = float(i);
          float x = 0.5 + sin(t * 0.5 + fi * 2.1) * 0.12;
          float speed = 0.2 + hash(fi) * 0.3;
          float y = 0.1 + mod(t * speed + hash(fi * 7.3), 0.8);
          float r = 0.04 + sin(t + fi) * 0.015;
          float d = length(uv - vec2(x, y));
          meta += r * r / (d * d + 0.001);
        }
        
        float blob = smoothstep(1.5, 2.5, meta);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        float dithered = step(dither * 0.3, blob);
        
        vec3 lavaCol = mix(vec3(0.8, 0.1, 0.05), vec3(1.0, 0.6, 0.0), blob);
        vec3 bgCol = vec3(0.4, 0.05, 0.1);
        vec3 lampCol = mix(bgCol, lavaCol, dithered);
        
        vec3 outside = vec3(0.1, 0.08, 0.12);
        vec3 col = mix(outside, lampCol, inLamp);
        
        // Lamp glass edge
        float edge = smoothstep(0.01, 0.0, abs(uv.x - 0.32) * lampY) + smoothstep(0.01, 0.0, abs(uv.x - 0.68) * lampY);
        col += edge * 0.15;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'dancing-bars',
    name: 'Dancing Bars',
    description: '2D animated audio visualizer bars bouncing to a simulated beat.',
    tags: ['2d', 'animated', 'audio'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(float n) { return fract(sin(n) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        
        float numBars = 32.0;
        float barIdx = floor(uv.x * numBars);
        float barX = barIdx / numBars;
        float barWidth = 1.0 / numBars;
        float inBar = step(barX, uv.x) * step(uv.x, barX + barWidth * 0.8);
        
        // Simulated audio levels
        float freq = barIdx / numBars;
        float beat = abs(sin(t * 3.0)) * 0.3;
        float level = 0.1
          + abs(sin(t * 2.0 + barIdx * 0.5)) * 0.3
          + abs(sin(t * 5.0 + barIdx * 0.3)) * 0.15 * step(freq, 0.5)
          + beat * (1.0 - freq)
          + abs(sin(t * 7.0 + barIdx * 0.9)) * 0.1;
        level = clamp(level, 0.05, 0.95);
        
        float barFill = step(uv.y, level) * inBar;
        
        // Color gradient based on height
        vec3 low = vec3(0.0, 0.8, 0.4);
        vec3 mid = vec3(1.0, 0.8, 0.0);
        vec3 high = vec3(1.0, 0.1, 0.1);
        vec3 barColor = uv.y < 0.4 ? mix(low, mid, uv.y / 0.4) : mix(mid, high, (uv.y - 0.4) / 0.6);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 col = vec3(0.03);
        col = mix(col, barColor, barFill);
        col += dither * 0.015;
        
        // Reflection
        float refY = -uv.y * 0.3 + 0.05;
        if(uv.y < 0.05) {
          col += barColor * 0.15 * step(0.0, refY);
        }
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'butterfly-flutter',
    name: 'Butterfly Flutter',
    description: '2D animated butterflies with flapping wings drifting across a garden.',
    tags: ['2d', 'animated', 'nature'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(float n) { return fract(sin(n) * 43758.5453); }

      float butterfly(vec2 p, vec2 pos, float flapPhase, float size) {
        vec2 d = p - pos;
        float flapAngle = sin(flapPhase) * 0.6;
        
        // Left wing
        vec2 lw = vec2(d.x + size * 0.3, d.y);
        lw.x *= 1.0 + flapAngle;
        float leftWing = smoothstep(size, size * 0.7, length(lw * vec2(1.0, 1.5)));
        
        // Right wing
        vec2 rw = vec2(d.x - size * 0.3, d.y);
        rw.x *= 1.0 - flapAngle;
        float rightWing = smoothstep(size, size * 0.7, length(rw * vec2(1.0, 1.5)));
        
        // Body
        float body = smoothstep(size * 0.15, size * 0.05, abs(d.x)) * smoothstep(size * 0.6, size * 0.1, abs(d.y));
        
        return clamp(leftWing + rightWing + body, 0.0, 1.0);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        for(int i = 0; i < 6; i++) {
          float fi = float(i);
          float x = fract(hash(fi * 3.7) + t * 0.03 * (0.5 + hash(fi * 5.1) * 0.5));
          float y = 0.3 + hash(fi * 8.3) * 0.5 + sin(t * 0.5 + fi * 2.0) * 0.08;
          float phase = t * 8.0 + fi * 1.3;
          float sz = 0.03 + hash(fi * 11.1) * 0.02;
          val += butterfly(uv, vec2(x, y), phase, sz);
        }
        
        // Flowers on ground
        for(int i = 0; i < 8; i++) {
          float fi = float(i);
          vec2 fp = vec2(hash(fi * 13.7), 0.08 + hash(fi * 17.1) * 0.08);
          float petal = smoothstep(0.02, 0.01, length(uv - fp));
          val += petal * 0.5;
        }
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        float dithered = step(dither * 0.3, val);
        
        vec3 sky = mix(vec3(0.5, 0.8, 0.95), vec3(0.3, 0.5, 0.9), uv.y);
        vec3 ground = vec3(0.3, 0.6, 0.2);
        vec3 base = uv.y < 0.15 ? ground : sky;
        vec3 accent = vec3(0.95, 0.5, 0.2);
        vec3 col = mix(base, accent, dithered);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'pixel-explosion',
    name: 'Pixel Explosion',
    description: 'Repeating 2D particle explosion with pixels flying outward and fading.',
    tags: ['2d', 'animated', 'particles'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        vec2 center = u_mouse;
        float val = 0.0;
        
        float cycle = mod(t, 3.0);
        float explodeT = clamp(cycle, 0.0, 2.5);
        
        for(int i = 0; i < 60; i++) {
          float fi = float(i);
          float angle = hash(vec2(fi, 0.0)) * 6.28318;
          float speed = 0.1 + hash(vec2(fi, 1.0)) * 0.4;
          float r = explodeT * speed;
          vec2 particlePos = center + vec2(cos(angle), sin(angle)) * r;
          
          // Gravity
          particlePos.y -= explodeT * explodeT * 0.05;
          
          float fade = 1.0 - explodeT / 2.5;
          float pixelSize = 0.005 + hash(vec2(fi, 2.0)) * 0.005;
          float d = max(abs(uv.x - particlePos.x), abs(uv.y - particlePos.y));
          val += smoothstep(pixelSize, pixelSize * 0.3, d) * fade;
        }
        
        // Flash at start
        float flash = exp(-cycle * 5.0) * 0.5;
        
        vec2 dp = floor(gl_FragCoord.xy / 3.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 col = vec3(0.02, 0.01, 0.03);
        col += flash * vec3(1.0, 0.8, 0.3);
        vec3 particleCol = mix(vec3(1.0, 0.4, 0.1), vec3(1.0, 0.9, 0.2), hash(dp));
        col += clamp(val, 0.0, 1.0) * particleCol;
        col += dither * 0.02;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'snake-game',
    name: 'Snake Game',
    description: '2D animated snake slithering across a grid, growing and turning.',
    tags: ['2d', 'animated', 'game'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float gridSize = 20.0;
        vec2 cell = floor(uv * gridSize);
        vec2 cellUV = fract(uv * gridSize);
        
        // Grid
        float grid = smoothstep(0.05, 0.08, cellUV.x) * smoothstep(0.05, 0.08, cellUV.y);
        
        // Snake head position (follows a path)
        float headX = floor(gridSize * 0.5 + sin(t * 0.8) * gridSize * 0.35);
        float headY = floor(gridSize * 0.5 + cos(t * 0.6) * gridSize * 0.35);
        
        // Snake body (trail of previous positions)
        float snake = 0.0;
        for(int i = 0; i < 12; i++) {
          float fi = float(i);
          float tt = t - fi * 0.15;
          float sx = floor(gridSize * 0.5 + sin(tt * 0.8) * gridSize * 0.35);
          float sy = floor(gridSize * 0.5 + cos(tt * 0.6) * gridSize * 0.35);
          if(cell.x == sx && cell.y == sy) {
            snake = 1.0 - fi * 0.07;
          }
        }
        
        // Food
        float foodX = mod(floor(t * 0.3) * 7.0, gridSize);
        float foodY = mod(floor(t * 0.3) * 13.0, gridSize);
        float food = (cell.x == foodX && cell.y == foodY) ? 1.0 : 0.0;
        float foodPulse = 0.5 + 0.5 * sin(t * 5.0);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 col = vec3(0.05, 0.1, 0.05) * grid;
        col += snake * vec3(0.0, 0.7, 0.2) * grid;
        col += food * foodPulse * vec3(0.9, 0.1, 0.1) * grid;
        col += dither * 0.02;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'paper-airplane',
    name: 'Paper Airplane',
    description: '2D animated paper airplanes looping through the sky leaving dithered trails.',
    tags: ['2d', 'animated', 'whimsical'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float line(vec2 p, vec2 a, vec2 b, float w) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return smoothstep(w, w * 0.2, length(pa - ba * h));
      }

      float airplane(vec2 p, vec2 pos, float angle, float size) {
        vec2 d = p - pos;
        float c = cos(angle), s = sin(angle);
        d = vec2(c * d.x + s * d.y, -s * d.x + c * d.y) / size;
        
        // Fuselage
        float body = line(d, vec2(-0.5, 0.0), vec2(0.5, 0.0), 0.03);
        // Wings
        body += line(d, vec2(-0.1, 0.0), vec2(0.2, 0.3), 0.02);
        body += line(d, vec2(-0.1, 0.0), vec2(0.2, -0.3), 0.02);
        body += line(d, vec2(0.2, 0.3), vec2(0.5, 0.0), 0.015);
        body += line(d, vec2(0.2, -0.3), vec2(0.5, 0.0), 0.015);
        // Tail
        body += line(d, vec2(-0.5, 0.0), vec2(-0.35, 0.15), 0.015);
        body += line(d, vec2(-0.5, 0.0), vec2(-0.35, -0.15), 0.015);
        
        return clamp(body, 0.0, 1.0);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        for(int i = 0; i < 3; i++) {
          float fi = float(i);
          float phase = t * 0.8 + fi * 2.1;
          float x = 0.5 + cos(phase) * 0.3;
          float y = 0.5 + sin(phase * 2.0) * 0.2;
          float angle = cos(phase) * 0.5;
          float sz = 0.06 + fi * 0.01;
          val += airplane(uv, vec2(x, y), angle, sz);
          
          // Trail (dotted)
          for(int j = 1; j < 15; j++) {
            float fj = float(j);
            float tp = phase - fj * 0.1;
            float tx = 0.5 + cos(tp) * 0.3;
            float ty = 0.5 + sin(tp * 2.0) * 0.2;
            float fade = 1.0 - fj / 15.0;
            val += smoothstep(0.004, 0.002, length(uv - vec2(tx, ty))) * fade * 0.4;
          }
        }
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        float dithered = step(dither * 0.25, val);
        
        vec3 sky = mix(vec3(0.55, 0.75, 0.95), vec3(0.85, 0.9, 1.0), uv.y);
        vec3 planeCol = vec3(0.2, 0.2, 0.25);
        vec3 col = mix(sky, planeCol, dithered);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'dripping-paint',
    name: 'Dripping Paint',
    description: '2D animated paint drips running down the canvas with viscous motion.',
    tags: ['2d', 'animated', 'artistic'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(float n) { return fract(sin(n) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        float hue = 0.0;
        
        for(int i = 0; i < 12; i++) {
          float fi = float(i);
          float x = hash(fi * 7.3) * 0.9 + 0.05;
          float width = 0.015 + hash(fi * 11.1) * 0.02;
          float speed = 0.1 + hash(fi * 3.7) * 0.2;
          float startTime = hash(fi * 5.3) * 5.0;
          float dripLen = clamp((t - startTime) * speed, 0.0, 0.9);
          
          // Drip shape
          float xDist = abs(uv.x - x);
          float inDrip = smoothstep(width, width * 0.5, xDist);
          float yStart = 0.95;
          float yEnd = yStart - dripLen;
          
          // Bulge at bottom
          float bulge = smoothstep(yEnd + 0.03, yEnd, uv.y) * 1.5;
          float dripWidth = width * (1.0 + bulge);
          inDrip = smoothstep(dripWidth, dripWidth * 0.4, xDist);
          
          float inY = step(yEnd, uv.y) * step(uv.y, yStart);
          float drip = inDrip * inY;
          
          if(drip > val) {
            val = drip;
            hue = fi / 12.0;
          }
        }
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        // Canvas texture
        float canvas = 0.95 + sin(uv.x * 200.0) * sin(uv.y * 200.0) * 0.02;
        
        vec3 canvasCol = vec3(0.95, 0.93, 0.88) * canvas;
        
        // Paint colors based on hue
        vec3 paintCol = 0.5 + 0.5 * cos(6.28318 * (hue + vec3(0.0, 0.33, 0.67)));
        
        vec3 col = mix(canvasCol, paintCol, step(0.3, val));
        col += dither * 0.015;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
