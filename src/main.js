import { SceneManager } from './scene.js';
import { SeaTurtle } from './seaTurtle.js';
import { Particles } from './particles.js';
import { initScrollAnimations } from './scrollAnimations.js';

let sceneManager;
let seaTurtle;
let particles;

// Wait for DOM
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initNavScrollSpy();
  init();
});

function initTheme() {
  const checkbox = document.getElementById('theme-checkbox');
  
  // Check local storage or system preference
  const isDark = localStorage.getItem('theme') === 'dark' || 
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  if (isDark) {
    document.body.classList.replace('light-mode', 'dark-mode');
    checkbox.checked = true;
  } else {
    // Defaults to light-mode via HTML class
    checkbox.checked = false;
  }

  checkbox.addEventListener('change', (e) => {
    if (e.target.checked) {
      document.body.classList.replace('light-mode', 'dark-mode');
      localStorage.setItem('theme', 'dark');
    } else {
      document.body.classList.replace('dark-mode', 'light-mode');
      localStorage.setItem('theme', 'light');
    }
  });
}

function initNavScrollSpy() {
  const sections = document.querySelectorAll('.section');
  const navItems = document.querySelectorAll('.nav-item');

  const observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px', // Trigger when section is in the middle of viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Remove active class from all
        navItems.forEach(item => item.classList.remove('active'));
        // Add active class to corresponding nav item
        const id = entry.target.getAttribute('id');
        const activeItem = document.querySelector(`.nav-item[data-target="${id}"]`);
        if (activeItem) {
          activeItem.classList.add('active');
        }
      }
    });
  }, observerOptions);

  sections.forEach(section => {
    observer.observe(section);
  });

  // Smooth scroll click handler
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId = item.getAttribute('data-target');
      const targetSection = document.getElementById(targetId);
      if (targetSection) {
        targetSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

function init() {
  // 1. Setup Three.js Scene
  sceneManager = new SceneManager('three-canvas');
  
  // 2. Add 3D Objects
  seaTurtle = new SeaTurtle(sceneManager.scene, sceneManager.coreLight);
  particles = new Particles(sceneManager.scene, 300); // Reduced for cleaner look
  
  // 3. Setup Scroll Animations (GSAP)
  initScrollAnimations(seaTurtle);
  
  // 4. Start Animation Loop
  animate();
}

function animate() {
  requestAnimationFrame(animate);
  
  const time = performance.now() * 0.001; // Current time in seconds
  const deltaTime = 0.016;
  
  // Update components
  if (seaTurtle) seaTurtle.update(time, deltaTime);
  if (particles) particles.update(time);
  if (sceneManager) sceneManager.update(time);
}
