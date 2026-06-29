import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  value: string;
  label: string;
  delay: number;
}

function StatCard({ value, label, delay }: StatCardProps) {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const numericValue = parseFloat(value.replace(/[^0-9.]/g, ''));
  const isPercentage = value.includes('%');

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const duration = 1500;
    const startTime = performance.now();
    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(eased * numericValue);
      if (progress < 1) requestAnimationFrame(animate);
    };
    const timer = setTimeout(() => requestAnimationFrame(animate), delay * 1000);
    return () => clearTimeout(timer);
  }, [isVisible, numericValue, delay]);

  const displayValue = isPercentage
    ? `${count.toFixed(1)}%`
    : value.includes('.')
    ? count.toFixed(1)
    : Math.round(count).toString();

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4, boxShadow: '0 0 20px rgba(0,127,255,0.15)' }}
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 12,
        padding: '24px 32px',
        textAlign: 'center',
        transition: 'all 0.3s ease',
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 36,
          color: 'var(--accent-blue)',
          marginBottom: 8,
        }}
      >
        {displayValue}
      </div>
      <div style={{ fontFamily: 'var(--font-body)', fontSize: 12, color: 'var(--text-tertiary)' }}>
        {label}
      </div>
    </motion.div>
  );
}

export default function About() {
  return (
    <section
      id="about"
      style={{
        position: 'relative',
        padding: 'var(--space-2xl) 0',
        overflow: 'hidden',
      }}
    >
      {/* Decorative background text */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontFamily: 'var(--font-display)',
          fontWeight: 600,
          fontSize: 'clamp(120px, 20vw, 280px)',
          color: 'rgba(255,255,255,0.02)',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 0,
        }}
      >
        ABOUT
      </div>

      {/* Divider */}
      <div
        style={{
          width: 120,
          height: 1,
          background: 'linear-gradient(to right, var(--accent-blue), #9B5CF6)',
          margin: '0 auto',
          marginBottom: 'var(--space-lg)',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 720,
          margin: '0 auto',
          padding: '0 var(--page-padding)',
        }}
      >
        {/* Section label */}
        <motion.span
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: 11,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            display: 'block',
            marginBottom: 'var(--space-lg)',
          }}
        >
          ABOUT
        </motion.span>

        {/* Statement */}
        <motion.h2
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 'var(--t-h3)',
            lineHeight: 1.3,
            color: 'var(--text)',
            marginBottom: 'var(--space-md)',
          }}
        >
          I build AI systems that solve real problems — not demos that look impressive in screenshots.
        </motion.h2>

        {/* Bio */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15, duration: 0.7 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: 'var(--t-body-lg)',
            lineHeight: 1.7,
            color: 'var(--text-secondary)',
            marginBottom: 'var(--space-xl)',
          }}
        >
          Final-year B.Tech in AI &amp; Machine Learning at Siddartha Institute of Science &amp; Technology
          (CGPA 8.44 / Top 15%). Shipped seven production-grade AI projects across voice AI, multi-agent
          orchestration, enterprise RAG, ML classification, MLOps, and computer vision — all deployed to
          live cloud infrastructure with measured outcomes.
        </motion.p>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: 16 }}>
          <StatCard value="7" label="Production Projects Shipped" delay={0} />
          <StatCard value="85%" label="Avg Hallucination Reduction" delay={0.12} />
          <StatCard value="99.2%" label="Uptime Under Load" delay={0.24} />
        </div>
      </div>
    </section>
  );
}
