/**
 * PATRIX - Gestion de la Grille
 * ID: E-manuel-grid
 * Auteur: Emmanuel Payet
 */

class GameGrid {
    constructor() {
        this.cols = CONFIG.GRID.COLS;
        this.rows = CONFIG.GRID.ROWS;
        this.cells = [];
        this.boardElement = null;
        this.init();
    }

    /**
     * Initialise la grille vide
     */
    init() {
        this.cells = [];
        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.cols; col++) {
                this.cells[row][col] = null;
            }
        }
    }

    /**
     * Crée les éléments DOM de la grille
     * @param {HTMLElement} container - Conteneur parent
     */
    createDOM(container) {
        this.boardElement = document.createElement('div');
        this.boardElement.className = 'board';
        this.boardElement.id = 'gameBoard';
        
        // Créer la grille interne pour les cellules
        this.gridElement = document.createElement('div');
        this.gridElement.className = 'board-grid';
        
        // Canvas pour tracer la ligne de connexion
        this.connectionCanvas = document.createElement('canvas');
        this.connectionCanvas.className = 'connection-canvas';
        this.connectionCanvas.id = 'connectionCanvas';
        
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = row;
                cell.dataset.col = col;
                this.gridElement.appendChild(cell);
            }
        }
        
        // Ajouter le canvas dans la grille
        this.gridElement.appendChild(this.connectionCanvas);
        
        // Ajouter la grille dans le board
        this.boardElement.appendChild(this.gridElement);
        
        // Ajouter le board au container
        container.appendChild(this.boardElement);
        
        // Initialiser le canvas après que tout soit rendu
        setTimeout(() => this.resizeCanvas(), 100);
        window.addEventListener('resize', () => {
            setTimeout(() => this.resizeCanvas(), 50);
        });
    }

    /**
     * Redimensionne le canvas pour qu'il corresponde exactement à la grille
     */
    resizeCanvas() {
        if (!this.gridElement || !this.connectionCanvas) return;
        
        // Le canvas est dans board-grid, dimensions exactes de la zone de jeu
        const rect = this.gridElement.getBoundingClientRect();
        
        this.connectionCanvas.width = rect.width;
        this.connectionCanvas.height = rect.height;
        this.connectionCanvas.style.width = '100%';
        this.connectionCanvas.style.height = '100%';
    }

    /**
     * Trouve un groupe de cellules connectées du même type
     * @param {number} row - Ligne de départ
     * @param {number} col - Colonne de départ
     * @returns {Array} Liste des cellules du groupe {row, col}
     */
    findConnectedGroup(row, col) {
        const cell = this.cells[row][col];
        if (!cell) return [];
        
        const type = cell.type;
        const visited = new Set();
        const group = [];
        
        const explore = (r, c) => {
            const key = `${r},${c}`;
            if (visited.has(key)) return;
            
            // Vérifier limites
            if (r < 0 || r >= this.rows || c < 0 || c >= this.cols) return;
            
            const currentCell = this.cells[r][c];
            if (!currentCell || currentCell.type !== type) return;
            
            visited.add(key);
            group.push({ row: r, col: c });
            
            // Explorer les 4 directions (haut, bas, gauche, droite)
            explore(r - 1, c);
            explore(r + 1, c);
            explore(r, c - 1);
            explore(r, c + 1);
        };
        
        explore(row, col);
        return group;
    }

    /**
     * Vérifie si un chemin tracé est valide
     * @param {Array} path - Chemin de cellules [{row, col}]
     * @returns {boolean} true si le chemin est valide
     */
    isValidPath(path) {
        if (path.length < 4) return false;
        
        // Vérifier que toutes les cellules sont du même type
        const firstCell = this.cells[path[0].row][path[0].col];
        if (!firstCell) return false;
        
        const type = firstCell.type;
        
        for (const {row, col} of path) {
            const cell = this.cells[row][col];
            if (!cell || cell.type !== type) return false;
        }
        
        // Vérifier que chaque cellule est adjacente à la suivante
        for (let i = 1; i < path.length; i++) {
            const prev = path[i - 1];
            const curr = path[i];
            const distance = Math.abs(prev.row - curr.row) + Math.abs(prev.col - curr.col);
            if (distance !== 1) return false;
        }
        
        return true;
    }

    /**
     * Supprime un groupe de cellules
     * @param {Array} group - Liste des cellules à supprimer
     */
    removeGroup(group) {
        for (const { row, col } of group) {
            this.cells[row][col] = null;
        }
    }

    /**
     * Vérifie si une position est valide
     * @param {Object} piece - Pièce à vérifier
     * @param {number} x - Position X
     * @param {number} y - Position Y
     * @param {Array} shape - Forme optionnelle (pour rotation)
     * @returns {boolean} true si valide
     */
    isValidMove(piece, x, y, shape = null) {
        const currentShape = shape || piece.shape;
        
        for (let row = 0; row < currentShape.length; row++) {
            for (let col = 0; col < currentShape[row].length; col++) {
                if (currentShape[row][col]) {
                    const newX = x + col;
                    const newY = y + row;
                    
                    // Vérifie les limites (FIXÉ: newY < 0 aussi vérifié maintenant)
                    if (newX < 0 || newX >= this.cols || newY < 0 || newY >= this.rows) {
                        return false;
                    }
                    
                    // Vérifie les collisions
                    if (this.cells[newY][newX]) {
                        return false;
                    }
                }
            }
        }
        
        return true;
    }

    /**
     * Place une pièce dans la grille
     * @param {Object} piece - Pièce à placer
     */
    placePiece(piece) {
        for (let row = 0; row < piece.shape.length; row++) {
            for (let col = 0; col < piece.shape[row].length; col++) {
                if (piece.shape[row][col]) {
                    const y = piece.y + row;
                    const x = piece.x + col;
                    
                    if (y >= 0) {
                        this.cells[y][x] = {
                            type: piece.type,
                            icon: piece.icon,
                            color: piece.color,
                            isTransformed: false  // Sera transformé lors de l'effacement
                        };
                    }
                }
            }
        }
    }

    /**
     * Vérifie et efface les lignes complètes
     * @returns {Array} Indices des lignes effacées
     */
    clearLines() {
        const linesCleared = [];
        
        for (let row = this.rows - 1; row >= 0; row--) {
            if (this.cells[row].every(cell => cell !== null)) {
                linesCleared.push(row);
            }
        }
        
        return linesCleared;
    }

    /**
     * Effectue l'effacement des lignes avec transformation
     * @param {Array} lines - Lignes à effacer
     */
    removeLinesWithTransform(lines) {
        if (!lines || lines.length === 0) return;
        
        // Transformation ombre → lumière avant effacement
        lines.forEach(row => {
            if (this.cells[row]) {
                this.cells[row].forEach(cell => {
                    if (cell) cell.isTransformed = true;
                });
            }
        });
        
        // Mise à jour visuelle
        this.render();
        
        // Effacement après animation
        setTimeout(() => {
            // Trier en ordre décroissant pour éviter les problèmes d'index
            const sortedLines = [...lines].sort((a, b) => b - a);
            
            // Supprimer les lignes de haut en bas
            sortedLines.forEach(lineIndex => {
                if (lineIndex >= 0 && lineIndex < this.rows) {
                    this.cells.splice(lineIndex, 1);
                }
            });
            
            // Ajouter des lignes vides en haut
            while (this.cells.length < this.rows) {
                this.cells.unshift(new Array(this.cols).fill(null));
            }
            
            // Mise à jour visuelle après effacement
            this.render();
        }, CONFIG.TIMING.ANIMATION_DURATION);
    }

    /**
     * Rend la grille dans le DOM
     * @param {Object} currentPiece - Pièce en cours (optionnel)
     */
    render(currentPiece = null) {
        if (!this.gridElement) {
            console.error('[Grid] gridElement non défini, impossible de render');
            return;
        }
        
        const cells = this.gridElement.querySelectorAll('.cell');
        
        if (cells.length === 0) {
            console.error('[Grid] Aucune cellule trouvée dans gridElement');
            return;
        }
        
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const gridCell = this.cells[row][col];
            
            // Reset
            cell.className = 'cell';
            cell.textContent = '';
            
            // Cellule de la grille
            if (gridCell) {
                const colorKey = gridCell.isTransformed ? 'LIGHT' : 'SHADOW';
                cell.classList.add('filled', gridCell.type);
                cell.textContent = gridCell.icon;
                cell.style.borderColor = CONFIG.COLORS[colorKey][gridCell.color];
                cell.style.color = CONFIG.COLORS[colorKey][gridCell.color];
                
                if (gridCell.isTransformed) {
                    cell.classList.add('transforming');
                    cell.style.boxShadow = `0 0 20px ${CONFIG.COLORS.GLOW}`;
                }
                
                // Vérifier si cette cellule fait partie d'un groupe poppable
                const group = this.findConnectedGroup(row, col);
                if (group.length >= 4) {
                    cell.classList.add('poppable');
                }
            }
            
            // Pièce en cours
            if (currentPiece) {
                for (let r = 0; r < currentPiece.shape.length; r++) {
                    for (let c = 0; c < currentPiece.shape[r].length; c++) {
                        if (currentPiece.shape[r][c]) {
                            const pieceRow = currentPiece.y + r;
                            const pieceCol = currentPiece.x + c;
                            
                            if (pieceRow === row && pieceCol === col && pieceRow >= 0) {
                                cell.classList.add('filled', 'current-piece', currentPiece.type);
                                cell.textContent = currentPiece.icon;
                                const colorKey = 'SHADOW';
                                cell.style.borderColor = CONFIG.COLORS[colorKey][currentPiece.color];
                                cell.style.color = CONFIG.COLORS[colorKey][currentPiece.color];
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * Reset la grille
     */
    reset() {
        this.init();
        if (this.boardElement && this.gridElement) {
            this.render();
        }
    }
}

// Rendre disponible globalement
window.GameGrid = GameGrid;

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameGrid;
}
