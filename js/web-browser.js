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
        this.init();
    }

    init() {
        this.panel = document.getElementById('webBrowserPanel');
        this.iframe = document.getElementById('webBrowserFrame');
        
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
    }

    /**
     * Ouvre une URL dans le navigateur intégré
     */
    open(url, title = 'Navigation', skipConfirm = false) {
        if (!this.panel || !this.iframe) return;

        // Valider l'URL
        if (!this.isValidUrl(url)) {
            console.error('[WebBrowser] URL invalide:', url);
            if (window.effects) {
                window.effects.showSpiritualMessage('❌ URL invalide', 2000);
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
        this.iframe.src = url;
        
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
            this.iframe.src = 'about:blank';
        }

        this.panel.classList.remove('show');
        this.panel.classList.remove('minimized');
        this.isMinimized = false;
        this.currentUrl = '';
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
}

// Rendre disponible globalement
window.WebBrowserManager = WebBrowserManager;
