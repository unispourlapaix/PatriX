/* PatriX : profil et sauvegardes exclusivement sur cet appareil. */
class UserManager {
 constructor() {
  this.GAME_ID = 'patrix';
  this.currentUser = this.read('local_profile', {pseudo:'Joueur local'});
  this.maxScore = this.read('max_score',0);
  this.maxLevel = this.read('max_level',0);
  this.unlockedTrophies = this.read('trophies',[]);
 }
 read(key, fallback) {try {return JSON.parse(localStorage.getItem('patrix_'+key)) ?? fallback;} catch {return fallback;}}
 write(key,value) {localStorage.setItem('patrix_'+key,JSON.stringify(value));}
 isLoggedIn() {return true;}
 getUsername() {return this.currentUser.pseudo;}
 getMaxScore() {return this.maxScore;}
 getMaxLevel() {return this.maxLevel;}
 saveMaxScore(n) {this.maxScore=Math.max(this.maxScore,n);this.write('max_score',this.maxScore);}
 saveMaxLevel(n) {this.maxLevel=Math.max(this.maxLevel,n);this.write('max_level',this.maxLevel);}
 saveTrophy(id) {if(!this.unlockedTrophies.includes(id)){this.unlockedTrophies.push(id);this.write('trophies',this.unlockedTrophies);}}
 incrementGamesPlayed() {this.write('games_played',this.read('games_played',0)+1);}
 async updateProfile({pseudo,avatar}) {if(pseudo)this.currentUser.pseudo=pseudo;if(avatar){this.currentUser.avatar=avatar;localStorage.setItem('patrix_avatar',avatar);}this.write('local_profile',this.currentUser);return this.currentUser;}
 async getLeaderboard() {return [];}
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


window.UserManager = UserManager;
