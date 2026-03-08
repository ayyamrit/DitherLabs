import { useRef, useEffect, useState } from 'react';
import { useWebGLShader } from '@/hooks/useWebGLShader';
import type { DitherShaderDef } from '@/shaders/ditherShaders';

interface ShaderCanvasProps {
  shader: DitherShaderDef;
  className?: string;
  active?: boolean;
  resolution?: number;
}

const ShaderCanvas = ({ shader, className = '', active = true, resolution = 400 }: ShaderCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => setIsVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const shouldRender = active && isVisible;

  const { canvasRef, handleMouseMove } = useWebGLShader({
    fragmentShader: shader.fragmentShader,
    active: shouldRender,
  });

  return (
    <div ref={containerRef} className={`relative w-full h-full ${className}`}>
      <canvas
        ref={canvasRef}
        width={resolution}
        height={resolution}
        onMouseMove={handleMouseMove}
        className="w-full h-full block"
        style={{ imageRendering: 'auto' }}
      />
      {!shouldRender && (
        <div className="absolute inset-0 flex items-center justify-center bg-card">
          <span className="font-mono text-xs text-muted-foreground">loading...</span>
        </div>
      )}
    </div>
  );
};

export default ShaderCanvas;
