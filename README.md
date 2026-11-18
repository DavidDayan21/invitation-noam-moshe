# Invitation Bar Mitzvah

Invitation en ligne au style classique (crème et doré) : une enveloppe animée, les événements et un formulaire de réponse relié à Google Sheets.

## Fichiers
- `index.html` : toute l'invitation.
- `google-apps-script/Code.gs` : le script à coller dans Google Sheets pour recevoir les réponses.

## 1. Personnaliser l'invitation
Dans `index.html`, remplacer tout ce qui est entre crochets :
`[PRÉNOM]`, `[I]` (initiale), `[NOMS DES PARENTS ET DE LA FAMILLE]`, `[MOIS ANNÉE]`, `[JOUR DATE]`, `[HEURE]`, `[NOM DU LIEU]`, `[ADRESSE]`, `[DATE LIMITE]`, `[ANNÉE]`, `[NOM DU LIEU DE RÉCEPTION]`, `[ADRESSE+RÉCEPTION]` (l'adresse avec des `+` à la place des espaces).

## 2. Relier à Google Sheets (environ 10 minutes, sur le compte Google de la famille)
1. Créer un nouveau Google Sheet (sheets.new).
2. Ouvrir le menu **Extensions → Apps Script**.
3. Effacer le code présent, coller le contenu de `google-apps-script/Code.gs`, puis enregistrer.
4. Cliquer sur **Déployer → Nouveau déploiement** → icône ⚙️ → **Application Web**.
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**
5. Cliquer sur **Déployer**, puis autoriser l'accès. Si Google affiche « Application non validée » : **Paramètres avancés → Accéder au projet**.
6. Copier l'**URL de l'application Web** (elle se termine par `/exec`).
7. Dans `index.html`, remplacer `COLLER_ICI_URL_DU_SCRIPT_GOOGLE` par cette URL.

Les réponses apparaissent ensuite dans l'onglet **Réponses**.

Total de personnes par événement : `=SUMIFS(D:D; F:F; "Oui")` pour l'Alya, `=SUMIFS(D:D; G:G; "Oui")` pour la Seouda.

## 3. Deux liens d'invitation
- **Lien normal** (matin uniquement) : l'adresse du site telle quelle. Le Sheet indique « Non invité » pour la Seouda.
- **Lien soirée** (les 80 invités de la Bar Mitzvah Party) : ajouter `?soiree=oui` à la fin de l'adresse.

## Colonnes du Sheet (onglet Réponses)
Date · Nom · Prénom · Invités · Présence · Alya · Seouda · Message

## Musique
1. Mettre le fichier MP3 dans le dossier `audio/` (idéalement moins de 5 Mo).
2. Dans `index.html`, renseigner `MUSIQUE_FICHIER = 'audio/nom-du-fichier.mp3'`.
3. Optionnel : `MUSIQUE_DEBUT` (seconde de départ) et `MUSIQUE_VOLUME` (0 à 1).

La musique démarre à l'ouverture de l'enveloppe, avec une montée progressive du volume, et le bouton rond en bas à droite permet de la couper ou de la remettre. Tant que `MUSIQUE_FICHIER` est vide, le bouton s'affiche mais aucune musique ne joue.
