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
  const [currentPage, setCurrentPage] = useState(0);
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
    <div className="min-h-screen relative">
      {/* Full-page shader background */}
      <div className="fixed inset-0 z-0">
        <ShaderCanvas
          key={currentBgShader.id}
          shader={currentBgShader}
          active={true}
          alwaysRender={true}
          resolution={1024}
          mouseEnabled={true}
          className="w-full h-full"
        />
        <div className="absolute inset-0 bg-background/40 backdrop-blur-[1px]" />
      </div>

      {/* Background shader controls - fixed bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-xl">
        <button onClick={prevBgShader} className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Previous shader">
          <ChevronLeft size={20} />
        </button>
        <div className="flex items-center gap-3 px-3">
          <span className="font-mono text-xs text-muted-foreground">{bgShaderIndex + 1}/{bgShaders.length}</span>
          <span className="font-display text-sm font-medium text-foreground max-w-[150px] truncate">{currentBgShader.name}</span>
        </div>
        <button onClick={randomBgShader} className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Random shader">
          <Shuffle size={16} />
        </button>
        <button onClick={nextBgShader} className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Next shader">
          <ChevronRight size={20} />
        </button>
        <div className="w-px h-6 bg-border mx-1" />
        <button
          onClick={() => handlePreview(currentBgShader)}
          className="font-mono text-xs px-3 py-1.5 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Fullscreen
        </button>
      </div>

      {/* Main content - scrollable over the shader */}
      <div className="relative z-10">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-border bg-background/70 backdrop-blur-md">
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

        {/* Hero Section - transparent so shader shows through */}
        <section className="relative py-20 sm:py-32">
          <div className="container">
            <div className="text-center max-w-3xl mx-auto">
              <p className="section-label mb-4">WebGL Shader Collection</p>
              <h1 className="font-display font-bold text-5xl sm:text-7xl md:text-8xl tracking-tight mb-6 leading-[0.9]">
                <span className="liquid-glass-text">dither</span>
                <br />
                <span className="liquid-metal-text">laboratory</span>
              </h1>
              <p className="font-display text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-8 font-light">
                {ALL_SHADERS.length}+ interactive WebGL shaders. Use the controls below to cycle through backgrounds in real-time.
              </p>
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
        <section id="best" className="border-t border-border bg-background/80 backdrop-blur-sm">
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
        {showGuide && (
          <div className="bg-background/80 backdrop-blur-sm">
            <UsageGuide />
          </div>
        )}

        {/* Full Gallery */}
        <section id="gallery" className="border-t border-border bg-background/80 backdrop-blur-sm">
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
        <section className="border-t border-border bg-background/80 backdrop-blur-sm">
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

        <footer className="border-t border-border bg-background/80 backdrop-blur-sm">
          <div className="container py-8 flex items-center justify-between">
            <span className="font-mono text-xs text-muted-foreground">dither.lab © {new Date().getFullYear()}</span>
            <span className="font-mono text-xs text-muted-foreground">built with webgl + react</span>
          </div>
        </footer>

        {/* Spacer for bottom controls */}
        <div className="h-20" />
      </div>

      {previewShader && (
        <ShaderPreviewModal shader={previewShader} onClose={handleClosePreview} />
      )}
    </div>
  );
};

export default Index;
