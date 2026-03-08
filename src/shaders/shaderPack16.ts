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

export const shaderPack16: DitherShaderDef[] = [
  {
    id: 'origami-fold',
    name: 'Origami',
    description: 'Paper origami folding with crease shadows, geometric facets and color paper.',
    tags: ['paper', 'geometric', 'craft'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        vec2 p=(uv-0.5)*2.0;
        float fold1=step(0.0,p.x+p.y+sin(t)*0.3);
        float fold2=step(0.0,p.x-p.y+cos(t*0.7)*0.3);
        float fold3=step(0.0,sin(p.x*3.0+t)*0.3+p.y);
        float section=fold1+fold2*2.0+fold3*4.0;
        float hue=section*0.8+t*0.2;
        vec3 paper=0.5+0.35*cos(hue+vec3(0,2,4));
        float crease1=exp(-abs(p.x+p.y+sin(t)*0.3)*30.0)*0.3;
        float crease2=exp(-abs(p.x-p.y+cos(t*0.7)*0.3)*30.0)*0.3;
        float shadow=fold1*0.1+fold2*0.05;
        vec3 c=paper*(1.0-shadow);
        c-=(crease1+crease2)*0.5;
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'galaxy-warp',
    name: 'Galaxy Warp',
    description: 'Warped spacetime around a black hole with gravitational lensing and accretion disk.',
    tags: ['space', 'blackhole', 'physics'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        vec2 center=(u_mouse-0.5)*0.5;
        vec2 d=uv-center;float r=length(d);float a=atan(d.y,d.x);
        float warp=0.02/max(r,0.02);
        float lensedA=a+warp*0.5;
        float disk=exp(-pow((r-0.15)*15.0,2.0));
        float diskPattern=sin(lensedA*8.0-t*3.0+r*30.0)*0.5+0.5;
        vec3 c=vec3(0.01);
        vec3 hotDisk=mix(vec3(1.0,0.6,0.2),vec3(0.3,0.5,1.0),diskPattern);
        c+=disk*hotDisk;
        float eventHorizon=smoothstep(0.04,0.03,r);
        c*=(1.0-eventHorizon);
        float jet=exp(-abs(d.x)*100.0)*step(abs(d.y),0.3)*step(0.03,r)*0.2;
        c+=jet*vec3(0.3,0.5,1.0);
        float stars=step(0.997,noise(vec2(lensedA*10.0,1.0/max(r,0.01))))*step(0.2,r);
        c+=stars*0.5;
        float glow=exp(-r*3.0)*0.15;c+=glow*vec3(0.5,0.3,0.2);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'lego-studs',
    name: 'LEGO Studs',
    description: 'Top-down view of LEGO brick studs in colorful grid with plastic shine and ABS texture.',
    tags: ['toy', 'brick', 'fun'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float studSize=20.0;
        vec2 cell=floor(gl_FragCoord.xy/studSize);
        vec2 local=mod(gl_FragCoord.xy,studSize)/studSize-0.5;
        float r=length(local);
        float stud=smoothstep(0.38,0.36,r);
        float rim=smoothstep(0.36,0.34,r)*smoothstep(0.32,0.34,r);
        float top=smoothstep(0.32,0.3,r);
        float hue=hash(cell)*6.28;
        vec3 plastic=0.5+0.35*cos(hue+vec3(0,2,4));
        float highlight=pow(max(1.0-length(local+0.1)*3.0,0.0),3.0)*0.3;
        vec3 c=plastic*0.9;
        c=mix(c,plastic*0.7,rim);
        c=mix(c,plastic*1.1+highlight,top);
        float gap=stud;
        c=mix(plastic*0.5,c,gap+0.2);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'underwater-bubble',
    name: 'Bubble Rise',
    description: 'Underwater bubbles rising with refraction, surface tension highlight and wobble physics.',
    tags: ['underwater', 'bubble', 'water'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 water=mix(vec3(0.0,0.15,0.3),vec3(0.0,0.05,0.15),uv.y);
        vec3 c=water;
        for(int i=0;i<15;i++){
          float fi=float(i);
          float x=hash(vec2(fi,0.0))*0.8+0.1;
          float speed=0.15+hash(vec2(fi,1.0))*0.1;
          float y=fract(hash(vec2(fi,2.0))+t*speed);
          float wobble=sin(t*3.0+fi*5.0)*0.01;
          float size=0.01+hash(vec2(fi,3.0))*0.02;
          vec2 bub=vec2(x+wobble,y);
          float d=length(uv-bub);
          float bubble=smoothstep(size+0.002,size,d)*smoothstep(size*0.5,size*0.7,d);
          float highlight=smoothstep(size*0.5,0.0,length(uv-bub+size*0.3));
          float rim=smoothstep(size-0.002,size,d)*smoothstep(size+0.004,size,d);
          c+=bubble*vec3(0.1,0.15,0.2);
          c+=highlight*vec3(0.5,0.6,0.7)*0.5;
          c+=rim*vec3(0.3,0.4,0.5)*0.3;
        }
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'tron-grid',
    name: 'Tron Grid',
    description: 'TRON-inspired light grid with neon blue lines, data streams and identity disk glow.',
    tags: ['tron', 'neon', 'sci-fi'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 p=uv-vec2(u_mouse.x,0.7);
        float persp=0.4/(uv.y+0.05);
        vec2 grid=vec2(p.x*persp,persp+t*0.5);
        float gridLine=min(
          smoothstep(0.02,0.0,abs(fract(grid.x*3.0)-0.5)),
          1.0)+
          smoothstep(0.02,0.0,abs(fract(grid.y*3.0)-0.5));
        gridLine=min(gridLine,1.0);
        float glow=gridLine*0.02/(abs(fract(grid.x*3.0)-0.5)+0.01)*smoothstep(0.0,0.5,1.0-uv.y);
        glow=min(glow,1.0);
        vec3 c=vec3(0.01,0.01,0.02);
        vec3 neon=vec3(0.0,0.7,1.0);
        c+=glow*neon*smoothstep(0.0,0.6,1.0-uv.y)*0.3;
        float horizon=exp(-pow((uv.y-0.7)*10.0,2.0))*0.5;
        c+=horizon*neon*0.5;
        float disk=smoothstep(0.06,0.05,length(uv-vec2(0.5,0.75)));
        float diskRing=smoothstep(0.055,0.05,length(uv-vec2(0.5,0.75)))*
                       smoothstep(0.04,0.045,length(uv-vec2(0.5,0.75)));
        c=mix(c,vec3(0.02),disk);c+=diskRing*neon;
        float pulse=sin(t*3.0)*0.5+0.5;
        c+=disk*neon*pulse*0.3;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'vintage-wallpaper',
    name: 'Damask',
    description: 'Victorian damask wallpaper with ornate repeating pattern and fabric texture overlay.',
    tags: ['vintage', 'pattern', 'decorative'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.1;
        float scale=8.0;
        vec2 p=uv*scale;
        vec2 cell=floor(p);vec2 local=fract(p)-0.5;
        float offset=mod(cell.y,2.0)*0.5;
        p.x+=offset;cell=floor(p);local=fract(p)-0.5;
        float r=length(local);float a=atan(local.y,local.x);
        float pattern=sin(a*4.0)*0.1+0.15;
        float ornament=smoothstep(pattern+0.02,pattern,r);
        float detail=sin(a*8.0+r*20.0)*0.5+0.5;
        ornament*=0.5+detail*0.5;
        vec3 bg=vec3(0.35,0.25,0.2);
        vec3 fg=vec3(0.5,0.4,0.25);
        vec3 c=mix(bg,fg,ornament);
        float fabric=sin(gl_FragCoord.x*2.0)*sin(gl_FragCoord.y*2.0)*0.02;
        c+=fabric;
        float md=length(uv-u_mouse);c+=exp(-md*3.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'bouncing-balls',
    name: 'Bouncing Balls',
    description: 'Physics simulation of bouncing balls with gravity, elasticity and collision shadows.',
    tags: ['physics', 'animation', 'fun'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.95,0.93,0.9);
        float ground=smoothstep(0.12,0.1,uv.y)*0.3;
        c-=ground*0.1;
        for(int i=0;i<8;i++){
          float fi=float(i);
          float x=0.1+fi*0.11;
          float phase=t*2.0+fi*0.8;
          float bounce=abs(sin(phase));
          float y=0.12+bounce*0.6;
          float squash=1.0+exp(-fract(phase/3.14159)*5.0)*0.3;
          vec2 ballPos=vec2(x,y);
          vec2 d=(uv-ballPos)*vec2(1.0,squash);
          float r=0.03;
          float ball=smoothstep(r+0.005,r,length(d));
          float shadow=smoothstep(r*2.0,0.0,length(uv-vec2(x,0.1)))*0.2*(1.0-bounce*0.5);
          float hue=fi*0.9;
          vec3 ballCol=0.5+0.4*cos(hue+vec3(0,2,4));
          float highlight=pow(max(1.0-length(d+r*0.3)*25.0,0.0),3.0)*0.4;
          c-=shadow;c=mix(c,ballCol+highlight,ball);
        }
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.03;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'emboss-metal',
    name: 'Embossed Metal',
    description: 'Embossed metal plate with raised pattern, directional lighting and brushed finish.',
    tags: ['metal', 'emboss', 'industrial'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        float pattern=sin(uv.x*20.0)*sin(uv.y*20.0);
        pattern+=sin((uv.x+uv.y)*15.0)*0.5;
        float dx=sin((uv.x+0.01)*20.0)*sin(uv.y*20.0)-pattern;
        float dy=sin(uv.x*20.0)*sin((uv.y+0.01)*20.0)-pattern;
        vec2 lightDir=normalize(u_mouse-0.5);
        float emboss=dx*lightDir.x*50.0+dy*lightDir.y*50.0;
        float brushed=noise(vec2(gl_FragCoord.x*0.5,gl_FragCoord.y*0.01+t))*0.05;
        vec3 metal=vec3(0.6,0.62,0.65);
        vec3 c=metal+emboss*0.15+brushed;
        float rim=smoothstep(0.02,0.0,min(min(uv.x,uv.y),min(1.0-uv.x,1.0-uv.y)));
        c=mix(c,metal*0.5,rim*0.3);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'dna-helix-3d',
    name: 'DNA Double Helix',
    description: 'Rotating 3D DNA double helix with phosphate backbone, base pairs and depth shading.',
    tags: ['biology', 'dna', '3d'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time*1.5;
        vec3 c=vec3(0.05,0.05,0.1);
        float scrollY=uv.y*15.0;
        for(int i=-15;i<15;i++){
          float fi=float(i);
          float y=(fi-fract(t*0.5)*2.0)*0.07;
          float phase=(fi+floor(t*0.5)*2.0)*0.5+t;
          float x1=sin(phase)*0.12;float z1=cos(phase);
          float x2=sin(phase+3.14159)*0.12;float z2=cos(phase+3.14159);
          float depth1=(z1+1.0)*0.5;float depth2=(z2+1.0)*0.5;
          float d1=length(uv-vec2(x1,y));
          float d2=length(uv-vec2(x2,y));
          float node1=exp(-d1*80.0)*depth1;
          float node2=exp(-d2*80.0)*depth2;
          c+=node1*vec3(0.2,0.5,1.0);
          c+=node2*vec3(0.2,0.5,1.0);
          if(mod(fi,2.0)<1.0){
            vec2 pa=uv-vec2(x1,y);vec2 ba=vec2(x2-x1,0.0);
            float proj=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
            float bd=length(pa-ba*proj);
            float bridge=exp(-bd*120.0)*min(depth1,depth2)*0.5;
            vec3 baseCol=mod(fi,4.0)<2.0?vec3(0.8,0.3,0.3):vec3(0.3,0.8,0.3);
            c+=bridge*baseCol;
          }
        }
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'peacock-mandala',
    name: 'Mandala',
    description: 'Intricate geometric mandala with layered symmetry, petal patterns and sacred geometry.',
    tags: ['mandala', 'spiritual', 'geometric'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time*0.2;
        float r=length(uv);float a=atan(uv.y,uv.x)+t;
        vec3 c=vec3(0.05,0.03,0.08);
        for(int layer=0;layer<4;layer++){
          float fl=float(layer);
          float folds=6.0+fl*2.0;
          float sa=mod(a+fl*0.3,6.28318/folds);
          sa=abs(sa-3.14159/folds);
          float lr=r*(2.0+fl);
          float petal=sin(sa*folds*2.0)*0.1+0.2-fl*0.03;
          float shape=smoothstep(petal+0.02,petal,lr)*smoothstep(fl*0.05,fl*0.05+0.1,r);
          float detail=sin(lr*30.0+sa*10.0)*0.5+0.5;
          float hue=fl*1.5+r*3.0+t;
          vec3 col=0.4+0.4*cos(hue+vec3(0,2,4));
          c+=shape*col*detail*0.4;
        }
        float center=smoothstep(0.05,0.03,r);
        c=mix(c,vec3(0.9,0.8,0.3),center);
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'circuit-brain',
    name: 'Cyber Brain',
    description: 'Cyberpunk brain outline with circuit traces, neural pathways and data flow animation.',
    tags: ['cyber', 'brain', 'sci-fi'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        float brainShape=smoothstep(0.3,0.28,length(uv*vec2(1.0,1.3)-vec2(0.0,0.02)));
        float hemisphere=smoothstep(0.003,0.0,abs(uv.x))*brainShape*0.5;
        float folds=sin(uv.y*30.0+sin(uv.x*20.0)*2.0)*0.5+0.5;
        folds*=brainShape;
        vec3 c=vec3(0.02,0.02,0.05);
        vec3 brainCol=vec3(0.1,0.15,0.25);
        c=mix(c,brainCol,brainShape);
        c-=hemisphere*0.3;
        float circuits=0.0;
        float gs=20.0;
        vec2 cell=floor((gl_FragCoord.xy)/gs);
        vec2 local=mod(gl_FragCoord.xy,gs)/gs;
        float r=hash(cell);
        if(r<0.3)circuits=step(abs(local.y-0.5),0.04);
        else if(r<0.5)circuits=step(abs(local.x-0.5),0.04);
        circuits*=brainShape;
        float pulse=sin(cell.x*0.5+cell.y*0.3-t*3.0)*0.5+0.5;
        c+=circuits*mix(vec3(0.0,0.2,0.4),vec3(0.0,0.8,1.0),pulse)*0.4;
        float neural=noise(uv*10.0+t*0.5)*brainShape*0.15;
        c+=neural*vec3(0.2,0.4,0.8);
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);
        c+=exp(-md*5.0)*vec3(0.0,0.3,0.5)*brainShape;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'northern-lake',
    name: 'Lake Reflection',
    description: 'Serene lake with mountain reflection, gentle ripples and misty morning atmosphere.',
    tags: ['lake', 'nature', 'peaceful'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        float horizon=0.5;
        vec3 sky=mix(vec3(0.7,0.75,0.85),vec3(0.4,0.5,0.7),uv.y);
        float mtn=0.5+sin(uv.x*8.0)*0.05+sin(uv.x*20.0)*0.02+noise(vec2(uv.x*5.0,0.0))*0.08;
        float mountain=step(uv.y,mtn)*step(horizon,uv.y);
        vec3 mtnCol=mix(vec3(0.2,0.25,0.3),vec3(0.35,0.4,0.45),smoothstep(horizon,mtn,uv.y));
        vec3 above=mix(sky,mtnCol,mountain);
        float reflY=horizon-(uv.y-horizon);
        float reflMtn=step(reflY,mtn)*step(horizon,reflY);
        float ripple=noise(vec2(uv.x*20.0+t,uv.y*30.0))*0.01;
        vec3 reflCol=mix(sky*0.6,mtnCol*0.6,reflMtn);
        reflCol+=ripple*3.0;
        vec3 water=mix(vec3(0.1,0.2,0.3),reflCol,0.5);
        vec3 c=uv.y>horizon?above:water;
        float mist=exp(-pow((uv.y-horizon)*5.0,2.0))*0.3;
        c=mix(c,vec3(0.8,0.82,0.85),mist);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.03;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'vinyl-grooves',
    name: 'Vinyl Grooves',
    description: 'Extreme close-up of vinyl record grooves with light diffraction and micro-texture.',
    tags: ['vinyl', 'music', 'texture'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float groove=sin(uv.y*500.0)*0.3+0.5;
        float depth=sin(uv.y*500.0+1.5708)*0.15;
        vec2 lightDir=normalize(u_mouse-uv);
        float diffraction=sin(uv.y*500.0*3.0+lightDir.x*20.0+t)*0.5+0.5;
        float highlight=pow(diffraction,4.0)*0.3;
        vec3 vinyl=vec3(0.02,0.02,0.03);
        vinyl+=groove*vec3(0.03);
        vinyl+=depth*vec3(0.02);
        float iri=sin(uv.y*500.0+lightDir.x*50.0)*0.5+0.5;
        vec3 rainbow=0.5+0.5*cos(iri*6.28+vec3(0,2,4));
        vinyl+=highlight*rainbow*0.3;
        float md=length(uv-u_mouse);
        float spot=exp(-md*5.0)*0.15;
        vinyl+=spot*vec3(0.5,0.5,0.55);
        gl_FragColor=vec4(clamp(vinyl,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'sunset-clouds',
    name: 'Sunset Clouds',
    description: 'Dramatic sunset cloudscape with volumetric clouds, golden light and color gradient sky.',
    tags: ['sky', 'clouds', 'sunset'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.15;
        vec3 skyTop=vec3(0.15,0.1,0.3);vec3 skyMid=vec3(0.8,0.3,0.2);vec3 skyBot=vec3(1.0,0.7,0.3);
        float grad=uv.y;
        vec3 sky=grad>0.6?mix(skyMid,skyTop,(grad-0.6)/0.4):mix(skyBot,skyMid,grad/0.6);
        float sunD=length(uv-vec2(u_mouse.x,0.3));
        sky+=exp(-sunD*5.0)*vec3(1.0,0.8,0.3);
        vec3 c=sky;
        float cloud=0.0;
        for(int i=0;i<3;i++){
          float fi=float(i);
          float scale=2.0+fi;
          float n=noise(vec2(uv.x*scale+t+fi*10.0,uv.y*scale*0.5+fi*5.0));
          n+=noise(vec2(uv.x*scale*2.0+t*1.5+fi*10.0,uv.y*scale+fi*5.0))*0.5;
          cloud+=smoothstep(0.5,0.8,n)*0.4/(1.0+fi);
        }
        cloud*=smoothstep(0.2,0.5,uv.y)*smoothstep(0.9,0.6,uv.y);
        vec3 cloudLit=mix(vec3(0.9,0.5,0.3),vec3(0.95,0.85,0.7),uv.y);
        vec3 cloudDark=vec3(0.3,0.15,0.2);
        c=mix(c,mix(cloudDark,cloudLit,0.5+cloud),cloud);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
];
