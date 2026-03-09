import type { DitherShaderDef } from './ditherShaders';

export const shaderPackPro2: DitherShaderDef[] = [
  {
    id: 'pro-3d-neural-network',
    name: 'Pro: 3D Neural Network',
    description: 'Glowing artificial intelligence nodes and firing synapses in 3D space.',
    tags: ['3d', 'tech', 'professional', 'ai'],
    featured: true,
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float hash(vec3 p) {
          p = fract(p * 0.3183099 + .1);
          p *= 17.0;
          return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
      }

      float noise(vec3 x) {
          vec3 p = floor(x);
          vec3 f = fract(x);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(mix(hash(p + vec3(0,0,0)), hash(p + vec3(1,0,0)),f.x),
                         mix(hash(p + vec3(0,1,0)), hash(p + vec3(1,1,0)),f.x),f.y),
                     mix(mix(hash(p + vec3(0,0,1)), hash(p + vec3(1,0,1)),f.x),
                         mix(hash(p + vec3(0,1,1)), hash(p + vec3(1,1,1)),f.x),f.y),f.z);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          vec3 ro = vec3(u_time * 0.5, u_time * 0.2, u_time * 0.5);
          vec3 rd = normalize(vec3(uv, 1.0));
          rd.xy *= rot(sin(u_time*0.1)*0.2);
          rd.xz *= rot(u_time*0.1);

          vec3 col = vec3(0.0);
          float t = 0.0;
          
          for(int i=0; i<40; i++) {
              vec3 p = ro + rd * t;
              
              vec3 id = floor(p * 2.0);
              vec3 local = fract(p * 2.0) - 0.5;
              
              float h = hash(id);
              if(h > 0.8) {
                  float dist = length(local);
                  float glow = 0.02 / (dist*dist + 0.01);
                  float pulse = sin(u_time * 5.0 + h * 100.0) * 0.5 + 0.5;
                  col += vec3(0.1, 0.4, 0.9) * glow * pulse;
                  
                  // Synapse connections
                  if(dist < 0.3) {
                      float n = noise(p * 10.0 - u_time * 5.0);
                      col += vec3(0.8, 0.9, 1.0) * n * 0.5;
                  }
              }
              
              t += 0.1;
          }
          
          // Background ambient
          col += vec3(0.02, 0.05, 0.1) * (1.0 - length(uv));
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-steampunk-gear',
    name: 'Pro: 3D Steampunk Mechanism',
    description: 'Raymarched intricate rotating brass gears and cogs.',
    tags: ['3d', 'mechanical', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float gear(vec3 p, float radius, float thickness, float teeth) {
          float d = length(p.xy) - radius;
          float a = atan(p.y, p.x);
          d += sin(a * teeth) * 0.05;
          d = max(d, abs(p.z) - thickness);
          d = max(d, -(length(p.xy) - radius * 0.5)); // Inner hole
          return d;
      }

      float map(vec3 p) {
          vec3 p1 = p;
          p1.xy *= rot(u_time * 1.0);
          float g1 = gear(p1, 1.0, 0.1, 12.0);
          
          vec3 p2 = p - vec3(1.7, 0.0, 0.0);
          p2.xy *= rot(-u_time * 1.0 * (12.0/8.0) + 0.2);
          float g2 = gear(p2, 0.7, 0.1, 8.0);
          
          vec3 p3 = p - vec3(0.0, 1.9, -0.2);
          p3.yz *= rot(u_time * 0.5);
          float g3 = gear(p3.xzy, 0.9, 0.05, 10.0);
          
          return min(min(g1, g2), g3);
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.005, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(1.0, 1.0, 4.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          float t = 0.0;
          for(int i=0; i<80; i++) {
              float d = map(ro+rd*t);
              if(d < 0.001 || t > 10.0) break;
              t += d;
          }
          
          vec3 col = vec3(0.05, 0.04, 0.03);
          if(t < 10.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              vec3 l = normalize(vec3(1.0, 1.0, 1.0));
              float diff = max(dot(n, l), 0.0);
              
              vec3 ref = reflect(rd, n);
              float spec = pow(max(dot(ref, l), 0.0), 16.0);
              
              vec3 brass = vec3(0.8, 0.6, 0.2);
              col = brass * (diff * 0.5 + 0.2);
              col += vec3(1.0, 0.9, 0.5) * spec;
              
              // Edge wear
              float edge = clamp(length(cross(n, l)), 0.0, 1.0);
              col += vec3(0.2, 0.1, 0.0) * edge;
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-retro-synthwave',
    name: 'Pro: 3D Synthwave Grid',
    description: 'Outrun style moving grid with glowing sun and mountains.',
    tags: ['3d', 'synthwave', 'retro', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      float noise(vec2 p) {
          vec2 i = floor(p);
          vec2 f = fract(p);
          f = f*f*(3.0-2.0*f);
          return mix(mix(hash(i+vec2(0,0)), hash(i+vec2(1,0)), f.x),
                     mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 col = vec3(0.0);
          
          if(uv.y > 0.0) {
              // Sun
              float sunDist = length(uv - vec2(0.0, 0.2));
              if(sunDist < 0.3) {
                  float stripes = step(0.5, sin(uv.y * 100.0 - u_time * 5.0)*0.5+0.5 + uv.y*2.0);
                  col = mix(vec3(1.0, 0.8, 0.0), vec3(1.0, 0.2, 0.5), uv.y*3.0) * stripes;
              } else {
                  // Sky gradient
                  col = mix(vec3(0.8, 0.1, 0.5), vec3(0.05, 0.02, 0.2), uv.y*3.0);
                  // Glow
                  col += vec3(1.0, 0.2, 0.5) * (0.01 / (sunDist*sunDist + 0.01));
              }
          } else {
              // Grid Terrain
              vec3 ro = vec3(0.0, 0.5, u_time * 5.0);
              vec3 rd = normalize(vec3(uv.x, uv.y - 0.2, 1.0));
              
              float t = -ro.y / rd.y;
              vec3 p = ro + rd * t;
              
              // Mountain height
              float h = noise(p.xz * 0.1) * 2.0;
              p.y += h;
              
              // Recalculate intersection roughly
              t = -(ro.y - h) / rd.y;
              p = ro + rd * t;
              
              float grid = smoothstep(0.95, 1.0, fract(p.x)) + smoothstep(0.95, 1.0, fract(p.z));
              grid = clamp(grid, 0.0, 1.0);
              
              vec3 gridCol = vec3(0.0, 1.0, 1.0);
              col = mix(vec3(0.05, 0.0, 0.1), gridCol, grid);
              
              // Distance fade
              col = mix(col, vec3(0.8, 0.1, 0.5), smoothstep(10.0, 50.0, t));
          }
          
          // Dither
          vec2 dp = gl_FragCoord.xy;
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
          col += bayer * 0.1;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-dither-terminal',
    name: 'Pro: Dither Terminal',
    description: 'Hacking terminal interface with complex text matrices and extreme retro dithering.',
    tags: ['2d', 'retro', 'terminal', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float rand(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}

      float text(vec2 uv) {
          vec2 g = floor(uv * 40.0);
          float n = rand(g + floor(u_time * 2.0));
          return step(0.5, n) * step(0.2, fract(uv.x*40.0)) * step(0.2, fract(uv.y*40.0));
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          
          // CRT curve
          vec2 nuv = uv * 2.0 - 1.0;
          nuv *= 1.0 + length(nuv)*0.1;
          vec2 crt = nuv * 0.5 + 0.5;
          
          vec3 col = vec3(0.0);
          
          if(crt.x>0.0 && crt.x<1.0 && crt.y>0.0 && crt.y<1.0) {
              float txt = text(crt);
              
              // Matrix rain down
              float rain = fract(crt.y + u_time*0.5 + rand(vec2(floor(crt.x*40.0), 0.0)));
              rain = smoothstep(0.5, 1.0, rain);
              
              vec3 green = vec3(0.1, 1.0, 0.2);
              col = green * txt * rain;
              
              // Glitch block
              if(rand(vec2(floor(u_time*5.0), crt.y)) > 0.95) {
                  col = vec3(1.0);
              }
              
              // Scanlines
              col *= 0.8 + 0.2*sin(crt.y * u_resolution.y);
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-microscopic',
    name: 'Pro: 3D Microscopic Organisms',
    description: 'Depth of field microscopic view of floating organic cells and bacteria.',
    tags: ['3d', 'biology', 'professional', 'organic'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float map(vec3 p) {
          vec3 q = p;
          q.x += sin(u_time*0.5 + p.y)*0.5;
          q.y += cos(u_time*0.4 + p.z)*0.5;
          
          vec3 id = floor(q * 0.5);
          q = fract(q * 0.5) * 2.0 - 1.0;
          
          float d = length(q) - 0.3;
          d += sin(q.x*10.0 + u_time)*0.05;
          d += cos(q.y*10.0 + u_time)*0.05;
          
          return d * 0.5;
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.01, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, u_time);
          vec3 rd = normalize(vec3(uv, 1.0));
          
          vec3 col = vec3(0.1, 0.15, 0.1); // Fluid background
          
          float t = 0.0;
          for(int i=0; i<60; i++) {
              float d = map(ro+rd*t);
              if(d < 0.001) {
                  vec3 p = ro+rd*t;
                  vec3 n = calcNormal(p);
                  
                  // Subsurface scattering fake
                  float sss = smoothstep(0.0, 0.5, map(p + rd * 0.2));
                  
                  vec3 cellCol = vec3(0.2, 0.8, 0.4);
                  col = mix(cellCol * 0.2, cellCol * 1.5, sss);
                  
                  // Fresnel
                  float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 3.0);
                  col += vec3(0.8, 1.0, 0.9) * fresnel;
                  
                  // Depth of field blur fade
                  float blur = smoothstep(2.0, 10.0, t);
                  col = mix(col, vec3(0.1, 0.15, 0.1), blur);
                  break;
              }
              if(t > 10.0) break;
              t += max(0.01, d);
          }
          
          // Vignette
          col *= 1.0 - length(uv)*0.5;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-dyson-sphere',
    name: 'Pro: 3D Dyson Sphere',
    description: 'Enormous megastructure capturing the energy of a central star.',
    tags: ['3d', 'space', 'sci-fi', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float map(vec3 p) {
          // Hexagon panels on sphere
          float r = length(p) - 2.0;
          
          vec3 n = normalize(p);
          float hex = sin(n.x*20.0)*sin(n.y*20.0)*sin(n.z*20.0);
          
          // Cutouts
          r += max(0.0, hex)*0.1;
          
          // Equatorial ring
          float ring = max(length(p.xz) - 2.2, abs(p.y) - 0.1);
          
          return min(r, ring);
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.01, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, 5.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          ro.yz *= rot(-0.3);
          ro.xz *= rot(u_time*0.2);
          rd.yz *= rot(-0.3);
          rd.xz *= rot(u_time*0.2);
          
          float t = 0.0;
          for(int i=0; i<80; i++) {
              float d = map(ro+rd*t);
              if(d < 0.001 || t > 10.0) break;
              t += d;
          }
          
          vec3 col = vec3(0.0);
          
          // Central Star
          float starHit = dot(-ro, rd);
          vec3 pStar = ro + rd * starHit;
          if(length(pStar) < 1.0) {
              col += vec3(1.0, 0.8, 0.2) * 2.0; // Core bright
          } else {
              float dStar = length(cross(rd, -ro))/length(rd);
              col += vec3(1.0, 0.5, 0.1) * (0.1 / (dStar*dStar)); // Glow
          }
          
          if(t < 10.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              // Light from central star (at 0,0,0)
              vec3 l = normalize(-p);
              float diff = max(dot(n, l), 0.0);
              
              vec3 mat = vec3(0.2, 0.25, 0.3); // Metal
              col = mat * diff;
              
              // Outer rim lighting from space
              col += vec3(0.1, 0.2, 0.5) * max(dot(n, normalize(vec3(1,1,1))), 0.0);
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-abstract-glass',
    name: 'Pro: 3D Abstract Glass',
    description: 'Refractive shifting glass sculptures with chromatic dispersion.',
    tags: ['3d', 'glass', 'professional', 'abstract'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float smin(float a, float b, float k) {
          float h = clamp(0.5 + 0.5*(b-a)/k, 0.0, 1.0);
          return mix(b, a, h) - k*h*(1.0-h);
      }

      float map(vec3 p) {
          vec3 p1 = p;
          p1.xy *= rot(u_time);
          float d1 = length(max(abs(p1) - vec3(0.5), 0.0)) - 0.2;
          
          vec3 p2 = p;
          p2.yz *= rot(u_time * 0.8);
          float d2 = length(p2) - 0.6;
          
          return smin(d1, d2, 0.5);
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.001, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      vec3 bg(vec3 rd) {
          return vec3(0.2, 0.1, 0.3) + vec3(0.5, 0.8, 0.9) * max(rd.y, 0.0);
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
          
          vec3 col = bg(rd);
          
          if(t < 10.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              // Refraction
              vec3 refrR = refract(rd, n, 0.9);
              vec3 refrG = refract(rd, n, 0.93);
              vec3 refrB = refract(rd, n, 0.96);
              
              vec3 glass = vec3(
                  bg(refrR).r,
                  bg(refrG).g,
                  bg(refrB).b
              );
              
              // Reflection
              vec3 ref = reflect(rd, n);
              vec3 reflCol = bg(ref);
              
              float fresnel = pow(1.0 - max(dot(n, -rd), 0.0), 4.0);
              
              col = mix(glass, reflCol, fresnel);
              
              // Specular highlight
              col += vec3(1.0) * pow(max(dot(reflect(rd, n), normalize(vec3(1,1,1))), 0.0), 32.0);
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-dither-ascii-cam',
    name: 'Pro: Dither Ascii Art',
    description: 'Renders the environment into mathematical ASCII-like characters using heavy dithering.',
    tags: ['2d', 'ascii', 'dither', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float character(int n, vec2 p) {
          p = floor(p*vec2(4.0, -4.0) + vec2(0.0, 4.0));
          if(p.x<0.0||p.x>3.0||p.y<0.0||p.y>3.0) return 0.0;
          int idx = int(p.x + p.y*4.0);
          // Very simple pseudo-character bitmap extraction
          float val = mod(float(n) / exp2(float(idx)), 2.0);
          return floor(val);
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          
          // Create some underlying complex pattern
          float pattern = sin(uv.x * 20.0 + u_time) * cos(uv.y * 20.0 - u_time);
          pattern += sin(length(uv - 0.5) * 50.0 - u_time * 5.0) * 0.5;
          pattern = pattern * 0.5 + 0.5;
          
          // Pixelate
          vec2 grid = floor(uv * u_resolution.xy / 8.0);
          vec2 subUV = fract(uv * u_resolution.xy / 8.0);
          
          float pxPattern = sin(grid.x * 0.2 + u_time) * cos(grid.y * 0.2 - u_time);
          pxPattern += sin(length(grid/u_resolution.xy*8.0 - 0.5) * 10.0 - u_time) * 0.5;
          pxPattern = clamp(pxPattern * 0.5 + 0.5, 0.0, 1.0);
          
          // Dither pattern
          float bayer = mod(grid.x * 3.0 + grid.y * 5.0, 8.0) / 8.0;
          float dithered = step(bayer, pxPattern);
          
          // Select character based on intensity
          int charCode = 0;
          if(dithered > 0.8) charCode = 62223; // Block
          else if(dithered > 0.5) charCode = 23213; // Cross
          else if(dithered > 0.2) charCode = 1040;  // Dot
          else charCode = 0; // Space
          
          float txt = character(charCode, subUV);
          
          vec3 col = vec3(0.0, 0.8, 0.2) * txt;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-geometric-tesseract',
    name: 'Pro: 3D Tesseract Fold',
    description: '4D hypercube projection folding into 3D space with glowing edges.',
    tags: ['3d', 'geometry', '4d', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float boxEdge(vec3 p, vec3 b, float e) {
          vec3 q = abs(p) - b;
          float d1 = length(max(vec3(q.x, q.y, 0.0), 0.0)) + min(max(q.x, q.y), 0.0) - e;
          float d2 = length(max(vec3(q.x, 0.0, q.z), 0.0)) + min(max(q.x, q.z), 0.0) - e;
          float d3 = length(max(vec3(0.0, q.y, q.z), 0.0)) + min(max(q.y, q.z), 0.0) - e;
          return min(min(d1, d2), d3);
      }

      float map(vec3 p) {
          vec3 p1 = p;
          p1.xy *= rot(u_time * 0.5);
          p1.yz *= rot(u_time * 0.3);
          
          float outer = boxEdge(p1, vec3(1.0), 0.05);
          
          float scale = 0.5 + 0.3 * sin(u_time);
          float inner = boxEdge(p1, vec3(scale), 0.05);
          
          // Connecting lines (approximated as distance to diagonals)
          float diag = length(cross(normalize(p1), vec3(1.0, 1.0, 1.0))) * length(p1) - 0.02;
          
          return min(min(outer, inner), diag);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, 4.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          float t = 0.0;
          float dMin = 100.0;
          
          for(int i=0; i<60; i++) {
              float d = map(ro+rd*t);
              dMin = min(dMin, d);
              if(d < 0.001 || t > 10.0) break;
              t += d;
          }
          
          vec3 col = vec3(0.0);
          
          // Glow based on min distance to edges
          float glow = 0.02 / (dMin*dMin + 0.001);
          col += vec3(0.2, 0.5, 1.0) * glow;
          
          if(t < 10.0) {
              col += vec3(1.0); // Solid core
          }
          
          // Matrix background
          col += vec3(0.0, 0.1, 0.2) * (1.0 - length(uv));
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-fluid-caustics',
    name: 'Pro: 3D Fluid Caustics',
    description: 'Looking up through liquid surface with refractive caustic patterns.',
    tags: ['3d', 'fluid', 'professional', 'nature'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) { return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p);
          f = f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x), mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          // Looking up from underwater
          vec3 rd = normalize(vec3(uv.x, 1.0, uv.y));
          
          // Surface ripples
          vec2 p = rd.xz / rd.y; // Intersect with y=1 plane
          
          float n = noise(p * 2.0 + u_time) + noise(p * 5.0 - u_time*1.5)*0.5;
          vec3 normal = normalize(vec3(
              noise(p*2.0 + vec2(0.01,0) + u_time) - n,
              1.0,
              noise(p*2.0 + vec2(0,0.01) + u_time) - n
          ));
          
          // Sun direction
          vec3 sun = normalize(vec3(sin(u_time*0.2), 1.0, cos(u_time*0.2)));
          
          // Caustics projection
          float caustics = max(dot(normal, sun), 0.0);
          caustics = pow(caustics, 10.0) * 2.0;
          
          // Sky color
          vec3 sky = mix(vec3(0.0, 0.4, 0.8), vec3(0.6, 0.8, 1.0), normal.y);
          
          vec3 col = sky + vec3(1.0, 0.9, 0.6) * caustics;
          
          // Depth fog
          col = mix(col, vec3(0.0, 0.2, 0.4), length(uv)*0.8);
          
          // Chromatic dispersion at edges
          col.r += noise(p * 5.0 + u_time + vec2(0.1, 0.0)) * 0.1 * length(uv);
          col.b -= noise(p * 5.0 + u_time + vec2(-0.1, 0.0)) * 0.1 * length(uv);
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  }
];
