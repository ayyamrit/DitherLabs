import type { DitherShaderDef } from './ditherShaders';

export const shaderPack30: DitherShaderDef[] = [
  {
    id: 'tron-grid',
    name: 'Tron Grid',
    description: 'Infinite perspective grid with light cycles',
    tags: ['retro', '3D', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
  vec2 p=uv*2.0-1.0;p.x*=u_resolution.x/u_resolution.y;
  vec3 col=vec3(0.0,0.01,0.03);
  // Perspective grid
  if(p.y<0.0){
    float gy=-0.3/p.y;float gx=p.x*gy;
    float gridX=smoothstep(0.04,0.0,abs(fract(gx+0.5)-0.5));
    float gridZ=smoothstep(0.04,0.0,abs(fract(gy*0.5-t*0.5+0.5)-0.5));
    float grid=max(gridX,gridZ);
    float fade=exp(-abs(p.y)*2.0)*0.8;
    col+=vec3(0.0,0.6,0.9)*grid*fade/(gy*0.1+1.0);
    // Light cycle trail
    float trail=smoothstep(0.03,0.0,abs(gx-sin(t*0.3)*2.0));
    trail*=smoothstep(5.0,1.0,gy);
    col+=vec3(1.0,0.4,0.0)*trail*0.8;
  }
  // Horizon glow
  col+=vec3(0.0,0.3,0.5)*0.02/(abs(p.y)+0.02);
  // Sky elements
  for(float i=0.0;i<3.0;i++){
    float y=0.3+i*0.15;float x=sin(t*0.2+i)*0.5;
    float d=length(p-vec2(x,y));
    col+=vec3(0.0,0.5,0.8)*0.005/(d+0.01);
  }
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'watercolor-bloom',
    name: 'Watercolor Bloom',
    description: 'Soft watercolor paint blooming on wet paper',
    tags: ['artistic', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(0.8,0.6,-0.6,0.8);for(int i=0;i<6;i++){v+=a*noise(p);p=m*p*2.0;a*=0.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.15;
  // Paper texture
  vec3 col=vec3(0.95,0.93,0.88)-hash(uv*800.0)*0.04;
  // Paint blooms
  for(float i=0.0;i<5.0;i++){
    vec2 center=vec2(0.2+i*0.15,0.3+sin(i*2.0)*0.2);
    vec2 d=(uv-center)*3.0;
    float f=fbm(d+vec2(t+i*3.0));
    float bloom=smoothstep(0.7,0.3,length(d)/(0.5+f*0.5));
    bloom*=0.3+0.7*fbm(d*2.0+f+i);
    vec3 paint;
    if(i<1.0) paint=vec3(0.8,0.2,0.3);
    else if(i<2.0) paint=vec3(0.2,0.5,0.8);
    else if(i<3.0) paint=vec3(0.9,0.7,0.1);
    else if(i<4.0) paint=vec3(0.3,0.7,0.4);
    else paint=vec3(0.7,0.3,0.7);
    // Watercolor transparency
    float alpha=bloom*0.4;
    col=mix(col,paint,alpha);
    // Edge darkening
    float edge=smoothstep(0.02,0.0,abs(bloom-0.15));
    col-=vec3(0.1)*edge;
  }
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'particle-galaxy',
    name: 'Particle Galaxy',
    description: 'Swirling galaxy made of glowing particles',
    tags: ['space', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=uv*2.0-1.0;p.x*=u_resolution.x/u_resolution.y;
  float t=u_time*0.2;
  vec3 col=vec3(0.0,0.0,0.01);
  float r=length(p);float a=atan(p.y,p.x);
  // Spiral arms
  for(float i=0.0;i<200.0;i++){
    float id=i;
    float pr=hash(vec2(id,0.0))*0.9;
    float pa=hash(vec2(0.0,id))*6.2832;
    // Spiral offset
    pa+=pr*4.0+t;
    pa+=sin(pr*10.0+t)*0.3;
    vec2 sp=vec2(cos(pa),sin(pa))*pr;
    float d=length(p-sp);
    float brightness=hash(vec2(id,id));
    float twinkle=0.7+0.3*sin(t*3.0+id*7.0);
    vec3 starCol=mix(vec3(0.5,0.7,1.0),vec3(1.0,0.8,0.5),hash(vec2(id,1.0)));
    col+=starCol*brightness*twinkle*0.003/(d*d+0.001);
  }
  // Core glow
  col+=vec3(0.8,0.7,0.5)*0.05/(r*r+0.05);
  col+=vec3(0.3,0.2,0.5)*0.02/(r+0.1);
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'tesla-coil',
    name: 'Tesla Coil',
    description: 'Arcing electricity from a central coil',
    tags: ['energy', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
float hash(float n){return fract(sin(n)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);float n=i.x+i.y*57.0;return mix(mix(hash(n),hash(n+1.0),f.x),mix(hash(n+57.0),hash(n+58.0),f.x),f.y);}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=uv*2.0-1.0;p.x*=u_resolution.x/u_resolution.y;
  float t=u_time;vec3 col=vec3(0.01,0.01,0.03);
  // Coil base
  float coil=smoothstep(0.05,0.03,abs(p.x))*step(p.y,-0.3)*step(-0.6,p.y);
  col+=vec3(0.2,0.15,0.1)*coil;
  // Top sphere
  float sphere=smoothstep(0.08,0.06,length(p-vec2(0.0,-0.25)));
  col+=vec3(0.3,0.3,0.35)*sphere;
  // Lightning arcs
  vec2 origin=vec2(0.0,-0.25);
  for(float i=0.0;i<8.0;i++){
    float angle=i*0.785+sin(t*2.0+i)*0.3;
    float len=0.3+0.2*sin(t*3.0+i*2.0);
    for(float j=0.0;j<20.0;j++){
      float frac=j/20.0;
      vec2 target=origin+vec2(cos(angle),sin(angle))*len;
      vec2 bp=mix(origin,target,frac);
      float jitter=noise(vec2(frac*15.0,t*10.0+i*100.0))*0.08-0.04;
      bp+=vec2(cos(angle+1.57),sin(angle+1.57))*jitter;
      float d=length(p-bp);
      float bright=1.0-frac*0.5;
      col+=vec3(0.4,0.5,1.0)*bright*0.002/(d+0.003);
    }
  }
  // Central glow
  col+=vec3(0.3,0.4,1.0)*0.015/(length(p-origin)+0.02);
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'stained-glass',
    name: 'Stained Glass',
    description: 'Illuminated stained glass window with light rays',
    tags: ['artistic', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.1;
  vec2 p=uv*8.0;vec2 ip=floor(p);vec2 fp=fract(p);
  // Voronoi for glass panes
  float md=10.0;vec2 mc;float mid=0.0;
  for(float j=-1.0;j<=1.0;j++)for(float i=-1.0;i<=1.0;i++){
    vec2 g=vec2(i,j);vec2 o=hash2(ip+g);
    o=0.5+0.4*sin(t*0.5+6.2832*o);
    vec2 r=g+o-fp;float d=length(r);
    if(d<md){md=d;mc=r;mid=dot(ip+g,vec2(7.0,113.0));}
  }
  // Glass color
  float hue=fract(mid*0.1+t*0.05);
  vec3 glass=vec3(
    0.4+0.4*sin(hue*6.28+0.0),
    0.4+0.4*sin(hue*6.28+2.094),
    0.4+0.4*sin(hue*6.28+4.188)
  );
  glass=mix(glass,glass*1.5,0.3);
  // Lead lines
  float edge=smoothstep(0.05,0.02,md-0.0);
  float lead=1.0-smoothstep(0.0,0.06,abs(md-0.0));
  // Light coming through
  float light=0.6+0.4*sin(t+mid);
  glass*=light;
  vec3 col=mix(glass,vec3(0.15),lead*0.8);
  // Bright center glow
  float glow=smoothstep(1.5,0.0,length(uv-0.5))*0.2;
  col+=vec3(1.0,0.9,0.7)*glow;
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'sound-wave',
    name: 'Sound Wave',
    description: 'Audio waveform visualization with frequency bands',
    tags: ['music', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
float hash(float n){return fract(sin(n)*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
  vec3 col=vec3(0.02,0.01,0.05);
  // Frequency bars
  float bars=40.0;
  float barW=1.0/bars;
  float barIdx=floor(uv.x*bars);
  float barCenter=(barIdx+0.5)/bars;
  float inBar=step(barW*0.1,abs(uv.x-barCenter));
  // Simulated frequency
  float freq=0.0;
  freq+=sin(t*2.0+barIdx*0.3)*0.2;
  freq+=sin(t*3.7+barIdx*0.1)*0.15;
  freq+=sin(t*5.3+barIdx*0.5)*0.1;
  freq+=hash(barIdx+floor(t*4.0))*0.1;
  freq=abs(freq)*1.5;
  // Center the waveform
  float barH=freq;
  float barY=abs(uv.y-0.5);
  float bar=step(barY,barH*0.5)*(1.0-inBar);
  // Color by frequency
  vec3 barCol=mix(vec3(0.0,0.8,0.4),vec3(1.0,0.2,0.3),barY/0.5);
  barCol=mix(barCol,vec3(1.0,0.8,0.2),smoothstep(0.3,0.5,barH));
  col+=barCol*bar;
  // Glow
  col+=barCol*0.01/(barY-barH*0.5+0.02)*(1.0-inBar)*0.1;
  // Waveform line
  float wave=0.5+sin(uv.x*20.0+t*3.0)*0.1*sin(uv.x*5.0-t);
  float waveLine=smoothstep(0.005,0.0,abs(uv.y-wave));
  col+=vec3(0.3,0.5,1.0)*waveLine*0.5;
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'hologram-sphere',
    name: 'Hologram Sphere',
    description: 'Rotating wireframe hologram sphere projection',
    tags: ['3D', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
#define PI 3.14159265
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=uv*2.0-1.0;p.x*=u_resolution.x/u_resolution.y;
  float t=u_time*0.5;vec3 col=vec3(0.0,0.01,0.03);
  float r=length(p);
  // Sphere outline
  float sphere=smoothstep(0.52,0.5,r)-smoothstep(0.5,0.48,r);
  col+=vec3(0.0,0.6,0.8)*sphere;
  // Latitude lines
  if(r<0.5){
    float phi=asin(p.y/0.5);
    float theta=atan(p.x,sqrt(0.25-p.x*p.x-p.y*p.y));
    for(float i=-3.0;i<=3.0;i++){
      float lat=i*0.35;
      float d=abs(phi-lat);
      float latLine=smoothstep(0.02,0.005,d);
      col+=vec3(0.0,0.4,0.6)*latLine*0.5;
    }
    // Longitude lines
    for(float i=0.0;i<8.0;i++){
      float lon=i*PI/4.0+t;
      float projX=cos(lon)*sqrt(0.25-p.y*p.y);
      float d=abs(p.x-projX);
      float lonLine=smoothstep(0.015,0.003,d);
      lonLine*=step(0.0,cos(lon-atan(p.x,sqrt(max(0.0,0.25-p.x*p.x-p.y*p.y)))));
      col+=vec3(0.0,0.4,0.6)*lonLine*0.5;
    }
  }
  // Scanline effect
  col*=0.8+0.2*sin(uv.y*u_resolution.y*0.5);
  // Flicker
  col*=0.95+0.05*sin(t*20.0);
  // Base glow
  col+=vec3(0.0,0.2,0.3)*0.03/(r+0.1);
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'candy-swirl',
    name: 'Candy Swirl',
    description: 'Sweet colorful candy spiral pattern',
    tags: ['fun', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=uv*2.0-1.0;p.x*=u_resolution.x/u_resolution.y;
  float t=u_time*0.4;
  float r=length(p);float a=atan(p.y,p.x);
  // Spiral
  float spiral=fract((a/(6.2832)+0.5)+r*2.0-t*0.3);
  float bands=floor(spiral*6.0);
  vec3 col;
  if(bands<1.0) col=vec3(1.0,0.3,0.4);
  else if(bands<2.0) col=vec3(1.0,0.7,0.2);
  else if(bands<3.0) col=vec3(0.3,0.9,0.4);
  else if(bands<4.0) col=vec3(0.3,0.6,1.0);
  else if(bands<5.0) col=vec3(0.8,0.3,0.9);
  else col=vec3(1.0,1.0,1.0);
  // Glossy highlight
  float highlight=smoothstep(0.8,0.2,r)*0.3;
  col+=vec3(highlight);
  // Soft shadow at edges
  col*=smoothstep(1.2,0.5,r);
  // Sparkle
  float sparkle=sin(a*20.0+r*30.0-t*5.0)*0.5+0.5;
  sparkle=pow(sparkle,10.0);
  col+=vec3(1.0)*sparkle*0.15*smoothstep(1.0,0.3,r);
  gl_FragColor=vec4(col,1.0);
}`
  },
];
