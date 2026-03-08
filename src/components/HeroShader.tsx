import { useWebGLShader } from '@/hooks/useWebGLShader';

const HERO_SHADER = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec2 u_mouse;

  float bayer8(vec2 p) {
    vec2 i = floor(mod(p, 8.0));
    int x = int(i.x);
    int y = int(i.y);
    int idx = y * 8 + x;
    float val = 0.0;
    // Simplified 8x8 bayer
    val = mod(float(idx) * 17.0 + float(idx / 4) * 7.0, 64.0) / 64.0;
    return val;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float t = u_time * 0.5;
    
    // Flowing gradient influenced by mouse
    vec2 mouse = u_mouse;
    float d1 = length(uv - mouse);
    float d2 = length(uv - vec2(sin(t) * 0.3 + 0.5, cos(t * 0.7) * 0.3 + 0.5));
    
    float val = sin(d1 * 12.0 - t * 3.0) * 0.3 +
                sin(d2 * 8.0 + t * 2.0) * 0.3 +
                sin(uv.x * 6.0 + uv.y * 4.0 + t) * 0.2 + 0.5;
    
    float threshold = bayer8(gl_FragCoord.xy * 0.5);
    float dithered = step(threshold, val);
    
    vec3 dark = vec3(0.02, 0.02, 0.04);
    vec3 bright = vec3(0.0, 0.95, 0.6);
    vec3 accent = vec3(0.6, 0.3, 0.9);
    
    vec3 col = mix(dark, mix(bright, accent, uv.x * 0.6 + sin(t * 0.3) * 0.2), dithered);
    
    // Subtle vignette
    float vig = 1.0 - length(uv - 0.5) * 0.6;
    col *= vig;
    
    gl_FragColor = vec4(col, 1.0);
  }
`;

const HeroShader = () => {
  const { canvasRef, handleMouseMove } = useWebGLShader({
    fragmentShader: HERO_SHADER,
  });

  return (
    <canvas
      ref={canvasRef}
      width={800}
      height={600}
      onMouseMove={handleMouseMove}
      className="absolute inset-0 w-full h-full opacity-40"
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default HeroShader;
