import type { DitherShaderDef } from './ditherShaders';

export const shaderPack38: DitherShaderDef[] = [
  {
    id: 'tape-distort-38',
    name: 'VHS Tape Distortion',
    description: 'VHS tape tracking errors and color bleed.',
    tags: ['2d', 'retro', 'vhs'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float t=floor(u_time*4.0);
        float tracking=hash(t)*0.05*step(0.9,hash(t+1.0));
        uv.x+=tracking*sin(uv.y*100.0);
        float chromaShift=0.005+tracking*0.02;
        float r=sin((uv.x-chromaShift)*20.0+uv.y*10.0+u_time)*0.5+0.5;
        float g=sin(uv.x*20.0+uv.y*10.0+u_time)*0.5+0.5;
        float b=sin((uv.x+chromaShift)*20.0+uv.y*10.0+u_time)*0.5+0.5;
        float noise=hash(floor(uv.y*200.0)+t)*0.1;
        float scanline=0.9+0.1*sin(uv.y*u_resolution.y*3.14);
        vec3 col=vec3(r,g,b)*scanline+noise;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'particle-swarm-38',
    name: 'Particle Swarm',
    description: 'Swirling particles following flocking behavior.',
    tags: ['2d', 'particles', 'swarm'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.02,0.01,0.04);
        for(float i=0.0;i<60.0;i++){
          float a=hash(i)*6.28+u_time*(0.5+hash(i+100.0));
          float r2=hash(i+50.0)*0.5+sin(u_time*0.5+i)*0.1;
          vec2 pos=vec2(cos(a),sin(a))*r2;
          float d=length(uv-pos);
          col+=vec3(0.5,0.7,1.0)*0.001/(d*d+0.0001);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'zen-garden-38',
    name: 'Zen Garden',
    description: 'Raked sand patterns in a zen garden.',
    tags: ['2d', 'zen', 'peaceful'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 center=vec2(0.5,0.5);
        float r=length(uv-center);
        float a=atan(uv.y-center.y,uv.x-center.x);
        float rake=sin(a*20.0+r*30.0-u_time*0.5)*0.5+0.5;
        float stone=smoothstep(0.08,0.07,r);
        float stone2=smoothstep(0.06,0.05,length(uv-vec2(0.3,0.7)));
        rake=mix(rake,0.0,max(stone,stone2));
        vec3 sand=vec3(0.85,0.8,0.7);
        vec3 groove=vec3(0.7,0.65,0.55);
        vec3 col=mix(groove,sand,rake);
        col=mix(col,vec3(0.3,0.3,0.35),max(stone,stone2));
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'retro-sunset-38',
    name: 'Retro Sunset',
    description: '80s style sunset with horizontal bands.',
    tags: ['2d', 'retro', 'sunset'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 sky=mix(vec3(0.1,0.0,0.3),vec3(1.0,0.3,0.5),uv.y);
        float sun_d=length(vec2(uv.x-0.5,uv.y-0.6)*vec2(1.0,1.5));
        float sun=smoothstep(0.25,0.24,sun_d);
        float bands=step(0.5,sin(uv.y*40.0+u_time))*sun*step(uv.y,0.6);
        sun*=(1.0-bands*0.5);
        vec3 sunCol=mix(vec3(1.0,0.8,0.0),vec3(1.0,0.3,0.2),1.0-uv.y);
        vec3 col=mix(sky,sunCol,sun);
        float ground=step(uv.y,0.35);
        float perspective=0.3/(0.36-uv.y+0.01);
        vec2 grid=vec2(uv.x*perspective,perspective+u_time);
        float lines=smoothstep(0.05,0.0,abs(fract(grid.x*2.0)-0.5))+smoothstep(0.05,0.0,abs(fract(grid.y*0.5)-0.5));
        col=mix(col,vec3(0.0),ground*0.7);
        col+=vec3(0.5,0.0,1.0)*lines*ground*0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'plaid-pattern-38',
    name: 'Tartan Plaid',
    description: 'Scottish tartan plaid fabric pattern.',
    tags: ['2d', 'pattern', 'fabric'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float s=sin(u_time*0.1),c=cos(u_time*0.1);
        uv=vec2(uv.x*c-uv.y*s,uv.x*s+uv.y*c);
        vec3 base=vec3(0.1,0.2,0.1);
        float stripe1=smoothstep(0.02,0.0,abs(fract(uv.x*5.0)-0.5));
        float stripe2=smoothstep(0.02,0.0,abs(fract(uv.y*5.0)-0.5));
        float stripe3=smoothstep(0.05,0.0,abs(fract(uv.x*5.0+0.25)-0.5));
        float stripe4=smoothstep(0.05,0.0,abs(fract(uv.y*5.0+0.25)-0.5));
        vec3 col=base;
        col+=vec3(0.6,0.0,0.0)*stripe1*0.5;
        col+=vec3(0.6,0.0,0.0)*stripe2*0.5;
        col+=vec3(0.0,0.0,0.5)*stripe3*0.3;
        col+=vec3(0.0,0.0,0.5)*stripe4*0.3;
        col+=vec3(0.8,0.8,0.0)*(stripe1*stripe2)*0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'crystal-lattice-38',
    name: 'Crystal Lattice',
    description: 'Rotating crystal lattice structure.',
    tags: ['2d', 'geometric', 'crystal'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float s=sin(u_time*0.3),c=cos(u_time*0.3);
        uv=mat2(c,-s,s,c)*uv;
        vec3 col=vec3(0.05,0.0,0.1);
        float grid1=smoothstep(0.02,0.0,abs(fract(uv.x*5.0)-0.5))+smoothstep(0.02,0.0,abs(fract(uv.y*5.0)-0.5));
        uv=mat2(0.866,-0.5,0.5,0.866)*uv;
        float grid2=smoothstep(0.02,0.0,abs(fract(uv.x*5.0)-0.5))+smoothstep(0.02,0.0,abs(fract(uv.y*5.0)-0.5));
        col+=vec3(0.2,0.5,1.0)*grid1*0.3;
        col+=vec3(1.0,0.3,0.5)*grid2*0.3;
        float node=smoothstep(0.05,0.03,length(fract(uv*5.0)-0.5));
        col+=vec3(1.0,0.8,0.5)*node;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'rain-window-38',
    name: 'Rain on Window',
    description: 'Raindrops running down a window pane.',
    tags: ['2d', 'weather', 'rain'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 bg=vec3(0.2,0.25,0.3);
        vec3 col=bg;
        float grid=20.0;
        vec2 id=floor(uv*grid);
        vec2 f=fract(uv*grid);
        float rnd=hash(id);
        float speed=0.5+rnd*1.5;
        float dropY=fract(-u_time*speed*0.2+rnd);
        float trail=smoothstep(0.1,0.0,abs(f.x-0.5))*step(f.y,dropY)*step(dropY-0.3,f.y);
        float drop=smoothstep(0.15,0.05,length(f-vec2(0.5,dropY)));
        float distort=drop*0.3+trail*0.1;
        vec3 refracted=mix(bg,vec3(0.4,0.5,0.6),distort);
        col=mix(col,refracted,max(drop,trail));
        col+=vec3(0.3)*drop*0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'spider-web-38',
    name: 'Spider Web',
    description: 'Geometric spider web with morning dew.',
    tags: ['2d', 'organic', 'web'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float radial=smoothstep(0.005,0.0,abs(fract(a/0.523)-0.5));
        float spiral=smoothstep(0.005,0.0,abs(fract(r*10.0+sin(a*2.0)*0.1)-0.5));
        float web=(radial+spiral)*step(r,0.45);
        float sway=sin(u_time+a*3.0)*0.01;
        float dew_r=fract(r*10.0+0.5)*0.1;
        float dew=smoothstep(0.02,0.01,abs(r+sway-floor(r*10.0+0.5)/10.0))*radial;
        vec3 col=vec3(0.6,0.7,0.8)*0.3;
        col+=vec3(0.8,0.85,0.9)*web*0.5;
        col+=vec3(0.9,0.95,1.0)*dew;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'lissajous-38',
    name: 'Lissajous Curves',
    description: 'Animated Lissajous figures with glowing trails.',
    tags: ['2d', 'math', 'curves'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.02,0.0,0.05);
        for(float t=0.0;t<6.28;t+=0.02){
          float x=sin(3.0*t+u_time)*0.35;
          float y=sin(4.0*t)*0.35;
          float d=length(uv-vec2(x,y));
          float fade=1.0-t/6.28;
          col+=vec3(0.0,0.8,1.0)*0.001/(d+0.001)*fade;
        }
        for(float t=0.0;t<6.28;t+=0.02){
          float x=sin(5.0*t-u_time*0.7)*0.3;
          float y=sin(3.0*t)*0.3;
          float d=length(uv-vec2(x,y));
          float fade=1.0-t/6.28;
          col+=vec3(1.0,0.3,0.0)*0.001/(d+0.001)*fade;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'topaz-gem-38',
    name: 'Gemstone Facets',
    description: 'Polished gemstone with light-catching facets.',
    tags: ['2d', 'crystal', 'gem'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float facets=8.0;
        float fa=floor(a/(6.28/facets));
        float brightness=sin(fa*3.0+u_time*2.0)*0.3+0.7;
        float gem=smoothstep(0.4,0.38,r);
        float inner=smoothstep(0.2,0.18,r);
        float edge=smoothstep(0.01,0.0,abs(fract(a/(6.28/facets))-0.5))*gem;
        vec3 gemCol=vec3(0.2,0.6,0.9)*brightness;
        gemCol+=vec3(0.5,0.8,1.0)*inner*0.3;
        vec3 col=mix(vec3(0.05),gemCol,gem);
        col+=vec3(0.3,0.5,0.7)*edge*0.3;
        float sparkle=pow(max(sin(a*facets+u_time*5.0),0.0),16.0)*gem;
        col+=vec3(1.0)*sparkle*0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'glitch-scanline-38',
    name: 'Scanline Glitch',
    description: 'Horizontal scanline disruption with RGB shift.',
    tags: ['2d', 'glitch', 'scanline'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float line=floor(uv.y*100.0);
        float t=floor(u_time*3.0);
        float glitch=step(0.92,hash(line+t))*hash(line*2.0+t);
        vec2 uvR=uv+vec2(glitch*0.1,0.0);
        vec2 uvB=uv-vec2(glitch*0.1,0.0);
        float pattern=sin(uv.x*30.0+uv.y*20.0+u_time)*0.5+0.5;
        float r=sin(uvR.x*30.0+uvR.y*20.0+u_time)*0.5+0.5;
        float g=pattern;
        float b=sin(uvB.x*30.0+uvB.y*20.0+u_time)*0.5+0.5;
        vec3 col=vec3(r,g,b);
        col*=0.9+0.1*sin(uv.y*u_resolution.y*3.14);
        col+=vec3(glitch*0.3);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'woven-fabric-38',
    name: 'Woven Fabric',
    description: 'Tight weave textile pattern.',
    tags: ['2d', 'pattern', 'textile'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*20.0;
        vec2 id=floor(uv);
        vec2 f=fract(uv);
        float over=mod(id.x+id.y,2.0);
        float warpThread=smoothstep(0.1,0.2,f.x)*smoothstep(0.9,0.8,f.x);
        float weftThread=smoothstep(0.1,0.2,f.y)*smoothstep(0.9,0.8,f.y);
        float depth=over>0.5?step(0.5,warpThread):step(0.5,weftThread);
        float shade=0.6+depth*0.4;
        float hue=mod(id.x*0.1+u_time*0.1,1.0);
        vec3 col=0.5+0.5*cos(6.28*(hue+vec3(0.0,0.33,0.67)));
        col*=shade;
        col*=max(warpThread,weftThread)*0.5+0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'nebula-38',
    name: 'Nebula Clouds',
    description: 'Colorful interstellar nebula with star birth.',
    tags: ['2d', 'space', 'nebula'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float n1=fbm(uv*3.0+u_time*0.05);
        float n2=fbm(uv*4.0+vec2(5.0)-u_time*0.03);
        float n3=fbm(uv*5.0+vec2(10.0)+u_time*0.04);
        vec3 col=vec3(0.01);
        col+=vec3(0.5,0.1,0.3)*n1;
        col+=vec3(0.1,0.2,0.5)*n2;
        col+=vec3(0.3,0.1,0.5)*n3*0.5;
        float stars=step(0.98,hash(floor(gl_FragCoord.xy*0.5)));
        col+=vec3(1.0)*stars;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'sine-ribbon-38',
    name: 'Sine Ribbon',
    description: 'Twisted ribbon following sine wave path.',
    tags: ['2d', 'wave', 'ribbon'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.05,0.0,0.1);
        for(float i=0.0;i<5.0;i++){
          float offset=i*0.15-0.3;
          float wave=sin(uv.x*5.0+u_time*(1.0+i*0.3)+i)*0.2;
          float d=abs(uv.y-wave-offset);
          float width=0.03+0.01*sin(uv.x*10.0+u_time);
          float ribbon=smoothstep(width,0.0,d);
          vec3 rCol=0.5+0.5*cos(6.28*(i/5.0+u_time*0.1+vec3(0.0,0.33,0.67)));
          col+=rCol*ribbon*0.6;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'circuit-glow-38',
    name: 'Glowing Circuitry',
    description: 'Neon-lit circuit paths pulsing with energy.',
    tags: ['2d', 'tech', 'neon'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float grid=10.0;
        vec2 id=floor(uv*grid);
        vec2 f=fract(uv*grid);
        float h=hash(id);
        float dir=step(0.5,h);
        float trace=dir*smoothstep(0.08,0.0,abs(f.y-0.5))+(1.0-dir)*smoothstep(0.08,0.0,abs(f.x-0.5));
        float pulse=sin(u_time*3.0+h*6.28+id.x+id.y)*0.5+0.5;
        vec3 col=vec3(0.02,0.0,0.05);
        vec3 glow=mix(vec3(0.0,0.5,1.0),vec3(1.0,0.0,0.5),h);
        col+=glow*trace*pulse;
        col+=glow*trace*0.2;
        float node=smoothstep(0.12,0.08,length(f-0.5));
        col+=vec3(1.0,0.8,0.5)*node*pulse;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'rust-38',
    name: 'Rust Patina',
    description: 'Corroded metal with rust and patina.',
    tags: ['2d', 'texture', 'rust'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float rust=fbm(uv*8.0+u_time*0.02);
        float patina=fbm(uv*12.0+vec2(5.0)+u_time*0.015);
        float scratch=smoothstep(0.48,0.5,noise(uv*vec2(2.0,30.0)));
        vec3 metal=vec3(0.5,0.5,0.55);
        vec3 rustCol=vec3(0.6,0.25,0.1);
        vec3 patinaCol=vec3(0.2,0.5,0.4);
        vec3 col=mix(metal,rustCol,smoothstep(0.3,0.7,rust));
        col=mix(col,patinaCol,smoothstep(0.5,0.8,patina)*0.5);
        col=mix(col,metal*1.2,scratch*0.3);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'heartbeat-38',
    name: 'Heartbeat Monitor',
    description: 'ECG heartbeat line scrolling across screen.',
    tags: ['2d', 'medical', 'pulse'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float x=fract(uv.x-u_time*0.3);
        float ecg=0.0;
        ecg+=smoothstep(0.02,0.0,abs(x-0.2))*0.1;
        ecg+=smoothstep(0.01,0.0,abs(x-0.3))*(-0.15);
        ecg+=smoothstep(0.008,0.0,abs(x-0.35))*0.6;
        ecg+=smoothstep(0.01,0.0,abs(x-0.4))*(-0.2);
        ecg+=smoothstep(0.03,0.0,abs(x-0.5))*0.15;
        ecg+=smoothstep(0.05,0.0,abs(x-0.65))*0.08;
        float y=uv.y-0.5;
        float line=smoothstep(0.01,0.0,abs(y-ecg));
        float trail=smoothstep(0.0,0.5,x);
        vec3 col=vec3(0.0,0.05,0.0);
        col+=vec3(0.0,1.0,0.0)*line*trail;
        col+=vec3(0.0,0.2,0.0)*smoothstep(0.005,0.0,abs(y))*0.3;
        for(float i=0.0;i<5.0;i++){
          col+=vec3(0.0,0.1,0.0)*smoothstep(0.003,0.0,abs(uv.x-i*0.2));
          col+=vec3(0.0,0.1,0.0)*smoothstep(0.003,0.0,abs(uv.y-i*0.2));
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'starburst-38',
    name: 'Starburst',
    description: 'Radial starburst with rotating beams.',
    tags: ['2d', 'radial', 'burst'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float a=atan(uv.y,uv.x)+u_time*0.5;
        float r=length(uv);
        float beams=abs(sin(a*8.0));
        beams=pow(beams,0.3);
        float glow=0.1/(r+0.1);
        vec3 col=vec3(0.05);
        col+=vec3(1.0,0.8,0.3)*beams*glow;
        col+=vec3(1.0,0.9,0.5)*0.05/(r+0.05);
        float ring=smoothstep(0.02,0.0,abs(r-0.3-sin(u_time)*0.05));
        col+=vec3(1.0,0.6,0.2)*ring;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'dna-helix-38',
    name: 'DNA Double Helix',
    description: 'Rotating DNA double helix structure.',
    tags: ['2d', 'biology', 'helix'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.02,0.0,0.08);
        float y=uv.y*8.0;
        for(float i=-10.0;i<10.0;i++){
          float py=i*0.4;
          float phase=py+u_time;
          float x1=sin(phase)*0.15;
          float x2=-sin(phase)*0.15;
          float z1=cos(phase);
          float z2=-cos(phase);
          float d1=length(uv-vec2(x1,py/8.0));
          float d2=length(uv-vec2(x2,py/8.0));
          float depth1=0.5+z1*0.3;
          float depth2=0.5+z2*0.3;
          col+=vec3(0.2,0.5,1.0)*0.003/(d1+0.003)*depth1;
          col+=vec3(1.0,0.3,0.2)*0.003/(d2+0.003)*depth2;
          float bridge=smoothstep(0.01,0.0,abs(uv.y-py/8.0))*smoothstep(abs(x1),0.0,abs(uv.x))*step(0.0,z1);
          col+=vec3(0.3,0.8,0.3)*bridge*0.3;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  }
];
