# Corrigé du fil rouge GameHub

Le document `enonces/GameHub_solutions.docx` reprend ce code avec, pour chaque
incrément, les raisons du choix retenu. Il est **extrait automatiquement de ces
fichiers** : les deux ne peuvent pas diverger. Si vous modifiez une classe,
relancez `node build_gamehub_solutions.js`.

Ce paquet n'est **pas** livré par `livrer.py` : le fil rouge traverse toute
l'année et ne se rattache à aucune séance. Distribuez-le quand vous le jugez
utile.

## La renumérotation

Sept incréments ont été insérés entre `G.13` et l'ancien `G.14`. Tout ce qui
suivait a glissé de sept rangs.

| Avant | Après | Contenu |
|---|---|---|
| — | `G.14` à `G.20` | interface `Jeu`, fabrique, Nim, stratégies, `JeuConfigurable` |
| `G.14`–`G.20` | `G.21`–`G.27` | le jeu de bataille |
| `G.21` | `G.28` | devine le nombre |
| `G.22` | `G.29` | le démineur |

## Ce qui est écrit

| Incréments | Classes |
|---|---|
| `G.1`, `G.2`, `G.4`, `G.7`, `G.12` | `modele/Joueur`, `modele/Partie` |
| `G.6` | `modele/TypeJeu`, `modele/ResultatPartie` |
| `G.8` | `modele/ResumePartie` |
| `G.11`, `G.13` | `observateurs/ObservateurPartie`, `JournalParties` |
| `G.3`, `G.9`, `G.20` | `GameHub` |
| `G.14`, `G.15` | `jeux/Jeu`, `jeux/JeuFactory` |
| `G.16` | `jeux/nim/Pile`, `jeux/nim/ReglesNim` |
| `G.17` | `jeux/nim/StrategieNim`, `StrategieTimide` |
| `G.18`, `G.20` | `jeux/nim/JeuNim`, `jeux/JeuConfigurable` |
| `G.19` | `StrategieAleatoire`, `StrategieMaligne`, `TypeStrategieNim`, `StrategieNimFactory` |
| `G.21`, `G.22` | `jeux/bataille/Deck`, `Carte`, `Valeur`, `Couleur` |
| `G.23`–`G.26` | `jeux/bataille/JeuBatailleV0` |
| `G.27` | `jeux/bataille/JeuBatailleV1` |
| `G.28` | `jeux/JeuDevineLeNombre` |
| `G.29` | `jeux/demineur/` — `Grille`, `VueDemineur`, `JeuDemineur` |

## Ce qui n'est pas écrit

**`G.10`** — la classe abstraite `Jeu` est remplacée par l'interface du même nom
dès `G.14`. L'écrire aurait produit deux classes `Jeu` dans le même paquet.
L'énoncé annonce d'ailleurs qu'elle sera remise en cause.

Tout le reste est écrit. Le catalogue complet — Nim, bataille, devine le
nombre, démineur — se lance depuis `GameHub`. Seuls le morpion et le puissance 4
restent au stade de valeurs dans `TypeJeu`.

## Deux écarts avec les énoncés, signalés dans le code

**`G.12`** demande d'appeler `notifierDebut` dans le constructeur. Les
observateurs s'ajoutant après la construction, cet appel ne prévient personne.
Le corrigé suit l'énoncé et explique le décalage.

**`G.11`** nomme l'interface `ObservateurPartie`, **`G.12`** écrit
`List<Observateur>`. Le corrigé garde le premier nom.

## Les classes de test

| Classe | Ce qu'elle vérifie |
|---|---|
| `jeux/nim/StrategieNimTest` | les règles, les trois stratégies, et qu'aucune ne propose un coup interdit sur vingt tailles de pile |
| `jeux/bataille/BatailleTest` | le deck, l'ordre des valeurs, et deux propriétés qui tiennent quel que soit le hasard |
| `jeux/demineur/GrilleTest` | les huit règles du démineur, sans ouvrir de fenêtre |

La stratégie gagnante a été vérifiée sur 1200 parties simulées : depuis une
position gagnante — `restantes % 4` différente de 1 — elle ne perd jamais.

La bataille a été simulée 500 fois dans chaque version. `V0` se termine
toujours, dont 11 fois par un double épuisement. `V1` atteint le maximum de
tours 3 fois sur 500 : le garde-fou n'est pas théorique, et c'est une propriété
du jeu plutôt qu'un défaut du programme.

## Un écart assumé avec l'énoncé

**`G.26`** demande de rendre `JOUEUR1_GAGNE` quand la pioche du joueur 1 est
vide. C'est l'inverse de la règle : un joueur sans carte a tout perdu. Le
corrigé applique la règle, et l'énoncé pose la question aux étudiants.
