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
        this.wasPausedByTrophiesPanel = false; // Flag pour la pause du panneau trophées
        this.swapTimeout = null;
        this.wallBreakTimeout = null;
        this.popComboTimeout = null;
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
            trophiesCount: document.getElementById('trophiesCount'),
            trophiesPanelContent: document.getElementById('trophiesPanelContent'),
            scrollToTop: document.getElementById('scrollToTop')
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
        
        // Fermer trophy modal en cliquant sur le fond
        if (this.elements.trophyModal) {
            this.elements.trophyModal.addEventListener('click', (e) => {
                if (e.target === this.elements.trophyModal) {
                    this.hideTrophy();
                }
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
        
        // Fermer panel trophées en cliquant sur le fond
        if (this.elements.trophiesPanel) {
            this.elements.trophiesPanel.addEventListener('click', (e) => {
                // Fermer seulement si on clique sur le fond (pas sur le contenu)
                if (e.target === this.elements.trophiesPanel) {
                    this.closeTrophiesPanel();
                }
            });
        }
        
        // Scroll to top button
        if (this.elements.scrollToTop && this.elements.trophiesPanelContent) {
            const scrollContainer = this.elements.trophiesPanelContent.querySelector('.trophies-scrollable');
            
            if (scrollContainer) {
                this.elements.scrollToTop.addEventListener('click', () => {
                    scrollContainer.scrollTo({
                        top: 0,
                        behavior: 'smooth'
                    });
                });
                
                // Show/hide scroll button based on scroll position
                scrollContainer.addEventListener('scroll', () => {
                    if (scrollContainer.scrollTop > 300) {
                        this.elements.scrollToTop.style.display = 'flex';
                    } else {
                        this.elements.scrollToTop.style.display = 'none';
                    }
                });
            }
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
            
            // Afficher tous les pops (combo >= 1)
            if (data.combo >= 1) {
                this.showPopCombo(data.combo, data.count);
            }
            this.updateSwapDots(data.swapCount);
            this.updateWallCharges(data.wallBreakCharges);
        });
        
        this.engine.on('swapEarned', (data) => {
            this.showSwapEffect();
            this.updateSwapDots(data.count);
        });
        
        this.engine.on('wallBreakEarned', (data) => {
            this.showWallBreakEffect();
            this.updateWallCharges(data.count);
        });
        
        this.engine.on('wallBreakUsed', (data) => {
            this.updateWallCharges(data.remaining);
        });
        
        this.engine.on('nextSwapped', (data) => {
            this.renderNextPiece(data.next);
            this.updateSwapDots(data.remaining);
        });
        
        this.engine.on('swapDown', (data) => {
            this.updateSwapDots(data.remaining);
            if (data.moved > 0) {
                this.engine.grid.render(this.engine.currentPiece);
            }
        });
        
        // Wind Explosion
        this.engine.on('windExplosion', (data) => {
            this.effects.createWindExplosion(data.cells);
        });
        
        // Level Up avec trésor
        this.engine.on('levelUp', (data) => {
            // Mettre à jour l'affichage du niveau
            this.updateLevel(data.level);
            
            // Vérifier si un message de trésor existe pour ce niveau dans les traductions
            const hasTreasure = window.i18n?.treasures?.[data.level];
            
            if (hasTreasure) {
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

        // Animation de fin quand le niveau max est atteint
        this.engine.on('maxLevelReached', () => {
            // Forcer la fermeture du lecteur Audiomack avant de lancer l'animation
            if (window.webBrowser && window.webBrowser.isOpen()) {
                window.webBrowser.close(true); // forceClose = true
            }
            
            const ending = new EndingAnimation();
            ending.start();
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
        
        // Gestion de l'icône pause expansible
        if (this.elements.pausePanel) {
            const pauseIcon = document.getElementById('pauseIcon');
            if (pauseIcon) {
                pauseIcon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    if (this.elements.pausePanel.classList.contains('show')) {
                        this.elements.pausePanel.classList.toggle('expanded');
                    }
                });
            }
            
            // Fermer l'expansion si on clique à l'extérieur
            document.addEventListener('click', (e) => {
                if (this.elements.pausePanel.classList.contains('expanded') && 
                    !this.elements.pausePanel.contains(e.target)) {
                    this.elements.pausePanel.classList.remove('expanded');
                }
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
        
        // Croix de combo (avec cache)
        if (this.elements.comboCrosses) {
            if (!this.comboCrossesCache) {
                this.comboCrossesCache = this.elements.comboCrosses.querySelectorAll('.combo-cross');
            }
            this.comboCrossesCache.forEach((cross, index) => {
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
        // Récupérer le message traduit depuis i18n
        const message = window.i18n?.levelMessages?.[level];
        
        if (message && message !== this.currentMessage) {
            this.currentMessage = message;
            this.showSpiritualMessage(message);
        }
    }

    /**
     * Affiche un message de combo
     */
    showComboMessage(combo) {
        if (combo > 1) {
            const messages = window.i18n?.comboMessages || [];
            if (messages.length > 0) {
                const message = messages[Math.min(combo - 2, messages.length - 1)];
                this.effects.showSpiritualMessage(message, 2000);
            }
        }
    }

    /**
     * Affiche le combo de pop
     */
    showPopCombo(combo, count = 3) {
        const popComboDisplay = document.getElementById('popCombo');
        if (!popComboDisplay) return;
        
        // Annuler l'animation précédente
        if (this.popComboTimeout) {
            clearTimeout(this.popComboTimeout);
        }
        
        // Calculer l'intensité (3-4 cases = normal, 5-7 = medium, 8+ = intense)
        const intensity = count >= 8 ? 'mega' : count >= 5 ? 'big' : 'normal';
        
        // Texte plus dramatique selon l'intensité
        let popKey = 'pop.normal';
        if (count >= 8) {
            popKey = 'pop.mega';
        } else if (count >= 5) {
            popKey = 'pop.big';
        }
        
        const text = window.i18n ? window.i18n.t(popKey, { count: combo }) : `POP x${combo}!`;
        
        popComboDisplay.textContent = text;
        popComboDisplay.className = `pop-combo-display pop-${intensity}`;
        popComboDisplay.style.display = 'block';
        
        // Animation adaptée à l'intensité (direct, pas de setTimeout inutile)
        if (intensity === 'mega') {
            popComboDisplay.style.animation = 'comboPulseMega 0.8s ease-out';
        } else if (intensity === 'big') {
            popComboDisplay.style.animation = 'comboPulseBig 0.6s ease-out';
        } else {
            popComboDisplay.style.animation = 'comboPulse 0.5s ease-out';
        }
        
        // Cacher après un temps adapté
        const displayTime = intensity === 'mega' ? 2500 : intensity === 'big' ? 2200 : 2000;
        this.popComboTimeout = setTimeout(() => {
            popComboDisplay.style.display = 'none';
        }, displayTime);
    }

    /**
     * Met à jour l'affichage des swap dots
     */
    updateSwapDots(count) {
        if (!this.elements.swapDots) return;
        // Cache la liste des dots
        if (!this.swapDotsCache) {
            this.swapDotsCache = this.elements.swapDots.querySelectorAll('.swap-dot');
        }
        this.swapDotsCache.forEach((dot, index) => {
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
        // Cache la liste des charges
        if (!this.wallChargesCache) {
            this.wallChargesCache = this.elements.wallCharges.querySelectorAll('.wall-charge');
        }
        this.wallChargesCache.forEach((charge, index) => {
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
            msg.remove();
        }, 2000);
    }

    /**
     * Effet dynamique pour Wall Break avec son
     */
    showWallBreakEffect() {
        // Réutiliser l'élément existant ou le créer une seule fois
        let container = document.getElementById('wall-break-effect-display');
        if (!container) {
            container = document.createElement('div');
            container.id = 'wall-break-effect-display';
            container.className = 'wall-break-effect';
            container.innerHTML = `
                <div class="wall-break-icon">🧱</div>
                <div class="wall-break-text">WALL BREAK!</div>
                <div class="wall-break-particles"></div>
            `;
            document.body.appendChild(container);
            
            // Créer les particules une seule fois
            const particlesContainer = container.querySelector('.wall-break-particles');
            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'wall-particle';
                const angle = (Math.PI * 2 * i) / 20;
                const distance = 50 + Math.random() * 100;
                const x = Math.cos(angle) * distance;
                const y = Math.sin(angle) * distance;
                particle.style.setProperty('--tx', `${x}px`);
                particle.style.setProperty('--ty', `${y}px`);
                particle.style.animationDelay = `${Math.random() * 0.1}s`;
                particlesContainer.appendChild(particle);
            }
        }
        
        // Annuler l'animation précédente
        if (this.wallBreakTimeout) {
            clearTimeout(this.wallBreakTimeout);
        }
        
        container.style.display = 'block';
        container.style.animation = 'comboAppear 0.3s ease-out';
        
        // Son synthétique
        this.playWallBreakSound();
        
        this.wallBreakTimeout = setTimeout(() => {
            container.style.animation = 'comboDisappear 0.3s ease-out forwards';
            setTimeout(() => container.style.display = 'none', 300);
        }, 1500);
    }

    /**
     * Joue un son synthétique de bris métallique
     */
    playWallBreakSound() {
        if (!window.audioContext) {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const ctx = window.audioContext;
        const now = ctx.currentTime;
        
        // Premier "tine" (aigu)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(1200, now);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.1);
        gain1.gain.setValueAtTime(0.3, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.15);
        
        // Deuxième "tine" (plus aigu, légèrement décalé)
        setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(1400, now + 0.08);
            osc2.frequency.exponentialRampToValueAtTime(900, now + 0.18);
            gain2.gain.setValueAtTime(0.25, now + 0.08);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.23);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.08);
            osc2.stop(now + 0.23);
        }, 80);
        
        // Bruit de bris (white noise court)
        const bufferSize = ctx.sampleRate * 0.05;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        const noiseGain = ctx.createGain();
        noise.buffer = buffer;
        noiseGain.gain.setValueAtTime(0.15, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        noise.connect(noiseGain);
        noiseGain.connect(ctx.destination);
        noise.start(now);
    }

    /**
     * Effet dynamique pour Swap Earned avec son
     */
    showSwapEffect() {
        // Réutiliser l'élément existant ou le créer une seule fois
        let container = document.getElementById('swap-effect-display');
        if (!container) {
            container = document.createElement('div');
            container.id = 'swap-effect-display';
            container.className = 'swap-effect';
            container.innerHTML = `
                <div class="swap-icon">🔄</div>
                <div class="swap-text">SWAP EARNED!</div>
                <div class="swap-rings"></div>
            `;
            document.body.appendChild(container);
            
            // Créer les anneaux de rotation une seule fois
            const ringsContainer = container.querySelector('.swap-rings');
            for (let i = 0; i < 3; i++) {
                const ring = document.createElement('div');
                ring.className = 'swap-ring';
                ring.style.animationDelay = `${i * 0.15}s`;
                ringsContainer.appendChild(ring);
            }
        }
        
        // Annuler l'animation précédente
        if (this.swapTimeout) {
            clearTimeout(this.swapTimeout);
        }
        
        container.style.display = 'block';
        container.style.animation = 'comboAppear 0.3s ease-out';
        
        // Son synthétique
        this.playSwapSound();
        
        this.swapTimeout = setTimeout(() => {
            container.style.animation = 'comboDisappear 0.3s ease-out forwards';
            setTimeout(() => container.style.display = 'none', 300);
        }, 1500);
    }

    /**
     * Joue un son synthétique de swap (swoosh électronique)
     */
    playSwapSound() {
        if (!window.audioContext) {
            window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        const ctx = window.audioContext;
        const now = ctx.currentTime;
        
        // Swoosh montant (glissando rapide)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(200, now);
        osc1.frequency.exponentialRampToValueAtTime(800, now + 0.15);
        gain1.gain.setValueAtTime(0.2, now);
        gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.2);
        
        // Swoosh descendant (complète la rotation)
        setTimeout(() => {
            const osc2 = ctx.createOscillator();
            const gain2 = ctx.createGain();
            osc2.type = 'sine';
            osc2.frequency.setValueAtTime(600, now + 0.12);
            osc2.frequency.exponentialRampToValueAtTime(300, now + 0.25);
            gain2.gain.setValueAtTime(0.15, now + 0.12);
            gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.28);
            osc2.connect(gain2);
            gain2.connect(ctx.destination);
            osc2.start(now + 0.12);
            osc2.stop(now + 0.28);
        }, 120);
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
                // Ne pas auto-expand, laisser l'utilisateur cliquer
            } else {
                this.elements.pausePanel.classList.remove('show');
                this.elements.pausePanel.classList.remove('expanded');
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
        // Récupérer le message traduit depuis i18n
        const treasureMessage = window.i18n?.treasures?.[level];
        
        if (treasureMessage && this.elements.treasureModal) {
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
                this.elements.treasureMessage.textContent = treasureMessage;
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
        const localizedTrophy = window.i18n?.translations?.trophyData?.[trophy.id];
        if (this.elements.trophyName) {
            this.elements.trophyName.textContent = localizedTrophy?.name ?? trophy.name;
        }
        if (this.elements.trophyMessage) {
            this.elements.trophyMessage.textContent = localizedTrophy?.message ?? trophy.message;
        }
        
        // Ajouter les liens pour le trophée ultime
        const trophyContent = this.elements.trophyModal.querySelector('.trophy-modal-content');
        if (trophyContent) {
            // Supprimer les anciens liens s'ils existent
            const oldLinks = trophyContent.querySelector('.trophy-links');
            if (oldLinks) {
                oldLinks.remove();
            }
            
            // Ajouter les nouveaux liens si c'est le trophée ultime
            if (trophy.hasLinks && trophy.links) {
                const linksContainer = document.createElement('div');
                linksContainer.className = 'trophy-links';
                
                trophy.links.forEach(link => {
                    const btn = document.createElement('a');
                    btn.href = link.url;
                    btn.target = '_blank';
                    btn.className = 'trophy-link-btn';
                    btn.style.background = `linear-gradient(135deg, ${link.color} 0%, ${this.adjustColor(link.color, -20)} 100%)`;
                    btn.textContent = link.text;
                    linksContainer.appendChild(btn);
                });
                
                // Insérer avant le bouton de fermeture
                const closeBtn = trophyContent.querySelector('.trophy-close-btn');
                if (closeBtn) {
                    closeBtn.parentNode.insertBefore(linksContainer, closeBtn);
                } else {
                    trophyContent.appendChild(linksContainer);
                }
            }
        }
        
        // Afficher
        this.elements.trophyModal.classList.add('show');
        
        // Son et effets
        this.effects.screenFlash('#ffd700');
    }
    
    /**
     * Ajuster la couleur pour le dégradé
     */
    adjustColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = (num >> 16) + amt;
        const G = (num >> 8 & 0x00FF) + amt;
        const B = (num & 0x0000FF) + amt;
        return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
            (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
            (B < 255 ? B < 1 ? 0 : B : 255))
            .toString(16).slice(1);
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
            const isOpening = !this.elements.trophiesPanel.classList.contains('show');
            
            if (isOpening) {
                // Ouverture : mettre en pause si le jeu est en cours
                if (this.engine.isRunning && !this.engine.isPaused) {
                    this.engine.togglePause();
                    this.wasPausedByTrophiesPanel = false;
                } else {
                    this.wasPausedByTrophiesPanel = true;
                }
                
                // Mettre à jour l'affichage du profil à l'ouverture
                if (window.profileManager) {
                    window.profileManager.updateProfileDisplay();
                }
            } else {
                // Fermeture : reprendre si nécessaire
                if (!this.wasPausedByTrophiesPanel && this.engine.isRunning && this.engine.isPaused) {
                    this.engine.togglePause();
                }
            }
            
            this.elements.trophiesPanel.classList.toggle('show');
        }
    }
    
    /**
     * Ferme le panel des trophées
     */
    closeTrophiesPanel() {
        if (this.elements.trophiesPanel) {
            const wasOpen = this.elements.trophiesPanel.classList.contains('show');
            
            if (wasOpen) {
                // Reprendre le jeu si nécessaire
                if (!this.wasPausedByTrophiesPanel && this.engine.isRunning && this.engine.isPaused) {
                    this.engine.togglePause();
                }
            }
            
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
            specialHeader.setAttribute('data-i18n', 'trophies.specialTitle');
            specialHeader.textContent = window.i18n?.t('trophies.specialTitle') || '🏆 Trophées Spéciaux';
            this.elements.trophiesGrid.appendChild(specialHeader);
            
            specialTrophies.forEach(trophy => {
                this.elements.trophiesGrid.appendChild(this.createTrophyCard(trophy));
            });
        }
        
        // Section médailles de niveau
        if (medals.length > 0) {
            const medalsHeader = document.createElement('div');
            medalsHeader.style.cssText = 'grid-column: 1; margin: 20px 0 10px; color: #ffd700; font-size: 18px; font-weight: bold; text-transform: uppercase; letter-spacing: 2px;';
            medalsHeader.setAttribute('data-i18n', 'trophies.medalsTitle');
            medalsHeader.textContent = window.i18n?.t('trophies.medalsTitle') || '🥇 Médailles de Niveau';
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
        
        // Obtenir les traductions si disponibles
        const translations = window.i18n?.translations;
        
        let conditionText = '';
        if (translations?.conditions) {
            const template = translations.conditions[trophy.condition.type];
            if (template) {
                conditionText = template.replace('{value}', trophy.condition.value.toLocaleString());
            }
        }
        
        // Fallback si pas de traduction
        if (!conditionText) {
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
        }
        
        let displayName = trophy.name;
        let displayMessage = trophy.message;
        
        // Vérifier si c'est un trophée spécial avec traduction
        if (translations?.trophyData?.[trophy.id]) {
            const trophyData = translations.trophyData[trophy.id];
            displayName = trophyData.name;
            displayMessage = trophyData.message;
        }
        // Pour les médailles de niveau, utiliser les traductions génériques
        else if (trophy.id?.startsWith('level_') && translations?.medals) {
            const level = trophy.condition.value;
            displayName = translations.medals.levelName.replace('{level}', level);
            displayMessage = translations.medals.messages[level] || 
                            translations.medals.messages.default.replace('{level}', level);
        }
        
        card.innerHTML = `
            <div class="trophy-card-header">
                <div class="trophy-card-icon">${trophy.icon}</div>
                <div class="trophy-card-info">
                    <div class="trophy-card-name">${displayName}</div>
                    <div class="trophy-card-condition">${conditionText}</div>
                </div>
            </div>
            <div class="trophy-card-message">${trophy.unlocked ? displayMessage : '🔒'}</div>
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
