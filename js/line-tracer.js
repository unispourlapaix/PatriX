/**
 * PATRIX - Gestionnaire de Tracé de Ligne
 * ID: E-manuel-line-tracer
 * Auteur: Emmanuel Payet
 */

class LineTracer {
    constructor(grid, boardElement) {
        this.grid = grid;
        this.boardElement = boardElement;
        this.canvas = document.getElementById('connectionCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        
        this.isDrawing = false;
        this.path = [];
        this.currentPos = null;
        this.onPathComplete = null;
        
        this.init();
    }

    /**
     * Initialise les événements
     */
    init() {
        if (!this.boardElement) return;

        // Initialiser les dimensions du canvas
        if (this.canvas) {
            this.resizeCanvas();
            window.addEventListener('resize', () => this.resizeCanvas());
        }

        // Événements souris
        this.boardElement.addEventListener('mousedown', (e) => this.handleStart(e));
        document.addEventListener('mousemove', (e) => this.handleMove(e));
        document.addEventListener('mouseup', (e) => this.handleEnd(e));

        // Événements tactiles
        this.boardElement.addEventListener('touchstart', (e) => this.handleStart(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.handleMove(e), { passive: false });
        document.addEventListener('touchend', (e) => this.handleEnd(e));
    }

    /**
     * Démarre le tracé
     */
    handleStart(e) {
        // Ignorer si le clic est sur la zone mécanique (NEXT, etc.)
        if (e.target.closest('.mechanical-display')) {
            return;
        }
        
        const cell = this.getCellFromEvent(e);
        if (!cell) return;

        const { row, col } = cell;
        const gridCell = this.grid.cells[row][col];
        
        // Ne commencer QUE sur une cellule remplie (pour éviter conflit avec contrôles)
        if (!gridCell) {
            // Pas de cellule remplie = laisser passer pour les contrôles
            return;
        }

        e.preventDefault();
        this.isDrawing = true;
        this.path = [{ row, col }];
        
        // Stocker la position en coordonnées écran
        const pos = this.getEventPosition(e);
        if (pos) {
            this.currentPos = pos;
        }
        
        this.drawPath();
    }

    /**
     * Continue le tracé
     */
    handleMove(e) {
        if (!this.isDrawing) return; // Ne traiter que si on a commencé un tracé

        const cell = this.getCellFromEvent(e);
        if (cell) {
            const { row, col } = cell;
            const lastCell = this.path[this.path.length - 1];

            // Vérifier si c'est une nouvelle cellule
            if (row !== lastCell.row || col !== lastCell.col) {
                const gridCell = this.grid.cells[row][col];
                
                // Vérifier si c'est du même type que le premier
                const firstCell = this.grid.cells[this.path[0].row][this.path[0].col];
                
                if (gridCell && gridCell.type === firstCell.type) {
                    // Vérifier si adjacent
                    const distance = Math.abs(row - lastCell.row) + Math.abs(col - lastCell.col);
                    if (distance === 1) {
                        // Vérifier si on revient en arrière
                        if (this.path.length > 1) {
                            const prevCell = this.path[this.path.length - 2];
                            if (row === prevCell.row && col === prevCell.col) {
                                // Retour en arrière : supprimer la dernière cellule
                                this.path.pop();
                            } else if (!this.isInPath(row, col)) {
                                // Nouvelle cellule
                                this.path.push({ row, col });
                            }
                        } else {
                            // Deuxième cellule
                            this.path.push({ row, col });
                        }
                        
                        this.highlightPath();
                    }
                }
            }
        }

        // Mettre à jour la position de la souris/doigt
        const pos = this.getEventPosition(e);
        if (pos) {
            this.currentPos = pos;
            this.drawPath();
        }
    }

    /**
     * Termine le tracé
     */
    handleEnd(e) {
        if (!this.isDrawing) return;
        
        this.isDrawing = false;
        this.currentPos = null;

        // Valider le chemin
        if (this.path.length >= 4 && this.grid.isValidPath(this.path)) {
            if (this.onPathComplete) {
                this.onPathComplete(this.path);
            }
        }

        // Réinitialiser
        this.path = [];
        this.clearCanvas();
        this.clearHighlight();
    }

    /**
     * Vérifie si une cellule est déjà dans le chemin
     */
    isInPath(row, col) {
        return this.path.some(cell => cell.row === row && cell.col === col);
    }

    /**
     * Obtient la cellule à partir d'un événement
     */
    getCellFromEvent(e) {
        const pos = this.getEventPosition(e);
        if (!pos) return null;

        const cells = this.boardElement.querySelectorAll('.cell');
        for (const cell of cells) {
            const rect = cell.getBoundingClientRect();
            if (pos.x >= rect.left && pos.x <= rect.right &&
                pos.y >= rect.top && pos.y <= rect.bottom) {
                return {
                    row: parseInt(cell.dataset.row),
                    col: parseInt(cell.dataset.col)
                };
            }
        }
        return null;
    }

    /**
     * Obtient la position d'un événement
     */
    getEventPosition(e) {
        if (e.touches && e.touches.length > 0) {
            return { x: e.touches[0].clientX, y: e.touches[0].clientY };
        }
        if (e.clientX !== undefined) {
            return { x: e.clientX, y: e.clientY };
        }
        return null;
    }

    /**
     * Dessine le chemin sur le canvas
     */
    drawPath() {
        if (!this.ctx || this.path.length === 0) return;

        const gridElement = this.boardElement.querySelector('.board-grid');
        if (!gridElement) return;
        
        // Recalculer les dimensions du canvas à chaque dessin
        const gridRect = gridElement.getBoundingClientRect();
        const canvasRect = this.canvas.getBoundingClientRect();
        
        // Redimensionner le canvas si nécessaire
        if (this.canvas.width !== canvasRect.width || this.canvas.height !== canvasRect.height) {
            this.canvas.width = canvasRect.width;
            this.canvas.height = canvasRect.height;
        }

        this.clearCanvas();

        // Style du tracé - blanc lumineux pour le nouveau thème
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.9)';
        this.ctx.shadowBlur = 20;

        this.ctx.beginPath();
        
        // Dessiner les segments entre les cellules
        for (let i = 0; i < this.path.length; i++) {
            const cell = this.path[i];
            const cellElement = gridElement.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
            if (!cellElement) continue;
            
            const cellRect = cellElement.getBoundingClientRect();
            // Position du centre de la cellule relative au canvas
            const posX = cellRect.left + cellRect.width / 2 - canvasRect.left;
            const posY = cellRect.top + cellRect.height / 2 - canvasRect.top;
            
            if (i === 0) {
                this.ctx.moveTo(posX, posY);
            } else {
                this.ctx.lineTo(posX, posY);
            }
        }

        // Ligne vers la position actuelle du curseur/doigt
        if (this.currentPos) {
            const adjustedX = this.currentPos.x - canvasRect.left;
            const adjustedY = this.currentPos.y - canvasRect.top;
            this.ctx.lineTo(adjustedX, adjustedY);
        }

        this.ctx.stroke();

        // Dessiner des points lumineux aux intersections
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        this.ctx.shadowBlur = 25;
        
        for (const cell of this.path) {
            const cellElement = gridElement.querySelector(`[data-row="${cell.row}"][data-col="${cell.col}"]`);
            if (!cellElement) continue;
            
            const cellRect = cellElement.getBoundingClientRect();
            const posX = cellRect.left + cellRect.width / 2 - canvasRect.left;
            const posY = cellRect.top + cellRect.height / 2 - canvasRect.top;
            
            this.ctx.beginPath();
            this.ctx.arc(posX, posY, 10, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    /**
     * Efface le canvas
     */
    clearCanvas() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Surligne les cellules du chemin
     */
    highlightPath() {
        this.clearHighlight();
        for (const { row, col } of this.path) {
            const cell = this.boardElement.querySelector(`[data-row="${row}"][data-col="${col}"]`);
            if (cell) {
                cell.classList.add('traced');
            }
        }
    }

    /**
     * Retire le surlignage
     */
    clearHighlight() {
        const cells = this.boardElement.querySelectorAll('.cell.traced');
        cells.forEach(cell => cell.classList.remove('traced'));
    }

    /**
     * Redimensionne le canvas (simplifié car géré dans drawPath)
     */
    resizeCanvas() {
        if (!this.canvas || !this.boardElement) return;
        
        // Le canvas se redimensionne automatiquement dans drawPath
        // Cette fonction existe juste pour la compatibilité
    }
}

// Rendre disponible globalement
window.LineTracer = LineTracer;

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LineTracer;
}
