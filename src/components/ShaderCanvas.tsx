import { useWebGLShader } from '@/hooks/useWebGLShader';
import type { DitherShaderDef } from '@/shaders/ditherShaders';

interface ShaderCanvasProps {
  shader: DitherShaderDef;
  className?: string;
}

const ShaderCanvas = ({ shader, className = '' }: ShaderCanvasProps) => {
  const { canvasRef, handleMouseMove } = useWebGLShader({
    fragmentShader: shader.fragmentShader,
  });

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      onMouseMove={handleMouseMove}
      className={`w-full h-full ${className}`}
      style={{ imageRendering: 'pixelated' }}
    />
  );
};

export default ShaderCanvas;
