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
        this.loadThrottle = null;
        
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
        }
        
        // Performance check périodique
        this.startPerformanceMonitoring();
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
            console.warn('[WebBrowser] Lecteur désactivé pour sécurité');
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
        console.error(`[WebBrowser] Erreur iframe (${this.errorCount}/${this.maxErrors})`);
        
        if (this.errorCount >= this.maxErrors) {
            this.handleOverload('Trop d\'erreurs de chargement');
        }
    }
    
    /**
     * Gestion surcharge détectée
     */
    handleOverload(reason) {
        console.error('[WebBrowser] Surcharge détectée:', reason);
        
        // Désactiver le lecteur
        this.isDisabled = true;
        
        // Fermer complètement
        this.close(true);
        
        // Arrêter monitoring
        this.stopPerformanceMonitoring();
        
        // Alerter utilisateur
        if (window.effects) {
            window.effects.showSpiritualMessage(
                '⚠️ Lecteur audio désactivé (surcharge détectée)',
                4000
            );
        }
        
        // Réactiver après 5 minutes
        setTimeout(() => {
            this.isDisabled = false;
            this.loadAttempts = 0;
            this.errorCount = 0;
            console.log('[WebBrowser] Lecteur réactivé');
        }, 300000); // 5 minutes
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
     * Arrêt monitoring
     */
    stopPerformanceMonitoring() {
        if (this.performanceCheckInterval) {
            clearInterval(this.performanceCheckInterval);
            this.performanceCheckInterval = null;
        }
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
            
            // Si > 90% mémoire utilisée
            if (memPercent > 90) {
                console.warn('[WebBrowser] Mémoire critique:', memPercent.toFixed(1) + '%');
                this.handleOverload('Mémoire saturée');
            }
        }
        
        // Check si iframe freeze (pas de réponse)
        if (this.iframe && this.iframe.contentWindow) {
            try {
                // Ping iframe
                this.iframe.contentWindow.postMessage('ping', '*');
            } catch (e) {
                console.warn('[WebBrowser] Iframe non responsive');
            }
        }
    }

    /**
     * Ouvre une URL dans le navigateur intégré
     */
    open(url, title = 'Navigation', skipConfirm = false) {
        if (!this.panel || !this.iframe) return;
        
        // Vérifier sécurité anti-boucle
        if (!this.canLoad()) {
            return;
        }

        // Valider l'URL
        if (!this.isValidUrl(url)) {
            console.error('[WebBrowser] URL invalide:', url);
            if (window.effects) {
                window.effects.showSpiritualMessage('❌ URL invalide', 2000);
            }
            return;
        }

        // Display privacy warning (unless already confirmed)
        if (!skipConfirm && !this.autoStarted) {
            const acceptCookies = confirm(
                '🎵 Open Audiomack?\n\n' +
                '✅ Built-in player in the game:\n' +
                '• Control play/pause/volume\n' +
                '• Minimizable with one click on 🎵\n' +
                '• Game continues in background\n\n' +
                'Continue?'
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

        console.log('[WebBrowser] Ouverture:', url);
    }

    /**
     * Ferme le navigateur
     */
    close(forceClose = false) {
        if (!this.panel) return;

        // Minimiser au lieu de fermer si c'est le lecteur audio (sauf si forceClose)
        if (this.currentUrl.includes('audiomack.com') && !forceClose) {
            this.minimize();
            return;
        }

        // Vider l'iframe pour libérer les ressources
        if (this.iframe) {
            // Stopper tous les médias avant de vider
            try {
                this.iframe.contentWindow?.postMessage('pause', '*');
            } catch (e) {
                // Ignore erreurs cross-origin
            }
            
            // Vider le src et forcer garbage collection
            this.iframe.src = 'about:blank';
            
            // Attendre un frame avant de vraiment nettoyer
            requestAnimationFrame(() => {
                if (this.iframe) {
                    this.iframe.removeAttribute('src');
                }
            });
        }

        this.panel.classList.remove('show');
        this.panel.classList.remove('minimized');
        this.isMinimized = false;
        this.currentUrl = '';
        
        // Reset compteurs d'erreurs si fermeture normale
        if (!forceClose) {
            this.errorCount = 0;
        }
        
        this.updateMusicButton();
        
        console.log('[WebBrowser] Fermé');
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
            window.effects.showSpiritualMessage('🎵 Musique en arrière-plan', 1500);
        }
        
        console.log('[WebBrowser] Minimisé - Musique continue');
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
        
        console.log('[WebBrowser] Restauré');
    }

    /**
     * Toggle entre minimisé et restauré
     */
    toggle() {
        if (this.isMinimized) {
            // Si minimisé, restaurer
            this.restore();
        } else if (this.isOpen()) {
            // Si ouvert, minimiser
            this.minimize();
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
                <div>Chargement...</div>
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
        // URL embed Audiomack
        let audiomackUrl = 'https://audiomack.com/embed/emmanuelpayet888/album/amour-amour';
        
        if (window.audioManager && window.audioManager.playlist && window.audioManager.playlist.length > 0) {
            // Utiliser l'URL embed de la première piste
            audiomackUrl = window.audioManager.playlist[0].embedUrl;
        }
        
        this.open(audiomackUrl, 'Audiomack - Emmanuel Payet', this.autoStarted);
    }

    /**
     * Démarre automatiquement la musique au lancement
     */
    autoStart() {
        // Lancer directement sans confirmation
        this.autoStarted = true;
        this.openAudiomack();
    }

    /**
     * Opens a custom URL with confirmation
     */
    openCustomUrl(url, title) {
        // Request confirmation with cookie info
        const acceptCookies = confirm(
            `🌐 Open ${title || 'this site'}?\n\n` +
            '⚠️ This external site may use cookies.\n\n' +
            '✅ You\'ll have full control:\n' +
            '• Free navigation\n' +
            '• Close anytime (Esc)\n\n' +
            '❌ Third-party cookies are disabled for your protection.\n\n' +
            'Continue?'
        );

        if (!acceptCookies) {
            return;
        }

        // Valider l'URL
        if (!this.isValidUrl(url)) {
            console.error('[WebBrowser] URL invalide:', url);
            if (window.effects) {
                window.effects.showSpiritualMessage('❌ URL invalide', 2000);
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

        console.log('[WebBrowser] Ouverture:', url);
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
