/**
 * PATRIX - Moteur de Jeu Principal
 * ID: E-manuel-engine
 * Auteur: Emmanuel Payet
 */

class GameEngine {
    constructor() {
        this.grid = new GameGrid();
        this.currentPiece = null;
        this.nextPiece = null;
        this.score = 0;
        this.lines = 0;
        this.combo = 0;
        this.level = 0;
        this.isRunning = false;
        this.isPaused = false;
        this.isLevelingUp = false;
        this.dropTimer = 0;
        this.dropInterval = CONFIG.TIMING.INITIAL_DROP_SPEED;
        this.comboTimer = null;
        this.listeners = {};
        
        // Wall explosion mechanic
        this.lastPushDirection = 0;
        this.pushCount = 0;
        this.pushResetTimer = null;
        
        // Pop combo system
        this.popCombo = 0;
        this.popComboTimer = null;
        this.lastPopTime = 0;
        this.popPoints = 0; // Points de pop accumulés
        this.swapCount = 0; // Nombre de swaps disponibles
        this.maxSwaps = 3;
        this.wallBreakCharges = 0; // Charges pour casser les murs
        this.maxWallBreakCharges = 3;
    }

    /**
     * Démarre le jeu
     */
    start() {
        this.reset();
        this.isRunning = true;
        this.nextPiece = createRandomPiece();
        this.spawnPiece();
        this.emit('start');
    }

    /**
     * Reset le jeu
     */
    reset() {
        this.grid.reset();
        this.score = 0;
        this.lines = 0;
        this.combo = 0;
        this.level = 0;
        this.dropTimer = 0;
        this.dropInterval = CONFIG.TIMING.INITIAL_DROP_SPEED;
        this.currentPiece = null;
        this.nextPiece = null;
        
        // Réinitialiser les bonus au début (3 swaps et 3 wall breaks)
        this.swapCount = 3;
        this.wallBreakCharges = 3;
        this.popPoints = 0;
        this.popCombo = 0;
        this.lastPopTime = 0;
        
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
            this.comboTimer = null;
        }
        
        this.emit('reset');
    }

    /**
     * Fait apparaître une nouvelle pièce
     */
    spawnPiece() {
        this.currentPiece = this.nextPiece || createRandomPiece();
        this.nextPiece = createRandomPiece();
        
        // Game Over si la pièce ne peut pas apparaître
        if (!this.grid.isValidMove(this.currentPiece, this.currentPiece.x, this.currentPiece.y)) {
            this.gameOver();
            return;
        }
        
        this.emit('spawn', { current: this.currentPiece, next: this.nextPiece });
    }

    /**
     * Wind Push - Pousse la pièce vers le bas jusqu'à collision et explose les premières cases touchées
     */
    windPush() {
        if (!this.currentPiece || !this.isRunning || this.isPaused) return false;
        
        let movedSteps = 0;
        const maxSteps = 5; // Maximum 5 cases
        
        // Descendre jusqu'à collision (max 5 cases)
        while (movedSteps < maxSteps) {
            if (this.grid.isValidMove(this.currentPiece, this.currentPiece.x, this.currentPiece.y + 1)) {
                this.currentPiece.y++;
                movedSteps++;
            } else {
                break; // Collision détectée
            }
        }
        
        // Si on a bougé et qu'on est en collision maintenant
        if (movedSteps > 0) {
            // Chercher les cases de la grille qui seraient touchées par la pièce si elle descendait d'une case de plus
            const cellsToExplode = [];
            const shape = this.currentPiece.shape;
            
            for (let row = 0; row < shape.length; row++) {
                for (let col = 0; col < shape[row].length; col++) {
                    if (shape[row][col]) {
                        const gridRow = this.currentPiece.y + row + 1; // Une case en dessous
                        const gridCol = this.currentPiece.x + col;
                        
                        // Vérifier si cette case contient un bloc
                        if (gridRow >= 0 && gridRow < CONFIG.GRID.ROWS && 
                            gridCol >= 0 && gridCol < CONFIG.GRID.COLS &&
                            this.grid.cells[gridRow][gridCol]) {
                            cellsToExplode.push({ row: gridRow, col: gridCol });
                        }
                    }
                }
            }
            
            // Exploser les cases touchées
            if (cellsToExplode.length > 0) {
                cellsToExplode.forEach(cell => {
                    this.grid.cells[cell.row][cell.col] = null;
                });
                
                this.emit('windExplosion', { 
                    cells: cellsToExplode,
                    moved: movedSteps
                });
                
                // Appliquer la gravité
                setTimeout(() => {
                    this.applyGravity();
                    this.emit('render');
                }, 300);
            }
        }
        
        this.emit('windPushed', { moved: movedSteps });
        return movedSteps > 0;
    }

    /**
     * Change la pièce next (clic sur next-grid)
     */
    changeNextPiece() {
        if (this.swapCount <= 0 || !this.isRunning || this.isPaused) return false;
        
        this.swapCount--;
        this.nextPiece = createRandomPiece();
        
        this.emit('nextSwapped', { 
            next: this.nextPiece, 
            remaining: this.swapCount
        });
        
        return true;
    }

    /**
     * Swap bas - Fait descendre la pièce de 2 cases (ou moins si obstacle)
     */
    swapNextPiece() {
        if (this.swapCount <= 0 || !this.currentPiece || !this.isRunning || this.isPaused) return false;
        
        this.swapCount--;
        
        // Descendre de 2 cases (ou le maximum possible)
        let moved = 0;
        for (let i = 0; i < 2; i++) {
            if (this.grid.isValidMove(this.currentPiece, this.currentPiece.x, this.currentPiece.y + 1)) {
                this.currentPiece.y++;
                moved++;
            } else {
                break; // Arrêter si obstacle
            }
        }
        
        // Émettre l'événement même si on n'a pas pu descendre (pour décrémenter le compteur)
        this.emit('nextSwapped', { 
            next: this.nextPiece, 
            remaining: this.swapCount,
            moved: moved
        });
        
        return moved > 0;
    }

    /**
     * Déplace la pièce
     * @param {number} dx - Déplacement horizontal
     * @param {number} dy - Déplacement vertical
     * @returns {boolean} true si le déplacement a réussi
     */
    move(dx, dy) {
        if (!this.currentPiece || !this.isRunning || this.isPaused) return false;
        
        const newX = this.currentPiece.x + dx;
        const newY = this.currentPiece.y + dy;
        
        if (this.grid.isValidMove(this.currentPiece, newX, newY)) {
            this.currentPiece.x = newX;
            this.currentPiece.y = newY;
            
            // Son de mouvement (seulement horizontal)
            if (dx !== 0 && audioManager) audioManager.playMove();
            
            // Reset push counter on successful move
            this.pushCount = 0;
            
            // Score pour soft drop
            if (dy > 0) {
                this.score += CONFIG.SCORING.SOFT_DROP;
                this.emit('score', this.score);
            }
            
            this.emit('move', { piece: this.currentPiece });
            return true;
        }
        
        // Blocked movement - check for wall explosion
        if (dx !== 0) {
            // Son de collision avec le mur
            if (audioManager) audioManager.playWallHit();
            this.handleWallPush(dx);
        }
        
        return false;
    }

    /**
     * Gère les poussées contre un mur
     * @param {number} direction - Direction (-1 gauche, 1 droite)
     */
    handleWallPush(direction) {
        // Si même direction que la dernière poussée
        if (direction === this.lastPushDirection) {
            this.pushCount++;
            
            // Double push : explosion !
            if (this.pushCount >= 2) {
                // Vérifier si on a une charge de casse-mur
                if (this.wallBreakCharges > 0) {
                    this.wallBreakCharges--;
                    this.explodeWallColumn(direction);
                    this.emit('wallBreakUsed', { remaining: this.wallBreakCharges });
                }
                this.pushCount = 0;
                this.lastPushDirection = 0;
            }
        } else {
            // Nouvelle direction
            this.lastPushDirection = direction;
            this.pushCount = 1;
        }
        
        // Reset après 300ms
        if (this.pushResetTimer) clearTimeout(this.pushResetTimer);
        this.pushResetTimer = setTimeout(() => {
            this.pushCount = 0;
            this.lastPushDirection = 0;
        }, 300);
    }

    /**
     * Explose la colonne qui touche le mur
     * @param {number} direction - Direction du mur (-1 gauche, 1 droite)
     */
    explodeWallColumn(direction) {
        if (!this.currentPiece) return;
        
        const shape = this.currentPiece.shape;
        const newShape = [];
        
        // Trouver quelle colonne touche le mur
        let columnToRemove = direction === -1 ? 0 : shape[0].length - 1;
        
        // Créer nouvelle forme sans cette colonne
        for (let row = 0; row < shape.length; row++) {
            newShape[row] = [];
            for (let col = 0; col < shape[row].length; col++) {
                if (col !== columnToRemove) {
                    newShape[row].push(shape[row][col]);
                }
            }
        }
        
        // Nettoyer les lignes vides
        const cleanedShape = newShape.filter(row => row.some(cell => cell));
        
        // Si la pièce a encore des blocs
        if (cleanedShape.length > 0 && cleanedShape[0].length > 0) {
            // Ajuster position si on a supprimé colonne gauche
            if (direction === -1) {
                this.currentPiece.x += 1;
            }
            
            this.currentPiece.shape = cleanedShape;
            this.emit('wallExplosion', { direction, piece: this.currentPiece });
        } else {
            // Pièce complètement détruite, en créer une nouvelle
            this.placePiece();
        }
    }

    /**
     * Gère le tracé de ligne pour pop
     * @param {Array} path - Chemin tracé
     */
    handleLinePop(path) {
        if (!this.isRunning || this.isPaused) return;
        if (path.length < 4) return;
        
        this.popGroup(path);
    }

    /**
     * Fait exploser un groupe de cases
     * @param {Array} group - Groupe de cellules
     */
    popGroup(group) {
        const currentTime = Date.now();
        const timeSinceLastPop = currentTime - this.lastPopTime;
        
        // Incrémenter combo si pop rapide (< 2 secondes)
        if (timeSinceLastPop < 2000 && this.lastPopTime > 0) {
            this.popCombo++;
        } else {
            this.popCombo = 1;
        }
        
        this.lastPopTime = currentTime;
        
        // Calculer le score avec bonus de taille et combo
        const sizeBonus = group.length >= 8 ? 2 : (group.length >= 6 ? 1.5 : 1);
        const baseScore = group.length * 50 * sizeBonus;
        const comboMultiplier = this.popCombo > 1 ? this.popCombo * 0.5 : 1;
        const totalScore = Math.floor(baseScore * comboMultiplier);
        
        // Ajouter au score principal
        const previousLevel = this.level;
        this.score += totalScore;
        
        // Recalculer le niveau en fonction du nouveau score
        for (let i = CONFIG.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this.score >= CONFIG.LEVEL_THRESHOLDS[i]) {
                this.level = i;
                break;
            }
        }
        
        // Vitesse augmente avec le niveau
        this.dropInterval = Math.max(
            CONFIG.TIMING.MIN_DROP_SPEED,
            CONFIG.TIMING.INITIAL_DROP_SPEED - (this.level * 30)
        );
        
        // Effet visuel de nouveau niveau via pop
        if (this.level > previousLevel && this.level > 0) {
            // Pause temporaire pour l'animation de niveau
            const wasPaused = this.isPaused;
            this.isPaused = true;
            this.isLevelingUp = true;
            
            this.emit('levelUp', { level: this.level, wasPaused: wasPaused });
            
            // Reprendre après l'animation (3 secondes) seulement si pas de trésor
            setTimeout(() => {
                this.isLevelingUp = false;
                // Ne pas reprendre ici, le trésor gérera la reprise
            }, 3000);
        }
        
        // Calculer les points de pop avec bonus combo
        const popPointsBase = group.length;
        const comboPointsBonus = this.popCombo > 1 ? Math.floor(group.length * (this.popCombo - 1) * 0.3) : 0;
        const popPointsEarned = popPointsBase + comboPointsBonus;
        this.popPoints += popPointsEarned;
        
        // Vérifier si on gagne un swap (tous les 20 points de pop)
        const swapsToAdd = Math.floor(this.popPoints / 20);
        if (swapsToAdd > 0) {
            const previousSwaps = this.swapCount;
            this.swapCount = Math.min(this.swapCount + swapsToAdd, this.maxSwaps);
            this.popPoints = this.popPoints % 20;
            
            if (this.swapCount > previousSwaps) {
                this.emit('swapEarned', { count: this.swapCount });
            }
        }
        
        // Bonus de wall breaks basé sur la taille et le combo
        let wallBreakPoints = 0;
        
        // Points de base selon la taille du groupe
        if (group.length >= 10) {
            wallBreakPoints = 2; // Grand groupe = 2 charges
        } else if (group.length >= 7) {
            wallBreakPoints = 1; // Groupe moyen = 1 charge
        } else if (group.length >= 5) {
            wallBreakPoints = Math.random() < 0.5 ? 1 : 0; // 50% de chance
        }
        
        // Bonus combo : +1 charge tous les 3 combos
        if (this.popCombo >= 3 && this.popCombo % 3 === 0) {
            wallBreakPoints += 1;
        }
        
        // Appliquer les charges gagnées
        if (wallBreakPoints > 0) {
            const previousCharges = this.wallBreakCharges;
            this.wallBreakCharges = Math.min(this.wallBreakCharges + wallBreakPoints, this.maxWallBreakCharges);
            
            if (this.wallBreakCharges > previousCharges) {
                this.emit('wallBreakEarned', { 
                    count: this.wallBreakCharges,
                    earned: this.wallBreakCharges - previousCharges
                });
            }
        }
        
        // Reset timer combo
        if (this.popComboTimer) clearTimeout(this.popComboTimer);
        this.popComboTimer = setTimeout(() => {
            this.popCombo = 0;
            this.emit('popComboEnd');
        }, 2000);
        
        // Émettre événement avant de supprimer
        this.emit('groupPopped', { 
            group, 
            count: group.length, 
            combo: this.popCombo,
            score: totalScore,
            popPoints: popPointsEarned,
            totalPopPoints: this.popPoints,
            swapCount: this.swapCount,
            wallBreakCharges: this.wallBreakCharges,
            wallBreaksEarned: wallBreakPoints
        });
        
        // Supprimer le groupe
        this.grid.removeGroup(group);
        
        // Appliquer la gravité
        setTimeout(() => {
            this.applyGravity();
        }, 200);
    }

    /**
     * Fait pivoter la pièce
     * @returns {boolean} true si la rotation a réussi
     */
    rotate() {
        if (!this.currentPiece || !this.isRunning || this.isPaused) return false;
        
        const rotated = rotateShape(this.currentPiece.shape);
        
        if (this.grid.isValidMove(this.currentPiece, this.currentPiece.x, this.currentPiece.y, rotated)) {
            this.currentPiece.shape = rotated;
            this.emit('rotate', { piece: this.currentPiece });
            return true;
        }
        
        return false;
    }

    /**
     * Hard drop - pose la pièce directement
     */
    hardDrop() {
        if (!this.currentPiece || !this.isRunning || this.isPaused) return;
        
        let dropDistance = 0;
        while (this.move(0, 1)) {
            dropDistance++;
        }
        
        this.score += dropDistance * CONFIG.SCORING.HARD_DROP;
        this.placePiece();
        this.emit('hardDrop', { distance: dropDistance });
    }

    /**
     * Place la pièce et gère les lignes
     */
    placePiece() {
        if (!this.currentPiece) return;
        
        // Son de placement
        if (audioManager) audioManager.playPiecePlaced();
        
        this.grid.placePiece(this.currentPiece);
        const linesCleared = this.grid.clearLines();
        
        if (linesCleared.length > 0) {
            this.handleLinesCleared(linesCleared);
        } else {
            // Reset combo si aucune ligne
            this.combo = 0;
            if (this.comboTimer) {
                clearTimeout(this.comboTimer);
                this.comboTimer = null;
            }
        }
        
        this.emit('place', { piece: this.currentPiece });
        this.spawnPiece();
    }

    /**
     * Applique la gravité aux blocs flottants
     * @returns {boolean} true si des blocs sont tombés
     */
    applyGravity() {
        let blocksHaveFallen = false;
        let continueGravity = true;
        
        while (continueGravity) {
            continueGravity = false;
            
            // Parcourir de bas en haut (sauf la dernière ligne)
            for (let row = this.grid.rows - 2; row >= 0; row--) {
                for (let col = 0; col < this.grid.cols; col++) {
                    // Si la cellule contient un bloc
                    if (this.grid.cells[row][col]) {
                        // Vérifier si la cellule en dessous est vide
                        if (!this.grid.cells[row + 1][col]) {
                            // Déplacer le bloc vers le bas
                            this.grid.cells[row + 1][col] = this.grid.cells[row][col];
                            this.grid.cells[row][col] = null;
                            blocksHaveFallen = true;
                            continueGravity = true;
                        }
                    }
                }
            }
            
            // Mettre à jour l'affichage après chaque itération
            if (continueGravity) {
                this.grid.render();
            }
        }
        
        if (blocksHaveFallen) {
            this.grid.render(); // Rendu final après toute la gravité
            this.emit('gravityApplied');
        }
        
        return blocksHaveFallen;
    }

    /**
     * Détecte et fait tomber les blocs isolés (pour le shake)
     */
    shakeGrid() {
        let blocksShaken = false;
        
        // Parcourir de haut en bas
        for (let row = 0; row < this.grid.rows - 1; row++) {
            for (let col = 0; col < this.grid.cols; col++) {
                // Si la cellule contient un bloc
                if (this.grid.cells[row][col]) {
                    // Vérifier si c'est un bloc isolé (rien en dessous)
                    let hasSupport = false;
                    
                    // Vérifier les 3 cases en dessous (dessous direct, diagonal gauche, diagonal droite)
                    if (row < this.grid.rows - 1) {
                        if (this.grid.cells[row + 1][col]) hasSupport = true;
                        if (col > 0 && this.grid.cells[row + 1][col - 1]) hasSupport = true;
                        if (col < this.grid.cols - 1 && this.grid.cells[row + 1][col + 1]) hasSupport = true;
                    }
                    
                    // Si bloc isolé dans les 5 premières lignes, le faire tomber
                    if (!hasSupport && row < 5) {
                        blocksShaken = true;
                    }
                }
            }
        }
        
        if (blocksShaken) {
            this.applyGravity();
            this.emit('gridShaken');
        }
        
        return blocksShaken;
    }
    handleLinesCleared(lines) {
        const count = lines.length;
        this.lines += count;
        this.combo++;
        
        // Sons
        if (audioManager) {
            if (this.combo > 1) {
                audioManager.playCombo(this.combo);
            } else {
                audioManager.playLineCleared();
            }
        }
        
        // Animation visuelle pour les combos (2 lignes ou plus)
        if (this.combo > 1) {
            const board = document.querySelector('.board');
            if (board) {
                const rect = board.getBoundingClientRect();
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                
                // Utiliser l'instance globale visualEffects
                if (window.visualEffects) {
                    window.visualEffects.createComboAnimation(this.combo, centerX, centerY);
                }
            }
        }
        
        // Calcul du score
        let baseScore = 0;
        switch(count) {
            case 1: baseScore = CONFIG.SCORING.SINGLE_LINE; break;
            case 2: baseScore = CONFIG.SCORING.DOUBLE_LINE; break;
            case 3: baseScore = CONFIG.SCORING.TRIPLE_LINE; break;
            case 4: baseScore = CONFIG.SCORING.QUAD_LINE; break;
        }
        
        const comboBonus = this.combo > 1 ? (this.combo - 1) * CONFIG.SCORING.COMBO_MULTIPLIER : 0;
        this.score += baseScore + comboBonus;
        
        // Niveau et vitesse basés sur le score
        const previousLevel = this.level;
        
        // Calculer le niveau en fonction du score
        this.level = 0;
        for (let i = CONFIG.LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
            if (this.score >= CONFIG.LEVEL_THRESHOLDS[i]) {
                this.level = i;
                break;
            }
        }
        
        // Vitesse augmente avec le niveau
        this.dropInterval = Math.max(
            CONFIG.TIMING.MIN_DROP_SPEED,
            CONFIG.TIMING.INITIAL_DROP_SPEED - (this.level * 30)
        );
        
        // Effet visuel de nouveau niveau
        if (this.level > previousLevel && this.level > 0) {
            // Son de level up
            if (audioManager) audioManager.playLevelUp();
            
            // Pause temporaire pour l'animation de niveau
            const wasPaused = this.isPaused;
            this.isPaused = true;
            this.isLevelingUp = true;
            
            this.emit('levelUp', { level: this.level, wasPaused: wasPaused });
            
            // Reprendre après l'animation (3 secondes) seulement si pas de trésor
            setTimeout(() => {
                this.isLevelingUp = false;
                // Ne pas reprendre ici, le trésor gérera la reprise
            }, 3000);
        }
        
        // Transformation et effacement
        this.grid.removeLinesWithTransform(lines);
        
        // Appliquer la gravité après l'effacement
        setTimeout(() => {
            const fell = this.applyGravity();
            if (fell) {
                // Petit délai pour voir la gravité, puis vérifier les nouvelles lignes
                setTimeout(() => {
                    this.checkLinesAfterGravity();
                }, 200);
            }
        }, CONFIG.TIMING.ANIMATION_DURATION + 50);
        
        // Reset timer combo
        if (this.comboTimer) clearTimeout(this.comboTimer);
        this.comboTimer = setTimeout(() => {
            this.combo = 0;
            this.emit('comboEnd');
        }, CONFIG.TIMING.COMBO_TIMEOUT);
        
        this.emit('linesCleared', {
            lines: lines,
            count: count,
            total: this.lines,
            combo: this.combo,
            score: this.score,
            level: this.level
        });
    }

    /**
     * Vérifie les lignes après gravité (pour les combos en cascade)
     */
    checkLinesAfterGravity() {
        const linesCleared = this.grid.clearLines();
        if (linesCleared.length > 0) {
            this.handleLinesCleared(linesCleared);
        }
    }

    /**
     * Boucle de jeu (appelée à chaque frame)
     * @param {number} deltaTime - Temps écoulé depuis la dernière frame (ms)
     */
    update(deltaTime) {
        if (!this.isRunning || this.isPaused || !this.currentPiece) return;
        
        this.dropTimer += deltaTime;
        
        if (this.dropTimer >= this.dropInterval) {
            if (!this.move(0, 1)) {
                this.placePiece();
            }
            this.dropTimer = 0;
        }
    }

    /**
     * Game Over
     */
    gameOver() {
        this.isRunning = false;
        
        // Son de game over
        if (audioManager) audioManager.playGameOver();
        
        this.emit('gameOver', { score: this.score, lines: this.lines });
    }

    /**
     * Pause/Resume
     */
    togglePause() {
        // Empêcher la pause manuelle pendant l'animation de niveau
        if (this.isLevelingUp) return;
        
        this.isPaused = !this.isPaused;
        this.emit('pause', this.isPaused);
    }

    /**
     * Système d'événements
     */
    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event, data) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }
}

// Rendre disponible globalement
window.GameEngine = GameEngine;

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GameEngine;
}
