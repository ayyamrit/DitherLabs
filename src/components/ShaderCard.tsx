import ShaderCanvas from './ShaderCanvas';
import type { DitherShaderDef } from '@/shaders/ditherShaders';

interface ShaderCardProps {
  shader: DitherShaderDef;
  size?: 'normal' | 'large';
}

const ShaderCard = ({ shader, size = 'normal' }: ShaderCardProps) => {
  return (
    <div className={`shader-card group cursor-pointer ${size === 'large' ? 'col-span-2 row-span-2' : ''}`}>
      <div className={`relative ${size === 'large' ? 'aspect-square' : 'aspect-square'}`}>
        <ShaderCanvas shader={shader} />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="font-mono text-xs text-muted-foreground leading-relaxed line-clamp-2">
            {shader.description}
          </p>
        </div>
      </div>
      <div className="p-4 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-display font-semibold text-foreground">{shader.name}</h3>
          <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
            #{shader.id}
          </span>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {shader.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ShaderCard;
