# RAWSFYNZ CLUB — V3 Votes secrets

1. Dans Supabase > SQL Editor, exécuter `SECRET_VOTES_MIGRATION.sql` une seule fois.
2. Sur GitHub, remplacer `app.js` par celui de cette archive (les autres fichiers peuvent aussi être envoyés tels quels).
3. Attendre le déploiement GitHub Pages puis faire Ctrl+F5.

Effet :
- plus de bouton « Changer de pseudo » ; le pseudo choisi est verrouillé dans le navigateur ;
- aucun navigateur public ne peut lire directement la table `votes` ;
- la page Résultats ne reçoit que les compteurs globaux ;
- le détail des votes n'est renvoyé qu'après saisie du code organisateur ;
- après validation, le votant ne revoit plus ses choix.

Note : sans véritable compte/authentification par personne, le pseudo reste une identification de confiance entre amis. La confidentialité des résultats est renforcée, mais ce n'est pas un système d'identité inviolable.
