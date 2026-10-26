/**
 * PATRIX - Gestion de la Grille
 * ID: E-manuel-grid
 * Auteur: Emmanuel Payet
 */

class GameGrid {
    constructor() {
        if (typeof CONFIG === 'undefined') {
            console.error('ERREUR CRITIQUE: CONFIG n\'est pas défini! Vérifiez que config.js est chargé avant grid.js');
            throw new Error('CONFIG is not defined. Make sure config.js is loaded before grid.js');
        }
        // Remplir la largeur avec des cases adaptées à la hauteur disponible.
        const header = document.querySelector('.mechanical-display');
        const usableHeight = Math.max(100, window.innerHeight - (header?.getBoundingClientRect().height || 180) - 90);
        const cell = Math.max(6, Math.min(CONFIG.GRID.CELL_SIZE, Math.floor(usableHeight / CONFIG.GRID.ROWS) - CONFIG.GRID.GAP));
        CONFIG.GRID.COLS = Math.max(6, Math.floor((document.documentElement.clientWidth - 32) / (cell + CONFIG.GRID.GAP)));
        this.cols = CONFIG.GRID.COLS;
        this.rows = CONFIG.GRID.ROWS;
        this.cells = [];
        this.boardElement = null;
        
        // Cache pour performance
        this.cellElementsCache = null;
        this.lastRenderState = null; // Pour éviter re-render inutile
        
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
        this.gridElement.style.gridTemplateColumns = "repeat(" + this.cols + ", 1fr)";
        
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
        
        // Construire le cache de cellules
        this.buildCellCache();
        
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
        
        this.connectionCanvas.width = Math.round(rect.width);
        this.connectionCanvas.height = Math.round(rect.height);
        this.connectionCanvas.style.width = '100%';
        this.connectionCanvas.style.height = '100%';
    }
    
    /**
     * Construit le cache des cellules DOM
     */
    buildCellCache() {
        if (!this.gridElement) return;
        this.cellElementsCache = this.gridElement.querySelectorAll('.cell');
    }

    /**
     * Trouve un groupe de cellules connectées du même type
     * @param {number} row - Ligne de départ
     * @param {number} col - Colonne de départ
     * @returns {Array} Liste des cellules du groupe {row, col}
     */
    samePopColor(a, b) {
        return !!a && !!b && (a.color || a.type) === (b.color || b.type);
    }

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
            if (!currentCell || !this.samePopColor(currentCell, cell)) return;
            
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
        if (!Array.isArray(path) || path.length < 2) return false;
        const selected = new Set();
        let type;
        for (const pos of path) {
            if (!pos || !Number.isInteger(pos.row) || !Number.isInteger(pos.col)) return false;
            const {row, col} = pos;
            if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) return false;
            const cell = this.cells[row][col];
            const key = `${row},${col}`;
            if (!cell || selected.has(key)) return false;
            if (selected.size && !this.samePopColor(cell, this.cells[path[0].row][path[0].col])) return false;
            type = cell.type;
            selected.add(key);
        }
        // Un groupe peut se ramifier : toutes ses cases doivent rester reliées.
        const pending = [path[0]], visited = new Set();
        while (pending.length) {
            const {row, col} = pending.pop(), key = `${row},${col}`;
            if (visited.has(key) || !selected.has(key)) continue;
            visited.add(key);
            pending.push({row:row-1,col},{row:row+1,col},{row,col:col-1},{row,col:col+1});
        }
        return visited.size === selected.size;
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
                    
                    // Vérifie les limites (autoriser rotation au-dessus de la grille)
                    if (newX < 0 || newX >= this.cols || newY >= this.rows) {
                        return false;
                    }
                    
                    // Vérifie les collisions seulement si dans la grille
                    if (newY >= 0 && this.cells[newY][newX]) {
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
            
            this.render();
        }, 300);
    }

    /**
     * Rend la grille dans le DOM (optimisé avec cache)
     * @param {Object} currentPiece - Pièce en cours (optionnel)
     */
    render(currentPiece = null) {
        if (!this.gridElement) return;
        if (!this.cellElementsCache?.length) this.buildCellCache();
        const falling = new Map();
        for (const piece of this.getFallingPieces?.() || (currentPiece ? [currentPiece] : [])) {
            for (let r=0;r<piece.shape.length;r++) for(let c=0;c<piece.shape[r].length;c++) {
                if(piece.shape[r][c]) falling.set((piece.y+r)*this.cols+piece.x+c,piece);
            }
        }
        this.cellElementsCache.forEach((element,index)=>{
            const row=Math.floor(index/this.cols),col=index%this.cols;
            const piece=falling.get(index),settled=this.cells[row][col],value=piece||settled;
            const selected=!!piece&&piece===this.selectedPiece;
            // Dès deux cases reliées, le tracé manuel peut créer un pop.
            const poppable=!piece&&!!settled&&[[row-1,col],[row+1,col],[row,col-1],[row,col+1]].some(([r,c])=>this.samePopColor(settled,this.cells[r]?.[c]));
            const transformed=!piece&&!!settled?.isTransformed;
            const signature=value?`${piece?'p':'s'}|${value.type}|${value.color}|${value.icon}|${selected}|${transformed}|${poppable}`:'empty';
            if(element._renderSignature===signature)return;
            element._renderSignature=signature;
            // Garder le tracé manuel, indépendant de l'état des blocs.
            const traced=element.classList.contains('traced');
            element.className='cell'+(value?` filled ${value.type}`:'')+(piece?' current-piece':'')+(selected?' selected-piece':'')+(transformed?' transforming':'')+(poppable?' poppable':'')+(traced?' traced':'');
            element.textContent=value?.icon||'';
            const color=value?(CONFIG.COLORS[transformed?'LIGHT':'SHADOW'][value.color]||''):'';
            element.style.borderColor=color;element.style.color=color;
            element.style.boxShadow=transformed?`0 0 20px ${CONFIG.COLORS.GLOW}`:'';
            element.dataset.popColor=value?(CONFIG.COLORS.LIGHT[value.color]||'#ffd700'):'';
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






