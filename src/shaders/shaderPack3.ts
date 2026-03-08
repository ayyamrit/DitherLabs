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

export const shaderPack3: DitherShaderDef[] = [
  {
    id: 'marble',
    name: 'Marble Veins',
    description: 'Luxurious marble surface with flowing mineral veins and polished dithered highlights.',
    tags: ['stone', 'luxury', 'texture'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 p=uv*3.0+u_mouse;float t=u_time*0.15;
        float n=noise(p+t);float n2=noise(p*3.0+n*2.0-t);
        float vein=sin(p.x*8.0+n2*8.0)*0.5+0.5;vein=pow(vein,3.0);
        float val=0.7+vein*0.3;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float col=step(dt*0.15,val-0.5);
        vec3 c=mix(vec3(0.15,0.12,0.1),vec3(0.92,0.9,0.87),val);
        c=mix(c,vec3(0.4,0.35,0.3),vein*0.5);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'comic-dots',
    name: 'Comic Book',
    description: 'Ben-Day dots style from classic comics with bold outlines and pop-art color dithering.',
    tags: ['comic', 'pop-art', 'dots'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float sc=10.0;
        vec2 cell=floor(gl_FragCoord.xy/sc)*sc+sc*0.5;vec2 cellUV=cell/u_resolution;
        float md=length(uv-u_mouse);float val=sin(md*12.0-u_time*2.0)*0.5+0.5;
        val=mix(val,1.0-length(cellUV-0.5),0.3);
        float dotSize=val*sc*0.48;float d=length(gl_FragCoord.xy-cell);
        float dot=1.0-step(dotSize,d);
        float hue=cellUV.x+cellUV.y+u_time*0.1;
        vec3 c=0.5+0.5*cos(hue*6.28+vec3(0,2,4));
        c=mix(vec3(1.0,0.95,0.85),c,dot);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'cyberpunk-rain',
    name: 'Neon Rain',
    description: 'Cyberpunk city rain with neon reflections, vertical streaks and chromatic aberration.',
    tags: ['cyberpunk', 'neon', 'rain'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float col=floor(gl_FragCoord.x/4.0);
        float speed=hash(vec2(col,0.0))*4.0+2.0;
        float drop=fract(hash(vec2(col,1.0))+t*speed*0.05);
        float streak=exp(-abs(uv.y-drop)*20.0)*0.8;
        float md=length(uv-u_mouse);float neon=exp(-md*6.0);
        float r=streak*(0.5+hash(vec2(col,2.0))*0.5);
        float reflection=streak*step(0.7,1.0-uv.y)*0.3;
        vec3 c=vec3(0.01,0.0,0.02);
        c+=streak*mix(vec3(1.0,0.0,0.5),vec3(0.0,0.5,1.0),hash(vec2(col,3.0)));
        c+=reflection*vec3(0.5,0.2,0.8);
        c+=neon*vec3(0.8,0.2,1.0)*0.4;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'zen-garden',
    name: 'Zen Garden',
    description: 'Raked sand patterns of a Japanese zen garden with concentric curves around stone obstacles.',
    tags: ['zen', 'minimal', 'japanese'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 stone=u_mouse;float sd=length(uv-stone);
        float rake=sin(atan(uv.y-stone.y,uv.x-stone.x)*0.0+sd*60.0-u_time*0.5);
        rake=mix(rake,sin(uv.x*40.0),smoothstep(0.0,0.25,sd));
        float val=rake*0.5+0.5;
        float stoneShape=smoothstep(0.06,0.05,sd);
        val=mix(val,0.2,stoneShape);
        float grain=noise(gl_FragCoord.xy*0.5)*0.05;
        vec3 sand=vec3(0.85+grain,0.8+grain,0.7+grain);
        vec3 groove=vec3(0.65,0.6,0.5);
        vec3 c=mix(groove,sand,smoothstep(0.3,0.7,val));
        c=mix(c,vec3(0.3,0.3,0.28),stoneShape);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'hextech',
    name: 'Hextech',
    description: 'Futuristic hexagonal technology grid with pulsing energy nodes and data flow visualization.',
    tags: ['hex', 'tech', 'futuristic'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float sc=30.0;
        vec2 r=vec2(1.0,1.732);vec2 h=r*0.5;
        vec2 a=mod(gl_FragCoord.xy,r*sc)-h*sc;vec2 b=mod(gl_FragCoord.xy-h*sc,r*sc)-h*sc;
        vec2 gv=dot(a,a)<dot(b,b)?a:b;
        float edge=smoothstep(0.0,2.0,min(abs(gv.x),abs(gv.y)));
        vec2 id=floor((gl_FragCoord.xy-gv)/sc);
        float h1=hash(id);float pulse=sin(h1*20.0+u_time*2.0)*0.5+0.5;
        float md=length(uv-u_mouse);float energy=exp(-md*5.0)*pulse;
        float node=step(0.85,h1)*exp(-length(gv)/sc*4.0);
        vec3 c=vec3(0.0,0.03,0.06);
        c+=edge*vec3(0.0,0.15,0.2)*0.5;
        c+=energy*vec3(0.0,0.6,0.8);
        c+=node*vec3(0.0,1.0,0.8);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'oil-slick',
    name: 'Oil Slick',
    description: 'Thin-film interference creating rainbow iridescence on a dark liquid surface.',
    tags: ['iridescent', 'rainbow', 'liquid'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time*0.3;
        vec2 d=uv-u_mouse;float md=length(d);
        vec2 distorted=uv+d*0.05/(md+0.1);
        float n=noise(distorted*5.0+t);float n2=noise(distorted*10.0-t);
        float thickness=n*0.5+n2*0.3+md*2.0;
        vec3 film=0.5+0.5*cos(thickness*6.28*2.0+vec3(0,2.09,4.19)+u_time*0.5);
        film*=0.8;
        float fresnel=pow(1.0-abs(dot(normalize(d),vec2(0,1))),2.0)*0.3+0.7;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float dith=step(dt*0.2,length(film)*0.3);
        vec3 c=film*fresnel*dith;
        c+=exp(-md*8.0)*vec3(0.2,0.2,0.25)*0.3;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'ascii-art',
    name: 'ASCII Art',
    description: 'Text character dithering simulating ASCII art rendering with brightness-mapped symbol density.',
    tags: ['ascii', 'text', 'retro'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float cs=8.0;
        vec2 cell=floor(gl_FragCoord.xy/cs);vec2 local=mod(gl_FragCoord.xy,cs)/cs;
        float md=length(uv-u_mouse);float val=sin(md*12.0-u_time*2.5)*0.5+0.5;
        val=mix(val,1.0-length(uv-0.5),0.3);
        float h=hash(cell);
        // Simulate character density
        float density=0.0;
        if(val>0.8){density=step(0.3,local.x)*step(0.3,local.y);}
        else if(val>0.6){float cross=min(abs(local.x-0.5),abs(local.y-0.5));density=step(cross,0.15);}
        else if(val>0.4){density=step(abs(local.y-0.5),0.15);}
        else if(val>0.2){density=step(0.4,mod(local.x+local.y,0.5));}
        vec3 c=mix(vec3(0.0,0.02,0.0),vec3(0.0,0.85,0.3),density);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'supernova',
    name: 'Supernova',
    description: 'Explosive stellar death with expanding shockwave rings, particle debris and radiant core.',
    tags: ['space', 'explosion', 'stellar'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/u_resolution.y;
        vec2 center=(u_mouse-0.5)*vec2(u_resolution.x/u_resolution.y,1.0);
        uv-=center*0.3;float r=length(uv);float a=atan(uv.y,uv.x);
        float t=u_time;float wave=sin(r*20.0-t*5.0)*exp(-r*3.0);
        float rays=pow(max(0.0,sin(a*8.0+t*2.0)),8.0)*exp(-r*4.0);
        float core=exp(-r*15.0);
        float debris=hash(floor(vec2(a*10.0+t,r*20.0)))*exp(-r*5.0)*0.3;
        float val=wave*0.3+rays*0.3+core+debris;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float dith=step(dt*0.15,val);
        vec3 c=vec3(0.0);
        c+=core*vec3(1.0,0.95,0.8)*3.0;
        c+=wave*vec3(0.8,0.3,0.1);
        c+=rays*vec3(1.0,0.5,0.2);
        c+=debris*vec3(0.5,0.3,0.8);
        c*=dith;c=clamp(c,0.0,1.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'blueprint',
    name: 'Blueprint',
    description: 'Technical blueprint drawing with white lines on blue background, grid marks and dimensions.',
    tags: ['technical', 'blueprint', 'drawing'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float grid1=min(smoothstep(0.01,0.0,abs(fract(uv.x*10.0)-0.5)-0.49),1.0);
        grid1=max(grid1,smoothstep(0.01,0.0,abs(fract(uv.y*10.0)-0.5)-0.49));
        float grid2=min(smoothstep(0.005,0.0,abs(fract(uv.x*50.0)-0.5)-0.495),1.0);
        grid2=max(grid2,smoothstep(0.005,0.0,abs(fract(uv.y*50.0)-0.5)-0.495));
        float md=length(uv-u_mouse);
        float circle=smoothstep(0.003,0.0,abs(md-0.15));
        circle+=smoothstep(0.003,0.0,abs(md-0.1));
        float crosshair=smoothstep(0.002,0.0,abs(uv.x-u_mouse.x))*step(abs(uv.y-u_mouse.y),0.2);
        crosshair+=smoothstep(0.002,0.0,abs(uv.y-u_mouse.y))*step(abs(uv.x-u_mouse.x),0.2);
        float val=grid1*0.5+grid2*0.2+circle+crosshair*0.7;
        float paper=noise(gl_FragCoord.xy*0.3)*0.05;
        vec3 blue=vec3(0.08,0.15,0.4)+paper;vec3 line=vec3(0.7,0.8,1.0);
        gl_FragColor=vec4(mix(blue,line,clamp(val,0.0,1.0)),1.0);
      }`,
  },
  {
    id: 'pixel-fire',
    name: 'Pixel Inferno',
    description: 'Classic demoscene fire effect with pixel-perfect palette cycling and heat propagation.',
    tags: ['demoscene', 'fire', 'pixel'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float ps=4.0;
        vec2 p=floor(gl_FragCoord.xy/ps);
        float n=hash(vec2(p.x,floor(u_time*12.0)));
        float heat=n*step(p.y*ps/u_resolution.y,0.1);
        float md=abs(uv.x-u_mouse.x);heat+=exp(-md*8.0)*step(uv.y,0.15)*0.8;
        float rise=hash(p+floor(u_time*8.0))*0.3;
        float y=uv.y+rise;
        float flame=exp(-y*3.0)*(0.5+hash(p*0.5+floor(u_time*6.0))*0.5);
        flame*=exp(-md*3.0)+0.3;flame=clamp(flame,0.0,1.0);
        vec3 c=vec3(0.0);
        if(flame>0.1)c=vec3(0.3,0.0,0.0);
        if(flame>0.3)c=vec3(0.7,0.15,0.0);
        if(flame>0.5)c=vec3(1.0,0.4,0.0);
        if(flame>0.7)c=vec3(1.0,0.75,0.1);
        if(flame>0.9)c=vec3(1.0,1.0,0.6);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'ocean-waves',
    name: 'Ocean Waves',
    description: 'Stylized ocean surface with rolling wave crests, foam lines and deep water dithering.',
    tags: ['ocean', 'water', 'nature'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        vec2 p=uv*vec2(3.0,5.0);p.x+=t*0.2;
        float wave1=sin(p.x*3.0+p.y*0.5+t*1.5)*0.15;
        float wave2=sin(p.x*5.0-p.y*1.0+t*2.0)*0.08;
        float wave3=noise(p*2.0+t*0.5)*0.1;
        float surface=uv.y+wave1+wave2+wave3-0.5;
        float foam=smoothstep(0.01,-0.01,surface)*smoothstep(-0.05,0.0,surface);
        float depth=smoothstep(0.0,-0.3,surface);
        float md=length(uv-u_mouse);float mouseWave=sin(md*25.0-t*4.0)*exp(-md*5.0)*0.05;
        surface+=mouseWave;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float dith=step(dt*0.3,depth*0.5+0.1);
        vec3 sky=mix(vec3(0.6,0.7,0.9),vec3(0.3,0.5,0.8),uv.y);
        vec3 water=mix(vec3(0.0,0.2,0.4),vec3(0.0,0.1,0.25),depth);
        vec3 c=surface>0.0?sky:water*dith;c+=foam*vec3(0.9,0.95,1.0);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'barcode',
    name: 'Barcode Rain',
    description: 'Cascading vertical barcodes with varying widths and scanning laser line effect.',
    tags: ['barcode', 'data', 'digital'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float colW=3.0+floor(hash(vec2(floor(gl_FragCoord.x/3.0),0.0))*4.0);
        float col=floor(gl_FragCoord.x/colW);
        float bar=step(0.5,hash(vec2(col,floor(uv.y*30.0+u_time*hash(vec2(col,1.0))*3.0))));
        float scan=exp(-abs(uv.y-mod(u_time*0.3,1.0))*50.0)*0.8;
        float md=abs(uv.x-u_mouse.x);float focus=exp(-md*8.0)*0.3;
        vec3 c=vec3(bar*0.9+focus);c+=scan*vec3(1.0,0.0,0.0);
        c*=0.9+hash(floor(gl_FragCoord.xy))*0.1;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'prismatic',
    name: 'Prismatic',
    description: 'Light passing through a prism creating rainbow spectral decomposition with dithered bands.',
    tags: ['rainbow', 'light', 'spectrum'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 prism=u_mouse;float d=uv.x-prism.x;
        float spread=d*3.0;float angle=atan(uv.y-prism.y,d);
        float beam=exp(-abs(angle)*5.0)*step(0.0,d);
        float whiteBeam=exp(-abs(uv.y-prism.y)*30.0)*step(d,0.0)*step(-0.3,d);
        float t=u_time*0.5;
        vec3 rainbow;
        rainbow.r=exp(-pow(spread-0.15+sin(t)*0.05,2.0)*50.0)*beam;
        rainbow.g=exp(-pow(spread-0.0,2.0)*50.0)*beam;
        rainbow.b=exp(-pow(spread+0.15-sin(t)*0.05,2.0)*50.0)*beam;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        rainbow*=step(dt*0.1,length(rainbow)*0.3)*1.5;
        vec3 c=vec3(0.02)+rainbow+whiteBeam*vec3(0.9,0.9,0.85);
        gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);
      }`,
  },
  {
    id: 'sine-city',
    name: 'Sin City',
    description: 'High-contrast noir style with deep blacks, stark whites and occasional red accent dithering.',
    tags: ['noir', 'contrast', 'film'],
    fragmentShader: `${U}
      ${NOISE_FN}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float md=length(uv-u_mouse);
        float val=sin(md*15.0-u_time*2.0)*0.4+0.5;
        float n=noise(uv*10.0+u_time*0.2)*0.2;val+=n;
        float shadow=smoothstep(0.6,0.3,val);
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        float dith=step(dt*0.4,val);
        float red=step(0.95,noise(uv*20.0+u_time))*step(0.5,val)*0.8;
        vec3 c=vec3(dith*val);c.r+=red;
        float vig=1.0-length(uv-0.5)*0.8;c*=vig;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'dna-helix',
    name: 'DNA Helix',
    description: 'Rotating double helix structure with base pair connections and phosphor backbone glow.',
    tags: ['biology', 'helix', 'science'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float y=uv.y*10.0+t*2.0;
        float x1=sin(y)*0.15+0.5+u_mouse.x*0.2-0.1;
        float x2=sin(y+3.14159)*0.15+0.5+u_mouse.x*0.2-0.1;
        float strand1=exp(-pow((uv.x-x1)*30.0,2.0));
        float strand2=exp(-pow((uv.x-x2)*30.0,2.0));
        float basePair=0.0;
        if(mod(y,1.5)<0.2){
          float bx=mix(x1,x2,smoothstep(x1,x2,uv.x));
          basePair=step(min(x1,x2),uv.x)*step(uv.x,max(x1,x2))*exp(-abs(mod(y,1.5)-0.1)*20.0);
        }
        float val=strand1+strand2+basePair*0.5;
        float depth=sin(y)*0.5+0.5;
        vec2 dp=floor(gl_FragCoord.xy/2.0);float dt=mod(dp.x+dp.y,2.0);
        val*=step(dt*0.15,val);
        vec3 c=vec3(0.0,0.02,0.05);
        c+=strand1*vec3(0.0,0.6,1.0)*depth;
        c+=strand2*vec3(0.0,0.6,1.0)*(1.0-depth);
        c+=basePair*mix(vec3(1.0,0.3,0.3),vec3(0.3,1.0,0.3),sin(y*2.0)*0.5+0.5)*0.5;
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'interference-bands',
    name: 'Interference',
    description: 'Thin-film optical interference creating rainbow bands that shift with viewing angle.',
    tags: ['optics', 'rainbow', 'bands'],
    fragmentShader: `${U}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float md=length(uv-u_mouse);float t=u_time;
        float thickness=md*10.0+sin(uv.x*5.0+t)*2.0+sin(uv.y*3.0-t*0.7)*1.5;
        vec3 c=0.5+0.5*cos(thickness+vec3(0,2.09,4.19));
        c*=0.8+0.2*sin(md*30.0-t*3.0);
        vec2 dp=floor(gl_FragCoord.xy/3.0);float dt=mod(dp.x+dp.y,2.0);
        c*=step(dt*0.1,length(c)*0.2);
        c*=smoothstep(0.8,0.0,md);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'camo',
    name: 'Digital Camo',
    description: 'Military digital camouflage with blocky multi-tone pattern and adaptive cursor zone.',
    tags: ['military', 'camo', 'pattern'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float ps=8.0;
        vec2 p=floor(gl_FragCoord.xy/ps);
        float n=hash(p);float n2=hash(p*0.5+50.0);float n3=hash(p*0.25+100.0);
        float val=(n+n2+n3)/3.0;
        float md=length(uv-u_mouse);val+=exp(-md*5.0)*0.2;
        vec3 c;
        if(val<0.3)c=vec3(0.12,0.15,0.1);
        else if(val<0.5)c=vec3(0.25,0.3,0.18);
        else if(val<0.7)c=vec3(0.4,0.38,0.28);
        else c=vec3(0.55,0.52,0.4);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'sound-wave',
    name: 'Waveform',
    description: 'Audio waveform visualization with oscilloscope display and frequency-reactive dithering.',
    tags: ['audio', 'waveform', 'oscilloscope'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;float t=u_time;
        float wave=0.0;
        for(int i=0;i<5;i++){
          float fi=float(i)+1.0;
          wave+=sin(uv.x*fi*10.0+t*fi*0.5)*0.5/fi;
        }
        wave*=0.3+length(uv.x-u_mouse.x)*0.5;
        float waveY=wave+0.5;float d=abs(uv.y-waveY);
        float line=exp(-d*50.0);float glow=exp(-d*10.0)*0.3;
        float grid=smoothstep(0.005,0.0,abs(fract(uv.x*10.0)-0.5)-0.495)*0.1;
        grid+=smoothstep(0.005,0.0,abs(fract(uv.y*10.0)-0.5)-0.495)*0.1;
        float scanline=0.95+0.05*sin(gl_FragCoord.y*3.0);
        vec3 c=vec3(0.0,0.03,0.0);c+=grid*vec3(0.0,0.2,0.0);
        c+=line*vec3(0.0,1.0,0.3)*scanline;c+=glow*vec3(0.0,0.5,0.15);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
  {
    id: 'mondrian',
    name: 'Mondrian',
    description: 'Piet Mondrian-inspired composition with primary color rectangles and bold black grid lines.',
    tags: ['art', 'mondrian', 'geometric'],
    fragmentShader: `${U}
      ${HASH}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float gx=floor(uv.x*5.0+sin(u_time*0.2)*0.5);float gy=floor(uv.y*4.0+cos(u_time*0.15)*0.5);
        float h=hash(vec2(gx,gy));
        float lineX=smoothstep(0.02,0.0,abs(fract(uv.x*5.0+sin(u_time*0.2)*0.5)-0.5)-0.48);
        float lineY=smoothstep(0.02,0.0,abs(fract(uv.y*4.0+cos(u_time*0.15)*0.5)-0.5)-0.48);
        float line=max(lineX,lineY);
        vec3 c=vec3(0.95,0.93,0.88);
        if(h<0.2)c=vec3(0.9,0.15,0.1);
        else if(h<0.35)c=vec3(0.05,0.2,0.6);
        else if(h<0.45)c=vec3(0.95,0.85,0.1);
        float md=length(uv-u_mouse);c*=0.8+exp(-md*5.0)*0.3;
        c=mix(c,vec3(0.05),line);
        gl_FragColor=vec4(c,1.0);
      }`,
  },
];
