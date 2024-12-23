import * as THREE from 'three';
import * as d3 from 'd3';
import { LifecycleManager } from './core/lifecycle/LifecycleManager';
import { globalConfig } from './config/globalConfig';
import { ObjectFactory } from './core/objects/ObjectFactory';

class ScrollCanvas {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.lifecycle = new LifecycleManager();
        this.setupScene();
        this.setupObjects();
        this.bindEvents();
        this.animate();
    }

    setupScene() {
        // Three.js setup
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        // Position camera
        this.camera.position.z = 5;

        // Create objects container
        this.objects = new Map();

        // Add lighting for 3D objects
        const ambientLight = new THREE.AmbientLight(0x404040);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        this.scene.add(ambientLight);
        this.scene.add(directionalLight);
    }

    setupObjects() {
        globalConfig.forEach(config => {
            this.lifecycle.registerObject(config);
            
            const object = ObjectFactory.createObject(config);
            
            if (object.type === 'text') {
                this.container.appendChild(object.element);
            } else if (object.type === '3d') {
                this.scene.add(object.object);
            }
            
            this.objects.set(config.id, object);
        });
    }

    updateObjects() {
        const visibleObjects = this.lifecycle.getVisibleObjects();
        
        visibleObjects.forEach(({ id, state }) => {
            const object = this.objects.get(id);
            if (!object) return;

            const { position, opacity, transforms } = state;

            if (object.type === 'text') {
                // Update DOM element directly instead of using D3
                const element = object.element;
                element.style.left = `${position.x}%`;
                element.style.top = `${position.y}%`;
                element.style.opacity = opacity;
                element.style.transform = this.getTransformString(transforms);
            } else {
                // Three.js object updates remain the same
                object.object.position.set(
                    position.x / 50 - 1,
                    -position.y / 50 + 1,
                    0
                );
                object.object.scale.setScalar(transforms.scale || 1);
                if (transforms.translation) {
                    object.object.position.x += transforms.translation.x / 50;
                    object.object.position.y -= transforms.translation.y / 50;
                }
                if (transforms.rotation) {
                    object.object.rotation.z = transforms.rotation;
                }
            }
        });
    }

    getTransformString(transforms) {
        const parts = [];
        if (transforms.scale) parts.push(`scale(${transforms.scale})`);
        if (transforms.translation) {
            parts.push(`translate(${transforms.translation.x}px, ${transforms.translation.y}px)`);
        }
        if (transforms.rotation) parts.push(`rotate(${transforms.rotation}rad)`);
        return parts.join(' ');
    }

    bindEvents() {
        // Update scroll progress
        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = window.scrollY / scrollHeight;
            this.lifecycle.updateProgress(progress);
        });

        // Handle resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        this.updateObjects();
        this.renderer.render(this.scene, this.camera);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ScrollCanvas('canvas-container');
});
