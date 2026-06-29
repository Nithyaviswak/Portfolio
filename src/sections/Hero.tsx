import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { FilmPass } from 'three/examples/jsm/postprocessing/FilmPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export default function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const composerRef = useRef<EffectComposer | null>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = canvasContainerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scene setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050505, 0.0025);

    const w = container.offsetWidth || window.innerWidth;
    const h = container.offsetHeight || window.innerHeight;

    const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
    camera.position.set(0, 0, 5);

    const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x050505);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Post-processing
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(w, h),
      0.9, // strength
      0.5, // radius
      0.75 // threshold
    );
    composer.addPass(bloomPass);

    const filmPass = new FilmPass(0.35, false);
    composer.addPass(filmPass);
    composer.addPass(new OutputPass());
    composerRef.current = composer;

    // Ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.05);
    scene.add(ambientLight);

    // Point light (follows camera)
    const pointLight = new THREE.PointLight(0xffffff, 1, 50);
    pointLight.position.set(0, 0, 3);
    scene.add(pointLight);

    // Materials helper
    const createBox = (
      width: number,
      height: number,
      depth: number,
      x: number,
      y: number,
      z: number,
      emissiveColor?: number,
      opacity?: number
    ) => {
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshPhysicalMaterial({
        color: 0x111111,
        metalness: 0.9,
        roughness: 0.05,
        emissive: new THREE.Color(emissiveColor || 0x000000),
        transparent: true,
        opacity: opacity !== undefined ? opacity : 0.85,
        side: THREE.DoubleSide,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(x, y, z);
      scene.add(mesh);
      return mesh;
    };

    // Build corridor
    const corridorLength = 400;
    const segmentSpacing = 15;
    const meshes: THREE.Mesh[] = [];

    for (let z = 0; z > -corridorLength; z -= segmentSpacing) {
      const segmentIndex = Math.abs(z / segmentSpacing);

      // Left wall panel (blue emissive)
      meshes.push(createBox(1, 12, 1, -6, 0, z, 0x007fff, 0.6));
      // Right wall panel (blue emissive)
      meshes.push(createBox(1, 12, 1, 6, 0, z, 0x007fff, 0.6));
      // Floor panel (green emissive)
      meshes.push(createBox(14, 1, 1, 0, -6.5, z, 0x00ff66, 0.7));
      // Ceiling panel (no emissive)
      meshes.push(createBox(14, 1, 1, 0, 6.5, z, undefined, 0.85));

      // Cross lights every 5th segment
      if (segmentIndex % 5 === 0) {
        const altY = segmentIndex % 10 === 0 ? 2 : -2;
        const altX = segmentIndex % 10 === 0 ? -3 : 3;
        // Horizontal light
        meshes.push(createBox(14, 0.1, 0.1, 0, altY, z, 0xffffff, 1.0));
        // Vertical light
        meshes.push(createBox(0.1, 12, 0.1, altX, 0, z, 0xffffff, 1.0));
      }
    }

    // Light trace line
    const tracePoints = 200;
    const traceGeometry = new THREE.BufferGeometry();
    const tracePositions = new Float32Array(tracePoints * 3);
    for (let i = 0; i < tracePoints; i++) {
      tracePositions[i * 3] = Math.sin(i * 0.05) * 2;
      tracePositions[i * 3 + 1] = 4 + Math.cos(i * 0.03) * 0.5;
      tracePositions[i * 3 + 2] = -i * 0.5;
    }
    traceGeometry.setAttribute('position', new THREE.BufferAttribute(tracePositions, 3));
    const traceMaterial = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.6,
    });
    const traceLine = new THREE.Line(traceGeometry, traceMaterial);
    scene.add(traceLine);

    // Animation state
    let t = 0;
    let camZ = 5;
    const targetRot = { x: 0, y: 0 };

    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMouseMove);

    const onResize = () => {
      const cw = container.offsetWidth || window.innerWidth;
      const ch = container.offsetHeight || window.innerHeight;
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      renderer.setSize(cw, ch);
      composer.setSize(cw, ch);
    };
    window.addEventListener('resize', onResize);

    const animate = () => {
      if (reducedMotion) {
        composer.render();
        return;
      }

      t += 16.6;
      camZ -= 0.08;
      if (camZ < -corridorLength + 20) camZ = 5;

      camera.position.z = camZ;
      camera.position.x = Math.sin(t * 0.0006) * 0.2;

      // Mouse parallax
      targetRot.x = mouseRef.current.y * 0.03;
      targetRot.y = mouseRef.current.x * 0.03;
      camera.rotation.x += (targetRot.x - camera.rotation.x) * 0.04;
      camera.rotation.y += (targetRot.y - camera.rotation.y) * 0.04;

      // Update light
      pointLight.position.set(camera.position.x, camera.position.y, camera.position.z - 2);

      // Update trace line
      const positions = traceLine.geometry.attributes.position.array as Float32Array;
      for (let i = 0; i < tracePoints; i++) {
        positions[i * 3 + 2] = -i * 0.5 + camZ - 5;
        positions[i * 3] = Math.sin((i + t * 0.01) * 0.05) * 2;
      }
      traceLine.geometry.attributes.position.needsUpdate = true;

      composer.render();
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      meshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
    };
  }, []);

  return (
    <section
      ref={containerRef}
      id="hero"
      style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}
    >
      {/* Three.js canvas container */}
      <div
        ref={canvasContainerRef}
        style={{ position: 'absolute', inset: 0, zIndex: 0, opacity: 0.5 }}
      />

      {/* Bottom gradient for text readability */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 1,
          background: 'linear-gradient(to top, rgba(5,5,5,0.6) 0%, rgba(5,5,5,0.2) 40%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />

      {/* Content overlay */}
      <div
        className="flex flex-col items-center justify-center"
        style={{
          position: 'relative',
          zIndex: 2,
          height: '100%',
          padding: '0 var(--page-padding)',
          paddingTop: '80px', // Account for navbar height
        }}
      >
        {/* Eyebrow */}
        <motion.span
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: 'var(--accent-blue)',
            marginBottom: 24,
          }}
        >
          AI &amp; GenAI Engineer
        </motion.span>

        {/* Name */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'var(--t-display)',
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            color: 'var(--text)',
            textAlign: 'center',
            textShadow: '0 2px 30px rgba(0,0,0,0.8)',
          }}
        >
          Nithyananda
        </motion.h1>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'var(--t-display)',
            letterSpacing: '-0.03em',
            lineHeight: 0.95,
            color: 'var(--text)',
            textAlign: 'center',
            textShadow: '0 2px 30px rgba(0,0,0,0.8)',
            marginBottom: 16,
          }}
        >
          Chari R
        </motion.h1>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.6 }}
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: 'var(--t-body-lg)',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            maxWidth: 560,
            lineHeight: 1.6,
            marginBottom: 24,
          }}
        >
          Building production-grade GenAI systems, agentic AI pipelines, and full-stack AI applications that ship.
        </motion.p>

        {/* Status badge */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.4, duration: 0.5 }}
          className="flex items-center"
          style={{ gap: 8, marginBottom: 40 }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: 'var(--accent-green)',
              display: 'inline-block',
              boxShadow: '0 0 8px var(--accent-green)',
            }}
          />
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'var(--accent-green)' }}>
            Available for immediate joining
          </span>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.5, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center"
          style={{ gap: 16 }}
        >
          <a
            href="#projects"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
            }}
            style={{
              background: 'rgba(0,127,255,0.15)',
              border: '1px solid rgba(0,127,255,0.4)',
              color: '#007fff',
              padding: '0 28px',
              borderRadius: 20,
              fontFamily: 'var(--font-body)',
              fontWeight: 500,
              fontSize: 13,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,127,255,0.25)';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,127,255,0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(0,127,255,0.15)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            View Projects &darr;
          </a>
          <a
            href="#"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.15)',
              color: 'var(--text-secondary)',
              padding: '0 28px',
              borderRadius: 20,
              fontFamily: 'var(--font-body)',
              fontWeight: 400,
              fontSize: 13,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 48,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)';
              e.currentTarget.style.color = 'var(--text)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)';
              e.currentTarget.style.color = 'var(--text-secondary)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Download Resume
          </a>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 0.5 }}
        className="hidden md:flex flex-col items-center"
        style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 3 }}
      >
        <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.2)', position: 'relative', overflow: 'hidden' }}>
          <motion.div
            animate={{ y: [0, 36, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--text-tertiary)', marginLeft: -1.5 }}
          />
        </div>
      </motion.div>
    </section>
  );
}
