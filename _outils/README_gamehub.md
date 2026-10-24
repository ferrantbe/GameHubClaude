# La chaîne GameHub — qui dépend de quoi

Ce projet est **séparé du recueil d'exercices**, parce que le fil rouge n'obéit
pas aux mêmes règles : numérotation séquentielle, traversée de toute l'année,
et production de ses propres documents.

Il produit **six artefacts** qui doivent rester d'accord entre eux. Ce document
dit dans quel ordre les régénérer quand quelque chose change.

## La source unique

Tout part de **`src/main/java/be/ephec/gamehub/`**. C'est le seul
endroit où du code est écrit à la main ; le reste en est dérivé, à une
exception près — les énoncés, qui sont rédigés.

```
    src/…/gamehub/                le code, annoté
            │
            ├──> GameHub_Solution_Finale.docx        extrait automatiquement
            ├──> GameHub_Solution_Par_Question.docx  reconstitué par incrément
            ├──> _demos/depot_gamehub/               un dépôt Git, un commit par étape
            └──> _demos/diagrammes/*.png             décrits à la main
                        │
                        └──> GameHub_enonces.docx    rédigé, reprend les images
```

### Pourquoi Git est un produit, et non la source

Un dépôt où chaque incrément serait un vrai commit paraît la solution
évidente. Elle a un défaut décisif : corriger une faute repérée à `G.29`
demande de la répercuter sur vingt commits antérieurs — donc un `rebase`
interactif, avec un conflit possible à chaque étape.

Avec la source annotée, la même correction est **une seule édition dans un
seul fichier**, suivie d'une régénération. Le dépôt est refait en entier,
étiquettes comprises.

On garde donc les deux : le marquage pour écrire, le dépôt pour lire.

## Les marqueurs

Le code porte des commentaires `//@G.n`, ignorés par le compilateur, qui disent
à quel incrément chaque élément apparaît.

| Forme | Portée |
|---|---|
| `//@G.14` seul sur sa ligne | le bloc qui suit — une méthode, un champ |
| `//@G.21` en fin de ligne | cette ligne seulement |
| `//@G.2-G.6 <code>` en début de ligne | une **variante**, gardée en commentaire |

### La règle absolue : le fichier doit compiler

Deux versions d'une même signature ne peuvent pas coexister comme deux lignes
de code — ce n'est pas du Java valide. L'ancienne vit donc **en commentaire**,
précédée de son intervalle :

```java
    //@G.2-G.6 public Partie(Joueur j1, Joueur j2) {
    public Partie(Joueur j1, Joueur j2, TypeJeu type) {    //@G.7
```

Le script remet la première en service pour les états G.2 à G.6, et retient la
seconde à partir de G.7. Le fichier, lui, reste valide.

**C'est la règle à ne jamais enfreindre.** Un outil qui casse ce qu'il sert
n'a aucun intérêt, et la première version de cette convention l'a fait — elle
mettait les deux signatures en clair, et le corrigé ne compilait plus.

### Deux pièges rencontrés, et leur parade

**Une liste d'énumération qui perd sa fin.** Si les constantes ajoutées plus
tard portent le point-virgule final, les états antérieurs se terminent par une
virgule orpheline. Le point-virgule va donc sur sa propre ligne, sans
marqueur — une virgule finale avant lui est légale en Java.

**Un switch qui ne renvoie rien.** Un `switch` dont tous les cas lèvent une
exception n'est pas une expression valide. À G.15, la fabrique ne connaît
aucun jeu : son corps est donc un simple `throw`, gardé en variante, et le
switch n'arrive qu'à G.18.

## Quand vous modifiez le code

```
python3 _outils/etats_gamehub.py --verifier     compile les 35 états
node _outils/build_gamehub_solutions.js         le corrigé final
node _outils/build_gamehub_par_question.js      le corrigé pas à pas
```

### Le contrôle compile réellement

`--verifier` reconstitue chaque état, l'écrit dans un dossier temporaire, et le
**compile** avec le compilateur du JDK. C'est la seule preuve qui vaille : un
marqueur mal posé se voit immédiatement.

**Les trente-deux premiers états compilent, tous.** C'est le bénéfice de la
sortie du démineur : jusqu'à `G.32`, le fil rouge ne dépend plus de JavaFX, et
aucun de ces états n'échappe au contrôle.

À partir de `G.33`, la fenêtre du Nim emploie JavaFX. Ces états ne se compilent
que si les bibliothèques sont disponibles ; sinon le script les signale et les
saute. C'est la seule exception, et elle est circonscrite au package
`fenetre`.

Compiler ne dit rien de la justesse : un état peut compiler et ne pas
correspondre à ce que l'énoncé demandait. Mais un état qui ne compile pas est
faux à coup sûr, et c'est déjà beaucoup.

## Quand vous ajoutez un incrément

Cinq choses à faire, dans cet ordre.

1. **Écrire le code** dans `solutions/…/gamehub/`, avec ses marqueurs `//@G.n`.
2. **Renuméroter** ce qui suit, si l'incrément s'insère au milieu : les
   marqueurs dans le code, et les appels `increment("G.n", …)` dans les trois
   scripts de génération.
3. **Ajouter ou modifier un diagramme** dans `_outils/diagrammes_gamehub.py`,
   puis le régénérer. Il refusera un diagramme trop large pour la page.
4. **Rédiger l'énoncé** dans `_outils/build_gamehub.js`.
5. **Déclarer l'étape** dans `_outils/gamehub_increments.json` : son titre, le
   résumé de ce qu'elle apporte, et les fichiers à montrer. Ce fichier sert à
   la fois au corrigé pas à pas et aux messages de commit.

Puis tout régénérer :

```
python3 _outils/diagrammes_gamehub.py
python3 _outils/etats_gamehub.py --verifier
python3 _outils/depot_gamehub.py
node _outils/build_gamehub.js
node _outils/build_gamehub_solutions.js
node _outils/build_gamehub_par_question.js
```



## Ce que la chaîne ne fait pas toute seule

**Elle ne rédige pas les énoncés.** Le texte des incréments est écrit à la
main, et c'est normal — c'est la partie qui demande un professeur.

**Elle ne place pas les diagrammes.** Les positions des boîtes sont données à
la main dans `diagrammes_gamehub.py`. Un placement automatique donnerait des
résultats imprévisibles ; à ce nombre de classes, le faire soi-même est plus
rapide.


---

## Le dépôt Git généré

`python3 _outils/depot_gamehub.py` produit `depot/` : un dépôt où chaque
incrément est un commit étiqueté.

**Les vingt-neuf versions ont toutes leur étiquette**, y compris les six qui ne
changent aucun fichier — leur commit ne porte que la fiche `ETAPE.md`, qui
explique pourquoi. Un étudiant qui fait `git checkout G.22` ne tombe donc pas
sur une version manquante.

**Chaque version porte sa fiche.** `ETAPE.md` donne le titre de l'incrément, ce
qu'il apporte, les classes touchées et la commande pour voir le diff.

**Les trois documents et les neuf diagrammes** sont joints au dernier commit.
Celui qui reste sur `main` les a sous la main ; celui qui remonte le temps garde
la fiche de l'incrément où il se trouve.

```
git tag --sort=v:refname       la liste des versions
git checkout G.7               le projet tel qu'il était à G.7
git diff G.6 G.7               ce que l'incrément G.7 a ajouté
git checkout main              revenir à la version finale
```

**Ce que le dépôt montre et qu'aucun document ne montre aussi bien** : le
`diff`. Deux lignes ajoutées à `Partie`, une signature qui change — tout est
là, en couleur, sans avoir à comparer deux pages.

### Avant de le distribuer

Cela suppose que les étudiants sachent cloner et changer de version. C'est
peu, mais le cours avait décidé de ne pas leur demander Git — voir la section
correspondante du mémento technique. À rouvrir, ou pas.

Pour vous, en revanche, il ne coûte rien : IntelliJ affiche l'historique dans
son onglet Git, et le parcourir est une bonne façon de relire la progression.


---

## La notice Git pour les étudiants

`node _outils/build_git_etudiants.js` produit
`_documents/Git_pour_GameHub.docx`, sept pages destinées aux étudiants.

Elle est volontairement **limitée à la lecture** : trois idées (commit,
historique, étiquette), quatre gestes à la souris, et les trois situations qui
coincent. Ni commit, ni branche, ni serveur — Git n'est pas au programme, et
le document le dit en toutes lettres pour éviter que quelqu'un s'inquiète de
devoir l'apprendre.

### Les captures d'écran

Déposez-les dans `_captures/`, sous les noms attendus par le script. Elles sont
**mesurées automatiquement** — pas de tableau de tailles à tenir à jour, contrairement
au guide IntelliJ.

Trois exigences, apprises à l'usage :

- **du PNG sans transparence.** Une capture en RGBA se rend mal dans Word, parfois
  sur fond noir, et rien ne le signale.
- **pas de chemin personnel visible.** Le panneau de fichiers d'IntelliJ affiche le
  chemin complet du projet : il serait imprimé pour toute la classe.
- **une fenêtre IntelliJ étroite.** C'est la largeur de la fenêtre capturée qui décide
  de la taille du texte imprimé, pas la résolution : une capture de 3386 pixels de large
  donne des caractères de 5 points une fois ramenée à la page, une de 2030 en donne 15.
  Rétrécissez la fenêtre avant de capturer.

Et une correction à retenir : dans la comparaison de versions, IntelliJ colore en
**vert** ce qui est ajouté et en **bleu** ce qui est modifié. Le rouge de `git diff` en
ligne de commande n'existe pas dans son interface — le document a d'abord dit le
contraire.

Sans le dossier, le document se construit quand même : un encadré rouge marque chaque
emplacement. C'est voulu, pour pouvoir relire le texte avant d'avoir les images.

Elle part **avec le dépôt** : `depot_gamehub.py` la joint au dernier commit,
et le README du dépôt y renvoie. Le document qui explique le dépôt voyage donc
dedans.


## La livraison aux étudiants, module par module (24/10/2026)

    python3 _outils/livrer_gamehub.py --verifier   compile chaque état livré
    python3 _outils/livrer_gamehub.py --toutes     les quinze archives, dans livraisons/
    python3 _outils/livrer_gamehub.py COL          l'archive du module COL

Les étudiants gèrent deux projets : `GameHub`, le leur, et `GameHub_correction`,
la correction officielle. L'archive d'un module (`GameHub_Module09_COL.zip`,
numérotée comme les decks et les archives d'exercices) contient un dossier
racine `GameHub_correction/`, avec la correction de tous les incréments des
modules précédents, c'est-à-dire le point de départ du module. Le module POO
reçoit un projet vide, et `GameHub_fin.zip` la correction finale. Le README de
l'archive explique aux étudiants comment gérer les deux projets.

Les modules et leurs incréments sont dans `_outils/livraisons_gamehub.json`,
ainsi que l'incrément à partir duquel chaque classe de test compile.
