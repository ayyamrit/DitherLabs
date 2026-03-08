import type { DitherShaderDef } from './ditherShaders';

export const shaderPack17: DitherShaderDef[] = [
  {
    id: 'walking-stickman',
    name: 'Walking Stickman',
    description: 'Animated 2D stick figure walking across the screen with dithered shadow.',
    tags: ['2d', 'animated', 'character'],
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

      float circle(vec2 p, vec2 c, float r) {
        return smoothstep(r, r * 0.6, length(p - c));
      }

      float stickman(vec2 p, float phase) {
        float s = 0.0;
        // Head
        s += circle(p, vec2(0.0, 0.35), 0.04);
        // Body
        s += line(p, vec2(0.0, 0.3), vec2(0.0, 0.15), 0.008);
        // Arms
        float armSwing = sin(phase) * 0.06;
        s += line(p, vec2(0.0, 0.27), vec2(-0.07, 0.22 + armSwing), 0.006);
        s += line(p, vec2(0.0, 0.27), vec2(0.07, 0.22 - armSwing), 0.006);
        // Legs
        float legSwing = sin(phase) * 0.05;
        s += line(p, vec2(0.0, 0.15), vec2(-0.05 + legSwing, 0.05), 0.006);
        s += line(p, vec2(0.0, 0.15), vec2(0.05 - legSwing, 0.05), 0.006);
        return clamp(s, 0.0, 1.0);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 2.0;
        
        float fig = 0.0;
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          float xOff = fract(fi * 0.23 + t * 0.08 * (0.5 + fi * 0.1)) * 1.4 - 0.2;
          float phase = t * 6.0 + fi * 1.5;
          float scale = 0.7 + fi * 0.15;
          fig += stickman((uv - vec2(xOff, 0.0)) / scale, phase) * scale;
        }
        
        // Dither
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0) * 0.5;
        
        // Ground line
        float ground = smoothstep(0.06, 0.05, uv.y);
        
        vec3 bg = vec3(0.95, 0.93, 0.88);
        vec3 fg = vec3(0.1, 0.1, 0.12);
        float shadow = stickman((uv - vec2(fract(t * 0.08) * 1.4 - 0.2 + 0.02, -0.01)), t * 6.0) * 0.3;
        
        vec3 col = mix(bg, fg, step(dither * 0.3, fig));
        col = mix(col, fg * 0.7, ground);
        col -= shadow * 0.15;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'bouncing-balls-2d',
    name: 'Bouncing Balls',
    description: '2D animated bouncing circles with squash-stretch and dithered trails.',
    tags: ['2d', 'animated', 'physics'],
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
        
        for(int i = 0; i < 8; i++) {
          float fi = float(i);
          float speed = 1.0 + hash(fi) * 2.0;
          float x = fract(hash(fi * 7.3) + t * 0.1 * (0.5 + hash(fi * 3.1)));
          float bounceT = t * speed + fi * 1.7;
          float y = abs(sin(bounceT)) * 0.6 + 0.08;
          float squash = 1.0 + (1.0 - abs(sin(bounceT))) * 0.3 * step(y, 0.12);
          float stretch = 1.0 / squash;
          
          vec2 ballPos = vec2(x, y);
          vec2 diff = uv - ballPos;
          diff.x *= stretch;
          diff.y *= squash;
          float r = 0.02 + hash(fi * 11.1) * 0.02;
          float d = length(diff);
          val += smoothstep(r, r * 0.5, d);
          
          // Shadow
          vec2 shadowDiff = uv - vec2(x, 0.04);
          shadowDiff.x *= 0.8;
          val += smoothstep(0.03, 0.01, length(shadowDiff)) * 0.2;
        }
        
        // Dither
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = fract(sin(dot(dp, vec2(12.9898, 78.233))) * 43758.5453);
        float dithered = step(dither * 0.4, val);
        
        vec3 col = mix(vec3(0.05, 0.05, 0.1), vec3(0.2, 0.8, 1.0), dithered);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'spinning-gears',
    name: 'Spinning Gears',
    description: '2D animated interlocking gears rotating with dithered teeth patterns.',
    tags: ['2d', 'animated', 'mechanical'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float gear(vec2 p, vec2 center, float radius, float teeth, float rot) {
        vec2 d = p - center;
        float r = length(d);
        float a = atan(d.y, d.x) + rot;
        float toothPattern = 0.5 + 0.5 * sin(a * teeth);
        float outerR = radius + toothPattern * radius * 0.2;
        float innerR = radius * 0.3;
        float ring = smoothstep(outerR, outerR - 0.008, r) * smoothstep(innerR - 0.008, innerR, r);
        // Spokes
        float spokes = smoothstep(0.008, 0.004, abs(sin(a * 3.0)) * r) * step(innerR, r) * step(r, radius * 0.7);
        return max(ring, spokes * 0.8);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        val += gear(uv, vec2(0.35, 0.5), 0.18, 12.0, t);
        val += gear(uv, vec2(0.62, 0.5), 0.14, 9.0, -t * 12.0/9.0 + 0.35);
        val += gear(uv, vec2(0.48, 0.28), 0.1, 8.0, t * 12.0/8.0);
        val += gear(uv, vec2(0.48, 0.72), 0.1, 8.0, t * 12.0/8.0 + 0.39);
        val += gear(uv, u_mouse, 0.08, 6.0, -t * 2.0);
        
        val = clamp(val, 0.0, 1.0);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        float dithered = step(dither * 0.2, val);
        
        vec3 col = mix(vec3(0.12, 0.1, 0.08), vec3(0.75, 0.65, 0.4), dithered);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'swimming-fish',
    name: 'Swimming Fish',
    description: '2D animated fish swimming in a school with sinusoidal body movement.',
    tags: ['2d', 'animated', 'nature'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(float n) { return fract(sin(n) * 43758.5453); }

      float fish(vec2 p, vec2 pos, float size, float phase) {
        vec2 d = p - pos;
        d.y += sin(d.x * 15.0 + phase) * 0.01 * size;
        // Body ellipse
        float body = 1.0 - smoothstep(size * 0.6, size * 0.65, length(d * vec2(1.0, 2.0)));
        // Tail
        vec2 td = d - vec2(size * 0.5, 0.0);
        float tailAngle = sin(phase * 2.0) * 0.4;
        td.y -= td.x * tailAngle;
        float tail = 1.0 - smoothstep(size * 0.3, size * 0.35, length(td * vec2(1.5, 1.0)));
        tail *= step(0.0, td.x);
        // Eye
        float eye = 1.0 - smoothstep(size * 0.06, size * 0.08, length(d - vec2(-size * 0.25, size * 0.05)));
        return clamp(body + tail * 0.7 - eye * 0.5, 0.0, 1.0);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        for(int i = 0; i < 12; i++) {
          float fi = float(i);
          float x = fract(hash(fi * 5.7) - t * 0.05 * (0.8 + hash(fi * 3.3) * 0.4));
          float y = hash(fi * 9.1) * 0.7 + 0.15;
          float sz = 0.03 + hash(fi * 2.2) * 0.03;
          float phase = t * 4.0 + fi * 2.1;
          val += fish(uv, vec2(x, y), sz, phase);
        }
        
        // Water caustics
        float caustic = sin(uv.x * 30.0 + t) * sin(uv.y * 20.0 - t * 0.7) * 0.1 + 0.1;
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        float dithered = step(dither * 0.3, val);
        
        vec3 water = vec3(0.05, 0.15, 0.35) + caustic * vec3(0.0, 0.1, 0.15);
        vec3 fishCol = vec3(0.9, 0.6, 0.2);
        vec3 col = mix(water, fishCol, dithered);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'pendulum-wave',
    name: 'Pendulum Wave',
    description: '2D animated pendulum wave with phase-shifted swinging bobs creating mesmerizing patterns.',
    tags: ['2d', 'animated', 'physics'],
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
        float t = u_time;
        float val = 0.0;
        
        float topY = 0.9;
        
        for(int i = 0; i < 15; i++) {
          float fi = float(i);
          float freq = 5.0 + fi * 0.3;
          float x = 0.1 + fi * 0.055;
          float swing = sin(t * freq) * 0.15 * (0.7 + u_mouse.x * 0.6);
          float stringLen = 0.3 + fi * 0.025;
          
          vec2 pivot = vec2(x, topY);
          vec2 bob = vec2(x + swing, topY - stringLen);
          
          // String
          val += line(uv, pivot, bob, 0.002);
          // Bob
          val += smoothstep(0.012, 0.006, length(uv - bob));
        }
        
        // Top bar
        val += line(uv, vec2(0.08, topY), vec2(0.88, topY), 0.004);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        float dithered = step(dither * 0.2, val);
        
        vec3 col = mix(vec3(0.02, 0.02, 0.05), vec3(0.9, 0.85, 0.7), dithered);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'flying-birds-v',
    name: 'Flying Birds',
    description: '2D animated V-formation birds flying across the sky with flapping wings.',
    tags: ['2d', 'animated', 'nature'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(float n) { return fract(sin(n) * 43758.5453); }

      float bird(vec2 p, vec2 pos, float flapPhase, float size) {
        vec2 d = p - pos;
        // Wings as V shape
        float wingAngle = sin(flapPhase) * 0.3 + 0.2;
        float leftWing = smoothstep(0.003, 0.001, abs(d.y - abs(d.x) * wingAngle)) * step(-size, d.x) * step(d.x, 0.0);
        float rightWing = smoothstep(0.003, 0.001, abs(d.y - abs(d.x) * wingAngle)) * step(0.0, d.x) * step(d.x, size);
        return leftWing + rightWing;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        // Multiple flocks
        for(int f = 0; f < 3; f++) {
          float ff = float(f);
          vec2 flockCenter = vec2(fract(ff * 0.37 - t * 0.04), 0.6 + ff * 0.1 + sin(t * 0.3 + ff) * 0.05);
          
          for(int i = 0; i < 5; i++) {
            float fi = float(i);
            vec2 offset = vec2(fi * 0.03 - 0.06, -abs(fi - 2.0) * 0.02);
            float phase = t * 5.0 + fi * 0.5 + ff * 2.0;
            val += bird(uv, flockCenter + offset, phase, 0.02 + ff * 0.005);
          }
        }
        
        // Clouds
        float cloud = 0.0;
        for(int i = 0; i < 4; i++) {
          float fi = float(i);
          vec2 cp = vec2(fract(fi * 0.31 + t * 0.01), 0.75 + fi * 0.05);
          cloud += smoothstep(0.08, 0.02, length((uv - cp) * vec2(1.0, 3.0))) * 0.3;
        }
        
        // Sky gradient
        vec3 sky = mix(vec3(0.4, 0.6, 0.9), vec3(0.7, 0.85, 1.0), uv.y);
        sky += cloud * vec3(0.2, 0.2, 0.25);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 birdCol = vec3(0.05, 0.05, 0.1);
        vec3 col = mix(sky, birdCol, step(0.5, val));
        
        // Dither sky
        col += (dither - 0.5) * 0.03;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'rotating-polygons',
    name: 'Rotating Polygons',
    description: '2D animated nested polygons rotating in opposite directions with dithered fills.',
    tags: ['2d', 'animated', 'geometric'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float polygon(vec2 p, vec2 c, float r, float sides, float rot) {
        vec2 d = p - c;
        float a = atan(d.y, d.x) + rot;
        float slice = 6.28318 / sides;
        float dist = cos(floor(0.5 + a / slice) * slice - a) * length(d);
        return smoothstep(r, r - 0.008, dist);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        vec2 center = vec2(0.5) + (u_mouse - 0.5) * 0.1;
        float val = 0.0;
        
        for(int i = 0; i < 6; i++) {
          float fi = float(i);
          float dir = mod(fi, 2.0) == 0.0 ? 1.0 : -1.0;
          float sides = 3.0 + fi;
          float r = 0.4 - fi * 0.055;
          float shape = polygon(uv, center, r, sides, t * dir * (0.5 + fi * 0.1));
          float prevShape = fi > 0.0 ? polygon(uv, center, r + 0.055, sides - 1.0, t * -dir * (0.5 + (fi - 1.0) * 0.1)) : 0.0;
          val += (shape - prevShape * shape) * (mod(fi, 2.0) == 0.0 ? 1.0 : 0.6);
        }
        
        val = clamp(val, 0.0, 1.0);
        
        vec2 dp = floor(gl_FragCoord.xy / 3.0);
        float dither = fract(sin(dot(dp, vec2(12.9898, 78.233))) * 43758.5453);
        float dithered = step(dither * 0.4, val);
        
        vec3 col = mix(vec3(0.05, 0.0, 0.1), vec3(0.9, 0.3, 0.6), dithered);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'heartbeat-monitor',
    name: 'Heartbeat Monitor',
    description: '2D animated ECG heartbeat line sweeping across like a hospital monitor.',
    tags: ['2d', 'animated', 'medical'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float ecg(float x) {
        x = mod(x, 1.0);
        if(x < 0.1) return 0.0;
        if(x < 0.15) return (x - 0.1) * 6.0 * 0.1;
        if(x < 0.2) return 0.06 - (x - 0.15) * 6.0 * 0.1;
        if(x < 0.35) return 0.0;
        if(x < 0.38) return (x - 0.35) * 33.0 * -0.1;
        if(x < 0.4) return -0.1 + (x - 0.38) * 50.0 * 0.1;
        if(x < 0.45) return 0.4 - (x - 0.4) * 20.0 * 0.1;
        if(x < 0.5) return -0.6 + (x - 0.45) * 20.0 * 0.1;
        if(x < 0.55) return 0.4 - (x - 0.5) * 20.0 * 0.1;
        if(x < 0.6) return -0.6 + (x - 0.55) * 12.0 * 0.1;
        if(x < 0.65) return (x - 0.6) * 4.0 * 0.1;
        if(x < 0.7) return 0.02 - (x - 0.65) * 4.0 * 0.01;
        return 0.0;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        
        float speed = 0.5 + u_mouse.x * 0.5;
        float sweep = fract(t * speed);
        
        // ECG line
        float heartY = 0.5 + ecg(uv.x * 2.0 - t * speed) * 2.0;
        float lineVal = smoothstep(0.008, 0.002, abs(uv.y - heartY));
        
        // Fade behind sweep
        float fade = smoothstep(0.0, 0.1, mod(uv.x - sweep, 1.0));
        lineVal *= fade;
        
        // Sweep line
        float sweepLine = smoothstep(0.005, 0.001, abs(uv.x - sweep));
        
        // Grid
        float gridX = smoothstep(0.003, 0.001, abs(mod(uv.x, 0.1) - 0.05));
        float gridY = smoothstep(0.003, 0.001, abs(mod(uv.y, 0.1) - 0.05));
        float grid = max(gridX, gridY) * 0.15;
        
        vec3 col = vec3(0.0, 0.05, 0.0);
        col += grid * vec3(0.0, 0.2, 0.0);
        col += lineVal * vec3(0.0, 1.0, 0.3);
        col += sweepLine * vec3(0.0, 0.5, 0.2);
        
        // Glow
        float glow = smoothstep(0.05, 0.0, abs(uv.y - heartY)) * fade * 0.3;
        col += glow * vec3(0.0, 0.5, 0.2);
        
        // Scanlines
        col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 3.0);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'rain-drops-2d',
    name: 'Rain Drops',
    description: '2D animated raindrops falling with splash ripples on the ground.',
    tags: ['2d', 'animated', 'weather'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        
        // Rain drops
        for(int i = 0; i < 30; i++) {
          float fi = float(i);
          float x = hash(vec2(fi, 0.0));
          float speed = 0.3 + hash(vec2(fi, 1.0)) * 0.5;
          float y = fract(1.0 - t * speed - hash(vec2(fi, 2.0)));
          float len = 0.02 + hash(vec2(fi, 3.0)) * 0.02;
          
          // Drop as thin line
          vec2 dropStart = vec2(x, y);
          vec2 dropEnd = vec2(x + 0.002, y + len);
          vec2 d = uv - dropStart;
          float along = clamp(d.y / len, 0.0, 1.0);
          float across = abs(d.x - 0.001 * along);
          float drop = smoothstep(0.003, 0.001, across) * step(0.0, d.y) * step(d.y, len);
          val += drop * 0.7;
          
          // Splash at bottom
          float splashT = fract(t * speed + hash(vec2(fi, 2.0)));
          if(splashT > 0.9) {
            float splashR = (splashT - 0.9) * 10.0 * 0.03;
            float splash = smoothstep(0.003, 0.001, abs(length(uv - vec2(x, 0.05)) - splashR));
            val += splash * (1.0 - (splashT - 0.9) * 10.0) * 0.5;
          }
        }
        
        // Puddle
        float puddle = smoothstep(0.06, 0.04, uv.y);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        
        vec3 skyCol = mix(vec3(0.2, 0.22, 0.3), vec3(0.15, 0.16, 0.22), uv.y);
        vec3 rainCol = vec3(0.6, 0.7, 0.9);
        vec3 col = mix(skyCol, rainCol, clamp(val, 0.0, 1.0));
        col = mix(col, vec3(0.1, 0.12, 0.2), puddle);
        col += dither * 0.02;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'fractal-tree-grow',
    name: 'Growing Tree',
    description: '2D animated fractal tree that grows branches over time with dithered leaves.',
    tags: ['2d', 'animated', 'fractal'],
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
        float growPhase = mod(t * 0.3, 4.0);
        float val = 0.0;
        
        // Trunk
        vec2 base = vec2(0.5, 0.05);
        vec2 top = vec2(0.5, 0.05 + min(growPhase, 1.0) * 0.3);
        val += line(uv, base, top, 0.006);
        
        // Branch iterations
        if(growPhase > 0.8) {
          float branchGrow = clamp((growPhase - 0.8) * 1.25, 0.0, 1.0);
          float windOffset = sin(t * 2.0) * 0.02;
          
          // Level 1 branches
          vec2 b1a = top + vec2(-0.12 + windOffset, 0.12) * branchGrow;
          vec2 b1b = top + vec2(0.12 + windOffset, 0.14) * branchGrow;
          val += line(uv, top, b1a, 0.004);
          val += line(uv, top, b1b, 0.004);
          
          if(growPhase > 1.6) {
            float bg2 = clamp((growPhase - 1.6) * 1.25, 0.0, 1.0);
            vec2 b2a = b1a + vec2(-0.08, 0.08) * bg2;
            vec2 b2b = b1a + vec2(0.04, 0.1) * bg2;
            vec2 b2c = b1b + vec2(0.08, 0.08) * bg2;
            vec2 b2d = b1b + vec2(-0.04, 0.1) * bg2;
            val += line(uv, b1a, b2a, 0.003);
            val += line(uv, b1a, b2b, 0.003);
            val += line(uv, b1b, b2c, 0.003);
            val += line(uv, b1b, b2d, 0.003);
            
            // Leaves
            if(growPhase > 2.5) {
              float leafGrow = clamp((growPhase - 2.5) * 0.67, 0.0, 1.0);
              float lr = 0.025 * leafGrow;
              val += smoothstep(lr, lr * 0.3, length(uv - b2a)) * 0.6;
              val += smoothstep(lr, lr * 0.3, length(uv - b2b)) * 0.6;
              val += smoothstep(lr, lr * 0.3, length(uv - b2c)) * 0.6;
              val += smoothstep(lr, lr * 0.3, length(uv - b2d)) * 0.6;
            }
          }
        }
        
        val = clamp(val, 0.0, 1.0);
        
        // Ground
        float ground = smoothstep(0.06, 0.04, uv.y);
        
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        float dithered = step(dither * 0.3, val);
        
        vec3 sky = mix(vec3(0.55, 0.75, 0.95), vec3(0.3, 0.5, 0.8), uv.y);
        vec3 treeCol = vec3(0.2, 0.45, 0.15);
        vec3 col = mix(sky, treeCol, dithered);
        col = mix(col, vec3(0.25, 0.4, 0.15), ground);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
