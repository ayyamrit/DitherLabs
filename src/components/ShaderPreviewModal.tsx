import { useState } from 'react';
import ShaderCanvas from './ShaderCanvas';
import type { DitherShaderDef } from '@/shaders/ditherShaders';
import { X, Mouse, MouseOff, Copy, FileCode, Check } from 'lucide-react';

interface ShaderPreviewModalProps {
  shader: DitherShaderDef;
  onClose: () => void;
}

function generateReactFile(shader: DitherShaderDef): string {
  const componentName = shader.name.replace(/[^a-zA-Z0-9]/g, '');
  return `/**
 * ${shader.name} — Shader Background Component
 * ${shader.description}
 *
 * USAGE:
 * ──────────────────────────────────────────────
 * This component renders a fullscreen WebGL shader.
 * To use it as a BACKGROUND, wrap it in a relative container
 * and the shader will fill that container with absolute positioning.
 *
 *   <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
 *     <${componentName} />
 *     {/* Your content goes ON TOP of the shader */}
 *     <div style={{ position: 'relative', zIndex: 1 }}>
 *       <h1>Hello World</h1>
 *     </div>
 *   </div>
 *
 * KEY RULES:
 * • Parent must have \`position: relative\` (or fixed/absolute)
 * • The shader canvas uses \`position: absolute; inset: 0\` to fill the parent
 * • Place your content AFTER the shader with \`position: relative; z-index: 1\`
 * • Adjust \`resolution\` prop for quality vs performance (default 512)
 * ──────────────────────────────────────────────
 */

import { useRef, useEffect, useCallback } from 'react';

interface ${componentName}Props {
  /** Canvas resolution in pixels (higher = sharper but more GPU). Default: 512 */
  resolution?: number;
  /** Enable mouse interaction. Default: true */
  mouseEnabled?: boolean;
  /** Additional CSS class for the wrapper */
  className?: string;
}

const FRAGMENT_SHADER = \`${shader.fragmentShader.trim()}\`;

const VERTEX_SHADER = \`
  attribute vec2 a_position;
  void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
\`;

export default function ${componentName}({
  resolution = 512,
  mouseEnabled = true,
  className = '',
}: ${componentName}Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const startTimeRef = useRef(Date.now());
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const frameRef = useRef(0);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!mouseEnabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseRef.current = {
      x: (e.clientX - rect.left) / rect.width,
      y: 1.0 - (e.clientY - rect.top) / rect.height,
    };
  }, [mouseEnabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl', { antialias: false, preserveDrawingBuffer: false });
    if (!gl) return;
    glRef.current = gl;

    // Compile shaders
    const vs = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vs, VERTEX_SHADER);
    gl.compileShader(vs);

    const fs = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fs, FRAGMENT_SHADER);
    gl.compileShader(fs);

    if (!gl.getShaderParameter(fs, gl.COMPILE_STATUS)) {
      console.error('Shader compile error:', gl.getShaderInfoLog(fs));
      return;
    }

    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    programRef.current = program;

    // Fullscreen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const posLoc = gl.getAttribLocation(program, 'a_position');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    startTimeRef.current = Date.now();

    const render = () => {
      if (!glRef.current || !programRef.current) return;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.useProgram(programRef.current);

      const t = (Date.now() - startTimeRef.current) / 1000;
      const uTime = gl.getUniformLocation(programRef.current, 'u_time');
      const uRes = gl.getUniformLocation(programRef.current, 'u_resolution');
      const uMouse = gl.getUniformLocation(programRef.current, 'u_mouse');

      if (uTime) gl.uniform1f(uTime, t);
      if (uRes) gl.uniform2f(uRes, canvas.width, canvas.height);
      if (uMouse) gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(frameRef.current);
      const ext = gl.getExtension('WEBGL_lose_context');
      if (ext) ext.loseContext();
      glRef.current = null;
      programRef.current = null;
    };
  }, []);

  return (
    <div className={\`absolute inset-0 overflow-hidden \${className}\`}>
      <canvas
        ref={canvasRef}
        width={resolution}
        height={resolution}
        onMouseMove={handleMouseMove}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    </div>
  );
}
`;
}

const ShaderPreviewModal = ({ shader, onClose }: ShaderPreviewModalProps) => {
  const [copiedGlsl, setCopiedGlsl] = useState(false);
  const [copiedReact, setCopiedReact] = useState(false);
  const [mouseEnabled, setMouseEnabled] = useState(true);
  const [showUsage, setShowUsage] = useState(false);

  const copyGlsl = () => {
    navigator.clipboard.writeText(shader.fragmentShader.trim());
    setCopiedGlsl(true);
    setTimeout(() => setCopiedGlsl(false), 2000);
  };

  const copyReactFile = () => {
    navigator.clipboard.writeText(generateReactFile(shader));
    setCopiedReact(true);
    setTimeout(() => setCopiedReact(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-4xl mx-4 rounded-xl border border-border bg-card overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">{shader.name}</h2>
            <p className="font-mono text-xs text-muted-foreground mt-1">{shader.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMouseEnabled(!mouseEnabled)}
              className={`p-2 rounded-lg border transition-all ${
                mouseEnabled
                  ? 'border-primary/40 text-primary bg-primary/10'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
              title={mouseEnabled ? 'Disable mouse interaction' : 'Enable mouse interaction'}
            >
              {mouseEnabled ? <Mouse size={18} /> : <MouseOff size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Shader Preview */}
        <div className="aspect-video w-full bg-background relative">
          <ShaderCanvas shader={shader} active={true} resolution={800} mouseEnabled={mouseEnabled} alwaysRender={true} />
          {!mouseEnabled && (
            <div className="absolute top-3 left-3 font-mono text-[10px] px-2 py-1 rounded bg-background/70 backdrop-blur-sm border border-border text-muted-foreground">
              mouse disabled
            </div>
          )}
        </div>

        {/* Usage Hint */}
        {showUsage && (
          <div className="px-6 py-4 border-t border-border bg-muted/30">
            <p className="font-mono text-[11px] text-muted-foreground mb-2 font-semibold">📐 How to use as a background:</p>
            <pre className="font-mono text-[11px] text-foreground/80 bg-background rounded-lg p-3 border border-border overflow-x-auto whitespace-pre">{`<!-- Parent needs position: relative -->
<div style={{ position: 'relative', width: '100%', height: '100vh' }}>
  
  <!-- Shader fills the parent (absolute + inset: 0) -->
  <ShaderBackground />
  
  <!-- Your content sits ON TOP (relative + z-index) -->
  <div style={{ position: 'relative', zIndex: 1 }}>
    <h1>Your content here</h1>
  </div>
</div>`}</pre>
            <p className="font-mono text-[10px] text-muted-foreground mt-2 opacity-70">
              The "Copy React File" button gives you a complete, self-contained component with these instructions built in.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="flex gap-1.5 flex-wrap">
            {shader.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowUsage(v => !v)}
              className="font-mono text-[11px] px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              {showUsage ? 'Hide Usage' : '📐 Usage'}
            </button>
            <button
              onClick={copyGlsl}
              className="font-mono text-[11px] px-3 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all flex items-center gap-1.5"
            >
              {copiedGlsl ? <Check size={14} /> : <Copy size={14} />}
              {copiedGlsl ? 'Copied!' : 'GLSL'}
            </button>
            <button
              onClick={copyReactFile}
              className="font-mono text-[11px] px-3 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-1.5"
            >
              {copiedReact ? <Check size={14} /> : <FileCode size={14} />}
              {copiedReact ? 'Copied!' : 'Copy React File'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShaderPreviewModal;
