import type { DitherShaderDef } from './ditherShaders';

export const shaderPack39: DitherShaderDef[] = [
  {
    id: 'fractal-tree-39',
    name: 'Fractal Tree',
    description: 'Branching fractal tree swaying in wind.',
    tags: ['2d', 'fractal', 'tree'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        uv.y+=0.4;
        vec3 col=vec3(0.6,0.8,1.0);
        float trunk=smoothstep(0.02,0.0,abs(uv.x))*step(uv.y,0.0)*step(-0.3,uv.y);
        col=mix(col,vec3(0.3,0.2,0.1),trunk);
        for(float i=1.0;i<6.0;i++){
          float angle=0.5+sin(u_time*0.5+i)*0.1;
          float h=i*0.08;
          float spread=i*0.06;
          float branch_l=smoothstep(0.01,0.0,abs(uv.x+spread-(-uv.y+h)*angle))*step(-h,uv.y)*step(uv.y,-h+0.1);
          float branch_r=smoothstep(0.01,0.0,abs(uv.x-spread-(uv.y+h)*angle))*step(-h,uv.y)*step(uv.y,-h+0.1);
          col=mix(col,vec3(0.3,0.2,0.1),max(branch_l,branch_r));
        }
        float leaves=smoothstep(0.25,0.15,length(uv-vec2(0.0,-0.15)));
        col=mix(col,vec3(0.1,0.6,0.2),leaves*0.6);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'electric-plasma-39',
    name: 'Electric Plasma Ball',
    description: 'Plasma globe with tendrils reaching outward.',
    tags: ['2d', 'plasma', 'electric'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        vec3 col=vec3(0.02,0.0,0.05);
        float globe=smoothstep(0.42,0.4,r);
        for(float i=0.0;i<8.0;i++){
          float aa=i*0.785+u_time*0.3;
          float tendril_a=aa+sin(u_time*2.0+i*3.0)*0.3;
          float da=abs(a-tendril_a);
          da=min(da,6.28-da);
          float tendril=exp(-da*10.0)*exp(-r*3.0)*globe;
          float flicker=0.5+0.5*sin(u_time*10.0+i*5.0);
          col+=vec3(0.5,0.3,1.0)*tendril*flicker;
        }
        float core=0.02/(r*r+0.01);
        col+=vec3(0.8,0.6,1.0)*core*globe;
        float shell=smoothstep(0.01,0.0,abs(r-0.4))*0.3;
        col+=vec3(0.3,0.2,0.5)*shell;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'terrain-3d-39',
    name: 'Terrain Flyover',
    description: 'Flying over procedural terrain.',
    tags: ['2d', 'terrain', '3d-effect'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.5,0.7,1.0);
        float horizon=0.5;
        if(uv.y<horizon){
          float perspective=horizon/(horizon-uv.y);
          vec2 worldPos=vec2(uv.x-0.5,1.0)*perspective;
          worldPos.y+=u_time;
          float h=fbm(worldPos*2.0)*0.3;
          float shade=0.5+0.5*sin(worldPos.x*10.0);
          vec3 ground=mix(vec3(0.2,0.5,0.1),vec3(0.4,0.3,0.2),h*3.0);
          ground*=shade*0.3+0.7;
          ground*=1.0/(perspective*0.1+1.0);
          col=mix(ground,col,smoothstep(10.0,30.0,perspective));
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'wave-gradient-39',
    name: 'Wave Gradient',
    description: 'Layered color waves creating gradient.',
    tags: ['2d', 'wave', 'gradient'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.0);
        for(float i=0.0;i<8.0;i++){
          float y=0.1*i+sin(uv.x*5.0+u_time+i*0.5)*0.05+0.1;
          float layer=smoothstep(y+0.01,y,uv.y);
          vec3 lCol=0.5+0.5*cos(6.28*(i/8.0+u_time*0.05+vec3(0.0,0.33,0.67)));
          col=mix(col,lCol,layer);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'mosaic-rotate-39',
    name: 'Rotating Mosaic',
    description: 'Tiles rotating independently in a grid.',
    tags: ['2d', 'geometric', 'rotation'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*8.0;
        vec2 id=floor(uv);
        vec2 f=fract(uv)-0.5;
        float angle=u_time+hash(id)*6.28;
        float s=sin(angle),c=cos(angle);
        f=mat2(c,-s,s,c)*f;
        float d=max(abs(f.x),abs(f.y));
        float tile=smoothstep(0.45,0.4,d);
        float inner=smoothstep(0.2,0.15,d);
        vec3 col=vec3(0.1);
        vec3 tileCol=0.5+0.5*cos(6.28*(hash(id+vec2(1,0))+vec3(0.0,0.33,0.67)));
        col=mix(col,tileCol,tile);
        col=mix(col,tileCol*1.3,inner);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'sunflower-39',
    name: 'Sunflower Pattern',
    description: 'Fibonacci sunflower seed arrangement.',
    tags: ['2d', 'nature', 'fibonacci'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.15,0.1,0.0);
        float golden=2.39996;
        for(float i=0.0;i<150.0;i++){
          float a=i*golden+u_time*0.1;
          float r=sqrt(i)*0.03;
          vec2 p=vec2(cos(a),sin(a))*r;
          float d=length(uv-p);
          float size=0.012+0.003*sin(i*0.1+u_time);
          float seed=smoothstep(size,size*0.5,d);
          float hue=i/150.0;
          vec3 sCol=mix(vec3(0.4,0.25,0.05),vec3(0.9,0.7,0.1),hue);
          col+=sCol*seed;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'wave-interference-39',
    name: 'Wave Pool',
    description: 'Overlapping circular waves in a pool.',
    tags: ['2d', 'water', 'interference'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float v=0.0;
        v+=sin(length(uv-vec2(-0.3,0.2))*25.0-u_time*4.0);
        v+=sin(length(uv-vec2(0.3,-0.1))*25.0-u_time*4.0);
        v+=sin(length(uv-vec2(0.0,0.3))*25.0-u_time*4.0);
        v/=3.0;
        vec3 col=vec3(0.1,0.3,0.6)+vec3(0.2,0.3,0.4)*v;
        col+=vec3(0.5,0.6,0.7)*pow(max(v,0.0),3.0);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'maze-gen-39',
    name: 'Maze Generator',
    description: 'Procedurally generated maze pattern.',
    tags: ['2d', 'geometric', 'maze'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*20.0;
        vec2 id=floor(uv);
        vec2 f=fract(uv);
        float h=hash(id+floor(u_time*0.2));
        float wallR=step(0.5,h)*step(0.9,f.x);
        float wallB=step(0.5,hash(id+vec2(0.5,0.3)+floor(u_time*0.2)))*step(0.9,f.y);
        float wall=max(wallR,wallB);
        wall=max(wall,step(0.95,f.x));
        wall=max(wall,step(0.95,f.y));
        vec3 col=mix(vec3(0.9,0.9,0.85),vec3(0.2,0.15,0.1),wall);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'galaxy-warp-39',
    name: 'Galaxy Warp',
    description: 'Warped galaxy with gravitational lensing.',
    tags: ['2d', 'space', 'warp'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float warp=0.1/(r+0.1);
        vec2 warped=uv*(1.0+warp*0.5);
        warped+=vec2(sin(u_time*0.2),cos(u_time*0.3))*0.1;
        float a=atan(warped.y,warped.x)+u_time*0.2;
        float spiral=sin(a*3.0-length(warped)*10.0)*0.5+0.5;
        spiral*=exp(-length(warped)*2.0);
        float stars=step(0.97,hash(floor(warped*50.0+50.0)));
        vec3 col=vec3(0.01,0.0,0.03);
        col+=vec3(0.4,0.2,0.6)*spiral;
        col+=vec3(1.0,0.9,0.8)*stars;
        col+=vec3(1.0,0.8,0.4)*0.1/(r+0.05)*exp(-r*5.0);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'comic-dots-39',
    name: 'Comic Book Dots',
    description: 'Ben-Day dots like classic comic printing.',
    tags: ['2d', 'pop-art', 'comic'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float dotSize=8.0;
        vec2 cell=floor(gl_FragCoord.xy/dotSize);
        vec2 f=fract(gl_FragCoord.xy/dotSize)-0.5;
        float scene=sin(uv.x*5.0+u_time)*sin(uv.y*3.0-u_time*0.5)*0.5+0.5;
        float d=length(f);
        float dot=smoothstep(scene*0.45,scene*0.45-0.05,d);
        vec3 ink=vec3(0.1,0.1,0.3);
        vec3 paper=vec3(1.0,0.95,0.85);
        vec3 col=mix(paper,ink,dot);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'chain-link-39',
    name: 'Chain Link Fence',
    description: 'Metal chain link fence pattern.',
    tags: ['2d', 'pattern', 'metal'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y*8.0;
        vec2 id=floor(uv);
        vec2 f=fract(uv)-0.5;
        float offset=mod(id.y,2.0)*0.5;
        f.x+=offset;
        if(f.x>0.5)f.x-=1.0;
        float d=abs(length(f)-0.3);
        float link=smoothstep(0.06,0.03,d);
        float shine=pow(max(1.0-d*10.0,0.0),8.0)*0.5;
        vec3 col=vec3(0.4,0.6,0.8);
        col=mix(col,vec3(0.6,0.65,0.7),link);
        col+=vec3(shine)*link;
        float sway=sin(u_time+id.x*0.5)*0.01;
        col*=0.9+0.1*sin(uv.x+uv.y+u_time+sway);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'eye-iris-39',
    name: 'Eye Iris',
    description: 'Detailed eye iris with pupil dilation.',
    tags: ['2d', 'organic', 'eye'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float pupilSize=0.1+0.05*sin(u_time*0.5);
        float pupil=smoothstep(pupilSize,pupilSize-0.02,r);
        float iris=smoothstep(0.35,0.33,r)*smoothstep(pupilSize-0.02,pupilSize,r);
        float fibers=sin(a*30.0+r*20.0)*0.5+0.5;
        fibers*=hash(vec2(floor(a*30.0),floor(r*50.0)))*0.5+0.5;
        vec3 irisCol=mix(vec3(0.2,0.4,0.15),vec3(0.4,0.6,0.2),fibers);
        irisCol=mix(irisCol,vec3(0.6,0.5,0.2),smoothstep(pupilSize,pupilSize+0.05,r));
        float sclera=smoothstep(0.4,0.35,r);
        float limbus=smoothstep(0.01,0.0,abs(r-0.34));
        vec3 col=vec3(0.95,0.95,0.93)*sclera;
        col=mix(col,irisCol,iris);
        col=mix(col,vec3(0.0),pupil);
        col=mix(col,vec3(0.2),limbus);
        float highlight=smoothstep(0.05,0.02,length(uv-vec2(-0.08,0.08)));
        col+=vec3(1.0)*highlight*0.7;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'topographic-rings-39',
    name: 'Topo Rings',
    description: 'Colorful expanding topographic ring system.',
    tags: ['2d', 'map', 'rings'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float d=length(uv)+noise(uv*5.0+u_time*0.2)*0.15;
        float rings=sin(d*30.0-u_time*2.0)*0.5+0.5;
        float line=smoothstep(0.45,0.5,rings);
        vec3 col=0.5+0.5*cos(6.28*(d*2.0+u_time*0.1+vec3(0.0,0.33,0.67)));
        col*=0.3+0.7*line;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'pixel-clouds-39',
    name: 'Pixel Clouds',
    description: 'Chunky pixel art style cloud formations.',
    tags: ['2d', 'pixel', 'clouds'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        float pix=4.0;
        vec2 uv=floor(gl_FragCoord.xy/pix)*pix/u_resolution;
        uv.x+=u_time*0.02;
        float n=noise(uv*8.0)+noise(uv*16.0)*0.5+noise(uv*32.0)*0.25;
        n/=1.75;
        float cloud=smoothstep(0.4,0.6,n)*(1.0-abs(uv.y-0.5)*2.0);
        vec3 sky=mix(vec3(0.3,0.5,0.9),vec3(0.6,0.8,1.0),uv.y);
        vec3 col=mix(sky,vec3(1.0),cloud);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'morse-code-39',
    name: 'Morse Code',
    description: 'Blinking morse code dots and dashes.',
    tags: ['2d', 'digital', 'morse'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float row=floor(uv.y*20.0);
        float t=u_time*2.0+row*3.0;
        float seq=floor(t);
        float phase=fract(t);
        float isDash=step(0.5,hash(seq+row*100.0));
        float len=isDash>0.5?0.6:0.2;
        float on=step(phase,len);
        float x=fract(uv.x*10.0-t*0.5);
        float dot=step(abs(x-0.5),len*0.5)*step(abs(fract(uv.y*20.0)-0.5),0.3);
        vec3 col=vec3(0.05,0.0,0.0);
        col+=vec3(1.0,0.8,0.0)*dot*on;
        col+=vec3(0.2,0.15,0.0)*dot*(1.0-on);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'peacock-feather-39',
    name: 'Peacock Feather',
    description: 'Iridescent peacock feather eye pattern.',
    tags: ['2d', 'organic', 'iridescent'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float eye_r=0.15+0.02*sin(a*8.0+u_time);
        float ring1=smoothstep(0.01,0.0,abs(r-eye_r));
        float ring2=smoothstep(0.01,0.0,abs(r-eye_r*1.5));
        float ring3=smoothstep(0.01,0.0,abs(r-eye_r*2.0));
        float fill1=smoothstep(eye_r,eye_r-0.02,r);
        float fill2=smoothstep(eye_r*1.5,eye_r*1.5-0.02,r)*(1.0-fill1);
        float barbs=sin(a*40.0)*0.5+0.5;
        barbs*=smoothstep(eye_r*2.5,eye_r*2.0,r)*smoothstep(eye_r*2.0,eye_r*2.5,r+0.1);
        float iridescence=sin(a*5.0+r*20.0+u_time*2.0)*0.5+0.5;
        vec3 col=vec3(0.1,0.05,0.0);
        col=mix(col,vec3(0.0,0.0,0.3),fill1);
        col=mix(col,vec3(0.0,0.6,0.3)*iridescence+vec3(0.0,0.2,0.8)*(1.0-iridescence),fill2);
        col+=vec3(0.0,0.8,0.3)*ring1;
        col+=vec3(0.0,0.3,0.8)*ring2;
        col+=vec3(0.5,0.3,0.0)*ring3;
        col+=vec3(0.2,0.4,0.1)*barbs;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'disco-floor-39',
    name: 'Disco Floor',
    description: 'Pulsing disco dance floor tiles.',
    tags: ['2d', 'retro', 'disco'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float grid=8.0;
        vec2 id=floor(uv*grid);
        vec2 f=fract(uv*grid);
        float beat=sin(u_time*8.0)*0.5+0.5;
        float rnd=hash(id);
        float on=step(0.5,sin(u_time*4.0+rnd*6.28));
        float hue=fract(rnd+u_time*0.1);
        vec3 tileCol=0.5+0.5*cos(6.28*(hue+vec3(0.0,0.33,0.67)));
        float edge=step(0.05,f.x)*step(f.x,0.95)*step(0.05,f.y)*step(f.y,0.95);
        float glow=on*beat*0.5+0.3;
        vec3 col=tileCol*glow*edge;
        col+=vec3(0.02);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'sine-city-39',
    name: 'Sine City Skyline',
    description: 'City skyline made from sine waves.',
    tags: ['2d', 'urban', 'skyline'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 sky=mix(vec3(0.1,0.0,0.2),vec3(0.3,0.1,0.4),uv.y);
        vec3 col=sky;
        float building=0.0;
        for(float i=0.0;i<15.0;i++){
          float x=i/15.0;
          float width=0.03+hash(i)*0.04;
          float height=0.2+hash(i+10.0)*0.4;
          float b=step(abs(uv.x-x),width)*step(uv.y,height);
          building=max(building,b);
          float windowX=step(0.3,fract((uv.x-x+width)*50.0));
          float windowY=step(0.3,fract(uv.y*30.0));
          float window=windowX*windowY*b;
          float lit=step(0.5,hash(vec2(floor((uv.x-x+width)*50.0),floor(uv.y*30.0)).x+floor(u_time)));
          col+=vec3(1.0,0.9,0.5)*window*lit*0.5;
        }
        col=mix(col,vec3(0.05,0.05,0.1),building*(1.0-0.1));
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'wave-function-39',
    name: 'Standing Waves',
    description: 'Standing wave interference patterns.',
    tags: ['2d', 'physics', 'waves'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float v=0.0;
        for(float n=1.0;n<6.0;n++){
          float amp=1.0/n;
          float standing=sin(n*3.14159*uv.x)*cos(n*u_time*0.5);
          standing+=sin(n*3.14159*uv.y)*cos(n*u_time*0.7);
          v+=standing*amp;
        }
        v=v*0.2+0.5;
        vec3 col=mix(vec3(0.0,0.0,0.3),vec3(0.0,0.8,1.0),v);
        col=mix(col,vec3(1.0),pow(max(v-0.7,0.0)*3.0,2.0));
        gl_FragColor=vec4(col,1.0);
      }
    `
  }
];
