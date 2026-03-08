import type { DitherShaderDef } from './ditherShaders';

export const shaderPack23: DitherShaderDef[] = [
  {
    id: 'lp-aurora',
    name: 'Low Poly Aurora',
    description: 'Faceted northern lights rippling across a triangulated night sky with minimal GPU cost.',
    tags: ['lowpoly', 'nature', 'landscape'],
    featured: false,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float scale=12.0;
        vec2 p=uv*vec2(scale,scale*0.6);
        float row=floor(p.y);
        vec2 cell=floor(p+vec2(mod(row,2.0)*0.5,0.0));
        float id=hash(cell);
        float wave=sin(cell.x*0.4+u_time*0.6+id*6.28)*0.5+0.5;
        float band=smoothstep(0.4,0.7,uv.y)*smoothstep(1.0,0.75,uv.y);
        float aurora=wave*band;
        vec3 green=vec3(0.1,0.8,0.3);
        vec3 blue=vec3(0.1,0.3,0.7);
        vec3 col=mix(blue,green,aurora)*aurora;
        col+=vec3(0.01,0.01,0.04);
        col*=0.85+0.15*id;
        float stars=step(0.97,id)*step(0.6,uv.y)*(0.5+0.5*sin(u_time+id*100.0));
        col+=stars*vec3(0.8,0.85,1.0);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'lp-stained-glass',
    name: 'Stained Glass',
    description: 'Cathedral stained glass window with Voronoi-like colored panels and dark lead borders.',
    tags: ['lowpoly', 'artistic', 'geometric'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      vec2 hash2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float scale=10.0;
        vec2 st=uv*scale;
        vec2 i_st=floor(st);
        vec2 f_st=fract(st);
        float minD=2.0;
        float id=0.0;
        for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){
          vec2 n=vec2(float(x),float(y));
          vec2 pt=hash2(i_st+n);
          pt=0.5+0.3*sin(u_time*0.3+6.28*pt);
          float d=length(n+pt-f_st);
          if(d<minD){minD=d;id=dot(i_st+n,vec2(7.13,157.97));}
        }
        float hue=fract(sin(id)*43.17);
        vec3 col;
        col.r=0.4+0.5*sin(hue*6.28+0.0);
        col.g=0.3+0.4*sin(hue*6.28+2.09);
        col.b=0.4+0.5*sin(hue*6.28+4.18);
        col*=0.6+0.4*smoothstep(0.0,0.15,minD);
        float edge=smoothstep(0.03,0.06,minD);
        col*=edge*0.85+0.15;
        float light=0.7+0.3*sin(u_time*0.5+uv.y*3.0);
        col*=light;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'lp-ice-cavern',
    name: 'Ice Cavern',
    description: 'Low-poly frozen cave with icy blue facets and shimmering crystalline surfaces.',
    tags: ['lowpoly', 'nature', '2d'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float scale=16.0;
        vec2 p=uv*scale;
        vec2 cell=floor(p);
        vec2 f=fract(p);
        float tri=step(f.x+f.y,1.0);
        float id=hash(cell+tri);
        float depth=sin(cell.x*0.5)*0.5+cos(cell.y*0.4+u_time*0.2)*0.3+0.5;
        depth=clamp(depth,0.0,1.0);
        vec3 deep=vec3(0.02,0.05,0.15);
        vec3 mid=vec3(0.1,0.3,0.55);
        vec3 bright=vec3(0.5,0.75,0.9);
        vec3 col=mix(deep,mid,depth);
        col=mix(col,bright,pow(depth,3.0));
        float shimmer=pow(id,10.0)*sin(u_time*2.0+id*20.0)*0.3;
        col+=shimmer*vec3(0.6,0.8,1.0);
        col*=0.85+0.15*id;
        float edgeX=smoothstep(0.01,0.04,f.x)*smoothstep(0.99,0.96,f.x);
        float edgeY=smoothstep(0.01,0.04,f.y)*smoothstep(0.99,0.96,f.y);
        col*=0.9+0.1*edgeX*edgeY;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'premium-liquid-metal',
    name: 'Liquid Metal',
    description: 'Ultra-smooth mercury-like liquid metal surface with realistic reflections and flowing distortion.',
    tags: ['artistic', 'organic', '2d'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p=p*2.1+vec2(0.1);a*=0.5;}return v;}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 p=uv*3.0;
        float md=length(uv-u_mouse);
        float ripple=sin(md*15.0-u_time*3.0)*exp(-md*3.0)*0.15;
        float n1=fbm(p+u_time*0.15+ripple);
        float n2=fbm(p*1.3-u_time*0.1+n1*0.8);
        float metal=n2*0.5+0.5;
        float spec=pow(max(0.0,metal-0.4)*2.5,4.0);
        vec3 dark=vec3(0.15,0.16,0.18);
        vec3 mid=vec3(0.5,0.52,0.55);
        vec3 bright=vec3(0.85,0.87,0.9);
        vec3 col=mix(dark,mid,metal);
        col=mix(col,bright,pow(metal,3.0));
        col+=spec*vec3(1.0,0.98,0.95)*0.6;
        vec3 envTint=vec3(0.6,0.7,0.8)*0.1*sin(n1*6.28);
        col+=envTint;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'premium-ember-flow',
    name: 'Ember Flow',
    description: 'Smoldering ember particles flowing through dark space with volumetric heat distortion.',
    tags: ['nature', 'organic', 'artistic'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 p=uv*4.0;
        p.y-=u_time*0.4;
        float n=noise(p*2.0)+noise(p*4.0)*0.5+noise(p*8.0)*0.25;
        n/=1.75;
        float heat=n*smoothstep(0.0,0.6,uv.y)*smoothstep(1.0,0.3,uv.y);
        heat+=exp(-length(uv-u_mouse)*5.0)*0.3;
        heat=clamp(heat,0.0,1.0);
        vec3 col=vec3(0.02,0.01,0.01);
        col=mix(col,vec3(0.6,0.1,0.0),smoothstep(0.2,0.4,heat));
        col=mix(col,vec3(1.0,0.4,0.0),smoothstep(0.4,0.6,heat));
        col=mix(col,vec3(1.0,0.8,0.3),smoothstep(0.6,0.8,heat));
        col=mix(col,vec3(1.0,1.0,0.9),smoothstep(0.85,1.0,heat));
        float flicker=0.9+0.1*sin(u_time*8.0+uv.x*20.0);
        col*=flicker;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'premium-ocean-depth',
    name: 'Ocean Depth',
    description: 'Deep underwater caustics with volumetric light rays filtering through a shifting surface.',
    tags: ['nature', 'organic', '2d'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec2 p=uv*5.0;
        float caustic1=sin(p.x*3.0+sin(p.y*2.0+u_time)*1.5)*sin(p.y*3.0+sin(p.x*1.5+u_time*0.7)*1.5);
        float caustic2=sin(p.x*4.0-u_time*0.5+sin(p.y*3.0)*1.0)*sin(p.y*4.0+u_time*0.3);
        float caustics=pow(max(0.0,caustic1+caustic2)*0.5+0.5,2.0);
        float depth=uv.y;
        vec3 shallow=vec3(0.0,0.3,0.5);
        vec3 deep=vec3(0.0,0.05,0.15);
        vec3 col=mix(deep,shallow,1.0-depth);
        float lightRay=noise(vec2(uv.x*3.0+u_time*0.1,uv.y*0.5));
        lightRay=pow(lightRay,3.0)*smoothstep(0.0,0.5,1.0-uv.y)*0.4;
        col+=caustics*vec3(0.1,0.4,0.5)*0.5*(1.0-depth*0.5);
        col+=lightRay*vec3(0.1,0.5,0.6);
        float md=length(uv-u_mouse);
        col+=exp(-md*6.0)*vec3(0.05,0.2,0.3)*0.5;
        float particles=step(0.995,hash(floor(uv*60.0)+floor(u_time*2.0)));
        col+=particles*vec3(0.2,0.5,0.6)*0.5;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'lp-desert-dunes',
    name: 'Low Poly Dunes',
    description: 'Faceted desert sand dunes with warm lighting and geometric shadows shifting over time.',
    tags: ['lowpoly', 'landscape', 'nature'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float scale=14.0;
        vec2 p=uv*vec2(scale,scale*0.5);
        float row=floor(p.y);
        vec2 cell=floor(p+vec2(mod(row,2.0)*0.5,0.0));
        float id=hash(cell);
        float dune=sin(cell.x*0.3+u_time*0.05)*0.4+sin(cell.x*0.7)*0.3+0.5;
        dune*=smoothstep(0.0,0.3,uv.y)*smoothstep(0.9,0.5,uv.y);
        vec3 light=normalize(vec3(u_mouse.x-0.5,0.5,0.6));
        float shade=0.5+0.5*dot(normalize(vec3(id-0.5,dune,0.5)),light);
        vec3 sand=vec3(0.85,0.7,0.45);
        vec3 shadow=vec3(0.5,0.35,0.2);
        vec3 col=mix(shadow,sand,shade);
        col*=0.85+0.15*id;
        vec3 sky=mix(vec3(0.95,0.7,0.4),vec3(0.4,0.6,0.9),uv.y);
        float horizon=smoothstep(0.85,1.0,uv.y);
        col=mix(col,sky,horizon);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'premium-neon-rain',
    name: 'Neon Rain',
    description: 'Cyberpunk neon rain streaming down with glowing reflections on a dark city surface.',
    tags: ['glitch', 'retro', '2d'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        vec3 col=vec3(0.01,0.01,0.03);
        for(int i=0;i<30;i++){
          float fi=float(i);
          float x=hash(vec2(fi,0.0));
          float speed=0.3+hash(vec2(fi,1.0))*0.7;
          float y=fract(-u_time*speed+hash(vec2(fi,2.0)));
          float len=0.02+hash(vec2(fi,3.0))*0.06;
          float dx=abs(uv.x-x);
          float inStreak=step(dx,0.002)*step(y-len,uv.y)*step(uv.y,y);
          float hue=hash(vec2(fi,4.0));
          vec3 rc;
          rc.r=0.5+0.5*sin(hue*6.28);
          rc.g=0.5+0.5*sin(hue*6.28+2.09);
          rc.b=0.5+0.5*sin(hue*6.28+4.18);
          col+=inStreak*rc*0.8;
          float glow=exp(-dx*300.0)*step(y-len,uv.y)*step(uv.y,y)*0.15;
          col+=glow*rc;
        }
        float reflect=smoothstep(0.15,0.0,uv.y);
        col+=reflect*col*0.5;
        float md=length(uv-u_mouse);
        col+=exp(-md*8.0)*vec3(0.1,0.05,0.15)*0.3;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'lp-forest-canopy',
    name: 'Low Poly Canopy',
    description: 'Bird-eye view of a faceted forest canopy with varying green tones and dappled light.',
    tags: ['lowpoly', 'nature', 'landscape'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=gl_FragCoord.xy/u_resolution;
        float scale=18.0;
        vec2 p=uv*scale;
        float row=floor(p.y);
        vec2 cell=floor(p+vec2(mod(row,2.0)*0.5,0.0));
        vec2 f=fract(p+vec2(mod(row,2.0)*0.5,0.0));
        float tri=step(f.x+f.y,1.0);
        float id=hash(cell+tri);
        float sway=sin(u_time*0.5+cell.x*0.3+id*6.28)*0.1;
        vec3 dark=vec3(0.05,0.2,0.05);
        vec3 mid=vec3(0.15,0.45,0.1);
        vec3 bright=vec3(0.3,0.6,0.15);
        float treeType=id;
        vec3 col=mix(dark,mid,treeType);
        col=mix(col,bright,pow(treeType,2.0));
        float light=0.7+0.3*sin(u_time*0.3+cell.x*0.5+cell.y*0.7);
        light+=sway;
        col*=clamp(light,0.5,1.2);
        col*=0.85+0.15*id;
        float gap=step(0.95,id)*0.3;
        col=mix(col,vec3(0.1,0.08,0.02),gap);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'premium-void-portal',
    name: 'Void Portal',
    description: 'Swirling dark matter portal with gravitational lensing effect around the cursor.',
    tags: ['space', 'geometric', '2d'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*0.5)/min(u_resolution.x,u_resolution.y);
        vec2 center=u_mouse-0.5;
        center.x*=u_resolution.x/u_resolution.y;
        float d=length(uv-center);
        float bend=0.1/(d+0.1);
        vec2 bent=uv+(uv-center)*bend*0.3;
        float angle=atan(bent.y-center.y,bent.x-center.x);
        float r=length(bent-center);
        float spiral=sin(angle*5.0-r*10.0+u_time*2.0);
        float rings=sin(r*20.0-u_time*3.0)*0.5+0.5;
        float pattern=spiral*0.5+rings*0.5;
        pattern*=smoothstep(0.0,0.15,d);
        vec3 col=vec3(0.01);
        col+=pattern*vec3(0.2,0.1,0.4)*0.6;
        col+=pow(max(0.0,pattern-0.5)*2.0,3.0)*vec3(0.4,0.2,0.8)*0.4;
        float rim=smoothstep(0.12,0.08,d)*smoothstep(0.03,0.08,d);
        col+=rim*vec3(0.5,0.3,1.0)*0.6;
        float core=0.005/(d*d+0.005);
        col+=core*vec3(0.3,0.15,0.5)*0.15;
        float stars=step(0.98,hash(floor(uv*40.0)));
        col+=stars*vec3(0.5,0.5,0.6)*0.3*smoothstep(0.2,0.5,d);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
];
