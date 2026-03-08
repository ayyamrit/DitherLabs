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

export const shaderPack13: DitherShaderDef[] = [
  {
    id: 'galaxy-nebula',
    name: 'Space Nebula',
    description: 'Colorful emission nebula with gas clouds, embedded stars and interstellar dust lanes.',
    tags: ['space', 'nebula', 'cosmic'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.15;
        vec2 p=uv*3.0+(u_mouse-0.5);
        float n1=noise(p+t);float n2=noise(p*2.0+n1+t*0.7);
        float n3=noise(p*4.0+n2*0.5-t*0.3);
        float nebula=n1*0.5+n2*0.3+n3*0.2;
        vec3 warm=vec3(0.7,0.2,0.3);vec3 cool=vec3(0.2,0.3,0.8);vec3 hot=vec3(0.9,0.5,0.2);
        vec3 c=vec3(0.01,0.0,0.03);
        c+=warm*smoothstep(0.3,0.7,nebula)*0.5;
        c+=cool*smoothstep(0.4,0.8,n2)*0.4;
        c+=hot*smoothstep(0.6,0.9,n3)*0.3;
        float dust=smoothstep(0.5,0.4,n1)*0.3;c*=(1.0-dust);
        float stars=step(0.997,noise(gl_FragCoord.xy*0.2))*0.8;
        c+=stars;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'typewriter',
    name: 'Typewriter',
    description: 'Vintage typewriter output with uneven character impression, ribbon ink and paper feed.',
    tags: ['retro', 'text', 'vintage'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 paper=vec3(0.92,0.88,0.8);
        float charW=6.0;float charH=10.0;
        vec2 cell=floor(gl_FragCoord.xy/vec2(charW,charH));
        vec2 local=mod(gl_FragCoord.xy,vec2(charW,charH))/vec2(charW,charH);
        float lineNum=cell.y;
        float typed=step(cell.x,floor(t*8.0)-lineNum*20.0);
        float charVal=hash(cell)*0.7+0.2;
        float impression=0.6+hash(cell*3.0)*0.4;
        float charMask=step(0.15,local.x)*step(local.x,0.85)*
                       step(0.1,local.y)*step(local.y,0.9)*
                       step(0.4,hash(cell*2.0))*typed;
        vec3 ink=vec3(0.1,0.08,0.12)*impression;
        vec3 c=paper;
        c=mix(c,ink,charMask*charVal);
        float margin=step(uv.x,0.08)*0.3;c=mix(c,vec3(0.8,0.2,0.2),margin*0.1);
        float lineFeed=smoothstep(0.003,0.0,abs(mod(uv.y,charH*2.0/u_resolution.y)-charH/u_resolution.y))*0.05;
        c-=lineFeed;
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'solar-system',
    name: 'Solar System',
    description: 'Miniature solar system with orbiting planets, size scaling and orbital mechanics.',
    tags: ['space', 'planets', 'science'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        vec3 c=vec3(0.01,0.01,0.03);
        float sun=exp(-length(uv)*15.0);
        c+=sun*vec3(1.0,0.8,0.3);
        for(int i=0;i<6;i++){
          float fi=float(i);
          float orbit=0.08+fi*0.055;
          float orbitLine=smoothstep(0.002,0.0,abs(length(uv)-orbit));
          c+=orbitLine*vec3(0.1,0.1,0.15);
          float speed=2.0/(1.0+fi*0.8);
          float angle=t*speed+fi*1.5;
          vec2 planet=vec2(cos(angle),sin(angle))*orbit;
          float pSize=0.008+fi*0.003;
          float pd=length(uv-planet);
          float pBody=smoothstep(pSize+0.002,pSize,pd);
          vec3 pCol;
          if(fi<1.0)pCol=vec3(0.6,0.6,0.6);
          else if(fi<2.0)pCol=vec3(0.9,0.6,0.3);
          else if(fi<3.0)pCol=vec3(0.2,0.5,0.8);
          else if(fi<4.0)pCol=vec3(0.8,0.3,0.1);
          else if(fi<5.0)pCol=vec3(0.8,0.7,0.5);
          else pCol=vec3(0.7,0.8,0.6);
          c=mix(c,pCol,pBody);
        }
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.03;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'stacking-blocks',
    name: 'Isometric Cubes',
    description: 'Isometric 3D cube stacking with depth shading and axonometric projection illusion.',
    tags: ['3d', 'isometric', 'geometric'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        float s=30.0;
        vec2 iso=vec2(uv.x*2.0-uv.y,uv.x*2.0+uv.y)*s;
        vec2 cell=floor(iso/2.0);
        vec2 local=fract(iso/2.0);
        float height=floor(hash(cell)*4.0+sin(t+cell.x*0.5)*1.5);
        float top=step(local.x+local.y,1.0);
        float left=step(local.x,0.5)*(1.0-top);
        float right=(1.0-step(local.x,0.5))*(1.0-top);
        float hue=hash(cell*2.0+height)*6.28+t;
        vec3 base=0.4+0.3*cos(hue+vec3(0,2,4));
        vec3 topCol=base*1.2;
        vec3 leftCol=base*0.7;
        vec3 rightCol=base*0.9;
        vec3 c=top*topCol+left*leftCol+right*rightCol;
        float edge=smoothstep(0.02,0.0,min(min(local.x,local.y),min(1.0-local.x,1.0-local.y)));
        c=mix(c,c*0.5,edge*0.3);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'digital-clock',
    name: '7-Segment',
    description: 'Seven-segment LED clock display with glowing digits, colons and display reflections.',
    tags: ['clock', 'digital', 'display'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.02,0.02,0.03);
        float seconds=mod(t,60.0);
        float minutes=mod(floor(t/60.0),60.0);
        float segW=0.06;float segH=0.015;float gap=0.065;
        for(int digit=0;digit<4;digit++){
          float fd=float(digit);
          float val=digit<2?floor(minutes/pow(10.0,1.0-fd)):floor(mod(seconds,60.0)/pow(10.0,3.0-fd));
          val=mod(val,10.0);
          float dx=0.2+fd*0.15+(fd>=2?0.03:0.0);float dy=0.5;
          vec2 p=(uv-vec2(dx,dy))*vec2(1.0,1.0);
          float seg=0.0;
          // Horizontal segments
          float topH=step(abs(p.x),segW)*step(abs(p.y-gap),segH);
          float midH=step(abs(p.x),segW)*step(abs(p.y),segH);
          float botH=step(abs(p.x),segW)*step(abs(p.y+gap),segH);
          // Vertical segments
          float tlV=step(abs(p.x+segW*0.9),segH)*step(abs(p.y-gap*0.5),gap*0.45);
          float trV=step(abs(p.x-segW*0.9),segH)*step(abs(p.y-gap*0.5),gap*0.45);
          float blV=step(abs(p.x+segW*0.9),segH)*step(abs(p.y+gap*0.5),gap*0.45);
          float brV=step(abs(p.x-segW*0.9),segH)*step(abs(p.y+gap*0.5),gap*0.45);
          // Encoding (simplified)
          if(val<0.5)seg=topH+botH+tlV+trV+blV+brV;
          else if(val<1.5)seg=trV+brV;
          else if(val<2.5)seg=topH+midH+botH+trV+blV;
          else if(val<3.5)seg=topH+midH+botH+trV+brV;
          else if(val<4.5)seg=midH+tlV+trV+brV;
          else if(val<5.5)seg=topH+midH+botH+tlV+brV;
          else if(val<6.5)seg=topH+midH+botH+tlV+blV+brV;
          else if(val<7.5)seg=topH+trV+brV;
          else if(val<8.5)seg=topH+midH+botH+tlV+trV+blV+brV;
          else seg=topH+midH+botH+tlV+trV+brV;
          c+=min(seg,1.0)*vec3(1.0,0.2,0.1);
          c+=min(seg,1.0)*vec3(0.3,0.05,0.02)*0.5;
        }
        float colon=step(length(uv-vec2(0.48,0.52)),0.01)+step(length(uv-vec2(0.48,0.48)),0.01);
        colon*=step(0.5,sin(t*3.0));
        c+=colon*vec3(1.0,0.2,0.1);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.03;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'frosted-glass',
    name: 'Frosted Glass',
    description: 'Frosted glass diffusion effect with blurred shapes, ice crystal texture and light scatter.',
    tags: ['glass', 'ice', 'texture'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        vec2 distort=vec2(noise(uv*20.0+t)-0.5,noise(uv*20.0+100.0+t)-0.5)*0.03;
        vec2 duv=uv+distort;
        float pattern=sin(duv.x*10.0+t)*sin(duv.y*8.0-t)*0.5+0.5;
        float crystal=noise(gl_FragCoord.xy*0.3)*0.1;
        vec3 behind=0.5+0.3*cos(pattern*6.28+vec3(0,2,4));
        vec3 frost=vec3(0.85,0.88,0.92);
        float frostAmount=0.4+noise(uv*5.0)*0.3;
        float clearSpot=exp(-length(uv-u_mouse)*5.0)*0.5;
        frostAmount-=clearSpot;frostAmount=clamp(frostAmount,0.0,1.0);
        vec3 c=mix(behind,frost,frostAmount);
        c+=crystal;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'crop-circles',
    name: 'Crop Circles',
    description: 'Aerial view of crop circle formations with flattened wheat patterns and geometric designs.',
    tags: ['mystery', 'aerial', 'pattern'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        vec2 p=uv*10.0;
        float field=noise(p)*0.3+noise(p*3.0)*0.15+0.5;
        vec3 wheat=mix(vec3(0.6,0.55,0.2),vec3(0.5,0.6,0.15),field);
        float rows=sin(p.y*10.0)*0.03;wheat+=rows;
        vec3 c=wheat;
        vec2 center=u_mouse;
        float d=length(uv-center);
        float circle1=smoothstep(0.12,0.11,d)*smoothstep(0.08,0.09,d);
        float circle2=smoothstep(0.08,0.07,d);
        float ring=smoothstep(0.17,0.165,d)*smoothstep(0.155,0.16,d);
        float line1=smoothstep(0.005,0.0,abs(uv.y-center.y))*step(abs(uv.x-center.x),0.15);
        float line2=smoothstep(0.005,0.0,abs(uv.x-center.x))*step(abs(uv.y-center.y),0.15);
        float flat=(circle1+circle2+ring+(line1+line2)*0.5);
        flat=min(flat,1.0);
        vec3 flatWheat=wheat*0.6+vec3(0.1,0.1,0.0);
        c=mix(c,flatWheat,flat);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'morse-code',
    name: 'Morse Code',
    description: 'Animated Morse code transmission with dots, dashes and signal light visualization.',
    tags: ['code', 'signal', 'communication'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.02,0.02,0.03);
        float numLines=8.0;
        for(int line=0;line<8;line++){
          float fl=float(line);
          float y=0.1+fl/numLines*0.8;
          float inLine=step(abs(uv.y-y),0.02);
          float pos=fract(t*0.5+fl*0.3)*4.0-1.0;
          float morseX=uv.x-pos;
          float signal=0.0;
          for(int s=0;s<8;s++){
            float fs=float(s);
            float sStart=fs*0.06;
            float isDash=step(0.5,hash(vec2(fl,fs)));
            float sLen=isDash>0.5?0.04:0.02;
            signal+=step(sStart,morseX)*step(morseX,sStart+sLen);
          }
          float bright=signal*inLine;
          float hue=fl/numLines*6.28+t;
          vec3 col=0.5+0.5*cos(hue+vec3(0,2,4));
          c+=bright*col;
          float glow=exp(-abs(uv.y-y)*50.0)*signal*0.1;
          c+=glow*col;
        }
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.03;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'ferrofluid',
    name: 'Ferrofluid',
    description: 'Magnetic ferrofluid spikes responding to cursor magnet with surface tension and reflection.',
    tags: ['magnetic', 'fluid', 'science'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 magnet=u_mouse;
        float md=length(uv-magnet);
        float spikes=0.0;
        for(int i=0;i<12;i++){
          float fi=float(i);
          float a=fi*0.524+t*0.3;
          float spikeDir=atan(uv.y-magnet.y,uv.x-magnet.x);
          float da=abs(mod(spikeDir-a+3.14159,0.524)-0.262);
          float spike=exp(-da*10.0)*exp(-md*8.0);
          spike*=0.5+noise(vec2(a*5.0,t*2.0+fi))*0.5;
          spikes+=spike;
        }
        float surface=smoothstep(0.3,0.1,md+noise(uv*10.0+t)*0.1-spikes*0.15);
        float highlight=pow(max(1.0-md*3.0,0.0),3.0)*0.5;
        vec3 fluid=vec3(0.02,0.02,0.03);
        vec3 reflection=vec3(0.3,0.35,0.4);
        vec3 bg=vec3(0.5,0.5,0.52);
        vec3 c=mix(bg,fluid,surface);
        c+=highlight*reflection*surface;
        c+=spikes*vec3(0.15,0.15,0.2)*surface;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'circuit-zen',
    name: 'Circuit Zen',
    description: 'Minimalist circuit pattern with clean traces, nodes and gentle pulse animations.',
    tags: ['circuit', 'minimal', 'tech'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float gs=40.0;
        vec2 cell=floor(gl_FragCoord.xy/gs);
        vec2 local=mod(gl_FragCoord.xy,gs)/gs;
        float r=hash(cell);
        float trace=0.0;
        if(r<0.3)trace=step(abs(local.y-0.5),0.04)*step(0.5,local.x);
        else if(r<0.5)trace=step(abs(local.x-0.5),0.04)*step(0.5,local.y);
        else if(r<0.7){trace=step(abs(local.y-0.5),0.04)+step(abs(local.x-0.5),0.04);trace=min(trace,1.0);}
        float node=smoothstep(0.12,0.08,length(local-0.5))*step(0.7,r);
        float pulse=sin(cell.x*0.3+cell.y*0.5-t*2.0)*0.5+0.5;
        vec3 bg=vec3(0.95,0.93,0.9);
        vec3 traceCol=vec3(0.2,0.3,0.4);
        vec3 activeCol=vec3(0.2,0.6,0.8);
        vec3 c=bg;
        c=mix(c,mix(traceCol,activeCol,pulse*0.5),trace);
        c=mix(c,activeCol,node*pulse);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.03;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'persian-rug',
    name: 'Persian Rug',
    description: 'Ornate Persian carpet with medallion center, intricate borders and mirrored symmetry.',
    tags: ['textile', 'ornamental', 'luxury'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        vec2 sym=abs(uv-0.5)*2.0;
        float r=length(sym);float a=atan(sym.y,sym.x);
        float medallion=sin(r*30.0+t)*sin(a*8.0)*0.5+0.5;
        float border1=sin(sym.x*40.0)*sin(sym.y*40.0)*0.5+0.5;
        float border=smoothstep(0.9,0.85,max(sym.x,sym.y));
        float innerBorder=smoothstep(0.85,0.8,max(sym.x,sym.y))*smoothstep(0.75,0.8,max(sym.x,sym.y));
        float pattern=mix(medallion,border1,border);
        vec3 red=vec3(0.7,0.1,0.05);vec3 navy=vec3(0.1,0.1,0.3);
        vec3 gold=vec3(0.8,0.6,0.2);vec3 cream=vec3(0.9,0.85,0.7);
        vec3 c=mix(red,navy,step(0.5,pattern));
        c=mix(c,gold,innerBorder*0.5);
        c=mix(c,cream,smoothstep(0.95,1.0,max(sym.x,sym.y)));
        float fringe=step(0.97,max(abs(uv.x-0.5)*2.0,abs(uv.y-0.5)*2.0))*
                     sin(gl_FragCoord.x*2.0+gl_FragCoord.y*2.0)*0.3;
        c+=fringe;
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'retro-tv-test',
    name: 'Test Card',
    description: 'Classic TV test card with color bars, circle pattern, convergence grid and station ID.',
    tags: ['tv', 'test', 'retro'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 center=vec2(0.5);float d=length(uv-center);
        vec3 c=vec3(0.0);
        if(uv.y<0.1||uv.y>0.9){
          float bar=floor(uv.x*10.0);
          c=vec3(mod(bar,2.0));
        }else{
          float circleD=length((uv-center)*vec2(u_resolution.x/u_resolution.y,1.0));
          float circle=smoothstep(0.005,0.0,abs(circleD-0.3));
          circle+=smoothstep(0.005,0.0,abs(circleD-0.2));
          float grid=smoothstep(0.003,0.0,abs(mod(uv.x,0.1)-0.05))+
                     smoothstep(0.003,0.0,abs(mod(uv.y,0.1)-0.05));
          if(uv.y>0.1&&uv.y<0.3){
            float bar=floor(uv.x*7.0);
            if(bar<1.0)c=vec3(0.75);
            else if(bar<2.0)c=vec3(0.75,0.75,0.0);
            else if(bar<3.0)c=vec3(0.0,0.75,0.75);
            else if(bar<4.0)c=vec3(0.0,0.75,0.0);
            else if(bar<5.0)c=vec3(0.75,0.0,0.75);
            else if(bar<6.0)c=vec3(0.75,0.0,0.0);
            else c=vec3(0.0,0.0,0.75);
          }else{
            c=vec3(0.15);
          }
          c+=circle*vec3(0.5);c+=grid*vec3(0.1);
        }
        float scan=0.95+0.05*sin(gl_FragCoord.y*3.0+t);c*=scan;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'topographic-brain',
    name: 'Brain Waves',
    description: 'EEG brain wave visualization with alpha, beta, theta frequency bands and topographic map.',
    tags: ['medical', 'brain', 'science'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.02,0.02,0.05);
        float channels=8.0;
        for(int ch=0;ch<8;ch++){
          float fch=float(ch);
          float y=0.1+fch/channels*0.8;
          float alpha=sin(uv.x*30.0+t*10.0+fch*2.0)*0.01;
          float beta=sin(uv.x*60.0+t*25.0+fch*3.0)*0.005;
          float theta=sin(uv.x*15.0+t*5.0+fch)*0.015;
          float wave=alpha+beta+theta+noise(vec2(uv.x*20.0+t*5.0,fch))*0.008;
          float d=abs(uv.y-y-wave);
          float line=exp(-d*200.0);
          float glow=exp(-d*40.0)*0.2;
          float hue=fch/channels;
          vec3 col=0.5+0.5*cos(hue*4.0+vec3(0,2,4));
          c+=line*col+glow*col;
        }
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.03;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'game-of-life',
    name: 'Cellular Life',
    description: 'Animated cellular automata grid with pseudo-random birth, death and evolution rules.',
    tags: ['automata', 'game', 'life'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float cs=6.0;
        vec2 cell=floor(gl_FragCoord.xy/cs);
        vec2 local=mod(gl_FragCoord.xy,cs)/cs;
        float gen=floor(t*3.0);
        float alive=step(0.5,hash(cell+gen*0.001));
        float neighbors=0.0;
        for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
          if(x==0&&y==0)continue;
          neighbors+=step(0.5,hash(cell+vec2(float(x),float(y))+gen*0.001));
        }
        float next=step(2.5,neighbors)*step(neighbors,3.5)*alive+
                   step(2.5,neighbors)*step(neighbors,3.5)*(1.0-alive);
        float cellDot=smoothstep(0.4,0.3,length(local-0.5));
        float md=length(uv-u_mouse);
        float mouseAlive=step(md,0.1);
        alive=max(alive,mouseAlive);
        vec3 bg=vec3(0.05,0.05,0.08);
        vec3 liveCol=vec3(0.2,0.8,0.4);
        vec3 dyingCol=vec3(0.6,0.3,0.1);
        vec3 c=bg;
        c=mix(c,mix(dyingCol,liveCol,next),alive*cellDot);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
];
