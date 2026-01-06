/**
 * PATRIX - Animation de Fin
 * Animation géométrique du chat noir contre les concombres
 * Style: Pastel abstrait manga
 * Auteur: Emmanuel Payet
 */

class EndingAnimation {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.animationFrame = null;
        this.scene = 'intro'; // intro, battle, journey, lighthouse, end
        this.progress = 0;
        this.catPos = { x: 100, y: 300 };
        this.cucumbers = [];
        this.particles = [];
        this.particlePool = []; // Pool pour réutiliser particules
        this.maxParticles = 100; // Limite pour éviter surcharge
        this.music = null;
        this.popupOpened = false;
        this.bgGradient = null;
        this.audioContext = null;
        this.lastStepTime = 0;
        this.battleSoundPlayed = false;
        this.victorySoundPlayed = false;
        this.lastFrameTime = 0; // Pour throttle FPS
    }

    /**
     * Initialise le contexte audio
     */
    initAudio() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
    }

    /**
     * Son de combat (impact)
     */
    playCombatSound() {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(150, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, this.audioContext.currentTime + 0.1);
        
        gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.1);
    }

    /**
     * Son de victoire (boss vaincu)
     */
    playVictorySound() {
        if (!this.audioContext) return;
        
        const times = [0, 0.1, 0.2];
        const freqs = [523.25, 659.25, 783.99]; // Do, Mi, Sol
        
        times.forEach((time, i) => {
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freqs[i], this.audioContext.currentTime + time);
            
            gainNode.gain.setValueAtTime(0.2, this.audioContext.currentTime + time);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + time + 0.3);
            
            oscillator.start(this.audioContext.currentTime + time);
            oscillator.stop(this.audioContext.currentTime + time + 0.3);
        });
    }

    /**
     * Bruit de pas
     */
    playStepSound() {
        if (!this.audioContext) return;
        
        const now = this.audioContext.currentTime;
        
        // Bruit blanc court
        const bufferSize = this.audioContext.sampleRate * 0.05;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const output = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        
        const noise = this.audioContext.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.audioContext.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(300, now);
        
        const gainNode = this.audioContext.createGain();
        gainNode.gain.setValueAtTime(0.15, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        noise.start(now);
        noise.stop(now + 0.05);
    }

    /**
     * Démarre l'animation de fin
     */
    start() {
        // Créer le conteneur modal
        const modal = document.createElement('div');
        modal.id = 'endingModal';
        modal.className = 'ending-modal';
        modal.innerHTML = `
            <div class="ending-content">
                <canvas id="endingCanvas" width="800" height="600"></canvas>
                <button class="ending-skip" id="endingSkip">Passer ⏩</button>
            </div>
        `;
        document.body.appendChild(modal);

        this.canvas = document.getElementById('endingCanvas');
        this.ctx = this.canvas.getContext('2d');

        // Adapter au viewport
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        // Bouton skip
        document.getElementById('endingSkip').addEventListener('click', () => {
            this.stop();
        });

        // Initialiser les concombres
        this.initCucumbers();

        // Initialiser l'audio
        this.initAudio();

        // Lancer la musique d'animation
        this.music = new Audio('public/hero_principal_92k.mp3');
        this.music.volume = 0.7;
        this.music.loop = false;
        this.music.play().catch(err => console.log('Erreur lecture audio:', err));

        // Lancer l'animation
        this.animate();
    }

    resizeCanvas() {
        // Contrainte de largeur maximale pour PC (600px comme le jeu)
        const maxWidth = 600;
        const canvasWidth = Math.min(maxWidth, window.innerWidth);
        const canvasHeight = window.innerHeight - 60;
        
        this.canvas.width = canvasWidth;
        this.canvas.height = canvasHeight;
    }

    initCucumbers() {
        // Concombres normaux en formation autour du chat (adapté mobile)
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const positions = [
            { x: centerX - 70, y: centerY - 100 },  // Haut gauche
            { x: centerX, y: centerY - 110 },        // Haut centre
            { x: centerX + 70, y: centerY - 100 },  // Haut droite
            { x: centerX - 90, y: centerY - 20 },   // Gauche
            { x: centerX + 90, y: centerY - 20 },   // Droite
            { x: centerX - 70, y: centerY + 50 },   // Bas gauche
            { x: centerX + 70, y: centerY + 50 }    // Bas droite
        ];
        
        positions.forEach(pos => {
            this.cucumbers.push({
                x: pos.x,
                y: pos.y,
                width: 25,
                height: 65,
                rotation: 0,
                defeated: false,
                hp: 3,
                isBoss: false
            });
        });
        
        // Boss concombre avec cape noire (EN BAS du chat)
        this.cucumbers.push({
            x: centerX,
            y: centerY + 90,
            width: 40,
            height: 100,
            rotation: 0,
            defeated: false,
            hp: 10,
            isBoss: true
        });
    }

    animate() {
        // Throttle: render à 45 FPS pour animation fluide
        if (!this.lastFrameTime) this.lastFrameTime = 0;
        const now = performance.now();
        const elapsed = now - this.lastFrameTime;
        
        // Skip frame si < 22ms (45 FPS)
        if (elapsed < 22) {
            this.animationFrame = requestAnimationFrame(() => this.animate());
            return;
        }
        
        this.lastFrameTime = now;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Fond dégradé pastel (créé une seule fois - déjà optimisé)
        if (!this.bgGradient) {
            this.bgGradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
            this.bgGradient.addColorStop(0, '#e8f5e9');
            this.bgGradient.addColorStop(0.5, '#fff9e6');
            this.bgGradient.addColorStop(1, '#ffe8e8');
        }
        this.ctx.fillStyle = this.bgGradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.progress += 0.02; // Doublé de 0.01 à 0.02

        switch(this.scene) {
            case 'intro':
                this.drawIntro();
                if (this.progress > 1.5) { // Réduit de 2 à 1.5s
                    this.scene = 'battle';
                    this.progress = 0;
                }
                break;
            case 'battle':
                this.drawBattle();
                if (this.cucumbers.every(c => c.defeated)) {
                    this.scene = 'journey';
                    this.progress = 0;
                }
                break;
            case 'journey':
                this.drawJourney();
                if (this.progress > 5) { // Réduit de 7 à 5s
                    this.scene = 'lighthouse';
                    this.progress = 0;
                }
                break;
            case 'lighthouse':
                this.drawLighthouse();
                if (this.progress > 5) { // Réduit de 7 à 5s
                    this.scene = 'end';
                    this.progress = 0;
                }
                break;
            case 'end':
                this.drawEnd();
                // Ouvrir le popup après 4s (réduit de 6s)
                if (this.progress > 4 && !this.popupOpened) {
                    this.popupOpened = true;
                    // Arrêter l'animation et ouvrir le popup du livre automatiquement
                    if (this.animationFrame) {
                        cancelAnimationFrame(this.animationFrame);
                        this.animationFrame = null;
                    }
                    // Ouvrir le popup du livre après un court délai
                    setTimeout(() => this.openBookModal(), 500);
                    return; // Sortir immédiatement
                }
                break;
        }

        if (this.animationFrame !== null || this.scene !== 'end' || this.progress <= 6) {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        }
    }

    drawIntro() {
        // Titre
        this.ctx.fillStyle = '#333';
        this.ctx.font = 'bold 32px Arial';
        this.ctx.textAlign = 'center';
        const alpha = Math.min(1, this.progress / 1);
        this.ctx.globalAlpha = alpha;
        this.ctx.fillText(window.i18n?.t('endingAnimation.congratulations') || 'Félicitations!', this.canvas.width / 2, 100);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(window.i18n?.t('endingAnimation.maxLevelReached') || 'Niveau Maximum Atteint', this.canvas.width / 2, 140);
        this.ctx.globalAlpha = 1;

        // Chat apparaît
        if (this.progress > 1) {
            this.drawCat(this.catPos.x, this.catPos.y);
        }
    }

    drawBattle() {
        const boss = this.cucumbers.find(c => c.isBoss && !c.defeated);
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        // Son de combat au début de la bataille
        if (this.progress > 0.5 && !this.battleSoundPlayed) {
            this.playCombatSound();
            this.battleSoundPlayed = true;
        }
        
        // Phase 1 (0-2s): Concombres entourent le chat, boss en bas
        if (this.progress < 2) {
            this.catPos.x += (centerX - this.catPos.x) * 0.03;
            this.catPos.y += (centerY - this.catPos.y) * 0.03;
        }
        // Phase 2 (2-4s): Pause, dialogues
        else if (this.progress < 4) {
            // Les personnages restent en place, tension
        }
        // Phase 3 (4-6s): Chat saute pour attaquer ceux d'en haut
        else if (this.progress < 6) {
            const jumpProgress = (this.progress - 4) / 2;
            const jumpHeight = Math.sin(jumpProgress * Math.PI) * 100;
            this.catPos.y = centerY - jumpHeight;
            
            // Son de combat pendant le saut
            if (jumpProgress > 0.3 && jumpProgress < 0.35) {
                this.playCombatSound();
            }
        }
        // Phase 4 (6-8s): Chat se positionne derrière le boss et l'EXPULSE !
        else if (this.progress < 8) {
            // Chat descend et se positionne derrière le boss
            const phase4Progress = this.progress - 6;
            if (phase4Progress < 0.5) {
                // Chat se déplace derrière le boss (en bas)
                const targetY = centerY + 120;
                this.catPos.y += (targetY - this.catPos.y) * 0.1;
            } else {
                // Chat reste derrière le boss
                this.catPos.y = centerY + 120;
            }
        }

        this.drawCat(this.catPos.x, this.catPos.y);
        
        // Boss est expulsé à 45 degrés en phase 4 (seulement s'il n'est pas déjà vaincu)
        if (boss && !boss.defeated && this.progress > 6.5 && this.progress < 8) {
            const expulseProgress = (this.progress - 6.5) / 1.5;
            // Mouvement à 45° : diagonal vers le haut-droit
            boss.x = centerX + expulseProgress * 250; // Mouvement horizontal
            boss.y = centerY + 100 - expulseProgress * 350; // Mouvement vertical
            
            // Son de victoire quand le boss est vaincu
            if (expulseProgress >= 0.9 && !this.victorySoundPlayed) {
                this.playVictorySound();
                this.victorySoundPlayed = true;
            }
            
            // Marquer le boss comme vaincu à la fin de l'expulsion avec explosion coordonnée
            if (expulseProgress >= 0.9 && !boss.defeated) {
                boss.defeated = true;
                this.createDefeatParticles(boss.x, boss.y, true); // true pour boss = plus de particules
            }
        }

        // Concombres (batch drawing pour performance)
        this.ctx.save();
        this.cucumbers.forEach((cucumber, index) => {
            if (!cucumber.defeated) {
                this.drawCucumber(cucumber);
                
                // Ne pas attaquer le boss pendant la phase d'expulsion
                if (cucumber.isBoss && this.progress > 6.5) {
                    return;
                }
                
                // Combat: concombres d'en haut vaincus pendant le saut (Phase 1)
                if (this.progress > 4 && this.progress < 6 && !cucumber.isBoss) {
                    // Chat attaque ceux au-dessus pendant le saut
                    if (cucumber.y < centerY && Math.random() < 0.03) {
                        cucumber.hp--;
                        if (cucumber.hp <= 0) {
                            cucumber.defeated = true;
                            this.createDefeatParticles(cucumber.x, cucumber.y);
                        }
                        // Pas de rotation - juste shake pour performances
                    }
                }
                // Combat: autres concombres AVANT l'expulsion du boss (Phase 2)
                else if (this.progress > 6 && this.progress < 6.5 && !cucumber.isBoss) {
                    // Attaque rapide pour finir tous les concombres avant le boss
                    cucumber.hp -= 10; // Défaite instantanée
                    if (cucumber.hp <= 0) {
                        cucumber.defeated = true;
                        this.createDefeatParticles(cucumber.x, cucumber.y);
                    }
                }
            }
        });
        this.ctx.restore();

        // Particules
        this.updateParticles();
        
        // === TEXTES EN PREMIER PLAN ===
        
        // Dialogue des concombres (prolongé jusqu'à 5s)
        if (this.progress < 5 && !this.cucumbers.every(c => c.defeated)) {
            this.ctx.fillStyle = '#2c2c2c';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 4;
            
            // Animation du texte (pulse)
            const scale = 1 + Math.sin(this.progress * 5) * 0.1;
            this.ctx.save();
            this.ctx.translate(this.canvas.width / 2, 80);
            this.ctx.scale(scale, scale);
            const bossWarning = window.i18n?.t('endingAnimation.bossWarning') || 'TU PASSERAS PAS !';
            this.ctx.strokeText(bossWarning, 0, 0);
            this.ctx.fillText(bossWarning, 0, 0);
            this.ctx.restore();
        }

        // Dialogue du chat (phase de saut prolongée)
        if (this.progress > 3 && this.progress < 7) {
            this.ctx.fillStyle = '#ff6b9d';
            this.ctx.font = 'bold 28px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 4;
            const catCry = window.i18n?.t('endingAnimation.catCry') || 'MIHAHOU !';
            
            // Animation du texte
            const scale = 1 + Math.sin((this.progress - 3) * 6) * 0.15;
            this.ctx.save();
            this.ctx.translate(this.catPos.x, this.catPos.y - 80);
            this.ctx.scale(scale, scale);
            this.ctx.strokeText(catCry, 0, 0);
            this.ctx.fillText(catCry, 0, 0);
            this.ctx.restore();
        }
        
        // Cri du chat lors de l'expulsion du boss (phase 4 prolongée)
        if (this.progress > 6 && this.progress < 9) {
            this.ctx.fillStyle = '#ff6b9d';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 5;
            const catCry = 'BOUM BAM !!!';
            
            const scale = 1.2 + Math.sin((this.progress - 6) * 8) * 0.3;
            this.ctx.save();
            this.ctx.translate(this.catPos.x, this.catPos.y - 100);
            this.ctx.scale(scale, scale);
            this.ctx.strokeText(catCry, 0, 0);
            this.ctx.fillText(catCry, 0, 0);
            this.ctx.restore();
        }
    }

    drawJourney() {
        // Chat marche vers la droite puis s'arrête pour s'interroger
        if (this.progress < 1) {
            // Marche normale
            this.catPos.x = 80 + this.progress * 50;
            this.catPos.y = this.canvas.height / 2 + Math.sin(this.progress * 5) * 10;
            
            // Bruits de pas pendant la marche
            const stepInterval = 0.3; // Un pas toutes les 0.3 secondes
            if (this.audioContext && this.progress - this.lastStepTime > stepInterval) {
                this.playStepSound();
                this.lastStepTime = this.progress;
            }
        } else if (this.progress < 3.5) {
            // PAUSE LONGUE : Chat s'arrête, prend une pose et regarde autour
            this.catPos.x = 130;
            this.catPos.y = this.canvas.height / 2;
        } else {
            // Continue après la pause
            this.catPos.x = 130 + (this.progress - 3.5) * 50;
            this.catPos.y = this.canvas.height / 2 + Math.sin(this.progress * 5) * 10;
            
            // Bruits de pas pendant la marche
            const stepInterval = 0.3;
            if (this.audioContext && this.progress - this.lastStepTime > stepInterval) {
                this.playStepSound();
                this.lastStepTime = this.progress;
            }
        }
        
        // Chat regarde à droite et à gauche pendant la pause
        let facingRight = true;
        if (this.progress > 1 && this.progress < 3.5) {
            // Alternance du regard : gauche (1-1.8s), droite (1.8-2.6s), gauche (2.6-3.5s)
            const lookPhase = this.progress - 1;
            if (lookPhase < 0.8) {
                facingRight = false; // Regarde à gauche
            } else if (lookPhase < 1.6) {
                facingRight = true; // Regarde à droite (vers la montagne)
            } else {
                facingRight = false; // Regarde à gauche à nouveau
            }
        }

        // Montagne ÉNORME apparaît - un obstacle imposant qui prend tout l'écran (DESSINER EN ARRIÈRE-PLAN D'ABORD)
        const mountainAlpha = Math.min(1, this.progress / 2);
        this.ctx.globalAlpha = mountainAlpha;
        
        // Dessiner des montagnes immenses qui occupent toute la hauteur
        this.ctx.save();
        const scale = 2.5; // Montagnes beaucoup plus grandes
        this.ctx.translate(this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.scale(scale, scale);
        this.drawMountain(this.canvas.width / 4, -this.canvas.height / 6);
        this.ctx.restore();
        
        this.ctx.globalAlpha = 1;
        
        // Chat orienté selon la direction du regard - taille réduite mobile (DESSINER AU PREMIER PLAN)
        this.drawCat(this.catPos.x, this.catPos.y, 30, facingRight);
        
        // Chat s'interroge quand il voit la montagne (pendant la pause)
        if (this.progress > 1 && this.progress < 1.8) {
            // Points d'interrogation au-dessus du chat
            this.ctx.fillStyle = '#ff6b9d';
            this.ctx.font = 'bold 28px Arial';
            this.ctx.textAlign = 'center';
            const bounce = Math.sin(this.progress * 8) * 5;
            this.ctx.fillText('???', this.catPos.x, this.catPos.y - 50 + bounce);
        }
        
        // Point d'exclamation quand il regarde la montagne
        if (this.progress > 1.8 && this.progress < 2.8) {
            this.ctx.fillStyle = '#ff6b9d';
            this.ctx.font = 'bold 36px Arial';
            this.ctx.textAlign = 'center';
            const bounce = Math.sin((this.progress - 1.8) * 10) * 8;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 3;
            this.ctx.strokeText('!', this.catPos.x, this.catPos.y - 55 + bounce);
            this.ctx.fillText('!', this.catPos.x, this.catPos.y - 55 + bounce);
        }
        
        // Chat réagit à la montagne (pause de 4s sur le texte) - Style combat
        if (this.progress > 2.8 && this.progress < 6.8) {
            this.ctx.fillStyle = '#2c2c2c';
            this.ctx.font = 'bold 26px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 4;
            
            const text = window.i18n?.t('endingAnimation.catReaction1') || "Qu'est-ce que c'est";
            const text2 = window.i18n?.t('endingAnimation.catReaction2') || "cette merde...";
            
            // Animation pulse comme pour le combat
            const scale = 1 + Math.sin((this.progress - 2.8) * 5) * 0.08;
            this.ctx.save();
            this.ctx.translate(this.catPos.x, this.catPos.y - 60);
            this.ctx.scale(scale, scale);
            
            this.ctx.strokeText(text, 0, -15);
            this.ctx.fillText(text, 0, -15);
            this.ctx.strokeText(text2, 0, 15);
            this.ctx.fillText(text2, 0, 15);
            
            this.ctx.restore();
        }
    }

    drawLighthouse() {
        // Chat arrive de la GAUCHE et s'arrête au milieu
        const targetX = this.canvas.width / 2;
        
        // Initialiser la position du chat à gauche au début de cette scène
        if (this.progress < 0.1) {
            this.catPos.x = -50; // Hors écran à gauche
        }
        
        // Chat se déplace vers le centre
        this.catPos.x += (targetX - this.catPos.x) * 0.05;
        this.catPos.y = this.canvas.height - 15; // Plus bas, touche le sol

        // Positionner le phare à droite avec ajustement proportionnel
        const lighthouseX = this.canvas.width * 0.85; // 85% de la largeur
        const lighthouseY = this.canvas.height - 250;
        this.drawLighthouseBuilding(lighthouseX, lighthouseY);
        
        // Lumière du phare avec position coordonnée
        if (this.progress > 1) {
            this.drawLighthouseLight(lighthouseX, lighthouseY);
        }
        
        // Montagne à droite aussi, adaptée
        const mountainX = this.canvas.width * 0.85;
        const mountainY = this.canvas.height - 80;
        this.drawMountain(mountainX, mountainY);
        
        // Chat orienté vers la droite (regarde le phare)
        this.drawCat(this.catPos.x, this.catPos.y, 15, true);
        
        // Texte du chat - Style combat
        if (this.progress > 2 && this.progress < 6) {
            this.ctx.fillStyle = '#ff6b9d';
            this.ctx.font = 'bold 24px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 4;
            
            const text1 = window.i18n?.t('endingAnimation.catThought1') || "Il y avait autre chose";
            const text2 = window.i18n?.t('endingAnimation.catThought2') || "derrière tout ça...";
            
            // Animation pulse
            const scale = 1 + Math.sin((this.progress - 2) * 5) * 0.08;
            this.ctx.save();
            this.ctx.translate(this.catPos.x, this.catPos.y - 60);
            this.ctx.scale(scale, scale);
            
            this.ctx.strokeText(text1, 0, -15);
            this.ctx.fillText(text1, 0, -15);
            this.ctx.strokeText(text2, 0, 15);
            this.ctx.fillText(text2, 0, 15);
            
            this.ctx.restore();
        }
    }

    drawEnd() {
        // Positionner le phare à droite avec ajustement proportionnel
        const lighthouseX = this.canvas.width * 0.85;
        const lighthouseY = this.canvas.height - 250;
        this.drawLighthouseBuilding(lighthouseX, lighthouseY);
        this.drawLighthouseLight(lighthouseX, lighthouseY);
        
        // Montagne à droite aussi, adaptée
        const mountainX = this.canvas.width * 0.85;
        const mountainY = this.canvas.height - 80;
        this.drawMountain(mountainX, mountainY);
        this.drawCat(this.catPos.x, this.catPos.y, 15);

        // Afficher message avec fond style ciel
        const alpha = Math.min(1, this.progress / 1.5);
        
        // Fond dégradé ciel (bleu vers orange/jaune comme lever/coucher de soleil)
        const skyGradient = this.ctx.createLinearGradient(0, this.canvas.height / 2 - 120, 0, this.canvas.height / 2 + 100);
        skyGradient.addColorStop(0, 'rgba(135, 206, 250, 0.95)'); // Bleu ciel
        skyGradient.addColorStop(0.3, 'rgba(173, 216, 230, 0.95)'); // Bleu clair
        skyGradient.addColorStop(0.6, 'rgba(255, 223, 186, 0.95)'); // Orange clair
        skyGradient.addColorStop(1, 'rgba(255, 200, 124, 0.95)'); // Orange/jaune
        this.ctx.fillStyle = skyGradient;
        this.ctx.shadowColor = 'rgba(255, 200, 124, 0.4)';
        this.ctx.shadowBlur = 25;
        this.ctx.beginPath();
        this.ctx.roundRect(20, this.canvas.height / 2 - 120, this.canvas.width - 40, 220, 20);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Dessiner des nuages stylisés
        this.ctx.save();
        this.ctx.globalAlpha = alpha * 0.6;
        this.drawCloud(this.canvas.width * 0.25, this.canvas.height / 2 - 80, 30);
        this.drawCloud(this.canvas.width * 0.7, this.canvas.height / 2 - 90, 25);
        this.drawCloud(this.canvas.width * 0.5, this.canvas.height / 2 + 60, 20);
        this.ctx.restore();
        
        // Dessiner un soleil
        this.ctx.save();
        this.ctx.globalAlpha = alpha * 0.8;
        const sunX = this.canvas.width - 60;
        const sunY = this.canvas.height / 2 - 80;
        const sunGradient = this.ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, 25);
        sunGradient.addColorStop(0, 'rgba(255, 220, 100, 1)');
        sunGradient.addColorStop(0.7, 'rgba(255, 180, 80, 0.9)');
        sunGradient.addColorStop(1, 'rgba(255, 180, 80, 0)');
        this.ctx.fillStyle = sunGradient;
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, 25, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Rayons du soleil
        this.ctx.strokeStyle = 'rgba(255, 220, 100, 0.6)';
        this.ctx.lineWidth = 3;
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.ctx.beginPath();
            this.ctx.moveTo(sunX + Math.cos(angle) * 30, sunY + Math.sin(angle) * 30);
            this.ctx.lineTo(sunX + Math.cos(angle) * 45, sunY + Math.sin(angle) * 45);
            this.ctx.stroke();
        }
        this.ctx.restore();
        
        this.ctx.globalAlpha = alpha;
        this.ctx.textAlign = 'center';
        
        // Messages philosophiques inspirants
        const title = window.i18n?.t('endingAnimation.finalTitle') || '✨ FAIS DE L\'IMPOSSIBLE POSSIBLE ✨';
        const message1 = window.i18n?.t('endingAnimation.finalMessage1') || 'Profite autrement de la vie';
        const message2 = window.i18n?.t('endingAnimation.finalMessage2') || 'Sagement, tu rachèteras le temps';
        
        this.ctx.fillStyle = '#1a1a1a';
        this.ctx.font = 'bold 24px Arial';
        this.ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
        this.ctx.shadowBlur = 8;
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.lineWidth = 3;
        this.ctx.strokeText(title, this.canvas.width / 2, this.canvas.height / 2 - 50);
        this.ctx.fillText(title, this.canvas.width / 2, this.canvas.height / 2 - 50);
        
        // Messages avec style élégant
        this.ctx.fillStyle = '#2c2c2c';
        this.ctx.font = 'italic 20px Arial';
        this.ctx.shadowBlur = 4;
        this.ctx.lineWidth = 2;
        this.ctx.strokeText(message1, this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.fillText(message1, this.canvas.width / 2, this.canvas.height / 2);
        
        this.ctx.font = 'bold italic 18px Arial';
        this.ctx.strokeText(message2, this.canvas.width / 2, this.canvas.height / 2 + 35);
        this.ctx.fillText(message2, this.canvas.width / 2, this.canvas.height / 2 + 35);
        
        // Citation finale
        this.ctx.font = 'italic 15px Arial';
        this.ctx.fillStyle = 'rgba(50, 50, 50, 0.9)';
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.lineWidth = 2;
        const finalQuote = window.i18n?.t('endingAnimation.finalQuote') || '"Chaque instant est une opportunité"';
        this.ctx.strokeText(finalQuote, this.canvas.width / 2, this.canvas.height / 2 + 70);
        this.ctx.fillText(finalQuote, this.canvas.width / 2, this.canvas.height / 2 + 70);
        
        this.ctx.shadowBlur = 0;
        this.ctx.globalAlpha = 1;
    }
    
    // Dessiner un nuage stylisé
    drawCloud(x, y, size) {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        this.ctx.beginPath();
        this.ctx.arc(x, y, size, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.7, y - size * 0.3, size * 0.8, 0, Math.PI * 2);
        this.ctx.arc(x + size * 1.4, y, size * 0.9, 0, Math.PI * 2);
        this.ctx.arc(x + size * 2, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawBookButton() {
        const btnX = this.canvas.width / 2;
        const btnY = 80; // Position en haut de l'écran
        const btnWidth = this.canvas.width - 40;
        const btnHeight = 50;
        
        // Gradient du bouton
        const gradient = this.ctx.createLinearGradient(btnX - btnWidth/2, btnY, btnX + btnWidth/2, btnY);
        gradient.addColorStop(0, '#ff6b9d');
        gradient.addColorStop(0.5, '#ffb3d9');
        gradient.addColorStop(1, '#ff6b9d');
        
        // Bouton
        this.ctx.fillStyle = gradient;
        this.ctx.shadowColor = 'rgba(255, 107, 157, 0.5)';
        this.ctx.shadowBlur = 15;
        this.ctx.beginPath();
        this.ctx.roundRect(btnX - btnWidth/2, btnY - btnHeight/2, btnWidth, btnHeight, 25);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // Contour
        this.ctx.strokeStyle = '#ff4488';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Texte
        this.ctx.fillStyle = '#ffffff';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(window.i18n?.t('endingAnimation.thankYou') || 'Merci mihao miahoo', btnX, btnY - 8);
        this.ctx.font = '12px Arial';
        this.ctx.fillText(window.i18n?.t('endingAnimation.discoverTreasure') || '✨ Découvrez votre trésor ✨', btnX, btnY + 10);
        
        // Zone cliquable (stocker pour l'event listener)
        if (!this.bookButtonBounds) {
            this.bookButtonBounds = {
                x: btnX - btnWidth/2,
                y: btnY - btnHeight/2,
                width: btnWidth,
                height: btnHeight
            };
            this.setupBookButtonClick();
        }
    }
    
    setupBookButtonClick() {
        this.canvas.addEventListener('click', (e) => {
            if (!this.bookButtonBounds) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            if (x >= this.bookButtonBounds.x && 
                x <= this.bookButtonBounds.x + this.bookButtonBounds.width &&
                y >= this.bookButtonBounds.y && 
                y <= this.bookButtonBounds.y + this.bookButtonBounds.height) {
                this.openBookModal();
            }
        });
    }
    
    openBookModal() {
        // Créer modal pour le livre
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 50%;
            transform: translateX(-50%);
            width: 100%;
            max-width: 600px;
            height: 100%;
            background: linear-gradient(135deg, rgba(232, 245, 233, 0.98) 0%, rgba(255, 249, 230, 0.98) 50%, rgba(255, 232, 232, 0.98) 100%);
            z-index: 10003;
            display: flex;
            align-items: center;
            justify-content: center;
            animation: fadeIn 0.5s ease;
            backdrop-filter: blur(10px);
        `;
        
        const content = document.createElement('div');
        content.style.cssText = `
            background: linear-gradient(135deg, #ffffff 0%, #f0f9ff 50%, #fff0f8 100%);
            padding: 50px 40px;
            border-radius: 30px;
            box-shadow: 0 20px 60px rgba(255, 107, 157, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
            text-align: center;
            max-width: 90%;
            width: 100%;
            border: 3px solid rgba(255, 182, 217, 0.5);
        `;
        
        content.innerHTML = `
            <h2 style="color: #ff6b9d; margin: 0 0 20px 0; font-size: 18px; text-shadow: 2px 2px 4px rgba(255, 107, 157, 0.2);">${window.i18n?.t('endingAnimation.musicTitle') || 'Musique du livre Catascrotte'}</h2>
            
            <div style="background: rgba(255, 235, 245, 0.6); padding: 20px; border-radius: 15px; margin: 25px 0; border: 2px solid rgba(255, 107, 157, 0.2);">
                <p style="color: #ff6b9d; font-size: 20px; font-weight: bold; margin: 0 0 15px 0; line-height: 1.5;">
                    ${window.i18n?.t('endingAnimation.quote1') || 'Face aux défis,'}<br/>${window.i18n?.t('endingAnimation.quote2') || 'refuse de rester isolé !'}
                </p>
                <p style="color: #555; font-size: 16px; margin: 0; line-height: 1.6;">
                    ${window.i18n?.t('endingAnimation.quote3') || 'Bats-toi pour ton chemin,'}<br/>
                    ${window.i18n?.t('endingAnimation.quote4') || 'transforme l\'obstacle en tremplin,'}<br/>
                    ${window.i18n?.t('endingAnimation.quote5') || 'et vis l\'impossible !'}
                </p>
            </div>
            
            <p style="color: #666; font-size: 18px; margin: 0 0 35px 0; line-height: 1.6;">
                ${window.i18n?.t('endingAnimation.discoverUniverse') || '🌟 Découvrez l\'univers inclusif<br/>d\'Emmanuel ! 🌟'}
            </p>
            
            <div style="display: flex; flex-direction: column; gap: 15px; margin-bottom: 20px;">
                <a href="https://play.google.com/store/books/collection/cluster?gsr=SheCARQKEAoMVlc0MkVRQUFRQkFKEAkQBA%3D%3D:S:ANO1ljJUoCo" 
                   target="_blank"
                   style="
                       display: inline-block;
                       background: linear-gradient(135deg, #ff6b9d 0%, #ffb3d9 50%, #ff6b9d 100%);
                       color: white;
                       padding: 15px 35px;
                       text-decoration: none;
                       border-radius: 30px;
                       font-weight: bold;
                       font-size: 17px;
                       box-shadow: 0 6px 20px rgba(255, 107, 157, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.3) inset;
                       transition: all 0.3s ease;
                       border: 2px solid rgba(255, 255, 255, 0.5);
                   "
                   onmouseover="this.style.transform='translateY(-3px) scale(1.05)'; this.style.boxShadow='0 10px 30px rgba(255, 107, 157, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.3) inset'"
                   onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 6px 20px rgba(255, 107, 157, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.3) inset'">
                    ${window.i18n?.t('endingAnimation.digitalVersion') || '📚 Version Numérique (Google Play)'}
                </a>
                
                <a href="https://www.amazon.fr/stores/Emmanuel-Payet/author/B0CS613QFB/allbooks?ref=ap_rdr&shoppingPortalEnabled=true" 
                   target="_blank"
                   style="
                       display: inline-block;
                       background: linear-gradient(135deg, #ff9800 0%, #ffb74d 50%, #ff9800 100%);
                       color: white;
                       padding: 15px 35px;
                       text-decoration: none;
                       border-radius: 30px;
                       font-weight: bold;
                       font-size: 17px;
                       box-shadow: 0 6px 20px rgba(255, 152, 0, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.3) inset;
                       transition: all 0.3s ease;
                       border: 2px solid rgba(255, 255, 255, 0.5);
                   "
                   onmouseover="this.style.transform='translateY(-3px) scale(1.05)'; this.style.boxShadow='0 10px 30px rgba(255, 152, 0, 0.6), 0 0 0 2px rgba(255, 255, 255, 0.3) inset'"
                   onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 6px 20px rgba(255, 152, 0, 0.5), 0 0 0 2px rgba(255, 255, 255, 0.3) inset'">
                    ${window.i18n?.t('endingAnimation.paperVersion') || '📖 Version Papier (Amazon)'}
                </a>
            </div>
            <div style="margin-top: 35px; display: flex; gap: 15px; justify-content: center;">
                <button onclick="window.location.reload()" 
                        style="
                            flex: 1;
                            background: linear-gradient(135deg, #81c784 0%, #a5d6a7 50%, #81c784 100%);
                            border: 2px solid rgba(255, 255, 255, 0.5);
                            color: white;
                            padding: 15px 30px;
                            border-radius: 25px;
                            cursor: pointer;
                            font-weight: bold;
                            font-size: 17px;
                            box-shadow: 0 4px 15px rgba(129, 199, 132, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.3) inset;
                            transition: all 0.3s ease;
                        "
                        onmouseover="this.style.transform='translateY(-2px) scale(1.05)'; this.style.boxShadow='0 8px 25px rgba(129, 199, 132, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.3) inset'"
                        onmouseout="this.style.transform='translateY(0) scale(1)'; this.style.boxShadow='0 4px 15px rgba(129, 199, 132, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.3) inset'">
                    🔄 ${window.i18n?.t('game.restart') || 'Recommencer'}
                </button>
            </div>
        `;
        
        modal.appendChild(content);
        document.body.appendChild(modal);
        
        // Chat fixe dans le coin gauche - LIEN CLIQUABLE vers YouTube
        const catDiv = document.createElement('a');
        catDiv.href = 'https://www.youtube.com/watch?v=Zv9AV4s5Jx0&list=PLm1lb4Wcj5PDCngETjxmXs3IgQ0NphYFz&index=36';
        catDiv.target = '_blank';
        catDiv.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: 20px;
            width: 80px;
            height: 80px;
            z-index: 10004;
            font-size: 60px;
            animation: catBounce 1s ease-in-out infinite;
            cursor: pointer;
            text-decoration: none;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: transform 0.3s ease;
        `;
        catDiv.textContent = '🐱';
        catDiv.title = window.i18n?.t('tooltips.videoLink') || 'Voir la vidéo YouTube';
        
        // Effet hover
        catDiv.addEventListener('mouseenter', () => {
            catDiv.style.transform = 'scale(1.2)';
        });
        catDiv.addEventListener('mouseleave', () => {
            catDiv.style.transform = 'scale(1)';
        });
        
        modal.appendChild(catDiv);
        
        // Ajouter l'animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes catBounce {
                0%, 100% { transform: translateY(0) rotate(-5deg); }
                50% { transform: translateY(-10px) rotate(5deg); }
            }
        `;
        document.head.appendChild(style);
        
        // Ne PAS fermer en cliquant sur le fond (modal persistante)
        // L'utilisateur doit utiliser le bouton recommencer
    }

    // === Dessins géométriques ===

    drawCat(x, y, size = 40, facingRight = true) {
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Inverser horizontalement si le chat regarde à gauche
        if (!facingRight) {
            this.ctx.scale(-1, 1);
        }

        // Queue (derrière le corps) - dirigée vers le HAUT et PLUS LONGUE
        this.ctx.strokeStyle = '#2c2c2c';
        this.ctx.lineWidth = 8;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.5, size * 0.3);
        this.ctx.quadraticCurveTo(-size * 0.9, size * 0.05, -size * 0.75, -size * 0.6);
        this.ctx.stroke();
        
        // Bout de la queue arrondi
        this.ctx.fillStyle = '#2c2c2c';
        this.ctx.beginPath();
        this.ctx.arc(-size * 0.75, -size * 0.6, size * 0.12, 0, Math.PI * 2);
        this.ctx.fill();

        // Corps (noir)
        this.ctx.fillStyle = '#2c2c2c';
        this.ctx.beginPath();
        this.ctx.ellipse(0, 0, size * 0.6, size * 0.8, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Pattes avant (petites)
        this.ctx.beginPath();
        this.ctx.ellipse(-size * 0.25, size * 0.6, size * 0.15, size * 0.3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(size * 0.25, size * 0.6, size * 0.15, size * 0.3, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Tache blanche sur le ventre
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.ellipse(0, size * 0.1, size * 0.35, size * 0.5, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Tête
        this.ctx.fillStyle = '#2c2c2c';
        this.ctx.beginPath();
        this.ctx.arc(0, -size * 0.7, size * 0.5, 0, Math.PI * 2);
        this.ctx.fill();

        // Oreilles MIGNONNES (plus grandes, plus arrondies, PLUS HAUTES)
        // Oreille gauche - forme arrondie
        this.ctx.fillStyle = '#2c2c2c';
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.35, -size * 0.75);
        this.ctx.quadraticCurveTo(-size * 0.48, -size * 1.3, -size * 0.25, -size * 1.35);
        this.ctx.quadraticCurveTo(-size * 0.12, -size * 1.2, -size * 0.2, -size * 0.85);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Intérieur rose oreille gauche
        this.ctx.fillStyle = '#ffb3d9';
        this.ctx.beginPath();
        this.ctx.ellipse(-size * 0.28, -size * 1.1, size * 0.1, size * 0.18, -0.3, 0, Math.PI * 2);
        this.ctx.fill();

        // Oreille droite - forme arrondie
        this.ctx.fillStyle = '#2c2c2c';
        this.ctx.beginPath();
        this.ctx.moveTo(size * 0.35, -size * 0.75);
        this.ctx.quadraticCurveTo(size * 0.48, -size * 1.3, size * 0.25, -size * 1.35);
        this.ctx.quadraticCurveTo(size * 0.12, -size * 1.2, size * 0.2, -size * 0.85);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Intérieur rose oreille droite
        this.ctx.fillStyle = '#ffb3d9';
        this.ctx.beginPath();
        this.ctx.ellipse(size * 0.28, -size * 1.1, size * 0.1, size * 0.18, 0.3, 0, Math.PI * 2);
        this.ctx.fill();

        // Yeux (grands et mignons)
        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.beginPath();
        this.ctx.ellipse(-size * 0.15, -size * 0.75, size * 0.12, size * 0.18, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(size * 0.15, -size * 0.75, size * 0.12, size * 0.18, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Pupilles
        this.ctx.fillStyle = '#000000';
        this.ctx.beginPath();
        this.ctx.ellipse(-size * 0.15, -size * 0.75, size * 0.06, size * 0.12, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.ellipse(size * 0.15, -size * 0.75, size * 0.06, size * 0.12, 0, 0, Math.PI * 2);
        this.ctx.fill();

        // Reflets dans les yeux
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(-size * 0.17, -size * 0.8, size * 0.04, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.beginPath();
        this.ctx.arc(size * 0.13, -size * 0.8, size * 0.04, 0, Math.PI * 2);
        this.ctx.fill();

        // Nez rose (triangle)
        this.ctx.fillStyle = '#ff9ec2';
        this.ctx.beginPath();
        this.ctx.moveTo(0, -size * 0.6);
        this.ctx.lineTo(-size * 0.08, -size * 0.55);
        this.ctx.lineTo(size * 0.08, -size * 0.55);
        this.ctx.closePath();
        this.ctx.fill();

        // Moustaches
        this.ctx.strokeStyle = '#4a4a4a';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(-size * 0.3, -size * 0.6);
        this.ctx.lineTo(-size * 0.6, -size * 0.65);
        this.ctx.moveTo(-size * 0.3, -size * 0.55);
        this.ctx.lineTo(-size * 0.6, -size * 0.55);
        this.ctx.moveTo(-size * 0.3, -size * 0.5);
        this.ctx.lineTo(-size * 0.6, -size * 0.45);
        this.ctx.moveTo(size * 0.3, -size * 0.6);
        this.ctx.lineTo(size * 0.6, -size * 0.65);
        this.ctx.moveTo(size * 0.3, -size * 0.55);
        this.ctx.lineTo(size * 0.6, -size * 0.55);
        this.ctx.moveTo(size * 0.3, -size * 0.5);
        this.ctx.lineTo(size * 0.6, -size * 0.45);
        this.ctx.stroke();

        this.ctx.restore();
    }

    drawCucumber(cucumber) {
        this.ctx.save();
        this.ctx.translate(cucumber.x, cucumber.y);
        this.ctx.rotate(cucumber.rotation);

        // Cape noire pour le boss (derrière)
        if (cucumber.isBoss) {
            this.ctx.fillStyle = '#1a1a1a';
            this.ctx.beginPath();
            this.ctx.moveTo(0, -cucumber.height / 2);
            this.ctx.quadraticCurveTo(-cucumber.width * 1.5, 0, -cucumber.width * 1.2, cucumber.height / 2);
            this.ctx.lineTo(cucumber.width * 1.2, cucumber.height / 2);
            this.ctx.quadraticCurveTo(cucumber.width * 1.5, 0, 0, -cucumber.height / 2);
            this.ctx.fill();
        }

        // Corps vert
        this.ctx.fillStyle = cucumber.isBoss ? '#4caf50' : '#81c784';
        this.ctx.beginPath();
        this.ctx.roundRect(-cucumber.width / 2, -cucumber.height / 2, cucumber.width, cucumber.height, 15);
        this.ctx.fill();

        // Détails (rayures plus foncées)
        this.ctx.strokeStyle = cucumber.isBoss ? '#2e7d32' : '#66bb6a';
        this.ctx.lineWidth = cucumber.isBoss ? 4 : 3;
        const stripes = cucumber.isBoss ? 5 : 5;
        for (let i = -Math.floor(stripes/2); i <= Math.floor(stripes/2); i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(-cucumber.width / 2 + 5, i * (cucumber.height / stripes));
            this.ctx.lineTo(cucumber.width / 2 - 5, i * (cucumber.height / stripes));
            this.ctx.stroke();
        }

        // Yeux méchants
        this.ctx.fillStyle = '#ff6b6b';
        const eyeSize = cucumber.isBoss ? 6 : 4;
        const eyeY = cucumber.isBoss ? -30 : -20;
        const eyeSpacing = cucumber.isBoss ? 12 : 8;
        this.ctx.beginPath();
        this.ctx.arc(-eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.arc(eyeSpacing, eyeY, eyeSize, 0, Math.PI * 2);
        this.ctx.fill();

        // Sourcils pour le boss
        if (cucumber.isBoss) {
            this.ctx.strokeStyle = '#1a1a1a';
            this.ctx.lineWidth = 3;
            this.ctx.beginPath();
            this.ctx.moveTo(-eyeSpacing - 8, eyeY - 8);
            this.ctx.lineTo(-eyeSpacing + 8, eyeY - 6);
            this.ctx.moveTo(eyeSpacing - 8, eyeY - 6);
            this.ctx.lineTo(eyeSpacing + 8, eyeY - 8);
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawMountain(x, y) {
        // Montagne gauche (plus petite)
        this.ctx.fillStyle = '#b0b0b0';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 150, y + 150);
        this.ctx.lineTo(x - 200, y + 150);
        this.ctx.lineTo(x - 150, y + 50);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = '#e0e0e0';
        this.ctx.beginPath();
        this.ctx.moveTo(x - 150, y + 50);
        this.ctx.lineTo(x - 100, y + 150);
        this.ctx.lineTo(x - 150, y + 150);
        this.ctx.closePath();
        this.ctx.fill();

        // Montagne droite (moyenne)
        this.ctx.fillStyle = '#a0a0a0';
        this.ctx.beginPath();
        this.ctx.moveTo(x + 80, y + 150);
        this.ctx.lineTo(x + 20, y + 150);
        this.ctx.lineTo(x + 80, y + 30);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = '#d0d0d0';
        this.ctx.beginPath();
        this.ctx.moveTo(x + 80, y + 30);
        this.ctx.lineTo(x + 140, y + 150);
        this.ctx.lineTo(x + 80, y + 150);
        this.ctx.closePath();
        this.ctx.fill();

        // Montagne centrale (la plus haute)
        this.ctx.fillStyle = '#8e8e8e';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + 150);
        this.ctx.lineTo(x - 100, y + 150);
        this.ctx.lineTo(x, y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.fillStyle = '#c0c0c0';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x + 100, y + 150);
        this.ctx.lineTo(x, y + 150);
        this.ctx.closePath();
        this.ctx.fill();

        // Neige au sommet central
        this.ctx.fillStyle = '#f5f5f5';
        this.ctx.beginPath();
        this.ctx.moveTo(x, y);
        this.ctx.lineTo(x - 30, y + 50);
        this.ctx.lineTo(x + 30, y + 50);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Neige sur montagne droite
        this.ctx.beginPath();
        this.ctx.moveTo(x + 80, y + 30);
        this.ctx.lineTo(x + 60, y + 60);
        this.ctx.lineTo(x + 100, y + 60);
        this.ctx.closePath();
        this.ctx.fill();
    }

    drawLighthouseBuilding(x, y) {
        // Base rocheuse
        this.ctx.fillStyle = '#7a7a7a';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + 260, 45, 15, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Tour blanche avec effet de volume (gradient)
        const gradient = this.ctx.createLinearGradient(x - 25, 0, x + 25, 0);
        gradient.addColorStop(0, '#f5f5f5');
        gradient.addColorStop(0.5, '#ffffff');
        gradient.addColorStop(1, '#e8e8e8');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(x - 25, y + 100, 50, 150);
        
        // Contour de la tour
        this.ctx.strokeStyle = '#d0d0d0';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 25, y + 100, 50, 150);
        
        // Pierres/briques (détails sur la tour)
        this.ctx.strokeStyle = '#e8e8e8';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 5; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x - 25, y + 130 + i * 30);
            this.ctx.lineTo(x + 25, y + 130 + i * 30);
            this.ctx.stroke();
        }
        
        // Balcon circulaire avant la tête
        this.ctx.fillStyle = '#ff4444';
        this.ctx.fillRect(x - 32, y + 95, 64, 8);
        this.ctx.strokeStyle = '#cc0000';
        this.ctx.lineWidth = 2;
        this.ctx.strokeRect(x - 32, y + 95, 64, 8);
        
        // Garde-corps du balcon
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        for (let i = -3; i <= 3; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + i * 9, y + 95);
            this.ctx.lineTo(x + i * 9, y + 88);
            this.ctx.stroke();
        }

        // Tête du phare (cabine rouge)
        const headGradient = this.ctx.createLinearGradient(x - 28, 0, x + 28, 0);
        headGradient.addColorStop(0, '#ff3333');
        headGradient.addColorStop(0.5, '#ff4444');
        headGradient.addColorStop(1, '#ff3333');
        this.ctx.fillStyle = headGradient;
        this.ctx.fillRect(x - 28, y + 65, 56, 30);
        
        // Cadres des fenêtres
        this.ctx.strokeStyle = '#cc0000';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x - 28, y + 65, 56, 30);
        
        // Fenêtres vitrées (3 panneaux)
        this.ctx.fillStyle = 'rgba(255, 255, 150, 0.4)';
        this.ctx.fillRect(x - 24, y + 68, 14, 24);
        this.ctx.fillRect(x - 7, y + 68, 14, 24);
        this.ctx.fillRect(x + 10, y + 68, 14, 24);
        
        // Reflets sur les vitres
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.fillRect(x - 22, y + 70, 4, 8);
        this.ctx.fillRect(x - 5, y + 70, 4, 8);
        this.ctx.fillRect(x + 12, y + 70, 4, 8);
        
        // Toit pointu de la tête (rouge foncé avec volume)
        const roofGradient = this.ctx.createLinearGradient(x - 35, 0, x + 35, 0);
        roofGradient.addColorStop(0, '#990000');
        roofGradient.addColorStop(0.5, '#cc0000');
        roofGradient.addColorStop(1, '#990000');
        this.ctx.fillStyle = roofGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + 50);
        this.ctx.lineTo(x - 35, y + 65);
        this.ctx.lineTo(x + 35, y + 65);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Contour du toit
        this.ctx.strokeStyle = '#660000';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Paratonnerre
        this.ctx.strokeStyle = '#888888';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.moveTo(x, y + 50);
        this.ctx.lineTo(x, y + 35);
        this.ctx.stroke();
        
        // Boule du paratonnerre
        this.ctx.fillStyle = '#ffeb3b';
        this.ctx.beginPath();
        this.ctx.arc(x, y + 33, 4, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffa000';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Lumière rotative au centre (avec effet de lentille)
        const lightGradient = this.ctx.createRadialGradient(x, y + 80, 5, x, y + 80, 15);
        lightGradient.addColorStop(0, '#ffeb3b');
        lightGradient.addColorStop(0.5, '#ffd700');
        lightGradient.addColorStop(1, '#ffa000');
        this.ctx.fillStyle = lightGradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y + 80, 15, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Contour de la lumière
        this.ctx.strokeStyle = '#ff8800';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        // Reflets sur la lentille
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.beginPath();
        this.ctx.arc(x - 5, y + 77, 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Porte en bas avec détails
        this.ctx.fillStyle = '#6b3410';
        this.ctx.fillRect(x - 12, y + 220, 24, 30);
        
        // Cadre de la porte
        this.ctx.strokeStyle = '#4a2409';
        this.ctx.lineWidth = 3;
        this.ctx.strokeRect(x - 12, y + 220, 24, 30);
        
        // Planches de la porte
        this.ctx.strokeStyle = '#5d2e0f';
        this.ctx.lineWidth = 1;
        for (let i = 0; i < 4; i++) {
            this.ctx.beginPath();
            this.ctx.moveTo(x - 12, y + 225 + i * 7);
            this.ctx.lineTo(x + 12, y + 225 + i * 7);
            this.ctx.stroke();
        }
        
        // Poignée
        this.ctx.fillStyle = '#ffd700';
        this.ctx.beginPath();
        this.ctx.arc(x + 6, y + 235, 2, 0, Math.PI * 2);
        this.ctx.fill();
    }

    drawLighthouseLight(lighthouseX, lighthouseY) {
        // Position de la lumière relative au phare (en haut de la tour)
        const x = lighthouseX;
        const y = lighthouseY + 40; // Légèrement au-dessus du sommet
        
        const gradient = this.ctx.createRadialGradient(x, y, 10, x, y, 150);
        gradient.addColorStop(0, 'rgba(255, 235, 59, 0.6)');
        gradient.addColorStop(1, 'rgba(255, 235, 59, 0)');
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(x, y, 150, 0, Math.PI * 2);
        this.ctx.fill();
    }

    createDefeatParticles(x, y, isBoss = false) {
        // Plus de particules pour le boss
        const particleCount = isBoss ? 20 : 10;
        
        // Limiter nombre total de particules
        if (this.particles.length >= this.maxParticles) return;
        
        // Créer toutes les particules en une seule fois pour coordination
        const newParticles = [];
        
        for (let i = 0; i < particleCount; i++) {
            // Réutiliser depuis le pool ou créer nouveau
            let particle = this.particlePool.pop();
            
            if (!particle) {
                particle = {
                    x: 0, y: 0, vx: 0, vy: 0, life: 0, color: '#81c784'
                };
            }
            
            // Réinitialiser avec explosion circulaire coordonnée
            const angle = (Math.PI * 2 * i) / particleCount; // Distribution uniforme en cercle
            const speed = isBoss ? 6 : 4; // Boss explose plus fort
            
            particle.x = x;
            particle.y = y;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            particle.life = 1;
            particle.color = isBoss ? '#ff6b9d' : '#81c784'; // Boss en rose
            
            newParticles.push(particle);
        }
        
        // Ajouter toutes les particules en même temps
        this.particles.push(...newParticles);
    }

    updateParticles() {
        // Filtrer et recycler dans le pool
        const alive = [];
        
        this.particles.forEach(p => {
            if (p.life > 0) {
                p.x += p.vx;
                p.y += p.vy;
                p.life -= 0.02;
                p.vy += 0.2; // Gravité

                this.ctx.globalAlpha = p.life;
                this.ctx.fillStyle = p.color;
                this.ctx.beginPath();
                this.ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
                this.ctx.fill();
                
                alive.push(p);
            } else {
                // Recycler dans le pool au lieu de garbage collect
                if (this.particlePool.length < 50) {
                    this.particlePool.push(p);
                }
            }
        });
        
        this.particles = alive;
        this.ctx.globalAlpha = 1;
    }

    /**
     * Arrête l'animation et ferme le modal
     */
    stop() {
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
        }
        
        // Arrêter la musique
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
        }
        
        const modal = document.getElementById('endingModal');
        if (modal) {
            modal.remove();
        }
        
        // Retour au menu principal
        if (window.game) {
            window.game.isRunning = false;
        }
    }
}

// Rendre disponible globalement
window.EndingAnimation = EndingAnimation;
