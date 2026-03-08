import type { DitherShaderDef } from './ditherShaders';

export const shaderPackNightCity: DitherShaderDef[] = [
  {
    id: '3d-neon-cityscape',
    name: '3D Neon Cityscape',
    description: 'Raymarched night city skyline with glowing neon signs and reflective wet streets.',
    tags: ['3d', 'city', 'neon', 'raymarching'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float box(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float building(vec3 p, vec2 id) {
        float h = hash(id) * 3.0 + 1.0;
        float w = 0.3 + hash(id + 17.0) * 0.15;
        return box(p - vec3(0.0, h * 0.5, 0.0), vec3(w, h * 0.5, w));
      }

      float city(vec3 p) {
        vec2 id = floor(p.xz + 0.5);
        vec3 q = p;
        q.xz = fract(p.xz + 0.5) - 0.5;
        float d = building(q, id);
        // Ground
        d = min(d, p.y);
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.002, 0.0);
        return normalize(vec3(
          city(p+e.xyy)-city(p-e.xyy),
          city(p+e.yxy)-city(p-e.yxy),
          city(p+e.yyx)-city(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float camT = u_time * 0.4;
        vec3 ro = vec3(camT, 1.5 + u_mouse.y * 2.0, camT * 0.6 + 3.0);
        vec3 rd = normalize(vec3(uv.x, uv.y - 0.1, -0.8));

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = city(ro + rd * t);
          if(d < 0.003 || t > 25.0) break;
          t += d;
        }

        vec3 col = vec3(0.01, 0.01, 0.04);
        // Sky gradient
        col += mix(vec3(0.02, 0.01, 0.06), vec3(0.1, 0.02, 0.15), max(uv.y + 0.3, 0.0));

        if(t < 25.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec2 id = floor(p.xz + 0.5);

          // Windows
          vec3 winUV = fract(p * 4.0);
          float win = step(0.15, winUV.x) * step(winUV.x, 0.85) * step(0.1, winUV.y) * step(winUV.y, 0.9);
          float lit = step(0.5, hash(floor(p.xz * 4.0) + floor(p.y * 4.0) * 7.0));

          // Neon color per building
          vec3 neonCol = 0.5 + 0.5 * cos(hash(id) * 6.28 + vec3(0.0, 2.0, 4.0));

          // Dither
          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          if(p.y < 0.01) {
            // Wet ground reflections
            float refl = smoothstep(0.6, 0.0, length(fract(p.xz + 0.5) - 0.5));
            float dithered = step(bayer, refl * 0.8);
            col = mix(vec3(0.02, 0.02, 0.04), neonCol * 0.5, dithered);
          } else {
            // Building surface
            float light = win * lit;
            float dithered = step(bayer, light * 0.7 + 0.05);
            col = mix(vec3(0.03, 0.03, 0.06), neonCol, dithered);
          }

          // Fog
          float fog = 1.0 - exp(-t * 0.06);
          col = mix(col, vec3(0.05, 0.02, 0.1), fog);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-rain-city',
    name: '3D Rain City',
    description: 'Rainy night cityscape with falling rain streaks and puddle reflections.',
    tags: ['3d', 'city', 'rain', 'raymarching'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float hash1(float p) { return fract(sin(p * 127.1) * 43758.5453); }

      float box(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float city(vec3 p) {
        vec2 id = floor(p.xz + 0.5);
        vec3 q = p;
        q.xz = fract(p.xz + 0.5) - 0.5;
        float h = hash(id) * 2.5 + 0.5;
        float d = box(q - vec3(0.0, h*0.5, 0.0), vec3(0.35, h*0.5, 0.35));
        d = min(d, p.y);
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.002, 0.0);
        return normalize(vec3(
          city(p+e.xyy)-city(p-e.xyy),
          city(p+e.yxy)-city(p-e.yxy),
          city(p+e.yyx)-city(p-e.yyx)
        ));
      }

      float rain(vec2 uv) {
        float r = 0.0;
        for(int i = 0; i < 3; i++) {
          float fi = float(i);
          vec2 q = uv * (1.5 + fi * 0.5);
          q.y += u_time * (3.0 + fi * 2.0);
          vec2 id = floor(q * vec2(8.0, 2.0));
          float h = hash(id + fi * 100.0);
          vec2 st = fract(q * vec2(8.0, 2.0));
          float streak = smoothstep(0.48, 0.5, st.x) * smoothstep(0.52, 0.5, st.x);
          streak *= smoothstep(0.0, 0.3, st.y) * smoothstep(1.0, 0.5, st.y);
          r += streak * step(0.7, h) * 0.4;
        }
        return r;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(u_time * 0.3, 1.2, u_time * 0.2);
        vec3 rd = normalize(vec3(uv.x + u_mouse.x * 0.3 - 0.15, uv.y - 0.15, -0.8));

        float t = 0.0;
        for(int i = 0; i < 64; i++) {
          float d = city(ro + rd * t);
          if(d < 0.003 || t > 20.0) break;
          t += d;
        }

        vec3 col = vec3(0.015, 0.01, 0.03);
        col += mix(vec3(0.02, 0.015, 0.05), vec3(0.06, 0.02, 0.1), max(uv.y + 0.5, 0.0));

        if(t < 20.0) {
          vec3 p = ro + rd * t;
          vec2 id = floor(p.xz + 0.5);
          vec3 neonCol = 0.5 + 0.5 * cos(hash(id) * 6.28 + vec3(0.0, 1.5, 3.0));

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          if(p.y < 0.01) {
            // Wet puddle
            float ripple = sin(length(fract(p.xz * 3.0) - 0.5) * 20.0 - u_time * 4.0) * 0.5 + 0.5;
            float dithered = step(bayer, ripple * 0.4 + 0.1);
            col = mix(vec3(0.01, 0.01, 0.03), neonCol * 0.4, dithered);
          } else {
            vec3 winUV = fract(p * 5.0);
            float win = step(0.1, winUV.x) * step(winUV.x, 0.9) * step(0.1, winUV.y) * step(winUV.y, 0.85);
            float lit = step(0.55, hash(floor(p.xz * 5.0) + floor(p.y * 5.0) * 11.0));
            float dithered = step(bayer, win * lit * 0.7);
            col = mix(vec3(0.02, 0.02, 0.04), neonCol * 0.8, dithered);
          }

          float fog = 1.0 - exp(-t * 0.08);
          col = mix(col, vec3(0.04, 0.02, 0.08), fog);
        }

        // Rain overlay
        float r = rain(uv);
        col += r * vec3(0.3, 0.4, 0.6);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-cyber-highway',
    name: '3D Cyber Highway',
    description: 'Speeding down a neon-lit highway through a dark futuristic city.',
    tags: ['3d', 'city', 'cyberpunk', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float box(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float scene(vec3 p) {
        // Road
        float road = p.y;
        // Road lines
        float lineZ = mod(p.z + u_time * 8.0, 2.0);
        float centerLine = max(road, max(abs(p.x) - 0.03, abs(lineZ - 1.0) - 0.4));

        // Buildings on sides
        float side = abs(p.x) - 2.0;
        vec2 bid = floor(vec2(p.x > 0.0 ? 1.0 : -1.0, p.z + 0.5));
        float h = hash(bid) * 5.0 + 2.0;
        vec3 bq = p;
        bq.z = fract(p.z + 0.5) - 0.5;
        bq.x = abs(p.x) - 3.0;
        float bld = box(bq - vec3(0.0, h*0.5, 0.0), vec3(0.8, h*0.5, 0.4));

        float d = min(road, bld);
        d = min(d, centerLine);
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.002, 0.0);
        return normalize(vec3(
          scene(p+e.xyy)-scene(p-e.xyy),
          scene(p+e.yxy)-scene(p-e.yxy),
          scene(p+e.yyx)-scene(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float sway = sin(u_time * 0.5) * 0.3;
        vec3 ro = vec3(sway, 0.5, u_time * 5.0);
        vec3 rd = normalize(vec3(uv.x, uv.y - 0.1, -1.0));

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = scene(ro + rd * t);
          if(d < 0.003 || t > 30.0) break;
          t += d;
        }

        vec3 col = vec3(0.01, 0.0, 0.03);
        col += smoothstep(0.3, -0.3, uv.y) * vec3(0.06, 0.01, 0.12);

        if(t < 30.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          if(p.y < 0.01) {
            // Road surface
            float lane = smoothstep(0.04, 0.03, abs(abs(p.x) - 1.0));
            float stripe = step(0.4, mod(p.z + u_time * 8.0, 2.0));
            float center = smoothstep(0.04, 0.03, abs(p.x)) * stripe;
            float dithered = step(bayer, (lane + center) * 0.8);
            col = mix(vec3(0.02, 0.02, 0.03), vec3(1.0, 0.3, 0.1), dithered);

            // Neon reflections on wet road
            float refl = step(bayer * 0.5, 0.15);
            col += refl * vec3(0.05, 0.0, 0.15);
          } else {
            // Buildings
            vec3 winUV = fract(p * vec3(3.0, 4.0, 3.0));
            float win = step(0.1, winUV.x) * step(winUV.x, 0.9) * step(0.08, winUV.y) * step(winUV.y, 0.92);
            float lit = step(0.4, hash(floor(p * vec2(3.0, 4.0).xyy).xz));
            vec3 wCol = 0.5 + 0.5 * cos(hash(floor(p.xz)) * 6.28 + vec3(0.0, 2.0, 4.0));
            float dithered = step(bayer, win * lit * 0.6);
            col = mix(vec3(0.02, 0.01, 0.04), wCol, dithered);
          }

          float fog = 1.0 - exp(-t * 0.04);
          col = mix(col, vec3(0.04, 0.01, 0.08), fog);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-rooftop-view',
    name: '3D Rooftop View',
    description: 'Looking out over a sprawling night city from a rooftop vantage point.',
    tags: ['3d', 'city', 'panorama', 'raymarching'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float box(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float cityMap(vec3 p) {
        vec2 id = floor(p.xz * 0.5 + 0.5);
        vec3 q = p;
        q.xz = fract(p.xz * 0.5 + 0.5) / 0.5 - 1.0;
        float h = hash(id) * 6.0 + 0.5;
        float w = 0.6 + hash(id + 50.0) * 0.3;
        float d = box(q - vec3(0.0, h * 0.5 - 4.0, 0.0), vec3(w, h * 0.5, w));
        d = min(d, p.y - 0.0);
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.003, 0.0);
        return normalize(vec3(
          cityMap(p+e.xyy)-cityMap(p-e.xyy),
          cityMap(p+e.yxy)-cityMap(p-e.yxy),
          cityMap(p+e.yyx)-cityMap(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float lookX = (u_mouse.x - 0.5) * 3.14;
        float lookY = u_mouse.y * 0.5 - 0.3;

        vec3 ro = vec3(0.0, 5.0, 0.0);
        vec3 rd = normalize(vec3(uv.x * cos(lookX) + sin(lookX), uv.y + lookY, -cos(lookX) + uv.x * sin(lookX)));

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = cityMap(ro + rd * t);
          if(d < 0.005 || t > 40.0) break;
          t += d * 0.9;
        }

        // Night sky
        vec3 col = vec3(0.008, 0.005, 0.02);
        float stars = step(0.98, hash(floor(uv * 120.0)));
        col += stars * 0.3;
        // Moon
        float moonD = length(uv - vec2(0.5, 0.35));
        col += smoothstep(0.06, 0.04, moonD) * vec3(0.8, 0.85, 0.9) * 0.5;

        if(t < 40.0) {
          vec3 p = ro + rd * t;
          vec2 id = floor(p.xz * 0.5 + 0.5);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          // Window lights
          vec3 winP = fract(p * 3.0);
          float win = step(0.1, winP.x) * step(winP.x, 0.9) * step(0.08, winP.y) * step(winP.y, 0.92);
          float lit = step(0.5, hash(floor(p * 3.0).xz + floor(p.y * 3.0) * 13.0));

          vec3 warmLight = vec3(1.0, 0.8, 0.4);
          vec3 coolLight = vec3(0.3, 0.5, 1.0);
          vec3 wCol = mix(warmLight, coolLight, hash(id));

          float dithered = step(bayer, win * lit * 0.65);
          col = mix(vec3(0.015, 0.01, 0.03), wCol * 0.7, dithered);

          // Distance fog with city glow
          float fog = 1.0 - exp(-t * 0.025);
          vec3 fogCol = vec3(0.08, 0.03, 0.12);
          col = mix(col, fogCol, fog);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-neon-alley',
    name: '3D Neon Alley',
    description: 'Walking through a narrow neon-lit alley between towering buildings.',
    tags: ['3d', 'city', 'neon', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float box(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float alley(vec3 p) {
        // Two walls
        float leftWall = -p.x - 1.2;
        float rightWall = p.x - 1.2;
        float ground = p.y;
        float ceiling = 100.0;

        // Pipes and details on walls
        float pipe1 = length(vec2(p.x + 1.0, p.y - 2.0)) - 0.05;
        float pipe2 = length(vec2(p.x - 0.9, p.y - 1.5)) - 0.04;

        // Neon signs (boxes on walls)
        float signZ = mod(p.z + 1.0, 4.0) - 2.0;
        float sign1 = box(vec3(p.x + 1.15, p.y - 2.5, signZ), vec3(0.05, 0.2, 0.4));
        float sign2 = box(vec3(p.x - 1.15, p.y - 3.0, signZ - 1.5), vec3(0.05, 0.15, 0.3));

        float d = min(min(leftWall, rightWall), ground);
        d = min(d, min(pipe1, pipe2));
        d = min(d, min(sign1, sign2));
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.002, 0.0);
        return normalize(vec3(
          alley(p+e.xyy)-alley(p-e.xyy),
          alley(p+e.yxy)-alley(p-e.yxy),
          alley(p+e.yyx)-alley(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float walk = u_time * 1.5;
        float bobY = sin(walk * 2.0) * 0.03;
        vec3 ro = vec3(sin(u_time * 0.3) * 0.3, 0.8 + bobY, walk);
        vec3 rd = normalize(vec3(uv.x + (u_mouse.x - 0.5) * 0.5, uv.y + 0.1, -1.0));

        float t = 0.0;
        for(int i = 0; i < 64; i++) {
          float d = alley(ro + rd * t);
          if(d < 0.003 || t > 20.0) break;
          t += d;
        }

        vec3 col = vec3(0.01, 0.005, 0.02);

        if(t < 20.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          // Neon light sources
          float signZ1 = mod(p.z + 1.0, 4.0) - 2.0;
          float neon1 = exp(-3.0 * length(vec2(p.x + 1.15, signZ1)));
          float neon2 = exp(-3.0 * length(vec2(p.x - 1.15, signZ1 - 1.5)));

          vec3 nCol1 = vec3(1.0, 0.1, 0.3);
          vec3 nCol2 = vec3(0.1, 0.4, 1.0);
          float totalLight = neon1 + neon2;

          float dithered = step(bayer, totalLight * 0.6 + 0.02);
          vec3 lightCol = (nCol1 * neon1 + nCol2 * neon2) / max(totalLight, 0.01);
          col = mix(vec3(0.01, 0.005, 0.02), lightCol * 0.8, dithered);

          // Wet ground reflection
          if(p.y < 0.01) {
            float refl = step(bayer * 0.5, totalLight * 0.3);
            col += refl * lightCol * 0.2;
          }

          float fog = 1.0 - exp(-t * 0.08);
          col = mix(col, vec3(0.03, 0.01, 0.06), fog);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-city-flyover',
    name: '3D City Flyover',
    description: 'Aerial flyover of a glowing night city grid with traffic lights below.',
    tags: ['3d', 'city', 'aerial', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float box(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float cityGrid(vec3 p) {
        vec2 id = floor(p.xz + 0.5);
        vec3 q = p;
        q.xz = fract(p.xz + 0.5) - 0.5;

        // Roads as gaps
        float isRoad = step(abs(q.x), 0.12) + step(abs(q.z), 0.12);
        if(isRoad > 0.5) return p.y;

        float h = hash(id) * 4.0 + 0.3;
        return min(box(q - vec3(0.0, h*0.5, 0.0), vec3(0.35, h*0.5, 0.35)), p.y);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float t_fly = u_time * 0.8;
        vec3 ro = vec3(t_fly, 6.0 + u_mouse.y * 4.0, t_fly * 0.7);
        vec3 rd = normalize(vec3(uv.x, uv.y - 0.5, -0.7));

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = cityGrid(ro + rd * t);
          if(d < 0.005 || t > 35.0) break;
          t += d;
        }

        vec3 col = vec3(0.005, 0.003, 0.015);

        if(t < 35.0) {
          vec3 p = ro + rd * t;
          vec2 id = floor(p.xz + 0.5);
          vec3 q = vec3(fract(p.xz + 0.5) - 0.5, 0.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          float isRoad = step(abs(q.x), 0.12) + step(abs(q.y), 0.12);

          if(p.y < 0.01 && isRoad > 0.5) {
            // Roads with traffic lights
            float carX = fract(hash(id) + u_time * (0.3 + hash(id + 7.0) * 0.5));
            float car = smoothstep(0.03, 0.01, abs(fract(p.x * 2.0) - carX)) * step(abs(q.y), 0.12);
            float dithered = step(bayer, car * 0.8 + 0.03);
            vec3 carCol = mix(vec3(1.0, 0.2, 0.1), vec3(1.0, 1.0, 0.8), step(0.5, hash(id + 33.0)));
            col = mix(vec3(0.01, 0.01, 0.02), carCol, dithered);
          } else {
            // Building tops and sides
            vec3 winUV = fract(p * 4.0);
            float win = step(0.1, winUV.x) * step(winUV.x, 0.9) * step(0.08, winUV.y) * step(winUV.y, 0.92);
            float lit = step(0.45, hash(floor(p * 4.0).xz));
            vec3 wCol = 0.5 + 0.5 * cos(hash(id) * 6.28 + vec3(0.0, 2.0, 4.0));
            float dithered = step(bayer, win * lit * 0.5);
            col = mix(vec3(0.01, 0.01, 0.025), wCol * 0.6, dithered);
          }

          float fog = 1.0 - exp(-t * 0.03);
          col = mix(col, vec3(0.04, 0.015, 0.08), fog);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-tokyo-crossing',
    name: '3D Tokyo Crossing',
    description: 'Busy neon intersection inspired by Shibuya with animated light panels.',
    tags: ['3d', 'city', 'tokyo', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float box(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float scene(vec3 p) {
        float ground = p.y;
        // Buildings around intersection
        float d = ground;
        for(int i = 0; i < 4; i++) {
          float fi = float(i);
          float angle = fi * 1.5708; // PI/2
          vec3 bp = p;
          bp.x -= cos(angle) * 3.5;
          bp.z -= sin(angle) * 3.5;
          float h = 4.0 + hash(vec2(fi, fi * 3.0)) * 4.0;
          d = min(d, box(bp - vec3(0.0, h*0.5, 0.0), vec3(1.5, h*0.5, 1.5)));
        }
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.003, 0.0);
        return normalize(vec3(
          scene(p+e.xyy)-scene(p-e.xyy),
          scene(p+e.yxy)-scene(p-e.yxy),
          scene(p+e.yyx)-scene(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float camAngle = u_time * 0.15 + u_mouse.x * 3.14;
        vec3 ro = vec3(cos(camAngle) * 5.0, 1.5 + u_mouse.y * 2.0, sin(camAngle) * 5.0);
        vec3 target = vec3(0.0, 2.0, 0.0);
        vec3 fwd = normalize(target - ro);
        vec3 right = normalize(cross(vec3(0,1,0), fwd));
        vec3 up = cross(fwd, right);
        vec3 rd = normalize(uv.x * right + uv.y * up + 1.5 * fwd);

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = scene(ro + rd * t);
          if(d < 0.004 || t > 30.0) break;
          t += d;
        }

        vec3 col = vec3(0.01, 0.005, 0.025);
        col += max(uv.y * 0.05, 0.0) * vec3(0.1, 0.05, 0.2);

        if(t < 30.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          if(p.y < 0.01) {
            // Crossing lines
            float crossX = step(abs(mod(p.x, 0.6) - 0.3), 0.12) * step(abs(p.z), 2.0);
            float crossZ = step(abs(mod(p.z, 0.6) - 0.3), 0.12) * step(abs(p.x), 2.0);
            float crossing = max(crossX, crossZ);
            float dithered = step(bayer, crossing * 0.5 + 0.05);
            col = mix(vec3(0.015, 0.01, 0.02), vec3(0.9, 0.9, 0.85), dithered);
          } else {
            // Animated neon panels
            vec2 panelUV = fract(p.yy * 0.5 + p.xz * 0.3);
            float scroll = fract(panelUV.x + u_time * 0.3 * (hash(floor(p.xz)) - 0.5));
            float panel = step(0.3, panelUV.y) * step(panelUV.y, 0.7);

            vec3 nCol = 0.5 + 0.5 * cos(u_time * 0.5 + floor(p.y * 2.0) + vec3(0.0, 2.0, 4.0));

            // Windows
            vec3 winP = fract(p * 4.0);
            float win = step(0.08, winP.x) * step(winP.x, 0.92) * step(0.06, winP.y) * step(winP.y, 0.94);
            float lit = step(0.4, hash(floor(p * 4.0).xz + floor(p.y * 4.0)));

            float intensity = panel * scroll * 0.6 + win * lit * 0.4;
            float dithered = step(bayer, intensity);
            col = mix(vec3(0.02, 0.01, 0.04), nCol, dithered);
          }

          float fog = 1.0 - exp(-t * 0.04);
          col = mix(col, vec3(0.06, 0.02, 0.1), fog);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-night-bridge',
    name: '3D Night Bridge',
    description: 'Crossing a suspension bridge at night with city lights in the distance.',
    tags: ['3d', 'city', 'bridge', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float box(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float bridge(vec3 p) {
        // Deck
        float deck = box(p - vec3(0.0, 0.0, 0.0), vec3(1.5, 0.05, 50.0));
        // Rails
        float rail1 = box(p - vec3(1.4, 0.5, 0.0), vec3(0.03, 0.5, 50.0));
        float rail2 = box(p - vec3(-1.4, 0.5, 0.0), vec3(0.03, 0.5, 50.0));
        // Cables (vertical posts)
        float postZ = mod(p.z + 2.0, 4.0) - 2.0;
        float post1 = box(vec3(p.x - 1.4, p.y - 1.5, postZ), vec3(0.04, 1.5, 0.04));
        float post2 = box(vec3(p.x + 1.4, p.y - 1.5, postZ), vec3(0.04, 1.5, 0.04));

        // Water
        float water = p.y + 2.0 + sin(p.x * 2.0 + u_time) * 0.05 + sin(p.z * 0.5 + u_time * 0.7) * 0.1;

        float d = min(deck, min(rail1, rail2));
        d = min(d, min(post1, post2));
        d = min(d, water);
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.003, 0.0);
        return normalize(vec3(
          bridge(p+e.xyy)-bridge(p-e.xyy),
          bridge(p+e.yxy)-bridge(p-e.yxy),
          bridge(p+e.yyx)-bridge(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float walk = u_time * 1.2;
        vec3 ro = vec3(sin(u_time * 0.2) * 0.3, 0.5, walk);
        vec3 rd = normalize(vec3(uv.x + (u_mouse.x - 0.5) * 0.4, uv.y + 0.05, -1.0));

        float t = 0.0;
        for(int i = 0; i < 64; i++) {
          float d = bridge(ro + rd * t);
          if(d < 0.004 || t > 30.0) break;
          t += d;
        }

        // Night sky
        vec3 col = vec3(0.008, 0.005, 0.02);
        float stars = step(0.97, hash(floor(uv * 80.0)));
        col += stars * 0.25;

        // Distant city glow
        float cityGlow = smoothstep(-0.1, 0.0, uv.y) * smoothstep(0.15, 0.0, uv.y);
        col += cityGlow * vec3(0.15, 0.06, 0.2) * (0.5 + 0.5 * sin(uv.x * 20.0 + 3.0));

        if(t < 30.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          if(p.y < -1.9) {
            // Water
            float wave = sin(p.x * 3.0 + u_time * 2.0) * sin(p.z * 0.5 + u_time) * 0.5 + 0.5;
            float dithered = step(bayer, wave * 0.2 + 0.03);
            col = mix(vec3(0.005, 0.01, 0.03), vec3(0.1, 0.2, 0.5), dithered);
            // City reflection in water
            col += cityGlow * vec3(0.1, 0.04, 0.15) * step(bayer, 0.3);
          } else {
            // Bridge structure
            float lampZ = mod(p.z + 2.0, 4.0) - 2.0;
            float lamp = exp(-5.0 * length(vec2(lampZ, p.y - 3.0)));
            float dithered = step(bayer, lamp * 0.5 + 0.02);
            col = mix(vec3(0.02, 0.015, 0.03), vec3(1.0, 0.8, 0.4), dithered);
          }

          float fog = 1.0 - exp(-t * 0.04);
          col = mix(col, vec3(0.03, 0.015, 0.06), fog);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
