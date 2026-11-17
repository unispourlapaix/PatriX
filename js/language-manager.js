/**
 * PATRIX - Gestionnaire de Langue
 * Gère le sélecteur de langue au démarrage et les changements de langue
 */

class LanguageManager {
    constructor() {
        this.modal = null;
        this.continueBtn = null;
        this.langButtons = {}; // Stockera tous les boutons de langue
        this.selectedLang = null;
        this.availableLanguages = ['fr', 'en', 'es', 'zh', 'ar', 'pt', 'ja', 'uk', 'ln'];
    }
    
    async initialize() {
        // Attendre que le DOM soit prêt
        this.modal = document.getElementById('languageModal');
        this.continueBtn = document.getElementById('languageContinueBtn');
        
        // Charger tous les boutons de langue
        this.availableLanguages.forEach(lang => {
            const btnId = `langBtn${lang.charAt(0).toUpperCase()}${lang.slice(1)}`;
            this.langButtons[lang] = document.getElementById(btnId);
        });
        
        if (!this.modal || !this.continueBtn) {
            console.error('[LanguageManager] Éléments DOM manquants');
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
        // Options de langue - changement immédiat au clic
        document.querySelectorAll('.language-option').forEach(option => {
            option.addEventListener('click', async (e) => {
                const lang = option.getAttribute('data-lang');
                await this.selectAndConfirmLanguage(lang);
            });
        });

        // Bouton continuer (optionnel maintenant)
        this.continueBtn.addEventListener('click', () => {
            if (this.selectedLang) {
                this.confirmLanguage();
            }
        });

        // Boutons de langue compacts dans le panneau des trophées
        this.availableLanguages.forEach(lang => {
            if (this.langButtons[lang]) {
                this.langButtons[lang].addEventListener('click', () => {
                    this.loadLanguage(lang);
                });
            }
        });

        // Bouton pour ouvrir le modal de langue depuis le panneau trophée
        const openLanguageModalBtn = document.getElementById('openLanguageModalBtn');
        if (openLanguageModalBtn) {
            openLanguageModalBtn.addEventListener('click', () => {
                this.showModal();
            });
        }

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

    async selectAndConfirmLanguage(lang) {
        this.selectLanguage(lang);
        await this.confirmLanguage();
    }

    async confirmLanguage() {
        if (!this.selectedLang) return;

        // Charger les traductions
        const success = await this.loadLanguage(this.selectedLang);
        
        if (success) {
            this.hideModal();
            this.updateCompactButtons();
            
            // Recharger complètement la page pour appliquer toutes les traductions
            setTimeout(() => {
                window.location.reload();
            }, 300);
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
                    this.updateLanguageButtonIcon(lang);
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
            const continueTexts = {
                'fr': 'Continuer',
                'en': 'Continue',
                'es': 'Continuar',
                'zh': '继续',
                'ar': 'متابعة',
                'pt': 'Continuar',
                'ja': '続ける',
                'uk': 'Продовжити',
                'ln': 'Kolekela Liboso'
            };
            this.continueBtn.textContent = continueTexts[currentLang] || 'Continue';
        }

        // Mettre à jour les placeholders du modal de langue
        const titleEl = document.querySelector('.language-selector-title');
        const subtitleEl = document.querySelector('.language-selector-subtitle');
        
        if (titleEl && subtitleEl) {
            if (window.i18n.getLanguage() === 'fr') {
                titleEl.textContent = '�️ Choisissez votre langue';
                subtitleEl.textContent = 'Choose your language';
            } else {
                titleEl.textContent = '�️ Choose Your Language';
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
        
        // Mettre à jour tous les boutons de langue
        this.availableLanguages.forEach(lang => {
            const btn = this.langButtons[lang];
            if (btn) {
                if (currentLang === lang) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            }
        });
        
        // Mettre à jour l'icône du bouton d'ouverture du modal
        this.updateLanguageButtonIcon(currentLang);
    }
    
    updateLanguageButtonIcon(lang) {
        const openLanguageModalBtn = document.getElementById('openLanguageModalBtn');
        if (!openLanguageModalBtn) return;
        
        const flagSpan = openLanguageModalBtn.querySelector('span:first-child');
        if (!flagSpan) return;
        
        const flags = {
            'fr': '🇫🇷',
            'en': '🇬🇧',
            'es': '🇪🇸',
            'zh': '🇨🇳',
            'ar': '🇸🇦',
            'pt': '🇵🇹',
            'ja': '🇯🇵',
            'uk': '🇺🇦',
            'ln': '🇨🇩'
        };
        
        flagSpan.textContent = flags[lang] || '🏳️';
    }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    window.languageManager = new LanguageManager();
    window.languageManagerReady = window.languageManager.initialize();
});
