import { useRef, useEffect, useCallback, useState } from 'react';

interface UseWebGLShaderOptions {
  fragmentShader: string;
  active?: boolean;
}

const DEFAULT_VERTEX = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

export function useWebGLShader({ fragmentShader, active = true }: UseWebGLShaderOptions) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const bufferRef = useRef<WebGLBuffer | null>(null);
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const startTimeRef = useRef(Date.now());
  const [ready, setReady] = useState(false);

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

    if (glRef.current && !glRef.current.isContextLost()) {
      return glRef.current;
    }

    const gl = canvas.getContext('webgl', {
      antialias: false,
      preserveDrawingBuffer: false,
      alpha: true,
      powerPreference: 'high-performance',
    });

    if (!gl) {
      console.error('WebGL not supported');
      return null;
    }

    glRef.current = gl;
    return gl;
  }, []);

  const compileProgram = useCallback((gl: WebGLRenderingContext, nextFragmentShader: string) => {
    const compileShader = (type: number, source: string, label: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const message = gl.getShaderInfoLog(shader) || `${label} shader compilation failed.`;
        console.error(`${label} shader error:`, message);
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    };

    const vs = compileShader(gl.VERTEX_SHADER, DEFAULT_VERTEX, 'Vertex');
    if (!vs) return null;

    const fs = compileShader(gl.FRAGMENT_SHADER, nextFragmentShader, 'Fragment');
    if (!fs) {
      gl.deleteShader(vs);
      return null;
    }

    const program = gl.createProgram();
    if (!program) {
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      return null;
    }

    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    gl.deleteShader(vs);
    gl.deleteShader(fs);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }

    return program;
  }, []);

  const setupProgram = useCallback(() => {
    const gl = initContext();
    if (!gl) {
      setReady(false);
      return;
    }

    ensureCanvasSize();

    const nextProgram = compileProgram(gl, fragmentShader);
    if (!nextProgram) {
      setReady(Boolean(programRef.current));
      return;
    }

    if (programRef.current) {
      gl.deleteProgram(programRef.current);
    }

    programRef.current = nextProgram;
    gl.useProgram(nextProgram);

    if (!bufferRef.current) {
      const buffer = gl.createBuffer();
      if (buffer) {
        bufferRef.current = buffer;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
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

  useEffect(() => {
    if (!active) return;
    setupProgram();
  }, [active, setupProgram]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onContextLost = (event: Event) => {
      event.preventDefault();
      setReady(false);
      cancelAnimationFrame(animFrameRef.current);
    };

    const onContextRestored = () => {
      glRef.current = null;
      programRef.current = null;
      bufferRef.current = null;
      if (active) setupProgram();
    };

    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);

    return () => {
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
    };
  }, [active, setupProgram]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const loop = () => {
      renderFrame();
      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, renderFrame]);

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);

      const gl = glRef.current;
      if (gl) {
        if (programRef.current) {
          gl.deleteProgram(programRef.current);
        }
        if (bufferRef.current) {
          gl.deleteBuffer(bufferRef.current);
        }

        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }

      glRef.current = null;
      programRef.current = null;
      bufferRef.current = null;
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

  return { canvasRef, handleMouseMove, ready };
}
