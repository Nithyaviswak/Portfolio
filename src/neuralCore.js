import * as THREE from 'three';

export class NeuralCore {
  constructor(scene, coreLight) {
    this.group = new THREE.Group();
    scene.add(this.group);
    
    this.coreLight = coreLight;
    
    // 1. Inner glowing sphere
    const innerGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const innerMaterial = new THREE.MeshStandardMaterial({
      color: 0x050510,
      emissive: 0x00e5ff,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.9,
      roughness: 0.2,
      metalness: 0.8
    });
    this.innerSphere = new THREE.Mesh(innerGeometry, innerMaterial);
    this.group.add(this.innerSphere);
    
    // 2. Outer wireframe icosahedron
    const outerGeometry = new THREE.IcosahedronGeometry(2, 1);
    const outerEdges = new THREE.EdgesGeometry(outerGeometry);
    const outerMaterial = new THREE.LineBasicMaterial({
      color: 0x9945ff,
      transparent: true,
      opacity: 0.8,
      linewidth: 2 // Note: WebGL standard limits lines to 1px wide on most platforms
    });
    this.outerWireframe = new THREE.LineSegments(outerEdges, outerMaterial);
    this.group.add(this.outerWireframe);
    
    // 3. Orbiting neural nodes (small spheres)
    this.nodesGroup = new THREE.Group();
    this.nodes = [];
    const nodeGeometry = new THREE.SphereGeometry(0.1, 8, 8);
    const nodeMaterial = new THREE.MeshStandardMaterial({
      color: 0x00e5ff,
      emissive: 0x00e5ff,
      emissiveIntensity: 1
    });
    
    for (let i = 0; i < 15; i++) {
      const node = new THREE.Mesh(nodeGeometry, nodeMaterial);
      // Random position on a sphere radius ~2.5
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos((Math.random() * 2) - 1);
      const r = 2.5 + Math.random() * 0.5;
      
      node.position.x = r * Math.sin(phi) * Math.cos(theta);
      node.position.y = r * Math.sin(phi) * Math.sin(theta);
      node.position.z = r * Math.cos(phi);
      
      // Store initial randomized orbit speeds
      node.userData = {
        speedX: (Math.random() - 0.5) * 0.02,
        speedY: (Math.random() - 0.5) * 0.02,
        speedZ: (Math.random() - 0.5) * 0.02,
        orbitRadius: r,
        angle1: Math.random() * Math.PI * 2,
        angle2: Math.random() * Math.PI * 2
      };
      
      this.nodes.push(node);
      this.nodesGroup.add(node);
    }
    this.group.add(this.nodesGroup);
    
    // Initialize target transforms (updated by ScrollTrigger)
    this.targetPosition = new THREE.Vector3(0, 0, 0);
    this.targetRotation = new THREE.Euler(0, 0, 0);
    this.targetScale = new THREE.Vector3(1, 1, 1);
  }
  
  update(time) {
    // Idle animation for the whole group
    const slowTime = time * 0.2;
    this.innerSphere.rotation.y = slowTime;
    this.innerSphere.rotation.x = slowTime * 0.5;
    
    this.outerWireframe.rotation.y = -slowTime * 0.8;
    this.outerWireframe.rotation.z = slowTime * 0.3;
    
    // Pulsating effect on the inner sphere
    const pulse = 1 + Math.sin(time * 2) * 0.05;
    this.innerSphere.scale.set(pulse, pulse, pulse);
    this.innerSphere.material.emissiveIntensity = 0.5 + Math.sin(time * 3) * 0.3;
    
    // Update orbiting nodes
    this.nodes.forEach((node, i) => {
      const data = node.userData;
      data.angle1 += data.speedX;
      data.angle2 += data.speedY;
      
      // Complex orbital motion
      node.position.x = data.orbitRadius * Math.sin(data.angle1) * Math.cos(data.angle2);
      node.position.y = data.orbitRadius * Math.sin(data.angle1) * Math.sin(data.angle2);
      node.position.z = Math.cos(data.angle1) * data.orbitRadius * Math.sin(time * 0.5 + i);
    });
    
    this.nodesGroup.rotation.y = time * 0.1;
    this.nodesGroup.rotation.z = time * 0.05;
    
    // Sync light position to core position
    this.coreLight.position.copy(this.group.position);
    this.coreLight.intensity = 5 + Math.sin(time * 2) * 2;
  }
}
