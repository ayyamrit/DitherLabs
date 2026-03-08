import type { DitherShaderDef } from './ditherShaders';

export const shaderPack26: DitherShaderDef[] = [
  {
    id: 'meteor-shower',
    name: 'Meteor Shower',
    description: 'Streaking meteors across a starfield sky',
    tags: ['space', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.02, 0.01, 0.05);
  
  // Stars
  for (float i = 0.0; i < 80.0; i++) {
    vec2 star = vec2(hash(vec2(i, 0.0)), hash(vec2(0.0, i)));
    float brightness = hash(vec2(i, i)) * 0.8 + 0.2;
    float twinkle = 0.5 + 0.5 * sin(u_time * (1.0 + hash(vec2(i, 1.0)) * 3.0));
    float d = length(uv - star);
    col += vec3(brightness * twinkle * 0.003 / (d + 0.001));
  }
  
  // Meteors
  for (float i = 0.0; i < 5.0; i++) {
    float t = u_time * 0.4 + i * 2.7;
    float phase = fract(t / 3.0);
    if (phase > 0.7) continue;
    vec2 start = vec2(hash(vec2(floor(t/3.0), i)), 0.8 + hash(vec2(i, floor(t/3.0))) * 0.2);
    vec2 dir = normalize(vec2(0.6, -1.0));
    vec2 pos = start + dir * phase * 1.5;
    
    for (float j = 0.0; j < 20.0; j++) {
      vec2 tp = pos - dir * j * 0.015;
      float d = length(uv - tp);
      float fade = 1.0 - j / 20.0;
      col += vec3(1.0, 0.7, 0.3) * fade * 0.002 / (d + 0.002);
    }
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'smoke-wisps',
    name: 'Smoke Wisps',
    description: 'Ethereal smoke tendrils rising and curling',
    tags: ['organic', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.1; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.3;
  
  vec3 col = vec3(0.02);
  
  for (float i = 0.0; i < 4.0; i++) {
    vec2 p = uv;
    p.x += sin(p.y * 3.0 + t + i) * 0.15;
    p.y -= t * (0.1 + i * 0.05);
    float f = fbm(p * 3.0 + vec2(i * 1.3, 0.0));
    float wisp = smoothstep(0.35, 0.65, f);
    wisp *= smoothstep(0.0, 0.3, uv.y) * smoothstep(1.0, 0.5, uv.y);
    float cx = 0.3 + i * 0.15;
    wisp *= smoothstep(0.4, 0.0, abs(uv.x - cx));
    col += vec3(0.15, 0.12, 0.18) * wisp;
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'electric-arc',
    name: 'Electric Arc',
    description: 'Crackling electricity between two points',
    tags: ['energy', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(float n) { return fract(sin(n) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);
  float n = i.x + i.y * 57.0;
  return mix(mix(hash(n), hash(n+1.0), f.x), mix(hash(n+57.0), hash(n+58.0), f.x), f.y);
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec3 col = vec3(0.01, 0.01, 0.03);
  
  vec2 a = vec2(0.2, 0.5 + u_mouse.y * 0.1);
  vec2 b = vec2(0.8, 0.5 - u_mouse.y * 0.1);
  
  for (float j = 0.0; j < 5.0; j++) {
    float t = u_time * 8.0 + j * 100.0;
    for (float i = 0.0; i < 30.0; i++) {
      float frac = i / 30.0;
      vec2 p = mix(a, b, frac);
      float offset = noise(vec2(frac * 10.0, t + j)) * 0.15 - 0.075;
      offset += noise(vec2(frac * 20.0, t * 1.5 + j)) * 0.05;
      p.y += offset;
      float d = length(uv - p);
      float brightness = (1.0 - j * 0.15);
      col += vec3(0.3, 0.5, 1.0) * brightness * 0.003 / (d + 0.003);
    }
  }
  
  // Glow at endpoints
  float ga = length(uv - a);
  float gb = length(uv - b);
  col += vec3(0.2, 0.4, 1.0) * 0.01 / (ga + 0.01);
  col += vec3(0.2, 0.4, 1.0) * 0.01 / (gb + 0.01);
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'hexagonal-flow',
    name: 'Hexagonal Flow',
    description: 'Animated hexagonal grid with flowing colors',
    tags: ['geometric', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

vec2 hexCoord(vec2 p) {
  vec2 q = vec2(p.x * 2.0 / 1.732, p.y - p.x / 1.732);
  vec2 pi = floor(q); vec2 pf = fract(q);
  float v = mod(pi.x + pi.y, 3.0);
  float ca = step(1.0, v); float cb = step(2.0, v);
  vec2 ma = step(pf.xy, pf.yx);
  return pi + ca - cb * ma;
}

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float scale = 12.0;
  vec2 p = uv * scale;
  vec2 h = hexCoord(p);
  
  float id = hash(h);
  float t = u_time * 0.5;
  
  float wave = sin(h.x * 0.5 + t) * cos(h.y * 0.5 - t * 0.7) * 0.5 + 0.5;
  float pulse = sin(t * 2.0 + id * 6.28) * 0.5 + 0.5;
  
  vec3 c1 = vec3(0.05, 0.15, 0.3);
  vec3 c2 = vec3(0.0, 0.8, 0.6);
  vec3 c3 = vec3(0.9, 0.2, 0.5);
  
  vec3 col = mix(c1, mix(c2, c3, wave), pulse * 0.6);
  
  // Hex edge highlight
  vec2 gv = fract(p) - 0.5;
  float edge = 1.0 - smoothstep(0.4, 0.5, max(abs(gv.x), abs(gv.y)));
  col += vec3(0.1) * edge * 0.3;
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'digital-rain-matrix',
    name: 'Digital Rain',
    description: 'Matrix-style cascading digital characters',
    tags: ['matrix', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

float char(vec2 p, float n) {
  p = floor(p * vec2(4.0, 4.0));
  float idx = p.x + p.y * 4.0;
  return step(0.5, fract(sin(idx * 41.0 + n) * 13758.0));
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float cols = 30.0;
  vec2 grid = vec2(cols, cols * u_resolution.y / u_resolution.x);
  vec2 cell = floor(uv * grid);
  vec2 cellUV = fract(uv * grid);
  
  float colHash = hash(vec2(cell.x, 0.0));
  float speed = 1.0 + colHash * 3.0;
  float offset = colHash * 100.0;
  
  float drop = fract((u_time * speed + offset) / grid.y);
  float headY = grid.y * (1.0 - drop);
  float dist = cell.y - headY;
  if (dist < 0.0) dist += grid.y;
  
  float trail = 1.0 - dist / (grid.y * 0.4);
  trail = clamp(trail, 0.0, 1.0);
  
  float charVal = char(cellUV, hash(cell + floor(u_time * 5.0)));
  float brightness = trail * charVal;
  
  vec3 col = vec3(0.0, brightness, brightness * 0.3);
  
  // Head glow
  if (dist < 1.5) {
    col = mix(col, vec3(0.6, 1.0, 0.6), charVal * (1.0 - dist / 1.5));
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'magnetic-field',
    name: 'Magnetic Field',
    description: 'Visualized magnetic field lines between poles',
    tags: ['physics', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;
  
  float t = u_time * 0.3;
  vec2 pole1 = vec2(-0.5, sin(t) * 0.2);
  vec2 pole2 = vec2(0.5, -sin(t) * 0.2);
  
  vec2 d1 = p - pole1;
  vec2 d2 = p - pole2;
  float r1 = length(d1);
  float r2 = length(d2);
  
  // Field direction
  vec2 field = d1 / (r1 * r1 + 0.01) - d2 / (r2 * r2 + 0.01);
  float strength = length(field);
  
  // Field lines via angle
  float angle = atan(field.y, field.x);
  float lines = sin(angle * 8.0 + strength * 3.0) * 0.5 + 0.5;
  lines = smoothstep(0.3, 0.7, lines);
  
  float flow = sin(strength * 10.0 - u_time * 2.0) * 0.5 + 0.5;
  
  vec3 col = mix(
    vec3(0.05, 0.0, 0.15),
    vec3(0.2, 0.5, 1.0),
    lines * 0.6
  );
  col += vec3(1.0, 0.3, 0.1) * flow * lines * 0.3;
  
  // Pole glow
  col += vec3(1.0, 0.2, 0.2) * 0.02 / (r1 + 0.02);
  col += vec3(0.2, 0.2, 1.0) * 0.02 / (r2 + 0.02);
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'kaleidoscope-dream',
    name: 'Kaleidoscope Dream',
    description: 'Ever-shifting kaleidoscopic patterns',
    tags: ['psychedelic', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define PI 3.14159265

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;
  
  float t = u_time * 0.4;
  
  // Polar coords
  float r = length(p);
  float a = atan(p.y, p.x);
  
  // Kaleidoscope fold
  float segments = 8.0;
  a = mod(a, 2.0 * PI / segments);
  a = abs(a - PI / segments);
  
  // Reconstruct
  vec2 q = vec2(cos(a), sin(a)) * r;
  
  // Pattern layers
  float pattern = 0.0;
  for (float i = 0.0; i < 4.0; i++) {
    vec2 tq = q * (2.0 + i);
    tq += vec2(sin(t + i), cos(t * 0.7 + i));
    pattern += sin(tq.x * 5.0 + t) * cos(tq.y * 5.0 - t * 0.5);
  }
  pattern *= 0.25;
  
  vec3 col = vec3(
    0.5 + 0.5 * sin(pattern * 3.0 + t),
    0.5 + 0.5 * sin(pattern * 3.0 + t + 2.094),
    0.5 + 0.5 * sin(pattern * 3.0 + t + 4.188)
  );
  
  col *= 0.7 + 0.3 * smoothstep(1.0, 0.0, r);
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'rain-on-glass',
    name: 'Rain on Glass',
    description: 'Realistic raindrops streaming down glass',
    tags: ['weather', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

float drop(vec2 uv, float t, float id) {
  float speed = 0.3 + hash(vec2(id, 0.0)) * 0.5;
  float x = hash(vec2(id, 1.0));
  float startT = hash(vec2(id, 2.0)) * 5.0;
  float y = 1.0 - mod((t + startT) * speed, 1.4);
  
  vec2 pos = vec2(x, y);
  vec2 d = uv - pos;
  d.x *= u_resolution.x / u_resolution.y;
  
  float size = 0.008 + hash(vec2(id, 3.0)) * 0.008;
  float drop = smoothstep(size, size * 0.3, length(d));
  
  // Trail
  float trail = 0.0;
  if (uv.y > y) {
    float trailD = abs(uv.x - x) * u_resolution.x / u_resolution.y;
    float trailLen = min(uv.y - y, 0.15);
    trail = smoothstep(0.003, 0.001, trailD) * smoothstep(0.15, 0.0, uv.y - y);
    trail *= 0.5;
  }
  
  return drop + trail;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  
  // Dark blurry background
  vec3 bg = vec3(0.05, 0.07, 0.12);
  bg += vec3(0.03) * sin(uv.x * 10.0) * sin(uv.y * 8.0);
  
  float drops = 0.0;
  for (float i = 0.0; i < 40.0; i++) {
    drops += drop(uv, u_time, i);
  }
  drops = clamp(drops, 0.0, 1.0);
  
  vec3 col = mix(bg, vec3(0.2, 0.3, 0.45), drops);
  col += vec3(0.5, 0.6, 0.8) * drops * 0.3;
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'dna-helix',
    name: 'DNA Helix',
    description: 'Rotating double helix with glowing nucleotides',
    tags: ['science', 'animated', '3D', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define PI 3.14159265

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;
  
  float t = u_time * 0.8;
  vec3 col = vec3(0.01, 0.02, 0.06);
  
  for (float i = -10.0; i < 10.0; i++) {
    float y = i * 0.08;
    float angle = y * 8.0 + t;
    
    // Two strands
    float x1 = sin(angle) * 0.25;
    float x2 = sin(angle + PI) * 0.25;
    float z1 = cos(angle);
    float z2 = cos(angle + PI);
    
    float size1 = 0.015 * (1.0 + z1 * 0.3);
    float size2 = 0.015 * (1.0 + z2 * 0.3);
    
    float d1 = length(p - vec2(x1, y));
    float d2 = length(p - vec2(x2, y));
    
    float bright1 = (0.5 + z1 * 0.5);
    float bright2 = (0.5 + z2 * 0.5);
    
    col += vec3(0.0, 0.6, 1.0) * bright1 * 0.006 / (d1 + 0.006);
    col += vec3(1.0, 0.3, 0.5) * bright2 * 0.006 / (d2 + 0.006);
    
    // Rungs
    if (mod(i + 10.0, 2.0) < 1.0) {
      for (float j = 0.0; j < 5.0; j++) {
        float frac = j / 4.0;
        vec2 rp = mix(vec2(x1, y), vec2(x2, y), frac);
        float rd = length(p - rp);
        float rz = mix(z1, z2, frac);
        float rb = (0.5 + rz * 0.5) * 0.5;
        col += vec3(0.3, 0.8, 0.4) * rb * 0.002 / (rd + 0.004);
      }
    }
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'sand-dunes',
    name: 'Sand Dunes',
    description: 'Windswept desert dunes with shifting light',
    tags: ['nature', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p); vec2 f = fract(p);
  f = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x),
             mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 5; i++) { v += a * noise(p); p *= 2.0; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.05;
  
  // Sky gradient
  vec3 sky = mix(vec3(0.9, 0.6, 0.3), vec3(0.3, 0.5, 0.9), uv.y);
  
  // Dune layers
  float ground = 0.0;
  vec3 sandCol = vec3(0.0);
  
  for (float i = 0.0; i < 4.0; i++) {
    float depth = i / 4.0;
    float scale = 2.0 + i * 1.5;
    float height = 0.2 + i * 0.1;
    float duneY = height + fbm(vec2(uv.x * scale + t + i * 3.0, i)) * 0.15;
    
    if (uv.y < duneY) {
      float light = 0.6 + 0.4 * fbm(vec2(uv.x * scale * 2.0 + t, i + 10.0));
      vec3 c = mix(vec3(0.85, 0.65, 0.35), vec3(0.7, 0.5, 0.25), depth);
      c *= light;
      sandCol = c;
      ground = 1.0;
    }
  }
  
  vec3 col = mix(sky, sandCol, ground);
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
];
