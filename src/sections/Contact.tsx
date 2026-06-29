import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

export default function Contact() {
  const canvasRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number>(0);
  const [copied, setCopied] = useState(false);

  // Crystal Orb
  useEffect(() => {
    const container = canvasRef.current;
    if (!container) return;

    const w = container.offsetWidth;
    const h = container.offsetHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Crystal orb
    const geometry = new THREE.IcosahedronGeometry(1.8, 4);
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#f5c518'),
      transmission: 0.95,
      roughness: 0.05,
      metalness: 0.1,
      ior: 1.5,
      thickness: 1.2,
      envMapIntensity: 2.0,
      emissive: new THREE.Color('#f5c518'),
      emissiveIntensity: 0.2,
      transparent: true,
    });
    const orb = new THREE.Mesh(geometry, material);
    scene.add(orb);

    // Lights
    const pointLight1 = new THREE.PointLight('#FF6B2B', 2.5, 20);
    pointLight1.position.set(3, 2, 1);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight('#9B5CF6', 1.8, 20);
    pointLight2.position.set(-3, -1, 2);
    scene.add(pointLight2);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    // Orbit particles
    const particleCount = 60;
    const particles: THREE.Mesh[] = [];
    const particleData: { angle: number; speed: number; radius: number; axis: THREE.Vector3 }[] = [];

    for (let i = 0; i < particleCount; i++) {
      const pGeo = new THREE.SphereGeometry(0.02, 8, 8);
      const pMat = new THREE.MeshBasicMaterial({ color: '#FF6B2B' });
      const pMesh = new THREE.Mesh(pGeo, pMat);
      scene.add(pMesh);
      particles.push(pMesh);

      particleData.push({
        angle: Math.random() * Math.PI * 2,
        speed: 0.003 + Math.random() * 0.009,
        radius: 2.2 + Math.random() * 1.5,
        axis: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() - 0.5,
          Math.random() - 0.5
        ).normalize(),
      });
    }

    // Mouse state
    const mouse = { x: -1000, y: -1000 };
    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = e.clientX - rect.left - rect.width / 2;
      mouse.y = e.clientY - rect.top - rect.height / 2;
    };
    container.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      const cw = container.offsetWidth;
      const ch = container.offsetHeight;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
    };
    window.addEventListener('resize', onResize);

    let t = 0;
    const animate = () => {
      t += 0.016;

      // Base rotation
      let speed = 0.004;
      let emissiveTarget = 0.2;

      // Mouse proximity
      const dist = Math.sqrt(mouse.x * mouse.x + mouse.y * mouse.y);
      if (dist < 300) {
        const factor = 1 - dist / 300;
        speed = 0.004 + factor * 0.016;
        emissiveTarget = 0.2 + factor * 0.8;

        // Color shift: gold → orange → violet
        const r = 0.96 + factor * 0.15;
        const g = 0.77 - factor * 0.48;
        const b = 0.09 + factor * 0.86;
        material.emissive.setRGB(r, g, b);
      } else {
        material.emissive.set('#f5c518');
      }

      material.emissiveIntensity += (emissiveTarget - material.emissiveIntensity) * 0.05;
      orb.rotation.y += speed;
      orb.rotation.x = Math.sin(t * 0.3) * 0.1;

      // Mouse parallax
      const targetX = (mouse.x / (container.offsetWidth || 1)) * 0.4;
      const targetY = -(mouse.y / (container.offsetHeight || 1)) * 0.4;
      orb.position.x += (targetX - orb.position.x) * 0.05;
      orb.position.y += (targetY - orb.position.y) * 0.05;

      // Update particles
      particleData.forEach((pd, i) => {
        pd.angle += pd.speed;
        const perp = new THREE.Vector3(0, 1, 0).applyAxisAngle(pd.axis, pd.angle);
        particles[i].position.copy(perp.multiplyScalar(pd.radius));
      });

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      particles.forEach((p) => {
        p.geometry.dispose();
        (p.material as THREE.Material).dispose();
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText('nviswaks@gmail.com').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <section
      id="contact"
      style={{
        minHeight: '100vh',
        position: 'relative',
        zIndex: 2,
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        alignItems: 'center',
      }}
      className="contact-grid"
    >
      {/* Left - Info */}
      <div style={{ padding: 'var(--space-2xl) var(--page-padding)' }}>
        <motion.span
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
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
          CONTACT
        </motion.span>

        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 'var(--t-h2)',
            color: 'var(--text)',
            marginBottom: 'var(--space-sm)',
          }}
        >
          Let's Build Something
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: 'var(--t-body-lg)',
            color: 'var(--text-secondary)',
            maxWidth: 400,
            marginBottom: 'var(--space-xl)',
          }}
        >
          Open to GenAI, Agentic AI, and Full-Stack AI roles. Immediate joining.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="flex flex-col"
          style={{ gap: 16, marginBottom: 'var(--space-xl)' }}
        >
          {/* Email */}
          <button
            onClick={handleCopyEmail}
            style={{
              fontFamily: 'var(--font-body)',
              fontSize: 16,
              color: 'var(--text)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              textAlign: 'left',
              padding: 0,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            nviswaks@gmail.com
          </button>
          {copied && (
            <motion.span
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: 12, color: 'var(--accent-green)', marginTop: -12 }}
            >
              Copied!
            </motion.span>
          )}

          {/* Phone */}
          <div className="flex items-center" style={{ gap: 8, fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            +91-8688767503
          </div>

          {/* Location */}
          <div className="flex items-center" style={{ gap: 8, fontFamily: 'var(--font-body)', fontSize: 16, color: 'var(--text)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-tertiary)" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20" />
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
            </svg>
            Bangalore, India
          </div>

          {/* Links */}
          <div className="flex items-center" style={{ gap: 24 }}>
            <a
              href="https://linkedin.com/in/nithyananda1311"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: 13,
                color: 'var(--accent-blue)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent-blue)'; }}
            >
              LinkedIn &rarr;
            </a>
            <a
              href="https://github.com/Nithyaviswak"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: 13,
                color: 'var(--accent-blue)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--text)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--accent-blue)'; }}
            >
              GitHub &rarr;
            </a>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="flex flex-col sm:flex-row"
          style={{ gap: 16 }}
        >
          <button
            style={{
              background: 'linear-gradient(135deg, #007fff, #0055cc)',
              color: '#050505',
              fontFamily: 'var(--font-body)',
              fontWeight: 600,
              fontSize: 14,
              padding: '14px 32px',
              borderRadius: 4,
              border: 'none',
              cursor: 'pointer',
              transition: 'filter 0.2s',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.filter = 'brightness(1.1)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.filter = 'brightness(1)'; }}
          >
            Download Resume
          </button>
          <a
            href="https://linkedin.com/in/nithyananda1311"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              border: '1px solid rgba(0,127,255,0.3)',
              color: 'var(--accent-blue)',
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: 14,
              padding: '14px 32px',
              borderRadius: 4,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,127,255,0.1)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            View LinkedIn &rarr;
          </a>
        </motion.div>
      </div>

      {/* Right - Crystal Orb */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        ref={canvasRef}
        className="hidden md:block"
        style={{ width: '100%', height: '100%', minHeight: 500 }}
      />

      <style>{`
        @media (max-width: 768px) {
          .contact-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
