/**
 * PATRIX - Système d'Internationalisation (i18n)
 * Gère la traduction du jeu en plusieurs langues
 */

class I18n {
    constructor() {
        this.currentLang = localStorage.getItem('patrix_language') || 'fr';
        this.translations = {};
        this.observers = [];
        this.isLoaded = false;
    }

    /**
     * Charge les traductions pour une langue
     */
    async loadTranslations(lang) {
        try {
            const response = await fetch(`./lang/${lang}.json`);
            if (!response.ok) {
                // console.error(`Langue ${lang} non trouvée, retour au français`);
                lang = 'fr';
                const fallbackResponse = await fetch(`./lang/${lang}.json`);
                this.translations = await fallbackResponse.json();
            } else {
                this.translations = await response.json();
            }
            this.currentLang = lang;
            this.isLoaded = true;
            localStorage.setItem('patrix_language', lang);
            this.notifyObservers();
            return true;
        } catch (error) {
            console.error('Erreur chargement traductions:', error);
            // Charger des traductions par défaut vides pour éviter les erreurs
            this.translations = this.getDefaultTranslations();
            this.isLoaded = true;
            return false;
        }
    }

    /**
     * Traductions par défaut en cas d'erreur
     */
    getDefaultTranslations() {
        return {
            language: { name: 'Français', code: 'fr' },
            menu: { play: 'Jouer', login: 'Connexion' },
            game: { score: 'SCORE', lines: 'LIGNES', level: 'NIVEAU' },
            combo: { normal: 'COMBO x{count}!' },
            lines: { single: 'LIGNE!', double: 'DOUBLE!', triple: 'TRIPLE!', patrix: 'PATRIX!' }
        };
    }

    /**
     * Obtient une traduction par clé
     * @param {string} key - Clé de traduction (ex: 'menu.play')
     * @param {object} params - Paramètres à injecter dans la traduction
     * @returns {string} Texte traduit
     */
    t(key, params = {}) {
        // Si les traductions ne sont pas chargées, retourner la clé
        if (!this.isLoaded || !this.translations || Object.keys(this.translations).length === 0) {
            return key;
        }
        
        const keys = key.split('.');
        let value = this.translations;
        
        // Navigation dans l'objet de traductions
        for (const k of keys) {
            value = value?.[k];
            if (value === undefined) {
                // console.warn(`Traduction manquante: ${key}`);
                return key;
            }
        }

        // Remplacement des paramètres
        if (typeof value === 'string' && Object.keys(params).length > 0) {
            return value.replace(/\{(\w+)\}/g, (match, param) => {
                return params[param] !== undefined ? params[param] : match;
            });
        }

        return value;
    }

    /**
     * Change la langue
     */
    async setLanguage(lang) {
        return await this.loadTranslations(lang);
    }

    /**
     * Obtient la langue actuelle
     */
    getLanguage() {
        return this.currentLang;
    }

    /**
     * Enregistre un observateur pour être notifié des changements de langue
     */
    addObserver(callback) {
        this.observers.push(callback);
    }

    /**
     * Notifie tous les observateurs
     */
    notifyObservers() {
        this.observers.forEach(callback => callback(this.currentLang));
    }

    /**
     * Met à jour tous les éléments HTML avec data-i18n
     */
    updateDOM() {
        // Textes simples
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            el.textContent = this.t(key);
        });

        // Placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            el.placeholder = this.t(key);
        });

        // Titres (tooltips)
        document.querySelectorAll('[data-i18n-title]').forEach(el => {
            const key = el.getAttribute('data-i18n-title');
            el.title = this.t(key);
        });

        // Attributs aria-label
        document.querySelectorAll('[data-i18n-aria]').forEach(el => {
            const key = el.getAttribute('data-i18n-aria');
            el.setAttribute('aria-label', this.t(key));
        });
    }
    
    /**
     * Initialise les traductions au démarrage
     */
    async init() {
        const lang = this.currentLang || 'fr';
        await this.loadTranslations(lang);
    }
}

// Instance globale
window.i18n = new I18n();
// Initialiser les traductions
window.i18n.init();
