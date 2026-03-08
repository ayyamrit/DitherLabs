import { forwardRef, useRef, useEffect, useState, useMemo, memo } from 'react';
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

const ShaderCanvas = memo(forwardRef<HTMLDivElement, ShaderCanvasProps>(({
  shader,
  className = '',
  active = true,
  resolution = 400,
  mouseEnabled = true,
  alwaysRender = false,
  onCompileError,
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(alwaysRender);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || alwaysRender) {
      if (alwaysRender) setIsVisible(true);
      return;
    }

    // Start as NOT visible — only render when scrolled into view
    setIsVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.05, rootMargin: '100px' }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [alwaysRender]);

  const shouldRender = active && (alwaysRender || isVisible);

  // Memoize fragment shader string reference to prevent unnecessary recompiles
  const fragmentShader = useMemo(() => shader.fragmentShader, [shader.id]);

  const { canvasRef, handleMouseMove, compileFailed } = useWebGLShader({
    fragmentShader,
    active: shouldRender,
    onCompileError,
  });

  return (
    <div ref={(node) => {
      (containerRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    }} className={`relative w-full h-full ${className}`}>
      {shouldRender ? (
        <canvas
          ref={canvasRef}
          width={resolution}
          height={resolution}
          onMouseMove={mouseEnabled ? handleMouseMove : undefined}
          className="w-full h-full block"
          style={{ imageRendering: 'auto' }}
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-card">
          <span className="font-mono text-xs text-muted-foreground">⏸</span>
        </div>
      )}
      {compileFailed && shouldRender && (
        <div className="absolute bottom-2 left-2 font-mono text-[10px] px-2 py-1 rounded bg-destructive/80 text-destructive-foreground backdrop-blur-sm">
          shader compile failed
        </div>
      )}
    </div>
  );
}));

ShaderCanvas.displayName = 'ShaderCanvas';
export default ShaderCanvas;
