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

const HEADER_X = 5;  
const HEADER_Y = 10;
const DESC_X = 5;  
const DESC_Y = 15;


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
        position: { x: HEADER_X, y: HEADER_Y },
        transition: {
            entry_from: { 
                x: HEADER_X, 
                y: HEADER_Y, 
                at: 0.05,
                opacity: 0,
                duration: 0.01
            },
            exit_to: { 
                x: HEADER_X, 
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
        position: { x: HEADER_X, y: HEADER_Y },
        transition: {
            entry_from: { 
                x: HEADER_X, 
                y: 110, 
                at: 0.33,
            },
            exit_to: { 
                x: HEADER_X, 
                y: -10, 
                at: 0.8,
            }
        }
    },
    {
        id: "earth",
        type: "3dObject",
        position: { x: EARTH_X, y: EARTH_Y },
        config: {
            ice: {
                numSeeds: 10,          // Number of ice polygons
                growthRate: 0.1,       // How fast ice grows
                initialSize: 0.05,     // Starting size of each polygon
                maxSize: 0.3,          // Maximum size each polygon can grow to
                opacity: 0.8,          // Ice transparency
                color: 0xffffff        // Ice color
            }
        },
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
    },
    {
        id: 'annotation1',
        type: 'annotation',
        position: {
            x: 40,
            y: 25
        },
        content: 'This is the Earth',
        transition: {
            entry_from: {
                at: 0.2,
                opacity: 0,
                duration: 0.01
            },
            exit_to: {
                at: 0.6,
                opacity: 0,
                duration: 0.01
            }
        }
    },
    {
        id: 'mathTest',
        type: 'annotation',
        position: {
            x: 60,
            y: 35
        },
        content: 'The Stefan-Boltzmann equation: $$P = \\beta A T^4$$ where $\\sigma$ is the Stefan-Boltzmann constant.',
        transition: {
            entry_from: {
                at: 0.3,
                opacity: 0,
                duration: 0.01
            },
            exit_to: {
                at: 0.7,
                opacity: 0,
                duration: 0.01
            }
        }
    }
];

