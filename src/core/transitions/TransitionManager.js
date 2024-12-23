import { lerpPosition, calculateProgress } from '../../utils/interpolation';
import { defaults } from '../../config/globalConfig';

export class TransitionManager {
    /**
     * Calculate object's current position based on lifecycle state
     * @param {Object} config - Object configuration
     * @param {number} scrollProgress - Current scroll progress (0-1)
     * @returns {{position: {x: number, y: number}, opacity: number, visible: boolean}}
     */
    static calculateTransition(config, scrollProgress) {
        const { position, transition } = config;
        const { entry_from, exit_to } = transition;

        if (config.id === 'earth') {
            console.log('TransitionManager Calculation:', {
                scrollProgress,
                initialPosition: position,
                entryFrom: entry_from,
                currentState: {
                    isBeforeEntry: entry_from && scrollProgress < entry_from.at,
                    isDuringEntry: entry_from && scrollProgress >= entry_from.at && 
                        scrollProgress <= (entry_from.at + (entry_from.duration || defaults.transition.entry.duration)),
                }
            });
        }

        // Before entry - object should be invisible
        if (entry_from && scrollProgress < entry_from.at) {
            return {
                position: { ...entry_from },
                opacity: entry_from.opacity ?? defaults.transition.opacity.initial,
                visible: false
            };
        }

        // During entry transition
        if (entry_from && scrollProgress >= entry_from.at && 
            scrollProgress <= (entry_from.at + (entry_from.duration || defaults.transition.entry.duration))) {
            
            const entryProgress = calculateProgress(
                scrollProgress,
                entry_from.at,
                entry_from.at + (entry_from.duration || defaults.transition.entry.duration)
            );

            return {
                position: lerpPosition(entry_from, position, entryProgress),
                opacity: entry_from.opacity !== undefined ? 
                    lerpPosition({ x: entry_from.opacity }, { x: 1 }, entryProgress).x :
                    lerpPosition({ x: defaults.transition.opacity.initial }, { x: defaults.transition.opacity.entry }, entryProgress).x,
                visible: true
            };
        }

        // During exit transition
        if (exit_to && scrollProgress >= exit_to.at && 
            scrollProgress <= (exit_to.at + (exit_to.duration || defaults.transition.exit.duration))) {
            
            const exitProgress = calculateProgress(
                scrollProgress,
                exit_to.at,
                exit_to.at + (exit_to.duration || defaults.transition.exit.duration)
            );

            return {
                position: lerpPosition(position, exit_to, exitProgress),
                opacity: exit_to.opacity !== undefined ?
                    lerpPosition({ x: 1 }, { x: exit_to.opacity }, exitProgress).x :
                    lerpPosition({ x: 1 }, { x: defaults.transition.opacity.exit }, exitProgress).x,
                visible: true
            };
        }

        // After exit - object should be invisible
        if (exit_to && scrollProgress > (exit_to.at + (exit_to.duration || defaults.transition.exit.duration))) {
            return {
                position: { ...exit_to },
                opacity: exit_to.opacity ?? defaults.transition.opacity.exit,
                visible: false
            };
        }

        // Default sitting position
        return {
            position: { ...position },
            opacity: 1,
            visible: true
        };
    }
}
