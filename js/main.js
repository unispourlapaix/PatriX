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
let audioManager = null;
let lastTime = 0;

/**
 * Initialise le gestionnaire d'utilisateur et affiche le modal de connexion
 */
function initUserSystem() {
    userManager = new UserManager();
    profileManager = new ProfileManager(userManager);
    webBrowser = new WebBrowserManager();
    audioManager = new AudioManager();
    
    // Rendre accessibles globalement
    window.webBrowser = webBrowser;
    window.audioManager = audioManager;
    
    // Lancer automatiquement la musique après un délai
    setTimeout(() => {
        if (webBrowser) {
            webBrowser.autoStart();
        }
    }, 3000); // 3 secondes après le chargement
    
    const loginModal = document.getElementById('loginModal');
    const loginForm = document.getElementById('loginForm');
    const userInfo = document.getElementById('userInfo');
    const usernameInput = document.getElementById('usernameInput');
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const playGuestBtn = document.getElementById('playGuestBtn');
    const userName = document.getElementById('userName');
    const userMaxScore = document.getElementById('userMaxScore');
    const leaderboardList = document.getElementById('leaderboardList');
    
    // Charger le classement
    loadLeaderboard();
    
    // Si déjà connecté, afficher les infos et démarrer le jeu
    if (userManager.isLoggedIn()) {
        showUserInfo();
        startGame(); // Démarrer le jeu automatiquement
    } else {
        loginModal.classList.add('show');
    }
    
    // Gestion de la création de compte
    const registerBtn = document.getElementById('registerBtn');
    const loginHint = document.getElementById('loginHint');
    const registerHint = document.getElementById('registerHint');
    
    // Le pseudo est visible pour l'inscription
    usernameInput.style.display = 'block';
    
    // Adapter l'interface selon le mode
    registerBtn.addEventListener('focus', () => {
        usernameInput.style.display = 'block';
        usernameInput.setAttribute('required', 'required');
        if (loginHint) loginHint.style.display = 'none';
        if (registerHint) registerHint.style.display = 'block';
    });
    
    loginBtn.addEventListener('focus', () => {
        usernameInput.style.display = 'none';
        usernameInput.removeAttribute('required');
        if (loginHint) loginHint.style.display = 'block';
        if (registerHint) registerHint.style.display = 'none';
    });
    
    registerBtn.addEventListener('click', async () => {
        // S'assurer que le pseudo est visible
        usernameInput.style.display = 'block';
        
        const username = usernameInput.value.trim();
        const email = emailInput.value.trim();
        const password = document.getElementById('passwordInput').value;
        
        if (username.length < 3) {
            alert('Le pseudo doit contenir au moins 3 caractères');
            return;
        }
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Email valide requis');
            return;
        }
        
        if (!password || password.length < 6) {
            alert('Password must contain at least 6 characters');
            return;
        }
        
        try {
            registerBtn.textContent = 'Creating...';
            registerBtn.disabled = true;
            await userManager.register(username, email, password);
            
            // Reload synchronized trophies
            if (ui) {
                ui.loadTrophies();
            }
            
            showUserInfo();
            setTimeout(() => {
                loginModal.classList.remove('show');
                startGame();
            }, 1000);
        } catch (error) {
            alert('Error: ' + error.message);
            registerBtn.textContent = 'Create Account ✨';
            registerBtn.disabled = false;
        }
    });
    
    // Gestion de la connexion avec emailInput
    const emailInput = document.getElementById('emailInput');
    
    // Email requis pour la connexion
    emailInput.style.display = 'block';
    emailInput.placeholder = 'Ton email';
    emailInput.setAttribute('required', 'required');
    
    // Masquer le pseudo pour le login (uniquement pour le register)
    usernameInput.style.display = 'none';
    
    loginBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = document.getElementById('passwordInput').value;
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Email valide requis');
            return;
        }
        
        if (!password || password.length < 6) {
            alert('Password must contain at least 6 characters');
            return;
        }
        
        try {
            loginBtn.textContent = 'Connecting...';
            loginBtn.disabled = true;
            // Login by email + password
            await userManager.login(email, password);
            
            // Reload synchronized trophies
            if (ui) {
                ui.loadTrophies();
            }
            
            showUserInfo();
            setTimeout(() => {
                loginModal.classList.remove('show');
                startGame();
            }, 1000);
        } catch (error) {
            alert('Error: ' + error.message);
            loginBtn.textContent = 'Sign In 🔑';
            loginBtn.disabled = false;
        }
    });
    
    // Lien "Mot de passe oublié"
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    const backToLoginLink = document.getElementById('backToLoginLink');
    const resetPasswordBtn = document.getElementById('resetPasswordBtn');
    const resetEmailInput = document.getElementById('resetEmailInput');
    
    forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginForm.style.display = 'none';
        resetPasswordForm.style.display = 'block';
    });
    
    backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        resetPasswordForm.style.display = 'none';
        loginForm.style.display = 'block';
    });
    
    resetPasswordBtn.addEventListener('click', async () => {
        const email = resetEmailInput.value.trim();
        
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            alert('Valid email required');
            return;
        }
        
        try {
            resetPasswordBtn.textContent = 'Resetting...';
            resetPasswordBtn.disabled = true;
            
            await userManager.resetPassword(email);
            
            alert('✅ Password reset!\n\nUse "Create Account" with this email to set a new password.');
            resetEmailInput.value = '';
            resetPasswordForm.style.display = 'none';
            loginForm.style.display = 'block';
            
            // Pre-fill email in registration form
            document.getElementById('emailInput').value = email;
            registerBtn.focus();
        } catch (error) {
            alert('Error: ' + error.message);
        } finally {
            resetPasswordBtn.textContent = 'Reset 🔑';
            resetPasswordBtn.disabled = false;
        }
    });
    
    // Entrée = connexion
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
    
    // Entrée dans password = connexion aussi
    document.getElementById('passwordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });
    
    // Déconnexion
    logoutBtn.addEventListener('click', () => {
        userManager.logout();
        loginForm.style.display = 'block';
        userInfo.style.display = 'none';
        loginModal.classList.add('show');
        usernameInput.value = '';
        document.getElementById('emailInput').value = '';
        document.getElementById('passwordInput').value = '';
    });
    
    // Jouer sans compte
    playGuestBtn.addEventListener('click', () => {
        loginModal.classList.remove('show');
        startGame();
    });
    
    function showUserInfo() {
        loginForm.style.display = 'none';
        userInfo.style.display = 'block';
        userName.textContent = userManager.getUsername();
        userMaxScore.textContent = userManager.getMaxScore().toLocaleString();
    }
    
    async function loadLeaderboard() {
        try {
            const leaders = await userManager.getLeaderboard(5);
            if (leaders && leaders.length > 0) {
                leaderboardList.innerHTML = leaders.map((leader, index) => `
                    <div class="leaderboard-item">
                        <div class="leaderboard-rank">${index + 1}</div>
                        <div class="leaderboard-name">${leader.pseudo}</div>
                        <div class="leaderboard-score">${leader.max_score.toLocaleString()}</div>
                    </div>
                `).join('');
            } else {
                leaderboardList.innerHTML = '<div class="loading">No scores yet</div>';
            }
        } catch (error) {
            leaderboardList.innerHTML = '<div class="loading">Loading error</div>';
        }
    }
}

/**
 * Démarre le jeu après connexion
 */
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
            if (game && userManager) {
                showSaveLoadMenu('save');
            }
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
            effects.showSpiritualMessage("Bienvenue dans PATRIX ! ✝️", 3000);
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
    
    // Change title based on mode
    title.textContent = mode === 'save' ? '💾 Save' : '📂 Load';
    
    // Récupérer toutes les sauvegardes
    const saves = userManager.getAllSavedGames();
    
    // Générer le HTML des slots
    slotsContainer.innerHTML = saves.map(save => {
        if (save.empty) {
            // Slot vide
            return `
                <div class="save-slot empty" data-slot="${save.slot}" data-mode="${mode}">
                    <div class="slot-header">
                        <span class="slot-number">Slot ${save.slot}</span>
                    </div>
                    <p style="color: #888; text-align: center; margin: 10px 0;">Vide</p>
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
                        <span class="slot-number">Slot ${save.slot}</span>
                        ${mode === 'load' ? `<button class="slot-delete" onclick="deleteSaveSlot(${save.slot}, event)">🗑️ Supprimer</button>` : ''}
                    </div>
                    <div class="slot-info">
                        <div class="slot-info-item">
                            <span class="slot-info-label">Niveau</span>
                            <span class="slot-info-value">${save.level}</span>
                        </div>
                        <div class="slot-info-item">
                            <span class="slot-info-label">Score</span>
                            <span class="slot-info-value">${save.score.toLocaleString()}</span>
                        </div>
                        <div class="slot-info-item">
                            <span class="slot-info-label">Lignes</span>
                            <span class="slot-info-value">${save.lines}</span>
                        </div>
                        <div class="slot-info-item">
                            <span class="slot-info-label">Joueur</span>
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
    if (!game || !userManager) return;
    
    const state = game.exportState();
    const savedSlot = userManager.saveGameState(state, slotNumber);
    
    if (savedSlot) {
        // Fermer le menu
        document.getElementById('saveLoadModal').classList.remove('show');
        
        // Message de confirmation
        if (effects) {
            effects.showSpiritualMessage(`Partie sauvegardée dans le Slot ${savedSlot} ! 💾`, 2000);
        }
        
        console.log(`[Main] Partie sauvegardée dans le slot ${savedSlot}`);
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
            effects.showSpiritualMessage("Aucune sauvegarde dans ce slot ❌", 2000);
        }
        return;
    }
    
    // Confirmer le chargement
    if (!confirm(`Charger la partie du Slot ${slotNumber} ?\n\nNiveau: ${saveData.level} | Score: ${saveData.score.toLocaleString()}\n\nLa partie en cours sera perdue.`)) {
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
    
    if (effects) {
        effects.showSpiritualMessage(`Partie chargée du Slot ${slotNumber} ! 📂`, 2000);
    }
    
    console.log(`[Main] Partie chargée du slot ${slotNumber}`);
}

/**
 * Supprime une sauvegarde
 */
function deleteSaveSlot(slotNumber, event) {
    event.stopPropagation();
    
    if (!confirm(`Supprimer la sauvegarde du Slot ${slotNumber} ?`)) {
        return;
    }
    
    if (userManager.clearGameState(slotNumber)) {
        // Rafraîchir l'affichage
        showSaveLoadMenu('load');
        
        if (effects) {
            effects.showSpiritualMessage(`Slot ${slotNumber} supprimé 🗑️`, 2000);
        }
    }
}
