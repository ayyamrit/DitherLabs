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

export const shaderPack5: DitherShaderDef[] = [
  {
    id: 'topaz-gem',
    name: 'Gemstone Cut',
    description: 'Faceted gemstone with internal reflections, dispersion and brilliance fire effect.',
    tags: ['gem', 'crystal', 'luxury'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        float r=length(uv);float a=atan(uv.y,uv.x);float t=u_time;
        float facets=floor(a/(6.28/12.0));
        float facetAngle=facets*(6.28/12.0)+3.14159/12.0;
        vec2 facetNormal=vec2(cos(facetAngle),sin(facetAngle));
        float brightness=dot(normalize(uv-(u_mouse-0.5)*0.5),facetNormal)*0.5+0.5;
        float gem=smoothstep(0.35,0.33,r);
        float fire=sin(a*6.0+t*2.0+r*20.0)*0.5+0.5;
        vec3 gemColor=0.5+0.5*cos(brightness*3.0+fire*2.0+vec3(0,2,4)+facets*0.5);
        gemColor*=pow(brightness,0.5)*1.5;
        float crown=smoothstep(0.35,0.34,r)*smoothstep(0.33,0.34,r);
        vec3 c=vec3(0.02);c=mix(c,gemColor,gem);c+=crown*vec3(0.3);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'mushroom-spore',
    name: 'Spore Print',
    description: 'Mushroom spore print pattern with radial gill lines and organic spore distribution.',
    tags: ['nature', 'organic', 'mushroom'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 center=u_mouse;float d=length(uv-center);float a=atan(uv.y-center.y,uv.x-center.x);
        float gills=sin(a*30.0)*0.5+0.5;gills=pow(gills,0.3);
        float radial=smoothstep(0.4,0.1,d)*smoothstep(0.0,0.05,d);
        float spores=noise(gl_FragCoord.xy*0.5+sin(a*10.0)*5.0)*radial;
        float val=gills*radial*0.5+spores*0.5;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        val*=step(dt*0.2,val*0.4);
        vec3 paper=vec3(0.92,0.9,0.85);vec3 sporeCol=vec3(0.2,0.12,0.08);
        gl_FragColor=vec4(mix(paper,sporeCol,val),1.0);
      }`,
  },
  {
    id: 'sine-terrain',
    name: 'Sine Terrain',
    description: 'Wireframe 3D terrain made of overlapping sine waves with perspective projection.',
    tags: ['3d', 'wireframe', 'terrain'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 col=vec3(0.02,0.0,0.05);
        for(int i=0;i<30;i++){
          float fi=float(i)/30.0;
          float z=fi*2.0;float perspective=1.0/(z+0.5);
          float y=0.3+fi*0.5;
          float terrain=sin(uv.x*10.0*perspective+t+fi*2.0)*0.05*perspective;
          terrain+=sin(uv.x*20.0*perspective-t*0.5+fi)*0.02*perspective;
          terrain+=u_mouse.y*0.1*perspective;
          float lineY=y+terrain;
          float d=abs(uv.y-lineY);
          float line=exp(-d*200.0*perspective)*perspective;
          float hue=fi*2.0+t*0.2+uv.x*0.5;
          vec3 lineCol=0.5+0.5*cos(hue+vec3(0,2,4));
          col+=line*lineCol*0.5;
        }
        col=clamp(col,0.0,1.0);
        gl_FragColor=vec4(col,1.0);
      }`,
  },
  {
    id: 'tv-color-bars',
    name: 'Color Bars',
    description: 'Classic SMPTE television test pattern with color bars, pluge and reference signals.',
    tags: ['tv', 'test', 'broadcast'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float md=length(uv-u_mouse);
        float distort=sin(md*20.0-t*3.0)*exp(-md*5.0)*0.02;
        uv.x+=distort;
        vec3 c=vec3(0.0);
        if(uv.y>0.33){
          float bar=floor(uv.x*7.0);
          if(bar<1.0)c=vec3(0.75);
          else if(bar<2.0)c=vec3(0.75,0.75,0.0);
          else if(bar<3.0)c=vec3(0.0,0.75,0.75);
          else if(bar<4.0)c=vec3(0.0,0.75,0.0);
          else if(bar<5.0)c=vec3(0.75,0.0,0.75);
          else if(bar<6.0)c=vec3(0.75,0.0,0.0);
          else c=vec3(0.0,0.0,0.75);
        }else if(uv.y>0.25){
          float bar=floor(uv.x*7.0);
          c=mod(bar,2.0)<1.0?vec3(0.0,0.0,0.75):vec3(0.75);
        }else{
          float ramp=uv.x;c=vec3(ramp);
        }
        float scan=0.95+0.05*sin(gl_FragCoord.y*3.14);c*=scan;
        float noise=fract(sin(dot(floor(gl_FragCoord.xy),vec2(12.9,78.2)))*43758.5+t)*0.03;c+=noise;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'snowflake',
    name: 'Snowflake',
    description: 'Crystalline snowflake with 6-fold symmetry, dendritic branches and ice crystal detail.',
    tags: ['ice', 'crystal', 'nature'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        float r=length(uv);float a=atan(uv.y,uv.x);float t=u_time;
        // 6-fold symmetry
        float sa=mod(a+3.14159,1.0472)-0.5236;
        vec2 p=vec2(cos(sa),abs(sin(sa)))*r;
        // Dendritic branches
        float branch=exp(-abs(p.y)*60.0)*step(p.x,0.25)*step(0.0,p.x);
        // Sub-branches
        float sub=0.0;
        for(int i=1;i<5;i++){
          float fi=float(i)*0.05;
          float bx=fi;float by=abs(p.y-(p.x-fi)*0.6);
          sub+=exp(-by*80.0)*step(fi,p.x)*step(p.x,fi+0.04)*0.5;
        }
        float flake=(branch+sub)*smoothstep(0.3,0.0,r);
        // Rotation
        float rot=t*0.2;
        float md=length(uv-(u_mouse-0.5)*0.5);
        flake*=1.0+exp(-md*8.0)*0.5;
        vec3 ice=vec3(0.7,0.85,1.0);vec3 bg=vec3(0.05,0.08,0.15);
        vec3 c=mix(bg,ice,clamp(flake,0.0,1.0));
        c+=exp(-r*5.0)*vec3(0.1,0.15,0.25);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'cassette-tape',
    name: 'Tape Noise',
    description: 'Analog cassette tape playback with wow, flutter, tape hiss and magnetic dropout artifacts.',
    tags: ['analog', 'tape', 'audio'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        // Wow and flutter
        float wow=sin(t*2.0)*0.01;float flutter=sin(t*30.0)*0.002;
        uv.x+=wow+flutter;
        float md=length(uv-u_mouse);
        float signal=sin(md*15.0-t*2.0)*0.5+0.5;
        signal*=sin(uv.x*20.0+t)*0.3+0.7;
        // Tape hiss
        float hiss=hash(floor(gl_FragCoord.xy/2.0)+floor(t*30.0))*0.15;
        // Dropouts
        float dropout=step(0.97,hash(vec2(floor(uv.x*20.0),floor(t*3.0))))*0.5;
        float val=signal+hiss-dropout;val=clamp(val,0.0,1.0);
        // Tape color
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        val*=step(dt*0.3,val);
        vec3 c=mix(vec3(0.15,0.08,0.02),vec3(0.9,0.75,0.5),val);
        float edge=smoothstep(0.0,0.05,uv.y)*smoothstep(1.0,0.95,uv.y);c*=edge;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'maze',
    name: 'Infinite Maze',
    description: 'Procedurally generated maze with animated solution path and cursor-following explorer.',
    tags: ['maze', 'procedural', 'puzzle'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float cs=20.0;
        vec2 cell=floor(gl_FragCoord.xy/cs);vec2 local=mod(gl_FragCoord.xy,cs)/cs;
        float h=hash(cell+floor(u_time*0.3)*0.01);
        // Wall segments
        float wallH=step(abs(local.y-0.5),0.05)*step(0.5,h);
        float wallV=step(abs(local.x-0.5),0.05)*step(h,0.5);
        float border=step(local.x,0.05)+step(0.95,local.x)+step(local.y,0.05)+step(0.95,local.y);
        border=min(border,1.0)*0.3;
        float wall=max(max(wallH,wallV),border);
        float md=length(uv-u_mouse);float explorer=exp(-md*30.0);
        float path=exp(-md*5.0)*0.15;
        vec3 c=vec3(0.05,0.05,0.1);
        c+=wall*vec3(0.2,0.25,0.35);
        c+=path*vec3(0.0,0.3,0.5);
        c+=explorer*vec3(0.0,1.0,0.6);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'tiled-truchet',
    name: 'Truchet Tiles',
    description: 'Truchet tiling with randomly oriented quarter-circle arcs creating flowing labyrinthine paths.',
    tags: ['truchet', 'tiling', 'geometric'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float sc=30.0;
        vec2 cell=floor(gl_FragCoord.xy/sc);vec2 local=mod(gl_FragCoord.xy,sc)/sc;
        float h=hash(cell+floor(u_time*0.2)*0.01);
        if(h>0.5)local=1.0-local;
        float d1=length(local);float d2=length(local-1.0);
        float arc1=abs(d1-0.5);float arc2=abs(d2-0.5);
        float line=min(arc1,arc2);
        float val=smoothstep(0.06,0.03,line);
        float md=length(uv-u_mouse);
        float glow=exp(-md*5.0)*0.3;
        vec3 bg=vec3(0.02,0.02,0.05);
        vec3 lineCol=mix(vec3(0.8,0.4,0.0),vec3(0.0,0.6,0.9),sin(hash(cell)*10.0+u_time)*0.5+0.5);
        vec3 c=mix(bg,lineCol,val);c+=glow*lineCol;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'electric-plasma',
    name: 'Electric Plasma',
    description: 'High-voltage plasma discharge with branching tendrils and intense white-hot core energy.',
    tags: ['plasma', 'electric', 'energy'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 center=u_mouse;float d=length(uv-center);
        float a=atan(uv.y-center.y,uv.x-center.x);
        float tendrils=0.0;
        for(int i=0;i<6;i++){
          float fi=float(i);
          float ta=fi*1.047+t*(0.5+fi*0.1);
          float td=a-ta;td=mod(td+3.14159,6.28318)-3.14159;
          float branch=exp(-abs(td)*5.0)*exp(-d*4.0);
          float n=noise(vec2(a*5.0+fi*10.0,d*20.0+t*3.0));
          branch*=0.5+n*0.5;
          tendrils+=branch;
        }
        float core=exp(-d*20.0);
        float val=tendrils+core;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        val*=step(dt*0.05,val*0.15);
        vec3 c=vec3(0.01,0.0,0.03);
        c+=tendrils*vec3(0.3,0.4,1.0);
        c+=core*vec3(0.8,0.9,1.0)*2.0;
        c=clamp(c,0.0,1.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'op-art',
    name: 'Op Art',
    description: 'Optical illusion art with concentric patterns creating illusory motion and depth perception.',
    tags: ['optical', 'illusion', 'art'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        float t=u_time*0.5;
        vec2 center=(u_mouse-0.5)*vec2(u_resolution.x/u_resolution.y,1.0);
        uv-=center*0.3;
        float r=length(uv);float a=atan(uv.y,uv.x);
        float v1=sin(r*30.0-t*3.0);
        float v2=sin(a*8.0+r*10.0+t*2.0);
        float v3=sin((uv.x*uv.x+uv.y*uv.y)*50.0-t);
        float val=v1*v2+v3*0.3;
        float col=step(0.0,val);
        gl_FragColor=vec4(vec3(col),1.0);
      }`,
  },
  {
    id: 'broken-glass',
    name: 'Broken Glass',
    description: 'Shattered glass with irregular fracture lines, refraction distortion and edge highlights.',
    tags: ['glass', 'shatter', 'refraction'],
    fragmentShader: `${U}
      vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float sc=40.0;
        vec2 st=gl_FragCoord.xy/sc;vec2 ist=floor(st);vec2 fst=fract(st);
        float md=1.0;float sd=1.0;vec2 mId;
        for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
          vec2 nb=vec2(float(x),float(y));vec2 pt=hash2(ist+nb);
          float d=length(nb+pt-fst);
          if(d<md){sd=md;md=d;mId=ist+nb;}else if(d<sd)sd=d;
        }
        float crack=smoothstep(0.03,0.0,sd-md);
        vec2 h=hash2(mId);float tilt=h.x*0.02;
        vec2 refracted=uv+vec2(tilt,h.y*0.02);
        float dist=length(refracted-u_mouse);float val=sin(dist*15.0-u_time*2.0)*0.5+0.5;
        vec3 glass=vec3(0.85,0.88,0.9)*val;
        glass+=h.x*0.1;
        float edgeHighlight=exp(-abs(sd-md)*50.0)*0.3;
        vec3 c=glass*(1.0-crack*0.7);
        c+=crack*vec3(0.2);c+=edgeHighlight*vec3(1.0,0.95,0.9);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'pendulum-wave',
    name: 'Pendulum Wave',
    description: 'Synchronized pendulum wave machine creating mesmerizing phase patterns over time.',
    tags: ['physics', 'pendulum', 'wave'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.03,0.02,0.05);
        float total=15.0;
        for(int i=0;i<15;i++){
          float fi=float(i);
          float freq=1.0+fi*0.08;
          float px=fi/total;
          float angle=sin(t*freq)*0.3;
          vec2 pivot=vec2(px*0.8+0.1,0.9);
          vec2 bob=pivot+vec2(sin(angle),cos(angle))*0.35;
          // String
          vec2 pa=uv-pivot;vec2 ba=bob-pivot;
          float proj=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
          float stringDist=length(pa-ba*proj);
          c+=exp(-stringDist*200.0)*vec3(0.15,0.15,0.2);
          // Bob
          float bd=length(uv-bob);
          float bobGlow=exp(-bd*60.0);
          float hue=fi/total*3.0+t*0.3;
          vec3 bobCol=0.5+0.5*cos(hue+vec3(0,2,4));
          c+=bobGlow*bobCol;
        }
        float md=length(uv-u_mouse);c+=exp(-md*10.0)*vec3(0.1,0.05,0.15);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
];
