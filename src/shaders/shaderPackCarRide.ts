import type { DitherShaderDef } from './ditherShaders';

export const shaderPackCarRide: DitherShaderDef[] = [
  {
    id: 'car-highway-night',
    name: 'Night Highway Drive',
    description: 'First-person night highway driving with headlights, taillights, and road lines.',
    tags: ['car', 'driving', 'night', 'highway'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 col = vec3(0.005, 0.005, 0.015);

        float horizon = 0.0;
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

        if(uv.y < horizon) {
          // Road
          float depth = -0.3 / (uv.y - horizon);
          float roadX = uv.x * depth;
          float sway = sin(u_time * 0.5) * 0.5;
          roadX += sway;

          // Lane markings
          float center = smoothstep(0.06, 0.03, abs(roadX));
          float dashPhase = mod(depth + u_time * 12.0, 2.0);
          center *= step(dashPhase, 1.0);

          float edge1 = smoothstep(0.06, 0.03, abs(roadX - 3.0));
          float edge2 = smoothstep(0.06, 0.03, abs(roadX + 3.0));

          // Approaching taillights
          for(int i = 0; i < 4; i++) {
            float fi = float(i);
            float carZ = mod(depth - u_time * 3.0 + fi * 8.0, 30.0);
            float carX = roadX - (hash(vec2(fi, 0.0)) - 0.5) * 2.0;
            if(carZ > 0.5 && carZ < 2.0) {
              float tail = exp(-8.0 * length(vec2(carX - 0.3, carZ - 1.0)));
              tail += exp(-8.0 * length(vec2(carX + 0.3, carZ - 1.0)));
              col += tail * vec3(1.0, 0.1, 0.05);
            }
          }

          // Headlight glow on road
          float headlight = exp(-3.0 * length(vec2(roadX, depth - 2.0)));
          float dithered = step(bayer, (center + edge1 + edge2) * 0.6 + headlight * 0.3);
          col += mix(vec3(0.0), vec3(1.0, 0.9, 0.6), dithered * 0.5);
          col += (edge1 + edge2) * step(bayer, 0.5) * vec3(0.8, 0.8, 0.8) * 0.3;
        } else {
          // Sky with distant city glow
          float cityGlow = smoothstep(0.15, 0.0, uv.y) * 0.3;
          col += cityGlow * vec3(0.15, 0.08, 0.2);

          // Stars
          float star = step(0.98, hash(floor(uv * 60.0)));
          col += star * 0.2;
        }

        // Dashboard reflection
        float dash = smoothstep(-0.45, -0.5, uv.y);
        col = mix(col, vec3(0.01, 0.01, 0.02), dash);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'car-tunnel-drive',
    name: 'Tunnel Drive',
    description: 'Speeding through a lit tunnel with orange sodium lamps flashing overhead.',
    tags: ['car', 'driving', 'tunnel'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 col = vec3(0.02, 0.015, 0.01);

        // Tunnel walls
        float tunnelR = length(uv * vec2(1.0, 1.5));
        float wall = smoothstep(0.5, 0.52, tunnelR);

        // Vanishing point
        float depth = 1.0 / max(0.52 - tunnelR, 0.01);

        // Overhead lights passing
        float lightPhase = mod(depth * 0.5 + u_time * 6.0, 2.0);
        float overhead = smoothstep(0.3, 0.0, abs(lightPhase - 1.0)) * step(tunnelR, 0.5);

        // Wall tiles
        float angle = atan(uv.y * 1.5, uv.x);
        float tileA = step(0.02, abs(mod(angle, 0.3) - 0.15));
        float tileD = step(0.02, abs(mod(depth * 0.2, 1.0) - 0.5));

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

        if(wall > 0.5) {
          float dithered = step(bayer, tileA * tileD * 0.3 + overhead * 0.15);
          col = mix(vec3(0.03, 0.025, 0.02), vec3(0.6, 0.45, 0.2), dithered);
        } else {
          // Inside tunnel
          float dithered = step(bayer, overhead * 0.6);
          col = mix(vec3(0.01, 0.01, 0.015), vec3(0.9, 0.7, 0.3), dithered);

          // Road markings
          float roadX = uv.x / max(0.5 - abs(uv.y * 1.5), 0.01);
          float lane = smoothstep(0.05, 0.02, abs(roadX));
          float dashes = step(mod(depth * 0.3 + u_time * 6.0, 1.5), 0.8);
          col += lane * dashes * vec3(0.8, 0.8, 0.6) * step(bayer, 0.5) * 0.4;
        }

        // Headlight wash
        float headlight = smoothstep(0.4, 0.0, length(uv - vec2(0.0, -0.15))) * 0.1;
        col += headlight * vec3(1.0, 0.95, 0.8);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'car-sunset-drive',
    name: 'Sunset Cruise',
    description: 'Cruising along a coastal road at sunset with warm golden light.',
    tags: ['car', 'driving', 'sunset', 'scenic'],
    featured: true,
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

        vec3 col = vec3(0.0);

        if(uv.y > horizon) {
          // Sunset sky
          float t = (uv.y - horizon) / 0.6;
          vec3 skyLow = vec3(1.0, 0.4, 0.1);
          vec3 skyMid = vec3(0.9, 0.3, 0.2);
          vec3 skyHigh = vec3(0.15, 0.1, 0.3);
          col = mix(skyLow, skyMid, smoothstep(0.0, 0.3, t));
          col = mix(col, skyHigh, smoothstep(0.3, 1.0, t));

          // Sun
          float sunD = length(uv - vec2(-0.3, 0.05));
          col += smoothstep(0.1, 0.02, sunD) * vec3(1.0, 0.9, 0.5);
          col += smoothstep(0.3, 0.05, sunD) * vec3(0.5, 0.2, 0.0) * 0.3;

          // Clouds
          float cx = uv.x * 3.0 + u_time * 0.1;
          float cloud = smoothstep(0.5, 0.45, abs(hash(floor(vec2(cx, uv.y * 5.0))) - 0.5));
          col = mix(col, vec3(1.0, 0.6, 0.3), cloud * 0.2 * step(uv.y, 0.3));

          float dithered = step(bayer, length(col) * 0.4);
          col *= (0.7 + 0.3 * dithered);
        } else {
          // Road
          float depth = -0.2 / (uv.y - horizon);
          float roadX = uv.x * depth;
          float curve = sin(depth * 0.1 + u_time * 0.5) * 2.0;
          roadX += curve;

          // Road edge
          float edge = step(abs(roadX), 4.0);

          // Center line
          float center = smoothstep(0.06, 0.03, abs(roadX));
          float dash = step(mod(depth + u_time * 8.0, 2.0), 1.0);

          // Side lines
          float side1 = smoothstep(0.08, 0.04, abs(roadX - 3.5));
          float side2 = smoothstep(0.08, 0.04, abs(roadX + 3.5));

          float dithered = step(bayer, (center * dash + side1 + side2) * 0.5 + 0.05);
          vec3 roadCol = mix(vec3(0.08, 0.06, 0.04), vec3(0.9, 0.8, 0.4), dithered);

          // Sun reflection on road
          float sunRefl = exp(-2.0 * abs(roadX + 1.0)) * 0.2;
          roadCol += sunRefl * vec3(1.0, 0.5, 0.2);

          col = edge > 0.5 ? roadCol : mix(vec3(0.15, 0.25, 0.1), vec3(0.2, 0.3, 0.1), step(bayer, 0.4));
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'car-rearview',
    name: 'Rearview Mirror',
    description: 'View from a rearview mirror showing receding city lights at night.',
    tags: ['car', 'driving', 'night', 'mirror'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 col = vec3(0.005, 0.005, 0.01);

        // Mirror shape
        float mirror = smoothstep(0.32, 0.3, length(uv * vec2(1.0, 2.0)));

        if(mirror > 0.5) {
          vec2 muv = uv;
          muv.x = -muv.x; // Mirrored

          // Receding road
          if(muv.y < 0.0) {
            float depth = -0.15 / muv.y;
            float rx = muv.x * depth;

            // Road lines going away
            float lane = smoothstep(0.05, 0.02, abs(rx));
            float dash = step(mod(depth - u_time * 8.0, 2.0), 1.0);

            vec2 dp = floor(gl_FragCoord.xy / 2.0);
            float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
            float dithered = step(bayer, lane * dash * 0.5 + 0.03);
            col = mix(vec3(0.01), vec3(0.8, 0.7, 0.4), dithered);

            // Headlights behind
            for(int i = 0; i < 3; i++) {
              float fi = float(i);
              float carZ = mod(depth + u_time * 2.0 + fi * 5.0, 15.0);
              if(carZ < 3.0) {
                float cx = (hash(vec2(fi, 0.0)) - 0.5) * 2.0;
                float hl1 = exp(-15.0 * length(vec2(rx - cx - 0.2, carZ)));
                float hl2 = exp(-15.0 * length(vec2(rx - cx + 0.2, carZ)));
                col += (hl1 + hl2) * vec3(1.0, 0.95, 0.8) * 0.5;
              }
            }
          } else {
            // Sky in mirror
            col = vec3(0.01, 0.008, 0.025);
            float cityGlow = smoothstep(0.1, 0.0, muv.y) * 0.2;
            col += cityGlow * vec3(0.15, 0.08, 0.2);
          }
        }

        // Mirror frame
        float frame = smoothstep(0.3, 0.32, length(uv * vec2(1.0, 2.0)));
        float innerFrame = smoothstep(0.33, 0.32, length(uv * vec2(1.0, 2.0)));
        col = mix(col, vec3(0.15, 0.15, 0.15), frame * innerFrame);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'car-speedometer',
    name: 'Speedometer',
    description: 'Glowing car dashboard speedometer with animated needle and RPM gauge.',
    tags: ['car', 'dashboard', 'gauge'],
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
        vec3 col = vec3(0.01, 0.01, 0.015);

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

        // Main gauge
        vec2 center = vec2(0.0, -0.05);
        float r = length(uv - center);
        float angle = atan(uv.y - center.y, uv.x - center.x);

        // Gauge ring
        float ring = smoothstep(0.32, 0.31, r) * smoothstep(0.28, 0.29, r);
        ring *= step(-2.7, angle) * step(angle, -0.44);

        // Tick marks
        float ticks = 0.0;
        for(int i = 0; i <= 12; i++) {
          float fi = float(i);
          float a = -2.7 + fi * 0.188;
          vec2 outer = center + vec2(cos(a), sin(a)) * 0.3;
          vec2 inner = center + vec2(cos(a), sin(a)) * (mod(fi, 2.0) < 0.5 ? 0.24 : 0.26);
          ticks += smoothstep(0.005, 0.002, segment(uv, inner, outer));
        }

        // Needle
        float speed = 0.4 + sin(u_time * 0.3) * 0.2 + u_mouse.x * 0.3;
        float needleAngle = -2.7 + speed * 2.26;
        vec2 needleTip = center + vec2(cos(needleAngle), sin(needleAngle)) * 0.27;
        float needle = smoothstep(0.004, 0.001, segment(uv, center, needleTip));

        // Center cap
        float cap = smoothstep(0.03, 0.025, r);

        // Red zone
        float redZone = step(-0.8, angle) * step(angle, -0.44) * ring;

        float gaugeLight = ring * 0.4 + ticks * 0.6 + cap * 0.8;
        float dithered = step(bayer, gaugeLight);
        col = mix(col, vec3(0.7, 0.75, 0.8), dithered);

        // Needle (red)
        col += needle * vec3(0.9, 0.15, 0.05);

        // Red zone tint
        float redDithered = step(bayer, redZone * 0.4);
        col += redDithered * vec3(0.5, 0.0, 0.0);

        // Ambient dashboard glow
        col += smoothstep(0.5, 0.0, r) * vec3(0.0, 0.02, 0.04);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
