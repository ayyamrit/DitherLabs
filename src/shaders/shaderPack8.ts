import type { DitherShaderDef } from './ditherShaders';

const U = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
`;
const H = `float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}`;
const N = `${H}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}`;

export const shaderPack8: DitherShaderDef[] = [
  {
    id: 'radar-sweep',
    name: 'Radar Sweep',
    description: 'Military radar display with rotating sweep line, blips, range rings and phosphor decay.',
    tags: ['radar', 'military', 'tech'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        float r=length(uv);float a=atan(uv.y,uv.x);float t=u_time;
        float sweep=mod(t*1.5,6.28318);
        float da=mod(a-sweep+6.28318,6.28318);
        float trail=exp(-da*2.0)*smoothstep(0.45,0.0,r);
        float rings=0.0;
        for(int i=1;i<=4;i++){float ri=float(i)*0.1;rings+=smoothstep(0.003,0.0,abs(r-ri));}
        float cross=smoothstep(0.002,0.0,abs(uv.x))*0.3+smoothstep(0.002,0.0,abs(uv.y))*0.3;
        float blips=0.0;
        for(int i=0;i<6;i++){
          float fi=float(i);
          vec2 bp=vec2(cos(fi*1.3+1.0),sin(fi*1.7+2.0))*0.15*(1.0+fi*0.3);
          float bd=length(uv-bp);
          float visible=step(mod(a-sweep+6.28318,6.28318),0.5)*step(bd,0.02);
          blips+=exp(-bd*200.0)*step(da,1.0+hash(vec2(fi,0.0)));
        }
        vec3 c=vec3(0.0,0.05,0.0);
        c+=trail*vec3(0.0,0.5,0.1);
        c+=rings*vec3(0.0,0.3,0.08);
        c+=cross*vec3(0.0,0.2,0.05);
        c+=blips*vec3(0.0,1.0,0.3);
        float edge=smoothstep(0.45,0.44,r);c*=edge;
        c+=smoothstep(0.45,0.44,r)*smoothstep(0.43,0.44,r)*vec3(0.0,0.3,0.1);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'pixel-fire',
    name: 'Pixel Fire',
    description: 'Retro pixel art fire effect with rising heat particles and classic flame palette.',
    tags: ['fire', 'retro', 'pixel'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float px=4.0;
        vec2 cell=floor(gl_FragCoord.xy/px);
        float flame=0.0;
        for(int i=0;i<5;i++){
          float fi=float(i);
          float x=cell.x+sin(fi*3.0)*3.0;
          float speed=2.0+fi;
          float y=cell.y+t*speed*5.0+fi*10.0;
          flame+=hash(vec2(x,floor(y)));
        }
        flame/=5.0;
        float height=1.0-uv.y;
        float mouseBoost=exp(-abs(uv.x-u_mouse.x)*5.0)*0.3;
        flame*=pow(height+mouseBoost,1.5);
        flame=clamp(flame,0.0,1.0);
        vec3 c;
        if(flame<0.33)c=mix(vec3(0.05,0.0,0.0),vec3(0.8,0.1,0.0),flame*3.0);
        else if(flame<0.66)c=mix(vec3(0.8,0.1,0.0),vec3(1.0,0.7,0.0),(flame-0.33)*3.0);
        else c=mix(vec3(1.0,0.7,0.0),vec3(1.0,1.0,0.7),(flame-0.66)*3.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'cassette-label',
    name: 'Cassette Label',
    description: 'Retro cassette tape label design with rainbow stripe, reel holes and faux typography.',
    tags: ['retro', 'music', 'design'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.95,0.92,0.85);
        float border=step(0.05,uv.x)*step(uv.x,0.95)*step(0.1,uv.y)*step(uv.y,0.9);
        float stripe=step(0.45,uv.y)*step(uv.y,0.55);
        float hue=uv.x*3.0+t*0.5;
        vec3 rainbow=0.5+0.5*cos(hue+vec3(0,2,4));
        c=mix(c,rainbow,stripe*0.8);
        float reel1=smoothstep(0.06,0.05,length(uv-vec2(0.3,0.3)));
        float reel2=smoothstep(0.06,0.05,length(uv-vec2(0.7,0.3)));
        float reelHole1=smoothstep(0.03,0.02,length(uv-vec2(0.3,0.3)));
        float reelHole2=smoothstep(0.03,0.02,length(uv-vec2(0.7,0.3)));
        c=mix(c,vec3(0.3),reel1+reel2);c=mix(c,vec3(0.1),(reelHole1+reelHole2));
        float lines=step(0.5,sin(uv.x*200.0))*step(0.6,uv.y)*step(uv.y,0.85)*0.05;
        c-=lines;c*=border*0.7+0.3;
        float md=length(uv-u_mouse);c+=exp(-md*8.0)*0.1;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'interference-pattern',
    name: 'Interference',
    description: 'Two-source wave interference pattern showing constructive and destructive wave superposition.',
    tags: ['physics', 'wave', 'pattern'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*2.0;
        vec2 s1=u_mouse;
        vec2 s2=vec2(1.0-u_mouse.x,u_mouse.y);
        float d1=length(uv-s1);float d2=length(uv-s2);
        float w1=sin(d1*40.0-t);float w2=sin(d2*40.0-t);
        float interference=(w1+w2)*0.5;
        float val=interference*0.5+0.5;
        vec3 pos=vec3(0.2,0.5,0.9);vec3 neg=vec3(0.9,0.2,0.1);vec3 zero=vec3(0.05);
        vec3 c=interference>0.0?mix(zero,pos,interference):mix(zero,neg,-interference);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'vinyl-record',
    name: 'Vinyl Record',
    description: 'Spinning vinyl record with grooves, label, light reflections and turntable rotation.',
    tags: ['music', 'retro', 'analog'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        float r=length(uv);float a=atan(uv.y,uv.x)+u_time*1.5;float t=u_time;
        float record=smoothstep(0.42,0.41,r)*smoothstep(0.02,0.03,r);
        float grooves=sin(r*300.0)*0.03;
        float label=smoothstep(0.1,0.09,r);
        float spinHighlight=sin(a*2.0+r*10.0)*0.1;
        vec3 vinyl=vec3(0.02)+grooves+spinHighlight*record;
        vec3 labelCol=mix(vec3(0.8,0.2,0.1),vec3(0.9,0.8,0.2),smoothstep(0.05,0.09,r));
        float hole=smoothstep(0.015,0.01,r);
        vec3 c=mix(vinyl,labelCol,label);
        c=mix(c,vec3(0.5),hole);c*=record;
        vec2 mp=(u_mouse-0.5)*vec2(u_resolution.x/u_resolution.y,1.0);
        float light=exp(-length(uv-mp)*3.0)*0.3*record;
        c+=light*vec3(0.8,0.85,0.9);
        c=mix(vec3(0.15,0.12,0.1),c,record+0.1);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'woven-fabric',
    name: 'Fabric Weave',
    description: 'Tightly woven fabric texture with visible warp and weft threads in alternating colors.',
    tags: ['textile', 'texture', 'pattern'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        float threadSize=6.0;
        vec2 cell=floor(gl_FragCoord.xy/threadSize);
        vec2 local=mod(gl_FragCoord.xy,threadSize)/threadSize;
        float weave=mod(cell.x+cell.y,2.0);
        float warp=smoothstep(0.0,0.1,local.y)*smoothstep(1.0,0.9,local.y);
        float weft=smoothstep(0.0,0.1,local.x)*smoothstep(1.0,0.9,local.x);
        float thread=weave>0.5?warp:weft;
        vec3 color1=vec3(0.2,0.3,0.6);vec3 color2=vec3(0.6,0.2,0.3);
        vec3 c=mix(color1,color2,weave)*thread;
        c+=0.1*sin(cell.x*0.5+t)*sin(cell.y*0.5-t);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.1;
        gl_FragColor=vec4(c+0.05,1.0);
      }`,
  },
  {
    id: 'oscilloscope',
    name: 'Oscilloscope',
    description: 'Green phosphor oscilloscope display with Lissajous curves and signal waveform trace.',
    tags: ['science', 'analog', 'signal'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        vec3 c=vec3(0.0,0.02,0.0);
        float gridX=smoothstep(0.002,0.0,abs(mod(uv.x+0.5,0.1)-0.05));
        float gridY=smoothstep(0.002,0.0,abs(mod(uv.y+0.5,0.1)-0.05));
        c+=(gridX+gridY)*vec3(0.0,0.05,0.0);
        c+=smoothstep(0.002,0.0,abs(uv.x))*vec3(0.0,0.08,0.0);
        c+=smoothstep(0.002,0.0,abs(uv.y))*vec3(0.0,0.08,0.0);
        float freqX=3.0+u_mouse.x*4.0;float freqY=2.0+u_mouse.y*4.0;
        float minD=1.0;
        for(int i=0;i<200;i++){
          float fi=float(i)/200.0*6.28318;
          vec2 liss=vec2(sin(fi*freqX+t),cos(fi*freqY))*0.35;
          minD=min(minD,length(uv-liss));
        }
        float trace=exp(-minD*100.0);
        float glow=exp(-minD*20.0)*0.3;
        c+=trace*vec3(0.2,1.0,0.3)+glow*vec3(0.0,0.4,0.1);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'paint-drip',
    name: 'Paint Drips',
    description: 'Thick paint dripping down a canvas with viscous flow, color mixing and surface tension.',
    tags: ['art', 'paint', 'organic'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 canvas=vec3(0.95,0.93,0.9);vec3 c=canvas;
        for(int i=0;i<8;i++){
          float fi=float(i);
          float x=fi/8.0+0.0625;
          float dripSpeed=0.5+hash(vec2(fi,0.0))*0.5;
          float dripLen=0.3+hash(vec2(fi,1.0))*0.5;
          float wobble=noise(vec2(fi*5.0,t*dripSpeed))*0.03;
          float dx=abs(uv.x-x-wobble);
          float width=0.02+hash(vec2(fi,2.0))*0.02;
          float inDrip=smoothstep(width,width-0.005,dx);
          float top=0.9-hash(vec2(fi,3.0))*0.2;
          float bottom=top-dripLen*min(t*dripSpeed*0.3,1.0);
          float tipRound=smoothstep(bottom-0.02,bottom,uv.y);
          inDrip*=step(uv.y,top)*tipRound;
          float hue=fi/8.0*6.28;
          vec3 paint=0.5+0.45*cos(hue+vec3(0,2,4));
          c=mix(c,paint,inDrip);
        }
        float md=length(uv-u_mouse);c+=exp(-md*8.0)*0.08;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'conveyor-belt',
    name: 'Conveyor Belt',
    description: 'Industrial conveyor belt with moving surface segments, rollers and directional motion.',
    tags: ['industrial', 'machine', 'motion'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float beltY=step(0.35,uv.y)*step(uv.y,0.65);
        float segSize=0.05;
        float seg=mod(uv.x+t*0.2,segSize)/segSize;
        float segLine=smoothstep(0.02,0.0,seg)+smoothstep(0.98,1.0,seg);
        float surface=0.3+segLine*0.2;
        float ribbed=sin((uv.x+t*0.2)*200.0)*0.02+0.5;
        vec3 belt=vec3(0.2,0.2,0.22)*(surface+ribbed*0.1);
        float roller1=smoothstep(0.04,0.03,length(uv-vec2(0.1,0.5)));
        float roller2=smoothstep(0.04,0.03,length(uv-vec2(0.9,0.5)));
        float rollerSpoke1=step(0.5,sin(atan(uv.y-0.5,uv.x-0.1)*4.0+t*5.0));
        float rollerSpoke2=step(0.5,sin(atan(uv.y-0.5,uv.x-0.9)*4.0+t*5.0));
        vec3 frame=vec3(0.3,0.3,0.35);
        vec3 c=vec3(0.15);
        c=mix(c,belt,beltY);
        c=mix(c,frame*(0.7+rollerSpoke1*0.3),roller1);
        c=mix(c,frame*(0.7+rollerSpoke2*0.3),roller2);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'dna-strand',
    name: 'DNA Strand',
    description: 'Double helix DNA molecule with rotating base pairs, backbone and phosphate bridges.',
    tags: ['biology', 'science', 'organic'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        vec3 c=vec3(0.02,0.03,0.08);
        float y=uv.y*8.0;
        float helix1=sin(y+t*2.0)*0.15;float helix2=sin(y+t*2.0+3.14159)*0.15;
        float d1=abs(uv.x-helix1);float d2=abs(uv.x-helix2);
        float strand1=exp(-d1*80.0)*0.8;float strand2=exp(-d2*80.0)*0.8;
        for(int i=-10;i<10;i++){
          float fi=float(i)*0.8;
          float by=fi;
          float phase=by+t*2.0;
          float bx1=sin(phase)*0.15;float bx2=sin(phase+3.14159)*0.15;
          float dist=abs(uv.y-fi/8.0);
          if(dist<0.03){
            float bridge=smoothstep(0.01,0.0,dist);
            float along=(uv.x-min(bx1,bx2))/(abs(bx2-bx1)+0.001);
            along=clamp(along,0.0,1.0);
            float inBridge=step(min(bx1,bx2),uv.x)*step(uv.x,max(bx1,bx2));
            vec3 baseCol=mod(float(i),2.0)>0.5?vec3(0.2,0.6,0.9):vec3(0.9,0.3,0.4);
            c+=bridge*inBridge*baseCol*0.5;
          }
        }
        c+=strand1*vec3(0.3,0.6,1.0)+strand2*vec3(0.3,0.6,1.0);
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.1;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'mosaic-tile',
    name: 'Mosaic Tiles',
    description: 'Roman-style mosaic with irregular small tiles, visible grout lines and geometric patterns.',
    tags: ['mosaic', 'tile', 'art'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        float tileSize=10.0;
        vec2 cell=floor(gl_FragCoord.xy/tileSize);
        vec2 local=mod(gl_FragCoord.xy,tileSize)/tileSize;
        float jitter=hash(cell)*0.3;
        vec2 offset=vec2(hash(cell*1.1)-0.5,hash(cell*2.1)-0.5)*0.15;
        float grout=step(0.1,local.x)*step(local.x,0.9)*step(0.1,local.y)*step(local.y,0.9);
        float dist=length(uv-0.5+sin(t+cell.x*0.3)*0.1);
        float hue=hash(cell*3.0)+dist*2.0+t;
        vec3 tileCol=0.4+0.4*cos(hue*6.28+vec3(0,2,4));
        tileCol*=0.8+hash(cell*5.0)*0.4;
        vec3 groutCol=vec3(0.6,0.58,0.55);
        vec3 c=mix(groutCol,tileCol,grout);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.1;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'smoke-wisps',
    name: 'Smoke Wisps',
    description: 'Delicate smoke tendrils rising and curling with turbulent flow and dissipation.',
    tags: ['smoke', 'fluid', 'organic'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.02);
        for(int i=0;i<4;i++){
          float fi=float(i);
          float x=0.3+fi*0.15;
          vec2 p=vec2((uv.x-x)*8.0,uv.y*3.0-t*(0.3+fi*0.1));
          float n1=noise(p+fi*10.0);
          float n2=noise(p*2.0+n1*2.0+fi*20.0);
          float wisp=exp(-pow((uv.x-x-n1*0.08)*12.0,2.0));
          wisp*=smoothstep(0.0,0.2,uv.y)*smoothstep(1.0,0.3,uv.y);
          wisp*=n2*0.8;
          c+=wisp*vec3(0.5,0.5,0.55)*(0.3+fi*0.15);
        }
        float md=length(uv-u_mouse);
        float mouseSmoke=exp(-md*5.0)*noise(uv*10.0-t)*0.3;
        c+=mouseSmoke*vec3(0.4,0.4,0.45);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'gear-mechanism',
    name: 'Gear Train',
    description: 'Interlocking mechanical gears with teeth, rotation, and meshing motion simulation.',
    tags: ['machine', 'mechanical', 'industrial'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        vec3 c=vec3(0.1,0.1,0.12);
        for(int i=0;i<5;i++){
          float fi=float(i);
          vec2 center=vec2(cos(fi*1.26)*0.25,sin(fi*1.26)*0.25);
          float radius=0.08+fi*0.02;
          float teeth=8.0+fi*2.0;
          float speed=1.0/(1.0+fi*0.5)*((mod(fi,2.0)>0.5)?-1.0:1.0);
          vec2 d=uv-center;
          float r=length(d);float a=atan(d.y,d.x)+t*speed;
          float gear=smoothstep(radius+0.015,radius+0.01,r)*smoothstep(radius*0.3,radius*0.35,r);
          float toothPattern=smoothstep(0.5,0.6,sin(a*teeth))*0.015;
          float gearShape=smoothstep(radius+toothPattern+0.005,radius+toothPattern,r)*
                          smoothstep(radius*0.3,radius*0.35,r);
          float hub=smoothstep(radius*0.45,radius*0.4,r);
          float spoke=step(abs(sin(a*3.0)),0.15)*smoothstep(radius*0.4,radius*0.35,r)*
                      step(radius*0.35,r)*step(r,radius);
          vec3 metal=vec3(0.4,0.42,0.45)*(0.8+sin(a*teeth)*0.1);
          c=mix(c,metal,gearShape);c=mix(c,vec3(0.3,0.3,0.33),hub);
          c=mix(c,vec3(0.15),spoke*0.5);
        }
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'topographic-3d',
    name: 'Topo Relief',
    description: 'Raised topographic relief map with elevation shading, hillshade and height coloring.',
    tags: ['map', 'terrain', '3d'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.15;
        vec2 p=uv*4.0+(u_mouse-0.5)*2.0;
        float h=0.0;float a=0.5;
        for(int i=0;i<5;i++){h+=noise(p)*a;p*=2.0;a*=0.5;}
        float dx=noise(p+vec2(0.01,0.0))-noise(p-vec2(0.01,0.0));
        float dy=noise(p+vec2(0.0,0.01))-noise(p-vec2(0.0,0.01));
        float shade=0.5+dx*8.0-dy*4.0;shade=clamp(shade,0.0,1.0);
        vec3 low=vec3(0.2,0.5,0.2);vec3 mid=vec3(0.6,0.5,0.3);
        vec3 high=vec3(0.9,0.9,0.95);
        vec3 col=h<0.4?mix(low,mid,h/0.4):mix(mid,high,(h-0.4)/0.6);
        col*=shade*0.6+0.4;
        float contour=smoothstep(0.02,0.0,abs(fract(h*10.0)-0.5)-0.45);
        col=mix(col,col*0.5,contour);
        gl_FragColor=vec4(col,1.0);
      }`,
  },
  {
    id: 'film-strip',
    name: 'Film Strip',
    description: 'Classic cinema film strip with sprocket holes, frame lines and flickering projection.',
    tags: ['cinema', 'retro', 'film'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float filmY=mod(uv.y+t*0.3,1.0);
        float frameH=0.2;float frame=floor(filmY/frameH);
        float localY=mod(filmY,frameH)/frameH;
        float sprocketL=step(uv.x,0.08)*step(0.15,localY)*step(localY,0.85)*
                        step(abs(localY-0.5),0.25);
        float sprocketR=step(0.92,uv.x)*step(0.15,localY)*step(localY,0.85)*
                        step(abs(localY-0.5),0.25);
        float frameLine=smoothstep(0.01,0.0,localY)+smoothstep(0.99,1.0,localY);
        float content=step(0.12,uv.x)*step(uv.x,0.88)*step(0.05,localY)*step(localY,0.95);
        float scene=sin(uv.x*10.0+frame*5.0)*sin(localY*8.0+frame*3.0)*0.5+0.5;
        scene*=0.7+hash(vec2(frame,floor(t*24.0)))*0.3;
        vec3 filmBase=vec3(0.05,0.03,0.0);
        vec3 c=filmBase;
        c=mix(c,vec3(scene*0.8,scene*0.75,scene*0.6),content);
        c=mix(c,vec3(0.15),sprocketL+sprocketR);
        c+=frameLine*0.1;
        float flicker=0.9+hash(vec2(floor(t*24.0),0.0))*0.2;
        c*=flicker;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'snowfall',
    name: 'Snowfall',
    description: 'Gentle snowfall with varying flake sizes, wind drift and accumulation on the ground.',
    tags: ['snow', 'winter', 'nature'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=mix(vec3(0.15,0.18,0.25),vec3(0.05,0.06,0.1),uv.y);
        for(int layer=0;layer<3;layer++){
          float fl=float(layer);
          float speed=0.1+fl*0.05;float size=2.0+fl;
          for(int i=0;i<15;i++){
            float fi=float(i)+fl*15.0;
            float x=hash(vec2(fi,fl))+sin(t*0.5+fi)*0.05;
            x=fract(x+sin(t*0.3+fi*2.0)*0.02);
            float y=fract(hash(vec2(fi*3.0,fl))-t*speed*(0.5+hash(vec2(fi*7.0,fl))*0.5));
            float d=length(gl_FragCoord.xy-vec2(x,y)*u_resolution)/size;
            c+=exp(-d*3.0)*vec3(0.8,0.85,0.9)*0.15/(1.0+fl);
          }
        }
        float ground=smoothstep(0.08,0.05,uv.y);
        float snowPile=smoothstep(0.1,0.05,uv.y-sin(uv.x*20.0)*0.01-0.03);
        c=mix(c,vec3(0.85,0.88,0.92),snowPile);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'piano-keys',
    name: 'Piano Keys',
    description: 'Piano keyboard with animated key presses, traveling highlight and musical visualization.',
    tags: ['music', 'keyboard', 'instrument'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float keyWidth=1.0/14.0;float keyIdx=floor(uv.x/keyWidth);
        float localX=mod(uv.x,keyWidth)/keyWidth;
        float isBlack=0.0;
        float noteInOctave=mod(keyIdx,7.0);
        if(uv.y>0.4){
          float blackPos=noteInOctave;
          if(blackPos<1.0||blackPos==1.0||blackPos==2.0||blackPos==4.0||blackPos==5.0){
            float bx=mod(uv.x+keyWidth*0.3,keyWidth)/keyWidth;
            if(bx>0.3&&bx<0.7&&noteInOctave<6.0)isBlack=1.0;
          }
        }
        float pressed=step(0.8,sin(t*4.0+keyIdx*1.5))*0.15;
        float mouseKey=exp(-abs(uv.x-u_mouse.x)*30.0)*0.2;
        float gap=smoothstep(0.02,0.04,localX)*smoothstep(0.98,0.96,localX);
        vec3 white=vec3(0.95-pressed-mouseKey)*gap;
        vec3 black=vec3(0.1+pressed*0.5+mouseKey);
        vec3 c=isBlack>0.5?black:white;
        float waveY=0.1+sin(uv.x*30.0+t*3.0)*0.03;
        float wave=step(uv.y,waveY)*step(0.0,uv.y);
        c=mix(c,vec3(0.3,0.5,0.9),wave*0.5);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'sun-rays',
    name: 'God Rays',
    description: 'Volumetric light rays streaming through clouds with atmospheric scattering and warm glow.',
    tags: ['light', 'atmosphere', 'nature'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 sunPos=u_mouse;
        vec2 d=uv-sunPos;float r=length(d);float a=atan(d.y,d.x);
        float rays=0.0;
        for(int i=0;i<8;i++){
          float fi=float(i);
          float rayAngle=fi*0.785+t*0.1;
          float da=abs(mod(a-rayAngle+3.14159,0.785)-0.3925);
          float ray=exp(-da*8.0)*exp(-r*2.0);
          float cloud=noise(vec2(a*3.0+fi,r*5.0+t*0.2));
          ray*=cloud;
          rays+=ray;
        }
        float sun=exp(-r*8.0);
        vec3 skyCol=mix(vec3(0.4,0.6,0.9),vec3(0.1,0.15,0.3),uv.y);
        vec3 rayCol=vec3(1.0,0.9,0.6);
        vec3 c=skyCol;
        c+=rays*rayCol*0.4;
        c+=sun*vec3(1.0,0.95,0.8);
        float clouds=noise(uv*3.0+t*0.1)*noise(uv*6.0-t*0.05);
        c=mix(c,vec3(0.9),clouds*0.3*step(0.4,uv.y));
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
];
