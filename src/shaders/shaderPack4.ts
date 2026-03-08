import type { DitherShaderDef } from './ditherShaders';

const U = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
`;

const HASH = `float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}`;

const NOISE_FN = `
  ${HASH}
  float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
`;

export const shaderPack4: DitherShaderDef[] = [
  {
    id: 'fractal-tree',
    name: 'Fractal Branches',
    description: 'Recursive branching tree structure growing from the bottom with wind-reactive sway.',
    tags: ['fractal', 'tree', 'nature'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 p=uv*2.0-1.0;p.y+=0.8;
        float trunk=exp(-abs(p.x)*20.0)*step(p.y,0.0)*step(-1.6,p.y);
        float branches=0.0;
        for(int i=0;i<6;i++){
          float fi=float(i);float h=fi*0.25;
          float wind=sin(t+fi)*0.05*(u_mouse.x-0.5);
          float bx=sin(fi*2.4+1.0)*0.4+wind;float by=h-0.8;
          float d=length(vec2(p.x-bx,p.y-by)*vec2(1.0,3.0));
          branches+=exp(-d*10.0)*0.5;
          bx=-sin(fi*2.4+1.0)*0.4-wind;
          d=length(vec2(p.x-bx,p.y-by)*vec2(1.0,3.0));
          branches+=exp(-d*10.0)*0.5;
        }
        float val=trunk+branches;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        val*=step(dt*0.15,val);
        vec3 bg=mix(vec3(0.6,0.75,0.9),vec3(0.3,0.5,0.7),uv.y);
        vec3 tree=vec3(0.2,0.12,0.05);
        float leaves=noise(uv*20.0+t*0.3)*step(0.1,branches);
        vec3 leafCol=mix(vec3(0.15,0.5,0.1),vec3(0.3,0.7,0.1),leaves);
        vec3 c=mix(bg,tree,clamp(val,0.0,1.0));
        c=mix(c,leafCol,step(0.15,branches)*0.8);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'sierpinski',
    name: 'Sierpinski',
    description: 'Animated Sierpinski triangle fractal with zoom and rotation around the cursor point.',
    tags: ['fractal', 'triangle', 'math'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        uv-=(u_mouse-0.5)*0.5;
        float t=u_time*0.3;float zoom=2.0+sin(t)*1.0;
        float s=sin(t*0.5),c=cos(t*0.5);uv=mat2(c,-s,s,c)*uv;
        uv*=zoom;uv+=0.5;
        float val=1.0;
        for(int i=0;i<8;i++){
          uv*=2.0;
          vec2 m=mod(uv,2.0);
          if(m.x>1.0&&m.y>1.0)val=0.0;
          uv=fract(uv)*2.0-0.5;
        }
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        val*=step(dt*0.1,val*0.5);
        vec3 col=mix(vec3(0.02,0.0,0.05),vec3(0.6,0.3,1.0),val);
        gl_FragColor=vec4(col,1.0);
      }`,
  },
  {
    id: 'neon-sign',
    name: 'Neon Buzz',
    description: 'Flickering neon tube light with gas discharge glow, buzzing flicker and wall reflection.',
    tags: ['neon', 'light', 'urban'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 center=u_mouse;
        // Neon circle
        float d=abs(length(uv-center)-0.2);
        float glow=0.008/(d+0.005);
        float flicker=0.7+0.3*sin(t*30.0)*sin(t*47.0);
        flicker*=step(0.1,hash(vec2(floor(t*5.0),0.0)));
        flicker=max(flicker,0.4);
        // Vertical line
        float d2=abs(uv.x-center.x)*step(center.y-0.15,uv.y)*step(uv.y,center.y-0.2+0.2);
        d2=min(d2,abs(uv.y-(center.y+0.2))*0.5);
        float glow2=0.005/(d2+0.005)*0.3;
        float val=(glow+glow2)*flicker;
        // Wall reflection
        float wallGlow=exp(-length(uv-center)*3.0)*0.15*flicker;
        vec3 neonColor=vec3(1.0,0.1,0.3);
        vec3 c=vec3(0.03,0.02,0.04)+wallGlow*neonColor*0.5;
        c+=val*neonColor;c=clamp(c,0.0,1.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'solar-flare',
    name: 'Solar Flare',
    description: 'Sun surface with granulation cells, solar flares and coronal mass ejection dynamics.',
    tags: ['sun', 'solar', 'space'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        float r=length(uv);float a=atan(uv.y,uv.x);float t=u_time;
        float sun=smoothstep(0.32,0.3,r);
        float granules=noise(uv*15.0+t*0.3)*sun;
        float flare=pow(max(0.0,sin(a*3.0+t)),15.0)*exp(-abs(r-0.3)*8.0);
        float corona=exp(-abs(r-0.33)*15.0)*0.5;
        float md=length(uv-(u_mouse-0.5)*0.5);
        float mouseFlare=exp(-md*8.0)*0.3;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float val=sun*0.5+granules*0.3+flare+corona+mouseFlare;
        val*=step(dt*0.1,val*0.3);
        vec3 c=vec3(0.0);
        c+=sun*vec3(1.0,0.7,0.2)*(0.7+granules*0.5);
        c+=flare*vec3(1.0,0.5,0.1)*2.0;
        c+=corona*vec3(1.0,0.4,0.1);
        c+=mouseFlare*vec3(1.0,0.8,0.3);c=clamp(c,0.0,1.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'circuit-pulse',
    name: 'Data Pulse',
    description: 'Animated data flowing through circuit traces with packet visualization and node activation.',
    tags: ['data', 'circuit', 'animation'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float cs=24.0;
        vec2 cell=floor(gl_FragCoord.xy/cs);vec2 local=mod(gl_FragCoord.xy,cs)/cs;
        float h=hash(cell);float dir=step(0.5,h);
        float trace=dir*step(abs(local.y-0.5),0.04)+(1.0-dir)*step(abs(local.x-0.5),0.04);
        float pulse=sin((dir*cell.x+(1.0-dir)*cell.y)*0.5-u_time*3.0+h*10.0)*0.5+0.5;
        float signal=trace*pulse;
        float node=step(length(local-0.5),0.08);
        float nodeActive=node*step(0.7,sin(h*50.0+u_time*2.0)*0.5+0.5);
        float md=length(uv-u_mouse);signal+=exp(-md*8.0)*trace*0.5;
        vec3 c=vec3(0.01,0.01,0.02);
        c+=signal*vec3(0.0,0.4,0.8);c+=nodeActive*vec3(0.0,0.8,1.0);
        c+=trace*vec3(0.0,0.05,0.1);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Wet watercolor paint bleeding and blending with paper texture absorption effects.',
    tags: ['paint', 'watercolor', 'artistic'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        float n1=noise(uv*4.0+t);float n2=noise(uv*8.0-t);float n3=noise(uv*16.0+n1);
        vec2 bleed=vec2(noise(uv*5.0+t)-0.5,noise(uv*5.0+100.0+t)-0.5)*0.1;
        vec2 p=uv+bleed;
        float md=length(p-u_mouse);
        float blob1=exp(-md*5.0);
        float blob2=exp(-length(p-vec2(0.3,0.7))*4.0)*0.5;
        float blob3=exp(-length(p-vec2(0.7,0.3))*4.0)*0.3;
        float paper=0.9+noise(gl_FragCoord.xy*0.3)*0.1;
        float edge1=smoothstep(0.5,0.3,md)*n2*0.3;
        vec3 c=vec3(0.95,0.93,0.88)*paper;
        c=mix(c,vec3(0.2,0.4,0.8)*paper,blob1*0.6);
        c=mix(c,vec3(0.8,0.2,0.3)*paper,blob2*0.5);
        c=mix(c,vec3(0.9,0.8,0.1)*paper,blob3*0.4);
        c=mix(c,c*0.7,edge1);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'tile-mosaic',
    name: 'Mosaic Tiles',
    description: 'Ancient Roman floor mosaic with small square tesserae in geometric repeating patterns.',
    tags: ['mosaic', 'ancient', 'tiles'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float ts=8.0;
        vec2 tile=floor(gl_FragCoord.xy/ts);vec2 local=mod(gl_FragCoord.xy,ts)/ts;
        float grout=step(local.x,0.1)+step(local.y,0.1);grout=min(grout,1.0);
        float dist=length(uv-0.5);float pattern=sin(dist*30.0+atan(uv.y-0.5,uv.x-0.5)*3.0);
        float md=length(uv-u_mouse);pattern+=sin(md*20.0-u_time*2.0)*0.3;
        float h=hash(tile);
        vec3 colors[4];
        colors[0]=vec3(0.8,0.7,0.5);colors[1]=vec3(0.6,0.2,0.15);
        colors[2]=vec3(0.2,0.25,0.4);colors[3]=vec3(0.85,0.8,0.7);
        int idx=int(mod(floor(pattern*2.0+h*4.0),4.0));
        vec3 c=colors[0];
        for(int i=0;i<4;i++){if(i==idx)c=colors[i];}
        c=mix(c,vec3(0.3,0.25,0.2),grout*0.7);
        c*=0.85+h*0.15;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'heartbeat',
    name: 'Heartbeat',
    description: 'ECG heartbeat monitor with PQRST waveform, beeping cursor and flatline danger zones.',
    tags: ['medical', 'ecg', 'monitor'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float x=fract(uv.x+t*0.15)*6.28;
        float ecg=0.0;
        float px=mod(x,6.28);
        ecg+=exp(-pow(px-1.0,2.0)*20.0)*0.1;// P wave
        ecg-=exp(-pow(px-2.0,2.0)*80.0)*0.15;// Q
        ecg+=exp(-pow(px-2.3,2.0)*100.0)*0.8;// R
        ecg-=exp(-pow(px-2.6,2.0)*60.0)*0.2;// S
        ecg+=exp(-pow(px-3.5,2.0)*10.0)*0.15;// T wave
        float ecgY=ecg+0.5;
        float d=abs(uv.y-ecgY);
        float line=exp(-d*60.0);
        float trail=exp(-d*20.0)*0.2*smoothstep(0.0,0.3,fract(uv.x+t*0.15));
        float grid=smoothstep(0.003,0.0,abs(fract(uv.x*10.0)-0.5)-0.497)*0.15;
        grid+=smoothstep(0.003,0.0,abs(fract(uv.y*10.0)-0.5)-0.497)*0.15;
        float cursor=exp(-abs(uv.x-fract(-t*0.15))*50.0);
        vec3 c=vec3(0.0,0.03,0.0)+grid*vec3(0.0,0.15,0.0);
        c+=line*vec3(0.0,1.0,0.3);c+=trail*vec3(0.0,0.5,0.15);
        c+=cursor*vec3(0.0,0.3,0.1);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'eye-iris',
    name: 'Eye Iris',
    description: 'Detailed iris pattern with radial fibers, collarette ring and pupil dilation tracking cursor distance.',
    tags: ['eye', 'organic', 'biometric'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        float r=length(uv);float a=atan(uv.y,uv.x);
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);
        float pupilSize=0.08+md*0.1;
        float pupil=smoothstep(pupilSize+0.01,pupilSize,r);
        float iris=smoothstep(0.3,0.28,r)*smoothstep(pupilSize-0.01,pupilSize+0.02,r);
        float fibers=noise(vec2(a*10.0,r*30.0))*iris;
        float collarette=exp(-pow(r-0.15,2.0)*500.0)*0.5;
        float sparkle=pow(max(0.0,noise(vec2(a*20.0,r*50.0+u_time))),5.0)*iris;
        vec3 irisColor=mix(vec3(0.2,0.4,0.15),vec3(0.5,0.35,0.1),noise(vec2(a*5.0,0.0)));
        vec3 c=vec3(0.9,0.88,0.85);
        c=mix(c,irisColor*(0.5+fibers*0.5),iris);
        c=mix(c,irisColor*1.2,collarette);
        c+=sparkle*vec3(0.8,0.9,0.7);
        c=mix(c,vec3(0.02),pupil);
        c+=exp(-pow(r-0.3,2.0)*200.0)*vec3(0.1)*0.3;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'candy-stripe',
    name: 'Candy Stripe',
    description: 'Colorful diagonal candy stripes with animated rotation and sweet pastel palette.',
    tags: ['candy', 'stripes', 'playful'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float md=length(uv-u_mouse);
        float stripe=sin((uv.x+uv.y)*30.0-t*2.0+md*10.0);
        float stripe2=sin((uv.x-uv.y)*25.0+t*1.5);
        float v1=step(0.0,stripe);float v2=step(0.0,stripe2);
        vec3 c1=vec3(1.0,0.5,0.6);vec3 c2=vec3(0.95,0.95,0.9);
        vec3 c3=vec3(0.5,0.8,1.0);vec3 c4=vec3(0.6,1.0,0.7);
        vec3 c=mix(mix(c1,c2,v1),mix(c3,c4,v1),v2);
        c*=0.85+exp(-md*5.0)*0.15;
        float shadow=sin((uv.x+uv.y)*30.0-t*2.0+md*10.0+0.5)*0.05+0.95;
        c*=shadow;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'old-film',
    name: 'Old Film',
    description: 'Vintage film projector with scratches, dust, vignette, frame jitter and sepia toning.',
    tags: ['vintage', 'film', 'retro'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        // Jitter
        float jx=hash(vec2(floor(t*18.0),0.0))*0.005;
        float jy=hash(vec2(0.0,floor(t*18.0)))*0.003;
        uv+=vec2(jx,jy);
        float md=length(uv-u_mouse);float val=sin(md*12.0-t*2.0)*0.5+0.5;
        val=mix(val,1.0-length(uv-0.5),0.3);
        // Scratches
        float scratch=0.0;for(int i=0;i<3;i++){
          float sx=hash(vec2(float(i),floor(t*2.0)))*0.8+0.1;
          scratch+=exp(-abs(uv.x-sx)*200.0)*step(0.7,hash(vec2(float(i),floor(t*4.0))));
        }
        // Dust spots
        float dust=step(0.99,hash(floor(gl_FragCoord.xy/3.0)+floor(t*3.0)))*0.3;
        // Vignette
        float vig=1.0-length(uv-0.5)*1.2;vig=pow(max(vig,0.0),1.5);
        vec3 c=vec3(val)*vig;c+=scratch*0.3;c-=dust;
        c=vec3(c.r*0.9+0.1,c.g*0.7+0.05,c.b*0.4);// sepia
        float grain=hash(gl_FragCoord.xy+t*100.0)*0.08;c+=grain;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'constellation',
    name: 'Constellation',
    description: 'Star constellation map with connected star patterns and twinkling magnitude variations.',
    tags: ['stars', 'map', 'astronomy'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.01,0.01,0.04);
        // Star grid
        float sc=50.0;
        for(int layer=0;layer<2;layer++){
          float fl=float(layer);float s=sc+fl*30.0;
          vec2 id=floor(gl_FragCoord.xy/s);vec2 gv=fract(gl_FragCoord.xy/s)-0.5;
          float h=hash(id+fl*100.0);
          if(h>0.7){
            vec2 offset=vec2(hash(id*1.1+fl)-0.5,hash(id*2.1+fl)-0.5)*0.3;
            float star=exp(-length(gv-offset)*s*0.3);
            float twinkle=sin(h*100.0+t*2.0+fl)*0.3+0.7;
            c+=star*twinkle*vec3(0.8,0.85,1.0);
            // Connection lines
            vec2 nextId=id+vec2(1.0,0.0);float nh=hash(nextId+fl*100.0);
            if(nh>0.7){
              vec2 noffset=vec2(hash(nextId*1.1+fl)-0.5,hash(nextId*2.1+fl)-0.5)*0.3;
              vec2 a2=offset,b2=noffset+vec2(1.0,0.0);
              vec2 pa=gv-a2;vec2 ba=b2-a2;
              float proj=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
              float lineDist=length(pa-ba*proj)*s;
              c+=exp(-lineDist*0.5)*0.1*vec3(0.3,0.4,0.6);
            }
          }
        }
        float md=length(uv-u_mouse);c+=exp(-md*10.0)*vec3(0.1,0.1,0.2);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'bismuth',
    name: 'Bismuth Crystal',
    description: 'Iridescent bismuth crystal formation with stepped terraces and rainbow oxidation colors.',
    tags: ['crystal', 'iridescent', 'mineral'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        vec2 p=uv*5.0+u_mouse;
        float n=noise(p+t)*0.5+noise(p*2.0-t)*0.3+noise(p*4.0)*0.2;
        float steps=floor(n*8.0)/8.0;
        float edge=fract(n*8.0);
        float stepEdge=smoothstep(0.02,0.05,edge)*smoothstep(0.98,0.95,edge);
        float hue=steps*2.0+t*0.5+noise(p*0.5)*2.0;
        vec3 c=0.5+0.5*cos(hue+vec3(0,2.09,4.19));
        c*=0.6+steps*0.5;c*=stepEdge*0.4+0.6;
        // Metallic sheen
        float md=length(uv-u_mouse);
        float spec=pow(max(0.0,1.0-md*3.0),4.0);
        c+=spec*vec3(0.3,0.3,0.35);
        c*=0.8+noise(gl_FragCoord.xy*0.2)*0.2;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'magnetic-field',
    name: 'Magnetic Field',
    description: 'Iron filing visualization of magnetic field lines between north and south poles.',
    tags: ['physics', 'magnetic', 'field'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 north=u_mouse;vec2 south=vec2(1.0-u_mouse.x,1.0-u_mouse.y);
        vec2 dn=uv-north;vec2 ds=uv-south;
        float rn=length(dn);float rs=length(ds);
        // Field direction
        vec2 field=dn/(rn*rn*rn+0.001)-ds/(rs*rs*rs+0.001);
        float angle=atan(field.y,field.x);
        float strength=length(field);
        // Iron filings
        float filing=sin(angle*20.0+sin(strength*5.0)*3.0);
        filing=smoothstep(0.0,0.3,abs(filing));
        filing*=clamp(strength*0.1,0.0,1.0);
        // Pole glow
        float poleN=0.01/(rn*rn+0.001);float poleS=0.01/(rs*rs+0.001);
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        filing*=step(dt*0.2,filing*0.3);
        vec3 c=vec3(0.02,0.02,0.04);
        c+=filing*vec3(0.5,0.5,0.55);
        c+=poleN*vec3(1.0,0.2,0.2);c+=poleS*vec3(0.2,0.4,1.0);
        c=clamp(c,0.0,1.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'honeycomb',
    name: 'Honeycomb',
    description: 'Golden honeycomb pattern with hexagonal cells filling with amber honey from the cursor.',
    tags: ['hex', 'nature', 'golden'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float sc=20.0;
        vec2 r=vec2(1.732,1.0)*sc;vec2 h=r*0.5;
        vec2 a=mod(gl_FragCoord.xy,r)-h;vec2 b=mod(gl_FragCoord.xy-h,r)-h;
        vec2 gv=dot(a,a)<dot(b,b)?a:b;
        float d=max(abs(gv.x)*0.577+abs(gv.y)*0.5,abs(gv.y));
        float wall=smoothstep(sc*0.45,sc*0.42,d);
        float cell=smoothstep(sc*0.42,sc*0.3,d);
        vec2 cellId=floor((gl_FragCoord.xy-gv)/sc);
        float md=length(uv-u_mouse);float fill=smoothstep(0.5,0.0,md);
        fill*=0.7+hash(cellId)*0.3;
        vec3 wax=vec3(0.85,0.7,0.3);vec3 honey=vec3(0.9,0.6,0.1);
        vec3 empty=vec3(0.15,0.1,0.02);
        vec3 c=mix(empty,honey,cell*fill);
        c=mix(c,wax,1.0-wall);
        c*=0.8+cell*0.2;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'glitch-wave',
    name: 'Glitch Wave',
    description: 'Corrupted signal wave with horizontal displacement, RGB channel separation and data moshing.',
    tags: ['glitch', 'wave', 'digital'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float row=floor(uv.y*40.0);
        float glitch=step(0.8,hash(vec2(row,floor(t*3.0))))*sin(t*20.0+row);
        float wave=sin(uv.y*10.0+t*3.0)*0.05;
        vec2 ruv=vec2(uv.x+glitch*0.15+wave+0.005,uv.y);
        vec2 guv=vec2(uv.x+glitch*0.15+wave,uv.y);
        vec2 buv=vec2(uv.x+glitch*0.15+wave-0.005,uv.y);
        float md=length(uv-u_mouse);
        float r=sin(length(ruv-u_mouse)*20.0-t*3.0)*0.5+0.5;
        float g=sin(length(guv-u_mouse)*20.0-t*3.0)*0.5+0.5;
        float b=sin(length(buv-u_mouse)*20.0-t*3.0)*0.5+0.5;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        r=step(dt*0.3,r)*r;g=step(dt*0.3,g)*g;b=step(dt*0.3,b)*b;
        vec3 c=vec3(r,g,b);c+=abs(glitch)*vec3(0.2,0.0,0.3);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'particle-swarm',
    name: 'Particle Swarm',
    description: 'Swirling particle system attracted to the cursor with velocity trails and density dithering.',
    tags: ['particles', 'swarm', 'dynamic'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.01,0.0,0.02);
        float totalDensity=0.0;
        for(int i=0;i<15;i++){
          float fi=float(i);
          float angle=fi*0.618*6.28+t*(0.5+fi*0.1);
          float radius=0.1+fi*0.02+sin(t+fi)*0.05;
          vec2 pos=u_mouse+vec2(cos(angle),sin(angle))*radius;
          float d=length(uv-pos);
          float particle=exp(-d*80.0);
          float trail=exp(-d*20.0)*0.15;
          totalDensity+=particle+trail;
          vec3 pColor=0.5+0.5*cos(fi*0.5+vec3(0,2,4)+t*0.3);
          c+=particle*pColor+trail*pColor*0.3;
        }
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        c*=step(dt*0.05,totalDensity*0.2);
        c=clamp(c,0.0,1.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'plaid',
    name: 'Plaid Fabric',
    description: 'Traditional Scottish tartan plaid with intersecting color bands and woven texture.',
    tags: ['textile', 'plaid', 'pattern'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        float md=length(uv-u_mouse);
        float sx=sin(gl_FragCoord.x*0.3+t)*0.5+0.5;
        float sy=sin(gl_FragCoord.y*0.3-t*0.7)*0.5+0.5;
        float check=step(0.5,fract(gl_FragCoord.x/40.0))+step(0.5,fract(gl_FragCoord.y/40.0));
        check=mod(check,2.0);
        float thinH=step(abs(fract(gl_FragCoord.y/40.0)-0.5),0.05);
        float thinV=step(abs(fract(gl_FragCoord.x/40.0)-0.5),0.05);
        vec3 c1=vec3(0.6,0.1,0.1);vec3 c2=vec3(0.1,0.3,0.15);
        vec3 c3=vec3(0.8,0.75,0.2);vec3 bg=vec3(0.15,0.1,0.08);
        vec3 c=mix(c1,c2,check);c=mix(c,c3,max(thinH,thinV));
        c*=0.85+exp(-md*5.0)*0.15;
        float weave=sin(gl_FragCoord.x*1.0)*sin(gl_FragCoord.y*1.0)*0.03;c+=weave;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
];
