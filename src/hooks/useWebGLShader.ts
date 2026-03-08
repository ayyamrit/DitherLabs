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
  const animFrameRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const startTimeRef = useRef(Date.now());
  const initializedRef = useRef(false);
  const [ready, setReady] = useState(false);

  const initGL = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || initializedRef.current) return;

    const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: false });
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }
    glRef.current = gl;

    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, DEFAULT_VERTEX);
    gl.compileShader(vs);
    if (!gl.getShaderParameter(vs, gl.COMPILE_STATUS)) {
      console.error('Vertex shader error:', gl.getShaderInfoLog(vs));
      return;
    }

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, fragmentShader);
    gl.compileShader(fs);
    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error('Fragment shader error:', gl.getShaderInfoLog(fs));
      return;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program link error:', gl.getProgramInfoLog(program));
      return;
    }
    
    programRef.current = program;

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);

    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    gl.useProgram(program);
    initializedRef.current = true;
    setReady(true);
  }, [fragmentShader]);

  const renderFrame = useCallback(() => {
    const gl = glRef.current;
    const program = programRef.current;
    const canvas = canvasRef.current;
    if (!gl || !program || !canvas) return;

    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);

    const timeLoc = gl.getUniformLocation(program, 'u_time');
    const resLoc = gl.getUniformLocation(program, 'u_resolution');
    const mouseLoc = gl.getUniformLocation(program, 'u_mouse');

    if (timeLoc) gl.uniform1f(timeLoc, (Date.now() - startTimeRef.current) / 1000.0);
    if (resLoc) gl.uniform2f(resLoc, canvas.width, canvas.height);
    if (mouseLoc) gl.uniform2f(mouseLoc, mouseRef.current.x, mouseRef.current.y);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, []);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animFrameRef.current);
      return;
    }

    initGL();

    const loop = () => {
      renderFrame();
      animFrameRef.current = requestAnimationFrame(loop);
    };
    
    // Small delay to ensure canvas is in DOM
    const timeout = setTimeout(() => loop(), 50);
    
    return () => {
      clearTimeout(timeout);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [active, initGL, renderFrame]);

  // Cleanup GL on unmount
  useEffect(() => {
    return () => {
      const gl = glRef.current;
      if (gl) {
        const ext = gl.getExtension('WEBGL_lose_context');
        if (ext) ext.loseContext();
      }
      glRef.current = null;
      programRef.current = null;
      initializedRef.current = false;
    };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: 1.0 - (e.clientY - rect.top) / rect.height,
    };
  }, []);

  return { canvasRef, handleMouseMove, ready };
}
