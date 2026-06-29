import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Credentials', href: '#credentials' },
  { label: 'Contact', href: '#contact' },
];

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const sectionIds = ['about', 'projects', 'skills', 'credentials', 'contact'];
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const scrollTo = useCallback((href: string) => {
    const id = href.replace('#', '');
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileOpen(false);
  }, []);

  return (
    <>
      <motion.nav
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 w-full z-50 transition-all duration-400"
        style={{
          background: scrolled ? 'rgba(5,5,5,0.85)' : 'rgba(5,5,5,0.3)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        }}
      >
        <div
          className="flex items-center justify-between h-16"
          style={{ padding: '0 var(--page-padding)', maxWidth: 'var(--max-content)', margin: '0 auto', width: '100%' }}
        >
          {/* Left - Monogram */}
          <span
            className="hidden md:block"
            style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 600,
              fontSize: 14,
              letterSpacing: '0.15em',
              color: 'var(--text)',
              textTransform: 'uppercase',
            }}
          >
            NCR
          </span>

          {/* Center - Links (desktop) */}
          <div className="hidden md:flex items-center" style={{ gap: 32 }}>
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => scrollTo(link.href)}
                className="relative transition-colors duration-300"
                style={{
                  fontFamily: 'var(--font-body)',
                  fontWeight: 500,
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: activeSection === link.href.replace('#', '') ? 'var(--accent-blue)' : 'var(--text-tertiary)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right - CTA (desktop) */}
          <button
            onClick={() => scrollTo('#contact')}
            className="hidden md:block transition-all duration-300"
            style={{
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: 100,
              padding: '8px 20px',
              color: 'var(--text)',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: 13,
              background: 'transparent',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,127,255,0.15)';
              e.currentTarget.style.borderColor = 'rgba(0,127,255,0.5)';
              e.currentTarget.style.color = '#007fff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
              e.currentTarget.style.color = 'var(--text)';
            }}
          >
            Hire Me
          </button>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col justify-center"
            style={{ width: 28, height: 28, gap: 5, background: 'none', border: 'none', cursor: 'pointer' }}
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            <span style={{ width: 20, height: 2, background: 'var(--text)', display: 'block' }} />
            <span style={{ width: 20, height: 2, background: 'var(--text)', display: 'block' }} />
            <span style={{ width: 20, height: 2, background: 'var(--text)', display: 'block' }} />
          </button>
        </div>
      </motion.nav>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
            style={{ background: 'var(--bg)' }}
          >
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute top-5 right-6"
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: 28 }}
              aria-label="Close menu"
            >
              &times;
            </button>
            {navLinks.map((link, i) => (
              <motion.button
                key={link.label}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 30 }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                onClick={() => scrollTo(link.href)}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontWeight: 500,
                  fontSize: 24,
                  color: 'var(--text)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  margin: '12px 0',
                }}
              >
                {link.label}
              </motion.button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
