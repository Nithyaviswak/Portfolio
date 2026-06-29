import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';
import { projects } from '../data/projects';

// 3D Carousel Component
function ProjectCarousel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const rafRef = useRef<number>(0);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const targetRotation = useRef(0);
  const currentRotation = useRef(0);
  const velocity = useRef(0);
  const lastInteraction = useRef(0);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();
    const w = container.offsetWidth;
    const h = container.offsetHeight;
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Load textures
    const textureLoader = new THREE.TextureLoader();
    const group = new THREE.Group();
    scene.add(group);

    const radius = 6;
    const count = projects.length;
    const planeW = 3;
    const planeH = 2;

    const vertexShader = `
      uniform float uTime;
      uniform float uSpeed;
      uniform float uOffset;
      varying vec2 vUv;
      #define PI 3.141592653589793
      void main() {
        vec3 pos = position;
        float x = pos.x + sin(pos.y * PI) * uOffset;
        pos.x = x;
        vec4 worldPosition = modelMatrix * vec4(pos, 1.0);
        float y = cos(worldPosition.x * 0.1 + uTime) * sin(worldPosition.z * 0.1 + uTime) * 0.2 * uSpeed;
        pos.y += y;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        vUv = uv;
      }
    `;

    const fragmentShader = `
      precision highp float;
      uniform sampler2D uTexture;
      uniform float uTime;
      uniform float uHover;
      uniform vec2 uImageSize;
      varying vec2 vUv;
      #define PI 3.141592653589793
      vec2 coverUV(vec2 uv, vec2 resolution, vec2 imageResolution) {
        vec2 ratio = vec2(
          min((resolution.x / resolution.y) / (imageResolution.x / imageResolution.y), 1.0),
          min((resolution.y / resolution.x) / (imageResolution.y / imageResolution.x), 1.0)
        );
        return vec2(
          uv.x * ratio.x + (1.0 - ratio.x) * 0.5,
          uv.y * ratio.y + (1.0 - ratio.y) * 0.5
        );
      }
      void main() {
        vec2 uv = coverUV(vUv, vec2(1.0), uImageSize);
        float circle = uv.x * uv.x + uv.y * uv.y;
        circle *= circle;
        if (uHover > 0.0 && circle < 0.001) {
          float wave = sin(uv.x * 10.0 + uTime * 2.0) * cos(uv.y * 10.0 + uTime * 2.0) * 0.02 * uHover;
          uv.x += wave;
          uv.y += wave;
          uv.y += 0.02 * uHover;
        }
        vec4 tex = texture2D(uTexture, uv);
        gl_FragColor = tex;
      }
    `;

    const meshes: THREE.Mesh[] = [];
    const uniformsList: Record<string, THREE.IUniform>[] = [];

    projects.forEach((project, i) => {
      const angle = (i / count) * Math.PI * 2;
      const tex = textureLoader.load(project.image);
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;

      const uniforms = {
        uTime: { value: 0 },
        uSpeed: { value: 1 },
        uOffset: { value: 0.15 },
        uTexture: { value: tex },
        uHover: { value: 0 },
        uImageSize: { value: new THREE.Vector2(16, 10) },
      };
      uniformsList.push(uniforms);

      const geometry = new THREE.PlaneGeometry(planeW, planeH, 50, 50);
      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        side: THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = Math.sin(angle) * radius;
      mesh.position.z = Math.cos(angle) * radius;
      mesh.rotation.y = angle + Math.PI;
      group.add(mesh);
      meshes.push(mesh);
    });

    // Raycaster for hover
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-10, -10);
    let hoveredIndex = -1;

    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      if (isDragging.current) {
        const delta = (e.clientX - startX.current) * 0.005;
        targetRotation.current += delta;
        velocity.current = delta;
        startX.current = e.clientX;
        lastInteraction.current = performance.now();
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      isDragging.current = true;
      startX.current = e.clientX;
      lastInteraction.current = performance.now();
    };

    const onPointerUp = () => {
      isDragging.current = false;
    };

    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointerup', onPointerUp);

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

      if (!reducedMotion) {
        // Auto-rotation
        if (performance.now() - lastInteraction.current > 2000) {
          targetRotation.current += 0.001;
        }

        // Momentum
        if (!isDragging.current) {
          targetRotation.current += velocity.current;
          velocity.current *= 0.95;
        }

        // Clamp
        targetRotation.current = Math.max(-Math.PI * 0.3, Math.min(Math.PI * 0.3, targetRotation.current));

        // Smooth rotation
        currentRotation.current += (targetRotation.current - currentRotation.current) * 0.08;
        group.rotation.y = currentRotation.current;

        // Update uniforms
        uniformsList.forEach((u) => {
          u.uTime.value = t;
        });

        // Raycasting for hover
        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(meshes);
        const newHovered = intersects.length > 0 ? meshes.indexOf(intersects[0].object as THREE.Mesh) : -1;

        if (newHovered !== hoveredIndex) {
          if (hoveredIndex >= 0) {
            const prev = uniformsList[hoveredIndex];
            if (prev) {
              // Animate hover out
              const startVal = prev.uHover.value as number;
              const startTime = performance.now();
              const animateOut = () => {
                const elapsed = (performance.now() - startTime) / 600;
                prev.uHover.value = startVal * (1 - Math.min(elapsed, 1));
                if (elapsed < 1) requestAnimationFrame(animateOut);
              };
              animateOut();
            }
          }
          hoveredIndex = newHovered;
          if (hoveredIndex >= 0) {
            const curr = uniformsList[hoveredIndex];
            if (curr) {
              // Animate hover in
              const startTime = performance.now();
              const animateIn = () => {
                const elapsed = (performance.now() - startTime) / 400;
                curr.uHover.value = Math.min(elapsed, 1);
                if (elapsed < 1) requestAnimationFrame(animateIn);
              };
              animateIn();
            }
          }
        }
      }

      renderer.render(scene, camera);
      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(rafRef.current);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      meshes.forEach((m) => {
        m.geometry.dispose();
        (m.material as THREE.ShaderMaterial).dispose();
      });
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '80vh',
        position: 'relative',
        cursor: 'grab',
        touchAction: 'pan-y',
      }}
    />
  );
}

// Project Card Component
function ProjectCard({ project, index }: { project: typeof projects[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{
        background: 'rgba(255,255,255,0.04)',
        borderColor: 'rgba(0,127,255,0.15)',
      }}
      style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 16,
        padding: 32,
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: 32,
        transition: 'all 0.3s ease',
      }}
      className="project-card-grid"
    >
      {/* Image */}
      <div style={{ borderRadius: 12, overflow: 'hidden', aspectRatio: '16/10' }}>
        <motion.img
          src={project.image}
          alt={project.title}
          className="w-full h-full object-cover"
          whileHover={{ scale: 1.03 }}
          transition={{ duration: 0.4 }}
        />
      </div>

      {/* Text */}
      <div className="flex flex-col justify-center">
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'rgba(0,127,255,0.5)',
            marginBottom: 8,
          }}
        >
          {String(project.id).padStart(2, '0')}
        </span>
        <h3
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 500,
            fontSize: 'clamp(20px, 2.5vw, 28px)',
            color: 'var(--text)',
            marginBottom: 8,
            lineHeight: 1.2,
          }}
        >
          {project.title}
        </h3>
        <span
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--accent-green)',
            padding: '4px 10px',
            border: '1px solid rgba(0,255,102,0.2)',
            borderRadius: 100,
            display: 'inline-block',
            width: 'fit-content',
            marginBottom: 12,
          }}
        >
          {project.category}
        </span>
        <p
          style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: 14,
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: 12,
          }}
        >
          {project.description}
        </p>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            color: 'var(--text-tertiary)',
            marginBottom: 12,
          }}
        >
          {project.stack.join(' \u00b7 ')}
        </p>
        <div
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            fontSize: 'clamp(16px, 1.8vw, 22px)',
            color: 'var(--accent-blue)',
            marginBottom: 12,
            lineHeight: 1.3,
          }}
        >
          {project.keyMetric}
        </div>
        <div className="flex gap-4">
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-body)',
                fontWeight: 500,
                fontSize: 12,
                color: 'var(--accent-blue)',
                textDecoration: 'none',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--text)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--accent-blue)';
              }}
            >
              Live Demo &rarr;
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default function Projects() {
  return (
    <section id="projects" style={{ position: 'relative', zIndex: 2 }}>
      {/* Carousel Section */}
      <div style={{ position: 'relative' }}>
        <span
          style={{
            position: 'absolute',
            top: 32,
            left: 'var(--page-padding)',
            fontFamily: 'var(--font-body)',
            fontWeight: 500,
            fontSize: 11,
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            color: 'var(--text-tertiary)',
            zIndex: 2,
          }}
        >
          SELECTED WORK
        </span>
        <ProjectCarousel />
      </div>

      {/* Project List */}
      <div
        style={{
          maxWidth: 'var(--max-content)',
          margin: '0 auto',
          padding: 'var(--space-2xl) var(--page-padding)',
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
            marginBottom: 8,
          }}
        >
          Projects
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
            marginBottom: 'var(--space-xl)',
          }}
        >
          Seven systems. All deployed. All measured.
        </motion.p>

        <div className="flex flex-col" style={{ gap: 'var(--space-md)' }}>
          {projects.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} />
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .project-card-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
