import type { DitherShaderDef } from './ditherShaders';

export const shaderPackPro5: DitherShaderDef[] = [
  {
    id: 'pro-3d-burning-paper',
    name: 'Pro: 3D Burning Paper',
    description: 'Paper edge burning away with embers and ash.',
    tags: ['3d', 'fire', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p);
          f = f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      float fbm(vec2 p) {
          float v = 0.0;
          float a = 0.5;
          for(int i=0; i<4; i++) { v += a*noise(p); p *= 2.0; a *= 0.5; }
          return v;
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          uv.y = 1.0 - uv.y;
          
          // Burn edge position
          float burnLine = mod(u_time * 0.1, 1.5) - 0.25;
          float burnNoise = fbm(uv * 10.0) * 0.15;
          float burn = uv.y - burnLine - burnNoise;
          
          vec3 col = vec3(0.9, 0.85, 0.75); // Paper color
          
          // Text/lines on paper
          float lines = step(0.9, sin(uv.y * 50.0));
          col -= vec3(0.6, 0.6, 0.7) * lines * 0.1;
          
          if(burn < 0.0) {
              // Burned away
              col = vec3(0.02, 0.02, 0.03);
          } else if(burn < 0.02) {
              // Ember edge
              float ember = 1.0 - burn / 0.02;
              ember *= noise(uv * 100.0 + u_time * 10.0);
              col = mix(vec3(1.0, 0.3, 0.0), vec3(1.0, 0.8, 0.0), ember);
          } else if(burn < 0.05) {
              // Charred edge
              float charr = (burn - 0.02) / 0.03;
              col = mix(vec3(0.1, 0.05, 0.0), col, charr);
          }
          
          // Floating embers
          for(float i=0.0; i<10.0; i++) {
              vec2 emberPos = vec2(
                  hash(vec2(i, 0.0)),
                  mod(burnLine + hash(vec2(i, 1.0)) * 0.3 + u_time * 0.2 * hash(vec2(i, 2.0)), 1.5) - 0.25
              );
              float d = length(uv - emberPos);
              if(d < 0.01 && emberPos.y > burnLine) {
                  col += vec3(1.0, 0.5, 0.0) * (0.01 - d) * 50.0;
              }
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-frozen-lake',
    name: 'Pro: 3D Frozen Lake',
    description: 'Ice surface with cracks, snow, and depth effects.',
    tags: ['3d', 'nature', 'winter', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p);
          f = f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }

      float voronoi(vec2 p) {
          vec2 g = floor(p);
          vec2 f = fract(p);
          float d = 1.0;
          for(int y=-1; y<=1; y++) {
              for(int x=-1; x<=1; x++) {
                  vec2 o = vec2(float(x), float(y));
                  vec2 r = o + hash(g + o) - f;
                  d = min(d, dot(r, r));
              }
          }
          return sqrt(d);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          // Ice surface looking down
          vec3 col = vec3(0.7, 0.85, 0.95); // Ice base color
          
          // Cracks using Voronoi
          float cracks = voronoi(uv * 5.0);
          float crackLines = smoothstep(0.0, 0.05, cracks);
          col = mix(vec3(0.9, 0.95, 1.0), col, crackLines);
          
          // Depth variation
          float depth = noise(uv * 3.0) * 0.3;
          col = mix(col, vec3(0.3, 0.5, 0.7), depth);
          
          // Bubbles trapped in ice
          for(float i=0.0; i<15.0; i++) {
              vec2 bubblePos = vec2(hash(vec2(i, 0.0)) - 0.5, hash(vec2(i, 1.0)) - 0.5) * 1.5;
              float bubbleR = hash(vec2(i, 2.0)) * 0.03 + 0.01;
              float d = length(uv - bubblePos) - bubbleR;
              if(d < 0.0) {
                  col = mix(col, vec3(0.95, 0.98, 1.0), 0.5);
              }
          }
          
          // Snow patches
          float snow = smoothstep(0.6, 0.8, noise(uv * 8.0 + 100.0));
          col = mix(col, vec3(0.98, 0.98, 1.0), snow * 0.7);
          
          // Subtle reflection/shine
          float shine = max(0.0, dot(normalize(vec3(uv, 1.0)), normalize(vec3(0.3, 0.3, 1.0))));
          col += vec3(0.1) * pow(shine, 8.0);
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-tornado-vortex',
    name: 'Pro: 3D Tornado Vortex',
    description: 'Spinning funnel cloud with debris and turbulence.',
    tags: ['3d', 'weather', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
      float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, 5.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          vec3 col = vec3(0.3, 0.35, 0.4); // Stormy sky
          
          // Funnel shape
          float t = 0.0;
          float dens = 0.0;
          
          for(int i=0; i<40; i++) {
              vec3 p = ro + rd * t;
              
              // Funnel gets wider at bottom
              float radius = 0.2 + (p.y + 1.0) * 0.3;
              
              // Spiral rotation
              float a = atan(p.z, p.x) - u_time * 3.0 - p.y * 2.0;
              p.xz *= rot(a);
              
              float d = length(p.xz) - radius;
              
              if(d < 0.5 && p.y > -1.5 && p.y < 1.5) {
                  float funnelDens = (0.5 - d) / 0.5;
                  funnelDens *= hash(p * 10.0 + u_time);
                  dens += funnelDens * 0.05;
                  
                  vec3 funnelCol = vec3(0.4, 0.35, 0.3);
                  col = mix(col, funnelCol, funnelDens * 0.1);
              }
              
              t += 0.1;
              if(t > 10.0) break;
          }
          
          // Debris particles
          for(float i=0.0; i<20.0; i++) {
              float angle = i * 0.314 + u_time * 3.0;
              float height = mod(i * 0.1 + u_time, 3.0) - 1.5;
              float radius = 0.3 + height * 0.2;
              
              vec3 debrisPos = vec3(cos(angle) * radius, height, sin(angle) * radius);
              
              vec3 toDebris = debrisPos - ro;
              float tt = dot(toDebris, rd);
              vec3 closest = ro + rd * tt;
              float dist = length(closest - debrisPos);
              
              if(tt > 0.0 && dist < 0.05) {
                  col += vec3(0.3, 0.25, 0.2) * (0.05 - dist) * 10.0;
              }
          }
          
          // Ground
          if(rd.y < -0.1) {
              float groundT = (-1.5 - ro.y) / rd.y;
              vec3 groundP = ro + rd * groundT;
              col = mix(col, vec3(0.2, 0.25, 0.15), exp(-groundT * 0.1));
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-quantum-field',
    name: 'Pro: 3D Quantum Field',
    description: 'Probability wave functions visualized with interference patterns.',
    tags: ['3d', 'physics', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 col = vec3(0.0);
          
          // Multiple wave sources
          float wave = 0.0;
          for(float i=0.0; i<4.0; i++) {
              float angle = i * 1.57 + u_time * 0.2;
              vec2 source = vec2(cos(angle), sin(angle)) * 0.5;
              float d = length(uv - source);
              wave += sin(d * 30.0 - u_time * 5.0) / (d + 0.5);
          }
          
          // Normalize and color
          wave = wave * 0.1;
          
          // Probability density (wave squared)
          float prob = wave * wave;
          
          // Interference visualization
          vec3 positive = vec3(0.2, 0.5, 1.0);
          vec3 negative = vec3(1.0, 0.3, 0.2);
          
          if(wave > 0.0) {
              col = positive * wave;
          } else {
              col = negative * (-wave);
          }
          
          // Add probability density overlay
          col += vec3(1.0, 1.0, 0.5) * prob * 2.0;
          
          // Grid lines
          vec2 grid = abs(fract(uv * 10.0) - 0.5);
          float line = min(grid.x, grid.y);
          col += vec3(0.1) * smoothstep(0.02, 0.0, line);
          
          // Dither
          vec2 dp = gl_FragCoord.xy;
          float bayer = mod(dp.x * 3.0 + dp.y * 5.0, 8.0) / 8.0;
          col += bayer * 0.05;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-data-visualization',
    name: 'Pro: 3D Data Bars',
    description: 'Animated 3D bar chart with glowing data points.',
    tags: ['3d', 'data', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float box(vec3 p, vec3 b) {
          vec3 q = abs(p) - b;
          return length(max(q,0.0)) + min(max(q.x,max(q.y,q.z)),0.0);
      }

      float map(vec3 p) {
          float d = p.y + 0.5; // Ground
          
          vec3 q = p;
          vec2 id = floor(q.xz / 0.4);
          q.xz = mod(q.xz, 0.4) - 0.2;
          
          float h = hash(id) * 0.5 + 0.2;
          h *= 0.5 + 0.5 * sin(u_time * 2.0 + id.x + id.y * 0.5);
          
          float bar = box(q - vec3(0, h/2.0 - 0.5, 0), vec3(0.12, h/2.0, 0.12));
          
          d = min(d, bar);
          return d;
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.01, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(sin(u_time*0.3)*2.0, 1.5, cos(u_time*0.3)*2.0);
          vec3 ta = vec3(0.0, 0.0, 0.0);
          vec3 fwd = normalize(ta - ro);
          vec3 right = normalize(cross(vec3(0,1,0), fwd));
          vec3 up = cross(fwd, right);
          vec3 rd = normalize(uv.x*right + uv.y*up + 1.5*fwd);
          
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
              
              if(p.y > -0.49) { // Bar
                  vec2 id = floor(p.xz / 0.4);
                  vec3 barCol = 0.5 + 0.5 * cos(id.x + id.y + vec3(0, 2, 4));
                  
                  float diff = max(dot(n, normalize(vec3(1,1,1))), 0.0);
                  col = barCol * (diff * 0.6 + 0.3);
                  
                  // Top glow
                  if(n.y > 0.9) {
                      col += vec3(0.3);
                  }
              } else { // Ground
                  float checker = mod(floor(p.x * 5.0) + floor(p.z * 5.0), 2.0);
                  col = mix(vec3(0.15), vec3(0.2), checker);
              }
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-holographic-terrain',
    name: 'Pro: 3D Holographic Terrain',
    description: 'Wireframe holographic terrain map with scanning effect.',
    tags: ['3d', 'hologram', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p);
          f = f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 col = vec3(0.0, 0.02, 0.05);
          
          // Project to terrain plane
          vec3 ro = vec3(0.0, 2.0, -1.0);
          vec3 rd = normalize(vec3(uv.x, uv.y - 0.3, 1.0));
          
          float t = -ro.y / rd.y;
          
          if(t > 0.0 && rd.y < 0.0) {
              vec3 p = ro + rd * t;
              
              // Height at this point
              float h = noise(p.xz * 0.5) * 2.0;
              h += noise(p.xz) * 0.5;
              
              // Grid lines
              vec2 grid = abs(fract(p.xz) - 0.5);
              float line = min(grid.x, grid.y);
              float wireframe = smoothstep(0.02, 0.0, line);
              
              // Height color
              vec3 terrainCol = mix(vec3(0.0, 0.3, 0.1), vec3(0.0, 1.0, 0.5), h * 0.5);
              
              col += terrainCol * wireframe * 0.8;
              
              // Scanning line
              float scan = smoothstep(0.1, 0.0, abs(p.z - mod(u_time * 2.0, 10.0) + 5.0));
              col += vec3(0.0, 1.0, 0.8) * scan;
              
              // Depth fade
              col *= exp(-t * 0.1);
          }
          
          // HUD elements
          float hudR = length(uv);
          if(abs(hudR - 0.4) < 0.005) {
              col += vec3(0.0, 0.5, 0.3);
          }
          
          // Corner brackets
          vec2 corner = abs(uv) - vec2(0.35);
          if(max(corner.x, corner.y) > 0.0 && min(abs(corner.x), abs(corner.y)) < 0.01) {
              if(max(abs(corner.x), abs(corner.y)) < 0.05) {
                  col += vec3(0.0, 0.8, 0.5);
              }
          }
          
          // Scanline effect
          col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 2.0);
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-neon-city-fly',
    name: 'Pro: 3D Neon City Flyover',
    description: 'Flying over a procedural neon city at night.',
    tags: ['3d', 'city', 'neon', 'professional'],
    featured: true,
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 col = vec3(0.02, 0.0, 0.05);
          
          // Flying camera
          vec3 ro = vec3(0.0, 3.0, u_time * 5.0);
          vec3 rd = normalize(vec3(uv.x, uv.y - 0.2, 1.0));
          
          // Ground plane
          float t = -ro.y / rd.y;
          
          if(t > 0.0 && rd.y < 0.0) {
              vec3 p = ro + rd * t;
              
              // City grid
              vec2 block = floor(p.xz / 2.0);
              vec2 local = fract(p.xz / 2.0);
              
              // Streets
              float street = step(0.1, local.x) * step(local.x, 0.9);
              street *= step(0.1, local.y) * step(local.y, 0.9);
              
              if(street > 0.5) {
                  // Building
                  float h = hash(block) * 3.0 + 1.0;
                  float bh = h / 10.0;
                  
                  vec3 buildingCol = vec3(0.1);
                  
                  // Windows
                  float windowX = step(0.3, fract(local.x * 10.0));
                  float windowY = step(0.3, fract(bh * 20.0));
                  float lit = step(0.5, hash(block + floor(local * 10.0)));
                  
                  vec3 windowCol = mix(vec3(1.0, 0.8, 0.3), vec3(0.3, 0.5, 1.0), hash(block));
                  buildingCol += windowCol * windowX * windowY * lit * 0.5;
                  
                  col = buildingCol;
              } else {
                  // Street with lines
                  float lines = smoothstep(0.48, 0.5, local.x) + smoothstep(0.52, 0.5, local.x);
                  lines += smoothstep(0.48, 0.5, local.y) + smoothstep(0.52, 0.5, local.y);
                  col = vec3(0.05) + vec3(1.0, 0.8, 0.0) * lines * 0.3;
              }
              
              // Neon signs on some buildings
              if(hash(block + 100.0) > 0.7 && street > 0.5) {
                  vec3 neonCol = 0.5 + 0.5 * cos(hash(block) * 6.28 + vec3(0, 2, 4));
                  col += neonCol * 0.3;
              }
              
              // Distance fade
              col = mix(col, vec3(0.02, 0.0, 0.05), 1.0 - exp(-t * 0.02));
          }
          
          // Stars
          vec2 sg = floor(uv * 100.0);
          col += vec3(step(0.99, hash(sg))) * step(0.0, uv.y);
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-dna-helix',
    name: 'Pro: 3D DNA Double Helix',
    description: 'Rotating DNA strand with base pairs and phosphate backbone.',
    tags: ['3d', 'biology', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, 4.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          vec3 col = vec3(0.05, 0.05, 0.1);
          
          // DNA strands
          for(float i=0.0; i<50.0; i++) {
              float y = i * 0.15 - 3.5;
              float a = y * 2.0 + u_time;
              
              // Two backbone strands
              vec3 p1 = vec3(cos(a) * 0.5, y, sin(a) * 0.5);
              vec3 p2 = vec3(cos(a + 3.14159) * 0.5, y, sin(a + 3.14159) * 0.5);
              
              // Project onto screen
              for(int s=0; s<2; s++) {
                  vec3 sp = s == 0 ? p1 : p2;
                  float t = dot(sp - ro, rd);
                  vec3 closest = ro + rd * t;
                  float dist = length(closest - sp);
                  
                  if(t > 0.0) {
                      // Backbone spheres
                      float glow = 0.01 / (dist * dist + 0.001);
                      col += vec3(0.2, 0.5, 0.9) * glow * 0.3;
                      
                      if(dist < 0.08) {
                          col += vec3(0.3, 0.6, 1.0);
                      }
                  }
              }
              
              // Base pair connection
              if(mod(i, 2.0) < 1.0) {
                  vec3 mid = (p1 + p2) * 0.5;
                  float t = dot(mid - ro, rd);
                  vec3 closest = ro + rd * t;
                  
                  // Check distance to line segment
                  vec3 ab = p2 - p1;
                  vec3 ap = closest - p1;
                  float h = clamp(dot(ap, ab) / dot(ab, ab), 0.0, 1.0);
                  float lineDist = length(closest - (p1 + ab * h));
                  
                  if(t > 0.0 && lineDist < 0.03) {
                      vec3 baseCol = mod(i, 4.0) < 2.0 ? vec3(1.0, 0.3, 0.3) : vec3(0.3, 1.0, 0.3);
                      col += baseCol * 0.5;
                  }
              }
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-ocean-caustics',
    name: 'Pro: 3D Ocean Caustics',
    description: 'Looking up from underwater at dancing caustic light patterns.',
    tags: ['3d', 'water', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      float noise(vec2 p) {
          vec2 i = floor(p); vec2 f = fract(p);
          f = f*f*(3.0-2.0*f);
          return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }

      float caustic(vec2 p, float time) {
          float c = 0.0;
          for(float i=1.0; i<4.0; i++) {
              vec2 q = p * i + time * vec2(0.3, 0.2) * i;
              c += noise(q) / i;
          }
          return c;
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          
          // Deep blue water base
          vec3 col = mix(vec3(0.0, 0.15, 0.3), vec3(0.0, 0.3, 0.5), uv.y);
          
          // Caustic patterns (multiple layers)
          float c1 = caustic(uv * 5.0, u_time);
          float c2 = caustic(uv * 7.0 + 10.0, u_time * 1.3);
          float c3 = caustic(uv * 3.0 + 20.0, u_time * 0.7);
          
          float caustics = (c1 * c2 + c2 * c3) * 2.0;
          caustics = pow(caustics, 2.0);
          
          // Add caustic light
          col += vec3(0.4, 0.6, 0.3) * caustics * (1.0 - uv.y * 0.5);
          
          // Sun disc above
          vec2 sunPos = vec2(0.5 + sin(u_time * 0.2) * 0.1, 0.8);
          float sunDist = length(uv - sunPos);
          float sun = 0.05 / (sunDist + 0.01);
          col += vec3(1.0, 0.95, 0.8) * sun * 0.3;
          
          // God rays
          float rays = 0.0;
          for(float i=0.0; i<8.0; i++) {
              float angle = i * 0.785 + sin(u_time * 0.5) * 0.2;
              vec2 rayDir = vec2(cos(angle), sin(angle));
              float ray = max(0.0, dot(normalize(uv - sunPos), rayDir));
              ray = pow(ray, 20.0) * (1.0 - sunDist);
              rays += ray;
          }
          col += vec3(0.5, 0.7, 0.3) * rays * 0.1;
          
          // Particles/plankton
          for(float i=0.0; i<20.0; i++) {
              vec2 pPos = vec2(hash(vec2(i, 0.0)), hash(vec2(i, 1.0)));
              pPos.y = mod(pPos.y + u_time * 0.05 * hash(vec2(i, 2.0)), 1.0);
              float pDist = length(uv - pPos);
              col += vec3(0.5, 0.8, 0.5) * (0.002 / (pDist + 0.001));
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-dither-blueprint',
    name: 'Pro: Dither Blueprint',
    description: 'Technical blueprint drawing with cross-hatching and annotations.',
    tags: ['2d', 'technical', 'dither', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          uv.x *= u_resolution.x / u_resolution.y;
          
          // Blueprint blue background
          vec3 col = vec3(0.1, 0.15, 0.3);
          
          // Grid
          vec2 grid = fract(uv * 20.0);
          float line = min(
              smoothstep(0.02, 0.0, grid.x),
              smoothstep(0.02, 0.0, grid.y)
          );
          col += vec3(0.2, 0.3, 0.5) * line;
          
          // Main drawing - gear shape
          vec2 center = vec2(0.5 * u_resolution.x / u_resolution.y, 0.5);
          vec2 cuv = uv - center;
          float r = length(cuv);
          float a = atan(cuv.y, cuv.x);
          
          // Outer gear
          float gear = abs(r - 0.25 - sin(a * 12.0) * 0.03) - 0.02;
          float gearLine = smoothstep(0.01, 0.0, abs(gear));
          col += vec3(0.9, 0.95, 1.0) * gearLine;
          
          // Inner circle
          float inner = abs(r - 0.15) - 0.01;
          col += vec3(0.9, 0.95, 1.0) * smoothstep(0.01, 0.0, abs(inner));
          
          // Center hole
          float hole = abs(r - 0.05) - 0.01;
          col += vec3(0.9, 0.95, 1.0) * smoothstep(0.01, 0.0, abs(hole));
          
          // Cross-hatching for filled areas
          if(r > 0.05 && r < 0.15) {
              float hatch = mod(cuv.x + cuv.y, 0.02);
              col += vec3(0.3, 0.4, 0.6) * step(0.01, hatch);
          }
          
          // Dimension lines
          float dimLine = smoothstep(0.005, 0.0, abs(uv.y - 0.2));
          dimLine *= step(0.2, uv.x) * step(uv.x, 0.8);
          col += vec3(0.9, 0.95, 1.0) * dimLine;
          
          // Arrow heads
          vec2 arrow1 = uv - vec2(0.2, 0.2);
          float arrowDist1 = max(abs(arrow1.x) + abs(arrow1.y) * 2.0, 0.0);
          col += vec3(0.9, 0.95, 1.0) * smoothstep(0.02, 0.01, arrowDist1);
          
          // Annotation text placeholder (dots)
          for(float i=0.0; i<20.0; i++) {
              vec2 textPos = vec2(0.7 + i * 0.01, 0.8);
              float textDot = length(uv - textPos);
              col += vec3(0.9, 0.95, 1.0) * smoothstep(0.005, 0.003, textDot) * step(hash(vec2(i, 0.0)), 0.7);
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  }
];
