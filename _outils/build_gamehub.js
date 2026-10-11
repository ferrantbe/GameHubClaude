const fs = require("fs");
const B = require(__dirname + "/boite.js");
const {
  p, runs, bullet, bulletRuns, code, h1, h2, tableau, encadre,
  saut, doc, Packer, GREY, AlignmentType, Paragraph, TextRun
} = B;

const { ImageRun } = require("docx");
const g = [];
const ACCENT = "1F4E79";

/**
 * Insere un diagramme de classes, avec sa legende.
 *
 * La largeur est plafonnee a celle du texte ; la hauteur suit, pour que
 * les proportions soient respectees.
 */
function diagramme(fichier, legende) {
  const chemin = `${__dirname}/../_diagrammes/${fichier}`;
  const taille = require("child_process")
    .execSync(`python3 -c "from PIL import Image; im=Image.open('${chemin}'); print(im.size[0], im.size[1])"`)
    .toString().trim().split(" ").map(Number);

  const LARGEUR_MAX = 620;
  const largeur = Math.min(LARGEUR_MAX, taille[0] / 2.2);
  const hauteur = largeur * taille[1] / taille[0];

  g.push(new Paragraph({
    spacing: { before: 200, after: 60 },
    alignment: AlignmentType.CENTER,
    children: [new ImageRun({
      data: fs.readFileSync(chemin),
      transformation: { width: Math.round(largeur), height: Math.round(hauteur) }
    })]
  }));
  g.push(new Paragraph({
    spacing: { after: 200 },
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: legende, size: 17, italics: true, color: GREY })]
  }));
}

function increment(codeEx, titre) {
  g.push(new Paragraph({
    spacing: { before: 300, after: 130 }, keepNext: true,
    children: [
      new TextRun({ text: codeEx + "  ", bold: true, size: 28, color: "7B9E4B" }),
      new TextRun({ text: titre, bold: true, size: 28, color: ACCENT })
    ]
  }));
}

g.push(new Paragraph({
  spacing: { before: 1100, after: 120 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Fil rouge", size: 26, color: GREY })]
}));
g.push(new Paragraph({
  spacing: { after: 160 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "GameHub", bold: true, size: 54, color: ACCENT })]
}));
g.push(new Paragraph({
  spacing: { after: 700 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Un hub de jeux, construit incrément par incrément",
                           size: 26, color: GREY })]
}));
g.push(p("EPHEC — Bachelier en informatique, niveau 2", { align: AlignmentType.CENTER, color: GREY }));
g.push(p("Année académique 2026-2027", { align: AlignmentType.CENTER, color: GREY }));
g.push(saut());

g.push(h1("Comment travailler ce fil rouge"));
g.push(p("Contrairement aux thèmes, qui se travaillent en une soirée, GameHub vous accompagne toute l'année. Chaque incrément ajoute une couche à ce que vous avez déjà écrit, et la plupart vous feront modifier du code d'il y a trois semaines."));
g.push(runs([
  { t: "La numérotation est séquentielle, ", b: true },
  "et non thématique comme celle des exercices : ici l'ordre est imposé par les dépendances. On ne peut pas écrire ",
  { t: "G.7", code: true },
  " sans avoir fait ",
  { t: "G.6", code: true },
  "."
]));
g.push(p("Le projet est le vôtre : vous le construisez dans votre propre dossier, et non dans le recueil d'exercices."));
g.push(h2("Les packages"));
g.push(...code([
  "be.ephec.gamehub                  GameHub, le point d'entree",
  "be.ephec.gamehub.modele           Joueur, Partie, TypeJeu, ResultatPartie",
  "be.ephec.gamehub.jeux             l'interface Jeu, la fabrique, les jeux",
  "be.ephec.gamehub.observateurs     ObservateurPartie, JournalParties",
  "be.ephec.gamehub.fenetre          la fenetre du Nim et son lanceur (G.33)"
]));
g.push(h2("Ce que le fil rouge apporte"));
g.push(p("Chaque incrément met en œuvre ce que vous venez de voir en cours, mais dans un programme qui existe déjà. C'est la différence essentielle avec les exercices : il faut faire entrer une idée neuve dans du code écrit avant elle."));
g.push(tableau(["Incréments", "Ce qu'ils mettent en œuvre"], [
  ["G.1 à G.3", "classes, champs immuables, toString, saisie"],
  ["G.4 à G.9", "dates, packages, énumérations, records"],
  ["G.10 à G.13", "classes abstraites, interfaces, patron Observateur"],
  ["G.14 à G.20", "interfaces, fabrique, stratégies, découplage"],
  ["G.21 à G.27", "collections, files, comparaisons"],
  ["G.28", "quand l'abstraction ne suffit plus"],
  ["G.29 et G.30", "héritage bien placé : deux jeux de grille, un seul algorithme"],
  ["G.31 et G.32", "généricité et lambdas : une paire qui a un sens, une fabrique sans switch"],
  ["G.33 et G.34", "JavaFX : le Nim dans une fenêtre, puis des boutons liés à la pile"],
  ["G.35", "fichiers : un journal qui survit à l'arrêt du programme"]
], [2600, 6760], [0]));
g.push(saut());

g.push(h1("Première partie — le modèle"));
g.push(p("Quatre classes et deux énumérations, qui décrivent une partie sans encore savoir y jouer."));

increment("G.1", "Le joueur");
g.push(p("Écrivez une classe Joueur. Un joueur a un pseudo et un email, tous deux immuables et fournis au constructeur. Elle présente getPseudo, getEmail, et un toString au format :"));
g.push(...code(["pseudo <pseudo@mail.com>"]));
g.push(bulletRuns([
  { t: "À se demander : ", b: true },
  "quel mot-clé fait respecter l'immuabilité par le compilateur plutôt que par votre vigilance ?"
]));

increment("G.2", "La partie");
g.push(p("Écrivez une classe Partie, vide pour l'instant, qui modélise une partie entre deux joueurs — deux champs. Son constructeur reçoit les deux Joueur, et son toString rend :"));
g.push(...code(["Partie entre Joueur1 et Joueur2"]));
g.push(p("Les joueurs y sont utilisés tels quels, ce qui provoque l'appel de Joueur.toString."));

increment("G.3", "Le point d'entrée");
g.push(p("Écrivez une classe GameHub avec une méthode main : elle crée deux joueurs en demandant pseudo et email au Scanner, puis génère une partie entre eux."));

diagramme("g03.png", "En vert, les classes ajoutées. Une Partie connaît deux Joueur ; GameHub crée l'une et les autres.");

increment("G.4", "Les dates");
g.push(runs([
  "Ajoutez à Partie les champs ",
  { t: "dateHeureDebut", code: true },
  " et ",
  { t: "dateHeureFin", code: true },
  ", tous deux ",
  { t: "LocalDateTime", code: true },
  ". Le début est initialisé dans le constructeur par ",
  { t: "LocalDateTime.now()", code: true },
  " ; la fin par une méthode ",
  { t: "terminer", code: true },
  ". Ajoutez les accesseurs."
]));
g.push(bulletRuns([
  { t: "À se demander : ", b: true },
  "en prenant la date dans le constructeur, existe-t-il un instant où une Partie serait sans date de début ? Est-ce souhaitable ?"
]));

increment("G.5", "Les packages");
g.push(p("Structurez le projet : be.ephec.gamehub pour le hub, be.ephec.gamehub.modele pour Joueur et Partie. Service et interface utilisateur viendront plus tard."));
g.push(runs([
  "Faites-le avec ",
  { t: "Refactor → Move", code: true },
  " plutôt qu'à la main : IntelliJ déplacera les fichiers, ajoutera les instructions ",
  { t: "package", code: true },
  " et corrigera tous les imports. Voir ",
  { t: "IDE.21", code: true },
  " du guide."
]));

diagramme("g05.png", "Deux packages. Les flèches en pointillé se lisent « dépend de ».");

increment("G.6", "Les deux énumérations");
g.push(p("Créez TypeJeu — pour l'instant NIM, MORPION et PUISSANCE4 — et ResultatPartie avec JOUEUR1_GAGNE, JOUEUR2_GAGNE et MATCH_NUL."));
g.push(runs([
  "TypeJeu a besoin d'un champ ",
  { t: "nom", code: true },
  " et d'un toString pour être affichable dans un menu : ",
  { t: "PUISSANCE4", code: true },
  " se lit mal."
]));
g.push(bulletRuns([
  { t: "À se demander : ", b: true },
  "dans quelle classe ces deux énumérations vont-elles servir ?"
]));

increment("G.7", "Type et résultat dans la partie");
g.push(runs([
  "Représentez dans Partie le type de jeu et le résultat. C'est ",
  { t: "terminer", code: true },
  " qui reçoit le résultat et l'enregistre. Ajoutez les accesseurs, et complétez le toString :"
]));
g.push(...code([
  "\"Partie \" + typeJeu + \" entre \" + joueur1 + \" et \" + joueur2",
  "    + \" commencee a \" + dateHeureDebut",
  "    + (resultat != null ? \" - resultat : \" + resultat : \"\")"
]));

increment("G.8", "Le résumé");
g.push(p("Créez un record ResumePartie contenant le pseudo du gagnant, les dates de début et de fin, et le type de jeu."));
g.push(bulletRuns([
  { t: "À se demander : ", b: true },
  "à quel endroit ce record peut-il se créer ? Dans quelle classe, et dans quelle méthode ? Cherchez le seul moment où toutes ses données existent en même temps."
]));

increment("G.9", "Le hub complété");
g.push(p("Modifiez GameHub : ajoutez le choix du type de jeu en affichant les valeurs de TypeJeu, créez une partie et affichez-la, terminez-la et affichez-la à nouveau."));
g.push(bulletRuns([
  { t: "À se demander : ", b: true },
  "construisez le menu à partir de ",
  { t: "TypeJeu.values()", code: true },
  ". Que se passe-t-il alors le jour où vous ajoutez un jeu au catalogue ?"
]));
diagramme("g09.png", "L'état du modèle à la fin de la première partie. Partie est devenue le centre : elle connaît tout le reste.");
g.push(saut());

g.push(h1("Deuxième partie — abstraction et observation"));

increment("G.10", "Une classe abstraite Jeu");
g.push(runs([
  "Créez une classe abstraite ",
  { t: "Jeu", code: true },
  " qui possède un champ ",
  { t: "protected Partie partie", code: true },
  ", un constructeur recevant une Partie, et déclare une méthode abstraite ",
  { t: "void jouer()", code: true },
  "."
]));
g.push(encadre([
  [{ t: "Cet incrément sera remis en cause", b: true }],
  ["La conception retenue ici — une classe abstraite, une méthode jouer() sans paramètre ni résultat — sera remplacée dès la séance suivante par une interface Jeu de signature différente."],
  ["Ce n'est pas un accident de parcours : c'est la vie normale d'une conception. Faites-le quand même, et gardez-en le souvenir. La comparaison des deux vaut plus que l'une des deux."]
]));

increment("G.11", "L'interface d'observation");
g.push(runs([
  "Créez une interface ",
  { t: "ObservateurPartie", code: true },
  " avec trois méthodes : ",
  { t: "onDebut(Partie)", code: true },
  ", ",
  { t: "onCoup(Partie)", code: true },
  " et ",
  { t: "onFin(Partie)", code: true },
  ". L'idée est de pouvoir observer le déroulement d'une partie."
]));

increment("G.12", "La partie observable");
g.push(p("Modifiez Partie pour qu'elle enregistre des observateurs :"));
g.push(bullet("une liste d'observateurs ;"));
g.push(bullet("des méthodes ajouterObservateur et retirerObservateur ;"));
g.push(bullet("des méthodes privées notifierDebut, notifierCoup et notifierFin, qui parcourent la liste ;"));
g.push(bullet("un appel à notifierDebut dans le constructeur, et à notifierFin dans terminer."));
g.push(encadre([
  [{ t: "Une question à se poser en exécutant", b: true }],
  ["Les observateurs s'ajoutent après la construction de la Partie. Que voit donc l'observateur quand notifierDebut est appelé depuis le constructeur ?"],
  ["Lancez, et regardez. Puis proposez une correction — il y en a au moins trois."]
]));

increment("G.13", "Un observateur concret");
g.push(p("Créez une classe JournalParties qui implémente ObservateurPartie et affiche sur la console le début de la partie, chaque coup joué, et la fin."));
g.push(bulletRuns([
  { t: "À se demander : ", b: true },
  "cet observateur pourrait-il écrire dans un fichier au lieu de la console ? Combien de lignes de Partie faudrait-il changer ?"
]));
diagramme("g13.png", "Partie ne connaît que l'interface ObservateurPartie, jamais JournalParties. C'est ce découplage qui permettra d'ajouter d'autres observateurs.");
g.push(saut());

g.push(h1("Troisième partie — découpler les jeux du hub"));
g.push(p("Sept incréments pour que GameHub cesse de connaître les jeux qu'il lance. C'est le passage le plus important du fil rouge : à sa fin, ajouter un jeu ne demandera plus une seule ligne dans le hub."));

increment("G.14", "L'interface Jeu");
g.push(runs([
  "Remplacez la classe abstraite de ",
  { t: "G.10", code: true },
  " par une ",
  { t: "interface", b: true },
  " du même nom, dans un nouveau package ",
  { t: "be.ephec.gamehub.jeux", code: true },
  " :"
]));
g.push(...code([
  "public interface Jeu {",
  "    TypeJeu getType();",
  "    ResultatPartie jouer(Joueur joueur1, Joueur joueur2);",
  "}"
]));
g.push(encadre([
  [{ t: "Pourquoi cette conception remplace la précédente", b: true }],
  ["La classe abstraite de G.10 imposait un champ Partie à chaque jeu, et sa méthode jouer() ne rendait rien. Un jeu devait donc modifier la Partie lui-même — il en savait trop."],
  ["Ici le jeu reçoit deux joueurs et rend un résultat. Il ne connaît plus la Partie du tout : c'est le hub qui fait le lien. Chacun retrouve une seule responsabilité."],
  ["Supprimez l'ancienne classe. Garder les deux ne ferait qu'entretenir la confusion."]
]));
g.push(bulletRuns([
  { t: "À se demander : ", b: true },
  "l'interface ne déclare aucun champ, là où la classe abstraite en imposait un. Qu'est-ce que cela change pour celui qui écrit un jeu ?"
]));

increment("G.15", "La fabrique");
g.push(runs([
  "Créez ",
  { t: "JeuFactory", code: true },
  ", avec une seule méthode :"
]));
g.push(...code(["Jeu creer(TypeJeu type)"]));
g.push(p("Elle rend l'implémentation correspondant au type demandé. Pour l'instant, aucun jeu n'existe : levez une exception explicite pour les types non implémentés."));
g.push(runs([
  { t: "L'intérêt tient en une phrase. ", b: true },
  "GameHub ne manipulera plus que des ",
  { t: "Jeu", code: true },
  ", et déléguera la construction. Vérifiez-le en relisant vos imports : aucune classe concrète de jeu ne doit apparaître dans GameHub."
]));
g.push(bulletRuns([
  { t: "À se demander : ", b: true },
  "cette fabrique est le seul endroit du programme qui connaisse toutes les classes de jeux. Est-ce un défaut ou une qualité ?"
]));

diagramme("g15.png", "En gris, la classe abstraite de G.10 que l'interface remplace. GameHub ne dépend plus que de Jeu et de la fabrique.");

increment("G.16", "Le matériel du Nim");
g.push(runs([
  "Écrivez ",
  { t: "Pile", code: true },
  " et ",
  { t: "ReglesNim", code: true },
  " dans ",
  { t: "be.ephec.gamehub.jeux.nim", code: true },
  "."
]));
g.push(tableau(["Classe", "Ce qu'elle porte"], [
  ["Pile", "un nombre d'allumettes, restantes(), estVide(), retirer(int)"],
  ["ReglesNim", "le maximum par tour, maximumRetirable(Pile), coupValide(Pile, int)"]
], [1800, 7560], [0]));
g.push(runs([
  { t: "La pile ne connaît aucune règle. ", b: true },
  "Elle ne sait pas combien on a le droit de retirer, ni qui gagne. Elle compte. Les règles vivent à côté, où elles peuvent changer sans qu'on touche à la pile."
]));
g.push(runs([
  { t: "La règle du jeu : ", b: true },
  "chacun retire une, deux ou trois allumettes à son tour. Celui qui retire la ",
  { t: "dernière", i: true },
  " a perdu."
]));
g.push(bulletRuns([
  { t: "À se demander : ", b: true },
  "que doit faire ",
  { t: "retirer(4)", code: true },
  " sur une pile qui n'en a que trois ? Descendre à −1, ou refuser ? Voir ",
  { t: "CC-ERR.1", code: true },
  "."
]));

increment("G.17", "Les stratégies");
g.push(p("Un joueur de Nim doit décider combien d'allumettes retirer. Cette décision est un comportement, et elle change d'un joueur à l'autre : c'est donc une interface."));
g.push(...code([
  "public interface StrategieNim {",
  "    int combienRetirer(Pile pile, ReglesNim regles);",
  "}"
]));
g.push(runs([
  "Écrivez-la, puis une première implémentation : ",
  { t: "StrategieTimide", code: true },
  ", qui retire toujours une allumette."
]));
g.push(runs([
  { t: "Pourquoi passer les règles en paramètre. ", b: true },
  "Une stratégie qui supposerait « le maximum est trois » cesserait de fonctionner à la première variante du jeu. Celle-ci demande."
]));
g.push(bulletRuns([
  { t: "À se demander : ", b: true },
  "combien de méthodes cette interface déclare-t-elle ? Quel nom porte ce genre d'interface, et que pourrez-vous en faire au thème ",
  { t: "LAM", code: true },
  " ?"
]));

increment("G.18", "Le jeu de Nim");
g.push(runs([
  "Écrivez ",
  { t: "JeuNim", code: true },
  ", qui implémente ",
  { t: "Jeu", code: true },
  ". Son constructeur reçoit le nombre d'allumettes initiales et les règles ; ses deux joueurs utilisent pour l'instant la stratégie timide."
]));
g.push(p("La méthode jouer fait tourner la partie : tant que la pile n'est pas vide, le joueur dont c'est le tour consulte sa stratégie, retire, et la main passe. Celui qui vide la pile a perdu."));
g.push(runs([
  { t: "Cette classe ne contient aucune règle de décision. ", b: true },
  "Elle ne sait pas combien retirer — elle demande à une stratégie. Elle ne sait pas ce qui est permis — elle demande aux règles. Elle orchestre, et c'est tout."
]));
g.push(bulletRuns([
  { t: "À se demander : ", b: true },
  "que se passe-t-il si une stratégie propose un coup interdit ? Votre jeu doit-il lui faire confiance ?"
]));
g.push(bulletRuns([
  "Branchez ",
  { t: "TypeJeu.NIM", code: true },
  " dans la fabrique, et lancez une partie depuis le hub. Deux joueurs timides : que se passe-t-il, et est-ce intéressant ?"
]));

increment("G.19", "Choisir sa stratégie");
g.push(p("Deux joueurs timides font une partie prévisible. Ajoutez deux stratégies, et de quoi les choisir."));
g.push(tableau(["Élément", "Ce qu'il fait"], [
  ["StrategieAleatoire", "retire un nombre au hasard, dans ce que les règles autorisent"],
  ["StrategieMaligne", "la stratégie gagnante — voir ci-dessous"],
  ["TypeStrategieNim", "l'énumération des stratégies proposables"],
  ["StrategieNimFactory", "StrategieNim creer(TypeStrategieNim)"]
], [2600, 6760], [0]));
g.push(encadre([
  [{ t: "La stratégie gagnante, si vous voulez la chercher vous-même", b: true }],
  ["Celui qui retire la dernière allumette perd. Il faut donc laisser exactement UNE allumette à l'adversaire."],
  ["Avec un maximum de trois par tour, l'adversaire peut toujours ramener un total de quatre à zéro : quoi qu'il retire, on complète à 4. Les positions perdantes sont donc celles où il reste 1, 5, 9, 13…"],
  ["Cherchez la formule avant de lire le corrigé. Elle tient en une ligne, et elle utilise un modulo."]
]));
g.push(bulletRuns([
  { t: "À se demander : ", b: true },
  "vous venez d'écrire une seconde fabrique. Quel est le rapport avec ",
  { t: "JeuFactory", code: true },
  ", et pourquoi le même motif revient-il un étage plus bas ?"
]));
g.push(bulletRuns([
  "Testez vos stratégies ",
  { t: "sans jouer de partie", b: true },
  ". Une stratégie est une fonction de la pile et des règles vers un nombre : rien n'est plus facile à vérifier en JUnit."
]));

increment("G.20", "Un jeu qui se configure");
g.push(runs([
  "Créez l'interface ",
  { t: "JeuConfigurable", code: true },
  ", qui déclare ",
  { t: "void configure(Scanner entree)", code: true },
  ". Faites-la implémenter par ",
  { t: "JeuNim", code: true },
  " : sa méthode demande à l'utilisateur la stratégie de chaque joueur, et appelle la fabrique."
]));
g.push(p("Modifiez enfin GameHub : après avoir obtenu un Jeu de la fabrique, il configure celui-ci s'il est configurable."));
g.push(...code([
  "if (jeu instanceof JeuConfigurable configurable) {",
  "    configurable.configure(clavier);",
  "}"
]));
g.push(encadre([
  [{ t: "Une interface qui ne sert qu'à marquer", b: true }],
  ["JeuConfigurable ne décrit pas ce qu'est un jeu : elle signale une capacité optionnelle. Tous les jeux n'ont pas de réglages, et les forcer à écrire une méthode configure() vide serait pire que de les laisser tranquilles."],
  ["C'est pour cela qu'on a créé une seconde interface plutôt que d'ajouter une méthode à Jeu. Une interface décrit ce qu'on peut faire avec un objet — pas ce qu'on aimerait qu'il sache faire."]
]));
g.push(h2("Où vous en êtes"));
g.push(p("Relisez GameHub. Il ne connaît aucune classe concrète de jeu, aucune stratégie, aucune règle. Il demande, configure, lance et affiche. Ajouter un jeu au catalogue demande désormais une valeur dans TypeJeu, une classe, et un cas dans la fabrique — et pas une ligne ici."));
g.push(p("C'est ce que les trois séances précédentes servaient à construire. Les incréments qui suivent vont s'appuyer dessus, puis le mettre en défaut."));
diagramme("g20.png", "Le jeu de Nim au complet. JeuNim ne connaît aucune stratégie concrète : il en reçoit deux, et les fait travailler.");
g.push(saut());

g.push(h1("Quatrième partie — le jeu de bataille"));
g.push(p("Ces sept incréments s'appuient sur tout ce qui précède : l'interface Jeu, la fabrique, et JeuNim comme modèle de jeu concret."));

increment("G.21", "Le deck en List");
g.push(runs([
  "Redéfinissez le Deck de cartes en utilisant une ",
  { t: "List", code: true },
  " au lieu d'un tableau. Le Deck a été défini en ",
  { t: "ENU.3", code: true },
  ". Trois choses changent : le champ ",
  { t: "cartes", code: true },
  ", le constructeur, et la méthode ",
  { t: "shuffle", code: true },
  " qui se réduit à ",
  { t: "Collections.shuffle(List)", code: true },
  "."
]));

increment("G.22", "La carte et sa valeur");
g.push(runs([
  "Renommez Card en Carte et ajoutez-lui ",
  { t: "getValeur", code: true },
  ". Créez l'énumération ",
  { t: "Valeur", code: true },
  " sur le modèle de ",
  { t: "Value", code: true },
  ", mais dans un ordre différent : la première est DEUX, la dernière AS."
]));
g.push(runs([
  { t: "Pourquoi cet ordre. ", b: true },
  "Il fait correspondre ",
  { t: "c1.getValeur().compareTo(c2.getValeur())", code: true },
  " aux règles de la bataille. L'ordre de déclaration d'une énumération porte une information — c'est déjà ce que montrait ",
  { t: "ENU.1", code: true },
  "."
]));

increment("G.23", "La version simplifiée");
g.push(runs([
  "Écrivez ",
  { t: "JeuBatailleV0", code: true },
  ", où les cartes sont jetées en cas de bataille. Un champ ",
  { t: "maxTours", code: true },
  " évite que la partie ne tourne indéfiniment, et ",
  { t: "getType", code: true },
  " rend ",
  { t: "TypeJeu.BATAILLE", code: true },
  "."
]));
g.push(p("Ajoutez deux méthodes privées pour la lisibilité :"));
g.push(tableau(["Méthode", "Ce qu'elle fait"], [
  ["comparer(Carte, Carte)", "compare les forces des deux cartes"],
  ["distribuer(Deck, Deque<Carte>, Deque<Carte>)", "distribue les cartes entre les deux mains"]
], [3600, 5760], [0]));

increment("G.24", "La méthode jouer, mise en place");
g.push(p("Attaquez ResultatPartie jouer(Joueur, Joueur), dans sa version sans bataille :"));
g.push(bullet("vérifiez d'abord que les deux Joueur ne sont pas null ;"));
g.push(bullet("construisez le Deck et mélangez-le ;"));
g.push(bulletRuns([
  "créez deux ",
  { t: "ArrayDeque", code: true },
  " pour les mains, et remplissez-les par distribuer ;"
]));
g.push(bulletRuns([
  "créez une ",
  { t: "ArrayList", code: true },
  " cimetiere pour les cartes retirées."
]));

increment("G.25", "La méthode jouer, la boucle");
g.push(p("Initialisez un compteur de tours. Tant qu'aucune pioche n'est vide et que le maximum n'est pas atteint :"));
g.push(bullet("incrémentez le tour ;"));
g.push(bulletRuns([
  "piochez la première carte de chaque joueur, par ",
  { t: "pollFirst()", code: true },
  " ;"
]));
g.push(bullet("comparez-les ;"));
g.push(bulletRuns([
  "ajoutez les deux cartes à la fin de la pioche du gagnant par ",
  { t: "addLast(...)", code: true },
  ", ou au cimetière en cas d'égalité."
]));

increment("G.26", "La méthode jouer, le résultat");
g.push(p("À la sortie de la boucle, déterminez le résultat :"));
g.push(tableau(["Situation", "Résultat"], [
  ["les deux pioches sont vides", "MATCH_NUL"],
  ["la pioche du joueur 1 est vide", "JOUEUR1_GAGNE"],
  ["la pioche du joueur 2 est vide", "JOUEUR2_GAGNE"],
  ["aucune n'est vide — on a atteint maxTours", "MATCH_NUL"]
], [5000, 4360], []));
g.push(bulletRuns([
  { t: "À se demander : ", b: true },
  "une pioche vide signifie que le joueur a tout perdu. Les deux lignes du milieu vous paraissent-elles cohérentes entre elles ?"
]));

increment("G.27", "La vraie bataille");
g.push(runs([
  "Pour ",
  { t: "JeuBatailleV1", code: true },
  ", les cartes déposées vont dans une ",
  { t: "List", code: true },
  " appelée ",
  { t: "pot", code: true },
  ". En cas d'égalité, appelez ",
  { t: "resoudreBataille(piocheJ1, piocheJ2, pot, joueur1, joueur2)", code: true },
  "."
]));
g.push(p("À vous de comprendre la logique de cette méthode, qui boucle pour prendre en compte le cas où deux cartes visibles successives sont encore égales."));
diagramme("g27.png", "JeuBatailleV1 hérite de V0 et ne redéfinit qu'une méthode : tout le reste est commun.");
g.push(saut());

// =====================================================================
//  Cinquieme partie — le jeu solitaire
//
//  Cette section avait disparu en meme temps que le demineur, sorti du
//  fil rouge vers son propre projet : les deux vivaient sous le meme
//  titre, et retirer l'un a emporte l'autre. Restauree le 09/10.
// =====================================================================
g.push(h1("Cinquième partie — quand l'abstraction ne suffit plus"));
g.push(p("L'incrément qui suit met en défaut l'abstraction construite depuis le début. Ce n'est pas un échec de conception : aucune abstraction ne prévoit tout, et le vrai savoir-faire n'est pas de deviner juste du premier coup — c'est de savoir quoi faire le jour où l'on s'est trompé."));

increment("G.28", "Un jeu qui se joue seul");
g.push(h2("La demande"));
g.push(p("On veut ajouter « Devine le nombre » au catalogue. L'ordinateur tire un entier entre 1 et 100, le joueur propose des valeurs, le programme répond « plus grand » ou « plus petit ». La partie se termine quand le nombre est trouvé, ou après dix essais. C'est un jeu simple, qui tient en trente lignes."));
g.push(h2("Le problème"));
g.push(tableau(["Ce que le contrat impose", "Ce que le jeu demande"], [
  ["jouer(Joueur j1, Joueur j2) — deux joueurs", "un seul joueur"],
  ["ResultatPartie : J1 gagne, J2 gagne, match nul", "gagné, ou perdu"]
], [4600, 4760], []));
g.push(runs([
  { t: "Ne codez rien tout de suite. ", b: true },
  "Cet incrément est d'abord une discussion. Prenez dix minutes pour peser les pistes, seul ou à deux, avant d'écrire une ligne."
]));
g.push(h2("Les pistes, et ce qu'elles coûtent"));
g.push(tableau(["Piste", "Ce qu'elle donne", "Ce qu'elle coûte"], [
  ["passer deux fois le même joueur, ignorer le second",
   "rien à changer nulle part",
   "la signature ment ; le prochain lecteur croira que le jeu oppose deux personnes"],
  ["ajouter GAGNE et PERDU à ResultatPartie",
   "le résultat devient honnête",
   "tous les jeux à deux devront ignorer deux valeurs qui ne les concernent pas"],
  ["créer une interface JeuSolo à côté de Jeu",
   "chaque contrat reste net",
   "GameHub devra distinguer les deux, avec un test de type"],
  ["élargir Jeu à une liste de joueurs",
   "un seul contrat couvre tous les cas",
   "toutes les classes existantes sont à modifier"]
], [2600, 3200, 3560], [0]));
g.push(h2("Ce qu'on vous demande"));
g.push(bullet("choisissez une piste, ou inventez-en une autre ;"));
g.push(bulletRuns([
  "écrivez ",
  { t: "JeuDevineLeNombre", code: true },
  " et faites-le apparaître dans le catalogue ;"
]));
g.push(bullet("faites en sorte que le hub le lance comme n'importe quel autre jeu ;"));
g.push(bullet("et surtout, écrivez en trois lignes de commentaire POURQUOI vous avez choisi cette piste-là."));
g.push(encadre([
  [{ t: "C'est la justification qui est évaluée", b: true }],
  ["Les quatre pistes fonctionnent. Aucune n'est la bonne réponse, et c'est volontaire : à l'examen, l'objectif C.1 demande de justifier vos choix de conception, pas de retrouver ceux du professeur."],
  ["Une justification convaincante nomme ce que la solution coûte, pas seulement ce qu'elle apporte."]
]));
g.push(h2("Questions à se poser"));
g.push(bulletRuns([
  "La première piste est la seule qui ne touche à rien. Pourquoi est-elle pourtant la plus dangereuse à long terme ? Voir ",
  { t: "CC-NOM.4", code: true },
  " sur les signatures qui mentent."
]));
g.push(bullet("Si vous choisissez JeuSolo, GameHub devra tester le type du jeu avant de l'exécuter. N'était-ce pas précisément ce que l'interface Jeu servait à éviter ?"));
g.push(bullet("Combien de jeux solitaires faudrait-il avant que votre choix devienne clairement le bon, ou clairement le mauvais ?"));
g.push(saut());

g.push(h1("Sixième partie — deux jeux de grille pour le prix d'un"));
g.push(p("Le catalogue annonce un morpion et un puissance 4 depuis l'incrément G.6. Ils n'ont jamais été écrits, et la fabrique lève une exception pour eux depuis quinze incréments. Il est temps."));
g.push(runs([
  "Ces deux jeux se ressemblent beaucoup : une grille rectangulaire, deux joueurs qui posent chacun leur tour, et une victoire par ",
  { t: "alignement", b: true },
  ". Ils diffèrent par la taille, par la longueur de l'alignement gagnant, et par une seule règle — au puissance 4, la marque tombe."
]));

increment("G.29", "Le morpion, et la grille qu'il partage");
g.push(p("Trois cases sur trois, trois marques alignées pour gagner, deux joueurs au clavier."));
g.push(h2("Quatre classes, dans deux packages"));
g.push(tableau(["Classe", "Package", "Ce qu'elle porte"], [
  ["Marque", "jeux.grille", "VIDE, JOUEUR1, JOUEUR2, et le symbole affiché"],
  ["GrilleAlignement", "jeux.grille", "abstraite : le tableau, l'alignement, l'affichage"],
  ["GrilleMorpion", "jeux.morpion", "3×3, et poser une marque sur une case libre"],
  ["JeuMorpion", "jeux.morpion", "la boucle de partie et le dialogue"]
], [2100, 2100, 5160], [0]));
g.push(h2("La décision qui compte"));
g.push(runs([
  { t: "Pourquoi une classe abstraite dès maintenant, ", b: true },
  "alors qu'un seul jeu s'en sert ? Parce que le second arrive à l'incrément suivant, et qu'il posera exactement la même question : des marques alignées, dans quatre directions."
]));
g.push(p("Ce n'est donc pas de l'anticipation en l'air. Le second cas est connu, et il est à la page suivante. Écrire la recherche d'alignement dans GrilleMorpion obligerait à la récrire, ou à la déplacer, dans vingt minutes."));
g.push(runs([
  { t: "Ce que la classe mère ne sait pas faire : ", b: true },
  "poser une marque. Le morpion la pose où l'on veut, le puissance 4 la laisse tomber. C'est la seule chose qui les distingue vraiment, et c'est donc la seule que chaque sous-classe écrit."
]));
g.push(h2("La recherche d'alignement"));
g.push(p("Pour chaque case occupée, on regarde si N marques identiques se suivent dans une direction. Quatre directions suffisent :"));
g.push(...code([
  "{1, 0}     horizontale",
  "{0, 1}     verticale",
  "{1, 1}     diagonale montante",
  "{1, -1}    diagonale descendante"
]));
g.push(runs([
  { t: "Pourquoi pas huit ? ", b: true },
  "Les quatre autres sont les mêmes parcourues à l'envers. Les vérifier reviendrait à compter deux fois le même alignement."
]));
g.push(h2("Deux conventions à fixer"));
g.push(bullet("La ligne 0 est en bas. Cela n'a aucune importance au morpion, et toute l'importance au puissance 4 : autant le décider maintenant."));
g.push(bulletRuns([
  "Un coup invalide rend ",
  { t: "false", code: true },
  ", il ne lève pas d'exception. Une case déjà prise est une erreur de l'utilisateur, pas un défaut du programme — voir ",
  { t: "CC-ERR.2", code: true },
  "."
]));
g.push(h2("Vérification"));
g.push(p("Trois alignés sur la ligne du bas, sur une colonne, sur chaque diagonale : quatre parties à gagner. Puis une grille pleine sans alignement, qui doit rendre un match nul."));

increment("G.30", "Le puissance 4, presque gratuit");
g.push(p("Sept colonnes, six lignes, quatre marques alignées. Deux classes, et c'est tout."));
g.push(h2("Ce que vous avez à écrire"));
g.push(runs([
  { t: "Une seule méthode, en vérité : ", b: true },
  "celle qui laisse tomber une marque dans une colonne. On cherche la première case libre en partant du bas — c'est la gravité, et c'est tout le jeu."
]));
g.push(p("Le reste de GrillePuissance4 tient dans son constructeur : sept, six, quatre."));
g.push(h2("Comptez les lignes que vous n'écrivez pas"));
g.push(tableau(["Ce dont le jeu a besoin", "D'où cela vient"], [
  ["le tableau des cases", "GrilleAlignement"],
  ["la recherche d'alignement", "GrilleAlignement"],
  ["le test de grille pleine", "GrilleAlignement"],
  ["l'affichage", "GrilleAlignement"],
  ["la gravité", "vous, en huit lignes"]
], [4200, 5160], [0]));
g.push(runs([
  "Tout cela a été écrit une fois, à l'incrément précédent, pour un jeu qui n'avait ",
  { t: "ni la même taille, ni la même règle de victoire, ni la même façon de poser une marque", i: true },
  "."
]));
g.push(h2("Une question, et une réponse qui n'est pas celle qu'on attend"));
g.push(runs([
  "La boucle de partie de ",
  { t: "JeuPuissance4", code: true },
  " ressemble beaucoup à celle de ",
  { t: "JeuMorpion", code: true },
  ". Faut-il l'extraire à son tour, dans une classe mère commune ?"
]));
g.push(runs([
  { t: "Non, ", b: true },
  "et il faut savoir argumenter pourquoi. Les deux boucles se ressemblent, mais elles ne demandent pas la même chose à l'utilisateur — deux nombres ici, un seul là. Une classe mère commune devrait prévoir les deux cas, donc déclarer une méthode abstraite « demander un coup », donc ajouter une abstraction pour économiser une quinzaine de lignes."
]));
g.push(runs([
  "La duplication de la ",
  { t: "grille", b: true },
  " valait d'être supprimée : une centaine de lignes, et un algorithme où l'on se trompe. Celle-ci ne le vaut pas. Voir ",
  { t: "CC-CLS.3", code: true },
  " — la règle dit de ne pas se répéter, elle ne dit pas de tout factoriser."
]));
g.push(h2("Vérification"));
g.push(bullet("Une marque lâchée dans une colonne vide se pose en bas ; la suivante juste au-dessus."));
g.push(bullet("Quatre alignées horizontalement, verticalement et en diagonale font gagner ; trois ne font rien."));
g.push(bullet("Une colonne pleine refuse un jeton de plus, sans planter."));
g.push(h2("Et la fabrique"));
g.push(runs([
  "Ajoutez les deux cas. Le ",
  { t: "default", code: true },
  " qui levait une exception n'a plus rien à absorber : toutes les valeurs de TypeJeu ont maintenant leur jeu. Laissez-le — il coûte une ligne, et il protège le jour où une valeur s'ajoutera."
]));

diagramme("g30.png", "Deux jeux, deux grilles, un seul algorithme d'alignement. Les deux traits pleins vont chacun vers la classe mère, pas l'un vers l'autre.");


// =====================================================================
g.push(saut());
g.push(h1("Septième partie — des paires qui ont un sens, une fabrique sans switch"));
g.push(p("Deux incréments courts, qui ne font apparaître aucun jeu. Ils reprennent du code écrit depuis longtemps avec deux outils neufs : la généricité, puis les lambdas."));

increment("G.31", "Un objet par joueur");
g.push(h2("Ce qui se répète"));
g.push(runs([
  "Relisez ", { t: "JeuNim", code: true }, ". Il garde deux champs jumeaux, ",
  { t: "strategieJoueur1", code: true }, " et ", { t: "strategieJoueur2", code: true },
  ", et choisit le bon par un opérateur ternaire. Quelques lignes plus bas, le même ternaire choisit le joueur. La bataille fait pareil avec ses deux pioches."
]));
g.push(h2("Ce qu'on vous demande"));
g.push(runs([
  "Écrivez dans ", { t: "modele", code: true }, " une classe générique ",
  { t: "ParJoueur<T>", code: true }, ", immuable, qui garde une chose pour chaque joueur."
]));
g.push(tableau(["Membre", "Ce qu'il fait"], [
  ["ParJoueur(T duPremier, T duSecond)", "reçoit les deux éléments"],
  ["duPremier(), duSecond()", "rendent chacun le sien"],
  ["selon(boolean auTourDuPremier)", "rend celui du joueur dont c'est le tour"]
], [4200, 5160], [0]));
g.push(runs([
  "Introduisez-la ensuite dans ", { t: "JeuNim", code: true },
  " : un champ ", { t: "ParJoueur<StrategieNim>", code: true },
  " remplace les deux stratégies, et une variable ", { t: "ParJoueur<Joueur>", code: true },
  " remplace le choix du joueur dans ", { t: "jouer", code: true },
  ". Les deux ternaires disparaissent."
]));
g.push(h2("Vérification"));
g.push(p("Le Nim se joue exactement comme avant : mêmes stratégies, mêmes coups, mêmes résultats. Un incrément qui ne change pas le comportement se vérifie en comparant deux parties."));
g.push(h2("Questions à se poser"));
g.push(bulletRuns([
  "Une ", { t: "Paire<T>", code: true },
  " stockerait exactement la même chose. Que dit ", { t: "ParJoueur", code: true },
  " de plus ? Voir ", { t: "CC-NOM.1", code: true }, "."
]));
g.push(bullet("La même classe sert pour des stratégies et pour des joueurs, sans un seul transtypage. Combien de classes aurait-il fallu sans la généricité ?"));
g.push(bullet("La bataille passe ses deux pioches en paramètres jumeaux à plusieurs méthodes. Faut-il y introduire ParJoueur aussi ? Dites ce que cela coûterait, et ce que cela rapporterait, avant de décider."));

increment("G.32", "Une fabrique sans switch");
g.push(h2("Ce qui se répète"));
g.push(runs([
  "Le ", { t: "switch", code: true }, " de ", { t: "JeuFactory", code: true },
  " associe chaque type de jeu à la façon d'en fabriquer un. Ajouter un jeu, c'est ajouter un cas, et un cas n'est rien d'autre qu'une association : ce type, ce constructeur."
]));
g.push(h2("Ce qu'on vous demande"));
g.push(runs([
  "Rangez ces associations dans une ", { t: "Map<TypeJeu, Supplier<Jeu>>", code: true },
  ", un champ constant construit par ", { t: "Map.of", code: true },
  ". La méthode ", { t: "creer", code: true },
  " ne fait plus que chercher la fabrication du type demandé et l'exécuter. Si elle n'en trouve pas, elle lève la même exception qu'avant."
]));
g.push(...code([
  "TypeJeu.MORPION, JeuMorpion::new,",
  "TypeJeu.NIM, () -> new JeuNim(ALLUMETTES_NIM, new ReglesNim()),"
]));
g.push(runs([
  "Une référence de constructeur suffit pour un jeu sans paramètre ; le Nim, qui en a deux, demande une lambda. Les deux sont des ",
  { t: "Supplier<Jeu>", code: true }, "."
]));
g.push(h2("Vérification"));
g.push(p("Chaque jeu du menu se lance comme avant. Lancez-en au moins deux, dont le Nim."));
g.push(h2("Questions à se poser"));
g.push(bullet("Pourquoi ranger la façon de fabriquer un jeu, et pas le jeu lui-même ? Pensez à ce qui arriverait à la deuxième partie de Nim, une fois le premier jeu configuré."));
g.push(bulletRuns([
  "Le ", { t: "default", code: true },
  " du switch protégeait contre une valeur sans jeu. Qu'est-ce qui la protège maintenant ?"
]));
g.push(bulletRuns([
  "La question de ", { t: "G.17", code: true },
  " vous promettait le thème LAM : ", { t: "StrategieNim", code: true },
  " est une interface fonctionnelle. Écrivez ", { t: "StrategieTimide", code: true },
  " en une lambda. Où pourrait-elle vivre, maintenant que vous savez ranger des comportements dans une Map ?"
]));

// =====================================================================
g.push(saut());
g.push(h1("Huitième partie — une fenêtre"));
g.push(runs([
  "GameHub est une application console. Ouvrir une fenêtre depuis son menu obligerait à démarrer JavaFX à la main, sur un autre fil d'exécution : trois notions hors programme pour un seul jeu. La fenêtre est donc une ",
  { t: "deuxième porte d'entrée", b: true },
  ", une application à part qu'on lance directement, dans un package ",
  { t: "be.ephec.gamehub.fenetre", code: true }, ". Le hub console ne change pas."
]));
g.push(runs([
  "Comme dans les exercices du thème FX, la classe à lancer n'est pas celle qui hérite d'",
  { t: "Application", code: true }, ", mais son lanceur, qui vous est donné. Voir ",
  { t: "TEC-FX.4", code: true }, "."
]));
g.push(...code([
  "public class LanceurFenetreNim {",
  "    public static void main(String[] args) {",
  "        Application.launch(FenetreNim.class, args);",
  "    }",
  "}"
]));

increment("G.33", "Le Nim dans une fenêtre");
g.push(p("Une partie contre la machine. Vous commencez, à quatorze allumettes ; la machine joue la stratégie maligne. Celui qui prend la dernière a perdu."));
g.push(tableau(["Élément", "Rôle"], [
  ["un Label", "le nombre d'allumettes restantes"],
  ["trois Button « Prendre 1 » à « Prendre 3 »", "votre coup ; un par retrait permis par les règles"],
  ["les touches 1, 2 et 3", "la même chose, au clavier"],
  ["un second Label", "le coup de la machine, puis le résultat"]
], [4200, 5160], [0]));
g.push(h2("La contrainte qui compte"));
g.push(runs([
  { t: "Aucune classe du Nim ne change. ", b: true },
  "Pile, ReglesNim et les stratégies sont reprises telles quelles : elles ne savaient rien de la console, elles ne savent rien de la fenêtre."
]));
g.push(runs([
  "En revanche, ", { t: "JeuNim", code: true },
  " ne vous servira pas. Sa méthode ", { t: "jouer", code: true },
  " est une boucle qui va jusqu'au bout de la partie sans jamais s'arrêter. Une fenêtre ne peut pas l'attendre : elle doit jouer un tour à chaque clic, puis rendre la main."
]));
g.push(h2("Deux conseils"));
g.push(runs([
  "Un clic du joueur fait tout un tour : son coup, puis, si la partie continue, celui de la machine. Écrivez-le dans une méthode, et faites-la appeler par les boutons ",
  { t: "et", i: true }, " par le gestionnaire de clavier."
]));
g.push(runs([
  "Comme ", { t: "JeuNim", code: true },
  ", ne faites pas confiance à la stratégie de la machine : vérifiez son coup auprès des règles. Et prévoyez un seul endroit, une méthode, où l'écran apprend que la pile a changé. L'incrément suivant en aura besoin."
]));
g.push(h2("Ce que vous devez observer"));
g.push(bullet("la fenêtre s'ouvre sur « 14 allumettes » ;"));
g.push(bullet("chaque clic ou chaque touche retire vos allumettes, puis la machine joue et annonce son coup ;"));
g.push(bullet("un coup impossible, trois allumettes quand il en reste deux, est refusé avec un message, sans planter ;"));
g.push(bullet("la partie annonce qui a perdu, et en jouant juste vous pouvez gagner."));
g.push(h2("Questions à se poser"));
g.push(bullet("La boucle while de JeuNim n'apparaît nulle part dans votre code. Où est-elle passée ?"));
g.push(bullet("Pourquoi les stratégies se réutilisent-elles sans une ligne changée, alors que JeuNim ne se réutilise pas du tout ?"));
g.push(bullet("Les boutons qui prendraient plus d'allumettes qu'il n'en reste devraient être grisés. Où écririez-vous cette règle, et combien de fois ?"));

increment("G.34", "Des boutons qui savent quand se taire");
g.push(p("La réponse à la dernière question : une fois par bouton, et dans aucun gestionnaire."));
g.push(h2("Ce qu'on vous demande"));
g.push(runs([
  "Ajoutez à la fenêtre une ", { t: "IntegerProperty", code: true },
  " qui suit le nombre d'allumettes restantes. La méthode où l'écran apprenait que la pile avait changé ne met plus à jour le libellé : elle met à jour la propriété."
]));
g.push(runs([
  "Puis liez. Le texte du libellé, par ", { t: "asString", code: true },
  ". Et la désactivation de chaque bouton, par une seule instruction : celui qui prend ",
  { t: "n", i: true }, " allumettes est grisé quand il en reste moins de ", { t: "n", i: true }, "."
]));
g.push(...code([
  "bouton.disableProperty().bind(restantes.lessThan(nombre));"
]));
g.push(h2("Ce que vous devez observer"));
g.push(bullet("le libellé affiche le bon nombre dès l'ouverture, sans ligne pour l'initialiser ;"));
g.push(bullet("à deux allumettes restantes, « Prendre 3 » est grisé ; à une, « Prendre 2 » aussi ;"));
g.push(bullet("à la fin de la partie, les trois boutons sont grisés ;"));
g.push(bullet("la machine et vous jouez exactement comme à l'incrément précédent."));
g.push(h2("Questions à se poser"));
g.push(bullet("Pourquoi tous les boutons sont-ils grisés à la fin, alors que vous n'avez écrit aucune condition « partie finie » ?"));
g.push(bullet("La propriété vit dans la fenêtre, pas dans Pile. Qu'aurait-on gagné, et perdu, à la mettre dans Pile ?"));
g.push(bullet("Les touches 1, 2 et 3 ignorent les boutons grisés. Votre programme reste-t-il juste ? Qu'est-ce qui le protège ?"));


// =====================================================================
g.push(saut());
g.push(h1("Neuvième partie — une mémoire"));

increment("G.35", "Un journal qui survit");
g.push(h2("Ce qui manque"));
g.push(runs([
  "Depuis ", { t: "G.13", code: true },
  ", GameHub a un journal. Mais il ne garde rien : il compte les coups d'une partie et les annonce sur la console. Et le hub ne joue qu'une partie par lancement. Quand le programme s'arrête, tout ce qu'il savait disparaît."
]));
g.push(h2("Ce qu'on vous demande"));
g.push(runs([
  "Faites écrire au journal chaque partie terminée, sur une ligne, à la fin d'un fichier texte, ",
  { t: "parties.txt", code: true },
  ". Puis, au lancement suivant, faites relire ce fichier par GameHub, qui affiche les parties précédentes avant de proposer la suivante."
]));
g.push(tableau(["Dans JournalParties", "Ce qu'il fait"], [
  ["un champ, le nom du fichier", "« parties.txt » par défaut ; un second constructeur en accepte un autre"],
  ["onFin", "ajoute la ligne de la partie terminée, à la fin du fichier"],
  ["historique()", "relit le fichier et rend la liste des ResumePartie qu'il contient"]
], [3200, 6160], [0]));
g.push(h2("Le format, à décider avant d'écrire"));
g.push(runs([
  "Une ligne par partie, quatre champs séparés par un point-virgule : le type, le gagnant, le début, la fin. Écrivez le type par son ",
  { t: "nom de constante", b: true }, ", ", { t: "NIM", code: true },
  ", et non par son libellé : c'est le nom que ", { t: "valueOf", code: true },
  " sait relire. Les dates s'écrivent et se relisent telles quelles, par ",
  { t: "toString", code: true }, " et ", { t: "LocalDateTime.parse", code: true }, "."
]));
g.push(...code([
  "NIM;alice;2026-10-11T14:02:17.512;2026-10-11T14:03:40.088"
]));
g.push(h2("Deux règles"));
g.push(runs([
  "Ouvrez le fichier en ", { t: "ajout", b: true },
  " : chaque partie s'ajoute aux précédentes, elle ne les remplace pas. Et fermez-le quoi qu'il arrive, par un ",
  { t: "try", code: true }, " avec ressources."
]));
g.push(runs([
  "Une erreur d'écriture ne doit pas faire perdre la partie qu'on vient de jouer : signalez-la, et laissez le hub continuer. Au tout premier lancement, le fichier n'existe pas encore, et l'historique est simplement vide. Voir ",
  { t: "CC-ERR.2", code: true }, "."
]));
g.push(h2("Vérification"));
g.push(bullet("au premier lancement, GameHub annonce qu'aucune partie n'a été jouée ;"));
g.push(bullet("après deux parties, deux lancements, le troisième les affiche toutes les deux, dans l'ordre ;"));
g.push(bullet("le fichier parties.txt s'ouvre dans un éditeur de texte, et se lit sans le programme."));
g.push(h2("Questions à se poser"));
g.push(bullet("Que se passe-t-il si un joueur choisit un pseudo qui contient un point-virgule ? Comment s'en protéger ?"));
g.push(bullet("Une ligne abîmée, coupée en plein milieu ou modifiée à la main, fait-elle échouer tout l'historique ? Faut-il l'ignorer, ou s'arrêter ?"));
g.push(bullet("Le thème FIC montre aussi les flux d'objets. Auriez-vous pu écrire la liste des résumés d'un coup ? Qu'auriez-vous perdu ?"));

g.push(saut());
g.push(h1("La vue d'ensemble"));
g.push(p("Au terme du fil rouge, huit packages. Les flèches se lisent « dépend de » : remarquez qu'aucune ne remonte vers le hub, et qu'aucun package de jeu n'en connaît un autre."));
diagramme("ensemble.png", "Ajouter un jeu, c'est ajouter un package et un cas dans la fabrique. Rien d'autre.");
g.push(p("C'est le résultat de trente-cinq incréments, et la seule chose qu'il faut en retenir : une dépendance qu'on n'a pas créée est une dépendance qu'on n'aura pas à défaire."));

Packer.toBuffer(doc(g, "Fil rouge GameHub")).then(b => {
  fs.writeFileSync(__dirname + "/../_documents/GameHub_enonces.docx", b);
  console.log("GameHub :", Math.round(b.length / 1024), "Ko");
});
