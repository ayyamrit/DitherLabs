import { memo, useCallback } from 'react';
import ShaderCanvas from './ShaderCanvas';
import type { DitherShaderDef } from '@/shaders/ditherShaders';
import { Maximize2 } from 'lucide-react';

interface ShaderCardProps {
  shader: DitherShaderDef;
  onPreview: (shader: DitherShaderDef) => void;
  active?: boolean;
}

const ShaderCard = memo(({ shader, onPreview, active = true }: ShaderCardProps) => {
  const handlePreview = useCallback(() => onPreview(shader), [shader, onPreview]);

  return (
    <div className="shader-card group">
      <div className="relative aspect-square">
        <ShaderCanvas shader={shader} resolution={256} active={active} />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <button
          onClick={handlePreview}
          className="absolute top-3 right-3 p-2 rounded-lg bg-background/70 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:bg-background/90 opacity-0 group-hover:opacity-100 transition-all duration-200"
        >
          <Maximize2 size={16} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="font-mono text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {shader.description}
          </p>
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-foreground">{shader.name}</h3>
          <button
            onClick={handlePreview}
            className="font-mono text-[10px] text-primary hover:underline cursor-pointer"
          >
            Preview ↗
          </button>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {shader.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}, (prev, next) => prev.shader.id === next.shader.id && prev.onPreview === next.onPreview);

ShaderCard.displayName = 'ShaderCard';
export default ShaderCard;
