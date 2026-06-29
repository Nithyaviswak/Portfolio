import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
}

export default function NeuralCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isMobile = window.innerWidth < 768;
    const nodeCount = isMobile ? 30 : 60;
    const connectionDist = 150;
    const nodeColor = '#007fff';
    const lineColor = '#9B5CF6';
    const baseNodeOpacity = 0.18;
    const baseLineOpacity = 0.10;

    let w = window.innerWidth;
    let h = window.innerHeight;
    let t = 0;

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w;
      canvas.height = h;
    };
    resize();

    const nodes: Node[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        baseX: Math.random() * w,
        baseY: Math.random() * h,
      });
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('resize', resize);

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      t += 16.6;

      const mouse = mouseRef.current;

      // Update node positions
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];

        if (!reducedMotion) {
          // Find distance to mouse
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 200) {
            node.x += dx * 0.02;
            node.y += dy * 0.02;
          } else {
            // Return to base
            node.x += (node.baseX - node.x) * 0.01;
            node.y += (node.baseY - node.y) * 0.01;
          }

          // Apply velocity
          node.x += node.vx;
          node.y += node.vy;

          // Wrap around edges
          if (node.x < -10) node.x = w + 10;
          if (node.x > w + 10) node.x = -10;
          if (node.y < -10) node.y = h + 10;
          if (node.y > h + 10) node.y = -10;
        }

        // Pulse radius
        const r = 1.5 + Math.sin(t * 0.001 + i) * 0.8;

        // Draw node
        ctx.beginPath();
        ctx.arc(node.x, node.y, Math.max(0.5, r), 0, Math.PI * 2);
        ctx.fillStyle = nodeColor;
        ctx.globalAlpha = baseNodeOpacity;
        ctx.fill();
      }

      // Draw connections
      ctx.globalAlpha = baseLineOpacity;
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDist) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.globalAlpha = baseLineOpacity * (1 - dist / connectionDist);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      rafRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
      }}
    />
  );
}
