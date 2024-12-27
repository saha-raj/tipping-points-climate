import * as THREE from 'three';
import * as d3 from 'd3';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { LifecycleManager } from './core/lifecycle/LifecycleManager';
import { globalConfig, sceneConfig, extraConfig } from './config/globalConfig';
import { ObjectFactory } from './core/objects/ObjectFactory';
import { DebugLogger } from './debug/DebugLogger';
import { DebugOverlay } from './debug/DebugOverlay';
import { SimulationScene } from './core/simulation/simulation-scene.js';

// Set color management before anything else
THREE.ColorManagement.enabled = true;
THREE.ColorManagement.legacyMode = false;

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
            
            // Set initial position and rotation for 3D objects
            if (object.type === '3dObject') {
                const normalizedX = (config.position.x - 50) / 25;
                const normalizedY = -(config.position.y - 50) / 25;
                object.object.position.set(normalizedX, normalizedY, 0);
                
                // Add Earth's axial tilt (23.5 degrees)
                if (config.id === 'earth') {
                    object.object.rotation.x = 0;
                    object.object.rotation.y = 0;
                    object.object.rotation.z = 23.5 * Math.PI / 180;

                }
                
                this.scene.add(object.object);
                // Add shadow cylinder to scene if it exists
                if (object.extras?.shadowCylinder) {
                    this.scene.add(object.extras.shadowCylinder);
                }
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
        
        // Preload textures including default
        this.earthTextures = new Map();
        const textureLoader = new THREE.TextureLoader();
        
        // Load default texture first
        const defaultTexture = textureLoader.load('/assets/textures/2_no_clouds_8k.jpg', 
            // Add success callback
            (texture) => {
                texture.colorSpace = 'srgb';
                const earth = this.objects.get('earth');
                if (earth && earth.extras) {
                    earth.extras.material.map = texture;
                    earth.extras.material.needsUpdate = true;
                    this.renderer.render(this.scene, this.camera);  // Force initial render
                }
            }
        );
        this.earthTextures.set('default', defaultTexture);
        
        // Load config textures
        extraConfig.forEach(config => {
            if (config.id === 'earthTexture') {
                const texture = textureLoader.load(config.file);
                texture.colorSpace = 'srgb';
                this.earthTextures.set(config.file, texture);
            }
        });

        // Add simulation button handler
        const simButton = this.objects.get('simulation-button');
        if (simButton && simButton.element) {
            simButton.element.addEventListener('click', () => {
                this.initSimulation();
                this.enterSimulation();
            });
        }

        // Check for return scroll position
        const returnScroll = sessionStorage.getItem('returnScroll');
        if (returnScroll) {
            window.scrollTo(0, parseFloat(returnScroll));
            sessionStorage.removeItem('returnScroll');
        }
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
        
        // Position camera
        this.camera.position.x = -4;
        this.camera.position.y = 3.2;
        this.camera.position.z = 3;
        
        
        
        // Add camera lookAt - can be removed if needed
        this.camera.lookAt(0, 0, 0);  // Look at origin/center of scene

        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.outputColorSpace = 'srgb';
        THREE.ColorManagement.enabled = true;
        // this.renderer.useLegacyLights = false;
        this.container.appendChild(this.renderer.domElement);

        // Create objects container
        this.objects = new Map();

        // Add lighting for 3D objects
        // const ambientLight = new THREE.AmbientLight(0x404040);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(-10, 0, 0);
        // this.scene.add(ambientLight);
        this.scene.add(directionalLight);
    }

    setupObjects() {
        globalConfig.forEach(config => {
            this.lifecycle.registerObject(config);
            
            const object = ObjectFactory.createObject(config);
            
            if (object.type === 'text') {
                this.container.appendChild(object.element);
            } else if (object.type === '3dObject') {
                this.scene.add(object.object);
            }
            
            this.objects.set(config.id, object);
        });

        // Immediate initial update
        this.updateObjects();
    }

    updateObjects() {
        const visibleObjects = this.lifecycle.getVisibleObjects();
        
        // First hide all non-3D objects
        this.objects.forEach((object) => {
            if (object.type !== '3dObject') {
                object.element.style.display = 'none';
            }
        });
     
        visibleObjects.forEach(({ id, state }) => {
            const object = this.objects.get(id);
            if (!object) return;
     
            const { position, opacity, transforms, visible } = state;
     
            if (object.type === '3dObject') {
                const normalizedX = (position.x - 50) / 25;
                const normalizedY = -(position.y - 50) / 25;
                
                object.object.position.set(
                    normalizedX,
                    normalizedY,
                    0
                );
                
                if (transforms.scale && object.extras?.shadowCylinder) {
                    const scale = transforms.scale;
                    const cylinderLength = 4;
                    
                    object.object.scale.setScalar(scale);
                    object.extras.shadowCylinder.scale.setScalar(scale);
                    object.extras.shadowCylinder.position.x = (cylinderLength/2) * scale;
                }
                
                if (transforms.translation) {
                    object.object.position.x += transforms.translation.x / 50;
                    object.object.position.y -= transforms.translation.y / 50;
                }
                
                if (transforms.rotation) {
                    object.object.rotation.z = transforms.rotation;
                }
            } else {
                if (visible) {
                    object.element.style.display = 'block';
                    object.element.style.left = `${position.x}%`;
                    object.element.style.top = `${position.y}%`;
                    object.element.style.opacity = opacity;
                    object.element.style.transform = this.getTransformString(transforms);
                    
                    // Add MathJax reprocessing only if element contains math
                    if (object.element.innerHTML.match(/\$\$(.*?)\$\$|\$(.*?)\$/)) {
                        MathJax.typesetPromise([object.element]).catch(err => {
                            console.warn('MathJax reprocessing failed:', err);
                        });
                    }
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
        const textureLoader = new THREE.TextureLoader();
        
        // Define lock range
        const LOCK_START = 0.91;
        const LOCK_END = 0.95;
        let isLocked = false;
        let lockedPosition = null;
        
        // Handle all scroll-related events
        const handleScroll = (e) => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = window.scrollY / scrollHeight;
            
            // Check if we're entering lock range
            if (progress >= LOCK_START && progress <= LOCK_END) {
                if (!isLocked) {
                    // First time entering lock range
                    isLocked = true;
                    lockedPosition = window.scrollY;
                    console.log('Scroll locked at:', progress); // Debug
                }
                
                // Force position to locked point
                window.scrollTo(0, lockedPosition);
                
                // Prevent any scroll
                e?.preventDefault();
                e?.stopPropagation();
                return false;
            } else {
                // Outside lock range
                isLocked = false;
                lockedPosition = null;
            }
            
            // Only update if not locked
            if (!isLocked) {
                this.debugLogger.logProgress(progress);
                this.debugOverlay.updateProgress(progress);
                this.debugOverlay.updateScene(this.getCurrentScene(progress));
                this.lifecycle.updateProgress(progress);
            }
        };
        
        // Bind to multiple events to catch all scroll triggers
        window.addEventListener('wheel', handleScroll, { passive: false });
        window.addEventListener('touchmove', handleScroll, { passive: false });
        window.addEventListener('scroll', handleScroll);
        
        // Handle resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        // Rotate Earth around Y-axis
        // const earth = this.objects.get('earth');
        // if (earth && earth.object) {
        //     const rotationSpeed = 0.02;
        //     earth.object.rotation.y += rotationSpeed;
        // }
        const earth = this.objects.get('earth');
if (earth && earth.object) {
    const rotationSpeed = 0.005;

    // Earth tilt is around Z by -23.5°, so spin axis is original Y, tilted by -23.5° around Z.
    const tiltAngle = 23.5 * Math.PI / 180;
    const rotationAxis = new THREE.Vector3(0, 1, 0)
      .applyAxisAngle(new THREE.Vector3(0, 1, 0), tiltAngle)
      .normalize();

    // Rotate around that single tilted axis
    earth.object.rotateOnAxis(rotationAxis, rotationSpeed);
}



        // Calculate velocity and decay it over time
        if (this.scrollVelocity > 0) {
            this.scrollVelocity *= 0.95;
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

    initSimulation() {
        if (!this.simulationScene) {
            this.simulationScene = new SimulationScene(this.container);
            this.simulationScene.onReturnToStory = () => this.exitSimulation();
        }
    }
    
    enterSimulation() {
        // Fade out current scene
        this.container.style.opacity = 0;
        
        setTimeout(() => {
            // Hide scroll scene
            this.container.style.display = 'none';
            document.body.style.overflow = 'hidden';  // Disable scrolling
            
            // Show and fade in simulation
            this.container.style.display = 'block';
            this.simulationScene.activate();
            this.container.style.opacity = 1;
        }, 500);  // Match fade duration
    }
    
    exitSimulation() {
        // Fade out simulation
        this.container.style.opacity = 0;
        
        setTimeout(() => {
            // Hide simulation
            this.simulationScene.deactivate();
            
            // Force scene refresh by reloading the page and setting scroll position
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const targetScroll = scrollHeight * 0.9;
            
            // Store target scroll position in sessionStorage
            sessionStorage.setItem('returnScroll', targetScroll);
            
            // Reload page
            window.location.reload();
        }, 500);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new ScrollCanvas('canvas-container');
});
