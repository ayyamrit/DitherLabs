import type { DitherShaderDef } from './ditherShaders';

const U = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;
`;

const HASH = `
  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
`;

const NOISE_FN = `
  ${HASH}
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f*f*(3.0-2.0*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
  }
`;

const BAYER_FN = `
  float bayer(vec2 p) {
    vec2 m = mod(floor(p),4.0);
    return (m.x*4.0+m.y+mod(m.x,2.0)*8.0)/16.0-0.5;
  }
`;

export const shaderPack2: DitherShaderDef[] = [
  {
    id: 'voronoi-classic',
    name: 'Voronoi Classic',
    description: 'Classic Voronoi tessellation with animated cell centers and edge-detected dithering.',
    tags: ['voronoi', 'cells', 'geometric'],
    fragmentShader: `${U}
      vec2 hash2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return fract(sin(p)*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float sc=18.0;vec2 st=gl_FragCoord.xy/sc;vec2 ist=floor(st);vec2 fst=fract(st);
        float md=1.0;float sd=1.0;
        for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
          vec2 nb=vec2(float(x),float(y));vec2 pt=hash2(ist+nb);
          pt=0.5+0.4*sin(u_time*0.6+6.2831*pt);
          float d=length(nb+pt-fst);
          if(d<md){sd=md;md=d;}else if(d<sd)sd=d;
        }
        float edge=sd-md;float line=smoothstep(0.0,0.05,edge);
        float dist=length(uv-u_mouse);float pulse=sin(dist*20.0-u_time*3.0)*0.5+0.5;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float col=step(dt*0.3,pulse*line);
        gl_FragColor=vec4(mix(vec3(0.02,0.0,0.06),vec3(0.8,0.3,1.0),col),1.0);
      }`,
  },
  {
    id: 'diamond-plate',
    name: 'Diamond Plate',
    description: 'Industrial diamond plate texture with repeating raised diamond pattern and metallic sheen.',
    tags: ['metal', 'industrial', 'texture'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float sc=20.0;vec2 p=mod(gl_FragCoord.xy,sc)-sc*0.5;
        float diamond=1.0-(abs(p.x)+abs(p.y))/sc;diamond=clamp(diamond*3.0,0.0,1.0);
        float dist=length(uv-u_mouse);float wave=sin(dist*15.0-u_time*2.0)*0.5+0.5;
        float val=diamond*0.6+wave*0.4;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float col=step(dt*0.25,val);
        vec3 c=mix(vec3(0.15,0.15,0.18),vec3(0.7,0.72,0.75),col);
        c+=diamond*0.1;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'ripple-pond',
    name: 'Ripple Pond',
    description: 'Water surface ripples emanating from the cursor like raindrops on a still pond.',
    tags: ['water', 'ripple', 'nature'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float d=length(uv-u_mouse);
        float ripple=sin(d*40.0-u_time*5.0)*exp(-d*4.0);
        float d2=length(uv-vec2(0.5));
        float bg=sin(d2*20.0-u_time*2.0)*exp(-d2*3.0)*0.3;
        float val=ripple+bg;val=val*0.5+0.5;
        vec2 dp=floor(gl_FragCoord.xy/3.0);float dt=mod(dp.x+dp.y,2.0);
        float col=step(dt*0.4,val);
        vec3 water=mix(vec3(0.0,0.1,0.2),vec3(0.3,0.7,0.9),col);
        water+=ripple*0.2;
        gl_FragColor=vec4(water,1.0);
      }`,
  },
  {
    id: 'kaleidoscope',
    name: 'Kaleidoscope',
    description: 'Symmetrical kaleidoscope pattern with 6-fold rotational symmetry and dithered color transitions.',
    tags: ['symmetry', 'pattern', 'colorful'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        float angle=atan(uv.y,uv.x);float r=length(uv);
        angle=mod(angle,1.0472)-0.5236;
        vec2 p=vec2(cos(angle),sin(angle))*r;
        p+=u_mouse*0.3;
        float v=sin(p.x*20.0+u_time*2.0)*sin(p.y*20.0-u_time*1.5);
        v=v*0.5+0.5;v*=smoothstep(0.6,0.0,r);
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float col=step(dt*0.3,v);
        vec3 c=0.5+0.5*cos(v*6.28+vec3(0,2.09,4.19)+u_time*0.5);
        gl_FragColor=vec4(c*col,1.0);
      }`,
  },
  {
    id: 'circuit-board-v2',
    name: 'PCB Traces',
    description: 'Printed circuit board with glowing signal traces, via holes, and component pads.',
    tags: ['tech', 'circuit', 'pcb'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float cs=20.0;
        vec2 cell=floor(gl_FragCoord.xy/cs);vec2 local=mod(gl_FragCoord.xy,cs)/cs;
        float h=hash(cell);float h2=hash(cell+99.0);
        float dist=length(uv-u_mouse);float energy=exp(-dist*4.0);
        float trace=0.0;
        if(h>0.5)trace=step(abs(local.y-0.5),0.06);
        else trace=step(abs(local.x-0.5),0.06);
        float via=step(length(local-0.5),0.1)*step(0.7,h2);
        float pad=step(length(local-0.5),0.2)*step(0.85,h);
        float signal=trace*(0.3+energy*0.7);
        signal=max(signal,via);signal=max(signal,pad*0.5);
        float glow=signal*sin(hash(cell)*50.0+u_time*3.0)*0.3+signal*0.7;
        vec3 c=mix(vec3(0.0,0.08,0.04),vec3(0.0,1.0,0.5),glow);
        c+=energy*vec3(0.0,0.3,0.15)*trace;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'smoke',
    name: 'Smoke Wisps',
    description: 'Ethereal smoke wisps curling and dissipating with turbulent noise-driven dithering.',
    tags: ['smoke', 'organic', 'fluid'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        vec2 p=uv*3.0;p.y-=t;
        float n1=noise(p*2.0+t);float n2=noise(p*4.0-t*0.5);
        float n3=noise(p*8.0+n1*2.0);
        float smoke=(n1*0.5+n2*0.3+n3*0.2);
        smoke*=smoothstep(0.0,0.3,uv.y)*smoothstep(1.0,0.5,uv.y);
        float md=length(uv-u_mouse);smoke+=exp(-md*5.0)*0.3;
        smoke=pow(smoke,1.5);
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float col=step(dt*0.3,smoke);
        vec3 c=mix(vec3(0.02),vec3(0.6,0.6,0.65),col*smoke);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'radar-sweep',
    name: 'Radar Sweep',
    description: 'Military radar display with rotating sweep beam, blips and phosphor decay afterglow.',
    tags: ['radar', 'military', 'display'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        float r=length(uv);float angle=atan(uv.y,uv.x);
        float sweep=mod(u_time*1.5,6.2831);
        float diff=mod(angle-sweep+6.2831,6.2831);
        float beam=exp(-diff*3.0)*smoothstep(0.5,0.0,r);
        float rings=smoothstep(0.01,0.0,abs(fract(r*5.0)-0.5)-0.48)*0.3;
        float cross=(smoothstep(0.005,0.0,abs(uv.x))+smoothstep(0.005,0.0,abs(uv.y)))*0.15;
        vec2 blipPos=vec2(cos(2.1)*0.2,sin(2.1)*0.2);
        float md=length(uv-u_mouse*vec2(u_resolution.x/u_resolution.y,1.0)*0.5+0.25);
        float blip=exp(-length(uv-blipPos)*30.0)*step(diff,0.5);
        float blip2=exp(-md*20.0)*step(diff,0.5)*0.5;
        float val=beam+rings+cross+blip+blip2;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        val=step(dt*0.1,val)*val;
        gl_FragColor=vec4(vec3(0.0,val*0.9,val*0.3),1.0);
      }`,
  },
  {
    id: 'sine-weave',
    name: 'Sine Weave',
    description: 'Interlocking sine waves creating a woven textile pattern with moiré interference.',
    tags: ['waves', 'textile', 'moiré'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float md=length(uv-u_mouse);
        float w1=sin(uv.x*30.0+sin(uv.y*10.0+t)*2.0);
        float w2=sin(uv.y*30.0+sin(uv.x*10.0-t*0.7)*2.0);
        float w3=sin((uv.x+uv.y)*20.0-t*1.5+md*10.0);
        float v=(w1+w2+w3)/3.0*0.5+0.5;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float col=step(dt*0.35,v);
        vec3 c1=vec3(0.9,0.3,0.1);vec3 c2=vec3(0.1,0.3,0.9);vec3 bg=vec3(0.03);
        vec3 c=mix(bg,mix(c1,c2,uv.y),col*v);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'perlin-flow',
    name: 'Perlin Flow',
    description: 'Smooth Perlin noise field with flow lines visualizing a vector field around the cursor.',
    tags: ['noise', 'flow', 'field'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        vec2 p=uv*4.0;
        float n=noise(p+t);float n2=noise(p*2.0-t);
        vec2 flow=vec2(noise(p+vec2(0.1,0))-n,noise(p+vec2(0,0.1))-n)*20.0;
        float val=noise(p+flow*0.5+t);
        float md=length(uv-u_mouse);val+=exp(-md*5.0)*0.3;
        float lines=sin(val*30.0);lines=smoothstep(0.0,0.1,abs(lines));
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float col=step(dt*0.3,1.0-lines);
        vec3 c=mix(vec3(0.0,0.05,0.1),vec3(0.2,0.6,0.9),col*(1.0-lines));
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'pixel-rain',
    name: 'Pixel Rain',
    description: 'Chunky pixel rain falling in discrete blocks with randomized speeds and splash effects.',
    tags: ['pixel', 'rain', 'retro'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float ps=6.0;
        vec2 cell=floor(gl_FragCoord.xy/ps);
        float col=cell.x;float speed=hash(vec2(col,0.0))*3.0+2.0;
        float y=mod(cell.y+u_time*speed*5.0,u_resolution.y/ps);
        float trail=smoothstep(8.0,0.0,y)*hash(vec2(col,floor(y)));
        float md=abs(uv.x-u_mouse.x);trail+=exp(-md*10.0)*0.2;
        float brightness=trail;
        vec3 c=vec3(0.1,0.4,0.9)*brightness;
        c+=vec3(0.5,0.7,1.0)*step(0.95,trail);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'thermal',
    name: 'Thermal Vision',
    description: 'Infrared thermal camera simulation with heat signature palette and noise dithering.',
    tags: ['thermal', 'camera', 'heat'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float md=length(uv-u_mouse);
        float heat=exp(-md*4.0)*0.8;
        heat+=sin(uv.x*5.0+u_time)*sin(uv.y*5.0-u_time*0.7)*0.15+0.3;
        heat+=sin(length(uv-0.5)*10.0-u_time*2.0)*0.1;
        float noise=hash(floor(gl_FragCoord.xy/2.0)+floor(u_time*10.0))*0.08;
        heat+=noise;heat=clamp(heat,0.0,1.0);
        vec3 cold=vec3(0.0,0.0,0.3);vec3 mid=vec3(0.8,0.0,0.5);
        vec3 warm=vec3(1.0,0.8,0.0);vec3 hot=vec3(1.0,1.0,0.9);
        vec3 c=heat<0.33?mix(cold,mid,heat*3.0):heat<0.66?mix(mid,warm,(heat-0.33)*3.0):mix(warm,hot,(heat-0.66)*3.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'glitch-blocks',
    name: 'Glitch Blocks',
    description: 'Digital corruption with randomly displaced color blocks, RGB split and temporal glitching.',
    tags: ['glitch', 'digital', 'corruption'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=floor(u_time*4.0);
        float row=floor(uv.y*20.0);float glitchStrength=step(0.85,hash(vec2(row,t)));
        float offset=glitchStrength*(hash(vec2(row,t+1.0))-0.5)*0.3;
        vec2 r_uv=vec2(uv.x+offset+0.01,uv.y);
        vec2 g_uv=vec2(uv.x+offset,uv.y);
        vec2 b_uv=vec2(uv.x+offset-0.01,uv.y);
        float md=length(uv-u_mouse);float wave=sin(md*15.0-u_time*3.0)*0.5+0.5;
        float r=step(0.5,fract(sin(dot(floor(r_uv*30.0),vec2(12.9,78.2)))*43758.5))*wave;
        float g=step(0.5,fract(sin(dot(floor(g_uv*30.0),vec2(12.9,78.2)))*43758.5))*wave;
        float b=step(0.5,fract(sin(dot(floor(b_uv*30.0),vec2(12.9,78.2)))*43758.5))*wave;
        vec3 c=vec3(r*0.9,g*0.9,b*0.9);
        c+=glitchStrength*vec3(0.1,0.0,0.2);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'lava-lamp',
    name: 'Lava Lamp',
    description: 'Groovy lava lamp with rising and falling metaball blobs in psychedelic dithered colors.',
    tags: ['retro', 'psychedelic', 'blobs'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.5;
        float v=0.0;
        for(int i=0;i<5;i++){
          float fi=float(i);
          vec2 center=vec2(0.5+sin(t*0.7+fi*1.3)*0.25,mod(t*0.15+fi*0.2,1.2)-0.1);
          center.x+=sin(uv.y*3.0+t+fi)*0.1;
          float r=0.08+sin(t+fi*2.0)*0.03;
          v+=r/length(uv-center);
        }
        float md=length(uv-u_mouse);v+=0.05/(md+0.05);
        float blob=smoothstep(0.9,1.1,v);
        vec2 dp=floor(gl_FragCoord.xy/3.0);float dt=mod(dp.x+dp.y,2.0);
        float dithered=step(dt*0.3,blob*0.8);
        vec3 lava=mix(vec3(0.8,0.2,0.0),vec3(1.0,0.8,0.0),uv.y);
        vec3 bg=vec3(0.05,0.0,0.1);
        gl_FragColor=vec4(mix(bg,lava,dithered),1.0);
      }`,
  },
  {
    id: 'fingerprint',
    name: 'Fingerprint',
    description: 'Biometric fingerprint pattern with concentric ridge lines warped by a flow field.',
    tags: ['biometric', 'lines', 'identity'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 center=u_mouse;vec2 d=uv-center;
        float angle=atan(d.y,d.x);float dist=length(d);
        float warp=noise(uv*5.0+u_time*0.1)*0.5;
        float ridges=sin((dist*50.0+angle*3.0+warp*10.0))*0.5+0.5;
        ridges*=smoothstep(0.5,0.0,dist);
        float line=smoothstep(0.3,0.5,ridges);
        vec3 c=mix(vec3(0.9,0.85,0.75),vec3(0.3,0.2,0.15),line);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'spiral-galaxy',
    name: 'Spiral Galaxy',
    description: 'Spinning galaxy with logarithmic spiral arms, star clusters and cosmic dust dithering.',
    tags: ['space', 'galaxy', 'spiral'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        vec2 center=(u_mouse-0.5)*vec2(u_resolution.x/u_resolution.y,1.0);
        uv-=center*0.3;
        float r=length(uv);float angle=atan(uv.y,uv.x);
        float spiral=sin(angle*2.0-r*15.0+u_time*0.5);
        float arm=exp(-r*3.0)*smoothstep(-0.3,0.3,spiral);
        float stars=step(0.97,hash(floor(gl_FragCoord.xy/2.0)))*exp(-r*2.0);
        float core=exp(-r*8.0);
        float val=arm*0.6+stars*0.8+core;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float col=step(dt*0.2,val);
        vec3 c=col*mix(vec3(0.3,0.3,0.8),vec3(0.9,0.8,0.5),r*2.0)*val;
        c+=core*vec3(1.0,0.9,0.7);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'dot-matrix',
    name: 'Dot Matrix',
    description: 'LED dot matrix display with individually addressable round pixels and scrolling text patterns.',
    tags: ['led', 'display', 'dots'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float dotSize=8.0;
        vec2 cell=floor(gl_FragCoord.xy/dotSize);
        vec2 local=mod(gl_FragCoord.xy,dotSize)/dotSize-0.5;
        float dot=smoothstep(0.4,0.35,length(local));
        float dist=length(uv-u_mouse);
        float wave=sin(dist*20.0-u_time*4.0)*0.5+0.5;
        float pattern=sin(cell.x*0.5-u_time*3.0)*0.5+0.5;
        pattern*=sin(cell.y*0.3+u_time*2.0)*0.5+0.5;
        float val=mix(wave,pattern,0.5);
        float brightness=dot*step(0.3,val);
        vec3 off=vec3(0.05,0.0,0.0);vec3 on=vec3(1.0,0.1,0.05);
        gl_FragColor=vec4(mix(off,on,brightness),1.0);
      }`,
  },
  {
    id: 'wave-collapse',
    name: 'Wave Collapse',
    description: 'Collapsing concentric waves with interference patterns creating complex dithered geometries.',
    tags: ['waves', 'interference', 'physics'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float v=0.0;
        for(int i=0;i<4;i++){
          float fi=float(i);
          vec2 center=vec2(0.5+cos(t*0.5+fi*1.57)*0.3,0.5+sin(t*0.3+fi*1.57)*0.3);
          if(i==0)center=u_mouse;
          float d=length(uv-center);
          v+=sin(d*30.0-t*3.0)/(d*5.0+1.0);
        }
        v=v*0.5+0.5;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float col=step(dt*0.35,v);
        vec3 c=mix(vec3(0.0,0.02,0.08),vec3(0.0,0.7,1.0),col*v);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'woodgrain',
    name: 'Wood Grain',
    description: 'Natural wood texture with growth rings, knots and grain patterns in warm organic tones.',
    tags: ['wood', 'natural', 'texture'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 p=uv*2.0+u_mouse*0.5;
        float n=noise(p*vec2(1.0,8.0)+u_time*0.05);
        float grain=sin((p.x+n*0.3)*40.0)*0.5+0.5;
        float rings=sin(length(p-vec2(0.5,0.3))*30.0+n*5.0)*0.5+0.5;
        float val=grain*0.3+rings*0.7;
        float knot=exp(-length(uv-vec2(0.4,0.6))*15.0)*0.5;
        val=mix(val,0.2,knot);
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float col=step(dt*0.2,val);
        vec3 light=vec3(0.8,0.6,0.35);vec3 dark=vec3(0.3,0.18,0.08);
        gl_FragColor=vec4(mix(dark,light,col*val),1.0);
      }`,
  },
  {
    id: 'electric-arc',
    name: 'Electric Arc',
    description: 'Lightning bolt arcs branching between cursor and screen edges with plasma glow.',
    tags: ['lightning', 'electric', 'energy'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec3 col=vec3(0.01,0.0,0.03);
        for(int i=0;i<3;i++){
          float fi=float(i);
          vec2 start=u_mouse;vec2 end=vec2(cos(fi*2.09+t*0.3)*0.4+0.5,sin(fi*2.09+t*0.2)*0.4+0.5);
          vec2 dir=end-start;float len=length(dir);dir/=len;
          vec2 perp=vec2(-dir.y,dir.x);
          float proj=dot(uv-start,dir);proj=clamp(proj,0.0,len);
          float lateral=dot(uv-start,perp);
          float n=hash(vec2(floor(proj*30.0),floor(t*8.0+fi*100.0)));
          float bolt=exp(-abs(lateral-n*0.06+0.03)*80.0)*step(0.0,proj)*step(proj,len);
          float glow=exp(-abs(lateral)*10.0)*step(0.0,proj)*step(proj,len)*0.15;
          col+=(bolt+glow)*vec3(0.5+fi*0.2,0.6,1.0);
        }
        col=clamp(col,0.0,1.0);
        gl_FragColor=vec4(col,1.0);
      }`,
  },
  {
    id: 'topographic',
    name: 'Topo Lines',
    description: 'Minimalist topographic contour lines with clean elevation mapping and cursor-driven peaks.',
    tags: ['map', 'lines', 'minimal'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float md=length(uv-u_mouse);
        float elevation=noise(uv*5.0+u_time*0.1)*0.5+exp(-md*5.0)*0.5;
        float contour=fract(elevation*15.0);
        float line=smoothstep(0.02,0.04,contour)*smoothstep(0.98,0.96,contour);
        float majorLine=smoothstep(0.01,0.03,fract(elevation*3.0))*smoothstep(0.99,0.97,fract(elevation*3.0));
        float val=min(line,majorLine);
        vec3 paper=vec3(0.95,0.93,0.88);vec3 ink=vec3(0.2,0.35,0.25);vec3 major=vec3(0.15,0.25,0.2);
        vec3 c=mix(mix(major,paper,majorLine),mix(ink,paper,val),line);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
];
