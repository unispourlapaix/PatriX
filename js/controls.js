/**
 * PATRIX - Gestion des Contrôles
 * ID: E-manuel-controls
 * Auteur: Emmanuel Payet
 */

class Controls {
    constructor(engine) {
        this.engine = engine;
        this.isTouchDevice = 'ontouchstart' in window;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.lastTapTime = 0;
        this.tapCount = 0;
        this.isMouseDown = false;
        this.mouseStartX = 0;
        this.mouseStartY = 0;
        this.lastClickTime = 0;
        this.clickCount = 0;
        this.touchMoveCount = 0; // Pour compter les descentes pendant le drag
        this.lastTouchY = 0; // Pour suivre le mouvement vertical
        
        // Shake detection
        this.moveHistory = [];
        this.lastMoveTime = 0;
        this.shakeThreshold = 3; // Nombre de changements de direction
        this.shakeTimeWindow = 500; // ms
        
        this.init();
    }

    /**
     * Initialise les contrôles
     */
    init() {
        if (this.isTouchDevice) {
            this.initTouchControls();
        } else {
            this.initMouseControls();
        }
        this.initKeyboardControls();
    }

    /**
     * Contrôles tactiles (mobile)
     */
    initTouchControls() {
        document.addEventListener('touchstart', (e) => {
            // Ignorer les touches sur la zone mécanique et les modals
            if (e.target && e.target.closest && 
                (e.target.closest('.mechanical-display') || 
                 e.target.closest('.treasure-modal') ||
                 e.target.closest('.trophy-modal') ||
                 e.target.closest('.game-over-panel') ||
                 e.target.closest('.pause-panel'))) {
                return;
            }
            
            if (!this.engine.isRunning) return;
            e.preventDefault();
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
            this.lastTouchY = e.touches[0].clientY;
            this.touchMoveCount = 0; // Réinitialiser le compteur
        }, { passive: false });
        
        // Nouveau : touchmove pour suivre la position (ne fait plus descendre)
        document.addEventListener('touchmove', (e) => {
            // Ignorer les touches sur la zone mécanique et les modals
            if (e.target && e.target.closest && 
                (e.target.closest('.mechanical-display') || 
                 e.target.closest('.treasure-modal') ||
                 e.target.closest('.trophy-modal') ||
                 e.target.closest('.game-over-panel') ||
                 e.target.closest('.pause-panel'))) {
                return;
            }
            
            if (!this.engine.isRunning) return;
            e.preventDefault();
            
            const currentY = e.touches[0].clientY;
            this.lastTouchY = currentY; // Juste suivre la position pour calculer la vélocité
        }, { passive: false });

        document.addEventListener('touchend', (e) => {
            // Ignorer les touches sur la zone mécanique et les modals
            if (e.target && e.target.closest && 
                (e.target.closest('.mechanical-display') || 
                 e.target.closest('.treasure-modal') ||
                 e.target.closest('.trophy-modal') ||
                 e.target.closest('.game-over-panel') ||
                 e.target.closest('.pause-panel'))) {
                return;
            }
            
            if (!this.engine.isRunning) return;
            e.preventDefault();
            
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            const deltaX = touchEndX - this.touchStartX;
            const deltaY = touchEndY - this.touchStartY;
            
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            // Swipe UP - Souffle de vent (priorité absolue)
            if (deltaY < -30 && absDeltaY > absDeltaX) {
                if (this.engine.isRunning && !this.engine.isPaused) {
                    if (this.engine.windPush()) {
                        // Son de destruction type roche
                        if (window.audioManager) {
                            window.audioManager.playWindPush();
                        }
                        // Vibration haptique pour retour tactile
                        if (navigator.vibrate) {
                            navigator.vibrate([50, 30, 50]); // Pattern: vibrer-pause-vibrer
                        }
                    }
                }
                return;
            }
            
            // Swipe DOWN - Uniquement swipe normal descend
            if (deltaY > 30 && absDeltaY > absDeltaX) {
                if (this.engine.isRunning && !this.engine.isPaused) {
                    // Swipe rapide (> 150px) = rien (ignoré)
                    if (deltaY <= 150) {
                        // Swipe normal = descendre d'1 case seulement
                        this.engine.move(0, 1);
                    }
                }
                return;
            }
            
            // Tap (rotation ou placement)
            if (absDeltaX < CONFIG.MOBILE.TAP_THRESHOLD && 
                absDeltaY < CONFIG.MOBILE.TAP_THRESHOLD) {
                
                const boardElement = document.getElementById('gameBoard');
                const boardRect = boardElement.getBoundingClientRect();
                const tapY = touchEndY - boardRect.top;
                const boardHeight = boardRect.height;
                
                // Vérifier si le tap est dans la moitié inférieure
                if (tapY > boardHeight / 2) {
                    // Double tap en bas : hard drop
                    const currentTime = Date.now();
                    if (currentTime - this.lastTapTime < CONFIG.MOBILE.DOUBLE_TAP_DELAY) {
                        this.tapCount++;
                        if (this.tapCount >= 2) {
                            this.engine.hardDrop();
                            this.tapCount = 0;
                        }
                    } else {
                        this.tapCount = 1;
                    }
                    this.lastTapTime = currentTime;
                } else {
                    // Tap en haut : rotation
                    this.handleTap();
                }
            }
            // Swipe horizontal uniquement
            else if (absDeltaX > 20 && absDeltaX > absDeltaY) {
                const steps = Math.floor(absDeltaX / 50);
                for (let i = 0; i < Math.min(steps, 3); i++) {
                    this.engine.move(deltaX > 0 ? 1 : -1, 0);
                }
            }
        }, { passive: false });
    }

    /**
     * Gère les taps (simple/double)
     */
    handleTap() {
        const currentTime = Date.now();
        
        if (currentTime - this.lastTapTime < CONFIG.MOBILE.DOUBLE_TAP_DELAY) {
            this.tapCount++;
        } else {
            this.tapCount = 1;
        }
        
        this.lastTapTime = currentTime;
        
        // Simple tap : rotation
        if (this.tapCount === 1) {
            setTimeout(() => {
                if (this.tapCount === 1) {
                    this.engine.rotate();
                }
            }, CONFIG.MOBILE.DOUBLE_TAP_DELAY);
        }
        // Double tap : hard drop
        else if (this.tapCount >= 2) {
            this.engine.hardDrop();
            this.tapCount = 0;
        }
    }

    /**
     * Contrôles souris (desktop)
     */
    initMouseControls() {
        const boardElement = document.getElementById('gameBoard');
        
        document.addEventListener('mousedown', (e) => {
            // Ignorer les clics sur la zone mécanique
            if (e.target && e.target.closest && e.target.closest('.mechanical-display')) {
                return;
            }
            
            if (!this.engine.isRunning) return;
            
            const boardRect = boardElement.getBoundingClientRect();
            
            if (e.clientX >= boardRect.left && e.clientX <= boardRect.right &&
                e.clientY >= boardRect.top && e.clientY <= boardRect.bottom) {
                
                this.isMouseDown = true;
                this.mouseStartX = e.clientX;
                this.mouseStartY = e.clientY;
                e.preventDefault();
                
                boardElement.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (!this.engine.isRunning) return;
            
            const boardRect = boardElement.getBoundingClientRect();
            
            if (e.clientX >= boardRect.left && e.clientX <= boardRect.right &&
                e.clientY >= boardRect.top && e.clientY <= boardRect.bottom) {
                if (!this.isMouseDown) {
                    boardElement.style.cursor = 'grab';
                }
            } else {
                boardElement.style.cursor = 'default';
            }
        });

        document.addEventListener('mouseup', (e) => {
            // Ignorer les clics sur la zone mécanique
            if (e.target && e.target.closest && e.target.closest('.mechanical-display')) {
                return;
            }
            
            if (!this.engine.isRunning || !this.isMouseDown) return;
            
            this.isMouseDown = false;
            const deltaX = e.clientX - this.mouseStartX;
            const deltaY = e.clientY - this.mouseStartY;
            
            boardElement.style.cursor = 'grab';
            
            const absDeltaX = Math.abs(deltaX);
            const absDeltaY = Math.abs(deltaY);
            
            // Swipe UP - Wind Push (même logique que tactile)
            if (deltaY < -30 && absDeltaY > absDeltaX) {
                if (this.engine.windPush()) {
                    // Son de vent
                    if (window.audioManager) {
                        window.audioManager.playWindPush();
                    }
                }
                return;
            }
            
            // Click simple ou double click
            if (absDeltaX < 10 && absDeltaY < 10) {
                const currentTime = Date.now();
                const boardRect = boardElement.getBoundingClientRect();
                const clickY = e.clientY - boardRect.top;
                const boardHeight = boardRect.height;
                
                // Vérifier si le clic est dans la moitié inférieure
                if (clickY > boardHeight / 2) {
                    // Double-clic en bas : hard drop
                    if (currentTime - this.lastClickTime < 300) {
                        this.clickCount++;
                        if (this.clickCount >= 2) {
                            this.engine.hardDrop();
                            this.clickCount = 0;
                        }
                    } else {
                        this.clickCount = 1;
                    }
                    this.lastClickTime = currentTime;
                } else {
                    // Clic simple en haut : rotation
                    this.engine.rotate();
                    this.clickCount = 0;
                }
            }
            // Drag horizontal : déplacement
            else if (Math.abs(deltaX) > 20) {
                const steps = Math.floor(Math.abs(deltaX) / 35);
                for (let i = 0; i < Math.min(steps, 4); i++) {
                    this.engine.move(deltaX > 0 ? 1 : -1, 0);
                }
                this.clickCount = 0;
            }
        });

        // Désactive le menu contextuel sur la grille
        document.addEventListener('contextmenu', (e) => {
            const boardRect = boardElement.getBoundingClientRect();
            
            if (e.clientX >= boardRect.left && e.clientX <= boardRect.right &&
                e.clientY >= boardRect.top && e.clientY <= boardRect.bottom) {
                e.preventDefault();
            }
        });
    }

    /**
     * Contrôles clavier
     */
    initKeyboardControls() {
        document.addEventListener('keydown', (e) => {
            if (!this.engine.isRunning || this.engine.isPaused) return;
            
            switch(e.key) {
                case 'ArrowLeft':
                    this.engine.move(-1, 0);
                    this.detectShake(-1);
                    e.preventDefault();
                    break;
                    
                case 'ArrowRight':
                    this.engine.move(1, 0);
                    this.detectShake(1);
                    e.preventDefault();
                    break;
                    
                case 'ArrowDown':
                    this.engine.move(0, 1);
                    e.preventDefault();
                    break;
                    
                case 'ArrowUp':
                case ' ':
                    this.engine.hardDrop();
                    e.preventDefault();
                    break;
                    
                case 'r':
                case 'R':
                    this.engine.rotate();
                    e.preventDefault();
                    break;
                    
                case 'p':
                case 'P':
                case 'Escape':
                case '-':
                case '_':
                    this.engine.togglePause();
                    e.preventDefault();
                    break;
                    
                case '+':
                case '=': // Aussi accepter = (sur le même bouton que + sans Shift)
                    // Touche de test : ajouter 3000 points
                    this.engine.score += 3000;
                    this.engine.emit('scoreChanged', { score: this.engine.score });
                    e.preventDefault();
                    break;
                    
                case 'e':
                case 'E':
                    // Touche de test : déclencher l'animation de fin
                    this.engine.emit('maxLevelReached');
                    e.preventDefault();
                    break;
            }
        });
    }

    /**
     * Détecte les mouvements rapides (shake)
     * @param {number} direction - Direction du mouvement (-1 gauche, 1 droite)
     */
    detectShake(direction) {
        const currentTime = Date.now();
        
        // Ajouter le mouvement à l'historique
        this.moveHistory.push({
            direction: direction,
            time: currentTime
        });
        
        // Nettoyer l'historique (garder seulement les mouvements récents)
        this.moveHistory = this.moveHistory.filter(move => 
            currentTime - move.time < this.shakeTimeWindow
        );
        
        // Compter les changements de direction
        let directionChanges = 0;
        for (let i = 1; i < this.moveHistory.length; i++) {
            if (this.moveHistory[i].direction !== this.moveHistory[i - 1].direction) {
                directionChanges++;
            }
        }
        
        // Si assez de changements rapides, déclencher le shake
        if (directionChanges >= this.shakeThreshold) {
            this.engine.shakeGrid();
            this.moveHistory = []; // Reset l'historique
        }
    }

    /**
     * Nettoie les événements
     */
    destroy() {
        // Nettoyer les event listeners si nécessaire
    }
}

// Rendre disponible globalement
window.Controls = Controls;

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Controls;
}
