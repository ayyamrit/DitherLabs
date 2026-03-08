import type { DitherShaderDef } from './ditherShaders';

export const shaderPack27: DitherShaderDef[] = [
  {
    id: 'neon-tunnel',
    name: 'Neon Tunnel',
    description: 'Flying through a glowing neon wireframe tunnel',
    tags: ['3D', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;
  
  float t = u_time * 0.8;
  vec3 col = vec3(0.0);
  
  for (float i = 0.0; i < 20.0; i++) {
    float z = 20.0 - mod(i + t * 3.0, 20.0);
    float scale = 5.0 / z;
    vec2 tp = p * scale;
    
    // Octagonal tunnel shape
    float d = max(abs(tp.x), abs(tp.y));
    d = max(d, (abs(tp.x) + abs(tp.y)) * 0.707);
    
    float ring = abs(d - 1.0);
    float brightness = smoothstep(0.06, 0.0, ring) / (z * 0.15);
    
    float hue = fract(i * 0.1 + t * 0.2);
    vec3 c = vec3(
      0.5 + 0.5 * sin(hue * 6.28),
      0.5 + 0.5 * sin(hue * 6.28 + 2.094),
      0.5 + 0.5 * sin(hue * 6.28 + 4.188)
    );
    
    col += c * brightness;
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'ink-wash',
    name: 'Ink Wash',
    description: 'Japanese ink wash painting style fluid motion',
    tags: ['artistic', 'animated', 'premium'],
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
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 6; i++) { v += a * noise(p); p = rot * p * 2.0; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float t = u_time * 0.15;
  
  // Paper background
  vec3 paper = vec3(0.92, 0.90, 0.85);
  paper -= hash(uv * 500.0) * 0.03;
  
  float ink = 0.0;
  vec2 p = uv * 3.0;
  
  // Flowing ink shapes
  float f1 = fbm(p + vec2(t, 0.0));
  float f2 = fbm(p + vec2(0.0, t * 0.7) + f1 * 0.5);
  ink = smoothstep(0.4, 0.6, f2);
  
  // Edge darkening
  float edge = fbm(p * 2.0 + f2);
  float edgeLine = smoothstep(0.48, 0.52, f2) * (1.0 - smoothstep(0.52, 0.56, f2));
  ink = max(ink * 0.3, edgeLine * 0.8);
  
  // Splatter
  float splat = step(0.92, hash(floor(uv * 60.0)));
  ink = max(ink, splat * smoothstep(0.3, 0.7, fbm(uv * 10.0 + t)));
  
  vec3 col = mix(paper, vec3(0.05), ink);
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'molten-metal',
    name: 'Molten Metal',
    description: 'Flowing liquid metal with bright reflections',
    tags: ['metallic', 'animated', 'premium'],
    featured: true,
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
  
  vec2 p = uv * 4.0;
  float f1 = fbm(p + vec2(t, t * 0.5));
  float f2 = fbm(p + f1 * 1.5 + vec2(t * 0.3, -t * 0.2));
  
  // Base metal color
  vec3 col = mix(vec3(0.15, 0.12, 0.1), vec3(0.6, 0.4, 0.2), f2);
  
  // Hot spots
  float hot = smoothstep(0.55, 0.8, f2);
  col = mix(col, vec3(1.0, 0.6, 0.1), hot);
  col = mix(col, vec3(1.0, 0.9, 0.5), smoothstep(0.75, 0.95, f2));
  
  // Metallic reflection
  float ref = fbm(p * 3.0 + f2 * 2.0);
  float highlight = smoothstep(0.6, 0.8, ref) * 0.5;
  col += vec3(0.8, 0.7, 0.5) * highlight;
  
  // Dark cracks
  float crack = smoothstep(0.02, 0.0, abs(f1 - 0.5) * (1.0 - hot));
  col *= 1.0 - crack * 0.5;
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'retro-sun',
    name: 'Retro Sun',
    description: 'Synthwave sunset with scanlines and reflection',
    tags: ['retro', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  
  // Sky gradient
  vec3 col = mix(vec3(0.1, 0.0, 0.2), vec3(0.9, 0.2, 0.4), 1.0 - uv.y);
  
  // Sun
  vec2 sunPos = vec2(0.5, 0.55);
  float sunR = length(uv - sunPos) / 0.2;
  
  if (sunR < 1.0) {
    vec3 sunCol = mix(vec3(1.0, 0.9, 0.2), vec3(1.0, 0.3, 0.1), sunR);
    // Horizontal slices
    float slice = step(0.5, fract(uv.y * 25.0 - u_time * 0.3));
    float cutoff = smoothstep(0.3, 0.7, 1.0 - uv.y / sunPos.y);
    sunCol *= mix(1.0, slice, cutoff);
    col = sunCol;
  }
  
  // Grid floor
  if (uv.y < 0.45) {
    float gy = 0.45 - uv.y;
    float perspective = 0.02 / (gy + 0.001);
    float gx = (uv.x - 0.5) * perspective;
    
    float lineX = smoothstep(0.03, 0.0, abs(fract(gx + 0.5) - 0.5));
    float lineY = smoothstep(0.03, 0.0, abs(fract(perspective * 0.1 - u_time * 0.5) - 0.5));
    
    float grid = max(lineX, lineY);
    vec3 gridCol = vec3(0.8, 0.1, 0.8) * grid * (0.3 + 0.7 / (perspective * 0.1));
    
    col = mix(vec3(0.05, 0.0, 0.1), gridCol, min(grid, 1.0));
    col += vec3(0.4, 0.1, 0.2) * 0.02 / (gy + 0.01);
  }
  
  // Scanlines
  col *= 0.9 + 0.1 * sin(gl_FragCoord.y * 2.0);
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'snowfall',
    name: 'Snowfall',
    description: 'Gentle snow falling with depth-of-field blur',
    tags: ['weather', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  
  // Night sky
  vec3 col = mix(vec3(0.02, 0.03, 0.08), vec3(0.08, 0.1, 0.18), uv.y);
  
  for (float layer = 0.0; layer < 4.0; layer++) {
    float depth = 1.0 + layer;
    float speed = 0.15 / depth;
    float size = 0.004 * depth;
    float count = 30.0 + layer * 20.0;
    
    for (float i = 0.0; i < 80.0; i++) {
      if (i >= count) break;
      float id = i + layer * 100.0;
      float x = hash(vec2(id, 0.0));
      float startY = hash(vec2(id, 1.0));
      
      float y = 1.0 - mod(u_time * speed + startY, 1.2);
      x += sin(u_time * 0.5 + id) * 0.02 / depth;
      
      vec2 snowPos = vec2(x, y);
      float d = length((uv - snowPos) * vec2(u_resolution.x / u_resolution.y, 1.0));
      
      float flake = smoothstep(size, size * 0.2, d);
      float alpha = 0.3 + 0.7 / depth;
      col += vec3(alpha) * flake * 0.5 / depth;
    }
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'wormhole',
    name: 'Wormhole',
    description: 'Spiraling spacetime distortion vortex',
    tags: ['space', '3D', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define PI 3.14159265

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;
  
  float r = length(p);
  float a = atan(p.y, p.x);
  float t = u_time;
  
  // Spiral distortion
  a += 3.0 / (r + 0.1) + t * 0.5;
  
  vec3 col = vec3(0.0);
  
  // Ring layers
  for (float i = 0.0; i < 8.0; i++) {
    float ringR = 0.1 + i * 0.12;
    float d = abs(r - ringR);
    
    // Spiral modulation
    float wave = sin(a * (3.0 + i) + t * 2.0) * 0.5 + 0.5;
    float brightness = wave * smoothstep(0.04, 0.0, d);
    
    float hue = fract(i * 0.125 + t * 0.1);
    vec3 c = vec3(
      0.5 + 0.5 * sin(hue * 6.28 + 0.0),
      0.5 + 0.5 * sin(hue * 6.28 + 2.094),
      0.5 + 0.5 * sin(hue * 6.28 + 4.188)
    );
    
    col += c * brightness * 0.8;
  }
  
  // Center glow
  col += vec3(0.5, 0.7, 1.0) * 0.03 / (r + 0.03);
  
  // Stars behind
  vec2 starP = vec2(a / (2.0 * PI), r);
  float star = step(0.97, hash(floor(starP * 50.0)));
  col += vec3(star) * 0.3 * smoothstep(0.5, 1.5, r);
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'pixel-ocean',
    name: 'Pixel Ocean',
    description: 'Stylized pixelated ocean waves',
    tags: ['retro', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  float pixelSize = 40.0;
  vec2 pix = floor(uv * pixelSize) / pixelSize;
  
  float t = u_time * 0.6;
  
  // Wave layers
  float wave = 0.0;
  wave += sin(pix.x * 8.0 + t) * 0.06;
  wave += sin(pix.x * 12.0 - t * 1.3) * 0.04;
  wave += sin(pix.x * 20.0 + t * 0.7) * 0.02;
  
  float waterLine = 0.4 + wave;
  
  // Sky
  vec3 col = mix(vec3(0.4, 0.6, 0.9), vec3(0.7, 0.85, 1.0), pix.y);
  
  if (pix.y < waterLine) {
    float depth = (waterLine - pix.y) / waterLine;
    vec3 shallow = vec3(0.1, 0.5, 0.7);
    vec3 deep = vec3(0.02, 0.1, 0.25);
    col = mix(shallow, deep, depth);
    
    // Foam
    float foam = smoothstep(0.02, 0.0, abs(pix.y - waterLine + 0.01));
    col = mix(col, vec3(0.85, 0.92, 0.95), foam);
    
    // Light shafts
    float shaft = sin(pix.x * 15.0 + t * 0.5) * 0.5 + 0.5;
    shaft *= (1.0 - depth) * 0.15;
    col += vec3(0.1, 0.2, 0.15) * shaft;
  }
  
  // Sun
  float sun = smoothstep(0.15, 0.0, length(pix - vec2(0.75, 0.85)));
  col += vec3(1.0, 0.9, 0.5) * sun;
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
  {
    id: 'geometric-morph',
    name: 'Geometric Morph',
    description: 'Shapes morphing between geometric forms',
    tags: ['geometric', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

#define PI 3.14159265

float sdCircle(vec2 p, float r) { return length(p) - r; }
float sdBox(vec2 p, vec2 b) { vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdTriangle(vec2 p, float r) {
  float a = atan(p.x, p.y) + PI;
  float seg = PI * 2.0 / 3.0;
  a = mod(a, seg) - seg * 0.5;
  return length(p) * cos(a) - r * 0.5;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  vec2 p = uv * 2.0 - 1.0;
  p.x *= u_resolution.x / u_resolution.y;
  
  float t = u_time * 0.5;
  float morph = sin(t) * 0.5 + 0.5;
  float morph2 = sin(t * 0.7 + 1.0) * 0.5 + 0.5;
  
  vec3 col = vec3(0.05);
  
  for (float i = 0.0; i < 5.0; i++) {
    float scale = 0.8 - i * 0.12;
    float rot = t * (0.3 + i * 0.1);
    
    mat2 R = mat2(cos(rot), -sin(rot), sin(rot), cos(rot));
    vec2 rp = R * p;
    
    float d1 = sdCircle(rp, scale);
    float d2 = sdBox(rp, vec2(scale * 0.75));
    float d3 = sdTriangle(rp, scale * 1.5);
    
    float d = mix(mix(d1, d2, morph), d3, morph2);
    
    float line = smoothstep(0.02, 0.0, abs(d));
    float fill = smoothstep(0.01, -0.1, d) * 0.1;
    
    float hue = fract(i * 0.2 + t * 0.1);
    vec3 c = vec3(
      0.5 + 0.5 * sin(hue * 6.28),
      0.5 + 0.5 * sin(hue * 6.28 + 2.094),
      0.5 + 0.5 * sin(hue * 6.28 + 4.188)
    );
    
    col += c * (line + fill);
  }
  
  gl_FragColor = vec4(col, 1.0);
}
`
  },
];
