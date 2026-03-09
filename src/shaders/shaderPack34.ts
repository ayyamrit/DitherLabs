import type { DitherShaderDef } from './ditherShaders';

export const shaderPack34: DitherShaderDef[] = [
  {
    id: 'hex-ripple-34',
    name: 'Hexagonal Ripple',
    description: 'Concentric hexagonal ripples expanding outward.',
    tags: ['2d', 'hexagonal', 'ripple'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float a=atan(uv.y,uv.x);
        float r=length(uv);
        float hex=cos(a-floor(a/(3.14159/3.0)+0.5)*(3.14159/3.0));
        float d=r/hex;
        float wave=sin(d*20.0-u_time*3.0)*0.5+0.5;
        vec3 col=mix(vec3(0.1,0.0,0.2),vec3(0.9,0.4,0.1),wave);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'plasma-weave-34',
    name: 'Plasma Weave',
    description: 'Interlocking plasma bands creating a woven pattern.',
    tags: ['2d', 'plasma', 'pattern'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float v=sin(uv.x*10.0+sin(uv.y*8.0+u_time))*0.5+0.5;
        v+=sin(uv.y*12.0+cos(uv.x*6.0-u_time*0.7))*0.5+0.5;
        v*=0.5;
        float v2=sin(uv.x*8.0-u_time*1.3)*sin(uv.y*10.0+u_time*0.9);
        vec3 col=vec3(v*0.8,v2*0.5+0.5,1.0-v);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'circuit-trace-34',
    name: 'Circuit Trace',
    description: 'Animated circuit board traces lighting up sequentially.',
    tags: ['2d', 'tech', 'circuit'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 grid=floor(uv*20.0);
        vec2 f=fract(uv*20.0);
        float h=hash(grid);
        float dir=step(0.5,h);
        float trace=dir*step(abs(f.y-0.5),0.05)+(1.0-dir)*step(abs(f.x-0.5),0.05);
        float pulse=sin(u_time*3.0+h*6.28)*0.5+0.5;
        float node=smoothstep(0.15,0.1,length(f-0.5));
        vec3 col=vec3(0.0,0.1,0.05);
        col+=vec3(0.0,0.8,0.3)*trace*pulse;
        col+=vec3(0.0,1.0,0.5)*node*pulse;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'diamond-tile-34',
    name: 'Diamond Tiles',
    description: 'Rotating diamond-shaped tiles with shifting colors.',
    tags: ['2d', 'geometric', 'tiles'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float s=sin(u_time*0.3),c=cos(u_time*0.3);
        uv=mat2(c,-s,s,c)*uv;
        vec2 id=floor(uv*5.0);
        vec2 f=fract(uv*5.0)-0.5;
        float d=abs(f.x)+abs(f.y);
        float edge=smoothstep(0.48,0.5,d);
        float phase=sin(id.x*1.3+id.y*2.1+u_time)*0.5+0.5;
        vec3 col=mix(vec3(0.9,0.2,0.3),vec3(0.1,0.3,0.9),phase);
        col=mix(col,vec3(0.0),edge);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'smoke-curl-34',
    name: 'Smoke Curl',
    description: 'Wispy curling smoke tendrils rising upward.',
    tags: ['2d', 'organic', 'smoke'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 p=uv*3.0;
        p.y-=u_time*0.5;
        float f=fbm(p+fbm(p+u_time*0.1)*0.5);
        float smoke=smoothstep(0.3,0.7,f)*smoothstep(0.0,0.3,uv.y);
        vec3 col=mix(vec3(0.02),vec3(0.5,0.5,0.6),smoke);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'kaleidoscope-34',
    name: 'Kaleidoscope Burst',
    description: 'Kaleidoscopic symmetry with burst patterns.',
    tags: ['2d', 'symmetry', 'kaleidoscope'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float a=atan(uv.y,uv.x);
        float r=length(uv);
        float seg=3.14159/4.0;
        a=abs(mod(a,seg*2.0)-seg);
        vec2 p=vec2(cos(a),sin(a))*r;
        float v=sin(p.x*15.0+u_time*2.0)*sin(p.y*15.0-u_time);
        v=v*0.5+0.5;
        vec3 col=vec3(v*0.8,v*0.3+r,1.0-v*0.5);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'pixel-rain-34',
    name: 'Pixel Rain',
    description: 'Chunky pixel-art style rain drops falling.',
    tags: ['2d', 'pixel', 'rain'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float pixSize=0.02;
        vec2 p=floor(uv/pixSize)*pixSize;
        float col_id=hash(p.x*100.0);
        float speed=1.0+col_id*2.0;
        float drop=fract(-u_time*speed+col_id*10.0);
        float y=1.0-drop;
        float d=abs(p.y-y);
        float trail=smoothstep(0.15,0.0,d)*step(p.y,y);
        vec3 col=vec3(0.0,0.05,0.1);
        col+=vec3(0.3,0.5,0.9)*trail;
        col+=vec3(0.5,0.8,1.0)*smoothstep(0.02,0.0,d);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'voronoi-mosaic-34',
    name: 'Voronoi Mosaic',
    description: 'Colorful stained glass Voronoi mosaic.',
    tags: ['2d', 'voronoi', 'mosaic'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*8.0;
        vec2 ip=floor(uv);vec2 fp=fract(uv);
        float md=8.0;vec2 mr;
        for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
          vec2 nb=vec2(float(i),float(j));
          vec2 o=hash2(ip+nb);
          o=0.5+0.5*sin(u_time*0.5+6.28*o);
          float d=length(nb+o-fp);
          if(d<md){md=d;mr=o;}
        }
        vec3 col=vec3(mr.x,0.5,mr.y);
        col*=1.0-smoothstep(0.0,0.05,md-0.02);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'sine-interference-34',
    name: 'Sine Interference',
    description: 'Multiple sine waves creating moiré interference.',
    tags: ['2d', 'wave', 'moire'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float v=0.0;
        for(float i=0.0;i<6.0;i++){
          float a=i*3.14159/6.0+u_time*0.2*i;
          float s=sin(uv.x*cos(a)*20.0+uv.y*sin(a)*20.0+u_time*(i+1.0)*0.5);
          v+=s;
        }
        v=v/6.0*0.5+0.5;
        vec3 col=vec3(v*0.2,v*0.6,v);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'lava-lamp-34',
    name: 'Lava Lamp',
    description: 'Blobby lava lamp with metaball-like blobs.',
    tags: ['2d', 'organic', 'retro'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float v=0.0;
        for(float i=0.0;i<7.0;i++){
          vec2 center=vec2(sin(u_time*(0.3+i*0.1)+i)*0.4,cos(u_time*(0.2+i*0.15)+i*2.0)*0.6);
          v+=0.05/length(uv-center);
        }
        v=smoothstep(0.8,1.2,v);
        vec3 col=mix(vec3(0.8,0.1,0.0),vec3(1.0,0.8,0.0),v);
        col=mix(vec3(0.05,0.0,0.1),col,smoothstep(0.3,0.9,v));
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'crosshatch-34',
    name: 'Crosshatch Shading',
    description: 'Pen-and-ink crosshatch shading technique.',
    tags: ['2d', 'artistic', 'crosshatch'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float val=noise(uv*4.0+u_time*0.2);
        vec2 p=gl_FragCoord.xy;
        float h1=step(0.5,fract((p.x+p.y)*0.1))*step(val,0.7);
        float h2=step(0.5,fract((p.x-p.y)*0.1))*step(val,0.5);
        float h3=step(0.5,fract(p.x*0.1))*step(val,0.3);
        float ink=max(max(h1,h2),h3);
        vec3 col=mix(vec3(0.95,0.9,0.85),vec3(0.1,0.08,0.05),ink);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'electric-arc-34',
    name: 'Electric Arc',
    description: 'Jagged electric arcs jumping between points.',
    tags: ['2d', 'electric', 'energy'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.02,0.0,0.05);
        for(float i=0.0;i<5.0;i++){
          float t=u_time*10.0+i*100.0;
          float x=uv.x*10.0;
          float y=0.0;
          for(float j=1.0;j<8.0;j++){
            y+=hash(floor(x*j)+floor(t*j))*0.5/j;
          }
          y-=0.5;
          float d=abs(uv.y-y*0.3-i*0.15+0.3);
          float glow=0.003/(d*d+0.0001);
          col+=vec3(0.3,0.5,1.0)*glow*0.1;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'truchet-34',
    name: 'Truchet Tiles',
    description: 'Randomly oriented quarter-circle tiles forming paths.',
    tags: ['2d', 'geometric', 'truchet'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*12.0;
        vec2 id=floor(uv);
        vec2 f=fract(uv);
        float h=step(0.5,hash(id+floor(u_time*0.3)));
        if(h>0.5)f.x=1.0-f.x;
        float d1=length(f);
        float d2=length(f-1.0);
        float line=min(abs(d1-0.5),abs(d2-0.5));
        float v=smoothstep(0.05,0.02,line);
        float phase=sin(id.x+id.y+u_time)*0.5+0.5;
        vec3 col=mix(vec3(0.1,0.05,0.15),vec3(0.0,0.8,0.6),v);
        col*=0.7+0.3*phase;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'polar-grid-34',
    name: 'Polar Grid Pulse',
    description: 'Pulsing polar coordinate grid with radial beats.',
    tags: ['2d', 'polar', 'grid'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float radial=sin(r*30.0-u_time*4.0)*0.5+0.5;
        float angular=sin(a*8.0)*0.5+0.5;
        float grid=radial*angular;
        float pulse=sin(r*10.0-u_time*6.0)*0.5+0.5;
        vec3 col=vec3(grid*0.3,pulse*0.7,1.0-grid*0.5);
        col*=smoothstep(1.0,0.0,r);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'watercolor-bleed-34',
    name: 'Watercolor Bleed',
    description: 'Soft watercolor edges bleeding into paper.',
    tags: ['2d', 'artistic', 'watercolor'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float f1=fbm(uv*5.0+u_time*0.1);
        float f2=fbm(uv*5.0+vec2(5.0)+u_time*0.12);
        float f3=fbm(uv*5.0+vec2(10.0)+u_time*0.08);
        vec3 col=vec3(f1*0.8+0.2,f2*0.3+0.3,f3*0.6+0.3);
        float paper=0.9+noise(gl_FragCoord.xy*0.3)*0.1;
        col*=paper;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'spiral-galaxy-34',
    name: 'Spiral Galaxy',
    description: 'Rotating spiral arms with star clusters.',
    tags: ['2d', 'space', 'spiral'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float spiral=sin(a*2.0-r*10.0+u_time)*0.5+0.5;
        spiral*=exp(-r*3.0);
        float stars=step(0.98,hash(floor(gl_FragCoord.xy*0.5)));
        vec3 col=vec3(0.01,0.0,0.02);
        col+=vec3(0.6,0.4,0.9)*spiral;
        col+=vec3(1.0,0.9,0.8)*stars*(1.0-r);
        col+=vec3(1.0,0.8,0.4)*0.3*exp(-r*5.0);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'scan-lines-34',
    name: 'CRT Scanlines',
    description: 'Retro CRT monitor with phosphor scanlines.',
    tags: ['2d', 'retro', 'crt'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 curved=uv-0.5;
        curved*=1.0+dot(curved,curved)*0.3;
        curved+=0.5;
        float scanline=sin(curved.y*u_resolution.y*3.14159)*0.5+0.5;
        scanline=mix(0.7,1.0,scanline);
        float r=sin(curved.x*10.0+u_time*2.0)*0.5+0.5;
        float g=sin(curved.y*8.0-u_time*1.5)*0.5+0.5;
        float b=sin((curved.x+curved.y)*7.0+u_time)*0.5+0.5;
        vec3 col=vec3(r,g,b)*scanline;
        float vignette=1.0-dot(curved-0.5,curved-0.5)*2.0;
        col*=vignette;
        float border=step(0.0,curved.x)*step(curved.x,1.0)*step(0.0,curved.y)*step(curved.y,1.0);
        col*=border;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'noise-warp-34',
    name: 'Noise Warp',
    description: 'Domain-warped noise creating organic flowing forms.',
    tags: ['2d', 'noise', 'warp'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*3.0;
        vec2 q=vec2(fbm(uv+u_time*0.1),fbm(uv+vec2(1.7,9.2)));
        vec2 r2=vec2(fbm(uv+4.0*q+vec2(1.7,9.2)+u_time*0.15),fbm(uv+4.0*q+vec2(8.3,2.8)+u_time*0.12));
        float f=fbm(uv+4.0*r2);
        vec3 col=mix(vec3(0.1,0.2,0.4),vec3(0.9,0.6,0.2),(f*f*f+0.6*f*f+0.5*f));
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'checker-wave-34',
    name: 'Checker Wave',
    description: 'Checkerboard pattern distorted by sine waves.',
    tags: ['2d', 'geometric', 'checker'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        uv.x+=sin(uv.y*5.0+u_time)*0.2;
        uv.y+=cos(uv.x*5.0+u_time*0.7)*0.2;
        vec2 id=floor(uv*8.0);
        float check=mod(id.x+id.y,2.0);
        vec3 col=mix(vec3(0.9,0.85,0.7),vec3(0.15,0.1,0.2),check);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'pendulum-wave-34',
    name: 'Pendulum Wave',
    description: 'Array of pendulums creating mesmerizing phase patterns.',
    tags: ['2d', 'physics', 'pendulum'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.05,0.02,0.08);
        for(float i=0.0;i<20.0;i++){
          float freq=5.0+i*0.3;
          float x=-0.8+i*0.08;
          float y=sin(u_time*freq)*0.3;
          float d=length(uv-vec2(x,y));
          col+=vec3(0.5+i/40.0,0.3,1.0-i/20.0)*0.01/(d*d+0.001);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  }
];
