import type { DitherShaderDef } from './ditherShaders';

export const shaderPack29: DitherShaderDef[] = [
  {
    id: 'black-hole',
    name: 'Black Hole',
    description: 'Gravitational lensing around an event horizon',
    tags: ['space', '3D', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=uv*2.0-1.0;p.x*=u_resolution.x/u_resolution.y;
  float r=length(p);float a=atan(p.y,p.x);float t=u_time*0.3;
  // Gravitational lensing
  float bend=0.15/(r+0.05);
  a+=bend+t*0.2;
  vec3 col=vec3(0.0);
  // Accretion disk
  float diskR=r*3.0;float diskA=a*3.0+t;
  float disk=smoothstep(0.8,1.0,diskR)-smoothstep(2.5,3.0,diskR);
  float spiral=sin(diskA+diskR*4.0-t*3.0)*0.5+0.5;
  disk*=0.5+0.5*spiral;
  vec3 hot=mix(vec3(1.0,0.3,0.05),vec3(1.0,0.8,0.3),spiral);
  col+=hot*disk*(1.0/(diskR*0.5+0.3));
  // Event horizon
  float hole=smoothstep(0.15,0.1,r);
  col*=1.0-hole;
  // Stars
  vec2 sp=vec2(a/(6.283)+0.5,r);
  float star=step(0.98,hash(floor(sp*80.0)));
  col+=vec3(star)*0.4*smoothstep(0.3,1.0,r)*(1.0-disk);
  // Glow ring
  col+=vec3(1.0,0.5,0.1)*0.02/(abs(r-0.18)+0.01);
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'fireflies',
    name: 'Fireflies',
    description: 'Gentle glowing fireflies drifting in darkness',
    tags: ['nature', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec3 col=mix(vec3(0.01,0.02,0.04),vec3(0.02,0.04,0.02),uv.y);
  float t=u_time;
  for(float i=0.0;i<30.0;i++){
    float id=i;
    vec2 pos=vec2(hash(vec2(id,0.0)),hash(vec2(0.0,id)));
    pos+=vec2(sin(t*0.3+id*1.7)*0.1,cos(t*0.2+id*2.3)*0.08);
    pos=fract(pos);
    float phase=sin(t*(1.0+hash(vec2(id,id))*2.0)+id*3.0);
    float glow=max(0.0,phase)*0.8+0.2*max(0.0,phase);
    float d=length((uv-pos)*vec2(u_resolution.x/u_resolution.y,1.0));
    col+=vec3(0.8,0.9,0.2)*glow*0.004/(d*d+0.001);
    col+=vec3(0.4,0.6,0.1)*glow*0.008/(d+0.02);
  }
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'glitch-vhs',
    name: 'VHS Glitch',
    description: 'Retro VHS tape distortion with tracking errors',
    tags: ['glitch', 'retro', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
float hash(float n){return fract(sin(n)*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);float n=i.x+i.y*57.0;return mix(mix(hash(n),hash(n+1.0),f.x),mix(hash(n+57.0),hash(n+58.0),f.x),f.y);}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
  // Scanlines
  float scan=sin(uv.y*u_resolution.y*1.5)*0.04;
  // Tracking glitch
  float glitchLine=step(0.98,hash(floor(uv.y*20.0)+floor(t*4.0)));
  float offset=glitchLine*(hash(floor(t*8.0)+uv.y*3.0)-0.5)*0.15;
  vec2 ruv=uv+vec2(offset,0.0);
  // Color channels
  float r=noise(ruv*vec2(8.0,4.0)+vec2(t*0.5,0.0));
  float g=noise((ruv+vec2(0.005,0.0))*vec2(8.0,4.0)+vec2(t*0.5,0.0));
  float b=noise((ruv-vec2(0.005,0.0))*vec2(8.0,4.0)+vec2(t*0.5,0.0));
  vec3 col=vec3(r*0.6,g*0.7,b*0.9);
  // Static noise
  float staticN=hash(uv.x*1000.0+uv.y*5000.0+t*100.0);
  float staticStrength=glitchLine*0.5+0.03;
  col=mix(col,vec3(staticN),staticStrength);
  col+=scan;
  // Vignette
  col*=0.7+0.3*smoothstep(0.0,0.5,min(uv.x,min(uv.y,min(1.0-uv.x,1.0-uv.y))));
  // Color bleed
  col.r+=smoothstep(0.5,0.0,abs(uv.y-fract(t*0.1)))*0.1;
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'coral-reef',
    name: 'Coral Reef',
    description: 'Underwater coral with swaying motion and caustics',
    tags: ['nature', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.4;
  // Water color
  vec3 col=mix(vec3(0.0,0.15,0.3),vec3(0.0,0.08,0.2),uv.y);
  // Caustics
  float c1=fbm(uv*8.0+vec2(t*0.3,t*0.2));
  float c2=fbm(uv*8.0+vec2(-t*0.2,t*0.3)+c1);
  float caustic=pow(c2,3.0)*2.0;
  col+=vec3(0.1,0.2,0.15)*caustic;
  // Coral branches
  for(float i=0.0;i<6.0;i++){
    float cx=0.1+i*0.15;float baseY=0.0;
    float sway=sin(t+i*2.0)*0.02;
    for(float j=0.0;j<15.0;j++){
      float frac=j/15.0;
      float bx=cx+sway*frac+sin(frac*5.0+i)*0.03;
      float by=baseY+frac*0.35;
      float d=length((uv-vec2(bx,by))*vec2(u_resolution.x/u_resolution.y,1.0));
      float w=0.012*(1.0-frac*0.5);
      float branch=smoothstep(w,w*0.3,d);
      vec3 coralCol=mix(vec3(0.9,0.3,0.2),vec3(1.0,0.6,0.1),hash(vec2(i,0.0)));
      coralCol=mix(coralCol,vec3(0.8,0.2,0.5),hash(vec2(0.0,i)));
      col=mix(col,coralCol,branch);
    }
  }
  // Bubbles
  for(float i=0.0;i<8.0;i++){
    float bx=hash(vec2(i,1.0));
    float by=fract(t*0.1*hash(vec2(i,2.0))+hash(vec2(i,3.0)));
    float d=length((uv-vec2(bx,by))*vec2(u_resolution.x/u_resolution.y,1.0));
    col+=vec3(0.2,0.4,0.5)*0.003/(d+0.005);
  }
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'sine-wave-terrain',
    name: 'Sine Terrain',
    description: 'Layered sine wave mountains with parallax',
    tags: ['landscape', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
  vec3 col=mix(vec3(0.05,0.0,0.15),vec3(0.3,0.1,0.4),uv.y);
  // Sun/moon
  float sun=smoothstep(0.12,0.0,length(uv-vec2(0.7,0.8)));
  col+=vec3(1.0,0.7,0.3)*sun;
  // Mountain layers
  for(float i=5.0;i>=0.0;i--){
    float depth=i/5.0;
    float speed=t*(0.5+depth*0.5);
    float height=0.15+depth*0.1;
    float y=height;
    y+=sin(uv.x*4.0+speed+i)*0.06;
    y+=sin(uv.x*8.0-speed*0.7+i*2.0)*0.03;
    y+=sin(uv.x*16.0+speed*0.3+i*4.0)*0.015;
    float mountain=smoothstep(y,y+0.005,uv.y);
    float dark=0.05+depth*0.15;
    vec3 mCol=mix(vec3(0.02,0.0,0.05+depth*0.1),vec3(dark,dark*0.5,dark*1.5),0.5);
    col=mix(mCol,col,mountain);
  }
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'voronoi-crystals',
    name: 'Voronoi Crystals',
    description: 'Animated crystalline Voronoi tessellation',
    tags: ['geometric', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
  vec2 p=uv*6.0;vec2 ip=floor(p);vec2 fp=fract(p);
  float md=10.0;float md2=10.0;vec2 mg;float id=0.0;
  for(float j=-1.0;j<=1.0;j++)for(float i=-1.0;i<=1.0;i++){
    vec2 g=vec2(i,j);vec2 o=hash2(ip+g);
    o=0.5+0.5*sin(t+6.2831*o);
    vec2 r=g+o-fp;float d=dot(r,r);
    if(d<md){md2=md;md=d;mg=r;id=dot(ip+g,vec2(7.0,113.0));}
    else if(d<md2){md2=d;}
  }
  float edge=md2-md;
  float edgeLine=smoothstep(0.0,0.05,edge);
  vec3 cellCol=vec3(
    0.3+0.3*sin(id*1.2+t),
    0.3+0.3*sin(id*1.7+t+2.0),
    0.5+0.3*sin(id*2.3+t+4.0)
  );
  vec3 col=cellCol*edgeLine;
  col+=vec3(0.8,0.9,1.0)*(1.0-edgeLine)*0.8;
  col+=vec3(0.1)*smoothstep(0.3,0.0,md);
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'heat-haze',
    name: 'Heat Haze',
    description: 'Shimmering desert heat distortion effect',
    tags: ['nature', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
  // Distortion
  float haze=noise(vec2(uv.x*3.0,uv.y*10.0-t*2.0))*0.02;
  haze*=smoothstep(0.6,0.2,uv.y);
  vec2 duv=uv+vec2(haze,haze*0.5);
  // Sky
  vec3 col=mix(vec3(0.9,0.7,0.4),vec3(0.5,0.7,0.95),duv.y);
  // Sun
  col+=vec3(1.0,0.9,0.5)*smoothstep(0.15,0.0,length(duv-vec2(0.5,0.85)));
  // Ground
  if(duv.y<0.35){
    float sand=noise(duv*vec2(20.0,5.0))*0.1;
    col=vec3(0.8+sand,0.65+sand,0.4+sand);
    col*=0.8+0.2*noise(duv*50.0);
  }
  // Heat shimmer lines
  float shimmer=sin(uv.y*100.0-t*15.0)*0.5+0.5;
  shimmer*=smoothstep(0.5,0.3,uv.y)*smoothstep(0.15,0.3,uv.y);
  col+=vec3(0.05)*shimmer;
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'northern-pulse',
    name: 'Northern Pulse',
    description: 'Pulsating aurora with magnetic field lines',
    tags: ['nature', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
  vec3 col=mix(vec3(0.0,0.0,0.02),vec3(0.0,0.02,0.08),uv.y);
  // Stars
  float star=step(0.98,hash(floor(uv*200.0)));
  col+=vec3(star)*0.5*(0.5+0.5*sin(t*3.0+hash(floor(uv*200.0))*10.0));
  // Aurora bands
  for(float i=0.0;i<4.0;i++){
    float baseY=0.5+i*0.08;
    float wave=fbm(vec2(uv.x*3.0+t+i,i))*0.15;
    float band=smoothstep(0.08,0.0,abs(uv.y-baseY-wave));
    float pulse=0.5+0.5*sin(t*2.0+i*1.5+uv.x*5.0);
    band*=pulse;
    vec3 auroraCol;
    if(i<1.0) auroraCol=vec3(0.1,0.8,0.3);
    else if(i<2.0) auroraCol=vec3(0.1,0.6,0.8);
    else if(i<3.0) auroraCol=vec3(0.5,0.2,0.8);
    else auroraCol=vec3(0.2,0.9,0.5);
    col+=auroraCol*band*0.6;
  }
  // Ground silhouette
  float ground=smoothstep(0.12,0.1,uv.y+sin(uv.x*10.0)*0.02);
  col*=1.0-ground*0.9;
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'cyberpunk-city',
    name: 'Cyberpunk City',
    description: 'Neon-lit cyberpunk skyline with rain',
    tags: ['urban', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
  // Sky
  vec3 col=mix(vec3(0.02,0.0,0.06),vec3(0.05,0.02,0.1),uv.y);
  // Buildings
  for(float i=0.0;i<15.0;i++){
    float x=hash(vec2(i,0.0));
    float w=0.03+hash(vec2(i,1.0))*0.05;
    float h=0.2+hash(vec2(i,2.0))*0.5;
    if(uv.x>x-w&&uv.x<x+w&&uv.y<h){
      vec3 bCol=vec3(0.03,0.02,0.05);
      // Windows
      vec2 wuv=vec2((uv.x-x+w)/(2.0*w),uv.y/h);
      float wx=step(0.5,fract(wuv.x*6.0));
      float wy=step(0.5,fract(wuv.y*12.0));
      float window=wx*wy;
      float lit=step(0.5,hash(floor(wuv*vec2(6.0,12.0))+floor(t*0.5)));
      vec3 windowCol=mix(vec3(1.0,0.8,0.2),vec3(0.2,0.8,1.0),hash(vec2(i,3.0)));
      bCol+=windowCol*window*lit*0.6;
      col=bCol;
    }
  }
  // Neon signs
  float neon1=smoothstep(0.01,0.0,abs(uv.y-0.35-sin(uv.x*20.0)*0.02));
  col+=vec3(1.0,0.1,0.3)*neon1*0.5;
  float neon2=smoothstep(0.01,0.0,abs(uv.y-0.25));
  float neon2x=step(0.3,uv.x)-step(0.5,uv.x);
  col+=vec3(0.1,0.5,1.0)*neon2*neon2x*0.4;
  // Rain
  for(float i=0.0;i<30.0;i++){
    float rx=hash(vec2(i,4.0));
    float ry=fract(hash(vec2(i,5.0))-t*hash(vec2(i,6.0))*0.5);
    float d=length((uv-vec2(rx,ry))*vec2(100.0,8.0));
    col+=vec3(0.3,0.4,0.6)*0.3*smoothstep(1.0,0.0,d);
  }
  // Fog
  col+=vec3(0.05,0.03,0.08)*smoothstep(0.3,0.0,uv.y);
  gl_FragColor=vec4(col,1.0);
}`
  },
  {
    id: 'fractal-tree',
    name: 'Fractal Tree',
    description: 'Growing fractal tree with swaying branches',
    tags: ['fractal', 'nature', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;uniform vec2 u_resolution;uniform vec2 u_mouse;
float line(vec2 p,vec2 a,vec2 b,float w){vec2 pa=p-a,ba=b-a;float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);return smoothstep(w,w*0.3,length(pa-ba*h));}
void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
  vec3 col=mix(vec3(0.05,0.08,0.15),vec3(0.15,0.1,0.2),uv.y);
  // Trunk and branches using iteration
  float tree=0.0;
  vec2 base=vec2(0.5,0.05);float angle=1.5708;float len=0.15;float w=0.012;
  // Simple recursive-like branching with loops
  for(float depth=0.0;depth<4.0;depth++){
    float branches=pow(2.0,depth);
    for(float i=0.0;i<16.0;i++){
      if(i>=branches) break;
      float idx=i;float a=1.5708;float cx=0.5;float cy=0.05;float cl=0.15;
      // Trace path
      float id2=idx;
      for(float d=0.0;d<depth;d++){
        float side=mod(id2,2.0);id2=floor(id2/2.0);
        float sway=sin(t+d*2.0+side)*0.1;
        float branchA=side<0.5?0.4+sway:-0.4+sway;
        a+=branchA;cl*=0.7;
        cx+=cos(a)*cl;cy+=sin(a)*cl;
      }
      vec2 start=vec2(cx,cy);
      float sway=sin(t+depth*2.0+i)*0.1;
      float ba=mod(idx,2.0)<0.5?0.4+sway:-0.4+sway;
      a+=ba;float nl=cl*0.7;
      vec2 end=start+vec2(cos(a),sin(a))*nl;
      float bw=w*pow(0.6,depth);
      tree+=line(uv,start,end,bw);
    }
  }
  tree=clamp(tree,0.0,1.0);
  col=mix(col,vec3(0.25,0.15,0.08),tree);
  // Leaves (particles at branch tips)
  for(float i=0.0;i<20.0;i++){
    float lx=0.3+fract(sin(i*127.1)*43758.0)*0.4;
    float ly=0.35+fract(sin(i*311.7)*43758.0)*0.4;
    ly+=sin(t+i)*0.01;
    float d=length((uv-vec2(lx,ly))*vec2(u_resolution.x/u_resolution.y,1.0));
    col+=vec3(0.2,0.6,0.15)*0.008/(d+0.01);
  }
  gl_FragColor=vec4(col,1.0);
}`
  },
];
