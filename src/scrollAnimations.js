import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations(seaTurtle) {
  // Common sophisticated text fade-in animation
  const animateText = (selector) => {
    gsap.fromTo(selector, 
      { opacity: 0, y: 30 },
      {
        scrollTrigger: {
          trigger: selector,
          start: 'top 85%',
          end: 'bottom 15%',
          toggleActions: 'play reverse play reverse'
        },
        opacity: 1,
        y: 0,
        duration: 1.2,
        ease: 'power3.out',
        stagger: 0.1
      }
    );
  };

  // --- HTML Elements Fade In ---
  animateText('.hero-label, .hero-title, .hero-subtitle, .hero-cta');
  animateText('#edu-card');
  animateText('#skills-card');
  animateText('.project-card');
  animateText('.contact-title, .contact-subtitle, .contact-links');

  // --- 3D Sea Turtle Orchestration ---

  const turtleGroup = seaTurtle.group;
  
  // Base master timeline tied to total scroll progress
  const mainTl = gsap.timeline({
    scrollTrigger: {
      trigger: 'body',
      start: 'top top',
      end: 'bottom bottom',
      scrub: 1.2 // Smooth seamless scrubbing
    }
  });

  // Section 1: Hero -> Section 2: Education
  // Education is content-right. Turtle glides left.
  mainTl.to(turtleGroup.position, {
    x: -3.5,
    y: 0,
    z: -1,
    ease: 'sine.inOut'
  }, 0)
  .to(turtleGroup.rotation, {
    y: Math.PI / 5,
    x: 0.1,
    z: Math.PI / 8, // Bank left
    ease: 'sine.inOut'
  }, 0);

  // Section 2: Education -> Section 3: Skills
  // Skills is content-left. Turtle swoops right.
  mainTl.to(turtleGroup.position, {
    x: 3.5,
    y: 0.5,
    z: -0.5, 
    ease: 'power2.inOut'
  }, 0.2)
  .to(turtleGroup.rotation, {
    y: -Math.PI / 6,
    x: 0.2,
    z: -Math.PI / 6, // Bank right
    ease: 'power2.inOut'
  }, 0.2);

  // Section 3: Skills -> Section 4: Projects
  // Projects is content-right. Turtle loops back left.
  mainTl.to(turtleGroup.position, {
    x: -2.0,
    y: -0.5,
    z: 0.5, 
    ease: 'sine.inOut'
  }, 0.5)
  .to(turtleGroup.rotation, {
    y: Math.PI / 4, 
    x: -0.1, 
    z: Math.PI / 10, 
    ease: 'sine.inOut'
  }, 0.5);

  // Section 4: Projects -> Section 5: Contact
  // Turtle returns to center, scales up towards camera gently
  mainTl.to(turtleGroup.position, {
    x: 0,
    y: -0.5,
    z: 2.0, // Closer to camera
    ease: 'power2.inOut'
  }, 0.8)
  .to(turtleGroup.scale, {
    x: 1.1,
    y: 1.1,
    z: 1.1,
    ease: 'power2.inOut'
  }, 0.8)
  .to(turtleGroup.rotation, {
    y: 0,
    x: 0.05,
    z: 0,
    ease: 'power2.inOut'
  }, 0.8);

}
