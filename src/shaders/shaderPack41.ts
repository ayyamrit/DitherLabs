import type { DitherShaderDef } from './ditherShaders';

export const shaderPack41: DitherShaderDef[] = [
  {
    id: 'liquid-crystal-41',
    name: 'Liquid Crystal',
    description: 'LCD-like liquid crystal color shifting.',
    tags: ['2d', 'digital', 'crystal'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float n=noise(uv*8.0+u_time*0.3);
        float n2=noise(uv*12.0-u_time*0.2);
        float orient=n*6.28;
        float hue=fract(orient/6.28+n2*0.3+u_time*0.05);
        vec3 col=0.5+0.5*cos(6.28*(hue+vec3(0.0,0.33,0.67)));
        float edge=abs(sin(orient*5.0));
        col*=0.7+0.3*edge;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'atom-model-41',
    name: 'Atom Orbits',
    description: 'Animated atomic model with electron orbits.',
    tags: ['2d', 'physics', 'atom'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.02,0.0,0.05);
        float nucleus=smoothstep(0.05,0.03,length(uv));
        col+=vec3(1.0,0.3,0.2)*nucleus;
        for(float i=0.0;i<3.0;i++){
          float angle=i*2.094+u_time*0.3;
          float tilt=0.3+i*0.2;
          float s=sin(angle),c=cos(angle);
          vec2 tilted=vec2(uv.x*c-uv.y*s,uv.x*s*tilt+uv.y*c);
          float orbit=abs(length(tilted)-0.25);
          col+=vec3(0.0,0.3,0.6)*smoothstep(0.005,0.0,orbit)*0.5;
          float electron_a=u_time*(3.0+i)+i*2.0;
          vec2 ePos=vec2(cos(electron_a),sin(electron_a)*tilt)*0.25;
          ePos=vec2(ePos.x*c+ePos.y*s/tilt,-ePos.x*s+ePos.y*c/tilt);
          float ed=length(uv-ePos);
          col+=vec3(0.3,0.6,1.0)*0.005/(ed*ed+0.001);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'plexus-41',
    name: 'Plexus Network',
    description: 'Connected dots forming a plexus network.',
    tags: ['2d', 'tech', 'network'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.02,0.01,0.05);
        vec2 pts[10];
        for(int i=0;i<10;i++){
          float fi=float(i);
          pts[i]=vec2(sin(u_time*0.5+fi*1.3)*0.4+cos(fi*2.7)*0.1,cos(u_time*0.4+fi*1.7)*0.3+sin(fi*3.1)*0.1);
        }
        for(int i=0;i<10;i++){
          for(int j=i+1;j<10;j++){
            float dist=length(pts[i]-pts[j]);
            if(dist<0.5){
              vec2 pa=uv-pts[i];
              vec2 ba=pts[j]-pts[i];
              float t=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
              float lineDist=length(pa-ba*t);
              float fade=1.0-dist/0.5;
              col+=vec3(0.1,0.3,0.6)*smoothstep(0.003,0.0,lineDist)*fade*0.5;
            }
          }
        }
        for(int i=0;i<10;i++){
          float d=length(uv-pts[i]);
          col+=vec3(0.3,0.6,1.0)*0.002/(d*d+0.001);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'oil-painting-41',
    name: 'Oil Paint Strokes',
    description: 'Thick oil paint brush stroke texture.',
    tags: ['2d', 'artistic', 'paint'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float brush=fbm(uv*vec2(3.0,8.0)+u_time*0.05);
        float stroke=sin(brush*20.0)*0.5+0.5;
        float thick=fbm(uv*15.0)*0.1;
        float hue=fbm(uv*2.0+u_time*0.03);
        vec3 col=0.5+0.5*cos(6.28*(hue+vec3(0.0,0.33,0.67)));
        col*=0.7+0.3*stroke;
        col+=vec3(thick);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'gear-system-41',
    name: 'Gear System',
    description: 'Interlocking gears rotating together.',
    tags: ['2d', 'mechanical', 'gears'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float gear(vec2 uv,vec2 center,float radius,float teeth,float rot){
        vec2 p=uv-center;
        float r=length(p);
        float a=atan(p.y,p.x)+rot;
        float tooth=radius+0.02*sin(a*teeth);
        float ring=smoothstep(tooth+0.01,tooth,r)*smoothstep(radius*0.4,radius*0.4+0.01,r);
        float axle=smoothstep(radius*0.15,radius*0.15-0.01,r);
        return max(ring,axle);
      }
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.15,0.12,0.1);
        float g1=gear(uv,vec2(-0.15,0.0),0.2,12.0,u_time);
        float g2=gear(uv,vec2(0.18,0.0),0.15,9.0,-u_time*12.0/9.0);
        float g3=gear(uv,vec2(0.0,0.25),0.12,8.0,-u_time*12.0/8.0);
        col=mix(col,vec3(0.6,0.5,0.3),g1);
        col=mix(col,vec3(0.5,0.55,0.35),g2);
        col=mix(col,vec3(0.55,0.45,0.3),g3);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'northern-lights-41',
    name: 'Northern Lights 2',
    description: 'Vibrant aurora with mountain silhouette.',
    tags: ['2d', 'nature', 'aurora'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.01,0.02,0.05);
        float stars=step(0.99,hash(floor(gl_FragCoord.xy*0.5)));
        col+=vec3(stars)*0.5;
        for(float i=0.0;i<3.0;i++){
          float n=noise(vec2(uv.x*4.0+i*3.0+u_time*0.15,u_time*0.05+i));
          float curtain=exp(-pow((uv.y-0.6-n*0.2-i*0.05)*5.0,2.0));
          vec3 aCol=i<1.0?vec3(0.0,0.8,0.3):i<2.0?vec3(0.2,0.5,0.9):vec3(0.6,0.1,0.5);
          col+=aCol*curtain*0.5;
        }
        float mountain=noise(vec2(uv.x*5.0,0.0))*0.15+0.15;
        float mtn=step(uv.y,mountain);
        col=mix(col,vec3(0.02,0.02,0.03),mtn);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'bubble-chamber-41',
    name: 'Bubble Chamber',
    description: 'Particle physics bubble chamber trails.',
    tags: ['2d', 'physics', 'particles'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.05,0.05,0.08);
        for(float i=0.0;i<10.0;i++){
          float a0=hash(i)*6.28;
          float speed=0.5+hash(i+10.0)*0.5;
          float curve=0.3+hash(i+20.0)*0.7;
          for(float t=0.0;t<3.0;t+=0.03){
            float a=a0+t*curve;
            float r=t*speed*0.15;
            vec2 pos=vec2(cos(a),sin(a))*r;
            float d=length(uv-pos);
            float size=0.003*(1.0+t*0.5);
            float bubble=smoothstep(size,size*0.3,d);
            vec3 bCol=mix(vec3(0.3,0.5,0.8),vec3(0.8,0.3,0.5),hash(i+30.0));
            col+=bCol*bubble*0.1;
          }
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'stitch-pattern-41',
    name: 'Cross Stitch',
    description: 'Embroidery cross stitch pattern.',
    tags: ['2d', 'texture', 'craft'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float grid=20.0;
        vec2 id=floor(uv*grid);
        vec2 f=fract(uv*grid);
        float pattern=sin(id.x*0.5+u_time*0.5)*sin(id.y*0.3-u_time*0.3)*0.5+0.5;
        float stitch1=smoothstep(0.08,0.0,abs(f.x-f.y));
        float stitch2=smoothstep(0.08,0.0,abs(f.x-(1.0-f.y)));
        float cross=(stitch1+stitch2)*step(0.5,pattern);
        float hue=hash(id)*0.3+0.0;
        vec3 threadCol=0.5+0.5*cos(6.28*(hue+vec3(0.0,0.33,0.67)));
        vec3 fabric=vec3(0.9,0.88,0.82);
        vec3 col=mix(fabric,threadCol,cross*0.8);
        float weave=sin(f.x*3.14*2.0)*sin(f.y*3.14*2.0)*0.05;
        col+=weave;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'solar-flare-41',
    name: 'Solar Flare',
    description: 'Sun surface with erupting solar flares.',
    tags: ['2d', 'space', 'sun'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float surface=fbm(vec2(a*3.0,r*5.0-u_time*0.5));
        float sun=smoothstep(0.35+surface*0.05,0.3+surface*0.05,r);
        float corona=0.1/(r-0.3+0.15);
        corona*=1.0-sun;
        float flare=fbm(vec2(a*2.0+u_time*0.2,u_time*0.1));
        flare=pow(flare,3.0)*smoothstep(0.35,0.3,r)*smoothstep(0.2,0.35,r);
        vec3 col=vec3(0.0);
        col+=vec3(1.0,0.8,0.3)*sun*(0.8+surface*0.4);
        col+=vec3(1.0,0.4,0.1)*corona*0.3;
        col+=vec3(1.0,0.6,0.2)*flare*2.0;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'circuit-maze-41',
    name: 'Circuit Maze',
    description: 'Maze-like circuit paths with data flow.',
    tags: ['2d', 'tech', 'maze'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*12.0;
        vec2 id=floor(uv);
        vec2 f=fract(uv);
        float h=hash(id);
        float h2=hash(id+vec2(0.5));
        float pathH=step(abs(f.y-0.5),0.12)*step(0.5,h);
        float pathV=step(abs(f.x-0.5),0.12)*step(0.5,h2);
        float path=max(pathH,pathV);
        float data=fract(-u_time*2.0+h*10.0);
        float pulse=smoothstep(0.1,0.0,abs(f.x-data))*pathH;
        pulse+=smoothstep(0.1,0.0,abs(f.y-data))*pathV;
        vec3 col=vec3(0.02,0.02,0.05);
        col+=vec3(0.0,0.2,0.3)*path;
        col+=vec3(0.0,0.8,1.0)*pulse;
        float node=smoothstep(0.15,0.1,length(f-0.5));
        col+=vec3(0.0,0.5,0.7)*node;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'cosmic-web-41',
    name: 'Cosmic Web',
    description: 'Large-scale structure of the universe.',
    tags: ['2d', 'space', 'cosmic'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*5.0;
        vec2 ip=floor(uv);vec2 fp=fract(uv);
        float md=8.0;float md2=8.0;
        for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
          vec2 nb=vec2(float(i),float(j));
          vec2 o=hash2(ip+nb);
          o=0.5+0.3*sin(u_time*0.2+6.28*o);
          float d=length(nb+o-fp);
          if(d<md){md2=md;md=d;}
          else if(d<md2)md2=d;
        }
        float edge=md2-md;
        float filament=exp(-edge*10.0);
        float node=exp(-md*5.0);
        vec3 col=vec3(0.01,0.0,0.03);
        col+=vec3(0.2,0.1,0.4)*filament;
        col+=vec3(1.0,0.8,0.5)*node*0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'disco-ball-41',
    name: 'Disco Ball',
    description: 'Spinning disco ball with light reflections.',
    tags: ['2d', 'retro', 'disco'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        vec3 col=vec3(0.02);
        float ball=smoothstep(0.32,0.3,r);
        float a=atan(uv.y,uv.x)+u_time*0.5;
        float rings=floor(asin(clamp(uv.y/0.3,-1.0,1.0))*5.0);
        float tiles=floor(a*4.0+rings*0.5);
        float h=hash(vec2(tiles,rings));
        float sparkle=pow(h,8.0)*ball;
        float facet=0.5+h*0.5;
        col+=vec3(0.5,0.5,0.6)*ball*facet;
        col+=vec3(1.0)*sparkle*sin(u_time*5.0+h*6.28)*0.5+sparkle*0.5;
        for(float i=0.0;i<5.0;i++){
          float ba=u_time*2.0+i*1.256;
          vec2 beam=vec2(cos(ba),sin(ba))*0.5;
          vec2 pa=uv-beam;
          float bd=length(pa);
          col+=vec3(1.0,0.9,0.8)*0.005/(bd*bd+0.01)*(1.0-ball);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'chromatic-aberr-41',
    name: 'Chromatic Aberration',
    description: 'Lens chromatic aberration splitting colors.',
    tags: ['2d', 'optics', 'aberration'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float aberr=r*r*0.1;
        vec2 uvR=uv*(1.0+aberr*1.0);
        vec2 uvG=uv*(1.0+aberr*0.5);
        vec2 uvB=uv*(1.0+aberr*0.0);
        float patR=sin(uvR.x*20.0+u_time)*sin(uvR.y*20.0-u_time)*0.5+0.5;
        float patG=sin(uvG.x*20.0+u_time)*sin(uvG.y*20.0-u_time)*0.5+0.5;
        float patB=sin(uvB.x*20.0+u_time)*sin(uvB.y*20.0-u_time)*0.5+0.5;
        vec3 col=vec3(patR,patG,patB);
        col*=1.0-r*0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'lightning-41',
    name: 'Lightning Storm',
    description: 'Branching lightning bolts in a storm.',
    tags: ['2d', 'weather', 'lightning'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float flash=pow(max(sin(u_time*8.0+hash(floor(u_time*2.0))*6.28),0.0),16.0);
        vec3 sky=vec3(0.02,0.02,0.05);
        sky+=vec3(0.1,0.1,0.2)*flash;
        vec3 col=sky;
        float x=0.5;
        for(float y=1.0;y>0.0;y-=0.02){
          x+=hash(floor(y*50.0)+floor(u_time*2.0))*0.04-0.02;
          float d=abs(uv.x-x)*step(uv.y,y)*step(y-0.02,uv.y);
          float bolt=smoothstep(0.01,0.0,d)*flash;
          col+=vec3(0.7,0.7,1.0)*bolt;
          col+=vec3(0.3,0.3,0.5)*smoothstep(0.05,0.0,d)*flash*0.3;
        }
        float clouds=sin(uv.x*5.0)*0.05+0.85;
        col+=vec3(0.1)*step(clouds,uv.y)*flash*0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'pixel-art-41',
    name: 'Pixel Art World',
    description: 'Tiny pixel art landscape scrolling by.',
    tags: ['2d', 'pixel', 'landscape'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        float pix=6.0;
        vec2 uv=floor(gl_FragCoord.xy/pix)*pix/u_resolution;
        float scroll=u_time*0.1;
        vec3 sky=vec3(0.3,0.5,0.9);
        vec3 col=sky;
        float ground=0.3+sin((uv.x+scroll)*5.0)*0.05;
        if(uv.y<ground){
          col=vec3(0.2,0.5,0.15);
          if(uv.y<ground-0.05)col=vec3(0.4,0.3,0.2);
        }
        float treeX=fract((uv.x+scroll)*3.0);
        float treeH=0.15*step(0.4,hash(floor((uv.x+scroll)*3.0)));
        if(uv.y>ground&&uv.y<ground+treeH&&abs(treeX-0.5)<0.05)col=vec3(0.3,0.2,0.1);
        if(uv.y>ground+treeH*0.5&&uv.y<ground+treeH+0.05&&abs(treeX-0.5)<0.12&&treeH>0.0)col=vec3(0.1,0.5,0.2);
        float sun=step(length(uv-vec2(0.8,0.8)),0.06);
        col=mix(col,vec3(1.0,0.9,0.3),sun);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'music-eq-41',
    name: 'Music Equalizer',
    description: 'Animated music equalizer bars.',
    tags: ['2d', 'audio', 'equalizer'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float bars=20.0;
        float barIdx=floor(uv.x*bars);
        float barWidth=1.0/bars;
        float inBar=step(0.1,fract(uv.x*bars))*step(fract(uv.x*bars),0.9);
        float height=0.3+0.5*abs(sin(u_time*3.0+barIdx*0.7))*abs(sin(u_time*1.7+barIdx*1.3));
        height=mix(height,hash(barIdx+floor(u_time*8.0))*0.5+0.3,0.3);
        float bar=step(uv.y,height)*inBar;
        float segment=step(0.1,fract(uv.y*20.0));
        vec3 barCol=mix(vec3(0.0,1.0,0.0),vec3(1.0,0.0,0.0),uv.y);
        barCol=mix(barCol,vec3(1.0,1.0,0.0),smoothstep(0.5,0.7,uv.y));
        vec3 col=vec3(0.05);
        col=mix(col,barCol,bar*segment);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'ink-splash-41',
    name: 'Ink Splash',
    description: 'Dynamic ink splash spreading on paper.',
    tags: ['2d', 'artistic', 'ink'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float n=fbm(uv*5.0+u_time*0.2);
        float splash=smoothstep(0.3+n*0.2,0.2+n*0.2,r);
        float drip=fbm(vec2(atan(uv.y,uv.x)*3.0,r*5.0-u_time));
        splash=max(splash,smoothstep(0.6,0.4,r-drip*0.2));
        float paper=0.92+noise(gl_FragCoord.xy*0.3)*0.08;
        vec3 col=vec3(0.95,0.92,0.85)*paper;
        col=mix(col,vec3(0.05,0.02,0.1),splash*0.9);
        gl_FragColor=vec4(col,1.0);
      }
    `
  }
];
