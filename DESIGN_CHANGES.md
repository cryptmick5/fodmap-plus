# FODMAP+ — refonte design

**Le design est appliqué à `index.html`.** `manifest.json` et les données n'ont pas
été touchés ; `sw.js` l'a été, mais uniquement pour les polices hors ligne (voir
plus bas), à votre demande explicite.

`preview.html` a été supprimé : il avait servi au cycle de validation et était
devenu un doublon octet pour octet d'`index.html`. Son contenu reste dans
l'historique git (commits `4bb7b9e` à `e951aa1`).

Pour tester : ouvrez `index.html` dans le navigateur, ou servez le dossier
(`npx http-server -p 8080`) et allez sur `http://localhost:8080/`.

---

## Ce qui a été vérifié

Rendu réel dans Chromium (Playwright) sur 4 combinaisons viewport × thème
(390×844 et 1440×950, jour et nuit), en naviguant dans les 5 onglets et en
ouvrant une modale de repas.

- **Aucune erreur JS** (`pageerror`) sur aucun écran.
- Les 310 fonctions, 89 handlers `onclick`, 9 sélecteurs `querySelector` et
  16 clés `localStorage` sont **identiques** à l'`index.html` d'avant la refonte
  (comparaison contre le commit `4bb7b9e~1`).
- Deux IDs seulement ont changé — `themeIcSide` et `animIcSide` deviennent
  `themeUseSide` / `animUseSide` — parce qu'ils désignaient un `<span>` dont le JS
  écrivait le `textContent` (un emoji) et qu'ils pointent maintenant sur le `<use>`
  d'un SVG. Les deux fonctions concernées (`applyTheme`, `applyAnims`) ont été
  mises à jour en conséquence.

---

## Mise en ligne : pas de bump du cache nécessaire

`sw.js` sert le HTML en **réseau d'abord** (`fetch(request, {cache:'no-store'})`,
repli sur le cache hors ligne). Le nouvel `index.html` arrive donc dès la
prochaine visite en ligne, sans toucher à `CACHE_NAME` — qui reste à `v25`.

---

## Polices hors ligne (`sw.js`)

Playfair Display et Inter viennent de Google Fonts, une origine externe que le
service worker laissait passer sans y toucher : hors ligne, l'app retombait sur
les polices système. Ça pesait peu tant que la typo était discrète ; depuis que
le serif display porte l'identité, ça se voit.

Ajouté — 32 lignes, aucune autre stratégie modifiée :

- `FONT_CACHE = 'fodmap-plus-fonts-v1'`, **cache séparé** de l'app shell : les
  polices ne changent jamais, autant qu'elles survivent aux montées de version.
  L'`activate` l'épargne explicitement (`k !== CACHE_NAME && k !== FONT_CACHE`).
- Branche **cache d'abord** dans le `fetch`, limitée à `fonts.googleapis.com` et
  `fonts.gstatic.com`, placée **avant** le retour anticipé sur les origines
  externes — Open Food Facts continue de passer sans interception.
- La feuille CSS est demandée en `no-cors` par le `<link>`, donc sa réponse est
  **opaque** (`status 0`, `ok === false`). Un simple test `response.ok` n'aurait
  rien mis en cache : la condition accepte explicitement `response.type === 'opaque'`.
  Les `.woff2`, eux, passent en CORS et ont un vrai status.

**Limite à connaître** : les polices sont mises en cache **à la première visite
en ligne**, pas à l'installation. Une toute première ouverture hors ligne tombera
encore sur les polices système. Précacher n'est pas possible : les URL `.woff2`
de Google varient selon le navigateur et tournent dans le temps. Pour une
garantie complète, il faudrait héberger les `.woff2` dans le dépôt et pointer le
`@font-face` dessus — plus robuste, mais ce n'est plus une modification de `sw.js`.

Vérifié en conditions réelles : SW installé, requêtes de police passées à travers
lui, puis **origine des polices éteinte** — la CSS opaque et le `.woff2` sont
resservis depuis le cache, l'app shell reste à 6 entrées et le cache polices
survit à l'`activate`.

---

## 1. Système de thèmes

Le mode nuit existait déjà (`[data-theme="dark"]` + `applyTheme`) : la mécanique
est conservée, seules les **valeurs des jetons** changent.

Valeurs finales, après la passe éditoriale décrite au §10 :

| | Nuit | Jour |
|---|---|---|
| Fond principal (`--ivory`) | `#0A0F0D` | `#F8F6F2` |
| Cartes (`--surface`) | `#111814` | `#FFFFFF` |
| Texte principal (`--slate-900`) | `#F2E8D5` (crème) | `#14181A` |
| Texte secondaire (`--slate-500`) | `#9A9384` | `#6B7280` |
| Or (`--gold`) | `#D6B87C` | `#c19a55` |
| Bordures (`--border-subtle`) | `rgba(240,232,213,.08)` | `rgba(0,0,0,.06)` |
| Ombre moyenne (`--s-md`) | `0 8px 32px rgba(0,0,0,.4)` | `0 4px 16px rgba(0,0,0,.08)` |

Ajouts sur le toggle :

- icône SVG soleil / lune (plus d'emoji), échangée via `setAttribute('href', …)` ;
- `aria-label` mis à jour dynamiquement (« Passer en mode jour / nuit ») ;
- transition `background-color .3s ease, color .3s ease` sur les surfaces ;
- `<meta name="theme-color">` passe au fond sombre en nuit ;
- la persistance `localStorage` et le respect de `prefers-color-scheme` étaient
  déjà en place, inchangés.

### Nouveaux jetons

| Jeton | Rôle |
|---|---|
| `--forest` | aplat primaire — `#14532d` en jour, `#1F7A45` en nuit |
| `--forest-ink` | le même vert **quand il sert d'encre ou de bordure** — `#14532d` / `#5FCB8C` |
| `--gold-ink` | or lisible en texte — `#8A6A2E` / `#E2C793` |
| `--border-subtle` | la bordure 1px de la spec |
| `--fod-low` / `--fod-medium` / `--fod-high` | `#10B981` / `#F59E0B` / `#EF4444` |

Le doublon `--forest` / `--forest-ink` existe parce que `#14532d` sur `#0B0B0F`
est illisible : un vert d'aplat et un vert d'encre ne peuvent pas être la même
valeur dans les deux thèmes.

### Palette : ce qui disparaît

- `#22c55e` et toutes les `rgba(34,197,94,…)` — remplacés par `--forest`. La
  première passe ne couvrait que le bloc `<style>` ; quatre occurrences
  subsistaient dans le JS du graphique de poids, corrigées depuis (voir §11).
- Les 13 dégradés `linear-gradient(135deg, var(--green-500), …)` — remplacés par
  des aplats.
- Les halos verts (`box-shadow: 0 8px 24px rgba(34,197,94,.3)`) et `--s-glow`
  (désormais `none`).

### Rayons resserrés

`--r-sm` 14→10, `--r-md` 20→14, `--r-lg` 28→18, `--r-xl` 36→24. Les boutons et
champs passent à 12px et 10px. C'est le changement qui « dé-bulle » le plus l'app.

---

## 2. Icônes SVG

Un sprite de **43 symboles** (style Lucide, `viewBox="0 0 24 24"`, stroke seul,
aucun remplissage) est inliné en haut du `<body>`. `icons.svg` est le même jeu en
fichier séparé, comme source de référence — l'app reste mono-fichier et hors ligne,
donc le sprite doit être inline.

```html
<svg class="ic" aria-hidden="true"><use href="#i-home"/></svg>
```

Tailles : `.ic` 24px (nav), `.ic-sm` 18px (badges, boutons), `.ic-meal` 22px,
`.ic-lg` 28px. `stroke-width` 1.5–2 selon la taille pour garder une graisse optique
constante.

### Règle appliquée : SVG dans le châssis, emoji dans le contenu

**Passés en SVG** — barre d'onglets et sidebar (5 icônes), logo, toggle jour/nuit
et animations, médaillons de créneau des cartes repas (`mealIcons` : lever de
soleil / soleil / pomme / lune), en-têtes de modale, en-têtes de panneaux (`h4`),
badges de statut, jetons macro des cartes aliment, flèches de navigation, boutons
de fermeture, bouton d'envoi du coach, les ~50 boutons générés en JS, les 3 cartes
de phase, l'avatar du coach.

**Emoji conservés** — messages du coach, toasts, disclaimers en prose, aliments
(`🥑 Avocat`), exemples de repas, options du quiz (poêle, four…).

**Un cas assumé** : les chips de catégorie de l'explorateur (`🍓 Fruits`,
`🥕 Légumes`…) gardent leur emoji. Ce sont formellement des contrôles, mais
l'emoji y désigne un aliment, et cinq pictogrammes de légumes dessinés au trait
seraient moins lisibles que les emoji. Dites-moi si vous préférez les convertir.

---

## 3. Badges FODMAP — **révisé après vos maquettes**

La spec §4 demandait de supprimer les pilules pastel au profit d'un point de 6px.
Vos trois références font l'inverse, et vous avez tranché pour les maquettes : le
statut redevient un **aplat coloré** — c'est la promesse de l'app, elle doit se
lire d'un coup d'œil.

- Pilules pleines arrondies sur `.fc-badge`, `.pib`, `.modal-badge`, `.mcl-fod`,
  `.ds-badge` — couleurs distinctes en jour et en nuit, toutes ≥ 4.5:1.
- Médaillon rond coloré sur la vignette des cartes aliment
  (`.food-card.safe .fc-emoji` etc.), comme les cercles vert/orange/rouge de vos
  maquettes 1 et 2.
- Le liseré latéral (`.food-card::before`) devient redondant et disparaît.
- `.fod-badge` / `.dot` restent disponibles pour un usage en ligne dans du texte.

Tout passe par le CSS : **aucun HTML généré par le JS n'a été touché** (le `<i>`
de `.mcl-fod` est masqué, les `::before` de pastille désactivés).

Les emoji `🌿` / `✅` / `🔵` / `🟠` en tête des badges de statut du résumé du jour
ont été retirés : l'aplat coloré porte déjà le sens.

---

## 4. Boutons

`.btn-p` : aplat `var(--forest)`, radius 12px, padding 12/24, poids 500,
`box-shadow: 0 2px 4px rgba(0,0,0,.1)`, `translateY(-1px)` au survol. Plus de
dégradé, plus de halo, plus d'ombre verte, plus de balayage `::after`.

`.btn-s` : transparent, bordure et texte `var(--forest-ink)`, inversion au survol.

Les deux passent en `inline-flex` avec `gap: 8px` (pour accueillir l'icône) et
`min-height: 44px`.

---

## 5. Typographie

Playfair Display est **étendu** : il couvre maintenant les titres de section, les
en-têtes de carte, les noms de repas, et tous les grands chiffres (kcal, poids,
numéros de jour). `.sec-title` repasse de Inter 800 à Playfair 600.

Les micro-libellés en capitales espacées sont neutralisés sur les **22 sélecteurs**
concernés (`CRÉNEAU`, `JOUR`, `INGRÉDIENTS DÉTECTÉS`, `QUANTITÉ (G)`, `LISTE
D'INGRÉDIENTS`…) : `text-transform: none`, `letter-spacing: 0`, 12px, poids 500,
couleur secondaire. La hiérarchie passe désormais par la taille et la graisse.

---

## 6. Panneaux inversés corrigés

`.day-summary` et `.budget-card` étaient bâtis sur
`linear-gradient(135deg, var(--slate-900), #1a2332)` avec `color: #fff` sur les
enfants. Comme `--slate-900` devient clair en mode nuit, ces deux blocs
s'affichaient en **gris clair avec du texte blanc**. Ils redeviennent des cartes
normales (`--surface` + bordure), lisibles dans les deux thèmes.

Même correction pour `.dmeal` (`#20241b` codé en dur), `.msg.bot` (`#232720`),
`.profile-wrap` et `.weight-form-card` (dégradés vers `#fff`).

Le dégradé de l'anneau de progression (`#ringGrad`, `#22c55e → #15803d` en dur
dans le SVG) est maintenant piloté par les jetons via deux classes sur les
`<stop>`, donc thémable.

---

## 7. Responsive

- **Conteneur desktop** : `.inner` / `.dash-wrap` / `.app-foot` passent de 1280px
  à **1160px**.
- **Barre du bas** (mobile) : 56px minimum par onglet,
  `padding-bottom: calc(4px + env(safe-area-inset-bottom))` sous `@supports`.
- **Cibles tactiles** ≥ 44px sur boutons, chips, filtres, flèches, champs.
- **Breakpoints** : `max-width:767px` (colonne unique, phases en grille pleine
  largeur), `768–900px` (tablette, actions rapides sur 4 colonnes), `≥1024px`
  (padding généreux). La sidebar desktop à 901px existait déjà.
- **`@media (display-mode: standalone)`** : `overscroll-behavior-y: none`,
  bannière d'installation masquée.
- La navigation de semaine (`.prog-nav`) passe en grille
  `44px | 1fr | 44px` sous 767px — en flex, le libellé long écrasait les flèches.

---

## 8. Accessibilité

- `:focus-visible` : contour or 2px, offset 2px, sur tous les interactifs.
- `aria-label` sur les boutons icône (flèches de semaine, toggle thème,
  fermetures) ; `aria-hidden="true"` sur toutes les icônes décoratives.
- `--slate-400` est aligné sur `--slate-500` (`#6B7280` / `#9AA0A6`) : l'ancien
  gris clair ne tenait pas le 4.5:1 sur les petits textes.
- **`prefers-reduced-motion` désormais respecté par défaut** : le réglage
  `data-anims="force"` outrepassait systématiquement la préférence système. Il
  n'est plus appliqué qu'en l'absence de choix enregistré et si l'OS ne demande
  pas de mouvement réduit. Le bouton ✨ reste souverain dans les deux sens.

---

## 10. Direction éditoriale (passe 2)

Après vos maquettes, la palette et la structure restent, mais l'ambition visuelle
monte d'un cran vers la référence 3 :

- **Fond nuit** : `#0B0B0F` devient `#0A0F0D` — le même niveau de noir, réchauffé
  d'une pointe de vert.
- **Encre nuit** : le gris neutre `#E6E6E6` devient un **crème `#F2E8D5`**. C'est
  ce qui donne le cachet éditorial de la maquette 3.
- **Typographie display** : `.sec-title` passe de 26px à `clamp(30px, 4.6vw, 52px)`
  en Playfair 600, interlignage 1.04, `letter-spacing -.022em`. Idem pour
  `.dash-greet`, `.quiz-title`, `.modal-title` et les grands chiffres. C'est le
  levier principal — mes titres étaient deux fois trop petits.
- **Halo ambiant** : deux `radial-gradient` fixes en `body::before` (vert en haut
  à droite, or en haut à gauche) donnent la profondeur des maquettes sans une
  seule image.
- **Cartes** : padding 28/30, rayon `--r-xl`, ombres plus profondes en nuit,
  médaillons ronds pour les créneaux et les phases.
- **Or plus présent** : liens, icônes de créneau, onglet actif, `.sec-tag`.

### Corrections trouvées pendant cette passe

- La carte « Aujourd'hui » s'étirait sur deux rangées de grille et laissait un
  grand vide sous la barre de budget. `.dash-grid{align-items:start}` +
  `.dash-today{grid-row:auto}` : les cartes se dimensionnent à leur contenu.
- Les icônes de 13px des jetons macro (balance, bouclier) devenaient des pâtés
  illisibles. Seule la flamme survit à cette taille ; les deux autres passent en
  libellé texte (`150 g`, `1 g prot.`).
- `mealLabels` gardait un emoji de créneau (`🌅 Petit-déj`) qui faisait doublon
  avec le médaillon SVG désormais à côté. Retiré, y compris dans l'export PDF.
- Le libellé de l'onglet actif restait vert alors que son icône passait en or.

---

## Sur le design system généré

`search.py --design-system` proposait *Vibrant & Block-based* avec une palette
lavande `#8B5CF6` et un pairing Lora/Raleway. Je ne l'ai pas suivi sur ces deux
points : votre brief fixe des hex précis (forêt + or) et valide Playfair/Inter.
Ce qui a été retenu du générateur, c'est sa checklist de pré-livraison — pas
d'emoji comme icônes, `cursor: pointer`, transitions 150–300ms, contraste 4.5:1,
focus visible, `prefers-reduced-motion`, 375/768/1024/1440 — appliquée
intégralement ci-dessus.

---

## Arbitrages retenus

- **Palette** : vert forêt + or + crème (maquette 3). L'indigo `#4F46E5` des
  maquettes 1 et 2 est écarté — il contredisait `--forest` et `--gold`.
- **Badges FODMAP** : médaillons pleins des maquettes, contre la spec §4 écrite.
- **Photographies** : aucune. Le mono-fichier et le hors-ligne sont préservés ;
  `sw.js` ne met en cache que le même domaine, des visuels CDN casseraient le mode
  hors ligne, et le base64 ferait passer le fichier de 446 Ko à plusieurs Mo.

### Reste ouvert

1. **Chips de catégorie** (`🍓 Fruits`…) : emoji conservés, cf. §2. À convertir ?
2. **Bordure dorée animée** du panneau coach (`conic-gradient`) : conservée, c'est
   le seul effet appuyé qui reste.
3. **Google Fonts** n'est pas dans `APP_SHELL` : Playfair et Inter ne se chargent
   pas hors ligne aujourd'hui. Corrigeable en ajoutant les `.woff2` au cache, mais
   ça touche `sw.js`, que vous m'avez demandé de ne pas modifier.

---

## 11. Graphique de poids : couleurs pilotées par les jetons

Le graphique et son sparkline construisaient leur SVG en JS avec des couleurs
écrites en dur — vert Tailwind `#22c55e` pour la courbe et le dégradé, `#15803d`
pour le dernier point, `#cbd5e1` pour la ligne de référence, `#c9a96e` pour le
point du sparkline. Ces valeurs échappaient donc à la palette : la courbe
restait au vert d'origine, et la ligne de référence — un gris clair — devenait
quasi invisible sur fond sombre.

Les attributs de présentation SVG n'acceptent pas `var()`. Comme pour `#ringGrad`,
la couleur passe par des **classes CSS** posées sur les éléments générés :

| Classe | Rôle | Jeton |
|---|---|---|
| `.wg-stop-a` / `.wg-stop-b` | dégradé de l'aire | `--forest-ink`, puis transparent |
| `.w-line`, `.spark-path` | courbe | `--forest-ink` |
| `.w-dot` / `.w-dot.last` | points / dernier point | `--surface` + contour, puis plein |
| `.w-baseline` | ligne de référence | `--slate-200` |
| `.spark-dot` | point du sparkline | `--gold` |

Vérifié en rendu : la courbe résout `#5FCB8C` en nuit et `#14532d` en jour, la
ligne de référence suit (`#26302A` / `#E3DFD7`). Plus aucune couleur codée en
dur dans le JS.
