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
        
        // Cache et optimisations API
        this.syncDebounceTimer = null;
        this.scoreDebounceTimer = null;
        this.leaderboardCache = null;
        this.leaderboardCacheTime = 0;
        this.CACHE_DURATION = 60000; // 1 minute
        this.pendingScoreUpdate = null;
        this.pendingProgressUpdate = null;
        
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
            // Sauvegarder aussi l'avatar séparément pour ProfileManager
            if (this.currentUser.avatar) {
                localStorage.setItem('patrix_avatar', this.currentUser.avatar);
            }
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
     * Vérifie si un utilisateur existe dans Supabase par email
     * @param {string} email - Email de l'utilisateur
     */
    async checkUserByEmail(email) {
        try {
            const url = `${this.supabaseUrl}/rest/v1/users?email=eq.${email.toLowerCase()}&select=pseudo,email,password_hash`;
            
            const response = await fetch(url, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });

            if (response.ok) {
                const users = await response.json();
                if (users.length > 0) {
                    console.log(`[UserManager] Utilisateur trouvé avec email "${email}"`);
                    return users[0];
                } else {
                    console.log(`[UserManager] Aucun utilisateur avec email "${email}"`);
                    return null;
                }
            } else {
                console.error(`[UserManager] Erreur Supabase (${response.status}):`, await response.text());
                throw new Error(`Unable to verify account online (error ${response.status}). Check your internet connection.`);
            }
        } catch (error) {
            if (error.message && error.message.includes('Impossible de vérifier')) {
                throw error;
            }
            console.error('[UserManager] Erreur réseau lors de la vérification:', error);
            throw new Error('Impossible de se connecter au serveur. Vérifie ta connexion Internet.');
        }
    }

    /**
     * Vérifie si un pseudo est déjà pris
     * @param {string} username - Pseudo à vérifier
     */
    async checkPseudoTaken(username) {
        try {
            const url = `${this.supabaseUrl}/rest/v1/users?pseudo=ilike.${username.toLowerCase()}&select=pseudo`;
            
            const response = await fetch(url, {
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`
                }
            });

            if (response.ok) {
                const users = await response.json();
                return users.length > 0;
            } else {
                throw new Error(`Unable to verify username online (error ${response.status}). Check your internet connection.`);
            }
        } catch (error) {
            if (error.message && error.message.includes('Impossible de vérifier')) {
                throw error;
            }
            console.error('[UserManager] Erreur vérification pseudo:', error);
            throw new Error('Impossible de se connecter au serveur. Vérifie ta connexion Internet.');
        }
    }

    /**
     * Connexion utilisateur existant
     * @param {string} email - Email de l'utilisateur (identifiant principal)
     * @param {string} password - Mot de passe
     */
    async login(email, password) {
        if (!email || !email.trim()) {
            throw new Error('L\'email est requis');
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email invalide');
        }

        if (!password || password.length < 6) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }

        email = email.trim().toLowerCase();

        // Hash le mot de passe pour comparaison
        const passwordHash = await this.hashPassword(password);
        console.log('[UserManager] Hash calculé:', passwordHash);

        // Vérifier d'abord si l'utilisateur existe localement
        const savedUser = localStorage.getItem(`${this.GAME_ID}_user`);
        if (savedUser) {
            try {
                const localUser = JSON.parse(savedUser);
                if (localUser.email === email) {
                    // Utilisateur trouvé localement, vérifier le mot de passe
                    if (localUser.passwordHash === passwordHash) {
                        // Mot de passe correct, connexion réussie
                        this.currentUser = {
                            ...localUser,
                            loginDate: new Date().toISOString()
                        };
                        this.saveUser();
                        
                        // Charger la progression depuis Supabase
                        await this.loadProgressFromSupabase();
                        return this.currentUser;
                    } else {
                        throw new Error('Mot de passe incorrect');
                    }
                }
            } catch (e) {
                if (e.message === 'Mot de passe incorrect') throw e;
                console.error('Erreur lecture utilisateur local:', e);
            }
        }

        // Vérifier dans Supabase par email (lance une erreur si connexion impossible)
        const existingUser = await this.checkUserByEmail(email);
        
        if (!existingUser) {
            throw new Error('No account found with this email. Create an account first!');
        }

        // Vérifier le mot de passe avec Supabase
        if (existingUser.password_hash) {
            console.log('[UserManager] Hash dans Supabase:', existingUser.password_hash);
            console.log('[UserManager] Hash calculé:', passwordHash);
            console.log('[UserManager] Correspondent:', existingUser.password_hash === passwordHash);
            
            // Supabase a un mot de passe enregistré, le vérifier
            if (existingUser.password_hash !== passwordHash) {
                throw new Error('Mot de passe incorrect');
            }
            console.log('[UserManager] Connexion depuis Supabase par email - mot de passe vérifié');
        } else {
            // Aucun mot de passe dans Supabase = compte incomplet
            console.warn('[UserManager] Compte trouvé sans mot de passe');
            throw new Error('Ce compte existe mais n\'a pas de mot de passe. Utilise l\'inscription pour définir ton mot de passe.');
        }
        
        // Créer/restaurer la session locale
        this.currentUser = {
            pseudo: existingUser.pseudo,
            email: existingUser.email,
            passwordHash: passwordHash,
            avatar: existingUser.avatar || 'cross1', // Avatar depuis DB ou par défaut
            loginDate: new Date().toISOString(),
            gamesPlayed: 0
        };

        this.saveUser();
        
        // Sauvegarder l'avatar localement
        if (existingUser.avatar) {
            localStorage.setItem('patrix_avatar', existingUser.avatar);
        }
        
        // Charger la progression depuis Supabase
        await this.loadProgressFromSupabase();
        
        // Vérifier si l'utilisateur a un pseudo
        if (!existingUser.pseudo || existingUser.pseudo.trim() === '') {
            // Inviter à créer un profil
            if (window.effects) {
                window.effects.showSpiritualMessage('👋 Welcome! Create your profile to personalize your experience', 4000);
            }
            // Ouvrir automatiquement le modal de profil après un court délai
            setTimeout(() => {
                if (window.profileManager) {
                    window.profileManager.openProfileModal();
                }
            }, 2000);
        }

        return this.currentUser;
    }

    /**
     * Création d'un nouveau compte
     */
    async register(username, email, password) {
        if (!username || username.trim().length < 3) {
            throw new Error('Username must contain at least 3 characters');
        }

        if (!password || password.length < 6) {
            throw new Error('Le mot de passe doit contenir au moins 6 caractères');
        }

        username = username.trim();
        
        // Valider l'email
        if (!email || !email.trim()) {
            throw new Error('L\'email est requis');
        }
        
        email = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email invalide');
        }

        // Vérifier si un utilisateur local existe déjà avec cet email
        const savedUser = localStorage.getItem(`${this.GAME_ID}_user`);
        if (savedUser) {
            try {
                const localUser = JSON.parse(savedUser);
                if (localUser.email === email) {
                    throw new Error('Cet email est déjà utilisé localement. Connecte-toi ou déconnecte-toi d\'abord.');
                }
            } catch (e) {
                if (e.message.includes('email')) throw e;
            }
        }

        // Vérifier si l'email existe dans Supabase (lance une erreur si connexion impossible)
        const existingUser = await this.checkUserByEmail(email);
        
        if (existingUser) {
            // Le compte existe déjà en ligne, vérifier le mot de passe
            console.log('[UserManager] Compte existant trouvé dans Supabase');
            
            // Hash le mot de passe
            const passwordHash = await this.hashPassword(password);
            
            // Vérifier le mot de passe
            if (existingUser.password_hash && existingUser.password_hash !== passwordHash) {
                throw new Error('Ce compte existe déjà avec un autre mot de passe. Utilise la connexion.');
            }
            
            // Si pas de mot de passe enregistré ou mot de passe correct, récupérer le compte
            if (!existingUser.password_hash) {
                // Mettre à jour le mot de passe dans Supabase
                await this.updatePasswordInSupabase(email, passwordHash);
            }
            
            // Créer la session locale avec les données Supabase
            this.currentUser = {
                pseudo: existingUser.pseudo, // Utiliser le pseudo existant
                email: email,
                passwordHash: passwordHash,
                loginDate: new Date().toISOString(),
                gamesPlayed: 0
            };
            
            this.saveUser();
            
            // Charger la progression depuis Supabase
            await this.loadProgressFromSupabase();
            
            return this.currentUser;
        }

        // Vérifier que le pseudo n'est pas déjà pris (lance une erreur si connexion impossible)
        const pseudoTaken = await this.checkPseudoTaken(username);
        if (pseudoTaken) {
            throw new Error('Ce pseudo est déjà pris. Choisis-en un autre.');
        }

        // Hash le mot de passe
        const passwordHash = await this.hashPassword(password);

        // Synchroniser avec Supabase AVANT de créer localement
        const syncResult = await this.syncUserToSupabase(passwordHash, username, email);
        
        if (!syncResult.success) {
            throw new Error('Impossible de créer le compte en ligne. Vérifie ta connexion Internet.');
        }

        // Créer l'utilisateur local seulement après succès de la sync
        this.currentUser = {
            pseudo: username,
            email: email,
            passwordHash: passwordHash,
            loginDate: new Date().toISOString(),
            gamesPlayed: 0
        };

        this.saveUser();
        
        if (syncResult.alreadyExists) {
            console.log('[UserManager] Compte créé localement (déjà existant en ligne)');
        } else {
            console.log('[UserManager] Compte créé et synchronisé avec Supabase');
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
     * Réinitialise le mot de passe (met password_hash à NULL)
     */
    async resetPassword(email) {
        if (!email || !email.trim()) {
            throw new Error('Email requis');
        }

        email = email.trim().toLowerCase();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new Error('Email invalide');
        }

        // Vérifier que le compte existe
        const existingUser = await this.checkUserByEmail(email);
        if (!existingUser) {
            throw new Error('Aucun compte trouvé avec cet email');
        }

        // Mettre password_hash à NULL pour forcer la redéfinition
        const success = await this.updatePasswordInSupabase(email, null);
        
        if (!success) {
            throw new Error('Erreur lors de la réinitialisation. Réessaie.');
        }

        return true;
    }

    /**
     * Demande de réinitialisation du mot de passe via Supabase Auth (OBSOLÈTE)
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
        // Flush pending updates avant déconnexion
        if (this.pendingScoreUpdate) {
            this.flushScoreUpdate();
        }
        if (this.pendingProgressUpdate) {
            this.flushProgressUpdate();
        }
        
        this.currentUser = null;
        this.saveUser();
        
        // Invalider les caches
        this.leaderboardCache = null;
        this.leaderboardCacheTime = 0;
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
     * @param {string} passwordHash - Hash du mot de passe
     * @param {string} pseudo - Pseudo de l'utilisateur (optionnel si currentUser existe)
     * @param {string} email - Email de l'utilisateur (optionnel si currentUser existe)
     * @returns {Promise<{success: boolean, alreadyExists: boolean}>}
     */
    async syncUserToSupabase(passwordHash = null, pseudo = null, email = null) {
        // Utiliser les paramètres ou les données de currentUser
        const userPseudo = pseudo || (this.currentUser ? this.currentUser.pseudo : null);
        const userEmail = email || (this.currentUser ? this.currentUser.email : null);
        
        if (!userPseudo) return { success: false, alreadyExists: false };

        const pseudoKey = userPseudo.toLowerCase();

        // Ne pas resynchroniser si déjà fait pour ce pseudo
        if (this.syncedUsers.has(pseudoKey)) {
            return { success: true, alreadyExists: true }; // Déjà synchronisé
        }

        // Empêcher les appels simultanés pour le même pseudo
        if (this.pendingSyncs.has(pseudoKey)) {
            return { success: false, alreadyExists: false }; // Sync en cours
        }

        this.pendingSyncs.add(pseudoKey);

        try {
            // Vérifier d'abord si l'utilisateur existe
            const existingUser = await this.checkUserExists(userPseudo);
            
            if (existingUser) {
                // L'utilisateur existe déjà, marquer comme synchronisé
                this.syncedUsers.add(pseudoKey);
                localStorage.setItem(`${this.GAME_ID}_synced_users`, JSON.stringify([...this.syncedUsers]));
                return { success: true, alreadyExists: true };
            }
            
            // Créer le nouvel utilisateur
            const body = {
                pseudo: userPseudo,
                email: userEmail || null,
                password_hash: passwordHash || null,
                avatar: null,
                ville: null,
                pays: null,
                age: null,
                genre: null
            };
            
            const response = await fetch(`${this.supabaseUrl}/rest/v1/users`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(body)
            });

            // Marquer comme synchronisé si succès
            if (response.ok) {
                this.syncedUsers.add(pseudoKey);
                localStorage.setItem(`${this.GAME_ID}_synced_users`, JSON.stringify([...this.syncedUsers]));
                return { success: true, alreadyExists: false };
            } else if (response.status === 409) {
                // Doublon détecté (race condition), marquer quand même
                this.syncedUsers.add(pseudoKey);
                localStorage.setItem(`${this.GAME_ID}_synced_users`, JSON.stringify([...this.syncedUsers]));
                return { success: true, alreadyExists: true };
            } else {
                console.error('[UserManager] Erreur sync Supabase:', response.status);
                return { success: false, alreadyExists: false };
            }
        } catch (error) {
            console.error('[UserManager] Erreur réseau sync:', error);
            return { success: false, alreadyExists: false };
        } finally {
            this.pendingSyncs.delete(pseudoKey);
        }
    }

    /**
     * Synchronise le score avec Supabase (avec debouncing)
     */
    async syncScoreToSupabase(score) {
        if (!this.currentUser) return;
        
        // Debouncing : attendre 2s avant sync
        if (this.scoreDebounceTimer) {
            clearTimeout(this.scoreDebounceTimer);
        }
        
        this.pendingScoreUpdate = score;
        
        this.scoreDebounceTimer = setTimeout(async () => {
            await this.flushScoreUpdate();
        }, 2000);
    }
    
    /**
     * Exécute la synchronisation du score
     */
    async flushScoreUpdate() {
        if (!this.currentUser || !this.pendingScoreUpdate) return;
        
        const score = this.pendingScoreUpdate;
        this.pendingScoreUpdate = null;

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
     * Synchronise la progression (niveau max et trophées) avec Supabase (avec debouncing)
     */
    async syncProgressToSupabase() {
        if (!this.currentUser) return;
        
        // Debouncing : attendre 3s avant sync
        if (this.syncDebounceTimer) {
            clearTimeout(this.syncDebounceTimer);
        }
        
        this.pendingProgressUpdate = {
            maxLevel: this.maxLevel,
            trophies: [...this.unlockedTrophies]
        };
        
        this.syncDebounceTimer = setTimeout(async () => {
            await this.flushProgressUpdate();
        }, 3000);
    }
    
    /**
     * Exécute la synchronisation de la progression
     */
    async flushProgressUpdate() {
        if (!this.currentUser || !this.pendingProgressUpdate) return;
        
        const { maxLevel, trophies } = this.pendingProgressUpdate;
        this.pendingProgressUpdate = null;

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
     * Met à jour le mot de passe dans Supabase
     */
    async updatePasswordInSupabase(email, passwordHash) {
        try {
            const response = await fetch(
                `${this.supabaseUrl}/rest/v1/users?email=eq.${email.toLowerCase()}`,
                {
                    method: 'PATCH',
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        password_hash: passwordHash
                    })
                }
            );

            if (response.ok) {
                console.log('[UserManager] Mot de passe mis à jour dans Supabase');
                return true;
            } else {
                console.error('[UserManager] Erreur mise à jour mot de passe:', response.statusText);
                return false;
            }
        } catch (error) {
            console.error('[UserManager] Erreur réseau mise à jour mot de passe:', error);
            return false;
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
     * Récupère le classement depuis Supabase (avec cache)
     */
    async getLeaderboard(limit = 10) {
        // Utiliser le cache si valide
        const now = Date.now();
        if (this.leaderboardCache && (now - this.leaderboardCacheTime) < this.CACHE_DURATION) {
            return this.leaderboardCache;
        }
        
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
                const data = await response.json();
                // Mettre en cache
                this.leaderboardCache = data;
                this.leaderboardCacheTime = Date.now();
                return data;
            } else {
                console.error('Erreur récupération classement:', response.statusText);
                return this.leaderboardCache || [];
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

    /**
     * Met à jour le profil utilisateur (pseudo et/ou avatar)
     */
    async updateProfile({ pseudo, avatar }) {
        if (!this.currentUser) {
            throw new Error('Aucun utilisateur connecté');
        }

        try {
            const updates = {};
            
            if (pseudo && pseudo !== this.currentUser.pseudo) {
                // Vérifier que le pseudo n'est pas déjà pris
                const pseudoTaken = await this.checkPseudoTaken(pseudo);
                if (pseudoTaken) {
                    throw new Error('Ce pseudo est déjà pris');
                }
                updates.pseudo = pseudo;
                this.currentUser.pseudo = pseudo;
            }

            if (avatar) {
                updates.avatar = avatar;
                this.currentUser.avatar = avatar;
            }

            // Mettre à jour dans Supabase
            if (Object.keys(updates).length > 0) {
                const response = await fetch(
                    `${this.supabaseUrl}/rest/v1/users?email=eq.${this.currentUser.email.toLowerCase()}`,
                    {
                        method: 'PATCH',
                        headers: {
                            'apikey': this.supabaseKey,
                            'Authorization': `Bearer ${this.supabaseKey}`,
                            'Content-Type': 'application/json',
                            'Prefer': 'return=minimal'
                        },
                        body: JSON.stringify(updates)
                    }
                );

                if (!response.ok) {
                    throw new Error('Erreur lors de la mise à jour du profil');
                }

                // Sauvegarder localement
                this.saveUser();
                console.log('[UserManager] Profil mis à jour');
            }

            return true;
        } catch (error) {
            console.error('[UserManager] Erreur mise à jour profil:', error);
            throw error;
        }
    }

    /**
     * Sauvegarde l'état complet de la partie dans un slot (1, 2 ou 3)
     */
    saveGameState(gameState, slotNumber = null) {
        // Si pas de slot spécifié, trouver le prochain slot vide ou utiliser le slot 1
        if (slotNumber === null) {
            slotNumber = this.findNextEmptySlot() || 1;
        }
        
        // Valider le numéro de slot
        if (slotNumber < 1 || slotNumber > 3) {
            console.error('[UserManager] Numéro de slot invalide:', slotNumber);
            return false;
        }
        
        const saveData = {
            ...gameState,
            savedAt: new Date().toISOString(),
            userId: this.currentUser ? this.currentUser.pseudo : 'guest',
            slotNumber: slotNumber
        };
        
        localStorage.setItem(`${this.GAME_ID}_saved_game_${slotNumber}`, JSON.stringify(saveData));
        console.log(`[UserManager] Partie sauvegardée dans le slot ${slotNumber}`);
        return slotNumber;
    }

    /**
     * Trouve le prochain slot vide (retourne 1, 2, 3 ou null si tous pleins)
     */
    findNextEmptySlot() {
        for (let i = 1; i <= 3; i++) {
            if (!localStorage.getItem(`${this.GAME_ID}_saved_game_${i}`)) {
                return i;
            }
        }
        return null; // Tous les slots sont pleins
    }

    /**
     * Charge l'état sauvegardé d'un slot spécifique
     */
    loadGameState(slotNumber) {
        const saved = localStorage.getItem(`${this.GAME_ID}_saved_game_${slotNumber}`);
        if (saved) {
            try {
                const saveData = JSON.parse(saved);
                console.log(`[UserManager] Slot ${slotNumber} chargé:`, new Date(saveData.savedAt).toLocaleString());
                return saveData;
            } catch (e) {
                console.error('Erreur chargement partie:', e);
                return null;
            }
        }
        return null;
    }

    /**
     * Récupère toutes les sauvegardes disponibles
     */
    getAllSavedGames() {
        const saves = [];
        for (let i = 1; i <= 3; i++) {
            const saved = localStorage.getItem(`${this.GAME_ID}_saved_game_${i}`);
            if (saved) {
                try {
                    const saveData = JSON.parse(saved);
                    saves.push({
                        slot: i,
                        data: saveData,
                        savedAt: new Date(saveData.savedAt),
                        level: saveData.level,
                        score: saveData.score,
                        lines: saveData.lines
                    });
                } catch (e) {
                    console.error(`Erreur lecture slot ${i}:`, e);
                }
            } else {
                saves.push({ slot: i, empty: true });
            }
        }
        return saves;
    }

    /**
     * Supprime la sauvegarde d'un slot spécifique
     */
    clearGameState(slotNumber) {
        if (slotNumber < 1 || slotNumber > 3) {
            console.error('[UserManager] Numéro de slot invalide:', slotNumber);
            return false;
        }
        localStorage.removeItem(`${this.GAME_ID}_saved_game_${slotNumber}`);
        console.log(`[UserManager] Slot ${slotNumber} supprimé`);
        return true;
    }

    /**
     * Vérifie si au moins une partie sauvegardée existe
     */
    hasSavedGame() {
        for (let i = 1; i <= 3; i++) {
            if (localStorage.getItem(`${this.GAME_ID}_saved_game_${i}`)) {
                return true;
            }
        }
        return false;
    }
}

// Rendre disponible globalement
window.UserManager = UserManager;

// Export pour Node.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UserManager;
}
