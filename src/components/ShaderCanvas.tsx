import { useRef, useEffect, useState } from 'react';
import { useWebGLShader } from '@/hooks/useWebGLShader';
import type { DitherShaderDef } from '@/shaders/ditherShaders';

interface ShaderCanvasProps {
  shader: DitherShaderDef;
  className?: string;
  active?: boolean;
  resolution?: number;
  mouseEnabled?: boolean;
}

const ShaderCanvas = ({ shader, className = '', active = true, resolution = 400, mouseEnabled = true }: ShaderCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true); // Start true for fixed backgrounds

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    
    // Check if element is in a fixed container (skip intersection observer)
    const isFixed = window.getComputedStyle(el).position === 'fixed' || 
                    el.closest('[style*="position: fixed"]') ||
                    el.closest('.fixed');
    
    if (isFixed) {
      setIsVisible(true);
      return;
    }
    
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
        onMouseMove={mouseEnabled ? handleMouseMove : undefined}
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
