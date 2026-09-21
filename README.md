# RAWSFYNZ CLUB — Cérémonie V2

Version avec votes partagés Supabase et révélation des résultats pendant la cérémonie.

## Fonctionnement
- Les 8 participants votent normalement.
- La page Résultats n'affiche que la progression, jamais les scores.
- Quand les 8 ont terminé, l'organisateur clique sur MODE ORGANISATEUR.
- Code organisateur par défaut : `2026`.
- Chaque question est révélée une par une.
- Le ou les premiers de chaque question gagnent 1 titre.
- À la fin, le participant ayant le plus de titres est le grand gagnant.

## Important
Le code organisateur est une protection conviviale, pas une sécurité cryptographique : GitHub Pages est un site statique et son JavaScript est public. Pour un groupe d'amis, cela masque les résultats dans l'interface ; un utilisateur technique ayant accès à la base publique pourrait contourner l'interface.

Pour changer le code, modifier `RAWSFYNZ_ORGANIZER_PIN` dans `supabase-config.js`.

Pour remettre tous les votes à zéro dans Supabase SQL Editor :

    delete from public.votes;
