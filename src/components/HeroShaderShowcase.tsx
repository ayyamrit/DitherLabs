import { useState, useEffect } from 'react';
import ShaderCanvas from './ShaderCanvas';
import { ALL_SHADERS, type DitherShaderDef } from '@/shaders/ditherShaders';
import { Play, Pause, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';

// Pick diverse featured shaders for hero
const HERO_SHADER_IDS = [
  '3d-rotating-cube',
  '3d-metaballs',
  '3d-terrain',
  'spinning-gears',
  'fireworks-2d',
  'crazy-kaleidoscope',
  'bayer-8x8',
  'cellular',
];

interface HeroShaderShowcaseProps {
  onPreview: (shader: DitherShaderDef) => void;
}

const HeroShaderShowcase = ({ onPreview }: HeroShaderShowcaseProps) => {
  const heroShaders = HERO_SHADER_IDS
    .map(id => ALL_SHADERS.find(s => s.id === id))
    .filter((s): s is DitherShaderDef => !!s);

  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);

  const activeShader = heroShaders[activeIndex];

  // Auto-rotate
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setActiveIndex(prev => (prev + 1) % heroShaders.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPlaying, heroShaders.length]);

  const goNext = () => setActiveIndex(prev => (prev + 1) % heroShaders.length);
  const goPrev = () => setActiveIndex(prev => (prev - 1 + heroShaders.length) % heroShaders.length);

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Main large preview */}
      <div className="relative rounded-xl overflow-hidden border border-border bg-card shadow-2xl">
        <div className="aspect-[16/9] relative">
          <ShaderCanvas
            shader={activeShader}
            active={true}
            resolution={800}
            mouseEnabled={true}
          />
          
          {/* Gradient overlay at bottom */}
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-card to-transparent" />
          
          {/* Shader info */}
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div>
              <h3 className="font-display font-bold text-xl text-foreground mb-1">
                {activeShader.name}
              </h3>
              <p className="font-mono text-xs text-muted-foreground line-clamp-1 max-w-md">
                {activeShader.description}
              </p>
              <div className="flex gap-1.5 mt-2">
                {activeShader.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="tag">{tag}</span>
                ))}
              </div>
            </div>
            <button
              onClick={() => onPreview(activeShader)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-mono text-xs hover:opacity-90 transition-opacity"
            >
              <Maximize2 size={14} />
              Fullscreen
            </button>
          </div>

          {/* Navigation arrows */}
          <button
            onClick={goPrev}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/70 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-background/70 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      {/* Thumbnails + controls */}
      <div className="mt-4 flex items-center gap-4">
        {/* Play/Pause */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="p-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          title={isPlaying ? 'Pause auto-rotate' : 'Resume auto-rotate'}
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>

        {/* Thumbnail strip */}
        <div className="flex-1 overflow-x-auto scrollbar-none">
          <div className="flex gap-2">
            {heroShaders.map((shader, idx) => (
              <button
                key={shader.id}
                onClick={() => {
                  setActiveIndex(idx);
                  setIsPlaying(false);
                }}
                className={`relative flex-shrink-0 w-20 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                  idx === activeIndex
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border hover:border-primary/40'
                }`}
              >
                <ShaderCanvas
                  shader={shader}
                  active={true}
                  resolution={160}
                  mouseEnabled={false}
                />
                {idx === activeIndex && (
                  <div className="absolute inset-0 bg-primary/10" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Indicator dots */}
        <div className="hidden sm:flex items-center gap-1">
          {heroShaders.map((_, idx) => (
            <button
              key={idx}
              onClick={() => {
                setActiveIndex(idx);
                setIsPlaying(false);
              }}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === activeIndex
                  ? 'bg-primary w-4'
                  : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroShaderShowcase;
