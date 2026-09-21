# RAWSFYNZ CLUB V3

Version préparée pour la vraie cérémonie : sélection du pseudo, questionnaire complet, validation, et écran de résultats.

## État
La V3 fournie fonctionne immédiatement en local et stocke les votes dans le navigateur. Pour partager réellement les votes entre plusieurs téléphones, le fichier `supabase_schema.sql` prépare les tables nécessaires dans Supabase.

## Mise en ligne
Le dossier peut être publié gratuitement sur GitHub Pages, Cloudflare Pages ou Netlify. Pour les votes multi-appareils, il faut créer un projet Supabase puis connecter son URL et sa clé publique dans `app.js`.
