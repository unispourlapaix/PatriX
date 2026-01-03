/**
 * PATRIX - Formes de Blocs Personnalisées
 * ID: E-manuel-blocks
 * Auteur: Emmanuel Payet
 * IMPORTANT: Formes de 5-6 blocs (PAS les 4-blocs Tetrominos pour rester légal)
 */

const BLOCKS = {
    // Croix simple (5 blocs) - Symbole principal ✝️
    CROSS: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0]
        ],
        icon: '✝️',
        type: 'cross',
        color: 'CROSS'
    },

    // Croix élargie (6 blocs) - Symbole de paix ☮️
    TCROSS: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [0, 1, 0],
            [0, 1, 0]
        ],
        icon: '☮️',
        type: 'tcross',
        color: 'TCROSS'
    },

    // Cœur (6 blocs) - Amour et courage ❤️
    HEART: {
        shape: [
            [1, 0, 1],
            [1, 1, 1],
            [0, 1, 0]
        ],
        icon: '❤️',
        type: 'heart',
        color: 'HEART'
    },

    // Étoile (6 blocs) - Espérance ⭐
    STAR: {
        shape: [
            [0, 1, 0],
            [1, 1, 1],
            [1, 0, 1]
        ],
        icon: '⭐',
        type: 'star',
        color: 'STAR'
    },

    // Ancre (5 blocs) - Foi ⚓
    ANCHOR: {
        shape: [
            [0, 1, 0],
            [0, 1, 0],
            [1, 1, 1]
        ],
        icon: '⚓',
        type: 'anchor',
        color: 'ANCHOR'
    },

    // L de Lumière (5 blocs) 💡
    LLIGHT: {
        shape: [
            [1, 0, 0],
            [1, 0, 0],
            [1, 1, 1]
        ],
        icon: '💡',
        type: 'llight',
        color: 'LLIGHT'
    },

    // Pilier (5 blocs) - Force 🏛️
    PILLAR: {
        shape: [
            [1],
            [1],
            [1],
            [1],
            [1]
        ],
        icon: '🏛️',
        type: 'pillar',
        color: 'PILLAR'
    }
};

/**
 * Crée une pièce aléatoire
 * @returns {Object} Nouvelle pièce avec position initiale
 */
function createRandomPiece() {
    const types = Object.keys(BLOCKS);
    const randomType = types[Math.floor(Math.random() * types.length)];
    const block = BLOCKS[randomType];
    
    return {
        shape: JSON.parse(JSON.stringify(block.shape)), // Copie profonde
        icon: block.icon,
        type: block.type,
        color: block.color,
        x: Math.floor((CONFIG.GRID.COLS - block.shape[0].length) / 2),
        y: 0,
        isTransformed: false  // Pour la mécanique ombre → lumière
    };
}

/**
 * Fait pivoter une forme de 90° dans le sens horaire
 * @param {Array} shape - Forme à pivoter
 * @returns {Array} Forme pivotée
 */
function rotateShape(shape) {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotated = [];
    
    for (let col = 0; col < cols; col++) {
        rotated[col] = [];
        for (let row = rows - 1; row >= 0; row--) {
            rotated[col][rows - 1 - row] = shape[row][col];
        }
    }
    
    return rotated;
}

/**
 * Applique un miroir horizontal à une forme
 * @param {Array} shape - Forme à refléter
 * @returns {Array} Forme reflétée
 */
function mirrorShape(shape) {
    return shape.map(row => [...row].reverse());
}

// Rendre disponible globalement
window.BLOCKS = BLOCKS;
window.createRandomPiece = createRandomPiece;
window.rotateShape = rotateShape;
window.mirrorShape = mirrorShape;

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { BLOCKS, createRandomPiece, rotateShape, mirrorShape };
}
