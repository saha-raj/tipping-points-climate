import { TransformManager } from '../transforms/TransformManager';
import { TransitionManager } from '../transitions/TransitionManager';

export class LifecycleManager {
    constructor() {
        this.objects = new Map();
        this.scrollProgress = 0;
        this.isScrollLocked = false;
        this.LOCK_START = 0.9;
        this.LOCK_END = 0.98;
    }

    /**
     * Register an object with its configuration
     * @param {Object} config - Object configuration from globalConfig
     */
    registerObject(config) {
        this.objects.set(config.id, {
            config,
            state: {
                position: { ...config.position },
                opacity: 0,
                transforms: {},
                visible: false
            }
        });
    }

    /**
     * Update scroll progress and recalculate all object states
     * @param {number} progress - Current scroll progress (0-1)
     */
    updateProgress(progress) {
        const previousProgress = this.scrollProgress;
        this.scrollProgress = progress;

        if (this.shouldLockScroll(progress)) {
            console.log('Scroll locked at:', progress);
            this.isScrollLocked = true;
            
            if (progress < previousProgress) {
                this.updateAllObjects();
            }
            return;
        }

        this.isScrollLocked = false;
        this.updateAllObjects();
    }

    /**
     * Update state for a single object
     * @param {string} id - Object identifier
     * @returns {Object} Updated object state
     */
    updateObject(id) {
        const object = this.objects.get(id);
        if (!object) return null;

        const { config } = object;
        
        // Get transition state which now includes visibility
        const transitionState = TransitionManager.calculateTransition(
            config, 
            this.scrollProgress
        );
        
        // Calculate active transforms
        const transforms = TransformManager.getActiveTransforms(
            config.transformations, 
            this.scrollProgress
        );

        // Update state
        object.state = {
            ...object.state,
            ...transitionState,
            transforms
        };

        return object.state;
    }

    /**
     * Update all registered objects
     */
    updateAllObjects() {
        for (const id of this.objects.keys()) {
            this.updateObject(id);
        }
    }

    /**
     * Get current state of an object
     * @param {string} id - Object identifier
     */
    getObjectState(id) {
        return this.objects.get(id)?.state;
    }

    /**
     * Get all visible objects and their states
     */
    getVisibleObjects() {
        const visible = [];
        for (const [id, object] of this.objects) {
            if (object.state.visible) {
                visible.push({
                    id,
                    state: object.state
                });
            }
        }
        return visible;
    }

    forceUpdateStates(progress) {
        this.scrollProgress = progress;
        for (const [id, object] of this.objects) {
            const state = this.updateObject(id);
            if (!state.visible) {
                // Ensure cleanup of invisible objects
                object.state.opacity = 0;
            }
        }
    }

    shouldLockScroll(progress) {
        return progress >= this.LOCK_START && progress <= this.LOCK_END;
    }
}
