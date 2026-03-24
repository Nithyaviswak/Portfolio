import * as THREE from 'three';

export class Particles {
  constructor(scene, count = 1000) {
    this.geometry = new THREE.BufferGeometry();
    this.count = count;
    
    // Arrays for position and color
    const positions = new Float32Array(this.count * 3);
    const colors = new Float32Array(this.count * 3);
    this.speeds = new Float32Array(this.count); // Custom speed for each particle
    
    // Base colors matches the theme
    const colorTheme1 = new THREE.Color(0x00e5ff); // Cyan
    const colorTheme2 = new THREE.Color(0x9945ff); // Violet
    const tempColor = new THREE.Color();
    
    for (let i = 0; i < this.count; i++) {
      // Spread particles in a wide area around the scene
      positions[i * 3] = (Math.random() - 0.5) * 40;     // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40; // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 20; // z (depth)
      
      // Mix between cyan and violet
      tempColor.lerpColors(colorTheme1, colorTheme2, Math.random());
      
      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
      
      // Assign random slow float speed
      this.speeds[i] = Math.random() * 0.02 + 0.005;
    }
    
    this.geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    this.material = new THREE.PointsMaterial({
      size: 0.05,
      vertexColors: true,
      transparent: true,
      opacity: 0.6,
      blending: THREE.AdditiveBlending,
      depthWrite: false, // Prevents particles from occluding each other weirdly
    });
    
    this.mesh = new THREE.Points(this.geometry, this.material);
    scene.add(this.mesh);
  }
  
  update(time) {
    const positions = this.geometry.attributes.position.array;
    
    for (let i = 0; i < this.count; i++) {
      const i3 = i * 3;
      
      // Gentle drift upward and slight wave motion
      positions[i3 + 1] += this.speeds[i]; 
      positions[i3] += Math.sin(time + positions[i3 + 1]) * 0.005;
      
      // Wrap around bounds
      if (positions[i3 + 1] > 20) {
        positions[i3 + 1] = -20;
      }
    }
    
    this.geometry.attributes.position.needsUpdate = true;
    
    // Slowly rotate the entire particle cloud
    this.mesh.rotation.y = time * 0.02;
    this.mesh.rotation.x = time * 0.01;
  }
}
