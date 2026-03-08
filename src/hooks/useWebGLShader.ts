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

// Fallback shader shown when compilation fails
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
  const [ready, setReady] = useState(false);
  const [compileFailed, setCompileFailed] = useState(false);
  const currentShaderRef = useRef(fragmentShader);

  const ensureCanvasSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const cssWidth = canvas.clientWidth || canvas.width || 1;
    const cssHeight = canvas.clientHeight || canvas.height || 1;
    const displayWidth = Math.max(1, Math.floor(cssWidth * dpr));
    const displayHeight = Math.max(1, Math.floor(cssHeight * dpr));
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
  }, []);

  const initContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    if (glRef.current && !glRef.current.isContextLost()) return glRef.current;
    const gl = canvas.getContext('webgl', {
      antialias: false,
      preserveDrawingBuffer: false,
      alpha: true,
      powerPreference: 'low-power',
    });
    if (!gl) return null;
    glRef.current = gl;
    return gl;
  }, []);

  const compileProgram = useCallback((gl: WebGLRenderingContext, frag: string): WebGLProgram | null => {
    const compile = (type: number, src: string) => {
      const s = gl.createShader(type);
      if (!s) return null;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(s) || '';
        gl.deleteShader(s);
        return { error: log };
      }
      return s;
    };

    const vs = compile(gl.VERTEX_SHADER, DEFAULT_VERTEX);
    if (!vs || 'error' in vs) return null;

    const fs = compile(gl.FRAGMENT_SHADER, frag);
    if (!fs || 'error' in fs) {
      gl.deleteShader(vs as WebGLShader);
      if (fs && 'error' in fs) {
        onCompileError?.((fs as { error: string }).error);
      }
      return null;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vs as WebGLShader);
      gl.deleteShader(fs as WebGLShader);
      return null;
    }

    gl.attachShader(program, vs as WebGLShader);
    gl.attachShader(program, fs as WebGLShader);
    gl.linkProgram(program);
    gl.deleteShader(vs as WebGLShader);
    gl.deleteShader(fs as WebGLShader);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program);
      return null;
    }
    return program;
  }, [onCompileError]);

  const setupProgram = useCallback(() => {
    const gl = initContext();
    if (!gl) { setReady(false); return; }
    ensureCanvasSize();

    // Try compiling the requested shader
    let nextProgram = compileProgram(gl, fragmentShader);
    
    if (!nextProgram) {
      // Fallback: compile a safe shader so the canvas isn't blank
      setCompileFailed(true);
      nextProgram = compileProgram(gl, FALLBACK_FRAGMENT);
      if (!nextProgram) { setReady(false); return; }
    } else {
      setCompileFailed(false);
    }

    if (programRef.current) gl.deleteProgram(programRef.current);
    programRef.current = nextProgram;
    gl.useProgram(nextProgram);

    if (!bufferRef.current) {
      const buffer = gl.createBuffer();
      if (buffer) {
        bufferRef.current = buffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1,1,-1,-1,1,1,1]), gl.STATIC_DRAW);
      }
    } else {
      gl.bindBuffer(gl.ARRAY_BUFFER, bufferRef.current);
    }

    const posLoc = gl.getAttribLocation(nextProgram, 'a_position');
    if (posLoc !== -1) {
      gl.enableVertexAttribArray(posLoc);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);
    }

    startTimeRef.current = Date.now();
    setReady(true);
  }, [compileProgram, ensureCanvasSize, fragmentShader, initContext]);

  const renderFrame = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    if (!gl || !program || !canvas || gl.isContextLost()) return;
    ensureCanvasSize();
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');
    if (timeLoc !== null) gl.uniform1f(timeLoc, (Date.now() - startTimeRef.current) / 1000.0);
    if (resLoc !== null) gl.uniform2f(resLoc, canvas.width, canvas.height);
    if (mouseLoc !== null) gl.uniform2f(mouseLoc, mouseRef.current.x, mouseRef.current.y);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, [ensureCanvasSize]);

  // Recompile when shader source changes
  useEffect(() => {
    if (!active) return;
    currentShaderRef.current = fragmentShader;
    setupProgram();
  }, [active, fragmentShader, setupProgram]);

  // Context lost/restored
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onLost = (e: Event) => { e.preventDefault(); setReady(false); cancelAnimationFrame(animFrameRef.current); };
    const onRestored = () => { glRef.current = null; programRef.current = null; bufferRef.current = null; if (active) setupProgram(); };
    canvas.addEventListener('webglcontextlost', onLost);
    canvas.addEventListener('webglcontextrestored', onRestored);
    return () => { canvas.removeEventListener('webglcontextlost', onLost); canvas.removeEventListener('webglcontextrestored', onRestored); };
  }, [active, setupProgram]);

  // Render loop
  useEffect(() => {
    if (!active) { cancelAnimationFrame(animFrameRef.current); return; }
    const loop = () => { renderFrame(); animFrameRef.current = requestAnimationFrame(loop); };
    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [active, renderFrame]);

  // Cleanup
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
