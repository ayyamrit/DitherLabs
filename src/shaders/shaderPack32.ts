import type { DitherShaderDef } from './ditherShaders';

export const shaderPack32: DitherShaderDef[] = [
  {
    id: '3d-aurora-borealis',
    name: '3D Aurora Borealis',
    description: 'Shimmering northern lights dancing across a starry sky.',
    tags: ['3d', 'nature', 'atmospheric'],
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

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 col=vec3(0.01,0.01,0.04);

        // Stars
        vec2 sg=floor(uv*80.0);
        float star=step(0.96,hash(sg));
        float twinkle=sin(u_time*3.0+hash(sg)*20.0)*0.5+0.5;
        col+=star*twinkle*vec3(0.6,0.7,0.9);

        // Aurora bands
        for(int i=0;i<3;i++){
          float fi=float(i);
          float y=uv.y*3.0+fi*0.5;
          float wave=noise(vec2(uv.x*2.0+u_time*0.3+fi,y+u_time*0.1));
          wave+=noise(vec2(uv.x*4.0-u_time*0.2,y*2.0))*0.5;
          float band=smoothstep(0.4,0.6,wave)*smoothstep(0.8,0.6,wave);
          band*=smoothstep(-0.2,0.1,uv.y)*smoothstep(0.6,0.3,uv.y);

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float dithered=step(bayer,band*0.8);

          vec3 auroraCol=fi<0.5?vec3(0.1,0.8,0.3):fi<1.5?vec3(0.1,0.5,0.9):vec3(0.5,0.1,0.8);
          col+=auroraCol*dithered*0.5;
        }

        // Horizon glow
        float horizon=smoothstep(0.0,-0.3,uv.y);
        col+=horizon*vec3(0.0,0.1,0.05);

        // Snowy ground
        if(uv.y<-0.2){
          float snow=noise(vec2(uv.x*10.0,0.0))*0.05;
          col=vec3(0.1,0.12,0.15)+snow;
        }

        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-kaleidoscope-tunnel',
    name: '3D Kaleidoscope Tunnel',
    description: 'Flying through a kaleidoscopic mirrored tunnel with shifting patterns.',
    tags: ['3d', 'psychedelic', 'tunnel'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);

        // Kaleidoscope fold
        float segments=6.0;
        a=mod(a,3.14159*2.0/segments);
        a=abs(a-3.14159/segments);

        // Tunnel depth
        float depth=1.0/(r+0.1)+u_time*2.0;

        // Pattern
        vec2 tp=vec2(a*3.0,depth);
        float p1=sin(tp.x*5.0+tp.y*0.5)*sin(tp.y*3.0)*0.5+0.5;
        float p2=sin(tp.x*3.0-tp.y*0.3+u_time)*0.5+0.5;

        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*7.0,8.0)/8.0;
        float d1=step(bayer,p1*0.7);
        float d2=step(bayer,p2*0.6);

        float fade=smoothstep(0.0,0.15,r)*smoothstep(1.0,0.3,r);

        vec3 col=vec3(0.01);
        vec3 c1=0.5+0.5*cos(depth*0.3+vec3(0,2,4));
        vec3 c2=0.5+0.5*cos(depth*0.3+vec3(3,5,1));
        col=mix(col,c1*0.6,d1*fade);
        col=mix(col,c2,d2*fade);

        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-waterfall',
    name: '3D Waterfall',
    description: 'Raymarched cliff face with cascading water and mist.',
    tags: ['3d', 'nature', 'raymarching'],
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
        // Cliff
        float cliff=p.z+noise(p.xy*0.5)*0.5+noise(p.xy*2.0)*0.15;
        // Ledge
        float ledge=max(abs(p.x)-0.8,abs(p.y-1.0)-0.1);
        cliff=min(cliff,ledge);
        // Pool
        float pool=max(abs(p.y+1.5)-0.1,length(p.xz)-2.0);
        return min(cliff,pool);
      }

      vec3 calcNormal(vec3 p){
        vec2 e=vec2(0.002,0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 ro=vec3(0,0,3.0);
        vec3 rd=normalize(vec3(uv+(u_mouse-0.5)*0.3,-1.5));

        float t=0.0;
        for(int i=0;i<60;i++){
          float d=map(ro+rd*t);
          if(abs(d)<0.003||t>15.0)break;
          t+=abs(d)*0.8;
        }

        vec3 col=vec3(0.3,0.5,0.7);
        if(t<15.0){
          vec3 p=ro+rd*t;
          vec3 n=calcNormal(p);
          vec3 l=normalize(vec3(0.3,0.8,0.5));
          float diff=max(dot(n,l),0.0);

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x+dp.y,2.0);
          float dithered=step(bayer*0.3,diff);

          vec3 matCol=vec3(0.3,0.25,0.2);
          col=matCol*(0.3+0.7*dithered);
        }

        // Water streams overlay
        float waterX=abs(uv.x);
        if(waterX<0.15&&uv.y<0.3&&uv.y>-0.5){
          float stream=noise(vec2(uv.x*20.0,uv.y*5.0-u_time*8.0));
          stream+=noise(vec2(uv.x*40.0,uv.y*10.0-u_time*12.0))*0.5;

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float wd=step(bayer,stream*0.4);
          col=mix(col,vec3(0.6,0.8,0.95),wd);
        }

        // Mist
        float mist=noise(vec2(uv.x*3.0+u_time*0.2,uv.y*2.0-u_time*0.5));
        mist*=smoothstep(-0.3,-0.5,uv.y)*0.3;
        col+=mist*vec3(0.5,0.6,0.7);

        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-music-visualizer',
    name: '3D Music Visualizer',
    description: 'Audio-reactive bars rising and falling in a circular arrangement.',
    tags: ['3d', 'audio', 'geometric'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(float n){return fract(sin(n)*43758.5);}

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);

        vec3 col=vec3(0.02,0.01,0.04);

        // Circular bars
        float numBars=32.0;
        float barAngle=3.14159*2.0/numBars;
        float barIdx=floor(a/barAngle+numBars*0.5);

        // Fake audio levels
        float level=0.0;
        for(int h=1;h<5;h++){
          float fh=float(h);
          level+=sin(u_time*fh*0.7+barIdx*0.5)*0.5+0.5;
        }
        level=level/4.0;

        float barR=0.15+level*0.3;
        float inBar=step(0.1,r)*step(r,barR);
        float barEdge=abs(mod(a+3.14159,barAngle)-barAngle*0.5);
        inBar*=step(0.02,barEdge);

        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float dithered=step(bayer,(r-0.1)/(barR-0.1));

        vec3 barCol=0.5+0.5*cos(barIdx*0.3+vec3(0,2,4)+u_time*0.5);
        col=mix(col,barCol*(1.0-dithered*0.5),inBar);

        // Center circle
        float center=smoothstep(0.12,0.08,r);
        float pulse=sin(u_time*4.0)*0.3+0.7;
        col+=center*vec3(0.8,0.2,0.6)*pulse;

        // Outer ring
        float ring=smoothstep(0.52,0.5,r)*smoothstep(0.48,0.5,r);
        col+=ring*vec3(0.3,0.3,0.5)*0.5;

        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-mechanical-clock',
    name: '3D Mechanical Clock',
    description: 'Raymarched clock mechanism with rotating gears and ticking hands.',
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

      float gear(vec3 p,float r,float teeth,float speed){
        p.xz*=rot(u_time*speed);
        float ring=abs(length(p.xz)-r)-0.05;
        ring=max(ring,abs(p.y)-0.05);
        // Teeth
        float a=atan(p.z,p.x);
        float t=sin(a*teeth)*0.03;
        ring-=max(t,0.0)*step(abs(length(p.xz)-r),0.08);
        // Hub
        float hub=max(length(p.xz)-0.08,abs(p.y)-0.06);
        return min(ring,hub);
      }

      float map(vec3 p){
        // Clock face
        float face=max(length(p.xz)-1.5,abs(p.y+0.1)-0.02);

        // Gears
        float g1=gear(p-vec3(0.5,0,0.3),0.4,12.0,1.0);
        float g2=gear(p-vec3(-0.3,0,-0.2),0.3,9.0,-1.33);
        float g3=gear(p-vec3(0.0,0,0.0),0.6,18.0,0.5);

        // Clock hands
        vec3 hp=p;
        float hourAngle=u_time*0.1;
        float minAngle=u_time*1.2;
        hp.xz*=rot(hourAngle);
        float hourHand=max(max(abs(hp.x)-0.03,abs(hp.z+0.3)-0.3),abs(hp.y-0.08)-0.02);
        vec3 mp=p;
        mp.xz*=rot(minAngle);
        float minHand=max(max(abs(mp.x)-0.02,abs(mp.z+0.45)-0.45),abs(mp.y-0.08)-0.015);

        float d=min(face,min(g1,min(g2,g3)));
        d=min(d,min(hourHand,minHand));
        return d;
      }

      vec3 calcNormal(vec3 p){
        vec2 e=vec2(0.002,0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 ro=vec3(sin(u_mouse.x*6.28)*2.0,1.5+u_mouse.y,cos(u_mouse.x*6.28)*2.0);
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

        vec3 col=vec3(0.05,0.04,0.03);
        if(t<15.0){
          vec3 p=ro+rd*t;
          vec3 n=calcNormal(p);
          vec3 l=normalize(vec3(0.5,1.0,0.3));
          float diff=max(dot(n,l),0.0);
          float spec=pow(max(dot(reflect(-l,n),-rd),0.0),32.0);

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float dithered=step(bayer,diff);

          col=mix(vec3(0.1,0.06,0.02),vec3(0.7,0.55,0.3),dithered);
          col+=spec*vec3(0.9,0.8,0.5)*0.5;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-fractal-tree',
    name: '3D Fractal Tree',
    description: 'Growing fractal tree with branches spreading in 2D with dithered leaves.',
    tags: ['3d', 'fractal', 'nature'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}

      float branch(vec2 uv,vec2 a,vec2 b,float w){
        vec2 pa=uv-a,ba=b-a;
        float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
        return length(pa-ba*h)-w*(1.0-h*0.5);
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        uv.y-=0.3;
        vec3 col=vec3(0.05,0.08,0.12);

        float tree=1e10;
        float growth=clamp(sin(u_time*0.3)*0.5+0.5,0.0,1.0)*0.8+0.2;

        // Trunk
        tree=min(tree,branch(uv,vec2(0,-0.5),vec2(0,0.0),0.025));

        // L1 branches
        float sway=sin(u_time*0.5)*0.05;
        tree=min(tree,branch(uv,vec2(0,0),vec2(-0.2+sway,0.2)*growth,0.015));
        tree=min(tree,branch(uv,vec2(0,0),vec2(0.2+sway,0.25)*growth,0.015));
        tree=min(tree,branch(uv,vec2(0,-0.1),vec2(-0.15+sway,0.1)*growth,0.012));

        // L2 branches
        vec2 b1=vec2(-0.2+sway,0.2)*growth;
        vec2 b2=vec2(0.2+sway,0.25)*growth;
        tree=min(tree,branch(uv,b1,b1+vec2(-0.12,0.1)*growth,0.008));
        tree=min(tree,branch(uv,b1,b1+vec2(0.05,0.12)*growth,0.008));
        tree=min(tree,branch(uv,b2,b2+vec2(0.1,0.1)*growth,0.008));
        tree=min(tree,branch(uv,b2,b2+vec2(-0.08,0.13)*growth,0.008));

        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;

        // Tree trunk
        float treeD=step(tree,0.005);
        col=mix(col,vec3(0.3,0.2,0.1),treeD);

        // Leaves (circles at branch tips)
        float leaves=0.0;
        vec2 tips[4];
        tips[0]=b1+vec2(-0.12,0.1)*growth;
        tips[1]=b1+vec2(0.05,0.12)*growth;
        tips[2]=b2+vec2(0.1,0.1)*growth;
        tips[3]=b2+vec2(-0.08,0.13)*growth;
        for(int i=0;i<4;i++){
          float d=length(uv-tips[i]);
          float leaf=smoothstep(0.08,0.03,d)*growth;
          leaves=max(leaves,leaf);
        }
        float leafDither=step(bayer,leaves*0.7);
        vec3 leafCol=mix(vec3(0.1,0.4,0.1),vec3(0.2,0.6,0.15),sin(u_time+uv.x*5.0)*0.5+0.5);
        col=mix(col,leafCol,leafDither);

        // Ground
        if(uv.y<-0.48){
          col=vec3(0.1,0.06,0.03);
        }

        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-galaxy-spiral',
    name: '3D Galaxy Spiral',
    description: 'Swirling galaxy with spiral arms, dust lanes, and star clusters.',
    tags: ['3d', 'space', 'cosmic'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        // Tilt perspective
        uv.y*=1.0+abs(uv.x)*0.3;

        float r=length(uv);
        float a=atan(uv.y,uv.x);

        // Spiral arms
        float spiral=sin(a*2.0-r*8.0+u_time*0.3);
        spiral=smoothstep(0.0,0.6,spiral);
        spiral*=smoothstep(0.6,0.1,r)*smoothstep(0.02,0.05,r);

        // Dust lanes
        float dust=sin(a*2.0-r*8.0+u_time*0.3+1.0);
        dust=smoothstep(0.3,0.5,dust)*smoothstep(0.5,0.15,r);

        // Star density follows spiral
        vec2 sg=floor(uv*120.0);
        float star=hash(sg);
        float inSpiral=spiral;
        float starThresh=0.95-inSpiral*0.15;
        star=step(starThresh,star);
        float starBright=hash(sg+100.0);

        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float armDither=step(bayer,spiral*0.6);

        vec3 col=vec3(0.01,0.005,0.02);
        // Spiral arms glow
        vec3 armCol=mix(vec3(0.3,0.1,0.4),vec3(0.1,0.3,0.6),r*2.0);
        col+=armCol*armDither*0.5;
        // Dust
        col-=dust*vec3(0.05,0.03,0.02);
        // Stars
        vec3 starCol=mix(vec3(0.9,0.8,0.5),vec3(0.5,0.7,1.0),starBright);
        col+=star*starCol*0.6;

        // Core glow
        float core=exp(-r*r*30.0);
        col+=core*vec3(1.0,0.85,0.5)*0.8;

        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-smoke-ring',
    name: '3D Smoke Ring',
    description: 'Volumetric smoke ring rising and dissipating with noise turbulence.',
    tags: ['3d', 'volumetric', 'atmospheric'],
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
      float fbm(vec2 p){
        float v=0.0,a=0.5;
        for(int i=0;i<4;i++){v+=a*noise(p);p*=2.0;a*=0.5;}
        return v;
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 col=vec3(0.02,0.02,0.04);

        // Rising smoke ring
        float ringY=mod(u_time*0.3,2.0)-0.5;
        float age=mod(u_time*0.3,2.0);
        float ringR=0.2+age*0.15;
        float ringW=0.08+age*0.06;

        vec2 ringUV=uv-vec2(0.0,ringY);
        float r=length(ringUV);
        float ringDist=abs(r-ringR);

        // Turbulence
        float turb=fbm(vec2(atan(ringUV.y,ringUV.x)*3.0,r*5.0)+u_time*vec2(0.5,0.3));

        float smoke=smoothstep(ringW,0.0,ringDist-turb*0.06);
        smoke*=smoothstep(2.0,0.0,age);

        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float d1=step(bayer,smoke*0.4);
        float d2=step(bayer,smoke*0.8);

        col=mix(col,vec3(0.15,0.12,0.1),d1);
        col=mix(col,vec3(0.4,0.35,0.3),d2);

        // Second ring offset
        float ringY2=mod(u_time*0.3+1.0,2.0)-0.5;
        float age2=mod(u_time*0.3+1.0,2.0);
        vec2 ringUV2=uv-vec2(sin(u_time*0.2)*0.1,ringY2);
        float r2=length(ringUV2);
        float ringR2=0.15+age2*0.12;
        float smoke2=smoothstep(0.06+age2*0.05,0.0,abs(r2-ringR2)-fbm(vec2(atan(ringUV2.y,ringUV2.x)*3.0,r2*5.0)+u_time*0.4)*0.05);
        smoke2*=smoothstep(2.0,0.0,age2);
        float d3=step(bayer,smoke2*0.6);
        col=mix(col,vec3(0.3,0.28,0.25),d3);

        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-pixel-rain',
    name: '3D Pixel Rain',
    description: 'Matrix-style cascading digital rain with depth layers.',
    tags: ['3d', 'digital', 'matrix'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}

      float charPattern(vec2 uv,float seed){
        vec2 g=floor(uv*5.0);
        return step(0.4,hash(g+seed));
      }

      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.01,0.02,0.01);

        for(int layer=0;layer<3;layer++){
          float fl=float(layer);
          float scale=20.0+fl*10.0;
          float speed=3.0+fl*1.5;
          float bright=1.0-fl*0.25;

          vec2 grid=vec2(floor(uv.x*scale),floor(uv.y*scale*2.0));
          float colOffset=hash(vec2(grid.x,fl));
          float drop=fract(-u_time*speed*colOffset+hash(vec2(grid.x+fl*100.0,0.0)));

          float headDist=abs(fract(uv.y-u_time*speed*colOffset+hash(vec2(grid.x+fl*100.0,0.0)))-0.0);
          float trail=smoothstep(0.5,0.0,headDist);
          float head=smoothstep(0.03,0.0,headDist);

          // Fake character change
          float charSeed=floor(u_time*8.0+grid.y*0.5);
          float ch=charPattern(fract(vec2(uv.x*scale,uv.y*scale*2.0)),charSeed+grid.x);

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float dithered=step(bayer,trail*ch*0.7);

          col+=vec3(0.0,bright*0.5,0.05)*dithered;
          col+=head*ch*vec3(0.5,1.0,0.5)*bright;
        }

        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-coral-reef',
    name: '3D Coral Reef',
    description: 'Underwater coral formations with caustic light patterns and fish.',
    tags: ['3d', 'underwater', 'nature'],
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
        // Sandy floor
        float floor=p.y+1.0+noise(p.xz*2.0)*0.2;
        // Coral mounds
        float coral=length(p-vec3(0,-0.5,0))-0.8-noise(p.xz*5.0+p.y*3.0)*0.3;
        float coral2=length(p-vec3(1.0,-0.6,-0.5))-0.5-noise(p.xz*6.0)*0.2;
        float coral3=length(p-vec3(-0.8,-0.7,0.3))-0.6-noise(p.xz*4.0+1.0)*0.25;
        return min(floor,min(coral,min(coral2,coral3)));
      }

      vec3 calcNormal(vec3 p){
        vec2 e=vec2(0.003,0.0);
        return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));
      }

      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 ro=vec3(sin(u_time*0.2)*2.0,0.5,cos(u_time*0.2)*2.0);
        vec3 ta=vec3(0,-0.3,0);
        vec3 fwd=normalize(ta-ro);
        vec3 right=normalize(cross(vec3(0,1,0),fwd));
        vec3 up=cross(fwd,right);
        vec3 rd=normalize(uv.x*right+uv.y*up+1.5*fwd);

        float t=0.0;
        for(int i=0;i<60;i++){
          float d=map(ro+rd*t);
          if(d<0.003||t>15.0)break;
          t+=d;
        }

        // Water blue background
        vec3 col=vec3(0.05,0.15,0.3)-uv.y*vec3(0.02,0.05,0.1);

        // Caustics
        float caustic=noise(uv*8.0+u_time*vec2(0.3,0.2))*noise(uv*12.0-u_time*vec2(0.2,0.3));
        col+=caustic*vec3(0.1,0.2,0.15);

        if(t<15.0){
          vec3 p=ro+rd*t;
          vec3 n=calcNormal(p);
          vec3 l=normalize(vec3(0.3,1.0,0.2));
          float diff=max(dot(n,l),0.0);

          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float dithered=step(bayer,diff);

          // Coral colors
          float colorVar=noise(p.xz*3.0);
          vec3 coralCol=colorVar>0.5?vec3(0.8,0.3,0.4):colorVar>0.3?vec3(0.9,0.5,0.2):vec3(0.3,0.6,0.4);
          if(p.y<-0.8)coralCol=vec3(0.6,0.55,0.4); // sand

          col=coralCol*(0.2+0.6*dithered);
          // Underwater fog
          float fog=1.0-exp(-t*0.15);
          col=mix(col,vec3(0.05,0.15,0.3),fog);
        }

        // Fish silhouettes
        for(int i=0;i<3;i++){
          float fi=float(i);
          vec2 fishPos=vec2(sin(u_time*0.5+fi*2.0)*0.5+fi*0.3-0.3,sin(u_time*0.3+fi)*0.1+fi*0.1-0.1);
          float fishD=length((uv-fishPos)*vec2(1.0,2.0));
          float tail=length((uv-fishPos+vec2(0.04,0.0))*vec2(0.8,1.5));
          float fish=min(smoothstep(0.03,0.02,fishD),smoothstep(0.04,0.02,tail));
          col=mix(col,vec3(0.8,0.5,0.2),fish*0.7);
        }

        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
];
