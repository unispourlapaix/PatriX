/**
 * PATRIX - Fichier Principal
 * ID: E-manuel-main
 * Auteur: Emmanuel Payet
 * Message: "Abandonne la tristesse, revêts-toi de force et courage - Transformer le désespoir en grands rêves"
 */

// Instance globale du jeu
let game = null;
let controls = null;
let ui = null;
let effects = null;
let lineTracer = null;
let userManager = null;
let profileManager = null;
let webBrowser = null;
let lastTime = 0;

/**
 * Initialise le gestionnaire d'utilisateur et affiche le modal de connexion
 */
function initUserSystem() {
    userManager = new UserManager();
    window.userManager = userManager;
    profileManager = new ProfileManager(userManager);
    window.profileManager = profileManager;
    const fullscreen = document.getElementById('exitFullscreenBtn');
    if (fullscreen) fullscreen.addEventListener('click', toggleFullscreen);
    startGame();
}
function startGame() {
    // Démarrer une nouvelle partie (les sauvegardes sont gérées via le menu pause)
    if (!game) {
        initGame();
    } else {
        // Vérifier que le DOM existe toujours
        if (!game.grid.boardElement || !game.grid.gridElement) {
            console.warn('[Main] DOM de la grille manquant, réinitialisation complète');
            initGame();
        } else {
            game.start();
        }
    }
    
    // Activer le plein écran automatiquement sur mobile UNIQUEMENT si non installé
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    
    if (window.innerWidth <= 768 && !isStandalone) {
        setTimeout(() => {
            const elem = document.documentElement;
            if (elem.requestFullscreen) {
                elem.requestFullscreen().catch(err => {
                    console.log('Plein écran non disponible:', err);
                });
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen().catch(err => {
                    console.log('Plein écran non disponible:', err);
                });
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen().catch(err => {
                    console.log('Plein écran non disponible:', err);
                });
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen().catch(err => {
                    console.log('Plein écran non disponible:', err);
                });
            }
        }, 100);
    }
}

/**
 * Basculer entre plein écran et mode normal
 */
function toggleFullscreen() {
    const isFullscreen = document.fullscreenElement || 
                        document.webkitFullscreenElement || 
                        document.mozFullScreenElement || 
                        document.msFullscreenElement;
    
    if (isFullscreen) {
        // Sortir du plein écran
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    } else {
        // Entrer en plein écran
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen().catch(err => {
                console.log('Plein écran non disponible:', err);
            });
        } else if (elem.webkitRequestFullscreen) {
            elem.webkitRequestFullscreen().catch(err => {
                console.log('Plein écran non disponible:', err);
            });
        } else if (elem.mozRequestFullScreen) {
            elem.mozRequestFullScreen().catch(err => {
                console.log('Plein écran non disponible:', err);
            });
        } else if (elem.msRequestFullscreen) {
            elem.msRequestFullscreen().catch(err => {
                console.log('Plein écran non disponible:', err);
            });
        }
    }
}

/**
 * Initialise le jeu
 */
function initGame() {
    // Créer le moteur de jeu
    game = new GameEngine();
    
    // Créer la grille dans le DOM
    const boardContainer = document.querySelector('.game-board');
    game.grid.createDOM(boardContainer);
    
    // Créer les effets visuels
    effects = new VisualEffects(document.body);
    
    // Créer l'interface utilisateur
    ui = new UserInterface(game, effects);
    
    // Créer les contrôles
    controls = new Controls(game);
    
    // Créer le traceur de ligne
    const board = document.getElementById('gameBoard');
    lineTracer = new LineTracer(game.grid, board);
    lineTracer.onPathComplete = (path) => game.handleLinePop(path);
    
    // Event pour le rendu
    game.on('move', () => game.grid.render(game.currentPiece));
    game.on('rotate', () => game.grid.render(game.currentPiece));
    game.on('spawn', () => game.grid.render(game.currentPiece));
    game.on('place', () => game.grid.render());
    game.on('gravityApplied', () => game.grid.render());
    game.on('gridShaken', () => {
        effects.shakeBoard();
        game.grid.render();
    });
    game.on('wallExplosion', (data) => {
        effects.createWallExplosion(data.direction, data.piece);
        game.grid.render(game.currentPiece);
    });
    game.on('groupPopped', (data) => {
        effects.createPopExplosion(data.group, data.combo);
        setTimeout(() => game.grid.render(game.currentPiece), 100);
    });
    game.on('levelUp', (data) => {
        effects.createLevelBreakEffect(data.level);
    });
    
    // Game Over - sauvegarder le score
    game.on('gameOver', (data) => {
        if (userManager) {
            userManager.saveMaxScore(data.score);
            userManager.incrementGamesPlayed();
        }
    });
    
    // Démarrer le jeu
    game.start();
    
    // Lancer la boucle de jeu
    requestAnimationFrame(gameLoop);
}

/**
 * Boucle de jeu principale (optimisée)
 */
let renderAccumulator = 0;
const RENDER_INTERVAL = 1000 / 30; // 30 FPS pour render visuel

function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    renderAccumulator += deltaTime;
    
    // Mettre à jour le jeu (logique toujours 60 FPS)
    if (game) {
        game.update(deltaTime);
        
        // Render visuel seulement à 30 FPS pour économiser
        if (renderAccumulator >= RENDER_INTERVAL) {
            game.grid.render(game.currentPiece);
            renderAccumulator = 0;
        }
    }
    
    // Continuer la boucle
    requestAnimationFrame(gameLoop);
}

/**
 * Démarre tout quand le DOM est prêt
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialiser le système utilisateur d'abord
    initUserSystem();
    
    // Initialiser l'audio au premier clic
    document.addEventListener('click', () => {
        if (audioManager && !audioManager.initialized) {
            audioManager.init();
        }
    }, { once: true });
    
    // Bouton audio
    const audioBtn = document.getElementById('audioBtn');
    if (audioBtn) {
        audioBtn.addEventListener('click', () => {
            if (audioManager) {
                const enabled = audioManager.toggleSound();
                audioBtn.textContent = enabled ? '🔊' : '🔇';
            }
        });
    }
    
    // Bouton musique Audiomack
    const musicBtn = document.getElementById('musicBtn');
    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (window.webBrowser) {
                window.webBrowser.toggle();
            }
        });
    }
    
    // Boutons du menu pause
    const saveGameBtn = document.getElementById('saveGameBtn');
    const loadGameBtn = document.getElementById('loadGameBtn');
    const resumeBtn = document.getElementById('resumeBtn');
    const saveStatus = document.getElementById('saveStatus');
    
    if (saveGameBtn) {
        saveGameBtn.addEventListener('click', () => {
            console.log('[Main] Bouton sauvegarder cliqué');
            console.log('[Main] Game existe:', !!game);
            console.log('[Main] Game.isRunning:', game ? game.isRunning : 'N/A');
            console.log('[Main] UserManager existe:', !!userManager);
            
            if (!game) {
                console.error('[Main] Game non défini lors du clic sur sauvegarde');
                if (effects) {
                    effects.showSpiritualMessage('Jeu non initialisé', 2000);
                }
                return;
            }
            
            if (!game.isRunning) {
                console.error('[Main] Aucune partie en cours');
                if (effects) {
                    effects.showSpiritualMessage('Aucune partie en cours à sauvegarder', 2000);
                }
                return;
            }
            
            if (!userManager) {
                console.error('[Main] UserManager non défini');
                if (effects) {
                    effects.showSpiritualMessage('Système de sauvegarde non initialisé', 2000);
                }
                return;
            }
            
            showSaveLoadMenu('save');
        });
    }

    if (loadGameBtn) {
        loadGameBtn.addEventListener('click', () => {
            if (userManager) {
                showSaveLoadMenu('load');
            }
        });
    }
    
    if (resumeBtn) {
        resumeBtn.addEventListener('click', () => {
            if (game) {
                game.togglePause();
            }
        });
    }

    // Fermeture du menu sauvegardes
    const saveLoadClose = document.getElementById('saveLoadClose');
    if (saveLoadClose) {
        saveLoadClose.addEventListener('click', () => {
            document.getElementById('saveLoadModal').classList.remove('show');
        });
    }
    
    // Message de bienvenue
    setTimeout(() => {
        if (effects) {
            effects.showSpiritualMessage(window.i18n.t('notifications.welcome'), 3000);
        }
    }, 1500);
});

/**
 * Affiche le menu de gestion des sauvegardes
 */
function showSaveLoadMenu(mode) {
    const modal = document.getElementById('saveLoadModal');
    const title = document.getElementById('saveLoadTitle');
    const slotsContainer = document.getElementById('saveSlots');
    
    if (!modal || !title || !slotsContainer) return;
    
    // Changer le titre selon le mode
    title.textContent = mode === 'save' ? '💾 Sauvegarder' : '📂 Charger';
    
    // Récupérer toutes les sauvegardes
    const saves = userManager.getAllSavedGames();
    
    // Générer le HTML des slots
    slotsContainer.innerHTML = saves.map(save => {
        if (save.empty) {
            // Slot vide
            return `
                <div class="save-slot empty" data-slot="${save.slot}" data-mode="${mode}">
                    <div class="slot-header">
                        <span class="slot-number">${window.i18n.t('game.slot')} ${save.slot}</span>
                    </div>
                    <p style="color: #888; text-align: center; margin: 10px 0;">${window.i18n.t('game.empty')}</p>
                </div>
            `;
        } else {
            // Slot avec sauvegarde
            const date = save.savedAt.toLocaleDateString('fr-FR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
            
            return `
                <div class="save-slot" data-slot="${save.slot}" data-mode="${mode}">
                    <div class="slot-header">
                        <span class="slot-number">${window.i18n.t('game.slot')} ${save.slot}</span>
                        ${mode === 'load' ? `<button class="slot-delete" onclick="deleteSaveSlot(${save.slot}, event)">${window.i18n.t('game.delete')}</button>` : ''}
                    </div>
                    <div class="slot-info">
                        <div class="slot-info-item">
                            <span class="slot-info-label">${window.i18n.t('game.level')}</span>
                            <span class="slot-info-value">${save.level}</span>
                        </div>
                        <div class="slot-info-item">
                            <span class="slot-info-label">${window.i18n.t('game.score')}</span>
                            <span class="slot-info-value">${save.score.toLocaleString()}</span>
                        </div>
                        <div class="slot-info-item">
                            <span class="slot-info-label">${window.i18n.t('game.lines')}</span>
                            <span class="slot-info-value">${save.lines}</span>
                        </div>
                        <div class="slot-info-item">
                            <span class="slot-info-label">${window.i18n.t('game.player')}</span>
                            <span class="slot-info-value">${save.data.userId}</span>
                        </div>
                    </div>
                    <div class="slot-date">${date}</div>
                </div>
            `;
        }
    }).join('');
    
    // Ajouter les event listeners aux slots
    document.querySelectorAll('.save-slot').forEach(slot => {
        slot.addEventListener('click', (e) => {
            // Ne pas déclencher si on clique sur le bouton supprimer
            if (e.target.classList.contains('slot-delete')) return;
            
            const slotNumber = parseInt(slot.dataset.slot);
            const slotMode = slot.dataset.mode;
            
            if (slotMode === 'save') {
                handleSaveToSlot(slotNumber);
            } else {
                handleLoadFromSlot(slotNumber);
            }
        });
    });
    
    modal.classList.add('show');
}

/**
 * Sauvegarde dans un slot spécifique
 */
function handleSaveToSlot(slotNumber) {
    console.log('[Main] handleSaveToSlot appelée, slot:', slotNumber);
    
    if (!game) {
        console.error('[Main] Game non initialisé');
        if (effects) {
            effects.showSpiritualMessage(window.i18n.t('errors.gameNotInitialized') || 'Jeu non initialisé', 2000);
        }
        return;
    }
    
    if (!userManager) {
        console.error('[Main] UserManager non initialisé');
        if (effects) {
            effects.showSpiritualMessage(window.i18n.t('errors.saveError') || 'Erreur de sauvegarde', 2000);
        }
        return;
    }
    
    if (!game.isRunning) {
        console.error('[Main] Le jeu n\'est pas en cours');
        if (effects) {
            effects.showSpiritualMessage(window.i18n.t('errors.noGameToSave') || 'Aucune partie en cours', 2000);
        }
        return;
    }
    
    try {
        const state = game.exportState();
        console.log('[Main] État exporté:', state);
        
        const savedSlot = userManager.saveGameState(state, slotNumber);
        
        if (savedSlot) {
            // Fermer le menu
            document.getElementById('saveLoadModal').classList.remove('show');
            
            // Message de confirmation
            if (effects) {
                effects.showSpiritualMessage(window.i18n.t('notifications.gameSaved', { slot: savedSlot }), 2000);
            }
            
            console.log(`[Main] Partie sauvegardée dans le slot ${savedSlot}`);
        } else {
            console.error('[Main] Échec de la sauvegarde');
            if (effects) {
                effects.showSpiritualMessage(window.i18n.t('errors.saveFailed') || 'Échec de la sauvegarde', 2000);
            }
        }
    } catch (error) {
        console.error('[Main] Erreur lors de la sauvegarde:', error);
        if (effects) {
            effects.showSpiritualMessage(window.i18n.t('errors.saveError') || 'Erreur de sauvegarde', 2000);
        }
    }
}

/**
 * Charge depuis un slot spécifique
 */
function handleLoadFromSlot(slotNumber) {
    if (!userManager) return;
    
    const saveData = userManager.loadGameState(slotNumber);
    if (!saveData) {
        if (effects) {
            effects.showSpiritualMessage(window.i18n.t('notifications.noSaveInSlot'), 2000);
        }
        return;
    }
    
    // Confirmer le chargement
    const confirmMessage = window.i18n.t('notifications.loadSlotConfirm', { 
        slot: slotNumber, 
        level: saveData.level, 
        score: saveData.score.toLocaleString() 
    });
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // Fermer le menu
    document.getElementById('saveLoadModal').classList.remove('show');
    
    // Initialiser le jeu si nécessaire
    if (!game) {
        initGame();
    } else {
        if (!game.grid.boardElement || !game.grid.gridElement) {
            initGame();
        }
    }
    
    // Importer l'état
    game.importState(saveData);
    game.isRunning = true;
    game.isPaused = false;
    
    // Fermer le panneau de pause si ouvert
    const pausePanel = document.getElementById('pausePanel');
    if (pausePanel) {
        pausePanel.classList.remove('show');
    }
    
    // Mettre à jour l'UI complètement
    if (ui) {
        ui.updateScore(game.score);
        ui.updateLines(game.lines);
        ui.updateLevel(game.level);
        ui.updateSwapDots(game.swapCount);
        ui.updateWallCharges(game.wallBreakCharges);
        ui.renderNextPiece(game.nextPiece);
    }
    
    // Redémarrer la boucle de jeu si nécessaire
    if (!window.gameLoopRunning) {
        lastTime = performance.now();
        requestAnimationFrame(gameLoop);
    }
    
    if (effects) {
        effects.showSpiritualMessage(window.i18n.t('notifications.gameLoaded', { slot: slotNumber }), 2000);
    }
    
    console.log(`[Main] Partie chargée du slot ${slotNumber}`);
}

/**
 * Supprime une sauvegarde
 */
function deleteSaveSlot(slotNumber, event) {
    event.stopPropagation();
    
    if (!confirm(window.i18n.t('notifications.deleteSlotConfirm', { slot: slotNumber }))) {
        return;
    }
    
    if (userManager.clearGameState(slotNumber)) {
        // Rafraîchir l'affichage
        showSaveLoadMenu('load');
        
        if (effects) {
            effects.showSpiritualMessage(window.i18n.t('notifications.slotDeleted', { slot: slotNumber }), 2000);
        }
    }
}

