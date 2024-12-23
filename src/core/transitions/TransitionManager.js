import { lerpPosition, calculateProgress } from '../../utils/interpolation';

export class TransitionManager {
    /**
     * Calculate object's current position based on lifecycle state
     * @param {Object} config - Object configuration
     * @param {number} scrollProgress - Current scroll progress (0-1)
     * @returns {{position: {x: number, y: number}, opacity: number}}
     */
    static calculateTransition(config, scrollProgress) {
        const { position, transition } = config;
        const { entry_from, exit_to } = transition;

        // Entry transition
        if (entry_from && scrollProgress >= entry_from.at && 
            scrollProgress <= (entry_from.at + entry_from.duration)) {
            
            const entryProgress = calculateProgress(
                scrollProgress,
                entry_from.at,
                entry_from.at + entry_from.duration
            );

            return {
                position: lerpPosition(entry_from, position, entryProgress),
                opacity: entryProgress
            };
        }

        // Exit transition
        if (exit_to && scrollProgress >= exit_to.at && 
            scrollProgress <= (exit_to.at + exit_to.duration)) {
            
            const exitProgress = calculateProgress(
                scrollProgress,
                exit_to.at,
                exit_to.at + exit_to.duration
            );

            return {
                position: lerpPosition(position, exit_to, exitProgress),
                opacity: 1 - exitProgress
            };
        }

        // Sitting position (default state)
        return {
            position: { ...position },
            opacity: 1
        };
    }

    /**
     * Determine if object is currently visible
     * @param {Object} config - Object configuration
     * @param {number} scrollProgress - Current scroll progress (0-1)
     * @returns {boolean}
     */
    static isVisible(config, scrollProgress) {
        const { transition } = config;
        const { entry_from, exit_to } = transition;

        // Before entry
        if (entry_from && scrollProgress < entry_from.at) {
            return false;
        }

        // After exit
        if (exit_to && scrollProgress > (exit_to.at + exit_to.duration)) {
            return false;
        }

        return true;
    }
}
