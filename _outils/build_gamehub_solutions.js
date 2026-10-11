const fs = require("fs");
const B = require(__dirname + "/boite.js");
const {
  p, runs, bullet, bulletRuns, code, h1, h2, tableau, encadre,
  saut, doc, Packer, GREY, AlignmentType, Paragraph, TextRun
} = B;
const { ImageRun } = require("docx");

const RACINE = `${__dirname}/../src/main/java/be/ephec/gamehub`;
const TESTS = `${__dirname}/../src/test/java/be/ephec/gamehub`;
const ACCENT = "1F4E79";
const s = [];

/**
 * Lit une classe du corrigé et en rend les lignes, débarrassées de la
 * Javadoc de tête et des blocs d'explication — ceux-ci sont repris en
 * prose dans le document, et les répéter doublerait sa longueur.
 *
 * Les commentaires d'une seule ligne sont conservés : ce sont eux qui
 * expliquent le code à l'endroit où il se lit.
 */
function source(chemin, options = {}) {
  const brut = fs.readFileSync(chemin, "utf8").split("\n");
  const lignes = [];
  let dansBloc = false;

  for (const ligne of brut) {
    const nette = ligne.trimStart();

    if (dansBloc) {
      if (nette.includes("*/")) dansBloc = false;
      continue;
    }
    if (nette.startsWith("/*")) {
      if (!nette.includes("*/")) dansBloc = true;
      continue;
    }
    if (options.sansEntete && (nette.startsWith("package ") || nette.startsWith("import "))) {
      continue;
    }
    lignes.push(ligne.replace(/\s+$/, ""));
  }

  // On comprime les lignes vides consécutives laissées par les blocs retirés.
  const compact = [];
  for (const ligne of lignes) {
    if (ligne === "" && compact[compact.length - 1] === "") continue;
    compact.push(ligne);
  }
  while (compact.length && compact[0] === "") compact.shift();
  while (compact.length && compact[compact.length - 1] === "") compact.pop();
  return compact;
}

/** Une classe entière, avec son chemin en légende. */
function classe(chemin, options = {}) {
  s.push(new Paragraph({
    spacing: { before: 160, after: 40 },
    children: [new TextRun({
      text: chemin.replace(RACINE + "/", "").replace(TESTS + "/", "test • "),
      size: 17, font: "Consolas", color: GREY
    })]
  }));
  s.push(...code(source(chemin, { sansEntete: true, ...options })));
}

function increment(codeEx, titre) {
  s.push(new Paragraph({
    spacing: { before: 320, after: 140 }, keepNext: true,
    children: [
      new TextRun({ text: codeEx + "  ", bold: true, size: 28, color: "7B9E4B" }),
      new TextRun({ text: titre, bold: true, size: 28, color: ACCENT })
    ]
  }));
}

function diagramme(fichier, legende) {
  const chemin = `${__dirname}/../_diagrammes/${fichier}`;
  const taille = require("child_process")
    .execSync(`python3 -c "from PIL import Image; im=Image.open('${chemin}'); print(im.size[0], im.size[1])"`)
    .toString().trim().split(" ").map(Number);
  const largeur = Math.min(600, taille[0] / 2.2);
  s.push(new Paragraph({
    spacing: { before: 180, after: 50 }, alignment: AlignmentType.CENTER,
    children: [new ImageRun({
      data: fs.readFileSync(chemin),
      transformation: { width: Math.round(largeur), height: Math.round(largeur * taille[1] / taille[0]) }
    })]
  }));
  s.push(new Paragraph({
    spacing: { after: 180 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: legende, size: 17, italics: true, color: GREY })]
  }));
}

// =====================================================================
s.push(new Paragraph({
  spacing: { before: 1100, after: 120 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Fil rouge — corrigé", size: 26, color: GREY })]
}));
s.push(new Paragraph({
  spacing: { after: 160 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "GameHub", bold: true, size: 54, color: ACCENT })]
}));
s.push(new Paragraph({
  spacing: { after: 700 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Les vingt-neuf incréments, et les raisons de chaque choix",
                           size: 26, color: GREY })]
}));
s.push(p("EPHEC — Bachelier en informatique, niveau 2", { align: AlignmentType.CENTER, color: GREY }));
s.push(saut());

s.push(h1("Comment lire ce corrigé"));
s.push(p("Le code reproduit ici est celui du module solutions, sous be.ephec.gamehub. Il en est extrait automatiquement : les deux ne peuvent pas diverger."));
s.push(runs([
  "Les longues explications qui figurent en Javadoc dans les fichiers sont ",
  { t: "reprises en prose", b: true },
  " dans ce document plutôt que recopiées, pour qu'il reste lisible. Les commentaires d'une seule ligne, eux, sont conservés : ce sont ceux qui expliquent une ligne à l'endroit où elle se lit."
]));
s.push(h2("Ce que ce corrigé n'est pas"));
s.push(p("Une solution de référence, pas LA solution. Plusieurs incréments — et les deux derniers surtout — posent des questions de conception qui admettent plusieurs réponses défendables. Ce qui compte alors n'est pas de retrouver celle-ci, mais de savoir dire ce que la sienne coûte."));
s.push(h2("Trois écarts assumés avec les énoncés"));
s.push(tableau(["Incrément", "L'écart, et pourquoi"], [
  ["G.10", "la classe abstraite Jeu n'est pas écrite : elle serait remplacée quatre incréments plus loin par une interface de même nom et de signature incompatible"],
  ["G.12", "l'appel à notifierDebut depuis le constructeur ne prévient personne, les observateurs s'ajoutant après ; le code suit l'énoncé, le commentaire explique"],
  ["G.26", "l'énoncé rend JOUEUR1_GAGNE quand la pioche du joueur 1 est vide ; c'est l'inverse de la règle, et le corrigé applique la règle"]
], [1600, 7760], [0]));
s.push(saut());

// =====================================================================
s.push(h1("Première partie — le modèle"));

increment("G.1", "Le joueur");
s.push(runs([
  "Les deux champs sont ",
  { t: "final", code: true },
  " : l'énoncé demande des données immuables, et le mot-clé le fait respecter par le compilateur plutôt que par la discipline."
]));
s.push(p("Le format du toString est celui des adresses de courrier. Il est réutilisé tel quel par Partie, qui se contente de concaténer des Joueur : c'est l'appel à toString qui fait le travail, sans qu'on l'écrive."));
classe(`${RACINE}/modele/Joueur.java`);

increment("G.6", "Les deux énumérations");
s.push(p("Le champ nom sépare le libellé destiné à l'utilisateur du nom de la constante. NIM se lit bien dans un menu, PUISSANCE4 beaucoup moins."));
s.push(runs([
  "BATAILLE a été ajoutée en ",
  { t: "G.21", code: true },
  ", DEVINE_LE_NOMBRE et DEMINEUR aux deux derniers incréments. Chacun de ces ajouts n'a coûté qu'une ligne, parce que le menu se construit à partir de ",
  { t: "values()", code: true },
  "."
]));
classe(`${RACINE}/modele/TypeJeu.java`);
s.push(runs([
  "ResultatPartie compte trois valeurs, et pas une de plus : c'est exactement ce qu'un jeu à deux joueurs peut produire. C'est aussi le point de friction de ",
  { t: "G.28", code: true },
  ", où un jeu solitaire n'a aucune des trois à proposer."
]));
classe(`${RACINE}/modele/ResultatPartie.java`);

increment("G.8", "Le résumé");
s.push(runs([
  "Réponse à la question de l'énoncé : ce record se crée dans ",
  { t: "Partie.terminer", code: true },
  ", parce que c'est le seul moment où toutes ses données existent en même temps — le résultat vient d'arriver, la date de fin aussi."
]));
s.push(runs([
  "Un record convient pour la même raison qu'en ",
  { t: "ENU.4", code: true },
  " : c'est un instantané, figé, qu'on transporte et qu'on affiche. Il n'a aucun comportement."
]));
classe(`${RACINE}/modele/ResumePartie.java`);

increment("G.2, G.4, G.7, G.12", "La partie");
s.push(p("Cette classe a grandi par couches, et chaque couche a son incrément : les deux joueurs et le toString, puis les dates, puis le type et le résultat, puis les observateurs."));
s.push(runs([
  { t: "La date de début est prise dans le constructeur. ", b: true },
  "Une partie commence donc au moment où l'objet existe : il n'y a aucun instant où une Partie serait sans date de début."
]));
s.push(runs([
  { t: "Les méthodes de notification sont privées. ", b: true },
  "Personne d'autre que la partie n'a le droit de déclarer qu'un coup a été joué — d'où la méthode publique ",
  { t: "coupJoue()", code: true },
  ", seul point d'entrée offert au jeu."
]));
s.push(encadre([
  [{ t: "L'écart avec l'énoncé G.12", b: true }],
  ["L'énoncé demande d'appeler notifierDebut dans le constructeur. Or les observateurs s'ajoutent APRÈS la construction : au moment où notifierDebut s'exécute, la liste est vide et personne n'est prévenu."],
  ["Le code suit l'énoncé à la lettre, et l'appel est donc sans effet. Trois façons de le corriger, selon ce qu'on préfère : passer les observateurs au constructeur, prévenir un observateur au moment où il s'abonne, ou déplacer le début dans une méthode demarrer() appelée par le jeu."],
  ["C'est le genre de décalage qu'on ne voit qu'en exécutant."]
]));
classe(`${RACINE}/modele/Partie.java`);
diagramme("g09.png", "L'état du modèle à la fin de la première partie.");
s.push(saut());

// =====================================================================
s.push(h1("Deuxième partie — l'observation"));

increment("G.11, G.13", "L'interface et son implémentation");
s.push(p("Trois moments dans la vie d'une partie, trois méthodes. La partie ne saura jamais qui l'observe ni ce qu'il en fait."));
s.push(runs([
  { t: "Une remarque sur le nom. ", b: true },
  "L'énoncé G.11 appelle cette interface ObservateurPartie, mais G.12 écrit ",
  { t: "List<Observateur>", code: true },
  ". Les deux désignent la même chose ; le corrigé garde le premier, qui dit ce qu'on observe."
]));
classe(`${RACINE}/observateurs/ObservateurPartie.java`);
s.push(runs([
  "Le compteur de coups est un état propre à l'observateur. Il montre qu'un observateur peut avoir sa propre mémoire, ce qu'un simple affichage ne laisserait pas deviner."
]));
classe(`${RACINE}/observateurs/JournalParties.java`);
s.push(bulletRuns([
  { t: "Réponse à la question de l'énoncé : ", b: true },
  "écrire dans un fichier au lieu de la console demanderait une nouvelle classe implémentant la même interface, et ",
  { t: "zéro", b: true },
  " ligne de Partie."
]));
s.push(saut());

// =====================================================================
s.push(h1("Troisième partie — découpler les jeux du hub"));
diagramme("g15.png", "L'interface remplace la classe abstraite de G.10, montrée ici en gris.");

increment("G.14, G.15", "L'interface Jeu et la fabrique");
s.push(runs([
  { t: "Pourquoi cette conception remplace celle de G.10. ", b: true },
  "La classe abstraite imposait un champ Partie à chaque jeu, et sa méthode ",
  { t: "jouer()", code: true },
  " ne rendait rien : un jeu devait donc modifier la Partie lui-même, et il en savait trop. Ici le jeu reçoit deux joueurs et rend un résultat ; c'est le hub qui fait le lien."
]));
classe(`${RACINE}/jeux/Jeu.java`);
s.push(runs([
  "La fabrique est le ",
  { t: "seul", b: true },
  " endroit du programme qui connaisse toutes les classes de jeux. Ajouter un jeu, c'est ajouter une valeur à TypeJeu et un cas ici — et rien dans GameHub."
]));
classe(`${RACINE}/jeux/JeuFactory.java`);

increment("G.16", "Le matériel du Nim");
s.push(runs([
  { t: "La pile ne connaît aucune règle. ", b: true },
  "Elle ne sait pas combien on a le droit de retirer, ni qui gagne. Elle compte. Les règles vivent à côté, où elles peuvent changer sans qu'on touche à la pile — et où elles se testent sans qu'aucune partie ne se joue."
]));
s.push(runs([
  { t: "Réponse à la question de l'énoncé : ", b: true },
  "la pile refuse un retrait impossible plutôt que de descendre sous zéro. Une pile à −2 allumettes n'existe pas, et laisser l'objet dans cet état repousserait le problème jusqu'à un endroit où plus personne ne saurait d'où il vient. Voir ",
  { t: "CC-ERR.1", code: true },
  "."
]));
classe(`${RACINE}/jeux/nim/Pile.java`);
classe(`${RACINE}/jeux/nim/ReglesNim.java`);

increment("G.17", "Les stratégies");
s.push(runs([
  { t: "Une seule méthode abstraite : ", b: true },
  "c'est une interface fonctionnelle, et elle pourrait donc s'implémenter par une lambda. C'est la réponse à la question de l'énoncé, et le lien avec le thème ",
  { t: "LAM", code: true },
  "."
]));
s.push(p("Elle reçoit les règles en plus de la pile. Une stratégie qui supposerait « le maximum est trois » cesserait de fonctionner à la première variante ; celle-ci demande."));
classe(`${RACINE}/jeux/nim/StrategieNim.java`);
classe(`${RACINE}/jeux/nim/StrategieTimide.java`);

increment("G.18", "Le jeu de Nim");
s.push(runs([
  { t: "Cette classe ne contient aucune règle de décision. ", b: true },
  "Elle ne sait pas combien retirer — elle demande à une stratégie. Elle ne sait pas ce qui est permis — elle demande aux règles. Elle orchestre."
]));
s.push(runs([
  { t: "Réponse à la question de l'énoncé : ", b: true },
  "non, le jeu ne fait pas confiance aux stratégies. La méthode ",
  { t: "coupValide", code: true },
  " vérifie ce qu'elles proposent et ramène dans les clous. C'est une frontière : à l'intérieur du jeu on se fie à son propre code, mais une stratégie peut venir de n'importe où — y compris d'un étudiant qui en écrit une quatrième."
]));
classe(`${RACINE}/jeux/nim/JeuNim.java`);

increment("G.19", "Les autres stratégies");
s.push(encadre([
  [{ t: "La stratégie gagnante, et pourquoi elle marche", b: true }],
  ["Celui qui retire la dernière allumette perd : il faut donc laisser exactement UNE allumette à l'adversaire."],
  ["Avec un maximum de trois par tour, l'adversaire peut toujours ramener un total de quatre à zéro — quoi qu'il retire, on complète à 4. Les positions perdantes sont donc celles où il reste 1, 5, 9, 13… c'est-à-dire un multiple de (max + 1) plus un."],
  ["D'où retirer = (restantes − 1) % (maximum + 1), et une allumette quand ce reste vaut zéro, parce qu'on est alors soi-même en position perdante."],
  ["Vérifié sur 1200 parties simulées : depuis une position gagnante, cette stratégie ne perd jamais contre un joueur aléatoire."]
]));
classe(`${RACINE}/jeux/nim/StrategieMaligne.java`);
classe(`${RACINE}/jeux/nim/StrategieAleatoire.java`);
s.push(runs([
  { t: "Réponse à la question de l'énoncé : ", b: true },
  "cette seconde fabrique joue le même rôle que JeuFactory, un étage plus bas. JeuNim ne connaît donc aucune classe de stratégie concrète, exactement comme GameHub ne connaît aucune classe de jeu. Le motif se répète, et c'est volontaire."
]));
classe(`${RACINE}/jeux/nim/TypeStrategieNim.java`);
classe(`${RACINE}/jeux/nim/StrategieNimFactory.java`);

increment("G.20", "Un jeu qui se configure et un hub découplé");
s.push(runs([
  "JeuConfigurable ne décrit pas ce qu'est un jeu : elle signale une ",
  { t: "capacité optionnelle", b: true },
  ". Tous les jeux n'ont pas de réglages, et les forcer à écrire un configure() vide serait pire que de les laisser tranquilles."
]));
classe(`${RACINE}/jeux/JeuConfigurable.java`);
s.push(runs([
  { t: "Relisez GameHub. ", b: true },
  "Il ne connaît aucune classe concrète de jeu, aucune stratégie, aucune règle. Il demande, configure, lance et affiche. C'est le résultat des sept incréments de cette partie."
]));
classe(`${RACINE}/GameHub.java`);
diagramme("g20.png", "Le jeu de Nim au complet.");
s.push(saut());

// =====================================================================
s.push(h1("Quatrième partie — le jeu de bataille"));

increment("G.21, G.22", "Le deck et les cartes");
s.push(runs([
  { t: "Trois choses changent par rapport au Deck de ENU.3, ", b: true },
  "et la troisième est la plus parlante. Le champ devient une List. Le constructeur ne calcule plus de position, il ajoute. Et le mélange se réduit à ",
  { t: "Collections.shuffle", code: true },
  " : une ligne au lieu de six, écrite par des gens dont c'est le métier."
]));
classe(`${RACINE}/jeux/bataille/Deck.java`);
s.push(runs([
  { t: "L'ordre de déclaration de Valeur est tout l'exercice. ", b: true },
  "En ",
  { t: "ENU.3", code: true },
  " l'énumération commençait par AS ; ici elle commence par DEUX et finit par AS, parce qu'à la bataille l'as est la carte la plus forte."
]));
s.push(runs([
  "Ce simple changement fait que ",
  { t: "compareTo", code: true },
  " rend exactement ce que les règles demandent. On n'écrit aucune comparaison : l'ordre dans lequel on a tapé les constantes fait le travail."
]));
classe(`${RACINE}/jeux/bataille/Valeur.java`);
classe(`${RACINE}/jeux/bataille/Carte.java`);

increment("G.23 à G.26", "La version simplifiée");
s.push(runs([
  { t: "Pourquoi un Deque pour les mains. ", b: true },
  "Une main de bataille se pioche par le dessus et se recharge par le dessous : on a besoin des deux bouts. Une List le permettrait — ",
  { t: "get(0)", code: true },
  " et ",
  { t: "remove(0)", code: true },
  " — mais chaque retrait en tête décale tous les éléments. Un ArrayDeque est fait pour cela, et il le dit dans son nom."
]));
s.push(encadre([
  [{ t: "L'écart avec l'énoncé G.26", b: true }],
  ["L'énoncé demande : « soit la pioche du joueur 1 est vide : return JOUEUR1_GAGNE ». C'est l'inverse de la règle du jeu — un joueur sans carte a tout perdu."],
  ["Le corrigé applique la règle. L'énoncé pose d'ailleurs la question aux étudiants, et c'est un bon endroit pour leur faire remarquer qu'un énoncé peut se tromper."]
]));
s.push(runs([
  { t: "Pourquoi un maximum de tours. ", b: true },
  "Sans lui, deux mains qui s'échangent indéfiniment les mêmes cartes feraient tourner le programme sans fin. Sur 500 parties simulées, la version V0 se termine toujours — dont onze fois par un double épuisement — mais la version V1 atteint le maximum trois fois. Le garde-fou sert réellement."
]));
classe(`${RACINE}/jeux/bataille/JeuBatailleV0.java`);

increment("G.27", "La vraie bataille");
s.push(runs([
  { t: "Cette classe hérite de V0 et ne redéfinit qu'une méthode. ", b: true },
  "Elle réutilise la comparaison, la distribution, le calcul du résultat et le maximum de tours. C'est exactement ce que le thème ",
  { t: "ABS", code: true },
  " cherche à faire comprendre : ce qui est commun reste en haut."
]));
s.push(p("Les deux cas limites font toute la difficulté. Un joueur qui n'a plus assez de cartes pour miser pendant une bataille ne peut pas suivre : il perd, et l'autre ramasse le pot. Si les deux se retrouvent à court en même temps, personne ne ramasse et le pot est perdu pour tout le monde."));
s.push(runs([
  { t: "Le mélange du pot avant de le remettre sous la pioche ", b: true },
  "n'est pas une coquetterie. Sans lui, un cycle s'installe : les mêmes cartes reviennent dans le même ordre, indéfiniment. Un vrai joueur ne range pas ses plis dans un ordre choisi."
]));
classe(`${RACINE}/jeux/bataille/JeuBatailleV1.java`);
diagramme("g27.png", "V1 hérite de V0 et ne redéfinit qu'une méthode.");
s.push(saut());

// =====================================================================
diagramme("g28.png", "Le jeu qui se joue seul — G.28.");
s.push(saut());

// =====================================================================
s.push(h1("Les classes de test"));
s.push(p("Trois classes de test accompagnent le corrigé. Elles ne sont pas demandées par les énoncés, mais elles démontrent ce que les incréments cherchent à faire comprendre."));

s.push(h2("Les stratégies du Nim se testent sans jouer"));
s.push(p("Une stratégie est une fonction de la pile et des règles vers un nombre. Rien n'est plus facile à vérifier — et c'est le bénéfice direct de les avoir séparées de JeuNim."));
s.push(runs([
  "Le dernier test est le plus utile : il vérifie qu'",
  { t: "aucune", b: true },
  " des trois stratégies ne propose un coup interdit, sur vingt tailles de pile différentes. Une quatrième stratégie écrite par un étudiant passerait le même contrôle."
]));
classe(`${TESTS}/jeux/nim/StrategieNimTest.java`);

s.push(h2("La bataille se teste sans prédire le résultat"));
s.push(p("Une partie est aléatoire : on ne peut pas vérifier qui gagne. On vérifie donc des propriétés qui doivent tenir à chaque fois — elle se termine, aucune carte ne se perd, une partie sans joueur est refusée."));
s.push(p("C'est une façon de tester du hasard qui s'applique bien au-delà de ce jeu."));
classe(`${TESTS}/jeux/bataille/BatailleTest.java`);
s.push(saut());

// =====================================================================
s.push(h1("La vue d'ensemble"));
s.push(p("Six packages, et aucune flèche qui remonte vers le hub. Aucun package de jeu n'en connaît un autre."));
diagramme("ensemble.png", "Ajouter un jeu, c'est ajouter un package et un cas dans la fabrique.");
s.push(runs([
  { t: "C'est le résultat de vingt-neuf incréments, ", b: true },
  "et la seule chose qu'il faut en retenir : une dépendance qu'on n'a pas créée est une dépendance qu'on n'aura pas à défaire."
]));
s.push(h2("Ce qui reste ouvert"));
s.push(tableau(["Sujet", "État"], [
  ["MORPION et PUISSANCE4", "des valeurs dans TypeJeu, sans implémentation"],
  ["le démineur complet", "facultatif, à mener sur plusieurs semaines"],
  ["G.10", "volontairement non écrit — voir l'introduction"]
], [2600, 6760], [0]));

Packer.toBuffer(doc(s, "GameHub — corrigé, état final")).then(b => {
  fs.writeFileSync(__dirname + "/../_documents/GameHub_Solution_Finale.docx", b);
  console.log("GameHub_solutions :", Math.round(b.length / 1024), "Ko");
});
