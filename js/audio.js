/**
 * PATRIX - Gestionnaire Audio
 * Sons générés et musique intégrée
 */

class AudioManager {
    constructor() {
        this.enabled = CONFIG.AUDIO.ENABLED;
        this.volume = CONFIG.AUDIO.VOLUME;
        this.audioContext = null;
        this.musicPlayer = null;
        this.audioElement = null;
        this.currentTrack = 0;
        this.isPlaying = false;
        
        // Playlist avec iframes Audiomack officiels
        this.playlist = [
            { 
                title: "Il nous a demandé d'Aimer", 
                embedUrl: "https://audiomack.com/embed/emmanuelpayet888/album/amour-amour",
                height: 400
            },
            { 
                title: "No War Eng", 
                embedUrl: "https://audiomack.com/embed/emmanuelpayet888/album/no-war-eng",
                height: 400
            },
            { 
                title: "The Pulse of Ambition", 
                embedUrl: "https://audiomack.com/embed/emmanuelpayet888/album/the-pulse-of-ambition",
                height: 400
            }
        ];
        
        // Initialisation différée pour respecter la politique autoplay
        this.initialized = false;
    }

    /**
     * Initialise l'audio context (appelé après interaction utilisateur)
     */
    init() {
        if (this.initialized) return;
        
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
        } catch (error) {
            // Audio context non supporté - mode silencieux
            this.enabled = false;
        }
    }

    /**
     * Génère un son calme et apaisant
     * @param {number} frequency - Fréquence de base
     * @param {number} duration - Durée en secondes
     */
    playSoftTone(frequency = 440, duration = 0.15) {
        if (!this.enabled || !this.audioContext) return;

        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        // Son doux (onde sinusoïdale)
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);

        // Enveloppe ADSR douce
        const now = this.audioContext.currentTime;
        gainNode.gain.setValueAtTime(0, now);
        gainNode.gain.linearRampToValueAtTime(this.volume * 0.2, now + 0.01); // Attack
        gainNode.gain.exponentialRampToValueAtTime(this.volume * 0.1, now + duration); // Decay

        oscillator.start(now);
        oscillator.stop(now + duration);
    }

    /**
     * Son de placement de pièce (doux et satisfaisant)
     */
    playPiecePlaced() {
        this.playSoftTone(523.25, 0.1); // Do5
    }

    /**
     * Son de ligne complétée (montée harmonique)
     */
    playLineCleared() {
        if (!this.enabled || !this.audioContext) return;

        const notes = [261.63, 329.63, 392.00]; // Do, Mi, Sol
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playSoftTone(freq, 0.12);
            }, i * 40);
        });
    }

    /**
     * Son de combo (sons multiples harmonieux)
     */
    playCombo(comboCount) {
        if (!this.enabled || !this.audioContext) return;

        const baseFreq = 523.25; // Do5
        for (let i = 0; i < Math.min(comboCount, 5); i++) {
            setTimeout(() => {
                this.playSoftTone(baseFreq * (1 + i * 0.2), 0.08);
            }, i * 30);
        }
    }

    /**
     * Son de niveau monté (arpège ascendant)
     */
    playLevelUp() {
        if (!this.enabled || !this.audioContext) return;

        const notes = [261.63, 329.63, 392.00, 523.25]; // Do, Mi, Sol, Do aigu
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playSoftTone(freq, 0.15);
            }, i * 60);
        });
    }

    /**
     * Son de rotation (bruit doux)
     */
    playRotate() {
        this.playSoftTone(349.23, 0.05); // Fa
    }

    /**
     * Son de mouvement (très doux)
     */
    playMove() {
        this.playSoftTone(293.66, 0.04); // Ré
    }

    /**
     * Son de chute rapide (BOUM puissant avec souffle)
     */
    playHardDrop() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.4;

        // ===== IMPACT PRINCIPAL (basse fréquence) =====
        const bassOsc = this.audioContext.createOscillator();
        const bassGain = this.audioContext.createGain();
        
        bassOsc.connect(bassGain);
        bassGain.connect(this.audioContext.destination);
        
        bassOsc.type = 'sine';
        bassOsc.frequency.setValueAtTime(80, now);
        bassOsc.frequency.exponentialRampToValueAtTime(30, now + 0.1);
        
        bassGain.gain.setValueAtTime(this.volume * 0.6, now);
        bassGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        bassOsc.start(now);
        bassOsc.stop(now + duration);

        // ===== SOUFFLE (bruit blanc filtré) =====
        const bufferSize = this.audioContext.sampleRate * 0.3;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Génère du bruit blanc
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 8);
        }
        
        const noiseSource = this.audioContext.createBufferSource();
        const noiseFilter = this.audioContext.createBiquadFilter();
        const noiseGain = this.audioContext.createGain();
        
        noiseSource.buffer = buffer;
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(400, now);
        noiseFilter.Q.setValueAtTime(1, now);
        
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        
        noiseGain.gain.setValueAtTime(this.volume * 0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        
        noiseSource.start(now + 0.02);

        // ===== HARMONIQUE (punch sonore) =====
        const punchOsc = this.audioContext.createOscillator();
        const punchGain = this.audioContext.createGain();
        
        punchOsc.connect(punchGain);
        punchGain.connect(this.audioContext.destination);
        
        punchOsc.type = 'square';
        punchOsc.frequency.setValueAtTime(200, now);
        punchOsc.frequency.exponentialRampToValueAtTime(50, now + 0.15);
        
        punchGain.gain.setValueAtTime(this.volume * 0.3, now);
        punchGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
        
        punchOsc.start(now);
        punchOsc.stop(now + 0.15);
    }

    /**
     * Son de collision avec le mur (impact sec et rebond)
     */
    playWallHit() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        
        // Impact principal
        const impactOsc = this.audioContext.createOscillator();
        const impactGain = this.audioContext.createGain();
        
        impactOsc.connect(impactGain);
        impactGain.connect(this.audioContext.destination);
        
        impactOsc.type = 'triangle';
        impactOsc.frequency.setValueAtTime(150, now);
        impactOsc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        
        impactGain.gain.setValueAtTime(this.volume * 0.35, now);
        impactGain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        
        impactOsc.start(now);
        impactOsc.stop(now + 0.08);

        // Bruit de collision (bref)
        const bufferSize = this.audioContext.sampleRate * 0.05;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        
        const noiseSource = this.audioContext.createBufferSource();
        const noiseFilter = this.audioContext.createBiquadFilter();
        const noiseGain = this.audioContext.createGain();
        
        noiseSource.buffer = buffer;
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(800, now);
        
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        
        noiseGain.gain.setValueAtTime(this.volume * 0.25, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.05);
        
        noiseSource.start(now);
    }

    /**
     * Son de destruction par windPush (grave comme une roche qui se brise)
     */
    playWindPush() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;
        const duration = 0.5;

        // ===== PAF! PERCUTANT (attaque immédiate) =====
        const pafOsc = this.audioContext.createOscillator();
        const pafGain = this.audioContext.createGain();
        const pafFilter = this.audioContext.createBiquadFilter();
        
        pafOsc.connect(pafFilter);
        pafFilter.connect(pafGain);
        pafGain.connect(this.audioContext.destination);
        
        pafOsc.type = 'triangle';
        pafOsc.frequency.setValueAtTime(180, now); // Fréquence moyenne pour le "PAF"
        pafOsc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        
        pafFilter.type = 'bandpass';
        pafFilter.frequency.setValueAtTime(200, now);
        pafFilter.Q.setValueAtTime(3, now);
        
        pafGain.gain.setValueAtTime(this.volume * 0.9, now); // Volume fort pour l'impact
        pafGain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        
        pafOsc.start(now);
        pafOsc.stop(now + 0.1);

        // ===== IMPACT GRAVE (très basse fréquence - roche) =====
        const rockOsc = this.audioContext.createOscillator();
        const rockGain = this.audioContext.createGain();
        
        rockOsc.connect(rockGain);
        rockGain.connect(this.audioContext.destination);
        
        rockOsc.type = 'sawtooth'; // Son rugueux type roche
        rockOsc.frequency.setValueAtTime(55, now); // Fréquence très grave (La1)
        rockOsc.frequency.exponentialRampToValueAtTime(25, now + 0.15);
        
        rockGain.gain.setValueAtTime(this.volume * 0.7, now);
        rockGain.gain.exponentialRampToValueAtTime(0.01, now + duration);
        
        rockOsc.start(now);
        rockOsc.stop(now + duration);

        // ===== GRONDEMENT (bruit filtré grave) =====
        const bufferSize = this.audioContext.sampleRate * 0.4;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        // Génère du bruit marron (plus grave que blanc)
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 5);
        }
        
        const rumbleSource = this.audioContext.createBufferSource();
        const rumbleFilter = this.audioContext.createBiquadFilter();
        const rumbleGain = this.audioContext.createGain();
        
        rumbleSource.buffer = buffer;
        rumbleFilter.type = 'lowpass';
        rumbleFilter.frequency.setValueAtTime(200, now); // Filtre très bas
        rumbleFilter.Q.setValueAtTime(2, now);
        
        rumbleSource.connect(rumbleFilter);
        rumbleFilter.connect(rumbleGain);
        rumbleGain.connect(this.audioContext.destination);
        
        rumbleGain.gain.setValueAtTime(this.volume * 0.5, now);
        rumbleGain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
        
        rumbleSource.start(now + 0.03);

        // ===== SUB-BASS (punch très grave) =====
        const subOsc = this.audioContext.createOscillator();
        const subGain = this.audioContext.createGain();
        
        subOsc.connect(subGain);
        subGain.connect(this.audioContext.destination);
        
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(40, now);
        subOsc.frequency.exponentialRampToValueAtTime(20, now + 0.2);
        
        subGain.gain.setValueAtTime(this.volume * 0.4, now);
        subGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        subOsc.start(now);
        subOsc.stop(now + 0.2);
    }

    /**
     * Son d'explosion des cases détruites par Wind Push
     */
    playWindExplosion() {
        if (!this.enabled || !this.audioContext) return;

        const now = this.audioContext.currentTime;

        // ===== EXPLOSION PERCUTANTE (multiple "PAF!") =====
        for (let i = 0; i < 3; i++) {
            const delay = i * 0.02; // Explosions légèrement décalées
            
            const expOsc = this.audioContext.createOscillator();
            const expGain = this.audioContext.createGain();
            const expFilter = this.audioContext.createBiquadFilter();
            
            expOsc.connect(expFilter);
            expFilter.connect(expGain);
            expGain.connect(this.audioContext.destination);
            
            expOsc.type = 'square';
            expOsc.frequency.setValueAtTime(150 - i * 20, now + delay);
            expOsc.frequency.exponentialRampToValueAtTime(60, now + delay + 0.15);
            
            expFilter.type = 'bandpass';
            expFilter.frequency.setValueAtTime(300, now + delay);
            expFilter.Q.setValueAtTime(2, now + delay);
            
            expGain.gain.setValueAtTime(this.volume * 0.6, now + delay);
            expGain.gain.exponentialRampToValueAtTime(0.01, now + delay + 0.15);
            
            expOsc.start(now + delay);
            expOsc.stop(now + delay + 0.15);
        }

        // ===== BRUIT D'EXPLOSION =====
        const bufferSize = this.audioContext.sampleRate * 0.2;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);
        
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * Math.exp(-i / bufferSize * 8);
        }
        
        const noiseSource = this.audioContext.createBufferSource();
        const noiseFilter = this.audioContext.createBiquadFilter();
        const noiseGain = this.audioContext.createGain();
        
        noiseSource.buffer = buffer;
        noiseFilter.type = 'highpass';
        noiseFilter.frequency.setValueAtTime(400, now);
        
        noiseSource.connect(noiseFilter);
        noiseFilter.connect(noiseGain);
        noiseGain.connect(this.audioContext.destination);
        
        noiseGain.gain.setValueAtTime(this.volume * 0.4, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
        
        noiseSource.start(now);
    }

    /**
     * Son de game over (notes descendantes)
     */
    playGameOver() {
        if (!this.enabled || !this.audioContext) return;

        const notes = [392.00, 329.63, 261.63, 196.00]; // Sol, Mi, Do, Sol grave
        notes.forEach((freq, i) => {
            setTimeout(() => {
                this.playSoftTone(freq, 0.3);
            }, i * 150);
        });
    }

    /**
     * Bruit cool (filtre résonant)
     */
    playCoolNoise(duration = 0.2) {
        if (!this.enabled || !this.audioContext) return;

        const bufferSize = this.audioContext.sampleRate * duration;
        const buffer = this.audioContext.createBuffer(1, bufferSize, this.audioContext.sampleRate);
        const data = buffer.getChannelData(0);

        // Génère du bruit blanc filtré
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const source = this.audioContext.createBufferSource();
        const filter = this.audioContext.createBiquadFilter();
        const gainNode = this.audioContext.createGain();

        source.buffer = buffer;
        
        // Filtre passe-haut pour un son cristallin
        filter.type = 'highpass';
        filter.frequency.setValueAtTime(2000, this.audioContext.currentTime);
        filter.Q.setValueAtTime(10, this.audioContext.currentTime);

        source.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(this.audioContext.destination);

        gainNode.gain.setValueAtTime(this.volume * 0.1, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);

        source.start();
    }

    /**
     * Active/désactive le son
     */
    toggleSound() {
        this.enabled = !this.enabled;
        return this.enabled;
    }

    /**
     * Ajuste le volume
     */
    setVolume(value) {
        this.volume = Math.max(0, Math.min(1, value));
    }

    /**
     * Toggle l'affichage du lecteur de musique
     */
    toggleMusicPlayer() {
        // Si déjà affiché, toggle visibilité
        if (this.musicPlayer) {
            if (this.musicPlayer.style.display === 'none') {
                this.musicPlayer.style.display = 'block';
                // Maximiser automatiquement sur mobile quand on ouvre
                if (window.innerWidth <= 768) {
                    this.maximizePlayer();
                }
            } else {
                this.musicPlayer.style.display = 'none';
            }
            return;
        }

        // Première ouverture : créer le player
        // Sur mobile, ouvrir directement en mode maximisé
        const isMobile = window.innerWidth <= 768;

        // Créer le conteneur du player
        const playerContainer = document.createElement('div');
        playerContainer.id = 'music-player-overlay';
        playerContainer.className = isMobile ? 'maximized' : 'minimized';
        playerContainer.style.cssText = `
            position: fixed;
            bottom: 70px;
            right: 10px;
            width: 350px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
            z-index: 9999;
            transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            animation: slideInRight 0.5s ease;
        `;

        // Header avec titre et boutons
        const header = document.createElement('div');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 12px 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 15px 15px 0 0;
            cursor: pointer;
        `;
        header.onclick = () => {
            const isMinimized = playerContainer.classList.contains('minimized');
            if (isMinimized) {
                this.maximizePlayer();
            } else {
                this.minimizePlayer();
            }
        };

        const title = document.createElement('h3');
        title.textContent = '🎵 Gospel Music';
        title.style.cssText = `
            color: white;
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        `;

        const headerButtons = document.createElement('div');
        headerButtons.style.cssText = 'display: flex; gap: 8px;';

        const maximizeBtn = document.createElement('button');
        maximizeBtn.id = 'maximize-btn';
        maximizeBtn.textContent = '⬜';
        maximizeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 18px;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
        `;
        maximizeBtn.onclick = (e) => {
            e.stopPropagation();
            const isMinimized = playerContainer.classList.contains('minimized');
            if (isMinimized) {
                this.maximizePlayer();
            } else {
                this.minimizePlayer();
            }
        };

        const closeBtn = document.createElement('button');
        closeBtn.textContent = '✕';
        closeBtn.style.cssText = `
            background: rgba(255, 255, 255, 0.2);
            border: none;
            color: white;
            font-size: 20px;
            width: 32px;
            height: 32px;
            border-radius: 6px;
            cursor: pointer;
            transition: all 0.3s;
        `;
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            this.hideMusicPlayer();
        };

        [maximizeBtn, closeBtn].forEach(btn => {
            btn.onmouseover = () => btn.style.background = 'rgba(255, 255, 255, 0.35)';
            btn.onmouseout = () => btn.style.background = 'rgba(255, 255, 255, 0.2)';
        });

        headerButtons.appendChild(maximizeBtn);
        headerButtons.appendChild(closeBtn);
        header.appendChild(title);
        header.appendChild(headerButtons);

        // Info sur la piste actuelle (en haut)
        const trackInfo = document.createElement('div');
        trackInfo.id = 'current-track-info';
        trackInfo.style.cssText = `
            text-align: center;
            color: white;
            padding: 10px 15px;
            font-size: 14px;
            font-weight: bold;
            text-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
        `;

        // Container pour l'iframe Audiomack
        const iframeContainer = document.createElement('div');
        iframeContainer.id = 'audiomack-iframe-container';
        iframeContainer.className = 'iframe-content';
        iframeContainer.style.cssText = `
            background: rgba(0, 0, 0, 0.3);
            border-radius: 0;
            overflow: hidden;
        `;

        // Contrôles de navigation entre albums
        const navControls = document.createElement('div');
        navControls.id = 'nav-controls';
        navControls.className = 'iframe-content';
        navControls.style.cssText = `
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 12px;
            padding: 12px 15px;
            background: rgba(0, 0, 0, 0.2);
            border-radius: 0 0 15px 15px;
        `;

        const buttonStyle = `
            background: rgba(255, 255, 255, 0.9);
            border: none;
            color: #667eea;
            padding: 8px 16px;
            border-radius: 20px;
            cursor: pointer;
            font-size: 14px;
            font-weight: bold;
            transition: all 0.3s;
            box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
        `;

        const prevBtn = document.createElement('button');
        prevBtn.innerHTML = '⏮';
        prevBtn.style.cssText = buttonStyle;
        prevBtn.onclick = () => {
            this.currentTrack = (this.currentTrack - 1 + this.playlist.length) % this.playlist.length;
            this.loadTrackInIframe();
        };

        const nextBtn = document.createElement('button');
        nextBtn.innerHTML = '⏭';
        nextBtn.style.cssText = buttonStyle;
        nextBtn.onclick = () => {
            this.currentTrack = (this.currentTrack + 1) % this.playlist.length;
            this.loadTrackInIframe();
        };

        // Hover effects
        [prevBtn, nextBtn].forEach(btn => {
            btn.onmouseover = () => {
                btn.style.transform = 'translateY(-2px) scale(1.05)';
                btn.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
            };
            btn.onmouseout = () => {
                btn.style.transform = 'translateY(0) scale(1)';
                btn.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.2)';
            };
        });

        navControls.appendChild(prevBtn);
        navControls.appendChild(nextBtn);

        // Assemblage
        playerContainer.appendChild(header);
        playerContainer.appendChild(trackInfo);
        playerContainer.appendChild(iframeContainer);
        playerContainer.appendChild(navControls);

        document.body.appendChild(playerContainer);

        // Ajouter les animations CSS
        if (!document.getElementById('music-player-animations')) {
            const style = document.createElement('style');
            style.id = 'music-player-animations';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                
                #music-player-overlay.minimized {
                    width: 350px !important;
                    height: auto !important;
                    bottom: 70px !important;
                    right: 10px !important;
                    top: auto !important;
                    left: auto !important;
                    transform: none !important;
                }
                
                #music-player-overlay.maximized {
                    width: 90vw !important;
                    max-width: 800px !important;
                    height: auto !important;
                    top: 50% !important;
                    left: 50% !important;
                    right: auto !important;
                    bottom: auto !important;
                    transform: translate(-50%, -50%) !important;
                }
                
                #music-player-overlay.minimized .iframe-content {
                    display: none !important;
                }
                
                #music-player-overlay.maximized .iframe-content {
                    display: block !important;
                }
                
                #music-player-overlay.minimized #current-track-info {
                    display: block;
                }
                
                #music-player-overlay.maximized #current-track-info {
                    display: block;
                }
                
                @media (max-width: 768px) {
                    #music-player-overlay.minimized {
                        width: calc(100% - 20px);
                        left: 10px;
                        right: 10px;
                        bottom: 70px;
                    }
                    #music-player-overlay.maximized {
                        width: calc(100% - 20px);
                        max-width: none;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Stocker la référence
        this.musicPlayer = playerContainer;
        
        // Charger la première piste avec autoplay (même en minimisé pour qu'elle démarre)
        this.loadTrackInIframe();
    }

    /**
     * Charge une piste dans l'iframe Audiomack avec autoplay
     */
    loadTrackInIframe() {
        const track = this.playlist[this.currentTrack];
        const container = document.getElementById('audiomack-iframe-container');
        const trackInfo = document.getElementById('current-track-info');
        
        if (container) {
            // Créer l'iframe avec les paramètres officiels Audiomack + autoplay
            const embedUrl = track.embedUrl + '?autoplay=1';
            container.innerHTML = `
                <iframe 
                    src="${embedUrl}" 
                    scrolling="no" 
                    width="100%" 
                    height="${track.height || 400}" 
                    frameborder="0" 
                    title="${track.title}"
                    allow="autoplay; encrypted-media"
                    style="border: none; display: block;">
                </iframe>
            `;
        }
        
        if (trackInfo) {
            trackInfo.textContent = `♫ ${track.title}`;
        }
    }

    /**
     * Agrandit le player
     */
    maximizePlayer() {
        if (this.musicPlayer) {
            this.musicPlayer.classList.remove('minimized');
            this.musicPlayer.classList.add('maximized');
            const btn = document.getElementById('maximize-btn');
            if (btn) btn.textContent = '🔽';
        }
    }

    /**
     * Réduit le player
     */
    minimizePlayer() {
        if (this.musicPlayer) {
            this.musicPlayer.classList.remove('maximized');
            this.musicPlayer.classList.add('minimized');
            const btn = document.getElementById('maximize-btn');
            if (btn) btn.textContent = '⬜';
        }
    }

    /**
     * Cache le lecteur de musique (continue de jouer)
     */
    hideMusicPlayer() {
        if (this.musicPlayer) {
            this.musicPlayer.style.display = 'none';
        }
    }
}

// Instance globale
const audioManager = new AudioManager();

// Export
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioManager;
}
