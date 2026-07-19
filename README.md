# FODMAP+ — Coach Low FODMAP Premium

Application web (PWA) mono-fichier pour suivre un régime pauvre en FODMAP en 3 phases (élimination, réintroduction, personnalisation), avec profil nutritionnel personnalisé, menus adaptés, budget courses par enseigne et suivi de poids.

Aucune dépendance de build : tout tourne dans `index.html` (HTML/CSS/JS vanilla). Aucune donnée n'est envoyée à un serveur — tout est calculé et stocké localement dans le navigateur (`localStorage`).

## Fonctionnalités

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
- **PWA installable** sur Android et sur le web (icône, écran plein, fonctionnement hors-ligne de l'app shell).

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

## Limites connues / avertissements

- **Prix** : moyennes estimées par catégorie et par enseigne, pas de scraping ni d'API de prix en temps réel (voir disclaimer en pied de page dans l'app).
- **Contenu médical** : les classifications FODMAP, grammages et valeurs nutritionnelles sont indicatives. L'app ne remplace pas l'avis d'un médecin ou d'un diététicien, en particulier pendant la phase de réintroduction.
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
