/**
 * PATRIX - Gestionnaire d'Utilisateur
 * Gestion de la connexion et sauvegarde des scores
 * Auteur: Emmanuel Payet
 */

class UserManager {
    constructor() {
        // ID unique du jeu pour éviter les conflits avec d'autres jeux du domaine
        this.GAME_ID = 'patrix';
        this.supabaseUrl = 'https://dmszyxowetilvsanqsxm.supabase.co';
        this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRtc3p5eG93ZXRpbHZzYW5xc3htIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk3NzM0NDUsImV4cCI6MjA3NTM0OTQ0NX0.EukDYFVt0sCrDb0_V4ZPMv5B4gkD43V8Cw7CEuvl0C8';
        this.currentUser = null;
        this.maxScore = 0;
        this.maxLevel = 0;
        this.unlockedTrophies = [];
        this.syncedUsers = new Set(JSON.parse(localStorage.getItem(`${this.GAME_ID}_synced_users`) || '[]'));
        this.pendingSyncs = new Set(); // Empêcher les syncs simultanés
        this.init();
    }

    /**
     * Initialisation
     */
    init() {
        // Charger l'utilisateur depuis localStorage
        this.loadUser();
        // Charger le score max
        this.loadMaxScore();
        // Charger le niveau max
        this.loadMaxLevel();
        // Charger les trophées
        this.loadTrophies();
    }

    /**
     * Charge l'utilisateur depuis localStorage
     */
    loadUser() {
        const saved = localStorage.getItem(`${this.GAME_ID}_user`);
        if (saved) {
            try {
                this.currentUser = JSON.parse(saved);
            } catch (e) {
                console.error('Erreur chargement utilisateur:', e);
                this.currentUser = null;
            }
        }
    }

    /**
     * Sauvegarde l'utilisateur dans localStorage
     */
    saveUser() {
        if (this.currentUser) {
            localStorage.setItem(`${this.GAME_ID}_user`, JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem(`${this.GAME_ID}_user`);
        }
    }

    /**
     * Charge le score max depuis localStorage
     */
    loadMaxScore() {
        const saved = localStorage.getItem(`${this.GAME_ID}_max_score`);
        this.maxScore = saved ? parseInt(saved) : 0;
    }

    /**
     * Sauvegarde le score max
     */
    saveMaxScore(score) {
        if (score > this.maxScore) {
            this.maxScore = score;
            localStorage.setItem(`${this.GAME_ID}_max_score`, score.toString());
            
            // Synchroniser avec Supabase si connecté
            if (this.currentUser) {
                this.syncScoreToSupabase(score);
            }
        }
    }

    /**
     * Charge le niveau max depuis localStorage
     */
    loadMaxLevel() {
        const saved = localStorage.getItem(`${this.GAME_ID}_max_level`);
        this.maxLevel = saved ? parseInt(saved, 10) : 0;
    }

    /**
     * Sauvegarde le niveau max
     */
    saveMaxLevel(level) {
        if (level > this.maxLevel) {
            this.maxLevel = level;
            localStorage.setItem(`${this.GAME_ID}_max_level`, level.toString());
            
            // Synchroniser avec Supabase si connecté
            if (this.currentUser) {
                this.syncProgressToSupabase();
            }
        }
    }

    /**
     * Charge les trophées depuis localStorage
     */
    loadTrophies() {
        const saved = localStorage.getItem(`${this.GAME_ID}_trophies`);
        this.unlockedTrophies = saved ? JSON.parse(saved) : [];
    }

    /**
     * Sauvegarde un nouveau trophée
     */
    saveTrophy(trophyId) {
        if (!this.unlockedTrophies.includes(trophyId)) {
            this.unlockedTrophies.push(trophyId);
            localStorage.setItem(`${this.GAME_ID}_trophies`, JSON.stringify(this.unlockedTrophies));
            
            // Synchroniser avec Supabase si connecté
            if (this.currentUser) {
                this.syncProgressToSupabase();
            }
        }
    }

    /**
     * Vérifie si un utilisateur existe dans Supabase
     */
    async checkUserExists(username) {
        try {
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/users?pseudo=eq.${username.toLowerCase()}&select=pseudo,email`,
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                }
            );

            if (response.ok) {
                const users = await response.json();
                return users.length > 0 ? users[0] : null;
            }
            return null;
        } catch (error) {
            console.error('Erreur vérification utilisateur:', error);
            return null;
        }
    }

    /**
     * Connexion utilisateur existant
     */
    async login(username, password) {
        if (!username || username.trim().length < 3) {
            throw new Error('Le nom d\'utilisateur doit contenir au moins 3 caractères');
        }

        if (!password || password.length < 6) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }

        username = username.trim().toLowerCase();

        // Vérifier si l'utilisateur existe dans Supabase
        const existingUser = await this.checkUserExists(username);
        
        if (!existingUser) {
            throw new Error('Utilisateur non trouvé. Crée d\'abord un compte !');
        }

        // Hash le mot de passe (stocké localement)
        const passwordHash = await this.hashPassword(password);
        
        // TODO: Vérifier le mot de passe avec Supabase quand la colonne password_hash sera ajoutée
        // if (passwordHash !== existingUser.password_hash) {
        //     throw new Error('Mot de passe incorrect');
        // }

        // Créer la session locale
        this.currentUser = {
            pseudo: username,
            email: existingUser.email,
            passwordHash: passwordHash,
            loginDate: new Date().toISOString(),
            gamesPlayed: 0
        };

        this.saveUser();
        
        // Charger la progression depuis Supabase
        await this.loadProgressFromSupabase();

        return this.currentUser;
    }

    /**
     * Création d'un nouveau compte
     */
    async register(username, email, password) {
        if (!username || username.trim().length < 3) {
            throw new Error('Le nom d\'utilisateur doit contenir au moins 3 caractères');
        }

        if (!password || password.length < 6) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }

        username = username.trim().toLowerCase();
        
        // Valider l'email
        if (!email || !email.trim()) {
            throw new Error('L\'email est requis');
        }
        
        email = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email invalide');
        }

        // Vérifier que l'utilisateur n'existe pas déjà
        const existingUser = await this.checkUserExists(username);
        if (existingUser) {
            throw new Error('Ce pseudo est déjà pris. Connecte-toi ou choisis un autre pseudo.');
        }

        // Hash le mot de passe
        const passwordHash = await this.hashPassword(password);

        // Créer l'utilisateur local
        this.currentUser = {
            pseudo: username,
            email: email,
            passwordHash: passwordHash,
            loginDate: new Date().toISOString(),
            gamesPlayed: 0
        };

        this.saveUser();

        // Synchroniser avec Supabase (création du compte)
        try {
            await this.syncUserToSupabase(passwordHash);
        } catch (error) {
            // Si l'utilisateur existe déjà (409), continuer quand même
            console.log('[UserManager] Compte créé localement, sync Supabase ignorée (utilisateur existe)');
        }

        return this.currentUser;
    }

    /**
     * Hash le mot de passe avec SHA-256
     */
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    /**
     * Vérifie le mot de passe
     */
    async verifyPassword(password, hash) {
        const passwordHash = await this.hashPassword(password);
        return passwordHash === hash;
    }

    /**
     * Demande de réinitialisation du mot de passe via Supabase Auth
     */
    async requestPasswordReset(email) {
        if (!email || !email.trim()) {
            throw new Error('Email requis');
        }

        email = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email invalide');
        }

        try {
            // Utiliser l'API Supabase Auth pour réinitialiser le mot de passe
            const response = await fetch(`${this.supabaseUrl}/auth/v1/recover`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: email
                })
            });

            if (response.ok) {
                return { success: true, message: 'Email de réinitialisation envoyé' };
            } else {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de l\'envoi de l\'email');
            }
        } catch (error) {
            console.error('Erreur réinitialisation mot de passe:', error);
            throw error;
        }
    }

    /**
     * Déconnexion
     */
    logout() {
        this.currentUser = null;
        this.saveUser();
    }

    /**
     * Incrémente le nombre de parties jouées
     */
    incrementGamesPlayed() {
        if (this.currentUser) {
            this.currentUser.gamesPlayed = (this.currentUser.gamesPlayed || 0) + 1;
            this.saveUser();
        }
    }

    /**
     * Synchronise l'utilisateur avec Supabase
     */
    async syncUserToSupabase(passwordHash = null) {
        if (!this.currentUser) return;

        const pseudoKey = this.currentUser.pseudo.toLowerCase();

        // Ne pas resynchroniser si déjà fait pour ce pseudo
        if (this.syncedUsers.has(pseudoKey)) {
            return; // Déjà synchronisé, skip
        }

        // Empêcher les appels simultanés pour le même pseudo
        if (this.pendingSyncs.has(pseudoKey)) {
            return; // Sync en cours, skip
        }

        this.pendingSyncs.add(pseudoKey);

        try {
            // Utiliser UPSERT avec Prefer: resolution=merge-duplicates
            // Si le pseudo existe, on met à jour l'email, sinon on crée
            const body = {
                pseudo: this.currentUser.pseudo,
                email: this.currentUser.email || null,
                avatar: null,
                ville: null,
                pays: null,
                age: null,
                genre: null
            };
            
            // TODO: Ajouter le hash du mot de passe quand la colonne sera créée dans Supabase
            // if (passwordHash) {
            //     body.password_hash = passwordHash;
            // }
            
            const response = await fetch(`${this.supabaseUrl}/rest/v1/users`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates,return=minimal'
                },
                body: JSON.stringify(body)
            });

            // Marquer comme synchronisé si succès ou 409 (existe déjà)
            if (response.ok || response.status === 409) {
                this.syncedUsers.add(pseudoKey);
                localStorage.setItem(`${this.GAME_ID}_synced_users`, JSON.stringify([...this.syncedUsers]));
            }
        } catch (error) {
            // Erreur réseau, ignorer silencieusement
        } finally {
            this.pendingSyncs.delete(pseudoKey);
        }
    }

    /**
     * Synchronise le score avec Supabase
     */
    async syncScoreToSupabase(score) {
        if (!this.currentUser) return;

        try {
            // Vérifier si un score existe déjà pour cet utilisateur
            const checkResponse = await fetch(
                `${this.supabaseUrl}/rest/v1/patrxscore?pseudo=eq.${this.currentUser.pseudo}&select=pseudo,max_score`,
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                }
            );

            if (checkResponse.ok) {
                const existingScores = await checkResponse.json();
                
                if (existingScores && existingScores.length > 0) {
                    // Score existe, vérifier si on doit le mettre à jour
                    const currentMaxScore = existingScores[0].max_score;
                    
                    if (score > currentMaxScore) {
                        // Mettre à jour le score
                        const updateResponse = await fetch(
                            `${this.supabaseUrl}/rest/v1/patrxscore?pseudo=eq.${this.currentUser.pseudo}`,
                            {
                                method: 'PATCH',
                                headers: {
                                    'apikey': this.supabaseKey,
                                    'Authorization': `Bearer ${this.supabaseKey}`,
                                    'Content-Type': 'application/json',
                                    'Prefer': 'return=minimal'
                                },
                                body: JSON.stringify({
                                    max_score: score,
                                    date: new Date().toISOString()
                                })
                            }
                        );
                        
                        if (!updateResponse.ok) {
                            console.error('Erreur mise à jour score:', updateResponse.statusText);
                        }
                    }
                    return;
                }
            }

            // Créer un nouveau score
            const response = await fetch(`${this.supabaseUrl}/rest/v1/patrxscore`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    pseudo: this.currentUser.pseudo,
                    max_score: score,
                    date: new Date().toISOString()
                })
            });

            if (!response.ok) {
                console.error('Erreur sync score:', response.statusText);
            }
        } catch (error) {
            console.error('Erreur sync score Supabase:', error);
        }
    }

    /**
     * Synchronise la progression (niveau max et trophées) avec Supabase
     */
    async syncProgressToSupabase() {
        if (!this.currentUser) return;

        try {
            // Vérifier si une entrée existe déjà
            const checkResponse = await fetch(
                `${this.supabaseUrl}/rest/v1/patrxprogress?pseudo=eq.${this.currentUser.pseudo}&select=pseudo,max_level,unlocked_trophies`,
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                }
            );

            if (checkResponse.ok) {
                const existing = await checkResponse.json();
                
                if (existing && existing.length > 0) {
                    // Mettre à jour la progression
                    const updateResponse = await fetch(
                        `${this.supabaseUrl}/rest/v1/patrxprogress?pseudo=eq.${this.currentUser.pseudo}`,
                        {
                            method: 'PATCH',
                            headers: {
                                'apikey': this.supabaseKey,
                                'Authorization': `Bearer ${this.supabaseKey}`,
                                'Content-Type': 'application/json',
                                'Prefer': 'return=minimal'
                            },
                            body: JSON.stringify({
                                max_level: this.maxLevel,
                                unlocked_trophies: this.unlockedTrophies,
                                updated_at: new Date().toISOString()
                            })
                        }
                    );
                    
                    if (!updateResponse.ok) {
                        console.error('Erreur mise à jour progression:', updateResponse.statusText);
                    }
                    return;
                }
            }

            // Créer une nouvelle entrée
            const response = await fetch(`${this.supabaseUrl}/rest/v1/patrxprogress`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    pseudo: this.currentUser.pseudo,
                    max_level: this.maxLevel,
                    unlocked_trophies: this.unlockedTrophies,
                    updated_at: new Date().toISOString()
                })
            });

            if (!response.ok && response.status !== 409) {
                console.error('Erreur sync progression:', response.statusText);
            }
        } catch (error) {
            console.error('Erreur sync progression Supabase:', error);
        }
    }

    /**
     * Charge la progression (niveau max et trophées) depuis Supabase
     */
    async loadProgressFromSupabase() {
        if (!this.currentUser) return;

        try {
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/patrxprogress?pseudo=eq.${this.currentUser.pseudo}&select=max_level,unlocked_trophies`,
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                }
            );

            if (response.ok) {
                const data = await response.json();
                
                if (data && data.length > 0) {
                    const remoteProgress = data[0];
                    
                    // Fusionner avec les données locales (garder le max)
                    if (remoteProgress.max_level > this.maxLevel) {
                        this.maxLevel = remoteProgress.max_level;
                        localStorage.setItem(`${this.GAME_ID}_max_level`, this.maxLevel.toString());
                    }
                    
                    // Fusionner les trophées (union des deux listes)
                    if (remoteProgress.unlocked_trophies && Array.isArray(remoteProgress.unlocked_trophies)) {
                        const mergedTrophies = [...new Set([...this.unlockedTrophies, ...remoteProgress.unlocked_trophies])];
                        if (mergedTrophies.length > this.unlockedTrophies.length) {
                            this.unlockedTrophies = mergedTrophies;
                            localStorage.setItem(`${this.GAME_ID}_trophies`, JSON.stringify(this.unlockedTrophies));
                        }
                    }
                    
                    console.log(`[UserManager] Progression chargée: Level ${this.maxLevel}, ${this.unlockedTrophies.length} trophées`);
                }
            }
        } catch (error) {
            console.error('Erreur chargement progression Supabase:', error);
        }
    }

    /**
     * Récupère le classement depuis Supabase
     */
    async getLeaderboard(limit = 10) {
        try {
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/patrxscore?select=pseudo,max_score&order=max_score.desc&limit=${limit}`,
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                }
            );

            if (response.ok) {
                return await response.json();
            } else {
                console.error('Erreur récupération classement:', response.statusText);
                return [];
            }
        } catch (error) {
            console.error('Erreur classement Supabase:', error);
            return [];
        }
    }

    /**
     * Récupère la position de l'utilisateur dans le classement
     */
    async getUserRank() {
        if (!this.currentUser) return null;

        try {
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/rpc/get_user_rank`,
                {
                    method: 'POST',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        user_pseudo: this.currentUser.pseudo
                    })
                }
            );

            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.error('Erreur rang utilisateur:', error);
        }

        return null;
    }

    /**
     * Vérifie si l'utilisateur est connecté
     */
    isLoggedIn() {
        return this.currentUser !== null;
    }

    /**
     * Récupère le nom d'utilisateur
     */
    getUsername() {
        return this.currentUser ? this.currentUser.pseudo : 'Invité';
    }

    /**
     * Récupère le score max
     */
    getMaxScore() {
        return this.maxScore;
    }
}

// Rendre disponible globalement
window.UserManager = UserManager;

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManager;
}
