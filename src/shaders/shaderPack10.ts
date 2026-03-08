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

export const shaderPack10: DitherShaderDef[] = [
  {
    id: 'tetris-blocks',
    name: 'Tetris Fall',
    description: 'Falling Tetris-style blocks stacking with classic game piece shapes and clearing rows.',
    tags: ['game', 'retro', 'puzzle'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float cellS=15.0;
        vec2 cell=floor(gl_FragCoord.xy/cellS);
        vec2 local=mod(gl_FragCoord.xy,cellS)/cellS;
        float filled=step(hash(cell*0.1),uv.y*0.8+sin(t*0.5+cell.x*0.3)*0.1);
        float border=step(0.08,local.x)*step(local.x,0.92)*step(0.08,local.y)*step(local.y,0.92);
        float inner=step(0.15,local.x)*step(local.x,0.85)*step(0.15,local.y)*step(local.y,0.85);
        float hue=hash(cell*3.0)*6.28;
        vec3 blockCol=0.4+0.35*cos(hue+vec3(0,2,4));
        vec3 c=vec3(0.05);
        float block=filled*border;
        c=mix(c,blockCol*(0.6+inner*0.4),block);
        float fallY=fract(-t*0.5+hash(vec2(floor(uv.x*10.0),0.0)));
        float falling=step(abs(uv.y-fallY),0.05)*step(abs(uv.x-u_mouse.x),0.05);
        c=mix(c,vec3(1.0,0.5,0.0),falling*0.8);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'leaf-veins',
    name: 'Leaf Veins',
    description: 'Botanical leaf structure with branching vein network, cell pattern and chlorophyll gradient.',
    tags: ['nature', 'botanical', 'organic'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time*0.3;
        vec2 p=uv*1.5;
        float leafShape=smoothstep(0.4,0.35,length(p*vec2(1.0,1.8)));
        float midrib=exp(-abs(p.x)*40.0)*leafShape;
        float veins=0.0;
        for(int i=1;i<8;i++){
          float fi=float(i);
          float vy=fi*0.06-0.2;
          float angle=0.6*sign(p.x);
          vec2 dir=vec2(cos(angle),sin(angle));
          vec2 vp=p-vec2(0.0,vy);
          float proj=dot(vp,dir);
          float d=length(vp-dir*max(proj,0.0));
          veins+=exp(-d*50.0)*step(0.0,proj)*0.4;
        }
        float cells=noise(p*30.0+t)*0.1;
        vec3 green=mix(vec3(0.1,0.5,0.1),vec3(0.3,0.7,0.2),noise(p*5.0+t)*0.5+0.5);
        vec3 c=vec3(0.95,0.93,0.88);
        c=mix(c,green,leafShape);
        c=mix(c,green*0.4,midrib);
        c=mix(c,green*0.5,(veins)*leafShape);
        c+=cells*leafShape;
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'led-matrix',
    name: 'LED Matrix',
    description: 'LED dot matrix display with individually lit pixels, scrolling text and color mixing.',
    tags: ['display', 'digital', 'tech'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float ledSize=6.0;
        vec2 cell=floor(gl_FragCoord.xy/ledSize);
        vec2 local=mod(gl_FragCoord.xy,ledSize)/ledSize-0.5;
        float dot=smoothstep(0.4,0.3,length(local));
        float wave1=sin(cell.x*0.3-t*3.0+cell.y*0.1)*0.5+0.5;
        float wave2=sin(cell.y*0.2+t*2.0+cell.x*0.15)*0.5+0.5;
        float scroll=step(0.5,hash(vec2(cell.x-floor(t*5.0),cell.y)));
        float md=length(vec2(cell.x,cell.y)*ledSize/u_resolution-u_mouse);
        float mouseLit=exp(-md*5.0);
        float brightness=max(max(wave1*wave2,scroll*0.5),mouseLit);
        vec3 ledCol=mix(vec3(1.0,0.0,0.0),vec3(0.0,1.0,0.0),wave1);
        ledCol=mix(ledCol,vec3(0.0,0.5,1.0),wave2*0.5);
        vec3 c=vec3(0.02);
        c+=dot*ledCol*brightness;
        c+=dot*vec3(0.02,0.01,0.01);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'candy-stripes',
    name: 'Candy Stripes',
    description: 'Sweet candy cane diagonal stripes with glossy highlight and sugary pastel colors.',
    tags: ['sweet', 'pattern', 'fun'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float stripe=sin((uv.x+uv.y)*30.0-t*2.0)*0.5+0.5;
        float stripe2=sin((uv.x-uv.y)*30.0+t*1.5)*0.5+0.5;
        float pattern=mix(stripe,stripe2,sin(t*0.5)*0.5+0.5);
        vec3 pink=vec3(1.0,0.5,0.6);vec3 white=vec3(0.98);
        vec3 mint=vec3(0.5,0.9,0.7);vec3 lemon=vec3(1.0,0.95,0.5);
        float section=floor(uv.y*4.0);
        vec3 col1=section<1.0?pink:section<2.0?mint:section<3.0?lemon:pink;
        vec3 c=mix(white,col1,step(0.5,pattern));
        float gloss=pow(sin(uv.x*3.14159)*sin(uv.y*3.14159),0.5)*0.15;
        c+=gloss;
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'rust-metal',
    name: 'Rusty Metal',
    description: 'Corroded metal surface with rust patches, pitting, paint flaking and oxidation layers.',
    tags: ['metal', 'texture', 'grunge'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.1;
        vec2 p=uv*8.0;
        float rust=noise(p+t)*0.5+noise(p*3.0)*0.3+noise(p*7.0)*0.2;
        float scratch=noise(vec2(uv.x*50.0,uv.y*2.0+t))*noise(vec2(uv.x*2.0,uv.y*50.0));
        float pitting=step(0.85,noise(p*5.0))*0.3;
        vec3 metal=vec3(0.45,0.47,0.5);
        vec3 rustCol=vec3(0.5,0.25,0.1);
        vec3 deepRust=vec3(0.3,0.12,0.05);
        vec3 c=mix(metal,rustCol,smoothstep(0.3,0.7,rust));
        c=mix(c,deepRust,smoothstep(0.6,0.9,rust));
        c-=scratch*0.1;c-=pitting;
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'yin-yang',
    name: 'Yin Yang',
    description: 'Animated yin-yang symbol with rotating halves, flowing energy and balance visualization.',
    tags: ['symbol', 'balance', 'spiritual'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        float cs=cos(t*0.5),sn=sin(t*0.5);
        vec2 ruv=vec2(cs*uv.x-sn*uv.y,sn*uv.x+cs*uv.y);
        float r=length(ruv);float a=atan(ruv.y,ruv.x);
        float circle=smoothstep(0.32,0.31,r);
        float half=step(0.0,ruv.x);
        float upper=smoothstep(0.16,0.15,length(ruv-vec2(0.0,0.155)));
        float lower=smoothstep(0.16,0.15,length(ruv-vec2(0.0,-0.155)));
        float yin=half;
        yin=mix(yin,1.0,upper);yin=mix(yin,0.0,lower);
        float dotW=smoothstep(0.045,0.04,length(ruv-vec2(0.0,0.155)));
        float dotB=smoothstep(0.045,0.04,length(ruv-vec2(0.0,-0.155)));
        yin=mix(yin,0.0,dotW);yin=mix(yin,1.0,dotB);
        vec3 dark=vec3(0.05);vec3 light=vec3(0.95);
        vec3 c=mix(dark,light,yin)*circle;
        float energy=sin(a*6.0-t*3.0)*exp(-abs(r-0.32)*30.0)*0.3;
        c+=abs(energy)*vec3(0.5,0.3,0.8)*circle;
        vec3 bg=vec3(0.1);c=mix(bg,c,circle);
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'circuit-board-3d',
    name: 'Cyber Grid',
    description: 'Futuristic 3D circuit grid with data pulses traveling along glowing pathways.',
    tags: ['cyber', 'tech', 'futuristic'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float gridS=30.0;
        vec2 cell=floor(gl_FragCoord.xy/gridS);
        vec2 local=mod(gl_FragCoord.xy,gridS)/gridS;
        float pathH=step(abs(local.y-0.5),0.08);
        float pathV=step(abs(local.x-0.5),0.08);
        float r=hash(cell);
        float path=r<0.3?pathH:r<0.6?pathV:max(pathH,pathV);
        float node=smoothstep(0.2,0.15,length(local-0.5));
        float pulse=sin(cell.x*0.5+cell.y*0.3-t*3.0)*0.5+0.5;
        float dataPulse=exp(-pow(fract(cell.x*0.1+t*0.5)*3.0-1.5,2.0)*5.0);
        vec3 c=vec3(0.02,0.02,0.05);
        vec3 pathCol=vec3(0.0,0.4,0.6);
        vec3 activeCol=vec3(0.0,0.8,1.0);
        c+=path*mix(pathCol,activeCol,dataPulse)*0.5;
        c+=node*activeCol*pulse;
        float md=length(uv-u_mouse);
        float mouseGlow=exp(-md*5.0);
        c+=mouseGlow*vec3(0.0,0.3,0.5)*path;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'lace-pattern',
    name: 'Lace Pattern',
    description: 'Delicate lace doily pattern with intricate geometric holes and decorative borders.',
    tags: ['textile', 'decorative', 'pattern'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time*0.3;
        float r=length(uv);float a=atan(uv.y,uv.x)+t*0.1;
        float pattern=0.0;
        pattern+=sin(a*8.0)*0.5+0.5;
        pattern*=sin(r*40.0)*0.5+0.5;
        float radial=sin(a*16.0+r*20.0)*0.5+0.5;
        pattern=max(pattern,radial*0.7);
        float holes=step(0.6,pattern);
        float edge=smoothstep(0.55,0.65,pattern)*smoothstep(0.75,0.65,pattern);
        float outerEdge=smoothstep(0.38,0.37,r)*smoothstep(0.35,0.36,r);
        float mask=smoothstep(0.4,0.38,r);
        vec3 lace=vec3(0.95,0.93,0.9);
        vec3 bg=vec3(0.2,0.15,0.25);
        vec3 c=bg;
        c=mix(c,lace,(1.0-holes)*mask);
        c=mix(c,lace*0.85,edge*mask);
        c=mix(c,lace*0.7,outerEdge);
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'bismuth-crystal',
    name: 'Bismuth Crystal',
    description: 'Iridescent bismuth crystal formation with stepped terraces and rainbow oxidation colors.',
    tags: ['crystal', 'iridescent', 'mineral'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        float step1=floor(uv.x*15.0)/15.0;
        float step2=floor(uv.y*15.0)/15.0;
        float terrace=floor((step1+step2)*8.0)/8.0;
        float h=hash(vec2(step1,step2)*100.0);
        float height=terrace+h*0.1;
        float edge=smoothstep(0.01,0.0,abs(fract(uv.x*15.0)-0.5)-0.48)+
                   smoothstep(0.01,0.0,abs(fract(uv.y*15.0)-0.5)-0.48);
        float angle=dot(normalize(vec2(1.0,1.0)),normalize(uv-(u_mouse)));
        float iri=height*5.0+angle*3.0+t;
        vec3 crystal=0.5+0.45*cos(iri+vec3(0,2,4));
        crystal*=0.7+height*0.5;
        vec3 c=crystal*(1.0-edge*0.3);
        c+=edge*vec3(0.3)*height;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'wave-pool',
    name: 'Wave Pool',
    description: 'Swimming pool surface with interfering wave patterns and shimmering caustic light.',
    tags: ['water', 'pool', 'pattern'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float wave=0.0;
        wave+=sin(uv.x*20.0+t*2.0)*0.2;
        wave+=sin(uv.y*15.0-t*1.5)*0.2;
        wave+=sin((uv.x+uv.y)*12.0+t*3.0)*0.15;
        wave+=sin(length(uv-u_mouse)*25.0-t*4.0)*exp(-length(uv-u_mouse)*3.0)*0.3;
        float caustic=pow(abs(wave),0.5)*0.5;
        vec3 poolBottom=vec3(0.3,0.6,0.7);
        vec3 lightPatch=vec3(0.5,0.8,0.9);
        vec3 c=mix(poolBottom,lightPatch,caustic);
        float tile=step(0.95,max(sin(uv.x*60.0),sin(uv.y*60.0)));
        c=mix(c,c*0.7,tile*0.3);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'clock-face',
    name: 'Clock Face',
    description: 'Analog clock with sweeping second hand, hour markers and smooth gear-driven motion.',
    tags: ['time', 'clock', 'instrument'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        float r=length(uv);float a=atan(uv.y,uv.x)+1.5708;
        vec3 c=vec3(0.95,0.93,0.9);
        float face=smoothstep(0.38,0.37,r);
        float rim=smoothstep(0.39,0.38,r)*smoothstep(0.37,0.38,r);
        c*=face;c=mix(c,vec3(0.3),rim);
        for(int i=0;i<12;i++){
          float ha=float(i)*0.5236;
          float da=abs(mod(a-ha+3.14159,6.28318)-3.14159);
          float tick=step(da,0.03)*step(0.3,r)*step(r,0.35)*face;
          c=mix(c,vec3(0.1),tick);
        }
        float secAngle=mod(t,60.0)/60.0*6.28318;
        float minAngle=mod(t/60.0,60.0)/60.0*6.28318;
        float hrAngle=mod(t/3600.0,12.0)/12.0*6.28318;
        float secHand=step(abs(mod(a-secAngle+3.14159,6.28318)-3.14159),0.01)*step(r,0.33)*face;
        float minHand=step(abs(mod(a-minAngle+3.14159,6.28318)-3.14159),0.02)*step(r,0.28)*face;
        float hrHand=step(abs(mod(a-hrAngle+3.14159,6.28318)-3.14159),0.025)*step(r,0.2)*face;
        c=mix(c,vec3(0.1),hrHand);c=mix(c,vec3(0.1),minHand);c=mix(c,vec3(0.8,0.1,0.1),secHand);
        float center=smoothstep(0.02,0.015,r)*face;c=mix(c,vec3(0.2),center);
        float bg2=1.0-face;c=mix(c,vec3(0.15,0.12,0.1),bg2);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'sound-wave',
    name: 'Sound Wave',
    description: 'Audio waveform visualization with frequency spectrum, amplitude modulation and stereo field.',
    tags: ['audio', 'wave', 'visualization'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.02,0.02,0.05);
        for(int i=0;i<5;i++){
          float fi=float(i);
          float freq=2.0+fi*3.0;
          float amp=0.05/(1.0+fi*0.3);
          float phase=t*(1.0+fi*0.5);
          float wave=sin(uv.x*freq*10.0+phase)*amp;
          wave+=noise(vec2(uv.x*10.0+t,fi))*amp*0.5;
          float y=0.5+wave;
          float d=abs(uv.y-y);
          float line=exp(-d*100.0);
          float fill=smoothstep(0.0,0.01,d)*0.0+smoothstep(0.02,0.0,d)*0.3;
          float hue=fi/5.0;
          vec3 col=0.5+0.5*cos(hue*6.28+vec3(0,2,4));
          c+=line*col+fill*col*0.3;
        }
        float md=length(uv-u_mouse);c+=exp(-md*8.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'topaz-ring',
    name: 'Diamond Ring',
    description: 'Faceted diamond ring with brilliance, fire dispersion and sparkle light play.',
    tags: ['gem', 'jewelry', 'luxury'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        float r=length(uv);float a=atan(uv.y,uv.x);
        vec3 c=vec3(0.02);
        float ringOuter=smoothstep(0.22,0.21,r)*smoothstep(0.17,0.18,r);
        vec3 gold=vec3(0.85,0.7,0.3);
        c+=ringOuter*gold*(0.7+sin(a*20.0)*0.15);
        float gemR=length(uv-vec2(0.0,0.22));
        float gem=smoothstep(0.09,0.085,gemR);
        float facets=floor(a/(6.28/8.0));
        float facetBright=sin(facets*3.0+t*2.0)*0.3+0.7;
        float fire=sin(a*12.0+t*4.0+gemR*50.0)*0.5+0.5;
        vec3 gemCol=mix(vec3(0.8,0.9,1.0),0.5+0.5*cos(fire*6.28+vec3(0,2,4)),0.3);
        gemCol*=facetBright;
        c=mix(c,gemCol,gem);
        float sparkle=pow(sin(a*16.0+t*8.0)*0.5+0.5,8.0)*gem;
        c+=sparkle*vec3(1.0);
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);
        c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'domino-tiles',
    name: 'Domino Tiles',
    description: 'Scattered domino tiles with pip patterns, shadows and randomized face values.',
    tags: ['game', 'tiles', 'pattern'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float tileW=40.0;float tileH=80.0;
        vec2 cell=floor(gl_FragCoord.xy/vec2(tileW,tileH));
        vec2 local=mod(gl_FragCoord.xy,vec2(tileW,tileH))/vec2(tileW,tileH);
        float border=step(0.05,local.x)*step(local.x,0.95)*step(0.02,local.y)*step(local.y,0.98);
        float divider=smoothstep(0.01,0.0,abs(local.y-0.5))*border;
        float topVal=floor(hash(cell)*7.0);
        float botVal=floor(hash(cell+100.0)*7.0);
        float pips=0.0;
        for(int py=0;py<3;py++)for(int px=0;px<3;px++){
          vec2 pipPos=vec2(0.25+float(px)*0.25,0.15+float(py)*0.12);
          float topPip=smoothstep(0.04,0.03,length(local-pipPos));
          float botPip=smoothstep(0.04,0.03,length(local-pipPos-vec2(0.0,0.5)));
          float pipIdx=float(py*3+px);
          pips+=topPip*step(pipIdx,topVal)+botPip*step(pipIdx,botVal);
        }
        pips=min(pips,1.0);
        vec3 c=vec3(0.3,0.25,0.2);
        c=mix(c,vec3(0.95),border);
        c=mix(c,vec3(0.7),divider);
        c=mix(c,vec3(0.1),pips*border);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'northern-star',
    name: 'Star Burst',
    description: 'Geometric starburst pattern with radiating rays, lens flare and prismatic diffraction.',
    tags: ['star', 'light', 'geometric'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        vec2 center=(u_mouse-0.5)*vec2(u_resolution.x/u_resolution.y,1.0);
        vec2 d=uv-center*0.5;
        float r=length(d);float a=atan(d.y,d.x);
        float rays=pow(abs(sin(a*6.0+t)),8.0)*exp(-r*3.0);
        float rays2=pow(abs(sin(a*4.0-t*1.5)),12.0)*exp(-r*4.0)*0.5;
        float core=exp(-r*20.0);
        float ring=exp(-pow((r-0.15)*20.0,2.0))*0.2;
        vec3 c=vec3(0.01);
        c+=rays*vec3(1.0,0.8,0.4);
        c+=rays2*vec3(0.4,0.6,1.0);
        c+=core*vec3(1.0,0.95,0.9)*2.0;
        c+=ring*vec3(0.6,0.3,0.8);
        float flare=exp(-length(d+d*0.3)*10.0)*0.2;
        c+=flare*vec3(0.3,0.5,1.0);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
];
