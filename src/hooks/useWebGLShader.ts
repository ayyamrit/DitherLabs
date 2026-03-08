import { useRef, useEffect, useCallback, useState } from 'react';

interface UseWebGLShaderOptions {
  fragmentShader: string;
  active?: boolean;
  onCompileError?: (error: string) => void;
}

const DEFAULT_VERTEX = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FALLBACK_FRAGMENT = `
  precision mediump float;
  uniform float u_time;
  uniform vec2 u_resolution;
  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution;
    float g = 0.03 + 0.02 * sin(uv.x * 10.0 + u_time) * sin(uv.y * 10.0 - u_time);
    gl_FragColor = vec4(vec3(g), 1.0);
  }
`;

export function useWebGLShader({ fragmentShader, active = true, onCompileError }: UseWebGLShaderOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const bufferRef = useRef<WebGLBuffer | null>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const startTimeRef = useRef(Date.now());
  const lastShaderRef = useRef('');
  const [ready, setReady] = useState(false);
  const [compileFailed, setCompileFailed] = useState(false);

  const destroyGL = useCallback((loseContext: boolean) => {
    cancelAnimationFrame(animFrameRef.current);
    const gl = glRef.current;
    if (gl) {
      if (programRef.current) gl.deleteProgram(programRef.current);
      if (bufferRef.current) gl.deleteBuffer(bufferRef.current);
      if (loseContext) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
    }
    glRef.current = null;
    programRef.current = null;
    bufferRef.current = null;
    setReady(false);
  }, []);

  const ensureCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const cssWidth = canvas.clientWidth || 1;
    const cssHeight = canvas.clientHeight || 1;
    const w = Math.max(1, Math.floor(cssWidth * dpr));
    const h = Math.max(1, Math.floor(cssHeight * dpr));
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  }, []);

  const initContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    if (glRef.current && !glRef.current.isContextLost()) return glRef.current;
    const gl = canvas.getContext('webgl', {
      antialias: false,
      preserveDrawingBuffer: false,
      alpha: false,
      powerPreference: 'low-power',
    });
    if (!gl) return null;
    glRef.current = gl;
    return gl;
  }, []);

  const compileShaderSource = useCallback((gl: WebGLRenderingContext, type: number, src: string): WebGLShader | null => {
    const s = gl.createShader(type);
    if (!s) return null;
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(s) || '';
      gl.deleteShader(s);
      if (type === gl.FRAGMENT_SHADER) onCompileError?.(log);
      return null;
    }
    return s;
  }, [onCompileError]);

  const buildProgram = useCallback((gl: WebGLRenderingContext, frag: string): WebGLProgram | null => {
    const vs = compileShaderSource(gl, gl.VERTEX_SHADER, DEFAULT_VERTEX);
    if (!vs) return null;
    const fs = compileShaderSource(gl, gl.FRAGMENT_SHADER, frag);
    if (!fs) { gl.deleteShader(vs); return null; }
    const prog = gl.createProgram();
    if (!prog) { gl.deleteShader(vs); gl.deleteShader(fs); return null; }
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    gl.deleteShader(vs);
    gl.deleteShader(fs);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { gl.deleteProgram(prog); return null; }
    return prog;
  }, [compileShaderSource]);

  const setupProgram = useCallback(() => {
    // If context was lost, reset refs so we rebuild everything
    if (glRef.current && glRef.current.isContextLost()) {
      glRef.current = null;
      programRef.current = null;
      bufferRef.current = null;
      lastShaderRef.current = '';
    }

    // Skip if same shader already compiled and context is healthy
    if (lastShaderRef.current === fragmentShader && programRef.current && glRef.current) {
      setReady(true);
      return;
    }

    const gl = initContext();
    if (!gl) { setReady(false); return; }
    ensureCanvasSize();

    let prog = buildProgram(gl, fragmentShader);
    if (!prog) {
      setCompileFailed(true);
      prog = buildProgram(gl, FALLBACK_FRAGMENT);
      if (!prog) { setReady(false); return; }
    } else {
      setCompileFailed(false);
    }

    if (programRef.current) gl.deleteProgram(programRef.current);
    programRef.current = prog;
    lastShaderRef.current = fragmentShader;
    gl.useProgram(prog);

    if (!bufferRef.current) {
      const buf = gl.createBuffer();
      if (buf) {
        bufferRef.current = buf;
        gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
      }
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferRef.current);
    }

    const pos = gl.getAttribLocation(prog, 'a_position');
    if (pos !== -1) {
      gl.enableVertexAttribArray(pos);
      gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
    }

    startTimeRef.current = Date.now();
    setReady(true);
  }, [buildProgram, ensureCanvasSize, fragmentShader, initContext]);

  const renderFrame = useCallback(() => {
    const gl = glRef.current;
    const prog = programRef.current;
    const canvas = canvasRef.current;
    if (!gl || !prog || !canvas || gl.isContextLost()) return;
    ensureCanvasSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const t = gl.getUniformLocation(prog, 'u_time');
    const r = gl.getUniformLocation(prog, 'u_resolution');
    const m = gl.getUniformLocation(prog, 'u_mouse');
    if (t !== null) gl.uniform1f(t, (Date.now() - startTimeRef.current) / 1000.0);
    if (r !== null) gl.uniform2f(r, canvas.width, canvas.height);
    if (m !== null) gl.uniform2f(m, mouseRef.current.x, mouseRef.current.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [ensureCanvasSize]);

  useEffect(() => {
    if (!active) {
      destroyGL(true);
      return;
    }
    setupProgram();
  }, [active, fragmentShader, setupProgram, destroyGL]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onLost = (e: Event) => { e.preventDefault(); setReady(false); cancelAnimationFrame(animFrameRef.current); };
    const onRestored = () => {
      glRef.current = null; programRef.current = null; bufferRef.current = null;
      lastShaderRef.current = '';
      if (active) setupProgram();
    };
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    return () => { canvas.removeEventListener('webglcontextlost', onLost); canvas.removeEventListener('webglcontextrestored', onRestored); };
  }, [active, setupProgram]);

  useEffect(() => {
    if (!active) { cancelAnimationFrame(animFrameRef.current); return; }
    const loop = () => { renderFrame(); animFrameRef.current = requestAnimationFrame(loop); };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [active, renderFrame]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      const gl = glRef.current;
      if (gl) {
        if (programRef.current) gl.deleteProgram(programRef.current);
        if (bufferRef.current) gl.deleteBuffer(bufferRef.current);
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
      glRef.current = null; programRef.current = null; bufferRef.current = null;
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: 1.0 - (e.clientY - rect.top) / rect.height,
    };
  }, []);

  return { canvasRef, handleMouseMove, ready, compileFailed };
}
