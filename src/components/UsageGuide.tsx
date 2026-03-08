const UsageGuide = () => {
  return (
    <section className="relative z-10 border-t border-border">
      <div className="container py-16">
        <p className="section-label mb-2">Developer Guide</p>
        <h2 className="font-display font-bold text-3xl text-foreground mb-8">
          How to Use These Shaders
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Step 1 */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-mono">1</span>
              Copy the GLSL Code
            </h3>
            <p className="font-display text-sm text-muted-foreground mb-4">
              Click "Preview" on any shader card, then hit "Copy GLSL" to grab the fragment shader source code.
            </p>
            <pre className="bg-background rounded-lg p-4 overflow-x-auto text-xs font-mono text-muted-foreground border border-border">
{`// Each shader is a GLSL fragment shader
// using these standard uniforms:
uniform float u_time;       // elapsed seconds
uniform vec2  u_resolution; // canvas size in px
uniform vec2  u_mouse;      // mouse pos (0-1)`}
            </pre>
          </div>

          {/* Step 2 */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-mono">2</span>
              Set Up a WebGL Canvas
            </h3>
            <p className="font-display text-sm text-muted-foreground mb-4">
              Create a canvas, get a WebGL context, compile the vertex + fragment shaders, and link a program.
            </p>
            <pre className="bg-background rounded-lg p-4 overflow-x-auto text-xs font-mono text-muted-foreground border border-border">
{`const canvas = document.querySelector('canvas');
const gl = canvas.getContext('webgl');

// Vertex shader (fullscreen quad)
const vertSrc = \`
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0, 1);
  }
\`;

// Fragment shader = copied GLSL code
const fragSrc = \`...\`;`}
            </pre>
          </div>

          {/* Step 3 */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-mono">3</span>
              Create the Fullscreen Quad
            </h3>
            <p className="font-display text-sm text-muted-foreground mb-4">
              Bind a simple triangle strip covering the viewport. The fragment shader runs per-pixel.
            </p>
            <pre className="bg-background rounded-lg p-4 overflow-x-auto text-xs font-mono text-muted-foreground border border-border">
{`// Fullscreen quad vertices
const verts = new Float32Array([
  -1, -1,  1, -1,  -1, 1,  1, 1
]);
const buf = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buf);
gl.bufferData(gl.ARRAY_BUFFER, verts,
  gl.STATIC_DRAW);

const pos = gl.getAttribLocation(prog,
  'a_position');
gl.enableVertexAttribArray(pos);
gl.vertexAttribPointer(pos, 2, gl.FLOAT,
  false, 0, 0);`}
            </pre>
          </div>

          {/* Step 4 */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-primary/20 text-primary text-xs flex items-center justify-center font-mono">4</span>
              Render Loop with Uniforms
            </h3>
            <p className="font-display text-sm text-muted-foreground mb-4">
              Update <code className="text-primary">u_time</code>, <code className="text-primary">u_resolution</code>, and <code className="text-primary">u_mouse</code> each frame.
            </p>
            <pre className="bg-background rounded-lg p-4 overflow-x-auto text-xs font-mono text-muted-foreground border border-border">
{`function render() {
  gl.uniform1f(timeLoc,
    performance.now() / 1000);
  gl.uniform2f(resLoc,
    canvas.width, canvas.height);
  gl.uniform2f(mouseLoc, mx, my);
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  requestAnimationFrame(render);
}

canvas.addEventListener('mousemove', e => {
  const r = canvas.getBoundingClientRect();
  mx = (e.clientX - r.left) / r.width;
  my = 1 - (e.clientY - r.top) / r.height;
});

render();`}
            </pre>
          </div>

          {/* React Hook */}
          <div className="rounded-lg border border-border bg-card p-6 lg:col-span-2">
            <h3 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-accent/20 text-accent text-xs flex items-center justify-center font-mono">⚛</span>
              React Usage (Custom Hook)
            </h3>
            <p className="font-display text-sm text-muted-foreground mb-4">
              This site uses a custom <code className="text-primary">useWebGLShader</code> hook. Here's the simplified pattern:
            </p>
            <pre className="bg-background rounded-lg p-4 overflow-x-auto text-xs font-mono text-muted-foreground border border-border">
{`import { useRef, useEffect } from 'react';

function ShaderComponent({ fragmentShader }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas.getContext('webgl');
    // ... compile shaders, create program,
    //     set up quad, start render loop
    // Pass u_time, u_resolution, u_mouse
    // as uniforms each frame
  }, [fragmentShader]);

  return (
    <canvas
      ref={canvasRef}
      width={400} height={400}
      onMouseMove={handleMouseMove}
    />
  );
}`}
            </pre>
          </div>
        </div>

        {/* Uniform Reference */}
        <div className="mt-8 rounded-lg border border-border bg-card p-6">
          <h3 className="font-display font-semibold text-foreground mb-4">Uniform Reference</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-background border border-border">
              <code className="font-mono text-sm text-primary">u_time</code>
              <p className="font-display text-xs text-muted-foreground mt-1">
                Elapsed time in seconds since the shader started. Drives all animations.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background border border-border">
              <code className="font-mono text-sm text-primary">u_resolution</code>
              <p className="font-display text-xs text-muted-foreground mt-1">
                Canvas dimensions in pixels (vec2). Used to normalize coordinates.
              </p>
            </div>
            <div className="p-4 rounded-lg bg-background border border-border">
              <code className="font-mono text-sm text-primary">u_mouse</code>
              <p className="font-display text-xs text-muted-foreground mt-1">
                Normalized mouse position (0.0–1.0). Origin bottom-left for WebGL.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UsageGuide;
