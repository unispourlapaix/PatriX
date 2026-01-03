# BRIEF COMPLET POUR CLAUDE CODE - PATRIX

## 🎯 PROJET
**Nom** : PATRIX (Patrice + X/Cross)
**Message** : "Abandonne la tristesse, revêts-toi de force et courage - Transforme le désespoir en grands rêves"
**Auteur** : Emmanuel Payet
**Type** : Jeu de puzzle spirituel (blocs tombants)

## ✅ ÉTAT ACTUEL
Le projet PATRIX v2.0 est **100% TERMINÉ** et fonctionnel avec :
- ✅ Structure modulaire complète (8 modules JavaScript)
- ✅ Design lumineux et positif (3 fichiers CSS)
- ✅ Système de jeu complet avec transformation ombre → lumière
- ✅ Messages spirituels progressifs
- ✅ Contrôles clavier + tactile + souris
- ✅ Effets visuels (particules, animations)
- ✅ Interface utilisateur complète
- ✅ Formes personnalisées 5-6 blocs (100% légal)

## 📁 STRUCTURE DU PROJET

```
patrix-v2/
├── index.html              # Page principale
├── README.md              # Documentation complète
├── .gitignore             # Configuration Git
├── css/
│   ├── main.css          # Styles principaux + thème lumineux
│   ├── game.css          # Grille et cellules
│   └── animations.css    # Effets et animations
├── js/
│   ├── config.js         # ID: E-manuel-config
│   ├── blocks.js         # ID: E-manuel-blocks
│   ├── grid.js           # ID: E-manuel-grid
│   ├── game-engine.js    # ID: E-manuel-engine
│   ├── controls.js       # ID: E-manuel-controls
│   ├── effects.js        # ID: E-manuel-effects
│   ├── ui.js             # ID: E-manuel-ui
│   └── main.js           # ID: E-manuel-main
└── assets/               # (vide pour l'instant)
    ├── images/
    ├── sounds/
    └── data/
```

## 🔧 MODULES JAVASCRIPT (avec ID E-manuel)

### 1. config.js (E-manuel-config)
**Contenu** : Configuration globale
- Paramètres de grille (10x20)
- Vitesses et timing
- Couleurs (ombre et lumière)
- Messages spirituels par niveau
- Messages de combo
- Scoring

### 2. blocks.js (E-manuel-blocks)
**Contenu** : Formes personnalisées
- 6 formes de 5-6 blocs (LÉGAL)
- Croix, Cœur, Étoile, Ancre, L-Lumière, T-Croix
- Fonctions de rotation et miroir

### 3. grid.js (E-manuel-grid)
**Contenu** : Gestion de la grille
- Classe GameGrid
- Validation des mouvements
- Placement des pièces
- Détection et effacement des lignes
- Transformation ombre → lumière
- Rendu dans le DOM

### 4. game-engine.js (E-manuel-engine)
**Contenu** : Moteur principal
- Classe GameEngine
- Logique de jeu complète
- Gestion du score et niveaux
- Système de combo
- Événements (spawn, move, rotate, etc.)
- Game Over et Reset

### 5. controls.js (E-manuel-controls)
**Contenu** : Gestion des contrôles
- Classe Controls
- Clavier (flèches, espace, R, P)
- Tactile (tap, double tap, swipe)
- Souris (clic, drag)

### 6. effects.js (E-manuel-effects)
**Contenu** : Effets visuels
- Classe VisualEffects
- Explosions de particules
- Particules de lumière montantes
- Transformation animée
- Flash d'écran
- Messages spirituels animés

### 7. ui.js (E-manuel-ui)
**Contenu** : Interface utilisateur
- Classe UserInterface
- Mise à jour score/lignes/niveau/combo
- Affichage pièce suivante
- Messages spirituels
- Panneaux Game Over et Pause

### 8. main.js (E-manuel-main)
**Contenu** : Assemblage et initialisation
- Initialisation du jeu
- Boucle de jeu (requestAnimationFrame)
- Liaison des modules

## 🎨 FICHIERS CSS

### 1. main.css
- Thème lumineux (dégradé nuit → aube)
- Étoiles scintillantes
- Titre doré animé
- Messages spirituels
- Panneaux (combo, info)

### 2. game.css
- Grille de jeu
- Cellules (vides et remplies)
- Couleurs des blocs (ombre et lumière)
- Effets de transformation
- Responsive mobile

### 3. animations.css
- Particules
- Explosions
- Flash d'écran
- Apparition des messages
- Game Over et Pause panels
- Boutons

## 🚀 DÉPLOIEMENT SUR GITHUB PAGES

### Étape 1 : Copier dans le dossier GitHub local
```bash
# Depuis Windows
xcopy /E /I "chemin\vers\patrix-v2" "C:\Users\dream\Documents\GitHub\patrice-x"
```

### Étape 2 : Initialiser Git (si pas déjà fait)
```bash
cd C:\Users\dream\Documents\GitHub\patrice-x
git init
git add .
git commit -m "PATRIX v2.0 - Jeu complet avec modules spirituels"
```

### Étape 3 : Créer le repo sur GitHub.com
- Nom : `patrice-x` (ou `patrix`)
- Public
- Ne pas cocher "Initialize with README"

### Étape 4 : Pousser le code
```bash
git remote add origin https://github.com/TON-USERNAME/patrice-x.git
git branch -M main
git push -u origin main
```

### Étape 5 : Activer GitHub Pages
- Aller sur le repo GitHub
- Settings → Pages
- Source : "main" branch
- Folder : "/" (root)
- Save

**Ton jeu sera live à** : `https://ton-username.github.io/patrice-x/`

## 💡 AMÉLIORATIONS FUTURES POSSIBLES

### Phase 2 (optionnel)
1. **Sons** : Ajouter des effets sonores doux
2. **Musique** : Gospel moderne en fond
3. **Niveaux thématiques** : Différents arrière-plans par niveau
4. **Succès** : Débloquer des citations inspirantes
5. **Partage** : Bouton pour partager son score
6. **Multilingue** : Français + Anglais
7. **Mode histoire** : Progression narrative

### Fichiers à ajouter (si Phase 2)
```
assets/
├── sounds/
│   ├── move.mp3
│   ├── rotate.mp3
│   ├── line-clear.mp3
│   ├── level-up.mp3
│   └── combo.mp3
├── images/
│   ├── logo.png
│   └── og-image.png (pour partage)
└── data/
    └── messages-extended.json
```

## ⚠️ IMPORTANT - LÉGALITÉ

### ✅ PATRIX est 100% LÉGAL car :
1. Formes de **5-6 blocs** (pas les 4-blocs Tetrominos)
2. Nom différent (PATRIX ≠ Tetris)
3. Mécaniques additionnelles (transformation, messages)
4. Thème unique (spirituel)
5. Design original (lumineux/doré)

### ❌ Ne JAMAIS :
- Utiliser le mot "Tetris"
- Copier les 7 formes exactes (I, O, T, S, Z, J, L)
- Utiliser la musique Korobeiniki
- Reproduire le terme "Tetromino"

## 📝 RÉSUMÉ POUR CLAUDE CODE

**Si tu veux utiliser Claude Code pour modifier le projet :**

```bash
# Exemple de commandes
claude-code "Ajoute un effet sonore lors de la rotation dans controls.js (E-manuel-controls)"
claude-code "Modifie la vitesse initiale à 800ms dans config.js (E-manuel-config)"
claude-code "Ajoute une nouvelle forme en diamant 6 blocs dans blocks.js (E-manuel-blocks)"
```

**Chaque module a son ID (E-manuel-XXX)** pour que Claude Code sache quoi modifier.

## ✅ CHECKLIST FINALE

- [✅] Structure complète créée
- [✅] 8 modules JavaScript fonctionnels
- [✅] 3 fichiers CSS avec design lumineux
- [✅] index.html complet
- [✅] README documenté
- [✅] .gitignore configuré
- [✅] Thème spirituel intégré
- [✅] Messages encourageants
- [✅] Contrôles multi-plateformes
- [✅] Effets visuels (particules, lumière)
- [✅] 100% légal (formes 5-6 blocs)

## 🎉 LE PROJET EST PRÊT !

Tu peux maintenant :
1. Télécharger le dossier `patrix-v2`
2. Ouvrir `index.html` pour tester localement
3. Pousser sur GitHub
4. Activer GitHub Pages
5. Partager ton jeu au monde ! ✝️

---

**Créé avec ❤️ par Dreamer Unisona pour Emmanuel Payet**
**Message** : "Abandonne la tristesse, revêts-toi de force et courage - Transforme le désespoir en grands rêves"
