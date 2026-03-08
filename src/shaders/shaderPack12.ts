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

export const shaderPack12: DitherShaderDef[] = [
  {
    id: 'brick-pattern',
    name: 'Brick Wall',
    description: 'Realistic brick wall with mortar joints, color variation and weathering texture.',
    tags: ['architecture', 'texture', 'wall'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float brickW=40.0;float brickH=20.0;
        float row=floor(gl_FragCoord.y/brickH);
        float offset=mod(row,2.0)*brickW*0.5;
        vec2 brick=vec2(floor((gl_FragCoord.x+offset)/brickW),row);
        vec2 local=vec2(mod(gl_FragCoord.x+offset,brickW)/brickW,mod(gl_FragCoord.y,brickH)/brickH);
        float mortar=step(0.06,local.x)*step(local.x,0.94)*step(0.08,local.y)*step(local.y,0.92);
        float hue=hash(brick)*0.3;
        vec3 brickCol=vec3(0.6+hue,0.25+hue*0.5,0.15+hue*0.3);
        brickCol*=0.8+hash(brick*3.0)*0.4;
        vec3 mortarCol=vec3(0.7,0.68,0.65);
        vec3 c=mix(mortarCol,brickCol,mortar);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'fire-embers',
    name: 'Fire Embers',
    description: 'Glowing embers floating upward from a fire with orange sparks and heat shimmer.',
    tags: ['fire', 'particles', 'warm'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=mix(vec3(0.05,0.02,0.0),vec3(0.02,0.0,0.0),uv.y);
        float glow=exp(-(uv.y)*3.0)*smoothstep(0.3,0.5,1.0-abs(uv.x-0.5)*2.0);
        c+=glow*vec3(0.3,0.1,0.0);
        for(int i=0;i<30;i++){
          float fi=float(i);
          float x=hash(vec2(fi,0.0))*0.6+0.2;
          float speed=0.1+hash(vec2(fi,1.0))*0.15;
          float y=fract(hash(vec2(fi,2.0))+t*speed);
          float wobble=sin(t*2.0+fi*3.0)*0.02;
          vec2 ember=vec2(x+wobble,y);
          float d=length(uv-ember);
          float size=0.003+hash(vec2(fi,3.0))*0.004;
          float bright=exp(-d/size)*(1.0-y);
          float fade=sin(t*5.0+fi*7.0)*0.3+0.7;
          c+=bright*vec3(1.0,0.5+y*0.3,0.1)*fade;
        }
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*vec3(0.2,0.1,0.0);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'wave-interference-2d',
    name: 'Wave Grid',
    description: 'Standing wave interference on a 2D grid creating complex nodal patterns.',
    tags: ['physics', 'wave', 'grid'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float wave=0.0;
        wave+=sin(uv.x*30.0+t*3.0);
        wave+=sin(uv.y*30.0-t*2.5);
        wave+=sin((uv.x+uv.y)*20.0+t*2.0);
        wave+=sin((uv.x-uv.y)*25.0-t*1.5);
        wave+=sin(length(uv-u_mouse)*35.0-t*4.0)*0.5;
        wave/=4.5;
        float val=wave*0.5+0.5;
        vec3 neg=vec3(0.0,0.1,0.3);
        vec3 zero=vec3(0.0,0.0,0.05);
        vec3 pos=vec3(0.3,0.1,0.0);
        vec3 c=wave>0.0?mix(zero,pos,wave):mix(zero,neg,-wave);
        float node=smoothstep(0.05,0.0,abs(wave));
        c+=node*vec3(0.5,0.5,0.5)*0.3;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'peacock-feather',
    name: 'Peacock Eye',
    description: 'Peacock feather eye pattern with iridescent barbules and structural color gradients.',
    tags: ['nature', 'iridescent', 'feather'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time*0.5;
        float r=length(uv);float a=atan(uv.y,uv.x);
        float eye1=smoothstep(0.22,0.2,r);
        float eye2=smoothstep(0.15,0.13,r);
        float eye3=smoothstep(0.08,0.06,r);
        float pupil=smoothstep(0.04,0.03,r);
        float barbules=sin(a*40.0+r*20.0+noise(uv*10.0+t)*3.0)*0.5+0.5;
        float irid=dot(normalize(uv),normalize(uv-(u_mouse-0.5)))*0.5+0.5;
        vec3 c=vec3(0.1,0.3,0.15);
        c+=barbules*vec3(0.0,0.15,0.05)*smoothstep(0.35,0.25,r);
        c=mix(c,vec3(0.0,0.2,0.5)+irid*vec3(0.3,0.1,0.0),eye1);
        c=mix(c,vec3(0.1,0.6,0.3)+irid*vec3(0.4,0.2,0.0),eye2);
        c=mix(c,vec3(0.3,0.15,0.0),eye3);
        c=mix(c,vec3(0.05),pupil);
        float shimmer=sin(a*80.0+t*2.0)*0.05*(1.0-r*2.0);
        c+=shimmer;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'knit-texture',
    name: 'Knit Fabric',
    description: 'Knitted fabric texture with visible V-shaped stitches, rows and yarn fiber detail.',
    tags: ['textile', 'craft', 'cozy'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        float stitchW=8.0;float stitchH=10.0;
        vec2 cell=floor(gl_FragCoord.xy/vec2(stitchW,stitchH));
        vec2 local=mod(gl_FragCoord.xy,vec2(stitchW,stitchH))/vec2(stitchW,stitchH);
        float vLeft=smoothstep(0.12,0.0,abs(local.x-0.5+local.y*0.3));
        float vRight=smoothstep(0.12,0.0,abs(local.x-0.5-local.y*0.3));
        float stitch=(vLeft+vRight)*step(0.1,local.y)*step(local.y,0.9);
        float row=cell.y;
        float hue=sin(row*0.5+t)*0.3+0.5;
        vec3 yarn=mix(vec3(0.7,0.2,0.2),vec3(0.2,0.3,0.6),hue);
        float fuzz=sin(gl_FragCoord.x*10.0)*sin(gl_FragCoord.y*10.0)*0.03;
        vec3 bg=vec3(0.15,0.12,0.1);
        vec3 c=mix(bg,yarn+fuzz,stitch*0.8);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'terrazzo',
    name: 'Terrazzo',
    description: 'Italian terrazzo floor with scattered irregular stone chips in polished cement matrix.',
    tags: ['stone', 'floor', 'texture'],
    fragmentShader: `${U}
      vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float sc=35.0;
        vec2 st=gl_FragCoord.xy/sc;vec2 ist=floor(st);vec2 fst=fract(st);
        float md=1.0;vec2 mId;
        for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
          vec2 nb=vec2(float(x),float(y));
          vec2 pt=hash2(ist+nb)*0.7+0.15;
          float d=length(nb+pt-fst);
          if(d<md){md=d;mId=ist+nb;}
        }
        float chip=smoothstep(0.35,0.3,md);
        float hue=hash2(mId).x;
        vec3 chipCol;
        if(hue<0.2)chipCol=vec3(0.85,0.8,0.75);
        else if(hue<0.4)chipCol=vec3(0.6,0.3,0.25);
        else if(hue<0.6)chipCol=vec3(0.3,0.35,0.3);
        else if(hue<0.8)chipCol=vec3(0.8,0.75,0.6);
        else chipCol=vec3(0.4,0.4,0.45);
        chipCol*=0.8+hash2(mId).y*0.4;
        vec3 cement=vec3(0.75,0.73,0.7);
        vec3 c=mix(cement,chipCol,chip);
        float polish=exp(-length(uv-u_mouse)*3.0)*0.1;c+=polish;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'aurora-curtain',
    name: 'Aurora Curtain',
    description: 'Vertical aurora borealis curtains with magnetic field-aligned shimmer and color bands.',
    tags: ['aurora', 'atmosphere', 'nature'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.5;
        vec3 sky=mix(vec3(0.0,0.02,0.05),vec3(0.0,0.0,0.02),uv.y);
        float curtain=0.0;
        for(int i=0;i<3;i++){
          float fi=float(i);
          float x=0.3+fi*0.2+sin(t*0.5+fi)*0.1;
          float dist=abs(uv.x-x);
          float n=noise(vec2(uv.y*5.0+t,fi*10.0));
          float band=exp(-dist*20.0/(1.0+n*2.0));
          band*=smoothstep(0.3,0.8,uv.y)*smoothstep(1.0,0.6,uv.y);
          band*=0.5+n*0.5;
          curtain+=band;
        }
        vec3 green=vec3(0.1,0.8,0.3);vec3 purple=vec3(0.5,0.1,0.6);vec3 red=vec3(0.7,0.1,0.2);
        vec3 auroraCol=mix(green,purple,smoothstep(0.6,0.9,uv.y));
        auroraCol=mix(auroraCol,red,smoothstep(0.85,1.0,uv.y)*0.5);
        vec3 c=sky+auroraCol*curtain;
        float stars=step(0.998,hash(floor(gl_FragCoord.xy/2.0)))*step(curtain,0.15);
        c+=stars*0.4;
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'plasma-ball',
    name: 'Plasma Ball',
    description: 'Tesla plasma globe with branching electrical arcs reaching toward touch point.',
    tags: ['plasma', 'electric', 'sci-fi'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        float r=length(uv);float a=atan(uv.y,uv.x);
        float globe=smoothstep(0.38,0.37,r);
        float glass=smoothstep(0.38,0.37,r)*smoothstep(0.35,0.36,r);
        vec2 touch=(u_mouse-0.5)*0.7;
        float arcs=0.0;
        for(int i=0;i<8;i++){
          float fi=float(i);
          float arcA=fi*0.785+t*(0.5+fi*0.1);
          float target=atan(touch.y,touch.x);
          float da=mod(a-mix(arcA,target,0.5)+3.14159,6.28318)-3.14159;
          float n=noise(vec2(a*5.0+fi*10.0,t*3.0+fi));
          float arc=exp(-abs(da+n*0.3)*8.0)*exp(-(0.35-r)*5.0)*step(0.05,r);
          arc*=globe;
          arcs+=arc;
        }
        float core=exp(-r*20.0)*globe;
        vec3 c=vec3(0.02);
        c=mix(c,vec3(0.05,0.03,0.08),globe);
        c+=arcs*vec3(0.5,0.3,1.0);
        c+=core*vec3(0.8,0.6,1.0);
        c+=glass*vec3(0.2,0.15,0.25);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    description: 'Japanese rock garden with raked sand patterns flowing around placed stones.',
    tags: ['zen', 'japan', 'peaceful'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        vec2 stone1=u_mouse;vec2 stone2=vec2(0.3,0.4);vec2 stone3=vec2(0.7,0.6);
        float d1=length(uv-stone1);float d2=length(uv-stone2);float d3=length(uv-stone3);
        float minD=min(min(d1,d2),d3);
        float raked=sin(min(d1,min(d2,d3))*60.0+noise(uv*5.0+t)*2.0)*0.5+0.5;
        float rake=smoothstep(0.4,0.5,raked);
        vec3 sand=mix(vec3(0.85,0.8,0.7),vec3(0.75,0.7,0.6),rake);
        sand+=noise(gl_FragCoord.xy*0.5)*0.03;
        vec3 c=sand;
        float s1=smoothstep(0.05,0.04,d1);
        float s2=smoothstep(0.04,0.03,d2);
        float s3=smoothstep(0.035,0.025,d3);
        vec3 stoneCol=vec3(0.4,0.4,0.42);
        c=mix(c,stoneCol,s1+s2+s3);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'tape-deck',
    name: 'VU Meter',
    description: 'Analog VU meter with bouncing needle, dB scale markings and warm backlight glow.',
    tags: ['audio', 'analog', 'retro'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 center=vec2(0.5,0.2);
        vec3 c=vec3(0.15,0.12,0.08);
        float faceD=length((uv-vec2(0.5,0.5))*vec2(1.0,1.5));
        float face=smoothstep(0.55,0.53,faceD);
        c=mix(c,vec3(0.92,0.9,0.82),face);
        float a=atan(uv.y-center.y,uv.x-center.x);
        float r=length(uv-center);
        for(int i=-10;i<=10;i++){
          float fi=float(i);
          float tickA=3.14159*0.5+fi*0.07;
          float da=abs(a-tickA);
          float tick=smoothstep(0.003,0.0,da)*step(0.3,r)*step(r,0.35)*face;
          c-=tick*0.6;
        }
        float needleAngle=3.14159*0.5+sin(t*3.0+sin(t*7.0)*0.5)*0.5;
        needleAngle+=u_mouse.x*0.3;
        float na=abs(a-needleAngle);
        float needle=smoothstep(0.002,0.0,na)*step(0.05,r)*step(r,0.35)*face;
        c=mix(c,vec3(0.1),needle);
        float pivot=smoothstep(0.02,0.015,length(uv-center))*face;
        c=mix(c,vec3(0.3),pivot);
        float redZone=step(3.14159*0.5+0.4,a)*step(0.3,r)*step(r,0.33)*face;
        c=mix(c,vec3(0.8,0.2,0.1),redZone*0.3);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'motherboard',
    name: 'Motherboard',
    description: 'Computer motherboard layout with IC chips, capacitors, traces and component labels.',
    tags: ['tech', 'computer', 'circuit'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float cs=20.0;
        vec2 cell=floor(gl_FragCoord.xy/cs);
        vec2 local=mod(gl_FragCoord.xy,cs)/cs;
        float r=hash(cell);
        vec3 pcb=vec3(0.0,0.35,0.15);
        vec3 c=pcb;
        float trace=0.0;
        if(r<0.2)trace=step(abs(local.y-0.5),0.06);
        else if(r<0.4)trace=step(abs(local.x-0.5),0.06);
        c=mix(c,vec3(0.6,0.5,0.2),trace);
        float chip=step(0.15,local.x)*step(local.x,0.85)*step(0.15,local.y)*step(local.y,0.85);
        float isChip=step(0.85,hash(cell*5.0));
        c=mix(c,vec3(0.1,0.1,0.12),chip*isChip);
        float pin=0.0;
        for(int i=0;i<4;i++){
          float fi=float(i);
          pin+=smoothstep(0.04,0.02,length(local-vec2(0.2+fi*0.2,0.1)))*isChip;
          pin+=smoothstep(0.04,0.02,length(local-vec2(0.2+fi*0.2,0.9)))*isChip;
        }
        c=mix(c,vec3(0.7,0.65,0.5),min(pin,1.0));
        float cap=smoothstep(0.1,0.08,length(local-0.5))*step(0.9,hash(cell*7.0))*(1.0-isChip);
        c=mix(c,vec3(0.3,0.3,0.35),cap);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'celtic-knot',
    name: 'Celtic Knot',
    description: 'Interlacing Celtic knot pattern with over-under weaving and ornamental borders.',
    tags: ['celtic', 'ornamental', 'pattern'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time*0.3;
        float r=length(uv);float a=atan(uv.y,uv.x)+t*0.1;
        float folds=4.0;
        float sa=mod(a+3.14159,6.28318/folds)-3.14159/folds;
        vec2 p=vec2(cos(sa),sin(sa))*r;
        float knot1=sin(p.x*20.0)*sin(p.y*20.0);
        float knot2=sin((p.x+p.y)*15.0)*sin((p.x-p.y)*15.0);
        float band1=smoothstep(0.08,0.0,abs(knot1)-0.3)*smoothstep(0.35,0.0,r);
        float band2=smoothstep(0.08,0.0,abs(knot2)-0.3)*smoothstep(0.35,0.0,r);
        float over=step(0.0,knot1)*band1;
        float under=(1.0-step(0.0,knot1))*band2;
        vec3 gold=vec3(0.8,0.65,0.2);vec3 darkGold=vec3(0.5,0.35,0.1);
        vec3 bg=vec3(0.1,0.08,0.05);
        vec3 c=bg;
        c=mix(c,gold,over);c=mix(c,darkGold,under);
        float border=smoothstep(0.37,0.36,r)*smoothstep(0.34,0.35,r);
        c=mix(c,gold*0.8,border);
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'paint-splatter',
    name: 'Paint Splatter',
    description: 'Jackson Pollock style paint splatters with drips, pools and layered color chaos.',
    tags: ['art', 'abstract', 'expressionist'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        vec3 canvas=vec3(0.95,0.93,0.9);vec3 c=canvas;
        for(int i=0;i<12;i++){
          float fi=float(i);
          vec2 center=vec2(hash(vec2(fi,0.0)),hash(vec2(fi,1.0)));
          float size=0.05+hash(vec2(fi,2.0))*0.15;
          float d=length(uv-center);
          float splat=smoothstep(size,size*0.3,d+noise(uv*20.0+fi)*size*0.5);
          float drip=exp(-abs(uv.x-center.x)*50.0)*step(center.y,uv.y)*
                     step(uv.y,center.y+0.2*hash(vec2(fi,3.0)))*0.5;
          float hue=hash(vec2(fi,4.0))*6.28+t;
          vec3 paint=0.4+0.4*cos(hue+vec3(0,2,4));
          c=mix(c,paint,max(splat,drip));
        }
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'gear-clock',
    name: 'Steampunk',
    description: 'Steampunk machinery with brass gears, steam pipes, rivets and Victorian engineering.',
    tags: ['steampunk', 'mechanical', 'vintage'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        vec3 c=vec3(0.15,0.1,0.05);
        for(int i=0;i<7;i++){
          float fi=float(i);
          vec2 center=vec2(sin(fi*1.2)*0.25,cos(fi*1.8)*0.25);
          float radius=0.06+fi*0.015;
          float teeth=10.0+fi*2.0;
          float speed=(mod(fi,2.0)>0.5?1.0:-1.0)*(1.0/(1.0+fi*0.3));
          vec2 d=uv-center;float r=length(d);
          float a=atan(d.y,d.x)+t*speed;
          float toothP=sin(a*teeth)*0.01;
          float gear=smoothstep(radius+toothP+0.005,radius+toothP,r)*
                     smoothstep(radius*0.3,radius*0.35,r);
          float hub=smoothstep(radius*0.4,radius*0.35,r);
          vec3 brass=vec3(0.7,0.55,0.2)*(0.8+sin(a*teeth)*0.1);
          c=mix(c,brass,gear);c=mix(c,vec3(0.4,0.3,0.15),hub);
        }
        float pipe=step(abs(uv.y+0.3),0.02)*step(-0.3,uv.x)*step(uv.x,0.3);
        c=mix(c,vec3(0.5,0.4,0.2),pipe);
        float rivet=0.0;
        for(int i=0;i<6;i++){
          float fi=float(i);
          rivet+=smoothstep(0.01,0.008,length(uv-vec2(-0.3+fi*0.12,-0.3)));
        }
        c=mix(c,vec3(0.6,0.5,0.25),min(rivet,1.0));
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*3.0)*0.08;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'watercolor-bleed',
    name: 'Watercolor',
    description: 'Wet watercolor painting with pigment bleeding, paper texture and soft color diffusion.',
    tags: ['art', 'watercolor', 'organic'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        float paper=0.9+noise(gl_FragCoord.xy*0.5)*0.1;
        vec3 c=vec3(paper,paper*0.98,paper*0.95);
        for(int i=0;i<5;i++){
          float fi=float(i);
          vec2 center=vec2(0.2+fi*0.15,0.3+sin(fi*2.0)*0.2);
          float d=length(uv-center);
          float n=noise(uv*8.0+fi*10.0+t);
          float bleed=smoothstep(0.15+n*0.1,0.05,d);
          float edge=smoothstep(0.05,0.1+n*0.05,d)*bleed;
          float hue=fi*1.3+t;
          vec3 pigment=0.5+0.4*cos(hue+vec3(0,2,4));
          c=mix(c,pigment*paper,bleed*0.5);
          c=mix(c,pigment*0.7*paper,edge*0.3);
        }
        float md=length(uv-u_mouse);
        float wet=exp(-md*3.0)*0.15;
        c=mix(c,c*0.8,wet);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
];
