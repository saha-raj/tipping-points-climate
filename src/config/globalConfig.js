import { sceneContent } from '../content/contentForExport_2.js';


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
 * @property {string} type - "header" | "segment" | "3dObject"
 * @property {string} [content] - Text content if applicable
 * @property {Position} position - Resting position
 * @property {Object} transition - Entry and exit transitions
 * @property {TransitionPoint} [transition.entry_from] - Entry transition
 * @property {TransitionPoint} [transition.exit_to] - Exit transition
 * @property {Transformation[]} [transformations] - Array of transformations
 */

/**
 * @typedef {Object} BackgroundConfig
 * @property {string} id - Unique identifier
 * @property {string} file - Path to image file
 * @property {number} entry.at - When to start showing
 * @property {number} exit.at - When to stop showing
 */





// -----------------------------------------
// --------------- CONSTANTS ---------------    
// -----------------------------------------

const DUR_TRANS_FRAC = 0.2;
const HEIGHT_MULTIPLIER = 150;

const EARTH_X = 50;  // Center of screen horizontally
const EARTH_Y = 50;  // Center of screen vertically

export const INTRO_HEAD_X = 5;
export const INTRO_HEAD_Y = 40;
export const INTRO_SEGMENT_X = 5;
export const INTRO_SEGMENT_Y = 60;

export const HEAD_X = 5;
export const HEAD_Y = 10;
export const SEGMENT_X = HEAD_X;
export const SEGMENT_Y = 50;

const SCROLL_dX = 0;
const SCROLL_dY = 50;

const SIM_SEGMENT_NUM = 16; // as in contentForExport.js

// -----------------------------------------
// -----------------------------------------



const NUM_SEGMENTS = Object.keys(sceneContent)
    .filter(key => key.startsWith('segment-'))
    .length;

const DUR_SEGMENT = 1 / NUM_SEGMENTS;


// const DUR_SEGMENT = 1 / NUM_SEGMENTS;
const DUR_TRANS = DUR_SEGMENT * DUR_TRANS_FRAC;

export const SIM_SEGMENT_START_AT = (SIM_SEGMENT_NUM / NUM_SEGMENTS);
export const SIM_SEGMENT_END_AT   = (SIM_SEGMENT_NUM + 1) / NUM_SEGMENTS;
export const SIM_SEGMENT_LOCK_START_AT = SIM_SEGMENT_START_AT + DUR_TRANS;
export const SIM_SEGMENT_LOCK_END_AT   = SIM_SEGMENT_END_AT;


export const SIM_SEGMENT_RETURN_BACK_AT = (SIM_SEGMENT_NUM - 1) / NUM_SEGMENTS + DUR_TRANS;
export const SIM_SEGMENT_FORWARD_TO_AT = SIM_SEGMENT_END_AT + DUR_TRANS;

export const sceneConfig = {
    totalScenes: NUM_SEGMENTS,
    heightPerScene: HEIGHT_MULTIPLIER,
    totalHeight: NUM_SEGMENTS * HEIGHT_MULTIPLIER
};

export const defaults = {
    transition: {
        duration: DUR_TRANS,
        opacity: { entry: 1, exit: 0, initial: 0 },
        entry: { duration: DUR_TRANS },
        exit: { duration: DUR_TRANS }
    },
    transform: { duration: DUR_TRANS }
};

// Type-specific defaults
export const typeDefaults = {
    'intro-header': {
        position: { x: INTRO_HEAD_X, y: INTRO_HEAD_Y },
        initiallyVisible: true,
        transition: {
            entry_from: {
                x: INTRO_HEAD_X, y: INTRO_HEAD_Y,
                opacity: 1
            },
            exit_to: {
                x: INTRO_HEAD_X, y: INTRO_HEAD_Y - SCROLL_dY,
                opacity: 1
            }
        }
    },
    'intro-segment': {
        position: { x: INTRO_SEGMENT_X, y: INTRO_SEGMENT_Y },
        initiallyVisible: true,
        transition: {
            entry_from: {
                x: INTRO_SEGMENT_X, y: INTRO_SEGMENT_Y,
                opacity: 1
            },
            exit_to: {
                x: INTRO_SEGMENT_X, y: INTRO_SEGMENT_Y - SCROLL_dY,
                opacity: 0
            }
        }
    },
    'header': {
        position: { x: HEAD_X, y: HEAD_Y },
        transition: {
            entry_from: {
                x: HEAD_X + SCROLL_dX, y: HEAD_Y + SCROLL_dY,
                opacity: 0
            },
            exit_to: {
                x: HEAD_X - SCROLL_dX, y: HEAD_Y - SCROLL_dY,
                opacity: 0
            }
        }
    },
    'segment': {
        position: { x: SEGMENT_X, y: SEGMENT_Y },
        transition: {
            entry_from: {
                x: SEGMENT_X + SCROLL_dX, y: SEGMENT_Y + SCROLL_dY,
                opacity: 0
            },
            exit_to: {
                x: SEGMENT_X - SCROLL_dX, y: SEGMENT_Y - SCROLL_dY,
                opacity: 0
            }
        }
    }
};



/** @type {ObjectConfig[]} */

const configObjects = [

    {   // --------------------- EARTH ---------------------
        id: "earth",
        type: "3dObject",
        position: { x: EARTH_X, y: EARTH_Y },
        transition: {
            entry_from: { x: EARTH_X, y: EARTH_Y, at: 0, duration: 0.1 },
            exit_to: null
            // exit_to: { x: EARTH_X, y: EARTH_Y - SCROLL_dY, at: 0.9, duration: 0.01 }
        },
        transformations: [
            {
                type: "scale",
                scale_to: 0.05,
                at: DUR_SEGMENT * 2, 
                duration: 0.02
            },
            {
                type: "scale",
                scale_to: 1,
                at: DUR_SEGMENT * 2.5, 
                duration: 0.05
            },
            // {
            //     type: "translation",
            //     delta_x: 150, 
            //     delta_y: 100,
            //     at: 0.05, duration: 0.05
            // },
            {
                type: "camera_look",
                look_x: 20,     
                look_y: 38,     
                look_z: 0,     
                at: 0.9,       
                duration: 0.05 
            }

        ]
    },
    {
        id: "rodinia",
        type: "annotation",
        content: "An imagined view of what the Earth might have looked like during the Cryogenian period, 700 million years ago.",
        position: { x: 40, y: 20 },  
        transition: {
            entry_from: {
                x: 40, y: 20,  
                at: DUR_SEGMENT * 2.75 + DUR_TRANS,  
                duration: 0.01,
                opacity: 0
            },
            exit_to: {
                x: 40, y: 20,  
                at: DUR_SEGMENT * 3,  
                duration: 0.01,
                opacity: 0
            }
        }
    },
    {
        id: "shadow",
        type: "annotation",
        content: "Earth's shadow has an area of $\\pi R^2$",
        position: { x: 50, y: 13 },  // Screen coordinates
        transition: {
            entry_from: {
                x: 50, y: 13,  // Starting position
                at: DUR_SEGMENT * 3.25 + DUR_TRANS,  // When to start appearing
                duration: 0.01,
                opacity: 0
            },
            exit_to: {
                x: 50, y: 13,  // Exit position (typically moves up)
                at: DUR_SEGMENT * 3.75,  // When to start disappearing
                duration: 0.001,
                opacity: 0
            }
        }
    },

    {
        id: 'explanation-potential',
        type: 'standalonePotentialPlot',
        position: { x: 20, y: 30 },
        params: {
            g: 0.384
        },
        transition: {
            entry_from: {
                x: 20, y: 30,
                at: DUR_SEGMENT * 15,  // Adjust these timings as needed
                // duration: DUR_TRANS,
                opacity: 0
            },
            exit_to: {
                x: 20, y: 30,
                at: DUR_SEGMENT * 16,  // Adjust these timings as needed
                // duration: DUR_TRANS,
                opacity: 0
            }
        }
    },
    {
        id: 'explanation-temperature',
        type: 'standaloneTemperaturePlot',
        position: { x: 60, y: 30 },
        params: {
            T0: 317,
            g: 0.384
        },
        transition: {
            entry_from: {
                x: 60, y: 30,
                at: DUR_SEGMENT * 15,  // Adjust these timings as needed
                // duration: DUR_TRANS,
                opacity: 0
            },
            exit_to: {
                x: 60, y: 30,
                at: DUR_SEGMENT * 16,  // Adjust these timings as needed
                // duration: DUR_TRANS,
                opacity: 0
            }
        }
    },

    {
        id: 'return-to-story',
        type: 'button',
        content: '⌃',
        position: {
            x: 50,
            y: 5
        },
        style: {
            // fontSize: '96px',
            cursor: 'pointer',
            border: 'none',
            padding: '10px',
            className: 'scroll-button scroll-button-up'
        },
        transition: {
            entry_from: {
                at: SIM_SEGMENT_START_AT + DUR_TRANS,
                opacity: 0,
                duration: 0.001
            },
            exit_to: {
                at: SIM_SEGMENT_END_AT,
                opacity: 0,
                duration: 0.001
            }
        }
    },
    {
        id: 'forward-to-story',
        type: 'button',
        content: '⌃',
        position: {
            x: 50,
            y: 90
        },
        style: {
            // fontSize: '96px',
            cursor: 'pointer',
            border: 'none',
            padding: '10px',
            className: 'scroll-button scroll-button-down'
        },
        transition: {
            entry_from: {
                at: SIM_SEGMENT_START_AT + DUR_TRANS,
                opacity: 0,
                duration: 0.001
            },
            exit_to: {
                at: SIM_SEGMENT_END_AT,
                opacity: 0,
                duration: 0.001
            }
        }
    },
    {   // --------------------- SIMULATION CONTROLS ---------------------
        id: "sim-controls",
        type: "sim-controls",
        position: {
            x: HEAD_X,    // Position on right side of screen
            y: HEAD_Y + 20     // Vertically centered
        },
        transition: {
            entry_from: {
                x: HEAD_X,
                y: HEAD_Y + SCROLL_dY,
                at: SIM_SEGMENT_START_AT,        
                opacity: 0,
                // duration: 0.01 
            },
            exit_to: {
                x: HEAD_X,
                y: HEAD_Y - SCROLL_dY,
                at: SIM_SEGMENT_END_AT,
                opacity: 0,
                // duration: 0.01 
            }
        }
    },
    {   // --------------------- POTENTIAL PLOT ---------------------
        id: "sim-v-plot",
        type: "sim-v-plot",
        position: {
            x: HEAD_X,
            y: HEAD_Y + 40
        },
        transition: {
            entry_from: {
                x: HEAD_X,
                y: HEAD_Y + SCROLL_dY,
                at: SIM_SEGMENT_START_AT,       
                opacity: 0,
                // duration: 0.01 
            },
            exit_to: {
                x: HEAD_X,
                y: HEAD_Y - SCROLL_dY,
                at: SIM_SEGMENT_END_AT,       
                opacity: 0,
                // duration: 0.01 
            }
        }
    },
    // In the configObjects array, add:
{   
    id: "sim-solution-plot",
    type: "sim-solution-plot",
    position: {
        x: 50,
        y: 50 
    },
    transition: {
        entry_from: {
            x: 50,
            y: 50 + SCROLL_dY,
            at: SIM_SEGMENT_START_AT,       
            opacity: 0
        },
        exit_to: {
            x: 50,
            y: 50 - SCROLL_dY,
            at: SIM_SEGMENT_END_AT,       
            opacity: 0
        }
    }
}
];

export const extraConfig = [

    {
        id: "atmosphereHotNonlinear",
        entry: { at: 0 },
        exit: { at: 0.90 }
    },
    {
        id: "snowballEarthGroup",
        entry: { at: DUR_SEGMENT * 1 + DUR_TRANS },  
        exit: { at: DUR_SEGMENT * 1.5 },
        entryDuration: DUR_SEGMENT * 0.2,
        exitDuration: DUR_SEGMENT * 0.2,
        startDecrease: DUR_SEGMENT * 1.7,   
        maxRadius: 0.2
    },
    {
        id: "earthTexture",
        file: 'public/assets/textures/rodinia_unpix.png',
        entry: { at: DUR_SEGMENT * 1.4 },
        exit: { at: 0.96 }
    },
    {
        id: "atmPaleBlueDot1",  // matches the name in ObjectFactory
        entry: { at: DUR_SEGMENT * 2 + DUR_TRANS },
        exit: { at: DUR_SEGMENT * 2 + DUR_TRANS * 2 },
        color: 0xf4a261,  // or whatever color we want
        entryOpacity: 0,
        exitOpacity: 0.8
    },
    {
        id: "atmPaleBlueDot2",  // matches the name in ObjectFactory
        entry: { at: DUR_SEGMENT * 2 + DUR_TRANS * 2},
        exit: { at: DUR_SEGMENT * 3 - DUR_TRANS * 2},
        color: 0xf4a261,  // or whatever color we want
        entryOpacity: 0.8,
        exitOpacity: 0.2
    },
    {
        id: "icePaleBlueDot",
        entry: { at: DUR_SEGMENT * 3 - DUR_TRANS * 2 },
        exit: { at: DUR_SEGMENT * 3 - DUR_TRANS },
        maxRadius: 0.6  // Maximum size of ice patches
    },

    {
        id: "shadowCylinder",
        entry: { at: DUR_SEGMENT * 3.1 + DUR_TRANS },
        exit:  { at: DUR_SEGMENT * 3.75}
    },
    {
        id: "iceGroup",
        entry: { at: DUR_SEGMENT * 3.5 },
        exit: { at: DUR_SEGMENT * 4 },
        maxRadius: 0.6  // Maximum size of ice patches
    },


    
    {
        id: "simAtmosphereHotNonlinear",
        entry: { at: 0.90 },
        exit: { at: 0.96 }
    },
    // {
    //     id: "earthTexture",
    //     file: 'public/assets/textures/earth_noClouds.0330.jpg',
    //     entry: { at: 0.0 },
    //     exit: { at: 0.3 }
    // },
    // {
    //     id: "earthTexture",
    //     file: 'public/assets/textures/rodinia_unpix.png',
    //     entry: { at: 0.254 },
    //     exit: { at: 0.96 }
    // },
    // {
    //     id: "earthTexture",
    //     file: 'public/assets/textures/earth_noClouds.0330.jpg',
    //     entry: { at: 0.4 },
    //     exit: { at: 0.6 }    
    // },

    // {
    //     id: "iceGroup",
    //     entry: { at: 0.55 },
    //     exit: { at: 0.65 },
    //     maxRadius: 0.9  // Maximum size of ice patches
    // },
    {
        id: "simIceGroup",
        entry: { at: SIM_SEGMENT_START_AT },
        exit: { at: SIM_SEGMENT_END_AT },
        maxRadius: 0.2  // Maximum size of ice patches
    },
    // {
    //     id: "background-1",
    //     type: "background",
    //     file: "public/assets/backgrounds/milkyway01.jpg",
    //     entry: { at: 0.0 },
    //     exit: { at: 0.5 }
    // },
    {
        id: "background-2",
        type: "background",
        file: "public/assets/backgrounds/pbd.webp",
        entry: { at: 0 },
        exit: { at: 1 }
    }
];

// Override positions
const textConfigOverrides = {
    'segment-16': {
        position: { x: SEGMENT_X, y: SEGMENT_Y-25},  
    }
};

// Debug: log the content we're working with
// console.log('Scene content:', sceneContent);

// Get all header numbers in sequence
const headerNumbers = Object.keys(sceneContent)
    .filter(key => key.startsWith('header-'))
    .map(key => parseInt(key.split('-')[1]))
    .sort((a, b) => a - b);

// Create map of header number to next header number
const nextHeaderMap = {};
headerNumbers.forEach((num, index) => {
    nextHeaderMap[num] = index < headerNumbers.length - 1 ? 
        headerNumbers[index + 1] : 
        NUM_SEGMENTS; // For last header, use total segments
});


// Only add timing to numbered header and segment text objects
const textConfigObjects = Object.entries(sceneContent)
    .filter(([id]) => id.startsWith('header-') || id.startsWith('segment-'))
    .map(([id, content]) => {
        const segmentNum = parseInt(id.split('-')[1]);
        const type = id === 'header-0' ? 'intro-header' : 
                  id === 'segment-0' ? 'intro-segment' :
                  id.startsWith('header') ? 'header' : 'segment';
        
        // Set position based on type
        let position;
        if (type === 'intro-header') {
            position = { x: INTRO_HEAD_X, y: INTRO_HEAD_Y };
        } else if (type === 'intro-segment') {
            position = { x: INTRO_SEGMENT_X, y: INTRO_SEGMENT_Y };
        } else if (type === 'header') {
            position = { x: HEAD_X, y: HEAD_Y };
        } else {
            position = { x: SEGMENT_X, y: SEGMENT_Y };
        }

        // Calculate exit time based on type
        const exitAt = id.startsWith('header-') ? 
            DUR_SEGMENT * nextHeaderMap[segmentNum] : // For headers, exit at next header
            DUR_SEGMENT * (segmentNum + 1);          // For segments, exit after duration

        return {
            id,
            type,
            initiallyVisible: segmentNum === 0,
            position,
            content: content || '',
            transition: {
                entry_from: { at: DUR_SEGMENT * segmentNum },
                exit_to: { at: exitAt }
            }
        };
    });

// Apply overrides
const finalTextConfigObjects = textConfigObjects.map(obj => {
    if (textConfigOverrides[obj.id]) {
        return { ...obj, ...textConfigOverrides[obj.id] };
    }
    return obj;
});

// Combine arrays, keeping original objects unchanged
export const globalConfig = [...configObjects, ...finalTextConfigObjects];

// Debug: log the final arrays
// console.log('Config objects:', configObjects);
// console.log('Text config objects:', textConfigObjects);
// Debug: log the final config
// console.log('Final global config:', globalConfig);



