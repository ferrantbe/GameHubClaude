#!/usr/bin/env python3
"""
ajouter_pagination.py — ajoute un pied de page numerote a un .docx.

    python3 ajouter_pagination.py fichier.docx "POO" [total]

Le document est coupe en deux sections au premier saut de page :

  section 1  la page de couverture, sans pied de page ;
  section 2  le reste, avec un pied de page centre du type  POO 1 / 9,
             la numerotation repartant a 1 et le total portant sur la
             section — la couverture n'est donc comptee nulle part.

Le traitement se fait sur le fichier existant, sans le regenerer : les
retouches faites a la main dans Word sont conservees.

Le troisieme argument, facultatif, est le nombre de pages numerotees. Il sert
de valeur en cache pour le champ SECTIONPAGES : Word recalcule le champ tout
seul, mais les lecteurs qui ne l'evaluent pas — LibreOffice, certains visionneurs
PDF — affichent cette valeur. La donner evite qu'ils montrent un total faux.

Relancer le script sur un document deja pagine ne fait rien.
"""

import re
import shutil
import sys
import zipfile
from pathlib import Path

FOOTER_PART = "word/footer1.xml"

TYPE_FOOTER = ("http://schemas.openxmlformats.org/officeDocument/2006/"
               "relationships/footer")
CT_FOOTER = ("application/vnd.openxmlformats-officedocument."
             "wordprocessingml.footer+xml")


def champ(nom, valeur_repli):
    """Un champ Word : PAGE, SECTIONPAGES..."""
    return (
        '<w:r><w:fldChar w:fldCharType="begin"/></w:r>'
        f'<w:r><w:instrText xml:space="preserve"> {nom} </w:instrText></w:r>'
        '<w:r><w:fldChar w:fldCharType="separate"/></w:r>'
        f'<w:r><w:t>{valeur_repli}</w:t></w:r>'
        '<w:r><w:fldChar w:fldCharType="end"/></w:r>'
    )


def footer_xml(prefixe, total):
    rpr = '<w:rPr><w:sz w:val="18"/><w:szCs w:val="18"/><w:color w:val="595959"/></w:rPr>'
    texte = (f'<w:r>{rpr}<w:t xml:space="preserve">{prefixe} </w:t></w:r>'
             + champ("PAGE", "1")
             + f'<w:r>{rpr}<w:t xml:space="preserve"> / </w:t></w:r>'
             + champ("SECTIONPAGES", total))
    return (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n'
        '<w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">'
        '<w:p><w:pPr><w:jc w:val="center"/>'
        '<w:rPr><w:sz w:val="18"/><w:szCs w:val="18"/><w:color w:val="595959"/></w:rPr>'
        '</w:pPr>'
        + texte +
        '</w:p></w:ftr>'
    )


def identifiant_libre(rels):
    utilises = {int(x) for x in re.findall(r'Id="rId(\d+)"', rels)}
    return f"rId{(max(utilises) + 1) if utilises else 1}"


def main(chemin, prefixe, total="1"):
    chemin = Path(chemin)
    with zipfile.ZipFile(chemin) as archive:
        entrees = {n: archive.read(n) for n in archive.namelist()}
        ordre = list(archive.namelist())

    if FOOTER_PART in entrees:
        print("deja pagine, rien a faire")
        return

    xml = entrees["word/document.xml"].decode("utf-8")

    # --- 1. le sectPr final, qui decrit la mise en page ------------------
    final = re.search(r"<w:sectPr\b.*?</w:sectPr>", xml, re.S)
    if final is None:
        sys.exit("aucun sectPr : document inattendu")
    sectpr = final.group(0)

    # --- 2. couper au premier saut de page ------------------------------
    saut = re.search(r'<w:p\b[^>]*>(?:(?!</w:p>).)*?<w:br w:type="page"/>.*?</w:p>',
                     xml, re.S)
    if saut is None:
        sys.exit("aucun saut de page : impossible d'isoler la couverture")

    # La section 1 reprend la mise en page, sans pied de page.
    coupure = f"<w:p><w:pPr>{sectpr}</w:pPr></w:p>"
    xml = xml[:saut.start()] + coupure + xml[saut.end():]

    # --- 3. la section 2 recoit le pied de page et repart a 1 ------------
    rels = entrees["word/_rels/document.xml.rels"].decode("utf-8")
    rid = identifiant_libre(rels)

    # Le schema impose l'ordre des elements d'un sectPr :
    #   footerReference ... pgSz, pgMar, ..., pgNumType, cols, ..., docGrid
    # Word et docx-js ne produisent pas le meme sectPr : on ne peut donc ni
    # ajouter en tete ni ajouter en queue, il faut inserer au bon endroit.
    ouverture = re.match(r"<w:sectPr\b[^>]*>", sectpr).group(0)
    nouveau = sectpr.replace(
        ouverture,
        ouverture + f'<w:footerReference w:type="default" r:id="{rid}"/>', 1)

    if "<w:pgNumType/>" in nouveau:
        nouveau = nouveau.replace("<w:pgNumType/>", '<w:pgNumType w:start="1"/>', 1)
    elif "<w:pgNumType" in nouveau:
        nouveau = re.sub(r"<w:pgNumType\b[^>]*/>", '<w:pgNumType w:start="1"/>', nouveau, 1)
    else:
        # juste apres pgMar, ou a defaut apres pgSz
        apres = re.search(r"<w:pgMar\b[^>]*/>", nouveau) or re.search(r"<w:pgSz\b[^>]*/>", nouveau)
        if apres is None:
            sys.exit("sectPr sans pgSz ni pgMar : structure inattendue")
        nouveau = (nouveau[:apres.end()] + '<w:pgNumType w:start="1"/>'
                   + nouveau[apres.end():])

    # On ne remplace que la DERNIERE occurrence : la premiere est la coupure.
    position = xml.rfind(sectpr)
    xml = xml[:position] + nouveau + xml[position + len(sectpr):]

    entrees["word/document.xml"] = xml.encode("utf-8")

    # --- 4. la partie footer, sa relation, son type de contenu ----------
    entrees[FOOTER_PART] = footer_xml(prefixe, total).encode("utf-8")
    ordre.append(FOOTER_PART)

    relation = (f'<Relationship Id="{rid}" Type="{TYPE_FOOTER}" '
                'Target="footer1.xml"/>')
    entrees["word/_rels/document.xml.rels"] = rels.replace(
        "</Relationships>", relation + "</Relationships>").encode("utf-8")

    types = entrees["[Content_Types].xml"].decode("utf-8")
    override = f'<Override PartName="/{FOOTER_PART}" ContentType="{CT_FOOTER}"/>'
    entrees["[Content_Types].xml"] = types.replace(
        "</Types>", override + "</Types>").encode("utf-8")

    # --- 5. reecriture ---------------------------------------------------
    temporaire = chemin.with_suffix(".tmp.docx")
    with zipfile.ZipFile(temporaire, "w", zipfile.ZIP_DEFLATED) as sortie:
        for nom in ordre:
            sortie.writestr(nom, entrees[nom])
    shutil.move(str(temporaire), str(chemin))

    print(f"pagination « {prefixe} n / total » ajoutee a {chemin.name}")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "1")
