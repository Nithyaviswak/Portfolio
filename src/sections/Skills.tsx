import { useEffect, useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { skills, skillCategories } from '../data/projects';

const center = { x: 250, y: 200 };

// Skill Constellation SVG
function SkillConstellation() {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const rotationRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // Position skills in radial layout
  const getNodePositions = useCallback(() => {
    const tier1 = skills.filter((s) => s.tier === 1);
    const tier2 = skills.filter((s) => s.tier === 2);
    const tier3 = skills.filter((s) => s.tier === 3);

    const positions: Record<string, { x: number; y: number; r: number; color: string; tier: number }> = {};

    // Central node
    positions['AI Engineer'] = { x: center.x, y: center.y, r: 12, color: '#007fff', tier: 0 };

    // Tier 1 - inner ring
    tier1.forEach((s, i) => {
      const angle = (i / tier1.length) * Math.PI * 2 - Math.PI / 2;
      positions[s.name] = {
        x: center.x + Math.cos(angle) * 100,
        y: center.y + Math.sin(angle) * 80,
        r: 8,
        color: '#007fff',
        tier: 1,
      };
    });

    // Tier 2 - middle ring
    tier2.forEach((s, i) => {
      const angle = (i / tier2.length) * Math.PI * 2 - Math.PI / 4;
      positions[s.name] = {
        x: center.x + Math.cos(angle) * 160,
        y: center.y + Math.sin(angle) * 130,
        r: 6,
        color: '#9B5CF6',
        tier: 2,
      };
    });

    // Tier 3 - outer ring
    tier3.forEach((s, i) => {
      const angle = (i / tier3.length) * Math.PI * 2 + Math.PI / 6;
      positions[s.name] = {
        x: center.x + Math.cos(angle) * 210,
        y: center.y + Math.sin(angle) * 170,
        r: 4,
        color: '#00ff66',
        tier: 3,
      };
    });

    return positions;
  }, []);

  const positions = getNodePositions();

  // Connections
  const connections: [string, string][] = [];
  skills.forEach((s) => {
    // Connect to center or nearby skills
    if (s.tier === 1) {
      connections.push(['AI Engineer', s.name]);
    }
    // Connect tier 2 to nearest tier 1
    if (s.tier === 2) {
      const t1Skills = skills.filter((sk) => sk.tier === 1);
      const nearest = t1Skills.reduce((closest, sk) => {
        const d1 = Math.hypot(
          (positions[s.name]?.x || 0) - (positions[sk.name]?.x || 0),
          (positions[s.name]?.y || 0) - (positions[sk.name]?.y || 0)
        );
        const d2 = Math.hypot(
          (positions[s.name]?.x || 0) - (positions[closest.name]?.x || 0),
          (positions[s.name]?.y || 0) - (positions[closest.name]?.y || 0)
        );
        return d1 < d2 ? sk : closest;
      });
      connections.push([nearest.name, s.name]);
    }
    // Connect tier 3 to nearest tier 2
    if (s.tier === 3) {
      const t2Skills = skills.filter((sk) => sk.tier === 2);
      if (t2Skills.length > 0) {
        const nearest = t2Skills.reduce((closest, sk) => {
          const d1 = Math.hypot(
            (positions[s.name]?.x || 0) - (positions[sk.name]?.x || 0),
            (positions[s.name]?.y || 0) - (positions[sk.name]?.y || 0)
          );
          const d2 = Math.hypot(
            (positions[s.name]?.x || 0) - (positions[closest.name]?.x || 0),
            (positions[s.name]?.y || 0) - (positions[closest.name]?.y || 0)
          );
          return d1 < d2 ? sk : closest;
        });
        connections.push([nearest.name, s.name]);
      }
    }
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
      mouseRef.current = { x, y };
    };

    const animate = () => {
      rotationRef.current.x += (mouseRef.current.y * 15 - rotationRef.current.x) * 0.08;
      rotationRef.current.y += (mouseRef.current.x * -15 - rotationRef.current.y) * 0.08;
      if (svgRef.current) {
        svgRef.current.style.transform = `perspective(800px) rotateX(${rotationRef.current.x}deg) rotateY(${rotationRef.current.y}deg)`;
      }
      rafRef.current = requestAnimationFrame(animate);
    };

    container.addEventListener('mousemove', onMouseMove);
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  const handleNodeHover = (name: string, e: React.MouseEvent) => {
    setHoveredSkill(name);
    const rect = (e.currentTarget as SVGGElement).getBoundingClientRect();
    setTooltipPos({ x: rect.left + rect.width / 2, y: rect.top - 40 });
  };

  // Get connected skills for highlight
  const getConnectedSkills = (name: string): string[] => {
    const connected: string[] = [];
    connections.forEach(([a, b]) => {
      if (a === name) connected.push(b);
      if (b === name) connected.push(a);
    });
    return connected;
  };

  const hoveredConnected = hoveredSkill ? getConnectedSkills(hoveredSkill) : [];
  const allSkillNames = skills.map((s) => s.name);

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '100%', minHeight: 400 }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 500 400"
        style={{
          width: '100%',
          height: '100%',
          transformStyle: 'preserve-3d',
          transition: 'transform 0.1s ease-out',
        }}
      >
        {/* Connection lines */}
        {connections.map(([a, b], i) => {
          const posA = positions[a];
          const posB = positions[b];
          if (!posA || !posB) return null;
          const isHighlighted = hoveredSkill && (hoveredConnected.includes(a) || hoveredConnected.includes(b) || a === hoveredSkill || b === hoveredSkill);
          const isDimmed = hoveredSkill && !isHighlighted;
          return (
            <line
              key={i}
              x1={posA.x}
              y1={posA.y}
              x2={posB.x}
              y2={posB.y}
              stroke={isHighlighted ? '#007fff' : 'rgba(255,255,255,0.06)'}
              strokeWidth={isHighlighted ? 1.5 : 0.5}
              opacity={isDimmed ? 0.1 : isHighlighted ? 0.8 : 1}
              style={{ transition: 'all 0.2s ease' }}
            />
          );
        })}

        {/* Nodes */}
        {allSkillNames.map((name) => {
          const pos = positions[name];
          if (!pos) return null;
          const isHovered = hoveredSkill === name;
          const isConnected = hoveredConnected.includes(name);
          const isDimmed = hoveredSkill && !isHovered && !isConnected;

          return (
            <g
              key={name}
              onMouseEnter={(e) => handleNodeHover(name, e)}
              onMouseLeave={() => setHoveredSkill(null)}
              style={{ cursor: 'pointer', transition: 'opacity 0.2s ease' }}
              opacity={isDimmed ? 0.15 : 1}
            >
              <circle
                cx={pos.x}
                cy={pos.y}
                r={pos.r * (isHovered ? 1.5 : 1)}
                fill={pos.color}
                opacity={isHovered ? 1 : 0.7}
                style={{ transition: 'all 0.2s ease' }}
              />
              <text
                x={pos.x}
                y={pos.y + pos.r + 14}
                textAnchor="middle"
                fill="rgba(255,255,255,0.5)"
                fontSize={9}
                fontFamily="var(--font-body)"
                opacity={isDimmed ? 0.1 : isHovered ? 1 : 0.7}
                style={{ transition: 'opacity 0.2s ease' }}
              >
                {name}
              </text>
            </g>
          );
        })}

        {/* Center label */}
        <text
          x={center.x}
          y={center.y + 4}
          textAnchor="middle"
          fill="#ffffff"
          fontSize={10}
          fontFamily="var(--font-display)"
          fontWeight={600}
          opacity={0.9}
        >
          AI Engineer
        </text>
      </svg>

      {/* Tooltip */}
      {hoveredSkill && (
        <div
          style={{
            position: 'fixed',
            left: tooltipPos.x,
            top: tooltipPos.y,
            transform: 'translateX(-50%)',
            background: 'rgba(10,10,10,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            padding: '8px 12px',
            pointerEvents: 'none',
            zIndex: 50,
          }}
        >
          <div style={{ fontFamily: 'var(--font-body)', fontWeight: 600, fontSize: 12, color: 'var(--text)' }}>
            {hoveredSkill}
          </div>
          <div style={{ fontFamily: 'var(--font-body)', fontSize: 11, color: 'var(--text-tertiary)' }}>
            {skills.find((s) => s.name === hoveredSkill)?.description}
          </div>
        </div>
      )}
    </div>
  );
}

// Skill List Cell
function SkillCell({ title, skills: skillsStr, delay }: { title: string; skills: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{
        y: -2,
        borderColor: 'rgba(0,127,255,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 24,
        transition: 'all 0.3s ease',
      }}
    >
      <h4
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 600,
          fontSize: 13,
          color: 'var(--text)',
          marginBottom: 12,
        }}
      >
        {title}
      </h4>
      <p
        style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 300,
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
        }}
      >
        {skillsStr}
      </p>
    </motion.div>
  );
}

// Metric Cell
function MetricCell({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{
        y: -2,
        borderColor: 'rgba(0,127,255,0.15)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      }}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 24,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 48,
          color: 'var(--accent-blue)',
          marginBottom: 8,
        }}
      >
        {value}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)' }}>
        {label}
      </div>
    </motion.div>
  );
}

export default function Skills() {
  return (
    <section
      id="skills"
      style={{
        maxWidth: 'var(--max-content)',
        margin: '0 auto',
        padding: 'var(--space-2xl) var(--page-padding)',
        position: 'relative',
        zIndex: 2,
      }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 500,
          fontSize: 'var(--t-h2)',
          color: 'var(--text)',
          marginBottom: 'var(--space-xl)',
        }}
      >
        Technical Depth
      </motion.h2>

      {/* Bento Grid */}
      <div className="skills-bento-grid">
        {/* Featured: Skill Constellation - spans 2 cols, 2 rows */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="skills-featured"
          style={{
            background: 'rgba(255,255,255,0.02)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            padding: 16,
            gridColumn: 'span 2',
            gridRow: 'span 2',
          }}
        >
          <SkillConstellation />
        </motion.div>

        {/* Skill categories */}
        {skillCategories.map((cat, i) => (
          <SkillCell key={cat.title} title={cat.title} skills={cat.skills} delay={0.08 * (i + 1)} />
        ))}

        {/* Metric cells */}
        <MetricCell value="85%" label="Avg Hallucination Reduction" delay={0.08 * (skillCategories.length + 1)} />
        <MetricCell value="99.2%" label="Uptime Under Load" delay={0.08 * (skillCategories.length + 2)} />
      </div>

      <style>{`
        .skills-bento-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) {
          .skills-bento-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .skills-featured {
            grid-column: span 2 !important;
            grid-row: span 1 !important;
          }
        }
        @media (max-width: 768px) {
          .skills-bento-grid {
            grid-template-columns: 1fr;
          }
          .skills-featured {
            grid-column: span 1 !important;
            grid-row: span 1 !important;
          }
        }
      `}</style>
    </section>
  );
}
