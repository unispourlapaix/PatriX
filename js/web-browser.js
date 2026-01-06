/**
 * PATRIX - Gestionnaire Navigateur Web
 * Permet d'ouvrir des sites externes (Audiomack, etc.) dans un panneau sécurisé
 */

class WebBrowserManager {
    constructor() {
        this.panel = null;
        this.iframe = null;
        this.currentUrl = '';
        this.history = [];
        this.historyIndex = -1;
        this.isMinimized = false;
        this.autoStarted = false;
        this.userClosedAudio = false; // Flag pour empêcher relance après fermeture manuelle
        this.wasPausedByPlaylist = false; // Flag pour reprendre le jeu après fermeture du sélecteur
        this.loadThrottle = null;
        this.iframeLoadTimeout = null;
        this.maxIframeLoadTime = 30000; // Timeout 30s pour chargement iframe
        this.cpuCheckInterval = null;
        this.highCpuCount = 0;
        
        // Sécurités contre surcharge
        this.loadAttempts = 0;
        this.maxLoadAttempts = 5; // Max 5 chargements en 30s
        this.loadAttemptsWindow = 30000; // 30 secondes
        this.lastLoadTime = 0;
        this.errorCount = 0;
        this.maxErrors = 3;
        this.isDisabled = false;
        this.performanceCheckInterval = null;
        this.lastPerformanceCheck = 0;
        this.consecutiveHighMemory = 0;
        this.maxConsecutiveHighMemory = 3;
        
        this.init();
    }

    init() {
        this.panel = document.getElementById('webBrowserPanel');
        this.iframe = document.getElementById('webBrowserFrame');
        
        // Intersection Observer pour lazy loading iframe
        this.setupLazyLoading();
        
        // Event listeners
        const closeBtn = document.getElementById('webBrowserClose');
        const minimizeBtn = document.getElementById('webBrowserMinimize');
        const backBtn = document.getElementById('webBackBtn');
        const forwardBtn = document.getElementById('webForwardBtn');
        const refreshBtn = document.getElementById('webRefreshBtn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.close());
        }

        if (minimizeBtn) {
            minimizeBtn.addEventListener('click', () => this.minimize());
        }

        if (backBtn) {
            backBtn.addEventListener('click', () => this.goBack());
        }

        if (forwardBtn) {
            forwardBtn.addEventListener('click', () => this.goForward());
        }

        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refresh());
        }

        // Fermer avec Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen()) {
                this.close();
            }
        });

        // Clic en dehors pour fermer
        if (this.panel) {
            this.panel.addEventListener('click', (e) => {
                if (e.target === this.panel) {
                    this.close();
                }
            });
        }
        
        // Monitoring erreurs iframe
        if (this.iframe) {
            this.iframe.addEventListener('error', () => this.handleIframeError());
            
            // Timeout de chargement
            this.iframe.addEventListener('load', () => {
                this.clearIframeLoadTimeout();
                this.errorCount = 0; // Reset sur succès
            });
        }
        
        // Performance check périodique
        this.startPerformanceMonitoring();
        
        // CPU monitoring (si disponible)
        this.startCPUMonitoring();
    }    
    /**
     * Configure le lazy loading de l'iframe
     */
    setupLazyLoading() {
        if (!this.iframe) return;
        
        // Intersection Observer pour ne charger que quand visible
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && this.currentUrl && !this.iframe.src) {
                    // Charger l'iframe seulement quand visible
                    this.iframe.src = this.currentUrl;
                }
            });
        }, {
            threshold: 0.1
        });
        
        observer.observe(this.panel);
    }
    
    /**
     * Vérifie si le chargement est autorisé (anti-boucle)
     */
    canLoad() {
        if (this.isDisabled) {
            // console.warn('[WebBrowser] Lecteur désactivé pour sécurité');
            return false;
        }
        
        const now = Date.now();
        
        // Reset compteur après la fenêtre de temps
        if (now - this.lastLoadTime > this.loadAttemptsWindow) {
            this.loadAttempts = 0;
        }
        
        // Incrémenter tentatives
        this.loadAttempts++;
        this.lastLoadTime = now;
        
        // Trop de tentatives = boucle détectée
        if (this.loadAttempts > this.maxLoadAttempts) {
            this.handleOverload('Trop de tentatives de chargement');
            return false;
        }
        
        return true;
    }
    
    /**
     * Gestion erreur iframe
     */
    handleIframeError() {
        this.errorCount++;
        // console.error(`[WebBrowser] Erreur iframe (${this.errorCount}/${this.maxErrors})`);
        
        if (this.errorCount >= this.maxErrors) {
            this.handleOverload(window.i18n?.t('errors.tooManyLoadErrors') || 'Trop d\'erreurs de chargement');
        }
    }
    
    /**
     * Gestion surcharge détectée
     */
    handleOverload(reason) {
        // console.error('[WebBrowser] Surcharge détectée:', reason);
        
        // Désactiver le lecteur
        this.isDisabled = true;
        
        // Fermer complètement
        this.close(true);
        
        // Arrêter monitoring
        this.stopPerformanceMonitoring();
        
        // Alerter utilisateur
        if (window.effects) {
            window.effects.showSpiritualMessage(
                '🌐❌ Erreur de chargement',
                3000
            );
        }
        
        // Réactiver après 30 secondes (au lieu de 5 minutes)
        setTimeout(() => {
            this.isDisabled = false;
            this.loadAttempts = 0;
            this.errorCount = 0;
            // console.log('[WebBrowser] Lecteur réactivé');
        }, 30000); // 30 secondes
    }
    
    /**
     * Monitoring performance
     */
    startPerformanceMonitoring() {
        // Check toutes les 10 secondes
        this.performanceCheckInterval = setInterval(() => {
            this.checkPerformance();
        }, 10000);
    }
    
    /**
     * Monitoring CPU (détection scripts lourds)
     */
    startCPUMonitoring() {
        // Check toutes les 15 secondes (réduit pour moins de faux positifs)
        this.cpuCheckInterval = setInterval(() => {
            this.checkCPUUsage();
        }, 15000);
    }
    
    /**
     * Vérifie l'utilisation CPU (via requestIdleCallback)
     */
    checkCPUUsage() {
        if (!this.isOpen() || this.isMinimized) return;
        
        if ('requestIdleCallback' in window) {
            requestIdleCallback((deadline) => {
                // Si temps idle < 3ms (très strict), CPU potentiellement surchargé
                if (deadline.timeRemaining() < 3) {
                    this.highCpuCount++;
                    
                    // 5 checks consécutifs de CPU élevé = boucle infinie confirmée
                    if (this.highCpuCount >= 5) {
                        console.warn('[WebBrowser] CPU surchargé détecté (' + this.highCpuCount + ' checks)');
                        this.handleOverload('CPU saturé - boucle infinie probable');
                    }
                } else {
                    // Reset progressif au lieu de brutal
                    if (this.highCpuCount > 0) {
                        this.highCpuCount--;
                    }
                }
            });
        }
    }
    
    /**
     * Timeout de chargement iframe
     */
    setIframeLoadTimeout() {
        this.clearIframeLoadTimeout();
        
        this.iframeLoadTimeout = setTimeout(() => {
            console.warn('[WebBrowser] Timeout de chargement iframe');
            // Ne pas arrêter la musique, juste effacer le timeout
            this.clearIframeLoadTimeout();
            
            // Afficher message d'erreur sans fermer
            if (window.effects) {
                window.effects.showSpiritualMessage(
                    '🌐❌ Chargement lent',
                    2000
                );
            }
        }, this.maxIframeLoadTime);
    }
    
    /**
     * Clear timeout iframe
     */
    clearIframeLoadTimeout() {
        if (this.iframeLoadTimeout) {
            clearTimeout(this.iframeLoadTimeout);
            this.iframeLoadTimeout = null;
        }
    }
    
    /**
     * Arrêt monitoring
     */
    stopPerformanceMonitoring() {
        if (this.performanceCheckInterval) {
            clearInterval(this.performanceCheckInterval);
            this.performanceCheckInterval = null;
        }
        
        if (this.cpuCheckInterval) {
            clearInterval(this.cpuCheckInterval);
            this.cpuCheckInterval = null;
        }
        
        this.clearIframeLoadTimeout();
    }
    
    /**
     * Vérifie les performances
     */
    checkPerformance() {
        // Ne check que si iframe actif
        if (!this.isOpen() || this.isMinimized) return;
        
        // Performance API
        if (performance && performance.memory) {
            const memUsed = performance.memory.usedJSHeapSize;
            const memLimit = performance.memory.jsHeapSizeLimit;
            const memPercent = (memUsed / memLimit) * 100;
            
            // Si > 85% mémoire utilisée
            if (memPercent > 85) {
                this.consecutiveHighMemory++;
                console.warn('[WebBrowser] Mémoire élevée:', memPercent.toFixed(1) + '%', `(${this.consecutiveHighMemory}/${this.maxConsecutiveHighMemory})`);
                
                // 3 checks consécutifs = saturation confirmée
                if (this.consecutiveHighMemory >= this.maxConsecutiveHighMemory) {
                    this.handleOverload('Mémoire saturée >' + memPercent.toFixed(1) + '%');
                }
            } else {
                this.consecutiveHighMemory = 0; // Reset si mémoire OK
            }
        }
        
        // Check si iframe freeze (pas de réponse)
        if (this.iframe && this.iframe.contentWindow) {
            try {
                // Ping iframe
                this.iframe.contentWindow.postMessage('ping', '*');
            } catch (e) {
                console.warn('[WebBrowser] Iframe non responsive');
                this.errorCount++;
                
                if (this.errorCount >= this.maxErrors) {
                    this.handleOverload('Iframe gelée/non responsive');
                }
            }
        }
    }

    /**
     * Ouvre une URL dans le navigateur intégré
     */
    open(url, title = 'Navigation', skipConfirm = false) {
        if (!this.panel || !this.iframe) return;
        
        // Réinitialiser si désactivé (permettre nouvelle tentative manuelle)
        if (this.isDisabled) {
            this.isDisabled = false;
            this.loadAttempts = 0;
            this.errorCount = 0;
        }
        
        // Vérifier sécurité anti-boucle
        if (!this.canLoad()) {
            return;
        }

        // Valider l'URL
        if (!this.isValidUrl(url)) {
            // console.error('[WebBrowser] URL invalide:', url);
            if (window.effects) {
                window.effects.showSpiritualMessage(window.i18n.t('notifications.invalidUrl'), 2000);
            }
            return;
        }

        // Afficher un avertissement de confidentialité (sauf si déjà confirmé)
        if (!skipConfirm && !this.autoStarted) {
            const acceptCookies = confirm(
                '🎵 Ouvrir Audiomack ?\n\n' +
                '✅ Lecteur intégré dans le jeu :\n' +
                '• Contrôle lecture/pause/volume\n' +
                '• Minimisable d\'un clic sur 🎵\n' +
                '• Le jeu continue en arrière-plan\n\n' +
                'Continuer ?'
            );

            if (!acceptCookies) {
                return;
            }
        }

        // Charger l'URL dans l'iframe
        this.currentUrl = url;
        
        // Throttle le chargement pour éviter surcharge
        if (this.loadThrottle) {
            clearTimeout(this.loadThrottle);
        }
        
        this.loadThrottle = setTimeout(() => {
            if (this.iframe) {
                this.iframe.src = url;
                // Démarrer timeout de chargement
                this.setIframeLoadTimeout();
            }
        }, 100);
        
        // Mettre à jour l'affichage
        const urlDisplay = document.getElementById('webBrowserUrl');
        if (urlDisplay) {
            urlDisplay.textContent = title;
        }

        // Ajouter à l'historique
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        this.history.push(url);
        this.historyIndex = this.history.length - 1;

        // Afficher le panneau
        this.panel.classList.add('show');
        this.isMinimized = false;

        // Afficher le message de chargement
        this.showLoading();

        // Masquer le chargement après délai
        setTimeout(() => {
            this.hideLoading();
        }, 2000);

        // console.log('[WebBrowser] Ouverture:', url);
    }

    /**
     * Ferme le navigateur
     */
    close(forceClose = false) {
        if (!this.panel) return;

        // Toujours fermer complètement, ne plus minimiser
        // Vider l'iframe pour libérer les ressources
        if (this.iframe) {
            // Stopper tous les médias avant de vider
            try {
                this.iframe.contentWindow?.postMessage('pause', '*');
            } catch (e) {
                // Ignore erreurs cross-origin
            }
            
            // Retirer complètement l'iframe du DOM pour stopper tout
            const parent = this.iframe.parentNode;
            if (parent) {
                parent.removeChild(this.iframe);
                
                // Recréer une iframe vide pour les futurs usages
                const newIframe = document.createElement('iframe');
                newIframe.id = 'webBrowserFrame';
                newIframe.referrerpolicy = 'no-referrer';
                newIframe.loading = 'lazy';
                newIframe.sandbox = 'allow-scripts allow-same-origin allow-popups allow-forms';
                newIframe.frameBorder = '0';
                newIframe.style.border = 'none';
                parent.appendChild(newIframe);
                
                this.iframe = newIframe;
            }
        }

        this.panel.classList.remove('show');
        this.panel.classList.remove('minimized');
        this.isMinimized = false;
        this.currentUrl = '';
        
        // Marquer que l'utilisateur a fermé manuellement (empêche relance auto)
        this.userClosedAudio = true;
        
        // Reset compteurs d'erreurs si fermeture normale
        if (!forceClose) {
            this.errorCount = 0;
        }
        
        this.updateMusicButton();
        
        // console.log('[WebBrowser] Fermé');
    }

    /**
     * Minimise le navigateur
     */
    minimize() {
        if (!this.panel) return;
        
        this.panel.classList.remove('show');
        this.panel.classList.add('minimized');
        this.isMinimized = true;
        
        // Mettre à jour l'icône musique pour montrer que ça joue
        this.updateMusicButton();
        
        // Message de confirmation
        if (window.effects) {
            window.effects.showSpiritualMessage(window.i18n.t('notifications.musicBackground'), 1500);
        }
        
        // console.log('[WebBrowser] Minimisé - Musique continue');
    }

    /**
     * Restaure le navigateur
     */
    restore() {
        if (!this.panel) return;
        
        this.panel.classList.remove('minimized');
        this.panel.classList.add('show');
        this.isMinimized = false;
        
        // Mettre à jour l'icône musique
        this.updateMusicButton();
        
        // console.log('[WebBrowser] Restauré');
    }

    /**
     * Toggle entre minimisé et restauré
     */
    toggle() {
        // Si déjà ouvert (que ce soit minimisé ou pas), restaurer/remaximiser
        if (this.isOpen()) {
            if (this.isMinimized) {
                // Si minimisé, restaurer
                this.restore();
            } else {
                // Si déjà visible, minimiser
                this.minimize();
            }
        } else {
            // Pas encore ouvert, ouvrir directement
            this.openAudiomack();
        }
    }

    /**
     * Met à jour l'apparence du bouton musique
     */
    updateMusicButton() {
        const musicBtn = document.getElementById('profileMusicBtn');
        if (!musicBtn) return;
        
        if (this.isMinimized) {
            musicBtn.classList.add('music-playing');
            const icon = musicBtn.querySelector('.music-icon');
            if (icon) icon.textContent = '🎵';
        } else {
            musicBtn.classList.remove('music-playing');
            const icon = musicBtn.querySelector('.music-icon');
            if (icon) icon.textContent = '🎵';
        }
    }

    /**
     * Retour en arrière dans l'historique
     */
    goBack() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const url = this.history[this.historyIndex];
            this.iframe.src = url;
            this.currentUrl = url;
            this.updateUrlDisplay();
        }
    }

    /**
     * Avancer dans l'historique
     */
    goForward() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const url = this.history[this.historyIndex];
            this.iframe.src = url;
            this.currentUrl = url;
            this.updateUrlDisplay();
        }
    }

    /**
     * Actualiser la page
     */
    refresh() {
        if (this.iframe && this.currentUrl) {
            this.iframe.src = this.currentUrl;
            this.showLoading();
            setTimeout(() => this.hideLoading(), 2000);
        }
    }

    /**
     * Vérifie si le panneau est ouvert
     */
    isOpen() {
        // Vérifie si une URL est active (onglet ouvert)
        return this.currentUrl !== '';
    }

    /**
     * Valide une URL
     */
    isValidUrl(url) {
        try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
        } catch (e) {
            return false;
        }
    }

    /**
     * Met à jour l'affichage de l'URL
     */
    updateUrlDisplay() {
        const urlDisplay = document.getElementById('webBrowserUrl');
        if (urlDisplay && this.currentUrl) {
            try {
                const url = new URL(this.currentUrl);
                urlDisplay.textContent = url.hostname;
            } catch (e) {
                urlDisplay.textContent = this.currentUrl;
            }
        }
    }

    /**
     * Affiche un indicateur de chargement
     */
    showLoading() {
        const body = document.querySelector('.web-browser-body');
        if (!body) return;

        // Vérifier si le loader existe déjà
        let loader = body.querySelector('.web-browser-loading');
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'web-browser-loading';
            loader.innerHTML = `
                <div class="web-browser-loading-spinner"></div>
                <div>${window.i18n?.t('game.loading') || 'Chargement...'}</div>
            `;
            body.appendChild(loader);
        }
        loader.style.display = 'block';
    }

    /**
     * Masque l'indicateur de chargement
     */
    hideLoading() {
        const loader = document.querySelector('.web-browser-loading');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    /**
     * Ouvre Audiomack (URL par défaut)
     */
    openAudiomack() {
        // Réinitialiser le statut si désactivé (permettre nouvelle tentative)
        if (this.isDisabled) {
            this.isDisabled = false;
            this.loadAttempts = 0;
            this.errorCount = 0;
        }
        
        // Afficher le sélecteur de playlist
        this.showPlaylistSelector();
    }

    /**
     * Affiche un sélecteur de playlist Audiomack
     */
    showPlaylistSelector() {
        // Mettre en pause si le jeu est en cours
        if (window.engine && window.engine.isRunning && !window.engine.isPaused) {
            window.engine.togglePause();
            this.wasPausedByPlaylist = true;
        } else {
            this.wasPausedByPlaylist = false;
        }
        
        const playlist = [
            { 
                title: "Il nous a demandé d'Aimer", 
                embedUrl: "https://audiomack.com/embed/emmanuelpayet888/album/amour-amour",
                cover: "🎵"
            },
            { 
                title: "No War Eng", 
                embedUrl: "https://audiomack.com/embed/emmanuelpayet888/song/no-war-eng",
                cover: "☮️"
            },
            { 
                title: "You're Late", 
                embedUrl: "https://audiomack.com/embed/emmanuelpayet888/album/youre-late",
                cover: "⏰"
            }
        ];

        // Créer le sélecteur HTML
        const selectorHTML = `
            <div id="playlistSelector" class="playlist-selector">
                <div class="playlist-selector-content">
                    <h3 style="text-align: center; margin-bottom: 20px; color: var(--text-color);">
                        🎵 ${window.i18n?.t('music.selectPlaylist') || 'Sélectionnez une Playlist'}
                    </h3>
                    <div class="playlist-grid">
                        ${playlist.map((item, index) => `
                            <button class="playlist-item" data-index="${index}">
                                <span class="playlist-cover">${item.cover}</span>
                                <span class="playlist-title">${item.title}</span>
                            </button>
                        `).join('')}
                    </div>
                    <button class="playlist-close-btn">${window.i18n?.t('game.close') || 'Fermer'}</button>
                </div>
            </div>
        `;

        // Ajouter au DOM
        document.body.insertAdjacentHTML('beforeend', selectorHTML);

        const selector = document.getElementById('playlistSelector');
        const items = selector.querySelectorAll('.playlist-item');
        const closeBtn = selector.querySelector('.playlist-close-btn');

        // Gestionnaires d'événements
        items.forEach((item, index) => {
            item.addEventListener('click', () => {
                const selected = playlist[index];
                this.open(selected.embedUrl, `Audiomack - ${selected.title}`, this.autoStarted);
                this.closePlaylistSelector(selector);
            });
        });

        closeBtn.addEventListener('click', () => {
            this.closePlaylistSelector(selector);
        });
        
        selector.addEventListener('click', (e) => {
            if (e.target === selector) {
                this.closePlaylistSelector(selector);
            }
        });
    }
    
    /**
     * Ferme le sélecteur et reprend le jeu si nécessaire
     */
    closePlaylistSelector(selector) {
        selector.remove();
        
        // Reprendre le jeu si on l'avait mis en pause
        if (this.wasPausedByPlaylist && window.engine && window.engine.isPaused) {
            window.engine.togglePause();
            this.wasPausedByPlaylist = false;
        }
    }

    /**
     * Démarre automatiquement la musique au lancement
     */
    autoStart() {
        // Ne pas lancer si l'utilisateur a fermé manuellement
        if (this.userClosedAudio) {
            return;
        }
        
        // Lancer directement sans confirmation
        this.autoStarted = true;
        this.openAudiomack();
    }

    /**
     * Ouvre une URL personnalisée avec confirmation
     */
    openCustomUrl(url, title) {
        // Demander confirmation avec info cookies
        const acceptCookies = confirm(
            `🌐 Ouvrir ${title || 'ce site'} ?\n\n` +
            '⚠️ Ce site externe peut utiliser des cookies.\n\n' +
            '✅ Tu auras le contrôle total :\n' +
            '• Navigation libre\n' +
            '• Fermeture à tout moment (Échap)\n\n' +
            '❌ Les cookies tiers sont désactivés pour ta protection.\n\n' +
            'Continuer ?'
        );

        if (!acceptCookies) {
            return;
        }

        // Valider l'URL
        if (!this.isValidUrl(url)) {
            // console.error('[WebBrowser] URL invalide:', url);
            if (window.effects) {
                window.effects.showSpiritualMessage(window.i18n.t('notifications.invalidUrl'), 2000);
            }
            return;
        }

        // Mettre en pause le jeu
        if (window.game && window.game.isRunning && !window.game.isPaused) {
            window.game.togglePause();
        }

        // Charger l'URL sans redemander confirmation
        this.currentUrl = url;
        this.iframe.src = url;
        
        const urlDisplay = document.getElementById('webBrowserUrl');
        if (urlDisplay) {
            urlDisplay.textContent = title || url;
        }

        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        this.history.push(url);
        this.historyIndex = this.history.length - 1;

        this.panel.classList.add('show');
        this.showLoading();
        setTimeout(() => this.hideLoading(), 2000);

        // console.log('[WebBrowser] Ouverture:', url);
    }
    /**
     * Arrête complètement et nettoie
     */
    destroy() {
        this.stopPerformanceMonitoring();
        this.close(true);
        this.isDisabled = true;
        
        if (this.loadThrottle) {
            clearTimeout(this.loadThrottle);
        }
    }
}

// Rendre disponible globalement
window.WebBrowserManager = WebBrowserManager;
