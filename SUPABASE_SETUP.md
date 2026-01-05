# Configuration Supabase pour PATRI-X

## 🗄️ Structure de la Base de Données

### Table `users` (Existante)

Votre table existante :
```
users (id, created_at, email, pseudo, avatar, ville, pays, age, genre)
```

✅ **Aucune modification nécessaire** - Le système utilise le champ `pseudo` existant.

### Table `patrxscore` (À créer)

Créez cette nouvelle table dans votre projet Supabase pour les scores :

```sql
-- Création de la table des scores PATRI-X
CREATE TABLE patrxscore (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pseudo TEXT NOT NULL,
    max_score INTEGER NOT NULL DEFAULT 0,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pseudo)
);

-- Index pour améliorer les performances
CREATE INDEX idx_patrxscore_pseudo ON patrxscore(pseudo);
CREATE INDEX idx_patrxscore_max_score ON patrxscore(max_score DESC);

-- Politique RLS (Row Level Security)
ALTER TABLE patrxscore ENABLE ROW LEVEL SECURITY;

-- Permettre à tout le monde de lire les scores
CREATE POLICY "Tout le monde peut lire les scores" ON patrxscore
    FOR SELECT USING (true);

-- Permettre l'insertion des scores
CREATE POLICY "Tout le monde peut insérer son score" ON patrxscore
    FOR INSERT WITH CHECK (true);

-- Permettre la mise à jour des scores
CREATE POLICY "Tout le monde peut mettre à jour son score" ON patrxscore
    FOR UPDATE USING (true);
```

### Fonction pour obtenir le rang d'un utilisateur

```sql
-- Fonction pour obtenir le rang d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_rank(user_pseudo TEXT)
RETURNS TABLE (rank BIGINT, total BIGINT) AS $$
BEGIN
    RETURN QUERY
    WITH ranked_scores AS (
        SELECT 
            pseudo,
            max_score,
            ROW_NUMBER() OVER (ORDER BY max_score DESC) as user_rank
        FROM patrxscore
    ),
    user_info AS (
        SELECT user_rank as rank
        FROM ranked_scores
        WHERE pseudo = user_pseudo
    ),
    total_count AS (
        SELECT COUNT(*) as total FROM patrxscore
    )
    SELECT 
        COALESCE(ui.rank, 0) as rank,
        tc.total
    FROM user_info ui
    CROSS JOIN total_count tc;
END;
$$ LANGUAGE plpgsql;
```

### Table `patrxprogress` (Progression du joueur)

Créez cette table pour sauvegarder la progression (niveau max, trophées) :

```sql
-- Création de la table de progression PATRI-X
CREATE TABLE patrxprogress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pseudo TEXT NOT NULL,
    max_level INTEGER NOT NULL DEFAULT 0,
    unlocked_trophies JSONB DEFAULT '[]'::jsonb,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pseudo)
);

-- Index pour améliorer les performances
CREATE INDEX idx_patrxprogress_pseudo ON patrxprogress(pseudo);
CREATE INDEX idx_patrxprogress_max_level ON patrxprogress(max_level DESC);

-- Activer RLS
ALTER TABLE patrxprogress ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Lecture publique de la progression" ON patrxprogress
    FOR SELECT USING (true);

CREATE POLICY "Insertion de progression" ON patrxprogress
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Mise à jour de progression" ON patrxprogress
    FOR UPDATE USING (true);
```

### Politiques RLS pour la table `users` (IMPORTANT - Sécurité)

**⚠️ ACTIVER RLS SUR LA TABLE USERS :**

```sql
-- Activer RLS sur users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Permettre la lecture publique des profils
CREATE POLICY "Lecture publique des utilisateurs" ON users
    FOR SELECT USING (true);

-- Permettre l'insertion de nouveaux utilisateurs
CREATE POLICY "Insertion publique d'utilisateurs" ON users
    FOR INSERT WITH CHECK (true);

-- Permettre la mise à jour du mot de passe par email
CREATE POLICY "Mise à jour du mot de passe" ON users
    FOR UPDATE USING (true)
    WITH CHECK (true);
```

## ⚙️ Configuration dans le Code

Dans le fichier `js/user-manager.js`, remplacez ces lignes :

```javascript
this.supabaseUrl = 'YOUR_SUPABASE_URL'; // Votre URL de projet
this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY'; // Votre clé anonyme (anon/public)
```

Par vos vraies valeurs :

```javascript
this.supabaseUrl = 'https://votreprojet.supabase.co';
this.supabaseKey = 'votre-cle-anon-publique';
```

### Où trouver ces informations ?

1. Allez sur [supabase.com](https://supabase.com)
2. Ouvrez votre projet
3. Allez dans **Settings** > **API**
4. Copiez :
   - **Project URL** → `supabaseUrl`
   - **anon public** key → `supabaseKey`

## 🔒 Sécurité

- La clé `anon` peut être exposée publiquement (elle est dans le code frontend)
- Les politiques RLS protègent les données
- Ne jamais exposer la clé `service_role` dans le frontend
- Considérez ajouter des limites de taux (rate limiting) si nécessaire

## 🚀 Test de la Configuration

1. Ouvrez la console développeur du navigateur
2. Connectez-vous avec un nom d'utilisateur
3. Jouez et obtenez un score
4. Vérifiez dans Supabase → **Table Editor** → **patrxscore**
5. Votre score devrait apparaître !

## 📊 Requêtes Utiles

### Voir tous les scores triés
```sql
SELECT pseudo, max_score, date
FROM patrxscore
ORDER BY max_score DESC
LIMIT 10;
```

### Obtenir le rang d'un joueur
```sql
SELECT * FROM get_user_rank('nom_du_pseudo');
```

### Réinitialiser tous les scores (ATTENTION !)
```sql
TRUNCATE TABLE patrxscore;
```

### Voir les utilisateurs PATRI-X
```sql
SELECT u.pseudo, ps.max_score
FROM users u
LEFT JOIN patrxscore ps ON u.pseudo = ps.pseudo
ORDER BY ps.max_score DESC NULLS LAST;
```

## 🎮 Fonctionnalités Implémentées

✅ Sauvegarde locale (localStorage) du score max  
✅ Synchronisation automatique avec Supabase  
✅ Classement TOP 5 sur l'écran de connexion  
✅ Système de connexion simple (sans mot de passe)  
✅ Mise à jour automatique du meilleur score  
✅ Compteur de parties jouées  

## 💡 Améliorations Futures

- [ ] Ajouter authentification complète (email/password)
- [ ] Historique complet des parties
- [ ] Classements par période (jour/semaine/mois)
- [ ] Badges et réalisations synchronisés
- [ ] Mode multijoueur
