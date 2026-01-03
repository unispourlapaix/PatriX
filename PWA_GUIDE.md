# PATRI-X - Guide d'Installation PWA

## 🚀 Web App Progressive (PWA)

PATRI-X est maintenant une Progressive Web App complète et peut être installée sur tous les appareils.

## ✨ Fonctionnalités PWA

- ✅ **Installation sur appareil** - Ajouter à l'écran d'accueil (iOS/Android/Desktop)
- ✅ **Mode hors ligne** - Fonctionne sans connexion Internet
- ✅ **Cache intelligent** - Chargement ultra-rapide
- ✅ **Multi-jeux compatible** - ID unique `patrix` pour éviter les conflits
- ✅ **Compatible Firefox** - Fallbacks -webkit- pour backdrop-filter
- ✅ **Optimisé mobile** - Responsive avec user-scalable=no

## 📱 Installation

### Sur Android (Chrome/Firefox)
1. Ouvrez PATRI-X dans Chrome ou Firefox
2. Appuyez sur le menu (⋮)
3. Sélectionnez "Ajouter à l'écran d'accueil"
4. Confirmez l'installation

### Sur iOS (Safari)
1. Ouvrez PATRI-X dans Safari
2. Appuyez sur le bouton Partager (□↑)
3. Faites défiler et sélectionnez "Sur l'écran d'accueil"
4. Confirmez l'ajout

### Sur Desktop (Chrome/Edge/Firefox)
1. Ouvrez PATRI-X dans votre navigateur
2. Cliquez sur l'icône d'installation dans la barre d'adresse
3. Ou Menu → Installer PATRI-X
4. Confirmez l'installation

## 🔧 Architecture Technique

### Fichiers PWA
- **manifest.json** - Configuration de l'application
- **sw.js** - Service Worker pour cache et mode hors ligne
- **index.html** - Meta tags PWA et enregistrement du Service Worker

### Gestion des Données
Toutes les données utilisent un préfixe unique `patrix_` pour éviter les conflits :

```javascript
// localStorage keys
patrix_user         // Données utilisateur
patrix_max_score    // Score maximum
patrix_trophies     // Trophées débloqués
```

### Cache Strategy
- **Cache First** avec fallback réseau
- Mise en cache automatique de toutes les ressources
- Cache dynamique pour nouvelles requêtes
- Nettoyage automatique des anciens caches

## 🎨 Icônes Requises

Créez ces icônes dans `assets/images/` :
- **icon-192.png** - 192x192 pixels
- **icon-512.png** - 512x512 pixels

Design recommandé :
- Fond coloré (pas transparent)
- Logo PATRI-X centré
- Marges de sécurité (10% de padding)

## 🔒 Compatibilité Multi-Jeux

Si votre domaine héberge plusieurs jeux, PATRI-X utilise :

```javascript
const GAME_ID = 'patrix'; // ID unique
```

Ceci garantit :
- Aucun conflit de cache entre jeux
- Isolation des données localStorage
- Service Worker isolé par scope

## 🌐 Compatibilité Navigateurs

### Testé et Optimisé pour :
- ✅ Chrome/Chromium (Desktop & Mobile)
- ✅ Firefox (Desktop & Mobile)
- ✅ Safari (iOS & macOS)
- ✅ Edge (Desktop & Mobile)
- ✅ Opera (Desktop & Mobile)

### Fallbacks CSS :
```css
-webkit-backdrop-filter: blur(10px); /* Safari, Chrome ancien */
backdrop-filter: blur(10px);         /* Standard moderne */
```

## 📊 Mise à Jour du Cache

Pour forcer une mise à jour après modifications :

1. Changez la version dans `sw.js` :
```javascript
const CACHE_NAME = 'patrix-v1.0.1'; // Incrémenter la version
```

2. Les utilisateurs recevront automatiquement la mise à jour au prochain chargement

## 🐛 Débogage

### Chrome DevTools
1. F12 → Application → Service Workers
2. Vérifier l'état (activé/désactivé)
3. "Update on reload" pour forcer les mises à jour en dev

### Firefox DevTools
1. F12 → Application → Service Workers
2. Vérifier l'enregistrement
3. Console pour les logs `[PATRI-X]`

## 🔄 Désinstallation

### Cache et Service Worker
```javascript
// Console navigateur
navigator.serviceWorker.getRegistrations()
  .then(regs => regs.forEach(reg => reg.unregister()));
caches.keys()
  .then(names => names.forEach(name => caches.delete(name)));
```

### Données locales
```javascript
// Console navigateur
localStorage.removeItem('patrix_user');
localStorage.removeItem('patrix_max_score');
localStorage.removeItem('patrix_trophies');
```

## 🚀 Déploiement

### Serveur Local
Le Service Worker nécessite HTTPS en production, mais fonctionne sur localhost.

### Production
1. Hébergez sur un serveur HTTPS
2. Les PWA nécessitent une connexion sécurisée
3. Vérifiez que manifest.json et sw.js sont accessibles

### CORS (si API externe)
Supabase est déjà configuré pour CORS, rien à faire !

## 📝 Notes Importantes

- **HTTPS obligatoire** en production (pas en dev local)
- **Icônes** doivent être créées pour une installation complète
- **Cache** persiste après fermeture du navigateur
- **localStorage** limité à ~5-10MB selon navigateur
- **Service Worker** fonctionne en arrière-plan

## 🎮 Prêt à Jouer !

L'application est maintenant optimisée pour :
- Installation sur tous les appareils
- Fonctionnement hors ligne
- Performance maximale
- Compatibilité multi-navigateurs
- Isolation multi-jeux

Profitez de PATRI-X partout, tout le temps ! 🌟
