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

export const shaderPack15: DitherShaderDef[] = [
  {
    id: 'sine-flower',
    name: 'Sine Flower',
    description: 'Mathematical flower created from overlapping sine wave petals with phase animation.',
    tags: ['math', 'flower', 'organic'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        float r=length(uv);float a=atan(uv.y,uv.x);
        float petals=5.0+floor(u_mouse.x*5.0);
        float flower=sin(a*petals+t)*0.15+0.2;
        float petal=smoothstep(flower+0.01,flower,r);
        float inner=smoothstep(0.06,0.04,r);
        vec3 petalCol=mix(vec3(0.9,0.3,0.5),vec3(1.0,0.7,0.8),r*3.0);
        vec3 centerCol=vec3(0.9,0.7,0.1);
        vec3 bg=vec3(0.05,0.15,0.05);
        vec3 c=bg;
        c=mix(c,petalCol,petal);c=mix(c,centerCol,inner);
        float stem=step(abs(uv.x),0.005)*step(uv.y,-0.2)*step(-0.5,uv.y);
        c=mix(c,vec3(0.1,0.4,0.1),stem);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'gradient-mesh',
    name: 'Gradient Mesh',
    description: 'Smooth multi-point gradient mesh with bezier-interpolated color transitions.',
    tags: ['gradient', 'design', 'smooth'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        vec3 tl=0.5+0.5*cos(t+vec3(0,2,4));
        vec3 tr=0.5+0.5*cos(t+1.0+vec3(0,2,4));
        vec3 bl=0.5+0.5*cos(t+2.0+vec3(0,2,4));
        vec3 br=0.5+0.5*cos(t+3.0+vec3(0,2,4));
        vec3 top=mix(tl,tr,uv.x);vec3 bot=mix(bl,br,uv.x);
        vec3 c=mix(bot,top,uv.y);
        float md=length(uv-u_mouse);
        vec3 spot=0.5+0.5*cos(t*2.0+vec3(1,3,5));
        c=mix(c,spot,exp(-md*5.0)*0.4);
        float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9,78.2)))*43758.5)*0.02;
        c+=grain;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'topaz-geode',
    name: 'Geode Slice',
    description: 'Cross-section of a crystal geode with concentric agate bands and druzy crystal center.',
    tags: ['crystal', 'geology', 'mineral'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time*0.2;
        float r=length(uv);float a=atan(uv.y,uv.x);
        float distort=noise(vec2(a*3.0,r*5.0+t))*0.1;
        float bands=sin((r+distort)*40.0)*0.5+0.5;
        float outerShell=smoothstep(0.38,0.36,r);
        float crystalZone=smoothstep(0.15,0.1,r);
        vec3 agate1=vec3(0.6,0.4,0.3);vec3 agate2=vec3(0.8,0.7,0.6);vec3 agate3=vec3(0.5,0.3,0.5);
        vec3 bandCol=mix(agate1,mix(agate2,agate3,bands),r*2.0);
        vec3 shell=vec3(0.4,0.35,0.3);
        float sparkle=pow(noise(uv*50.0+t),5.0)*crystalZone*2.0;
        vec3 crystalCol=vec3(0.6,0.5,0.8)+sparkle;
        vec3 c=vec3(0.2);
        c=mix(c,bandCol,outerShell);
        c=mix(c,crystalCol,crystalZone);
        c=mix(c,shell,smoothstep(0.36,0.38,r)*step(r,0.4));
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'spider-web',
    name: 'Spider Web',
    description: 'Intricate spider web with radial threads, spiral capture silk and morning dew drops.',
    tags: ['nature', 'web', 'delicate'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time*0.5;
        float r=length(uv);float a=atan(uv.y,uv.x);
        vec3 c=mix(vec3(0.1,0.15,0.2),vec3(0.05,0.05,0.1),uv.y+0.5);
        float radials=smoothstep(0.005,0.0,abs(sin(a*8.0)))*smoothstep(0.4,0.0,r);
        float spiralR=a/6.28*0.03+0.03;
        float spiral=0.0;
        for(int i=1;i<12;i++){
          float ri=float(i)*0.03;
          float wobble=sin(a*8.0+float(i))*0.005;
          spiral+=smoothstep(0.004,0.0,abs(r-ri-wobble))*step(r,0.4);
        }
        float web=(radials+spiral)*0.4;
        float wind=sin(t+a*2.0)*0.01*r;
        c+=web*vec3(0.7,0.7,0.75);
        for(int i=0;i<8;i++){
          float fi=float(i);
          float da=fi*0.785;float dr=0.05+hash(vec2(fi,0.0))*0.25;
          vec2 dewPos=vec2(cos(da),sin(da))*dr;
          float dd=length(uv-dewPos);
          float dew=smoothstep(0.008,0.005,dd);
          float highlight=pow(max(1.0-dd*200.0,0.0),3.0);
          c+=dew*vec3(0.5,0.55,0.6)+highlight*0.3;
        }
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'circuit-pulse',
    name: 'Data Pulse',
    description: 'Digital data pulses traveling through circuit pathways with node processing flashes.',
    tags: ['circuit', 'data', 'digital'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float gs=25.0;
        vec2 cell=floor(gl_FragCoord.xy/gs);
        vec2 local=mod(gl_FragCoord.xy,gs)/gs;
        float r=hash(cell);
        float pathH=step(abs(local.y-0.5),0.06);
        float pathV=step(abs(local.x-0.5),0.06);
        float path=r<0.4?pathH:r<0.7?pathV:min(pathH+pathV,1.0);
        float node=smoothstep(0.15,0.1,length(local-0.5))*step(0.8,r);
        float pulseH=exp(-pow(fract(local.x-t*2.0)*3.0-1.5,2.0)*10.0)*pathH;
        float pulseV=exp(-pow(fract(local.y-t*1.5)*3.0-1.5,2.0)*10.0)*pathV;
        float pulse=max(pulseH,pulseV);
        float nodeFlash=sin(t*5.0+cell.x+cell.y*3.0)*0.5+0.5;
        vec3 c=vec3(0.03,0.03,0.06);
        c+=path*vec3(0.05,0.1,0.15);
        c+=pulse*vec3(0.0,0.5,1.0)*0.8;
        c+=node*nodeFlash*vec3(0.0,0.8,1.0);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*vec3(0.0,0.2,0.3);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'mountain-range',
    name: 'Mountain Range',
    description: 'Layered mountain silhouettes with atmospheric perspective, fog and parallax depth.',
    tags: ['mountain', 'landscape', 'nature'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.1;
        vec3 sky=mix(vec3(0.8,0.6,0.4),vec3(0.3,0.4,0.7),uv.y);
        float sunD=length(uv-vec2(u_mouse.x,0.8));
        sky+=exp(-sunD*5.0)*vec3(1.0,0.8,0.4);
        vec3 c=sky;
        for(int i=0;i<5;i++){
          float fi=float(i);
          float depth=fi/5.0;
          float speed=0.02*(1.0-depth);
          float scale=3.0+fi*2.0;
          float height=0.2+fi*0.1;
          float mtn=height+noise(vec2((uv.x+t*speed)*scale,fi*10.0))*0.15+
                    noise(vec2((uv.x+t*speed)*scale*3.0,fi*10.0))*0.05;
          float mountain=step(uv.y,mtn);
          vec3 mtnCol=mix(vec3(0.15,0.2,0.25),vec3(0.4,0.45,0.5),depth);
          mtnCol=mix(mtnCol,sky,depth*0.5);
          c=mix(c,mtnCol,mountain);
        }
        float fog=noise(vec2(uv.x*3.0+t,uv.y*2.0))*smoothstep(0.0,0.4,uv.y)*smoothstep(0.6,0.3,uv.y)*0.2;
        c=mix(c,vec3(0.7,0.7,0.75),fog);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'candy-wrapper',
    name: 'Candy Wrapper',
    description: 'Shiny candy wrapper with crinkled metallic foil texture and holographic reflection.',
    tags: ['candy', 'metallic', 'shiny'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.5;
        float crinkle=noise(uv*15.0)*0.5+noise(uv*30.0)*0.3+noise(uv*60.0)*0.2;
        float light=dot(vec2(cos(t),sin(t)),normalize(vec2(
          noise(uv*15.0+0.01)-noise(uv*15.0-0.01),
          noise(uv*15.0+vec2(0,0.01))-noise(uv*15.0-vec2(0,0.01))
        )*10.0))*0.5+0.5;
        float holo=uv.x*3.0+uv.y*2.0+crinkle*5.0+t;
        vec3 holoCol=0.5+0.5*cos(holo+vec3(0,2,4));
        vec3 foil=mix(holoCol,vec3(0.9),light*0.5);
        foil*=0.6+crinkle*0.6;
        float md=length(uv-u_mouse);
        float spot=exp(-md*3.0)*0.3;
        foil+=spot;
        gl_FragColor=vec4(clamp(foil,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'labyrinth',
    name: 'Labyrinth',
    description: 'Classical Greek labyrinth with single winding path, concentric turns and center goal.',
    tags: ['maze', 'classical', 'pattern'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time*0.3;
        float r=length(uv);float a=atan(uv.y,uv.x);
        float path=mod(a/(6.28318)+r*5.0+t*0.1,1.0);
        float wall=smoothstep(0.45,0.48,abs(path-0.5)*2.0);
        float rings=smoothstep(0.01,0.0,abs(fract(r*5.0)-0.5)-0.45);
        float walls=max(wall,rings)*smoothstep(0.4,0.0,r);
        float center=smoothstep(0.04,0.03,r);
        vec3 wallCol=vec3(0.5,0.45,0.3);vec3 pathCol=vec3(0.85,0.8,0.7);
        vec3 c=mix(pathCol,wallCol,walls);
        c=mix(c,vec3(0.8,0.6,0.1),center);
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);
        float explorer=exp(-md*10.0)*0.3;
        c+=explorer*vec3(0.3,0.5,0.8);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'starburst-candy',
    name: 'Candy Burst',
    description: 'Colorful starburst candy pattern with radiating color segments and sugar sparkle.',
    tags: ['candy', 'color', 'fun'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        float r=length(uv);float a=atan(uv.y,uv.x)+t*0.2;
        float segments=12.0;
        float seg=floor(a/(6.28318/segments));
        float localA=fract(a/(6.28318/segments));
        float hue=seg/segments*6.28+t*0.3;
        vec3 col=0.5+0.45*cos(hue+vec3(0,2,4));
        float stripe=smoothstep(0.05,0.08,localA)*smoothstep(0.95,0.92,localA);
        col*=0.8+stripe*0.2;
        float sparkle=pow(hash(floor(gl_FragCoord.xy/3.0)+floor(t*5.0)),15.0)*0.5;
        col+=sparkle;
        float mask=smoothstep(0.35,0.33,r);
        float highlight=pow(max(1.0-r*3.0,0.0),2.0)*0.2;
        vec3 bg=vec3(0.95,0.93,0.9);
        vec3 c=mix(bg,col,mask);c+=highlight*mask;
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'magnetic-field-vis',
    name: 'Field Lines',
    description: 'Magnetic field line visualization with dipole source, iron filing pattern and flux density.',
    tags: ['physics', 'magnetic', 'field'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        vec2 pole1=vec2(-0.15,0.0);vec2 pole2=vec2(0.15,0.0);
        pole1+=(u_mouse-0.5)*0.2;
        vec2 d1=uv-pole1;vec2 d2=uv-pole2;
        float r1=length(d1);float r2=length(d2);
        float a1=atan(d1.y,d1.x);float a2=atan(d2.y,d2.x);
        float fieldAngle=a1-a2;
        float lines=sin(fieldAngle*8.0);
        float lineVis=smoothstep(0.1,0.0,abs(lines))*0.5;
        float strength=1.0/(r1*r1+0.01)+1.0/(r2*r2+0.01);
        float filings=lineVis*min(strength*0.01,1.0);
        vec3 c=vec3(0.95,0.93,0.88);
        c-=filings*0.7;
        float p1glow=exp(-r1*15.0);float p2glow=exp(-r2*15.0);
        c=mix(c,vec3(0.8,0.1,0.1),p1glow);
        c=mix(c,vec3(0.1,0.1,0.8),p2glow);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'microscope-view',
    name: 'Microscope',
    description: 'Microscope view of cells with organelles, cell membrane and staining visualization.',
    tags: ['biology', 'microscope', 'science'],
    fragmentShader: `${U}
      vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        float sc=40.0;
        vec2 st=gl_FragCoord.xy/sc;vec2 ist=floor(st);vec2 fst=fract(st);
        float md2=1.0;float sd=1.0;vec2 mId;
        for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
          vec2 nb=vec2(float(x),float(y));
          vec2 pt=hash2(ist+nb)*0.6+0.2;
          pt+=sin(t+pt*6.28)*0.05;
          float d=length(nb+pt-fst);
          if(d<md2){sd=md2;md2=d;mId=ist+nb;}else if(d<sd)sd=d;
        }
        float membrane=smoothstep(0.05,0.02,sd-md2);
        float cellBody=smoothstep(0.5,0.3,md2);
        float nucleus=smoothstep(0.15,0.1,md2);
        vec3 stain=mix(vec3(0.8,0.6,0.8),vec3(0.6,0.4,0.7),hash2(mId).x);
        vec3 nucleusCol=vec3(0.3,0.1,0.4);
        vec3 bg=vec3(0.9,0.88,0.85);
        vec3 c=bg;
        c=mix(c,stain,cellBody*0.4);
        c=mix(c,nucleusCol,nucleus*0.6);
        c=mix(c,vec3(0.2),membrane);
        float vignette=smoothstep(0.5,0.3,length(uv-0.5));
        c*=0.7+vignette*0.3;
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'rope-twist',
    name: 'Twisted Rope',
    description: 'Braided rope with twisted fiber strands, shadow depth and nautical knot texture.',
    tags: ['rope', 'texture', 'nautical'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 bg=vec3(0.3,0.25,0.2);vec3 c=bg;
        float ropeX=0.5+sin(uv.y*8.0+t)*0.05;
        float ropeW=0.06;
        float inRope=smoothstep(ropeW,ropeW-0.01,abs(uv.x-ropeX));
        float strand1=sin((uv.y+uv.x-ropeX)*50.0+t*3.0)*0.5+0.5;
        float strand2=sin((uv.y-uv.x+ropeX)*50.0-t*2.0)*0.5+0.5;
        float twist=sin(uv.y*15.0+t)*0.5+0.5;
        float fiber=mix(strand1,strand2,twist);
        vec3 ropeCol=mix(vec3(0.6,0.5,0.3),vec3(0.8,0.7,0.5),fiber);
        float shadow=smoothstep(0.0,ropeW,(uv.x-ropeX+ropeW)*0.5);
        ropeCol*=0.7+shadow*0.3;
        c=mix(c,ropeCol,inRope);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'fire-ring',
    name: 'Ring of Fire',
    description: 'Burning ring of fire with flickering flames, smoke and intense heat glow effect.',
    tags: ['fire', 'ring', 'energy'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        float r=length(uv);float a=atan(uv.y,uv.x);
        float ringR=0.25;float ringW=0.05;
        float ring=exp(-pow((r-ringR)/ringW,2.0));
        float flames=noise(vec2(a*5.0,t*3.0+r*10.0))*0.5+0.5;
        flames*=noise(vec2(a*10.0,t*5.0-r*15.0));
        float fire=ring*(0.5+flames*1.5);
        float outerGlow=exp(-pow((r-ringR)*3.0,2.0))*0.3;
        vec3 c=vec3(0.02);
        c+=fire*vec3(1.0,0.5,0.0);
        c+=pow(fire,2.0)*vec3(1.0,0.9,0.3);
        c+=outerGlow*vec3(0.5,0.1,0.0);
        float smoke=noise(vec2(a*3.0,r*5.0+t))*ring*0.2;
        c+=smoke*vec3(0.2,0.15,0.1);
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'scatter-plot',
    name: 'Scatter Plot',
    description: 'Animated data scatter plot with correlation trends, axes and statistical clustering.',
    tags: ['data', 'chart', 'science'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        vec3 c=vec3(0.98,0.97,0.95);
        float axisX=smoothstep(0.003,0.0,abs(uv.y-0.1))*step(0.1,uv.x);
        float axisY=smoothstep(0.003,0.0,abs(uv.x-0.1))*step(0.1,uv.y);
        c-=(axisX+axisY)*0.7;
        float gridX=smoothstep(0.002,0.0,abs(mod(uv.x-0.1,0.1)-0.05))*step(0.1,uv.x)*0.1;
        float gridY=smoothstep(0.002,0.0,abs(mod(uv.y-0.1,0.1)-0.05))*step(0.1,uv.y)*0.1;
        c-=gridX+gridY;
        for(int i=0;i<40;i++){
          float fi=float(i);
          float x=0.15+hash(vec2(fi,0.0))*0.7;
          float correlation=0.6+sin(t)*0.3;
          float y=0.15+x*correlation+hash(vec2(fi,1.0))*0.3-0.15;
          y=clamp(y,0.12,0.88);
          float d=length(uv-vec2(x,y));
          float dot2=smoothstep(0.01,0.006,d);
          float cluster=hash(vec2(fi,2.0));
          vec3 dotCol=cluster<0.33?vec3(0.2,0.5,0.8):cluster<0.66?vec3(0.8,0.3,0.2):vec3(0.2,0.7,0.3);
          c=mix(c,dotCol,dot2);
        }
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.03;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
];
