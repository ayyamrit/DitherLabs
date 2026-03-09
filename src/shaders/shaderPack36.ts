import type { DitherShaderDef } from './ditherShaders';

export const shaderPack36: DitherShaderDef[] = [
  {
    id: 'coral-growth-36',
    name: 'Coral Growth',
    description: 'Branching coral-like structures growing outward.',
    tags: ['2d', 'organic', 'coral'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float branch=fbm(vec2(a*3.0,r*5.0-u_time*0.3));
        float coral=smoothstep(0.4+branch*0.3,0.3+branch*0.3,r);
        vec3 col=vec3(0.0,0.1,0.2);
        col=mix(col,vec3(0.9,0.3,0.4),coral);
        col=mix(col,vec3(1.0,0.6,0.5),coral*smoothstep(0.2,0.0,r));
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'celtic-knot-36',
    name: 'Celtic Knot',
    description: 'Interwoven Celtic knot pattern.',
    tags: ['2d', 'geometric', 'celtic'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y*4.0;
        float s=sin(u_time*0.2),c=cos(u_time*0.2);
        uv=mat2(c,-s,s,c)*uv;
        vec2 p=fract(uv)-0.5;
        float d1=abs(length(p-vec2(0.5,0.5))-0.5);
        float d2=abs(length(p-vec2(-0.5,-0.5))-0.5);
        float d3=abs(length(p-vec2(0.5,-0.5))-0.5);
        float d4=abs(length(p-vec2(-0.5,0.5))-0.5);
        float d=min(min(d1,d2),min(d3,d4));
        float line=smoothstep(0.05,0.02,d);
        vec3 col=mix(vec3(0.1,0.05,0.0),vec3(0.8,0.6,0.2),line);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'digital-camo-36',
    name: 'Digital Camo',
    description: 'Pixelated digital camouflage pattern.',
    tags: ['2d', 'pattern', 'military'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float pixSize=8.0;
        vec2 p=floor(gl_FragCoord.xy/pixSize);
        float n=noise(p*0.1+u_time*0.05);
        float n2=noise(p*0.05+vec2(10.0)+u_time*0.03);
        vec3 c1=vec3(0.2,0.25,0.15);
        vec3 c2=vec3(0.35,0.35,0.2);
        vec3 c3=vec3(0.15,0.2,0.1);
        vec3 c4=vec3(0.4,0.38,0.25);
        vec3 col=n<0.3?c1:n<0.5?c2:n<0.7?c3:c4;
        col*=0.9+n2*0.2;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'prism-rainbow-36',
    name: 'Prism Rainbow',
    description: 'Light splitting through a prism into rainbow.',
    tags: ['2d', 'optics', 'rainbow'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      vec3 rainbow(float t){return 0.5+0.5*cos(6.28*(t+vec3(0.0,0.33,0.67)));}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float beam=smoothstep(0.02,0.0,abs(uv.y+uv.x*0.3))*step(uv.x,-0.1);
        float prism=step(abs(uv.x),0.15)*step(abs(uv.y),0.2-abs(uv.x)*0.5);
        float spread=(uv.x+0.1)*2.0;
        float rainbow_t=uv.y/max(spread,0.01)*0.5+0.5;
        float dispersed=step(0.1,uv.x)*smoothstep(0.5,0.0,abs(spread));
        vec3 col=vec3(0.02);
        col+=vec3(1.0)*beam;
        col+=vec3(0.2,0.25,0.3)*prism;
        col+=rainbow(rainbow_t+u_time*0.1)*dispersed*smoothstep(0.01,0.0,abs(uv.y)-spread*0.4);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'pixel-sort-36',
    name: 'Pixel Sort',
    description: 'Glitch art pixel sorting effect.',
    tags: ['2d', 'glitch', 'sort'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float row=floor(uv.y*40.0);
        float seed=hash(vec2(row,floor(u_time*2.0)));
        float sortStart=seed*0.5;
        float sortEnd=sortStart+seed*0.5;
        float sorted=step(sortStart,uv.x)*step(uv.x,sortEnd);
        float hue=sorted>0.5?(uv.x-sortStart)/(sortEnd-sortStart):hash(floor(gl_FragCoord.xy/4.0));
        vec3 col=0.5+0.5*cos(6.28*(hue+vec3(0.0,0.33,0.67)));
        col*=sorted>0.5?0.8+0.2*sin(uv.x*50.0):1.0;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'snow-fall-36',
    name: 'Snowfall',
    description: 'Gentle snowflakes drifting downward.',
    tags: ['2d', 'weather', 'snow'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.05,0.05,0.15);
        for(float i=0.0;i<40.0;i++){
          float x=hash(i)*1.0;
          float speed=0.2+hash(i+10.0)*0.3;
          float size=0.003+hash(i+20.0)*0.005;
          float y=fract(-u_time*speed+hash(i+5.0));
          x+=sin(u_time*0.5+i)*0.05;
          float d=length(uv-vec2(x,y));
          float depth=0.5+hash(i+30.0)*0.5;
          col+=vec3(depth)*smoothstep(size,size*0.3,d);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'soundwave-36',
    name: 'Sound Waveform',
    description: 'Audio waveform visualization with frequency bands.',
    tags: ['2d', 'audio', 'waveform'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.05,0.0,0.1);
        float wave=0.0;
        wave+=sin(uv.x*10.0+u_time*3.0)*0.1;
        wave+=sin(uv.x*25.0-u_time*5.0)*0.05;
        wave+=sin(uv.x*50.0+u_time*7.0)*0.025;
        wave+=sin(uv.x*100.0-u_time*11.0)*0.012;
        float d=abs(uv.y-wave);
        float glow=0.005/(d*d+0.0001);
        col+=vec3(0.0,0.8,1.0)*glow*0.05;
        col+=vec3(0.5,0.0,1.0)*smoothstep(0.01,0.0,d);
        float mirror=abs(uv.y+wave);
        col+=vec3(1.0,0.3,0.0)*0.003/(mirror*mirror+0.0001)*0.05;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'honeycomb-36',
    name: 'Honeycomb Grid',
    description: 'Hexagonal honeycomb with pulsing cells.',
    tags: ['2d', 'hexagonal', 'grid'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hexDist(vec2 p){p=abs(p);return max(p.x*0.866+p.y*0.5,p.y);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y*6.0;
        vec2 r=vec2(1.0,1.732);
        vec2 h=r*0.5;
        vec2 a=mod(uv,r)-h;
        vec2 b=mod(uv-h,r)-h;
        vec2 gv=length(a)<length(b)?a:b;
        float d=hexDist(gv);
        vec2 id=uv-gv;
        float pulse=sin(id.x+id.y+u_time*2.0)*0.5+0.5;
        float edge=smoothstep(0.45,0.5,d);
        vec3 col=mix(vec3(0.9,0.7,0.1)*pulse,vec3(0.3,0.2,0.0),edge);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'ascii-art-36',
    name: 'ASCII Pattern',
    description: 'ASCII character-inspired dither pattern.',
    tags: ['2d', 'digital', 'ascii'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float cellSize=8.0;
        vec2 cell=floor(gl_FragCoord.xy/cellSize);
        vec2 f=fract(gl_FragCoord.xy/cellSize);
        float brightness=sin(cell.x*0.3+u_time)*sin(cell.y*0.4-u_time*0.7)*0.5+0.5;
        float pattern=0.0;
        if(brightness>0.8)pattern=1.0;
        else if(brightness>0.6)pattern=step(0.5,f.x)*step(0.5,f.y)+step(0.5,1.0-f.x)*step(0.5,1.0-f.y);
        else if(brightness>0.4)pattern=step(0.5,f.x)+step(0.5,f.y)-step(0.5,f.x)*step(0.5,f.y);
        else if(brightness>0.2)pattern=step(0.3,abs(f.x-0.5))+step(0.3,abs(f.y-0.5));
        else pattern=0.0;
        pattern=clamp(pattern,0.0,1.0);
        vec3 col=vec3(0.0,pattern*0.8,0.0);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'marble-texture-36',
    name: 'Marble Veins',
    description: 'Natural marble texture with flowing veins.',
    tags: ['2d', 'texture', 'marble'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float n=fbm(uv*5.0+u_time*0.05);
        float marble=sin(uv.x*10.0+n*8.0)*0.5+0.5;
        marble=pow(marble,0.4);
        vec3 col=mix(vec3(0.2,0.2,0.25),vec3(0.95,0.93,0.9),marble);
        float vein=smoothstep(0.48,0.5,marble)*smoothstep(0.52,0.5,marble);
        col=mix(col,vec3(0.4,0.35,0.3),vein*0.5);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'neon-sign-36',
    name: 'Neon Sign Glow',
    description: 'Glowing neon tube shapes with reflections.',
    tags: ['2d', 'neon', 'glow'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.02,0.0,0.05);
        float d1=abs(length(uv-vec2(-0.2,0.0))-0.2);
        float d2=abs(uv.x+0.05)*step(-0.2,uv.y)*step(uv.y,0.2)+10.0*(1.0-step(-0.2,uv.y)*step(uv.y,0.2));
        float d3=abs(length(uv-vec2(0.2,0.0))-0.2);
        float flicker=0.8+0.2*sin(u_time*20.0+sin(u_time*3.0)*5.0);
        col+=vec3(1.0,0.1,0.3)*0.01/(d1*d1+0.001)*flicker;
        col+=vec3(0.1,0.3,1.0)*0.01/(d2*d2+0.001)*flicker;
        col+=vec3(0.1,1.0,0.3)*0.01/(d3*d3+0.001)*flicker;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'sand-dunes-36',
    name: 'Sand Dunes',
    description: 'Desert sand dunes with wind-blown ripples.',
    tags: ['2d', 'nature', 'desert'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float dune=sin(uv.x*3.0+noise(uv*5.0+u_time*0.1)*2.0)*0.15;
        dune+=sin(uv.x*7.0-u_time*0.2)*0.05;
        float ripple=sin((uv.x*30.0+uv.y*5.0+u_time*0.5))*0.02;
        float height=uv.y+dune+ripple;
        float light=0.7+0.3*sin(uv.x*3.0+1.0);
        vec3 col=vec3(0.85,0.7,0.4)*height*light;
        col=mix(col,vec3(0.95,0.85,0.6),smoothstep(0.5,0.8,height));
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'interference-rings-36',
    name: 'Interference Rings',
    description: 'Thin film interference creating rainbow rings.',
    tags: ['2d', 'optics', 'interference'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      vec3 rainbow(float t){return 0.5+0.5*cos(6.28*(t+vec3(0.0,0.33,0.67)));}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float d1=length(uv-vec2(-0.2,0.0));
        float d2=length(uv-vec2(0.2,0.0));
        float interference=sin(d1*40.0-u_time*2.0)+sin(d2*40.0-u_time*2.0);
        interference=interference*0.25+0.5;
        vec3 col=rainbow(interference+u_time*0.1);
        col*=0.3+0.7*interference;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'constellation-36',
    name: 'Constellation Map',
    description: 'Star map with connecting constellation lines.',
    tags: ['2d', 'space', 'constellation'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.01,0.01,0.05);
        float grid=8.0;
        vec2 id=floor(uv*grid);
        vec2 f=fract(uv*grid);
        vec2 starPos=vec2(hash(id),hash(id+vec2(1.0,0.0)));
        float star=smoothstep(0.08,0.02,length(f-starPos));
        float twinkle=sin(u_time*3.0+hash(id)*6.28)*0.3+0.7;
        col+=vec3(0.8,0.85,1.0)*star*twinkle;
        vec2 nextId=id+vec2(1.0,0.0);
        vec2 nextStar=(nextId+vec2(hash(nextId),hash(nextId+vec2(1.0,0.0))))/grid;
        vec2 thisStar=(id+starPos)/grid;
        vec2 pa=uv-thisStar;
        vec2 ba=nextStar-thisStar;
        float t2=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
        float lineDist=length(pa-ba*t2);
        col+=vec3(0.2,0.3,0.5)*smoothstep(0.003,0.0,lineDist)*0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'caustics-36',
    name: 'Water Caustics',
    description: 'Light caustics at the bottom of a pool.',
    tags: ['2d', 'water', 'caustics'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float c=0.0;
        for(float i=1.0;i<4.0;i++){
          vec2 p=uv*i*3.0+vec2(u_time*0.3*i,u_time*0.2);
          c+=noise(p)*noise(p*1.5+u_time*0.1)/i;
        }
        c=pow(c,2.0)*3.0;
        vec3 col=vec3(0.0,0.2,0.4)+vec3(0.3,0.6,0.8)*c;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'barcode-36',
    name: 'Living Barcode',
    description: 'Animated barcode with shifting line widths.',
    tags: ['2d', 'digital', 'barcode'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float col_idx=floor(uv.x*80.0);
        float h=hash(col_idx+floor(u_time*2.0));
        float bar=step(0.4,h);
        float width=step(0.7,h)?0.8:0.4;
        float x=fract(uv.x*80.0);
        float line=step(x,width)*bar;
        float scanY=fract(u_time*0.5);
        float scan=smoothstep(0.02,0.0,abs(uv.y-scanY))*0.3;
        vec3 c=vec3(line)+vec3(1.0,0.0,0.0)*scan;
        gl_FragColor=vec4(c,1.0);
      }
    `
  },
  {
    id: 'paint-drip-36',
    name: 'Paint Drip',
    description: 'Paint dripping down with color mixing.',
    tags: ['2d', 'artistic', 'drip'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.95);
        for(float i=0.0;i<12.0;i++){
          float x=hash(i)*0.9+0.05;
          float speed=0.3+hash(i+10.0)*0.5;
          float width=0.02+hash(i+20.0)*0.04;
          float dripLen=fract(u_time*speed*0.2+hash(i+5.0));
          float inStripe=smoothstep(width,width*0.5,abs(uv.x-x));
          float inDrip=step(uv.y,dripLen)*inStripe;
          float bulge=smoothstep(0.03,0.0,length(vec2(uv.x-x,uv.y-dripLen)*vec2(1.0,3.0)));
          vec3 dripCol=0.5+0.5*cos(6.28*(i/12.0+vec3(0.0,0.33,0.67)));
          col=mix(col,dripCol,max(inDrip,bulge));
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'radar-hud-36',
    name: 'Radar HUD',
    description: 'Heads-up display with scanning radar elements.',
    tags: ['2d', 'tech', 'hud'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        vec3 col=vec3(0.0,0.05,0.0);
        for(float i=0.1;i<=0.4;i+=0.1){
          col+=vec3(0.0,0.3,0.0)*smoothstep(0.005,0.0,abs(r-i));
        }
        col+=vec3(0.0,0.2,0.0)*smoothstep(0.005,0.0,abs(uv.x))*step(r,0.45);
        col+=vec3(0.0,0.2,0.0)*smoothstep(0.005,0.0,abs(uv.y))*step(r,0.45);
        float sweep=mod(u_time*1.5,6.28318);
        float sweepAngle=mod(a-sweep+6.28,6.28);
        float trail=exp(-sweepAngle*3.0)*step(r,0.4);
        col+=vec3(0.0,0.6,0.0)*trail;
        float ring=smoothstep(0.005,0.0,abs(r-0.45));
        col+=vec3(0.0,0.5,0.0)*ring;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'tessellation-36',
    name: 'Penrose Tiling',
    description: 'Aperiodic Penrose-inspired tiling pattern.',
    tags: ['2d', 'geometric', 'tiling'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y*5.0;
        float v=0.0;
        for(float i=0.0;i<5.0;i++){
          float angle=i*3.14159/5.0+u_time*0.1;
          float c=cos(angle),s=sin(angle);
          float proj=uv.x*c+uv.y*s;
          v+=cos(proj*6.28);
        }
        v=v/5.0;
        float edge=smoothstep(0.0,0.1,abs(v));
        vec3 col=mix(vec3(0.9,0.7,0.2),vec3(0.2,0.1,0.4),step(0.0,v));
        col*=edge;
        gl_FragColor=vec4(col,1.0);
      }
    `
  }
];
