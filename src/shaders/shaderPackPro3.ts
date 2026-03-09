import type { DitherShaderDef } from './ditherShaders';

export const shaderPackPro3: DitherShaderDef[] = [
  {
    id: 'pro-3d-particle-fountain',
    name: 'Pro: 3D Particle Fountain',
    description: 'Thousands of glowing particles rising and falling with gravity.',
    tags: ['3d', 'particles', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(float n) { return fract(sin(n)*43758.5453); }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.5, 3.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          vec3 col = vec3(0.02, 0.02, 0.05);
          
          for(float i=0.0; i<100.0; i++) {
              float t0 = mod(u_time + hash(i) * 10.0, 3.0);
              float h = hash(i+0.5) * 6.28;
              float spread = hash(i+1.0) * 0.5;
              
              vec3 pos;
              pos.x = cos(h) * spread * t0;
              pos.z = sin(h) * spread * t0;
              pos.y = t0 * 2.0 - t0 * t0 * 0.7; // Parabolic arc
              
              float tt = dot(pos - ro, rd);
              vec3 closest = ro + rd * tt;
              float dist = length(closest - pos);
              
              if(tt > 0.0) {
                  float size = 0.05 * (1.0 - t0/3.0);
                  float glow = size / (dist*dist + 0.001);
                  
                  vec3 pCol = mix(vec3(1.0, 0.5, 0.1), vec3(1.0, 0.8, 0.2), hash(i+2.0));
                  col += pCol * glow * 0.1;
              }
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-morphing-platonic',
    name: 'Pro: 3D Morphing Platonic',
    description: 'Smooth morphing between platonic solids with clean SDF.',
    tags: ['3d', 'geometry', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float tetrahedron(vec3 p) {
          return (max(abs(p.x+p.y)-p.z, abs(p.x-p.y)+p.z)-1.0)/sqrt(3.0);
      }

      float octahedron(vec3 p) {
          return (abs(p.x)+abs(p.y)+abs(p.z)-1.0)*0.57735027;
      }

      float cube(vec3 p) {
          vec3 q = abs(p) - 1.0;
          return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float map(vec3 p) {
          p.xy *= rot(u_time * 0.5);
          p.yz *= rot(u_time * 0.3);
          
          float t = mod(u_time * 0.3, 3.0);
          
          float d;
          if(t < 1.0) {
              d = mix(tetrahedron(p), cube(p), t);
          } else if(t < 2.0) {
              d = mix(cube(p), octahedron(p), t - 1.0);
          } else {
              d = mix(octahedron(p), tetrahedron(p), t - 2.0);
          }
          
          return d;
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.001, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, 4.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          float t = 0.0;
          for(int i=0; i<60; i++) {
              float d = map(ro+rd*t);
              if(d < 0.001 || t > 10.0) break;
              t += d;
          }
          
          vec3 col = vec3(0.1, 0.1, 0.15);
          if(t < 10.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              float diff = max(dot(n, normalize(vec3(1,1,1))), 0.0);
              float rim = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
              
              col = vec3(0.3, 0.5, 0.8) * diff + vec3(0.5, 0.8, 1.0) * rim;
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-tron-grid',
    name: 'Pro: 3D Tron Light Grid',
    description: 'Sleek futuristic grid world with racing light trails.',
    tags: ['3d', 'tron', 'futuristic', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 col = vec3(0.0, 0.02, 0.05);
          
          // Ground plane intersection
          vec3 ro = vec3(0.0, 1.0, u_time * 5.0);
          vec3 rd = normalize(vec3(uv.x, uv.y - 0.3, 1.0));
          
          float t = -ro.y / rd.y;
          
          if(t > 0.0 && t < 50.0) {
              vec3 p = ro + rd * t;
              
              // Grid lines
              vec2 grid = abs(fract(p.xz) - 0.5);
              float line = min(grid.x, grid.y);
              line = smoothstep(0.0, 0.02, line);
              
              vec3 gridCol = vec3(0.0, 0.8, 1.0);
              col = mix(gridCol, col, line);
              
              // Light trails
              float trail1 = smoothstep(0.1, 0.0, abs(p.x - sin(p.z * 0.2 + u_time) * 3.0));
              float trail2 = smoothstep(0.1, 0.0, abs(p.x + 2.0 - cos(p.z * 0.15 + u_time * 0.8) * 4.0));
              
              col += vec3(1.0, 0.3, 0.0) * trail1;
              col += vec3(0.0, 1.0, 0.3) * trail2;
              
              // Distance fade
              col *= exp(-t * 0.05);
          }
          
          // Horizon glow
          col += vec3(0.0, 0.5, 0.8) * max(0.0, 0.02 / (abs(uv.y + 0.3) + 0.01));
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-wormhole',
    name: 'Pro: 3D Wormhole',
    description: 'Interstellar style wormhole with gravitational effects and starfield.',
    tags: ['3d', 'space', 'professional', 'physics'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          float r = length(uv);
          float a = atan(uv.y, uv.x);
          
          // Wormhole throat
          float throat = 0.3;
          
          vec3 col = vec3(0.0);
          
          if(r < throat) {
              // Inside wormhole - see other side
              vec2 exitUV = uv / throat;
              exitUV *= rot(u_time + r * 5.0);
              
              // Stars on other side
              vec2 sg = floor(exitUV * 50.0);
              float star = step(0.98, hash(sg));
              col = vec3(star) * vec3(0.8, 0.9, 1.0);
              
              // Nebula
              col += vec3(0.5, 0.2, 0.8) * hash(sg * 0.1) * 0.3;
          } else {
              // Outside - normal space
              vec2 sg = floor(uv * 80.0);
              float star = step(0.97, hash(sg));
              col = vec3(star);
              
              // Gravitational lensing
              vec2 lensed = uv * (1.0 + 0.5 / (r - throat + 0.1));
              vec2 lsg = floor(lensed * 80.0);
              float lstar = step(0.97, hash(lsg));
              col += vec3(lstar) * 0.5;
          }
          
          // Accretion ring
          float ring = smoothstep(throat + 0.05, throat, r) * smoothstep(throat - 0.1, throat, r);
          ring *= (sin(a * 3.0 - u_time * 5.0) * 0.5 + 0.5);
          col += vec3(1.0, 0.5, 0.2) * ring * 2.0;
          
          // Edge glow
          float edge = 0.01 / abs(r - throat);
          col += vec3(0.3, 0.5, 1.0) * min(edge, 2.0);
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-infinite-stairs',
    name: 'Pro: 3D Infinite Stairs',
    description: 'Escher-like impossible staircase with shifting perspective.',
    tags: ['3d', 'impossible', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float box(vec3 p, vec3 b) {
          vec3 q = abs(p) - b;
          return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float map(vec3 p) {
          // Infinite domain repetition
          float id = floor(p.z / 2.0 + p.x / 2.0);
          p.z = mod(p.z, 2.0) - 1.0;
          p.x = mod(p.x, 2.0) - 1.0;
          
          // Stair step
          float step_y = mod(id, 8.0) * 0.2;
          p.y -= step_y;
          
          float stair = box(p - vec3(0.0, -0.1, 0.0), vec3(0.9, 0.1, 0.9));
          float riser = box(p - vec3(0.0, 0.0, -0.9), vec3(0.9, 0.2, 0.1));
          
          return min(stair, riser);
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.01, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(u_time * 0.5, sin(u_time * 0.3) + 1.0, u_time * 0.5);
          vec3 rd = normalize(vec3(uv, 1.0));
          rd.xy *= rot(0.3);
          rd.xz *= rot(0.78);
          
          float t = 0.0;
          for(int i=0; i<80; i++) {
              float d = map(ro+rd*t);
              if(d < 0.001 || t > 20.0) break;
              t += d;
          }
          
          vec3 col = vec3(0.6, 0.7, 0.9); // Sky
          if(t < 20.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              float diff = max(dot(n, normalize(vec3(1,2,1))), 0.0);
              
              col = vec3(0.8, 0.75, 0.7) * diff;
              col += vec3(0.2, 0.25, 0.3) * max(dot(n, vec3(0,1,0)), 0.0);
          }
          
          col = mix(col, vec3(0.6, 0.7, 0.9), 1.0 - exp(-0.02*t*t));
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-supernova',
    name: 'Pro: 3D Supernova Explosion',
    description: 'Expanding stellar explosion with shockwave and debris field.',
    tags: ['3d', 'space', 'explosion', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec3 p) {
          p = fract(p * 0.3183099 + .1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hash(i), hash(i+vec3(1,0,0)), f.x),
                         mix(hash(i+vec3(0,1,0)), hash(i+vec3(1,1,0)), f.x), f.y),
                     mix(mix(hash(i+vec3(0,0,1)), hash(i+vec3(1,0,1)), f.x),
                         mix(hash(i+vec3(0,1,1)), hash(i+vec3(1,1,1)), f.x), f.y), f.z);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, 5.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          float phase = mod(u_time, 5.0);
          float radius = phase * 0.5;
          
          vec3 col = vec3(0.0);
          
          // Stars
          vec2 sg = floor(uv * 100.0);
          col += vec3(step(0.98, fract(sin(dot(sg, vec2(12.9898, 78.233))) * 43758.5453)));
          
          float t = 0.0;
          for(int i=0; i<30; i++) {
              vec3 p = ro + rd * t;
              float r = length(p);
              
              // Shockwave shell
              float shell = abs(r - radius) - 0.1;
              
              if(shell < 0.1 && r < radius + 0.2 && r > 0.1) {
                  float n = noise(p * 5.0 + u_time);
                  float dens = (0.1 - shell) * n * (1.0 / (radius + 0.1));
                  
                  vec3 shockCol = mix(vec3(1.0, 0.8, 0.2), vec3(1.0, 0.2, 0.0), r / (radius + 0.5));
                  col += shockCol * dens * 2.0;
              }
              
              t += 0.1;
              if(t > 8.0) break;
          }
          
          // Core glow
          float coreDist = length(cross(rd, -ro)) / length(rd);
          float core = 0.1 / (coreDist * coreDist + 0.001) * exp(-phase * 0.5);
          col += vec3(1.0, 1.0, 0.8) * core;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-clockwork-heart',
    name: 'Pro: 3D Clockwork Heart',
    description: 'Mechanical heart with pulsing gears and copper pipes.',
    tags: ['3d', 'mechanical', 'organic', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float smin(float a, float b, float k) {
          float h = clamp(0.5+0.5*(b-a)/k, 0.0, 1.0);
          return mix(b, a, h) - k*h*(1.0-h);
      }

      float map(vec3 p) {
          float pulse = sin(u_time * 5.0) * 0.05;
          
          // Heart shape from two spheres
          vec3 p1 = p - vec3(-0.3, 0.2, 0.0);
          vec3 p2 = p - vec3(0.3, 0.2, 0.0);
          vec3 p3 = p - vec3(0.0, -0.3, 0.0);
          p3.y *= 0.7;
          
          float s1 = length(p1) - (0.5 + pulse);
          float s2 = length(p2) - (0.5 + pulse);
          float s3 = length(p3) - (0.6 + pulse);
          
          float heart = smin(smin(s1, s2, 0.3), s3, 0.3);
          
          // Internal gears (visible through cutouts)
          vec3 gp = p;
          gp.xy *= rot(u_time);
          float gear = length(gp.xy) - 0.2;
          gear = max(gear, abs(gp.z) - 0.05);
          gear -= sin(atan(gp.y, gp.x) * 8.0) * 0.02;
          
          return min(heart, gear);
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.001, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, 3.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          float t = 0.0;
          for(int i=0; i<60; i++) {
              float d = map(ro+rd*t);
              if(d < 0.001 || t > 10.0) break;
              t += d;
          }
          
          vec3 col = vec3(0.1, 0.05, 0.05);
          if(t < 10.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              float diff = max(dot(n, normalize(vec3(1,1,1))), 0.0);
              
              // Copper material
              vec3 copper = vec3(0.7, 0.4, 0.2);
              col = copper * (diff * 0.6 + 0.2);
              
              // Pulse glow
              float pulse = sin(u_time * 5.0) * 0.5 + 0.5;
              col += vec3(0.8, 0.1, 0.1) * pulse * 0.3;
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-dither-radar',
    name: 'Pro: Dither Radar Sweep',
    description: 'Military-style radar display with dithered contacts and sweep line.',
    tags: ['2d', 'military', 'dither', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          float r = length(uv);
          float a = atan(uv.y, uv.x);
          
          vec3 col = vec3(0.0, 0.05, 0.0);
          
          // Radar circles
          for(float i=0.2; i<1.0; i+=0.2) {
              col += vec3(0.0, 0.2, 0.0) * smoothstep(0.01, 0.0, abs(r - i));
          }
          
          // Cross lines
          col += vec3(0.0, 0.15, 0.0) * smoothstep(0.01, 0.0, abs(uv.x)) * step(r, 0.9);
          col += vec3(0.0, 0.15, 0.0) * smoothstep(0.01, 0.0, abs(uv.y)) * step(r, 0.9);
          
          // Sweep line
          float sweep = mod(u_time, 6.28);
          float sweepLine = smoothstep(0.1, 0.0, abs(a - sweep + 3.14159));
          col += vec3(0.0, 0.8, 0.0) * sweepLine * step(r, 0.9);
          
          // Fade trail
          float trail = mod(sweep - a + 6.28, 6.28);
          float trailFade = exp(-trail * 2.0) * step(r, 0.9);
          col += vec3(0.0, 0.4, 0.0) * trailFade;
          
          // Contacts (blips)
          for(float i=0.0; i<8.0; i++) {
              vec2 contactPos = vec2(cos(i*1.5+1.0), sin(i*1.5+1.0)) * (0.3 + hash(vec2(i, 0.0)) * 0.5);
              float contactDist = length(uv - contactPos);
              
              float contactAngle = atan(contactPos.y, contactPos.x);
              float visible = smoothstep(0.0, 0.5, trail) * step(abs(contactAngle - sweep + 3.14), 0.3);
              
              // Dithered contact
              vec2 dp = gl_FragCoord.xy;
              float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
              float dithered = step(bayer, 0.8 - contactDist * 5.0) * trailFade;
              
              col += vec3(0.0, 0.9, 0.0) * dithered;
          }
          
          // Outer ring
          col *= step(r, 0.9);
          col += vec3(0.0, 0.5, 0.0) * smoothstep(0.02, 0.0, abs(r - 0.9));
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-diamond',
    name: 'Pro: 3D Diamond Refraction',
    description: 'Faceted diamond with multiple internal reflections and fire.',
    tags: ['3d', 'glass', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float map(vec3 p) {
          p.xz *= rot(u_time * 0.3);
          p.xy *= rot(u_time * 0.2);
          
          // Diamond crown
          float crown = max(abs(p.x) + abs(p.z) - 0.5, p.y - 0.3);
          crown = max(crown, -p.y - 0.1);
          
          // Diamond pavilion
          float pavilion = max(abs(p.x) + abs(p.z) - 0.4 + p.y, -p.y - 0.5);
          
          return min(crown, pavilion);
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.001, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      vec3 bg(vec3 rd) {
          return vec3(0.1, 0.1, 0.15) + vec3(0.3, 0.4, 0.5) * max(rd.y, 0.0);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.3, 2.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          float t = 0.0;
          for(int i=0; i<60; i++) {
              float d = map(ro+rd*t);
              if(d < 0.001 || t > 10.0) break;
              t += d;
          }
          
          vec3 col = bg(rd);
          
          if(t < 10.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              // Multiple chromatic refractions
              vec3 refrR = refract(rd, n, 0.9);
              vec3 refrG = refract(rd, n, 0.92);
              vec3 refrB = refract(rd, n, 0.94);
              
              col = vec3(bg(refrR).r, bg(refrG).g, bg(refrB).b);
              
              // Reflection
              vec3 refl = reflect(rd, n);
              col = mix(col, bg(refl), 0.3);
              
              // Sparkle
              float spec = pow(max(dot(refl, normalize(vec3(1,1,1))), 0.0), 64.0);
              col += vec3(1.0) * spec;
              
              // Fire (rainbow dispersion)
              col.r += spec * 0.5;
              col.b += spec * 0.3;
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-digital-rain',
    name: 'Pro: 3D Digital Rain Field',
    description: 'Matrix-style code rain in true 3D volumetric space.',
    tags: ['3d', 'matrix', 'digital', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float hash3(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, u_time);
          vec3 rd = normalize(vec3(uv, 1.0));
          
          vec3 col = vec3(0.0);
          
          for(float z=0.0; z<20.0; z+=0.5) {
              float tz = z + mod(u_time, 0.5);
              vec3 p = ro + rd * tz;
              
              vec2 grid = floor(p.xy * 4.0);
              vec2 local = fract(p.xy * 4.0);
              
              float colHash = hash(grid);
              float speed = 2.0 + colHash * 3.0;
              float phase = fract(-u_time * speed + hash(grid + 100.0));
              
              // Character
              float charTime = floor(u_time * 10.0 + hash(grid) * 10.0);
              float charHash = hash(grid + charTime);
              
              float char = step(0.2, local.x) * step(local.x, 0.8);
              char *= step(0.1, local.y) * step(local.y, 0.9);
              char *= step(0.5, charHash);
              
              // Brightness based on position in rain
              float brightness = phase * (1.0 - z / 20.0);
              
              // Head of rain is brightest
              float head = smoothstep(0.9, 1.0, phase);
              
              col += vec3(0.0, brightness * 0.3, 0.0) * char;
              col += vec3(0.5, 1.0, 0.5) * char * head;
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  }
];
