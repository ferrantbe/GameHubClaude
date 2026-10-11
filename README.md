# GameHub — le fil rouge

Le projet de travail du professeur. Il contient la **source annotée** du
corrigé, et les outils qui en dérivent tout le reste.

## Ce qu'on y trouve

| Dossier | Contenu |
|---|---|
| `src/` | le corrigé, annoté de marqueurs `//@G.n` — la seule chose écrite à la main |
| `_outils/` | les générateurs, et leur mode d'emploi |
| `_documents/` | les trois documents produits : énoncés, corrigé final, corrigé pas à pas |
| `_diagrammes/` | les neuf diagrammes de classes |
| `depot/` | le dépôt Git distribuable, une version par incrément |

## Le démineur n'est plus ici

Il a vécu dans le fil rouge comme un jeu parmi les autres, jusqu'à ce qu'un
lancement révèle le prix de cette place :

```
Caused by: java.lang.IllegalStateException: Toolkit not initialized
```

Le hub est une application **console**. Ouvrir une fenêtre depuis une console
oblige à démarrer le moteur graphique à la main, à construire l'interface sur
un autre fil d'exécution, et à faire attendre le premier. Trois notions hors
programme, pour un seul jeu.

Le démineur a donc son propre projet, `DemineurClaude`, où il a retrouvé la
forme ordinaire d'une application JavaFX. GameHub y a gagné : **il ne dépend
plus de JavaFX du tout**, et ses trente états se compilent tous.

## Pourquoi ce projet est séparé du recueil d'exercices

Le fil rouge n'obéit pas aux mêmes règles. Sa numérotation est séquentielle et
non thématique — `G.7` vient après `G.6` parce qu'il en dépend, là où `EXC.3`
peut tomber n'importe quand. Il traverse toute l'année au lieu d'appartenir à
une séance. Et il produit ses propres artefacts, dont un dépôt Git.

Les mélanger obligeait `livrer.py` à faire une exception pour lui, et le
recueil à héberger cinq outils qui ne le concernaient pas.

## Pour régénérer

```
python3 _outils/diagrammes_gamehub.py       les diagrammes
python3 _outils/etats_gamehub.py --verifier  compile les 29 états
python3 _outils/depot_gamehub.py            le dépôt Git
node _outils/build_gamehub.js               les énoncés
node _outils/build_gamehub_solutions.js     le corrigé final
node _outils/build_gamehub_par_question.js  le corrigé pas à pas
```

**Lisez `_outils/README_gamehub.md` avant de modifier quoi que ce soit.** Il
explique la convention des marqueurs, et la règle à ne jamais enfreindre : le
code doit rester compilable.

## Le dépôt

C'est lui qu'on distribue, si on décide de le distribuer. Il contient sa
propre notice pour les étudiants : `_documents/Git_pour_GameHub.docx`, sept
pages qui n'enseignent que les quatre gestes nécessaires.

**Vérifiez d'abord que Git est installé sur les postes de l'école.** IntelliJ
ne l'embarque pas : sans lui, l'onglet Git reste inerte et toute la
distribution tombe à l'eau.

```
git tag --sort=v:refname       la liste des versions
git checkout G.7               le projet tel qu'il était à G.7
git diff G.6 G.7               ce que l'incrément G.7 a ajouté
git checkout main              revenir à la version finale
```

Il est **généré** : ne le modifiez pas, la prochaine génération l'écraserait.
