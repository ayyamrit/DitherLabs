import type { DitherShaderDef } from './ditherShaders';

export const shaderPack28: DitherShaderDef[] = [
  {
    id: 'liquid-mercury',
    name: 'Liquid Mercury',
    description: 'Shimmering mercury blobs merging and splitting',
    tags: ['liquid', 'metallic', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.1;a*=0.48;}return v;}

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=uv*2.0-1.0;
  p.x*=u_resolution.x/u_resolution.y;
  float t=u_time*0.4;

  // Metaball field
  float field=0.0;
  for(float i=0.0;i<7.0;i++){
    vec2 center=vec2(sin(t*0.7+i*2.2)*0.6,cos(t*0.5+i*1.8)*0.5);
    float r=0.15+0.05*sin(t+i);
    field+=r/length(p-center);
  }

  float blob=smoothstep(2.5,3.5,field);
  float edge=smoothstep(2.3,2.6,field)-smoothstep(3.3,3.6,field);

  // Mercury reflection
  vec2 n=vec2(
    fbm(p*3.0+vec2(t*0.3,0.0))-fbm(p*3.0-vec2(t*0.3,0.0)),
    fbm(p*3.0+vec2(0.0,t*0.3))-fbm(p*3.0-vec2(0.0,t*0.3))
  );
  float ref=fbm(p*5.0+n*2.0+t*0.2);

  vec3 col=vec3(0.02);
  vec3 mercury=mix(vec3(0.5,0.5,0.55),vec3(0.85,0.85,0.9),ref);
  mercury+=vec3(1.0)*smoothstep(0.65,0.8,ref)*0.4;
  mercury+=edge*vec3(0.9,0.92,0.95)*0.6;

  col=mix(col,mercury,blob);
  gl_FragColor=vec4(col,1.0);
}
`
  },
  {
    id: 'liquid-gold',
    name: 'Liquid Gold',
    description: 'Rich molten gold flowing with luminous highlights',
    tags: ['liquid', 'metallic', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(0.8,0.6,-0.6,0.8);for(int i=0;i<6;i++){v+=a*noise(p);p=m*p*2.0;a*=0.5;}return v;}

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  float t=u_time*0.25;
  vec2 p=uv*3.0;

  float f1=fbm(p+vec2(t,t*0.7));
  float f2=fbm(p+f1*1.5+vec2(-t*0.3,t*0.5));
  float f3=fbm(p*2.0+f2*0.8+vec2(t*0.2));

  vec3 dark=vec3(0.35,0.22,0.05);
  vec3 mid=vec3(0.75,0.55,0.1);
  vec3 bright=vec3(1.0,0.85,0.3);
  vec3 white=vec3(1.0,0.95,0.7);

  vec3 col=mix(dark,mid,smoothstep(0.3,0.6,f2));
  col=mix(col,bright,smoothstep(0.55,0.75,f2));
  col=mix(col,white,smoothstep(0.7,0.9,f3)*0.6);

  // Surface tension ripples
  float ripple=sin(f1*20.0+t*3.0)*0.5+0.5;
  col+=vec3(0.3,0.2,0.05)*ripple*smoothstep(0.4,0.6,f2)*0.15;

  gl_FragColor=vec4(col,1.0);
}
`
  },
  {
    id: 'liquid-chrome',
    name: 'Liquid Chrome',
    description: 'Reflective chrome liquid with environment mapping',
    tags: ['liquid', 'metallic', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.1;a*=0.5;}return v;}

vec3 envMap(vec2 n){
  float a=atan(n.y,n.x);
  float r=length(n);
  vec3 c1=vec3(0.1,0.15,0.3);
  vec3 c2=vec3(0.8,0.85,0.9);
  vec3 c3=vec3(0.3,0.1,0.05);
  float stripe=sin(a*4.0+r*5.0)*0.5+0.5;
  return mix(mix(c1,c2,stripe),c3,smoothstep(0.8,1.5,r));
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=uv*2.0-1.0;
  p.x*=u_resolution.x/u_resolution.y;
  float t=u_time*0.3;

  // Flowing normal map
  float eps=0.01;
  float h0=fbm(p*2.0+vec2(t,t*0.6));
  float hx=fbm((p+vec2(eps,0.0))*2.0+vec2(t,t*0.6));
  float hy=fbm((p+vec2(0.0,eps))*2.0+vec2(t,t*0.6));
  vec2 normal=vec2(h0-hx,h0-hy)/eps;

  // Second layer
  float h1=fbm(p*3.5+vec2(-t*0.4,t*0.3)+h0);
  float h1x=fbm((p+vec2(eps,0.0))*3.5+vec2(-t*0.4,t*0.3)+h0);
  float h1y=fbm((p+vec2(0.0,eps))*3.5+vec2(-t*0.4,t*0.3)+h0);
  normal+=vec2(h1-h1x,h1-h1y)/eps*0.5;

  vec3 col=envMap(normal*3.0);

  // Fresnel-like edge brightening
  float edge=1.0-smoothstep(0.0,1.5,length(normal));
  col+=vec3(0.9,0.92,0.95)*edge*0.3;

  // Specular highlights
  float spec=smoothstep(0.6,0.8,fbm(normal*8.0+t));
  col+=vec3(1.0)*spec*0.4;

  gl_FragColor=vec4(col,1.0);
}
`
  },
  {
    id: 'oil-slick',
    name: 'Oil Slick',
    description: 'Iridescent oil film with rainbow interference patterns',
    tags: ['liquid', 'iridescent', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(0.8,0.6,-0.6,0.8);for(int i=0;i<5;i++){v+=a*noise(p);p=m*p*2.0;a*=0.5;}return v;}

vec3 rainbow(float t){
  return vec3(
    0.5+0.5*sin(6.2832*t),
    0.5+0.5*sin(6.2832*(t+0.333)),
    0.5+0.5*sin(6.2832*(t+0.666))
  );
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  float t=u_time*0.2;
  vec2 p=uv*4.0;

  float f1=fbm(p+vec2(t,t*0.5));
  float f2=fbm(p*1.5+f1*2.0+vec2(-t*0.3));
  float thickness=f2;

  // Thin-film interference
  vec3 col=rainbow(thickness*2.0+t*0.3)*0.7;
  col+=rainbow(thickness*3.0-t*0.2)*0.3;

  // Dark base
  col*=0.5+0.5*smoothstep(0.3,0.7,f1);

  // Swirl motion
  float swirl=fbm(p*0.5+vec2(sin(t),cos(t))*0.5);
  col*=0.8+0.2*swirl;

  // Bright reflections
  float highlight=smoothstep(0.65,0.8,fbm(p*3.0+f2*3.0));
  col+=vec3(0.9)*highlight*0.3;

  // Darken edges for depth
  col*=0.6+0.4*smoothstep(0.0,0.4,min(uv.x,min(uv.y,min(1.0-uv.x,1.0-uv.y))));

  gl_FragColor=vec4(col,1.0);
}
`
  },
  {
    id: 'lava-lamp',
    name: 'Lava Lamp',
    description: 'Classic lava lamp with rising and falling blobs',
    tags: ['liquid', 'retro', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=uv*2.0-1.0;
  p.x*=u_resolution.x/u_resolution.y;
  float t=u_time*0.5;

  // Metaball blobs
  float field=0.0;
  for(float i=0.0;i<8.0;i++){
    float phase=t*0.4+i*1.3;
    float yy=sin(phase)*0.6;
    float xx=sin(phase*0.7+i)*0.25;
    float size=0.12+0.04*sin(t*0.3+i*2.0);
    vec2 blobPos=vec2(xx,yy);
    field+=size/length(p-blobPos);
  }

  float blob=smoothstep(2.0,3.0,field);
  float edge=smoothstep(1.8,2.2,field)-smoothstep(2.8,3.2,field);

  // Lamp container shape
  float container=smoothstep(0.5,0.48,abs(p.x)*(0.8+0.2*p.y*p.y));

  // Colors
  vec3 liquid=vec3(0.05,0.02,0.1);
  vec3 blobCol=mix(vec3(1.0,0.2,0.1),vec3(1.0,0.6,0.0),uv.y);
  blobCol+=edge*vec3(1.0,0.8,0.3)*0.5;

  // Internal glow
  float glow=smoothstep(1.5,2.5,field)*0.3;
  liquid+=vec3(0.3,0.05,0.1)*glow;

  vec3 col=mix(liquid,blobCol,blob);
  col*=container;

  // Glass reflection
  float glassEdge=smoothstep(0.48,0.46,abs(p.x)*(0.8+0.2*p.y*p.y));
  glassEdge-=smoothstep(0.46,0.42,abs(p.x)*(0.8+0.2*p.y*p.y));
  col+=vec3(0.15)*glassEdge;

  // Background
  col+=vec3(0.02,0.01,0.03)*(1.0-container);

  gl_FragColor=vec4(col,1.0);
}
`
  },
  {
    id: 'liquid-marble',
    name: 'Liquid Marble',
    description: 'Swirling marble veins in a liquid medium',
    tags: ['liquid', 'organic', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}

float marble(vec2 p,float t){
  float v=0.0;
  float a=0.5;
  mat2 m=mat2(0.8,0.6,-0.6,0.8);
  for(int i=0;i<7;i++){
    v+=a*noise(p);
    p=m*p*2.0+vec2(t*0.1);
    a*=0.5;
  }
  return v;
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  float t=u_time*0.3;
  vec2 p=uv*3.0;

  // Warped coordinates
  float warp1=marble(p+vec2(t,0.0),t);
  float warp2=marble(p+vec2(0.0,t*0.7),t);
  vec2 wp=p+vec2(warp1,warp2)*0.8;

  // Marble veins
  float vein=sin(wp.x*5.0+marble(wp*2.0,t)*6.0);
  vein=abs(vein);
  vein=pow(vein,0.3);

  vec3 base=vec3(0.9,0.88,0.85);
  vec3 veinCol=vec3(0.15,0.1,0.08);
  vec3 accent=vec3(0.6,0.5,0.35);

  vec3 col=mix(veinCol,base,vein);

  // Gold accent veins
  float goldVein=1.0-smoothstep(0.0,0.08,abs(sin(wp.y*8.0+warp1*4.0)));
  col=mix(col,accent,goldVein*0.4);

  // Subtle surface sheen
  float sheen=marble(uv*8.0+t*0.5,t);
  col+=vec3(0.05)*smoothstep(0.5,0.7,sheen);

  gl_FragColor=vec4(col,1.0);
}
`
  },
  {
    id: 'liquid-neon',
    name: 'Liquid Neon',
    description: 'Glowing neon liquid pooling and flowing',
    tags: ['liquid', 'neon', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.1;a*=0.5;}return v;}

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=uv*2.0-1.0;
  p.x*=u_resolution.x/u_resolution.y;
  float t=u_time*0.4;

  vec3 col=vec3(0.01);

  // Multiple neon liquid streams
  for(float i=0.0;i<3.0;i++){
    vec2 q=p;
    q+=vec2(sin(t*0.5+i*2.0),cos(t*0.3+i*1.7))*0.3;

    float f=fbm(q*2.0+vec2(t*(0.2+i*0.1),i));
    float f2=fbm(q*3.0+f*1.5+vec2(-t*0.15,i*3.0));

    float liquid=smoothstep(0.45,0.55,f2);
    float glow=smoothstep(0.3,0.55,f2);
    float bright=smoothstep(0.6,0.8,f2);

    vec3 neonCol;
    if(i<1.0) neonCol=vec3(0.0,1.0,0.8);
    else if(i<2.0) neonCol=vec3(1.0,0.0,0.6);
    else neonCol=vec3(0.2,0.5,1.0);

    col+=neonCol*glow*0.15;
    col+=neonCol*liquid*0.4;
    col+=vec3(1.0)*bright*0.2;
  }

  // Ambient glow on dark surface
  float surface=fbm(p*5.0+t*0.1);
  col+=vec3(0.02)*surface;

  gl_FragColor=vec4(col,1.0);
}
`
  },
  {
    id: 'liquid-glass',
    name: 'Liquid Glass',
    description: 'Transparent liquid glass with caustic refractions',
    tags: ['liquid', 'glass', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  float t=u_time*0.3;
  vec2 p=uv*4.0;

  // Surface height
  float h=fbm(p+vec2(t,t*0.6));
  float h2=fbm(p*1.5+h+vec2(-t*0.4));

  // Caustics via focusing
  float eps=0.02;
  float hx=fbm(p+vec2(eps,0.0)+vec2(t,t*0.6));
  float hy=fbm(p+vec2(0.0,eps)+vec2(t,t*0.6));
  vec2 grad=vec2(h-hx,h-hy)/eps;

  // Refracted lookup
  vec2 refUV=uv+grad*0.1;

  // Background pattern (checkered for refraction visibility)
  float check=step(0.5,fract(refUV.x*8.0))*step(0.5,fract(refUV.y*8.0));
  check+=step(0.5,1.0-fract(refUV.x*8.0))*step(0.5,1.0-fract(refUV.y*8.0));
  vec3 bg=mix(vec3(0.08,0.1,0.15),vec3(0.12,0.15,0.22),check);

  // Caustic brightening
  float caustic=length(grad)*15.0;
  caustic=pow(caustic,2.0)*0.5;

  vec3 col=bg;
  col+=vec3(0.3,0.5,0.7)*caustic;

  // Surface highlights
  float spec=smoothstep(0.6,0.8,h2);
  col+=vec3(0.6,0.7,0.8)*spec*0.4;

  // Fresnel rim
  float rim=smoothstep(0.3,0.0,abs(h-0.5));
  col+=vec3(0.2,0.3,0.5)*rim*0.2;

  gl_FragColor=vec4(col,1.0);
}
`
  },
  {
    id: 'liquid-plasma',
    name: 'Liquid Plasma',
    description: 'Hot plasma flowing like thick luminous fluid',
    tags: ['liquid', 'energy', 'animated', 'premium'],
    featured: true,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(0.8,0.6,-0.6,0.8);for(int i=0;i<6;i++){v+=a*noise(p);p=m*p*2.0;a*=0.5;}return v;}

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  vec2 p=uv*2.0-1.0;
  p.x*=u_resolution.x/u_resolution.y;
  float t=u_time*0.35;

  float f1=fbm(p*1.5+vec2(t,t*0.4));
  float f2=fbm(p*2.0+f1*2.0+vec2(-t*0.3,t*0.6));
  float f3=fbm(p*3.0+f2*1.5+vec2(t*0.2,-t*0.5));

  // Temperature mapping
  float temp=f2*0.6+f3*0.4;

  vec3 col;
  // Cool to hot gradient
  vec3 cold=vec3(0.1,0.0,0.3);
  vec3 warm=vec3(0.8,0.1,0.2);
  vec3 hot=vec3(1.0,0.6,0.0);
  vec3 white=vec3(1.0,0.95,0.8);

  col=mix(cold,warm,smoothstep(0.2,0.45,temp));
  col=mix(col,hot,smoothstep(0.45,0.65,temp));
  col=mix(col,white,smoothstep(0.7,0.9,temp));

  // Pulsing energy
  float pulse=sin(f1*10.0+t*3.0)*0.5+0.5;
  col+=vec3(0.2,0.05,0.1)*pulse*smoothstep(0.4,0.6,temp);

  // Fluid motion lines
  float flow=sin(f2*15.0-t*2.0)*0.5+0.5;
  flow=smoothstep(0.7,0.9,flow);
  col+=col*flow*0.3;

  gl_FragColor=vec4(col,1.0);
}
`
  },
  {
    id: 'liquid-ink',
    name: 'Liquid Ink',
    description: 'Dark ink diffusing through water in slow motion',
    tags: ['liquid', 'artistic', 'animated', 'premium'],
    featured: false,
    fragmentShader: `
precision mediump float;
uniform float u_time;
uniform vec2 u_resolution;
uniform vec2 u_mouse;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(0.8,0.6,-0.6,0.8);for(int i=0;i<7;i++){v+=a*noise(p);p=m*p*2.0;a*=0.5;}return v;}

void main(){
  vec2 uv=gl_FragCoord.xy/u_resolution;
  float t=u_time*0.15;

  // Water base
  vec3 water=mix(vec3(0.85,0.9,0.95),vec3(0.75,0.82,0.88),uv.y);

  // Ink drops
  float ink=0.0;
  for(float i=0.0;i<3.0;i++){
    vec2 center=vec2(0.3+i*0.2,0.6+sin(i*2.0)*0.1);
    vec2 p=(uv-center)*3.0;

    float spread=t*(1.0+i*0.3);
    float f=fbm(p*2.0/(0.5+spread)+vec2(i*5.0));
    float f2=fbm(p*3.0/(0.5+spread)+f*1.5+vec2(i*7.0,t*0.5));

    float radius=0.3+spread*0.4;
    float dist=length(p)/radius;

    float inkDrop=smoothstep(1.0,0.5,dist)*smoothstep(0.3,0.5,f2);
    // Tendrils
    float tendril=smoothstep(0.4,0.6,f)*smoothstep(1.5,0.8,dist);
    ink=max(ink,max(inkDrop,tendril*0.5));
  }

  ink=clamp(ink,0.0,1.0);
  vec3 inkCol=vec3(0.02,0.02,0.08);

  // Slight color variation in ink
  inkCol+=vec3(0.05,0.0,0.1)*fbm(uv*10.0+t);

  vec3 col=mix(water,inkCol,ink*0.9);

  gl_FragColor=vec4(col,1.0);
}
`
  },
];
