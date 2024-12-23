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

        // Debug only for annotation
        if (config.id === 'annotation1') {
            console.log('Annotation State:', {
                scrollProgress,
                beforeEntry: entry_from && scrollProgress < entry_from.at,
                duringEntry: entry_from && scrollProgress >= entry_from.at && 
                    scrollProgress <= (entry_from.at + (entry_from.duration || defaults.transition.entry.duration)),
                duringExit: exit_to && scrollProgress >= exit_to.at && 
                    scrollProgress <= (exit_to.at + (exit_to.duration || defaults.transition.exit.duration)),
                afterExit: exit_to && scrollProgress > (exit_to.at + (exit_to.duration || defaults.transition.exit.duration))
            });
        }

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

        // Always start at configured position
        if (scrollProgress === 0) {
            return {
                position: { ...position },
                opacity: transition.entry_from?.opacity ?? 1,
                visible: true
            };
        }

        // Before entry
        if (entry_from && scrollProgress < entry_from.at) {
            return {
                position: { 
                    x: entry_from.x ?? position.x,
                    y: entry_from.y ?? position.y
                },
                opacity: entry_from.opacity ?? 1,
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
                opacity: 0,
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
