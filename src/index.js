import * as THREE from 'three';
import * as d3 from 'd3';
import { LifecycleManager } from './core/lifecycle/LifecycleManager';
import { globalConfig } from './config/globalConfig';
import { ObjectFactory } from './core/objects/ObjectFactory';
import { DebugLogger } from './debug/DebugLogger';
import { DebugOverlay } from './debug/DebugOverlay';

class ScrollCanvas {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.lifecycle = new LifecycleManager();
        this.setupScene();
        this.setupObjects();
        this.bindEvents();
        this.animate();
        
        // Initialize debug utilities
        this.debugLogger = new DebugLogger();
        this.debugOverlay = new DebugOverlay();
        this.lastProgress = 0;
    }

    setupScene() {
        // Three.js setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1B2737); // 3d405b

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
        
        if (this.lastProgress !== this.lifecycle.scrollProgress) {
            visibleObjects.forEach(({ id, state }) => {
                this.debugLogger.logObjectState(id, state);
            });
            this.lastProgress = this.lifecycle.scrollProgress;
        }
        
        visibleObjects.forEach(({ id, state }) => {
            const object = this.objects.get(id);
            if (!object) return;

            const { position, opacity, transforms } = state;

            if (object.type === 'text') {
                const element = object.element;
                element.style.left = `${position.x}%`;
                element.style.top = `${position.y}%`;
                element.style.opacity = opacity;
                element.style.transform = this.getTransformString(transforms);
            } else {
                // Convert percentage coordinates to Three.js space (-1 to 1)
                const normalizedX = (position.x / 50) - 1;  // 50% = center (0)
                const normalizedY = -(position.y / 50) + 1; // Invert Y axis
                
                object.object.position.set(
                    normalizedX,
                    normalizedY,
                    0
                );
                
                object.object.scale.setScalar(transforms.scale || 1);
                
                if (transforms.translation) {
                    // Convert translation percentages to Three.js space
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
        window.addEventListener('scroll', () => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = window.scrollY / scrollHeight;
            
            // Update debug utilities
            this.debugLogger.logProgress(progress);
            this.debugOverlay.updateProgress(progress);
            this.debugOverlay.updateScene(this.getCurrentScene(progress));
            
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

    getCurrentScene(progress) {
        // Placeholder scene calculation - adjust based on your needs
        return Math.floor(progress * 3) + 1;
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ScrollCanvas('canvas-container');
});
