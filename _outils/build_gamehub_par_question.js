const fs = require("fs");
const { execSync } = require("child_process");
const B = require(__dirname + "/boite.js");
const {
  p, runs, bullet, code, h1, h2, tableau, encadre,
  saut, doc, Packer, GREY, AlignmentType, Paragraph, TextRun
} = B;
const { ImageRun } = require("docx");

const PROJET = `${__dirname}/..`;
const ACCENT = "1F4E79";
const s = [];

/** Rend l'état du projet à un incrément, sous forme d'objet { fichier: [lignes] }. */
function etat(increment) {
  const brut = execSync(
    `cd ${PROJET} && python3 _outils/etats_gamehub.py ${increment} 2>/dev/null`
  ).toString();

  const projet = {};
  let fichier = null;
  let lignes = [];
  let attendSeparateur = false;

  for (const ligne of brut.split("\n")) {
    if (/^={10,}$/.test(ligne)) {
      attendSeparateur = !attendSeparateur;
      continue;
    }
    if (attendSeparateur) {                 // la ligne entre deux separateurs
      if (fichier) projet[fichier] = nettoyer(lignes);
      fichier = ligne.trim();
      lignes = [];
      continue;
    }
    if (fichier) lignes.push(ligne);
  }
  if (fichier) projet[fichier] = nettoyer(lignes);
  return projet;
}

/** Retire la Javadoc, garde les commentaires d'une ligne. */
function nettoyer(lignes) {
  const sortie = [];
  let dansBloc = false;
  for (const ligne of lignes) {
    const nette = ligne.trimStart();
    if (dansBloc) { if (nette.includes("*/")) dansBloc = false; continue; }
    if (nette.startsWith("/*")) { if (!nette.includes("*/")) dansBloc = true; continue; }
    if (nette.startsWith("package ")) continue;
    sortie.push(ligne.replace(/\s+$/, ""));
  }
  const compact = [];
  for (const l of sortie) {
    if (l === "" && compact[compact.length - 1] === "") continue;
    compact.push(l);
  }
  while (compact.length && compact[0] === "") compact.shift();
  while (compact.length && compact[compact.length - 1] === "") compact.pop();
  return compact;
}

function increment(codeEx, titre) {
  s.push(new Paragraph({
    spacing: { before: 340, after: 140 }, keepNext: true,
    children: [
      new TextRun({ text: codeEx + "  ", bold: true, size: 28, color: "7B9E4B" }),
      new TextRun({ text: titre, bold: true, size: 28, color: ACCENT })
    ]
  }));
}

function fichier(nom, lignes) {
  s.push(new Paragraph({
    spacing: { before: 150, after: 40 },
    children: [new TextRun({ text: nom, size: 17, font: "Consolas", color: GREY })]
  }));
  s.push(...code(lignes));
}

function diagramme(f, legende) {
  const chemin = `${__dirname}/../_diagrammes/${f}`;
  const t = execSync(`python3 -c "from PIL import Image; im=Image.open('${chemin}'); print(im.size[0], im.size[1])"`)
    .toString().trim().split(" ").map(Number);
  const largeur = Math.min(600, t[0] / 2.2);
  s.push(new Paragraph({
    spacing: { before: 180, after: 50 }, alignment: AlignmentType.CENTER,
    children: [new ImageRun({ data: fs.readFileSync(chemin),
      transformation: { width: Math.round(largeur), height: Math.round(largeur * t[1] / t[0]) } })]
  }));
  s.push(new Paragraph({
    spacing: { after: 180 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: legende, size: 17, italics: true, color: GREY })]
  }));
}

// =====================================================================
s.push(new Paragraph({
  spacing: { before: 1100, after: 120 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Fil rouge — corrigé pas à pas", size: 26, color: GREY })]
}));
s.push(new Paragraph({
  spacing: { after: 160 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "GameHub", bold: true, size: 54, color: ACCENT })]
}));
s.push(new Paragraph({
  spacing: { after: 700 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "L'état du code après chaque incrément", size: 26, color: GREY })]
}));
s.push(p("EPHEC — Bachelier en informatique, niveau 2", { align: AlignmentType.CENTER, color: GREY }));
s.push(saut());

s.push(h1("Comment lire ce corrigé"));
s.push(runs([
  "Ce document montre le code ",
  { t: "tel qu'il était", b: true },
  " après chaque incrément. Le document « solution finale » montre l'état d'arrivée ; celui-ci montre le chemin."
]));
s.push(p("Vous y verrez donc TypeJeu ne compter que trois valeurs en G.6, puis en gagner une à chaque nouveau jeu. Et le constructeur de Partie prendre deux paramètres, puis trois."));
s.push(h2("Seuls les fichiers qui changent sont montrés"));
s.push(p("À chaque incrément, on ne reproduit que les classes créées ou modifiées. Les autres n'ont pas bougé depuis la page précédente."));
s.push(h2("D'où vient ce code"));
s.push(runs([
  "Il est reconstitué automatiquement à partir du corrigé final, qui porte des marqueurs invisibles à la compilation. Voir ",
  { t: "_outils/etats_gamehub.py", code: true },
  ". Corriger une classe et régénérer suffit : les deux documents restent d'accord."
]));
s.push(encadre([
  [{ t: "Une réserve à connaître", b: true }],
  ["Ces états intermédiaires sont dérivés, jamais compilés. Un contrôle automatique vérifie l'équilibre des accolades et qu'aucune classe n'est citée avant d'exister, mais il ne prouve pas que chaque état compile."],
  ["Si vous repérez un état bancal, c'est un marqueur mal posé dans le corrigé final — pas une erreur de conception."]
]));
s.push(saut());

// =====================================================================
//  La table des incréments : quoi montrer à chaque étape
// =====================================================================
const ETAPES = [
  ["G.1", "Le joueur", ["modele/Joueur.java"],
   "Une classe, deux champs immuables, un toString. Rien d'autre n'existe encore."],
  ["G.2", "La partie", ["modele/Partie.java"],
   "Deux joueurs et un toString qui les concatène — ce qui appelle Joueur.toString sans qu'on l'écrive."],
  ["G.3", "Le point d'entrée", ["GameHub.java"],
   "Le hub demande deux joueurs au clavier et crée une partie. Il ne sait rien faire d'autre."],
  ["G.4", "Les dates", ["modele/Partie.java"],
   "Partie gagne ses deux dates et la méthode terminer. Remarquez que terminer ne prend encore aucun paramètre : le résultat n'existe pas."],
  ["G.6", "Les énumérations", ["modele/TypeJeu.java", "modele/ResultatPartie.java"],
   "TypeJeu ne compte que trois valeurs. BATAILLE, DEVINE_LE_NOMBRE et DEMINEUR arriveront avec leurs jeux, aux incréments 21, 28 et 29."],
  ["G.7", "Type et résultat dans la partie", ["modele/Partie.java"],
   "Le constructeur passe de deux à trois paramètres, et terminer en reçoit un. Comparez avec G.4 : c'est la même méthode qui change de signature."],
  ["G.8", "Le résumé", ["modele/ResumePartie.java", "modele/Partie.java"],
   "Le record apparaît, et Partie le fabrique dans terminer — le seul moment où toutes ses données existent."],
  ["G.9", "Le hub complété", ["GameHub.java"],
   "Le menu se construit à partir de TypeJeu.values(). C'est ce qui fera apparaître les jeux suivants sans qu'on y touche."],
  ["G.11", "L'interface d'observation", ["observateurs/ObservateurPartie.java"],
   "Trois méthodes, aucun état. Partie ne saura jamais qui l'observe."],
  ["G.12", "La partie observable", ["modele/Partie.java"],
   "La liste, les deux méthodes d'abonnement, les trois notifications privées. C'est le plus gros ajout à cette classe."],
  ["G.13", "Un observateur concret", ["observateurs/JournalParties.java", "GameHub.java"],
   "Le journal s'abonne depuis le hub. Une classe de plus, et zéro ligne de Partie modifiée."],
  ["G.14", "L'interface Jeu", ["jeux/Jeu.java"],
   "Deux méthodes, et une signature qui n'a rien à voir avec la classe abstraite de G.10 : le jeu reçoit les joueurs et rend un résultat."],
  ["G.15", "La fabrique", ["jeux/JeuFactory.java", "GameHub.java"],
   "Aucun jeu n'existe encore : la fabrique lève une exception pour tout type. Mais le hub, lui, est déjà découplé."],
  ["G.16", "Le matériel du Nim", ["jeux/nim/Pile.java", "jeux/nim/ReglesNim.java"],
   "Deux classes qui ne se connaissent qu'à sens unique : les règles interrogent la pile, jamais l'inverse."],
  ["G.17", "Les stratégies", ["jeux/nim/StrategieNim.java", "jeux/nim/StrategieTimide.java"],
   "Une interface fonctionnelle et son implémentation la plus bête. Elle existe pour que JeuNim ait quelque chose à appeler."],
  ["G.18", "Le jeu de Nim", ["jeux/nim/JeuNim.java", "jeux/JeuFactory.java"],
   "JeuNim n'implémente encore que Jeu : la configuration viendra à G.20. Ses deux joueurs sont timides, et la partie est prévisible."],
  ["G.19", "Les autres stratégies", ["jeux/nim/StrategieMaligne.java", "jeux/nim/StrategieAleatoire.java",
    "jeux/nim/TypeStrategieNim.java", "jeux/nim/StrategieNimFactory.java"],
   "Trois stratégies, une énumération, une seconde fabrique. JeuNim ne change pas encore : il ne sait pas qu'elles existent."],
  ["G.20", "La configuration", ["jeux/JeuConfigurable.java", "jeux/nim/JeuNim.java", "GameHub.java"],
   "JeuNim implémente maintenant deux interfaces, et le hub teste la seconde avant de l'appeler."],
  ["G.21", "Le deck et les cartes", ["jeux/bataille/Deck.java", "jeux/bataille/Carte.java",
    "jeux/bataille/Valeur.java", "jeux/bataille/Couleur.java", "modele/TypeJeu.java"],
   "BATAILLE entre au catalogue. Notez l'ordre de Valeur : DEUX en premier, AS en dernier — c'est lui qui fait fonctionner compareTo."],
  ["G.23", "La bataille simplifiée", ["jeux/bataille/JeuBatailleV0.java"],
   "En cas d'égalité, les cartes partent au cimetière. La vraie bataille viendra à G.27."],
  ["G.27", "La vraie bataille", ["jeux/bataille/JeuBatailleV1.java", "jeux/JeuFactory.java"],
   "Une classe qui hérite de la précédente et ne redéfinit qu'une méthode."],
  ["G.28", "Un jeu qui se joue seul", ["jeux/JeuDevineLeNombre.java", "modele/TypeJeu.java"],
   "Le second joueur est ignoré, et la signature ment. C'est le choix retenu, et son prix."],
  ["G.29", "Le morpion, et la grille qu'il partage", ["jeux/grille/Marque.java",
    "jeux/grille/GrilleAlignement.java", "jeux/morpion/GrilleMorpion.java",
    "jeux/morpion/JeuMorpion.java"],
   "GrilleAlignement ne sert encore qu'au morpion. Écrire la recherche d'alignement ici plutôt que dans GrilleMorpion n'est pas de l'anticipation en l'air : le second jeu de grille arrive à la page suivante."],
  ["G.30", "Le puissance 4, presque gratuit", ["jeux/puissance4/GrillePuissance4.java",
    "jeux/puissance4/JeuPuissance4.java", "jeux/JeuFactory.java"],
   "Trente lignes pour un jeu entier. Tout ce qui manque a été écrit une fois, pour un jeu qui n'avait ni la même taille ni la même règle."],
  ["G.31", "Un objet par joueur", ["modele/ParJoueur.java", "jeux/nim/JeuNim.java"],
   "Les deux ternaires de JeuNim disparaissent. La même classe générique garde deux stratégies et deux joueurs, sans un transtypage."],
  ["G.32", "Une fabrique sans switch", ["jeux/JeuFactory.java"],
   "Chaque cas du switch était une association : ce type, cette façon de fabriquer. La Map les range, et creer ne fait plus que chercher."],
  ["G.33", "Le Nim dans une fenêtre", ["fenetre/FenetreNim.java", "fenetre/LanceurFenetreNim.java"],
   "Pile, ReglesNim et les stratégies servent sans une ligne changée. JeuNim, lui, ne sert pas : sa boucle est devenue un tour par clic."],
  ["G.34", "Des boutons qui savent quand se taire", ["fenetre/FenetreNim.java"],
   "Une propriété suit la pile, et chaque bouton se désactive par un binding. La règle est écrite une fois par bouton, dans aucun gestionnaire."],
  ["G.35", "Un journal qui survit", ["observateurs/JournalParties.java", "GameHub.java"],
   "Une ligne par partie, ajoutée à la fin d'un fichier texte, relue au lancement suivant. Une erreur d'écriture est signalée, jamais fatale."]
];

const DIAGRAMMES = {
  "G.3": ["g03.png", "Les trois premières classes."],
  "G.9": ["g09.png", "Le modèle à la fin de la première partie."],
  "G.13": ["g13.png", "L'observation, et le découplage qu'elle apporte."],
  "G.15": ["g15.png", "L'interface remplace la classe abstraite de G.10."],
  "G.20": ["g20.png", "Le jeu de Nim au complet."],
  "G.27": ["g27.png", "V1 hérite de V0."],
  "G.28": ["g28.png", "Le jeu qui se joue seul."],
  "G.30": ["g30.png", "Une grille écrite une fois, deux jeux."]
};

let partie = null;
const PARTIES = {
  "G.1": "Première partie — le modèle",
  "G.11": "Deuxième partie — l'observation",
  "G.14": "Troisième partie — découpler les jeux du hub",
  "G.21": "Quatrième partie — le jeu de bataille",
  "G.28": "Cinquième partie — quand l'abstraction ne suffit plus",
  "G.29": "Sixième partie — deux jeux de grille pour le prix d'un"
};

for (const [codeEx, titre, fichiers, commentaire] of ETAPES) {
  if (PARTIES[codeEx]) {
    if (partie) s.push(saut());
    s.push(h1(PARTIES[codeEx]));
    partie = codeEx;
  }

  const projet = etat(codeEx);
  increment(codeEx, titre);
  s.push(p(commentaire));

  for (const nom of fichiers) {
    if (!projet[nom]) {
      s.push(p(`(${nom} : introuvable à cet incrément)`, { italic: true, color: "9C2B2B" }));
      continue;
    }
    fichier(nom, projet[nom]);
  }

  if (DIAGRAMMES[codeEx]) diagramme(...DIAGRAMMES[codeEx]);
}

s.push(saut());
s.push(h1("Les incréments sans code nouveau"));
s.push(p("Quatre incréments ne produisent aucune classe, et c'est voulu."));
s.push(tableau(["Incrément", "Pourquoi aucun code ici"], [
  ["G.5", "un déplacement de fichiers, fait par Refactor → Move ; le code ne change pas, seuls les en-têtes package apparaissent"],
  ["G.10", "la classe abstraite Jeu, remplacée quatre incréments plus loin par l'interface du même nom — elle n'est pas écrite dans ce corrigé"],
  ["G.22", "Carte, Valeur et Couleur sont montrées à G.21, parce que le Deck ne compile pas sans elles ; G.22 en affine l'ordre"],
  ["G.24 à G.26", "les trois parties de la méthode jouer de JeuBatailleV0, montrée entière à G.23"],
  ["le démineur", "sorti du fil rouge : il vit désormais dans son propre projet, parce qu'ouvrir une fenêtre depuis une application console demandait un échafaudage hors programme"]
], [1700, 7660], [0]));

s.push(h1("Ce qui a changé, incrément par incrément"));
s.push(p("Un récapitulatif de ce que chaque étape ajoute au projet, pour situer une classe d'un coup d'œil."));

const RECAP = ETAPES.map(([c, t, f]) => [c, t, f.map(x => x.split("/").pop().replace(".java", "")).join(", ")]);
s.push(tableau(["Incrément", "Titre", "Classes créées ou modifiées"], RECAP, [1400, 3400, 4560], [0]));

Packer.toBuffer(doc(s, "GameHub — corrigé pas à pas")).then(b => {
  fs.writeFileSync(__dirname + "/../_documents/GameHub_Solution_Par_Question.docx", b);
  console.log("par question :", Math.round(b.length / 1024), "Ko");
});
