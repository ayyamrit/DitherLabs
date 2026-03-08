import type { DitherShaderDef } from './ditherShaders';

export const shaderPack21: DitherShaderDef[] = [
  {
    id: 'liquid-chrome',
    name: 'Liquid Chrome',
    description: 'Reflective molten chrome surface with flowing metallic distortions.',
    tags: ['metallic', 'organic', '2d'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.1;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 p=uv*3.0;
        float n1=fbm(p+u_time*0.3+u_mouse*2.0);
        float n2=fbm(p*1.5-u_time*0.2+n1*1.5);
        float chrome=sin(n2*8.0)*0.5+0.5;
        chrome=pow(chrome,0.6);
        vec3 col=mix(vec3(0.15,0.17,0.2),vec3(0.9,0.92,0.95),chrome);
        col+=vec3(0.3,0.5,0.7)*pow(chrome,4.0)*0.5;
        col+=vec3(0.7,0.3,0.5)*pow(1.0-chrome,4.0)*0.3;
        float spec=pow(max(0.0,sin(n2*16.0)),8.0)*0.6;
        col+=spec;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'aurora-waves',
    name: 'Aurora Waves',
    description: 'Northern lights aurora borealis with flowing curtains of ethereal color.',
    tags: ['nature', 'organic', 'space'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float t=u_time*0.4;
        vec3 col=vec3(0.01,0.01,0.05);
        for(int i=0;i<5;i++){
          float fi=float(i);
          float y=0.5+sin(uv.x*3.0+t+fi*1.3)*0.15+sin(uv.x*7.0-t*0.7+fi)*0.05;
          float d=abs(uv.y-y);
          float glow=0.008/(d+0.005);
          float mx=sin(u_mouse.x*3.14+fi)*0.1;
          vec3 c=vec3(0.1+fi*0.1,0.8-fi*0.1,0.4+fi*0.12);
          col+=c*glow*(0.3+0.7*sin(uv.x*4.0+t+fi+mx));
        }
        col=clamp(col,0.0,1.0);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'hex-matrix',
    name: 'Hex Matrix',
    description: 'Hexagonal grid with cascading data-rain and cyber pulse effects.',
    tags: ['geometric', 'retro', 'glitch'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hex(vec2 p){p=abs(p);return max(p.x+p.y*0.577,p.y*1.154);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 p=uv*12.0;
        p.x*=1.154;
        float row=floor(p.y);
        if(mod(row,2.0)>0.5)p.x+=0.5;
        vec2 cell=floor(p);
        vec2 f=fract(p)-0.5;
        float h=hex(f);
        float edge=smoothstep(0.45,0.42,h);
        float fill=smoothstep(0.38,0.3,h);
        float rain=fract(sin(dot(cell,vec2(127.1,311.7)))*43758.5453);
        float wave=sin(cell.y*0.5-u_time*2.0+rain*6.28)*0.5+0.5;
        float pulse=step(0.7,wave)*fill;
        float md=length(uv-u_mouse);
        float proximity=exp(-md*5.0);
        vec3 col=vec3(0.02,0.04,0.02);
        col+=edge*vec3(0.0,0.15,0.05);
        col+=pulse*vec3(0.1,0.9,0.3)*(0.5+proximity*0.5);
        col+=proximity*fill*vec3(0.0,0.4,0.15)*0.3;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'plasma-ocean',
    name: 'Plasma Ocean',
    description: 'Deep ocean plasma with bioluminescent waves and turbulent depth.',
    tags: ['organic', 'nature', '2d'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float t=u_time*0.5;
        float v=0.0;
        vec2 p=uv*6.0;
        v+=sin(p.x+t);
        v+=sin((p.y+t)*0.7);
        v+=sin((p.x+p.y+t)*0.5);
        v+=sin(sqrt(p.x*p.x+p.y*p.y+1.0)+t);
        float md=length(uv-u_mouse);
        v+=sin(md*15.0-t*3.0)*0.5;
        v*=0.5;
        vec3 col;
        col.r=sin(v*3.14)*0.3;
        col.g=sin(v*3.14+2.09)*0.4+0.2;
        col.b=sin(v*3.14+4.18)*0.3+0.5;
        col=max(col,0.0);
        col+=vec3(0.0,0.05,0.15);
        float foam=pow(max(0.0,sin(v*12.0)),8.0)*0.3;
        col+=foam*vec3(0.3,0.7,1.0);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'circuit-board',
    name: 'Circuit Board',
    description: 'PCB trace visualization with flowing current and active component highlights.',
    tags: ['mechanical', 'geometric', 'retro'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 grid=uv*20.0;
        vec2 cell=floor(grid);
        vec2 f=fract(grid);
        float r=hash(cell);
        float trace=0.0;
        if(r<0.25)trace=smoothstep(0.06,0.0,abs(f.y-0.5));
        else if(r<0.5)trace=smoothstep(0.06,0.0,abs(f.x-0.5));
        else if(r<0.7){trace=smoothstep(0.06,0.0,abs(f.x-0.5));trace=max(trace,smoothstep(0.06,0.0,abs(f.y-0.5)));}
        else{float d=length(f-0.5);trace=smoothstep(0.2,0.15,d)-smoothstep(0.12,0.08,d);}
        float current=sin(cell.x+cell.y-u_time*4.0)*0.5+0.5;
        current=pow(current,3.0);
        float md=length(uv-u_mouse);
        float active=exp(-md*6.0);
        vec3 col=vec3(0.02,0.04,0.02);
        col+=trace*vec3(0.0,0.3,0.1);
        col+=trace*current*vec3(0.2,1.0,0.4)*(0.3+active*0.7);
        float pad=smoothstep(0.15,0.1,length(f-0.5))*step(0.85,r);
        col+=pad*vec3(0.6,0.5,0.1);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'diamond-rain',
    name: 'Diamond Rain',
    description: 'Crystalline diamond-shaped particles falling through prismatic light.',
    tags: ['geometric', 'artistic', '2d'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float diamond(vec2 p){return abs(p.x)+abs(p.y);}
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.02,0.02,0.06);
        for(int i=0;i<20;i++){
          float fi=float(i);
          float speed=0.3+hash(fi)*0.7;
          float x=hash(fi*7.3);
          float y=fract(-u_time*speed*0.3+hash(fi*3.1));
          vec2 pos=vec2(x,y);
          float size=0.01+hash(fi*5.7)*0.02;
          float d=diamond((uv-pos)/size);
          float shape=smoothstep(1.0,0.5,d);
          float hue=fract(fi*0.137+u_time*0.1);
          vec3 c;
          c.r=0.5+0.5*sin(hue*6.28);
          c.g=0.5+0.5*sin(hue*6.28+2.09);
          c.b=0.5+0.5*sin(hue*6.28+4.18);
          float md=length(uv-u_mouse);
          float sparkle=pow(max(0.0,1.0-d*2.0),8.0);
          col+=shape*c*0.4*(0.5+exp(-md*3.0)*0.5);
          col+=sparkle*c*0.3;
        }
        col=clamp(col,0.0,1.0);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'smoke-tendrils',
    name: 'Smoke Tendrils',
    description: 'Wispy smoke tendrils curling and dissolving with turbulent advection.',
    tags: ['organic', 'artistic', '2d'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;mat2 m=mat2(0.8,0.6,-0.6,0.8);for(int i=0;i<6;i++){v+=a*noise(p);p=m*p*2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 p=uv*3.0;
        p.y-=u_time*0.2;
        float n1=fbm(p+vec2(u_time*0.1,0.0));
        float n2=fbm(p+n1*1.5+u_mouse*2.0);
        float smoke=smoothstep(0.35,0.65,n2);
        smoke*=smoothstep(0.0,0.3,uv.y)*smoothstep(1.0,0.5,uv.y);
        float wisp=pow(smoke,2.0);
        vec3 col=vec3(0.02,0.02,0.04);
        col=mix(col,vec3(0.3,0.3,0.35),wisp*0.6);
        col=mix(col,vec3(0.5,0.5,0.55),pow(wisp,3.0)*0.4);
        float edge=abs(dFdx(smoke))+abs(dFdy(smoke));
        col+=edge*vec3(0.2,0.2,0.25)*2.0;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'waveform-viz',
    name: 'Waveform Visualizer',
    description: 'Audio waveform visualization with harmonic overtones and beat-reactive glow.',
    tags: ['artistic', '2d', 'retro'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.02,0.02,0.06);
        for(int i=0;i<8;i++){
          float fi=float(i);
          float freq=1.0+fi*0.7;
          float amp=0.15/(1.0+fi*0.3);
          float phase=u_time*(1.0+fi*0.2)+u_mouse.x*fi*0.5;
          float wave=sin(uv.x*freq*6.28+phase)*amp;
          wave+=sin(uv.x*freq*12.56-phase*0.7)*amp*0.3;
          float y=0.5+wave;
          float d=abs(uv.y-y);
          float glow=0.004/(d+0.002);
          float beat=pow(max(0.0,sin(u_time*2.0+fi)),4.0)*0.5+0.5;
          vec3 c;
          c.r=0.5+0.5*sin(fi*0.8);
          c.g=0.5+0.5*sin(fi*0.8+2.0);
          c.b=0.5+0.5*sin(fi*0.8+4.0);
          col+=c*glow*beat*0.3;
        }
        float scanline=0.95+0.05*sin(gl_FragCoord.y*3.14);
        col*=scanline;
        col=clamp(col,0.0,1.0);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
];
