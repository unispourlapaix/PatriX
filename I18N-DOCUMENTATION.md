# Système d'Internationalisation PATRIX

## 📁 Fichiers créés

### 1. Fichiers de langues (JSON)
- `lang/fr.json` - Traductions françaises
- `lang/en.json` - Traductions anglaises

### 2. Fichiers JavaScript
- `js/i18n.js` - Gestionnaire de traductions principal
- `js/language-manager.js` - Gestionnaire du sélecteur de langue

### 3. Fichier CSS
- `css/language.css` - Styles pour le sélecteur de langue

## 🔧 Modifications apportées

### index.html
✅ Ajout du modal de sélection de langue au démarrage
✅ Ajout du bouton de changement de langue (coin supérieur droit)
✅ Intégration des scripts i18n et language-manager

### js/effects.js
✅ Messages de combo traduits (normal, super, mega, amazing, legendary, ultimate)
✅ Messages de lignes traduits (single, double, triple, patrix)
✅ Bonus de combo traduits

### js/ending-animation.js
✅ Messages de félicitations traduits (titre, messages)

### js/ui.js
✅ Messages pop traduits (normal, big, mega)

## 📝 Comment ça fonctionne

### 1. Première visite
- L'utilisateur voit un modal avec le choix FR/EN
- Le choix est sauvegardé dans localStorage
- Le jeu se charge dans la langue choisie

### 2. Visites suivantes
- La langue sauvegardée est chargée automatiquement
- Un bouton 🌐 (ou 🇫🇷/🇬🇧) apparaît en haut à droite
- Cliquer dessus rouvre le sélecteur

### 3. Structure des traductions

```javascript
// Utilisation dans le code
const text = window.i18n.t('combo.mega', { count: 5 });
// Résultat FR: "🔥 MEGA COMBO x5!"
// Résultat EN: "🔥 MEGA COMBO x5!"

const blocks = window.i18n.t('combo.blocks', { count: 12, emoji: '💎' });
// Résultat FR: "12 blocs 💎"
// Résultat EN: "12 blocks 💎"
```

### 4. Clés de traduction disponibles

#### Menus
- `menu.play`, `menu.login`, `menu.register`, `menu.logout`, `menu.playGuest`

#### Jeu
- `game.score`, `game.lines`, `game.level`, `game.combo`, `game.next`, `game.hold`
- `game.pause`, `game.gameOver`, `game.finalScore`

#### Combos
- `combo.normal` → `combo.ultimate` (6 niveaux)
- `combo.blocks` (avec paramètres)

#### Lignes
- `lines.single`, `lines.double`, `lines.triple`, `lines.patrix`
- `lines.comboBonus.small` → `lines.comboBonus.ultimate` (4 niveaux)

#### Pop
- `pop.normal`, `pop.big`, `pop.mega`

#### Animation de fin
- `endingAnimation.title`, `endingAnimation.message1`, `endingAnimation.message2`

#### Authentification
- `auth.loginTitle`, `auth.registerTitle`, `auth.emailPlaceholder`, etc.
- `auth.errors.fillAllFields`, `auth.errors.invalidEmail`, etc.

## 🌍 Ajouter une nouvelle langue

### 1. Créer le fichier JSON
Créer `lang/XX.json` (ex: `lang/es.json` pour l'espagnol)

### 2. Ajouter l'option dans le modal
Dans `index.html`, ajouter :
```html
<div class="language-option" data-lang="es">
    <div class="language-option-content">
        <span class="language-flag">🇪🇸</span>
        <div class="language-info">
            <span class="language-name">Español</span>
            <span class="language-native">Spanish</span>
        </div>
    </div>
    <span class="language-check">✓</span>
</div>
```

### 3. Mettre à jour language-manager.js
Ajouter le drapeau dans la méthode `showSwitcher()` :
```javascript
const flags = { fr: '🇫🇷', en: '🇬🇧', es: '🇪🇸' };
this.switcherBtn.textContent = flags[lang] || '🌐';
```

## 🔍 Fichiers à traduire ultérieurement

Les fichiers suivants contiennent encore du texte en dur :

### Priorité haute
- `js/auth-manager.js` - Messages d'authentification (alerts, erreurs)
- `js/web-browser.js` - Messages de confirmation cookies
- `js/user-manager.js` - Messages d'erreurs serveur

### Priorité moyenne
- `js/profile-manager.js` - Libellés du profil
- `js/audio.js` - Titres musique

### Priorité basse
- Commentaires code (optionnel)

## 🎯 Prochaines étapes

1. ✅ Système i18n fonctionnel
2. ✅ Traductions FR/EN pour les messages principaux
3. ⏳ Traduire les messages d'authentification
4. ⏳ Traduire les messages d'erreurs
5. ⏳ Traduire les confirmations navigateur
6. ⏳ Ajouter d'autres langues (ES, DE, etc.)

## 💡 Conseils d'utilisation

### Protection contre les erreurs
Le code vérifie toujours si `window.i18n` existe avant utilisation :
```javascript
const text = window.i18n ? window.i18n.t('key') : 'Fallback text';
```

### Mise à jour dynamique
Pour mettre à jour le DOM après changement de langue :
```javascript
window.i18n.addObserver((lang) => {
    // Votre code de mise à jour
});
```

### Attributs HTML
Pour les éléments statiques, utiliser les attributs data :
```html
<span data-i18n="game.score">SCORE</span>
<input data-i18n-placeholder="auth.emailPlaceholder">
<button data-i18n-title="game.pause">⏸</button>
```

## 🚀 Test

1. Ouvrir le jeu
2. Sélectionner une langue
3. Vérifier les messages de combo/lignes
4. Changer de langue via le bouton 🌐
5. Vérifier que les messages sont traduits

Tous les textes affichés pendant le gameplay sont maintenant traduits !
