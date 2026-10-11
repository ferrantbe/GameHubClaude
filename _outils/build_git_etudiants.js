const fs = require("fs");
const B = require(__dirname + "/boite.js");
const {
  p, runs, bullet, bulletRuns, code, h1, h2, tableau, encadre,
  saut, doc, Packer, GREY, AlignmentType, Paragraph, TextRun
} = B;

const path = require("path");
const { ImageRun } = require("docx");

const ACCENT = "1F4E79";

/**
 * Le dossier des captures d'ecran.
 *
 * Elles ne sont pas dans le projet : elles pesent lourd, et elles doivent
 * etre refaites sur la machine ou l'on enseigne — la version d'IntelliJ
 * change les libelles et le theme change les couleurs.
 *
 *     CAPTURES=/chemin/vers/captures node _outils/build_git_etudiants.js
 *
 * Sans ce dossier, le document se construit quand meme, sans les images :
 * un encadre signale a leur place ce qui manque. C'est preferable a un
 * echec, parce qu'on veut pouvoir relire le texte avant d'avoir les
 * captures.
 */
const CAPTURES = process.env.CAPTURES || path.join(__dirname, "..", "_captures");

/**
 * Encombrement maximal d'une image, en points.
 *
 * La hauteur compte autant que la largeur. Une capture en portrait —
 * un menu deroule, par exemple — ramenee a 600 points de large en
 * ferait 680 de haut, soit presque une page pour une seule image.
 * On reduit donc jusqu'a ce que les DEUX contraintes soient tenues.
 */
const LARGEUR_MAX = 600;
const HAUTEUR_MAX = 340;

/**
 * Mesure un PNG sans bibliotheque.
 *
 * L'en-tete IHDR d'un PNG place la largeur et la hauteur aux octets 16 a
 * 23, en gros-boutiste. Quatre lignes suffisent donc, et cela evite le
 * fichier tailles.json que le guide IntelliJ demande de tenir a jour a la
 * main — une etape de plus, et une occasion de se tromper.
 */
function mesurer(fichier) {
  const octets = fs.readFileSync(fichier);
  return [octets.readUInt32BE(16), octets.readUInt32BE(20)];
}

/**
 * Insere une capture d'ecran, mesuree automatiquement.
 *
 * UN PIEGE A CONNAITRE. Une capture prise sur macOS ou sous Windows
 * arrive souvent en RGBA, avec un canal de transparence. Word le rend
 * mal — fond noir, parfois. Aplatissez-la sur blanc avant de la deposer
 * dans _captures/, ou la page sera illisible sans que rien ne le signale.
 */
function image(fichier, legende) {
  const chemin = path.join(CAPTURES, fichier);

  if (!fs.existsSync(chemin)) {
    // On rend un tableau dans les deux cas, pour que l'appelant puisse
    // toujours ecrire g.push(...image(...)).
    return [encadre([
      [{ t: "Capture manquante : ", b: true }, fichier],
      [legende || ""]
    ], "9C2B2B")].flat();
  }

  const [largeur, hauteur] = mesurer(chemin);
  const echelle = Math.min(LARGEUR_MAX / largeur, HAUTEUR_MAX / hauteur, 1);

  const sortie = [new Paragraph({
    spacing: { before: 160, after: legende ? 40 : 180 },
    alignment: AlignmentType.CENTER,
    keepNext: !!legende,
    children: [new ImageRun({
      type: "png",
      data: fs.readFileSync(chemin),
      transformation: {
        width: Math.round(largeur * echelle),
        height: Math.round(hauteur * echelle)
      }
    })]
  })];

  if (legende) {
    sortie.push(new Paragraph({
      spacing: { after: 200 }, alignment: AlignmentType.CENTER,
      children: [new TextRun({ text: legende, size: 18, italics: true, color: GREY })]
    }));
  }
  return sortie;
}

const g = [];

// =====================================================================
g.push(new Paragraph({
  spacing: { before: 1100, after: 120 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Une introduction minimale", size: 26, color: GREY })]
}));
g.push(new Paragraph({
  spacing: { after: 140 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "Git", bold: true, size: 56, color: ACCENT })]
}));
g.push(new Paragraph({
  spacing: { after: 700 }, alignment: AlignmentType.CENTER,
  children: [new TextRun({ text: "pour parcourir le fil rouge GameHub", size: 26, color: GREY })]
}));
g.push(p("EPHEC — Bachelier en informatique, niveau 2", { align: AlignmentType.CENTER, color: GREY }));
g.push(saut());

// =====================================================================
g.push(h1("À quoi sert ce document"));
g.push(runs([
  "Le fil rouge GameHub s'est construit en trente étapes. Le code vous est livré dans un ",
  { t: "dépôt Git", b: true },
  ", qui conserve ces trente versions et vous permet de passer de l'une à l'autre."
]));
g.push(p("Ce document vous apprend à les consulter. Rien de plus."));

g.push(h2("Ce qu'il ne couvre pas, et pourquoi"));
g.push(runs([
  "Git est un outil vaste, et il n'est ",
  { t: "pas au programme", b: true },
  " de ce cours. Il ne sera pas à l'examen. Vous n'aurez ni à enregistrer vos modifications, ni à travailler à plusieurs, ni à envoyer quoi que ce soit sur un serveur."
]));
g.push(p("Vous allez l'utiliser en lecture seule, comme on consulte les pages d'un livre plutôt que comme on l'écrit. Quatre gestes suffisent, et ils sont à la fin de ce document."));
g.push(encadre([
  [{ t: "Si vous voulez en savoir plus", b: true }],
  ["Git est un outil que vous rencontrerez dans n'importe quelle équipe de développement, et l'apprendre est un bon investissement. Mais faites-le après l'examen, et pas sur ce projet : vous risqueriez d'abîmer le corrigé au lieu de le lire."]
]));

g.push(h2("Avant de commencer"));
g.push(runs([
  "IntelliJ n'embarque pas Git : il a besoin qu'il soit ",
  { t: "installé sur la machine", b: true },
  ". Pour le vérifier, ouvrez le projet et regardez si un onglet ",
  { t: "Git", code: true },
  " apparaît en bas de la fenêtre."
]));
g.push(p("S'il n'y est pas, signalez-le : rien de ce qui suit ne fonctionnera, et une autre version du corrigé vous sera fournie."));
g.push(saut());

// =====================================================================
g.push(h1("Git en trois idées"));
g.push(p("Trois notions suffisent à comprendre ce que vous allez manipuler. Elles se décrivent en une page."));

g.push(h2("1. Un enregistrement de l'état du projet"));
g.push(runs([
  "Quand on travaille sans outil, on garde ses anciennes versions en dupliquant des dossiers : ",
  { t: "projet", code: true },
  ", ",
  { t: "projet-v2", code: true },
  ", ",
  { t: "projet-v2-corrigé", code: true },
  ", ",
  { t: "projet-final-VRAI", code: true },
  ". Vous l'avez sans doute déjà fait."
]));
g.push(p("Ça marche, et ça devient vite ingérable : on ne sait plus ce qui distingue deux dossiers, ni lequel est le bon."));
g.push(runs([
  "Git fait la même chose, en mieux. Il enregistre l'état complet du projet à un instant donné, sous un nom lisible. Cet enregistrement s'appelle un ",
  { t: "commit", b: true },
  "."
]));
g.push(p("Le projet reste un seul dossier. Les anciennes versions ne l'encombrent pas : elles sont rangées ailleurs, et Git les ressort à la demande."));

g.push(h2("2. Une suite d'enregistrements"));
g.push(p("Les commits se suivent, chacun partant du précédent. Cela forme un historique, du premier au dernier :"));
g.push(...code([
  "G.1 --- G.2 --- G.3 --- … --- G.29 --- G.30",
  " |                                        |",
  " le joueur                        le puissance 4"
]));
g.push(runs([
  "Chaque commit ne retient que ce qui a ",
  { t: "changé", b: true },
  " depuis le précédent. C'est ce qui permet de vous poser une question utile : qu'est-ce que l'incrément G.7 a ajouté, exactement ?"
]));

g.push(h2("3. Une étiquette collée sur un enregistrement"));
g.push(runs([
  "Un commit porte un identifiant illisible, du genre ",
  { t: "3f8cc8c", code: true },
  ". Pour s'y retrouver, on colle dessus une ",
  { t: "étiquette", b: true },
  " — en anglais un ",
  { t: "tag", i: true },
  "."
]));
g.push(p("Dans le dépôt GameHub, chaque incrément a la sienne, et elle porte son nom :"));
g.push(...code(["G.1   G.2   G.3   …   G.29   G.30"]));
g.push(runs([
  "Ce sont ces étiquettes que vous manipulerez. Vous n'aurez jamais à taper un identifiant de commit, ni même à le regarder."
]));
g.push(saut());

// =====================================================================
g.push(h1("Ce que contient le dossier qu'on vous donne"));
g.push(p("Le dépôt est un dossier ordinaire. Vous l'ouvrez dans IntelliJ comme n'importe quel projet."));
g.push(tableau(["Ce que vous voyez", "Ce que c'est"], [
  ["src/", "le code du fil rouge, dans l'état de la dernière version"],
  ["_documents/", "les énoncés et les deux corrigés"],
  ["_diagrammes/", "les diagrammes de classes"],
  ["ETAPE.md", "ce que l'incrément affiché demandait"],
  [".git/", "caché — l'historique des trente versions"]
], [2900, 6460], [0]));

g.push(encadre([
  [{ t: "Le piège du copier-coller", b: true }],
  ["Le dossier .git est caché, et c'est lui qui porte tout l'historique. Si vous copiez seulement src/ ailleurs, vous perdez les trente versions sans vous en apercevoir — l'onglet Git disparaît, et rien n'explique pourquoi."],
  ["Déplacez toujours le dossier entier."]
]));

g.push(h2("Une précision sur les menus"));
g.push(runs([
  "Les chemins de menus donnés ci-après correspondent à une version récente d'IntelliJ. Le libellé exact peut différer légèrement de la vôtre — ",
  { t: "Checkout", code: true },
  " s'appelle parfois ",
  { t: "Checkout Revision", code: true },
  ", le menu ",
  { t: "Git", code: true },
  " s'appelait ",
  { t: "VCS", code: true },
  " avant. Le principe, lui, ne change pas."
]));
g.push(saut());

// =====================================================================
g.push(h1("Les quatre gestes"));
g.push(p("Voici tout ce que vous aurez à faire. Aucune commande à taper : tout se fait à la souris."));

g.push(h2("Geste 1 — Voir la liste des versions"));
g.push(runs([
  "Ouvrez l'onglet ",
  { t: "Git", code: true },
  " en bas de la fenêtre, puis l'onglet ",
  { t: "Log", code: true },
  ". Vous y voyez les trente incréments, du plus récent au plus ancien, chacun avec son titre."
]));
g.push(...image("git-01-log.png",
  "L'onglet Git, en bas de la fenêtre : les trente incréments, du plus récent au plus ancien."));
g.push(p("C'est déjà utile en soi : la liste raconte la construction du projet, étape par étape."));

g.push(h2("Geste 2 — Se placer à une version"));
g.push(runs([
  "Tout se passe dans le panneau de gauche de l'onglet Git, celui de la capture précédente. Dépliez la section ",
  { t: "Tags", code: true },
  ", puis faites un ",
  { t: "clic droit", b: true },
  " sur l'étiquette voulue et choisissez ",
  { t: "Checkout", code: true },
  "."
]));
g.push(...image("git-02-checkout.png",
  "Clic droit sur une étiquette. Checkout est la première entrée du menu."));
g.push(encadre([
  [{ t: "Attention à ce menu", b: true }],
  ["Trois entrées plus bas se trouve Delete, qui supprime l'étiquette. Merge, juste au-dessus, modifierait le projet. Vous n'avez besoin ni de l'une ni de l'autre : seul Checkout vous sert, et c'est la première entrée."],
  ["Si vous cliquez à côté par mégarde, ne vous acharnez pas : reprenez l'archive d'origine dans un dossier neuf."]
], "9C2B2B"));
g.push(p("Les fichiers du projet deviennent ceux de cet incrément. Le code que vous voyez à l'écran est celui qui existait à ce moment-là — ni plus, ni moins."));
g.push(runs([
  "Ouvrez alors ",
  { t: "ETAPE.md", code: true },
  " à la racine : il vous dit ce que cet incrément demandait, et quelles classes il touche."
]));

g.push(h2("Geste 3 — Voir ce qu'un incrément a ajouté"));
g.push(runs([
  { t: "C'est le geste le plus utile des quatre. ", b: true },
  "Dans l'onglet ",
  { t: "Log", code: true },
  ", cliquez sur un incrément. Le panneau de droite montre les fichiers modifiés ; double-cliquez sur l'un d'eux."
]));
g.push(runs([
  "Deux versions du fichier s'affichent côte à côte : l'",
  { t: "ancienne à gauche", b: true },
  ", la ",
  { t: "nouvelle à droite", b: true },
  ". Trois couleurs suffisent à tout lire."
]));
g.push(tableau(["Ce que vous voyez", "Ce que ça veut dire"], [
  ["fond vert", "la ligne a été ajoutée par cet incrément"],
  ["fond bleu", "la ligne existait déjà, et elle a été modifiée"],
  ["une ligne face à un vide", "elle a disparu, ou elle vient d'apparaître"]
], [3000, 6360], [0]));
g.push(runs([
  { t: "Le bleu est le plus intéressant. ", b: true },
  "Sur l'incrément G.7, le constructeur de Partie passe de deux à trois paramètres : la ligne n'est ni ajoutée ni supprimée, elle change. C'est exactement ce qu'un corrigé sur papier ne sait pas montrer."
]));
g.push(...image("git-03-diff.png",
  "L'incrément G.7 sur Partie.java. En vert les champs ajoutés, en bleu le constructeur qui change de signature."));
g.push(runs([
  "Le sélecteur ",
  { t: "Side-by-side viewer", code: true },
  ", en haut de cette fenêtre, bascule entre plusieurs affichages. C'est celui-là qu'il vous faut : les deux versions côte à côte."
]));
g.push(p("Vous voyez donc exactement ce que l'incrément a changé, sans avoir à comparer deux pages de corrigé à l'œil."));
g.push(runs([
  "Pour comparer deux versions ",
  { t: "non consécutives", b: true },
  " — l'état à G.6 et l'état à G.12, par exemple — sélectionnez les deux dans le Log en maintenant ",
  { t: "Ctrl", code: true },
  ", puis clic droit, ",
  { t: "Compare Versions", code: true },
  "."
]));

g.push(h2("Geste 4 — Revenir à la version finale"));
g.push(runs([
  "Même endroit qu'au geste 2, une section plus haut : dans ",
  { t: "Local", code: true },
  ", clic droit sur ",
  { t: "main", code: true },
  ", puis ",
  { t: "Checkout", code: true },
  ". La capture du geste 1 montre cette section."
]));
g.push(p("Prenez l'habitude de le faire avant de refermer le projet : vous le retrouverez complet la fois suivante."));
g.push(saut());

// =====================================================================
g.push(h1("Quand ça coince"));
g.push(p("Trois situations reviennent. Aucune n'est grave, et aucune ne s'invente."));

g.push(h2("« Your local changes would be overwritten »"));
g.push(...code([
  "error: Your local changes to the following files would be overwritten",
  "by checkout:  src/main/java/be/ephec/gamehub/GameHub.java",
  "Please commit your changes or stash them before you switch branches."
]));
g.push(runs([
  { t: "Ce que ça veut dire. ", b: true },
  "Vous avez modifié un fichier, et Git refuse de l'écraser en changeant de version. Il vous protège."
]));
g.push(...image("git-05-conflit.png",
  "IntelliJ signale le refus, et propose ses propres formulations."));
g.push(runs([
  { t: "Ce qu'il faut faire. ", b: true },
  "Décidez si vos modifications vous importent."
]));
g.push(bullet("Si oui, copiez le fichier ailleurs, hors du projet, avant d'aller plus loin."));
g.push(bulletRuns([
  "Ensuite, annulez-les : clic droit sur le projet, ",
  { t: "Git > Rollback", code: true },
  ". Le fichier revient à son état d'origine, et le changement de version passe."
]));
g.push(encadre([
  [{ t: "Le conseil qui évite tout ça", b: true }],
  ["N'écrivez pas dans le dépôt. C'est un corrigé à lire, pas un projet où travailler. Pour essayer des choses, copiez le code dans un projet à vous."]
]));

g.push(h2("« You are in detached HEAD state »"));
g.push(p("Après le geste 2, Git affiche un avertissement de plusieurs lignes, au nom inquiétant."));
g.push(runs([
  "Le signe visible est en haut du panneau de gauche : la ligne ",
  { t: "HEAD (Current Branch)", code: true },
  " n'affiche plus ",
  { t: "main", code: true },
  " mais le nom de l'étiquette où vous êtes."
]));
g.push(runs([
  { t: "Ce que ça veut dire. ", b: true },
  "Vous visitez une version passée sans être sur une branche. C'est exactement ce que vous vouliez faire, et c'est sans danger tant que vous ne modifiez rien."
]));
g.push(runs([
  { t: "Ce qu'il faut faire. ", b: true },
  "Rien. Le geste 4 vous ramène sur ",
  { t: "main", code: true },
  " quand vous avez fini."
]));

g.push(h2("L'onglet Git a disparu"));
g.push(runs([
  { t: "Ce que ça veut dire. ", b: true },
  "Soit Git n'est pas installé sur la machine, soit vous avez copié le projet sans son dossier ",
  { t: ".git", code: true },
  " — voir l'encadré du chapitre précédent."
]));
g.push(runs([
  { t: "Ce qu'il faut faire. ", b: true },
  "Reprendre l'archive d'origine et la dézipper entièrement, dans un dossier neuf."
]));
g.push(saut());

// =====================================================================
g.push(h1("En résumé"));
g.push(tableau(["Ce que vous voulez", "Comment"], [
  ["voir les trente versions", "onglet Git, en bas, puis Log"],
  ["vous placer à un incrément", "panneau de gauche, section Tags, clic droit, Checkout"],
  ["savoir ce qu'un incrément demandait", "ouvrir ETAPE.md, à la racine"],
  ["voir ce qu'un incrément a changé", "cliquer l'incrément dans le Log, double-cliquer un fichier"],
  ["comparer deux versions éloignées", "les sélectionner avec Ctrl, clic droit, Compare Versions"],
  ["revenir à la fin", "même panneau, section Local, clic droit sur main, Checkout"]
], [3400, 5960], [0]));

g.push(h2("Et surtout"));
g.push(p("Ne modifiez rien dans ce dossier. C'est un corrigé qui se lit, et tout ce qui précède suppose que vous ne l'avez pas touché."));
g.push(runs([
  "Git n'est pas au programme et ne sera pas évalué. Si ce document vous a donné envie d'en apprendre davantage, tant mieux — mais gardez ça pour ",
  { t: "après", i: true },
  " le mois de juin."
]));

Packer.toBuffer(doc(g, "Git — pour parcourir GameHub")).then(b => {
  fs.writeFileSync(__dirname + "/../_documents/Git_pour_GameHub.docx", b);
  console.log("Git_pour_GameHub :", Math.round(b.length / 1024), "Ko");
});
