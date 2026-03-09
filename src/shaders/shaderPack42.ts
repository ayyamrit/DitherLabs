import type { DitherShaderDef } from './ditherShaders';

export const shaderPack42: DitherShaderDef[] = [
  {
    id: 'kaleidoscope-gem-42',
    name: 'Gem Kaleidoscope',
    description: 'Gemstone-colored kaleidoscope reflections.',
    tags: ['2d', 'kaleidoscope', 'gem'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float a=atan(uv.y,uv.x);
        float r=length(uv);
        float segments=6.0;
        float seg=3.14159/segments;
        a=abs(mod(a,seg*2.0)-seg);
        vec2 p=vec2(cos(a),sin(a))*r;
        p+=u_time*0.1;
        float n=hash(floor(p*10.0));
        float facet=step(0.5,n);
        float hue=n*0.5+u_time*0.05;
        vec3 col=0.3+0.5*cos(6.28*(hue+vec3(0.0,0.33,0.67)));
        col*=0.6+0.4*facet;
        col*=smoothstep(0.8,0.0,r);
        float sparkle=pow(max(sin(p.x*20.0)*sin(p.y*20.0),0.0),8.0);
        col+=vec3(1.0)*sparkle*0.3;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'glitch-art-42',
    name: 'Databend Art',
    description: 'Databending-style corrupted image art.',
    tags: ['2d', 'glitch', 'databend'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      float hash2(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float t=floor(u_time*3.0);
        float blockH=floor(uv.y*8.0);
        float corrupt=step(0.7,hash(blockH+t));
        float shift=corrupt*(hash(blockH*2.0+t)-0.5)*0.5;
        vec2 uvShift=vec2(uv.x+shift,uv.y);
        float quantize=corrupt>0.5?8.0:256.0;
        float r=floor(sin(uvShift.x*15.0+uvShift.y*10.0)*quantize)/quantize;
        float g=floor(cos(uvShift.x*12.0-uvShift.y*8.0+1.0)*quantize)/quantize;
        float b=floor(sin(uvShift.x*8.0+uvShift.y*15.0+2.0)*quantize)/quantize;
        r=abs(r);g=abs(g);b=abs(b);
        float dead_pixel=step(0.999,hash2(floor(gl_FragCoord.xy)));
        vec3 col=vec3(r,g,b);
        col=mix(col,vec3(1.0,0.0,1.0),dead_pixel);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'water-drop-42',
    name: 'Water Droplet',
    description: 'Single water drop hitting surface with ripples.',
    tags: ['2d', 'water', 'droplet'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float phase=mod(u_time,2.0);
        vec3 col=vec3(0.1,0.3,0.6);
        for(float i=0.0;i<5.0;i++){
          float ripple_r=phase*0.3*(i+1.0)*0.3;
          float wave=sin((r-ripple_r)*60.0)*exp(-abs(r-ripple_r)*20.0);
          wave*=exp(-phase*2.0);
          col+=vec3(0.2,0.4,0.6)*wave;
        }
        float drop_y=max(0.5-phase*2.0,0.0);
        float drop=smoothstep(0.03,0.01,length(uv-vec2(0.0,drop_y)))*step(0.0,drop_y);
        col+=vec3(0.5,0.7,1.0)*drop;
        float highlight=0.3*exp(-r*5.0)*max(sin(r*40.0-phase*15.0),0.0)*exp(-phase);
        col+=vec3(0.8,0.9,1.0)*highlight;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'circuit-chip-42',
    name: 'Microchip Die',
    description: 'Zoomed view of a microchip die layout.',
    tags: ['2d', 'tech', 'chip'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float zoom=16.0;
        vec2 id=floor(uv*zoom);
        vec2 f=fract(uv*zoom);
        float h=hash(id);
        float type=floor(h*4.0);
        vec3 col=vec3(0.2,0.2,0.25);
        if(type<1.0){
          float wire=step(abs(f.y-0.5),0.05);
          col=mix(col,vec3(0.7,0.5,0.2),wire);
        }else if(type<2.0){
          float pad=step(length(f-0.5),0.3);
          col=mix(col,vec3(0.6,0.6,0.3),pad);
        }else if(type<3.0){
          float gate=step(abs(f.x-0.5),0.3)*step(abs(f.y-0.5),0.15);
          col=mix(col,vec3(0.3,0.5,0.3),gate);
        }else{
          float via=step(length(f-0.5),0.1);
          col=mix(col,vec3(0.8,0.8,0.8),via);
        }
        float active=sin(u_time*3.0+h*6.28)*0.5+0.5;
        col+=vec3(0.0,0.1,0.2)*active*0.2;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'psychedelic-tunnel-42',
    name: 'Psychedelic Tunnel',
    description: 'Infinite tunnel with psychedelic colors.',
    tags: ['2d', 'psychedelic', 'tunnel'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float tunnel=1.0/r;
        float tx=a/3.14159+u_time*0.2;
        float ty=tunnel+u_time*2.0;
        float pattern=sin(tx*8.0)*sin(ty*4.0);
        pattern+=sin(tx*4.0+ty*2.0)*0.5;
        pattern=pattern*0.5+0.5;
        float hue=fract(pattern*0.5+u_time*0.1);
        vec3 col=0.5+0.5*cos(6.28*(hue+vec3(0.0,0.33,0.67)));
        col*=tunnel*0.3;
        col=clamp(col,0.0,1.0);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'coral-reef-42',
    name: 'Coral Reef',
    description: 'Underwater coral reef with swaying sea life.',
    tags: ['2d', 'ocean', 'coral'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 water=mix(vec3(0.0,0.15,0.3),vec3(0.0,0.3,0.5),uv.y);
        float caustic=noise(uv*10.0+u_time*0.5)*noise(uv*15.0-u_time*0.3);
        water+=vec3(0.1,0.2,0.3)*caustic;
        vec3 col=water;
        for(float i=0.0;i<6.0;i++){
          float x=hash(vec2(i,0.0))*0.8+0.1;
          float baseY=0.1+hash(vec2(i,1.0))*0.15;
          float sway=sin(u_time+i*2.0)*0.02;
          float coral_h=0.1+hash(vec2(i,2.0))*0.15;
          float d=smoothstep(0.04,0.02,abs(uv.x-x-sway))*step(baseY,uv.y)*step(uv.y,baseY+coral_h);
          vec3 cCol=0.5+0.5*cos(6.28*(hash(vec2(i,3.0))+vec3(0.0,0.33,0.67)));
          col=mix(col,cCol,d);
        }
        float bubble=0.0;
        for(float i=0.0;i<10.0;i++){
          float bx=hash(vec2(i,10.0));
          float by=fract(u_time*0.2*hash(vec2(i,11.0))+hash(vec2(i,12.0)));
          bubble+=smoothstep(0.01,0.005,length(uv-vec2(bx,by)));
        }
        col+=vec3(0.3,0.4,0.5)*bubble;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'mandelbrot-42',
    name: 'Mandelbrot Zoom',
    description: 'Slowly zooming into the Mandelbrot set.',
    tags: ['2d', 'fractal', 'mandelbrot'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float zoom=1.0+u_time*0.1;
        vec2 c=uv/zoom+vec2(-0.745,0.186);
        vec2 z=vec2(0.0);
        float iter=0.0;
        for(int i=0;i<100;i++){
          z=vec2(z.x*z.x-z.y*z.y,2.0*z.x*z.y)+c;
          if(dot(z,z)>4.0)break;
          iter+=1.0;
        }
        float t=iter/100.0;
        vec3 col=0.5+0.5*cos(6.28*(t*3.0+vec3(0.0,0.33,0.67)));
        col*=1.0-step(99.0,iter);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'flag-wave-42',
    name: 'Waving Flag',
    description: 'Fabric flag waving in the wind.',
    tags: ['2d', 'simulation', 'flag'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float wave=sin(uv.x*8.0-u_time*3.0)*0.03*(uv.x);
        wave+=sin(uv.x*12.0-u_time*5.0)*0.01*(uv.x);
        vec2 p=vec2(uv.x,uv.y+wave);
        float inFlag=step(0.3,p.y)*step(p.y,0.7)*step(0.1,p.x)*step(p.x,0.9);
        float stripe=floor((p.y-0.3)/0.4*5.0);
        vec3 flagCol=mod(stripe,2.0)<1.0?vec3(0.8,0.1,0.1):vec3(1.0,1.0,1.0);
        float shade=0.7+0.3*cos(uv.x*8.0-u_time*3.0)*(uv.x);
        vec3 col=vec3(0.5,0.7,1.0);
        col=mix(col,flagCol*shade,inFlag);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'quantum-field-42',
    name: 'Quantum Field',
    description: 'Quantum field fluctuations visualization.',
    tags: ['2d', 'physics', 'quantum'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float field=0.0;
        for(float i=1.0;i<6.0;i++){
          field+=sin(uv.x*i*5.0+u_time*i)*sin(uv.y*i*5.0-u_time*i*0.7)/i;
        }
        field=field*0.5+0.5;
        float fluctuation=noise(uv*20.0+u_time*2.0)*0.2;
        field+=fluctuation;
        vec3 col=mix(vec3(0.0,0.0,0.2),vec3(0.0,0.5,1.0),field);
        col+=vec3(1.0,0.8,0.0)*pow(max(field-0.8,0.0)*5.0,2.0);
        float particle=0.0;
        for(float i=0.0;i<8.0;i++){
          vec2 pos=vec2(sin(u_time+i*1.5),cos(u_time*0.7+i*2.0))*0.3;
          particle+=0.003/(length(uv-pos)+0.003);
        }
        col+=vec3(1.0,1.0,0.5)*particle*0.2;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'starfield-warp-42',
    name: 'Starfield Warp',
    description: 'Hyperspeed starfield stretching into lines.',
    tags: ['2d', 'space', 'warp'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.01,0.0,0.03);
        for(float i=0.0;i<80.0;i++){
          float z=fract(hash(i)*1.0-u_time*0.5);
          float depth=1.0/z;
          vec2 pos=vec2(hash(i+80.0)-0.5,hash(i+160.0)-0.5)*depth*0.3;
          float d=length(uv-pos);
          float size=0.002*depth;
          float streak=smoothstep(size*5.0,0.0,d)*z;
          vec2 dir=normalize(pos);
          float trail=smoothstep(size*20.0,0.0,abs(dot(uv-pos,vec2(-dir.y,dir.x))))*smoothstep(0.0,size*50.0,dot(uv-pos,dir));
          col+=vec3(0.8,0.9,1.0)*(streak+trail*0.3)*(1.0-z);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'oil-painting2-42',
    name: 'Impressionist',
    description: 'Impressionist painting style with brush dabs.',
    tags: ['2d', 'artistic', 'impressionist'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float dabSize=15.0;
        vec2 cell=floor(gl_FragCoord.xy/dabSize);
        vec2 center=cell*dabSize+dabSize*0.5;
        vec2 offset=vec2(hash(cell)-0.5,hash(cell+vec2(1,0))-0.5)*dabSize*0.3;
        float angle=hash(cell+vec2(0,1))*3.14;
        vec2 d=(gl_FragCoord.xy-center-offset);
        float s=sin(angle),c=cos(angle);
        d=vec2(d.x*c-d.y*s,d.x*s+d.y*c);
        d/=vec2(dabSize*0.6,dabSize*0.3);
        float dab=smoothstep(1.0,0.5,length(d));
        float scene_y=center.y/u_resolution.y;
        vec3 sceneCol;
        if(scene_y>0.6)sceneCol=vec3(0.4,0.6,0.9);
        else if(scene_y>0.35)sceneCol=vec3(0.2,0.5,0.15);
        else sceneCol=vec3(0.5,0.4,0.2);
        sceneCol+=vec3(hash(cell*3.0)-0.5,hash(cell*3.0+1.0)-0.5,hash(cell*3.0+2.0)-0.5)*0.15;
        vec3 col=sceneCol*dab+vec3(0.9,0.88,0.82)*(1.0-dab);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'snowflake-42',
    name: 'Koch Snowflake',
    description: 'Animated Koch snowflake fractal.',
    tags: ['2d', 'fractal', 'snowflake'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float s=sin(u_time*0.2),c=cos(u_time*0.2);
        uv=mat2(c,-s,s,c)*uv;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float segments=6.0;
        float seg=3.14159*2.0/segments;
        a=mod(a+seg*0.5,seg)-seg*0.5;
        a=abs(a);
        vec2 p=vec2(cos(a),sin(a))*r;
        float d=p.x;
        for(int i=0;i<4;i++){
          p=abs(p);
          p-=vec2(0.15,0.0);
          float aa=3.14159/3.0;
          float ss=sin(aa),cc=cos(aa);
          p=mat2(cc,-ss,ss,cc)*p;
        }
        float koch=smoothstep(0.01,0.0,abs(length(p)-0.05));
        float outline=smoothstep(0.02,0.01,abs(r-0.3));
        vec3 col=vec3(0.05,0.1,0.2);
        col+=vec3(0.8,0.9,1.0)*koch;
        col+=vec3(0.3,0.5,0.8)*outline;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'thermal-camera-42',
    name: 'Thermal Camera',
    description: 'Infrared thermal imaging camera view.',
    tags: ['2d', 'thermal', 'camera'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<4;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float temp=fbm(uv*3.0+u_time*0.1);
        float hotspot1=exp(-length(uv-vec2(0.3,0.5))*5.0)*0.4;
        float hotspot2=exp(-length(uv-vec2(0.7,0.4+sin(u_time)*0.1))*4.0)*0.3;
        temp+=hotspot1+hotspot2;
        temp+=noise(uv*50.0+u_time*5.0)*0.05;
        vec3 cold=vec3(0.0,0.0,0.5);
        vec3 cool=vec3(0.0,0.0,1.0);
        vec3 mid=vec3(0.0,1.0,0.0);
        vec3 warm=vec3(1.0,1.0,0.0);
        vec3 hot=vec3(1.0,0.0,0.0);
        vec3 white=vec3(1.0);
        vec3 col;
        if(temp<0.2)col=mix(cold,cool,temp*5.0);
        else if(temp<0.4)col=mix(cool,mid,(temp-0.2)*5.0);
        else if(temp<0.6)col=mix(mid,warm,(temp-0.4)*5.0);
        else if(temp<0.8)col=mix(warm,hot,(temp-0.6)*5.0);
        else col=mix(hot,white,(temp-0.8)*5.0);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'chinese-lattice-42',
    name: 'Chinese Lattice',
    description: 'Traditional Chinese window lattice pattern.',
    tags: ['2d', 'geometric', 'traditional'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y*6.0;
        vec2 id=floor(uv);
        vec2 f=fract(uv)-0.5;
        float pattern=mod(id.x+id.y,2.0);
        float d1,d2;
        if(pattern<0.5){
          d1=min(abs(f.x),abs(f.y));
          d2=abs(f.x+f.y);
        }else{
          d1=abs(f.x-f.y);
          d2=min(abs(f.x-0.25),abs(f.y-0.25));
        }
        float frame=min(d1,d2);
        float lattice=smoothstep(0.04,0.02,frame);
        float pulse=sin(u_time+id.x*0.5+id.y*0.7)*0.1+0.9;
        vec3 wood=vec3(0.5,0.25,0.1)*pulse;
        vec3 bg=vec3(0.9,0.85,0.75);
        vec3 col=mix(bg,wood,lattice);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'terrain-voxel-42',
    name: 'Voxel Terrain',
    description: 'Minecraft-style voxel terrain view.',
    tags: ['2d', 'voxel', 'terrain'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float pix=8.0;
        vec2 p=floor(gl_FragCoord.xy/pix);
        float worldX=p.x+floor(u_time*10.0);
        float height=floor(hash(vec2(worldX,0.0))*6.0+3.0+sin(float(worldX)*0.1)*2.0);
        float y=p.y;
        vec3 col=vec3(0.4,0.6,1.0);
        if(y<height){
          if(y==height-1.0)col=vec3(0.3,0.7,0.2);
          else if(y>height-4.0)col=vec3(0.5,0.35,0.2);
          else col=vec3(0.4,0.4,0.45);
        }
        if(y==0.0)col=vec3(0.3,0.3,0.35);
        float sun=step(length(p-vec2(p.x,u_resolution.y/pix-3.0)),2.0)*step(height,y);
        if(p.x>u_resolution.x/pix-5.0&&p.y>u_resolution.y/pix-5.0)col=vec3(1.0,0.9,0.3);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'sound-wave-42',
    name: 'Oscilloscope',
    description: 'Classic oscilloscope green phosphor trace.',
    tags: ['2d', 'tech', 'scope'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float wave=sin(uv.x*20.0+u_time*5.0)*0.15;
        wave+=sin(uv.x*35.0-u_time*3.0)*0.05;
        wave+=sin(uv.x*50.0+u_time*8.0)*0.02;
        float d=abs(uv.y-wave);
        float trace=0.003/(d*d+0.0001);
        float afterglow=0.001/(d*d+0.001);
        vec3 col=vec3(0.0,0.03,0.0);
        col+=vec3(0.0,1.0,0.0)*trace*0.05;
        col+=vec3(0.0,0.5,0.0)*afterglow*0.1;
        float grid=smoothstep(0.01,0.0,abs(fract(uv.x*5.0)-0.5))+smoothstep(0.01,0.0,abs(fract(uv.y*5.0)-0.5));
        col+=vec3(0.0,0.08,0.0)*grid*0.3;
        gl_FragColor=vec4(col,1.0);
      }
    `
  }
];
