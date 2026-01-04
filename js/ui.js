/**
 * PATRIX - Gestion de l'Interface Utilisateur
 * ID: E-manuel-ui
 * Auteur: Emmanuel Payet
 */

class UserInterface {
    constructor(engine, effects) {
        this.engine = engine;
        this.effects = effects;
        this.GAME_ID = 'patrix'; // ID unique pour ce jeu
        this.elements = {};
        this.currentMessage = '';
        this.isModalOpen = false; // Suivre si un modal est ouvert
        this.init();
        this.bindEvents();
    }

    /**
     * Initialise les éléments de l'interface
     */
    init() {
        this.elements = {
            score: document.getElementById('score'),
            lines: document.getElementById('lines'),
            level: document.getElementById('level'),
            combo: document.getElementById('combo'),
            comboCrosses: document.getElementById('comboCrosses'),
            nextGrid: document.getElementById('nextGrid'),
            message: document.getElementById('spiritualMessage'),
            gameOverPanel: document.getElementById('gameOver'),
            gameOverMessage: document.getElementById('gameOverMessage'),
            finalScore: document.getElementById('finalScore'),
            pausePanel: document.getElementById('pausePanel'),
            restartBtn: document.getElementById('restartBtn'),
            pauseBtn: document.getElementById('pauseBtn'),
            trophyBtn: document.getElementById('trophyBtn'),
            swapDots: document.getElementById('swapDots'),
            wallCharges: document.getElementById('wallCharges'),
            wallIcon: document.querySelector('.wall-icon'),
            treasureModal: document.getElementById('treasureModal'),
            treasureLevel: document.getElementById('treasureLevel'),
            treasureMessage: document.getElementById('treasureMessage'),
            treasureContinue: document.getElementById('treasureContinue'),
            trophyModal: document.getElementById('trophyModal'),
            trophyIcon: document.getElementById('trophyIcon'),
            trophyName: document.getElementById('trophyName'),
            trophyMessage: document.getElementById('trophyMessage'),
            trophyContinue: document.getElementById('trophyContinue'),
            trophiesToggle: document.getElementById('trophiesToggle'),
            trophiesPanel: document.getElementById('trophiesPanel'),
            trophiesClose: document.getElementById('trophiesClose'),
            trophiesGrid: document.getElementById('trophiesGrid'),
            trophiesCount: document.getElementById('trophiesCount')
        };
        
        // Charger les trophées sauvegardés
        this.loadTrophies();
        
        // Générer la liste des trophées
        this.renderTrophiesList();
        
        // Bouton continuer du trésor
        if (this.elements.treasureContinue) {
            this.elements.treasureContinue.addEventListener('click', () => {
                this.hideTreasure();
            });
        }
        
        // Bouton continuer du trophée
        if (this.elements.trophyContinue) {
            this.elements.trophyContinue.addEventListener('click', () => {
                this.hideTrophy();
            });
        }
        
        // Toggle panel trophées
        if (this.elements.trophiesToggle) {
            this.elements.trophiesToggle.addEventListener('click', () => {
                this.toggleTrophiesPanel();
            });
        }
        
        // Fermer panel trophées
        if (this.elements.trophiesClose) {
            this.elements.trophiesClose.addEventListener('click', () => {
                this.closeTrophiesPanel();
            });
        }
    }

    /**
     * Lie les événements du moteur à l'UI
     */
    bindEvents() {
        // Niveau initial ou mis à jour
        this.engine.on('level', (level) => {
            this.updateLevel(level);
        });
        
        // Score et lignes
        this.engine.on('linesCleared', (data) => {
            this.updateScore(data.score);
            this.updateLines(data.total);
            this.updateLevel(data.level);
            this.updateCombo(data.combo);
            this.checkLevelMessage(data.level);
            this.showComboMessage(data.combo);
            
            // Message pour les lignes
            this.effects.showLineMessage(data.count, data.combo);
            
            // Effets visuels
            data.lines.forEach(lineY => {
                this.effects.createLightParticles(lineY);
            });
            
            if (data.combo > 2) {
                this.effects.screenFlash();
            }
        });

        // Nouvelle pièce
        this.engine.on('spawn', (data) => {
            this.renderNextPiece(data.next);
        });

        // Game Over
        this.engine.on('gameOver', (data) => {
            this.showGameOver(data.score);
        });

        // Pause
        this.engine.on('pause', (isPaused) => {
            this.togglePausePanel(isPaused);
        });

        // Restart
        this.engine.on('reset', () => {
            this.resetUI();
        });
        
        // Pop combo events
        this.engine.on('groupPopped', (data) => {
            // Mettre à jour le score principal
            this.updateScore(data.score || this.engine.score);
            
            if (data.combo > 1) {
                this.showPopCombo(data.combo);
            }
            this.updateSwapDots(data.swapCount);
            this.updateWallCharges(data.wallBreakCharges);
        });
        
        this.engine.on('swapEarned', (data) => {
            this.showRewardMessage('SWAP EARNED! 🔄', '#ff8c00');
            this.updateSwapDots(data.count);
        });
        
        this.engine.on('wallBreakEarned', (data) => {
            this.showRewardMessage('WALL BREAK! 🧱', '#8b4513');
            this.updateWallCharges(data.count);
        });
        
        this.engine.on('wallBreakUsed', (data) => {
            this.updateWallCharges(data.remaining);
        });
        
        this.engine.on('nextSwapped', (data) => {
            this.renderNextPiece(data.next);
            this.updateSwapDots(data.remaining);
        });
        
        // Level Up avec trésor
        this.engine.on('levelUp', (data) => {
            // Mettre à jour l'affichage du niveau
            this.updateLevel(data.level);
            
            // Vérifier si un trésor existe pour ce niveau
            const treasureData = CONFIG.MESSAGES.TREASURES.find(t => t.level === data.level);
            
            if (treasureData) {
                // Marquer immédiatement le modal comme ouvert pour bloquer les trophées
                this.isModalOpen = true;
                
                // Laisser l'animation de niveau se jouer pendant 3 secondes avant d'afficher le trésor
                setTimeout(() => {
                    this.showTreasure(data.level);
                    // Ne pas vérifier les trophées ici, attendre que le trésor soit fermé
                }, 3000);
            } else {
                // Pas de trésor, reprendre le jeu après l'animation
                setTimeout(() => {
                    if (!data.wasPaused && this.engine.isPaused) {
                        this.engine.isPaused = false;
                    }
                }, 3000);
            }
        });
        
        // Vérifier les trophées sur les événements
        this.engine.on('linesCleared', () => {
            // Attendre un peu pour éviter le conflit avec le modal trésor
            setTimeout(() => {
                this.checkTrophies();
            }, 100);
        });
        
        this.engine.on('groupPopped', () => {
            // Attendre un peu pour éviter le conflit avec le modal trésor
            setTimeout(() => {
                this.checkTrophies();
            }, 100);
        });

        // Boutons
        if (this.elements.restartBtn) {
            this.elements.restartBtn.addEventListener('click', () => {
                this.hideGameOver();
                this.engine.start();
            });
        }

        if (this.elements.pauseBtn) {
            this.elements.pauseBtn.addEventListener('click', () => {
                this.engine.togglePause();
            });
        }
        
        if (this.elements.trophyBtn) {
            this.elements.trophyBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.toggleTrophiesPanel();
            });
            
            // Aussi pour le tactile
            this.elements.trophyBtn.addEventListener('touchend', (e) => {
                e.stopPropagation();
                e.preventDefault();
                this.toggleTrophiesPanel();
            }, { passive: false });
        }
        
        // Clic sur next pour changer la pièce
        if (this.elements.nextGrid) {
            this.elements.nextGrid.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (this.engine.changeNextPiece()) {
                    this.elements.nextGrid.style.animation = 'swapPulse 0.5s ease-out';
                    setTimeout(() => {
                        this.elements.nextGrid.style.animation = '';
                    }, 500);
                }
            });
            
            // Empêcher les événements tactiles de se propager
            this.elements.nextGrid.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            }, { passive: true });
        }
        
        // Clic sur les swap dots pour descendre rapidement
        if (this.elements.swapDots) {
            this.elements.swapDots.addEventListener('click', (e) => {
                e.stopPropagation();
                e.preventDefault();
                if (this.engine.swapNextPiece()) {
                    // Animation de feedback
                    this.elements.swapDots.style.animation = 'swapPulse 0.3s ease-out';
                    setTimeout(() => {
                        this.elements.swapDots.style.animation = '';
                    }, 300);
                }
            });
            
            // Empêcher les événements tactiles de se propager
            this.elements.swapDots.addEventListener('touchstart', (e) => {
                e.stopPropagation();
            }, { passive: true });
        }
    }

    /**
     * Formate un nombre pour l'affichage
     * @param {number} num - Nombre à formater
     * @param {number} maxDigits - Nombre maximum de chiffres
     * @returns {string} Nombre formaté
     */
    formatNumber(num, maxDigits = 6) {
        if (num < 1000) {
            return num.toString().padStart(maxDigits, '0');
        } else if (num < 1000000) {
            // Milliers : 1.5K, 15K, 150K, 999K
            const k = num / 1000;
            if (k < 10) {
                return (k.toFixed(1) + 'K').padStart(maxDigits, ' ');
            } else {
                return (Math.floor(k) + 'K').padStart(maxDigits, ' ');
            }
        } else if (num < 1000000000) {
            // Millions : 1.5M, 15M, 150M, 999M
            const m = num / 1000000;
            if (m < 10) {
                return (m.toFixed(1) + 'M').padStart(maxDigits, ' ');
            } else if (m < 100) {
                return (Math.floor(m) + 'M').padStart(maxDigits, ' ');
            } else {
                return (Math.floor(m) + 'M').padStart(maxDigits, ' ');
            }
        } else {
            // Milliards : 1.5B, 15B, etc.
            const b = num / 1000000000;
            if (b < 10) {
                return (b.toFixed(1) + 'B').padStart(maxDigits, ' ');
            } else {
                return (Math.floor(b) + 'B').padStart(maxDigits, ' ');
            }
        }
    }

    /**
     * Met à jour le score
     */
    updateScore(score) {
        if (this.elements.score) {
            this.elements.score.textContent = this.formatNumber(score, 6);
        }
    }

    /**
     * Met à jour les lignes
     */
    updateLines(lines) {
        if (this.elements.lines) {
            this.elements.lines.textContent = this.formatNumber(lines, 3);
        }
    }

    /**
     * Met à jour le niveau
     */
    updateLevel(level) {
        if (this.elements.level) {
            this.elements.level.textContent = this.formatNumber(level, 2);
        }
    }

    /**
     * Met à jour le combo
     */
    updateCombo(combo) {
        if (this.elements.combo) {
            this.elements.combo.textContent = this.formatNumber(combo, 2);
        }
        
        // Croix de combo
        if (this.elements.comboCrosses) {
            const crosses = this.elements.comboCrosses.querySelectorAll('.combo-cross');
            crosses.forEach((cross, index) => {
                if (index < combo) {
                    cross.classList.add('active');
                } else {
                    cross.classList.remove('active');
                }
            });
        }
    }

    /**
     * Vérifie et affiche le message de niveau
     */
    checkLevelMessage(level) {
        const messageData = CONFIG.MESSAGES.LEVELS.find(m => m.level === level);
        
        if (messageData && messageData.message !== this.currentMessage) {
            this.currentMessage = messageData.message;
            this.showSpiritualMessage(messageData.message);
        }
    }

    /**
     * Affiche un message de combo
     */
    showComboMessage(combo) {
        if (combo > 1) {
            const messages = CONFIG.MESSAGES.COMBOS;
            const message = messages[Math.min(combo - 2, messages.length - 1)];
            this.effects.showSpiritualMessage(message, 2000);
        }
    }

    /**
     * Affiche le combo de pop
     */
    showPopCombo(combo) {
        const popComboDisplay = document.getElementById('popCombo');
        if (popComboDisplay) {
            popComboDisplay.textContent = `POP x${combo}!`;
            popComboDisplay.style.display = 'block';
            popComboDisplay.style.animation = 'none';
            setTimeout(() => {
                popComboDisplay.style.animation = 'comboPulse 0.5s ease-out';
            }, 10);
            
            // Cacher après 2 secondes
            setTimeout(() => {
                popComboDisplay.style.display = 'none';
            }, 2000);
        }
    }

    /**
     * Met à jour l'affichage des swap dots
     */
    updateSwapDots(count) {
        if (!this.elements.swapDots) return;
        const dots = this.elements.swapDots.querySelectorAll('.swap-dot');
        dots.forEach((dot, index) => {
            if (index < count) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
        
        // Rendre la next grid cliquable si on a des swaps
        if (this.elements.nextGrid) {
            if (count > 0) {
                this.elements.nextGrid.classList.add('swappable');
            } else {
                this.elements.nextGrid.classList.remove('swappable');
            }
        }
    }

    /**
     * Met à jour l'affichage des wall charges
     */
    updateWallCharges(count) {
        if (!this.elements.wallCharges) return;
        const charges = this.elements.wallCharges.querySelectorAll('.wall-charge');
        charges.forEach((charge, index) => {
            if (index < count) {
                charge.classList.add('active');
            } else {
                charge.classList.remove('active');
            }
        });
        
        // Animer l'icône si on a des charges
        if (this.elements.wallIcon) {
            if (count > 0) {
                this.elements.wallIcon.classList.add('active');
            } else {
                this.elements.wallIcon.classList.remove('active');
            }
        }
    }

    /**
     * Affiche un message de récompense
     */
    showRewardMessage(text, color) {
        const msg = document.createElement('div');
        msg.className = 'reward-message';
        msg.textContent = text;
        msg.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(26, 26, 46, 0.9));
            border: 3px solid ${color};
            padding: 15px 30px;
            border-radius: 12px;
            font-size: 1.5em;
            font-weight: bold;
            color: ${color};
            text-align: center;
            z-index: 10000;
            animation: rewardAppear 0.3s ease-out;
            box-shadow: 0 0 30px ${color}80;
        `;
        
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.style.animation = 'rewardDisappear 0.3s ease-out forwards';
            setTimeout(() => msg.remove(), 300);
        }, 1500);
    }

    /**
     * Affiche un message spirituel
     */
    showSpiritualMessage(message) {
        if (this.elements.message) {
            this.elements.message.textContent = message;
            this.elements.message.classList.add('show');
            
            setTimeout(() => {
                this.elements.message.classList.remove('show');
            }, 3000);
        }
    }

    /**
     * Rend la pièce suivante
     */
    renderNextPiece(piece) {
        if (!this.elements.nextGrid) return;
        
        this.elements.nextGrid.innerHTML = '';
        
        const shape = piece.shape;
        const rows = shape.length;
        const cols = shape[0].length;
        
        // Centre la pièce dans une grille 4x4
        const offsetRow = Math.floor((4 - rows) / 2);
        const offsetCol = Math.floor((4 - cols) / 2);
        
        for (let row = 0; row < 4; row++) {
            for (let col = 0; col < 4; col++) {
                const cell = document.createElement('div');
                cell.className = 'next-cell';
                
                const pieceRow = row - offsetRow;
                const pieceCol = col - offsetCol;
                
                if (pieceRow >= 0 && pieceRow < rows && 
                    pieceCol >= 0 && pieceCol < cols && 
                    shape[pieceRow][pieceCol]) {
                    cell.classList.add('filled');
                    cell.style.backgroundColor = CONFIG.COLORS.SHADOW[piece.color];
                }
                
                this.elements.nextGrid.appendChild(cell);
            }
        }
    }

    /**
     * Affiche le Game Over
     */
    showGameOver(score) {
        // Messages rigolos aléatoires
        const funnyMessages = [
            "Ben voilà !",
            "Je te l'avais dit !",
            "On n'y peut rien...",
            "Allez, abandonne pas !",
            "Encore un petit effort !",
            "Presque ! Encore une fois ?",
            "C'était pas mal du tout !",
            "T'étais si proche !",
            "La prochaine sera la bonne !",
            "Recommence, tu vas y arriver !",
            "Oups, ça arrive aux meilleurs !",
            "Courage, petit explorateur !",
            "C'est en forgeant qu'on devient forgeron !",
            "Pas grave, on recommence !",
            "Tu progresses à chaque partie !",
            "Ça se jouait à rien !",
            "Continue comme ça !",
            "Tu deviens de plus en plus fort !",
            "Allez, une dernière pour la route ?",
            "Presque parfait cette fois !",
            "Tu y es presque !",
            "Encore un tout petit peu !",
            "Ça commence à venir !",
            "Tu maîtrises de mieux en mieux !",
            "Bravo pour ta persévérance !",
            "Quelle belle partie !",
            "Tu as bien joué !",
            "Retente ta chance !",
            "Ne lâche rien !",
            "Tu es sur la bonne voie !",
            "Encore une petite partie ?",
            "La victoire est proche !",
            "Continue de rêver !"
        ];
        
        // Choisir un message aléatoire
        const randomMessage = funnyMessages[Math.floor(Math.random() * funnyMessages.length)];
        
        if (this.elements.gameOverMessage) {
            this.elements.gameOverMessage.textContent = randomMessage;
        }
        
        if (this.elements.finalScore) {
            // Formater le score final avec des espaces pour la lisibilité
            const formattedScore = this.formatFinalScore(score);
            this.elements.finalScore.textContent = formattedScore;
        }
        if (this.elements.gameOverPanel) {
            this.elements.gameOverPanel.classList.add('show');
        }
    }

    /**
     * Formate le score final pour l'affichage Game Over
     */
    formatFinalScore(score) {
        if (score < 1000) {
            return score.toString();
        } else if (score < 1000000) {
            // Format avec espaces : 15 000 ou 1.5K
            if (score < 10000) {
                return score.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
            } else {
                const k = (score / 1000).toFixed(1);
                return k + 'K';
            }
        } else if (score < 1000000000) {
            // Millions
            const m = (score / 1000000).toFixed(2);
            return m + 'M';
        } else {
            // Milliards
            const b = (score / 1000000000).toFixed(2);
            return b + 'B';
        }
    }

    /**
     * Cache le Game Over
     */
    hideGameOver() {
        if (this.elements.gameOverPanel) {
            this.elements.gameOverPanel.classList.remove('show');
        }
    }

    /**
     * Toggle pause panel
     */
    togglePausePanel(isPaused) {
        if (this.elements.pausePanel) {
            if (isPaused) {
                this.elements.pausePanel.classList.add('show');
            } else {
                this.elements.pausePanel.classList.remove('show');
            }
        }
    }

    /**
     * Reset l'interface
     */
    resetUI() {
        this.updateScore(0);
        this.updateLines(0);
        this.updateLevel(0);
        this.updateCombo(0);
        this.updateSwapDots(3);
        this.updateWallCharges(3);
        this.currentMessage = '';
        this.hideGameOver();
        this.hideTreasure();
        if (this.elements.message) {
            this.elements.message.classList.remove('show');
        }
    }
    
    /**
     * Affiche le trésor avec message philosophique
     */
    showTreasure(level) {
        const treasureData = CONFIG.MESSAGES.TREASURES.find(t => t.level === level);
        
        if (treasureData && this.elements.treasureModal) {
            // isModalOpen déjà à true depuis levelUp
            
            // Mettre en pause le jeu si pas déjà en pause
            if (this.engine.isRunning && !this.engine.isPaused) {
                this.engine.togglePause();
            }
            
            // Remplir les données
            if (this.elements.treasureLevel) {
                this.elements.treasureLevel.textContent = level;
            }
            if (this.elements.treasureMessage) {
                this.elements.treasureMessage.textContent = treasureData.message;
            }
            
            // Afficher le modal
            this.elements.treasureModal.classList.add('show');
        }
    }
    
    /**
     * Cache le trésor et reprend le jeu
     */
    hideTreasure() {
        if (this.elements.treasureModal) {
            this.elements.treasureModal.classList.remove('show');
            this.isModalOpen = false;
            
            // Reprendre le jeu (retirer la pause si elle était active)
            if (this.engine.isPaused) {
                this.engine.togglePause();
            }
            
            // Vérifier les trophées après avoir fermé le trésor
            setTimeout(() => {
                this.checkTrophies();
            }, 300);
        }
    }
    
    /**
     * Charge les trophées depuis localStorage
     */
    loadTrophies() {
        const saved = localStorage.getItem(`${this.GAME_ID}_trophies`);
        if (saved) {
            const unlockedIds = JSON.parse(saved);
            CONFIG.TROPHIES.forEach(trophy => {
                if (unlockedIds.includes(trophy.id)) {
                    trophy.unlocked = true;
                }
            });
        }
        this.renderTrophiesList();
        this.updateTrophiesCount();
    }
    
    /**
     * Met à jour le compteur de trophées
     */
    updateTrophiesCount() {
        if (this.elements.trophiesCount) {
            const unlocked = CONFIG.TROPHIES.filter(t => t.unlocked).length;
            const total = CONFIG.TROPHIES.length;
            this.elements.trophiesCount.textContent = `${unlocked}/${total}`;
        }
    }
    
    /**
     * Sauvegarde les trophées dans localStorage
     */
    saveTrophies() {
        const unlockedIds = CONFIG.TROPHIES
            .filter(t => t.unlocked)
            .map(t => t.id);
        localStorage.setItem(`${this.GAME_ID}_trophies`, JSON.stringify(unlockedIds));
    }
    
    /**
     * Vérifie et débloque les trophées
     */
    checkTrophies() {
        // Ne pas vérifier les trophées si un modal est déjà ouvert
        if (this.isModalOpen) {
            return;
        }
        
        CONFIG.TROPHIES.forEach(trophy => {
            if (!trophy.unlocked) {
                let conditionMet = false;
                
                switch(trophy.condition.type) {
                    case 'level':
                        conditionMet = this.engine.level >= trophy.condition.value;
                        break;
                    case 'score':
                        conditionMet = this.engine.score >= trophy.condition.value;
                        break;
                    case 'lines':
                        conditionMet = this.engine.lines >= trophy.condition.value;
                        break;
                    case 'combo':
                        conditionMet = this.engine.combo >= trophy.condition.value;
                        break;
                }
                
                if (conditionMet) {
                    this.unlockTrophy(trophy);
                }
            }
        });
    }
    
    /**
     * Débloque un trophée
     */
    unlockTrophy(trophy) {
        trophy.unlocked = true;
        this.saveTrophies();
        
        // Sauvegarder dans UserManager pour sync en ligne
        if (window.userManager) {
            window.userManager.saveTrophy(trophy.id);
        }
        
        this.showTrophy(trophy);
        this.renderTrophiesList();
        this.updateTrophiesCount();
        
        // Ajouter effet visuel au bouton
        if (this.elements.trophiesToggle) {
            this.elements.trophiesToggle.classList.add('has-new');
            setTimeout(() => {
                this.elements.trophiesToggle.classList.remove('has-new');
            }, 3000);
        }
    }
    
    /**
     * Affiche le modal de trophée débloqué
     */
    showTrophy(trophy) {
        if (!this.elements.trophyModal) return;
        
        this.isModalOpen = true;
        
        // Mettre en pause seulement si le jeu est en cours
        if (this.engine.isRunning && !this.engine.isPaused) {
            this.engine.togglePause();
            this.wasPausedByTrophy = true;
        } else {
            this.wasPausedByTrophy = false;
        }
        
        // Remplir les données
        if (this.elements.trophyIcon) {
            this.elements.trophyIcon.textContent = trophy.icon;
        }
        if (this.elements.trophyName) {
            this.elements.trophyName.textContent = trophy.name;
        }
        if (this.elements.trophyMessage) {
            this.elements.trophyMessage.textContent = trophy.message;
        }
        
        // Afficher
        this.elements.trophyModal.classList.add('show');
        
        // Son et effets
        this.effects.screenFlash('#ffd700');
    }
    
    /**
     * Cache le modal de trophée
     */
    hideTrophy() {
        if (this.elements.trophyModal) {
            this.elements.trophyModal.classList.remove('show');
            this.isModalOpen = false;
            
            // Reprendre le jeu seulement si c'est nous qui l'avons mis en pause
            if (this.wasPausedByTrophy && this.engine.isRunning && this.engine.isPaused) {
                this.engine.togglePause();
            }
            this.wasPausedByTrophy = false;
        }
    }
    
    /**
     * Toggle le panel des trophées
     */
    toggleTrophiesPanel() {
        if (this.elements.trophiesPanel) {
            this.elements.trophiesPanel.classList.toggle('show');
        }
    }
    
    /**
     * Ferme le panel des trophées
     */
    closeTrophiesPanel() {
        if (this.elements.trophiesPanel) {
            this.elements.trophiesPanel.classList.remove('show');
        }
    }
    
    /**
     * Génère la liste des trophées
     */
    renderTrophiesList() {
        if (!this.elements.trophiesGrid) return;
        
        this.elements.trophiesGrid.innerHTML = '';
        
        // Séparer les trophées spéciaux et les médailles
        const specialTrophies = CONFIG.TROPHIES.filter(t => t.special);
        const medals = CONFIG.TROPHIES.filter(t => !t.special);
        
        // Section trophées spéciaux
        if (specialTrophies.length > 0) {
            const specialHeader = document.createElement('div');
            specialHeader.style.cssText = 'grid-column: 1; margin: 20px 0 10px; color: #ffd700; font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;';
            specialHeader.textContent = '🏆 Trophées Spéciaux';
            this.elements.trophiesGrid.appendChild(specialHeader);
            
            specialTrophies.forEach(trophy => {
                this.elements.trophiesGrid.appendChild(this.createTrophyCard(trophy));
            });
        }
        
        // Section médailles de niveau
        if (medals.length > 0) {
            const medalsHeader = document.createElement('div');
            medalsHeader.style.cssText = 'grid-column: 1; margin: 20px 0 10px; color: #ffd700; font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;';
            medalsHeader.textContent = '🥇 Médailles de Niveau';
            this.elements.trophiesGrid.appendChild(medalsHeader);
            
            medals.forEach(trophy => {
                this.elements.trophiesGrid.appendChild(this.createTrophyCard(trophy));
            });
        }
    }
    
    /**
     * Crée une carte de trophée
     */
    createTrophyCard(trophy) {
        const card = document.createElement('div');
        card.className = `trophy-card ${trophy.unlocked ? 'unlocked' : 'locked'}`;
        
        let conditionText = '';
        switch(trophy.condition.type) {
            case 'level':
                conditionText = `Atteindre le niveau ${trophy.condition.value}`;
                break;
            case 'score':
                conditionText = `Atteindre ${trophy.condition.value.toLocaleString()} points`;
                break;
            case 'lines':
                conditionText = `Compléter ${trophy.condition.value} lignes`;
                break;
            case 'combo':
                conditionText = `Faire un combo x${trophy.condition.value}`;
                break;
        }
        
        card.innerHTML = `
            <div class="trophy-card-header">
                <div class="trophy-card-icon">${trophy.icon}</div>
                <div class="trophy-card-info">
                    <div class="trophy-card-name">${trophy.name}</div>
                    <div class="trophy-card-condition">${conditionText}</div>
                </div>
            </div>
            <div class="trophy-card-message">${trophy.unlocked ? trophy.message : '???'}</div>
        `;
        
        return card;
    }
}

// Rendre disponible globalement
window.UserInterface = UserInterface;

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserInterface;
}
