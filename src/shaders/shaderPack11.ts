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

export const shaderPack11: DitherShaderDef[] = [
  {
    id: 'flag-wave',
    name: 'Flag Wave',
    description: 'Waving flag with cloth physics simulation, wind ripples and fabric fold shadows.',
    tags: ['fabric', 'animation', 'physics'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float wave=sin(uv.x*8.0-t*3.0)*0.03*(uv.x);
        wave+=sin(uv.x*15.0-t*5.0)*0.01*(uv.x);
        float foldShadow=sin(uv.x*8.0-t*3.0)*0.2*(uv.x)+0.8;
        vec2 fuv=vec2(uv.x,uv.y+wave);
        float inFlag=step(0.1,fuv.x)*step(fuv.x,0.9)*step(0.25,fuv.y)*step(fuv.y,0.75);
        float stripeH=floor((fuv.y-0.25)*20.0);
        vec3 stripe=mod(stripeH,2.0)>0.5?vec3(0.8,0.1,0.1):vec3(0.95);
        float canton=step(0.1,fuv.x)*step(fuv.x,0.4)*step(0.5,fuv.y)*step(fuv.y,0.75);
        vec3 flagCol=mix(stripe,vec3(0.1,0.2,0.5),canton);
        flagCol*=foldShadow;
        float pole=step(abs(uv.x-0.1),0.008)*step(0.15,uv.y)*step(uv.y,0.85);
        vec3 c=vec3(0.6,0.7,0.9);
        c=mix(c,flagCol,inFlag);c=mix(c,vec3(0.5,0.5,0.45),pole);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'ripple-pond',
    name: 'Ripple Pond',
    description: 'Multiple expanding ripples on a pond surface with interference and damping.',
    tags: ['water', 'ripple', 'physics'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.1,0.2,0.3);
        float total=0.0;
        for(int i=0;i<5;i++){
          float fi=float(i);
          vec2 center=vec2(hash(vec2(fi,0.0)),hash(vec2(fi,1.0)));
          float startTime=hash(vec2(fi,2.0))*5.0;
          float age=mod(t-startTime,5.0);
          float d=length(uv-center);
          float ripple=sin(d*40.0-age*5.0)*exp(-d*5.0)*exp(-age*0.5);
          total+=ripple;
        }
        float mouseD=length(uv-u_mouse);
        total+=sin(mouseD*30.0-t*4.0)*exp(-mouseD*4.0)*0.5;
        vec3 light=vec3(0.3,0.5,0.6);vec3 dark=vec3(0.05,0.1,0.2);
        c+=total*0.3;
        float highlight=pow(max(total,0.0),2.0)*0.5;
        c+=highlight*vec3(0.5,0.6,0.7);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'newspaper-print',
    name: 'Newsprint',
    description: 'Vintage newspaper halftone print with dot pattern, yellowed paper and ink bleed.',
    tags: ['print', 'retro', 'halftone'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        float md=length(uv-u_mouse);
        float image=noise(uv*5.0+t)*0.4+noise(uv*10.0)*0.3+0.3;
        image+=exp(-md*3.0)*0.2;
        float dotSize=4.0;
        vec2 cell=floor(gl_FragCoord.xy/dotSize)+0.5;
        vec2 cellCenter=cell*dotSize;
        float d=length(gl_FragCoord.xy-cellCenter)/dotSize;
        float radius=image*0.7;
        float dot=smoothstep(radius+0.05,radius,d);
        float bleed=noise(gl_FragCoord.xy*0.5)*0.1;
        dot+=bleed*dot;
        vec3 paper=vec3(0.92,0.88,0.78);
        vec3 ink=vec3(0.1,0.08,0.06);
        vec3 c=mix(paper,ink,clamp(dot,0.0,1.0));
        float crease=noise(uv*2.0)*0.05;c-=crease;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'atom-orbit',
    name: 'Atom Model',
    description: 'Bohr atomic model with electron orbits, nucleus and probability cloud visualization.',
    tags: ['science', 'atom', 'physics'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        float r=length(uv);
        vec3 c=vec3(0.02,0.02,0.05);
        float nucleus=exp(-r*40.0);
        c+=nucleus*vec3(1.0,0.5,0.2);
        for(int i=0;i<3;i++){
          float fi=float(i);
          float orbitR=0.1+fi*0.08;
          float tilt=fi*1.047;
          float ct=cos(tilt),st=sin(tilt);
          vec2 ruv=vec2(uv.x*ct-uv.y*st,uv.x*st+uv.y*ct);
          ruv.y*=3.0;
          float orbit=abs(length(ruv)-orbitR);
          float ring=exp(-orbit*100.0)*0.3;
          c+=ring*vec3(0.3,0.5,0.8);
          float eAngle=t*(3.0-fi)+fi*2.094;
          vec2 ePos=vec2(cos(eAngle),sin(eAngle)*0.33)*orbitR;
          ePos=vec2(ePos.x*ct+ePos.y*st,-ePos.x*st+ePos.y*ct);
          float electron=exp(-length(uv-ePos)*60.0);
          c+=electron*vec3(0.3,0.8,1.0);
        }
        float cloud=exp(-r*8.0)*0.1;c+=cloud*vec3(0.2,0.3,0.5);
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'art-deco',
    name: 'Art Deco',
    description: 'Art Deco geometric pattern with sunburst motifs, golden ratio arcs and metallic finish.',
    tags: ['deco', 'geometric', 'luxury'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        vec2 p=(uv-0.5)*2.0;
        float fan=atan(p.y,p.x);
        float rays=step(0.5,sin(fan*12.0))*0.3;
        float arcs=0.0;
        for(int i=1;i<6;i++){
          float ri=float(i)*0.15;
          arcs+=smoothstep(0.015,0.0,abs(length(p)-ri));
        }
        float chevron=step(0.5,sin((p.y-abs(p.x)*0.5)*20.0));
        float keystone=step(abs(p.x),0.3)*step(abs(p.y),0.4);
        vec3 gold=vec3(0.85,0.7,0.3);vec3 dark=vec3(0.1,0.08,0.05);
        vec3 c=dark;
        c+=rays*gold*0.5;
        c+=arcs*gold*0.8;
        c+=chevron*gold*0.15*step(0.5,uv.y);
        float md=length(uv-u_mouse);
        float sheen=exp(-md*3.0)*0.2;
        c+=sheen*gold;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'heart-pulse',
    name: 'Heart Pulse',
    description: 'ECG heart monitor with beeping pulse line, heart rate display and vital signs.',
    tags: ['medical', 'heart', 'monitor'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.0,0.03,0.0);
        float gridX=smoothstep(0.002,0.0,abs(mod(uv.x,0.05)-0.025));
        float gridY=smoothstep(0.002,0.0,abs(mod(uv.y,0.05)-0.025));
        c+=(gridX+gridY)*vec3(0.0,0.04,0.0);
        float x=fract(uv.x-t*0.3)*6.28;
        float ecg=0.0;
        ecg+=exp(-pow(x-2.0,2.0)*10.0)*0.05;
        ecg+=exp(-pow(x-2.5,2.0)*50.0)*(-0.08);
        ecg+=exp(-pow(x-2.8,2.0)*80.0)*0.35;
        ecg+=exp(-pow(x-3.1,2.0)*50.0)*(-0.1);
        ecg+=exp(-pow(x-3.5,2.0)*20.0)*0.08;
        ecg+=exp(-pow(x-4.2,2.0)*15.0)*0.06;
        float lineY=0.5+ecg;
        float d=abs(uv.y-lineY);
        float line=exp(-d*150.0);
        float glow=exp(-d*30.0)*0.3;
        float sweep=smoothstep(0.0,0.05,fract(uv.x-t*0.3));
        c+=line*vec3(0.2,1.0,0.3)*sweep;
        c+=glow*vec3(0.0,0.4,0.1)*sweep;
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*vec3(0.0,0.1,0.0);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'tie-dye',
    name: 'Tie Dye',
    description: 'Psychedelic tie-dye fabric pattern with spiral color bleeding and fabric absorption.',
    tags: ['psychedelic', 'fabric', 'color'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time*0.3;
        float r=length(uv);float a=atan(uv.y,uv.x);
        float spiral=a+r*10.0+t;
        float bands=sin(spiral*3.0)*0.5+0.5;
        float bleed=noise(uv*10.0+t)*0.3;
        bands+=bleed;
        float section=floor(bands*5.0)/5.0;
        vec3 colors[5];
        float hue=section*1.5+t*0.5;
        vec3 col=0.5+0.45*cos(hue+vec3(0,2,4));
        float fabric=noise(gl_FragCoord.xy*0.3)*0.1;
        vec3 c=col-fabric;
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    description: 'Architectural blueprint with grid lines, dimension markings and technical drawing style.',
    tags: ['technical', 'architecture', 'drawing'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        vec3 paper=vec3(0.1,0.2,0.45);
        float gridSmall=max(smoothstep(0.003,0.0,abs(mod(uv.x,0.02)-0.01)),
                           smoothstep(0.003,0.0,abs(mod(uv.y,0.02)-0.01)));
        float gridLarge=max(smoothstep(0.004,0.0,abs(mod(uv.x,0.1)-0.05)),
                           smoothstep(0.004,0.0,abs(mod(uv.y,0.1)-0.05)));
        vec3 c=paper;
        c+=gridSmall*vec3(0.15,0.25,0.5)*0.3;
        c+=gridLarge*vec3(0.2,0.35,0.6)*0.5;
        float rect=smoothstep(0.003,0.0,abs(abs(uv.x-0.5)-0.2))*step(abs(uv.y-0.5),0.15)+
                   smoothstep(0.003,0.0,abs(abs(uv.y-0.5)-0.15))*step(abs(uv.x-0.5),0.2);
        c+=rect*vec3(0.6,0.7,0.9);
        float circle=smoothstep(0.003,0.0,abs(length(uv-vec2(0.5,0.5))-0.1));
        c+=circle*vec3(0.6,0.7,0.9);
        float dim=smoothstep(0.002,0.0,abs(uv.y-0.35))*step(0.3,uv.x)*step(uv.x,0.7);
        c+=dim*vec3(0.5,0.6,0.8);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'chessboard-3d',
    name: 'Chess Board',
    description: 'Perspective chess board with 3D illusion, piece shadows and reflective surface.',
    tags: ['game', 'perspective', '3d'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 p=uv-vec2(u_mouse.x,0.8);
        float persp=0.5/(uv.y+0.1);
        vec2 grid=vec2(p.x*persp,persp);
        grid.y+=t*0.1;
        float checker=mod(floor(grid.x*4.0)+floor(grid.y*4.0),2.0);
        float board=step(0.0,uv.y)*step(uv.y,0.7);
        vec3 white=vec3(0.9,0.88,0.82);vec3 black=vec3(0.2,0.18,0.15);
        vec3 c=mix(vec3(0.3,0.25,0.2),mix(black,white,checker)*board,board);
        float fadeEdge=smoothstep(0.0,0.1,uv.y)*smoothstep(0.8,0.6,uv.y);
        c*=fadeEdge+0.2;
        float reflection=mix(black.r,white.r,checker)*0.1*smoothstep(0.7,0.8,uv.y)*board;
        c+=reflection;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'camo-pattern',
    name: 'Camouflage',
    description: 'Military camouflage pattern with organic splotches in woodland green and brown tones.',
    tags: ['military', 'pattern', 'organic'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.1;
        vec2 p=uv*3.0+t;
        float n1=noise(p);
        float n2=noise(p*2.0+10.0);
        float n3=noise(p*0.5+20.0);
        vec3 dark=vec3(0.15,0.2,0.1);
        vec3 mid=vec3(0.3,0.35,0.15);
        vec3 light=vec3(0.5,0.45,0.25);
        vec3 accent=vec3(0.2,0.15,0.1);
        vec3 c=dark;
        c=mix(c,mid,smoothstep(0.3,0.5,n1));
        c=mix(c,light,smoothstep(0.5,0.7,n2));
        c=mix(c,accent,smoothstep(0.6,0.8,n3));
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'pendulum-clock',
    name: 'Pendulum',
    description: 'Grandfather clock pendulum swinging with smooth periodic motion and tick marks.',
    tags: ['clock', 'physics', 'motion'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        vec3 c=vec3(0.25,0.15,0.08);
        float woodGrain=sin(uv.y*50.0+sin(uv.x*10.0)*3.0)*0.03;
        c+=woodGrain;
        vec2 pivot=vec2(0.0,0.35);
        float angle=sin(t*2.0)*0.5;
        angle+=sin(t*2.0+u_mouse.x*3.14)*0.1;
        float rodLen=0.5;
        vec2 bobPos=pivot+vec2(sin(angle),-cos(angle))*rodLen;
        vec2 pa=uv-pivot;vec2 ba=bobPos-pivot;
        float proj=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
        float rodD=length(pa-ba*proj);
        float rod=exp(-rodD*200.0)*0.8;
        c+=rod*vec3(0.6,0.5,0.3);
        float bob=smoothstep(0.06,0.05,length(uv-bobPos));
        c=mix(c,vec3(0.7,0.6,0.2),bob);
        float glint=pow(max(dot(normalize(uv-bobPos),normalize(vec2(1,1))),0.0),20.0)*bob;
        c+=glint*0.5;
        float face=smoothstep(0.12,0.11,length(uv-vec2(0.0,0.35)));
        c=mix(c,vec3(0.9,0.88,0.82),face);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'book-pages',
    name: 'Book Pages',
    description: 'Open book with turning pages, visible text lines and paper edge shadows.',
    tags: ['book', 'paper', 'literary'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.3,0.25,0.2);
        float leftPage=step(0.1,uv.x)*step(uv.x,0.48)*step(0.15,uv.y)*step(uv.y,0.85);
        float rightPage=step(0.52,uv.x)*step(uv.x,0.9)*step(0.15,uv.y)*step(uv.y,0.85);
        float spine=smoothstep(0.48,0.5,uv.x)*smoothstep(0.52,0.5,uv.x)*step(0.15,uv.y)*step(uv.y,0.85);
        vec3 paper=vec3(0.95,0.92,0.85);
        float shadow=smoothstep(0.48,0.45,uv.x)*leftPage*0.1+smoothstep(0.52,0.55,uv.x)*rightPage*0.1;
        c=mix(c,paper-shadow,leftPage+rightPage);
        c=mix(c,vec3(0.4,0.3,0.2),spine);
        float lines=step(0.5,sin(uv.y*120.0))*(leftPage+rightPage)*0.06;
        float text=step(0.5,hash(floor(gl_FragCoord.xy/vec2(3.0,8.0))))*(leftPage+rightPage);
        text*=step(0.5,sin(uv.y*120.0));
        c-=lines;c=mix(c,c*0.6,text*0.15);
        float turnAngle=sin(t*0.8)*0.5+0.5;
        float pageX=mix(0.5,0.9,turnAngle);
        float turning=step(abs(uv.x-pageX),0.01)*step(0.15,uv.y)*step(uv.y,0.85);
        c=mix(c,paper*0.9,turning);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'wormhole',
    name: 'Wormhole',
    description: 'Spacetime wormhole tunnel with warped starfield, gravitational lensing and event horizon.',
    tags: ['space', 'sci-fi', 'tunnel'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        uv+=(u_mouse-0.5)*0.3;
        float r=length(uv);float a=atan(uv.y,uv.x);
        float tunnel=1.0/max(r,0.01);
        float twist=a+tunnel*0.3+t;
        float depth=fract(tunnel*0.5-t*0.5);
        float rings=sin(tunnel*5.0-t*3.0)*0.5+0.5;
        float grid=max(sin(twist*8.0),sin(tunnel*3.0-t*2.0));
        grid=smoothstep(0.9,1.0,grid);
        float event=smoothstep(0.1,0.05,r);
        vec3 c=vec3(0.01);
        c+=grid*exp(-r*2.0)*vec3(0.3,0.1,0.6);
        c+=rings*exp(-r*3.0)*vec3(0.1,0.3,0.8)*0.5;
        c+=event*vec3(1.0,0.8,0.5);
        float stars=step(0.995,hash(vec2(floor(twist*10.0),floor(tunnel*5.0))))*exp(-r*0.5);
        c+=stars*0.5;
        float glow=exp(-r*5.0)*0.3;
        c+=glow*vec3(0.5,0.3,0.8);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'pixel-dungeon',
    name: 'Pixel Dungeon',
    description: 'Top-down dungeon map with rooms, corridors, doors and treasure markers.',
    tags: ['game', 'dungeon', 'pixel'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        float cs=12.0;
        vec2 cell=floor(gl_FragCoord.xy/cs);
        vec2 local=mod(gl_FragCoord.xy,cs)/cs;
        float room=step(0.3,hash(floor(cell/4.0)));
        float wall=1.0-room;
        float corridor=step(abs(mod(cell.y,4.0)-2.0),0.5)+step(abs(mod(cell.x,4.0)-2.0),0.5);
        corridor=min(corridor,1.0);
        float open=max(room,corridor*0.7);
        float doorX=step(abs(mod(cell.x,4.0)-2.0),0.5)*step(abs(mod(cell.y,4.0)),0.5);
        float treasure=step(0.97,hash(cell*3.0))*open;
        vec3 wallCol=vec3(0.25,0.2,0.3);
        vec3 floorCol=vec3(0.45,0.4,0.35);
        vec3 c=mix(wallCol,floorCol,open);
        float border=step(local.x,0.08)+step(0.92,local.x)+step(local.y,0.08)+step(0.92,local.y);
        c-=border*0.05*wall;
        c=mix(c,vec3(1.0,0.8,0.2),treasure*0.5);
        float md=length(uv-u_mouse);
        float torch=exp(-md*8.0)*0.3;c+=torch*vec3(0.8,0.5,0.2)*open;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'constellation',
    name: 'Constellation',
    description: 'Star constellation map with named star patterns, connecting lines and magnitude display.',
    tags: ['space', 'stars', 'map'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=mix(vec3(0.02,0.02,0.08),vec3(0.0,0.0,0.03),uv.y);
        float twinkle=0.0;
        for(int i=0;i<30;i++){
          float fi=float(i);
          vec2 star=vec2(hash(vec2(fi,0.0)),hash(vec2(fi,1.0)));
          float mag=hash(vec2(fi,2.0));
          float size=0.002+mag*0.003;
          float d=length(uv-star);
          float bright=exp(-d/size)*mag;
          bright*=0.7+0.3*sin(t*2.0+fi*3.0);
          c+=bright*vec3(0.8+mag*0.2,0.85+mag*0.15,1.0);
        }
        for(int i=0;i<8;i++){
          float fi=float(i);
          vec2 s1=vec2(hash(vec2(fi,10.0)),hash(vec2(fi,11.0)));
          vec2 s2=vec2(hash(vec2(fi+1.0,10.0)),hash(vec2(fi+1.0,11.0)));
          vec2 pa=uv-s1;vec2 ba=s2-s1;
          float proj=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
          float d=length(pa-ba*proj);
          c+=exp(-d*500.0)*vec3(0.15,0.2,0.4);
        }
        float md=length(uv-u_mouse);c+=exp(-md*10.0)*vec3(0.2,0.3,0.5);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
];
