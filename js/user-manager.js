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
     * Connexion utilisateur (création si n'existe pas)
     */
    async login(username) {
        if (!username || username.trim().length < 3) {
            throw new Error('Le nom d\'utilisateur doit contenir au moins 3 caractères');
        }

        username = username.trim().toLowerCase();

        // Créer l'utilisateur local
        this.currentUser = {
            pseudo: username,
            loginDate: new Date().toISOString(),
            gamesPlayed: 0
        };

        this.saveUser();

        // Synchroniser avec Supabase
        await this.syncUserToSupabase();

        return this.currentUser;
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
    async syncUserToSupabase() {
        if (!this.currentUser) return;

        try {
            // Vérifier si l'utilisateur existe déjà
            const checkResponse = await fetch(
                `${this.supabaseUrl}/rest/v1/users?pseudo=eq.${this.currentUser.pseudo}&select=id,pseudo`,
                {
                    headers: {
                        'apikey': this.supabaseKey,
                        'Authorization': `Bearer ${this.supabaseKey}`
                    }
                }
            );

            if (checkResponse.ok) {
                const existingUsers = await checkResponse.json();
                
                if (existingUsers && existingUsers.length > 0) {
                    // Utilisateur existe déjà, ne rien faire ou mettre à jour la date de dernière connexion
                    console.log('Utilisateur existant:', existingUsers[0].pseudo);
                    return;
                }
            }

            // Créer le nouvel utilisateur
            const response = await fetch(`${this.supabaseUrl}/rest/v1/users`, {
                method: 'POST',
                headers: {
                    'apikey': this.supabaseKey,
                    'Authorization': `Bearer ${this.supabaseKey}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    pseudo: this.currentUser.pseudo,
                    email: null,
                    avatar: null,
                    ville: null,
                    pays: null,
                    age: null,
                    genre: null
                })
            });

            if (!response.ok && response.status !== 409) {
                console.error('Erreur sync user:', response.statusText);
            }
        } catch (error) {
            console.error('Erreur connexion Supabase:', error);
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
