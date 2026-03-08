import type { DitherShaderDef } from './ditherShaders';

export const shaderPackPeople: DitherShaderDef[] = [
  {
    id: 'dancing-stickmen',
    name: 'Dancing Stickmen',
    description: 'A row of stickmen dancing with different phases, arms and legs swinging to a beat.',
    tags: ['2d', 'animated', 'character', 'fun'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float line(vec2 p, vec2 a, vec2 b, float w) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return smoothstep(w, w * 0.2, length(pa - ba * h));
      }
      float circle(vec2 p, vec2 c, float r) {
        return smoothstep(r, r * 0.5, length(p - c));
      }

      float dancer(vec2 p, float phase) {
        float s = 0.0;
        s += circle(p, vec2(0.0, 0.38), 0.035);
        s += line(p, vec2(0.0, 0.34), vec2(0.0, 0.18), 0.007);
        float a1 = sin(phase) * 1.2;
        float a2 = sin(phase + 2.0) * 1.2;
        s += line(p, vec2(0.0, 0.30), vec2(cos(a1)*0.08, 0.30 + sin(a1)*0.08), 0.005);
        s += line(p, vec2(0.0, 0.30), vec2(cos(a2)*-0.08, 0.30 + sin(a2)*0.08), 0.005);
        float l1 = sin(phase + 1.0) * 0.7;
        float l2 = sin(phase + 3.0) * 0.7;
        vec2 knee1 = vec2(sin(l1)*0.05, -0.07);
        vec2 knee2 = vec2(sin(l2)*-0.05, -0.07);
        vec2 hip = vec2(0.0, 0.18);
        s += line(p, hip, hip + knee1, 0.005);
        s += line(p, hip + knee1, hip + knee1 + vec2(0.0, -0.06), 0.005);
        s += line(p, hip, hip + knee2, 0.005);
        s += line(p, hip + knee2, hip + knee2 + vec2(0.0, -0.06), 0.005);
        return clamp(s, 0.0, 1.0);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        for(int i = 0; i < 7; i++) {
          float fi = float(i);
          float x = 0.1 + fi * 0.12;
          float phase = t * 4.0 + fi * 1.3;
          val += dancer(uv - vec2(x, 0.0), phase);
        }
        float ground = smoothstep(0.06, 0.04, uv.y);
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        vec3 bg = mix(vec3(0.95, 0.85, 0.7), vec3(0.85, 0.75, 0.6), uv.y);
        vec3 fg = vec3(0.12, 0.1, 0.08);
        vec3 col = mix(bg, fg, step(0.5, val));
        col = mix(col, vec3(0.3, 0.25, 0.2), ground);
        col += (dither - 0.5) * 0.03;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'stickman-juggler',
    name: 'Stickman Juggler',
    description: 'A stickman juggling three balls in a smooth arc pattern.',
    tags: ['2d', 'animated', 'character', 'fun'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float line(vec2 p, vec2 a, vec2 b, float w) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return smoothstep(w, w * 0.2, length(pa - ba * h));
      }
      float circ(vec2 p, vec2 c, float r) {
        return smoothstep(r, r * 0.4, length(p - c));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time * 3.0;
        float val = 0.0;
        vec2 o = vec2(0.5, 0.0);
        // Head
        val += circ(uv, o + vec2(0.0, 0.42), 0.03);
        // Body
        val += line(uv, o + vec2(0.0, 0.38), o + vec2(0.0, 0.2), 0.006);
        // Legs
        val += line(uv, o + vec2(0.0, 0.2), o + vec2(-0.05, 0.06), 0.005);
        val += line(uv, o + vec2(0.0, 0.2), o + vec2(0.05, 0.06), 0.005);
        // Arms tracking balls
        float armAngle = sin(t * 0.5) * 0.3;
        val += line(uv, o + vec2(0.0, 0.33), o + vec2(-0.08, 0.30 + armAngle * 0.1), 0.005);
        val += line(uv, o + vec2(0.0, 0.33), o + vec2(0.08, 0.30 - armAngle * 0.1), 0.005);
        // Juggling balls
        for(int i = 0; i < 3; i++) {
          float fi = float(i);
          float phase = t + fi * 2.094;
          float bx = sin(phase) * 0.12;
          float by = 0.48 + abs(cos(phase)) * 0.12;
          val += circ(uv, o + vec2(bx, by), 0.015);
        }
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        vec3 bg = vec3(0.08, 0.1, 0.18);
        vec3 fg = vec3(0.9, 0.85, 0.5);
        vec3 col = mix(bg, fg, step(0.5, val));
        col += (dither - 0.5) * 0.02;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'stick-runner',
    name: 'Stick Runner',
    description: 'A stickman running and jumping over hurdles in an endless loop.',
    tags: ['2d', 'animated', 'character', 'game'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float line(vec2 p, vec2 a, vec2 b, float w) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return smoothstep(w, w * 0.2, length(pa - ba * h));
      }
      float circ(vec2 p, vec2 c, float r) {
        return smoothstep(r, r * 0.4, length(p - c));
      }

      float stickRunner(vec2 p, float phase, float jumpY) {
        float s = 0.0;
        vec2 o = vec2(0.0, jumpY);
        s += circ(p, o + vec2(0.0, 0.36), 0.028);
        s += line(p, o + vec2(0.0, 0.33), o + vec2(0.0, 0.18), 0.006);
        float armF = sin(phase) * 0.5;
        s += line(p, o + vec2(0.0, 0.28), o + vec2(0.06 * cos(armF), 0.28 + 0.04 * sin(armF)), 0.004);
        s += line(p, o + vec2(0.0, 0.28), o + vec2(-0.06 * cos(armF + 3.14), 0.28 + 0.04 * sin(armF + 3.14)), 0.004);
        float legF = sin(phase) * 0.6;
        s += line(p, o + vec2(0.0, 0.18), o + vec2(0.04 * sin(legF), 0.08 + 0.02 * cos(legF)), 0.005);
        s += line(p, o + vec2(0.0, 0.18), o + vec2(-0.04 * sin(legF), 0.08 - 0.02 * cos(legF)), 0.005);
        return clamp(s, 0.0, 1.0);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        float runPhase = t * 8.0;
        float jumpCycle = mod(t * 0.8, 2.0);
        float jumpY = jumpCycle < 1.0 ? sin(jumpCycle * 3.14159) * 0.12 : 0.0;
        val += stickRunner(uv - vec2(0.3, 0.0), runPhase, jumpY);
        // Hurdles
        for(int i = 0; i < 4; i++) {
          float fi = float(i);
          float hx = fract(0.8 + fi * 0.3 - t * 0.15) * 1.4 - 0.2;
          val += line(uv, vec2(hx, 0.05), vec2(hx, 0.15), 0.004);
          val += line(uv, vec2(hx - 0.02, 0.15), vec2(hx + 0.02, 0.15), 0.003);
        }
        // Ground
        float ground = smoothstep(0.06, 0.05, uv.y);
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        vec3 bg = mix(vec3(0.6, 0.8, 1.0), vec3(0.3, 0.5, 0.8), uv.y);
        vec3 fg = vec3(0.1, 0.1, 0.1);
        vec3 col = mix(bg, fg, step(0.5, val));
        col = mix(col, vec3(0.4, 0.35, 0.25), ground);
        col += (dither - 0.5) * 0.02;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'stickman-fight',
    name: 'Stickman Fight',
    description: 'Two stickmen facing off with animated punches and kicks.',
    tags: ['2d', 'animated', 'character', 'action'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float line(vec2 p, vec2 a, vec2 b, float w) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return smoothstep(w, w * 0.2, length(pa - ba * h));
      }
      float circ(vec2 p, vec2 c, float r) {
        return smoothstep(r, r * 0.4, length(p - c));
      }

      float fighter(vec2 p, float phase, float dir) {
        float s = 0.0;
        s += circ(p, vec2(0.0, 0.37), 0.03);
        s += line(p, vec2(0.0, 0.33), vec2(0.0, 0.18), 0.006);
        // Attack arm
        float punch = max(sin(phase * 2.0), 0.0);
        s += line(p, vec2(0.0, 0.28), vec2(dir * (0.04 + punch * 0.08), 0.28), 0.005);
        // Guard arm
        s += line(p, vec2(0.0, 0.28), vec2(dir * -0.03, 0.32), 0.005);
        // Legs
        float kick = max(sin(phase * 2.0 + 1.5), 0.0);
        s += line(p, vec2(0.0, 0.18), vec2(dir * -0.04, 0.06), 0.005);
        s += line(p, vec2(0.0, 0.18), vec2(dir * (0.03 + kick * 0.06), 0.10), 0.005);
        return clamp(s, 0.0, 1.0);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        float sway = sin(t * 1.5) * 0.02;
        val += fighter(uv - vec2(0.35 + sway, 0.0), t * 3.0, 1.0);
        val += fighter(uv - vec2(0.65 - sway, 0.0), t * 3.0 + 1.5, -1.0);
        // Impact flash
        float impact = max(sin(t * 6.0), 0.0);
        float flashR = impact * 0.03;
        val += circ(uv, vec2(0.5, 0.28), flashR) * impact * 0.6;
        float ground = smoothstep(0.055, 0.045, uv.y);
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        vec3 bg = vec3(0.15, 0.05, 0.05);
        vec3 fg = vec3(0.95, 0.9, 0.8);
        vec3 col = mix(bg, fg, step(0.5, val));
        col = mix(col, vec3(0.3, 0.15, 0.1), ground);
        col += (dither - 0.5) * 0.02;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'stickman-wave-crowd',
    name: 'Crowd Wave',
    description: 'A stadium crowd of stickmen doing the wave with their arms.',
    tags: ['2d', 'animated', 'character', 'crowd'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float line(vec2 p, vec2 a, vec2 b, float w) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return smoothstep(w, w * 0.2, length(pa - ba * h));
      }
      float circ(vec2 p, vec2 c, float r) {
        return smoothstep(r, r * 0.4, length(p - c));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;

        for(int row = 0; row < 3; row++) {
          float fr = float(row);
          float baseY = 0.1 + fr * 0.22;
          float scale = 0.7 + fr * 0.15;
          for(int i = 0; i < 12; i++) {
            float fi = float(i);
            float x = 0.05 + fi * 0.08;
            float wave = sin(t * 3.0 - fi * 0.5 - fr * 0.8);
            float armUp = max(wave, 0.0);
            vec2 o = vec2(x, baseY);
            float sc = 0.6 * scale;
            // Head
            val += circ(uv, o + vec2(0.0, 0.14 * sc), 0.015 * sc);
            // Body
            val += line(uv, o + vec2(0.0, 0.12 * sc), o + vec2(0.0, 0.04 * sc), 0.003 * sc);
            // Arms
            float armAngle = -0.5 + armUp * 2.5;
            val += line(uv, o + vec2(0.0, 0.10 * sc), o + vec2(-0.04 * sc, (0.10 + sin(armAngle) * 0.05) * sc), 0.002 * sc);
            val += line(uv, o + vec2(0.0, 0.10 * sc), o + vec2(0.04 * sc, (0.10 + sin(armAngle) * 0.05) * sc), 0.002 * sc);
          }
        }

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        vec3 bg = vec3(0.2, 0.35, 0.15);
        vec3 fg = vec3(0.95, 0.95, 0.9);
        vec3 col = mix(bg, fg, step(0.5, val));
        col += (dither - 0.5) * 0.025;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'stickman-skateboard',
    name: 'Stickman Skater',
    description: 'A stickman doing tricks on a skateboard with kickflips and grinds.',
    tags: ['2d', 'animated', 'character', 'sport'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float line(vec2 p, vec2 a, vec2 b, float w) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return smoothstep(w, w * 0.2, length(pa - ba * h));
      }
      float circ(vec2 p, vec2 c, float r) {
        return smoothstep(r, r * 0.4, length(p - c));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;

        float cycle = mod(t, 4.0);
        float jumpH = cycle < 2.0 ? 0.0 : sin((cycle - 2.0) * 1.5708) * 0.15;
        float tilt = cycle < 2.0 ? 0.0 : sin((cycle - 2.0) * 3.14) * 0.3;
        float xPos = 0.5 + sin(t * 0.5) * 0.1;

        vec2 o = vec2(xPos, 0.1 + jumpH);
        // Skateboard
        float ca = cos(tilt), sa = sin(tilt);
        vec2 bL = o + vec2(-0.06 * ca, -0.06 * sa);
        vec2 bR = o + vec2(0.06 * ca, 0.06 * sa);
        val += line(uv, bL, bR, 0.005);
        val += circ(uv, bL + vec2(-0.005, -0.01), 0.008);
        val += circ(uv, bR + vec2(0.005, -0.01), 0.008);
        // Stickman on board
        vec2 feet = o + vec2(0.0, 0.01);
        vec2 hip = feet + vec2(0.0, 0.1);
        vec2 head = hip + vec2(0.0, 0.17);
        float crouch = cycle < 2.0 ? 0.0 : max(sin((cycle - 2.0) * 3.14), 0.0) * 0.04;
        hip.y -= crouch;
        head.y -= crouch;
        val += circ(uv, head, 0.025);
        val += line(uv, head - vec2(0.0, 0.03), hip, 0.005);
        val += line(uv, hip, feet + vec2(-0.02, 0.0), 0.004);
        val += line(uv, hip, feet + vec2(0.02, 0.0), 0.004);
        float armWave = sin(t * 5.0) * 0.15;
        val += line(uv, hip + vec2(0.0, 0.06), hip + vec2(0.07, 0.08 + armWave), 0.004);
        val += line(uv, hip + vec2(0.0, 0.06), hip + vec2(-0.07, 0.06 - armWave), 0.004);

        // Ground with moving lines
        float ground = smoothstep(0.05, 0.04, uv.y);
        for(int i = 0; i < 6; i++) {
          float fi = float(i);
          float lx = fract(fi * 0.2 - t * 0.3);
          val += line(uv, vec2(lx, 0.04), vec2(lx + 0.03, 0.04), 0.002) * 0.5;
        }

        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        vec3 bg = mix(vec3(0.9, 0.6, 0.3), vec3(0.5, 0.3, 0.15), uv.y);
        vec3 fg = vec3(0.05, 0.05, 0.08);
        vec3 col = mix(bg, fg, step(0.5, val));
        col = mix(col, vec3(0.35, 0.25, 0.15), ground);
        col += (dither - 0.5) * 0.02;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'stickman-band',
    name: 'Stickman Band',
    description: 'A four-piece stickman band playing drums, guitar, bass, and singing.',
    tags: ['2d', 'animated', 'character', 'music'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float line(vec2 p, vec2 a, vec2 b, float w) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return smoothstep(w, w * 0.2, length(pa - ba * h));
      }
      float circ(vec2 p, vec2 c, float r) {
        return smoothstep(r, r * 0.4, length(p - c));
      }

      float musician(vec2 p, float phase, int type) {
        float s = 0.0;
        s += circ(p, vec2(0.0, 0.36), 0.025);
        s += line(p, vec2(0.0, 0.33), vec2(0.0, 0.18), 0.005);
        s += line(p, vec2(0.0, 0.18), vec2(-0.03, 0.06), 0.004);
        s += line(p, vec2(0.0, 0.18), vec2(0.03, 0.06), 0.004);
        if(type == 0) { // Drummer
          float hit = abs(sin(phase * 4.0));
          s += line(p, vec2(0.0, 0.28), vec2(-0.06, 0.28 + hit * 0.06), 0.004);
          s += line(p, vec2(0.0, 0.28), vec2(0.06, 0.28 + hit * 0.06), 0.004);
          s += circ(p, vec2(0.0, 0.14), 0.04); // drum
        } else if(type == 1) { // Guitarist
          float strum = sin(phase * 6.0) * 0.02;
          s += line(p, vec2(0.0, 0.28), vec2(0.05, 0.22 + strum), 0.004);
          s += line(p, vec2(0.0, 0.28), vec2(-0.04, 0.24), 0.004);
          s += line(p, vec2(-0.04, 0.30), vec2(0.06, 0.18), 0.006); // guitar body
        } else if(type == 2) { // Singer
          float bob = sin(phase * 2.0) * 0.01;
          s += line(p, vec2(0.0, 0.28), vec2(-0.05, 0.30), 0.004);
          s += line(p, vec2(0.0, 0.28), vec2(0.04, 0.36 + bob), 0.004);
          s += line(p, vec2(0.04, 0.36 + bob), vec2(0.04, 0.42), 0.003); // mic
          s += circ(p, vec2(0.04, 0.43), 0.008);
        } else { // Bassist
          float sway = sin(phase * 3.0) * 0.02;
          s += line(p, vec2(0.0, 0.28), vec2(0.04, 0.22 + sway), 0.004);
          s += line(p, vec2(0.0, 0.28), vec2(-0.05, 0.25), 0.004);
          s += line(p, vec2(-0.03, 0.34), vec2(0.05, 0.14), 0.007);
        }
        return clamp(s, 0.0, 1.0);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        val += musician(uv - vec2(0.15, 0.0), t * 3.0, 0);
        val += musician(uv - vec2(0.38, 0.0), t * 3.0, 1);
        val += musician(uv - vec2(0.62, 0.0), t * 3.0, 2);
        val += musician(uv - vec2(0.85, 0.0), t * 3.0, 3);
        // Sound waves from singer
        float wave = sin(t * 8.0);
        for(int i = 1; i < 4; i++) {
          float fi = float(i);
          float r = fi * 0.04 + wave * 0.005;
          val += smoothstep(0.004, 0.001, abs(length(uv - vec2(0.66, 0.43)) - r)) * 0.4;
        }
        float ground = smoothstep(0.055, 0.045, uv.y);
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        vec3 bg = vec3(0.05, 0.0, 0.12);
        vec3 spot = vec3(0.3, 0.1, 0.4) * smoothstep(0.6, 0.0, length(uv - vec2(0.5, 0.8)));
        vec3 fg = vec3(1.0, 0.9, 0.5);
        vec3 col = mix(bg + spot, fg, step(0.5, val));
        col = mix(col, vec3(0.15, 0.05, 0.2), ground);
        col += (dither - 0.5) * 0.02;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
  {
    id: 'stickman-rain-umbrella',
    name: 'Umbrella Walk',
    description: 'A stickman walking in the rain holding an umbrella with falling raindrops.',
    tags: ['2d', 'animated', 'character', 'weather'],
    fragmentShader: `
      precision mediump float;
      uniform float u_time;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;

      float hash(float n) { return fract(sin(n) * 43758.5453); }
      float line(vec2 p, vec2 a, vec2 b, float w) {
        vec2 pa = p - a, ba = b - a;
        float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
        return smoothstep(w, w * 0.2, length(pa - ba * h));
      }
      float circ(vec2 p, vec2 c, float r) {
        return smoothstep(r, r * 0.4, length(p - c));
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution;
        float t = u_time;
        float val = 0.0;
        float walkX = fract(t * 0.08) * 1.2 - 0.1;
        float walkPhase = t * 5.0;
        vec2 o = vec2(walkX, 0.0);
        // Head
        val += circ(uv, o + vec2(0.0, 0.36), 0.025);
        // Body
        val += line(uv, o + vec2(0.0, 0.33), o + vec2(0.0, 0.18), 0.005);
        // Walking legs
        float ls = sin(walkPhase) * 0.04;
        val += line(uv, o + vec2(0.0, 0.18), o + vec2(ls, 0.06), 0.004);
        val += line(uv, o + vec2(0.0, 0.18), o + vec2(-ls, 0.06), 0.004);
        // Arm holding umbrella
        val += line(uv, o + vec2(0.0, 0.28), o + vec2(0.02, 0.42), 0.004);
        // Other arm
        val += line(uv, o + vec2(0.0, 0.28), o + vec2(-0.06, 0.24 + sin(walkPhase) * 0.02), 0.004);
        // Umbrella
        val += line(uv, o + vec2(0.02, 0.42), o + vec2(0.02, 0.55), 0.003);
        // Umbrella canopy (arc)
        for(int i = 0; i < 20; i++) {
          float fi = float(i) / 20.0;
          float angle = -1.2 + fi * 2.4;
          vec2 cp = o + vec2(0.02 + cos(angle) * 0.1, 0.52 + sin(angle) * 0.04);
          val += circ(uv, cp, 0.008) * 0.5;
        }
        // Raindrops (bounce off umbrella area)
        for(int i = 0; i < 25; i++) {
          float fi = float(i);
          float rx = hash(fi * 3.7);
          float speed = 0.4 + hash(fi * 5.1) * 0.3;
          float ry = fract(1.0 - t * speed - hash(fi * 2.3));
          float len = 0.015;
          vec2 rp = vec2(rx, ry);
          float d = abs(uv.x - rp.x);
          float alongY = uv.y - rp.y;
          float drop = smoothstep(0.003, 0.001, d) * step(0.0, alongY) * step(alongY, len);
          val += drop * 0.4;
        }
        float ground = smoothstep(0.055, 0.045, uv.y);
        // Puddle reflections
        float puddle = smoothstep(0.06, 0.04, uv.y) * (0.5 + 0.5 * sin(uv.x * 40.0 + t * 3.0)) * 0.3;
        vec2 dp = floor(gl_FragCoord.xy / 2.0);
        float dither = mod(dp.x + dp.y, 2.0);
        vec3 bg = mix(vec3(0.2, 0.22, 0.3), vec3(0.12, 0.14, 0.2), uv.y);
        vec3 fg = vec3(0.85, 0.85, 0.9);
        vec3 col = mix(bg, fg, step(0.5, val));
        col = mix(col, vec3(0.1, 0.12, 0.18), ground);
        col += puddle * vec3(0.2, 0.25, 0.4);
        col += (dither - 0.5) * 0.02;
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  },
];
