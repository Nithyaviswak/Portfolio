import * as THREE from 'three';

export class SceneManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    
    // Scene
    this.scene = new THREE.Scene();
    // Brighter ocean fog
    this.scene.fog = new THREE.FogExp2(0x091a2f, 0.02);
    
    // Camera
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.camera.position.z = 8;
    
    // Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 2.5); // Much brighter base light
    this.scene.add(ambientLight);
    
    // Top-down bright white/cyan light
    const dirLight = new THREE.DirectionalLight(0xe0ffff, 4);
    dirLight.position.set(0, 10, 5);
    this.scene.add(dirLight);
    
    // Bottom-up bright blue fill light
    const dirLight2 = new THREE.DirectionalLight(0x00bfff, 3);
    dirLight2.position.set(-5, -5, 5);
    this.scene.add(dirLight2);

    // This light will follow the Sea Turtle
    this.coreLight = new THREE.PointLight(0x00ffd5, 8, 30);
    this.scene.add(this.coreLight);
    
    // Mouse tracking for parallax
    this.mouse = new THREE.Vector2(0, 0);
    this.targetMouse = new THREE.Vector2(0, 0);
    
    this.addEventListeners();
  }
  
  addEventListeners() {
    window.addEventListener('resize', this.onWindowResize.bind(this));
    window.addEventListener('mousemove', this.onMouseMove.bind(this));
  }
  
  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
  
  onMouseMove(event) {
    // Normalize mouse coordinates (-1 to +1)
    this.targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    this.targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }
  
  update(time) {
    // Smooth mouse interpolation
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;
    
    // Subtle camera parallax based on mouse
    this.camera.position.x = this.mouse.x * 0.5;
    this.camera.position.y = this.mouse.y * 0.5;
    this.camera.lookAt(this.scene.position);
    
    this.renderer.render(this.scene, this.camera);
  }
}
