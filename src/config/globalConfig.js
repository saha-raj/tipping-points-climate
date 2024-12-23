/**
 * @typedef {Object} Position
 * @property {number} x
 * @property {number} y
 */

/**
 * @typedef {Object} TransitionPoint
 * @property {number} x
 * @property {number} y
 * @property {number} at - Scroll progress when transition starts (0-1)
 * @property {number} duration - Duration of transition in scroll progress (0-1)
 */

/**
 * @typedef {Object} Transformation
 * @property {string} type - "scale" | "translation" | "rotation"
 * @property {number} at - Scroll progress when transform starts (0-1)
 * @property {number} duration - Duration of transform in scroll progress (0-1)
 * @property {number} [scale_to] - Target scale for "scale" type
 * @property {number} [delta_x] - X translation for "translation" type
 * @property {number} [delta_y] - Y translation for "translation" type
 * @property {number} [rotate_to] - Target rotation for "rotation" type
 */

/**
 * @typedef {Object} ObjectConfig
 * @property {string} id - Unique identifier
 * @property {string} type - "header" | "description" | "3dObject"
 * @property {string} [content] - Text content if applicable
 * @property {Position} position - Resting position
 * @property {Object} transition - Entry and exit transitions
 * @property {TransitionPoint} [transition.entry_from] - Entry transition
 * @property {TransitionPoint} [transition.exit_to] - Exit transition
 * @property {Transformation[]} [transformations] - Array of transformations
 */

// Define constants in percentage values (0-100)
const EARTH_X = 50;  // Center of screen horizontally
const EARTH_Y = 50;  // Center of screen vertically
const DURATION_DEFAULT = 0.2;

export const sceneConfig = {
    totalScenes: 10,  // Number of scenes in the animation
    heightPerScene: 100  // Viewport height percentage per scene
};
// Calculate total scroll height
const TOTAL_SCROLL_HEIGHT = sceneConfig.totalScenes * sceneConfig.heightPerScene;

export const defaults = {
    transition: {
        duration: DURATION_DEFAULT,
        opacity: {
            entry: 1,      // Default final opacity for entry
            exit: 0,       // Default final opacity for exit
            initial: 0     // Default starting opacity
        },
        entry: {
            duration: DURATION_DEFAULT
        },
        exit: {
            duration: DURATION_DEFAULT
        }
    },
    transform: {
        duration: DURATION_DEFAULT   
    }
};

/** @type {ObjectConfig[]} */

export const globalConfig = [
    {
        id: "header-1",
        type: "header",
        content: "Welcome",
        position: { x: 10, y: 30 },
        transition: {
            entry_from: { 
                x: 10, 
                y: 30, 
                at: 0.2,
                opacity: 0
            },
            exit_to: { 
                x: 10, 
                y: -10, 
                at: 0.33,
                opacity: 0
            }
        }
    },
    {
        id: "header-2",
        type: "header",
        content: "Energy Balance",
        position: { x: 10, y: 30 },
        transition: {
            entry_from: { 
                x: 10, 
                y: 110, 
                at: 0.33,
            },
            exit_to: { 
                x: 10, 
                y: -10, 
                at: 0.8,
            }
        }
    },
    {
        id: "earth",
        type: "3dObject",
        position: { x: EARTH_X, y: EARTH_Y },
        transition: {
            entry_from: { x: EARTH_X, y: EARTH_Y, at: 0, duration: 0.1 },
            exit_to: null
        },
        transformations: [
            {
                type: "scale",
                scale_to: 2,
                at: 0.35,
            },
            {
                type: "scale",
                scale_to: 1,
                at: 0.75,
            }
        ]
    }
];

