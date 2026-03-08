import { forwardRef, useRef, useEffect, useState } from 'react';
import { useWebGLShader } from '@/hooks/useWebGLShader';
import type { DitherShaderDef } from '@/shaders/ditherShaders';

interface ShaderCanvasProps {
  shader: DitherShaderDef;
  className?: string;
  active?: boolean;
  resolution?: number;
  mouseEnabled?: boolean;
  alwaysRender?: boolean;
  onCompileError?: (error: string) => void;
}

const ShaderCanvas = forwardRef<HTMLDivElement, ShaderCanvasProps>(({
  shader,
  className = '',
  active = true,
  resolution = 400,
  mouseEnabled = true,
  alwaysRender = false,
  onCompileError,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || alwaysRender) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [alwaysRender]);

  const shouldRender = active && (alwaysRender || isVisible);

  const { canvasRef, handleMouseMove, compileFailed } = useWebGLShader({
    fragmentShader: shader.fragmentShader,
    active: shouldRender,
    onCompileError,
  });

  return (
    <div ref={(node) => {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        width={resolution}
        height={resolution}
        onMouseMove={mouseEnabled ? handleMouseMove : undefined}
        className="w-full h-full block"
        style={{ imageRendering: 'auto' }}
      />
      {compileFailed && (
        <div className="absolute bottom-2 left-2 font-mono text-[10px] px-2 py-1 rounded bg-destructive/80 text-destructive-foreground backdrop-blur-sm">
          shader compile failed
        </div>
      )}
    </div>
  );
});

ShaderCanvas.displayName = 'ShaderCanvas';
export default ShaderCanvas;
