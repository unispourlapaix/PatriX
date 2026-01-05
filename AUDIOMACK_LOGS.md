# 🎵 Logs Audiomack - Guide d'utilisation

## Vue d'ensemble

Les logs de l'iframe Audiomack sont maintenant **isolés** pour éviter de polluer la console du jeu principal.

## Caractéristiques

### ✨ Préfixe distinctif
Tous les logs sont préfixés avec `🎵 [AUDIOMACK]` pour être facilement identifiables:
```
🎵 [AUDIOMACK] Ouverture: https://audiomack.com/...
🎵 [AUDIOMACK] Minimisé - Musique continue
🎵 [AUDIOMACK] Fermé
```

### 🔇 Désactivés par défaut
Les logs (info et warning) sont **désactivés par défaut** pour ne pas encombrer la console.

### 🚨 Erreurs toujours visibles
Les **erreurs critiques** restent toujours affichées pour faciliter le débogage:
```
🎵 [AUDIOMACK] Surcharge détectée: Mémoire saturée
🎵 [AUDIOMACK] URL invalide: ...
```

## Comment activer les logs

### Méthode 1: Dans la console du navigateur
```javascript
// Activer tous les logs Audiomack
window.webBrowser.enableLogging = true;

// Désactiver les logs
window.webBrowser.enableLogging = false;
```

### Méthode 2: Dans le code (web-browser.js)
```javascript
constructor() {
    // ...
    this.enableLogging = true; // Passer à true pour déboguer
    this.logPrefix = '🎵 [AUDIOMACK]';
    // ...
}
```

## Filtrer les logs dans la console

### Chrome/Edge DevTools
1. Ouvrir la console (F12)
2. Utiliser le filtre en haut: `🎵` ou `AUDIOMACK`
3. Les logs de l'iframe seront isolés

### Firefox DevTools
1. Ouvrir la console (F12)
2. Dans le champ de recherche: `AUDIOMACK`

## Types de logs disponibles

| Méthode | Comportement | Quand affiché |
|---------|--------------|---------------|
| `this.log()` | Info normale | Si `enableLogging = true` |
| `this.warn()` | Avertissement | Si `enableLogging = true` |
| `this.error()` | Erreur critique | **TOUJOURS** |

## Exemples de messages

### Logs d'information (désactivés par défaut)
```
🎵 [AUDIOMACK] Ouverture: https://audiomack.com/emmanuelpayet/playlist/amour-de-jesus
🎵 [AUDIOMACK] Minimisé - Musique continue
🎵 [AUDIOMACK] Restauré
🎵 [AUDIOMACK] Fermé
🎵 [AUDIOMACK] Lecteur réactivé
```

### Avertissements (désactivés par défaut)
```
🎵 [AUDIOMACK] Lecteur désactivé pour sécurité
🎵 [AUDIOMACK] Mémoire critique: 92.3%
🎵 [AUDIOMACK] Iframe non responsive
```

### Erreurs (toujours affichées)
```
🎵 [AUDIOMACK] Surcharge détectée: Trop de tentatives de chargement
🎵 [AUDIOMACK] Erreur iframe (3/3)
🎵 [AUDIOMACK] URL invalide: javascript:alert(1)
```

## Avantages

✅ **Console propre**: Les logs du jeu principal ne sont plus noyés
✅ **Filtrage facile**: Recherche par emoji 🎵 ou mot-clé AUDIOMACK
✅ **Contrôle total**: Activation/désactivation à la volée
✅ **Sécurité**: Les erreurs critiques restent visibles
✅ **Performance**: Moins de logs = console plus rapide

## Debug en production

Pour activer temporairement les logs sans modifier le code:

```javascript
// Dans la console du navigateur
window.webBrowser.enableLogging = true;

// Recharger Audiomack pour voir les logs
window.webBrowser.openAudiomack();

// Désactiver après debug
window.webBrowser.enableLogging = false;
```

## Architecture du logging

```javascript
class WebBrowserManager {
    constructor() {
        this.enableLogging = false;     // ⚡ Flag de contrôle
        this.logPrefix = '🎵 [AUDIOMACK]'; // 🏷️ Préfixe distinctif
    }
    
    log(...args) {
        if (this.enableLogging) {
            console.log(this.logPrefix, ...args); // 📝 Info
        }
    }
    
    warn(...args) {
        if (this.enableLogging) {
            console.warn(this.logPrefix, ...args); // ⚠️ Warning
        }
    }
    
    error(...args) {
        console.error(this.logPrefix, ...args); // 🚨 Toujours affiché
    }
}
```

## Cas d'usage

### 1. Debug d'un problème de chargement
```javascript
window.webBrowser.enableLogging = true;
window.webBrowser.openAudiomack();
// Observer les logs dans la console
```

### 2. Monitoring de la mémoire
```javascript
window.webBrowser.enableLogging = true;
// Jouer pendant 10 minutes
// Observer les warnings de mémoire
```

### 3. Production (par défaut)
```javascript
// enableLogging = false par défaut
// Seules les erreurs critiques apparaissent
```

---

**Note**: Cette isolation des logs fait partie de la version 1.2 d'optimisation des performances.
