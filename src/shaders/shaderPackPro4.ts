import type { DitherShaderDef } from './ditherShaders';

export const shaderPackPro4: DitherShaderDef[] = [
  {
    id: 'pro-3d-aurora-sphere',
    name: 'Pro: 3D Aurora Sphere',
    description: 'Planet with atmospheric aurora borealis wrapping around it.',
    tags: ['3d', 'space', 'aurora', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float noise(vec3 p) {
          vec3 i = floor(p);
          vec3 f = fract(p);
          f = f*f*(3.0-2.0*f);
          float n = dot(i, vec3(1.0, 57.0, 113.0));
          return mix(mix(mix(fract(sin(n)*43758.5453), fract(sin(n+1.0)*43758.5453), f.x),
                         mix(fract(sin(n+57.0)*43758.5453), fract(sin(n+58.0)*43758.5453), f.x), f.y),
                     mix(mix(fract(sin(n+113.0)*43758.5453), fract(sin(n+114.0)*43758.5453), f.x),
                         mix(fract(sin(n+170.0)*43758.5453), fract(sin(n+171.0)*43758.5453), f.x), f.y), f.z);
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, 3.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          rd.xz *= rot(u_time * 0.1);
          
          // Planet
          float planetR = 1.0;
          float b = dot(ro, rd);
          float c = dot(ro, ro) - planetR * planetR;
          float h = b*b - c;
          
          vec3 col = vec3(0.01, 0.02, 0.05);
          
          // Stars
          vec2 sg = floor(uv * 100.0);
          col += vec3(step(0.98, fract(sin(dot(sg, vec2(12.9898, 78.233))) * 43758.5453)));
          
          if(h > 0.0) {
              float t = -b - sqrt(h);
              vec3 p = ro + rd * t;
              vec3 n = normalize(p);
              
              // Planet surface
              float land = noise(n * 5.0);
              vec3 planetCol = mix(vec3(0.1, 0.3, 0.6), vec3(0.2, 0.5, 0.2), step(0.4, land));
              
              float diff = max(dot(n, normalize(vec3(1,0.5,0.5))), 0.0);
              col = planetCol * (diff * 0.5 + 0.2);
              
              // Aurora at poles
              float polar = abs(n.y);
              if(polar > 0.5) {
                  float aurora = noise(n * 10.0 + u_time * vec3(0.5, 0.0, 0.3));
                  aurora *= smoothstep(0.5, 0.9, polar);
                  
                  vec3 auroraCol = mix(vec3(0.0, 1.0, 0.5), vec3(0.5, 0.0, 1.0), noise(n * 3.0 + u_time));
                  col += auroraCol * aurora * 2.0;
              }
          } else {
              // Atmosphere glow
              float atmo = 1.0 / (sqrt(h + 0.5) + 0.1) * 0.1;
              col += vec3(0.2, 0.5, 1.0) * atmo;
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-cybernetic-eye',
    name: 'Pro: 3D Cybernetic Eye',
    description: 'Mechanical iris with scanning laser and HUD elements.',
    tags: ['3d', 'cyberpunk', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          float r = length(uv);
          float a = atan(uv.y, uv.x);
          
          vec3 col = vec3(0.0);
          
          // Outer ring - mechanical
          if(r > 0.4 && r < 0.5) {
              float segments = floor(a / (6.28 / 16.0));
              float segA = mod(a, 6.28 / 16.0) - 6.28 / 32.0;
              
              float mech = abs(segA) * 32.0;
              col = vec3(0.2, 0.2, 0.25) * step(0.5, mech);
              
              // Rotating element
              float rotA = a + u_time;
              if(abs(sin(rotA * 8.0)) > 0.9) {
                  col = vec3(0.0, 0.8, 1.0);
              }
          }
          
          // Iris
          if(r > 0.15 && r < 0.4) {
              float iris = sin(a * 30.0 + r * 20.0 - u_time * 2.0) * 0.5 + 0.5;
              vec3 irisCol = mix(vec3(0.0, 0.3, 0.5), vec3(0.0, 0.8, 0.6), iris);
              
              // Circuit patterns
              float circuit = step(0.9, sin(a * 50.0) * sin(r * 100.0));
              irisCol += vec3(0.0, 0.5, 0.8) * circuit;
              
              col = irisCol;
          }
          
          // Pupil
          if(r < 0.15) {
              col = vec3(0.0);
              
              // Inner glow
              col += vec3(0.0, 0.2, 0.3) * (0.15 - r) * 5.0;
          }
          
          // Scanning line
          float scanY = sin(u_time * 3.0) * 0.3;
          if(abs(uv.y - scanY) < 0.005 && r < 0.4) {
              col = vec3(1.0, 0.0, 0.0);
          }
          
          // HUD elements
          float hudR = 0.55;
          if(abs(r - hudR) < 0.005) {
              float hudA = mod(a + u_time * 0.5, 0.5) - 0.25;
              if(abs(hudA) < 0.1) {
                  col = vec3(0.0, 1.0, 0.5);
              }
          }
          
          // Dither
          vec2 dp = gl_FragCoord.xy;
          float bayer = mod(dp.x + dp.y, 2.0) / 2.0;
          col += bayer * 0.02;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-voxel-terrain',
    name: 'Pro: 3D Voxel Terrain',
    description: 'Minecraft-style blocky landscape with proper lighting and fog.',
    tags: ['3d', 'voxel', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      
      float terrain(vec2 p) {
          return floor(hash(floor(p)) * 5.0);
      }

      float voxel(vec3 ro, vec3 rd) {
          vec3 p = floor(ro);
          vec3 d = sign(rd);
          vec3 s = (p - ro + 0.5 + d * 0.5) / rd;
          
          for(int i=0; i<50; i++) {
              float h = terrain(p.xz);
              if(p.y < h) return length(p - ro);
              
              vec3 m = step(s.xyz, s.yzx) * step(s.xyz, s.zxy);
              s += m * d / rd;
              p += m * d;
          }
          
          return -1.0;
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(u_time * 2.0, 8.0, u_time * 2.0);
          vec3 rd = normalize(vec3(uv.x, uv.y - 0.3, 1.0));
          
          float t = voxel(ro, rd);
          
          vec3 col = vec3(0.5, 0.7, 1.0); // Sky
          
          if(t > 0.0) {
              vec3 p = ro + rd * t;
              
              // Determine face normal by which component changed
              vec3 d = fract(p);
              vec3 n = vec3(0.0);
              if(d.x < 0.01 || d.x > 0.99) n = vec3(sign(rd.x), 0, 0);
              else if(d.z < 0.01 || d.z > 0.99) n = vec3(0, 0, sign(rd.z));
              else n = vec3(0, 1, 0);
              
              // Simple lighting
              float diff = max(dot(-n, normalize(vec3(1,2,1))), 0.0);
              
              // Block color based on height
              float h = terrain(floor(p.xz));
              vec3 blockCol = h > 3.0 ? vec3(0.8, 0.8, 0.8) : // Snow
                              h > 1.0 ? vec3(0.3, 0.5, 0.2) : // Grass
                                        vec3(0.6, 0.5, 0.3);  // Sand
              
              col = blockCol * (diff * 0.6 + 0.3);
              
              // Fog
              col = mix(col, vec3(0.5, 0.7, 1.0), 1.0 - exp(-t * 0.02));
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-neon-tubes',
    name: 'Pro: 3D Neon Tubes',
    description: 'Twisting glowing neon tubes in dark space.',
    tags: ['3d', 'neon', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float tube(vec3 p, vec3 a, vec3 b, float r) {
          vec3 ab = b - a;
          vec3 ap = p - a;
          float t = clamp(dot(ap, ab) / dot(ab, ab), 0.0, 1.0);
          return length(ap - ab * t) - r;
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, 5.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          ro.xz *= rot(u_time * 0.2);
          rd.xz *= rot(u_time * 0.2);
          
          vec3 col = vec3(0.02, 0.02, 0.05);
          
          // Multiple neon tubes
          for(float i=0.0; i<5.0; i++) {
              float phase = i * 1.256 + u_time * 0.5;
              
              vec3 a = vec3(cos(phase) * 2.0, sin(phase * 1.5), sin(phase) * 2.0);
              vec3 b = vec3(cos(phase + 1.0) * 2.0, sin((phase + 1.0) * 1.5), sin(phase + 1.0) * 2.0);
              
              // Find closest point on tube to ray
              float t = 0.0;
              float minDist = 100.0;
              for(int j=0; j<20; j++) {
                  vec3 p = ro + rd * t;
                  float d = tube(p, a, b, 0.05);
                  minDist = min(minDist, d);
                  t += d;
                  if(t > 10.0) break;
              }
              
              // Glow based on distance
              float glow = 0.02 / (minDist * minDist + 0.001);
              
              vec3 tubeCol = 0.5 + 0.5 * cos(i * 1.5 + vec3(0, 2, 4));
              col += tubeCol * glow * 0.5;
              
              // Core if very close
              if(minDist < 0.06) {
                  col += tubeCol * 2.0;
              }
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-disco-ball',
    name: 'Pro: 3D Disco Ball',
    description: 'Rotating mirrored disco ball casting light reflections.',
    tags: ['3d', 'party', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 col = vec3(0.02, 0.02, 0.05);
          
          // Disco ball position
          vec3 ballPos = vec3(0.0, 0.0, 0.0);
          float ballR = 0.5;
          
          vec3 ro = vec3(0.0, 0.0, 2.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          // Ray-sphere intersection
          vec3 oc = ro - ballPos;
          float b = dot(oc, rd);
          float c = dot(oc, oc) - ballR * ballR;
          float h = b*b - c;
          
          if(h > 0.0) {
              float t = -b - sqrt(h);
              vec3 p = ro + rd * t;
              vec3 n = normalize(p - ballPos);
              
              // Rotate for animation
              n.xz *= rot(u_time);
              n.xy *= rot(u_time * 0.7);
              
              // Faceted surface
              vec2 facetUV = vec2(atan(n.z, n.x), asin(n.y));
              vec2 facetID = floor(facetUV * 8.0);
              
              // Mirror color
              float mirror = sin(facetID.x * 123.456 + facetID.y * 789.012);
              vec3 mirrorCol = 0.5 + 0.5 * cos(mirror + vec3(0, 2, 4) + u_time);
              
              // Specular highlight
              vec3 l = normalize(vec3(1, 1, 1));
              vec3 refl = reflect(rd, n);
              float spec = pow(max(dot(refl, l), 0.0), 32.0);
              
              col = mirrorCol * 0.3 + vec3(1.0) * spec;
          }
          
          // Light rays in background
          float a = atan(uv.y, uv.x);
          float rays = sin(a * 12.0 + u_time * 5.0) * 0.5 + 0.5;
          rays *= 0.1 / (length(uv) + 0.1);
          
          vec3 rayCol = 0.5 + 0.5 * cos(u_time + a + vec3(0, 2, 4));
          col += rayCol * rays * 0.3;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-abstract-ribbons',
    name: 'Pro: 3D Abstract Ribbons',
    description: 'Flowing ribbons weaving through space with gradients.',
    tags: ['3d', 'abstract', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}

      float ribbon(vec3 p, float phase) {
          p.x += sin(p.z * 0.5 + phase) * 2.0;
          p.y += cos(p.z * 0.3 + phase * 0.7) * 1.5;
          return max(abs(p.x) - 0.5, abs(p.y) - 0.02);
      }

      float map(vec3 p) {
          float d = 100.0;
          for(float i=0.0; i<4.0; i++) {
              d = min(d, ribbon(p, i * 1.57 + u_time));
          }
          return d;
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.01, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, u_time * 2.0);
          vec3 rd = normalize(vec3(uv, 1.0));
          
          float t = 0.0;
          for(int i=0; i<60; i++) {
              float d = map(ro+rd*t);
              if(d < 0.001 || t > 20.0) break;
              t += d;
          }
          
          vec3 col = vec3(0.05, 0.05, 0.1);
          
          if(t < 20.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              float z = p.z;
              vec3 ribbonCol = 0.5 + 0.5 * cos(z * 0.2 + vec3(0, 2, 4));
              
              float diff = max(dot(n, normalize(vec3(1,1,0))), 0.0);
              float rim = pow(1.0 - abs(dot(n, rd)), 2.0);
              
              col = ribbonCol * (diff * 0.6 + 0.2);
              col += vec3(1.0) * rim * 0.3;
          }
          
          col = mix(col, vec3(0.05, 0.05, 0.1), 1.0 - exp(-t * 0.05));
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-lightning-storm',
    name: 'Pro: 3D Lightning Storm',
    description: 'Dynamic branching lightning bolts illuminating storm clouds.',
    tags: ['3d', 'weather', 'professional'],
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

      float lightning(vec2 uv, float seed, float time) {
          float x = uv.x;
          float y = uv.y;
          
          float bolt = 0.0;
          float offset = 0.0;
          
          for(float i=0.0; i<10.0; i++) {
              offset += (hash(vec2(i, seed)) - 0.5) * 0.2;
              float localY = y + i * 0.1;
              if(localY > 0.0 && localY < 1.0) {
                  float dist = abs(x - offset);
                  bolt += 0.005 / (dist + 0.005);
              }
          }
          
          return bolt * step(0.9, hash(vec2(floor(time * 2.0), seed)));
      }

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          uv.y = 1.0 - uv.y;
          
          // Cloud base
          float clouds = noise(uv * 5.0 + u_time * 0.1);
          clouds += noise(uv * 10.0 - u_time * 0.05) * 0.5;
          
          vec3 col = mix(vec3(0.1, 0.1, 0.15), vec3(0.3, 0.3, 0.4), clouds);
          
          // Lightning bolts
          float bolt = 0.0;
          for(float i=0.0; i<3.0; i++) {
              vec2 boltUV = uv - vec2(0.3 + i * 0.2, 0.0);
              bolt += lightning(boltUV, i, u_time + i);
          }
          
          col += vec3(0.8, 0.9, 1.0) * bolt;
          
          // Flash illumination
          float flash = step(0.95, hash(vec2(floor(u_time * 3.0), 0.0)));
          col += vec3(0.2, 0.2, 0.25) * flash;
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-bismuth-crystal',
    name: 'Pro: 3D Bismuth Crystal',
    description: 'Iridescent stepped bismuth crystal structure with rainbow oxidation.',
    tags: ['3d', 'crystal', 'professional'],
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
          p.xy *= rot(u_time * 0.2);
          p.yz *= rot(u_time * 0.15);
          
          float d = 100.0;
          
          // Stepped pyramid structure
          for(float i=0.0; i<5.0; i++) {
              float size = 1.0 - i * 0.2;
              float height = i * 0.15;
              d = min(d, box(p - vec3(0, height, 0), vec3(size, 0.05, size)));
              
              // Offset sub-crystals
              vec3 op = p - vec3(size * 0.5, height + 0.1, size * 0.5);
              d = min(d, box(op, vec3(size * 0.4, 0.1, size * 0.4)));
          }
          
          return d;
      }

      vec3 calcNormal(vec3 p) {
          vec2 e = vec2(0.001, 0.0);
          return normalize(vec3(map(p+e.xyy)-map(p-e.xyy), map(p+e.yxy)-map(p-e.yxy), map(p+e.yyx)-map(p-e.yyx)));
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 1.0, 3.0);
          vec3 rd = normalize(vec3(uv, -1.0));
          
          float t = 0.0;
          for(int i=0; i<80; i++) {
              float d = map(ro+rd*t);
              if(d < 0.001 || t > 10.0) break;
              t += d;
          }
          
          vec3 col = vec3(0.1, 0.1, 0.15);
          
          if(t < 10.0) {
              vec3 p = ro+rd*t;
              vec3 n = calcNormal(p);
              
              // Iridescent coloring based on view angle
              float theta = dot(n, -rd);
              float iridescence = theta * 3.0 + p.y * 5.0;
              vec3 iridCol = 0.5 + 0.5 * cos(iridescence + vec3(0, 2, 4));
              
              // Metallic base
              float diff = max(dot(n, normalize(vec3(1,1,1))), 0.0);
              float spec = pow(max(dot(reflect(rd, n), normalize(vec3(1,1,1))), 0.0), 32.0);
              
              col = iridCol * (diff * 0.4 + 0.2);
              col += vec3(1.0) * spec * 0.5;
              col += iridCol * 0.3;
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-dither-oscilloscope',
    name: 'Pro: Dither Oscilloscope',
    description: 'Vintage oscilloscope display with phosphor glow and grid.',
    tags: ['2d', 'retro', 'dither', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      void main() {
          vec2 uv = gl_FragCoord.xy / u_resolution.xy;
          uv = uv * 2.0 - 1.0;
          uv.x *= u_resolution.x / u_resolution.y;
          
          vec3 col = vec3(0.02, 0.05, 0.02);
          
          // Grid
          vec2 grid = abs(fract(uv * 5.0) - 0.5);
          float line = min(grid.x, grid.y);
          col += vec3(0.0, 0.1, 0.0) * smoothstep(0.02, 0.0, line);
          
          // Main axis
          col += vec3(0.0, 0.15, 0.0) * smoothstep(0.02, 0.0, abs(uv.x));
          col += vec3(0.0, 0.15, 0.0) * smoothstep(0.02, 0.0, abs(uv.y));
          
          // Waveform
          float wave1 = sin(uv.x * 10.0 + u_time * 5.0) * 0.3;
          wave1 += sin(uv.x * 20.0 + u_time * 8.0) * 0.1;
          
          float wave2 = sin(uv.x * 15.0 - u_time * 3.0) * 0.2;
          wave2 += cos(uv.x * 25.0 + u_time * 6.0) * 0.15;
          
          float dist1 = abs(uv.y - wave1);
          float dist2 = abs(uv.y - wave2);
          
          // Phosphor glow
          col += vec3(0.0, 1.0, 0.2) * (0.01 / (dist1 + 0.01));
          col += vec3(1.0, 1.0, 0.0) * (0.008 / (dist2 + 0.01));
          
          // Bright core
          col += vec3(0.5, 1.0, 0.5) * smoothstep(0.01, 0.0, dist1);
          col += vec3(1.0, 1.0, 0.5) * smoothstep(0.008, 0.0, dist2);
          
          // CRT curvature vignette
          float vig = 1.0 - length(uv) * 0.3;
          col *= vig;
          
          // Scanlines
          col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 3.0);
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  },
  {
    id: 'pro-3d-asteroid-field',
    name: 'Pro: 3D Asteroid Field',
    description: 'Flying through dense asteroid field with tumbling rocks.',
    tags: ['3d', 'space', 'professional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;

      mat2 rot(float a){return mat2(cos(a),-sin(a),sin(a),cos(a));}
      float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1,311.7,74.7)))*43758.5453); }

      float asteroid(vec3 p, float seed) {
          // Tumbling rotation
          p.xy *= rot(u_time * hash(vec3(seed, 0.0, 0.0)));
          p.yz *= rot(u_time * 0.7 * hash(vec3(seed, 1.0, 0.0)));
          
          // Distorted sphere
          float d = length(p) - 0.3;
          d += sin(p.x * 10.0) * sin(p.y * 10.0) * sin(p.z * 10.0) * 0.1;
          
          return d;
      }

      void main() {
          vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution) / u_resolution.y;
          
          vec3 ro = vec3(0.0, 0.0, u_time * 5.0);
          vec3 rd = normalize(vec3(uv, 1.0));
          
          vec3 col = vec3(0.01, 0.01, 0.02);
          
          // Stars
          vec2 sg = floor(uv * 100.0);
          col += vec3(step(0.98, fract(sin(dot(sg, vec2(12.9898, 78.233))) * 43758.5453)));
          
          float tMin = 100.0;
          vec3 hitN = vec3(0.0);
          
          // Check multiple asteroid positions
          for(float i=0.0; i<20.0; i++) {
              vec3 aPos = vec3(
                  (hash(vec3(i, 0.0, 0.0)) - 0.5) * 10.0,
                  (hash(vec3(i, 1.0, 0.0)) - 0.5) * 10.0,
                  mod(hash(vec3(i, 2.0, 0.0)) * 50.0 + u_time * 5.0, 50.0)
              );
              
              // Quick sphere check
              vec3 oc = ro - aPos;
              float b = dot(oc, rd);
              float c = dot(oc, oc) - 0.5;
              float h = b*b - c;
              
              if(h > 0.0) {
                  float t = -b - sqrt(h);
                  if(t > 0.0 && t < tMin) {
                      tMin = t;
                      hitN = normalize(ro + rd * t - aPos);
                  }
              }
          }
          
          if(tMin < 100.0) {
              float diff = max(dot(hitN, normalize(vec3(1,1,0))), 0.0);
              col = vec3(0.4, 0.35, 0.3) * (diff * 0.6 + 0.2);
          }
          
          gl_FragColor = vec4(col, 1.0);
      }
    `
  }
];
