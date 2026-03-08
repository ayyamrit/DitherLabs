import { useState, useMemo, useCallback } from 'react';
import ShaderCard from '@/components/ShaderCard';
import ShaderPreviewModal from '@/components/ShaderPreviewModal';
import UsageGuide from '@/components/UsageGuide';
import ShaderCanvas from '@/components/ShaderCanvas';
import { ALL_SHADERS, FEATURED_SHADERS, type DitherShaderDef } from '@/shaders/ditherShaders';
import { ChevronLeft, ChevronRight, Shuffle, Maximize2 } from 'lucide-react';

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
  { id: 'lowpoly', label: 'Low Poly' },
];

const ITEMS_PER_PAGE = 24;

const FEATURED_BG_IDS = [
  '3d-rotating-cube', '3d-metaballs', '3d-terrain', '3d-torus-knot',
  'spinning-gears', 'fireworks-2d', 'crazy-kaleidoscope', 'bayer-8x8',
  'cellular', 'neon-grid', 'worm-tunnel', 'metaball-lava',
];

const Index = () => {
  const [activeCategory, setActiveCategory] = useState('all');
  const [previewShader, setPreviewShader] = useState<DitherShaderDef | null>(null);
  const [showGuide, setShowGuide] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [bgShaderIndex, setBgShaderIndex] = useState(0);

  const bgShaders = useMemo(() =>
    FEATURED_BG_IDS
      .map(id => ALL_SHADERS.find(s => s.id === id))
      .filter((s): s is DitherShaderDef => !!s),
    []
  );

  const bestShaders = useMemo(() => FEATURED_SHADERS.slice(0, 10), []);

  const currentBgShader = useMemo(() => bgShaders[bgShaderIndex] ?? ALL_SHADERS[0], [bgShaders, bgShaderIndex]);

  const filteredShaders = useMemo(() => {
    if (activeCategory === 'all') return ALL_SHADERS;
    return ALL_SHADERS.filter(s =>
      s.tags.some(t => t.toLowerCase().includes(activeCategory))
    );
  }, [activeCategory]);

  const displayedShaders = useMemo(() => filteredShaders.slice(0, visibleCount), [filteredShaders, visibleCount]);
  const hasMore = visibleCount < filteredShaders.length;

  const handleCategoryChange = useCallback((cat: string) => {
    setActiveCategory(cat);
    setVisibleCount(ITEMS_PER_PAGE);
  }, []);

  const handlePreview = useCallback((shader: DitherShaderDef) => {
    setPreviewShader(shader);
  }, []);

  const handleClosePreview = useCallback(() => {
    setPreviewShader(null);
  }, []);

  const handleLoadMore = useCallback(() => {
    setVisibleCount(prev => prev + ITEMS_PER_PAGE);
  }, []);

  const nextBgShader = useCallback(() => {
    if (!bgShaders.length) return;
    setBgShaderIndex(prev => (prev + 1) % bgShaders.length);
  }, [bgShaders.length]);

  const prevBgShader = useCallback(() => {
    if (!bgShaders.length) return;
    setBgShaderIndex(prev => (prev - 1 + bgShaders.length) % bgShaders.length);
  }, [bgShaders.length]);

  const randomBgShader = useCallback(() => {
    if (!bgShaders.length) return;
    setBgShaderIndex(Math.floor(Math.random() * bgShaders.length));
  }, [bgShaders.length]);

  const toggleGuide = useCallback(() => setShowGuide(prev => !prev), []);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/90 backdrop-blur-md">
        <div className="container flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-display font-bold text-foreground tracking-tight">
              dither<span className="text-gradient-primary">lab</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={toggleGuide}
              className="font-mono text-xs px-3 py-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all bg-background/50"
            >
              {showGuide ? 'Hide Guide' : 'Usage Guide'}
            </button>
            <span className="section-label hidden sm:block">
              {ALL_SHADERS.length} shaders
            </span>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] rounded-full bg-accent/5 blur-[100px]" />
        </div>

        <div className="container relative z-10">
          <div className="text-center mb-10">
            <p className="section-label mb-4">WebGL Shader Collection</p>
            <h1 className="font-display font-bold text-5xl sm:text-7xl md:text-8xl tracking-tight mb-6 leading-[0.9]">
              <span className="liquid-glass-text">dither</span>
              <br />
              <span className="liquid-metal-text">laboratory</span>
            </h1>
            <p className="font-display text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto font-light">
              {ALL_SHADERS.length}+ interactive WebGL shaders. Preview how they look on your website.
            </p>
          </div>

          {/* Centered Shader Preview Window */}
          <div className="max-w-3xl mx-auto">
            <div className="relative rounded-2xl border border-border overflow-hidden shadow-2xl bg-card hero-shader-window">
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-border bg-card/90 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-destructive/60" />
                    <div className="w-3 h-3 rounded-full bg-accent/40" />
                    <div className="w-3 h-3 rounded-full bg-primary/50" />
                  </div>
                  <span className="font-mono text-[11px] text-muted-foreground ml-3">
                    {currentBgShader.name}
                  </span>
                </div>
                <button
                  onClick={() => handlePreview(currentBgShader)}
                  className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                  title="Fullscreen preview"
                >
                  <Maximize2 size={14} />
                </button>
              </div>

              <div className="aspect-video w-full relative bg-background">
                <ShaderCanvas
                  key={currentBgShader.id}
                  shader={currentBgShader}
                  active={true}
                  alwaysRender={true}
                  resolution={800}
                  mouseEnabled={true}
                  className="w-full h-full"
                />
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 border-t border-border bg-card/90 backdrop-blur-sm">
                <div className="flex items-center gap-1">
                  <button onClick={prevBgShader} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Previous">
                    <ChevronLeft size={18} />
                  </button>
                  <button onClick={randomBgShader} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Random">
                    <Shuffle size={14} />
                  </button>
                  <button onClick={nextBgShader} className="p-1.5 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Next">
                    <ChevronRight size={18} />
                  </button>
                </div>
                <span className="font-mono text-[11px] text-muted-foreground">
                  {bgShaderIndex + 1} / {bgShaders.length}
                </span>
                <div className="flex gap-1.5 overflow-hidden max-w-[200px]">
                  {currentBgShader.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="tag text-[10px]">{tag}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-10">
            <button
              onClick={() => document.getElementById('best')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Browse Collection
              <span className="text-lg">↓</span>
            </button>
          </div>
        </div>
      </section>

      {/* ✨ Preview Best Shaders Section */}
      <section id="best" className="border-t border-border">
        <div className="container py-20">
          <div className="mb-8">
            <p className="section-label mb-2">Handpicked</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-3">
              Best Shaders
              <span className="text-muted-foreground font-normal text-lg ml-3">({bestShaders.length})</span>
            </h2>
            <p className="font-display text-sm text-muted-foreground max-w-lg">
              Our top picks — the most visually striking and technically impressive shaders in the collection.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {bestShaders.map((shader) => (
              <ShaderCard key={shader.id} shader={shader} onPreview={handlePreview} />
            ))}
          </div>
        </div>
      </section>

      {/* Usage Guide */}
      {showGuide && <UsageGuide />}

      {/* Full Gallery */}
      <section id="gallery" className="border-t border-border">
        <div className="container py-20">
          <div className="mb-8">
            <p className="section-label mb-2">Full Collection</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground mb-6">
              {activeCategory === 'all' ? 'All Shaders' : CATEGORIES.find(c => c.id === activeCategory)?.label}
              <span className="text-muted-foreground font-normal text-lg ml-3">({filteredShaders.length})</span>
            </h2>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryChange(cat.id)}
                  className={`font-mono text-xs px-3 py-1.5 rounded-full border transition-all ${
                    activeCategory === cat.id
                      ? 'border-primary bg-primary/15 text-primary'
                      : 'border-border text-muted-foreground hover:text-foreground hover:border-primary/30 bg-background/50'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedShaders.map((shader) => (
              <ShaderCard key={shader.id} shader={shader} onPreview={handlePreview} />
            ))}
          </div>

          {hasMore && (
            <div className="flex justify-center mt-10">
              <button
                onClick={handleLoadMore}
                className="font-mono text-sm px-8 py-3 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all bg-background/50"
              >
                Load More ({filteredShaders.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Info */}
      <section className="border-t border-border">
        <div className="container py-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div>
              <h3 className="font-display font-semibold text-foreground mb-3">Mouse Interactive</h3>
              <p className="font-display text-sm text-muted-foreground leading-relaxed">Every shader responds to your cursor position in real-time.</p>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-3">Pure WebGL</h3>
              <p className="font-display text-sm text-muted-foreground leading-relaxed">Raw GLSL fragment shaders running at native GPU speed.</p>
            </div>
            <div>
              <h3 className="font-display font-semibold text-foreground mb-3">Copy & Use</h3>
              <p className="font-display text-sm text-muted-foreground leading-relaxed">Preview fullscreen and copy GLSL code for your own projects.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border">
        <div className="container py-8 flex items-center justify-between">
          <span className="font-mono text-xs text-muted-foreground">dither.lab © {new Date().getFullYear()}</span>
          <span className="font-mono text-xs text-muted-foreground">built with webgl + react</span>
        </div>
      </footer>

      {previewShader && (
        <ShaderPreviewModal shader={previewShader} onClose={handleClosePreview} />
      )}
    </div>
  );
};

export default Index;
