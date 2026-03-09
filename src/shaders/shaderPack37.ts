import type { DitherShaderDef } from './ditherShaders';

export const shaderPack37: DitherShaderDef[] = [
  {
    id: 'liquid-metal-37',
    name: 'Liquid Metal',
    description: 'Mercury-like liquid metal surface with reflections.',
    tags: ['2d', 'metal', 'liquid'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float n=fbm(uv*4.0+u_time*0.3);
        float n2=fbm(uv*8.0-u_time*0.2);
        vec3 normal=normalize(vec3(n-0.5,n2-0.5,1.0));
        vec3 light=normalize(vec3(sin(u_time),cos(u_time),1.0));
        float spec=pow(max(dot(reflect(-light,normal),vec3(0,0,1)),0.0),32.0);
        float diff=max(dot(normal,light),0.0);
        vec3 col=vec3(0.7,0.7,0.75)*diff+vec3(1.0)*spec;
        col+=vec3(0.1,0.1,0.12);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'ripple-pond-37',
    name: 'Ripple Pond',
    description: 'Multiple expanding ripples on water surface.',
    tags: ['2d', 'water', 'ripple'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float v=0.0;
        for(float i=0.0;i<5.0;i++){
          vec2 center=vec2(hash(i)-0.5,hash(i+5.0)-0.5)*0.8;
          float r=length(uv-center);
          float phase=hash(i+10.0)*6.28;
          v+=sin(r*30.0-u_time*3.0+phase)/(r*10.0+1.0);
        }
        vec3 col=vec3(0.1,0.3,0.5)+vec3(0.2,0.4,0.6)*v;
        col+=vec3(0.8,0.9,1.0)*pow(max(v,0.0),3.0);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'circuit-board-37',
    name: 'Circuit Board',
    description: 'Detailed PCB layout with traces and vias.',
    tags: ['2d', 'tech', 'pcb'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float grid=16.0;
        vec2 id=floor(uv*grid);
        vec2 f=fract(uv*grid);
        float h=hash(id);
        float hx=step(0.5,hash(id+vec2(1,0)));
        float hy=step(0.5,hash(id+vec2(0,1)));
        float traceH=step(abs(f.y-0.5),0.08)*hx;
        float traceV=step(abs(f.x-0.5),0.08)*hy;
        float via=smoothstep(0.15,0.1,length(f-0.5))*step(0.7,h);
        float pad=smoothstep(0.2,0.18,length(f-0.5))*step(0.7,h);
        float pulse=sin(u_time*2.0+(id.x+id.y)*0.5)*0.5+0.5;
        vec3 board=vec3(0.0,0.3,0.15);
        vec3 copper=vec3(0.7,0.5,0.2);
        vec3 col=board;
        col=mix(col,copper,max(traceH,traceV));
        col=mix(col,vec3(0.8,0.8,0.8),via);
        col=mix(col,copper*1.2,pad-via);
        col+=vec3(0.0,0.3,0.1)*pulse*max(traceH,traceV)*0.3;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'color-wheel-37',
    name: 'Color Wheel Spin',
    description: 'Spinning color wheel with blending sections.',
    tags: ['2d', 'color', 'wheel'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x)+u_time;
        float hue=a/6.28318+0.5;
        vec3 col=0.5+0.5*cos(6.28*(hue+vec3(0.0,0.33,0.67)));
        float ring=smoothstep(0.45,0.44,r)*smoothstep(0.15,0.16,r);
        float inner=smoothstep(0.15,0.14,r);
        float sat=smoothstep(0.15,0.45,r);
        col=mix(vec3(1.0),col,sat);
        col*=ring+inner;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'matrix-code-37',
    name: 'Matrix Waterfall',
    description: 'Classic green code rain cascading down.',
    tags: ['2d', 'matrix', 'code'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float cols=40.0;
        float col_x=floor(uv.x*cols);
        float speed=1.0+hash(vec2(col_x,0.0))*2.0;
        float y=fract(-u_time*speed*0.3+hash(vec2(col_x,1.0)));
        float charY=floor(uv.y*cols);
        float ch=hash(vec2(col_x,charY+floor(u_time*10.0)));
        float head=smoothstep(0.02,0.0,abs(uv.y-y));
        float trail=step(uv.y,y)*exp(-(y-uv.y)*5.0);
        float bright=max(head*2.0,trail*step(0.3,ch));
        vec3 c=vec3(0.0,bright,0.0);
        c+=vec3(0.5,1.0,0.5)*head;
        gl_FragColor=vec4(c,1.0);
      }
    `
  },
  {
    id: 'bokeh-lights-37',
    name: 'Bokeh Lights',
    description: 'Out-of-focus bokeh light circles floating.',
    tags: ['2d', 'photography', 'bokeh'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.02,0.01,0.05);
        for(float i=0.0;i<25.0;i++){
          vec2 pos=vec2(hash(i)-0.5,hash(i+25.0)-0.5)*1.5;
          pos.x+=sin(u_time*0.3+i)*0.1;
          pos.y+=cos(u_time*0.2+i*0.7)*0.1;
          float size=0.05+hash(i+50.0)*0.1;
          float d=length(uv-pos);
          float bokeh=smoothstep(size,size*0.8,d)*0.3;
          float ring=smoothstep(size*0.95,size*0.9,d)*smoothstep(size*0.8,size*0.85,d)*0.5;
          vec3 bCol=0.5+0.5*cos(6.28*(hash(i+75.0)+vec3(0.0,0.33,0.67)));
          col+=bCol*(bokeh+ring);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'halftone-dots-37',
    name: 'Pop Art Halftone',
    description: 'Pop art style halftone dots with bold colors.',
    tags: ['2d', 'pop-art', 'halftone'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float dotSize=12.0;
        vec2 cell=floor(gl_FragCoord.xy/dotSize);
        vec2 f=fract(gl_FragCoord.xy/dotSize)-0.5;
        float brightness=sin(cell.x*0.2+u_time)*sin(cell.y*0.3-u_time*0.7)*0.5+0.5;
        float d=length(f);
        float dot=smoothstep(brightness*0.5,brightness*0.5-0.05,d);
        float zone=mod(cell.x+cell.y,3.0);
        vec3 col=zone<1.0?vec3(1.0,0.2,0.3):zone<2.0?vec3(0.2,0.3,1.0):vec3(1.0,0.9,0.1);
        col*=dot;
        col+=(1.0-dot)*vec3(0.95);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'oil-slick-37',
    name: 'Oil Slick',
    description: 'Iridescent oil on water surface.',
    tags: ['2d', 'iridescent', 'organic'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float n=noise(uv*8.0+u_time*0.2);
        float n2=noise(uv*12.0-u_time*0.15);
        float thickness=n*0.5+n2*0.3+uv.x*0.2;
        vec3 col=0.5+0.5*cos(thickness*6.28*2.0+vec3(0.0,2.09,4.18));
        col*=0.7+0.3*n;
        float edge=smoothstep(0.3,0.35,n)*smoothstep(0.7,0.65,n);
        col=mix(vec3(0.1,0.15,0.2),col,edge);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'pixel-fire-37',
    name: 'Pixel Fire',
    description: 'Retro pixelated fire effect.',
    tags: ['2d', 'retro', 'fire'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        float pixSize=6.0;
        vec2 uv=floor(gl_FragCoord.xy/pixSize)*pixSize/u_resolution;
        float heat=0.0;
        heat+=hash(vec2(floor(gl_FragCoord.x/pixSize),floor(u_time*15.0)))*step(uv.y,0.1);
        heat+=smoothstep(0.5,0.0,uv.y);
        heat*=1.0-uv.y;
        heat=clamp(heat,0.0,1.0);
        vec3 col=vec3(0.0);
        col=mix(col,vec3(0.5,0.0,0.0),smoothstep(0.0,0.3,heat));
        col=mix(col,vec3(1.0,0.3,0.0),smoothstep(0.3,0.6,heat));
        col=mix(col,vec3(1.0,0.9,0.0),smoothstep(0.6,0.8,heat));
        col=mix(col,vec3(1.0,1.0,0.8),smoothstep(0.8,1.0,heat));
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'smoke-rings-37',
    name: 'Smoke Rings',
    description: 'Expanding smoke rings dissipating in air.',
    tags: ['2d', 'smoke', 'rings'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.6,0.65,0.7);
        for(float i=0.0;i<6.0;i++){
          float t=mod(u_time*0.5+i*0.5,3.0);
          float radius=t*0.3;
          float thickness=0.03+t*0.02;
          float fade=1.0-t/3.0;
          float y_off=t*0.2;
          float d=abs(length(uv-vec2(0.0,y_off-0.2))-radius);
          float ring=smoothstep(thickness,0.0,d)*fade;
          col=mix(col,vec3(0.85,0.85,0.9),ring*0.5);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'galaxy-core-37',
    name: 'Galaxy Core',
    description: 'Dense galactic center with dust lanes.',
    tags: ['2d', 'space', 'galaxy'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float spiral=noise(vec2(a*2.0+r*5.0-u_time*0.5,r*3.0));
        float glow=0.2/(r+0.1);
        float dust=smoothstep(0.4,0.6,noise(vec2(a*3.0,r*8.0+u_time*0.2)));
        float stars=step(0.97,hash(floor(gl_FragCoord.xy*0.3)));
        vec3 col=vec3(0.01);
        col+=vec3(1.0,0.8,0.5)*glow*0.5;
        col+=vec3(0.5,0.3,0.8)*spiral*exp(-r*3.0);
        col*=1.0-dust*0.5;
        col+=vec3(1.0)*stars;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'tile-mosaic-37',
    name: 'Moroccan Mosaic',
    description: 'Intricate Moroccan-style geometric mosaic.',
    tags: ['2d', 'geometric', 'mosaic'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y*4.0;
        vec2 id=floor(uv);
        vec2 f=fract(uv)-0.5;
        float d1=abs(f.x)+abs(f.y);
        float d2=max(abs(f.x),abs(f.y));
        float d3=length(f);
        float pattern=sin(d1*6.28+u_time)*0.5+0.5;
        float pattern2=sin(d2*6.28-u_time*0.7)*0.5+0.5;
        float zone=step(0.25,d1)*step(d1,0.45);
        vec3 col=mix(vec3(0.1,0.3,0.6),vec3(0.9,0.7,0.2),pattern*zone);
        col=mix(col,vec3(0.8,0.2,0.1),pattern2*(1.0-zone)*0.5);
        float edge=smoothstep(0.01,0.0,abs(d1-0.25))+smoothstep(0.01,0.0,abs(d1-0.45));
        col=mix(col,vec3(0.1),edge*0.8);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'cloud-layer-37',
    name: 'Cloud Layer',
    description: 'Soft cloud formations scrolling by.',
    tags: ['2d', 'nature', 'clouds'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        uv.x+=u_time*0.02;
        float cloud=fbm(uv*4.0);
        cloud=smoothstep(0.3,0.7,cloud);
        vec3 sky=mix(vec3(0.3,0.5,0.9),vec3(0.6,0.75,1.0),uv.y);
        vec3 col=mix(sky,vec3(1.0,0.98,0.95),cloud);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'vine-growth-37',
    name: 'Vine Growth',
    description: 'Branching vines growing across the screen.',
    tags: ['2d', 'organic', 'plant'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.1,0.15,0.05);
        for(float i=0.0;i<8.0;i++){
          float y=0.5+sin(uv.x*5.0+i*2.0+u_time*0.5)*0.2*sin(i+u_time*0.3);
          float vine=smoothstep(0.01,0.0,abs(uv.y-y));
          float growth=smoothstep(0.0,1.0,uv.x*2.0-mod(u_time*0.3+i*0.3,2.0));
          vine*=growth;
          float leaf=smoothstep(0.03,0.0,length(vec2(uv.x-fract(i*0.37+u_time*0.1),uv.y-y)*vec2(1,3)));
          col+=vec3(0.0,0.5,0.1)*vine;
          col+=vec3(0.1,0.8,0.2)*leaf*growth;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'heat-map-37',
    name: 'Heat Map',
    description: 'Thermal imaging style heat visualization.',
    tags: ['2d', 'thermal', 'heatmap'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float temp=fbm(uv*4.0+u_time*0.15);
        vec3 cold=vec3(0.0,0.0,0.5);
        vec3 cool=vec3(0.0,0.5,1.0);
        vec3 warm=vec3(1.0,1.0,0.0);
        vec3 hot=vec3(1.0,0.0,0.0);
        vec3 col=temp<0.33?mix(cold,cool,temp*3.0):temp<0.66?mix(cool,warm,(temp-0.33)*3.0):mix(warm,hot,(temp-0.66)*3.0);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'geometric-rose-37',
    name: 'Geometric Rose',
    description: 'Mathematical rose curve pattern.',
    tags: ['2d', 'math', 'rose'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float k=3.0+sin(u_time*0.2)*2.0;
        float rose=abs(cos(k*a+u_time*0.5))*0.4;
        float d=abs(r-rose);
        float line=smoothstep(0.02,0.005,d);
        float fill=smoothstep(rose+0.02,rose,r);
        vec3 col=vec3(0.05,0.0,0.1);
        col+=vec3(0.9,0.2,0.4)*line;
        col+=vec3(0.3,0.05,0.1)*fill;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'data-stream-37',
    name: 'Data Stream',
    description: 'Binary data flowing through fiber optic cables.',
    tags: ['2d', 'digital', 'data'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.02,0.0,0.05);
        for(float i=0.0;i<10.0;i++){
          float y=i/10.0+0.05;
          float fiber=smoothstep(0.008,0.0,abs(uv.y-y));
          float data=step(0.5,hash(vec2(floor(uv.x*50.0-u_time*10.0*(0.5+i*0.2)),i)));
          float pulse=smoothstep(0.05,0.0,abs(uv.x-fract(u_time*(0.5+i*0.2))));
          vec3 fCol=mix(vec3(0.0,0.3,1.0),vec3(0.0,1.0,0.5),i/10.0);
          col+=fCol*fiber*0.3;
          col+=fCol*fiber*data*0.5;
          col+=vec3(1.0)*pulse*fiber;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'paper-fold-37',
    name: 'Paper Fold',
    description: 'Origami-like paper folding shadows.',
    tags: ['2d', 'artistic', 'origami'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float s=sin(u_time*0.3),c=cos(u_time*0.3);
        uv=mat2(c,-s,s,c)*uv;
        vec2 p=abs(uv);
        float fold1=abs(p.x+p.y-0.5);
        float fold2=abs(p.x-p.y);
        float fold3=abs(p.x-0.25);
        float fold4=abs(p.y-0.25);
        float folds=min(min(fold1,fold2),min(fold3,fold4));
        float crease=smoothstep(0.02,0.005,folds);
        float face=floor(p.x*4.0+p.y*4.0);
        float shade=0.5+face*0.05;
        vec3 paper=vec3(0.95,0.92,0.88)*shade;
        vec3 col=mix(paper,paper*0.6,crease);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'bioluminescence-37',
    name: 'Bioluminescence',
    description: 'Deep sea bioluminescent organisms glowing.',
    tags: ['2d', 'organic', 'glow'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.0,0.02,0.08);
        for(float i=0.0;i<30.0;i++){
          vec2 pos=vec2(hash(i)-0.5,hash(i+30.0)-0.5)*1.5;
          pos+=vec2(sin(u_time*hash(i+60.0)+i),cos(u_time*hash(i+90.0)+i))*0.2;
          float d=length(uv-pos);
          float size=0.02+hash(i+120.0)*0.03;
          float pulse=sin(u_time*2.0+i)*0.5+0.5;
          float glow=size/(d*d+0.001)*0.005*pulse;
          vec3 bCol=mix(vec3(0.0,0.5,1.0),vec3(0.0,1.0,0.5),hash(i+150.0));
          col+=bCol*glow;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  }
];
