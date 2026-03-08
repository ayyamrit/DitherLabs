import type { DitherShaderDef } from './ditherShaders';

export const shaderPack19: DitherShaderDef[] = [
  {
    id: 'typing-text',
    name: 'Typing Text',
    description: '2D animated typewriter effect rendering pixel characters one at a time.',
    tags: ['2d', 'animated', 'text'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float char(vec2 p, int c) {
        vec2 ip = floor(p);
        if(ip.x < 0.0 || ip.x > 4.0 || ip.y < 0.0 || ip.y > 5.0) return 0.0;
        // Simple block characters
        float idx = ip.y * 5.0 + ip.x;
        float pattern = 0.0;
        if(c == 0) { // H
          pattern = step(0.5, mod(ip.x, 4.0)) + step(2.0, ip.y) * step(ip.y, 3.0);
        } else if(c == 1) { // E
          pattern = step(ip.x, 0.5) + step(4.5, ip.y) + step(ip.y, 0.5) + step(2.0, ip.y) * step(ip.y, 3.0);
        } else if(c == 2) { // L
          pattern = step(ip.x, 0.5) + step(ip.y, 0.5);
        } else { // O
          pattern = step(ip.x, 0.5) + step(3.5, ip.x) + step(4.5, ip.y) + step(ip.y, 0.5);
        }
        return clamp(pattern, 0.0, 1.0);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        float charSize = 8.0;
        float numChars = 4.0;
        float charsShown = mod(t * 2.0, numChars + 2.0);
        
        for(int i = 0; i < 4; i++) {
          float fi = float(i);
          if(fi < charsShown) {
            vec2 charPos = (uv - vec2(0.2 + fi * 0.15, 0.4)) * u_resolution.y / charSize;
            val += char(charPos, i);
          }
        }
        
        // Cursor blink
        float cursorX = 0.2 + min(charsShown, numChars) * 0.15;
        float cursor = step(abs(uv.x - cursorX), 0.005) * step(0.38, uv.y) * step(uv.y, 0.55);
        cursor *= step(0.5, fract(t * 2.0));
        val += cursor;
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 col = vec3(0.1, 0.1, 0.12);
        col += clamp(val, 0.0, 1.0) * vec3(0.0, 0.9, 0.4);
        col += dither * 0.02;
        
        // CRT curve
        float vig = 1.0 - length(uv - 0.5) * 0.5;
        col *= vig;
        col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 3.0);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'spinning-top',
    name: 'Spinning Top',
    description: '2D animated spinning top wobbling on a surface with motion blur dithering.',
    tags: ['2d', 'animated', 'physics'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        // Wobble
        float wobble = sin(t * 3.0) * 0.03;
        vec2 topCenter = vec2(0.5 + wobble, 0.45);
        
        // Top body (triangle-ish)
        vec2 d = uv - topCenter;
        float angle = atan(d.y, d.x) + t * 8.0;
        float dist = length(d);
        
        // Conical shape
        float bodyWidth = max(0.0, (0.35 - uv.y) * 0.5);
        float inBody = step(dist, bodyWidth) * step(0.15, uv.y) * step(uv.y, 0.55);
        
        // Spinning pattern
        float pattern = sin(angle * 4.0) * 0.5 + 0.5;
        val += inBody * pattern;
        
        // Tip
        float tip = smoothstep(0.008, 0.003, length(uv - vec2(topCenter.x, 0.15)));
        val += tip;
        
        // Handle on top
        float handle = smoothstep(0.006, 0.002, abs(uv.x - topCenter.x)) * step(0.55, uv.y) * step(uv.y, 0.65);
        val += handle;
        
        // Ground shadow
        float shadow = smoothstep(0.15, 0.0, abs(uv.y - 0.12)) * smoothstep(0.2, 0.0, abs(uv.x - topCenter.x));
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        float dithered = step(dither * 0.3, val);
        
        vec3 col = vec3(0.95, 0.92, 0.85);
        col -= shadow * 0.2;
        vec3 topCol = mix(vec3(0.8, 0.2, 0.2), vec3(0.2, 0.2, 0.8), pattern);
        col = mix(col, topCol, dithered * inBody);
        col = mix(col, vec3(0.3), (tip + handle) * 0.8);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'bouncing-dvd-logo',
    name: 'DVD Bounce',
    description: '2D animated DVD screensaver logo bouncing off screen edges, color changing on hit.',
    tags: ['2d', 'animated', 'retro'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        
        // Bouncing position
        float speed = 0.15;
        float x = abs(mod(t * speed, 2.0) - 1.0);
        float y = abs(mod(t * speed * 0.7 + 0.3, 2.0) - 1.0);
        x = x * 0.7 + 0.15;
        y = y * 0.7 + 0.15;
        
        // "Logo" rectangle
        vec2 logoSize = vec2(0.12, 0.06);
        vec2 d = abs(uv - vec2(x, y));
        float inLogo = step(d.x, logoSize.x) * step(d.y, logoSize.y);
        
        // "DVD" letters inside (simplified)
        vec2 local = (uv - vec2(x, y)) / logoSize;
        float letters = 0.0;
        // D
        letters += step(abs(local.x + 0.55), 0.06) * step(abs(local.y), 0.7);
        letters += smoothstep(0.3, 0.25, abs(length(vec2(local.x + 0.45, local.y)) - 0.35)) * step(-0.5, local.x);
        // V
        letters += smoothstep(0.06, 0.03, abs(local.x - local.y * 0.15 + 0.05));
        letters += smoothstep(0.06, 0.03, abs(local.x + local.y * 0.15 - 0.25));
        
        letters = clamp(letters * inLogo, 0.0, 1.0);
        
        // Color changes based on bounces
        float bounceCount = floor(t * speed) + floor(t * speed * 0.7);
        vec3 logoCol = 0.5 + 0.5 * cos(bounceCount * 1.5 + vec3(0.0, 2.1, 4.2));
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 col = vec3(0.02);
        col += inLogo * logoCol * 0.8;
        col += dither * 0.02;
        
        // Screen glow
        float glow = smoothstep(0.3, 0.0, length(uv - vec2(x, y))) * 0.1;
        col += glow * logoCol;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'fireworks-2d',
    name: 'Fireworks',
    description: '2D animated firework bursts launching from the ground and exploding in the sky.',
    tags: ['2d', 'animated', 'celebration'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(float n) { return fract(sin(n) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        vec3 col = vec3(0.01, 0.01, 0.03);
        
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          float launchTime = fi * 1.2 + hash(fi) * 0.5;
          float cycle = mod(t - launchTime, 6.0);
          float launchX = 0.15 + hash(fi * 7.3) * 0.7;
          float explodeY = 0.5 + hash(fi * 3.1) * 0.35;
          
          if(cycle < 0.8) {
            // Rising trail
            float trailY = cycle / 0.8 * explodeY;
            float trail = smoothstep(0.008, 0.002, length(uv - vec2(launchX, trailY)));
            col += trail * vec3(1.0, 0.8, 0.3);
          } else if(cycle < 3.0) {
            // Explosion
            float explodeT = cycle - 0.8;
            float fade = 1.0 - explodeT / 2.2;
            fade = max(fade, 0.0);
            
            vec3 sparkleCol = 0.5 + 0.5 * cos(fi * 2.0 + vec3(0.0, 2.0, 4.0));
            
            for(int j = 0; j < 20; j++) {
              float fj = float(j);
              float angle = fj * 0.314159 + hash(fi * 13.0 + fj);
              float speed = 0.1 + hash(fi * 5.0 + fj * 3.0) * 0.15;
              vec2 sparkPos = vec2(launchX, explodeY) + vec2(cos(angle), sin(angle)) * speed * explodeT;
              sparkPos.y -= explodeT * explodeT * 0.04; // gravity
              
              float spark = smoothstep(0.006, 0.002, length(uv - sparkPos)) * fade;
              col += spark * sparkleCol;
            }
          }
        }
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        col += dither * 0.015;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'windmill-2d',
    name: 'Windmill',
    description: '2D animated windmill with rotating blades in a pastoral landscape.',
    tags: ['2d', 'animated', 'landscape'],
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

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        // Sky
        vec3 sky = mix(vec3(0.8, 0.5, 0.3), vec3(0.4, 0.6, 0.9), uv.y);
        
        // Ground
        float ground = smoothstep(0.32, 0.3, uv.y);
        
        // Windmill tower
        vec2 towerBot = vec2(0.5, 0.3);
        float towerW = 0.025 + (0.55 - uv.y) * 0.02;
        float tower = step(abs(uv.x - 0.5), towerW) * step(0.3, uv.y) * step(uv.y, 0.65);
        
        // Blades
        vec2 hub = vec2(0.5, 0.62);
        float bladeLen = 0.18;
        float windSpeed = 1.5 + u_mouse.x * 2.0;
        
        for(int i = 0; i < 4; i++) {
          float fi = float(i);
          float angle = t * windSpeed + fi * 1.5708;
          vec2 bladeEnd = hub + vec2(cos(angle), sin(angle)) * bladeLen;
          val += line(uv, hub, bladeEnd, 0.006);
          
          // Blade sail (triangle)
          vec2 mid = hub + vec2(cos(angle), sin(angle)) * bladeLen * 0.6;
          vec2 perpDir = vec2(-sin(angle), cos(angle)) * 0.025;
          val += line(uv, hub + vec2(cos(angle), sin(angle)) * 0.02, mid + perpDir, 0.004) * 0.5;
        }
        
        // Hub
        val += smoothstep(0.012, 0.008, length(uv - hub));
        
        // Sun
        float sunD = length(uv - vec2(0.8, 0.85));
        float sun = smoothstep(0.06, 0.04, sunD);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 col = sky;
        col = mix(col, vec3(0.3, 0.55, 0.2), ground);
        col = mix(col, vec3(0.6, 0.5, 0.35), tower);
        col = mix(col, vec3(0.3, 0.25, 0.2), step(0.5, val));
        col += sun * vec3(1.0, 0.85, 0.4);
        col += dither * 0.02;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'morphing-shapes',
    name: 'Morphing Shapes',
    description: '2D animated shapes smoothly morphing between circle, square, triangle and star.',
    tags: ['2d', 'animated', 'geometric'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float sdCircle(vec2 p, float r) { return length(p) - r; }
      float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
      float sdTriangle(vec2 p, float r) {
        float k = sqrt(3.0);
        p.x = abs(p.x) - r;
        p.y = p.y + r / k;
        if(p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
        p.x -= clamp(p.x, -2.0 * r, 0.0);
        return -length(p) * sign(p.y);
      }
      float sdStar(vec2 p, float r, int n) {
        float an = 3.14159 / float(n);
        float a = atan(p.y, p.x);
        float sector = floor(a / an + 0.5);
        a -= sector * an;
        p = length(p) * vec2(cos(a), abs(sin(a)));
        p -= r * vec2(cos(an), sin(an));
        p.x = max(p.x, 0.0);
        return length(p) * sign(p.y);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 p = uv - 0.5;
        float t = u_time;
        
        float phase = mod(t * 0.5, 4.0);
        float blend = fract(phase);
        blend = blend * blend * (3.0 - 2.0 * blend); // smoothstep
        int shape = int(floor(phase));
        
        float d1, d2;
        float r = 0.2;
        
        if(shape == 0) { d1 = sdCircle(p, r); d2 = sdBox(p, vec2(r * 0.8)); }
        else if(shape == 1) { d1 = sdBox(p, vec2(r * 0.8)); d2 = sdTriangle(p, r); }
        else if(shape == 2) { d1 = sdTriangle(p, r); d2 = sdStar(p, r, 5); }
        else { d1 = sdStar(p, r, 5); d2 = sdCircle(p, r); }
        
        float d = mix(d1, d2, blend);
        
        float fill = smoothstep(0.005, -0.005, d);
        float edge = smoothstep(0.01, 0.005, abs(d));
        
        vec2 dp = floor(gl_FragCoord.xy / 3.0);
        float dither = fract(sin(dot(dp, vec2(12.9898, 78.233))) * 43758.5453);
        float dithered = step(dither * 0.3, fill * 0.8);
        
        vec3 shapeCol = 0.5 + 0.5 * cos(t * 0.5 + vec3(0.0, 2.0, 4.0));
        vec3 col = vec3(0.95);
        col = mix(col, shapeCol, dithered);
        col = mix(col, vec3(0.1), edge);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'ocean-waves-2d',
    name: 'Ocean Waves',
    description: '2D animated layered ocean waves with foam and a setting sun.',
    tags: ['2d', 'animated', 'landscape'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        
        // Sky
        vec3 sky = mix(vec3(0.9, 0.4, 0.2), vec3(0.2, 0.3, 0.7), uv.y);
        
        // Sun
        float sunD = length(uv - vec2(0.7, 0.75));
        float sun = smoothstep(0.08, 0.06, sunD);
        sky += sun * vec3(1.0, 0.8, 0.3);
        
        // Sun reflection on water
        float ref = smoothstep(0.1, 0.0, abs(uv.x - 0.7)) * step(uv.y, 0.5) * (0.3 + 0.2 * sin(t * 3.0 + uv.y * 30.0));
        
        // Wave layers
        float waterMask = 0.0;
        vec3 waterCol = vec3(0.05, 0.15, 0.3);
        
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          float waveY = 0.35 - fi * 0.06;
          float amplitude = 0.02 + fi * 0.005;
          float freq = 3.0 + fi * 1.5;
          float speed = t * (1.0 + fi * 0.3);
          
          float wave = waveY + sin(uv.x * freq + speed) * amplitude 
                       + sin(uv.x * freq * 2.3 - speed * 0.7) * amplitude * 0.3;
          
          float layer = smoothstep(wave, wave - 0.01, uv.y);
          
          vec3 layerCol = mix(vec3(0.1, 0.3, 0.5), vec3(0.05, 0.12, 0.25), fi / 5.0);
          
          // Foam
          float foam = smoothstep(wave - 0.005, wave, uv.y) * smoothstep(wave + 0.01, wave, uv.y);
          layerCol += foam * vec3(0.5, 0.5, 0.55);
          
          waterCol = mix(waterCol, layerCol, layer);
          waterMask = max(waterMask, layer);
        }
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 col = mix(sky, waterCol, waterMask);
        col += ref * vec3(1.0, 0.6, 0.2);
        col += dither * 0.02;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'running-horse',
    name: 'Running Horse',
    description: '2D animated galloping horse silhouette with dust particles.',
    tags: ['2d', 'animated', 'character'],
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

      float hash(float n) { return fract(sin(n) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        float gallop = t * 4.0;
        float bodyBob = sin(gallop) * 0.01;
        float xPos = fract(t * 0.1) * 1.4 - 0.2;
        
        vec2 body = vec2(xPos, 0.35 + bodyBob);
        
        // Body (ellipse)
        vec2 bd = (uv - body) * vec2(1.0, 2.5);
        float bodyShape = smoothstep(0.1, 0.07, length(bd));
        
        // Head
        vec2 headPos = body + vec2(0.1, 0.05 + bodyBob);
        vec2 hd = (uv - headPos) * vec2(1.5, 1.0);
        float head = smoothstep(0.04, 0.025, length(hd));
        
        // Neck
        val += line(uv, body + vec2(0.06, 0.03), headPos - vec2(0.02, 0.01), 0.012);
        
        // Legs
        float legPhase1 = sin(gallop) * 0.04;
        float legPhase2 = sin(gallop + 1.57) * 0.04;
        float legPhase3 = sin(gallop + 3.14) * 0.04;
        float legPhase4 = sin(gallop + 4.71) * 0.04;
        
        vec2 hipF = body + vec2(0.06, -0.035);
        vec2 hipB = body + vec2(-0.06, -0.035);
        
        val += line(uv, hipF, hipF + vec2(legPhase1, -0.1), 0.006);
        val += line(uv, hipF + vec2(0.015, 0.0), hipF + vec2(legPhase2 + 0.015, -0.1), 0.006);
        val += line(uv, hipB, hipB + vec2(legPhase3, -0.1), 0.006);
        val += line(uv, hipB + vec2(-0.015, 0.0), hipB + vec2(legPhase4 - 0.015, -0.1), 0.006);
        
        // Tail
        vec2 tailStart = body + vec2(-0.1, 0.02);
        vec2 tailEnd = tailStart + vec2(-0.06, 0.04 + sin(gallop * 0.5) * 0.02);
        val += line(uv, tailStart, tailEnd, 0.005);
        
        val += bodyShape + head;
        val = clamp(val, 0.0, 1.0);
        
        // Dust particles
        float dust = 0.0;
        for(int i = 0; i < 10; i++) {
          float fi = float(i);
          float dx = xPos - 0.12 - hash(fi * 3.7) * 0.15;
          float dy = 0.22 + hash(fi * 5.1) * 0.06;
          float dustSize = 0.005 + hash(fi * 9.3) * 0.008;
          float fade = smoothstep(0.2, 0.0, abs(uv.x - dx));
          dust += smoothstep(dustSize, dustSize * 0.3, length(uv - vec2(dx, dy))) * fade * 0.3;
        }
        
        // Ground
        float ground = smoothstep(0.22, 0.2, uv.y);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 skyCol = mix(vec3(0.85, 0.7, 0.5), vec3(0.5, 0.65, 0.85), uv.y);
        vec3 col = skyCol;
        col = mix(col, vec3(0.7, 0.6, 0.4), ground);
        col = mix(col, vec3(0.1, 0.08, 0.06), step(0.5, val));
        col += dust * vec3(0.6, 0.5, 0.35);
        col += dither * 0.015;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'domino-fall',
    name: 'Domino Fall',
    description: '2D animated dominoes falling in sequence creating a chain reaction.',
    tags: ['2d', 'animated', 'physics'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float box(vec2 p, vec2 center, vec2 size, float angle) {
        vec2 d = p - center;
        float c = cos(angle), s = sin(angle);
        d = vec2(c * d.x + s * d.y, -s * d.x + c * d.y);
        vec2 q = abs(d) - size;
        return smoothstep(0.005, 0.0, length(max(q, 0.0)) + min(max(q.x, q.y), 0.0));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        float numDominoes = 15.0;
        float spacing = 0.06;
        float fallSpeed = 3.0;
        
        for(int i = 0; i < 15; i++) {
          float fi = float(i);
          float x = 0.08 + fi * spacing;
          float triggerTime = fi * 0.2;
          float elapsed = max(0.0, mod(t, numDominoes * 0.2 + 2.0) - triggerTime);
          float angle = min(elapsed * fallSpeed, 1.5708); // max 90 degrees
          
          // Pivot at bottom
          vec2 pivotPos = vec2(x, 0.25);
          vec2 dominoCenter = pivotPos + vec2(sin(angle) * 0.04, cos(angle) * 0.04);
          
          val += box(uv, dominoCenter, vec2(0.008, 0.04), angle);
          
          // Dots on domino
          if(angle < 0.1) {
            float dotR = 0.003;
            vec2 dc = dominoCenter;
            val += smoothstep(dotR, dotR * 0.3, length(uv - dc)) * 0.5;
          }
        }
        
        // Ground
        float ground = smoothstep(0.22, 0.21, uv.y);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 col = vec3(0.92, 0.9, 0.85);
        col = mix(col, vec3(0.7, 0.65, 0.6), ground);
        col = mix(col, vec3(0.15, 0.12, 0.1), step(0.5, val));
        col += dither * 0.015;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'crazy-kaleidoscope',
    name: 'Crazy Kaleidoscope',
    description: 'Wild kaleidoscope dither with fractal symmetry and color cycling.',
    tags: ['dither', 'psychedelic', 'fractal'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float t = u_time;
        
        // Kaleidoscope fold
        float a = atan(uv.y, uv.x);
        float r = length(uv);
        float segments = 8.0;
        a = mod(a, 6.28318 / segments);
        a = abs(a - 3.14159 / segments);
        
        vec2 p = vec2(cos(a), sin(a)) * r;
        
        // Fractal-like iteration
        for(int i = 0; i < 5; i++) {
          p = abs(p) - 0.3;
          float ca = t * 0.3 + float(i) * 0.5;
          float cs = cos(ca), sn = sin(ca);
          p = vec2(cs * p.x - sn * p.y, sn * p.x + cs * p.y);
          p *= 1.3;
        }
        
        float val = sin(p.x * 5.0) * sin(p.y * 5.0);
        val = val * 0.5 + 0.5;
        
        // Bayer dither
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
        float dithered = step(bayer, val);
        
        vec3 c1 = 0.5 + 0.5 * cos(t + r * 5.0 + vec3(0.0, 2.0, 4.0));
        vec3 c2 = 0.5 + 0.5 * cos(t * 0.7 + r * 3.0 + vec3(4.0, 2.0, 0.0));
        vec3 col = mix(c2, c1, dithered);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
