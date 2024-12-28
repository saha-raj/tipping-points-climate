import * as THREE from 'three';

export class Simulation3DObject {
    constructor(config) {
        this.type = 'sim-3dObject';
        
        // Setup scene
        this.scene = new THREE.Scene();
        
        // Match main scene camera settings exactly
        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Match main scene renderer settings exactly
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Create sphere
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({ 
            color: 0x9932CC
        });
        this.mesh = new THREE.Mesh(geometry, material);
        
        // Position EXACTLY like main scene
        const normalizedX = (config.position.x - 50) / 25;
        const normalizedY = -(config.position.y - 50) / 25;
        this.mesh.position.set(normalizedX, normalizedY, 0);
        
        this.scene.add(this.mesh);
        
        // Light EXACTLY like main scene
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(-10, 0, 0);
        this.scene.add(directionalLight);
        
        // Camera EXACTLY like main scene
        this.camera.position.set(-4, 3.2, 3);
        this.camera.lookAt(0, 0, 0);
        
        this.element = this.renderer.domElement;
        this.element.style.position = 'absolute';
        this.element.style.top = '0';
        this.element.style.left = '0';
        this.element.style.zIndex = '1';
        
        this.animate();
    }

    animate = () => {
        requestAnimationFrame(this.animate);
        this.renderer.render(this.scene, this.camera);
    }

    update(scrollProgress) {
        this.element.style.display = 
            (scrollProgress >= 0.93 && scrollProgress <= 0.96) ? 'block' : 'none';
    }
}