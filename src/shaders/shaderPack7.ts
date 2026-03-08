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

export const shaderPack7: DitherShaderDef[] = [
  {
    id: 'plaid-weave',
    name: 'Plaid Weave',
    description: 'Scottish tartan plaid pattern with interlocking horizontal and vertical color bands.',
    tags: ['textile', 'pattern', 'geometric'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        float h1=sin(uv.x*40.0+t)*0.5+0.5;
        float h2=sin(uv.x*80.0)*0.5+0.5;
        float v1=sin(uv.y*40.0-t)*0.5+0.5;
        float v2=sin(uv.y*80.0)*0.5+0.5;
        vec3 hCol=mix(vec3(0.1,0.2,0.5),vec3(0.8,0.1,0.1),step(0.5,h1))*mix(0.7,1.0,h2);
        vec3 vCol=mix(vec3(0.0,0.4,0.2),vec3(0.9,0.8,0.1),step(0.5,v1))*mix(0.7,1.0,v2);
        float weave=step(0.5,mod(floor(gl_FragCoord.x/4.0)+floor(gl_FragCoord.y/4.0),2.0));
        vec3 c=mix(hCol,vCol,weave*0.5+0.25);
        float md=length(uv-u_mouse);c+=exp(-md*8.0)*0.15;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'honeycomb-hex',
    name: 'Honeycomb',
    description: 'Perfect hexagonal honeycomb grid with glowing cell walls and pulsing amber fill.',
    tags: ['hex', 'grid', 'nature'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 r=vec2(1.0,1.732);vec2 h=r*0.5;
        vec2 a=mod(gl_FragCoord.xy/20.0,r)-h;
        vec2 b=mod(gl_FragCoord.xy/20.0-h,r)-h;
        vec2 gv=length(a)<length(b)?a:b;
        float d=length(gv);
        float hex=smoothstep(0.42,0.4,d);
        float edge=smoothstep(0.38,0.42,d)*smoothstep(0.46,0.42,d);
        float pulse=sin(t*2.0+length(floor((gl_FragCoord.xy)/20.0))*0.5)*0.5+0.5;
        vec3 c=vec3(0.05,0.03,0.0);
        c+=hex*mix(vec3(0.6,0.4,0.0),vec3(0.9,0.7,0.1),pulse)*0.4;
        c+=edge*vec3(0.9,0.6,0.1)*0.8;
        float md=length(uv-u_mouse);c+=exp(-md*6.0)*vec3(0.3,0.2,0.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'glitch-blocks',
    name: 'Glitch Blocks',
    description: 'Digital data corruption with shifting rectangular blocks, color channel separation and noise.',
    tags: ['glitch', 'digital', 'error'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float blockY=floor(uv.y*20.0);
        float shift=step(0.9,hash(vec2(blockY,floor(t*4.0))))*
                    (hash(vec2(blockY*7.0,floor(t*4.0)))-0.5)*0.3;
        vec2 ruv=vec2(uv.x+shift*1.2,uv.y);
        vec2 guv=vec2(uv.x+shift,uv.y);
        vec2 buv=vec2(uv.x+shift*0.8,uv.y);
        float r=step(0.5,fract(sin(dot(floor(ruv*vec2(40.0,20.0)),vec2(12.9,78.2)))*43758.5+t));
        float g=step(0.5,fract(sin(dot(floor(guv*vec2(40.0,20.0)),vec2(12.9,78.2)))*43758.5+t));
        float b=step(0.5,fract(sin(dot(floor(buv*vec2(40.0,20.0)),vec2(12.9,78.2)))*43758.5+t));
        vec3 c=vec3(r*0.9,g*0.9,b*0.9);
        float scan=0.9+0.1*sin(gl_FragCoord.y*3.0);c*=scan;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'water-caustics',
    name: 'Water Caustics',
    description: 'Underwater light caustic patterns dancing on a pool floor with rippling refraction.',
    tags: ['water', 'light', 'organic'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 p=uv*5.0;
        float n1=noise(p+vec2(t*0.3,t*0.2));
        float n2=noise(p*1.5+vec2(-t*0.2,t*0.4)+n1*2.0);
        float n3=noise(p*2.5+n2*1.5+t*0.1);
        float caustic=pow(n3,3.0)*3.0;
        float md=length(uv-u_mouse);
        float ripple=sin(md*30.0-t*4.0)*exp(-md*3.0)*0.2;
        caustic+=ripple;
        vec3 deep=vec3(0.0,0.1,0.3);
        vec3 light=vec3(0.2,0.6,0.8);
        vec3 bright=vec3(0.5,0.9,1.0);
        vec3 c=mix(deep,light,caustic);
        c=mix(c,bright,smoothstep(0.7,1.0,caustic));
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'stained-glass',
    name: 'Stained Glass',
    description: 'Cathedral stained glass window with Voronoi cells, dark lead lines and vibrant colored panes.',
    tags: ['glass', 'voronoi', 'art'],
    fragmentShader: `${U}
      vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float sc=25.0;
        vec2 st=gl_FragCoord.xy/sc;vec2 ist=floor(st);vec2 fst=fract(st);
        float md=1.0;float sd=1.0;vec2 mId;
        for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
          vec2 nb=vec2(float(x),float(y));
          vec2 pt=hash2(ist+nb)*0.8+0.1;
          float d=length(nb+pt-fst);
          if(d<md){sd=md;md=d;mId=ist+nb;}else if(d<sd)sd=d;
        }
        float edge=smoothstep(0.05,0.02,sd-md);
        float hue=hash2(mId).x*6.28+u_time*0.3;
        vec3 pane=0.5+0.4*cos(hue+vec3(0,2,4));
        pane*=0.7+0.3*sin(u_time+md*10.0);
        float light=0.6+0.4*sin(u_time*0.5+mId.x+mId.y);
        vec3 c=pane*light*(1.0-edge)+edge*vec3(0.05);
        float mouseD=length(uv-u_mouse);c+=exp(-mouseD*5.0)*0.2;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'digital-rain-green',
    name: 'Matrix Code',
    description: 'Falling matrix-style green characters cascading down the screen with varying brightness.',
    tags: ['matrix', 'code', 'digital'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float colWidth=8.0;float rowHeight=12.0;
        vec2 cell=vec2(floor(gl_FragCoord.x/colWidth),floor(gl_FragCoord.y/rowHeight));
        float speed=hash(vec2(cell.x,0.0))*2.0+1.0;
        float drop=fract(cell.y/40.0+t*speed*0.1+hash(vec2(cell.x*3.0,0.0)));
        float bright=pow(drop,8.0);
        float charChange=hash(cell+floor(t*8.0));
        float char=step(0.3,charChange)*bright;
        float trail=pow(drop,2.0)*0.3;
        vec3 c=vec3(0.0,char+trail,char*0.3+trail*0.1);
        float md=length(uv-u_mouse);c+=exp(-md*10.0)*vec3(0.0,0.3,0.1);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'wood-rings',
    name: 'Wood Grain',
    description: 'Natural wood cross-section with growth rings, knots and organic grain variation.',
    tags: ['wood', 'organic', 'texture'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        float t=u_time*0.1;
        vec2 center=uv+(u_mouse-0.5)*0.3;
        float r=length(center)*10.0;
        float distort=noise(uv*8.0+t)*0.5;
        float rings=sin(r+distort*3.0)*0.5+0.5;
        float grain=noise(vec2(atan(center.y,center.x)*5.0,r*2.0))*0.15;
        float val=rings*0.7+grain+0.2;
        vec3 light=vec3(0.8,0.6,0.3);
        vec3 dark=vec3(0.35,0.2,0.08);
        vec3 c=mix(dark,light,val);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'lightning-bolt',
    name: 'Lightning',
    description: 'Branching lightning bolt with bright core, purple glow and flickering electrical discharge.',
    tags: ['electric', 'storm', 'energy'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.02,0.0,0.05);
        for(int b=0;b<5;b++){
          float fb=float(b);
          vec2 start=vec2(u_mouse.x+fb*0.05-0.1,1.0);
          vec2 end=vec2(0.5+sin(t+fb)*0.2,0.0);
          float segments=20.0;
          for(int i=0;i<20;i++){
            float fi=float(i)/segments;
            float fi2=float(i+1)/segments;
            vec2 p1=mix(start,end,fi);
            vec2 p2=mix(start,end,fi2);
            p1.x+=hash(vec2(fi*10.0+fb,floor(t*10.0)))*0.08-0.04;
            p2.x+=hash(vec2(fi2*10.0+fb,floor(t*10.0)))*0.08-0.04;
            vec2 pa=uv-p1;vec2 ba=p2-p1;
            float proj=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
            float d=length(pa-ba*proj);
            float flicker=step(0.3,hash(vec2(floor(t*20.0),fb)));
            c+=exp(-d*300.0)*vec3(0.7,0.7,1.0)*flicker/(1.0+fb);
            c+=exp(-d*50.0)*vec3(0.3,0.1,0.5)*flicker/(1.0+fb)*0.5;
          }
        }
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'pixel-sort',
    name: 'Pixel Sort',
    description: 'Glitch art pixel sorting effect with horizontal value-sorted streaks and threshold bands.',
    tags: ['glitch', 'sort', 'digital'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float row=floor(gl_FragCoord.y/3.0);
        float threshold=sin(row*0.1+t)*0.3+0.5;
        float val=sin(uv.x*10.0+uv.y*5.0+t)*0.5+0.5;
        float sorted=step(threshold,val);
        float stretch=sorted*(hash(vec2(row,floor(t*2.0)))*0.3);
        vec2 suv=vec2(uv.x+stretch,uv.y);
        float hue=sin(suv.x*15.0+t)*0.5+0.5;
        vec3 orig=0.5+0.5*cos(hue*6.28+vec3(0,2,4));
        vec3 sortedCol=vec3(hue);
        float md=length(uv-u_mouse);
        float sortRange=smoothstep(0.4,0.0,abs(uv.y-u_mouse.y));
        vec3 c=mix(orig,sortedCol,sorted*sortRange);
        c+=exp(-md*10.0)*0.1;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'topo-lines',
    name: 'Isoline Map',
    description: 'Mathematical isoline visualization with layered contour lines over a complex scalar field.',
    tags: ['map', 'contour', 'math'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.5;
        vec2 p=(uv-0.5)*4.0;
        float field=sin(p.x*2.0+t)*cos(p.y*2.0-t)+
                    sin(length(p-(u_mouse-0.5)*4.0)*3.0)*0.5+
                    sin(p.x*p.y+t*0.7)*0.3;
        float lines=abs(fract(field*5.0)-0.5)*2.0;
        float contour=smoothstep(0.05,0.0,abs(lines-0.5)*0.5);
        float fill=field*0.5+0.5;
        vec3 cold=vec3(0.1,0.2,0.5);vec3 warm=vec3(0.8,0.3,0.1);
        vec3 c=mix(cold,warm,fill)*0.6;
        c+=contour*vec3(0.9);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'kaleidoscope',
    name: 'Kaleidoscope',
    description: 'Multi-fold kaleidoscopic mirror pattern with rotating symmetry and colorful reflections.',
    tags: ['mirror', 'symmetry', 'color'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        float t=u_time*0.3;
        float r=length(uv);float a=atan(uv.y,uv.x)+t;
        float folds=6.0;
        a=mod(a,6.28318/folds);
        a=abs(a-3.14159/folds);
        vec2 p=vec2(cos(a),sin(a))*r;
        float n1=noise(p*5.0+t);
        float n2=noise(p*10.0-t*0.7);
        float pattern=n1*0.6+n2*0.4;
        vec3 c=0.5+0.5*cos(pattern*8.0+r*4.0+t+vec3(0,2,4));
        c*=smoothstep(0.6,0.0,r);
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);
        c+=exp(-md*5.0)*0.15;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'dot-matrix-print',
    name: 'Dot Matrix',
    description: 'Old school dot matrix printer output with visible pin impact dots and ribbon ink variation.',
    tags: ['retro', 'print', 'dots'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float dotSize=3.0;
        vec2 cell=floor(gl_FragCoord.xy/dotSize);
        vec2 local=mod(gl_FragCoord.xy,dotSize)/dotSize-0.5;
        float printLine=cell.y+floor(t*5.0);
        float charVal=hash(vec2(cell.x,printLine))*0.8+0.1;
        float printing=step(mod(printLine,40.0),30.0);
        float dot=smoothstep(0.4,0.3,length(local))*charVal*printing;
        float ribbon=0.7+sin(cell.y*0.05+t)*0.3;
        vec3 paper=vec3(0.95,0.93,0.88);
        vec3 ink=vec3(0.1,0.1,0.2)*ribbon;
        vec3 c=mix(paper,ink,dot);
        float perf=step(abs(uv.x-0.05),0.003)+step(abs(uv.x-0.95),0.003);
        float holes=step(0.5,sin(uv.y*100.0))*perf;
        c=mix(c,vec3(0.8),holes*0.3);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'northern-lights',
    name: 'Northern Lights',
    description: 'Shimmering aurora borealis with undulating curtains of green and purple light.',
    tags: ['aurora', 'nature', 'atmosphere'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.5;
        float aurora=0.0;
        for(int i=0;i<4;i++){
          float fi=float(i);
          float wave=sin(uv.x*3.0+t+fi*1.5)*0.15+0.5+fi*0.08;
          float n=noise(vec2(uv.x*4.0+t*0.3+fi,fi*5.0))*0.1;
          wave+=n;
          float band=exp(-pow((uv.y-wave)*8.0,2.0));
          aurora+=band*(0.5+fi*0.15);
        }
        vec3 green=vec3(0.1,0.8,0.3);vec3 purple=vec3(0.5,0.1,0.7);
        vec3 auroraCol=mix(green,purple,sin(uv.x*5.0+t)*0.5+0.5);
        vec3 sky=mix(vec3(0.0,0.0,0.05),vec3(0.0,0.02,0.1),uv.y);
        vec3 c=sky+auroraCol*aurora;
        float md=length(uv-u_mouse);c+=exp(-md*8.0)*vec3(0.1,0.2,0.1);
        float stars=step(0.998,hash(floor(gl_FragCoord.xy/2.0)))*step(aurora,0.1);
        c+=stars*0.5;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'sierpinski',
    name: 'Sierpinski',
    description: 'Animated Sierpinski triangle fractal with zoom and recursive self-similar structure.',
    tags: ['fractal', 'triangle', 'math'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        float t=u_time*0.3;
        float zoom=pow(2.0,mod(t,5.0));
        uv=uv*zoom+vec2(0.0,0.3);
        uv+=(u_mouse-0.5)*0.5;
        vec2 p=uv;
        float val=1.0;
        for(int i=0;i<15;i++){
          p*=2.0;
          vec2 m=mod(p,2.0);
          if(m.x>1.0&&m.y>1.0)val=0.0;
          p=fract(p)*2.0;
        }
        vec3 c=val>0.5?vec3(0.9,0.4,0.1):vec3(0.05,0.02,0.08);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Surface',
    description: 'Stylized ocean surface with layered wave crests, foam lines and deep water gradient.',
    tags: ['ocean', 'water', 'nature'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float wave=0.0;
        for(int i=0;i<5;i++){
          float fi=float(i);
          float freq=1.0+fi*0.8;
          float amp=0.04/(1.0+fi*0.5);
          float phase=t*(0.5+fi*0.2)+fi*1.3;
          wave+=sin(uv.x*freq*15.0+phase+noise(uv*5.0+fi)*2.0)*amp;
        }
        float surface=uv.y-0.5-wave;
        float foam=smoothstep(0.01,0.0,abs(surface))*0.8;
        float underwater=smoothstep(0.0,-0.3,surface);
        vec3 sky=mix(vec3(0.6,0.7,0.9),vec3(0.3,0.5,0.9),uv.y);
        vec3 deep=vec3(0.0,0.1,0.3);
        vec3 shallow=vec3(0.0,0.3,0.5);
        vec3 water=mix(shallow,deep,underwater);
        vec3 c=surface>0.0?sky:water;
        c+=foam*vec3(0.9,0.95,1.0);
        float md=length(uv-u_mouse);c+=exp(-md*8.0)*0.1;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'circuit-trace',
    name: 'PCB Layout',
    description: 'Printed circuit board trace layout with copper tracks, vias, pads and solder mask.',
    tags: ['tech', 'circuit', 'digital'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 grid=floor(gl_FragCoord.xy/15.0);
        vec2 local=mod(gl_FragCoord.xy,15.0)/15.0;
        float r=hash(grid);
        float trace=0.0;
        if(r<0.25)trace=step(abs(local.y-0.5),0.1);
        else if(r<0.5)trace=step(abs(local.x-0.5),0.1);
        else if(r<0.65){trace=step(abs(local.y-0.5),0.1);trace=max(trace,step(abs(local.x-0.5),0.1));}
        else if(r<0.8){float d=length(local-0.5);trace=smoothstep(0.25,0.2,d);}
        float via=smoothstep(0.15,0.1,length(local-0.5))*step(0.9,hash(grid*3.0));
        vec3 solder=vec3(0.0,0.35,0.15);
        vec3 copper=vec3(0.7,0.5,0.2);
        vec3 c=solder;
        c=mix(c,copper,trace);
        c=mix(c,vec3(0.8,0.75,0.3),via);
        float md=length(uv-u_mouse);c+=exp(-md*6.0)*vec3(0.2,0.1,0.0);
        float silk=step(0.98,hash(grid*7.0))*step(abs(local.x-0.5),0.3)*step(abs(local.y-0.5),0.15);
        c=mix(c,vec3(0.9),silk);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'sand-dunes',
    name: 'Sand Dunes',
    description: 'Wind-sculpted desert sand dunes with ripple marks, shadows and warm golden lighting.',
    tags: ['desert', 'nature', 'texture'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        vec2 p=uv*3.0+vec2(t,0.0);
        float dune=0.0;
        for(int i=0;i<4;i++){
          float fi=float(i);
          float freq=1.0+fi*1.5;
          dune+=sin(p.x*freq+noise(p*2.0+fi)*3.0)/(freq*1.5);
        }
        dune=dune*0.3+0.5;
        float ripple=sin(uv.x*80.0+noise(uv*20.0+t)*5.0)*0.01;
        float surface=uv.y-dune-ripple;
        float shadow=smoothstep(0.0,0.1,surface)*0.5+0.5;
        vec3 sand=mix(vec3(0.85,0.7,0.4),vec3(0.95,0.85,0.6),shadow);
        vec3 sky=mix(vec3(0.9,0.8,0.5),vec3(0.4,0.6,0.9),uv.y*2.0);
        vec3 c=surface>0.0?sky:sand*shadow;
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*vec3(0.2,0.15,0.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'barcode',
    name: 'Barcode',
    description: 'Animated barcode scanner with varying width lines, moving scan laser and encoded data.',
    tags: ['code', 'scan', 'digital'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float col=floor(gl_FragCoord.x/2.0);
        float barWidth=hash(vec2(col,0.0));
        float bar=step(0.5,barWidth);
        float inZone=step(0.2,uv.y)*step(uv.y,0.8);
        float scanX=mod(t*0.3,1.4)-0.2;
        float laser=exp(-pow((uv.x-scanX)*30.0,2.0))*step(0.15,uv.y)*step(uv.y,0.85);
        vec3 c=vec3(1.0-bar*inZone);
        c+=laser*vec3(1.0,0.0,0.0);
        float digit=step(0.05,uv.y)*step(uv.y,0.15);
        float digitBar=step(0.5,hash(vec2(floor(gl_FragCoord.x/6.0),1.0)));
        c=mix(c,vec3(1.0-digitBar),digit*0.3);
        float md=length(uv-u_mouse);c+=exp(-md*10.0)*vec3(0.0,0.1,0.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'lava-lamp',
    name: 'Lava Lamp',
    description: 'Retro lava lamp with floating metaball blobs rising and merging in warm viscous fluid.',
    tags: ['retro', 'metaball', 'organic'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        float t=u_time*0.5;
        float meta=0.0;
        for(int i=0;i<6;i++){
          float fi=float(i);
          vec2 pos=vec2(sin(t*0.7+fi*2.0)*0.2,sin(t*0.5+fi*1.3)*0.3+cos(t*0.3+fi)*0.1);
          float d=length(uv-pos);
          meta+=0.015/d;
        }
        vec2 mPos=(u_mouse-0.5)*vec2(u_resolution.x/u_resolution.y,1.0);
        meta+=0.02/length(uv-mPos);
        float blob=smoothstep(0.9,1.1,meta);
        vec3 warm=mix(vec3(0.8,0.2,0.0),vec3(1.0,0.6,0.0),meta*0.5);
        vec3 bg=mix(vec3(0.3,0.0,0.0),vec3(0.1,0.0,0.05),uv.y+0.5);
        vec3 c=mix(bg,warm,blob);
        c+=exp(-length(uv)*3.0)*vec3(0.1,0.02,0.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
];
