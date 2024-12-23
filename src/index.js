import * as THREE from 'three';
import * as d3 from 'd3';
import { LifecycleManager } from './core/lifecycle/LifecycleManager';
import { globalConfig, sceneConfig } from './config/globalConfig';
import { ObjectFactory } from './core/objects/ObjectFactory';
import { DebugLogger } from './debug/DebugLogger';
import { DebugOverlay } from './debug/DebugOverlay';

class ScrollCanvas {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.lifecycle = new LifecycleManager();
        this.debugLogger = new DebugLogger();
        this.debugOverlay = new DebugOverlay();
        
        this.setupScene();
        
        // Create and add objects
        globalConfig.forEach(config => {
            const object = ObjectFactory.createObject(config);
            if (!object) return;
            
            // Set initial position for 3D objects immediately
            if (object.type === '3d') {
                const normalizedX = (config.position.x - 50) / 25;
                const normalizedY = -(config.position.y - 50) / 25;
                object.object.position.set(normalizedX, normalizedY, 0);
                this.scene.add(object.object);
            } else {
                this.container.appendChild(object.element);
            }
            
            this.objects.set(config.id, object);
            this.lifecycle.registerObject(config);
        });
        
        this.bindEvents();
        this.animate();
        
        // Initialize debug utilities
        this.debugLogger = new DebugLogger();
        this.debugOverlay = new DebugOverlay();
        this.lastProgress = 0;
        this.lastScrollTime = null;
        this.lastScrollY = 0;
        this.scrollVelocity = 0;
        this.lastVerifyTime = 0;  // Track last verification time
        
        // Set scroll height based on sceneConfig
        document.body.style.minHeight = `${sceneConfig.totalScenes * sceneConfig.heightPerScene}vh`;
    }

    setupScene() {
        // Three.js setup
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1B2737);

        this.camera = new THREE.PerspectiveCamera(
            45,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.container.appendChild(this.renderer.domElement);

        // Position camera
        this.camera.position.z = 8;

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

        // Immediate initial update
        this.updateObjects();
    }

    updateObjects() {
        const visibleObjects = this.lifecycle.getVisibleObjects();
        
        visibleObjects.forEach(({ id, state }) => {
            const object = this.objects.get(id);
            if (!object) return;

            const { position, opacity, transforms } = state;

            if (object.type === '3d') {
                // Convert percentage position to Three.js space
                // 0% → -1 (left edge)
                // 50% → 0 (center)
                // 100% → 1 (right edge)
                const normalizedX = (position.x - 50) / 25;  // -2 to +2 range
                const normalizedY = -(position.y - 50) / 25;
                
                object.object.position.set(
                    normalizedX,
                    normalizedY,
                    0
                );
                
                if (transforms.scale) {
                    object.object.scale.setScalar(transforms.scale);
                }
                
                if (transforms.translation) {
                    object.object.position.x += transforms.translation.x / 50;
                    object.object.position.y -= transforms.translation.y / 50;
                }
                
                if (transforms.rotation) {
                    object.object.rotation.z = transforms.rotation;
                }
            } else {
                // Handle text elements (unchanged)
                object.element.style.left = `${position.x}%`;
                object.element.style.top = `${position.y}%`;
                object.element.style.opacity = opacity;
                object.element.style.transform = this.getTransformString(transforms);
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
            const now = Date.now();
            const timeDelta = now - (this.lastScrollTime || now);
            this.lastScrollTime = now;
            
            const currentScrollY = window.scrollY;
            const scrollDelta = Math.abs(currentScrollY - this.lastScrollY);
            this.lastScrollY = currentScrollY;
            
            // Calculate scroll velocity (pixels per millisecond)
            this.scrollVelocity = scrollDelta / (timeDelta || 1);
            
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = currentScrollY / scrollHeight;
            
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
        
        // Add earth rotation
        const earth = this.objects.get('earth');
        if (earth && earth.object) {
            earth.object.rotation.y += 0.01;
        }
        
        // Calculate velocity and decay it over time
        if (this.scrollVelocity > 0) {
            this.scrollVelocity *= 0.95; // Decay factor
        }
        
        // Force update if we were scrolling fast and just stopped
        if (this.lastScrollTime && Date.now() - this.lastScrollTime > 150) {
            if (this.scrollVelocity > 0.5) {
                const progress = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight);
                this.lifecycle.forceUpdateStates(progress);
            }
            this.lastScrollTime = null;
            this.scrollVelocity = 0;
        }
        
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
