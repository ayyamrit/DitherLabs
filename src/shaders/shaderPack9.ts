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

export const shaderPack9: DitherShaderDef[] = [
  {
    id: 'city-skyline',
    name: 'City Skyline',
    description: 'Procedural city skyline at night with lit windows, stars and moon reflection.',
    tags: ['city', 'night', 'procedural'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 sky=mix(vec3(0.02,0.02,0.08),vec3(0.0,0.0,0.02),uv.y);
        float stars=step(0.998,hash(floor(gl_FragCoord.xy/1.5)))*sin(t*3.0+hash(floor(gl_FragCoord.xy/1.5)*3.0)*6.28)*0.5+0.5;
        sky+=stars*0.4;
        float moon=smoothstep(0.035,0.03,length(uv-vec2(0.8,0.85)));
        sky+=moon*vec3(0.9,0.9,0.8);
        vec3 c=sky;
        float buildingX=floor(uv.x*30.0);
        float buildingH=hash(vec2(buildingX,0.0))*0.4+0.15;
        float building=step(uv.y,buildingH)*step(0.0,uv.y);
        float gap=smoothstep(0.0,0.02,fract(uv.x*30.0))*smoothstep(1.0,0.98,fract(uv.x*30.0));
        float window=step(0.4,fract(uv.x*120.0))*step(fract(uv.x*120.0),0.8)*
                     step(0.3,fract(uv.y*60.0))*step(fract(uv.y*60.0),0.7);
        float lit=step(0.4,hash(floor(vec2(uv.x*120.0,uv.y*60.0))+floor(t*0.5)));
        vec3 buildingCol=vec3(0.06,0.06,0.1)*gap;
        buildingCol+=window*lit*vec3(0.9,0.8,0.4)*0.5;
        c=mix(c,buildingCol,building);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'marble-texture',
    name: 'Marble',
    description: 'Natural marble stone texture with veins, color variation and polished surface reflection.',
    tags: ['stone', 'texture', 'luxury'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.1;
        vec2 p=uv*4.0;
        float n=noise(p+t)*0.5;
        n+=noise(p*2.0+n*3.0)*0.25;
        n+=noise(p*4.0+n*2.0)*0.125;
        float vein=sin(p.x*3.0+n*15.0);
        vein=pow(abs(vein),0.3)*0.5;
        vec3 base=vec3(0.92,0.9,0.88);
        vec3 veinCol=vec3(0.3,0.28,0.25);
        vec3 c=mix(base,veinCol,vein);
        float highlight=pow(noise(uv*20.0+t),5.0)*0.3;
        c+=highlight;
        float md=length(uv-u_mouse);
        float polish=exp(-md*3.0)*0.15;
        c+=polish;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'equalizer-bars',
    name: 'Equalizer',
    description: 'Audio frequency equalizer with bouncing bars, peak hold indicators and gradient fill.',
    tags: ['audio', 'music', 'visualization'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float numBars=32.0;float barIdx=floor(uv.x*numBars);
        float barWidth=1.0/numBars;float localX=fract(uv.x*numBars);
        float gap=step(0.1,localX)*step(localX,0.9);
        float freq=hash(vec2(barIdx,0.0))*3.0+1.0;
        float height=abs(sin(t*freq+barIdx*0.5))*0.7+0.1;
        height+=sin(t*freq*2.0+barIdx)*0.1;
        height=clamp(height,0.05,0.95);
        float bar=step(uv.y,height)*gap;
        float peak=smoothstep(0.01,0.0,abs(uv.y-height-0.02))*gap;
        vec3 barCol=mix(vec3(0.0,0.8,0.2),vec3(1.0,0.8,0.0),uv.y/0.7);
        barCol=mix(barCol,vec3(1.0,0.1,0.0),step(0.7,uv.y));
        vec3 c=vec3(0.03);
        c=mix(c,barCol,bar);c+=peak*vec3(1.0);
        float md=length(uv-u_mouse);c+=exp(-md*8.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'cross-stitch',
    name: 'Cross Stitch',
    description: 'Embroidery cross-stitch pattern on fabric with visible thread texture and X patterns.',
    tags: ['textile', 'craft', 'pattern'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        float cs=10.0;
        vec2 cell=floor(gl_FragCoord.xy/cs);
        vec2 local=mod(gl_FragCoord.xy,cs)/cs;
        float cross1=smoothstep(0.08,0.0,abs(local.x-local.y)*0.707);
        float cross2=smoothstep(0.08,0.0,abs(local.x-(1.0-local.y))*0.707);
        float stitch=(cross1+cross2)*step(0.05,local.x)*step(local.x,0.95)*
                     step(0.05,local.y)*step(local.y,0.95);
        float pattern=step(0.3,hash(cell+floor(t)));
        float hue=hash(cell*2.0)*6.28+t;
        vec3 thread=0.4+0.4*cos(hue+vec3(0,2,4));
        vec3 fabric=vec3(0.9,0.88,0.82);
        float fabricTex=noise(gl_FragCoord.xy*0.5)*0.05;
        vec3 c=fabric-fabricTex;
        c=mix(c,thread,stitch*pattern);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'prism-rainbow',
    name: 'Prism Split',
    description: 'Light beam splitting through a prism into rainbow spectrum with dispersion and caustics.',
    tags: ['optics', 'rainbow', 'physics'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.02);
        vec2 prismA=vec2(0.45,0.3);vec2 prismB=vec2(0.55,0.3);vec2 prismC=vec2(0.5,0.7);
        float beam=exp(-pow((uv.y-u_mouse.y)*15.0,2.0))*step(uv.x,0.45);
        c+=beam*vec3(0.9,0.9,0.85);
        float inPrism=0.0;
        {vec2 v0=prismC-prismA;vec2 v1=prismB-prismA;vec2 v2=uv-prismA;
        float d00=dot(v0,v0);float d01=dot(v0,v1);float d02=dot(v0,v2);
        float d11=dot(v1,v1);float d12=dot(v1,v2);
        float inv=1.0/(d00*d11-d01*d01);
        float u2=(d11*d02-d01*d12)*inv;float v=(d00*d12-d01*d02)*inv;
        inPrism=step(0.0,u2)*step(0.0,v)*step(u2+v,1.0);}
        c+=inPrism*vec3(0.1,0.12,0.15);
        if(uv.x>0.55){
          float spread=(uv.x-0.55)*3.0;
          for(int i=0;i<7;i++){
            float fi=float(i)/6.0;
            float rayY=u_mouse.y+(fi-0.5)*spread;
            float d=abs(uv.y-rayY);
            float ray=exp(-d*100.0/(1.0+spread*5.0));
            float hue=fi*0.85;
            vec3 col=0.5+0.5*cos(hue*6.28+vec3(0,2,4));
            c+=ray*col*0.5;
          }
        }
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'fingerprint',
    name: 'Fingerprint',
    description: 'Biometric fingerprint scan with ridge patterns, core, delta and scanning laser effect.',
    tags: ['biometric', 'scan', 'identity'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        float r=length(uv);float a=atan(uv.y,uv.x);
        float ridges=sin(r*60.0+a*2.0+noise(uv*5.0)*8.0+sin(a*3.0)*3.0);
        ridges=smoothstep(-0.1,0.1,ridges);
        float mask=smoothstep(0.35,0.3,r)*smoothstep(0.0,0.05,r);
        ridges*=mask;
        float scanLine=exp(-pow((uv.y-sin(t)*0.3)*20.0,2.0))*0.3;
        vec3 c=vec3(0.05,0.03,0.02);
        c+=ridges*vec3(0.6,0.5,0.4);
        c+=scanLine*vec3(0.0,0.8,0.3)*mask;
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'butterfly-wing',
    name: 'Butterfly Wing',
    description: 'Iridescent butterfly wing with scale pattern, eyespots and structural color shimmer.',
    tags: ['nature', 'insect', 'iridescent'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time*0.5;
        vec2 p=uv;p.x=abs(p.x);
        float wingShape=smoothstep(0.4,0.35,length(p*vec2(1.0,1.5)-vec2(0.1,0.0)));
        float scales=sin(p.x*80.0+sin(p.y*10.0)*3.0)*sin(p.y*80.0)*0.5+0.5;
        float eyespot=smoothstep(0.08,0.06,length(p-vec2(0.2,0.1)));
        float eyeCenter=smoothstep(0.03,0.02,length(p-vec2(0.2,0.1)));
        float iridAngle=dot(normalize(p),normalize(p-(u_mouse-0.5)))*0.5+0.5;
        float hue=iridAngle*2.0+p.x*3.0+t;
        vec3 wingCol=0.3+0.4*cos(hue+vec3(0,2,4));
        wingCol*=0.7+scales*0.3;
        vec3 c=vec3(0.05);
        c=mix(c,wingCol,wingShape);
        c=mix(c,vec3(0.1,0.2,0.8),eyespot*wingShape);
        c=mix(c,vec3(0.0),eyeCenter*wingShape);
        float vein=exp(-abs(p.y)*20.0)*step(p.x,0.3)*wingShape*0.3;
        c-=vein;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'heat-map',
    name: 'Heat Map',
    description: 'Thermal infrared heat map with temperature gradient from cold blue to hot white.',
    tags: ['thermal', 'science', 'data'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        float temp=0.0;
        temp+=noise(uv*3.0+t)*0.5;
        temp+=noise(uv*6.0-t*0.7)*0.25;
        temp+=noise(uv*12.0+t*0.3)*0.125;
        float hotspot=exp(-length(uv-u_mouse)*5.0)*0.4;
        temp+=hotspot;
        temp=clamp(temp,0.0,1.0);
        vec3 c;
        if(temp<0.25)c=mix(vec3(0.0,0.0,0.2),vec3(0.0,0.0,0.8),temp*4.0);
        else if(temp<0.5)c=mix(vec3(0.0,0.0,0.8),vec3(0.0,0.8,0.0),(temp-0.25)*4.0);
        else if(temp<0.75)c=mix(vec3(0.0,0.8,0.0),vec3(1.0,0.8,0.0),(temp-0.5)*4.0);
        else c=mix(vec3(1.0,0.8,0.0),vec3(1.0,1.0,1.0),(temp-0.75)*4.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'casino-slots',
    name: 'Slot Machine',
    description: 'Spinning slot machine reels with fruit symbols, stop animation and win highlight.',
    tags: ['casino', 'game', 'retro'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 c=vec3(0.5,0.0,0.0);
        float reelWidth=0.25;
        for(int r=0;r<3;r++){
          float fr=float(r);
          float rx=0.2+fr*reelWidth;
          float inReel=step(rx,uv.x)*step(uv.x,rx+reelWidth-0.02)*step(0.2,uv.y)*step(uv.y,0.8);
          float speed=5.0+fr*2.0;
          float scroll=t*speed+fr*10.0;
          float stopped=step(3.0+fr*1.5,mod(t,10.0));
          scroll=mix(scroll,floor(scroll),stopped);
          float symY=fract((uv.y-0.2)/0.2+scroll);
          float symIdx=floor((uv.y-0.2)/0.2-scroll);
          float sym=hash(vec2(symIdx,fr));
          vec3 symCol;
          if(sym<0.25)symCol=vec3(1.0,0.2,0.2);
          else if(sym<0.5)symCol=vec3(0.2,1.0,0.2);
          else if(sym<0.75)symCol=vec3(0.2,0.2,1.0);
          else symCol=vec3(1.0,0.8,0.0);
          float shape=smoothstep(0.4,0.3,length(vec2(fract(uv.x/reelWidth)-0.5,symY-0.5)*2.0));
          c=mix(c,vec3(0.95),inReel);
          c=mix(c,symCol,shape*inReel);
        }
        float chrome=sin(uv.y*50.0+t)*0.02;c+=chrome;
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'perlin-flow',
    name: 'Flow Field',
    description: 'Perlin noise flow field visualization with streaming particles following gradient directions.',
    tags: ['flow', 'particles', 'generative'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.5;
        vec3 c=vec3(0.02,0.02,0.05);
        for(int i=0;i<8;i++){
          float fi=float(i);
          vec2 pos=vec2(hash(vec2(fi,0.0)),hash(vec2(fi,1.0)));
          for(int j=0;j<30;j++){
            float angle=noise(pos*3.0+t+fi)*6.28;
            pos+=vec2(cos(angle),sin(angle))*0.008;
            pos=fract(pos);
            float d=length(uv-pos);
            float hue=fi/8.0+t*0.2;
            vec3 col=0.5+0.5*cos(hue*6.28+vec3(0,2,4));
            c+=exp(-d*200.0)*col*0.15;
          }
        }
        float md=length(uv-u_mouse);c+=exp(-md*8.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'coral-reef',
    name: 'Coral Reef',
    description: 'Underwater coral reef with branching structures, anemones and dappled light filtering.',
    tags: ['ocean', 'nature', 'organic'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        vec3 water=mix(vec3(0.0,0.15,0.3),vec3(0.0,0.05,0.15),uv.y);
        float caustics=pow(noise(uv*8.0+t)*noise(uv*12.0-t*0.5),2.0)*0.5;
        water+=caustics*vec3(0.2,0.3,0.4);
        vec3 c=water;
        for(int i=0;i<5;i++){
          float fi=float(i);
          float cx=hash(vec2(fi,0.0))*0.8+0.1;
          float baseY=0.1+hash(vec2(fi,1.0))*0.15;
          float branch=exp(-pow((uv.x-cx)*10.0,2.0))*step(baseY,uv.y)*
                       step(uv.y,baseY+0.25+sin(uv.x*10.0+fi)*0.05);
          float fronds=sin(uv.y*30.0+sin(uv.x*20.0+t+fi)*3.0)*0.5+0.5;
          float hue=hash(vec2(fi,2.0))*6.28;
          vec3 coralCol=0.4+0.3*cos(hue+vec3(0,2,4));
          c=mix(c,coralCol*(0.5+fronds*0.5),branch*0.7);
        }
        float sand=smoothstep(0.12,0.08,uv.y);
        c=mix(c,vec3(0.6,0.55,0.4),sand);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'neon-sign',
    name: 'Neon Sign',
    description: 'Glowing neon tube sign with gas discharge glow, wall reflection and buzzing flicker.',
    tags: ['neon', 'night', 'retro'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        vec3 c=vec3(0.03,0.02,0.05);
        float shape=0.0;
        // Simple geometric neon shape
        float circle=abs(length(uv)-0.2)-0.008;
        shape+=smoothstep(0.01,0.0,circle);
        float tri=max(abs(uv.x)-0.15,uv.y-0.1);
        tri=max(tri,-uv.y-0.15);
        float triLine=abs(tri)-0.008;
        shape+=smoothstep(0.01,0.0,triLine);
        float lineH=abs(uv.y+0.05)-0.008;
        shape+=smoothstep(0.01,0.0,lineH)*step(abs(uv.x),0.2);
        float flicker=0.8+0.2*sin(t*30.0)*sin(t*47.0);
        float glow1=exp(-circle*50.0)*0.3;
        float glow2=exp(-abs(triLine)*50.0)*0.2;
        float glow3=exp(-abs(lineH)*50.0)*0.2*step(abs(uv.x),0.22);
        vec3 pink=vec3(1.0,0.2,0.5);vec3 blue=vec3(0.2,0.4,1.0);vec3 yellow=vec3(1.0,0.9,0.2);
        c+=shape*pink*flicker;
        c+=glow1*pink*0.5+glow2*blue*0.5+glow3*yellow*0.5;
        float md=length(gl_FragCoord.xy/u_resolution-u_mouse);c+=exp(-md*3.0)*0.03;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'compass-rose',
    name: 'Compass Rose',
    description: 'Ornate nautical compass rose with cardinal points, degree markings and rotating needle.',
    tags: ['navigation', 'nautical', 'instrument'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time;
        float r=length(uv);float a=atan(uv.y,uv.x);
        vec3 c=vec3(0.92,0.88,0.78);
        float outerRing=smoothstep(0.38,0.37,r)*smoothstep(0.35,0.36,r);
        float innerRing=smoothstep(0.33,0.32,r)*smoothstep(0.3,0.31,r);
        c-=(outerRing+innerRing)*0.5;
        float ticks=0.0;
        for(int i=0;i<32;i++){
          float ta=float(i)*6.28318/32.0;
          float w=mod(float(i),8)==0.0?0.015:0.005;
          float len=mod(float(i),8)==0.0?0.06:0.03;
          ticks+=smoothstep(w,0.0,abs(mod(a-ta+3.14159,6.28318)-3.14159))*
                 step(0.3,r)*step(r,0.3+len);
        }
        c-=ticks*0.7;
        // Star points
        for(int i=0;i<4;i++){
          float sa=float(i)*1.5708;
          float da=mod(a-sa+3.14159,6.28318)-3.14159;
          float point=step(abs(da),0.15)*step(r,0.28*(1.0-abs(da)*3.0));
          c=mix(c,vec3(0.15),point);
        }
        // Needle
        float needleAngle=t*0.5+sin(t*2.0)*0.1;
        vec2 mp=(u_mouse-0.5)*2.0;needleAngle=atan(mp.y,mp.x);
        float da=mod(a-needleAngle+3.14159,6.28318)-3.14159;
        float needle=step(abs(da),0.04)*step(r,0.25);
        float needleS=step(abs(da+3.14159),0.03)*step(r,0.15);
        c=mix(c,vec3(0.8,0.1,0.1),needle);c=mix(c,vec3(0.2),needleS);
        float hub=smoothstep(0.025,0.02,r);c=mix(c,vec3(0.5),hub);
        c*=smoothstep(0.42,0.4,r);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'galaxy-spiral',
    name: 'Spiral Galaxy',
    description: 'Rotating spiral galaxy with luminous arms, star clusters, dust lanes and bright nucleus.',
    tags: ['space', 'galaxy', 'cosmic'],
    fragmentShader: `${U}
      ${N}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;float t=u_time*0.2;
        uv+=(u_mouse-0.5)*0.3;
        float r=length(uv);float a=atan(uv.y,uv.x);
        float spiral=sin(a*2.0-r*15.0+t*2.0)*0.5+0.5;
        spiral*=exp(-r*3.0);
        float arms=pow(spiral,2.0);
        float dust=noise(vec2(a*3.0,r*10.0+t))*exp(-r*4.0)*0.3;
        float core=exp(-r*15.0);
        float stars=step(0.997,noise(gl_FragCoord.xy*0.3))*exp(-r*2.0);
        vec3 c=vec3(0.01,0.0,0.02);
        c+=arms*vec3(0.3,0.4,0.8);
        c+=dust*vec3(0.5,0.2,0.3);
        c+=core*vec3(1.0,0.9,0.7);
        c+=stars*vec3(0.8,0.85,1.0);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'pixel-clouds',
    name: 'Pixel Clouds',
    description: 'Low-resolution pixel art clouds drifting across a retro sky with parallax layers.',
    tags: ['pixel', 'sky', 'retro'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float px=4.0;vec2 puv=floor(gl_FragCoord.xy/px)*px/u_resolution;
        vec3 sky=mix(vec3(0.4,0.6,0.95),vec3(0.7,0.8,1.0),puv.y);
        vec3 c=sky;
        for(int layer=0;layer<3;layer++){
          float fl=float(layer);
          float speed=0.03+fl*0.02;float scale=0.3-fl*0.05;
          for(int i=0;i<4;i++){
            float fi=float(i)+fl*4.0;
            float cx=fract(hash(vec2(fi,fl))+t*speed);
            float cy=0.5+fl*0.12+hash(vec2(fi*3.0,fl))*0.15;
            float cloud=smoothstep(scale,0.0,length((puv-vec2(cx,cy))*vec2(1.0,2.0)));
            c=mix(c,vec3(0.95,0.95,1.0),cloud*(0.8-fl*0.15));
          }
        }
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'rain-window',
    name: 'Rain Window',
    description: 'Raindrops on a window pane with streaks, refraction and blurred city lights behind.',
    tags: ['rain', 'weather', 'mood'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 bg=mix(vec3(0.15,0.1,0.2),vec3(0.05,0.03,0.08),uv.y);
        float bokeh=0.0;
        for(int i=0;i<8;i++){
          float fi=float(i);
          vec2 bp=vec2(hash(vec2(fi,0.0)),hash(vec2(fi,1.0)));
          float d=length(uv-bp);
          float hue=hash(vec2(fi,2.0));
          bokeh+=exp(-d*15.0)*0.15;
          bg+=exp(-d*20.0)*0.1*(0.5+0.5*cos(hue*6.28+vec3(0,2,4)));
        }
        vec3 c=bg;
        for(int i=0;i<15;i++){
          float fi=float(i);
          float dx=hash(vec2(fi,3.0));
          float dy=fract(hash(vec2(fi,4.0))-t*(0.1+hash(vec2(fi,5.0))*0.2));
          float wobble=sin(dy*20.0+fi)*0.01;
          vec2 drop=vec2(dx+wobble,dy);
          float d=length(uv-drop);
          float droplet=smoothstep(0.015,0.005,d);
          float trail=exp(-abs(uv.x-dx-wobble)*150.0)*step(dy,uv.y)*step(uv.y,dy+0.15)*0.3;
          c+=droplet*vec3(0.5,0.55,0.6);
          c+=trail*vec3(0.2,0.22,0.25);
        }
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.05;
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'quilt-patchwork',
    name: 'Quilt Patches',
    description: 'Colorful patchwork quilt with varied geometric patterns per square and stitch lines.',
    tags: ['textile', 'craft', 'color'],
    fragmentShader: `${U}
      ${H}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.2;
        float patchSize=40.0;
        vec2 cell=floor(gl_FragCoord.xy/patchSize);
        vec2 local=mod(gl_FragCoord.xy,patchSize)/patchSize;
        float pattern=hash(cell);
        float val=0.0;
        if(pattern<0.25)val=step(0.5,local.x)*step(0.5,local.y)+step(local.x,0.5)*step(local.y,0.5);
        else if(pattern<0.5)val=step(0.5,fract(local.x*3.0));
        else if(pattern<0.75)val=step(0.3,length(local-0.5));
        else val=step(0.5,fract((local.x+local.y)*2.0));
        float hue=hash(cell*2.0)*6.28+t;
        vec3 col1=0.4+0.3*cos(hue+vec3(0,2,4));
        vec3 col2=0.4+0.3*cos(hue+3.14+vec3(0,2,4));
        vec3 c=mix(col1,col2,val);
        float stitch=smoothstep(0.02,0.0,min(local.x,local.y))+smoothstep(0.98,1.0,max(local.x,local.y));
        c=mix(c,c*0.5,stitch*0.5);
        float md=length(uv-u_mouse);c+=exp(-md*5.0)*0.08;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
];
