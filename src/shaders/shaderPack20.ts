import type { DitherShaderDef } from './ditherShaders';

export const shaderPack20: DitherShaderDef[] = [
  {
    id: 'glitch-skull',
    name: 'Glitch Skull',
    description: 'Dithered skull shape with heavy glitch distortion and RGB split.',
    tags: ['dither', 'glitch', 'dark'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      float skull(vec2 p) {
        // Cranium
        float head = smoothstep(0.18, 0.15, length(p - vec2(0.0, 0.05)));
        // Jaw
        float jaw = smoothstep(0.12, 0.09, length((p - vec2(0.0, -0.08)) * vec2(1.0, 1.5)));
        // Eyes
        float eyeL = smoothstep(0.04, 0.03, length(p - vec2(-0.06, 0.06)));
        float eyeR = smoothstep(0.04, 0.03, length(p - vec2(0.06, 0.06)));
        // Nose
        float nose = smoothstep(0.02, 0.015, length((p - vec2(0.0, -0.01)) * vec2(1.0, 1.5)));
        // Teeth
        float teeth = step(-0.1, p.y) * step(p.y, -0.06) * step(abs(p.x), 0.08);
        float teethGaps = step(0.5, fract(p.x * 30.0));
        teeth *= teethGaps;
        
        return clamp(max(head, jaw) - eyeL - eyeR - nose + teeth * 0.3, 0.0, 1.0);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec2 p = uv - 0.5;
        float t = u_time;
        
        // Glitch offset
        float glitchY = step(0.95, hash(vec2(floor(t * 10.0), floor(uv.y * 20.0))));
        float offsetX = glitchY * (hash(vec2(floor(t * 15.0), 0.0)) - 0.5) * 0.15;
        
        float r = skull(p + vec2(offsetX - 0.005, 0.0));
        float g = skull(p + vec2(offsetX, 0.0));
        float b = skull(p + vec2(offsetX + 0.005, 0.0));
        
        // Dither
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        // Scanlines
        float scan = 0.9 + 0.1 * sin(gl_FragCoord.y * 4.0 + t * 5.0);
        
        vec3 col = vec3(r * 0.9, g * 1.0, b * 0.8) * scan;
        col += (dither - 0.5) * 0.05;
        col *= vec3(0.7, 1.0, 0.7);
        
        // Random noise bands
        float noiseBand = step(0.98, hash(vec2(floor(uv.y * 50.0), floor(t * 8.0))));
        col += noiseBand * 0.3;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'conveyor-belt',
    name: 'Conveyor Belt',
    description: '2D animated conveyor belt with boxes moving and rollers spinning.',
    tags: ['2d', 'animated', 'mechanical'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        // Belt
        float beltY = 0.35;
        float beltH = 0.02;
        float belt = step(beltY - beltH, uv.y) * step(uv.y, beltY + beltH) * step(0.1, uv.x) * step(uv.x, 0.9);
        
        // Belt texture (moving dashes)
        float beltTex = step(0.5, fract((uv.x - t * 0.2) * 20.0));
        belt *= 0.5 + beltTex * 0.3;
        
        // Rollers
        for(int i = 0; i < 2; i++) {
          float fi = float(i);
          float rx = 0.1 + fi * 0.8;
          float rollerD = length(uv - vec2(rx, beltY));
          val += smoothstep(0.03, 0.025, rollerD);
          // Spinning spokes
          float ra = atan(uv.y - beltY, uv.x - rx) + t * 5.0;
          float spoke = step(0.7, fract(ra * 2.0 / 6.28318)) * step(rollerD, 0.025);
          val += spoke * 0.3;
        }
        
        // Boxes on belt
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          float bx = fract(fi * 0.22 + t * 0.1) * 0.8 + 0.1;
          float boxW = 0.03;
          float boxH = 0.025 + mod(fi, 3.0) * 0.01;
          float box = step(abs(uv.x - bx), boxW) * step(beltY + beltH, uv.y) * step(uv.y, beltY + beltH + boxH * 2.0);
          val += box * 0.7;
        }
        
        val += belt;
        
        // Legs
        for(int i = 0; i < 3; i++) {
          float fi = float(i);
          float lx = 0.1 + fi * 0.4;
          val += step(abs(uv.x - lx), 0.005) * step(0.1, uv.y) * step(uv.y, beltY - beltH);
        }
        
        val = clamp(val, 0.0, 1.0);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        float dithered = step(dither * 0.2, val);
        
        vec3 col = mix(vec3(0.9, 0.88, 0.83), vec3(0.3, 0.3, 0.35), dithered);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'dna-strand-2d',
    name: 'DNA Strand 2D',
    description: '2D animated double helix DNA with base pairs connecting the strands.',
    tags: ['2d', 'animated', 'science'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        float centerX = 0.5;
        float amplitude = 0.15;
        float freq = 8.0;
        
        // Two helical strands
        for(int strand = 0; strand < 2; strand++) {
          float phase = float(strand) * 3.14159;
          float x = centerX + sin(uv.y * freq - t * 2.0 + phase) * amplitude;
          float thickness = 0.008;
          
          // Depth effect
          float depth = cos(uv.y * freq - t * 2.0 + phase);
          thickness *= 0.5 + 0.5 * (depth + 1.0);
          
          val += smoothstep(thickness, thickness * 0.3, abs(uv.x - x));
        }
        
        // Base pairs (connecting rungs)
        for(int i = 0; i < 20; i++) {
          float fi = float(i);
          float y = fract(fi * 0.05 + t * 0.05);
          float x1 = centerX + sin(y * freq * 6.28318 - t * 2.0) * amplitude;
          float x2 = centerX + sin(y * freq * 6.28318 - t * 2.0 + 3.14159) * amplitude;
          
          float inY = smoothstep(0.004, 0.002, abs(uv.y - y));
          float inX = step(min(x1, x2), uv.x) * step(uv.x, max(x1, x2));
          val += inY * inX * 0.5;
        }
        
        val = clamp(val, 0.0, 1.0);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        float dithered = step(dither * 0.3, val);
        
        vec3 col = mix(vec3(0.05, 0.02, 0.1), vec3(0.2, 0.7, 0.9), dithered);
        
        // Glow effect
        float glow = val * 0.3;
        col += glow * vec3(0.1, 0.3, 0.5);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'pixel-waterfall',
    name: 'Pixel Waterfall',
    description: 'Cascading pixel waterfall with pooling splash at the bottom.',
    tags: ['2d', 'animated', 'nature'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float pixelSize = 4.0;
        vec2 puv = floor(gl_FragCoord.xy / pixelSize) * pixelSize / u_resolution;
        
        float water = 0.0;
        
        // Waterfall column
        float fallX = 0.5 + sin(t * 0.3) * 0.05;
        float fallWidth = 0.08;
        float inFall = smoothstep(fallWidth, fallWidth * 0.5, abs(puv.x - fallX)) * step(0.2, puv.y);
        
        // Flowing texture
        float flowNoise = hash(vec2(floor(puv.x * 50.0), floor(puv.y * 50.0 + t * 20.0)));
        water += inFall * (0.5 + flowNoise * 0.5);
        
        // Splash particles at bottom
        for(int i = 0; i < 15; i++) {
          float fi = float(i);
          float angle = hash(vec2(fi, floor(t * 3.0))) * 3.14159;
          float speed = 0.1 + hash(vec2(fi, 1.0)) * 0.15;
          float splashT = fract(t * 2.0 + fi * 0.1);
          vec2 splashPos = vec2(fallX, 0.2) + vec2(cos(angle), sin(angle) * 0.5) * speed * splashT;
          splashPos.y -= splashT * splashT * 0.3;
          
          float fade = 1.0 - splashT;
          water += smoothstep(pixelSize / u_resolution.x * 2.0, 0.0, length(puv - splashPos)) * fade;
        }
        
        // Pool at bottom
        float pool = smoothstep(0.22, 0.18, puv.y) * (0.3 + 0.1 * sin(puv.x * 20.0 + t * 3.0));
        water += pool;
        
        // Cliff walls
        float wallL = step(puv.x, fallX - fallWidth) * step(0.2, puv.y) * step(puv.y, 0.9);
        float wallR = step(fallX + fallWidth, puv.x) * step(0.2, puv.y) * step(puv.y, 0.9);
        
        vec2 dp = floor(gl_FragCoord.xy / pixelSize);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 col = vec3(0.15, 0.1, 0.08); // rock
        col = mix(col, vec3(0.25, 0.2, 0.15), wallL + wallR);
        
        vec3 waterCol = mix(vec3(0.2, 0.5, 0.8), vec3(0.7, 0.9, 1.0), dither * 0.3);
        col = mix(col, waterCol, clamp(water, 0.0, 1.0));
        
        // Mist
        float mist = smoothstep(0.3, 0.15, puv.y) * smoothstep(0.15, 0.0, abs(puv.x - fallX)) * 0.2;
        col += mist * vec3(0.5, 0.6, 0.7);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'metaball-lava',
    name: 'Metaball Lava',
    description: 'Crazy organic metaballs merging and splitting with extreme dithered lava colors.',
    tags: ['dither', 'organic', 'psychedelic'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float meta = 0.0;
        
        for(int i = 0; i < 10; i++) {
          float fi = float(i);
          float x = 0.5 + sin(t * (0.3 + fi * 0.1) + fi * 1.7) * 0.35;
          float y = 0.5 + cos(t * (0.4 + fi * 0.08) + fi * 2.3) * 0.35;
          float r = 0.06 + sin(t + fi) * 0.02;
          float d = length(uv - vec2(x, y));
          meta += r / (d + 0.01);
        }
        
        // Mouse blob
        float md = length(uv - u_mouse);
        meta += 0.08 / (md + 0.01);
        
        float threshold = 2.0 + sin(t) * 0.5;
        
        // Multi-level dither
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 7.0, 8.0) / 8.0;
        
        float level = meta / threshold;
        float d1 = step(bayer, level * 0.5);
        float d2 = step(bayer, level);
        float d3 = step(bayer, level * 1.5);
        
        vec3 c1 = vec3(0.1, 0.0, 0.0);
        vec3 c2 = vec3(0.8, 0.1, 0.0);
        vec3 c3 = vec3(1.0, 0.6, 0.0);
        vec3 c4 = vec3(1.0, 1.0, 0.5);
        
        vec3 col = c1;
        col = mix(col, c2, d1);
        col = mix(col, c3, d2);
        col = mix(col, c4, d3);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'retro-car-drive',
    name: 'Retro Car Drive',
    description: '2D animated retro car driving on a road with scrolling scenery.',
    tags: ['2d', 'animated', 'retro'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        
        // Sky
        vec3 col = mix(vec3(0.15, 0.2, 0.4), vec3(0.5, 0.3, 0.6), uv.y);
        
        // Stars
        vec2 starGrid = floor(uv * 60.0);
        float star = step(0.98, fract(sin(dot(starGrid, vec2(127.1, 311.7))) * 43758.5453));
        col += star * step(0.5, uv.y) * 0.5;
        
        // Mountains
        float mt = sin(uv.x * 3.0 + 1.0) * 0.08 + sin(uv.x * 7.0) * 0.03 + 0.45;
        col = mix(col, vec3(0.1, 0.12, 0.2), step(uv.y, mt));
        
        // Road
        float roadY = 0.3;
        float road = step(uv.y, roadY);
        
        // Perspective road
        float vanishX = 0.5;
        float roadWidth = (roadY - uv.y + 0.05) * 1.5;
        float inRoad = step(abs(uv.x - vanishX), roadWidth) * road;
        
        col = mix(col, vec3(0.2, 0.2, 0.22), inRoad);
        
        // Road lines
        float lineScroll = fract(uv.y * 10.0 - t * 2.0);
        float centerLine = step(abs(uv.x - vanishX), 0.005) * inRoad * step(0.5, lineScroll);
        col += centerLine * vec3(0.8, 0.8, 0.0);
        
        // Car
        float carX = 0.5 + sin(t * 0.5) * 0.1;
        float carY = 0.18;
        
        // Car body
        float body = step(abs(uv.x - carX), 0.06) * step(abs(uv.y - carY), 0.02);
        float roof = step(abs(uv.x - carX), 0.035) * step(abs(uv.y - (carY + 0.03)), 0.015);
        
        // Wheels
        float wL = smoothstep(0.012, 0.008, length(uv - vec2(carX - 0.04, carY - 0.02)));
        float wR = smoothstep(0.012, 0.008, length(uv - vec2(carX + 0.04, carY - 0.02)));
        
        // Headlights
        float hlL = smoothstep(0.005, 0.002, length(uv - vec2(carX + 0.06, carY)));
        float hlR = smoothstep(0.005, 0.002, length(uv - vec2(carX + 0.06, carY + 0.01)));
        
        col = mix(col, vec3(0.8, 0.15, 0.15), body + roof);
        col = mix(col, vec3(0.1), clamp(wL + wR, 0.0, 1.0));
        col += (hlL + hlR) * vec3(1.0, 1.0, 0.5) * 0.8;
        
        // Ground (grass sides)
        float grass = road * (1.0 - inRoad);
        col = mix(col, vec3(0.1, 0.25, 0.1), grass);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        col += dither * 0.02;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'matrix-rain-2d',
    name: 'Matrix Rain',
    description: '2D animated green code rain falling in columns like the Matrix.',
    tags: ['2d', 'animated', 'digital'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float charSize = 12.0;
        vec2 cell = floor(gl_FragCoord.xy / charSize);
        vec2 cellUV = fract(gl_FragCoord.xy / charSize);
        
        float numCols = u_resolution.x / charSize;
        float numRows = u_resolution.y / charSize;
        
        float col_speed = hash(vec2(cell.x, 0.0)) * 0.5 + 0.3;
        float col_offset = hash(vec2(cell.x, 1.0)) * 100.0;
        
        float headY = mod(t * col_speed * numRows + col_offset, numRows + 20.0);
        float distFromHead = headY - cell.y;
        
        float visible = step(0.0, distFromHead) * step(distFromHead, 20.0);
        float brightness = visible * (1.0 - distFromHead / 20.0);
        
        // Random character change
        float charVal = hash(vec2(cell.x, cell.y + floor(t * 5.0)));
        
        // Fake character pattern using cellUV
        float charPattern = step(0.3, cellUV.x) * step(cellUV.x, 0.7) * step(0.15, cellUV.y) * step(cellUV.y, 0.85);
        float bits = step(0.5, hash(vec2(floor(cellUV.x * 3.0) + cell.x * 10.0, floor(cellUV.y * 4.0) + cell.y * 10.0 + floor(t * 3.0))));
        charPattern *= bits;
        
        float val = charPattern * brightness;
        
        // Head character is brightest
        float isHead = step(abs(distFromHead), 1.0) * visible;
        
        vec3 color = vec3(0.0, val * 0.8, val * 0.3);
        color += isHead * charPattern * vec3(0.3, 0.5, 0.3);
        
        // Subtle background glow
        color += vec3(0.0, 0.02, 0.01);
        
        gl_FragColor = vec4(color, 1.0);
      }
    `,
  },
  {
    id: 'newton-cradle',
    name: 'Newton Cradle',
    description: '2D animated Newtons cradle with momentum transfer between balls.',
    tags: ['2d', 'animated', 'physics'],
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
        
        float cycle = mod(t, 3.14159 * 2.0);
        float swing = sin(cycle);
        float swingL = min(swing, 0.0) * 0.4;
        float swingR = max(swing, 0.0) * 0.4;
        
        float topY = 0.8;
        float stringLen = 0.35;
        float ballR = 0.025;
        float spacing = 0.065;
        
        // Top bar
        val += line(uv, vec2(0.25, topY), vec2(0.75, topY), 0.005);
        
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          float x = 0.5 + (fi - 2.0) * spacing;
          float angle = 0.0;
          
          if(fi == 0.0 && swing < 0.0) angle = swingL;
          if(fi == 4.0 && swing > 0.0) angle = swingR;
          
          vec2 pivot = vec2(x, topY);
          vec2 ballPos = pivot + vec2(sin(angle), -cos(angle)) * stringLen;
          
          // String
          val += line(uv, pivot, ballPos, 0.002);
          // Ball
          val += smoothstep(ballR, ballR * 0.5, length(uv - ballPos));
          // Ball highlight
          val += smoothstep(ballR * 0.4, ballR * 0.2, length(uv - ballPos - vec2(-0.005, 0.005))) * 0.3;
        }
        
        val = clamp(val, 0.0, 1.0);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        float dithered = step(dither * 0.2, val);
        
        vec3 col = mix(vec3(0.95, 0.93, 0.88), vec3(0.25, 0.25, 0.3), dithered);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'worm-tunnel',
    name: 'Worm Tunnel',
    description: 'Psychedelic tunnel effect with extreme dithering and warping.',
    tags: ['dither', 'tunnel', 'psychedelic'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        uv += (u_mouse - 0.5) * 0.3;
        float t = u_time;
        
        float a = atan(uv.y, uv.x);
        float r = length(uv);
        
        // Tunnel mapping
        float z = 0.3 / (r + 0.001);
        float u = a / 3.14159;
        float v = z - t * 2.0;
        
        // Pattern
        float pat = sin(u * 12.0) * sin(v * 6.0);
        pat += sin(u * 6.0 + t) * sin(v * 3.0 - t);
        pat = pat * 0.25 + 0.5;
        
        // Multi-level ordered dither
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 5.0 + dp.y * 3.0, 4.0) / 4.0;
        
        float d1 = step(bayer, pat);
        float d2 = step(bayer, pat * 1.5);
        
        // Depth fog
        float fog = 1.0 - smoothstep(0.0, 3.0, z);
        
        vec3 c1 = vec3(0.0, 0.0, 0.1);
        vec3 c2 = 0.5 + 0.5 * cos(t * 0.5 + z * 0.3 + vec3(0.0, 2.0, 4.0));
        vec3 c3 = vec3(1.0, 0.9, 0.8);
        
        vec3 col = mix(c1, c2, d1);
        col = mix(col, c3, d2 * fog * 0.5);
        col *= fog;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'jumping-rope',
    name: 'Jumping Rope',
    description: '2D animated stick figure jumping rope with physics-based rope curve.',
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

      float circle(vec2 p, vec2 c, float r) {
        return smoothstep(r, r * 0.5, length(p - c));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        float jumpPhase = t * 3.0;
        float jumpHeight = max(0.0, sin(jumpPhase)) * 0.08;
        float baseY = 0.3 + jumpHeight;
        
        // Stick figure
        vec2 pos = vec2(0.5, baseY);
        
        // Head
        val += circle(uv, pos + vec2(0.0, 0.18), 0.025);
        // Body
        val += line(uv, pos + vec2(0.0, 0.15), pos + vec2(0.0, 0.05), 0.005);
        // Arms (holding rope)
        float armAngle = sin(jumpPhase) * 0.3;
        val += line(uv, pos + vec2(0.0, 0.12), pos + vec2(-0.06, 0.08 + armAngle * 0.02), 0.004);
        val += line(uv, pos + vec2(0.0, 0.12), pos + vec2(0.06, 0.08 + armAngle * 0.02), 0.004);
        // Legs
        float legBend = abs(sin(jumpPhase)) * 0.02;
        val += line(uv, pos + vec2(0.0, 0.05), pos + vec2(-0.03, -0.02 + legBend), 0.004);
        val += line(uv, pos + vec2(0.0, 0.05), pos + vec2(0.03, -0.02 + legBend), 0.004);
        
        // Rope (arc)
        float ropePhase = jumpPhase;
        vec2 handL = pos + vec2(-0.06, 0.08);
        vec2 handR = pos + vec2(0.06, 0.08);
        
        for(int i = 0; i < 30; i++) {
          float fi = float(i) / 29.0;
          float rx = mix(handL.x, handR.x, fi);
          float ropeArc = sin(fi * 3.14159);
          float ry = pos.y - 0.05 + cos(ropePhase) * ropeArc * 0.2;
          float rx2 = 0.5 + sin(ropePhase) * (fi - 0.5) * 0.02;
          val += smoothstep(0.004, 0.001, length(uv - vec2(rx + (rx2 - 0.5) * 0.1, ry)));
        }
        
        // Ground
        float ground = smoothstep(0.26, 0.25, uv.y);
        
        val = clamp(val, 0.0, 1.0);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        float dithered = step(dither * 0.2, val);
        
        vec3 col = vec3(0.9, 0.88, 0.82);
        col = mix(col, vec3(0.7, 0.65, 0.55), ground);
        col = mix(col, vec3(0.15, 0.12, 0.1), dithered);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
