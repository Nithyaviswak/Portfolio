import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class SeaTurtle {
  constructor(scene, coreLight) {
    this.group = new THREE.Group();
    scene.add(this.group);
    
    this.coreLight = coreLight;
    this.mixer = null;
    this.isLoaded = false;
    
    // Initial glowing ambient state - reduced for minimalism
    this.coreLight.position.set(0, 0, 0);
    this.coreLight.intensity = 1.5;

    // We keep track of the scroll animation targets
    this.targetPosition = new THREE.Vector3(0, 0, 0);
    this.targetRotation = new THREE.Euler(0, 0, 0);
    this.targetScale = new THREE.Vector3(1, 1, 1);
    
    this.loadModel();
  }
  
  loadModel() {
    const loader = new GLTFLoader();
    
    loader.load('/turtle.glb', (gltf) => {
      this.model = gltf.scene;
      
      // Auto-center and normalize scale
      const box = new THREE.Box3().setFromObject(this.model);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
      

      const targetSize = 4.8;
      const scaleToFit = targetSize / size;
      
      this.model.scale.set(scaleToFit, scaleToFit, scaleToFit);
      this.model.position.x += (this.model.position.x - center.x) * scaleToFit;
      this.model.position.y += (this.model.position.y - center.y) * scaleToFit;
      this.model.position.z += (this.model.position.z - center.z) * scaleToFit;
      
      this.model.traverse((child) => {
        if (child.isMesh) {
          // Keep original material but add minimal emissive properties
          if (!child.material) return;
          child.material.emissive = new THREE.Color(0x007AFF); // Apple Blue
          child.material.emissiveIntensity = 0.05; // Very subtle
        }
      });
      
      this.group.add(this.model);
      
      // Set up Animation Mixer if the GLTF has embedded animations
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.model);
        const action = this.mixer.clipAction(gltf.animations[0]);
        action.play();
      }
      
      this.isLoaded = true;
    }, undefined, (error) => {
      console.error('Error loading the sea turtle model:', error);
    });
  }
  
  update(time, deltaTime = 0.016) {
    // Sync light position to turtle position
    this.coreLight.position.copy(this.group.position);
    this.coreLight.intensity = 1.0 + Math.sin(time * 1.5) * 0.5; // Gentle pulse
    
    if (this.isLoaded) {
      // Play built-in animations if we have them
      if (this.mixer) {
        this.mixer.update(deltaTime);
      } else {
        // Fallback procedural swimming animation
        this.model.rotation.z = Math.sin(time * 1.5) * 0.1; // gentle body roll
        this.model.position.y = Math.sin(time * 2) * 0.2;   // bobbing up and down
      }
      
      // Additional idle floating for the whole group
      this.group.rotation.y += Math.sin(time * 0.5) * 0.001;
    }
  }
}
