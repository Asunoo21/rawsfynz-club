# RAWSFYNZ CLUB — votes partagés

Cette version est prévue pour le groupe sur PC. Les votes ne sont plus stockés uniquement dans le navigateur : ils sont enregistrés dans Supabase et les résultats se mettent à jour automatiquement.

## Installation

### 1. Créer la base Supabase
- Aller sur https://supabase.com et créer un projet gratuit.
- Ouvrir **SQL Editor**.
- Ouvrir `supabase_schema.sql`, copier tout son contenu et cliquer sur **Run**.

### 2. Récupérer les identifiants
Dans Supabase : **Project Settings → API**.
Copier :
- **Project URL**
- **Publishable/anon key** (clé publique)

Ne jamais utiliser la `service_role key` dans le site.

### 3. Connecter le site
Ouvrir `supabase-config.js` et remplacer :
- `https://TON-PROJET.supabase.co`
- `TA_CLE_ANON_ICI`

Puis remettre ces fichiers à la racine du dépôt GitHub Pages :
`index.html`, `app.js`, `style.css`, `supabase-config.js`, `supabase_schema.sql`, `assets/`.

### 4. Tester
- Ouvrir le site sur les 8 PC.
- Chaque personne choisit son pseudo.
- Répondre aux 39 questions.
- Cliquer sur **ENVOYER MES VOTES**.
- La page Résultats lit la même base pour tout le monde.

## Important
Le système est volontairement simple pour une cérémonie entre amis : le pseudo est choisi par l'utilisateur. Il n'y a pas de compte/mot de passe. Pour une sécurité stricte contre l'usurpation d'un pseudo, il faudrait ajouter une authentification.
