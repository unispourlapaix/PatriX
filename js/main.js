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
let lastTime = 0;

/**
 * Initialise le gestionnaire d'utilisateur et affiche le modal de connexion
 */
function initUserSystem() {
    userManager = new UserManager();
    
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
    
    // Si déjà connecté, afficher les infos
    if (userManager.isLoggedIn()) {
        showUserInfo();
    } else {
        loginModal.classList.add('show');
    }
    
    // Gestion de la connexion
    loginBtn.addEventListener('click', async () => {
        const username = usernameInput.value.trim();
        if (username.length < 3) {
            alert('Le nom d\'utilisateur doit contenir au moins 3 caractères');
            return;
        }
        
        try {
            loginBtn.textContent = 'Connexion...';
            loginBtn.disabled = true;
            await userManager.login(username);
            showUserInfo();
            setTimeout(() => {
                loginModal.classList.remove('show');
                startGame();
            }, 1000);
        } catch (error) {
            alert('Erreur : ' + error.message);
            loginBtn.textContent = 'Se Connecter ✨';
            loginBtn.disabled = false;
        }
    });
    
    // Entrée = connexion
    usernameInput.addEventListener('keypress', (e) => {
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
                leaderboardList.innerHTML = '<div class="loading">Aucun score pour le moment</div>';
            }
        } catch (error) {
            leaderboardList.innerHTML = '<div class="loading">Erreur de chargement</div>';
        }
    }
}

/**
 * Démarre le jeu après connexion
 */
function startGame() {
    if (!game) {
        initGame();
    } else {
        game.start();
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
 * Boucle de jeu principale
 */
function gameLoop(currentTime) {
    const deltaTime = currentTime - lastTime;
    lastTime = currentTime;
    
    // Mettre à jour le jeu
    if (game) {
        game.update(deltaTime);
        game.grid.render(game.currentPiece);
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
    
    // Bouton musique
    const musicBtn = document.getElementById('musicBtn');
    if (musicBtn) {
        musicBtn.addEventListener('click', () => {
            if (audioManager) {
                audioManager.toggleMusicPlayer();
            }
        });
    }
    
    // Message de bienvenue
    setTimeout(() => {
        if (effects) {
            effects.showSpiritualMessage("Bienvenue dans PATRIX ! ✝️", 3000);
        }
    }, 1500);
});
