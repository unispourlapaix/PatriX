/**
 * PATRIX - Effets Visuels et Particules
 * ID: E-manuel-effects
 * Auteur: Emmanuel Payet
 */

class VisualEffects {
    constructor(containerElement) {
        this.container = containerElement;
    }

    /**
     * Crée une explosion de particules dorées
     * @param {number} x - Position X (px)
     * @param {number} y - Position Y (px)
     * @param {number} count - Nombre de particules
     */
    createExplosion(x, y, count = 8) {
        const gameWrapper = document.querySelector('.game-wrapper');
        const wrapperRect = gameWrapper ? gameWrapper.getBoundingClientRect() : { left: 0, top: 0 };
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            particle.textContent = '✨';
            
            const angle = (Math.PI * 2 * i) / count;
            const distance = 50 + Math.random() * 50;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            particle.style.cssText = `
                position: absolute;
                left: ${x - wrapperRect.left}px;
                top: ${y - wrapperRect.top}px;
                --dx: ${dx}px;
                --dy: ${dy}px;
                pointer-events: none;
                font-size: ${16 + Math.random() * 8}px;
                color: ${CONFIG.COLORS.PARTICLE};
                z-index: 1000;
            `;
            
            (gameWrapper || this.container).appendChild(particle);
            
            // Nettoie après l'animation
            setTimeout(() => {
                particle.remove();
            }, 1000);
        }
    }

    /**
     * Crée des particules de lumière qui montent
     * @param {number} lineY - Position Y de la ligne (index)
     */
    createLightParticles(lineY) {
        const gameWrapper = document.querySelector('.game-wrapper');
        const boardRect = document.getElementById('gameBoard').getBoundingClientRect();
        const wrapperRect = gameWrapper ? gameWrapper.getBoundingClientRect() : { left: 0, top: 0 };
        const cellSize = CONFIG.GRID.CELL_SIZE + CONFIG.GRID.GAP;
        const particleCount = CONFIG.GRID.COLS * 2;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'light-particle';
            particle.textContent = ['✨', '💫', '⭐', '🌟'][Math.floor(Math.random() * 4)];
            
            const x = (boardRect.left - wrapperRect.left) + (Math.random() * CONFIG.GRID.COLS * cellSize);
            const y = (boardRect.top - wrapperRect.top) + (lineY * cellSize);
            
            particle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
                font-size: 12px;
                color: ${CONFIG.COLORS.PARTICLE};
                z-index: 1000;
                animation: floatUp 1.5s ease-out forwards;
            `;
            
            (gameWrapper || document.body).appendChild(particle);
            
            setTimeout(() => particle.remove(), 1500);
        }
    }

    /**
     * Anime une transformation ombre → lumière
     * @param {HTMLElement} cellElement - Élément de la cellule
     */
    animateTransformation(cellElement) {
        cellElement.style.transition = 'all 0.6s ease-out';
        cellElement.style.transform = 'scale(1.2)';
        cellElement.style.boxShadow = `0 0 20px ${CONFIG.COLORS.GLOW}`;
        
        setTimeout(() => {
            cellElement.style.transform = 'scale(1)';
        }, 300);
    }

    /**
     * Flash de l'écran (pour événements spéciaux)
     * @param {string} color - Couleur du flash
     */
    screenFlash(color = CONFIG.COLORS.GLOW) {
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: ${color};
            opacity: 0.3;
            pointer-events: none;
            z-index: 9999;
            animation: flashFade 0.5s ease-out forwards;
        `;
        
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 500);
    }

    /**
     * Anime la grille avec un effet de shake
     */
    shakeBoard() {
        const board = document.getElementById('gameBoard');
        if (board) {
            board.classList.add('shaking');
            setTimeout(() => {
                board.classList.remove('shaking');
            }, 400);
        }
    }

    /**
     * Crée une explosion sur le mur
     * @param {number} direction - Direction du mur (-1 gauche, 1 droite)
     * @param {Object} piece - Pièce en cours
     */
    createWallExplosion(direction, piece) {
        const board = document.getElementById('gameBoard');
        if (!board) return;
        
        const gameWrapper = document.querySelector('.game-wrapper');
        const boardRect = board.getBoundingClientRect();
        const wrapperRect = gameWrapper ? gameWrapper.getBoundingClientRect() : { left: 0, top: 0 };
        const cellSize = CONFIG.GRID.CELL_SIZE + CONFIG.GRID.GAP;
        
        // Position de l'explosion
        const x = (direction === -1 ? boardRect.left : boardRect.right) - wrapperRect.left;
        const y = (boardRect.top - wrapperRect.top) + (piece.y * cellSize) + (piece.shape.length * cellSize / 2);
        
        // Particules d'explosion
        for (let i = 0; i < 12; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            particle.textContent = ['💥', '✨', '⚡', '💫'][Math.floor(Math.random() * 4)];
            
            const angle = (Math.PI * 2 * i) / 12;
            const distance = 40 + Math.random() * 40;
            const dx = Math.cos(angle) * distance * (direction === -1 ? -1 : 1);
            const dy = Math.sin(angle) * distance;
            
            particle.style.cssText = `
                position: absolute;
                left: ${x}px;
                top: ${y}px;
                --dx: ${dx}px;
                --dy: ${dy}px;
                pointer-events: none;
                font-size: ${14 + Math.random() * 8}px;
                color: #ff8c00;
                z-index: 1000;
            `;
            
            (gameWrapper || document.body).appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
        
        // Flash sur le côté
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            ${direction === -1 ? 'left' : 'right'}: 0;
            top: 0;
            width: 100px;
            height: 100vh;
            background: linear-gradient(
                ${direction === -1 ? '90deg' : '-90deg'},
                rgba(255, 140, 0, 0.6),
                transparent
            );
            pointer-events: none;
            z-index: 999;
            animation: flashFade 0.3s ease-out forwards;
        `;
        
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 300);
    }

    /**
     * Crée une explosion pour un groupe popé
     * @param {Array} group - Groupe de cellules {row, col}
     * @param {number} combo - Niveau de combo
     */
    createPopExplosion(group, combo) {
        const board = document.getElementById('gameBoard');
        if (!board) return;
        
        const boardRect = board.getBoundingClientRect();
        const cellSize = CONFIG.GRID.CELL_SIZE + CONFIG.GRID.GAP;
        
        // Exploser chaque cellule du groupe
        group.forEach(({ row, col }) => {
            const x = boardRect.left + (col * cellSize) + (cellSize / 2);
            const y = boardRect.top + (row * cellSize) + (cellSize / 2);
            
            // Particules pour chaque cellule
            for (let i = 0; i < 6; i++) {
                const particle = document.createElement('div');
                particle.className = 'explosion-particle';
                particle.textContent = ['⭐', '✨', '💫', '🌟'][Math.floor(Math.random() * 4)];
                
                const angle = (Math.PI * 2 * i) / 6;
                const distance = 30 + Math.random() * 30;
                const dx = Math.cos(angle) * distance;
                const dy = Math.sin(angle) * distance;
                
                particle.style.cssText = `
                    position: fixed;
                    left: ${x}px;
                    top: ${y}px;
                    --dx: ${dx}px;
                    --dy: ${dy}px;
                    pointer-events: none;
                    font-size: ${12 + Math.random() * 6}px;
                    color: ${combo > 1 ? '#ff8c00' : '#ffd700'};
                    z-index: 1000;
                `;
                
                document.body.appendChild(particle);
                setTimeout(() => particle.remove(), 1000);
            }
        });
        
        // Message combo si > 1
        if (combo > 1) {
            this.showComboMessage(combo, group.length);
        }
    }

    /**
     * Affiche le message de combo
     * @param {number} combo - Niveau de combo
     * @param {number} count - Nombre de cases
     */
    showComboMessage(combo, count) {
        const msg = document.createElement('div');
        msg.className = 'combo-message';
        
        // Messages spéciaux basés sur le combo ET la taille
        let comboText = `COMBO x${combo}!`;
        let extraText = `${count} blocs 💥`;
        let borderColor = '#ff8c00';
        let glowIntensity = 30;
        let emoji = '💥';
        
        // Mega combos basés sur le niveau
        if (combo >= 10) {
            comboText = `🌟💫 ULTIME COMBO x${combo}! 💫🌟`;
            emoji = '🎆';
            borderColor = '#ff1493';
            glowIntensity = 60;
        } else if (combo >= 8) {
            comboText = `⚡🔥 LEGENDAIRE x${combo}! 🔥⚡`;
            emoji = '💎';
            borderColor = '#ff4500';
            glowIntensity = 55;
        } else if (combo >= 6) {
            comboText = `🌟 INCROYABLE x${combo}! 🌟`;
            emoji = '🔥';
            borderColor = '#ff6347';
            glowIntensity = 50;
        } else if (combo >= 5) {
            comboText = `🔥 MEGA COMBO x${combo}! 🔥`;
            emoji = '⚡';
            borderColor = '#ff8c00';
            glowIntensity = 45;
        } else if (combo >= 3) {
            comboText = `⚡ SUPER COMBO x${combo}! ⚡`;
            emoji = '✨';
            borderColor = '#ffa500';
            glowIntensity = 40;
        }
        
        // Bonus pour grandes connexions
        if (count >= 15) {
            extraText = `${count} blocs! ÉNORME! 🎆`;
        } else if (count >= 12) {
            extraText = `${count} blocs! MASSIF! 💎`;
        } else if (count >= 10) {
            extraText = `${count} blocs! IMMENSE! ${emoji}`;
        } else if (count >= 8) {
            extraText = `${count} blocs! GÉANT! ${emoji}`;
        } else if (count >= 6) {
            extraText = `${count} blocs ${emoji}`;
        }
        
        msg.innerHTML = `
            <div style="font-size: 2em; font-weight: bold; color: #ff8c00;">
                ${comboText}
            </div>
            <div style="font-size: 1.2em; color: #ffd700;">
                ${extraText}
            </div>
        `;
        msg.style.cssText = `
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(0, 0, 0, 0.9), rgba(26, 26, 46, 0.9));
            border: 3px solid ${borderColor};
            padding: 20px 40px;
            border-radius: 15px;
            text-align: center;
            z-index: 10000;
            animation: comboAppear 0.3s ease-out;
            box-shadow: 0 0 ${glowIntensity}px ${borderColor === '#ff1493' ? 'rgba(255, 20, 147, 0.9)' : (combo >= 5 ? 'rgba(255, 69, 0, 0.9)' : 'rgba(255, 140, 0, 0.8)')};
        `;
        
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.style.animation = 'comboDisappear 0.3s ease-out forwards';
            setTimeout(() => msg.remove(), 300);
        }, 1500);
    }

    /**
     * Affiche le message de lignes complétées
     * @param {number} count - Nombre de lignes (1-4)
     * @param {number} combo - Niveau de combo
     */
    showLineMessage(count, combo) {
        const msg = document.createElement('div');
        msg.className = 'line-message';
        
        let lineText = '';
        let emoji = '✨';
        let borderColor = '#4fc3f7';
        let glowIntensity = 25;
        
        // Messages basés sur le nombre de lignes
        if (count === 4) {
            lineText = '🎆 PATRIX! 4 LIGNES! 🎆';
            emoji = '🏆';
            borderColor = '#ff1493';
            glowIntensity = 50;
        } else if (count === 3) {
            lineText = '🔥 TRIPLE! 3 LIGNES! 🔥';
            emoji = '⭐';
            borderColor = '#ff8c00';
            glowIntensity = 40;
        } else if (count === 2) {
            lineText = '⚡ DOUBLE! 2 LIGNES! ⚡';
            emoji = '💫';
            borderColor = '#ffa500';
            glowIntensity = 35;
        } else if (count === 1) {
            lineText = '✨ LIGNE COMPLÈTE! ✨';
            emoji = '✅';
            borderColor = '#4fc3f7';
            glowIntensity = 30;
        }
        
        // Bonus combo
        let comboBonus = '';
        if (combo >= 10) {
            comboBonus = `<div style="font-size: 1.3em; color: #ff1493; margin-top: 8px;">🎉 COMBO ULTIME x${combo}! 🎉</div>`;
            glowIntensity += 20;
        } else if (combo >= 7) {
            comboBonus = `<div style="font-size: 1.2em; color: #ff4500; margin-top: 8px;">🔥 COMBO MASSIF x${combo}! 🔥</div>`;
            glowIntensity += 15;
        } else if (combo >= 5) {
            comboBonus = `<div style="font-size: 1.1em; color: #ff8c00; margin-top: 8px;">⚡ COMBO GÉANT x${combo}! ⚡</div>`;
            glowIntensity += 10;
        } else if (combo >= 3) {
            comboBonus = `<div style="font-size: 1em; color: #ffa500; margin-top: 8px;">💫 COMBO x${combo}! 💫</div>`;
            glowIntensity += 5;
        }
        
        msg.innerHTML = `
            <div style="font-size: 1.8em; font-weight: bold; color: ${borderColor};">
                ${lineText}
            </div>
            ${comboBonus}
        `;
        msg.style.cssText = `
            position: fixed;
            top: 40%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 241, 232, 0.95));
            border: 3px solid #d4af37;
            padding: 18px 35px;
            border-radius: 12px;
            text-align: center;
            z-index: 9999;
            animation: comboAppear 0.3s ease-out;
            box-shadow: 0 10px 40px rgba(212, 175, 55, 0.4), 
                        inset 0 0 30px rgba(255, 255, 255, 0.5),
                        0 0 ${glowIntensity}px rgba(212, 175, 55, 0.6);
        `;
        
        document.body.appendChild(msg);
        
        setTimeout(() => {
            msg.style.animation = 'comboDisappear 0.3s ease-out forwards';
            setTimeout(() => msg.remove(), 300);
        }, 1200);
    }

    /**
     * Fait tomber et se briser une pièce aléatoire (effet de début de niveau)
     * @param {number} level - Niveau actuel
     */
    createLevelBreakEffect(level) {
        const boardRect = document.getElementById('gameBoard').getBoundingClientRect();
        const cellSize = CONFIG.GRID.CELL_SIZE + CONFIG.GRID.GAP;
        
        // Créer une pièce aléatoire
        const piece = createRandomPiece();
        const pieceElement = document.createElement('div');
        pieceElement.className = 'level-break-piece';
        
        // Position de départ (en haut au centre)
        const startX = boardRect.left + (CONFIG.GRID.COLS / 2 * cellSize);
        const startY = boardRect.top - 100;
        
        pieceElement.style.cssText = `
            position: fixed;
            left: ${startX}px;
            top: ${startY}px;
            font-size: 48px;
            z-index: 9999;
            pointer-events: none;
            transition: all 0.8s cubic-bezier(0.5, 0, 0.75, 0);
        `;
        pieceElement.textContent = piece.icon;
        
        document.body.appendChild(pieceElement);
        
        // Animation de chute
        setTimeout(() => {
            pieceElement.style.top = `${boardRect.top + boardRect.height / 2}px`;
            pieceElement.style.transform = 'rotate(360deg) scale(1.5)';
        }, 50);
        
        // Explosion en morceaux après la chute
        setTimeout(() => {
            pieceElement.remove();
            
            // Créer les fragments
            const fragmentCount = 8 + Math.floor(Math.random() * 4);
            for (let i = 0; i < fragmentCount; i++) {
                const fragment = document.createElement('div');
                fragment.className = 'piece-fragment';
                fragment.textContent = ['✨', '💫', piece.icon, '⭐'][Math.floor(Math.random() * 4)];
                
                const angle = (Math.PI * 2 * i) / fragmentCount + (Math.random() - 0.5);
                const distance = 80 + Math.random() * 120;
                const dx = Math.cos(angle) * distance;
                const dy = Math.sin(angle) * distance - 50; // Biais vers le haut
                
                fragment.style.cssText = `
                    position: fixed;
                    left: ${startX}px;
                    top: ${boardRect.top + boardRect.height / 2}px;
                    font-size: ${20 + Math.random() * 16}px;
                    z-index: 9999;
                    pointer-events: none;
                    animation: fragmentExplode 1.2s ease-out forwards;
                    --dx: ${dx}px;
                    --dy: ${dy}px;
                    --rotation: ${Math.random() * 720 - 360}deg;
                `;
                
                document.body.appendChild(fragment);
                
                setTimeout(() => fragment.remove(), 1200);
            }
            
            // Flash et message de niveau
            this.screenFlash('#ffd700', 0.3);
            
            // Mots d'encouragement qui montent au ciel
            this.createRisingWords(level);
            
            setTimeout(() => {
                this.showSpiritualMessage(`NIVEAU ${level + 1}`, 2000);
            }, 300);
        }, 850);
    }

    /**
     * Crée des mots d'encouragement qui montent vers le ciel
     * @param {number} level - Niveau actuel
     */
    createRisingWords(level) {
        const boardRect = document.getElementById('gameBoard').getBoundingClientRect();
        const words = CONFIG.MESSAGES.ENCOURAGEMENTS;
        const wordCount = 8 + Math.floor(level / 5); // Plus de mots pour les niveaux élevés
        
        for (let i = 0; i < Math.min(wordCount, 15); i++) {
            const word = words[Math.floor(Math.random() * words.length)];
            const wordElement = document.createElement('div');
            wordElement.className = 'rising-word';
            wordElement.textContent = word;
            
            // Position aléatoire sur la largeur de l'écran
            const x = Math.random() * window.innerWidth;
            const startY = boardRect.bottom + Math.random() * 100;
            
            // Couleurs variées
            const colors = ['#ffd700', '#ff8c00', '#ffeb3b', '#4fc3f7', '#ff6b9d', '#ba68c8'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            wordElement.style.cssText = `
                position: fixed;
                left: ${x}px;
                top: ${startY}px;
                font-size: ${18 + Math.random() * 12}px;
                font-weight: bold;
                color: ${color};
                text-shadow: 0 0 10px ${color}, 0 0 20px ${color};
                pointer-events: none;
                z-index: 9998;
                opacity: 1;
                animation: riseToHeaven ${2 + Math.random() * 2}s ease-out forwards;
                animation-delay: ${i * 0.1}s;
            `;
            
            document.body.appendChild(wordElement);
            
            setTimeout(() => wordElement.remove(), 4000 + (i * 100));
        }
    }

    /**
     * Animation spectaculaire pour les combos
     * @param {number} comboCount - Nombre de lignes dans le combo
     * @param {number} x - Position X
     * @param {number} y - Position Y
     */
    createComboAnimation(comboCount, x, y) {
        const gameWrapper = document.querySelector('.game-wrapper');
        const wrapperRect = gameWrapper ? gameWrapper.getBoundingClientRect() : { left: 0, top: 0 };
        
        // Texte du combo avec effet explosif
        const comboText = document.createElement('div');
        comboText.className = 'combo-text';
        
        let comboMessage = '';
        let comboColor = '#FFD700';
        let comboScale = 1;
        
        if (comboCount === 2) {
            comboMessage = 'DOUBLE! x2';
            comboColor = '#FFD700';
            comboScale = 1.2;
        } else if (comboCount === 3) {
            comboMessage = 'TRIPLE! x3';
            comboColor = '#FF6B6B';
            comboScale = 1.5;
        } else if (comboCount === 4) {
            comboMessage = 'TETRIS! x4';
            comboColor = '#4ECDC4';
            comboScale = 1.8;
        } else if (comboCount >= 5) {
            comboMessage = `MEGA COMBO! x${comboCount}`;
            comboColor = '#FF00FF';
            comboScale = 2;
        }
        
        comboText.textContent = comboMessage;
        comboText.style.cssText = `
            position: absolute;
            left: ${x - wrapperRect.left}px;
            top: ${y - wrapperRect.top}px;
            transform: translate(-50%, -50%) scale(0);
            color: ${comboColor};
            font-size: ${40 * comboScale}px;
            font-weight: 900;
            text-shadow: 
                0 0 10px ${comboColor},
                0 0 20px ${comboColor},
                0 0 30px ${comboColor},
                2px 2px 0 #000,
                -2px -2px 0 #000,
                2px -2px 0 #000,
                -2px 2px 0 #000;
            z-index: 10001;
            pointer-events: none;
            animation: comboExplode 1.2s cubic-bezier(0.34, 1.56, 0.64, 1);
            white-space: nowrap;
        `;
        
        (gameWrapper || document.body).appendChild(comboText);
        
        // Particules explosives en cercle
        const particleCount = comboCount * 8;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'combo-particle';
            
            const angle = (Math.PI * 2 * i) / particleCount;
            const distance = 80 + Math.random() * 80;
            const dx = Math.cos(angle) * distance;
            const dy = Math.sin(angle) * distance;
            
            const particleEmojis = ['✨', '⭐', '💫', '🌟', '✦', '🔥', '💥'];
            particle.textContent = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];
            
            particle.style.cssText = `
                position: absolute;
                left: ${x - wrapperRect.left}px;
                top: ${y - wrapperRect.top}px;
                font-size: ${20 + Math.random() * 15}px;
                color: ${comboColor};
                z-index: 10000;
                pointer-events: none;
                animation: comboParticle 1s ease-out forwards;
                --dx: ${dx}px;
                --dy: ${dy}px;
                filter: drop-shadow(0 0 8px ${comboColor});
            `;
            
            (gameWrapper || document.body).appendChild(particle);
            
            setTimeout(() => particle.remove(), 1000);
        }
        
        // Cercles d'onde de choc
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                const shockwave = document.createElement('div');
                shockwave.className = 'combo-shockwave';
                shockwave.style.cssText = `
                    position: absolute;
                    left: ${x - wrapperRect.left}px;
                    top: ${y - wrapperRect.top}px;
                    width: 20px;
                    height: 20px;
                    border: 3px solid ${comboColor};
                    border-radius: 50%;
                    transform: translate(-50%, -50%) scale(0);
                    z-index: 9999;
                    pointer-events: none;
                    animation: shockwaveExpand 0.8s ease-out forwards;
                    box-shadow: 0 0 20px ${comboColor};
                `;
                
                (gameWrapper || document.body).appendChild(shockwave);
                
                setTimeout(() => shockwave.remove(), 800);
            }, i * 150);
        }
        
        // Flash d'écran pour les gros combos
        if (comboCount >= 4) {
            const flash = document.createElement('div');
            flash.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: ${comboColor};
                opacity: 0;
                z-index: 9998;
                pointer-events: none;
                animation: screenFlash 0.3s ease-out;
            `;
            
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 300);
        }
        
        setTimeout(() => comboText.remove(), 1200);
    }

    /**
     * Affiche un message spirituel animé
     * @param {string} message - Message à afficher
     * @param {number} duration - Durée d'affichage (ms)
     */
    showSpiritualMessage(message, duration = 3000) {
        const msgElement = document.createElement('div');
        msgElement.className = 'spiritual-message';
        msgElement.textContent = message;
        msgElement.style.cssText = `
            position: fixed;
            top: 30%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(245, 241, 232, 0.95));
            color: #d4af37;
            padding: 20px 40px;
            border-radius: 12px;
            border: 3px solid #d4af37;
            font-size: 1.3em;
            font-weight: 600;
            text-align: center;
            box-shadow: 0 10px 40px rgba(212, 175, 55, 0.4), inset 0 0 30px rgba(255, 255, 255, 0.5);
            z-index: 10000;
            animation: messageAppear 0.5s ease-out;
            max-width: 80%;
            letter-spacing: 1px;
        `;
        
        document.body.appendChild(msgElement);
        
        setTimeout(() => {
            msgElement.style.animation = 'messageDisappear 0.5s ease-out forwards';
            setTimeout(() => msgElement.remove(), 500);
        }, duration);
    }
}

// Rendre disponible globalement
window.VisualEffects = VisualEffects;

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = VisualEffects;
}
