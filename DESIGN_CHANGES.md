# FODMAP+ — refonte design (`preview.html`)

`preview.html` est une **copie complète de `index.html`** avec le nouveau design.
`index.html`, `manifest.json`, `sw.js` et les données n'ont **pas** été touchés.

Pour tester : ouvrez `preview.html` dans le navigateur, ou servez le dossier
(`npx http-server -p 8080`) et allez sur `http://localhost:8080/preview.html`.

---

## Ce qui a été vérifié

Rendu réel dans Chromium (Playwright) sur 4 combinaisons viewport × thème
(390×844 et 1440×950, jour et nuit), en naviguant dans les 5 onglets et en
ouvrant une modale de repas.

- **Aucune erreur JS** (`pageerror`) sur aucun écran.
- Les 310 fonctions, 89 handlers `onclick`, 9 sélecteurs `querySelector` et
  16 clés `localStorage` sont **identiques** entre `index.html` et `preview.html`.
- Deux IDs seulement ont changé — `themeIcSide` et `animIcSide` deviennent
  `themeUseSide` / `animUseSide` — parce qu'ils désignaient un `<span>` dont le JS
  écrivait le `textContent` (un emoji) et qu'ils pointent maintenant sur le `<use>`
  d'un SVG. Les deux fonctions concernées (`applyTheme`, `applyAnims`) ont été
  mises à jour en conséquence.

---

## 1. Système de thèmes

Le mode nuit existait déjà (`[data-theme="dark"]` + `applyTheme`) : la mécanique
est conservée, seules les **valeurs des jetons** changent.

| | Nuit | Jour |
|---|---|---|
| Fond principal (`--ivory`) | `#0B0B0F` | `#F8F6F2` |
| Cartes (`--surface`) | `#15151E` | `#FFFFFF` |
| Texte principal (`--slate-900`) | `#E6E6E6` | `#1A1A1A` |
| Texte secondaire (`--slate-500`) | `#9AA0A6` | `#6B7280` |
| Bordures (`--border-subtle`) | `rgba(255,255,255,.06)` | `rgba(0,0,0,.06)` |
| Ombre moyenne (`--s-md`) | `0 8px 32px rgba(0,0,0,.4)` | `0 4px 16px rgba(0,0,0,.08)` |

Ajouts sur le toggle :

- icône SVG soleil / lune (plus d'emoji), échangée via `setAttribute('href', …)` ;
- `aria-label` mis à jour dynamiquement (« Passer en mode jour / nuit ») ;
- transition `background-color .3s ease, color .3s ease` sur les surfaces ;
- `<meta name="theme-color">` passe à `#0B0B0F` en nuit ;
- la persistance `localStorage` et le respect de `prefers-color-scheme` étaient
  déjà en place, inchangés.

### Nouveaux jetons

| Jeton | Rôle |
|---|---|
| `--forest` | aplat primaire — `#14532d` en jour, `#1B6B3C` en nuit |
| `--forest-ink` | le même vert **quand il sert d'encre ou de bordure** — `#14532d` / `#57C286` |
| `--gold-ink` | or lisible en texte — `#8A6A2E` / `#DCC08A` |
| `--border-subtle` | la bordure 1px de la spec |
| `--fod-low` / `--fod-medium` / `--fod-high` | `#10B981` / `#F59E0B` / `#EF4444` |

Le doublon `--forest` / `--forest-ink` existe parce que `#14532d` sur `#0B0B0F`
est illisible : un vert d'aplat et un vert d'encre ne peuvent pas être la même
valeur dans les deux thèmes.

### Palette : ce qui disparaît

- `#22c55e` et toutes les `rgba(34,197,94,…)` — remplacés par `--forest`.
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

## 3. Badges FODMAP

Les pilules pastel pleines disparaissent partout au profit de **pastille + libellé** :

```html
<span class="fod-badge"><span class="dot dot-high"></span>Riche en FODMAP</span>
```

Le pattern est appliqué à `.mcl-fod` (qui avait déjà son `<i>`, donc **zéro
changement de markup**), et par `::before` à `.fc-badge`, `.pib`, `.modal-badge`,
`.ds-badge` — là aussi sans toucher au HTML généré par le JS.

Les emoji `🌿` / `✅` / `🔵` / `🟠` en tête des badges de statut du résumé du jour
ont été retirés : la pastille faisait doublon.

Le liseré latéral coloré des cartes aliment (`.food-card::before`) est conservé —
c'est le repère de statut fort, et il ne dépend pas de la lecture d'un texte.

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

## Sur le design system généré

`search.py --design-system` proposait *Vibrant & Block-based* avec une palette
lavande `#8B5CF6` et un pairing Lora/Raleway. Je ne l'ai pas suivi sur ces deux
points : votre brief fixe des hex précis (forêt + or) et valide Playfair/Inter.
Ce qui a été retenu du générateur, c'est sa checklist de pré-livraison — pas
d'emoji comme icônes, `cursor: pointer`, transitions 150–300ms, contraste 4.5:1,
focus visible, `prefers-reduced-motion`, 375/768/1024/1440 — appliquée
intégralement ci-dessus.

---

## Points à trancher

1. **Chips de catégorie** (`🍓 Fruits`…) : emoji conservés, cf. §2. À convertir ?
2. **Carte « Aujourd'hui »** du tableau de bord : elle occupe deux rangées de
   grille et laisse un grand vide sous la barre de budget. C'est antérieur à cette
   refonte et je n'y ai pas touché — dites-moi si vous voulez que je rééquilibre.
3. **Bordure dorée animée** du panneau coach (`conic-gradient`) : conservée, c'est
   le seul effet « premium » un peu appuyé qui reste.
