import type { DitherShaderDef } from './ditherShaders';

export const shaderPack22: DitherShaderDef[] = [
  {
    id: 'lowpoly-mountains',
    name: 'Low Poly Mountains',
    description: 'Faceted low-polygon mountain landscape with flat-shaded triangular faces and shifting light.',
    tags: ['lowpoly', 'landscape', '2d'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      
      vec2 triGrid(vec2 p, out float id) {
        float row = floor(p.y);
        vec2 off = vec2(mod(row, 2.0) * 0.5, 0.0);
        vec2 cell = floor(p + off);
        vec2 f = fract(p + off);
        float flip = step(f.x + f.y, 1.0);
        id = hash(cell + flip * 0.5);
        return cell;
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float scale = 18.0;
        vec2 p = uv * vec2(scale, scale * 0.6);
        
        float id;
        vec2 cell = triGrid(p, id);
        
        // Mountain height based on position
        float baseHeight = sin(cell.x * 0.3 + u_time * 0.1) * 0.3 + 0.5;
        baseHeight *= smoothstep(0.0, 0.5, uv.y);
        float height = baseHeight + id * 0.15;
        
        // Flat shading - light direction
        vec3 lightDir = normalize(vec3(u_mouse.x - 0.5, u_mouse.y - 0.5, 0.6));
        float facet = id * 0.5 + 0.5;
        float shade = facet * 0.4 + 0.6;
        shade *= 0.7 + 0.3 * dot(normalize(vec3(id - 0.5, facet - 0.5, 1.0)), lightDir);
        
        // Color by elevation
        vec3 snow = vec3(0.9, 0.92, 0.95);
        vec3 rock = vec3(0.4, 0.38, 0.35);
        vec3 grass = vec3(0.2, 0.45, 0.15);
        vec3 water = vec3(0.1, 0.25, 0.5);
        
        vec3 col;
        if (uv.y < 0.15) col = water;
        else if (height < 0.35) col = grass;
        else if (height < 0.55) col = rock;
        else col = snow;
        
        col *= shade;
        
        // Sky gradient
        float sky = smoothstep(0.7, 1.0, uv.y);
        col = mix(col, vec3(0.3, 0.5, 0.8), sky * (1.0 - step(0.01, height - 0.6)));
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'lowpoly-water',
    name: 'Low Poly Water',
    description: 'Animated low-polygon water surface with triangulated waves and reflective facets.',
    tags: ['lowpoly', 'nature', '2d'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float scale = 20.0;
        vec2 p = uv * scale;
        
        // Triangulated grid
        float row = floor(p.y);
        vec2 off = vec2(mod(row, 2.0) * 0.5, 0.0);
        vec2 cell = floor(p + off);
        vec2 f = fract(p + off);
        
        float triId = step(f.x + f.y, 1.0);
        float id = hash(cell + triId);
        
        // Animated wave height per facet
        float wave = sin(cell.x * 0.5 + u_time * 1.5 + id * 6.28) * 0.3;
        wave += sin(cell.y * 0.7 - u_time * 1.2) * 0.2;
        wave += sin((cell.x + cell.y) * 0.3 + u_time * 0.8) * 0.15;
        
        // Mouse ripple
        float md = length(uv - u_mouse);
        wave += sin(md * 20.0 - u_time * 4.0) * 0.1 * exp(-md * 3.0);
        
        float shade = 0.5 + wave;
        shade = clamp(shade, 0.0, 1.0);
        
        // Facet normal approximation for specular
        float spec = pow(max(0.0, shade - 0.5) * 2.0, 4.0) * 0.6;
        
        vec3 deep = vec3(0.02, 0.1, 0.25);
        vec3 mid = vec3(0.05, 0.3, 0.5);
        vec3 bright = vec3(0.2, 0.55, 0.7);
        
        vec3 col = mix(deep, mid, shade);
        col = mix(col, bright, pow(shade, 2.0));
        col += spec * vec3(0.6, 0.8, 1.0);
        
        // Subtle facet edge
        float edgeX = smoothstep(0.02, 0.05, f.x) * smoothstep(0.98, 0.95, f.x);
        float edgeY = smoothstep(0.02, 0.05, f.y) * smoothstep(0.98, 0.95, f.y);
        col *= 0.85 + 0.15 * edgeX * edgeY;
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'lowpoly-crystal',
    name: 'Low Poly Crystal',
    description: 'Rotating crystalline gem with faceted faces catching prismatic light.',
    tags: ['lowpoly', 'geometric', '2d'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      
      void main() {
        vec2 uv = (gl_FragCoord.xy - u_resolution * 0.5) / min(u_resolution.x, u_resolution.y);
        
        // Rotate
        float a = u_time * 0.3;
        float ca = cos(a), sa = sin(a);
        uv = mat2(ca, -sa, sa, ca) * uv;
        
        // Hexagonal crystal facets
        float angle = atan(uv.y, uv.x);
        float sides = 6.0;
        float sector = floor(angle / (6.2832 / sides) + 0.5);
        float sectorAngle = sector * 6.2832 / sides;
        
        float r = length(uv);
        vec2 local = vec2(cos(sectorAngle), sin(sectorAngle));
        float proj = dot(uv, local);
        float perp = abs(dot(uv, vec2(-local.y, local.x)));
        
        // Crystal shape
        float crystalEdge = 0.35 - perp * 0.3;
        float inCrystal = step(r, crystalEdge + 0.05 * sin(sector * 3.0 + u_time));
        
        // Facet shading
        float facetId = hash(vec2(sector, floor(r * 8.0)));
        vec3 lightDir = normalize(vec3(u_mouse - 0.5, 0.8));
        float facetNormal = facetId * 0.6 + 0.4;
        float shade = 0.4 + 0.6 * facetNormal;
        
        // Prismatic color
        float hue = fract(sector / sides + u_time * 0.1 + r);
        vec3 col;
        col.r = 0.5 + 0.5 * sin(hue * 6.28);
        col.g = 0.5 + 0.5 * sin(hue * 6.28 + 2.09);
        col.b = 0.5 + 0.5 * sin(hue * 6.28 + 4.18);
        
        col *= shade;
        float spec = pow(facetNormal, 8.0) * 0.5;
        col += spec;
        
        // Background
        vec3 bg = vec3(0.02, 0.02, 0.06);
        float glow = 0.03 / (r - crystalEdge + 0.1);
        bg += glow * vec3(0.3, 0.2, 0.5) * 0.15;
        
        col = mix(bg, col * inCrystal, inCrystal);
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'lowpoly-sunset',
    name: 'Low Poly Sunset',
    description: 'Faceted sunset sky with triangulated clouds and geometric sun over polygon sea.',
    tags: ['lowpoly', 'nature', 'landscape'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float scale = 14.0;
        vec2 p = uv * vec2(scale, scale * 0.7);
        
        float row = floor(p.y);
        vec2 cell = floor(p + vec2(mod(row, 2.0) * 0.5, 0.0));
        vec2 f = fract(p + vec2(mod(row, 2.0) * 0.5, 0.0));
        float triId = step(f.x + f.y, 1.0);
        float id = hash(cell + triId * 0.5);
        
        // Sky gradient with faceted quantization
        float skyY = uv.y + id * 0.03;
        vec3 skyTop = vec3(0.1, 0.1, 0.35);
        vec3 skyMid = vec3(0.8, 0.3, 0.15);
        vec3 skyBot = vec3(0.95, 0.6, 0.2);
        
        vec3 sky;
        if (skyY > 0.6) sky = mix(skyMid, skyTop, (skyY - 0.6) / 0.4);
        else sky = mix(skyBot, skyMid, skyY / 0.6);
        
        // Sun
        vec2 sunPos = vec2(u_mouse.x, 0.45);
        float sunD = length(uv - sunPos);
        float sun = smoothstep(0.15, 0.1, sunD);
        sky = mix(sky, vec3(1.0, 0.9, 0.5), sun);
        sky += exp(-sunD * 4.0) * vec3(1.0, 0.4, 0.1) * 0.4;
        
        // Water (below horizon)
        float horizon = 0.3;
        if (uv.y < horizon) {
          float waterWave = sin(cell.x * 0.8 + u_time * 2.0 + id * 6.28) * 0.02;
          float reflect = smoothstep(0.0, horizon, uv.y + waterWave);
          vec3 waterCol = mix(vec3(0.02, 0.05, 0.15), sky * 0.6, reflect);
          float sparkle = pow(id, 12.0) * smoothstep(0.15, 0.25, uv.y) * 0.8;
          waterCol += sparkle * vec3(1.0, 0.8, 0.5);
          sky = waterCol;
        }
        
        // Flat shade each facet slightly
        sky *= 0.9 + 0.1 * id;
        
        gl_FragColor = vec4(sky, 1.0);
      }
    `,
  },
  {
    id: 'lowpoly-terrain-3d',
    name: 'Low Poly Terrain',
    description: 'Isometric low-polygon terrain with elevation coloring and dynamic lighting.',
    tags: ['lowpoly', '3d', 'landscape'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      float noise(vec2 p) {
        vec2 i = floor(p), f = fract(p);
        f = f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float scale = 16.0;
        vec2 p = uv * scale;
        
        // Grid with isometric feel
        vec2 cell = floor(p);
        vec2 f = fract(p);
        float triId = step(f.x + f.y, 1.0);
        float id = hash(cell + triId);
        
        // Height from noise
        float h = noise(cell * 0.3 + u_time * 0.05);
        h += noise(cell * 0.6 - u_time * 0.03) * 0.5;
        h *= 0.67;
        
        // Simulate 3D by shifting y based on height
        float elevation = h * 0.15;
        float adjustedY = uv.y + elevation;
        
        // Lighting
        vec3 light = normalize(vec3(u_mouse.x - 0.5, 0.5, 0.7));
        vec3 normal = normalize(vec3(
          noise(cell * 0.3 + vec2(0.1, 0.0)) - noise(cell * 0.3 - vec2(0.1, 0.0)),
          0.3,
          noise(cell * 0.3 + vec2(0.0, 0.1)) - noise(cell * 0.3 - vec2(0.0, 0.1))
        ));
        float shade = max(0.2, dot(normal, light));
        
        // Color by height
        vec3 col;
        if (h < 0.25) col = vec3(0.15, 0.35, 0.6); // water
        else if (h < 0.35) col = vec3(0.7, 0.65, 0.4); // sand
        else if (h < 0.55) col = vec3(0.2, 0.5, 0.15); // grass
        else if (h < 0.7) col = vec3(0.35, 0.3, 0.25); // rock
        else col = vec3(0.85, 0.88, 0.9); // snow
        
        col *= shade;
        col *= 0.85 + 0.15 * id; // facet variation
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'lowpoly-gems',
    name: 'Low Poly Gems',
    description: 'Scattered geometric gemstones with flat-shaded facets and refracted color.',
    tags: ['lowpoly', 'geometric', 'artistic'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      
      float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
      
      float diamond(vec2 p) { return abs(p.x) + abs(p.y); }
      float hexDist(vec2 p) { p = abs(p); return max(p.x + p.y * 0.577, p.y * 1.154); }
      
      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        vec3 col = vec3(0.02, 0.02, 0.05);
        
        for (int i = 0; i < 12; i++) {
          float fi = float(i);
          float r = hash(vec2(fi, 0.0));
          float r2 = hash(vec2(fi, 1.0));
          float r3 = hash(vec2(fi, 2.0));
          
          vec2 pos = vec2(
            0.1 + r * 0.8,
            0.1 + r2 * 0.8
          );
          pos.y += sin(u_time * 0.3 + fi) * 0.02;
          
          float size = 0.03 + r3 * 0.04;
          vec2 d = (uv - pos) / size;
          
          // Rotate each gem
          float a = fi * 1.047 + u_time * 0.2;
          float ca = cos(a), sa = sin(a);
          d = mat2(ca, -sa, sa, ca) * d;
          
          float shape;
          if (mod(fi, 3.0) < 1.0) shape = diamond(d);
          else if (mod(fi, 3.0) < 2.0) shape = hexDist(d);
          else shape = length(d);
          
          if (shape < 1.0) {
            // Facet sectors
            float angle = atan(d.y, d.x);
            float sector = floor(angle / 0.785 + 0.5);
            float facetId = hash(vec2(sector, fi));
            
            // Light
            vec3 light = normalize(vec3(u_mouse - 0.5, 0.7));
            float shade = 0.4 + 0.6 * (facetId * 0.5 + 0.5);
            
            // Gem color
            float hue = fract(fi * 0.137);
            vec3 gemCol;
            gemCol.r = 0.5 + 0.5 * sin(hue * 6.28);
            gemCol.g = 0.5 + 0.5 * sin(hue * 6.28 + 2.09);
            gemCol.b = 0.5 + 0.5 * sin(hue * 6.28 + 4.18);
            
            gemCol *= shade;
            float spec = pow(facetId, 6.0) * 0.5;
            gemCol += spec;
            
            float alpha = smoothstep(1.0, 0.9, shape);
            col = mix(col, gemCol, alpha);
          }
        }
        
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
