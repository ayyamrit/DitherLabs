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

export const shaderPack14: DitherShaderDef[] = [
  {
    id: 'koi-pond',
    name: 'Koi Pond',
    description: 'Japanese koi fish swimming in clear pond with ripples, lily pads and golden scales.',
    tags: ['japan', 'nature', 'water'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 water=vec3(0.1,0.25,0.3);
        float caustics=pow(noise(uv*8.0+t*0.5)*noise(uv*12.0-t*0.3),2.0)*0.4;
        water+=caustics*vec3(0.2,0.3,0.3);
        vec3 c=water;
        for(int i=0;i<3;i++){
          float fi=float(i);
          float speed=0.2+fi*0.05;
          vec2 fishPos=vec2(fract(t*speed*0.1+fi*0.33),0.3+fi*0.2+sin(t*0.5+fi)*0.1);
          float fishDir=1.0;
          vec2 d=uv-fishPos;
          d.x*=fishDir;
          float body=smoothstep(0.05,0.04,length(d*vec2(1.0,2.5)));
          float tail=smoothstep(0.04,0.03,length((d-vec2(0.05,0.0))*vec2(0.8,2.0+sin(t*5.0+fi)*0.5)));
          float fish=max(body,tail*0.8);
          vec3 fishCol=fi<1.0?vec3(0.9,0.5,0.1):fi<2.0?vec3(0.9,0.9,0.9):vec3(0.9,0.2,0.1);
          float scales=sin(d.x*100.0)*sin(d.y*100.0)*0.1;
          c=mix(c,fishCol+scales,fish);
        }
        for(int i=0;i<4;i++){
          float fi=float(i);
          vec2 lily=vec2(hash(vec2(fi,10.0)),hash(vec2(fi,11.0)));
          float ld=length(uv-lily);
          float pad=smoothstep(0.04,0.035,ld);
          float cut=step(atan(uv.y-lily.y,uv.x-lily.x)+3.14,0.3);
          c=mix(c,vec3(0.2,0.5,0.15),pad*(1.0-cut));
        }
        float md=length(uv-u_mouse);
        float ripple=sin(md*40.0-t*4.0)*exp(-md*5.0)*0.05;
        c+=ripple;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'hex-life',
    name: 'Hex Grid',
    description: 'Hexagonal grid with animated cell states, propagating waves and neighbor connections.',
    tags: ['hex', 'grid', 'automata'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 r=vec2(1.0,1.732);float s=20.0;
        vec2 a=mod(gl_FragCoord.xy/s,r)-r*0.5;
        vec2 b=mod(gl_FragCoord.xy/s-r*0.5,r)-r*0.5;
        vec2 gv=length(a)<length(b)?a:b;
        vec2 id=gl_FragCoord.xy/s-gv;
        float d=length(gv);
        float edge=smoothstep(0.45,0.42,d);
        float border=smoothstep(0.42,0.45,d)*smoothstep(0.48,0.45,d);
        float state=step(0.5,hash(floor(id)+floor(t*0.5)*0.01));
        float wave=sin(id.x*0.3+id.y*0.5-t*2.0)*0.5+0.5;
        float active=max(state,step(0.7,wave));
        float mouseD=length(uv-u_mouse);active=max(active,step(mouseD,0.15));
        vec3 bg=vec3(0.08,0.08,0.12);
        vec3 activeCol=mix(vec3(0.1,0.5,0.8),vec3(0.3,0.8,0.4),wave);
        vec3 c=bg;
        c=mix(c,activeCol*0.6,edge*active);
        c+=border*vec3(0.15,0.2,0.25);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'pouring-rain',
    name: 'Heavy Rain',
    description: 'Intense rainfall with diagonal streaks, splash impacts and accumulating puddle reflections.',
    tags: ['rain', 'weather', 'dark'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=mix(vec3(0.08,0.08,0.12),vec3(0.04,0.04,0.06),uv.y);
        for(int i=0;i<40;i++){
          float fi=float(i);
          float x=hash(vec2(fi,0.0));
          float speed=3.0+hash(vec2(fi,1.0))*2.0;
          float y=fract(hash(vec2(fi,2.0))-t*speed*0.3);
          float wind=0.1;
          vec2 start=vec2(x+wind*y,y);
          vec2 end=start+vec2(wind*0.03,-0.04);
          vec2 pa=uv-start;vec2 ba=end-start;
          float proj=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
          float d=length(pa-ba*proj);
          float drop=exp(-d*500.0)*0.3;
          c+=drop*vec3(0.4,0.45,0.5);
        }
        float puddle=smoothstep(0.1,0.05,uv.y);
        float reflection=sin(uv.x*50.0+t*3.0)*sin(uv.x*80.0-t*5.0)*0.1;
        c=mix(c,c+reflection+vec3(0.05,0.06,0.08),puddle);
        for(int i=0;i<5;i++){
          float fi=float(i);
          vec2 splash=vec2(hash(vec2(fi,5.0)),0.05);
          float age=fract(t*0.5+fi*0.2);
          float ring=abs(length(uv-splash)-age*0.03);
          c+=exp(-ring*300.0)*exp(-age*3.0)*vec3(0.3,0.35,0.4)*puddle;
        }
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.03;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'pixel-landscape',
    name: 'Pixel Landscape',
    description: 'Side-scrolling pixel art landscape with mountains, trees, clouds and parallax layers.',
    tags: ['pixel', 'landscape', 'retro'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float px=4.0;vec2 puv=floor(gl_FragCoord.xy/px)*px/u_resolution;
        vec3 sky=mix(vec3(0.4,0.6,0.95),vec3(0.7,0.85,1.0),puv.y);
        vec3 c=sky;
        float mtn1=0.4+sin((puv.x+t*0.01)*5.0)*0.1+sin((puv.x+t*0.01)*13.0)*0.03;
        float mtn2=0.3+sin((puv.x+t*0.02)*7.0)*0.08+sin((puv.x+t*0.02)*17.0)*0.02;
        if(puv.y<mtn1)c=vec3(0.3,0.35,0.5);
        if(puv.y<mtn2)c=vec3(0.2,0.25,0.4);
        float ground=0.2+sin((puv.x+t*0.03)*10.0)*0.02;
        if(puv.y<ground)c=vec3(0.3,0.5,0.2);
        if(puv.y<0.12)c=vec3(0.35,0.55,0.15);
        for(int i=0;i<5;i++){
          float fi=float(i);
          float tx=fract(hash(vec2(fi,0.0))+t*0.03);
          float tw=0.015;float th=0.08;
          float trunk=step(abs(puv.x-tx),tw*0.3)*step(ground-0.01,puv.y)*step(puv.y,ground+th*0.4);
          float canopy=step(length((puv-vec2(tx,ground+th*0.5))*vec2(1.0,2.0)),tw);
          c=mix(c,vec3(0.3,0.2,0.1),trunk);
          c=mix(c,vec3(0.15,0.4,0.1),canopy);
        }
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.03;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'music-staff',
    name: 'Music Staff',
    description: 'Musical staff with scrolling notes, treble clef and rhythmic beat visualization.',
    tags: ['music', 'notes', 'staff'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 paper=vec3(0.95,0.93,0.88);vec3 c=paper;
        float staffSpacing=0.04;float staffY=0.5;
        for(int i=-2;i<=2;i++){
          float line=smoothstep(0.002,0.0,abs(uv.y-staffY-float(i)*staffSpacing));
          c-=line*0.6;
        }
        for(int i=0;i<12;i++){
          float fi=float(i);
          float noteX=fract(fi/12.0-t*0.1);
          float noteY=staffY+(hash(vec2(fi,0.0))-0.5)*staffSpacing*4.0;
          noteY=staffY+floor((noteY-staffY)/staffSpacing*2.0+0.5)*staffSpacing*0.5;
          float isHalf=step(0.5,hash(vec2(fi,1.0)));
          float noteHead=smoothstep(0.012,0.008,length((uv-vec2(noteX,noteY))*vec2(1.0,1.8)));
          float stem=step(abs(uv.x-noteX-0.008),0.002)*step(noteY,uv.y)*step(uv.y,noteY+0.08);
          float fill=isHalf>0.5?smoothstep(0.006,0.008,length((uv-vec2(noteX,noteY))*vec2(1.0,1.8))):1.0;
          c=mix(c,vec3(0.1),noteHead*fill);
          c=mix(c,vec3(0.1),stem);
        }
        float beatPulse=exp(-fract(t*2.0)*3.0)*0.05;
        c+=beatPulse;
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.03;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'crystal-cave',
    name: 'Crystal Cave',
    description: 'Underground crystal cave with glowing mineral formations, stalactites and ambient light.',
    tags: ['cave', 'crystal', 'fantasy'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        vec3 c=vec3(0.02,0.02,0.05);
        float ceiling=0.85+noise(vec2(uv.x*5.0,0.0))*0.1;
        float floor2=0.15-noise(vec2(uv.x*5.0,10.0))*0.1;
        float cave=step(floor2,uv.y)*step(uv.y,ceiling);
        for(int i=0;i<8;i++){
          float fi=float(i);
          float cx=hash(vec2(fi,0.0));
          float isUp=step(0.5,hash(vec2(fi,1.0)));
          float baseY=isUp>0.5?ceiling:floor2;
          float len=0.1+hash(vec2(fi,2.0))*0.2;
          float dir=isUp>0.5?-1.0:1.0;
          float crystalD=abs(uv.x-cx);
          float crystalH=step(0.0,(uv.y-baseY)*dir)*step((uv.y-baseY)*dir,len);
          float crystal=exp(-crystalD*80.0)*crystalH;
          float hue=hash(vec2(fi,3.0))*6.28+t;
          vec3 crystalCol=0.3+0.3*cos(hue+vec3(0,2,4));
          float glow=exp(-crystalD*20.0)*crystalH*0.2;
          c+=crystal*crystalCol;c+=glow*crystalCol;
        }
        c*=cave;
        float ambient=noise(uv*5.0+t)*0.1*cave;c+=ambient*vec3(0.1,0.1,0.2);
        float md=length(uv-u_mouse);
        float torch=exp(-md*5.0)*0.3*cave;
        c+=torch*vec3(0.8,0.5,0.2);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'space-invader',
    name: 'Space Invader',
    description: 'Retro space invader sprites marching in formation with pixel art and attack animation.',
    tags: ['game', 'retro', 'pixel'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.02);
        float px=8.0;
        for(int row=0;row<4;row++)for(int col=0;col<8;col++){
          float fr=float(row);float fc=float(col);
          vec2 invPos=vec2(0.15+fc*0.09+sin(t+fr)*0.02,0.7-fr*0.1);
          vec2 d=(uv-invPos)*u_resolution/px;
          vec2 pixel=floor(d+3.5);
          if(pixel.x>=0.0&&pixel.x<7.0&&pixel.y>=0.0&&pixel.y<6.0){
            float sym=min(pixel.x,6.0-pixel.x);
            float body=0.0;
            if(pixel.y<1.0)body=step(1.0,sym)*step(sym,2.0);
            else if(pixel.y<2.0)body=step(0.0,sym)*step(sym,3.0);
            else if(pixel.y<3.0)body=step(0.0,sym)*step(sym,3.0);
            else if(pixel.y<4.0)body=step(1.0,sym)*step(sym,3.0);
            else body=step(0.0,sym)*step(sym,1.0);
            float hue=fr*1.5+fc*0.5;
            vec3 invCol=0.5+0.5*cos(hue+vec3(0,2,4));
            c+=body*invCol;
          }
        }
        float bullet=step(abs(uv.x-u_mouse.x),0.003)*step(u_mouse.y,uv.y)*step(uv.y,u_mouse.y+fract(t*2.0)*0.5);
        c+=bullet*vec3(0.0,1.0,0.3);
        float md=length(uv-u_mouse);c+=exp(-md*10.0)*vec3(0.0,0.2,0.0);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'tidal-wave',
    name: 'Great Wave',
    description: 'Hokusai-inspired great wave with stylized foam, dramatic curve and woodblock print style.',
    tags: ['japanese', 'wave', 'art'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.5;
        vec3 paper=vec3(0.9,0.88,0.8);
        float waveHeight=0.4+sin(uv.x*8.0-t)*0.1+sin(uv.x*3.0-t*0.7)*0.05;
        waveHeight+=noise(vec2(uv.x*5.0,t))*0.08;
        float crest=0.5+sin((uv.x-0.3)*10.0-t)*0.15;
        crest=max(waveHeight,crest*step(0.2,uv.x)*step(uv.x,0.6));
        float inWave=step(uv.y,crest);
        float surface=smoothstep(0.02,0.0,abs(uv.y-crest));
        vec3 deepBlue=vec3(0.1,0.15,0.35);vec3 midBlue=vec3(0.2,0.3,0.5);
        vec3 foam=vec3(0.95,0.95,0.9);
        float depth=(crest-uv.y)/0.4;
        vec3 waterCol=mix(midBlue,deepBlue,depth);
        vec3 c=paper;
        c=mix(c,waterCol,inWave);
        float foamLine=exp(-abs(uv.y-crest)*50.0)*0.8;
        float foamSpray=noise(uv*20.0+t)*smoothstep(crest-0.05,crest,uv.y)*step(uv.y,crest+0.03);
        c=mix(c,foam,foamLine+foamSpray*0.5);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'disco-ball',
    name: 'Disco Ball',
    description: 'Rotating disco mirror ball with reflected light spots scanning across the scene.',
    tags: ['disco', 'party', 'retro'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        vec3 c=vec3(0.03,0.02,0.05);
        float r=length(uv);float a=atan(uv.y,uv.x);
        float ball=smoothstep(0.22,0.21,r);
        float tileA=floor(a*10.0/6.28)*6.28/10.0;
        float tileR=floor(r*15.0)/15.0;
        float tile=smoothstep(0.02,0.0,abs(fract(a*10.0/6.28)-0.5)-0.45)*
                   smoothstep(0.005,0.0,abs(fract(r*15.0)-0.5)-0.45);
        float facetBright=hash(vec2(tileA,tileR))*0.5+0.3;
        facetBright*=sin(tileA*3.0+t*2.0)*0.3+0.7;
        vec3 mirror=vec3(0.6,0.65,0.7)*facetBright;
        c=mix(c,mirror,ball);c-=tile*ball*0.15;
        for(int i=0;i<8;i++){
          float fi=float(i);
          float la=fi*0.785+t*1.5;
          float lr=0.3+sin(t*2.0+fi)*0.1;
          vec2 spot=vec2(cos(la),sin(la))*lr;
          float sd=length(uv-spot);
          float beam=exp(-sd*10.0)*0.3;
          float hue=fi*0.785+t;
          c+=beam*(0.5+0.5*cos(hue+vec3(0,2,4)));
        }
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.03;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'neural-net',
    name: 'Neural Network',
    description: 'Artificial neural network diagram with nodes, weighted connections and activation pulses.',
    tags: ['ai', 'network', 'tech'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.02,0.03,0.06);
        float layers=4.0;float nodesPerLayer=5.0;
        for(int l=0;l<4;l++)for(int n=0;n<5;n++){
          float fl=float(l);float fn=float(n);
          vec2 node=vec2(0.15+fl*0.25,0.15+fn*0.175);
          float nd=length(uv-node);
          float activation=sin(t*2.0+fl+fn*1.5)*0.5+0.5;
          float nodeGlow=exp(-nd*40.0)*(0.3+activation*0.7);
          float nodeBody=smoothstep(0.02,0.015,nd);
          vec3 nodeCol=mix(vec3(0.2,0.3,0.5),vec3(0.3,0.8,1.0),activation);
          c+=nodeGlow*nodeCol*0.3;c=mix(c,nodeCol,nodeBody);
          if(l<3){
            for(int nn=0;nn<5;nn++){
              vec2 next=vec2(0.15+(fl+1.0)*0.25,0.15+float(nn)*0.175);
              vec2 pa=uv-node;vec2 ba=next-node;
              float proj=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
              float ld=length(pa-ba*proj);
              float weight=hash(vec2(fl*5.0+fn,float(nn)))*0.5+0.3;
              float pulse=exp(-pow(fract(proj-t*0.5)*3.0-1.5,2.0)*5.0);
              c+=exp(-ld*200.0)*weight*vec3(0.1,0.2,0.4);
              c+=exp(-ld*100.0)*pulse*weight*vec3(0.0,0.4,0.8)*0.3;
            }
          }
        }
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.03;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'sunset-ocean',
    name: 'Ocean Sunset',
    description: 'Dramatic ocean sunset with gradient sky, sun reflection on water and silhouette horizon.',
    tags: ['sunset', 'ocean', 'nature'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        float horizon=0.4+sin(uv.x*3.0)*0.01;
        vec3 skyTop=vec3(0.1,0.1,0.4);vec3 skyMid=vec3(0.8,0.4,0.2);vec3 skyLow=vec3(1.0,0.6,0.2);
        float skyGrad=smoothstep(horizon,1.0,uv.y);
        vec3 sky=mix(skyLow,mix(skyMid,skyTop,skyGrad),skyGrad);
        vec2 sunPos=vec2(u_mouse.x,horizon+0.15);
        float sunD=length((uv-sunPos)*vec2(1.0,2.0));
        float sun=smoothstep(0.1,0.08,sunD);
        sky+=sun*vec3(1.0,0.9,0.5);
        sky+=exp(-sunD*5.0)*vec3(1.0,0.5,0.2)*0.3;
        vec3 water=mix(vec3(0.05,0.1,0.2),vec3(0.1,0.15,0.25),uv.y/horizon);
        float wave=sin(uv.x*40.0+t*3.0)*0.003+sin(uv.x*80.0-t*5.0)*0.001;
        float reflection=exp(-abs(uv.x-sunPos.x)*5.0)*(horizon-uv.y)/horizon;
        water+=reflection*vec3(0.8,0.4,0.2)*0.5;
        water+=wave*10.0*vec3(0.3,0.2,0.1);
        vec3 c=uv.y>horizon?sky:water;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'kaleidoscope-2',
    name: 'Kaleidoscope II',
    description: 'Complex kaleidoscope with 8-fold symmetry, layered patterns and color cycling.',
    tags: ['symmetry', 'pattern', 'psychedelic'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time*0.4;
        float r=length(uv);float a=atan(uv.y,uv.x);
        float folds=8.0;
        a=mod(a,6.28318/folds);a=abs(a-3.14159/folds);
        vec2 p=vec2(cos(a),sin(a))*r*5.0;
        float pattern=noise(p+t)*noise(p*2.0-t*0.7);
        pattern+=sin(r*20.0+t)*0.1;
        float val=pattern*3.0;
        vec3 c=0.5+0.45*cos(val+t*0.5+vec3(0,2,4));
        c*=smoothstep(0.5,0.0,r);
        float sparkle=pow(noise(p*10.0+t*2.0),8.0)*2.0;
        c+=sparkle*smoothstep(0.4,0.0,r);
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'binary-code',
    name: 'Binary Stream',
    description: 'Scrolling binary code columns with highlighted data packets and processing indicators.',
    tags: ['code', 'digital', 'data'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.02,0.02,0.04);
        float charW=6.0;float charH=8.0;
        vec2 cell=floor(gl_FragCoord.xy/vec2(charW,charH));
        vec2 local=mod(gl_FragCoord.xy,vec2(charW,charH))/vec2(charW,charH);
        float col2=cell.x;
        float scrollSpeed=1.0+hash(vec2(col2,0.0))*2.0;
        float scrollY=cell.y+t*scrollSpeed*3.0;
        float bit=step(0.5,hash(vec2(col2,floor(scrollY))));
        float charMask=step(0.1,local.x)*step(local.x,0.9)*step(0.1,local.y)*step(local.y,0.9);
        float brightness=0.3+hash(vec2(col2,1.0))*0.4;
        float packet=exp(-pow(fract(scrollY*0.05-t*0.3)*5.0-2.5,2.0))*0.5;
        float md=length(uv-u_mouse);
        float highlight=exp(-md*5.0)*0.3;
        vec3 digitCol=vec3(0.0,brightness+packet+highlight,brightness*0.3);
        c+=charMask*bit*digitCol;
        c+=charMask*(1.0-bit)*digitCol*0.15;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'magma-flow',
    name: 'Magma Flow',
    description: 'Volcanic magma flow with glowing lava rivers, cooling dark crust and heat distortion.',
    tags: ['lava', 'volcanic', 'hot'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        vec2 p=uv*3.0+vec2(t*0.2,-t*0.1);
        float n1=noise(p);float n2=noise(p*2.0+n1*2.0);
        float n3=noise(p*4.0+n2);
        float magma=n1*0.5+n2*0.3+n3*0.2;
        float crust=smoothstep(0.4,0.5,magma);
        float lava=smoothstep(0.5,0.3,magma);
        vec3 hotLava=vec3(1.0,0.6,0.0);vec3 coolLava=vec3(0.8,0.2,0.0);
        vec3 crustCol=vec3(0.15,0.1,0.08);
        vec3 c=mix(mix(hotLava,coolLava,n2),crustCol,crust);
        float glow=lava*0.3;c+=glow*vec3(0.3,0.1,0.0);
        float crack=smoothstep(0.48,0.5,magma)*smoothstep(0.52,0.5,magma);
        c+=crack*vec3(1.0,0.4,0.0)*0.5;
        float md=length(uv-u_mouse);
        float heat=exp(-md*3.0)*0.2;c+=heat*vec3(0.5,0.2,0.0);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
];
