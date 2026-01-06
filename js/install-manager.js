/**
 * PATRIX - Gestionnaire d'Installation PWA
 * Gestion de l'installation de l'application web
 */

class InstallManager {
    constructor() {
        this.deferredPrompt = null;
        this.installButton = null;
        this.installBanner = null;
        this.isInstalled = false;
        this.init();
    }

    /**
     * Initialisation
     */
    init() {
        // Vérifier si déjà installé
        this.checkIfInstalled();
        
        // Créer l'interface d'installation
        this.createInstallUI();
        
        // Écouter l'événement beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            this.deferredPrompt = e;
            this.showInstallBanner();
        });

        // Écouter l'installation réussie
        window.addEventListener('appinstalled', () => {
            this.handleInstallSuccess();
        });

        // Vérifier si lancé en mode standalone (déjà installé)
        if (window.matchMedia('(display-mode: standalone)').matches) {
            this.isInstalled = true;
        }
    }

    /**
     * Vérifie si l'app est déjà installée
     */
    checkIfInstalled() {
        // Vérifier le mode standalone
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isIOSStandalone = window.navigator.standalone === true;
        
        this.isInstalled = isStandalone || isIOSStandalone;
        
        // Sauvegarder l'état
        if (this.isInstalled) {
            localStorage.setItem('patrix_installed', 'true');
        }
    }

    /**
     * Crée l'interface d'installation
     */
    createInstallUI() {
        // Bannière d'installation
        const banner = document.createElement('div');
        banner.id = 'install-banner';
        banner.className = 'install-banner';
        banner.innerHTML = `
            <div class="install-banner-content">
                <div class="install-banner-icon">📱</div>
                <div class="install-banner-text">
                    <strong>Installer Patri-X</strong>
                    <span>Jouez hors ligne et accédez rapidement à l'app</span>
                </div>
                <button class="install-btn-primary" id="install-btn">Installer</button>
                <button class="install-btn-close" id="install-close">✕</button>
            </div>
        `;

        // Instructions iOS
        const iosInstructions = document.createElement('div');
        iosInstructions.id = 'ios-install-instructions';
        iosInstructions.className = 'ios-install-instructions hidden';
        iosInstructions.innerHTML = `
            <div class="ios-instructions-content">
                <button class="install-btn-close" id="ios-close">✕</button>
                <h3>📱 Installer Patri-X sur iOS</h3>
                <div class="ios-steps">
                    <div class="ios-step">
                        <span class="ios-step-number">1</span>
                        <p>Appuyez sur le bouton <strong>Partager</strong> <svg width="20" height="20" viewBox="0 0 20 20"><path d="M10 0L15 5H12V12H8V5H5L10 0Z" fill="currentColor"/><rect x="2" y="14" width="16" height="4" fill="currentColor"/></svg></p>
                    </div>
                    <div class="ios-step">
                        <span class="ios-step-number">2</span>
                        <p>Faites défiler et sélectionnez <strong>"Sur l'écran d'accueil"</strong> ➕</p>
                    </div>
                    <div class="ios-step">
                        <span class="ios-step-number">3</span>
                        <p>Appuyez sur <strong>"Ajouter"</strong></p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(banner);
        document.body.appendChild(iosInstructions);

        this.installBanner = banner;
        this.installButton = document.getElementById('install-btn');

        // Événements
        this.installButton.addEventListener('click', () => {
            this.handleInstallClick();
        });

        document.getElementById('install-close').addEventListener('click', () => {
            this.hideInstallBanner();
        });

        document.getElementById('ios-close').addEventListener('click', () => {
            this.hideIOSInstructions();
        });

        // Détecter iOS et afficher les instructions spéciales
        if (this.isIOS() && !this.isInstalled) {
            setTimeout(() => {
                this.showIOSInstructions();
            }, 3000);
        }
    }

    /**
     * Affiche la bannière d'installation
     */
    showInstallBanner() {
        // Ne pas afficher si déjà installé ou si l'utilisateur a fermé
        if (this.isInstalled || localStorage.getItem('patrix_install_dismissed') === 'true') {
            return;
        }

        if (this.installBanner) {
            this.installBanner.classList.add('visible');
        }
    }

    /**
     * Cache la bannière d'installation
     */
    hideInstallBanner() {
        if (this.installBanner) {
            this.installBanner.classList.remove('visible');
            localStorage.setItem('patrix_install_dismissed', 'true');
        }
    }

    /**
     * Affiche les instructions iOS
     */
    showIOSInstructions() {
        const instructions = document.getElementById('ios-install-instructions');
        if (instructions && !this.isInstalled) {
            instructions.classList.remove('hidden');
            instructions.classList.add('visible');
        }
    }

    /**
     * Cache les instructions iOS
     */
    hideIOSInstructions() {
        const instructions = document.getElementById('ios-install-instructions');
        if (instructions) {
            instructions.classList.remove('visible');
            setTimeout(() => {
                instructions.classList.add('hidden');
            }, 300);
        }
    }

    /**
     * Gère le clic sur le bouton d'installation
     */
    async handleInstallClick() {
        if (!this.deferredPrompt) {
            // Sur iOS, afficher les instructions
            if (this.isIOS()) {
                this.showIOSInstructions();
            }
            return;
        }

        // Afficher le prompt d'installation natif
        this.deferredPrompt.prompt();

        // Attendre la réponse de l'utilisateur
        const { outcome } = await this.deferredPrompt.userChoice;

        if (outcome === 'accepted') {
            console.log('Installation acceptée');
        } else {
            console.log('Installation refusée');
        }

        // Réinitialiser le prompt
        this.deferredPrompt = null;
        this.hideInstallBanner();
    }

    /**
     * Gère l'installation réussie
     */
    handleInstallSuccess() {
        this.isInstalled = true;
        localStorage.setItem('patrix_installed', 'true');
        this.hideInstallBanner();
        this.hideIOSInstructions();

        // Afficher un message de succès
        if (window.visualEffects) {
            window.visualEffects.showSpiritualMessage(window.i18n.t('notifications.appInstalled'), 3000);
        }
    }

    /**
     * Détecte si l'appareil est iOS
     */
    isIOS() {
        return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    }

    /**
     * Affiche manuellement le prompt d'installation
     */
    showInstallPrompt() {
        if (this.isInstalled) {
            alert(window.i18n.t('errors.alreadyInstalled'));
            return;
        }

        if (this.isIOS()) {
            this.showIOSInstructions();
        } else {
            this.showInstallBanner();
        }
    }
}

// Instance globale
const installManager = new InstallManager();
