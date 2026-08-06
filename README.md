# FODMAP+ — Coach Low FODMAP Premium

Application web (PWA) mono-fichier pour suivre un régime pauvre en FODMAP en 3 phases (élimination, réintroduction, personnalisation), avec profil nutritionnel personnalisé, menus adaptés, budget courses par enseigne et suivi de poids.

Aucune dépendance de build : tout tourne dans `index.html` (HTML/CSS/JS vanilla). Vos données restent chez vous — profil, menus, pesées, symptômes sont calculés et stockés localement dans le navigateur (`localStorage`), et ne partent jamais ailleurs.

Trois fonctions sortent du navigateur, toutes optionnelles et à votre initiative : la **synchronisation** (vers *votre* gist GitHub privé), le **scanner de produits** (le code-barres est envoyé à Open Food Facts pour récupérer la fiche — rien d'autre, aucune donnée personnelle) et la **dictée vocale** (la transcription est faite par le navigateur ; l'analyse du contenu, elle, est locale).

## Fonctionnalités

- **Dictée vocale du repas** : vous dictez ce que vous avez mangé (« ce midi 150 g de poulet, du riz basmati et des courgettes ») et l'app en fait le repas du moment — reconnaissance vocale native en français, détection des aliments (avec synonymes parlés : « blanc de poulet », « spaghettis », « fromage râpé »…), des quantités (« 150 g », « deux œufs », « une cuillère à soupe », « un bol », « deux cents grammes »), du créneau (« ce midi », « hier soir ») et du jour. Écran de relecture avec grammages corrigeables, verdict FODMAP (seuils dépassés, stacking de familles), bouton **Rendre 100% safe** (remplacement des aliments à éviter) et bouton **Compléter le repas** (l'app ajoute ce qu'il manque pour atteindre l'objectif calorique du créneau). Repli clavier si le navigateur ne sait pas transcrire.
- **Scanner de produits** : scannez le code-barres d'un produit emballé et obtenez en un coup d'œil un verdict de conformité — 🚫 à éviter, 🟠 à vérifier, ✅ rien de repéré — calculé à partir de la **liste d'ingrédients** publiée par [Open Food Facts](https://fr.openfoodfacts.org). Détecte l'oignon et l'ail sous leurs formes déguisées (poudre, arômes, bouillon), l'inuline et les FOS des produits « riches en fibres », les polyols du sans-sucre (E420, E421, E965, E967…), le blé épaississant, le lactose. Les termes en cause sont surlignés dans la liste, et le produit s'ajoute au repas du jour avec ses kcal et protéines réelles. Repli par saisie du code ou recherche par nom quand le navigateur ne sait pas lire un code-barres (iPhone, Firefox).
- **131 aliments classés FODMAP** (safe / modéré / à éviter) avec calories, protéines, grammage de référence et prix moyen.
- **Profil nutritionnel** (formule de Mifflin-St Jeor) : BMR, TDEE, objectif calorique et protéique selon poids/taille/âge/sexe/activité/objectif.
- **Menus adaptatifs** : grammages recalculés automatiquement selon l'objectif calorique (70–160 % de la recette de base), ingrédients modifiables (ajout/suppression/grammage), recettes personnalisées réinitialisables.
- **3 templates de menu qui tournent par semaine** (pas de répétition d'une semaine à l'autre), avec sauvegarde des personnalisations par semaine.
- **Programme sur plusieurs semaines** : durée d'élimination réglable (2–6 semaines), 6 semaines de réintroduction générées automatiquement (une famille FODMAP testée par semaine, dose test lundi/mardi), puis phase de personnalisation.
- **Recettes générées automatiquement** à partir des ingrédients réels de chaque plat (méthode de cuisson détectée, étapes, temps de préparation).
- **Budget courses par enseigne** (Carrefour, Lidl, Aldi, Picard) calibré sur une étude UFC-Que Choisir 2025 — prix moyens estimés, pas de tarif en temps réel.
- **Liste de courses** avec case « déjà en stock » et remplacement de repas en un clic.
- **Filtres alimentaires** : végétarien, végan, sans porc, sans poisson, sans fruits à coque, exclusions personnalisées.
- **Quiz d'onboarding** (équipements de cuisine, temps de préparation, aliments détestés, budget, dîners, magasin, régime, vibe) au premier lancement, modifiable à tout moment depuis l'onglet Profil.
- **Suivi de poids** avec graphique et historique.
- **PWA installable** sur Android, iOS et desktop : mode `standalone` (plein écran, sans barre d'adresse), fonctionnement hors-ligne de l'app shell, raccourcis d'icône (appui long → « Dicter mon repas », « Menu », « Coach ») et écran **Profil → Installer l'application** qui affiche l'état réel (mode d'affichage, HTTPS, service worker, dictée) et la marche à suivre selon la plateforme.

## Lancer le projet

Aucune installation nécessaire. Deux options :

```bash
# Option 1 : ouvrir directement le fichier
open index.html          # macOS
xdg-open index.html      # Linux
start index.html         # Windows

# Option 2 : servir en local (recommandé pour tester la PWA / le service worker,
# qui exigent http:// ou https:// et ne fonctionnent pas depuis file://)
python3 -m http.server 8080
# puis ouvrir http://localhost:8080
```

## Déploiement (GitHub Pages)

```bash
git init
git add .
git commit -m "FODMAP+ v1"
git branch -M main
git remote add origin https://github.com/<votre-utilisateur>/fodmap-plus.git
git push -u origin main
```

Puis dans les réglages du repo GitHub : **Settings → Pages → Source : branche `main`, dossier `/root`**. L'app sera servie en HTTPS (nécessaire pour l'installation PWA) à l'adresse `https://<votre-utilisateur>.github.io/fodmap-plus/`.

## Installer l'app (et pourquoi elle s'ouvrait dans le navigateur)

Une icône ajoutée à l'écran d'accueil peut être deux choses très différentes : un **raccourci web**, qui rouvre le navigateur avec sa barre d'adresse, ou une **application installée** (WebAPK sur Android, app web sur iOS), qui s'ouvre en plein écran. C'est le second qu'il faut.

- **Android / Chrome** : menu ⋮ → *Ajouter à l'écran d'accueil* → **Installer**. Si Chrome ne propose que « Créer un raccourci », c'est que la page n'a pas été ouverte dans Chrome lui-même (navigateur intégré à Facebook, Instagram, Gmail…) : ouvrez l'adresse directement dans Chrome.
- **iPhone / Safari** : bouton *Partager* ⬆️ → **Sur l'écran d'accueil** → *Ajouter*. Chrome iOS ne sait pas installer d'app web.
- **Desktop Chrome / Edge** : icône d'installation à droite de la barre d'adresse, ou menu ⋮ → *Installer FODMAP+*.

L'app détecte elle-même son mode de lancement : **Profil → Installer l'application** indique si elle tourne en mode application ou dans un onglet, propose l'installation en un clic quand le navigateur l'autorise, et donne les étapes exactes sinon. Une bannière discrète le rappelle au premier lancement (masquable définitivement).

Prérequis techniques (déjà remplis par GitHub Pages) : servir l'app en **HTTPS** — en `file://` ou en `http://`, le navigateur refuse l'installation, le service worker et la dictée vocale.

## Limites connues / avertissements

- **Prix** : moyennes estimées par catégorie et par enseigne, pas de scraping ni d'API de prix en temps réel (voir disclaimer en pied de page dans l'app).
- **Contenu médical** : les classifications FODMAP, grammages et valeurs nutritionnelles sont indicatives. L'app ne remplace pas l'avis d'un médecin ou d'un diététicien, en particulier pendant la phase de réintroduction.
- **Scanner** : le verdict repose sur la **liste d'ingrédients**, pas sur les quantités — alors que les seuils Monash, eux, dépendent de la dose. Un produit contenant 0,1 % d'oignon peut très bien passer : la liste complète est donc toujours affichée, c'est vous qui tranchez. La couverture d'Open Food Facts est excellente en France mais pas exhaustive, et les fiches sont collaboratives : une liste d'ingrédients peut être absente, incomplète ou datée. Un produit sans liste affiche « impossible de se prononcer », jamais un feu vert.
- **Dictée vocale** : la transcription est assurée par le navigateur (Web Speech API). Elle fonctionne sur Chrome/Edge (Android et desktop) et Safari (iOS 14.5+), exige HTTPS et l'autorisation du micro, et passe par les serveurs du navigateur — pas par FODMAP+. Firefox ne l'implémente pas : la saisie clavier prend le relais, avec la même analyse. L'analyse (aliments, quantités, FODMAP) est 100% locale.
- **Stockage** : toutes les données (profil, poids, préférences, personnalisations de menu) sont stockées uniquement dans le `localStorage` du navigateur utilisé — pas de synchronisation multi-appareils.

## Structure

```
index.html                 App complète (HTML + CSS + JS)
manifest.json               Manifeste PWA (nom, icônes, couleurs, mode standalone)
sw.js                        Service worker (cache l'app shell pour l'usage hors-ligne)
icons/icon-192.png           Icône PWA 192×192
icons/icon-512.png           Icône PWA 512×512
icons/icon-maskable-512.png  Icône adaptative Android (maskable)
```
