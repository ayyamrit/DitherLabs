import type { DitherShaderDef } from './ditherShaders';

export const shaderPack3D: DitherShaderDef[] = [
  {
    id: '3d-rotating-cube',
    name: '3D Rotating Cube',
    description: 'Raymarched rotating cube with dithered shading and dynamic lighting.',
    tags: ['3d', 'geometric', 'raymarching'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

      float sdBox(vec3 p, vec3 b) {
        vec3 q = abs(p) - b;
        return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
      }

      float map(vec3 p) {
        p.xz *= rot(u_time);
        p.xy *= rot(u_time * 0.7);
        return sdBox(p, vec3(0.8));
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.001, 0.0);
        return normalize(vec3(
          map(p+e.xyy)-map(p-e.xyy),
          map(p+e.yxy)-map(p-e.yxy),
          map(p+e.yyx)-map(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(0.0, 0.0, 3.0);
        vec3 rd = normalize(vec3(uv, -1.5));

        float t = 0.0;
        for(int i = 0; i < 64; i++) {
          float d = map(ro + rd * t);
          if(d < 0.001 || t > 20.0) break;
          t += d;
        }

        vec3 col = vec3(0.02);
        if(t < 20.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 lightDir = normalize(vec3(u_mouse.x - 0.5, u_mouse.y - 0.5, 1.0));
          float diff = max(dot(n, lightDir), 0.0);
          float spec = pow(max(dot(reflect(-lightDir, n), -rd), 0.0), 32.0);

          // Dither
          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
          float dithered = step(bayer, diff);

          col = mix(vec3(0.05, 0.1, 0.15), vec3(0.0, 0.9, 0.5), dithered);
          col += spec * vec3(0.5, 0.8, 1.0) * 0.5;
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-sphere-grid',
    name: '3D Sphere Grid',
    description: 'Infinite grid of raymarched spheres with shadows and ambient occlusion.',
    tags: ['3d', 'geometric', 'raymarching'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float sdSphere(vec3 p, float r) { return length(p) - r; }

      float map(vec3 p) {
        vec3 q = mod(p + 1.5, 3.0) - 1.5;
        float sphere = sdSphere(q, 0.5 + sin(u_time + p.x + p.z) * 0.1);
        float ground = p.y + 1.0;
        return min(sphere, ground);
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.001, 0.0);
        return normalize(vec3(
          map(p+e.xyy)-map(p-e.xyy),
          map(p+e.yxy)-map(p-e.yxy),
          map(p+e.yyx)-map(p-e.yyx)
        ));
      }

      float shadow(vec3 ro, vec3 rd) {
        float t = 0.1;
        float res = 1.0;
        for(int i = 0; i < 32; i++) {
          float d = map(ro + rd * t);
          res = min(res, 8.0 * d / t);
          t += clamp(d, 0.02, 0.5);
          if(d < 0.001 || t > 10.0) break;
        }
        return clamp(res, 0.0, 1.0);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(u_time * 0.5, 1.0, u_time * 0.3);
        vec3 rd = normalize(vec3(uv, -1.0));

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = map(ro + rd * t);
          if(d < 0.001 || t > 30.0) break;
          t += d;
        }

        vec3 col = vec3(0.1, 0.12, 0.18);
        if(t < 30.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 lightDir = normalize(vec3(0.5, 0.8, 0.3));
          float diff = max(dot(n, lightDir), 0.0);
          float sh = shadow(p + n * 0.01, lightDir);
          float ao = 1.0 - 0.5 * (1.0 - map(p + n * 0.1) / 0.1);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x + dp.y, 2.0);
          float dithered = step(bayer * 0.3, diff * sh * ao);

          col = mix(vec3(0.05, 0.05, 0.1), vec3(0.8, 0.6, 0.3), dithered);
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-torus-knot',
    name: '3D Torus Knot',
    description: 'Raymarched torus knot spinning in space with specular highlights.',
    tags: ['3d', 'organic', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

      float sdTorus(vec3 p, vec2 t) {
        vec2 q = vec2(length(p.xz) - t.x, p.y);
        return length(q) - t.y;
      }

      float map(vec3 p) {
        p.xz *= rot(u_time * 0.5);
        p.xy *= rot(u_time * 0.3);
        // Twist
        float twist = p.y * 2.0 + u_time;
        p.xz *= rot(twist);
        return sdTorus(p, vec2(1.0, 0.3));
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.001, 0.0);
        return normalize(vec3(
          map(p+e.xyy)-map(p-e.xyy),
          map(p+e.yxy)-map(p-e.yxy),
          map(p+e.yyx)-map(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(0.0, 0.0, 4.0);
        vec3 rd = normalize(vec3(uv, -1.5));

        float t = 0.0;
        for(int i = 0; i < 80; i++) {
          float d = map(ro + rd * t);
          if(d < 0.001 || t > 20.0) break;
          t += d;
        }

        vec3 col = vec3(0.01, 0.01, 0.03);
        if(t < 20.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 lightDir = normalize(vec3(u_mouse - 0.5, 1.0));
          float diff = max(dot(n, lightDir), 0.0);
          float spec = pow(max(dot(reflect(-lightDir, n), -rd), 0.0), 64.0);
          float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 7.0, 8.0) / 8.0;
          float d1 = step(bayer, diff * 0.6);
          float d2 = step(bayer, diff);

          col = vec3(0.05, 0.0, 0.1);
          col = mix(col, vec3(0.6, 0.2, 0.8), d1);
          col = mix(col, vec3(0.9, 0.5, 1.0), d2);
          col += spec * vec3(1.0, 0.8, 1.0) * 0.6;
          col += fresnel * vec3(0.3, 0.1, 0.5) * 0.4;
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-terrain',
    name: '3D Terrain',
    description: 'Raymarched procedural terrain with fog and height-based coloring.',
    tags: ['3d', 'landscape', 'raymarching'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
                   mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }

      float fbm(vec2 p) {
        float v = 0.0, a = 0.5;
        for(int i = 0; i < 5; i++) {
          v += a * noise(p);
          p *= 2.0;
          a *= 0.5;
        }
        return v;
      }

      float terrain(vec2 p) {
        return fbm(p * 0.5) * 2.0 - 0.5;
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float t = u_time * 0.3;

        vec3 ro = vec3(t, 2.0 + u_mouse.y * 2.0, t * 0.5);
        vec3 rd = normalize(vec3(uv.x, uv.y - 0.2, -0.8));

        float dist = 0.0;
        vec3 col = vec3(0.5, 0.7, 0.9); // sky

        for(int i = 0; i < 80; i++) {
          vec3 p = ro + rd * dist;
          float h = terrain(p.xz);
          if(p.y < h) {
            // Hit terrain
            vec3 n = normalize(vec3(
              terrain(p.xz + vec2(0.01, 0.0)) - terrain(p.xz - vec2(0.01, 0.0)),
              0.02,
              terrain(p.xz + vec2(0.0, 0.01)) - terrain(p.xz - vec2(0.0, 0.01))
            ));
            vec3 light = normalize(vec3(0.5, 0.8, 0.3));
            float diff = max(dot(n, light), 0.0);

            // Height coloring
            vec3 grass = vec3(0.2, 0.5, 0.15);
            vec3 rock = vec3(0.4, 0.35, 0.3);
            vec3 snow = vec3(0.9, 0.92, 0.95);
            vec3 matCol = h < 0.3 ? grass : h < 1.0 ? mix(grass, rock, (h-0.3)/0.7) : mix(rock, snow, (h-1.0)/1.0);

            // Dither
            vec2 dp = floor(gl_FragCoord.xy / 2.0);
            float bayer = mod(dp.x + dp.y, 2.0);
            float dithered = step(bayer * 0.3, diff);

            col = matCol * (0.3 + 0.7 * dithered);

            // Fog
            float fog = 1.0 - exp(-dist * 0.03);
            col = mix(col, vec3(0.5, 0.7, 0.9), fog);
            break;
          }
          dist += 0.1 + dist * 0.01;
          if(dist > 50.0) break;
        }

        // Sun
        float sunD = length(uv - vec2(0.3, 0.3));
        col += smoothstep(0.1, 0.05, sunD) * vec3(1.0, 0.9, 0.6) * 0.5;

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-metaballs',
    name: '3D Metaballs',
    description: 'Raymarched organic metaballs merging and splitting in 3D space.',
    tags: ['3d', 'organic', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float smin(float a, float b, float k) {
        float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
        return mix(a, b, h) - k*h*(1.0-h);
      }

      float map(vec3 p) {
        float d = 1e10;
        for(int i = 0; i < 5; i++) {
          float fi = float(i);
          vec3 bp = vec3(
            sin(u_time * (0.5 + fi * 0.2) + fi * 1.7) * 1.2,
            cos(u_time * (0.3 + fi * 0.15) + fi * 2.3) * 0.8,
            sin(u_time * (0.4 + fi * 0.1) + fi * 3.1) * 0.6
          );
          d = smin(d, length(p - bp) - 0.5, 0.5);
        }
        // Mouse blob
        vec3 mp = vec3((u_mouse - 0.5) * 3.0, 0.0);
        d = smin(d, length(p - mp) - 0.4, 0.6);
        return d;
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.001, 0.0);
        return normalize(vec3(
          map(p+e.xyy)-map(p-e.xyy),
          map(p+e.yxy)-map(p-e.yxy),
          map(p+e.yyx)-map(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(0.0, 0.0, 5.0);
        vec3 rd = normalize(vec3(uv, -1.5));

        float t = 0.0;
        for(int i = 0; i < 64; i++) {
          float d = map(ro + rd * t);
          if(d < 0.002 || t > 20.0) break;
          t += d;
        }

        vec3 col = vec3(0.02, 0.02, 0.05);
        if(t < 20.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 light = normalize(vec3(1.0, 1.0, 1.0));
          float diff = max(dot(n, light), 0.0);
          float spec = pow(max(dot(reflect(-light, n), -rd), 0.0), 32.0);
          float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
          float dithered = step(bayer, diff);

          vec3 baseCol = 0.5 + 0.5 * cos(u_time * 0.3 + p * 0.5 + vec3(0.0, 2.0, 4.0));
          col = mix(vec3(0.02), baseCol, dithered);
          col += spec * 0.5;
          col += fresnel * vec3(0.1, 0.2, 0.4) * 0.5;
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-pyramid',
    name: '3D Pyramid',
    description: 'Raymarched rotating pyramid with edge glow and shadow dithering.',
    tags: ['3d', 'geometric', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

      float sdPyramid(vec3 p, float h) {
        float m2 = h*h + 0.25;
        p.xz = abs(p.xz);
        p.xz = (p.z > p.x) ? p.zx : p.xz;
        p.xz -= 0.5;
        vec3 q = vec3(p.z, h*p.y - 0.5*p.x, h*p.x + 0.5*p.y);
        float s = max(-q.x, 0.0);
        float t = clamp((q.y - 0.5*p.z) / (m2 + 0.25), 0.0, 1.0);
        float a = m2*(q.x+s)*(q.x+s) + q.y*q.y;
        float b = m2*(q.x+0.5*t)*(q.x+0.5*t) + (q.y-m2*t)*(q.y-m2*t);
        float d2 = min(q.y, -q.x*m2-q.y*0.5) > 0.0 ? 0.0 : min(a,b);
        return sqrt((d2+q.z*q.z)/m2) * sign(max(q.z, -p.y));
      }

      float map(vec3 p) {
        p.xz *= rot(u_time * 0.5);
        return sdPyramid(p - vec3(0.0, -0.3, 0.0), 1.2);
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.001, 0.0);
        return normalize(vec3(
          map(p+e.xyy)-map(p-e.xyy),
          map(p+e.yxy)-map(p-e.yxy),
          map(p+e.yyx)-map(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(0.0, 1.0, 4.0);
        vec3 rd = normalize(vec3(uv, -1.5));

        float t = 0.0;
        for(int i = 0; i < 64; i++) {
          float d = map(ro + rd * t);
          if(d < 0.001 || t > 20.0) break;
          t += d;
        }

        vec3 col = vec3(0.02, 0.01, 0.04);
        if(t < 20.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 lightDir = normalize(vec3(u_mouse.x - 0.5, 0.8, u_mouse.y - 0.5));
          float diff = max(dot(n, lightDir), 0.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x + dp.y, 2.0);
          float dithered = step(bayer * 0.3, diff);

          col = mix(vec3(0.1, 0.05, 0.0), vec3(0.9, 0.7, 0.3), dithered);

          // Edge glow
          float edge = 1.0 - abs(dot(n, -rd));
          col += pow(edge, 3.0) * vec3(1.0, 0.5, 0.1) * 0.4;
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-infinite-tunnel',
    name: '3D Infinite Tunnel',
    description: 'Flying through an infinite octagonal tunnel with patterned walls.',
    tags: ['3d', 'tunnel', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float sdOctogon(vec2 p, float r) {
        vec2 q = abs(p);
        float d = max(q.x + q.y * 0.4142, max(q.x * 0.4142 + q.y, max(q.x, q.y))) - r;
        return d;
      }

      float map(vec3 p) {
        p.z += u_time * 3.0;
        float tunnel = -sdOctogon(p.xy + vec2(sin(p.z*0.1)*0.5, cos(p.z*0.13)*0.3), 2.0);
        // Rings
        float rings = abs(mod(p.z, 2.0) - 1.0) - 0.9;
        return max(tunnel, rings);
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.005, 0.0);
        return normalize(vec3(
          map(p+e.xyy)-map(p-e.xyy),
          map(p+e.yxy)-map(p-e.yxy),
          map(p+e.yyx)-map(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        uv += (u_mouse - 0.5) * 0.3;
        vec3 ro = vec3(0.0, 0.0, 0.0);
        vec3 rd = normalize(vec3(uv, -1.0));

        float t = 0.0;
        for(int i = 0; i < 64; i++) {
          float d = map(ro + rd * t);
          if(abs(d) < 0.005 || t > 30.0) break;
          t += abs(d) * 0.8;
        }

        vec3 col = vec3(0.0);
        if(t < 30.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          float diff = max(dot(n, normalize(vec3(0.0, 0.0, -1.0))), 0.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 7.0, 8.0) / 8.0;
          float dithered = step(bayer, diff);

          float depth = 1.0 - t / 30.0;
          vec3 wallCol = 0.5 + 0.5 * cos(p.z * 0.3 + vec3(0.0, 2.0, 4.0));
          col = wallCol * dithered * depth;
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-crystal',
    name: '3D Crystal',
    description: 'Raymarched crystal with internal refraction-like dithered caustics.',
    tags: ['3d', 'geometric', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

      float sdOctahedron(vec3 p, float s) {
        p = abs(p);
        return (p.x + p.y + p.z - s) * 0.57735;
      }

      float map(vec3 p) {
        p.xz *= rot(u_time * 0.4);
        p.xy *= rot(u_time * 0.3);
        float oct = sdOctahedron(p, 1.2);
        // Cut facets
        float cuts = max(abs(p.x + p.y) - 1.1, abs(p.y + p.z) - 1.1);
        return max(oct, cuts * 0.5);
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.001, 0.0);
        return normalize(vec3(
          map(p+e.xyy)-map(p-e.xyy),
          map(p+e.yxy)-map(p-e.yxy),
          map(p+e.yyx)-map(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(0.0, 0.0, 3.5);
        vec3 rd = normalize(vec3(uv, -1.5));

        float t = 0.0;
        for(int i = 0; i < 64; i++) {
          float d = map(ro + rd * t);
          if(d < 0.001 || t > 20.0) break;
          t += d;
        }

        vec3 col = vec3(0.01, 0.01, 0.03);
        if(t < 20.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 lightDir = normalize(vec3(u_mouse - 0.5, 1.0));
          float diff = max(dot(n, lightDir), 0.0);
          float spec = pow(max(dot(reflect(-lightDir, n), -rd), 0.0), 128.0);
          float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 4.0);

          // Internal fake caustics
          float caustic = sin(p.x * 10.0 + u_time) * sin(p.y * 10.0 - u_time) * sin(p.z * 10.0) * 0.5 + 0.5;

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
          float d1 = step(bayer, diff * 0.5 + caustic * 0.3);
          float d2 = step(bayer, diff + caustic * 0.2);

          col = vec3(0.0, 0.05, 0.1);
          col = mix(col, vec3(0.1, 0.5, 0.8), d1);
          col = mix(col, vec3(0.6, 0.9, 1.0), d2);
          col += spec * vec3(1.0, 0.95, 0.9);
          col += fresnel * vec3(0.2, 0.4, 0.8) * 0.5;
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-donut',
    name: '3D Donut',
    description: 'Classic raymarched torus (donut) with smooth dithered shading.',
    tags: ['3d', 'geometric', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

      float sdTorus(vec3 p, vec2 t) {
        vec2 q = vec2(length(p.xz) - t.x, p.y);
        return length(q) - t.y;
      }

      float map(vec3 p) {
        p.xz *= rot(u_time * 0.5);
        p.xy *= rot(sin(u_time * 0.3) * 0.5);
        return sdTorus(p, vec2(1.0, 0.4));
      }

      vec3 calcNormal(vec3 p) {
        vec2 e = vec2(0.001, 0.0);
        return normalize(vec3(
          map(p+e.xyy)-map(p-e.xyy),
          map(p+e.yxy)-map(p-e.yxy),
          map(p+e.yyx)-map(p-e.yyx)
        ));
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        vec3 ro = vec3(0.0, 0.0, 3.5);
        vec3 rd = normalize(vec3(uv, -1.5));

        float t = 0.0;
        for(int i = 0; i < 64; i++) {
          float d = map(ro + rd * t);
          if(d < 0.001 || t > 20.0) break;
          t += d;
        }

        vec3 col = vec3(0.02, 0.01, 0.01);
        if(t < 20.0) {
          vec3 p = ro + rd * t;
          vec3 n = calcNormal(p);
          vec3 lightDir = normalize(vec3(u_mouse.x - 0.5, u_mouse.y - 0.5, 1.0));
          float diff = max(dot(n, lightDir), 0.0);
          float spec = pow(max(dot(reflect(-lightDir, n), -rd), 0.0), 32.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x + dp.y, 2.0);
          float d1 = step(bayer * 0.4, diff * 0.5);
          float d2 = step(bayer * 0.3, diff);

          col = vec3(0.15, 0.05, 0.02);
          col = mix(col, vec3(0.85, 0.45, 0.15), d1);
          col = mix(col, vec3(1.0, 0.75, 0.5), d2);
          col += spec * vec3(1.0, 0.9, 0.7) * 0.4;
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: '3d-planet',
    name: '3D Planet',
    description: 'Raymarched rotating planet with atmosphere glow and surface dithering.',
    tags: ['3d', 'space', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a) { float c=cos(a),s=sin(a); return mat2(c,-s,s,c); }

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }

      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / u_resolution.y;
        float r = length(uv);
        vec3 col = vec3(0.01, 0.01, 0.03);

        // Stars
        vec2 sg = floor(uv * 80.0);
        col += step(0.97, hash(sg)) * 0.4;

        if(r < 0.4) {
          // Sphere UV mapping
          float z = sqrt(0.16 - r * r);
          vec3 n = normalize(vec3(uv, z));
          
          // Rotate
          n.xz *= rot(u_time * 0.2);

          // Surface noise (continents)
          float lat = asin(n.y);
          float lon = atan(n.z, n.x);
          vec2 surfUV = vec2(lon, lat);
          float land = noise(surfUV * 3.0) * 0.5 + noise(surfUV * 6.0) * 0.3;

          vec3 lightDir = normalize(vec3(u_mouse - 0.5, 0.8));
          float diff = max(dot(n, lightDir), 0.0);

          vec2 dp = floor(gl_FragCoord.xy / 2.0);
          float bayer = mod(dp.x + dp.y, 2.0);
          float dithered = step(bayer * 0.3, diff);

          vec3 ocean = vec3(0.05, 0.2, 0.5);
          vec3 landCol = vec3(0.2, 0.5, 0.15);
          vec3 surface = land > 0.45 ? landCol : ocean;
          col = surface * (0.2 + 0.8 * dithered);

          // Atmosphere edge
          float atmo = smoothstep(0.4, 0.35, r);
          col += (1.0 - atmo) * vec3(0.2, 0.5, 1.0) * 0.3;
        } else {
          // Atmosphere glow
          float glow = smoothstep(0.55, 0.4, r);
          col += glow * vec3(0.1, 0.3, 0.7) * 0.4;
        }

        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
