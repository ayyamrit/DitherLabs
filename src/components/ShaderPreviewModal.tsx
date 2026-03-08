import { useState } from 'react';
import ShaderCanvas from './ShaderCanvas';
import type { DitherShaderDef } from '@/shaders/ditherShaders';
import { X, Mouse, MouseOff } from 'lucide-react';

interface ShaderPreviewModalProps {
  shader: DitherShaderDef;
  onClose: () => void;
}

const ShaderPreviewModal = ({ shader, onClose }: ShaderPreviewModalProps) => {
  const [copied, setCopied] = useState(false);
  const [mouseEnabled, setMouseEnabled] = useState(true);

  const copyShader = () => {
    navigator.clipboard.writeText(shader.fragmentShader.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-background/90 backdrop-blur-sm" />
      <div
        className="relative z-10 w-full max-w-4xl mx-4 rounded-xl border border-border bg-card overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="font-display font-bold text-xl text-foreground">{shader.name}</h2>
            <p className="font-mono text-xs text-muted-foreground mt-1">{shader.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMouseEnabled(!mouseEnabled)}
              className={`p-2 rounded-lg border transition-all ${
                mouseEnabled
                  ? 'border-primary/40 text-primary bg-primary/10'
                  : 'border-border text-muted-foreground hover:text-foreground'
              }`}
              title={mouseEnabled ? 'Disable mouse interaction' : 'Enable mouse interaction'}
            >
              {mouseEnabled ? <Mouse size={18} /> : <MouseOff size={18} />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Shader Preview */}
        <div className="aspect-video w-full bg-background relative">
          <ShaderCanvas shader={shader} active={true} resolution={800} mouseEnabled={mouseEnabled} alwaysRender={true} />
          {!mouseEnabled && (
            <div className="absolute top-3 left-3 font-mono text-[10px] px-2 py-1 rounded bg-background/70 backdrop-blur-sm border border-border text-muted-foreground">
              mouse disabled
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="flex gap-1.5">
            {shader.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={copyShader}
              className="font-mono text-xs px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all"
            >
              {copied ? '✓ Copied' : 'Copy GLSL'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShaderPreviewModal;
