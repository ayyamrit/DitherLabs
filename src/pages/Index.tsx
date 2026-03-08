import { useState, useMemo } from 'react';
import ShaderCard from '@/components/ShaderCard';
import ShaderPreviewModal from '@/components/ShaderPreviewModal';
import UsageGuide from '@/components/UsageGuide';
import HeroShaderShowcase from '@/components/HeroShaderShowcase';
import { ALL_SHADERS, type DitherShaderDef } from '@/shaders/ditherShaders';

// Derive categories from tags
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: '3d', label: '3D' },
  { id: '2d', label: '2D Animated' },
  { id: 'dither', label: 'Dither' },
  { id: 'geometric', label: 'Geometric' },
  { id: 'organic', label: 'Organic' },
  { id: 'glitch', label: 'Glitch' },
  { id: 'nature', label: 'Nature' },
  { id: 'retro', label: 'Retro' },
  { id: 'physics', label: 'Physics' },
  { id: 'space', label: 'Space' },
  { id: 'artistic', label: 'Artistic' },
  { id: 'character', label: 'Characters' },
  { id: 'mechanical', label: 'Mechanical' },
  { id: 'landscape', label: 'Landscape' },
  { id: 'psychedelic', label: 'Psychedelic' },
];

const ITEMS_PER_PAGE = 24;

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewShader, setPreviewShader] = useState<DitherShaderDef | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

  const filteredShaders = useMemo(() => {
    if (activeCategory === 'all') return ALL_SHADERS;
    return ALL_SHADERS.filter(s =>
      s.tags.some(t => t.toLowerCase().includes(activeCategory))
    );
  }, [activeCategory]);

  const displayedShaders = filteredShaders.slice(0, visibleCount);
  const hasMore = visibleCount < filteredShaders.length;

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(ITEMS_PER_PAGE);
  };

  return (
    <div className="min-h-screen bg-background noise-bg">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-display font-bold text-foreground tracking-tight">
              dither<span className="text-gradient-primary">lab</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowGuide(!showGuide)}
              className="font-mono text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              {showGuide ? 'Hide Guide' : 'Usage Guide'}
            </button>
            <span className="section-label hidden sm:block">
              {ALL_SHADERS.length} shaders
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-14">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-accent/5 to-background" />
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 30% 20%, hsl(var(--primary) / 0.08) 0%, transparent 40%), radial-gradient(circle at 70% 80%, hsl(var(--accent) / 0.06) 0%, transparent 40%)`
          }} />
        </div>
        
        <div className="relative z-10 container py-12 sm:py-16">
          {/* Header */}
          <div className="text-center mb-10">
            <p className="section-label mb-3">WebGL Shader Collection</p>
            <h1 className="font-display font-bold text-4xl sm:text-6xl md:text-7xl tracking-tight text-foreground mb-4 leading-[0.95]">
              dither<span className="text-gradient-primary">lab</span>
            </h1>
            <p className="font-display text-base sm:text-lg text-muted-foreground max-w-lg mx-auto font-light">
              {ALL_SHADERS.length}+ interactive WebGL shaders — hover to interact, click for fullscreen
            </p>
          </div>

          {/* Live Shader Showcase */}
          <HeroShaderShowcase onPreview={setPreviewShader} />

          {/* CTA */}
          <div className="text-center mt-10">
            <button
              onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Browse All Shaders
              <span className="text-lg">↓</span>
            </button>
          </div>
        </div>
      </section>

      {/* Usage Guide (collapsible) */}
      {showGuide && <UsageGuide />}

      {/* Gallery */}
      <section id="gallery" className="relative z-10 container py-20">
        <div className="mb-8">
          <p className="section-label mb-2">Collection</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-6">
            {activeCategory === 'all' ? 'All Shaders' : CATEGORIES.find(c => c.id === activeCategory)?.label}
            <span className="text-muted-foreground font-normal text-lg ml-3">
              ({filteredShaders.length})
            </span>
          </h2>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-all ${
                  activeCategory === cat.id
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedShaders.map((shader) => (
            <ShaderCard key={shader.id} shader={shader} onPreview={setPreviewShader} />
          ))}
        </div>

        {hasMore && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)}
              className="font-mono text-sm px-8 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              Load More ({filteredShaders.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </section>

      {/* Info Section */}
      <section className="relative z-10 border-t border-border">
        <div className="container py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-display font-semibold text-foreground mb-3">Mouse Interactive</h3>
              <p className="font-display text-sm text-muted-foreground leading-relaxed">
                Every shader responds to your cursor position in real-time, creating unique visual feedback loops.
              </p>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-3">Pure WebGL</h3>
              <p className="font-display text-sm text-muted-foreground leading-relaxed">
                No frameworks or heavy dependencies. Raw GLSL fragment shaders running at native GPU speed.
              </p>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-3">Copy & Use</h3>
              <p className="font-display text-sm text-muted-foreground leading-relaxed">
                Click preview on any shader to see it fullscreen and copy the GLSL code for your own projects.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border">
        <div className="container py-8 flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">
            dither.lab © {new Date().getFullYear()}
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            built with webgl + react
          </span>
        </div>
      </footer>

      {/* Preview Modal */}
      {previewShader && (
        <ShaderPreviewModal shader={previewShader} onClose={() => setPreviewShader(null)} />
      )}
    </div>
  );
};

export default Index;
