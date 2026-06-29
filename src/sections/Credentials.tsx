import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { certificates } from '../data/projects';

// Generate random rotation once per card
const cardRotations = certificates.map(() => (Math.random() - 0.5) * 6); // ±3 degrees

export default function Credentials() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const flashlightRef = useRef<HTMLDivElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const currentPos = useRef({ x: 0, y: 0 });
  const rafRef = useRef<number>(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  // Flashlight cursor effect
  useEffect(() => {
    const section = sectionRef.current;
    const flashlight = flashlightRef.current;
    if (!section || !flashlight) return;

    const onMouseMove = (e: MouseEvent) => {
      const rect = section.getBoundingClientRect();
      mousePos.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const animate = () => {
      currentPos.current.x += (mousePos.current.x - currentPos.current.x) * 0.08;
      currentPos.current.y += (mousePos.current.y - currentPos.current.y) * 0.08;
      flashlight.style.background = `radial-gradient(200px at ${currentPos.current.x}px ${currentPos.current.y}px, rgba(0,127,255,0.12), transparent 70%)`;
      rafRef.current = requestAnimationFrame(animate);
    };

    section.addEventListener('mousemove', onMouseMove);
    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      section.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="credentials"
      style={{
        background: 'var(--bg-elevated)',
        padding: 'var(--space-2xl) 0',
        position: 'relative',
        zIndex: 2,
        overflow: 'hidden',
      }}
    >
      {/* Flashlight overlay */}
      <div
        ref={flashlightRef}
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: '0 var(--page-padding)',
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
            textAlign: 'center',
            marginBottom: 8,
          }}
        >
          Credentials
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: 16,
            color: 'var(--text-tertiary)',
            textAlign: 'center',
            marginBottom: 'var(--space-xl)',
          }}
        >
          Issued 2025
        </motion.p>

        {/* Certificate rows */}
        <div style={{ position: 'relative' }}>
          {/* Cable SVG */}
          <svg
            style={{
              position: 'absolute',
              top: '50%',
              left: '10%',
              width: '80%',
              height: 4,
              zIndex: 0,
              overflow: 'visible',
            }}
          >
            <motion.line
              x1="0"
              y1="2"
              x2="100%"
              y2="2"
              stroke="rgba(0,127,255,0.2)"
              strokeWidth={1.5}
              filter="blur(1px)"
              initial={{ pathLength: 0 }}
              animate={isVisible ? { pathLength: 1 } : {}}
              transition={{ duration: 0.6, ease: 'easeIn' }}
            />
            {/* Attachment nodes */}
            {[0, 33, 66, 100].map((x, i) => (
              <motion.circle
                key={i}
                cx={`${x}%`}
                cy={2}
                r={3}
                fill="rgba(255,255,255,0.5)"
                initial={{ opacity: 0, scale: 0 }}
                animate={isVisible ? { opacity: 1, scale: 1 } : {}}
                transition={{ delay: 0.4 + i * 0.1, duration: 0.3 }}
              />
            ))}
          </svg>

          {/* Row 1 */}
          <div
            className="flex flex-wrap justify-center"
            style={{ gap: 20, marginBottom: 20, position: 'relative', zIndex: 1 }}
          >
            {certificates.map((cert, i) => (
              <motion.div
                key={cert.id}
                initial={{ opacity: 0, y: -60, rotate: cardRotations[i] * 2 }}
                animate={
                  isVisible
                    ? {
                        opacity: 1,
                        y: 0,
                        rotate: cardRotations[i],
                      }
                    : {}
                }
                transition={{
                  delay: 0.4 + i * 0.1,
                  type: 'spring',
                  stiffness: 180,
                  damping: 10,
                }}
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 0 24px rgba(0,127,255,0.15)',
                  rotateY: 15,
                }}
                style={{
                  width: 220,
                  minHeight: 150,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12,
                  padding: 20,
                  transform: `rotate(${cardRotations[i]}deg)`,
                  transformStyle: 'preserve-3d',
                  transition: 'box-shadow 0.25s ease',
                  cursor: 'pointer',
                }}
              >
                <h4
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    fontSize: 14,
                    color: 'var(--text)',
                    lineHeight: 1.3,
                    marginBottom: 8,
                  }}
                >
                  {cert.title}
                </h4>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    fontSize: 11,
                    color: 'var(--text-tertiary)',
                    marginBottom: 8,
                  }}
                >
                  {cert.issuer}
                </p>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 400,
                    fontSize: 10,
                    color: 'var(--accent-green)',
                  }}
                >
                  {cert.year}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Row 2 - offset and scaled */}
          <div
            className="flex flex-wrap justify-center"
            style={{
              gap: 20,
              transform: 'translateX(40px) scale(0.92)',
              opacity: 0.7,
              position: 'relative',
              zIndex: 0,
            }}
          >
            {certificates.map((cert, i) => (
              <motion.div
                key={`row2-${cert.id}`}
                initial={{ opacity: 0, y: -60, rotate: -cardRotations[i] * 2 }}
                animate={
                  isVisible
                    ? {
                        opacity: 0.7,
                        y: 0,
                        rotate: -cardRotations[i],
                      }
                    : {}
                }
                transition={{
                  delay: 0.6 + i * 0.1,
                  type: 'spring',
                  stiffness: 180,
                  damping: 10,
                }}
                style={{
                  width: 220,
                  minHeight: 150,
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12,
                  padding: 20,
                  transform: `rotate(${-cardRotations[i]}deg)`,
                }}
              >
                <h4
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontWeight: 500,
                    fontSize: 14,
                    color: 'var(--text)',
                    lineHeight: 1.3,
                    marginBottom: 8,
                  }}
                >
                  {cert.title}
                </h4>
                <p
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontWeight: 400,
                    fontSize: 11,
                    color: 'var(--text-tertiary)',
                    marginBottom: 8,
                  }}
                >
                  {cert.issuer}
                </p>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 400,
                    fontSize: 10,
                    color: 'var(--accent-green)',
                  }}
                >
                  {cert.year}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
