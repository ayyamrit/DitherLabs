import type { DitherShaderDef } from './ditherShaders';

export const shaderPack33: DitherShaderDef[] = [
  {
    id: '3d-snowstorm',
    name: '3D Snowstorm',
    description: 'Blizzard with swirling snow particles and limited visibility.',
    tags: ['3d', 'weather', 'atmospheric'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 col=vec3(0.6,0.65,0.7);
        col-=uv.y*0.1;
        for(int l=0;l<4;l++){
          float fl=float(l);
          float scale=30.0+fl*20.0;
          float speed=1.5+fl*0.5;
          float wind=sin(u_time*0.3+fl)*0.3;
          vec2 st=uv*scale+vec2(u_time*wind,u_time*speed+fl*10.0);
          vec2 g=floor(st);
          vec2 f=fract(st);
          float s=hash(g);
          float flake=smoothstep(0.15,0.05,length(f-vec2(s,hash(g+99.0))));
          float bright=0.5+fl*0.15;
          col+=flake*bright;
        }
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x+dp.y,2.0);
        col=floor(col*4.0+bayer*0.5)/4.0;
        if(uv.y<-0.3){
          float snow=hash(floor(uv*vec2(20.0,1.0)))*0.1;
          col=vec3(0.85,0.88,0.92)+snow;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-lava-river',
    name: '3D Lava River',
    description: 'Underground cavern with flowing lava river and heat distortion.',
    tags: ['3d', 'environment', 'volcanic'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float noise(vec2 p){
        vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
        return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
      }
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        float heat=noise(uv*3.0+u_time*0.1)*0.01;
        uv+=heat;
        vec3 col=vec3(0.05,0.02,0.01);
        float caveTop=noise(vec2(uv.x*3.0,0.0))*0.2+0.3;
        float caveBot=-0.15+noise(vec2(uv.x*4.0,5.0))*0.1;
        if(uv.y>caveTop||uv.y<caveBot-0.15){
          col=vec3(0.15,0.08,0.05);
          float rock=noise(uv*10.0)*0.1;
          col+=rock;
        }
        if(uv.y<caveBot&&uv.y>caveBot-0.15){
          float flow=noise(vec2(uv.x*5.0-u_time*2.0,uv.y*8.0))*0.5+0.5;
          float flow2=noise(vec2(uv.x*8.0-u_time*3.0,uv.y*4.0))*0.5+0.5;
          float lava=flow*0.6+flow2*0.4;
          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float d1=step(bayer,lava*0.5);
          float d2=step(bayer,lava*0.9);
          col=vec3(0.3,0.05,0.0);
          col=mix(col,vec3(0.9,0.3,0.0),d1);
          col=mix(col,vec3(1.0,0.7,0.1),d2);
        }
        float glow=smoothstep(0.2,0.0,abs(uv.y-caveBot+0.07));
        col+=glow*vec3(0.3,0.1,0.0);
        float stalactite=smoothstep(0.0,0.02,abs(uv.x-floor(uv.x*5.0+0.5)/5.0))*0.15;
        if(uv.y>caveTop-stalactite&&uv.y<caveTop)col=vec3(0.12,0.08,0.05);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-steampunk-airship',
    name: '3D Steampunk Airship',
    description: 'Raymarched steampunk airship floating through clouds.',
    tags: ['3d', 'steampunk', 'raymarching'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      mat2 rot(float a){float c=cos(a),s=sin(a);return mat2(c,-s,s,c);}
      float box(vec3 p,vec3 b){vec3 q=abs(p)-b;return length(max(q,0.0))+min(max(q.x,max(q.y,q.z)),0.0);}
      float sdSphere(vec3 p,float r){return length(p)-r;}
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float map(vec3 p){
        p.xz*=rot(u_time*0.1);
        float balloon=sdSphere(p*vec3(1.0,0.7,1.0),1.0);
        float gondola=box(p-vec3(0,-1.3,0),vec3(0.3,0.15,0.6));
        float d=min(balloon,gondola);
        for(int i=0;i<4;i++){
          float fi=float(i)*0.25-0.375;
          float rope=length(p.xz-vec2(0.15*(mod(float(i),2.0)*2.0-1.0),fi))-0.01;
          rope=max(rope,-(p.y+1.15));
          rope=max(rope,p.y+0.3);
          d=min(d,rope);
        }
        float prop=length(p-vec3(0,-1.3,-0.7))-0.08;
        d=min(d,prop);
        return d;
      }
      vec3 calcNormal(vec3 p){vec2 e=vec2(0.002,0.0);return normalize(vec3(map(p+e.xyy)-map(p-e.xyy),map(p+e.yxy)-map(p-e.yxy),map(p+e.yyx)-map(p-e.yyx)));}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 ro=vec3(sin(u_mouse.x*6.28)*3.5,u_mouse.y*2.0,cos(u_mouse.x*6.28)*3.5);
        vec3 ta=vec3(0,-0.3,0);
        vec3 fwd=normalize(ta-ro);vec3 right=normalize(cross(vec3(0,1,0),fwd));vec3 up=cross(fwd,right);
        vec3 rd=normalize(uv.x*right+uv.y*up+1.5*fwd);
        float t=0.0;
        for(int i=0;i<80;i++){float d=map(ro+rd*t);if(d<0.002||t>20.0)break;t+=d;}
        vec3 col=vec3(0.5,0.6,0.8);
        float cloud=noise(uv*3.0+u_time*0.1)*noise(uv*5.0-u_time*0.05);
        col+=cloud*0.2;
        if(t<20.0){
          vec3 p=ro+rd*t;vec3 n=calcNormal(p);
          vec3 l=normalize(vec3(0.5,0.8,0.3));
          float diff=max(dot(n,l),0.0);
          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x+dp.y,2.0);
          float dithered=step(bayer*0.3,diff);
          vec3 matCol=p.y>-0.5?vec3(0.6,0.5,0.3):vec3(0.4,0.25,0.15);
          col=matCol*(0.3+0.7*dithered);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-haunted-mansion',
    name: '3D Haunted Mansion',
    description: 'Spooky mansion silhouette with lightning flashes and bats.',
    tags: ['3d', 'horror', 'atmospheric'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        float lightning=pow(max(sin(u_time*15.0+sin(u_time*3.7)*5.0),0.0),20.0);
        vec3 sky=mix(vec3(0.02,0.01,0.05),vec3(0.15,0.1,0.2),lightning*0.5);
        sky+=smoothstep(0.5,0.0,length(uv-vec2(0.3,0.3)))*vec3(0.1,0.08,0.05);
        vec3 col=sky;
        float ground=step(uv.y,-0.2);
        float mansion=0.0;
        if(abs(uv.x)<0.3&&uv.y>-0.2&&uv.y<0.2)mansion=1.0;
        if(abs(uv.x)<0.15&&uv.y>0.2&&uv.y<0.4)mansion=1.0;
        if(abs(uv.x-0.25)<0.06&&uv.y>0.15&&uv.y<0.35)mansion=1.0;
        if(abs(uv.x+0.25)<0.06&&uv.y>0.1&&uv.y<0.3)mansion=1.0;
        float window=0.0;
        for(int i=0;i<3;i++){
          for(int j=0;j<2;j++){
            vec2 wp=vec2(float(i)*0.15-0.15,float(j)*0.12+0.0);
            if(length((uv-wp)*vec2(1.0,1.5))<0.025)window=1.0;
          }
        }
        float flicker=step(0.3,hash(floor(vec2(u_time*8.0,0.0))))*0.5+0.5;
        if(mansion>0.5){
          col=vec3(0.02,0.01,0.02)+lightning*vec3(0.05,0.03,0.06);
          col+=window*vec3(0.6,0.4,0.1)*flicker;
        }
        if(ground>0.5)col=vec3(0.02,0.03,0.01);
        for(int i=0;i<3;i++){
          float fi=float(i);
          float bx=sin(u_time*1.5+fi*2.0)*0.5+fi*0.2-0.3;
          float by=sin(u_time*2.0+fi*1.7)*0.1+0.35+fi*0.05;
          float wing=sin(u_time*12.0+fi*3.0)*0.01;
          float bat=smoothstep(0.02,0.01,length((uv-vec2(bx,by))*vec2(1.0,2.0+wing*5.0)));
          col=mix(col,vec3(0.0),bat);
        }
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        col=floor(col*6.0+bayer)/6.0;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-space-elevator',
    name: '3D Space Elevator',
    description: 'Looking up a massive space elevator cable stretching into orbit.',
    tags: ['3d', 'scifi', 'space'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 col=vec3(0.0);
        float horizon=smoothstep(-0.1,0.3,uv.y);
        vec3 ground=vec3(0.05,0.08,0.04);
        vec3 sky=mix(vec3(0.15,0.2,0.35),vec3(0.01,0.01,0.05),horizon);
        col=mix(ground,sky,step(0.0,uv.y));
        vec2 sg=floor(uv*80.0);
        float star=step(0.96,hash(sg))*step(0.0,uv.y);
        col+=star*0.5;
        float cable=smoothstep(0.015,0.005,abs(uv.x));
        float cablePattern=sin(uv.y*100.0-u_time*5.0)*0.5+0.5;
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float cd=step(bayer,cablePattern*0.6)*cable;
        col=mix(col,vec3(0.4,0.45,0.5),cable*0.8);
        col+=cd*vec3(0.0,0.3,0.5)*0.3;
        float climber=smoothstep(0.04,0.02,length(uv-vec2(0.0,mod(u_time*0.2,2.0)-0.5)));
        col+=climber*vec3(0.8,0.4,0.1);
        for(int i=0;i<3;i++){
          float fi=float(i);
          float lightY=mod(u_time*0.5+fi*0.7,2.0)-0.5;
          float light=smoothstep(0.01,0.005,length(uv-vec2(0.012,lightY)));
          col+=light*vec3(1.0,0.2,0.2);
        }
        float earthGlow=smoothstep(0.1,-0.05,uv.y);
        col+=earthGlow*vec3(0.1,0.15,0.25);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-neon-sign',
    name: '3D Neon Sign',
    description: 'Flickering neon sign with glow and buzzing light effects.',
    tags: ['3d', 'urban', 'neon'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(float n){return fract(sin(n)*43758.5);}
      float segment(vec2 p,vec2 a,vec2 b,float w){
        vec2 pa=p-a,ba=b-a;
        float h=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
        return length(pa-ba*h)-w;
      }
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 col=vec3(0.03,0.02,0.05);
        float wall=1.0-length(uv)*0.3;
        col*=wall;
        float sign=1e10;
        // Letter shapes - "BAR"
        // B
        sign=min(sign,segment(uv,vec2(-0.35,0.1),vec2(-0.35,-0.1),0.008));
        sign=min(sign,segment(uv,vec2(-0.35,0.1),vec2(-0.25,0.1),0.008));
        sign=min(sign,segment(uv,vec2(-0.25,0.1),vec2(-0.25,0.0),0.008));
        sign=min(sign,segment(uv,vec2(-0.35,0.0),vec2(-0.25,0.0),0.008));
        sign=min(sign,segment(uv,vec2(-0.25,0.0),vec2(-0.25,-0.1),0.008));
        sign=min(sign,segment(uv,vec2(-0.35,-0.1),vec2(-0.25,-0.1),0.008));
        // A
        sign=min(sign,segment(uv,vec2(-0.1,-0.1),vec2(-0.05,0.1),0.008));
        sign=min(sign,segment(uv,vec2(-0.05,0.1),vec2(0.0,-0.1),0.008));
        sign=min(sign,segment(uv,vec2(-0.08,0.0),vec2(-0.02,0.0),0.008));
        // R
        sign=min(sign,segment(uv,vec2(0.15,-0.1),vec2(0.15,0.1),0.008));
        sign=min(sign,segment(uv,vec2(0.15,0.1),vec2(0.25,0.1),0.008));
        sign=min(sign,segment(uv,vec2(0.25,0.1),vec2(0.25,0.02),0.008));
        sign=min(sign,segment(uv,vec2(0.15,0.0),vec2(0.25,0.0),0.008));
        sign=min(sign,segment(uv,vec2(0.2,0.0),vec2(0.27,-0.1),0.008));

        float flicker=step(0.1,hash(floor(u_time*20.0)))*0.3+0.7;
        float flicker2=step(0.05,hash(floor(u_time*30.0+5.0)))*0.2+0.8;
        float neon=smoothstep(0.015,0.0,sign)*flicker;
        float glow=smoothstep(0.12,0.0,sign)*0.4*flicker2;

        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float glowD=step(bayer,glow);

        vec3 neonCol=vec3(1.0,0.1,0.3);
        col+=neonCol*neon;
        col+=neonCol*glowD*0.3;
        col+=glow*vec3(0.3,0.0,0.1);

        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-geometric-flower',
    name: '3D Geometric Flower',
    description: 'Blooming geometric flower with layered petals and particle pollen.',
    tags: ['3d', 'organic', 'geometric'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        vec3 col=vec3(0.02,0.05,0.02);
        float bloom=clamp(sin(u_time*0.5)*0.5+0.7,0.0,1.0);
        // Petals
        for(int l=0;l<3;l++){
          float fl=float(l);
          float petals=5.0+fl*2.0;
          float pAngle=a+fl*0.3+u_time*0.1*(1.0+fl*0.5);
          float petal=cos(pAngle*petals)*0.15*(1.0+fl*0.3)*bloom+0.1+fl*0.05;
          float inPetal=smoothstep(petal+0.01,petal-0.01,r)*smoothstep(0.03+fl*0.02,0.05+fl*0.03,r);
          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float dithered=step(bayer,inPetal*(0.5+fl*0.15));
          vec3 petalCol=fl<0.5?vec3(0.9,0.3,0.4):fl<1.5?vec3(0.95,0.5,0.6):vec3(1.0,0.7,0.8);
          col=mix(col,petalCol,dithered);
        }
        // Center
        float center=smoothstep(0.06,0.03,r);
        col=mix(col,vec3(0.9,0.7,0.2),center);
        // Stem
        if(uv.y<-0.15&&abs(uv.x-sin(uv.y*2.0)*0.02)<0.01)col=vec3(0.1,0.35,0.1);
        // Pollen particles
        for(int i=0;i<6;i++){
          float fi=float(i);
          float pa=fi*1.047+u_time*0.3;
          float pr=0.08+sin(u_time+fi)*0.03;
          vec2 pp=vec2(cos(pa),sin(pa))*pr;
          float pd=length(uv-pp);
          col+=smoothstep(0.008,0.003,pd)*vec3(0.8,0.7,0.2)*0.7;
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-ocean-abyss',
    name: '3D Ocean Abyss',
    description: 'Deep ocean descent with bioluminescent creatures and pressure darkness.',
    tags: ['3d', 'underwater', 'atmospheric'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        float depth=mod(u_time*0.2,1.0);
        vec3 deepBlue=mix(vec3(0.02,0.08,0.15),vec3(0.01,0.01,0.05),depth);
        vec3 col=deepBlue;
        // Particles floating up
        for(int i=0;i<15;i++){
          float fi=float(i);
          float px=sin(fi*3.7+u_time*0.2)*0.4;
          float py=fract(fi*0.37-u_time*0.3+depth)*2.0-1.0;
          float ps=0.003+hash(vec2(fi,0.0))*0.005;
          float pd=length(uv-vec2(px,py));
          col+=smoothstep(ps+0.002,ps,pd)*vec3(0.2,0.3,0.5)*0.5;
        }
        // Bioluminescent creatures
        for(int i=0;i<5;i++){
          float fi=float(i);
          float cx=sin(u_time*0.3+fi*2.1)*0.5;
          float cy=cos(u_time*0.2+fi*1.7)*0.3;
          float pulse=sin(u_time*2.0+fi*1.3)*0.5+0.5;
          float cd=length(uv-vec2(cx,cy));
          float glow=smoothstep(0.08,0.0,cd)*pulse;
          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float dithered=step(bayer,glow*0.7);
          vec3 bioCol=fi<1.5?vec3(0.0,0.8,0.6):fi<3.0?vec3(0.2,0.3,0.9):vec3(0.7,0.2,0.5);
          col+=bioCol*dithered*0.4;
          // Body
          float body=smoothstep(0.02,0.01,cd);
          col+=body*bioCol*pulse*0.6;
          // Tentacles
          for(int t=0;t<3;t++){
            float ft=float(t);
            float ta=ft*2.094+u_time*0.5;
            vec2 tp=vec2(cx,cy)+vec2(cos(ta),sin(ta))*0.04;
            float td=length(uv-tp);
            col+=smoothstep(0.006,0.003,td)*bioCol*pulse*0.3;
          }
        }
        // Light beam from above
        float beam=smoothstep(0.15,0.0,abs(uv.x+sin(uv.y*2.0+u_time*0.3)*0.05));
        beam*=smoothstep(-0.5,0.5,uv.y)*(1.0-depth);
        col+=beam*vec3(0.1,0.15,0.2)*0.3;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-paper-fold',
    name: '3D Paper Fold',
    description: 'Origami-style paper folding animation with crisp edges and shadows.',
    tags: ['3d', 'geometric', 'origami'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 col=vec3(0.85,0.82,0.78);
        float fold=sin(u_time*0.5)*0.5+0.5;
        // Paper quad sections
        vec2 p=uv*2.0;
        float shadow=0.0;
        // Fold line
        float foldLine=sin(u_time*0.3)*0.5;
        float side=step(foldLine,p.x);
        // Simulated fold angle
        float fAngle=fold*3.14159*0.5;
        vec2 fp=p;
        if(side>0.5){
          fp.x=(p.x-foldLine)*cos(fAngle)+foldLine;
          shadow=sin(fAngle)*0.3*smoothstep(0.5,0.0,abs(p.x-foldLine));
        }
        // Paper bounds
        float paper=step(-0.5,fp.x)*step(fp.x,0.5)*step(-0.5,fp.y)*step(fp.y,0.5);
        // Grid pattern on paper
        vec2 gp=fract(fp*4.0);
        float grid=smoothstep(0.05,0.02,min(gp.x,gp.y));
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x+dp.y,2.0);
        float lightSide=side>0.5?0.7+cos(fAngle)*0.3:1.0;
        vec3 paperCol=vec3(0.95,0.93,0.9)*lightSide;
        paperCol-=shadow;
        paperCol=mix(paperCol,paperCol*0.7,grid*0.3);
        float dithered=step(bayer*0.3,lightSide*0.5);
        if(paper>0.5){
          col=paperCol;
          col=mix(col,col*0.85,1.0-dithered);
        }
        // Fold crease highlight
        float crease=smoothstep(0.02,0.0,abs(p.x-foldLine))*paper;
        col+=crease*vec3(0.1)*fold;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: '3d-solar-system',
    name: '3D Solar System',
    description: 'Miniature solar system with orbiting planets and ring details.',
    tags: ['3d', 'space', 'astronomical'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 col=vec3(0.01,0.01,0.03);
        // Stars
        vec2 sg=floor(uv*100.0);
        float star=step(0.97,fract(sin(dot(sg,vec2(12.9,78.2)))*43758.5));
        col+=star*0.3;
        // Sun
        float sunD=length(uv);
        float sun=smoothstep(0.08,0.06,sunD);
        float sunGlow=smoothstep(0.2,0.06,sunD)*0.3;
        col+=sun*vec3(1.0,0.8,0.3);
        col+=sunGlow*vec3(0.5,0.3,0.1);
        // Planets
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        for(int i=0;i<5;i++){
          float fi=float(i);
          float orbitR=0.12+fi*0.08;
          float speed=1.0/(0.5+fi*0.3);
          float angle=u_time*speed+fi*1.2;
          vec2 pPos=vec2(cos(angle),sin(angle)*0.4)*orbitR;
          // Orbit ring
          float orbit=abs(length(uv*vec2(1.0,2.5))-orbitR*2.5);
          float orbitLine=smoothstep(0.005,0.0,orbit);
          col+=orbitLine*vec3(0.1,0.1,0.15);
          float pD=length(uv-pPos);
          float pR=0.015+fi*0.005;
          float planet=smoothstep(pR+0.003,pR,pD);
          // Planet lighting
          vec2 toSun=normalize(-pPos);
          vec2 surfNorm=normalize(uv-pPos);
          float pLight=max(dot(surfNorm,toSun),0.0);
          float pDither=step(bayer,pLight);
          vec3 pCol=fi<1.0?vec3(0.6,0.4,0.3):fi<2.0?vec3(0.3,0.5,0.8):fi<3.0?vec3(0.8,0.4,0.2):fi<4.0?vec3(0.7,0.6,0.4):vec3(0.3,0.4,0.6);
          col=mix(col,pCol*(0.3+0.7*pDither),planet);
          // Saturn ring
          if(fi>2.5&&fi<3.5){
            float ringD=length((uv-pPos)*vec2(1.0,3.0));
            float ring=smoothstep(0.035,0.03,ringD)*smoothstep(0.02,0.025,ringD);
            col+=ring*vec3(0.5,0.45,0.3)*0.5;
          }
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
];
