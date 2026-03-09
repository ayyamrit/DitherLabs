import type { DitherShaderDef } from './ditherShaders';

export const shaderPackPro6: DitherShaderDef[] = [
  {
    id: 'pro-3d-ink-diffusion',
    name: 'Pro: 3D Ink Diffusion',
    description: 'Ink drops diffusing through water with organic tendrils.',
    tags: ['3d', 'organic', 'professional'],
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
          float v=0.0,a=0.5;
          for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}
          return v;
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 col = vec3(0.9, 0.95, 1.0); // Water
          
          // Multiple ink drops
          for(float i=0.0; i<3.0; i++) {
              vec2 dropPos = vec2(sin(i*2.0+u_time*0.3), cos(i*2.5+u_time*0.2)) * 0.2;
              vec2 duv = uv - dropPos;
              
              float r = length(duv);
              float a = atan(duv.y, duv.x);
              
              // Organic tendrils using FBM
              float tendril = fbm(vec2(a * 5.0, r * 10.0 - u_time * 2.0));
              float spread = smoothstep(0.4 + tendril * 0.2, 0.0, r);
              spread *= smoothstep(0.0, 0.05, r); // Hollow center
              
              vec3 inkCol = i < 1.0 ? vec3(0.1, 0.1, 0.4) : 
                           i < 2.0 ? vec3(0.4, 0.1, 0.3) : 
                                     vec3(0.1, 0.3, 0.2);
              
              col = mix(col, inkCol, spread * 0.8);
          }
          
          // Subtle paper texture
          float texture = noise(uv * 100.0) * 0.05;
          col += texture;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-plasma-globe',
    name: 'Pro: 3D Plasma Globe',
    description: 'Electrical plasma tendrils inside a glass sphere.',
    tags: ['3d', 'electric', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(float n) { return fract(sin(n)*43758.5453); }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          float r = length(uv);
          float a = atan(uv.y, uv.x);
          
          vec3 col = vec3(0.02, 0.02, 0.05);
          
          // Glass sphere
          float sphereR = 0.45;
          
          if(r < sphereR) {
              // Center electrode glow
              float core = 0.05 / (r + 0.02);
              col += vec3(0.3, 0.3, 0.5) * core;
              
              // Plasma tendrils
              for(float i=0.0; i<8.0; i++) {
                  float baseAngle = i * 0.785 + u_time * 0.5;
                  float wobble = sin(u_time * 3.0 + i * 2.0) * 0.3;
                  float tendrilAngle = baseAngle + wobble;
                  
                  float angleDiff = abs(mod(a - tendrilAngle + 3.14159, 6.28318) - 3.14159);
                  
                  // Tendril follows curved path to edge
                  float targetR = sphereR * 0.95;
                  float tendrilR = r / targetR;
                  
                  // Width decreases toward edge
                  float width = (1.0 - tendrilR) * 0.3 + 0.05;
                  
                  if(angleDiff < width && r > 0.05) {
                      float brightness = (1.0 - angleDiff / width);
                      brightness *= pow(tendrilR, 0.5);
                      
                      // Flickering
                      brightness *= 0.7 + 0.3 * hash(floor(u_time * 20.0) + i);
                      
                      vec3 plasmaCol = mix(vec3(0.8, 0.3, 1.0), vec3(0.3, 0.5, 1.0), tendrilR);
                      col += plasmaCol * brightness * 0.5;
                  }
              }
          }
          
          // Glass sphere edge
          float edge = abs(r - sphereR);
          col += vec3(0.3, 0.3, 0.4) * smoothstep(0.02, 0.0, edge);
          
          // Reflection
          float ref = smoothstep(sphereR, sphereR - 0.1, r);
          ref *= smoothstep(0.0, 0.2, uv.x + uv.y);
          col += vec3(0.2) * ref * step(r, sphereR);
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-sierpinski',
    name: 'Pro: 3D Sierpinski Pyramid',
    description: 'Infinitely recursive Sierpinski tetrahedron fractal.',
    tags: ['3d', 'fractal', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float sierpinski(vec3 p) {
          float scale = 1.0;
          float dist = 0.0;
          
          for(int i=0; i<8; i++) {
              // Fold space
              if(p.x + p.y < 0.0) p.xy = -p.yx;
              if(p.x + p.z < 0.0) p.xz = -p.zx;
              if(p.y + p.z < 0.0) p.yz = -p.zy;
              
              // Scale and translate
              p = p * 2.0 - 1.0;
              scale *= 2.0;
          }
          
          return length(p) / scale - 0.01;
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.001, 0.0);
          return normalize(vec3(
              sierpinski(p+e.xyy)-sierpinski(p-e.xyy),
              sierpinski(p+e.yxy)-sierpinski(p-e.yxy),
              sierpinski(p+e.yyx)-sierpinski(p-e.yyx)
          ));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(2.0 * sin(u_time * 0.3), 1.0, 2.0 * cos(u_time * 0.3));
          vec3 ta = vec3(0.0);
          vec3 fwd = normalize(ta - ro);
          vec3 right = normalize(cross(vec3(0,1,0), fwd));
          vec3 up = cross(fwd, right);
          vec3 rd = normalize(uv.x*right + uv.y*up + 1.5*fwd);
          
          float t = 0.0;
          for(int i=0; i<100; i++) {
              float d = sierpinski(ro+rd*t);
              if(d < 0.0005 || t > 10.0) break;
              t += d;
          }
          
          vec3 col = vec3(0.1, 0.1, 0.15);
          
          if(t < 10.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              float diff = max(dot(n, normalize(vec3(1,2,1))), 0.0);
              float ao = 1.0 - float(t) * 0.1;
              
              col = vec3(0.3, 0.5, 0.8) * diff * ao;
              col += vec3(0.1, 0.2, 0.3) * (1.0 - diff);
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-molten-core',
    name: 'Pro: 3D Molten Core',
    description: 'Planetary core with convection currents and magnetic field lines.',
    tags: ['3d', 'geology', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }
      float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f*f*(3.0-2.0*f);
          return mix(mix(mix(hash(i),hash(i+vec3(1,0,0)),f.x),
                         mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),
                     mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),
                         mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, 3.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          // Sphere intersection
          float b = dot(ro, rd);
          float c = dot(ro, ro) - 1.0;
          float h = b*b - c;
          
          vec3 col = vec3(0.02, 0.01, 0.0);
          
          if(h > 0.0) {
              float t = -b - sqrt(h);
              vec3 p = ro + rd * t;
              vec3 n = normalize(p);
              
              // Spherical coordinates
              float phi = atan(n.z, n.x) + u_time * 0.2;
              float theta = acos(n.y);
              
              // Convection cells
              float cells = noise(vec3(phi * 3.0, theta * 2.0, u_time * 0.5));
              cells = pow(cells, 0.5);
              
              // Temperature gradient
              float temp = 0.5 + cells * 0.5;
              temp += sin(theta * 5.0 + phi * 3.0 + u_time) * 0.1;
              
              // Color based on temperature
              vec3 hotCol = vec3(1.0, 0.9, 0.3);
              vec3 coolCol = vec3(1.0, 0.2, 0.0);
              col = mix(coolCol, hotCol, temp);
              
              // Convection patterns (darker lines)
              float lines = smoothstep(0.4, 0.5, cells);
              col *= 0.7 + 0.3 * lines;
              
              // Inner glow
              float rim = pow(1.0 - max(dot(n, -rd), 0.0), 2.0);
              col += vec3(1.0, 0.5, 0.0) * rim * 0.5;
          }
          
          // Magnetic field lines (around sphere)
          float a = atan(uv.y, uv.x);
          float r = length(uv);
          if(r > 1.0 && r < 2.0) {
              float field = sin(a * 4.0 - r * 5.0 + u_time);
              field = smoothstep(0.9, 1.0, abs(field));
              col += vec3(0.3, 0.5, 0.8) * field * 0.1 * (2.0 - r);
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-glitch-portal',
    name: 'Pro: 3D Glitch Portal',
    description: 'Unstable interdimensional portal with digital artifacts.',
    tags: ['3d', 'glitch', 'portal', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          // Glitch offset
          float glitchTime = floor(u_time * 10.0);
          float glitch = step(0.95, hash(vec2(glitchTime, 0.0)));
          uv.x += glitch * (hash(vec2(glitchTime, uv.y * 10.0)) - 0.5) * 0.2;
          
          float r = length(uv);
          float a = atan(uv.y, uv.x);
          
          vec3 col = vec3(0.0);
          
          // Portal ring
          float ring = abs(r - 0.4) - 0.05;
          float ringGlow = 0.02 / (abs(ring) + 0.01);
          
          // Distorted ring
          float distort = sin(a * 10.0 + u_time * 5.0) * 0.05;
          distort += sin(a * 20.0 - u_time * 8.0) * 0.02;
          float distRing = abs(r - 0.4 - distort) - 0.02;
          
          // Color cycling
          vec3 portalCol = 0.5 + 0.5 * cos(u_time * 2.0 + a + vec3(0, 2, 4));
          col += portalCol * ringGlow * 0.3;
          
          // Inside portal
          if(r < 0.35) {
              // Tunnel effect
              float depth = 1.0 / (r + 0.1);
              float tunnelA = a + depth * 0.5 + u_time;
              
              // Digital noise inside
              vec2 grid = vec2(tunnelA * 10.0, depth * 5.0);
              float noise = hash(floor(grid + u_time * 3.0));
              
              // RGB shift
              col.r += noise * step(0.7, noise) * 0.5;
              col.g += hash(floor(grid + vec2(1,0) + u_time * 3.0)) * step(0.7, noise) * 0.5;
              col.b += hash(floor(grid + vec2(0,1) + u_time * 3.0)) * step(0.7, noise) * 0.5;
              
              // Scan lines
              col *= 0.8 + 0.2 * sin(depth * 50.0);
          }
          
          // Glitch blocks
          if(glitch > 0.5) {
              vec2 blockUV = floor(uv * 20.0);
              if(hash(blockUV + glitchTime) > 0.8) {
                  col = vec3(hash(blockUV), hash(blockUV+1.0), hash(blockUV+2.0));
              }
          }
          
          // Chromatic aberration
          float ca = 0.02 * glitch;
          col.r = max(col.r, length(uv + vec2(ca, 0.0)) < 0.35 ? 0.5 : 0.0);
          col.b = max(col.b, length(uv - vec2(ca, 0.0)) < 0.35 ? 0.5 : 0.0);
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-stained-glass',
    name: 'Pro: 3D Stained Glass',
    description: 'Cathedral stained glass window with light streaming through.',
    tags: ['3d', 'art', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }

      float voronoi(vec2 p) {
          vec2 g = floor(p);
          vec2 f = fract(p);
          float d = 1.0;
          for(int y=-1; y<=1; y++) {
              for(int x=-1; x<=1; x++) {
                  vec2 o = vec2(float(x), float(y));
                  vec2 r = o + hash(g + o) * 0.8 - f;
                  d = min(d, dot(r, r));
              }
          }
          return sqrt(d);
      }

      vec2 voronoiID(vec2 p) {
          vec2 g = floor(p);
          vec2 f = fract(p);
          float d = 1.0;
          vec2 id = vec2(0.0);
          for(int y=-1; y<=1; y++) {
              for(int x=-1; x<=1; x++) {
                  vec2 o = vec2(float(x), float(y));
                  vec2 cell = g + o;
                  vec2 r = o + hash(cell) * 0.8 - f;
                  float dd = dot(r, r);
                  if(dd < d) {
                      d = dd;
                      id = cell;
                  }
              }
          }
          return id;
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          uv.x *= u_resolution.x / u_resolution.y;
          
          // Window arch shape
          vec2 center = vec2(u_resolution.x / u_resolution.y * 0.5, 0.5);
          vec2 cuv = uv - center;
          float archDist = length(vec2(cuv.x, max(0.0, cuv.y - 0.1))) - 0.35;
          archDist = max(archDist, -cuv.y - 0.35);
          
          vec3 col = vec3(0.1, 0.1, 0.15); // Frame
          
          if(archDist < 0.0) {
              // Voronoi cells for glass panes
              vec2 cellUV = uv * 6.0;
              float cells = voronoi(cellUV);
              vec2 cellID = voronoiID(cellUV);
              
              // Random color per cell
              float h = hash(cellID);
              vec3 glassCol;
              if(h < 0.2) glassCol = vec3(0.8, 0.2, 0.2); // Red
              else if(h < 0.4) glassCol = vec3(0.2, 0.3, 0.8); // Blue
              else if(h < 0.6) glassCol = vec3(0.8, 0.7, 0.2); // Gold
              else if(h < 0.8) glassCol = vec3(0.2, 0.6, 0.3); // Green
              else glassCol = vec3(0.6, 0.2, 0.6); // Purple
              
              // Lead lines
              float lead = smoothstep(0.05, 0.1, cells);
              
              // Light variation
              float light = 0.7 + 0.3 * sin(u_time + hash(cellID) * 10.0);
              
              col = glassCol * light * lead;
              col += vec3(0.05) * (1.0 - lead); // Lead color
              
              // Sun streaming through
              float sunY = sin(u_time * 0.5) * 0.2 + 0.3;
              float sunDist = length(cuv - vec2(0.0, sunY));
              col += vec3(1.0, 0.9, 0.7) * (0.1 / (sunDist + 0.1)) * 0.3;
          }
          
          // Window frame
          float frame = smoothstep(0.0, 0.02, abs(archDist));
          col = mix(vec3(0.2, 0.15, 0.1), col, frame);
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-cyber-brain',
    name: 'Pro: 3D Cyber Brain',
    description: 'Digital brain with neural pathways and data streams.',
    tags: ['3d', 'tech', 'brain', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
      float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }

      float brain(vec3 p) {
          // Brain shape - two hemispheres
          vec3 q = p;
          q.x = abs(q.x) - 0.3;
          float d = length(q) - 0.5;
          
          // Wrinkles
          d += sin(p.x * 15.0) * sin(p.y * 10.0) * sin(p.z * 12.0) * 0.02;
          
          return d;
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.01, 0.0);
          return normalize(vec3(brain(p+e.xyy)-brain(p-e.xyy), brain(p+e.yxy)-brain(p-e.yxy), brain(p+e.yyx)-brain(p-e.yyx)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, 2.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          ro.xz *= rot(u_time * 0.2);
          rd.xz *= rot(u_time * 0.2);
          
          float t = 0.0;
          for(int i=0; i<60; i++) {
              float d = brain(ro+rd*t);
              if(d < 0.001 || t > 5.0) break;
              t += d;
          }
          
          vec3 col = vec3(0.02, 0.05, 0.1);
          
          if(t < 5.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              // Base brain color
              float diff = max(dot(n, normalize(vec3(1,1,1))), 0.0);
              col = vec3(0.3, 0.25, 0.3) * (diff * 0.5 + 0.3);
              
              // Neural activity (glowing regions)
              float activity = sin(p.x * 20.0 + u_time * 5.0) * sin(p.y * 15.0 - u_time * 3.0);
              activity = smoothstep(0.7, 1.0, activity);
              col += vec3(0.0, 0.8, 1.0) * activity * 0.5;
              
              // Data streams along surface
              float stream = sin(p.z * 30.0 + p.x * 10.0 - u_time * 10.0);
              stream = smoothstep(0.95, 1.0, stream);
              col += vec3(0.0, 1.0, 0.5) * stream * 0.3;
          }
          
          // Floating data particles
          for(float i=0.0; i<20.0; i++) {
              float angle = i * 0.314 + u_time;
              float height = sin(i + u_time) * 0.5;
              float radius = 0.8 + sin(i * 0.5) * 0.2;
              
              vec3 particlePos = vec3(cos(angle) * radius, height, sin(angle) * radius);
              particlePos.xz *= rot(u_time * 0.2);
              
              vec3 toP = particlePos - ro;
              float tt = dot(toP, rd);
              if(tt > 0.0) {
                  vec3 closest = ro + rd * tt;
                  float dist = length(closest - particlePos);
                  col += vec3(0.0, 0.5, 1.0) * (0.01 / (dist * dist + 0.001));
              }
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-sandstorm',
    name: 'Pro: 3D Desert Sandstorm',
    description: 'Dense sandstorm with visibility layers and dune silhouettes.',
    tags: ['3d', 'weather', 'desert', 'professional'],
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
          float v=0.0,a=0.5;
          for(int i=0;i<4;i++){v+=a*noise(p);p*=2.0;a*=0.5;}
          return v;
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          
          // Base sand color
          vec3 col = vec3(0.8, 0.6, 0.4);
          
          // Dune silhouettes in distance
          float dune1 = fbm(vec2(uv.x * 3.0 + u_time * 0.1, 0.0)) * 0.2;
          float dune2 = fbm(vec2(uv.x * 5.0 + 10.0 + u_time * 0.05, 0.0)) * 0.15;
          float dune3 = fbm(vec2(uv.x * 8.0 + 20.0, 0.0)) * 0.1;
          
          if(uv.y < 0.3 + dune1) col = mix(col, vec3(0.6, 0.4, 0.3), 0.3);
          if(uv.y < 0.25 + dune2) col = mix(col, vec3(0.5, 0.35, 0.25), 0.4);
          if(uv.y < 0.2 + dune3) col = mix(col, vec3(0.4, 0.3, 0.2), 0.5);
          
          // Swirling sand particles
          for(float layer=0.0; layer<3.0; layer++) {
              float speed = 2.0 + layer;
              float scale = 10.0 + layer * 5.0;
              
              vec2 sandUV = uv * scale;
              sandUV.x += u_time * speed;
              sandUV.y += sin(uv.x * 10.0 + u_time + layer) * 0.5;
              
              float sand = noise(sandUV);
              sand = smoothstep(0.6, 0.8, sand);
              
              float depth = 1.0 - layer * 0.2;
              col = mix(col, vec3(0.9, 0.75, 0.5), sand * 0.3 * depth);
          }
          
          // Visibility reduction with distance
          float visibility = fbm(uv * 5.0 + u_time * vec2(0.5, 0.1));
          col = mix(col, vec3(0.85, 0.7, 0.5), visibility * 0.5);
          
          // Sun struggling through
          vec2 sunPos = vec2(0.7, 0.7);
          float sunDist = length(uv - sunPos);
          float sun = 0.1 / (sunDist + 0.1);
          col += vec3(1.0, 0.8, 0.4) * sun * 0.3 * (1.0 - visibility);
          
          // Ground level darkness
          col *= 0.7 + 0.3 * uv.y;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-dither-newspaper',
    name: 'Pro: Dither Newspaper Print',
    description: 'Classic halftone newspaper printing effect with CMYK dots.',
    tags: ['2d', 'retro', 'print', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float halftone(vec2 uv, float angle, float scale, float value) {
          float s = sin(angle);
          float c = cos(angle);
          vec2 ruv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);
          vec2 grid = fract(ruv * scale) - 0.5;
          float dot = length(grid);
          return step(dot, value * 0.5);
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          uv.x *= u_resolution.x / u_resolution.y;
          
          // Simulated image (gradient with shapes)
          float img = 0.5;
          
          // Circle
          float circle = 1.0 - smoothstep(0.2, 0.25, length(uv - vec2(0.5, 0.5)));
          img = mix(img, 0.2, circle);
          
          // Gradient overlay
          img += (uv.x - 0.5) * 0.3;
          img += sin(uv.y * 10.0 + u_time) * 0.1;
          
          img = clamp(img, 0.0, 1.0);
          
          // Paper base color
          vec3 paper = vec3(0.95, 0.93, 0.88);
          
          // CMYK halftone simulation
          float scale = 50.0;
          
          // Different angles for each "color" to avoid moire
          float c_dot = halftone(uv, 0.261, scale, 1.0 - img); // 15 deg
          float m_dot = halftone(uv, 1.309, scale, 1.0 - img); // 75 deg
          float y_dot = halftone(uv, 0.0, scale, 1.0 - img);   // 0 deg
          float k_dot = halftone(uv, 0.785, scale, 1.0 - img); // 45 deg
          
          // Apply as subtractive color
          vec3 col = paper;
          col -= vec3(0.0, 0.3, 0.3) * c_dot * 0.3; // Cyan
          col -= vec3(0.3, 0.0, 0.1) * m_dot * 0.2; // Magenta
          col -= vec3(0.0, 0.0, 0.3) * y_dot * 0.1; // Yellow
          col -= vec3(0.3, 0.3, 0.3) * k_dot * 0.4; // Black
          
          // Paper texture
          float texture = fract(sin(dot(uv * 500.0, vec2(12.9898, 78.233))) * 43758.5453);
          col += texture * 0.02;
          
          // Slight yellowing at edges
          float age = length(uv - 0.5);
          col -= vec3(0.0, 0.02, 0.05) * age;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-time-vortex',
    name: 'Pro: 3D Time Vortex',
    description: 'Spiraling temporal vortex with clock fragments and distortion.',
    tags: ['3d', 'time', 'vortex', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          float r = length(uv);
          float a = atan(uv.y, uv.x);
          
          // Spiral distortion
          float spiral = a + r * 10.0 - u_time * 3.0;
          
          vec3 col = vec3(0.0);
          
          // Vortex layers
          for(float i=0.0; i<5.0; i++) {
              float layerR = 0.1 + i * 0.15;
              float layerW = 0.05;
              
              float dist = abs(r - layerR);
              float ring = smoothstep(layerW, 0.0, dist);
              
              // Spiral variation
              float spiralVar = sin(spiral + i * 1.5) * 0.5 + 0.5;
              ring *= spiralVar;
              
              vec3 layerCol = 0.5 + 0.5 * cos(i * 1.2 + u_time + vec3(0, 2, 4));
              col += layerCol * ring * 0.5;
          }
          
          // Clock fragments
          for(float i=0.0; i<12.0; i++) {
              float clockA = i * 0.5236 + u_time * 0.5; // 30 degrees
              float clockR = 0.3 + sin(u_time + i) * 0.1;
              
              vec2 clockPos = vec2(cos(clockA), sin(clockA)) * clockR;
              float d = length(uv - clockPos);
              
              if(d < 0.05) {
                  // Clock face
                  col += vec3(0.8, 0.7, 0.5) * (1.0 - d / 0.05);
                  
                  // Clock hands
                  vec2 localUV = (uv - clockPos) / 0.05;
                  float handAngle = u_time * 2.0 + i;
                  vec2 hand = vec2(cos(handAngle), sin(handAngle));
                  float handDist = abs(dot(localUV, vec2(-hand.y, hand.x)));
                  if(length(localUV) < 0.8 && handDist < 0.1) {
                      col += vec3(0.2);
                  }
              }
          }
          
          // Center glow
          float center = 0.05 / (r + 0.02);
          col += vec3(0.5, 0.3, 0.8) * center;
          
          // Time distortion waves
          float wave = sin(r * 30.0 - u_time * 10.0) * 0.5 + 0.5;
          wave *= smoothstep(0.5, 0.0, r);
          col += vec3(0.2, 0.1, 0.3) * wave * 0.3;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  }
];
