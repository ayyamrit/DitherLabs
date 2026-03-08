import { useState } from 'react';
import ShaderCard from '@/components/ShaderCard';
import HeroShader from '@/components/HeroShader';
import ShaderPreviewModal from '@/components/ShaderPreviewModal';
import { ALL_SHADERS, FEATURED_SHADERS, type DitherShaderDef } from '@/shaders/ditherShaders';

const Index = () => {
  const [showAll, setShowAll] = useState(false);
  const [previewShader, setPreviewShader] = useState<DitherShaderDef | null>(null);
  const displayedShaders = showAll ? ALL_SHADERS : FEATURED_SHADERS;

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
          <div className="flex items-center gap-6">
            <span className="section-label hidden sm:block">
              {ALL_SHADERS.length} shaders
            </span>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative flex items-center justify-center min-h-[80vh] overflow-hidden pt-14">
        <HeroShader />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p className="section-label mb-4">WebGL Shader Collection</p>
          <h1 className="font-display font-bold text-5xl sm:text-7xl md:text-8xl tracking-tight text-foreground mb-6 leading-[0.9]">
            dither
            <br />
            <span className="text-gradient-primary">laboratory</span>
          </h1>
          <p className="font-display text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto mb-8 font-light">
            A curated collection of interactive WebGL dithering shaders.
            Hover to interact — click to preview fullscreen.
          </p>
          <button
            onClick={() => document.getElementById('gallery')?.scrollIntoView({ behavior: 'smooth' })}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-display font-semibold text-sm hover:opacity-90 transition-opacity"
          >
            Explore Shaders
            <span className="text-lg">↓</span>
          </button>
        </div>
      </section>

      {/* Gallery */}
      <section id="gallery" className="relative z-10 container py-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="section-label mb-2">Collection</p>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-foreground">
              {showAll ? 'All Shaders' : 'Featured'}
            </h2>
          </div>
          <button
            onClick={() => setShowAll(!showAll)}
            className="font-mono text-xs px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
          >
            {showAll ? 'Show Featured' : `View All (${ALL_SHADERS.length})`}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayedShaders.map((shader) => (
            <ShaderCard key={shader.id} shader={shader} onPreview={setPreviewShader} />
          ))}
        </div>
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
