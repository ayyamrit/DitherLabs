import type { DitherShaderDef } from './ditherShaders';

export const shaderPack35: DitherShaderDef[] = [
  {
    id: 'fibonacci-spiral-35',
    name: 'Fibonacci Spiral',
    description: 'Golden ratio spiral with phyllotaxis pattern.',
    tags: ['2d', 'math', 'spiral'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float golden=2.39996;
        vec3 col=vec3(0.02,0.01,0.03);
        for(float i=0.0;i<80.0;i++){
          float angle=i*golden+u_time*0.3;
          float rad=sqrt(i)*0.05;
          vec2 p=vec2(cos(angle),sin(angle))*rad;
          float d=length(uv-p);
          float size=0.015+0.005*sin(i+u_time);
          col+=vec3(0.8,0.6,0.2)*smoothstep(size,size*0.5,d);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'reaction-diffusion-35',
    name: 'Reaction Diffusion',
    description: 'Turing pattern-like spots and stripes.',
    tags: ['2d', 'organic', 'turing'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float n1=noise(uv*10.0+u_time*0.2);
        float n2=noise(uv*20.0-u_time*0.3);
        float pattern=sin(n1*15.0)*cos(n2*15.0);
        pattern=smoothstep(-0.1,0.1,pattern);
        vec3 col=mix(vec3(0.1,0.05,0.0),vec3(0.9,0.7,0.3),pattern);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'glass-refract-35',
    name: 'Glass Refraction',
    description: 'Frosted glass distortion effect.',
    tags: ['2d', 'glass', 'distortion'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float n=noise(uv*30.0+u_time*0.5);
        vec2 distort=vec2(noise(uv*15.0+u_time*0.3),noise(uv*15.0+vec2(5.0)+u_time*0.3))*0.05;
        vec2 p=uv+distort;
        float stripe=sin(p.x*40.0+p.y*10.0)*0.5+0.5;
        float circle=length(p-0.5);
        vec3 col=mix(vec3(0.2,0.4,0.8),vec3(0.9,0.9,1.0),stripe*0.5+n*0.5);
        col+=vec3(0.1)*smoothstep(0.3,0.0,circle);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'terrain-erosion-35',
    name: 'Terrain Erosion',
    description: 'Eroded landscape with river valleys.',
    tags: ['2d', 'terrain', 'landscape'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float h=fbm(uv*4.0+u_time*0.05);
        float ridge=abs(fbm(uv*6.0+vec2(u_time*0.03,0.0))-0.5)*2.0;
        h=h*0.7+ridge*0.3;
        vec3 water=vec3(0.1,0.3,0.6);
        vec3 sand=vec3(0.76,0.7,0.5);
        vec3 grass=vec3(0.2,0.5,0.1);
        vec3 rock=vec3(0.5,0.45,0.4);
        vec3 snow=vec3(0.95,0.95,0.98);
        vec3 col=h<0.3?mix(water,sand,(h-0.1)/0.2):h<0.5?mix(sand,grass,(h-0.3)/0.2):h<0.7?mix(grass,rock,(h-0.5)/0.2):mix(rock,snow,(h-0.7)/0.3);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'op-art-35',
    name: 'Op Art Illusion',
    description: 'Optical art creating motion illusion from static pattern.',
    tags: ['2d', 'optical', 'illusion'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float v=sin(r*30.0-u_time*2.0)+sin(a*10.0+u_time);
        v+=sin(r*20.0+a*5.0-u_time*3.0);
        v=step(0.0,v);
        gl_FragColor=vec4(vec3(v),1.0);
      }
    `
  },
  {
    id: 'aurora-35',
    name: 'Aurora Borealis',
    description: 'Northern lights with flowing curtains of color.',
    tags: ['2d', 'nature', 'aurora'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float n=noise(vec2(uv.x*3.0+u_time*0.2,u_time*0.1));
        float n2=noise(vec2(uv.x*5.0-u_time*0.3,u_time*0.15+5.0));
        float curtain=exp(-pow((uv.y-0.6-n*0.2)*5.0,2.0));
        float curtain2=exp(-pow((uv.y-0.5-n2*0.15)*6.0,2.0));
        vec3 col=vec3(0.0,0.0,0.05);
        col+=vec3(0.1,0.8,0.3)*curtain*0.7;
        col+=vec3(0.3,0.2,0.8)*curtain2*0.5;
        col+=vec3(0.8,0.2,0.5)*curtain*curtain2;
        float stars=step(0.99,hash(floor(gl_FragCoord.xy)));
        col+=vec3(stars)*0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'stipple-portrait-35',
    name: 'Stipple Shading',
    description: 'Dense stippling technique for value rendering.',
    tags: ['2d', 'artistic', 'stipple'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float val=noise(uv*3.0+u_time*0.15);
        val=val*0.5+noise(uv*6.0-u_time*0.1)*0.3+0.1;
        float dotSize=2.0;
        vec2 cell=floor(gl_FragCoord.xy/dotSize);
        float rnd=hash(cell);
        float stipple=step(rnd,val);
        gl_FragColor=vec4(vec3(stipple*0.9+0.05),1.0);
      }
    `
  },
  {
    id: 'butterfly-wings-35',
    name: 'Butterfly Wings',
    description: 'Symmetrical wing patterns with iridescent colors.',
    tags: ['2d', 'organic', 'symmetry'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        uv.x=abs(uv.x);
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float wing=sin(a*3.0)*0.3+0.4;
        float inWing=smoothstep(wing,wing-0.05,r)*smoothstep(0.05,0.1,r);
        float pattern=sin(r*20.0-u_time*2.0)*sin(a*8.0+u_time);
        pattern=pattern*0.5+0.5;
        float iridescent=sin(r*30.0+a*5.0+u_time)*0.5+0.5;
        vec3 col=vec3(0.05);
        vec3 wingCol=mix(vec3(0.1,0.2,0.8),vec3(0.9,0.3,0.1),iridescent);
        wingCol*=0.5+pattern*0.5;
        col=mix(col,wingCol,inWing);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'mandala-35',
    name: 'Rotating Mandala',
    description: 'Intricate mandala with multiple symmetry layers.',
    tags: ['2d', 'mandala', 'symmetry'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x)+u_time*0.2;
        float v=0.0;
        v+=sin(a*6.0)*sin(r*15.0-u_time*2.0);
        v+=sin(a*12.0+u_time)*sin(r*10.0);
        v+=cos(a*8.0-u_time*0.5)*cos(r*20.0-u_time*3.0)*0.5;
        v=v/2.5*0.5+0.5;
        v*=smoothstep(0.8,0.3,r);
        vec3 col=mix(vec3(0.8,0.2,0.1),vec3(0.1,0.2,0.8),v);
        col=mix(col,vec3(1.0,0.8,0.2),pow(v,3.0));
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'magnetic-field-35',
    name: 'Magnetic Field Lines',
    description: 'Iron filing patterns around magnetic poles.',
    tags: ['2d', 'physics', 'magnetic'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec2 p1=vec2(-0.3,0.0);
        vec2 p2=vec2(0.3,0.0);
        vec2 d1=uv-p1;vec2 d2=uv-p2;
        float r1=length(d1);float r2=length(d2);
        vec2 field=d1/(r1*r1*r1+0.001)-d2/(r2*r2*r2+0.001);
        float angle=atan(field.y,field.x);
        float lines=sin(angle*10.0+u_time)*0.5+0.5;
        float strength=length(field);
        strength=clamp(strength*0.1,0.0,1.0);
        vec3 col=vec3(0.05);
        col+=vec3(0.3,0.5,0.9)*lines*strength;
        col+=vec3(0.9,0.2,0.1)*0.02/(r1+0.01);
        col+=vec3(0.1,0.2,0.9)*0.02/(r2+0.01);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'glitch-blocks-35',
    name: 'Glitch Blocks',
    description: 'Digital glitch art with displaced color blocks.',
    tags: ['2d', 'glitch', 'digital'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float t=floor(u_time*4.0);
        float blockY=floor(uv.y*15.0);
        float shift=step(0.8,hash(blockY+t))*hash(blockY*3.0+t)*0.3;
        float shiftR=shift*(hash(t+1.0)*2.0-1.0);
        float shiftB=shift*(hash(t+2.0)*2.0-1.0);
        float r=sin((uv.x+shiftR)*10.0+uv.y*5.0)*0.5+0.5;
        float g=sin(uv.x*10.0+uv.y*5.0)*0.5+0.5;
        float b=sin((uv.x+shiftB)*10.0+uv.y*5.0)*0.5+0.5;
        vec3 col=vec3(r,g,b);
        col*=0.8+0.2*step(0.95,hash(floor(uv*vec2(40.0,20.0)).x+t));
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'wood-grain-35',
    name: 'Wood Grain',
    description: 'Natural wood grain texture with knots.',
    tags: ['2d', 'texture', 'organic'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 p=uv*vec2(2.0,8.0)+u_time*0.05;
        float n=noise(p*2.0)*0.5;
        float grain=sin((p.y+n)*40.0)*0.5+0.5;
        float knot=smoothstep(0.2,0.0,length(uv-vec2(0.5,0.5+sin(u_time*0.2)*0.2)));
        grain=mix(grain,noise(uv*20.0),knot*0.5);
        vec3 light=vec3(0.8,0.6,0.3);
        vec3 dark=vec3(0.4,0.25,0.1);
        vec3 col=mix(dark,light,grain);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'wave-collapse-35',
    name: 'Wave Collapse',
    description: 'Quantum wave function collapse visualization.',
    tags: ['2d', 'quantum', 'physics'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float prob=0.0;
        for(float n=1.0;n<8.0;n++){
          float wave=sin(uv.x*n*3.14159*2.0)*sin(uv.y*n*3.14159*2.0);
          float phase=sin(u_time*n*0.5);
          prob+=wave*phase/n;
        }
        prob=prob*0.5+0.5;
        float collapse=smoothstep(0.0,1.0,sin(u_time*0.5)*0.5+0.5);
        prob=mix(prob,step(0.5,prob),collapse);
        vec3 col=mix(vec3(0.0,0.1,0.3),vec3(0.0,0.8,1.0),prob);
        col+=vec3(1.0,0.5,0.0)*pow(prob,4.0)*collapse;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'stained-glass-35',
    name: 'Stained Glass',
    description: 'Gothic stained glass window with lead borders.',
    tags: ['2d', 'artistic', 'glass'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*6.0;
        vec2 ip=floor(uv);vec2 fp=fract(uv);
        float md=8.0;float md2=8.0;vec2 mc;
        for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
          vec2 nb=vec2(float(i),float(j));
          vec2 o=hash2(ip+nb);
          o=0.5+0.3*sin(u_time*0.3+6.28*o);
          float d=length(nb+o-fp);
          if(d<md){md2=md;md=d;mc=o;}
          else if(d<md2)md2=d;
        }
        float edge=md2-md;
        float lead=1.0-smoothstep(0.0,0.05,edge);
        vec3 glass=vec3(mc.x*0.8+0.2,0.3,mc.y*0.8+0.2);
        glass*=0.8+0.2*sin(u_time+mc.x*6.28);
        vec3 col=mix(glass,vec3(0.15),lead);
        float light=0.7+0.3*sin(u_time*0.5);
        col*=light;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'flame-35',
    name: 'Flame Tongues',
    description: 'Realistic fire flames licking upward.',
    tags: ['2d', 'fire', 'organic'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 p=vec2(uv.x*3.0,(1.0-uv.y)*2.0);
        p.y+=u_time*2.0;
        float f=fbm(p);
        f+=fbm(p*2.0)*0.5;
        float flame=f*(1.0-uv.y);
        flame=smoothstep(0.2,0.8,flame);
        vec3 col=mix(vec3(0.0),vec3(1.0,0.2,0.0),flame);
        col=mix(col,vec3(1.0,0.8,0.0),flame*flame);
        col=mix(col,vec3(1.0,1.0,0.8),pow(flame,4.0));
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'topographic-35',
    name: 'Topo Map Neon',
    description: 'Neon-colored topographic contour map.',
    tags: ['2d', 'map', 'neon'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float h=fbm(uv*4.0+u_time*0.1);
        float contour=fract(h*10.0);
        float line=smoothstep(0.02,0.0,abs(contour-0.5));
        vec3 col=vec3(0.02,0.0,0.05);
        col+=vec3(0.0,1.0,0.5)*line;
        col+=vec3(0.5,0.0,1.0)*smoothstep(0.5,0.8,h)*0.3;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'ocean-waves-35',
    name: 'Ocean Surface',
    description: 'Ocean waves viewed from above with foam.',
    tags: ['2d', 'water', 'ocean'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float wave=0.0;
        wave+=sin(uv.x*8.0+uv.y*3.0+u_time*1.5)*0.3;
        wave+=sin(uv.x*5.0-uv.y*7.0+u_time*2.0)*0.2;
        wave+=noise(uv*10.0+u_time*0.5)*0.3;
        float foam=smoothstep(0.5,0.7,wave);
        vec3 deep=vec3(0.0,0.15,0.4);
        vec3 shallow=vec3(0.0,0.4,0.5);
        vec3 col=mix(deep,shallow,wave*0.5+0.5);
        col=mix(col,vec3(0.9,0.95,1.0),foam*0.7);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'sierpinski-35',
    name: 'Sierpinski Triangle',
    description: 'Animated Sierpinski triangle fractal.',
    tags: ['2d', 'fractal', 'triangle'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float s=sin(u_time*0.3),c=cos(u_time*0.3);
        uv=mat2(c,-s,s,c)*uv;
        uv=uv*1.5+vec2(0.5);
        float col=1.0;
        for(int i=0;i<12;i++){
          uv*=2.0;
          if(uv.x>1.0)uv.x-=1.0;
          if(uv.y>1.0)uv.y-=1.0;
          if(uv.x+uv.y>1.0)col*=0.0;
        }
        vec3 c3=mix(vec3(0.1,0.0,0.2),vec3(0.0,0.8,0.4),col);
        gl_FragColor=vec4(c3,1.0);
      }
    `
  },
  {
    id: 'dot-matrix-35',
    name: 'LED Dot Matrix',
    description: 'LED dot matrix display with scrolling text-like patterns.',
    tags: ['2d', 'digital', 'retro'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float dotSize=0.015;
        vec2 grid=floor(uv/dotSize);
        vec2 center=grid*dotSize+dotSize*0.5;
        float d=length(gl_FragCoord.xy/u_resolution-center);
        float dot=smoothstep(dotSize*0.4,dotSize*0.3,d);
        float scrollX=grid.x-u_time*8.0;
        float pattern=step(0.4,hash(vec2(floor(scrollX),grid.y)));
        float wave=sin(grid.x*0.3-u_time*2.0)*0.5+0.5;
        float on=max(pattern,step(grid.y/u_resolution.y*dotSize,wave*0.3)*step(0.7,wave));
        vec3 offCol=vec3(0.05,0.0,0.0);
        vec3 onCol=vec3(1.0,0.1,0.0);
        vec3 col=mix(offCol,onCol,on)*dot;
        gl_FragColor=vec4(col,1.0);
      }
    `
  }
];
