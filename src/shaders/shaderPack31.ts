import type { DitherShaderDef } from './ditherShaders';

export const shaderPack31: DitherShaderDef[] = [
  {
    id: '3d-black-hole',
    name: '3D Black Hole',
    description: 'Raymarched black hole with accretion disk and gravitational lensing.',
    tags: ['3d', 'space', 'raymarching'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);

        // Gravitational lensing distortion
        float bend=0.15/(r+0.05);
        vec2 luv=uv+normalize(uv)*bend;

        // Stars background
        vec2 sg=floor(luv*60.0);
        float star=step(0.96,fract(sin(dot(sg,vec2(127.1,311.7)))*43758.5));

        // Accretion disk
        float diskR=length(luv);
        float diskA=atan(luv.y,luv.x)+u_time*0.5;
        float disk=smoothstep(0.5,0.45,diskR)*smoothstep(0.15,0.2,diskR);
        float diskPattern=sin(diskA*8.0+diskR*20.0-u_time*3.0)*0.5+0.5;
        disk*=diskPattern;

        // Doppler shift colors
        float doppler=sin(diskA)*0.5+0.5;
        vec3 hotCol=mix(vec3(1.0,0.3,0.05),vec3(0.3,0.5,1.0),doppler);

        // Dither
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float dithered=step(bayer,disk*0.8);

        // Event horizon
        float hole=smoothstep(0.12,0.1,r);

        vec3 col=vec3(0.01,0.01,0.03);
        col+=star*vec3(0.6,0.7,0.9);
        col=mix(col,hotCol,dithered);
        col*=1.0-hole;

        // Photon ring
        float ring=smoothstep(0.14,0.12,r)*smoothstep(0.1,0.12,r);
        col+=ring*vec3(1.0,0.8,0.4)*1.5;

        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-mechanical-spider',
    name: '3D Mechanical Spider',
    description: 'Raymarched mechanical spider with articulated legs walking in space.',
    tags: ['3d', 'mechanical', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}

      float sdCapsule(vec3 p,vec3 a,vec3 b,float r){
        vec3 pa=p-a,ba=b-a;
        float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
        return length(pa-ba*h)-r;
      }

      float sdSphere(vec3 p,float r){return length(p)-r;}

      float map(vec3 p){
        // Body
        float body=sdSphere(p,0.5);
        body=min(body,sdSphere(p-vec3(0.0,0.0,-0.6),0.35));
        // Head
        body=min(body,sdSphere(p-vec3(0.0,0.1,0.5),0.25));

        float legs=1e10;
        for(int i=0;i<4;i++){
          float fi=float(i);
          float side=1.0;
          for(int s=0;s<2;s++){
            if(s==1)side=-1.0;
            float phase=u_time*3.0+fi*1.5+float(s)*3.14;
            float lift=max(sin(phase),0.0)*0.3;
            vec3 hip=vec3(side*0.4,0.0,-0.2+fi*0.25);
            vec3 knee=vec3(side*1.0,0.3+lift,-0.2+fi*0.25);
            vec3 foot=vec3(side*1.2,-0.5+lift*0.2,-0.2+fi*0.25+sin(phase)*0.2);
            legs=min(legs,sdCapsule(p,hip,knee,0.05));
            legs=min(legs,sdCapsule(p,knee,foot,0.04));
          }
        }
        return min(body,legs);
      }

      vec3 calcNormal(vec3 p){
        vec2 e=vec2(0.002,0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 ro=vec3(sin(u_time*0.3)*3.0,1.5,cos(u_time*0.3)*3.0);
        vec3 ta=vec3(0.0,0.0,0.0);
        vec3 fwd=normalize(ta-ro);
        vec3 right=normalize(cross(vec3(0,1,0),fwd));
        vec3 up=cross(fwd,right);
        vec3 rd=normalize(uv.x*right+uv.y*up+1.5*fwd);

        float t=0.0;
        for(int i=0;i<80;i++){
          float d=map(ro+rd*t);
          if(d<0.002||t>20.0)break;
          t+=d;
        }

        vec3 col=vec3(0.02,0.02,0.04);
        if(t<20.0){
          vec3 p=ro+rd*t;
          vec3 n=calcNormal(p);
          vec3 l=normalize(vec3(1.0,2.0,1.0));
          float diff=max(dot(n,l),0.0);
          float spec=pow(max(dot(reflect(-l,n),-rd),0.0),32.0);

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float dithered=step(bayer,diff);

          col=mix(vec3(0.05,0.02,0.0),vec3(0.4,0.3,0.2),dithered);
          col+=spec*vec3(0.8,0.6,0.4)*0.5;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-crystal-cave',
    name: '3D Crystal Cave',
    description: 'Raymarched cave interior with glowing crystal formations.',
    tags: ['3d', 'environment', 'raymarching'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p);
        f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }

      float map(vec3 p){
        // Cave walls
        float cave=-length(p.xy)+2.0+noise(p.xz*0.5)*0.8+noise(p.xz*1.5)*0.3;
        // Stalactites
        float stal=length(p.xy-vec2(sin(p.z*2.0)*0.3,1.5))-0.1-noise(p.xz*3.0)*0.1;
        // Crystals
        vec3 cp=p;
        cp.x=mod(cp.x+0.5,1.0)-0.5;
        cp.z=mod(cp.z+0.75,1.5)-0.75;
        float crystal=length(cp.xy-vec2(0.0,-0.8))-0.15;
        crystal=max(crystal,-(cp.y+0.5));
        return min(min(cave,stal),crystal);
      }

      vec3 calcNormal(vec3 p){
        vec2 e=vec2(0.002,0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 ro=vec3(0.0,0.0,u_time*0.5);
        vec3 rd=normalize(vec3(uv+(u_mouse-0.5)*0.5,-1.0));

        float t=0.0;
        for(int i=0;i<80;i++){
          float d=map(ro+rd*t);
          if(abs(d)<0.003||t>20.0)break;
          t+=abs(d)*0.7;
        }

        vec3 col=vec3(0.0);
        if(t<20.0){
          vec3 p=ro+rd*t;
          vec3 n=calcNormal(p);
          
          // Crystal glow light
          vec3 glowPos=vec3(sin(u_time)*0.5,-.5,ro.z+2.0);
          vec3 toGlow=normalize(glowPos-p);
          float glowDist=length(glowPos-p);
          float diff=max(dot(n,toGlow),0.0)/(1.0+glowDist*glowDist*0.3);

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*7.0,8.0)/8.0;
          float d1=step(bayer,diff*0.5);
          float d2=step(bayer,diff);

          col=vec3(0.02,0.01,0.03);
          col=mix(col,vec3(0.1,0.3,0.5),d1);
          col=mix(col,vec3(0.3,0.8,1.0),d2);

          float depth=1.0-t/20.0;
          col*=depth;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-floating-castle',
    name: '3D Floating Castle',
    description: 'Raymarched castle floating on a rock island with falling particles.',
    tags: ['3d', 'fantasy', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}

      float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.0))+min(max(q.x,max(q.y,q.z)),0.0);}

      float map(vec3 p){
        // Floating rock
        float rock=length(p-vec3(0,-0.5,0))-1.5;
        rock=max(rock,p.y+0.2);
        rock=max(rock,-(p.y-0.8));

        // Tower
        vec3 tp=p-vec3(0.0,1.5,0.0);
        float tower=length(tp.xz)-0.3;
        tower=max(tower,abs(tp.y)-1.0);

        // Turret top
        vec3 tt=p-vec3(0.0,2.8,0.0);
        float turret=length(tt.xz)-0.4;
        turret=max(turret,abs(tt.y)-0.3);

        // Walls
        float walls=1e10;
        for(int i=0;i<4;i++){
          float fi=float(i)*1.5708;
          vec3 wp=p-vec3(cos(fi)*0.8,0.8,sin(fi)*0.8);
          float w=box(wp,vec3(0.15,0.5,0.15));
          walls=min(walls,w);
        }

        // Bottom spike
        vec3 sp=p-vec3(0,-1.5,0);
        float spike=max(length(sp.xz)-0.8+sp.y*0.5,-(sp.y+2.0));

        float d=min(rock,min(tower,min(turret,min(walls,spike))));
        return d;
      }

      vec3 calcNormal(vec3 p){
        vec2 e=vec2(0.002,0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        float angle=u_time*0.2+u_mouse.x*3.14;
        vec3 ro=vec3(sin(angle)*5.0,2.0+u_mouse.y*2.0,cos(angle)*5.0);
        vec3 ta=vec3(0,0.5,0);
        vec3 fwd=normalize(ta-ro);
        vec3 right=normalize(cross(vec3(0,1,0),fwd));
        vec3 up=cross(fwd,right);
        vec3 rd=normalize(uv.x*right+uv.y*up+1.5*fwd);

        float t=0.0;
        for(int i=0;i<80;i++){
          float d=map(ro+rd*t);
          if(d<0.002||t>30.0)break;
          t+=d;
        }

        vec3 col=vec3(0.4,0.5,0.7);
        // Simple clouds
        col+=smoothstep(0.0,0.3,uv.y)*vec3(0.1,0.1,0.15);

        if(t<30.0){
          vec3 p=ro+rd*t;
          vec3 n=calcNormal(p);
          vec3 l=normalize(vec3(0.5,0.8,0.3));
          float diff=max(dot(n,l),0.0);

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x+dp.y,2.0);
          float dithered=step(bayer*0.3,diff);

          vec3 matCol=p.y>2.0?vec3(0.6,0.3,0.3):p.y>0.5?vec3(0.5,0.4,0.3):vec3(0.3,0.25,0.2);
          col=matCol*(0.3+0.7*dithered);

          float fog=1.0-exp(-t*0.05);
          col=mix(col,vec3(0.4,0.5,0.7),fog);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-pendulum-wave',
    name: '3D Pendulum Wave',
    description: 'Hypnotic array of pendulums swinging at different frequencies.',
    tags: ['3d', 'physics', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float sdCapsule(vec3 p,vec3 a,vec3 b,float r){
        vec3 pa=p-a,ba=b-a;
        float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
        return length(pa-ba*h)-r;
      }
      float sdSphere(vec3 p,float r){return length(p)-r;}

      float map(vec3 p){
        float d=1e10;
        // Bar
        d=min(d,sdCapsule(p,vec3(-3.0,2.0,0),vec3(3.0,2.0,0),0.05));
        // Pendulums
        for(int i=0;i<11;i++){
          float fi=float(i);
          float x=-2.5+fi*0.5;
          float freq=1.0+fi*0.1;
          float angle=sin(u_time*freq)*0.8;
          vec3 top=vec3(x,2.0,0.0);
          vec3 bottom=top+vec3(sin(angle)*1.8,-cos(angle)*1.8,0.0);
          d=min(d,sdCapsule(p,top,bottom,0.02));
          d=min(d,sdSphere(p-bottom,0.1));
        }
        // Floor
        d=min(d,p.y+0.5);
        return d;
      }

      vec3 calcNormal(vec3 p){
        vec2 e=vec2(0.002,0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 ro=vec3(u_mouse.x*4.0-2.0,1.5+u_mouse.y*2.0,5.0);
        vec3 rd=normalize(vec3(uv,-1.5));

        float t=0.0;
        for(int i=0;i<80;i++){
          float d=map(ro+rd*t);
          if(d<0.002||t>25.0)break;
          t+=d;
        }

        vec3 col=vec3(0.05,0.05,0.08);
        if(t<25.0){
          vec3 p=ro+rd*t;
          vec3 n=calcNormal(p);
          vec3 l=normalize(vec3(0.3,1.0,0.5));
          float diff=max(dot(n,l),0.0);
          float spec=pow(max(dot(reflect(-l,n),-rd),0.0),64.0);

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float dithered=step(bayer,diff);

          col=mix(vec3(0.02,0.02,0.05),vec3(0.7,0.6,0.5),dithered);
          col+=spec*vec3(1.0,0.9,0.8)*0.4;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-lava-lamp',
    name: '3D Lava Lamp',
    description: 'Raymarched lava lamp with smooth metaball blobs rising and falling.',
    tags: ['3d', 'organic', 'raymarching'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float smin(float a,float b,float k){
        float h=clamp(0.5+0.5*(a-b)/k,0.0,1.0);
        return mix(a,b,h)-k*h*(1.0-h);
      }

      float map(vec3 p){
        // Glass container
        float glass=abs(length(p.xz)-0.8)-0.02;
        glass=max(glass,abs(p.y)-2.0);
        
        // Lava blobs
        float blobs=1e10;
        for(int i=0;i<6;i++){
          float fi=float(i);
          float speed=0.3+fi*0.1;
          float phase=fi*2.1;
          float y=sin(u_time*speed+phase)*1.5;
          float x=sin(u_time*0.2+fi*1.7)*0.3;
          float z=cos(u_time*0.15+fi*2.3)*0.3;
          float r=0.2+sin(u_time*0.5+fi)*0.08;
          blobs=smin(blobs,length(p-vec3(x,y,z))-r,0.4);
        }
        
        return min(glass,blobs);
      }

      vec3 calcNormal(vec3 p){
        vec2 e=vec2(0.002,0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 ro=vec3(sin(u_mouse.x*6.28)*2.5,u_mouse.y*2.0,cos(u_mouse.x*6.28)*2.5);
        vec3 ta=vec3(0);
        vec3 fwd=normalize(ta-ro);
        vec3 right=normalize(cross(vec3(0,1,0),fwd));
        vec3 up=cross(fwd,right);
        vec3 rd=normalize(uv.x*right+uv.y*up+1.5*fwd);

        float t=0.0;
        for(int i=0;i<80;i++){
          float d=map(ro+rd*t);
          if(d<0.002||t>15.0)break;
          t+=d;
        }

        vec3 col=vec3(0.02,0.01,0.03);
        if(t<15.0){
          vec3 p=ro+rd*t;
          vec3 n=calcNormal(p);
          vec3 l=normalize(vec3(0.0,1.0,0.5));
          float diff=max(dot(n,l),0.0);
          float fresnel=pow(1.0-max(dot(n,-rd),0.0),3.0);

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float d1=step(bayer,diff*0.5);
          float d2=step(bayer,diff);

          // Warm lava colors
          float heat=sin(p.y*2.0+u_time)*0.5+0.5;
          vec3 warm=mix(vec3(0.8,0.2,0.05),vec3(1.0,0.6,0.1),heat);
          col=mix(vec3(0.05,0.01,0.02),warm*0.5,d1);
          col=mix(col,warm,d2);
          col+=fresnel*vec3(0.3,0.1,0.05)*0.5;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-wormhole',
    name: '3D Wormhole',
    description: 'Traveling through a warped space wormhole tunnel with star field.',
    tags: ['3d', 'space', 'tunnel'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);

        // Wormhole distortion
        float warp=0.3/(r+0.1);
        float z=u_time*2.0+warp;

        // Tunnel rings
        float rings=sin(z*3.0+a*2.0)*0.5+0.5;
        rings*=smoothstep(0.0,0.15,r)*smoothstep(0.8,0.3,r);

        // Energy streams
        float streams=sin(a*6.0+z*2.0)*sin(z*5.0)*0.5+0.5;
        streams*=smoothstep(0.05,0.15,r)*smoothstep(0.6,0.2,r);

        // Stars rushing past
        vec2 sp=vec2(a*3.0,warp*2.0);
        vec2 sg=floor(sp*10.0);
        float star=step(0.92,hash(sg))*smoothstep(0.3,0.8,r);

        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float d1=step(bayer,rings*0.6);
        float d2=step(bayer,streams*0.8);

        vec3 col=vec3(0.01,0.01,0.02);
        col+=star*vec3(0.5,0.6,0.8);
        col=mix(col,vec3(0.2,0.1,0.6),d1);
        col=mix(col,vec3(0.0,0.8,1.0),d2);

        // Center glow
        float center=smoothstep(0.15,0.0,r);
        col+=center*vec3(1.0,0.9,0.7);

        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-chess-board',
    name: '3D Chess Board',
    description: 'Raymarched infinite chess board with pieces casting dithered shadows.',
    tags: ['3d', 'geometric', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}

      float sdSphere(vec3 p,float r){return length(p)-r;}
      float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.0))+min(max(q.x,max(q.y,q.z)),0.0);}

      float map(vec3 p){
        // Floor
        float floor=p.y;

        // Chess pieces as simple shapes
        float pieces=1e10;
        for(int i=0;i<4;i++){
          for(int j=0;j<4;j++){
            float fi=float(i),fj=float(j);
            vec3 pp=p-vec3(fi-1.5,0.0,fj-1.5);
            // Alternating piece types
            float piece;
            if(mod(fi+fj,2.0)<0.5){
              // Tall piece (like bishop)
              piece=max(length(pp.xz)-0.15,abs(pp.y-0.3)-0.3);
              piece=min(piece,sdSphere(pp-vec3(0,0.65,0),0.1));
            }else{
              // Short piece (like pawn)
              piece=max(length(pp.xz)-0.12,abs(pp.y-0.2)-0.2);
              piece=min(piece,sdSphere(pp-vec3(0,0.45,0),0.08));
            }
            pieces=min(pieces,piece);
          }
        }

        return min(floor,pieces);
      }

      vec3 calcNormal(vec3 p){
        vec2 e=vec2(0.002,0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        float camA=u_time*0.2+u_mouse.x*3.14;
        vec3 ro=vec3(sin(camA)*4.0,2.5+u_mouse.y*2.0,cos(camA)*4.0);
        vec3 ta=vec3(0,0.3,0);
        vec3 fwd=normalize(ta-ro);
        vec3 right=normalize(cross(vec3(0,1,0),fwd));
        vec3 up=cross(fwd,right);
        vec3 rd=normalize(uv.x*right+uv.y*up+1.5*fwd);

        float t=0.0;
        for(int i=0;i<80;i++){
          float d=map(ro+rd*t);
          if(d<0.002||t>20.0)break;
          t+=d;
        }

        vec3 col=vec3(0.15,0.12,0.1);
        if(t<20.0){
          vec3 p=ro+rd*t;
          vec3 n=calcNormal(p);
          vec3 l=normalize(vec3(0.5,1.0,0.3));
          float diff=max(dot(n,l),0.0);

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x+dp.y,2.0);
          float dithered=step(bayer*0.3,diff);

          // Checkerboard pattern on floor
          vec3 matCol;
          if(p.y<0.01){
            float check=mod(floor(p.x+10.0)+floor(p.z+10.0),2.0);
            matCol=check>0.5?vec3(0.8,0.75,0.65):vec3(0.2,0.15,0.1);
          }else{
            matCol=vec3(0.5,0.4,0.3);
          }
          col=matCol*(0.3+0.7*dithered);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-neon-grid-world',
    name: '3D Neon Grid World',
    description: 'Retro-futuristic neon grid landscape stretching to infinity.',
    tags: ['3d', 'retro', 'synthwave'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 col=vec3(0.02,0.0,0.05);

        // Sun
        float sunY=0.15;
        float sunD=length(uv-vec2(0.0,sunY));
        float sun=smoothstep(0.2,0.18,sunD);
        // Sun stripes
        float stripe=step(0.0,sin(uv.y*80.0))*step(uv.y,sunY);
        sun*=1.0-stripe*0.5;
        col+=sun*mix(vec3(1.0,0.3,0.5),vec3(1.0,0.8,0.2),smoothstep(sunY-0.2,sunY,uv.y));

        // Ground plane
        if(uv.y<0.0){
          float depth=-0.3/uv.y;
          float x=uv.x*depth;
          float z=depth+u_time*3.0;

          // Grid lines
          float gx=abs(fract(x)-0.5);
          float gz=abs(fract(z*0.5)-0.5);
          float grid=min(smoothstep(0.02,0.0,gx),1.0)+min(smoothstep(0.02,0.0,gz),1.0);

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float fade=1.0/(1.0+depth*0.1);
          float dithered=step(bayer,grid*fade);

          col=mix(col,vec3(0.0,0.8,1.0),dithered*0.8);

          // Mountains silhouette
          float mt=sin(x*0.5)*0.1+sin(x*1.3)*0.05+0.05;
          if(uv.y>-mt&&uv.y<0.0){
            col=vec3(0.05,0.0,0.1);
          }
        }

        // Stars
        vec2 sg=floor(uv*50.0);
        float star=step(0.97,fract(sin(dot(sg,vec2(12.9,78.2)))*43758.5));
        col+=star*step(0.0,uv.y)*0.5;

        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-gyroscope',
    name: '3D Gyroscope',
    description: 'Nested rotating rings forming a mesmerizing gyroscope.',
    tags: ['3d', 'mechanical', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}

      float sdTorus(vec3 p,vec2 t){
        vec2 q=vec2(length(p.xz)-t.x,p.y);
        return length(q)-t.y;
      }

      float map(vec3 p){
        // Outer ring
        vec3 p1=p;
        p1.xy*=rot(u_time);
        float r1=sdTorus(p1,vec2(1.5,0.06));

        // Middle ring
        vec3 p2=p;
        p2.xz*=rot(u_time*1.3);
        p2.xy*=rot(u_time*0.7);
        float r2=sdTorus(p2,vec2(1.2,0.06));

        // Inner ring
        vec3 p3=p;
        p3.yz*=rot(u_time*1.7);
        p3.xz*=rot(u_time*0.5);
        float r3=sdTorus(p3,vec2(0.9,0.06));

        // Core sphere
        float core=length(p)-0.2;

        return min(min(r1,r2),min(r3,core));
      }

      vec3 calcNormal(vec3 p){
        vec2 e=vec2(0.001,0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 ro=vec3(0,0,4.0);
        vec3 rd=normalize(vec3(uv,-1.5));

        float t=0.0;
        for(int i=0;i<80;i++){
          float d=map(ro+rd*t);
          if(d<0.001||t>20.0)break;
          t+=d;
        }

        vec3 col=vec3(0.02,0.02,0.04);
        if(t<20.0){
          vec3 p=ro+rd*t;
          vec3 n=calcNormal(p);
          vec3 l=normalize(vec3(u_mouse-0.5,1.0));
          float diff=max(dot(n,l),0.0);
          float spec=pow(max(dot(reflect(-l,n),-rd),0.0),64.0);
          float fresnel=pow(1.0-max(dot(n,-rd),0.0),3.0);

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*7.0,8.0)/8.0;
          float dithered=step(bayer,diff);

          // Different colors per ring distance
          float dist=length(p);
          vec3 ringCol=dist>1.3?vec3(0.0,0.7,1.0):dist>1.0?vec3(0.7,0.0,1.0):dist>0.7?vec3(1.0,0.5,0.0):vec3(1.0,0.9,0.5);

          col=mix(vec3(0.02),ringCol,dithered);
          col+=spec*vec3(1.0)*0.5;
          col+=fresnel*ringCol*0.3;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
];
