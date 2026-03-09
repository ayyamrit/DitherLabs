import type { DitherShaderDef } from './ditherShaders';

export const shaderPack43: DitherShaderDef[] = [
  {
    id: 'tesseract-43',
    name: 'Tesseract Projection',
    description: '4D hypercube projected to 2D.',
    tags: ['2d', 'math', '4d'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        vec3 col=vec3(0.02,0.0,0.05);
        float s1=sin(u_time*0.5),c1=cos(u_time*0.5);
        float s2=sin(u_time*0.3),c2=cos(u_time*0.3);
        for(float i=0.0;i<16.0;i++){
          float x=mod(i,2.0)*2.0-1.0;
          float y=mod(floor(i/2.0),2.0)*2.0-1.0;
          float z=mod(floor(i/4.0),2.0)*2.0-1.0;
          float w=mod(floor(i/8.0),2.0)*2.0-1.0;
          float nw=w*c1-z*s1;float nz=w*s1+z*c1;
          float nx=x*c2-nw*s2;float nnw=x*s2+nw*c2;
          float proj=2.0/(3.0-nnw);
          vec2 p=vec2(nx,y)*proj*0.3;
          float d=length(uv-p);
          col+=vec3(0.3,0.5,1.0)*0.003/(d+0.003);
          for(float j=i+1.0;j<16.0;j++){
            float diff=0.0;
            if(mod(i,2.0)!=mod(j,2.0))diff+=1.0;
            if(mod(floor(i/2.0),2.0)!=mod(floor(j/2.0),2.0))diff+=1.0;
            if(mod(floor(i/4.0),2.0)!=mod(floor(j/4.0),2.0))diff+=1.0;
            if(mod(floor(i/8.0),2.0)!=mod(floor(j/8.0),2.0))diff+=1.0;
            if(diff==1.0){
              float x2=mod(j,2.0)*2.0-1.0;
              float y2=mod(floor(j/2.0),2.0)*2.0-1.0;
              float z2=mod(floor(j/4.0),2.0)*2.0-1.0;
              float w2=mod(floor(j/8.0),2.0)*2.0-1.0;
              float nw2=w2*c1-z2*s1;float nz2=w2*s1+z2*c1;
              float nx2=x2*c2-nw2*s2;float nnw2=x2*s2+nw2*c2;
              float proj2=2.0/(3.0-nnw2);
              vec2 p2=vec2(nx2,y2)*proj2*0.3;
              vec2 pa=uv-p;vec2 ba=p2-p;
              float t=clamp(dot(pa,ba)/dot(ba,ba),0.0,1.0);
              float ld=length(pa-ba*t);
              col+=vec3(0.1,0.2,0.5)*smoothstep(0.005,0.0,ld)*0.3;
            }
          }
        }
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'circuit-brain-43',
    name: 'Digital Brain',
    description: 'Brain-shaped circuit with firing synapses.',
    tags: ['2d', 'tech', 'brain'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv*vec2(1.0,1.3));
        float brain=smoothstep(0.35,0.33,r);
        float folds=noise(uv*8.0+u_time*0.1);
        float wrinkle=smoothstep(0.48,0.5,folds)*brain;
        float synapse=0.0;
        for(float i=0.0;i<10.0;i++){
          float sa=hash(vec2(i,0.0))*6.28;
          float sr=hash(vec2(i,1.0))*0.25;
          vec2 sp=vec2(cos(sa),sin(sa))*sr;
          float fire=pow(max(sin(u_time*5.0+i*3.0),0.0),8.0);
          synapse+=0.003/(length(uv-sp)+0.003)*fire*brain;
        }
        vec3 col=vec3(0.05,0.0,0.1);
        col+=vec3(0.3,0.2,0.4)*brain;
        col+=vec3(0.2,0.15,0.3)*wrinkle;
        col+=vec3(0.0,0.8,1.0)*synapse;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'neon-highway-43',
    name: 'Neon Highway',
    description: 'Neon-lit highway at night with traffic.',
    tags: ['2d', 'urban', 'neon'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float perspective=0.2/(uv.y+0.01);
        vec2 road=vec2((uv.x-0.5)*perspective,perspective+u_time*5.0);
        vec3 col=vec3(0.02,0.02,0.05);
        float lane=smoothstep(0.02,0.0,abs(fract(road.y*0.3)-0.5))*step(abs(uv.x-0.5),0.15*1.0/(perspective*0.1+1.0));
        col+=vec3(1.0,1.0,0.0)*lane*0.5*step(uv.y,0.5);
        float roadSurf=step(abs(uv.x-0.5),0.2/(perspective*0.05+1.0))*step(uv.y,0.5);
        col+=vec3(0.03)*roadSurf;
        for(float i=0.0;i<5.0;i++){
          float carZ=fract(-u_time*0.5+hash(i)*3.0);
          float carPersp=0.2/(carZ+0.01);
          float carX=0.5+(hash(i+5.0)-0.5)*0.15;
          float carY=carZ;
          vec2 carPos=vec2(carX,carY);
          if(carY<0.5){
            float d=length((uv-carPos)*vec2(carPersp*0.5,carPersp));
            col+=vec3(1.0,0.1,0.0)*0.005/(d+0.005);
          }
        }
        float horizon=exp(-abs(uv.y-0.5)*20.0);
        col+=vec3(0.5,0.2,0.0)*horizon*0.3;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'frost-crystal-43',
    name: 'Frost Crystals',
    description: 'Ice crystals forming on a window.',
    tags: ['2d', 'nature', 'frost'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*8.0;
        vec2 ip=floor(uv);vec2 fp=fract(uv);
        float md=8.0;float md2=8.0;vec2 mc;
        for(int j=-1;j<=1;j++)for(int i=-1;i<=1;i++){
          vec2 nb=vec2(float(i),float(j));
          vec2 o=hash2(ip+nb);
          o=0.5+0.4*sin(u_time*0.1+6.28*o);
          float d=length(nb+o-fp);
          if(d<md){md2=md;md=d;mc=o;}
          else if(d<md2)md2=d;
        }
        float edge=md2-md;
        float crystal=exp(-edge*15.0);
        float dendrite=sin(atan(fp.y-mc.y,fp.x-mc.x)*6.0+md*20.0)*0.5+0.5;
        dendrite*=crystal;
        vec3 glass=vec3(0.15,0.2,0.3);
        vec3 ice=vec3(0.8,0.9,1.0);
        vec3 col=mix(glass,ice,crystal*0.5+dendrite*0.3);
        col+=vec3(0.3,0.4,0.5)*pow(crystal,3.0);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'tape-loop-43',
    name: 'Tape Loop',
    description: 'Audio tape loop with warble and wow.',
    tags: ['2d', 'retro', 'audio'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float wow=sin(u_time*2.0)*0.02;
        float flutter=sin(u_time*20.0)*0.005;
        float tape_y=uv.y+wow+flutter;
        float stripe=sin(tape_y*200.0)*0.5+0.5;
        float mag=sin(uv.x*50.0-u_time*10.0)*0.5+0.5;
        float tape_edge=step(0.3,uv.y)*step(uv.y,0.7);
        float guide=smoothstep(0.005,0.0,abs(uv.y-0.3))+smoothstep(0.005,0.0,abs(uv.y-0.7));
        vec3 col=vec3(0.2,0.15,0.1);
        vec3 tapeCol=vec3(0.15,0.1,0.08)*stripe*0.5+vec3(0.1);
        tapeCol+=vec3(0.05,0.0,0.0)*mag;
        col=mix(col,tapeCol,tape_edge);
        col+=vec3(0.3,0.25,0.2)*guide;
        float reel_l=smoothstep(0.12,0.1,length(uv-vec2(0.2,0.5)));
        float reel_r=smoothstep(0.12,0.1,length(uv-vec2(0.8,0.5)));
        float hub_l=smoothstep(0.04,0.03,length(uv-vec2(0.2,0.5)));
        float hub_r=smoothstep(0.04,0.03,length(uv-vec2(0.8,0.5)));
        col=mix(col,vec3(0.3,0.25,0.2),max(reel_l,reel_r));
        col=mix(col,vec3(0.5,0.45,0.4),max(hub_l,hub_r));
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'tile-flip-43',
    name: 'Tile Flip',
    description: 'Tiles flipping to reveal different colors.',
    tags: ['2d', 'geometric', 'animation'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*6.0;
        vec2 id=floor(uv);
        vec2 f=fract(uv);
        float delay=hash(id)*3.0;
        float flip=sin(u_time*2.0+delay);
        float front=step(0.0,flip);
        float scaleX=abs(flip);
        vec2 scaled=vec2((f.x-0.5)*scaleX+0.5,f.y);
        float tile=step(0.05,scaled.x)*step(scaled.x,0.95)*step(0.05,scaled.y)*step(scaled.y,0.95);
        tile*=step(0.1,scaleX);
        vec3 frontCol=0.5+0.5*cos(6.28*(hash(id)+vec3(0.0,0.33,0.67)));
        vec3 backCol=0.5+0.5*cos(6.28*(hash(id+vec2(10,10))+vec3(0.0,0.33,0.67)));
        vec3 tileCol=front>0.5?frontCol:backCol;
        vec3 col=vec3(0.15);
        col=mix(col,tileCol,tile);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'waterfall-43',
    name: 'Waterfall',
    description: 'Cascading waterfall with mist.',
    tags: ['2d', 'nature', 'water'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.15,0.25,0.1);
        float cliff=step(0.3,abs(uv.x-0.5));
        col=mix(col,vec3(0.3,0.25,0.2),cliff);
        float waterX=smoothstep(0.2,0.15,abs(uv.x-0.5));
        float flow=noise(vec2(uv.x*10.0,uv.y*5.0-u_time*3.0));
        float water=waterX*flow;
        vec3 waterCol=vec3(0.5,0.7,0.9)+vec3(0.3)*flow;
        col=mix(col,waterCol,waterX*0.8);
        float foam=noise(vec2(uv.x*20.0,(1.0-uv.y)*3.0-u_time*5.0));
        foam=smoothstep(0.6,0.8,foam)*waterX;
        col=mix(col,vec3(0.9,0.95,1.0),foam*0.5);
        float mist=exp(-pow((uv.y-0.1)*5.0,2.0))*0.3;
        col+=vec3(0.5,0.6,0.7)*mist;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'grid-morph-43',
    name: 'Grid Morph',
    description: 'Regular grid morphing and distorting.',
    tags: ['2d', 'geometric', 'morph'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float distort=sin(r*10.0-u_time*2.0)*0.1;
        vec2 warped=uv*(1.0+distort);
        float grid=smoothstep(0.02,0.01,abs(fract(warped.x*5.0)-0.5));
        grid+=smoothstep(0.02,0.01,abs(fract(warped.y*5.0)-0.5));
        grid=min(grid,1.0);
        float node=smoothstep(0.05,0.03,length(fract(warped*5.0)-0.5));
        vec3 col=vec3(0.05,0.0,0.1);
        col+=vec3(0.0,0.5,0.8)*grid*0.5;
        col+=vec3(0.0,0.8,1.0)*node;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'neon-rain-43',
    name: 'Neon Rain',
    description: 'Colorful neon-lit rain streaks.',
    tags: ['2d', 'neon', 'rain'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.02,0.01,0.05);
        for(float i=0.0;i<30.0;i++){
          float x=hash(i);
          float speed=2.0+hash(i+30.0)*3.0;
          float y=fract(-u_time*speed*0.3+hash(i+60.0));
          float len=0.05+hash(i+90.0)*0.05;
          float inStreak=step(abs(uv.x-x),0.002)*step(y-len,uv.y)*step(uv.y,y);
          float brightness=1.0-abs(uv.y-y)/len;
          vec3 streakCol=0.5+0.5*cos(6.28*(hash(i+120.0)+vec3(0.0,0.33,0.67)));
          col+=streakCol*inStreak*brightness;
          col+=streakCol*0.005/(length(uv-vec2(x,y))+0.005);
        }
        float puddle=step(uv.y,0.05);
        col+=vec3(0.1,0.1,0.15)*puddle;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'spiral-clock-43',
    name: 'Spiral Clock',
    description: 'Time spiral with rotating markers.',
    tags: ['2d', 'time', 'spiral'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        vec3 col=vec3(0.05,0.05,0.08);
        float spiral_r=mod(a+u_time,6.28)/(6.28)*0.4;
        float spiral=smoothstep(0.01,0.0,abs(r-spiral_r));
        col+=vec3(0.5,0.3,0.8)*spiral;
        for(float i=0.0;i<12.0;i++){
          float ma=i*0.5236+u_time*0.1;
          float mr=0.35;
          vec2 mp=vec2(cos(ma),sin(ma))*mr;
          float md=length(uv-mp);
          col+=vec3(0.8,0.6,0.2)*smoothstep(0.02,0.01,md);
        }
        float hand1_a=u_time;
        float hand1=smoothstep(0.005,0.0,abs(a-mod(hand1_a,6.28)+3.14))*step(r,0.3);
        float hand2_a=u_time*0.083;
        float hand2=smoothstep(0.008,0.0,abs(a-mod(hand2_a,6.28)+3.14))*step(r,0.2);
        col+=vec3(1.0,0.8,0.3)*hand1;
        col+=vec3(0.8,0.4,0.1)*hand2;
        float center=smoothstep(0.02,0.01,r);
        col+=vec3(0.9,0.7,0.3)*center;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'batik-43',
    name: 'Batik Pattern',
    description: 'Indonesian batik wax-resist dyeing pattern.',
    tags: ['2d', 'traditional', 'batik'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution*4.0;
        vec2 id=floor(uv);
        vec2 f=fract(uv)-0.5;
        float medallion=smoothstep(0.4,0.35,length(f));
        float inner=smoothstep(0.2,0.15,length(f));
        float a=atan(f.y,f.x);
        float petals=smoothstep(0.3,0.28,length(f)-abs(sin(a*4.0+u_time*0.3))*0.1);
        float crackle=noise(uv*20.0)*0.15;
        vec3 fabric=vec3(0.15,0.08,0.02);
        vec3 wax=vec3(0.7,0.5,0.2);
        vec3 dye=vec3(0.5,0.15,0.05);
        vec3 col=fabric;
        col=mix(col,dye,medallion);
        col=mix(col,wax,petals*0.5);
        col=mix(col,vec3(0.8,0.6,0.3),inner*0.3);
        col+=crackle;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'tilt-shift-43',
    name: 'Tilt Shift',
    description: 'Miniature tilt-shift lens blur effect.',
    tags: ['2d', 'photography', 'blur'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p);vec2 f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float focus=abs(uv.y-0.5)*2.0;
        float blur=focus*focus*4.0;
        float n=noise(uv*20.0+u_time*0.2);
        float pix=max(1.0,blur*8.0);
        vec2 pixUV=floor(gl_FragCoord.xy/pix)*pix/u_resolution;
        float scene=noise(pixUV*5.0+u_time*0.1);
        float buildings=step(pixUV.y,0.3+scene*0.2);
        vec3 col=mix(vec3(0.4,0.6,1.0),vec3(0.5,0.5,0.55),buildings);
        col=mix(col,vec3(0.3,0.5,0.2),step(pixUV.y,0.2));
        float sat=1.3;
        float lum=dot(col,vec3(0.3,0.6,0.1));
        col=mix(vec3(lum),col,sat);
        float vignette=1.0-dot(uv-0.5,uv-0.5);
        col*=vignette;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'electromagnetic-43',
    name: 'EM Wave',
    description: 'Electromagnetic wave propagation.',
    tags: ['2d', 'physics', 'wave'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float x=uv.x;
        float eField=sin(x*15.0-u_time*5.0)*0.15;
        float bField=sin(x*15.0-u_time*5.0)*0.15;
        float eLine=smoothstep(0.005,0.0,abs(uv.y-eField));
        float bLine=smoothstep(0.005,0.0,abs(uv.y-bField));
        vec3 col=vec3(0.02,0.02,0.05);
        col+=vec3(0.0,0.1,0.0)*smoothstep(0.003,0.0,abs(uv.y));
        col+=vec3(0.1,0.0,0.0)*smoothstep(0.003,0.0,abs(uv.x));
        col+=vec3(1.0,0.3,0.0)*eLine;
        col+=vec3(0.0,0.3,1.0)*smoothstep(0.005,0.0,abs(uv.x*0.5-bField));
        float arrow_space=0.15;
        float arrow_x=fract(x/arrow_space)*arrow_space;
        float arrow_pos=floor(x/arrow_space)*arrow_space+arrow_space*0.5;
        float eVal=sin(arrow_pos*15.0-u_time*5.0)*0.15;
        float arrow=smoothstep(0.003,0.0,abs(uv.x-arrow_pos))*step(min(0.0,eVal),uv.y)*step(uv.y,max(0.0,eVal));
        col+=vec3(1.0,0.5,0.2)*arrow*0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'vinyl-record-43',
    name: 'Vinyl Record',
    description: 'Spinning vinyl record with grooves.',
    tags: ['2d', 'retro', 'music'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x)+u_time;
        vec3 col=vec3(0.5,0.5,0.55);
        float disc=smoothstep(0.42,0.4,r);
        float label=smoothstep(0.12,0.1,r);
        float hole=smoothstep(0.02,0.015,r);
        float groove=sin(r*300.0-a*0.5)*0.5+0.5;
        groove*=disc*(1.0-label);
        float light=0.5+0.5*cos(a-1.0);
        vec3 vinyl=vec3(0.02,0.02,0.03);
        vinyl+=vec3(0.05)*groove;
        vinyl+=vec3(0.1,0.1,0.12)*light*disc;
        vec3 labelCol=vec3(0.8,0.1,0.1);
        labelCol+=vec3(0.1)*sin(a*3.0)*label;
        col=mix(col,vinyl,disc);
        col=mix(col,labelCol,label);
        col=mix(col,vec3(0.3),hole);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'hypnotic-spiral-43',
    name: 'Hypnotic Spiral',
    description: 'Mind-bending hypnotic black and white spiral.',
    tags: ['2d', 'optical', 'spiral'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      void main(){
        vec2 uv=(gl_FragCoord.xy-0.5*u_resolution)/u_resolution.y;
        float r=length(uv);
        float a=atan(uv.y,uv.x);
        float spiral=sin(a*3.0+r*20.0-u_time*3.0);
        float v=step(0.0,spiral);
        float fade=smoothstep(0.8,0.0,r);
        v=mix(0.5,v,fade);
        gl_FragColor=vec4(vec3(v),1.0);
      }
    `
  },
  {
    id: 'conveyor-43',
    name: 'Conveyor Belt',
    description: 'Industrial conveyor belt with moving items.',
    tags: ['2d', 'industrial', 'animation'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(float n){return fract(sin(n)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.2,0.2,0.22);
        float belt_y=step(0.35,uv.y)*step(uv.y,0.55);
        float roller=sin(uv.x*30.0-u_time*10.0)*0.3+0.7;
        col=mix(col,vec3(0.15)*roller,belt_y);
        float tread=step(0.5,fract(uv.x*20.0-u_time*3.0))*belt_y;
        col+=vec3(0.05)*tread;
        for(float i=0.0;i<5.0;i++){
          float x=fract(-u_time*0.3+i*0.25+hash(i)*0.1);
          float size=0.03+hash(i+5.0)*0.02;
          float box_d=max(abs(uv.x-x),abs(uv.y-0.55-size))-size;
          float box=smoothstep(0.005,0.0,box_d);
          vec3 boxCol=0.5+0.3*cos(6.28*(hash(i+10.0)+vec3(0.0,0.33,0.67)));
          col=mix(col,boxCol,box);
        }
        float frame=step(abs(uv.y-0.35),0.01)+step(abs(uv.y-0.55),0.01);
        col=mix(col,vec3(0.4,0.4,0.45),frame);
        gl_FragColor=vec4(col,1.0);
      }
    `
  },
  {
    id: 'dna-sequence-43',
    name: 'DNA Sequence',
    description: 'Scrolling DNA base pair sequence display.',
    tags: ['2d', 'biology', 'sequence'],
    fragmentShader: `
      precision highp float;
      uniform float u_time;
      uniform vec2 u_resolution;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float cols=4.0;
        float rows=20.0;
        float scroll=u_time*2.0;
        vec2 cell=vec2(floor(uv.x*cols),floor(uv.y*rows+scroll));
        float base=floor(hash(cell)*4.0);
        vec2 f=fract(vec2(uv.x*cols,uv.y*rows+scroll));
        float bar=step(0.1,f.x)*step(f.x,0.9)*step(0.1,f.y)*step(f.y,0.9);
        vec3 baseCol;
        if(base<1.0)baseCol=vec3(0.0,0.8,0.2);
        else if(base<2.0)baseCol=vec3(0.8,0.0,0.2);
        else if(base<3.0)baseCol=vec3(0.0,0.3,0.9);
        else baseCol=vec3(0.9,0.7,0.0);
        vec3 col=vec3(0.05);
        col=mix(col,baseCol,bar*0.8);
        float highlight=step(abs(f.y-0.5),0.05)*bar;
        col+=vec3(0.2)*highlight;
        gl_FragColor=vec4(col,1.0);
      }
    `
  }
];
