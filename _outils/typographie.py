#!/usr/bin/env python3
"""
typographie.py — applique les conventions typographiques a un .docx.

    python3 _outils/typographie.py documents/Memento_Technique.docx
    python3 _outils/typographie.py enonces/*.docx
    python3 _outils/typographie.py --simulation enonces/POO_enonces.docx

Deux transformations, sans rapport l'une avec l'autre sinon qu'on les
faisait a la main.

1. LES ESPACES INSECABLES devant « : » « ; » « ? » « ! » « » » et derriere
   « « ». Sans eux, Word peut renvoyer un deux-points seul a la ligne
   suivante.

   LE PIEGE. Dans un .docx, un paragraphe est decoupe en « runs », et
   chaque changement de mise en forme en ouvre un nouveau. L'espace et le
   signe se retrouvent donc souvent dans deux elements <w:t> differents :

       <w:t>Voir </w:t><w:t xml:space="preserve">: </w:t>

   Un simple chercher-remplacer sur chaque element rate ce cas, frequent
   des que le document mele gras, italique et code. On recolle donc les
   elements d'un meme paragraphe avant de chercher.

2. LES EN-TETES DE TABLEAU dont seule la premiere cellule porte du texte
   sont fusionnes, largeurs additionnees. Le titre cesse ainsi de se
   comprimer sur deux lignes dans une colonne etroite.

POURQUOI CE SCRIPT NE LIT PAS LE XML COMME DU XML
-------------------------------------------------
La premiere version employait un analyseur XML, et elle a CASSE tous les
documents : Word annoncait « du contenu illisible » et refusait parfois
de les ouvrir.

La cause n'a rien d'evident. Le document.xml d'un .docx declare une
dizaine d'espaces de noms — mc, r, wp, a, pic, w14… Un analyseur qui n'en
connait qu'un renomme les autres en ns1, ns2, et supprime au passage
l'attribut mc:Ignorable qui les designe par leur prefixe d'origine. Le
fichier reste du XML parfaitement valide, et Word n'en veut plus.

Ce script travaille donc sur le TEXTE du document, et ne reecrit que ce
qu'il change. Tout le reste ressort octet pour octet.

IDEMPOTENT. Relancer le script ne change rien : il n'y a plus d'espace
ordinaire a remplacer, et un en-tete fusionne ne compte plus qu'une
cellule.
"""

import re
import shutil
import sys
import zipfile
from pathlib import Path

INSECABLE = "\u00a0"
AVANT = ":;?!»"

PARTIES = re.compile(r"word/(document|header\d*|footer\d*|footnotes|endnotes)\.xml")

PARAGRAPHE = re.compile(rb"<w:p[ >].*?</w:p>", re.S)
TEXTE = re.compile(rb"(<w:t(?:\s[^>]*)?>)(.*?)(</w:t>)", re.S)
TABLEAU = re.compile(rb"<w:tbl>.*?</w:tbl>", re.S)
LIGNE = re.compile(rb"<w:tr[ >].*?</w:tr>", re.S)
CELLULE = re.compile(rb"<w:tc>.*?</w:tc>", re.S)


def dechappe(octets):
    return (octets.decode("utf-8")
            .replace("&lt;", "<").replace("&gt;", ">")
            .replace("&quot;", '"').replace("&apos;", "'")
            .replace("&amp;", "&"))


def echappe(texte):
    return (texte.replace("&", "&amp;")
            .replace("<", "&lt;").replace(">", "&gt;")
            .encode("utf-8"))


# ---------------------------------------------------------------------
#  1. Les espaces insecables
# ---------------------------------------------------------------------

def espacer(paragraphe):
    """Rend (paragraphe modifie, nombre d'elements changes)."""
    morceaux = list(TEXTE.finditer(paragraphe))
    if not morceaux:
        return paragraphe, 0

    textes = [dechappe(m.group(2)) for m in morceaux]
    avant = list(textes)

    # a) A l'interieur d'un meme element.
    for i, t in enumerate(textes):
        t = re.sub(r" ([" + AVANT + r"])", INSECABLE + r"\1", t)
        textes[i] = t.replace("« ", "«" + INSECABLE)

    # b) A cheval sur deux elements : le cas que rate un remplacement naif.
    for i in range(len(textes) - 1):
        suite = textes[i + 1]
        if not suite:
            continue
        if textes[i].endswith(" ") and suite[0] in AVANT:
            textes[i] = textes[i][:-1] + INSECABLE
        elif textes[i].endswith("«") and suite.startswith(" "):
            textes[i + 1] = INSECABLE + suite[1:]

    faits = sum(1 for a, b in zip(avant, textes) if a != b)
    if not faits:
        return paragraphe, 0

    # On reconstruit en partant de la FIN : les positions des morceaux
    # precedents restent ainsi valides.
    sortie = paragraphe
    for m, texte in reversed(list(zip(morceaux, textes))):
        ouvrant = m.group(1)
        if b"xml:space" not in ouvrant:
            ouvrant = ouvrant[:-1] + b' xml:space="preserve">'
        sortie = (sortie[:m.start()] + ouvrant + echappe(texte)
                  + m.group(3) + sortie[m.end():])
    return sortie, faits


# ---------------------------------------------------------------------
#  2. Les en-tetes de tableau
# ---------------------------------------------------------------------

def texte_de(cellule):
    return "".join(dechappe(m.group(2)) for m in TEXTE.finditer(cellule)).strip()


def largeur_de(cellule):
    m = re.search(rb'<w:tcW w:w="(\d+)"', cellule)
    return int(m.group(1)) if m else 0


def fusionner(tableau):
    """Rend (tableau modifie, True) si l'en-tete a ete fusionne."""
    lignes = list(LIGNE.finditer(tableau))
    if not lignes:
        return tableau, False

    entete = lignes[0]
    cellules = list(CELLULE.finditer(entete.group(0)))
    if len(cellules) < 2:
        return tableau, False
    if not texte_de(cellules[0].group(0)):
        return tableau, False
    if any(texte_de(c.group(0)) for c in cellules[1:]):
        return tableau, False

    premiere = cellules[0].group(0)
    totale = sum(largeur_de(c.group(0)) for c in cellules)
    etendue = b'<w:gridSpan w:val="%d"/>' % len(cellules)

    if b"<w:tcPr>" in premiere:
        nouvelle = premiere.replace(b"<w:tcPr>", b"<w:tcPr>" + etendue, 1)
    else:
        nouvelle = premiere.replace(
            b"<w:tc>", b"<w:tc><w:tcPr>" + etendue + b"</w:tcPr>", 1)

    if totale:
        nouvelle = re.sub(rb'<w:tcW w:w="\d+"', b'<w:tcW w:w="%d"' % totale,
                          nouvelle, count=1)

    ligne_neuve = (entete.group(0)[:cellules[0].start()] + nouvelle
                   + entete.group(0)[cellules[-1].end():])
    return tableau[:entete.start()] + ligne_neuve + tableau[entete.end():], True


# ---------------------------------------------------------------------

def traiter_xml(donnees):
    compte = {"espaces": 0, "entetes": 0}

    def sur_paragraphe(m):
        sortie, faits = espacer(m.group(0))
        compte["espaces"] += faits
        return sortie

    donnees = PARAGRAPHE.sub(sur_paragraphe, donnees)

    def sur_tableau(m):
        sortie, fait = fusionner(m.group(0))
        if fait:
            compte["entetes"] += 1
        return sortie

    donnees = TABLEAU.sub(sur_tableau, donnees)
    return donnees, compte["espaces"], compte["entetes"]


def traiter(chemin, simulation):
    source = zipfile.ZipFile(chemin)
    entrees = source.infolist()

    espaces = entetes = 0
    sortie = {}
    for entree in entrees:
        donnees = source.read(entree.filename)
        if PARTIES.fullmatch(entree.filename):
            donnees, e, t = traiter_xml(donnees)
            espaces += e
            entetes += t
        sortie[entree.filename] = donnees
    source.close()

    if not simulation and (espaces or entetes):
        shutil.copy2(chemin, chemin.with_suffix(".docx.avant"))
        with zipfile.ZipFile(chemin, "w", zipfile.ZIP_DEFLATED) as cible:
            for entree in entrees:
                cible.writestr(entree, sortie[entree.filename])

    return espaces, entetes


def main():
    simulation = "--simulation" in sys.argv
    fichiers = [Path(a) for a in sys.argv[1:] if not a.startswith("--")]
    if not fichiers:
        sys.exit(__doc__)

    total_e = total_t = 0
    for chemin in fichiers:
        if not chemin.is_file():
            print(f"   introuvable : {chemin}")
            continue
        espaces, entetes = traiter(chemin, simulation)
        total_e += espaces
        total_t += entetes
        marque = "" if (espaces or entetes) else "   (rien a faire)"
        print(f"   {chemin.name:<36} {espaces:>4} element(s)  "
              f"{entetes:>3} en-tete(s){marque}")

    print()
    if simulation:
        print(f"Simulation : {total_e} element(s) et {total_t} en-tete(s) "
              "seraient modifies.")
        print("Relancez sans --simulation pour appliquer.")
    else:
        print(f"{total_e} element(s) retouche(s), "
              f"{total_t} en-tete(s) fusionne(s).")
        if total_e or total_t:
            print("Les fichiers d'origine sont conserves en .docx.avant")


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        pass
