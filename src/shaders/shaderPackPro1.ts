import type { DitherShaderDef } from './ditherShaders';

export const shaderPackPro1: DitherShaderDef[] = [
  {
    id: 'pro-3d-cyberpunk-city',
    name: 'Pro: 3D Cyberpunk City',
    description: 'Raymarched cyberpunk cityscape with volumetric fog, neon signs, and puddles.',
    tags: ['3d', 'cyberpunk', 'professional'],
    featured: true,
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      #define MAX_STEPS 100
      #define MAX_DIST 50.0
      #define SURF_DIST 0.001

      mat2 rot(float a) {
          float s = sin(a), c = cos(a);
          return mat2(c, -s, s, c);
      }

      float hash12(vec2 p) {
          vec3 p3  = fract(vec3(p.xyx) * .1031);
          p3 += dot(p3, p3.yzx + 33.33);
          return fract((p3.x + p3.y) * p3.z);
      }

      float box(vec3 p, vec3 b) {
          vec3 q = abs(p) - b;
          return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      vec2 map(vec3 p) {
          float dist = p.y; // Floor
          vec3 bp = p;
          bp.xz = mod(bp.xz, 4.0) - 2.0;
          vec2 id = floor(p.xz / 4.0);
          
          float h = hash12(id) * 5.0 + 1.0;
          float b = box(bp - vec3(0, h/2.0, 0), vec3(1.2, h/2.0, 1.2));
          
          float mat = 0.0;
          if (b < dist) {
              dist = b;
              mat = 1.0; // Building
          }
          return vec2(dist, mat);
      }

      vec2 rayMarch(vec3 ro, vec3 rd) {
          float dO = 0.0;
          float mat = 0.0;
          for(int i=0; i<MAX_STEPS; i++) {
              vec3 p = ro + rd * dO;
              vec2 dS = map(p);
              dO += dS.x;
              mat = dS.y;
              if(dO > MAX_DIST || abs(dS.x) < SURF_DIST) break;
          }
          return vec2(dO, mat);
      }

      vec3 getNormal(vec3 p) {
          float d = map(p).x;
          vec2 e = vec2(.001, 0);
          vec3 n = d - vec3(
              map(p-e.xyy).x,
              map(p-e.yxy).x,
              map(p-e.yyx).x);
          return normalize(n);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - .5 * u_resolution.xy) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 2.0, u_time * 2.0);
          vec3 rd = normalize(vec3(uv.x, uv.y - 0.2, 1.0));
          
          rd.xy *= rot(sin(u_time*0.2)*0.1);
          rd.xz *= rot(sin(u_time*0.1)*0.1);

          vec2 rm = rayMarch(ro, rd);
          float d = rm.x;
          
          vec3 col = vec3(0.02, 0.02, 0.05); // Fog color
          
          if(d < MAX_DIST) {
              vec3 p = ro + rd * d;
              vec3 n = getNormal(p);
              vec3 r = reflect(rd, n);
              
              float diff = max(dot(n, normalize(vec3(1,2,3))), 0.0);
              
              if(rm.y > 0.5) { // Building
                  vec2 id = floor(p.xz / 4.0);
                  float window = step(0.8, fract(p.y * 5.0)) * step(0.8, fract(p.x * 5.0 + p.z * 5.0));
                  vec3 neonCol = vec3(hash12(id), hash12(id+1.0), hash12(id+2.0));
                  col = mix(vec3(0.1), neonCol * 2.0, window);
                  col *= diff * 0.5 + 0.5;
              } else { // Street
                  float puddle = smoothstep(0.4, 0.6, hash12(p.xz * 2.0));
                  vec3 ref = getNormal(p + r * 0.1); // Fake reflection
                  col = mix(vec3(0.05), vec3(0.2, 0.4, 0.8), puddle * max(0.0, r.y));
              }
          }
          
          // Volumetric fog
          col = mix(col, vec3(0.05, 0.02, 0.1), 1.0 - exp(-0.02 * d * d));

          // Dither
          vec2 dp = gl_FragCoord.xy;
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
          col += bayer * 0.05;

          // Tonemapping
          col = col / (1.0 + col);
          col = pow(col, vec3(1.0/2.2));
          
          gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'pro-3d-black-hole',
    name: 'Pro: 3D Black Hole',
    description: 'Relativistic black hole with gravitational lensing and accretion disk.',
    tags: ['3d', 'space', 'professional', 'physics'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
      float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(fract(sin(dot(i + vec3(0,0,0), vec3(1,57,113)))*43758.5453),
                             fract(sin(dot(i + vec3(1,0,0), vec3(1,57,113)))*43758.5453), f.x),
                         mix(fract(sin(dot(i + vec3(0,1,0), vec3(1,57,113)))*43758.5453),
                             fract(sin(dot(i + vec3(1,1,0), vec3(1,57,113)))*43758.5453), f.x), f.y),
                     mix(mix(fract(sin(dot(i + vec3(0,0,1), vec3(1,57,113)))*43758.5453),
                             fract(sin(dot(i + vec3(1,0,1), vec3(1,57,113)))*43758.5453), f.x),
                         mix(fract(sin(dot(i + vec3(0,1,1), vec3(1,57,113)))*43758.5453),
                             fract(sin(dot(i + vec3(1,1,1), vec3(1,57,113)))*43758.5453), f.x), f.y), f.z);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 1.0, 5.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          rd.yz *= rot(-0.2);
          ro.xz *= rot(u_time * 0.1);
          rd.xz *= rot(u_time * 0.1);

          vec3 col = vec3(0.0);
          float t = 0.0;
          float disk = 0.0;
          
          // Fake Raytracing / Lensing
          for(int i = 0; i < 60; i++) {
              vec3 p = ro + rd * t;
              float r = length(p);
              
              // Event Horizon
              if(r < 1.0) {
                  col = vec3(0.0);
                  break;
              }
              
              // Gravity lensing effect
              vec3 force = -normalize(p) * (1.5 / (r * r));
              rd = normalize(rd + force * 0.05);
              
              // Accretion disk
              float d = length(vec2(length(p.xz) - 2.5, p.y * 4.0)) - 1.0;
              if (d < 0.1 && r > 1.2) {
                  float n = noise(p * 5.0 - u_time * vec3(0,2,0));
                  disk += max(0.0, 0.1 - d) * n * (1.0 / r);
              }
              
              t += max(0.02, d * 0.5);
          }
          
          // Background stars
          if (length(col) == 0.0 && length(ro+rd*t) > 1.0) {
              float st = fract(sin(dot(rd.xy, vec2(12.9898, 78.233))) * 43758.5453);
              col += vec3(pow(st, 150.0)) * 2.0;
          }
          
          // Add disk emission
          col += vec3(1.0, 0.5, 0.2) * disk * 5.0;
          col += vec3(0.8, 0.3, 0.1) * smoothstep(1.0, 1.5, length(ro+rd*t)) * disk;

          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-fractal-temple',
    name: 'Pro: 3D Fractal Temple',
    description: 'Deep zooming Mandelbox structure resembling an ancient temple.',
    tags: ['3d', 'fractal', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float map(vec3 p) {
          vec3 w = p;
          float scale = 1.0;
          for(int i=0; i<6; i++) {
              w = clamp(w, -1.0, 1.0) * 2.0 - w;
              float r2 = dot(w,w);
              float k = max(1.1/r2, 1.0);
              w *= k;
              scale *= k;
          }
          return length(w)/scale - 0.05;
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
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          float t_anim = u_time * 0.2;
          vec3 ro = vec3(2.5 * sin(t_anim), 0.5 + sin(t_anim*0.5)*0.5, 2.5 * cos(t_anim));
          vec3 ta = vec3(0.0, 0.0, 0.0);
          
          vec3 cw = normalize(ta - ro);
          vec3 cu = normalize(cross(cw, vec3(0,1,0)));
          vec3 cv = cross(cu, cw);
          vec3 rd = normalize(uv.x*cu + uv.y*cv + 1.5*cw);
          
          float t = 0.0;
          for(int i=0; i<80; i++) {
              float d = map(ro + rd*t);
              if(d < 0.001 || t > 10.0) break;
              t += d;
          }
          
          vec3 col = vec3(0.02, 0.05, 0.08); // BG
          if(t < 10.0) {
              vec3 p = ro + rd*t;
              vec3 n = calcNormal(p);
              vec3 l = normalize(vec3(1.0, 2.0, -1.0));
              float diff = max(dot(n, l), 0.0);
              float ao = clamp(map(p + n*0.1)*10.0, 0.0, 1.0);
              
              vec3 mat = mix(vec3(0.8, 0.7, 0.5), vec3(0.2, 0.4, 0.3), n.y*0.5+0.5);
              col = mat * diff * ao;
              
              // Add a bit of glow
              col += vec3(0.1, 0.3, 0.5) * pow(clamp(1.0 - dot(-rd, n), 0.0, 1.0), 3.0);
          }
          
          col = mix(col, vec3(0.02, 0.05, 0.08), 1.0-exp(-0.1*t*t));
          
          gl_FragColor = vec4(sqrt(col), 1.0);
      }
    `
  },
  {
    id: 'pro-3d-holographic-glitch',
    name: 'Pro: 3D Hologram Glitch',
    description: 'A glowing 3D holographic sphere suffering from scanline glitches.',
    tags: ['3d', 'hologram', 'glitch', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float rand(float n){return fract(sin(n) * 43758.5453123);}

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          // Glitch Y
          float glitch = step(0.98, rand(floor(u_time * 10.0))) * sin(uv.y * 50.0 + u_time * 20.0) * 0.1;
          uv.x += glitch;
          
          vec3 ro = vec3(0.0, 0.0, 3.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          float t = dot(-ro, rd);
          vec3 p = ro + rd * t;
          float r = length(p);
          
          vec3 col = vec3(0.0);
          
          if(r < 1.0) {
              // Sphere intersection
              float h = sqrt(1.0 - r*r);
              vec3 n = normalize(p + rd * h);
              
              // Hologram scanlines
              float lines = sin(n.y * 100.0 - u_time * 10.0) * 0.5 + 0.5;
              lines *= sin(n.x * 50.0 + u_time * 5.0) * 0.5 + 0.5;
              
              float rim = 1.0 - max(dot(n, vec3(0,0,1)), 0.0);
              rim = smoothstep(0.6, 1.0, rim);
              
              col = mix(vec3(0.0, 0.5, 1.0) * lines, vec3(0.5, 1.0, 1.0), rim * 2.0);
          }
          
          // Chromatic aberration
          float ra = rand(floor(u_time * 15.0));
          if (ra > 0.9) {
              col.r = col.r * 1.5;
              col.b = col.b * 0.5;
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-crt-dither-engine',
    name: 'Pro: CRT Dither Engine',
    description: 'Advanced 2D procedural graphics passed through a rigorous CRT and Bayer dither emulation.',
    tags: ['2d', 'crt', 'retro', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float shape(vec2 uv) {
          return sin(length(uv)*20.0 - u_time*5.0) * cos(atan(uv.y, uv.x)*5.0 + u_time*2.0);
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          vec2 nuv = uv * 2.0 - 1.0;
          
          // CRT Curvature
          nuv *= 1.1 - 0.1 * cos(nuv.yx * 1.57);
          vec2 crtUV = nuv * 0.5 + 0.5;
          
          if(crtUV.x < 0.0 || crtUV.x > 1.0 || crtUV.y < 0.0 || crtUV.y > 1.0) {
              gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
              return;
          }
          
          vec2 cuv = crtUV * 2.0 - 1.0;
          cuv.x *= u_resolution.x / u_resolution.y;
          
          float val = shape(cuv);
          vec3 col = vec3(val*0.5+0.5, val*0.2+0.3, val*0.8+0.5);
          
          // Scanlines
          col *= 0.8 + 0.2 * sin(crtUV.y * u_resolution.y * 3.14);
          
          // Chromatic Aberration
          float r = shape(cuv - vec2(0.01, 0.0));
          float b = shape(cuv + vec2(0.01, 0.0));
          col.r = mix(col.r, r*0.5+0.5, 0.5);
          col.b = mix(col.b, b*0.5+0.5, 0.5);
          
          // Dither
          vec2 dp = gl_FragCoord.xy;
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
          col += bayer * 0.1 - 0.05;
          
          // Vignette
          float vig = length(nuv);
          col *= 1.0 - vig*vig*0.3;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-lava-tubes',
    name: 'Pro: 3D Lava Tubes',
    description: 'Raymarched subterranean caverns with flowing magma.',
    tags: ['3d', 'nature', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
      float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f*f*(3.0-2.0*f);
          return mix(mix(mix(fract(sin(dot(i,vec3(1,57,113)))*43758.5),fract(sin(dot(i+vec3(1,0,0),vec3(1,57,113)))*43758.5),f.x),
                         mix(fract(sin(dot(i+vec3(0,1,0),vec3(1,57,113)))*43758.5),fract(sin(dot(i+vec3(1,1,0),vec3(1,57,113)))*43758.5),f.x),f.y),
                     mix(mix(fract(sin(dot(i+vec3(0,0,1),vec3(1,57,113)))*43758.5),fract(sin(dot(i+vec3(1,0,1),vec3(1,57,113)))*43758.5),f.x),
                         mix(fract(sin(dot(i+vec3(0,1,1),vec3(1,57,113)))*43758.5),fract(sin(dot(i+vec3(1,1,1),vec3(1,57,113)))*43758.5),f.x),f.y),f.z);
      }

      float map(vec3 p) {
          float tunnel = 2.0 - length(p.xy + vec2(sin(p.z*0.5)*1.0, cos(p.z*0.3)*0.5));
          tunnel += noise(p*2.0) * 0.5;
          
          float magma = p.y + 1.5 + noise(p*3.0 - vec3(0,0,u_time)) * 0.3;
          return min(tunnel, magma);
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.01, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, u_time*2.0);
          vec3 rd = normalize(vec3(uv, 1.0));
          rd.xy *= rot(sin(u_time*0.2)*0.3);
          
          float t = 0.0;
          for(int i=0; i<60; i++) {
              float d = map(ro+rd*t);
              if(d < 0.01 || t > 20.0) break;
              t += d;
          }
          
          vec3 col = vec3(0.0);
          if(t < 20.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              if(p.y < -1.0) { // Magma
                  float heat = noise(p*5.0 - vec3(0,0,u_time*2.0));
                  col = mix(vec3(1.0,0.2,0.0), vec3(1.0,0.8,0.0), heat);
                  col += vec3(1.0,1.0,0.5) * pow(heat, 3.0);
              } else { // Rock
                  float diff = max(dot(n, normalize(vec3(0,-1,1))), 0.0);
                  col = vec3(0.2, 0.1, 0.05) * diff;
                  // Magma reflection glow
                  col += vec3(0.8,0.2,0.0) * max(dot(n, vec3(0,-1,0)), 0.0) * 0.5;
              }
          }
          
          col = mix(col, vec3(0.8,0.1,0.0), 1.0-exp(-0.05*t)); // Fog
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-quantum-core',
    name: 'Pro: 3D Quantum Core',
    description: 'Swirling orbital pathways of glowing particles forming a reactor core.',
    tags: ['3d', 'sci-fi', 'professional', 'particles'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, 5.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          vec3 col = vec3(0.0);
          
          for(float i=0.0; i<30.0; i++) {
              float a = i * 0.5 + u_time;
              float b = i * 0.3 - u_time * 0.5;
              
              vec3 p = vec3(sin(a)*cos(b), sin(b), cos(a)*cos(b)) * 2.0;
              
              // Project onto screen
              float t = dot(p - ro, rd);
              vec3 closest = ro + rd * t;
              float dist = length(closest - p);
              
              float glow = 0.01 / (dist * dist + 0.01);
              vec3 pCol = 0.5 + 0.5 * cos(i + vec3(0,2,4));
              col += pCol * glow * step(0.0, t);
          }
          
          // Core center
          float coreDist = length(cross(rd, -ro)) / length(rd);
          col += vec3(0.5, 0.8, 1.0) * (0.1 / (coreDist * coreDist + 0.01));
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-crystal-cave',
    name: 'Pro: 3D Crystal Cave',
    description: 'Sharp geometric crystal formations catching abstract light.',
    tags: ['3d', 'geometry', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float smax(float a, float b, float k) {
          float h = clamp(0.5 + 0.5*(a-b)/k, 0.0, 1.0);
          return mix(b, a, h) + k*h*(1.0-h);
      }

      float map(vec3 p) {
          vec3 q = p;
          q.xz = mod(q.xz, 3.0) - 1.5;
          q.y -= sin(p.x)*cos(p.z);
          
          // Octahedron formula
          vec3 a = abs(q);
          float d = (a.x+a.y+a.z - 1.0)*0.57735027;
          
          float ground = p.y + 2.0;
          float roof = 3.0 - p.y;
          
          return min(min(ground, roof), d);
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.01, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(u_time, 0.0, u_time);
          vec3 rd = normalize(vec3(uv, 1.0));
          rd.xy *= rot(sin(u_time*0.3)*0.2);
          rd.xz *= rot(cos(u_time*0.2)*0.2);
          
          float t = 0.0;
          for(int i=0; i<80; i++) {
              float d = map(ro+rd*t);
              if(d<0.001 || t>20.0) break;
              t+=d;
          }
          
          vec3 col = vec3(0.0);
          if(t<20.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              vec3 l1 = normalize(vec3(1,2,1));
              vec3 l2 = normalize(vec3(-1,0,-1));
              
              float diff1 = max(dot(n, l1), 0.0);
              float diff2 = max(dot(n, l2), 0.0);
              
              vec3 ref = reflect(rd, n);
              float spec = pow(max(dot(ref, l1), 0.0), 32.0);
              
              col = vec3(0.1, 0.8, 0.6) * diff1 + vec3(0.6, 0.1, 0.8) * diff2;
              col += vec3(1.0) * spec;
              
              // Refraction hack
              vec3 refr = refract(rd, n, 0.8);
              float d2 = map(p + refr * 0.1);
              col += vec3(0.2, 0.5, 0.9) * clamp(d2*10.0, 0.0, 1.0) * 0.5;
          }
          
          col = mix(col, vec3(0.02,0.05,0.1), 1.0-exp(-0.05*t));
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-alien-forest',
    name: 'Pro: 3D Alien Forest',
    description: 'SDF modeled organic glowing fungal structures in a dark fog.',
    tags: ['3d', 'nature', 'alien', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
      float smin(float a, float b, float k){
          float h = clamp(0.5+0.5*(b-a)/k,0.0,1.0);
          return mix(b,a,h) - k*h*(1.0-h);
      }

      float map(vec3 p) {
          float ground = p.y + 1.0 + sin(p.x)*cos(p.z)*0.2;
          
          vec3 q = p;
          q.xz = mod(q.xz, 4.0) - 2.0;
          
          // Stalk
          float stalk = length(q.xz) - 0.1*(2.0-q.y);
          stalk = max(stalk, q.y - 1.0);
          stalk = max(stalk, -q.y - 1.0);
          
          // Cap
          float cap = length(q - vec3(0,1.0,0)) - 0.8;
          cap = max(cap, -(q.y - 0.8));
          
          float shroom = smin(stalk, cap, 0.2);
          
          return smin(ground, shroom, 0.5);
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.01, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(u_time, 0.5, u_time);
          vec3 rd = normalize(vec3(uv, 1.0));
          rd.xy *= rot(0.2);
          
          float t = 0.0;
          for(int i=0; i<70; i++) {
              float d = map(ro+rd*t);
              if(d<0.01 || t>20.0) break;
              t+=d;
          }
          
          vec3 col = vec3(0.0);
          if(t<20.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              float up = max(dot(n, vec3(0,1,0)), 0.0);
              
              if(p.y > 0.0) { // Shroom cap
                  float glow = sin(p.x*10.0 + u_time*5.0)*0.5+0.5;
                  col = vec3(0.1, 0.8, 0.5) * glow;
                  col += vec3(0.0, 0.3, 0.8) * up;
              } else {
                  col = vec3(0.05, 0.1, 0.05) * up; // Mossy ground
              }
          }
          
          col = mix(col, vec3(0.01, 0.05, 0.08), 1.0-exp(-0.1*t));
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-volumetric-nebula',
    name: 'Pro: 3D Volumetric Nebula',
    description: 'Raymarched volume density forming colorful cosmic clouds.',
    tags: ['3d', 'space', 'volumetric', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
      float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f*f*(3.0-2.0*f);
          return mix(mix(mix(fract(sin(dot(i,vec3(1,57,113)))*43758.5),fract(sin(dot(i+vec3(1,0,0),vec3(1,57,113)))*43758.5),f.x),
                         mix(fract(sin(dot(i+vec3(0,1,0),vec3(1,57,113)))*43758.5),fract(sin(dot(i+vec3(1,1,0),vec3(1,57,113)))*43758.5),f.x),f.y),
                     mix(mix(fract(sin(dot(i+vec3(0,0,1),vec3(1,57,113)))*43758.5),fract(sin(dot(i+vec3(1,0,1),vec3(1,57,113)))*43758.5),f.x),
                         mix(fract(sin(dot(i+vec3(0,1,1),vec3(1,57,113)))*43758.5),fract(sin(dot(i+vec3(1,1,1),vec3(1,57,113)))*43758.5),f.x),f.y),f.z);
      }
      float fbm(vec3 p) {
          float v = 0.0;
          float a = 0.5;
          for(int i=0; i<4; i++) {
              v += a * noise(p);
              p *= 2.0;
              a *= 0.5;
          }
          return v;
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, -3.0);
          vec3 rd = normalize(vec3(uv, 1.0));
          
          ro.xz *= rot(u_time*0.1);
          rd.xz *= rot(u_time*0.1);
          rd.xy *= rot(sin(u_time*0.05)*0.5);

          vec3 col = vec3(0.0);
          float t = 0.0;
          float dens = 0.0;
          
          for(int i=0; i<40; i++) {
              vec3 p = ro + rd * t;
              float d = fbm(p + u_time*0.2) - 0.5;
              
              if(d > 0.0) {
                  dens += d * 0.1;
                  vec3 nc = mix(vec3(0.8, 0.2, 0.5), vec3(0.2, 0.5, 0.9), p.y*0.5+0.5);
                  col += nc * d * 0.2 * exp(-dens);
              }
              
              t += max(0.1, d);
              if(dens > 1.0 || t > 10.0) break;
          }
          
          // Stars
          float st = fract(sin(dot(rd.xy, vec2(12.9898, 78.233))) * 43758.5453);
          col += vec3(pow(st, 150.0)) * (1.0 - dens);
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  }
];
