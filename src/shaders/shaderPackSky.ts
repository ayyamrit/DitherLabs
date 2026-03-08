import type { DitherShaderDef } from './ditherShaders';

export const shaderPackSky: DitherShaderDef[] = [
  {
    id: 'sky-golden-hour',
    name: 'Golden Hour Sky',
    description: 'Warm golden hour sky with layered clouds and sun rays.',
    tags: ['sky', 'atmospheric', 'nature'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec2 sunPos=vec2(0.2,-0.05+sin(u_time*0.05)*0.1);
        float sunDist=length(uv-sunPos);
        // Sky gradient
        vec3 col=mix(vec3(1.0,0.55,0.2),vec3(0.3,0.15,0.5),smoothstep(-0.3,0.5,uv.y));
        col=mix(col,vec3(1.0,0.85,0.4),smoothstep(0.3,0.0,sunDist));
        // Sun
        col+=smoothstep(0.06,0.03,sunDist)*vec3(1.0,0.95,0.8)*1.5;
        // God rays
        float a=atan(uv.y-sunPos.y,uv.x-sunPos.x);
        float rays=sin(a*12.0+u_time*0.3)*0.5+0.5;
        rays*=smoothstep(0.1,0.4,sunDist)*smoothstep(0.8,0.2,sunDist);
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float rayD=step(bayer,rays*0.4);
        col+=rayD*vec3(0.3,0.2,0.05);
        // Clouds
        float cloud=fbm(vec2(uv.x*2.0+u_time*0.05,uv.y*3.0+0.5));
        cloud=smoothstep(0.4,0.7,cloud)*smoothstep(0.5,0.1,abs(uv.y-0.1));
        float cloudD=step(bayer,cloud*0.8);
        vec3 cloudCol=mix(vec3(1.0,0.7,0.4),vec3(0.8,0.4,0.3),uv.y+0.3);
        col=mix(col,cloudCol,cloudD*0.6);
        // Horizon haze
        col=mix(col,vec3(1.0,0.6,0.3),smoothstep(0.1,-0.15,uv.y)*0.3);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'sky-thunderstorm-clouds',
    name: 'Thunderstorm Clouds',
    description: 'Dark cumulonimbus clouds with internal lightning illumination.',
    tags: ['sky', 'weather', 'atmospheric'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 col=mix(vec3(0.15,0.15,0.2),vec3(0.05,0.05,0.08),smoothstep(-0.5,0.5,uv.y));
        // Cloud layers
        float c1=fbm(vec2(uv.x*1.5+u_time*0.02,uv.y*2.0+0.5));
        float c2=fbm(vec2(uv.x*2.5-u_time*0.03,uv.y*3.0+1.0));
        float cloud=smoothstep(0.35,0.65,c1)*0.7+smoothstep(0.4,0.7,c2)*0.3;
        // Lightning flashes
        float flash1=pow(max(sin(u_time*8.0+sin(u_time*3.1)*5.0),0.0),30.0);
        float flash2=pow(max(sin(u_time*11.0+sin(u_time*4.7)*3.0+2.0),0.0),25.0);
        vec2 flashPos1=vec2(-0.2,0.1);
        vec2 flashPos2=vec2(0.3,0.15);
        float fGlow1=smoothstep(0.4,0.0,length(uv-flashPos1))*flash1;
        float fGlow2=smoothstep(0.35,0.0,length(uv-flashPos2))*flash2;
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float cloudD=step(bayer,cloud*0.7);
        col=mix(col,vec3(0.12,0.12,0.15),cloudD);
        // Lightning illumination through clouds
        col+=fGlow1*cloud*vec3(0.6,0.5,0.8)*2.0;
        col+=fGlow2*cloud*vec3(0.5,0.55,0.9)*1.5;
        // Lightning bolts
        float bolt1=smoothstep(0.008,0.0,abs(uv.x-flashPos1.x+sin(uv.y*20.0)*0.02))*step(uv.y,-0.1)*step(-0.4,uv.y)*flash1;
        float bolt2=smoothstep(0.006,0.0,abs(uv.x-flashPos2.x+sin(uv.y*25.0)*0.015))*step(uv.y,-0.15)*step(-0.45,uv.y)*flash2;
        col+=bolt1*vec3(0.8,0.7,1.0);
        col+=bolt2*vec3(0.7,0.75,1.0);
        // Rain
        float rain=hash(floor(gl_FragCoord.xy*vec2(0.1,0.02)+vec2(0,u_time*15.0)));
        col+=step(0.97,rain)*vec3(0.15,0.15,0.2);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'sky-milky-way',
    name: 'Milky Way Night Sky',
    description: 'Clear night sky with milky way band, shooting stars, and constellations.',
    tags: ['sky', 'space', 'night'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 col=vec3(0.01,0.01,0.03);
        // Horizon glow
        col+=smoothstep(0.0,-0.4,uv.y)*vec3(0.03,0.04,0.06);
        // Milky way band
        float band=smoothstep(0.25,0.0,abs(uv.y-uv.x*0.3+0.05));
        float mw=noise(uv*8.0)*noise(uv*15.0+3.0);
        band*=mw*2.0;
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float mwD=step(bayer,band*0.6);
        col+=mwD*vec3(0.12,0.1,0.18);
        // Dense star field
        for(int l=0;l<3;l++){
          float fl=float(l);
          float scale=60.0+fl*40.0;
          vec2 sg=floor(uv*scale);
          float s=hash(sg);
          float bright=hash(sg+50.0);
          float twinkle=sin(u_time*2.0+s*30.0)*0.3+0.7;
          float inBand=smoothstep(0.3,0.0,abs(uv.y-uv.x*0.3+0.05));
          float thresh=0.95-inBand*0.08-fl*0.02;
          if(s>thresh){
            vec3 starCol=bright>0.7?vec3(0.8,0.85,1.0):bright>0.4?vec3(1.0,0.9,0.7):vec3(0.9,0.6,0.5);
            col+=starCol*twinkle*(0.3+fl*0.1);
          }
        }
        // Shooting star
        float shootT=fract(u_time*0.15);
        vec2 shootStart=vec2(-0.3,0.35);
        vec2 shootEnd=vec2(0.4,0.1);
        vec2 shootPos=mix(shootStart,shootEnd,shootT);
        float shootD=length(uv-shootPos);
        float trail=0.0;
        for(int i=0;i<8;i++){
          float fi=float(i)/8.0;
          vec2 tp=mix(shootStart,shootEnd,max(shootT-fi*0.05,0.0));
          trail+=smoothstep(0.01,0.0,length(uv-tp))*(1.0-fi);
        }
        float shootVis=step(0.8,fract(u_time*0.07))*smoothstep(1.0,0.0,shootT);
        col+=trail*vec3(0.5,0.6,0.8)*shootVis;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'sky-cotton-candy',
    name: 'Cotton Candy Clouds',
    description: 'Dreamy pink and blue pastel sky with fluffy scattered clouds.',
    tags: ['sky', 'dreamy', 'atmospheric'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        // Pastel sky gradient
        vec3 top=vec3(0.4,0.6,0.9);
        vec3 mid=vec3(0.85,0.6,0.75);
        vec3 bot=vec3(0.95,0.75,0.65);
        float t=uv.y+0.3;
        vec3 col=t>0.3?mix(mid,top,smoothstep(0.3,0.8,t)):mix(bot,mid,smoothstep(-0.2,0.3,t));
        // Cloud layers
        for(int l=0;l<3;l++){
          float fl=float(l);
          float y=0.1-fl*0.15;
          float scale=2.0+fl;
          float cloud=fbm(vec2(uv.x*scale+u_time*0.02*(1.0+fl*0.5)+fl*5.0,(uv.y-y)*scale*2.0));
          cloud=smoothstep(0.35+fl*0.05,0.65,cloud);
          cloud*=smoothstep(0.4,0.0,abs(uv.y-y));
          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float cloudD=step(bayer,cloud*0.7);
          vec3 cloudCol=fl<1.0?vec3(1.0,0.85,0.9):fl<2.0?vec3(0.9,0.85,1.0):vec3(1.0,0.92,0.88);
          col=mix(col,cloudCol,cloudD*0.5);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'sky-eclipse',
    name: 'Solar Eclipse',
    description: 'Dramatic solar eclipse with corona, diamond ring effect, and darkened sky.',
    tags: ['sky', 'space', 'astronomical'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 col=vec3(0.02,0.02,0.06);
        // Darkened sky gradient
        col+=smoothstep(0.0,-0.5,uv.y)*vec3(0.05,0.03,0.08);
        // Stars visible during eclipse
        vec2 sg=floor(uv*70.0);
        float star=step(0.95,hash(sg));
        col+=star*vec3(0.3,0.3,0.4);
        float sunR=length(uv);
        float moonOffset=sin(u_time*0.2)*0.03;
        float moonR=length(uv-vec2(moonOffset,0.0));
        // Corona
        float corona=smoothstep(0.3,0.08,sunR);
        float a=atan(uv.y,uv.x);
        float coronaRays=noise(vec2(a*5.0,sunR*8.0+u_time*0.3))*0.5+0.5;
        corona*=0.5+coronaRays*0.5;
        corona*=smoothstep(0.07,0.09,moonR);// Cut by moon
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float coronaD=step(bayer,corona*0.6);
        col+=coronaD*vec3(0.8,0.5,0.3)*0.5;
        // Inner corona (brighter)
        float innerCorona=smoothstep(0.12,0.08,sunR)*smoothstep(0.07,0.09,moonR);
        col+=innerCorona*vec3(1.0,0.8,0.5)*0.8;
        // Diamond ring effect
        float diamondAngle=sin(u_time*0.1)*3.14;
        vec2 diamondPos=vec2(cos(diamondAngle),sin(diamondAngle))*0.075;
        float diamond=smoothstep(0.02,0.0,length(uv-diamondPos));
        diamond*=smoothstep(0.08,0.075,moonR);
        col+=diamond*vec3(1.0,0.95,0.8)*2.0;
        // Moon disk (dark)
        float moon=smoothstep(0.075,0.07,moonR);
        col*=1.0-moon*0.95;
        // Prominence
        float prom=smoothstep(0.01,0.0,abs(sunR-0.08))*smoothstep(0.5,0.0,abs(a-1.0))*0.5;
        prom*=1.0-moon;
        col+=prom*vec3(1.0,0.3,0.1);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'sky-cirrus-streaks',
    name: 'Cirrus Cloud Streaks',
    description: 'High altitude wispy cirrus clouds streaking across a blue sky.',
    tags: ['sky', 'clouds', 'atmospheric'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        // Deep blue sky
        vec3 col=mix(vec3(0.35,0.55,0.85),vec3(0.15,0.25,0.6),smoothstep(-0.3,0.5,uv.y));
        // Cirrus streaks
        for(int i=0;i<5;i++){
          float fi=float(i);
          float y=0.3-fi*0.12;
          float streakUV=uv.x*3.0+u_time*0.03*(1.0+fi*0.3)+fi*7.0;
          float streak=noise(vec2(streakUV,fi))*noise(vec2(streakUV*2.0+1.0,fi+5.0));
          streak=smoothstep(0.15,0.4,streak);
          float yFade=smoothstep(0.15,0.0,abs(uv.y-y));
          streak*=yFade;
          // Wispy stretch
          float detail=noise(vec2(uv.x*15.0+u_time*0.1,uv.y*2.0+fi*3.0));
          streak*=0.5+detail*0.5;
          vec2 dp=floor(gl_FragCoord.xy/2.0);
          float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
          float cd=step(bayer,streak*0.6);
          col=mix(col,vec3(0.9,0.92,0.95),cd*0.4);
        }
        // Subtle sun glow
        float sunGlow=smoothstep(0.6,0.0,length(uv-vec2(0.4,0.35)));
        col+=sunGlow*vec3(0.15,0.1,0.05);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'sky-double-rainbow',
    name: 'Double Rainbow',
    description: 'Vivid double rainbow arcing across a clearing rain sky.',
    tags: ['sky', 'weather', 'nature'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      vec3 rainbow(float t){
        t=clamp(t,0.0,1.0);
        if(t<0.16)return mix(vec3(1.0,0.0,0.0),vec3(1.0,0.5,0.0),t/0.16);
        if(t<0.33)return mix(vec3(1.0,0.5,0.0),vec3(1.0,1.0,0.0),(t-0.16)/0.17);
        if(t<0.5)return mix(vec3(1.0,1.0,0.0),vec3(0.0,0.8,0.0),(t-0.33)/0.17);
        if(t<0.66)return mix(vec3(0.0,0.8,0.0),vec3(0.0,0.4,1.0),(t-0.5)/0.16);
        if(t<0.83)return mix(vec3(0.0,0.4,1.0),vec3(0.3,0.0,0.5),(t-0.66)/0.17);
        return mix(vec3(0.3,0.0,0.5),vec3(0.5,0.0,0.5),(t-0.83)/0.17);
      }
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        // Post-rain sky
        vec3 col=mix(vec3(0.45,0.55,0.7),vec3(0.3,0.45,0.7),smoothstep(-0.3,0.5,uv.y));
        // Clearing clouds
        float cloud=noise(vec2(uv.x*2.0+u_time*0.02,uv.y*3.0))*noise(vec2(uv.x*3.0-u_time*0.01,uv.y*2.0+1.0));
        cloud=smoothstep(0.15,0.3,cloud)*smoothstep(0.5,0.2,uv.y);
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float cloudD=step(bayer,cloud*0.5);
        col=mix(col,vec3(0.75,0.78,0.82),cloudD*0.4);
        // Rainbow arc
        vec2 center=vec2(0.0,-0.8);
        float r=length(uv-center);
        float bowWidth=0.04;
        // Primary rainbow
        float bow1=smoothstep(bowWidth,0.0,abs(r-0.9));
        float t1=(r-0.9+bowWidth)/(bowWidth*2.0);
        vec3 rc1=rainbow(t1)*bow1;
        // Secondary rainbow (reversed, fainter)
        float bow2=smoothstep(bowWidth*0.7,0.0,abs(r-1.05));
        float t2=1.0-(r-1.05+bowWidth*0.7)/(bowWidth*1.4);
        vec3 rc2=rainbow(t2)*bow2*0.4;
        // Dither the rainbows
        float rd1=step(bayer,bow1*0.7);
        float rd2=step(bayer,bow2*0.5);
        col+=rc1*rd1*0.6;
        col+=rc2*rd2*0.3;
        // Alexander's dark band (between rainbows)
        float darkBand=smoothstep(0.92,0.95,r)*smoothstep(1.02,0.99,r);
        col-=darkBand*0.05;
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'sky-northern-dawn',
    name: 'Northern Dawn',
    description: 'Arctic dawn with gradient sky, ice crystal sparkles, and faint aurora.',
    tags: ['sky', 'arctic', 'atmospheric'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        // Dawn gradient: deep blue to pale gold
        vec3 col=vec3(0.05,0.08,0.2);
        col=mix(col,vec3(0.15,0.2,0.4),smoothstep(0.5,-0.1,uv.y));
        col=mix(col,vec3(0.5,0.35,0.3),smoothstep(0.0,-0.2,uv.y));
        col=mix(col,vec3(0.8,0.55,0.3),smoothstep(-0.15,-0.25,uv.y));
        // Faint aurora wisps high up
        float aurora=noise(vec2(uv.x*3.0+u_time*0.1,uv.y*2.0+3.0));
        aurora=smoothstep(0.45,0.6,aurora)*smoothstep(0.5,0.3,uv.y)*smoothstep(0.15,0.25,uv.y);
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float auroraD=step(bayer,aurora*0.5);
        col+=auroraD*vec3(0.1,0.3,0.15)*0.4;
        // Ice crystal sparkles
        vec2 sg=floor(uv*100.0);
        float sparkle=hash(sg);
        float sTwinkle=sin(u_time*5.0+sparkle*50.0)*0.5+0.5;
        float sVis=step(0.97,sparkle)*sTwinkle*smoothstep(-0.25,0.0,uv.y);
        col+=sVis*vec3(0.6,0.7,0.9);
        // Fading stars
        vec2 stg=floor(uv*50.0);
        float st=step(0.96,hash(stg))*smoothstep(0.1,0.35,uv.y);
        float fadeDown=smoothstep(0.0,0.3,uv.y);
        col+=st*fadeDown*0.3;
        // Snowy horizon
        if(uv.y<-0.25){
          float snow=noise(vec2(uv.x*8.0,0.0))*0.05;
          col=mix(col,vec3(0.7,0.75,0.85)+snow,smoothstep(-0.25,-0.3,uv.y));
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'sky-meteor-shower',
    name: 'Meteor Shower',
    description: 'Night sky filled with multiple streaking meteors and glowing trails.',
    tags: ['sky', 'space', 'night'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        vec3 col=vec3(0.01,0.01,0.04);
        col+=smoothstep(0.0,-0.5,uv.y)*vec3(0.02,0.03,0.04);
        // Star field
        vec2 sg=floor(uv*80.0);
        float s=hash(sg);
        float tw=sin(u_time*2.5+s*30.0)*0.3+0.7;
        col+=step(0.96,s)*tw*vec3(0.4,0.45,0.5);
        // Meteors
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        for(int i=0;i<8;i++){
          float fi=float(i);
          float speed=0.8+hash(vec2(fi,0.0))*1.2;
          float startTime=hash(vec2(fi,5.0))*3.0;
          float t=fract((u_time*0.3+startTime)*speed*0.2);
          float vis=smoothstep(0.0,0.05,t)*smoothstep(0.4,0.2,t);
          vec2 origin=vec2(hash(vec2(fi,1.0))*1.6-0.8,0.3+hash(vec2(fi,2.0))*0.2);
          vec2 dir=normalize(vec2(0.5-hash(vec2(fi,3.0))*0.3,-0.7-hash(vec2(fi,4.0))*0.3));
          vec2 pos=origin+dir*t*0.8;
          // Trail
          float trail=0.0;
          for(int j=0;j<6;j++){
            float fj=float(j)/6.0;
            vec2 tp=origin+dir*(t-fj*0.08)*0.8;
            trail+=smoothstep(0.012,0.0,length(uv-tp))*(1.0-fj);
          }
          trail*=vis;
          float trailD=step(bayer,trail*0.5);
          col+=trailD*vec3(0.4,0.3,0.15);
          // Head
          float head=smoothstep(0.01,0.0,length(uv-pos))*vis;
          col+=head*vec3(1.0,0.8,0.4);
        }
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
  {
    id: 'sky-volumetric-clouds',
    name: 'Volumetric Cloud Flight',
    description: 'Flying through volumetric clouds with sunlight scattering through.',
    tags: ['sky', 'clouds', '3d'],
    featured: true,
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<5;i++){v+=a*noise(p);p*=2.0;a*=0.5;}return v;}
      void main(){
        vec2 uv=(gl_FragCoord.xy-u_resolution*.5)/u_resolution.y;
        // Sky dome
        vec3 skyTop=vec3(0.2,0.35,0.7);
        vec3 skyBot=vec3(0.5,0.65,0.85);
        vec3 col=mix(skyBot,skyTop,smoothstep(-0.3,0.5,uv.y));
        // Sun
        vec2 sunPos=vec2(0.3,0.25);
        float sunDist=length(uv-sunPos);
        col+=smoothstep(0.3,0.0,sunDist)*vec3(0.3,0.25,0.1);
        col+=smoothstep(0.05,0.02,sunDist)*vec3(1.0,0.9,0.7);
        // Cloud layers at different depths
        float totalCloud=0.0;
        vec3 cloudLit=vec3(0.0);
        for(int l=0;l<4;l++){
          float fl=float(l);
          float depth=1.0+fl*0.5;
          vec2 cp=uv*depth+vec2(u_time*0.03*(1.0+fl*0.3),fl*3.0);
          float c=fbm(cp*2.0);
          c=smoothstep(0.35+fl*0.03,0.7,c);
          // Light penetration
          float light=smoothstep(0.5,0.0,length(uv-sunPos)*depth);
          vec3 litCol=mix(vec3(0.6,0.65,0.7),vec3(1.0,0.9,0.7),light*0.5);
          float shadow=1.0-fl*0.15;
          cloudLit+=litCol*c*shadow*(1.0-totalCloud);
          totalCloud+=c*(1.0-totalCloud)*0.7;
        }
        vec2 dp=floor(gl_FragCoord.xy/2.0);
        float bayer=mod(dp.x*3.0+dp.y*5.0,8.0)/8.0;
        float d1=step(bayer,totalCloud*0.5);
        float d2=step(bayer,totalCloud*0.9);
        col=mix(col,cloudLit*0.7,d1);
        col=mix(col,cloudLit,d2);
        gl_FragColor=vec4(col,1.0);
      }
    `,
  },
];
