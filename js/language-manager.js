/**
 * PATRIX - Gestionnaire de Langue
 * Gère le sélecteur de langue au démarrage et les changements de langue
 */

class LanguageManager {
    constructor() {
        this.modal = null;
        this.continueBtn = null;
        this.langBtnFr = null;
        this.langBtnEn = null;
        this.selectedLang = null;
    }
    
    async initialize() {
        // Attendre que le DOM soit prêt
        this.modal = document.getElementById('languageModal');
        this.continueBtn = document.getElementById('languageContinueBtn');
        this.langBtnFr = document.getElementById('langBtnFr');
        this.langBtnEn = document.getElementById('langBtnEn');
        
        if (!this.modal || !this.continueBtn || !this.langBtnFr || !this.langBtnEn) {
            console.error('[LanguageManager] Éléments DOM manquants', {
                modal: !!this.modal,
                continueBtn: !!this.continueBtn,
                langBtnFr: !!this.langBtnFr,
                langBtnEn: !!this.langBtnEn
            });
            return;
        }
        
        console.log('[LanguageManager] Initialisation...');
        await this.init();
    }

    async init() {
        // Vérifier si l'utilisateur a déjà choisi une langue
        const savedLang = localStorage.getItem('patrix_language');
        
        if (savedLang) {
            // Langue déjà sauvegardée, charger directement
            await this.loadLanguage(savedLang);
            this.hideModal();
            this.updateCompactButtons();
        } else {
            // Première visite, charger français par défaut et afficher le sélecteur
            await this.loadLanguage('fr');
            this.selectLanguage('fr'); // Pré-sélectionner français
            this.showModal();
        }
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Options de langue
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', (e) => {
                const lang = option.getAttribute('data-lang');
                this.selectLanguage(lang);
            });
        });

        // Bouton continuer
        this.continueBtn.addEventListener('click', () => {
            if (this.selectedLang) {
                this.confirmLanguage();
            }
        });

        // Boutons de langue compacts dans le panneau des trophées
        this.langBtnFr.addEventListener('click', () => {
            this.loadLanguage('fr');
        });
        
        this.langBtnEn.addEventListener('click', () => {
            this.loadLanguage('en');
        });

        // Observer les changements de langue pour mettre à jour le DOM
        window.i18n.addObserver((lang) => {
            this.updateDOM();
            this.updateDynamicElements();
        });
    }

    selectLanguage(lang) {
        this.selectedLang = lang;
        
        // Mettre à jour l'UI de sélection
        document.querySelectorAll('.language-option').forEach(option => {
            if (option.getAttribute('data-lang') === lang) {
                option.classList.add('selected');
            } else {
                option.classList.remove('selected');
            }
        });

        this.continueBtn.disabled = false;
    }

    async confirmLanguage() {
        if (!this.selectedLang) return;

        // Charger les traductions
        const success = await this.loadLanguage(this.selectedLang);
        
        if (success) {
            this.hideModal();
            this.updateCompactButtons();
        }
    }

    async loadLanguage(lang) {
        try {
            const success = await window.i18n.loadTranslations(lang);
            if (success) {
                this.selectedLang = lang;
                // Attendre un court instant pour que les traductions soient disponibles
                setTimeout(() => {
                    this.updateDOM();
                    this.updateDynamicElements();
                }, 100);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erreur chargement langue:', error);
            return false;
        }
    }

    updateDOM() {
        // Mettre à jour tous les éléments statiques avec data-i18n
        window.i18n.updateDOM();
    }

    updateDynamicElements() {
        // Mettre à jour les éléments qui ne sont pas dans le DOM au chargement
        // (modals, messages dynamiques, etc.)
        
        // Mettre à jour le texte du bouton continue
        if (this.continueBtn) {
            const currentLang = window.i18n.getLanguage();
            this.continueBtn.textContent = currentLang === 'fr' ? 'Continuer' : 'Continue';
        }

        // Mettre à jour les placeholders du modal de langue
        const titleEl = document.querySelector('.language-selector-title');
        const subtitleEl = document.querySelector('.language-selector-subtitle');
        
        if (titleEl && subtitleEl) {
            if (window.i18n.getLanguage() === 'fr') {
                titleEl.textContent = '🌍 Choisissez votre langue';
                subtitleEl.textContent = 'Choose your language';
            } else {
                titleEl.textContent = '🌍 Choose Your Language';
                subtitleEl.textContent = 'Choisissez votre langue';
            }
        }
    }

    showModal() {
        if (this.modal) {
            this.modal.classList.remove('hidden');
            // Pré-sélectionner la langue actuelle
            const currentLang = window.i18n.getLanguage();
            if (currentLang) {
                this.selectLanguage(currentLang);
            }
        }
    }

    hideModal() {
        if (this.modal) {
            this.modal.classList.add('hidden');
        }
    }

    updateCompactButtons() {
        const currentLang = window.i18n.getLanguage();
        
        if (this.langBtnFr && this.langBtnEn) {
            // Mettre en surbrillance le bouton de la langue active
            if (currentLang === 'fr') {
                this.langBtnFr.classList.add('active');
                this.langBtnEn.classList.remove('active');
            } else {
                this.langBtnEn.classList.add('active');
                this.langBtnFr.classList.remove('active');
            }
        }
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
    window.languageManager.initialize();
});
