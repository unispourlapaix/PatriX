/**
 * PATRIX - Gestionnaire de Profil
 * Auteur: Emmanuel Payet
 */

class ProfileManager {
    constructor(userManager) {
        this.userManager = userManager;
        this.selectedAvatar = null;
        this.wasPausedByProfile = false;
        this.init();
    }

    init() {
        // Charger l'avatar depuis currentUser, localStorage ou défaut
        if (this.userManager.currentUser && this.userManager.currentUser.avatar) {
            this.selectedAvatar = this.userManager.currentUser.avatar;
        } else {
            const savedAvatar = localStorage.getItem('patrix_avatar');
            this.selectedAvatar = savedAvatar || 'patrix'; // Avatar par défaut : icône Patri-X
        }

        // Event listeners
        this.setupEventListeners();
        
        // Initialiser l'affichage
        this.updateProfileDisplay();
    }

    setupEventListeners() {
        const profileEditBtn = document.getElementById('profileEditBtn');
        const profileModalClose = document.getElementById('profileModalClose');
        const profileSaveBtn = document.getElementById('profileSaveBtn');
        const profileModal = document.getElementById('profileModal');
        const profileShareBtn = document.getElementById('profileShareBtn');
        const profileMusicBtn = document.getElementById('profileMusicBtn');

        if (profileEditBtn) {
            profileEditBtn.addEventListener('click', () => {
                this.openProfileModal();
            });
        }

        if (profileModalClose) {
            profileModalClose.addEventListener('click', () => {
                this.closeProfileModal();
            });
        }

        if (profileSaveBtn) {
            profileSaveBtn.addEventListener('click', async () => {
                await this.saveProfile();
            });
        }

        if (profileShareBtn) {
            profileShareBtn.addEventListener('click', async () => {
                await this.shareScore();
            });
            // Support tactile explicite
            profileShareBtn.addEventListener('touchend', async (e) => {
                e.preventDefault();
                await this.shareScore();
            }, { passive: false });
        }

        if (profileMusicBtn) {
            profileMusicBtn.addEventListener('click', () => {
                this.openMusic();
            });
        }

        // Fermer avec Échap
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && profileModal.classList.contains('show')) {
                this.closeProfileModal();
            }
        });
    }

    closeProfileModal() {
        const profileModal = document.getElementById('profileModal');
        profileModal.classList.remove('show');
        
        // Reprendre le jeu si il n'était pas en pause avant
        if (!this.wasPausedByProfile && window.game && window.game.isRunning && window.game.isPaused) {
            window.game.togglePause();
        }
    }

    /**
     * Rafraîchit les données du profil (à appeler après connexion/inscription)
     */
    refresh() {
        console.log('ProfileManager: Refreshing profile data');
        // Recharger l'avatar depuis currentUser
        if (this.userManager.currentUser && this.userManager.currentUser.avatar) {
            this.selectedAvatar = this.userManager.currentUser.avatar;
            console.log('ProfileManager: Avatar loaded from currentUser:', this.selectedAvatar);
        } else {
            const savedAvatar = localStorage.getItem('patrix_avatar');
            this.selectedAvatar = savedAvatar || 'patrix'; // Avatar par défaut : icône Patri-X
            console.log('ProfileManager: Avatar loaded from localStorage:', this.selectedAvatar);
        }
        this.updateProfileDisplay();
    }

    openProfileModal() {
        const modal = document.getElementById('profileModal');
        const pseudoInput = document.getElementById('profilePseudoInput');
        const avatarGrid = document.getElementById('avatarGrid');

        // Mettre le jeu en pause si en cours
        if (window.game && window.game.isRunning && !window.game.isPaused) {
            this.wasPausedByProfile = false;
            window.game.togglePause();
        } else {
            this.wasPausedByProfile = true;
        }

        // Rafraîchir les données avant d'ouvrir le modal
        this.refresh();

        // Générer la grille d'avatars
        if (avatarGrid && window.CHRISTIAN_AVATARS) {
            avatarGrid.innerHTML = window.CHRISTIAN_AVATARS.map(avatar => `
                <div class="avatar-option ${avatar.id === this.selectedAvatar ? 'selected' : ''}" 
                     data-avatar-id="${avatar.id}" 
                     title="${avatar.name}">
                    ${avatar.svg}
                </div>
            `).join('');

            // Event listeners pour les avatars
            avatarGrid.querySelectorAll('.avatar-option').forEach(option => {
                option.addEventListener('click', () => {
                    // Désélectionner tous
                    avatarGrid.querySelectorAll('.avatar-option').forEach(opt => 
                        opt.classList.remove('selected')
                    );
                    // Sélectionner celui-ci
                    option.classList.add('selected');
                    this.selectedAvatar = option.dataset.avatarId;
                });
            });
        }

        modal.classList.add('show');

        // Remplir le pseudo APRÈS avoir ouvert le modal pour être sûr que tout est à jour
        setTimeout(() => {
            if (pseudoInput) {
                const username = this.userManager.getUsername();
                console.log('ProfileManager: Loading username (after modal open):', username);
                console.log('ProfileManager: currentUser:', this.userManager.currentUser);
                pseudoInput.value = username || '';
            }
        }, 50);
    }

    async saveProfile() {
        const pseudoInput = document.getElementById('profilePseudoInput');
        const newPseudo = pseudoInput.value.trim();

        // Validation
        if (newPseudo && newPseudo.length < 3) {
            alert(window.i18n.t('errors.pseudoTooShort'));
            return;
        }

        try {
            // Sauvegarder l'avatar localement
            localStorage.setItem('patrix_avatar', this.selectedAvatar);

            // Si connecté, mettre à jour le pseudo et l'avatar dans Supabase
            if (this.userManager.isLoggedIn() && newPseudo && newPseudo !== this.userManager.getUsername()) {
                await this.userManager.updateProfile({
                    pseudo: newPseudo,
                    avatar: this.selectedAvatar
                });
            } else if (this.userManager.isLoggedIn()) {
                // Juste mettre à jour l'avatar
                await this.userManager.updateProfile({
                    avatar: this.selectedAvatar
                });
            }

            // Mettre à jour l'affichage
            this.updateProfileDisplay();

            // Fermer le modal
            this.closeProfileModal();

            // Message de confirmation
            if (window.effects) {
                window.effects.showSpiritualMessage(window.i18n.t('notifications.profileUpdated'), 2000);
            }

        } catch (error) {
            console.error('[ProfileManager] Erreur sauvegarde profil:', error);
            alert(window.i18n.t('errors.connectionError') + ' : ' + error.message);
        }
    }

    updateProfileDisplay() {
        const profileAvatar = document.getElementById('profileAvatar');
        const profileName = document.getElementById('profileName');

        // Mettre à jour l'avatar
        if (profileAvatar && window.CHRISTIAN_AVATARS) {
            const avatar = window.CHRISTIAN_AVATARS.find(a => a.id === this.selectedAvatar);
            if (avatar) {
                profileAvatar.innerHTML = avatar.svg;
            }
        }

        // Mettre à jour le nom
        if (profileName) {
            profileName.textContent = this.userManager.getUsername();
        }
    }

    getAvatarSVG(avatarId) {
        if (!window.CHRISTIAN_AVATARS) return null;
        const avatar = window.CHRISTIAN_AVATARS.find(a => a.id === avatarId);
        return avatar ? avatar.svg : null;
    }

    getCurrentAvatar() {
        return this.selectedAvatar;
    }

    /**
     * Capture la grille de jeu et partage sur les réseaux sociaux
     */
    async shareScore() {
        try {
            // Récupérer les stats du jeu
            const score = window.game ? window.game.score : 0;
            const level = window.game ? window.game.level : 0;
            const lines = window.game ? window.game.linesCleared : 0;
            const username = this.userManager.getUsername();

            // Créer l'image de la grille
            const imageBlob = await this.captureGameGrid();

            // Préparer le texte de partage
            const shareText = `🎮 PATRI-X - Score: ${score.toLocaleString()} | Niveau: ${level} | Lignes: ${lines}\n\n` +
                `Par ${username}\n\n` +
                `Transforme le désespoir en grands rêves ! ✨\n` +
                `Découvre l'univers inclusif d'Emmanuel Payet\n\n` +
                `🎨 emmanuelpayet.art\n` +
                `🖼️ emmanuel.gallery`;

            // Utiliser l'API Web Share si disponible
            if (navigator.share && navigator.canShare) {
                const shareData = {
                    title: 'PATRI-X - Mon Score',
                    text: shareText,
                    files: [new File([imageBlob], 'patrix-score.jpg', { type: 'image/jpeg' })]
                };

                if (navigator.canShare(shareData)) {
                    await navigator.share(shareData);
                    if (window.effects) {
                        window.effects.showSpiritualMessage(window.i18n.t('notifications.sharedSuccess'), 2000);
                    }
                    return;
                }
            }

            // Fallback : télécharger l'image et copier le texte
            this.downloadImage(imageBlob);
            await navigator.clipboard.writeText(shareText);
            
            if (window.effects) {
                window.effects.showSpiritualMessage(window.i18n.t('notifications.imageDownloaded'), 3000);
            }

        } catch (error) {
            console.error('[ProfileManager] Erreur partage:', error);
            if (window.effects) {
                window.effects.showSpiritualMessage(window.i18n.t('notifications.shareError'), 2000);
            }
        }
    }

    /**
     * Capture la grille de jeu en format carré JPG
     */
    async captureGameGrid() {
        return new Promise((resolve) => {
            // Créer un canvas carré
            const size = 1080;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // Fond blanc
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, size, size);

            // Bordure dorée
            ctx.strokeStyle = '#d4af37';
            ctx.lineWidth = 12;
            ctx.strokeRect(6, 6, size - 12, size - 12);

            // Titre PATRIX en haut
            ctx.fillStyle = '#333333';
            ctx.font = 'bold 96px Arial Black, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('PATRI-X', size / 2, 120);

            // Score en petit dessous
            if (window.game) {
                ctx.fillStyle = '#666666';
                ctx.font = '32px Arial, sans-serif';
                const scoreText = `Score: ${window.game.score.toLocaleString()} • Niveau ${window.game.level} • ${window.game.linesCleared} lignes`;
                ctx.fillText(scoreText, size / 2, 180);
            }

            // Icône PATRIX plus grande au centre
            this.drawPatrixIcon(ctx, size / 2, size / 2, 320);

            // Pseudo sous l'icône
            ctx.fillStyle = '#4fc3f7';
            ctx.font = 'bold 56px Arial, sans-serif';
            const username = this.userManager.getUsername();
            ctx.fillText(username, size / 2, size / 2 + 240);

            // Slogan
            ctx.fillStyle = '#666666';
            ctx.font = '36px Arial, sans-serif';
            ctx.fillText(window.i18n?.t('profile.slogan') || 'Transforme le désespoir en grands rêves', size / 2, size - 180);

            // Sites web en bas - GROS et LISIBLE
            ctx.fillStyle = '#4fc3f7';
            ctx.font = 'bold 48px Arial, sans-serif';
            ctx.fillText('emmanuelpayet.art', size / 2, size - 110);
            ctx.fillText('emmanuel.gallery', size / 2, size - 50);

            // Convertir en blob JPG
            canvas.toBlob(resolve, 'image/jpeg', 0.95);
        });
    }

    /**
     * Dessine l'icône PATRIX (croix rose)
     */
    drawPatrixIcon(ctx, centerX, centerY, totalSize) {
        const blockSize = totalSize / 3;
        
        // Dégradé rose
        const gradient = ctx.createLinearGradient(
            centerX - totalSize / 2, centerY - totalSize / 2,
            centerX + totalSize / 2, centerY + totalSize / 2
        );
        gradient.addColorStop(0, '#FFD1DC');
        gradient.addColorStop(0.25, '#FFC0CB');
        gradient.addColorStop(0.5, '#FFB6C1');
        gradient.addColorStop(0.75, '#FFC0CB');
        gradient.addColorStop(1, '#FFD1DC');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = blockSize / 10;

        const cornerRadius = blockSize / 8;
        
        // Positions des 5 blocs de la croix
        const positions = [
            [centerX - blockSize / 2, centerY - blockSize * 1.5],  // haut
            [centerX - blockSize * 1.5, centerY - blockSize / 2],  // gauche
            [centerX - blockSize / 2, centerY - blockSize / 2],    // centre
            [centerX + blockSize / 2, centerY - blockSize / 2],    // droite
            [centerX - blockSize / 2, centerY + blockSize / 2]     // bas
        ];

        positions.forEach(([x, y]) => {
            ctx.beginPath();
            this.roundRect(ctx, x, y, blockSize, blockSize, cornerRadius);
            ctx.fill();
            ctx.stroke();
        });
    }

    /**
     * Dessine un rectangle avec coins arrondis
     */
    roundRect(ctx, x, y, width, height, radius) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * Dessine l'icône PATRIX (croix rose)
     */
    drawPatrixIcon(ctx, centerX, centerY, totalSize) {
        const blockSize = totalSize / 3;
        
        // Dégradé rose
        const gradient = ctx.createLinearGradient(
            centerX - totalSize / 2, centerY - totalSize / 2,
            centerX + totalSize / 2, centerY + totalSize / 2
        );
        gradient.addColorStop(0, '#FFD1DC');
        gradient.addColorStop(0.25, '#FFC0CB');
        gradient.addColorStop(0.5, '#FFB6C1');
        gradient.addColorStop(0.75, '#FFC0CB');
        gradient.addColorStop(1, '#FFD1DC');
        
        ctx.fillStyle = gradient;
        ctx.strokeStyle = '#4a5568';
        ctx.lineWidth = blockSize / 10;

        const cornerRadius = blockSize / 8;
        
        // Positions des 5 blocs de la croix
        const positions = [
            [centerX - blockSize / 2, centerY - blockSize * 1.5],  // haut
            [centerX - blockSize * 1.5, centerY - blockSize / 2],  // gauche
            [centerX - blockSize / 2, centerY - blockSize / 2],    // centre
            [centerX + blockSize / 2, centerY - blockSize / 2],    // droite
            [centerX - blockSize / 2, centerY + blockSize / 2]     // bas
        ];

        positions.forEach(([x, y]) => {
            ctx.beginPath();
            this.roundRect(ctx, x, y, blockSize, blockSize, cornerRadius);
            ctx.fill();
            ctx.stroke();
        });
    }

    /**
     * Dessine un rectangle avec coins arrondis
     */
    roundRect(ctx, x, y, width, height, radius) {
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
    }

    /**
     * Télécharge l'image
     */
    downloadImage(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patrix-score-${Date.now()}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Ouvre le navigateur web pour la musique Audiomack
     */
    openMusic() {
        if (window.webBrowser) {
            // Toggle entre ouvert/minimisé
            window.webBrowser.toggle();
        } else {
            console.error('[ProfileManager] WebBrowserManager non disponible');
            // Fallback : ouvrir dans un nouvel onglet
            const audiomackUrl = 'https://audiomack.com/emmanuelpayet888/album/amour-amour';
            window.open(audiomackUrl, '_blank');
        }
    }
}

// Rendre disponible globalement
window.ProfileManager = ProfileManager;
