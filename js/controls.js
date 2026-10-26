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
                 e.target.closest('.trophies-panel') ||
                 e.target.closest('.contact-modal') ||
                 e.target.closest('.language-selector-modal') ||
                 e.target.closest('.profile-modal') ||
                 e.target.closest('.web-browser-panel') ||
                 e.target.closest('.playlist-selector') ||
                 e.target.closest('.save-load-modal') ||
                 e.target.closest('.install-banner') ||
                 e.target.closest('.ios-install-instructions') ||
                 e.target.closest('.game-footer') ||
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
                 e.target.closest('.trophies-panel') ||
                 e.target.closest('.contact-modal') ||
                 e.target.closest('.language-selector-modal') ||
                 e.target.closest('.profile-modal') ||
                 e.target.closest('.web-browser-panel') ||
                 e.target.closest('.playlist-selector') ||
                 e.target.closest('.save-load-modal') ||
                 e.target.closest('.install-banner') ||
                 e.target.closest('.ios-install-instructions') ||
                 e.target.closest('.game-footer') ||
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
                 e.target.closest('.trophies-panel') ||
                 e.target.closest('.contact-modal') ||
                 e.target.closest('.language-selector-modal') ||
                 e.target.closest('.profile-modal') ||
                 e.target.closest('.web-browser-panel') ||
                 e.target.closest('.playlist-selector') ||
                 e.target.closest('.save-load-modal') ||
                 e.target.closest('.install-banner') ||
                 e.target.closest('.ios-install-instructions') ||
                 e.target.closest('.game-footer') ||
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
            
            // Swipe DOWN - Hard drop
            if (deltaY > 80 && absDeltaY > absDeltaX) {
                if (this.engine.isRunning && !this.engine.isPaused) {
                    // Swipe vers le bas = hard drop
                    this.engine.hardDrop();
                }
                return;
            }
            
            // Tap (rotation ou placement)
            if (absDeltaX < CONFIG.MOBILE.TAP_THRESHOLD && 
                absDeltaY < CONFIG.MOBILE.TAP_THRESHOLD) {
                
                const currentTime = Date.now();
                const timeSinceLastTap = currentTime - this.lastTapTime;
                
                // Si le dernier tap est trop ancien, c'est un nouveau premier tap
                if (timeSinceLastTap > CONFIG.MOBILE.DOUBLE_TAP_DELAY) {
                    this.tapCount = 1;
                    this.lastTapTime = currentTime;
                    
                    // Attendre pour voir si un deuxième tap arrive
                    setTimeout(() => {
                        if (this.tapCount === 1) {
                            this.engine.rotate();
                            this.tapCount = 0;
                        }
                    }, CONFIG.MOBILE.DOUBLE_TAP_DELAY);
                } else {
                    // Deuxième tap rapide = double tap
                    this.tapCount++;
                    if (this.tapCount >= 2) {
                        this.engine.hardDrop();
                        this.tapCount = 0;
                        this.lastTapTime = 0;
                    }
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
     * Gère les taps simples (rotation uniquement)
     */
    handleTap() {
        // Cette fonction est appelée uniquement pour les rotations
        // Le double tap est géré directement dans initTouchControls
        this.engine.rotate();
    }

    /**
     * Contrôles souris (desktop)
     */
    initMouseControls() {
        const boardElement = document.getElementById('gameBoard');
        
        document.addEventListener('mousedown', (e) => {
            // Ignorer les clics sur la zone mécanique et les modals
            if (e.target && e.target.closest && 
                (e.target.closest('.mechanical-display') ||
                 e.target.closest('.playlist-selector') ||
                 e.target.closest('.save-load-modal'))) {
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
            
            // Swipe DOWN - Hard drop (même logique que tactile)
            if (deltaY > 80 && absDeltaY > absDeltaX) {
                if (this.engine.isRunning && !this.engine.isPaused) {
                    // Swipe vers le bas = hard drop
                    this.engine.hardDrop();
                }
                return;
            }
            
            // Click simple ou double click
            if (absDeltaX < 10 && absDeltaY < 10) {
                const currentTime = Date.now();
                
                // Détecter double-clic pour hard drop
                if (currentTime - this.lastClickTime < 300) {
                    this.clickCount++;
                    if (this.clickCount >= 2) {
                        // Double-clic : hard drop
                        this.engine.hardDrop();
                        this.clickCount = 0;
                        this.lastClickTime = 0;
                        return;
                    }
                } else {
                    this.clickCount = 1;
                }
                this.lastClickTime = currentTime;
                
                // Clic simple : rotation (attendre pour voir si c'est un double clic)
                setTimeout(() => {
                    if (this.clickCount === 1) {
                        this.engine.rotate();
                        this.clickCount = 0;
                    }
                }, 300);
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
