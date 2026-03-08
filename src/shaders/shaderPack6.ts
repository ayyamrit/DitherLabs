import type { DitherShaderDef } from './ditherShaders';

const U = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
`;
const HASH = `float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}`;
const NOISE_FN = `${HASH}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}`;

export const shaderPack6: DitherShaderDef[] = [
  {
    id: 'diagonal-rain',
    name: 'Diagonal Rain',
    description: 'Slanted rain streaks falling at 45° with wind gusts shifting direction based on cursor X.',
    tags: ['rain', 'diagonal', 'weather'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float windAngle=u_mouse.x*1.5-0.75;
        vec3 c=vec3(0.03,0.04,0.08);
        for(int i=0;i<20;i++){
          float fi=float(i);
          float speed=2.0+hash(vec2(fi,0.0))*3.0;
          float x=hash(vec2(fi,1.0));
          float y=fract(hash(vec2(fi,2.0))+t*speed*0.1);
          vec2 pos=vec2(x+y*windAngle,y);
          pos=fract(pos);
          float streakLen=0.06+hash(vec2(fi,3.0))*0.04;
          vec2 dir=normalize(vec2(windAngle,-1.0));
          vec2 d=uv-pos;
          float along=dot(d,dir);float perp=length(d-dir*along);
          float streak=exp(-perp*300.0)*smoothstep(streakLen,0.0,abs(along))*smoothstep(0.0,0.01,along+streakLen);
          c+=streak*vec3(0.4,0.5,0.7);
        }
        float splash=hash(floor(gl_FragCoord.xy/4.0)+floor(t*8.0));
        c+=step(0.98,splash)*vec3(0.2,0.25,0.35)*step(uv.y,0.1);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'zigzag-weave',
    name: 'Zigzag Weave',
    description: 'Interlocking zigzag chevron pattern like a herringbone floor tile with color shifting.',
    tags: ['zigzag', 'pattern', 'geometric'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.5;
        float freq=20.0;float row=floor(uv.y*freq);
        float zigzag=abs(fract(uv.x*freq*0.5+row*0.5+t*0.3)-0.5)*2.0;
        float zigzag2=abs(fract(uv.x*freq*0.5-row*0.5-t*0.2)-0.5)*2.0;
        float pattern=step(zigzag,0.5)*step(0.5,zigzag2);
        float mx=u_mouse.x;float my=u_mouse.y;
        float shift=sin(uv.y*10.0+mx*5.0)*0.1;
        float hue=uv.x+shift+t*0.1;
        vec3 c1=0.5+0.4*cos(hue*6.28+vec3(0,2,4));
        vec3 c2=0.3+0.3*cos((hue+0.5)*6.28+vec3(1,3,5));
        vec3 c=mix(c1,c2,pattern);
        c*=0.85+my*0.3;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'brick-wall',
    name: 'Brick Wall',
    description: 'Realistic brick masonry with staggered rows, mortar joints and weathering texture.',
    tags: ['brick', 'architecture', 'texture'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.1;
        float brickW=0.12;float brickH=0.06;float mortar=0.005;
        float row=floor(uv.y/brickH);
        float offset=mod(row,2.0)*brickW*0.5;
        vec2 brickUV=vec2(mod(uv.x+offset,brickW),mod(uv.y,brickH));
        float mx=step(mortar,brickUV.x)*step(brickUV.x,brickW-mortar);
        float my=step(mortar,brickUV.y)*step(brickUV.y,brickH-mortar);
        float brick=mx*my;
        vec2 brickId=vec2(floor((uv.x+offset)/brickW),row);
        float h=hash(brickId);
        float n=noise(gl_FragCoord.xy*0.3)*0.15;
        vec3 brickCol=mix(vec3(0.6,0.22,0.12),vec3(0.75,0.35,0.18),h)+n;
        float weather=noise(uv*30.0+t)*0.1;brickCol-=weather;
        vec3 mortarCol=vec3(0.65,0.63,0.58)+noise(gl_FragCoord.xy*0.5)*0.05;
        float md=length(uv-u_mouse);brickCol+=exp(-md*5.0)*vec3(0.15,0.05,0.0);
        vec3 c=mix(mortarCol,brickCol,brick);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'horizontal-glitch',
    name: 'Horizontal Glitch',
    description: 'Horizontal line displacement with per-row random offsets, no circles — pure scan-line chaos.',
    tags: ['glitch', 'horizontal', 'scan'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float row=floor(gl_FragCoord.y/3.0);
        float speed=floor(t*6.0);
        float glitchAmt=hash(vec2(row,speed));
        float isGlitch=step(0.75,glitchAmt);
        float offset=(hash(vec2(row,speed+1.0))-0.5)*0.4*isGlitch;
        float mouseRow=floor(u_mouse.y*u_resolution.y/3.0);
        float nearMouse=exp(-abs(row-mouseRow)*0.05)*0.15;
        offset+=nearMouse*(hash(vec2(row,speed+2.0))-0.5);
        vec2 shifted=vec2(uv.x+offset,uv.y);
        float stripe=step(0.5,fract(shifted.x*20.0+t*0.5));
        float hLine=step(0.5,fract(shifted.x*50.0));
        float val=mix(stripe,hLine,step(0.5,fract(row*0.1+t*0.2)));
        vec3 c=vec3(val);
        c.r=step(0.5,fract((shifted.x+0.003)*20.0+t*0.5))*val;
        c.b=step(0.5,fract((shifted.x-0.003)*20.0+t*0.5))*val;
        c+=isGlitch*vec3(0.1,0.0,0.15);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'square-spiral',
    name: 'Square Spiral',
    description: 'Rectangular spiral pattern that winds inward with sharp 90° turns instead of curves.',
    tags: ['spiral', 'square', 'geometric'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 p=(uv-u_mouse)*2.0;
        // Manhattan distance spiral
        float ax=abs(p.x);float ay=abs(p.y);
        float manhattan=max(ax,ay);
        float layer=floor(manhattan*10.0);
        // Direction within layer
        float angle;
        if(p.x>p.y&&p.x>-p.y)angle=p.y/(ax+0.001);
        else if(p.y>p.x&&p.y>-p.x)angle=2.0-p.x/(ay+0.001);
        else if(p.x<p.y&&p.x<-p.y)angle=4.0-p.y/(ax+0.001);
        else angle=6.0+p.x/(ay+0.001);
        float spiral=sin(layer*3.0+angle*2.0-t*2.0);
        float val=step(0.0,spiral);
        vec3 c1=vec3(0.9,0.4,0.1);vec3 c2=vec3(0.05,0.1,0.2);
        vec3 c=mix(c1,c2,val);
        c*=smoothstep(1.5,0.0,manhattan);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'falling-blocks',
    name: 'Falling Blocks',
    description: 'Tetromino-like blocks falling and stacking with randomized shapes and gravity simulation.',
    tags: ['tetris', 'blocks', 'game'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;float bs=16.0;
        vec2 cell=floor(gl_FragCoord.xy/bs);vec2 local=mod(gl_FragCoord.xy,bs)/bs;
        float col=cell.x;
        float fallSpeed=hash(vec2(col,floor(t*0.5)))*2.0+1.0;
        float fallY=mod(t*fallSpeed+hash(vec2(col,0.0))*20.0,u_resolution.y/bs);
        float blockH=2.0+floor(hash(vec2(col,floor(t*0.5)+1.0))*3.0);
        float inBlock=step(cell.y,fallY)*step(fallY-blockH,cell.y);
        // Stacked blocks at bottom
        float stackH=floor(hash(vec2(col,99.0))*5.0+2.0);
        float inStack=step(cell.y,stackH);
        float border=step(local.x,0.08)+step(0.92,local.x)+step(local.y,0.08)+step(0.92,local.y);
        border=min(border,1.0);
        float hue=hash(vec2(col,floor(fallY)))*6.28;
        vec3 blockCol=0.5+0.4*cos(hue+vec3(0,2,4));
        float stackHue=hash(vec2(col,cell.y+200.0))*6.28;
        vec3 stackCol=0.4+0.3*cos(stackHue+vec3(0,2,4));
        float md=abs(uv.x-u_mouse.x);float highlight=exp(-md*8.0)*0.2;
        vec3 c=vec3(0.04,0.04,0.06);
        c=mix(c,blockCol*(1.0-border*0.3),inBlock);
        c=mix(c,stackCol*(1.0-border*0.3),inStack*(1.0-inBlock));
        c+=highlight;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'vertical-blinds',
    name: 'Vertical Blinds',
    description: 'Window blinds rotating open/closed based on cursor Y, revealing a gradient behind.',
    tags: ['blinds', 'vertical', 'interior'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float blindWidth=0.05;float blindIdx=floor(uv.x/blindWidth);
        float localX=mod(uv.x,blindWidth)/blindWidth;
        float openAngle=u_mouse.y*3.14159*0.5+sin(blindIdx*0.5+t*0.5)*0.2;
        float apparent=cos(openAngle);
        float blindVisible=step(localX,abs(apparent));
        float shade=apparent>0.0?localX/abs(apparent+0.01):1.0-localX/abs(apparent+0.01);
        shade=clamp(shade,0.3,1.0);
        vec3 blindCol=vec3(0.85,0.83,0.78)*shade;
        vec3 behindCol=mix(vec3(0.2,0.5,0.9),vec3(0.9,0.6,0.2),uv.y);
        behindCol+=sin(uv.y*20.0+t)*0.05;
        vec3 c=mix(behindCol,blindCol,blindVisible);
        float gap=smoothstep(0.0,0.02,localX)*smoothstep(1.0,0.98,localX);
        c*=0.85+gap*0.15;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'wave-grid',
    name: 'Distorted Grid',
    description: 'Regular square grid with wave distortion displacing vertices — no circles anywhere.',
    tags: ['grid', 'distortion', 'wave'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 mouse=u_mouse;
        // Distort UV space with waves
        vec2 d=uv;
        d.x+=sin(uv.y*15.0+t*2.0+mouse.x*5.0)*0.03;
        d.y+=sin(uv.x*12.0-t*1.5+mouse.y*5.0)*0.04;
        d.x+=cos(uv.y*25.0-t*3.0)*0.01;
        // Grid
        float gridX=smoothstep(0.01,0.0,abs(fract(d.x*15.0)-0.5)-0.48);
        float gridY=smoothstep(0.01,0.0,abs(fract(d.y*12.0)-0.5)-0.48);
        float grid=max(gridX,gridY);
        // Color cells
        vec2 cellId=floor(d*vec2(15.0,12.0));
        float hue=dot(cellId,vec2(0.1,0.15))+t*0.1;
        vec3 cellCol=0.15+0.1*cos(hue*6.28+vec3(0,2,4));
        vec3 lineCol=vec3(0.0,0.8,0.6);
        vec3 c=mix(cellCol,lineCol,grid);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'matrix-grid',
    name: 'Data Matrix',
    description: 'QR-code style data matrix with animated encoding blocks and scanline reader.',
    tags: ['data', 'qr', 'digital'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;float ps=8.0;
        vec2 cell=floor(gl_FragCoord.xy/ps);
        float frame=floor(t*2.0);
        float val=step(0.45,hash(cell+frame*0.01));
        // Alignment patterns (corners)
        vec2 maxCell=floor(u_resolution/ps);
        float corner=0.0;
        for(int i=0;i<3;i++){
          vec2 cp=vec2(i==1?maxCell.x-4.0:2.0,i==2?maxCell.y-4.0:2.0);
          float cd=max(abs(cell.x-cp.x),abs(cell.y-cp.y));
          corner+=step(cd,3.0)*mod(floor(cd),2.0);
        }
        val=max(val,corner);
        // Scan line
        float scanY=mod(t*50.0,u_resolution.y);
        float scan=exp(-abs(gl_FragCoord.y-scanY)*0.5)*0.3;
        // Mouse highlight
        vec2 mouseCell=floor(u_mouse*u_resolution/ps);
        float highlight=step(max(abs(cell.x-mouseCell.x),abs(cell.y-mouseCell.y)),3.0)*0.15;
        vec3 c=mix(vec3(0.95,0.93,0.88),vec3(0.1,0.08,0.12),val);
        c+=scan*vec3(0.5,0.0,0.0);c+=highlight*vec3(0.0,0.3,0.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'chevron-flow',
    name: 'Chevron Flow',
    description: 'Animated V-shaped chevrons flowing upward like a conveyor with speed tied to cursor.',
    tags: ['chevron', 'flow', 'arrows'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float speed=u_mouse.y*3.0+1.0;
        float freq=20.0;
        float y=uv.y+t*speed*0.1;
        float row=floor(y*freq);
        float localY=fract(y*freq);
        // Chevron shape
        float chevron=step(abs(uv.x-0.5+sin(row*0.5)*0.1)*freq*0.5,localY*3.0);
        float fill=mod(row,2.0);
        float mouseX=u_mouse.x;
        float lean=sin(row*0.3)*(mouseX-0.5)*0.3;
        float shiftedX=uv.x+lean;
        float chevron2=step(abs(shiftedX-0.5)*freq*0.5,localY*3.0);
        float val=mix(chevron,chevron2,0.5);
        float hue=row*0.1+t*0.05;
        vec3 c1=0.5+0.4*cos(hue+vec3(0,2,4));
        vec3 c2=vec3(0.04,0.04,0.06);
        vec3 c=mix(c2,c1,val*smoothstep(0.0,0.3,localY));
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'sine-columns',
    name: 'Sine Columns',
    description: 'Vertical sine wave columns with varying amplitudes creating an equalizer bar visualization.',
    tags: ['columns', 'equalizer', 'audio'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float cols=30.0;float colIdx=floor(uv.x*cols);float localX=fract(uv.x*cols);
        float h=hash(vec2(colIdx,0.0));
        float freq=1.0+h*3.0;float phase=h*6.28;
        float height=0.3+sin(t*freq+phase)*0.25+sin(t*freq*2.3+phase*1.5)*0.1;
        height+=exp(-abs(colIdx/cols-u_mouse.x)*5.0)*0.2;
        float bar=step(1.0-uv.y,height);
        float gap=step(0.1,localX)*step(localX,0.9);
        // Color gradient based on height
        float normalY=(1.0-uv.y)/max(height,0.01);
        vec3 low=vec3(0.0,0.4,0.8);vec3 mid=vec3(0.0,0.8,0.3);vec3 high=vec3(1.0,0.3,0.0);
        vec3 barCol=normalY<0.5?mix(low,mid,normalY*2.0):mix(mid,high,(normalY-0.5)*2.0);
        vec3 c=vec3(0.03,0.03,0.05);
        c=mix(c,barCol,bar*gap);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'horizontal-wipe',
    name: 'Wipe Transition',
    description: 'Film transition wipe effects cycling through diagonal, venetian blind and iris patterns.',
    tags: ['transition', 'wipe', 'film'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float phase=mod(t*0.3,3.0);float progress=fract(t*0.2);
        float wipe;
        if(phase<1.0){
          // Diagonal wipe
          wipe=step(progress,(uv.x+uv.y)*0.5);
        }else if(phase<2.0){
          // Venetian blind
          float blind=fract(uv.y*8.0);
          wipe=step(progress,blind);
        }else{
          // Diamond wipe
          float diamond=(abs(uv.x-0.5)+abs(uv.y-0.5));
          wipe=step(diamond,progress*1.5);
        }
        float mx=u_mouse.x;
        vec3 scene1=vec3(0.9,0.3,0.1)*uv.y+vec3(0.1,0.2,0.5)*(1.0-uv.y);
        vec3 scene2=vec3(0.1,0.5,0.3)*uv.x+vec3(0.3,0.1,0.5)*(1.0-uv.x);
        vec3 c=mix(scene1,scene2,wipe);
        float edgeGlow=exp(-abs(wipe-0.5)*20.0)*0.2;
        c+=edgeGlow;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'staircase',
    name: 'Staircase',
    description: 'Escher-inspired impossible staircase with paradoxical ascending/descending perspective.',
    tags: ['escher', 'illusion', 'stairs'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        float steps=12.0;
        float x=uv.x+t*0.1;float y=uv.y;
        float stairX=floor(x*steps)/steps;
        float stairY=floor(y*steps)/steps;
        float localX=fract(x*steps);float localY=fract(y*steps);
        // Stair tread
        float tread=step(localY,0.7)*step(0.0,localX);
        // Riser
        float riser=step(0.7,localY)*step(localX,0.3);
        float stair=max(tread,riser);
        // Shade based on position
        float shade=0.5+stairX*0.3+stairY*0.2;
        shade+=sin(stairX*20.0+t)*0.05;
        vec3 c=vec3(shade)*stair;
        c+=vec3(0.1,0.08,0.12)*(1.0-stair);
        float mx=u_mouse.x;float my=u_mouse.y;
        float light=exp(-length(vec2(stairX-mx,stairY-my))*5.0)*0.2;
        c+=light;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'hex-maze',
    name: 'Hex Maze',
    description: 'Hexagonal maze with walls randomly removed to create winding paths through hex cells.',
    tags: ['maze', 'hex', 'procedural'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float sc=25.0;
        vec2 r=vec2(1.732,1.0)*sc;vec2 h2=r*0.5;
        vec2 a=mod(gl_FragCoord.xy,r)-h2;vec2 b=mod(gl_FragCoord.xy-h2,r)-h2;
        vec2 gv=dot(a,a)<dot(b,b)?a:b;
        vec2 id=floor((gl_FragCoord.xy-gv)/sc);
        float d=max(abs(gv.x)*0.577+abs(gv.y)*0.5,abs(gv.y));
        float wall=smoothstep(sc*0.48,sc*0.45,d);
        float wallLine=smoothstep(sc*0.45,sc*0.42,d);
        // Remove some walls based on hash
        float h=hash(id+floor(u_time*0.1)*0.001);
        float open=step(0.4,h);
        float passage=wall*(1.0-open*0.7);
        float md=length(uv-u_mouse);
        float explorer=exp(-md*20.0);
        float visited=exp(-md*3.0)*0.1;
        vec3 c=vec3(0.12,0.1,0.15);
        c+=passage*vec3(0.3,0.25,0.35);
        c-=wallLine*vec3(0.05);
        c+=visited*vec3(0.0,0.2,0.3);
        c+=explorer*vec3(0.0,0.8,1.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'ribbon-twist',
    name: 'Ribbon Twist',
    description: 'Möbius-like twisted ribbons weaving through space with perspective foreshortening.',
    tags: ['ribbon', '3d', 'twist'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.02,0.02,0.04);
        for(int i=0;i<5;i++){
          float fi=float(i);
          float phase=fi*1.256+t*0.5;
          float ribbonY=0.5+sin(uv.x*6.28*2.0+phase)*0.15*cos(phase*0.3);
          float twist=sin(uv.x*6.28+phase)*0.5+0.5;
          float width=0.02+twist*0.02;
          float d=abs(uv.y-ribbonY);
          float ribbon=smoothstep(width,width*0.5,d);
          float shade=twist*0.5+0.5;
          float hue=fi*0.8+t*0.1+uv.x;
          vec3 ribbonCol=(0.5+0.4*cos(hue+vec3(0,2,4)))*shade;
          c+=ribbon*ribbonCol*(0.7+u_mouse.y*0.5);
        }
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'pixel-sort-h',
    name: 'Pixel Sort',
    description: 'Horizontal pixel sorting glitch where rows of pixels slide and stretch based on brightness threshold.',
    tags: ['glitch', 'sort', 'horizontal'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float row=floor(gl_FragCoord.y/2.0);
        float threshold=u_mouse.y;
        float rowHash=hash(vec2(row,floor(t*2.0)));
        float sortActive=step(threshold,rowHash);
        float sortSpeed=rowHash*50.0*sortActive;
        float x=uv.x+sortSpeed*sin(t+row*0.01)*0.01*sortActive;
        x=fract(x);
        // Generate pattern
        float v=sin(x*20.0+row*0.1)*0.5+0.5;
        v*=sin(x*7.0-t)*0.3+0.7;
        // Sorted = stretched/smeared
        float sorted=mix(v,rowHash,sortActive*0.5);
        vec3 c=vec3(sorted);
        c.r=mix(v,rowHash,sortActive*0.6);
        c.g=mix(v,rowHash,sortActive*0.4);
        c.b=mix(v,rowHash,sortActive*0.5);
        c*=0.8+sin(row*0.02+t)*0.2;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'circuit-diagram',
    name: 'Logic Gates',
    description: 'Digital logic circuit diagram with AND/OR/NOT gates, signal buses and clock pulses.',
    tags: ['logic', 'circuit', 'digital'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;float cs=30.0;
        vec2 cell=floor(gl_FragCoord.xy/cs);vec2 local=mod(gl_FragCoord.xy,cs)/cs;
        float h=hash(cell);
        // Horizontal/vertical buses
        float bus=step(abs(local.y-0.5),0.03)*step(0.2,local.x)*step(local.x,0.8);
        bus+=step(abs(local.x-0.5),0.03)*step(0.2,local.y)*step(local.y,0.8)*step(0.5,h);
        // Gate body
        float gate=step(0.2,local.x)*step(local.x,0.8)*step(0.3,local.y)*step(local.y,0.7)*step(0.7,h);
        // Signal animation
        float signal=sin(cell.x*0.5-t*3.0+h*10.0)*0.5+0.5;
        float clock=step(0.5,fract(t*2.0+h*5.0));
        float active=bus*mix(signal,clock,step(0.3,h));
        float mouseInfluence=exp(-length(uv-u_mouse)*5.0);
        vec3 c=vec3(0.08,0.08,0.1);
        c+=bus*vec3(0.0,0.15,0.1);
        c+=active*vec3(0.0,0.6,0.3);
        c+=gate*vec3(0.15,0.12,0.2);
        c+=mouseInfluence*vec3(0.0,0.2,0.1);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'storm-lightning',
    name: 'Storm Front',
    description: 'Thunderstorm with layered cloud banks, horizontal lightning bolts and rain sheets.',
    tags: ['storm', 'weather', 'lightning'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        // Cloud layers
        float cloud1=noise(vec2(uv.x*3.0+t*0.1,uv.y*2.0));
        float cloud2=noise(vec2(uv.x*6.0-t*0.15,uv.y*4.0))*0.5;
        float clouds=smoothstep(0.3,0.7,cloud1+cloud2)*step(uv.y,0.7);
        // Lightning flash
        float flash=step(0.97,noise(vec2(floor(t*4.0),0.0)));
        float flashBright=flash*exp(-fract(t*4.0)*5.0);
        // Lightning bolt (horizontal-ish)
        float boltY=0.5+noise(vec2(uv.x*20.0,floor(t*2.0)))*0.2;
        float bolt=exp(-abs(uv.y-boltY)*100.0)*flash*step(u_mouse.x-0.3,uv.x)*step(uv.x,u_mouse.x+0.3);
        // Rain
        float rainCol=floor(gl_FragCoord.x/3.0);
        float rainSpeed=hash(vec2(rainCol,0.0))*3.0+2.0;
        float rain=step(0.92,hash(vec2(rainCol,floor(gl_FragCoord.y/8.0+t*rainSpeed))))*0.15;
        rain*=step(uv.y,0.6);
        // Compose
        vec3 sky=mix(vec3(0.15,0.15,0.2),vec3(0.05,0.05,0.1),uv.y);
        sky+=flashBright*vec3(0.3,0.3,0.35);
        vec3 c=sky;
        c+=clouds*vec3(0.1,0.1,0.12);
        c+=bolt*vec3(0.8,0.85,1.0);
        c+=rain*vec3(0.3,0.35,0.5);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'dna-sequence',
    name: 'Gene Sequence',
    description: 'ATCG gene sequence scrolling horizontally with base-pair color coding and reading frame markers.',
    tags: ['dna', 'biology', 'sequence'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float charW=12.0;float charH=16.0;
        vec2 cell=floor(gl_FragCoord.xy/vec2(charW,charH));
        vec2 local=mod(gl_FragCoord.xy,vec2(charW,charH))/vec2(charW,charH);
        float scrollX=cell.x+floor(t*3.0+cell.y*0.5);
        float base=floor(hash(vec2(scrollX,cell.y))*4.0);
        // Base colors: A=green T=red C=blue G=yellow
        vec3 baseCol;
        if(base<1.0)baseCol=vec3(0.2,0.8,0.3);
        else if(base<2.0)baseCol=vec3(0.8,0.2,0.2);
        else if(base<3.0)baseCol=vec3(0.2,0.4,0.9);
        else baseCol=vec3(0.9,0.8,0.2);
        // Simple block character
        float charShape=step(0.15,local.x)*step(local.x,0.85)*step(0.1,local.y)*step(local.y,0.9);
        // Reading frame marker every 3
        float codon=step(mod(scrollX,3.0),0.5)*0.15;
        float mouseRow=floor(u_mouse.y*u_resolution.y/charH);
        float highlight=step(abs(cell.y-mouseRow),0.5)*0.2;
        vec3 c=vec3(0.03,0.03,0.05);
        c+=baseCol*charShape*(0.6+highlight+codon);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
];
