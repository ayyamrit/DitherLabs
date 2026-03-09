import type { DitherShaderDef } from './ditherShaders';

export const shaderPack40: DitherShaderDef[] = [
  {
    id: 'butterfly-effect-40',
    name: 'Lorenz Attractor',
    description: 'Chaotic Lorenz butterfly attractor visualization.',
    tags: ['2d', 'math', 'chaos'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.02,0.0,0.05);
        float x=0.1,y=0.0,z=0.0;
        float dt=0.005;
        for(int i=0;i<200;i++){
          float dx=10.0*(y-x)*dt;
          float dy=(x*(28.0-z)-y)*dt;
          float dz=(x*y-2.667*z)*dt;
          x+=dx;y+=dy;z+=dz;
          vec2 p=vec2(x*0.03,z*0.02-0.5);
          float d=length(uv-p);
          float age=float(i)/200.0;
          col+=vec3(0.5,0.3,1.0)*0.002/(d+0.002)*age;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'neon-tubes-40',
    name: 'Neon Tube Array',
    description: 'Parallel neon tubes with flickering effects.',
    tags: ['2d', 'neon', 'array'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.02,0.0,0.05);
        for(float i=0.0;i<8.0;i++){
          float y=i/8.0+0.0625;
          float d=abs(uv.y-y);
          float flicker=0.7+0.3*sin(u_time*20.0*hash(i)+hash(i+5.0)*100.0);
          flicker*=step(0.1,hash(floor(u_time*2.0)+i));
          float glow=0.005/(d*d+0.0001)*flicker;
          vec3 tubeCol=0.5+0.5*cos(6.28*(i/8.0+vec3(0.0,0.33,0.67)));
          col+=tubeCol*glow*0.03;
          col+=tubeCol*smoothstep(0.003,0.0,d)*flicker;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'terrain-iso-40',
    name: 'Isometric Terrain',
    description: 'Isometric view of blocky terrain.',
    tags: ['2d', 'isometric', 'terrain'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float s=0.1;
        vec2 iso=vec2(uv.x/s+(uv.y/s)*2.0,-(uv.x/s)+(uv.y/s)*2.0)*0.5;
        vec2 id=floor(iso);
        vec2 f=fract(iso);
        float h=floor(hash(id)*4.0+sin(u_time*0.5+id.x+id.y)*0.5);
        float height=h*0.03;
        float top=step(abs(f.x-0.5),0.48)*step(abs(f.y-0.5),0.48);
        float shadow=0.6+h*0.1;
        vec3 grassCol=vec3(0.2+h*0.05,0.5+h*0.05,0.15);
        vec3 col=grassCol*shadow*top;
        col+=vec3(0.1)*(1.0-top);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'rorschach-40',
    name: 'Rorschach Inkblot',
    description: 'Symmetrical ink blot test pattern.',
    tags: ['2d', 'artistic', 'symmetry'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        uv.x=abs(uv.x);
        float n=fbm(uv*3.0+u_time*0.1);
        float blot=smoothstep(0.5,0.4,n+length(uv)*0.5);
        vec3 paper=vec3(0.95,0.93,0.88);
        vec3 ink=vec3(0.05,0.03,0.08);
        vec3 col=mix(paper,ink,blot);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'waveform-3d-40',
    name: '3D Waveform',
    description: 'Perspective view of undulating wave surface.',
    tags: ['2d', '3d-effect', 'wave'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.05,0.0,0.1);
        for(float z=20.0;z>0.0;z-=1.0){
          float perspective=1.0/(z*0.1+0.5);
          float x=(uv.x-0.5)*z*0.5;
          float wave=sin(x*2.0+u_time*2.0+z*0.5)*0.1*perspective;
          float y_pos=0.3+z*0.02+wave;
          float line=smoothstep(0.003,0.0,abs(uv.y-y_pos));
          float depth=1.0-z/20.0;
          col+=vec3(0.0,0.5,1.0)*line*depth*0.5;
          col+=vec3(0.5,0.0,1.0)*line*depth*0.3;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'acid-wash-40',
    name: 'Acid Wash',
    description: 'Psychedelic acid wash tie-dye pattern.',
    tags: ['2d', 'psychedelic', 'pattern'],
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
        float n=noise(vec2(a*3.0,r*5.0)+u_time*0.3);
        float hue=fract(r*3.0+a/6.28+n*0.5+u_time*0.1);
        vec3 col=0.5+0.5*cos(6.28*(hue+vec3(0.0,0.33,0.67)));
        col*=0.7+0.3*sin(r*20.0+n*10.0+u_time);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'compass-rose-40',
    name: 'Compass Rose',
    description: 'Ornate nautical compass rose.',
    tags: ['2d', 'nautical', 'compass'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x)+u_time*0.1;
        float points8=abs(cos(a*4.0))*0.35;
        float points4=abs(cos(a*2.0+0.785))*0.25;
        float star8=smoothstep(points8+0.01,points8,r);
        float star4=smoothstep(points4+0.01,points4,r);
        float ring1=smoothstep(0.005,0.0,abs(r-0.38));
        float ring2=smoothstep(0.005,0.0,abs(r-0.35));
        float center=smoothstep(0.05,0.04,r);
        vec3 col=vec3(0.9,0.85,0.7);
        col=mix(col,vec3(0.7,0.5,0.2),star8);
        col=mix(col,vec3(0.5,0.35,0.15),star4);
        col=mix(col,vec3(0.3,0.2,0.1),ring1+ring2);
        col=mix(col,vec3(0.8,0.1,0.1),center);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'electric-fence-40',
    name: 'Electric Grid Fence',
    description: 'High voltage grid with sparking nodes.',
    tags: ['2d', 'electric', 'grid'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*8.0;
        vec2 id=floor(uv);
        vec2 f=fract(uv);
        float gridX=smoothstep(0.03,0.0,abs(f.x));
        float gridY=smoothstep(0.03,0.0,abs(f.y));
        float grid=max(gridX,gridY);
        float spark=step(0.95,hash(id+floor(u_time*10.0)));
        float node=smoothstep(0.1,0.05,length(f));
        float pulse=sin(u_time*10.0+hash(id)*6.28)*0.5+0.5;
        vec3 col=vec3(0.02,0.0,0.03);
        col+=vec3(0.0,0.3,0.8)*grid*0.5;
        col+=vec3(0.5,0.8,1.0)*node*(0.3+spark*pulse*0.7);
        col+=vec3(1.0,1.0,0.8)*spark*node*pulse;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'wave-terrain-40',
    name: 'Sine Terrain',
    description: 'Layered sine wave terrain with parallax.',
    tags: ['2d', 'landscape', 'parallax'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=mix(vec3(0.9,0.5,0.2),vec3(0.3,0.1,0.5),uv.y);
        for(float i=5.0;i>=0.0;i--){
          float depth=i/5.0;
          float y=0.3+i*0.05+sin(uv.x*5.0*(1.0+i*0.5)+u_time*(0.5-i*0.08)+i)*0.08;
          float mountain=step(uv.y,y);
          vec3 mCol=mix(vec3(0.1,0.15,0.1),vec3(0.05,0.08,0.05),depth);
          mCol*=0.5+depth*0.5;
          col=mix(col,mCol,mountain);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'binary-rain-40',
    name: 'Binary Rain',
    description: 'Columns of binary 0s and 1s falling.',
    tags: ['2d', 'digital', 'binary'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float cols=30.0;float rows=40.0;
        vec2 cell=vec2(floor(uv.x*cols),floor(uv.y*rows));
        float speed=1.0+hash(vec2(cell.x,0.0))*2.0;
        float offset=hash(vec2(cell.x,1.0));
        float drop=fract(-u_time*speed*0.2+offset);
        float inDrop=step(fract(uv.y+u_time*speed*0.2-offset),0.5);
        float bit=step(0.5,hash(cell+floor(u_time*5.0)));
        float brightness=inDrop*0.5;
        float head=smoothstep(0.01,0.0,abs(fract(uv.y+u_time*speed*0.2-offset)-drop));
        vec3 col=vec3(0.0,brightness*0.5,0.0)*bit;
        col+=vec3(0.3,1.0,0.3)*head*0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'weave-pattern-40',
    name: 'Basket Weave',
    description: 'Woven basket texture pattern.',
    tags: ['2d', 'texture', 'weave'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*10.0;
        vec2 id=floor(uv);
        vec2 f=fract(uv);
        float block=mod(floor(id.x/2.0)+floor(id.y/2.0),2.0);
        float horizontal=block;
        float fiber;
        if(horizontal>0.5){
          fiber=sin(f.y*3.14159)*0.5+0.5;
          fiber*=0.8+0.2*sin(f.x*20.0);
        }else{
          fiber=sin(f.x*3.14159)*0.5+0.5;
          fiber*=0.8+0.2*sin(f.y*20.0);
        }
        float sway=sin(u_time*0.5+id.x+id.y)*0.02;
        vec3 light=vec3(0.8,0.65,0.4);
        vec3 dark=vec3(0.5,0.35,0.15);
        vec3 col=mix(dark,light,fiber+sway);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'neuron-network-40',
    name: 'Neural Network',
    description: 'Firing neurons with synaptic connections.',
    tags: ['2d', 'biology', 'network'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.02,0.01,0.05);
        for(float i=0.0;i<15.0;i++){
          vec2 pos=vec2(hash(i)-0.5,hash(i+15.0)-0.5)*1.2;
          float d=length(uv-pos);
          float fire=sin(u_time*3.0+hash(i+30.0)*6.28)*0.5+0.5;
          fire=pow(fire,4.0);
          float soma=smoothstep(0.04,0.02,d);
          col+=vec3(0.3,0.5,1.0)*soma*(0.3+fire*0.7);
          for(float j=0.0;j<3.0;j++){
            float ni=mod(i+j+1.0,15.0);
            vec2 npos=vec2(hash(ni)-0.5,hash(ni+15.0)-0.5)*1.2;
            vec2 pa=uv-pos;
            vec2 ba=npos-pos;
            float t2=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
            float axon=smoothstep(0.005,0.0,length(pa-ba*t2));
            float signal=smoothstep(0.05,0.0,abs(t2-fract(u_time*2.0+hash(i+j*10.0))));
            col+=vec3(0.1,0.2,0.5)*axon*0.3;
            col+=vec3(0.5,0.8,1.0)*axon*signal*fire;
          }
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'film-grain-40',
    name: 'Film Grain',
    description: 'Cinematic film grain with vignette.',
    tags: ['2d', 'film', 'grain'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float grain=hash(gl_FragCoord.xy+fract(u_time)*1000.0)*0.15;
        float scene=sin(uv.x*3.0+u_time*0.5)*sin(uv.y*2.0-u_time*0.3)*0.5+0.5;
        float vignette=1.0-dot(uv-0.5,uv-0.5)*2.0;
        vignette=clamp(vignette,0.0,1.0);
        float sepia_l=scene*0.9;
        vec3 col=vec3(sepia_l*1.2,sepia_l,sepia_l*0.8);
        col+=grain-0.075;
        col*=vignette;
        float scratch=smoothstep(0.002,0.0,abs(uv.x-fract(hash(vec2(floor(u_time*24.0),0.0))+0.1)));
        col+=vec3(scratch*0.1);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'wave-dot-40',
    name: 'Wave Dot Grid',
    description: 'Grid of dots displaced by waves.',
    tags: ['2d', 'grid', 'dots'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.95,0.93,0.9);
        float grid=15.0;
        for(float ix=-7.0;ix<=7.0;ix++){
          for(float iy=-7.0;iy<=7.0;iy++){
            vec2 base=vec2(ix,iy)/grid;
            float d_center=length(base);
            float wave=sin(d_center*10.0-u_time*3.0)*0.02;
            vec2 offset=normalize(base+0.001)*wave;
            vec2 pos=base+offset;
            float d=length(uv-pos);
            float size=0.008+0.005*(1.0-d_center*2.0);
            float dot=smoothstep(size,size*0.5,d);
            col=mix(col,vec3(0.1,0.2,0.5),dot);
          }
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'sunset-clouds-40',
    name: 'Sunset Clouds',
    description: 'Dramatic sunset with backlit clouds.',
    tags: ['2d', 'nature', 'sunset'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 sky=mix(vec3(0.9,0.3,0.1),vec3(0.2,0.1,0.4),uv.y);
        sky=mix(sky,vec3(1.0,0.6,0.2),exp(-pow((uv.y-0.3)*3.0,2.0)));
        float sun=smoothstep(0.15,0.1,length(vec2(uv.x-0.5,(uv.y-0.3)*2.0)));
        sky+=vec3(1.0,0.8,0.3)*sun;
        float cloud=fbm(vec2(uv.x*3.0+u_time*0.02,uv.y*2.0));
        cloud=smoothstep(0.4,0.6,cloud);
        vec3 cloudCol=mix(vec3(0.9,0.4,0.2),vec3(0.3,0.1,0.2),uv.y);
        vec3 col=mix(sky,cloudCol,cloud*0.7);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'hexagonal-grid-40',
    name: 'Hex Grid Pulse',
    description: 'Hexagonal grid with sequential activation.',
    tags: ['2d', 'hexagonal', 'grid'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float hexDist(vec2 p){p=abs(p);return max(p.x*0.866+p.y*0.5,p.y);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y*8.0;
        vec2 r=vec2(1.0,1.732);
        vec2 h=r*0.5;
        vec2 a=mod(uv,r)-h;
        vec2 b=mod(uv-h,r)-h;
        vec2 gv=length(a)<length(b)?a:b;
        vec2 id=uv-gv;
        float d=hexDist(gv);
        float dist_center=length(id)/8.0;
        float wave=sin(dist_center*10.0-u_time*3.0)*0.5+0.5;
        float edge=smoothstep(0.47,0.5,d);
        vec3 hexCol=mix(vec3(0.0,0.3,0.6),vec3(0.0,0.8,1.0),wave);
        vec3 col=mix(hexCol,vec3(0.0,0.1,0.2),edge);
        col*=0.5+wave*0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'flower-bloom-40',
    name: 'Flower Bloom',
    description: 'Abstract flower opening its petals.',
    tags: ['2d', 'organic', 'flower'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float petals=5.0;
        float bloom=sin(u_time*0.5)*0.5+0.5;
        float petal=abs(cos(a*petals*0.5+u_time*0.3))*(0.15+bloom*0.2);
        float inPetal=smoothstep(petal+0.02,petal,r);
        float center=smoothstep(0.08,0.06,r);
        float vein=abs(sin(a*petals*0.5+u_time*0.3));
        vein=smoothstep(0.95,1.0,vein)*inPetal;
        vec3 col=vec3(0.1,0.3,0.1);
        vec3 petalCol=mix(vec3(1.0,0.3,0.5),vec3(1.0,0.6,0.7),r*3.0);
        col=mix(col,petalCol,inPetal);
        col=mix(col,petalCol*0.7,vein);
        col=mix(col,vec3(1.0,0.8,0.0),center);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'dot-wave-40',
    name: 'Dot Wave Matrix',
    description: 'Matrix of dots creating wave illusion.',
    tags: ['2d', 'dots', 'optical'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float grid=20.0;
        vec2 cell=floor(uv*grid);
        vec2 f=fract(uv*grid)-0.5;
        float dist=length(cell/grid-0.5);
        float wave=sin(dist*15.0-u_time*3.0)*0.5+0.5;
        float size=0.1+wave*0.3;
        float d=length(f);
        float dot=smoothstep(size,size-0.05,d);
        vec3 col=vec3(0.95);
        col=mix(col,vec3(0.1,0.1,0.3),dot);
        gl_FragColor=vec4(col,1.0);
      }
    `
  }
];
