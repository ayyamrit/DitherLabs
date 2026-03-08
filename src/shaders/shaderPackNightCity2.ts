import type { DitherShaderDef } from './ditherShaders';

export const shaderPackNightCity2: DitherShaderDef[] = [
  {
    id: '3d-subway-station',
    name: '3D Subway Station',
    description: 'Underground subway platform with flickering fluorescent lights and arriving train.',
    tags: ['3d', 'city', 'underground', 'raymarching'],
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

      float station(vec3 p) {
        // Tunnel shell
        float tunnel = -(length(p.xy * vec2(1.0, 1.3)) - 3.0);
        // Platform
        float platform = box(p - vec3(-1.5, -1.5, 0.0), vec3(1.5, 0.1, 50.0));
        // Track bed
        float track = p.y + 2.0;
        // Pillars
        float pillarZ = mod(p.z + 3.0, 6.0) - 3.0;
        float pillar = box(vec3(p.x + 0.3, p.y, pillarZ), vec3(0.15, 2.0, 0.15));
        // Train (moving)
        float trainZ = p.z - u_time * 8.0;
        float train = box(vec3(p.x + 1.0, p.y - 0.0, mod(trainZ, 12.0) - 6.0), vec3(0.8, 1.0, 5.0));

        float d = tunnel;
        d = max(d, -(p.y + 2.5));
        d = min(d, platform);
        d = min(d, track);
        d = min(d, pillar);
        if(mod(u_time, 10.0) > 5.0) d = min(d, train);
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.003, 0.0);
        return normalize(vec3(
          station(p+e.xyy)-station(p-e.xyy),
          station(p+e.yxy)-station(p-e.yxy),
          station(p+e.yyx)-station(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(-1.5, -0.5, u_time * 0.5);
        vec3 rd = normalize(vec3(uv.x + (u_mouse.x - 0.5) * 0.3, uv.y + 0.1, -1.0));

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = station(ro + rd * t);
          if(abs(d) < 0.004 || t > 25.0) break;
          t += abs(d) * 0.8;
        }

        vec3 col = vec3(0.01, 0.01, 0.02);

        if(t < 25.0) {
          vec3 p = ro + rd * t;

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          // Fluorescent lights (flicker)
          float lightZ = mod(p.z + 1.5, 3.0) - 1.5;
          float light = exp(-4.0 * length(vec2(lightZ, p.y - 2.0)));
          float flicker = step(0.1, sin(u_time * 15.0 + floor(p.z / 3.0) * 7.0));
          light *= flicker * 0.8 + 0.2;

          float dithered = step(bayer, light * 0.6 + 0.03);
          col = mix(vec3(0.02, 0.02, 0.03), vec3(0.9, 0.85, 0.7), dithered);

          // Tile pattern on walls
          vec3 tile = fract(p * 8.0);
          float tileEdge = step(tile.x, 0.05) + step(tile.y, 0.05);
          col -= tileEdge * 0.03;

          float fog = 1.0 - exp(-t * 0.05);
          col = mix(col, vec3(0.02, 0.02, 0.04), fog);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-parking-garage',
    name: '3D Parking Garage',
    description: 'Eerie empty parking garage at night with harsh overhead lighting.',
    tags: ['3d', 'city', 'urban', 'raymarching'],
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

      float garage(vec3 p) {
        float floor_ = p.y;
        float ceiling = -(p.y - 2.5);
        // Columns
        vec2 colId = floor(p.xz / 4.0 + 0.5);
        vec3 colP = p;
        colP.xz = mod(p.xz + 2.0, 4.0) - 2.0;
        float col_ = box(colP, vec3(0.25, 3.0, 0.25));
        // Ramp
        float ramp = p.y - (p.z * 0.05 + 0.5);
        ramp = max(ramp, box(p - vec3(8.0, 1.0, 0.0), vec3(2.0, 0.1, 20.0)));

        float d = min(floor_, ceiling);
        d = min(d, col_);
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.003, 0.0);
        return normalize(vec3(
          garage(p+e.xyy)-garage(p-e.xyy),
          garage(p+e.yxy)-garage(p-e.yxy),
          garage(p+e.yyx)-garage(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(u_time * 0.8, 0.8, u_time * 0.4);
        vec3 rd = normalize(vec3(uv.x + (u_mouse.x - 0.5) * 0.5, uv.y, -1.0));

        float t = 0.0;
        for(int i = 0; i < 64; i++) {
          float d = garage(ro + rd * t);
          if(d < 0.004 || t > 20.0) break;
          t += d;
        }

        vec3 col = vec3(0.01, 0.01, 0.015);

        if(t < 20.0) {
          vec3 p = ro + rd * t;

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          // Overhead sodium lights
          vec2 lightPos = mod(p.xz + 2.0, 4.0) - 2.0;
          float light = exp(-2.0 * length(lightPos)) * step(2.3, p.y + 0.3);
          float flicker = 0.9 + 0.1 * sin(u_time * 8.0 + hash(floor(p.xz / 4.0)) * 30.0);
          light *= flicker;

          float dithered = step(bayer, light * 0.5 + 0.02);
          col = mix(vec3(0.02, 0.015, 0.01), vec3(0.9, 0.7, 0.3), dithered);

          // Floor markings
          if(p.y < 0.01) {
            float line = step(abs(mod(p.x, 2.5) - 1.25), 0.04);
            col += line * vec3(0.3, 0.3, 0.1) * step(bayer, 0.5);
          }

          float fog = 1.0 - exp(-t * 0.06);
          col = mix(col, vec3(0.015, 0.01, 0.005), fog);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-neon-signs',
    name: '3D Neon Signs',
    description: 'Close-up of glowing neon signs buzzing in a dark city night.',
    tags: ['3d', 'city', 'neon', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float segment(vec2 p, vec2 a, vec2 b) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return length(pa - ba * h);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 col = vec3(0.01, 0.005, 0.02);

        // Wall texture
        vec2 brickUV = fract(uv * vec2(8.0, 16.0) + vec2(step(0.5, fract(uv.y * 8.0)) * 0.5, 0.0));
        float brick = step(0.05, brickUV.x) * step(0.05, brickUV.y);
        col += brick * 0.02;

        // Neon tubes forming shapes
        float neon = 0.0;
        vec3 neonCol = vec3(0.0);

        // Circle sign
        float circle = abs(length(uv - vec2(-0.3, 0.15)) - 0.15) - 0.008;
        float c1 = smoothstep(0.01, 0.0, circle);
        float buzz1 = 0.8 + 0.2 * sin(u_time * 20.0);
        neon += c1 * buzz1;
        neonCol += c1 * buzz1 * vec3(1.0, 0.1, 0.2);

        // Triangle sign
        vec2 tp = uv - vec2(0.25, 0.1);
        float t1 = segment(tp, vec2(-0.12, -0.1), vec2(0.12, -0.1));
        float t2 = segment(tp, vec2(0.12, -0.1), vec2(0.0, 0.12));
        float t3 = segment(tp, vec2(0.0, 0.12), vec2(-0.12, -0.1));
        float tri = min(min(t1, t2), t3) - 0.008;
        float c2 = smoothstep(0.01, 0.0, tri);
        float buzz2 = 0.7 + 0.3 * sin(u_time * 15.0 + 2.0);
        neon += c2 * buzz2;
        neonCol += c2 * buzz2 * vec3(0.1, 0.5, 1.0);

        // Horizontal bar
        float bar = segment(uv, vec2(-0.4, -0.2), vec2(0.4, -0.2)) - 0.01;
        float c3 = smoothstep(0.008, 0.0, bar);
        float buzz3 = step(0.3, sin(u_time * 8.0 + uv.x * 5.0));
        neon += c3 * buzz3;
        neonCol += c3 * buzz3 * vec3(0.0, 1.0, 0.4);

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

        // Glow
        float glow = smoothstep(0.12, 0.0, circle) * buzz1 * 0.15;
        glow += smoothstep(0.1, 0.0, tri) * buzz2 * 0.1;
        col += glow * vec3(0.3, 0.1, 0.4);

        float dithered = step(bayer, neon * 0.6);
        col = mix(col, neonCol, dithered);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-city-rain-drive',
    name: '3D City Rain Drive',
    description: 'Driving through rainy city streets at night with windshield rain and neon reflections.',
    tags: ['3d', 'city', 'rain', 'driving'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 col = vec3(0.01, 0.01, 0.025);

        // Road perspective
        float road = smoothstep(0.01, 0.0, abs(uv.x / (0.5 - uv.y)) - 0.8) * step(uv.y, 0.0);

        // Road surface
        if(uv.y < 0.0) {
          float depth = -0.5 / uv.y;
          float roadX = uv.x * depth;
          // Lane lines
          float lane = smoothstep(0.04, 0.02, abs(roadX));
          float dashZ = mod(depth + u_time * 5.0, 1.5);
          lane *= step(dashZ, 0.8);
          // Wet reflections
          float refl = hash(floor(vec2(roadX * 3.0, depth * 2.0 + u_time * 3.0))) * 0.3;

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          float dithered = step(bayer, lane * 0.7 + refl);
          vec3 roadCol = mix(vec3(0.02, 0.02, 0.03), vec3(1.0, 0.8, 0.3), lane * 0.7);
          roadCol += refl * vec3(0.3, 0.1, 0.5);
          col = mix(col, roadCol, step(bayer, lane * 0.7 + refl + 0.05));
        }

        // Buildings silhouette
        float bx = floor(uv.x * 8.0);
        float bh = hash(vec2(bx, 0.0)) * 0.25 + 0.05;
        if(uv.y > 0.0 && uv.y < bh) {
          // Windows
          vec2 winUV = fract(vec2(uv.x * 8.0, uv.y * 20.0));
          float win = step(0.15, winUV.x) * step(winUV.x, 0.85) * step(0.1, winUV.y) * step(winUV.y, 0.9);
          float lit = step(0.5, hash(floor(vec2(uv.x * 8.0, uv.y * 20.0))));
          vec3 wCol = 0.5 + 0.5 * cos(bx + vec3(0.0, 2.0, 4.0));

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
          float dithered = step(bayer, win * lit * 0.5);
          col = mix(vec3(0.015, 0.01, 0.025), wCol * 0.6, dithered);
        }

        // Windshield rain
        for(int i = 0; i < 10; i++) {
          float fi = float(i);
          float speed = 0.5 + hash(vec2(fi, 7.0)) * 0.8;
          float x = hash(vec2(fi, 8.0)) - 0.5;
          float y = fract(-u_time * speed + hash(vec2(fi, 9.0))) * 1.6 - 0.8;
          float drop = smoothstep(0.015, 0.005, length(uv - vec2(x, y)));
          col += drop * vec3(0.2, 0.25, 0.35);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
