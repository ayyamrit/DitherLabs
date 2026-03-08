import type { DitherShaderDef } from './ditherShaders';

export const shaderPack3DExtra: DitherShaderDef[] = [
  {
    id: '3d-dna-helix-strand',
    name: '3D DNA Double Helix',
    description: 'Raymarched DNA double helix with glowing base pairs rotating in space.',
    tags: ['3d', 'science', 'organic', 'raymarching'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

      float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
        vec3 ab = b - a, ap = p - a;
        float t = clamp(dot(ap, ab) / dot(ab, ab), 0.0, 1.0);
        return length(p - (a + t * ab)) - r;
      }

      float map(vec3 p) {
        float d = 1e10;
        p.y += u_time * 1.5;
        float y = p.y;
        // Two backbone strands
        for(int i = 0; i < 20; i++) {
          float fi = float(i);
          float yy = fi * 0.5 - 5.0;
          float a1 = yy * 1.2;
          float a2 = a1 + 3.14159;
          vec3 p1 = vec3(cos(a1) * 0.6, yy, sin(a1) * 0.6);
          vec3 p2 = vec3(cos(a2) * 0.6, yy, sin(a2) * 0.6);
          vec3 p1n = vec3(cos(a1 + 0.6) * 0.6, yy + 0.5, sin(a1 + 0.6) * 0.6);
          vec3 p2n = vec3(cos(a2 + 0.6) * 0.6, yy + 0.5, sin(a2 + 0.6) * 0.6);
          d = min(d, sdCapsule(p, p1, p1n, 0.06));
          d = min(d, sdCapsule(p, p2, p2n, 0.06));
          // Base pair connector
          if(mod(fi, 2.0) < 1.0) {
            d = min(d, sdCapsule(p, p1, p2, 0.03));
          }
        }
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.002, 0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(0.0, 0.0, 3.0);
        vec3 rd = normalize(vec3(uv, -1.5));
        rd.xz *= rot(u_time * 0.3);

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = map(ro + rd * t);
          if(d < 0.002 || t > 20.0) break;
          t += d;
        }

        vec3 col = vec3(0.01, 0.01, 0.03);
        if(t < 20.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 light = normalize(vec3(0.5, 0.8, 1.0));
          float diff = max(dot(n, light), 0.0);
          float spec = pow(max(dot(reflect(-light, n), -rd), 0.0), 32.0);
          float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
          float dithered = step(bayer, diff * 0.7);

          vec3 baseCol = 0.5 + 0.5 * cos(p.y * 0.8 + vec3(0.0, 2.0, 4.0));
          col = mix(vec3(0.02, 0.02, 0.06), baseCol, dithered);
          col += spec * vec3(0.5, 0.7, 1.0) * 0.4;
          col += fresnel * vec3(0.1, 0.2, 0.5) * 0.3;
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-spiral-staircase',
    name: '3D Spiral Staircase',
    description: 'Raymarched infinite spiral staircase descending into the void.',
    tags: ['3d', 'architecture', 'geometric', 'raymarching'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

      float box(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float map(vec3 p) {
        // Central column
        float col_ = length(p.xz) - 0.2;
        // Steps
        float angle = atan(p.z, p.x);
        float stepH = p.y + angle * 0.5 / 3.14159 + u_time * 0.5;
        stepH = mod(stepH + 0.5, 1.0) - 0.5;
        float r = length(p.xz);
        float step_ = max(max(stepH, 0.8 - r), r - 1.8);
        step_ = max(step_, -stepH - 0.15);
        // Railing
        float rail = length(vec2(r - 1.7, mod(p.y + u_time * 0.5, 0.3) - 0.15)) - 0.02;
        float railPost = max(length(p.xz) - 1.72, -(length(p.xz) - 1.68));
        railPost = max(railPost, mod(angle + 3.14159, 0.6) - 0.05);

        float d = min(col_, step_);
        d = min(d, rail);
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.002, 0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float camA = u_time * 0.3;
        vec3 ro = vec3(cos(camA) * 2.5, 1.0 + u_mouse.y * 2.0, sin(camA) * 2.5);
        vec3 target = vec3(0.0, -1.0, 0.0);
        vec3 fwd = normalize(target - ro);
        vec3 right = normalize(cross(vec3(0,1,0), fwd));
        vec3 up = cross(fwd, right);
        vec3 rd = normalize(uv.x * right + uv.y * up + 1.5 * fwd);

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = map(ro + rd * t);
          if(d < 0.003 || t > 25.0) break;
          t += d;
        }

        vec3 col = vec3(0.01, 0.01, 0.02);
        if(t < 25.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 light = normalize(vec3(0.3, 1.0, 0.5));
          float diff = max(dot(n, light), 0.0);
          float ao = 1.0 - 0.4 * (1.0 - map(p + n * 0.15) / 0.15);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
          float dithered = step(bayer, diff * ao * 0.7);

          col = mix(vec3(0.05, 0.03, 0.08), vec3(0.7, 0.6, 0.5), dithered);
          float fog = 1.0 - exp(-t * 0.05);
          col = mix(col, vec3(0.02, 0.01, 0.04), fog);
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-floating-islands',
    name: '3D Floating Islands',
    description: 'Mystical floating islands with waterfalls and clouds below.',
    tags: ['3d', 'fantasy', 'landscape', 'raymarching'],
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
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }
      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for(int i = 0; i < 4; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
        return v;
      }

      float island(vec3 p, vec3 center, float radius) {
        vec3 q = p - center;
        float top = fbm(q.xz * 2.0) * 0.3;
        float sphere = length(q) - radius;
        float flat_ = q.y - top;
        float bottom = -(q.y + radius * 0.6);
        return max(sphere, max(flat_, bottom));
      }

      float map(vec3 p) {
        float d = 1e10;
        d = min(d, island(p, vec3(0.0, 0.5, 0.0), 1.5));
        d = min(d, island(p, vec3(3.0, -0.3, -1.0), 0.8));
        d = min(d, island(p, vec3(-2.5, 0.2, -2.0), 1.0));
        d = min(d, island(p, vec3(1.5, -0.8, 2.5), 0.6));
        // Waterfall column
        float wf = length(vec2(p.x, p.z)) - 0.05;
        wf = max(wf, p.y - 0.5);
        wf = max(wf, -(p.y + 2.0));
        d = min(d, wf);
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.003, 0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float camA = u_time * 0.15 + u_mouse.x * 3.14;
        vec3 ro = vec3(cos(camA) * 6.0, 2.0 + u_mouse.y * 3.0, sin(camA) * 6.0);
        vec3 target = vec3(0.0, 0.0, 0.0);
        vec3 fwd = normalize(target - ro);
        vec3 right = normalize(cross(vec3(0,1,0), fwd));
        vec3 up = cross(fwd, right);
        vec3 rd = normalize(uv.x * right + uv.y * up + 1.5 * fwd);

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = map(ro + rd * t);
          if(d < 0.005 || t > 30.0) break;
          t += d;
        }

        // Sky
        vec3 col = mix(vec3(0.4, 0.6, 0.9), vec3(0.15, 0.25, 0.5), max(uv.y + 0.3, 0.0));
        // Clouds below
        float cloudY = -1.5;
        if(rd.y < 0.0) {
          float ct = (cloudY - ro.y) / rd.y;
          vec3 cp = ro + rd * ct;
          float cloud = fbm(cp.xz * 0.5 + u_time * 0.1);
          col = mix(col, vec3(0.9, 0.92, 0.95), smoothstep(0.3, 0.6, cloud) * 0.7);
        }

        if(t < 30.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 light = normalize(vec3(0.5, 0.8, 0.3));
          float diff = max(dot(n, light), 0.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          // Color by height
          vec3 grass = vec3(0.2, 0.5, 0.15);
          vec3 rock = vec3(0.4, 0.3, 0.25);
          vec3 dirt = vec3(0.35, 0.25, 0.15);
          float hNorm = (p.y + 1.0) / 2.5;
          vec3 matCol = mix(dirt, mix(rock, grass, smoothstep(0.3, 0.6, hNorm)), step(0.2, hNorm));

          float dithered = step(bayer, diff * 0.7 + 0.05);
          col = matCol * (0.3 + 0.7 * dithered);

          float fog = 1.0 - exp(-t * 0.03);
          col = mix(col, vec3(0.4, 0.6, 0.9), fog);
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-clockwork-gears',
    name: '3D Clockwork Gears',
    description: 'Interlocking mechanical gears rotating in a steampunk clockwork mechanism.',
    tags: ['3d', 'mechanical', 'steampunk', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

      float gear(vec3 p, float outerR, float innerR, float thickness, int teeth, float spin) {
        p.xz *= rot(spin);
        float r = length(p.xz);
        float a = atan(p.z, p.x);
        float toothR = outerR + sin(a * float(teeth)) * 0.08;
        float disk = max(r - toothR, abs(p.y) - thickness);
        float hole = -(r - innerR);
        // Spokes
        float spoke = max(abs(mod(a + 1.57, 1.57) - 0.785) - 0.15, r - outerR * 0.8);
        spoke = max(spoke, -(r - innerR - 0.05));
        return max(disk, hole);
      }

      float map(vec3 p) {
        float d = 1e10;
        // Main gear
        d = min(d, gear(p, 1.0, 0.2, 0.15, 12, u_time * 0.5));
        // Secondary gear
        vec3 p2 = p - vec3(1.5, 0.0, 0.8);
        d = min(d, gear(p2, 0.6, 0.12, 0.15, 8, -u_time * 0.75));
        // Small gear
        vec3 p3 = p - vec3(-0.8, 0.0, 1.3);
        d = min(d, gear(p3, 0.4, 0.08, 0.12, 6, u_time * 1.0));
        // Axles
        d = min(d, max(length(p.xz) - 0.05, abs(p.y) - 0.5));
        d = min(d, max(length(p2.xz) - 0.04, abs(p2.y) - 0.4));
        d = min(d, max(length(p3.xz) - 0.03, abs(p3.y) - 0.35));
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.002, 0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(cos(u_time*0.2)*3.0, 2.5 + u_mouse.y*2.0, sin(u_time*0.2)*3.0);
        vec3 target = vec3(0.5, 0.0, 0.5);
        vec3 fwd = normalize(target - ro);
        vec3 right = normalize(cross(vec3(0,1,0), fwd));
        vec3 up = cross(fwd, right);
        vec3 rd = normalize(uv.x*right + uv.y*up + 1.5*fwd);

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = map(ro + rd * t);
          if(d < 0.002 || t > 20.0) break;
          t += d;
        }

        vec3 col = vec3(0.02, 0.015, 0.01);
        if(t < 20.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 light = normalize(vec3(0.5, 1.0, 0.3));
          float diff = max(dot(n, light), 0.0);
          float spec = pow(max(dot(reflect(-light, n), -rd), 0.0), 48.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
          float dithered = step(bayer, diff * 0.6);

          col = mix(vec3(0.08, 0.05, 0.02), vec3(0.7, 0.55, 0.3), dithered);
          col += spec * vec3(0.9, 0.8, 0.5) * 0.4;
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-underwater-scene',
    name: '3D Underwater Scene',
    description: 'Deep underwater with light rays, floating particles, and coral-like formations.',
    tags: ['3d', 'underwater', 'nature', 'raymarching'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
        return mix(a, b, h) - k*h*(1.0-h);
      }

      float map(vec3 p) {
        // Sea floor
        float floor_ = p.y + 2.0 + sin(p.x * 2.0) * 0.2 + sin(p.z * 1.5) * 0.15;
        // Coral formations
        float d = floor_;
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          vec3 cp = vec3(sin(fi * 2.3) * 2.0, -1.5, cos(fi * 3.1) * 2.0);
          float h = 0.5 + hash(vec2(fi)) * 1.0;
          float r = 0.2 + hash(vec2(fi, 1.0)) * 0.15;
          vec3 q = p - cp;
          float branch = length(q.xz) - r * (1.0 - smoothstep(-1.5, -1.5 + h, q.y));
          branch = max(branch, q.y - (-1.5 + h));
          branch = max(branch, -q.y - 2.0);
          d = smin(d, branch, 0.3);
        }
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.003, 0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(sin(u_time * 0.2) * 3.0, -0.5 + u_mouse.y, cos(u_time * 0.15) * 3.0);
        vec3 rd = normalize(vec3(uv, -1.0));

        float t = 0.0;
        for(int i = 0; i < 64; i++) {
          float d = map(ro + rd * t);
          if(d < 0.004 || t > 20.0) break;
          t += d;
        }

        // Base underwater color
        vec3 col = mix(vec3(0.02, 0.1, 0.2), vec3(0.0, 0.03, 0.08), uv.y + 0.5);

        // God rays from surface
        float rayX = uv.x * 3.0 + sin(uv.y * 2.0 + u_time * 0.5) * 0.5;
        float ray = smoothstep(0.4, 0.0, abs(sin(rayX * 2.0))) * smoothstep(-0.5, 0.5, uv.y) * 0.15;
        col += ray * vec3(0.1, 0.3, 0.4);

        // Particles
        for(int i = 0; i < 15; i++) {
          float fi = float(i);
          vec2 pp = vec2(hash(vec2(fi, 0.0)) - 0.5, hash(vec2(fi, 1.0)) - 0.5);
          pp.y += sin(u_time * 0.3 + fi) * 0.1;
          pp.y = mod(pp.y + u_time * 0.05, 1.0) - 0.5;
          float particle = smoothstep(0.008, 0.003, length(uv - pp));
          col += particle * vec3(0.1, 0.2, 0.15);
        }

        if(t < 20.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 light = normalize(vec3(0.0, 1.0, 0.3));
          float diff = max(dot(n, light), 0.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
          float dithered = step(bayer, diff * 0.5 + 0.1);

          vec3 coralCol = 0.5 + 0.5 * cos(p.y * 2.0 + vec3(0.0, 1.0, 2.0));
          vec3 floorCol = vec3(0.2, 0.25, 0.15);
          vec3 matCol = p.y < -1.8 ? floorCol : coralCol;

          col = mix(col * 0.5, matCol, dithered);
          float fog = 1.0 - exp(-t * 0.08);
          col = mix(col, vec3(0.02, 0.08, 0.15), fog);
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-volcano',
    name: '3D Volcano',
    description: 'Erupting volcano with flowing lava, smoke, and glowing crater.',
    tags: ['3d', 'nature', 'dramatic', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }

      float volcano(vec3 p) {
        float r = length(p.xz);
        float cone = p.y - (2.0 - r * 0.8) + noise(p.xz * 3.0) * 0.15;
        // Crater
        float crater = -(p.y - 1.8 + smoothstep(0.0, 0.5, r) * 0.5);
        crater = max(crater, r - 0.5);
        float d = max(cone, -crater);
        // Ground
        d = min(d, p.y + noise(p.xz * 2.0) * 0.1);
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.003, 0.0);
        return normalize(vec3(volcano(p+e.xyy)-volcano(p-e.xyy), volcano(p+e.yxy)-volcano(p-e.yxy), volcano(p+e.yyx)-volcano(p-e.yyx)));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(cos(u_time*0.1+u_mouse.x*3.14)*5.0, 2.0+u_mouse.y*3.0, sin(u_time*0.1)*5.0);
        vec3 target = vec3(0.0, 1.0, 0.0);
        vec3 fwd = normalize(target - ro);
        vec3 right = normalize(cross(vec3(0,1,0), fwd));
        vec3 up = cross(fwd, right);
        vec3 rd = normalize(uv.x*right + uv.y*up + 1.5*fwd);

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = volcano(ro + rd * t);
          if(d < 0.004 || t > 30.0) break;
          t += d;
        }

        // Dark sky with smoke
        vec3 col = vec3(0.03, 0.02, 0.02);
        float smoke = noise(uv * 3.0 + vec2(u_time * 0.1, u_time * 0.3)) * 0.15;
        col += smoke * vec3(0.1, 0.05, 0.02);

        // Glow from crater
        float craterGlow = smoothstep(0.3, 0.0, length(uv - vec2(0.0, 0.15))) * 0.3;
        col += craterGlow * vec3(1.0, 0.3, 0.05);

        if(t < 30.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          float diff = max(dot(n, normalize(vec3(0.0, 1.0, 0.5))), 0.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          // Lava glow near crater
          float r = length(p.xz);
          float lava = smoothstep(0.6, 0.0, r) * step(1.5, p.y);
          lava += smoothstep(0.3, 0.0, abs(sin(atan(p.z, p.x) * 3.0 + u_time) * r - 0.3)) * 0.3;

          float dithered = step(bayer, diff * 0.4 + lava * 0.5);
          vec3 rockCol = vec3(0.15, 0.1, 0.08);
          vec3 lavaCol = vec3(1.0, 0.4, 0.05);
          col = mix(rockCol, mix(rockCol * 2.0, lavaCol, lava), dithered);

          float fog = 1.0 - exp(-t * 0.04);
          col = mix(col, vec3(0.05, 0.02, 0.02), fog);
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-space-station',
    name: '3D Space Station',
    description: 'Orbital space station with rotating modules and starfield background.',
    tags: ['3d', 'space', 'scifi', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      mat2 rot(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

      float box(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float station(vec3 p) {
        // Central hub
        float hub = length(p) - 0.5;
        // Arms
        float arm1 = box(p, vec3(3.0, 0.1, 0.1));
        float arm2 = box(p, vec3(0.1, 0.1, 3.0));
        // Solar panels
        vec3 sp1 = p - vec3(2.5, 0.0, 0.0);
        sp1.xy *= rot(u_time * 0.2);
        float panel1 = box(sp1, vec3(0.05, 1.0, 0.5));
        vec3 sp2 = p + vec3(2.5, 0.0, 0.0);
        sp2.xy *= rot(u_time * 0.2);
        float panel2 = box(sp2, vec3(0.05, 1.0, 0.5));
        // Ring module
        vec3 rp = p;
        rp.xz *= rot(u_time * 0.3);
        float ringR = length(rp.xz) - 1.8;
        float ring = max(abs(ringR) - 0.15, abs(rp.y) - 0.15);

        float d = min(hub, min(arm1, arm2));
        d = min(d, min(panel1, panel2));
        d = min(d, ring);
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.002, 0.0);
        return normalize(vec3(station(p+e.xyy)-station(p-e.xyy), station(p+e.yxy)-station(p-e.yxy), station(p+e.yyx)-station(p-e.yyx)));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float camA = u_time * 0.1 + u_mouse.x * 3.14;
        vec3 ro = vec3(cos(camA) * 6.0, sin(u_time * 0.08) * 2.0 + u_mouse.y * 3.0, sin(camA) * 6.0);
        vec3 fwd = normalize(-ro);
        vec3 right = normalize(cross(vec3(0,1,0), fwd));
        vec3 up = cross(fwd, right);
        vec3 rd = normalize(uv.x*right + uv.y*up + 1.5*fwd);

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = station(ro + rd * t);
          if(d < 0.003 || t > 25.0) break;
          t += d;
        }

        // Starfield
        vec3 col = vec3(0.005, 0.005, 0.015);
        vec2 starGrid = floor(rd.xy * 80.0 + rd.z * 40.0);
        col += step(0.97, hash(starGrid)) * 0.4;

        // Earth-like glow below
        col += smoothstep(0.0, -0.5, rd.y) * vec3(0.05, 0.1, 0.2) * 0.3;

        if(t < 25.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 sunDir = normalize(vec3(1.0, 0.3, 0.5));
          float diff = max(dot(n, sunDir), 0.0);
          float spec = pow(max(dot(reflect(-sunDir, n), -rd), 0.0), 64.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
          float dithered = step(bayer, diff * 0.6);

          col = mix(vec3(0.05, 0.05, 0.08), vec3(0.8, 0.8, 0.85), dithered);
          col += spec * vec3(1.0, 0.95, 0.9) * 0.5;
          // Panel blue tint
          float panelDist = min(length(p.x - 2.5), length(p.x + 2.5));
          if(panelDist < 0.5) col = mix(col, vec3(0.1, 0.2, 0.5), step(bayer, diff * 0.4) * 0.5);
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-ancient-temple',
    name: '3D Ancient Temple',
    description: 'Weathered ancient temple with tall columns and atmospheric light shafts.',
    tags: ['3d', 'architecture', 'ancient', 'raymarching'],
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

      float column(vec3 p) {
        float r = length(p.xz) - 0.2;
        r = max(r, abs(p.y) - 2.0);
        // Fluting
        float angle = atan(p.z, p.x);
        r -= sin(angle * 8.0) * 0.02;
        // Capital
        float cap = box(p - vec3(0.0, 2.0, 0.0), vec3(0.3, 0.1, 0.3));
        // Base
        float base = box(p + vec3(0.0, 2.0, 0.0), vec3(0.3, 0.1, 0.3));
        return min(r, min(cap, base));
      }

      float temple(vec3 p) {
        // Floor
        float floor_ = box(p + vec3(0.0, 2.1, 0.0), vec3(4.0, 0.2, 3.0));
        // Steps
        float steps = 1e10;
        for(int i = 0; i < 3; i++) {
          float fi = float(i);
          steps = min(steps, box(p + vec3(0.0, 2.3 + fi * 0.2, 0.0), vec3(4.5 + fi * 0.3, 0.1, 3.5 + fi * 0.3)));
        }
        // Columns
        float cols = 1e10;
        for(int i = 0; i < 4; i++) {
          float fi = float(i);
          float x = fi * 2.0 - 3.0;
          cols = min(cols, column(p - vec3(x, 0.0, 2.5)));
          cols = min(cols, column(p - vec3(x, 0.0, -2.5)));
        }
        // Roof
        float roof = box(p - vec3(0.0, 2.2, 0.0), vec3(4.0, 0.15, 3.0));
        // Pediment (triangle)
        float ped = p.y - 2.35 - (1.0 - abs(p.x) * 0.3);
        ped = max(ped, abs(p.z) - 3.0);
        ped = max(-ped - 0.5, ped);

        float d = min(floor_, steps);
        d = min(d, cols);
        d = min(d, roof);
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.003, 0.0);
        return normalize(vec3(temple(p+e.xyy)-temple(p-e.xyy), temple(p+e.yxy)-temple(p-e.yxy), temple(p+e.yyx)-temple(p-e.yyx)));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float camA = u_time * 0.1 + u_mouse.x * 3.14;
        vec3 ro = vec3(cos(camA)*8.0, 2.0 + u_mouse.y * 4.0, sin(camA)*8.0);
        vec3 target = vec3(0.0, 0.5, 0.0);
        vec3 fwd = normalize(target - ro);
        vec3 right = normalize(cross(vec3(0,1,0), fwd));
        vec3 up = cross(fwd, right);
        vec3 rd = normalize(uv.x*right + uv.y*up + 1.5*fwd);

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = temple(ro + rd * t);
          if(d < 0.004 || t > 30.0) break;
          t += d;
        }

        vec3 col = mix(vec3(0.5, 0.65, 0.85), vec3(0.2, 0.3, 0.55), max(uv.y, 0.0));

        if(t < 30.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 light = normalize(vec3(0.5, 0.8, 0.3));
          float diff = max(dot(n, light), 0.0);
          float ao = 1.0 - 0.3 * (1.0 - temple(p + n * 0.2) / 0.2);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          // Weathered stone colors
          float wear = hash(floor(p.xz * 10.0)) * 0.15;
          vec3 stone = vec3(0.75, 0.7, 0.6) + wear;
          float dithered = step(bayer, diff * ao * 0.6 + 0.05);
          col = stone * (0.3 + 0.7 * dithered);

          float fog = 1.0 - exp(-t * 0.02);
          col = mix(col, vec3(0.5, 0.6, 0.8), fog);
        }

        // Light shaft
        float shaft = smoothstep(0.1, 0.0, abs(uv.x - 0.1)) * smoothstep(-0.3, 0.5, uv.y) * 0.08;
        col += shaft * vec3(1.0, 0.95, 0.8);

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-jellyfish',
    name: '3D Jellyfish',
    description: 'Bioluminescent jellyfish pulsing and drifting through dark water.',
    tags: ['3d', 'underwater', 'organic', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

      float map(vec3 p) {
        // Bell (dome)
        float pulse = sin(u_time * 2.0) * 0.15;
        vec3 bp = p;
        bp.y -= 0.5;
        float r = length(bp.xz) * (1.0 + pulse * 0.3);
        float bell = length(vec2(r, bp.y)) - 1.0;
        bell = max(bell, -bp.y - 0.3);
        // Inner cavity
        float inner = -(length(vec2(r * 1.1, bp.y + 0.1)) - 0.85);
        bell = max(bell, inner);

        // Tentacles
        float tent = 1e10;
        for(int i = 0; i < 6; i++) {
          float fi = float(i);
          float a = fi * 1.047 + u_time * 0.2;
          float tr = 0.5 + pulse * 0.1;
          vec3 tp = p;
          tp.xz -= vec2(cos(a), sin(a)) * tr;
          tp.y += 0.3;
          float sway = sin(tp.y * 3.0 + u_time * 1.5 + fi) * 0.1;
          tp.x += sway;
          float t_ = max(length(tp.xz) - 0.02, tp.y);
          t_ = max(t_, -(tp.y + 2.0));
          tent = min(tent, t_);
        }

        return min(bell, tent);
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.002, 0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(sin(u_time*0.3)*2.5, 0.0, 3.5);
        vec3 rd = normalize(vec3(uv, -1.5));

        float t = 0.0;
        for(int i = 0; i < 64; i++) {
          float d = map(ro + rd * t);
          if(d < 0.003 || t > 15.0) break;
          t += d;
        }

        vec3 col = vec3(0.005, 0.01, 0.03);
        // Particles
        for(int i = 0; i < 10; i++) {
          float fi = float(i);
          vec2 pp = vec2(sin(fi*2.3+u_time*0.1), cos(fi*1.7+u_time*0.15)) * 0.4;
          col += smoothstep(0.006, 0.002, length(uv - pp)) * vec3(0.05, 0.1, 0.15);
        }

        if(t < 15.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          float diff = max(dot(n, normalize(vec3(0.0, 1.0, 0.5))), 0.0);
          float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
          float pulse = sin(u_time * 2.0) * 0.5 + 0.5;

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          float glow = diff * 0.5 + fresnel * 0.4 + pulse * 0.2;
          float dithered = step(bayer, glow * 0.6);

          vec3 bioCol = mix(vec3(0.1, 0.3, 0.8), vec3(0.5, 0.1, 0.9), fresnel);
          col = mix(vec3(0.01, 0.02, 0.05), bioCol, dithered);
          col += fresnel * vec3(0.2, 0.4, 0.8) * 0.4;
          col += pulse * vec3(0.05, 0.15, 0.3) * (1.0 - t / 15.0);
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-tornado',
    name: '3D Tornado',
    description: 'Swirling tornado vortex with debris and dramatic stormy atmosphere.',
    tags: ['3d', 'weather', 'dramatic', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      mat2 rot(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

      float tornado(vec3 p) {
        float h = p.y;
        float radius = 0.2 + h * 0.3 + sin(h * 2.0 + u_time) * 0.1;
        // Twist
        float twist = h * 3.0 + u_time * 2.0;
        p.xz *= rot(twist);
        float r = length(p.xz);
        float shell = abs(r - radius) - 0.05 - sin(p.y * 8.0 + u_time * 3.0) * 0.02;
        shell = max(shell, -p.y);
        shell = max(shell, p.y - 3.0);
        return shell;
      }

      float ground(vec3 p) {
        return p.y + hash(floor(p.xz * 5.0)) * 0.05;
      }

      float map(vec3 p) {
        return min(tornado(p), ground(p));
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.003, 0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(cos(u_time*0.15)*5.0, 1.5+u_mouse.y*2.0, sin(u_time*0.15)*5.0);
        vec3 target = vec3(0.0, 1.5, 0.0);
        vec3 fwd = normalize(target-ro);
        vec3 right = normalize(cross(vec3(0,1,0), fwd));
        vec3 up = cross(fwd, right);
        vec3 rd = normalize(uv.x*right+uv.y*up+1.5*fwd);

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = map(ro + rd * t);
          if(d < 0.004 || t > 25.0) break;
          t += d;
        }

        // Storm sky
        vec3 col = vec3(0.04, 0.04, 0.05);
        col += smoothstep(-0.2, 0.5, uv.y) * vec3(0.03, 0.04, 0.05);

        // Debris particles
        for(int i = 0; i < 12; i++) {
          float fi = float(i);
          float angle = u_time * (1.0 + fi * 0.3) + fi * 1.3;
          float h = mod(fi * 0.4 + u_time * 0.5, 3.0);
          float r = 0.2 + h * 0.3;
          vec2 dp2 = vec2(cos(angle)*r, h - 1.0) * 0.3;
          float debris = smoothstep(0.01, 0.004, length(uv - dp2));
          col += debris * vec3(0.15, 0.1, 0.05);
        }

        if(t < 25.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          float diff = max(dot(n, normalize(vec3(0.3, 0.8, 0.5))), 0.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;

          if(p.y < 0.05) {
            float dithered = step(bayer, diff * 0.3 + 0.1);
            col = mix(vec3(0.1, 0.08, 0.05), vec3(0.25, 0.2, 0.12), dithered);
          } else {
            float swirl = sin(p.y * 10.0 + atan(p.z, p.x) * 3.0 + u_time * 5.0) * 0.5 + 0.5;
            float dithered = step(bayer, swirl * 0.4 + diff * 0.2);
            col = mix(vec3(0.05, 0.05, 0.06), vec3(0.35, 0.3, 0.25), dithered);
          }

          float fog = 1.0 - exp(-t * 0.05);
          col = mix(col, vec3(0.04, 0.04, 0.05), fog);
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
