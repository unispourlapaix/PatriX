/**
 * PATRIX - Gestionnaire d'Authentification
 * Connexion, inscription, mot de passe oublié avec Supabase Auth
 * Auteur: Emmanuel Payet
 */

class AuthManager {
    constructor() {
        this.supabaseUrl = 'https://dmszyxowetilvsanqsxm.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc3p5eG93ZXRpbHZzYW5xc3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzM0NDUsImV4cCI6MjA3NTM0OTQ0NX0.EukDYFVt0sCrDb0_V4ZPMv5B4gkD43V8Cw7CEuvl0C8';
        this.currentUser = null;
        this.authModal = null;
        this.init();
    }

    /**
     * Initialisation
     */
    init() {
        // Vérifier si l'utilisateur est déjà connecté
        this.checkAuth();
        // Créer le modal d'authentification
        this.createAuthModal();
    }

    /**
     * Vérifie si l'utilisateur est authentifié
     */
    async checkAuth() {
        try {
            const response = await fetch(`${this.supabaseUrl}/auth/v1/user`, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${localStorage.getItem('supabase.auth.token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                this.currentUser = data;
                this.updateUIForAuth();
            }
        } catch (error) {
            // Non authentifié
        }
    }

    /**
     * Crée le modal d'authentification
     */
    createAuthModal() {
        const modal = document.createElement('div');
        modal.id = 'auth-modal';
        modal.className = 'auth-modal';
        modal.innerHTML = `
            <div class="auth-modal-content">
                <button class="auth-close" id="auth-close">✕</button>
                
                <!-- Formulaire de connexion -->
                <div class="auth-form" id="login-form">
                    <h2>🔐 Connexion</h2>
                    <p class="auth-subtitle">Connectez-vous pour sauvegarder vos scores</p>
                    
                    <div class="auth-input-group">
                        <label>Email</label>
                        <input type="email" id="login-email" placeholder="votre@email.com" required>
                    </div>
                    
                    <div class="auth-input-group">
                        <label>Mot de passe</label>
                        <input type="password" id="login-password" placeholder="••••••••" required>
                    </div>
                    
                    <button class="auth-btn auth-btn-primary" id="login-submit">
                        Se connecter
                    </button>
                    
                    <div class="auth-links">
                        <a href="#" id="show-register">Créer un compte</a>
                        <a href="#" id="show-forgot">Mot de passe oublié ?</a>
                    </div>
                </div>
                
                <!-- Formulaire d'inscription -->
                <div class="auth-form hidden" id="register-form">
                    <h2>✨ Créer un compte</h2>
                    <p class="auth-subtitle">Rejoignez la communauté PATRIX</p>
                    
                    <div class="auth-input-group">
                        <label>Pseudo</label>
                        <input type="text" id="register-pseudo" placeholder="Votre pseudo" required>
                    </div>
                    
                    <div class="auth-input-group">
                        <label>Email</label>
                        <input type="email" id="register-email" placeholder="votre@email.com" required>
                    </div>
                    
                    <div class="auth-input-group">
                        <label>Mot de passe</label>
                        <input type="password" id="register-password" placeholder="••••••••" required>
                        <small>Minimum 6 caractères</small>
                    </div>
                    
                    <div class="auth-input-group">
                        <label>Confirmer le mot de passe</label>
                        <input type="password" id="register-password-confirm" placeholder="••••••••" required>
                    </div>
                    
                    <button class="auth-btn auth-btn-primary" id="register-submit">
                        Créer mon compte
                    </button>
                    
                    <div class="auth-links">
                        <a href="#" id="show-login">Déjà un compte ? Se connecter</a>
                    </div>
                </div>
                
                <!-- Formulaire mot de passe oublié -->
                <div class="auth-form hidden" id="forgot-form">
                    <h2>🔑 Mot de passe oublié</h2>
                    <p class="auth-subtitle">Recevez un lien de réinitialisation par email</p>
                    
                    <div class="auth-input-group">
                        <label>Email</label>
                        <input type="email" id="forgot-email" placeholder="votre@email.com" required>
                    </div>
                    
                    <button class="auth-btn auth-btn-primary" id="forgot-submit">
                        Envoyer le lien
                    </button>
                    
                    <div class="auth-links">
                        <a href="#" id="back-to-login">Retour à la connexion</a>
                    </div>
                </div>
                
                <!-- Message de succès -->
                <div class="auth-message hidden" id="auth-message"></div>
            </div>
        `;

        document.body.appendChild(modal);
        this.authModal = modal;
        
        // Attacher les événements
        this.attachEvents();
    }

    /**
     * Attache les événements
     */
    attachEvents() {
        // Fermer le modal
        document.getElementById('auth-close').addEventListener('click', () => {
            this.hideAuthModal();
        });

        // Navigation entre les formulaires
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('register');
        });

        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });

        document.getElementById('show-forgot').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('forgot');
        });

        document.getElementById('back-to-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });

        // Soumission des formulaires
        document.getElementById('login-submit').addEventListener('click', () => {
            this.handleLogin();
        });

        document.getElementById('register-submit').addEventListener('click', () => {
            this.handleRegister();
        });

        document.getElementById('forgot-submit').addEventListener('click', () => {
            this.handleForgotPassword();
        });

        // Entrée pour soumettre
        ['login-password', 'register-password-confirm', 'forgot-email'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        if (id === 'login-password') this.handleLogin();
                        else if (id === 'register-password-confirm') this.handleRegister();
                        else if (id === 'forgot-email') this.handleForgotPassword();
                    }
                });
            }
        });
    }

    /**
     * Affiche un formulaire spécifique
     */
    showForm(formName) {
        document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
        document.getElementById('auth-message').classList.add('hidden');
        document.getElementById(`${formName}-form`).classList.remove('hidden');
    }

    /**
     * Affiche le modal d'authentification
     */
    showAuthModal() {
        this.authModal.classList.add('active');
        this.showForm('login');
    }

    /**
     * Cache le modal d'authentification
     */
    hideAuthModal() {
        this.authModal.classList.remove('active');
    }

    /**
     * Affiche un message
     */
    showMessage(message, type = 'success') {
        const messageEl = document.getElementById('auth-message');
        messageEl.textContent = message;
        messageEl.className = `auth-message ${type}`;
        messageEl.classList.remove('hidden');
        
        document.querySelectorAll('.auth-form').forEach(form => form.classList.add('hidden'));
    }

    /**
     * Gère la connexion
     */
    async handleLogin() {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;

        if (!email || !password) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            const response = await fetch(`${this.supabaseUrl}/auth/v1/token?grant_type=password`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.access_token) {
                localStorage.setItem('supabase.auth.token', data.access_token);
                this.currentUser = data.user;
                this.updateUIForAuth();
                this.showMessage('✅ Connexion réussie !', 'success');
                
                setTimeout(() => {
                    this.hideAuthModal();
                }, 2000);
            } else {
                alert('Email ou mot de passe incorrect');
            }
        } catch (error) {
            alert('Erreur de connexion. Vérifiez votre connexion internet.');
        }
    }

    /**
     * Gère l'inscription
     */
    async handleRegister() {
        const pseudo = document.getElementById('register-pseudo').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const passwordConfirm = document.getElementById('register-password-confirm').value;

        if (!pseudo || !email || !password || !passwordConfirm) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        if (password !== passwordConfirm) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }

        if (password.length < 6) {
            alert('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        try {
            const response = await fetch(`${this.supabaseUrl}/auth/v1/signup`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email,
                    password,
                    data: { pseudo }
                })
            });

            const data = await response.json();

            if (response.ok) {
                this.showMessage('✅ Compte créé ! Vérifiez votre email pour confirmer.', 'success');
                
                setTimeout(() => {
                    this.showForm('login');
                }, 3000);
            } else {
                alert(data.msg || 'Erreur lors de la création du compte');
            }
        } catch (error) {
            alert('Erreur lors de la création du compte');
        }
    }

    /**
     * Gère le mot de passe oublié
     */
    async handleForgotPassword() {
        const email = document.getElementById('forgot-email').value.trim();

        if (!email) {
            alert('Veuillez entrer votre email');
            return;
        }

        try {
            const response = await fetch(`${this.supabaseUrl}/auth/v1/recover`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            if (response.ok) {
                this.showMessage('✅ Email de réinitialisation envoyé ! Vérifiez votre boîte mail.', 'success');
            } else {
                alert('Erreur lors de l\'envoi de l\'email');
            }
        } catch (error) {
            alert('Erreur lors de l\'envoi de l\'email');
        }
    }

    /**
     * Met à jour l'UI pour un utilisateur authentifié
     */
    updateUIForAuth() {
        // Mettre à jour le bouton de connexion dans l'interface
        const loginBtn = document.getElementById('user-login-btn');
        if (loginBtn && this.currentUser) {
            loginBtn.textContent = `👤 ${this.currentUser.email}`;
            loginBtn.onclick = () => this.logout();
        }
    }

    /**
     * Déconnexion
     */
    async logout() {
        if (confirm('Se déconnecter ?')) {
            localStorage.removeItem('supabase.auth.token');
            this.currentUser = null;
            location.reload();
        }
    }

    /**
     * Obtient l'utilisateur actuel
     */
    getCurrentUser() {
        return this.currentUser;
    }
}

// Instance globale
const authManager = new AuthManager();
