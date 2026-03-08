import type { DitherShaderDef } from './ditherShaders';

export const shaderPackRain: DitherShaderDef[] = [
  {
    id: 'rain-heavy-downpour',
    name: 'Heavy Downpour',
    description: 'Intense rainfall with splashing droplets and misty atmosphere.',
    tags: ['rain', 'weather', 'atmospheric'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float rain(vec2 uv, float layer) {
        float r = 0.0;
        vec2 q = uv * vec2(6.0 + layer * 2.0, 1.0);
        q.y += u_time * (8.0 + layer * 4.0);
        vec2 id = floor(q);
        vec2 st = fract(q);
        float h = hash(id + layer * 100.0);
        float xOff = h * 0.6 + 0.2;
        float streak = smoothstep(xOff - 0.02, xOff, st.x) * smoothstep(xOff + 0.02, xOff, st.x);
        streak *= smoothstep(0.0, 0.15, st.y) * smoothstep(0.85, 0.4, st.y);
        r = streak * step(0.6, h);
        return r;
      }

      float splash(vec2 uv) {
        float s = 0.0;
        for(int i = 0; i < 8; i++) {
          float fi = float(i);
          vec2 p = vec2(hash(vec2(fi, 0.0)) - 0.5, -0.45 + hash(vec2(fi, 1.0)) * 0.05);
          float t = fract(u_time * (1.0 + hash(vec2(fi, 2.0))) + fi * 0.37);
          float ring = abs(length(uv - p) - t * 0.06) - 0.002;
          s += smoothstep(0.005, 0.0, ring) * (1.0 - t);
        }
        return s;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 col = vec3(0.03, 0.04, 0.06);

        // Layers of rain
        float r = 0.0;
        for(int i = 0; i < 4; i++) {
          float fi = float(i);
          r += rain(uv + fi * 0.1, fi) * (0.6 + fi * 0.1);
        }

        // Splashes at bottom
        float sp = splash(uv);

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
        float dithered = step(bayer, r * 0.6 + sp * 0.4);

        col = mix(col, vec3(0.5, 0.55, 0.65), dithered);

        // Mist
        float mist = smoothstep(-0.5, -0.3, uv.y) * 0.15;
        col += mist;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'rain-window-view',
    name: 'Rain on Window',
    description: 'Raindrops rolling down a window pane with blurred lights behind.',
    tags: ['rain', 'cozy', 'atmospheric'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float drop(vec2 uv, vec2 pos, float size) {
        return smoothstep(size, size * 0.3, length(uv - pos));
      }

      float trail(vec2 uv, vec2 pos, float w) {
        float t = smoothstep(w, 0.0, abs(uv.x - pos.x));
        t *= smoothstep(pos.y, pos.y + 0.3, uv.y);
        return t;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 col = vec3(0.02, 0.02, 0.04);

        // Bokeh lights behind window
        for(int i = 0; i < 12; i++) {
          float fi = float(i);
          vec2 bp = vec2(hash(vec2(fi, 0.0)) - 0.5, hash(vec2(fi, 1.0)) - 0.5) * 1.2;
          float size = 0.03 + hash(vec2(fi, 2.0)) * 0.06;
          float b = smoothstep(size, size * 0.3, length(uv - bp));
          vec3 bCol = 0.5 + 0.5 * cos(fi * 1.5 + vec3(0.0, 2.0, 4.0));
          col += b * bCol * 0.15;
        }

        // Raindrops
        float drops = 0.0;
        for(int i = 0; i < 15; i++) {
          float fi = float(i);
          float speed = 0.3 + hash(vec2(fi, 3.0)) * 0.5;
          float x = hash(vec2(fi, 4.0)) - 0.5;
          float y = fract(-u_time * speed + hash(vec2(fi, 5.0))) * 1.4 - 0.7;
          float size = 0.01 + hash(vec2(fi, 6.0)) * 0.015;
          drops += drop(uv, vec2(x + sin(y * 3.0) * 0.02, y), size);
          drops += trail(uv, vec2(x + sin(y * 3.0) * 0.02, y), 0.003) * 0.3;
        }

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
        float dithered = step(bayer, drops * 0.7);

        col += dithered * vec3(0.4, 0.45, 0.55);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'rain-puddle-ripples',
    name: 'Puddle Ripples',
    description: 'Overhead view of rain hitting a puddle creating expanding concentric ripples.',
    tags: ['rain', 'water', 'atmospheric'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 col = vec3(0.02, 0.04, 0.08);

        // Puddle base with subtle color
        float puddle = smoothstep(0.6, 0.0, length(uv));
        col += puddle * vec3(0.02, 0.05, 0.1);

        // Ripples from random drop points
        float rippleSum = 0.0;
        for(int i = 0; i < 12; i++) {
          float fi = float(i);
          vec2 center = (vec2(hash(vec2(fi, 0.0)), hash(vec2(fi, 1.0))) - 0.5) * 0.8;
          float birthTime = hash(vec2(fi, 2.0)) * 3.0;
          float t = mod(u_time + birthTime, 3.0);
          float radius = t * 0.2;
          float ring = abs(length(uv - center) - radius);
          float ripple = smoothstep(0.015, 0.0, ring) * (1.0 - t / 3.0);
          rippleSum += ripple;
        }

        // Mouse ripple
        vec2 mp = (u_mouse - 0.5) * vec2(u_resolution.x / u_resolution.y, 1.0);
        float mt = mod(u_time, 1.5);
        float mRing = abs(length(uv - mp) - mt * 0.15);
        rippleSum += smoothstep(0.01, 0.0, mRing) * (1.0 - mt / 1.5) * 0.5;

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
        float dithered = step(bayer, rippleSum * 0.5 + puddle * 0.1);

        col = mix(col, vec3(0.3, 0.5, 0.7), dithered);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'rain-thunderstorm',
    name: 'Thunderstorm',
    description: 'Dark storm with rain, lightning flashes, and rolling thunder atmosphere.',
    tags: ['rain', 'storm', 'dramatic'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float rain(vec2 uv, float layer) {
        vec2 q = uv * vec2(8.0 + layer * 3.0, 1.5);
        q.y += u_time * (10.0 + layer * 5.0);
        vec2 id = floor(q);
        vec2 st = fract(q);
        float h = hash(id + layer * 77.0);
        float x = h * 0.7 + 0.15;
        float streak = smoothstep(x - 0.015, x, st.x) * smoothstep(x + 0.015, x, st.x);
        streak *= smoothstep(0.0, 0.1, st.y) * smoothstep(0.9, 0.3, st.y);
        return streak * step(0.55, h);
      }

      float lightning(vec2 uv) {
        float flash = step(0.97, sin(u_time * 3.7) * sin(u_time * 5.3));
        if(flash < 0.5) return 0.0;
        float bolt = 0.0;
        vec2 p = vec2(sin(u_time) * 0.2, 0.5);
        for(int i = 0; i < 8; i++) {
          float fi = float(i);
          p.y -= 0.12;
          p.x += (hash(vec2(fi, u_time * 0.1)) - 0.5) * 0.15;
          bolt += smoothstep(0.03, 0.0, abs(uv.x - p.x)) * smoothstep(abs(uv.y - p.y), 0.0, 0.06);
        }
        return bolt;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;

        // Dark storm sky
        vec3 col = vec3(0.015, 0.015, 0.025);
        col += smoothstep(-0.5, 0.5, uv.y) * vec3(0.02, 0.02, 0.04);

        // Cloud shapes
        float cloud = 0.0;
        for(int i = 0; i < 3; i++) {
          float fi = float(i);
          vec2 cp = uv * (1.5 + fi * 0.5) + vec2(u_time * 0.02 * (fi + 1.0), fi * 0.3);
          vec2 cid = floor(cp * 3.0);
          cloud += smoothstep(0.6, 0.3, length(fract(cp * 3.0) - 0.5)) * hash(cid) * 0.15;
        }
        col += cloud * vec3(0.05, 0.05, 0.07);

        // Rain
        float r = 0.0;
        for(int i = 0; i < 3; i++) { r += rain(uv, float(i)); }

        // Lightning
        float bolt = lightning(uv);
        float flash = step(0.97, sin(u_time * 3.7) * sin(u_time * 5.3));

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
        float dithered = step(bayer, r * 0.5);

        col = mix(col, vec3(0.5, 0.55, 0.6), dithered);
        col += bolt * vec3(0.8, 0.85, 1.0);
        col += flash * vec3(0.15, 0.15, 0.2);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
