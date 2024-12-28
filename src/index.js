import * as THREE from 'three';
import * as d3 from 'd3';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { LifecycleManager } from './core/lifecycle/LifecycleManager';
import { globalConfig, sceneConfig, extraConfig } from './config/globalConfig';
import { ObjectFactory } from './core/objects/ObjectFactory';
import { DebugLogger } from './debug/DebugLogger';
import { DebugOverlay } from './debug/DebugOverlay';
import { ClimateModel } from './core/simulation/climate-model.js';
// import { SimulationScene } from './core/simulation/simulation-scene.js';

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
        
        // Store simulation results at class level
        let currentSimulation = null;

        const updatePotentialPlot = (gValue, tempValue) => {
            const simVPlot = this.objects.get('sim-v-plot');
            if (simVPlot && simVPlot.extras.plot) {
                const climateModel = new ClimateModel();
                
                // Calculate potential data using model's temperature range
                const temps = climateModel.generateTempRange();
                const potentialData = {
                    temps: temps,
                    values: temps.map(T => 
                        climateModel.calculatePotential(T, parseFloat(gValue))
                    ),
                    initialTemp: parseFloat(tempValue)
                };

                // Simulate from the actual initial temperature
                const simulation = climateModel.simulateTemperature(
                    parseFloat(tempValue),  // Use actual initial temperature
                    parseFloat(gValue),
                    1000,  // timeSteps
                    1000000    // dt
                );

                // Store simulation results with albedo values
                currentSimulation = {
                    ...simulation,
                    albedos: simulation.temperatures.map(T => climateModel.calculateAlbedo(T))
                };
                
                const equilibriumTemp = simulation.temperatures[simulation.temperatures.length - 1];
                simVPlot.extras.plot.updatePlot(potentialData, equilibriumTemp);
            }
        };

        let simControls = null;
        
        // Create and add objects
        globalConfig.forEach(config => {
            const object = ObjectFactory.createObject(config);
            if (!object) return;
            
            if (config.id === 'sim-controls') {
                simControls = object;
            }
            
            if (object.type === '3dObject') {
                this.scene.add(object.object);
                // Add shadow cylinder to scene if it exists
                if (object.extras && object.extras.shadowCylinder) {
                    this.scene.add(object.extras.shadowCylinder);
                }
            } else if (object.type === 'plot') {
                this.container.appendChild(object.object);
            } else {
                this.container.appendChild(object.element);
            }
            
            this.objects.set(config.id, object);
            this.lifecycle.registerObject(config);
        });

        // Initialize plot after all objects are created and registered
        if (simControls) {
            const gValue = simControls.controls.gSlider.value;
            const tempValue = simControls.controls.tempSlider.value;
            updatePotentialPlot(gValue, tempValue);
        }
        
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

        // Event listeners
        document.addEventListener('g-slider-change', (event) => {
            if (!simControls) return;
            const gValue = event.detail.value;
            const tempValue = simControls.controls.tempSlider.value;
            
            // Update plot
            updatePotentialPlot(gValue, tempValue);
            
            // Update atmosphere opacity with proper checks
            const earth = this.objects.get('earth');
            if (earth && earth.extras && earth.extras.simAtmosphereHotNonlinear) {
                const simAtmosphere = earth.extras.simAtmosphereHotNonlinear;
                
                // First make sure atmosphere is visible
                simAtmosphere.visible = true;
                
                // Calculate base opacity from g value
                const baseOpacity = (parseFloat(gValue) - 0.3) / (0.45 - 0.3);  // normalize to [0,1]
                
                // Update opacity for each layer in the atmosphere group
                simAtmosphere.children.forEach((layer, i) => {
                    if (layer.material) {
                        const t = i / (simAtmosphere.children.length - 1);
                        layer.material.opacity = baseOpacity * (0.1 * (0.5 - Math.pow(t, 3.5)));
                    }
                });
            }
        });

        document.addEventListener('temp-slider-change', (event) => {
            if (!simControls) return;
            const tempValue = event.detail.value;
            const gValue = simControls.controls.gSlider.value;
            updatePotentialPlot(gValue, tempValue);
        });

        // Modify updateObjects to handle atmosphere switching
        const originalUpdateObjects = this.updateObjects.bind(this);
        this.updateObjects = () => {
            // Run original update first
            originalUpdateObjects();

            // Then handle simulation atmosphere visibility
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = window.scrollY / scrollHeight;
            
            const earth = this.objects.get('earth');
            if (earth && earth.extras) {
                const regularAtmosphere = earth.extras.atmosphereHotNonlinear;
                const simAtmosphere = earth.extras.simAtmosphereHotNonlinear;
                
                if (regularAtmosphere && simAtmosphere) {
                    // In simulation scene
                    if (progress >= 0.9 && progress <= 0.96) {
                        regularAtmosphere.visible = false;
                        simAtmosphere.visible = true;
                    } else {
                        // Outside simulation scene
                        regularAtmosphere.visible = true;
                        simAtmosphere.visible = false;
                    }
                }
            }
        };

        // Add animation button handler
        document.addEventListener('run-animation-click', () => {
            if (!currentSimulation) return;

            const earth = this.objects.get('earth');
            if (!earth || !earth.extras || !earth.extras.simIceGroup) return;

            const simIceGroup = earth.extras.simIceGroup;
            simIceGroup.visible = true;

            const { temperatures, albedos } = currentSimulation;
            const startTime = performance.now();
            const duration = 100000; // 3 seconds for full animation

            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1.0);
                
                if (progress < 1.0) {
                    // Get the current frame index based on progress
                    const frameIndex = Math.floor(progress * (albedos.length - 1));
                    const albedo = albedos[frameIndex];
                    const scale = Math.min(Math.max((albedo - 0.13) / (0.57 - 0.13), 0), 1);
                    
                    simIceGroup.children.forEach(icePatch => {
                        icePatch.scale.set(scale, scale, 1);
                    });
                    
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        });
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
            if (object.type === '3dObject') return;  // Skip 3D objects
            if (object.type === 'plot') {  // Handle plots
                object.object.style.display = 'none';
            } else {  // Handle other DOM elements
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
                
                // Add camera look handling
                if (transforms.camera_look) {
                    const look = transforms.camera_look;
                    this.camera.lookAt(look.x, look.y, look.z);
                }
            } else if (object.type === 'plot') {  // Handle plots
                if (visible) {
                    object.object.style.display = 'block';
                    object.object.style.left = `${position.x}%`;
                    object.object.style.top = `${position.y}%`;
                    object.object.style.opacity = opacity;
                    object.object.style.transform = this.getTransformString(transforms);
                }
            } else {  // Handle other DOM elements
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
        let forceUnlocked = false;
        let lastScrollY = window.scrollY;
        let scrollVelocity = 0;
        let lockedPosition = null;

        const handleScroll = (e) => {
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = window.scrollY / scrollHeight;
            
            scrollVelocity = Math.abs(window.scrollY - lastScrollY);
            lastScrollY = window.scrollY;
            
            if (progress >= 0.94 && progress <= 0.96 && !forceUnlocked) {
                e.preventDefault();
                e.stopPropagation();
                
                if (!lockedPosition) {
                    lockedPosition = window.scrollY;
                }
                
                window.scrollTo(0, lockedPosition);
                return false;
            }
            
            // Reset lock when outside range on EITHER side
            if (progress < 0.94 || progress > 0.96) {
                forceUnlocked = false;
                lockedPosition = null;
            }
        };

        // Bind to both wheel and touch events
        window.addEventListener('wheel', handleScroll, { passive: false });
        window.addEventListener('touchmove', handleScroll, { passive: false });

        // Button handler stays the same
        const returnButton = this.objects.get('return-to-story');
        if (returnButton && returnButton.element) {
            returnButton.element.addEventListener('click', () => {
                forceUnlocked = true;
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({
                    top: Math.floor(0.80 * scrollHeight),
                    behavior: 'smooth'
                });
            });
        }

        // Add new forward button handler
        const forwardButton = this.objects.get('forward-to-story');
        if (forwardButton && forwardButton.element) {
            forwardButton.element.addEventListener('click', () => {
                forceUnlocked = true;
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                window.scrollTo({
                    top: Math.floor(0.98 * scrollHeight),
                    behavior: 'smooth'
                });
            });
        }

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
            
            // Get Earth object and its extras
            const earth = this.objects.get('earth');
            if (earth && earth.extras) {
                // Handle visibility and textures
                extraConfig.forEach(config => {
                    const entryAt = config.entry?.at || 0;
                    const exitAt = config.exit?.at || 1.0;
                    
                    if (config.id === 'earthTexture') {
                        if (progress >= entryAt && progress <= exitAt) {
                            const texture = this.earthTextures.get(config.file);
                            if (texture && earth.extras.material.map !== texture) {
                                earth.extras.material.map = texture;
                                earth.extras.material.needsUpdate = true;
                            }
                            return; // Exit once we find an active texture
                        }
                    } else if (config.id === 'iceGroup') {
                        const iceGroup = earth.extras.iceGroup;
                        if (progress >= entryAt && progress <= exitAt) {
                            iceGroup.visible = true;
                            // Calculate growth progress
                            const growthProgress = (progress - entryAt) / (exitAt - entryAt);
                            const radius = config.maxRadius * growthProgress;
                            
                            // Update each ice patch
                            iceGroup.children.forEach(patch => {
                                patch.scale.set(radius, radius, 1);
                            });
                        } else {
                            iceGroup.visible = false;
                        }
                    } else if (config.id === 'atmosphereHotNonlinear') {
                        const regularAtmosphere = earth.extras.atmosphereHotNonlinear;
                        if (regularAtmosphere) {
                            regularAtmosphere.visible = progress >= entryAt && progress <= exitAt;
                        }
                    } else if (config.id === 'simAtmosphereHotNonlinear') {
                        const simAtmosphere = earth.extras.simAtmosphereHotNonlinear;
                        if (simAtmosphere) {
                            const shouldBeVisible = progress >= entryAt && progress <= exitAt;
                            simAtmosphere.visible = shouldBeVisible;
                            console.log('Sim atmosphere visibility:', {
                                progress,
                                entryAt,
                                exitAt,
                                shouldBeVisible,
                                isVisible: simAtmosphere.visible
                            });
                        }
                    } else if (config.id === 'simIceGroup') {
                        const simIceGroup = earth.extras.simIceGroup;
                        if (progress >= entryAt && progress <= exitAt) {
                            simIceGroup.visible = true;
                            // Calculate growth progress
                            const growthProgress = (progress - entryAt) / (exitAt - entryAt);
                            const radius = config.maxRadius * growthProgress;
                            
                            // Update each ice patch
                            simIceGroup.children.forEach(patch => {
                                patch.scale.set(radius, radius, 1);
                            });
                        } else {
                            simIceGroup.visible = false;
                        }
                    } else {
                        const extra = earth.extras[config.id];
                        if (extra) {
                            extra.visible = progress >= entryAt && progress <= exitAt;
                        }
                    }
                });
                
                // If no texture config is active, use default
                const isAnyTextureActive = extraConfig.some(config => 
                    config.id === 'earthTexture' && 
                    progress >= (config.entry?.at || 0) && 
                    progress <= (config.exit?.at || 1.0)
                );
                
                if (!isAnyTextureActive) {
                    const defaultTexture = this.earthTextures.get('default');
                    if (defaultTexture && earth.extras.material.map !== defaultTexture) {
                        earth.extras.material.map = defaultTexture;
                        earth.extras.material.needsUpdate = true;
                    }
                }
            }
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
