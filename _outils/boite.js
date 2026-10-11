const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle,
  PageBreak, LevelFormat, convertInchesToTwip
} = require("docx");

const MONO = "Consolas";
const ACCENT = "1F4E79";
const GREY = "595959";
const W = 9360;

function p(text, o = {}) {
  return new Paragraph({
    spacing: { after: o.after === undefined ? 120 : o.after },
    alignment: o.align,
    children: [new TextRun({ text, bold: o.bold, italics: o.italic, size: o.size || 22, color: o.color })]
  });
}

function morceaux(list) {
  return list.map(x => typeof x === "string"
    ? new TextRun({ text: x, size: 22 })
    : new TextRun({
        text: x.t, size: 22, bold: x.b, italics: x.i,
        font: x.code ? MONO : undefined, color: x.code ? "8B2500" : undefined
      }));
}

const runs = (l, o = {}) => new Paragraph({
  spacing: { after: o.after === undefined ? 120 : o.after }, children: morceaux(l)
});

const bullet = (t) => new Paragraph({
  numbering: { reference: "puces", level: 0 }, spacing: { after: 60 },
  children: [new TextRun({ text: t, size: 22 })]
});

const bulletRuns = (l) => new Paragraph({
  numbering: { reference: "puces", level: 0 }, spacing: { after: 60 }, children: morceaux(l)
});

function code(lines) {
  return lines.map((l, i) => new Paragraph({
    spacing: { before: i === 0 ? 100 : 0, after: i === lines.length - 1 ? 160 : 0 },
    shading: { type: ShadingType.CLEAR, fill: "F2F2F2" },
    indent: { left: 220 }, keepLines: true,
    children: [new TextRun({ text: l === "" ? " " : l, font: MONO, size: 19 })]
  }));
}

const h1 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_1, spacing: { before: 360, after: 160 }, keepNext: true,
  children: [new TextRun({ text: t, bold: true, size: 30, color: ACCENT })]
});

const h2 = (t) => new Paragraph({
  heading: HeadingLevel.HEADING_2, spacing: { before: 240, after: 100 }, keepNext: true,
  children: [new TextRun({ text: t, bold: true, size: 24, color: GREY })]
});

function cell(text, o = {}) {
  return new TableCell({
    width: { size: o.width, type: WidthType.DXA },
    shading: o.fill ? { type: ShadingType.CLEAR, fill: o.fill } : undefined,
    columnSpan: o.span,
    margins: { top: 55, bottom: 55, left: 100, right: 100 },
    children: [new Paragraph({
      spacing: { after: 0 },
      children: [new TextRun({ text, bold: o.bold, size: o.mono ? 18 : 20, font: o.mono ? MONO : undefined })]
    })]
  });
}

function tableau(entetes, lignes, largeurs, monoCols) {
  const w = largeurs || [2200, 3400, 3760];
  const mono = monoCols === undefined ? [0, 1] : monoCols;
  return new Table({
    columnWidths: w, width: { size: W, type: WidthType.DXA },
    rows: [
      new TableRow({
        tableHeader: true,
        children: entetes.map((e, i) => cell(e, { bold: true, width: w[i], fill: "DEEAF6" }))
      }),
      ...lignes.map(r => new TableRow({
        cantSplit: true,
        children: r.map((val, i) => cell(val, { width: w[i], mono: mono.includes(i) }))
      }))
    ]
  });
}

function encadre(lignes, couleur) {
  return new Table({
    columnWidths: [W], width: { size: W, type: WidthType.DXA },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 2, color: "A6A6A6" },
      bottom: { style: BorderStyle.SINGLE, size: 2, color: "A6A6A6" },
      left: { style: BorderStyle.SINGLE, size: 12, color: couleur || ACCENT },
      right: { style: BorderStyle.SINGLE, size: 2, color: "A6A6A6" },
      insideHorizontal: { style: BorderStyle.NONE }, insideVertical: { style: BorderStyle.NONE }
    },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, fill: "F7F9FC" },
        margins: { top: 120, bottom: 120, left: 160, right: 160 },
        children: lignes.map((t, i) => new Paragraph({
          spacing: { after: i === lignes.length - 1 ? 0 : 80 },
          children: morceaux(Array.isArray(t) ? t : [t])
        }))
      })]
    })]
  });
}

const verif = (l) => encadre(l);
const saut = () => new Paragraph({ children: [new PageBreak()] });

function couverture(c, theme, titre, sous) {
  c.push(new Paragraph({
    spacing: { before: 1200, after: 120 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Programmation orientée objet — Java", size: 26, color: GREY })]
  }));
  c.push(new Paragraph({
    spacing: { after: 100 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: "Thème " + theme, bold: true, size: 52, color: ACCENT })]
  }));
  c.push(new Paragraph({
    spacing: { after: 200 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: titre, bold: true, size: 32, color: ACCENT })]
  }));
  c.push(new Paragraph({
    spacing: { after: 800 }, alignment: AlignmentType.CENTER,
    children: [new TextRun({ text: sous, size: 26, color: GREY })]
  }));
  c.push(p("EPHEC — Bachelier en informatique, niveau 2", { align: AlignmentType.CENTER, color: GREY }));
  c.push(p("Année académique 2026-2027", { align: AlignmentType.CENTER, color: GREY }));
  c.push(saut());
}

function modeEmploi(c, theme, lignes) {
  c.push(h1("Comment travailler ces exercices"));
  c.push(runs([
    "Les exercices de ce thème vivent sous ",
    { t: "be.ephec.java." + theme.toLowerCase(), code: true },
    ", un sous-package par exercice."
  ]));
  c.push(tableau(["Exercice", "Package", "Sujet"], lignes));
  c.push(runs([
    { t: "Chaque exercice est autonome. ", b: true },
    "Son package contient tout ce dont il a besoin et n'importe jamais une classe d'un autre exercice."
  ]));
  c.push(h2("Les classes de test"));
  c.push(runs([
    "Elles sont déjà écrites, sous ",
    { t: "src/test/java", code: true },
    ". Lancez-les avec la double flèche verte dans la marge. Tout part rouge : votre objectif est le vert."
  ]));
  c.push(runs([
    "Les squelettes lèvent une ",
    { t: "UnsupportedOperationException", code: true },
    " : remplacez ces lignes par votre code. Ne changez ni les noms, ni les types. Quand une méthode ou un constructeur est déjà déclaré, complétez son corps plutôt que de le régénérer."
  ]));
  c.push(runs([
    { t: "Un test vert ne garantit pas que la réponse est correcte. ", b: true },
    "Il vérifie le comportement, pas la lisibilité ni la pertinence de la conception — qui comptent aussi à l'examen."
  ]));

  c.push(h2("Laissez toujours votre code compilable"));
  c.push(runs([
    "Tout le dossier ",
    { t: "src/main/java", code: true },
    " se compile d'un seul bloc. Un exercice laissé à moitié écrit empêche donc de lancer ",
    { t: "tous", i: true },
    " les autres, y compris ceux des séances précédentes."
  ]));
  c.push(runs([
    { t: "Prenez-en une habitude, et non une contrainte. ", b: true },
    "Avant de passer à autre chose, posez-vous la question : est-ce que ça compile ? Si oui, tant mieux. Si non, deux issues — vous corrigez, ou vous mettez le morceau en chantier entre commentaires avec ",
    { t: "Ctrl+/", code: true },
    " / ",
    { t: "⌘/", code: true },
    ". Dans les deux cas, vous repartez d'un état sain."
  ]));
  c.push(runs([
    "C'est aussi ce que l'examen demande : on y rend du code qui compile. Autant que le réflexe soit pris dès janvier. Voir ",
    { t: "ERR.9", code: true },
    " du guide IntelliJ si vous vous retrouvez bloqué."
  ]));
}

function doc(children, titre) {
  return new Document({
    creator: "Frédéric Ferrant — EPHEC", title: titre,
    numbering: {
      config: [{
        reference: "puces",
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: convertInchesToTwip(0.3), hanging: convertInchesToTwip(0.18) } } }
        }]
      }]
    },
    sections: [{
      properties: { page: { margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
      children
    }]
  });
}


module.exports = {
  p, runs, bullet, bulletRuns, code, h1, h2, cell, tableau,
  encadre, verif, saut, couverture, modeEmploi, doc,
  Packer, MONO, ACCENT, GREY, W, AlignmentType, Paragraph, TextRun, PageBreak
};
