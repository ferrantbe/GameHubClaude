#!/usr/bin/env python3
"""
etats_gamehub.py — reconstitue le code du fil rouge a un increment donne.

    python3 _outils/etats_gamehub.py G.9          l'etat du projet apres G.9
    python3 _outils/etats_gamehub.py G.9 --liste  seulement les fichiers
    python3 _outils/etats_gamehub.py --verifier   controle la coherence

Le probleme
-----------
Le corrige contient l'etat FINAL. Un etudiant qui suit le fil rouge a besoin
de l'etat intermediaire : TypeJeu ne compte que trois valeurs en G.6, et en
gagne trois autres plus loin.

Ecrire ces etats a la main donnerait vingt-neuf copies de chaque classe, qu'il
faudrait toutes corriger a chaque retouche. On les DERIVE donc du code final.

La convention
-------------
Le code final porte des marqueurs `//@G.n`, invisibles a la compilation :

    //@G.14                              <- la classe apparait a G.14
    public class JeuFactory {

        NIM("Jeu de Nim"),               <- pas de marqueur : depuis toujours
        BATAILLE("Jeu de bataille"),     //@G.21   <- ajoute a G.21

        //@G.19
        public StrategieNim creer(...) { <- methode ajoutee a G.19
            ...
        }
    }

Un marqueur en fin de ligne ne vaut que pour cette ligne. Un marqueur seul sur
sa ligne vaut pour le bloc qui suit, jusqu'a l'accolade fermante de meme
indentation.

Une ligne REMPLACEE plus tard pose un probleme particulier : les deux versions
ne peuvent pas coexister dans un fichier qui compile. L'ancienne est donc
gardee EN COMMENTAIRE, precedee de son intervalle :

    //@G.2-G.6 public Partie(Joueur j1, Joueur j2) {
    public Partie(Joueur j1, Joueur j2, TypeJeu type) {      //@G.7

Le script remet la premiere en service quand on lui demande un etat entre G.2
et G.6, et retient la seconde a partir de G.7. Le fichier, lui, reste valide :
c'est la regle a ne jamais enfreindre, sans quoi l'outil casse ce qu'il sert.

Ce que --verifier controle
--------------------------
Il COMPILE chaque etat intermediaire, avec le compilateur du JDK. C'est la
seule preuve qui vaille : un marqueur mal pose se voit immediatement.

Deux reserves. Les etats qui emploient JavaFX — a partir de l'increment ou le
demineur arrive — ne peuvent pas etre compiles ici, faute des bibliotheques ;
ils sont signales et sautes. Et compiler ne dit rien de la justesse : un etat
peut compiler et ne pas correspondre a ce que l'enonce demandait.
"""

import shutil
import subprocess
import tempfile

import re
import sys
from pathlib import Path

MARQUEUR = re.compile(r"\s*//@(G\.\d+)(?:-(G\.\d+))?\s*$")

# Une VARIANTE : du code d'une version anterieure, garde en commentaire pour
# que le fichier reste du Java valide.
#     //@G.2-G.6 public Partie(Joueur joueur1, Joueur joueur2) {
VARIANTE = re.compile(r"^(\s*)//@(G\.\d+)(?:-(G\.\d+))?\s+(\S.*)$")


def racine_du_projet():
    for dossier in [Path(__file__).resolve().parent, *Path(__file__).resolve().parents]:
        if (dossier / "pom.xml").is_file():
            return dossier
    return None


RACINE = racine_du_projet()
SOURCE = RACINE / "src" / "main" / "java" / "be" / "ephec" / "gamehub" \
    if RACINE else None


def rang(increment):
    """G.14 -> 14. Sert a comparer deux increments."""
    return int(increment.split(".")[1])


def visible(trouve, limite, decalage=0):
    """Le marqueur autorise-t-il cette ligne a l'increment demande ?

    decalage : les groupes d'une VARIANTE sont decales d'un cran, la
    premiere parenthese capturant l'indentation.
    """
    debut = rang(trouve.group(1 + decalage))
    suivant = trouve.group(2 + decalage)
    fin = rang(suivant) if suivant else None
    if debut > limite:
        return False
    return fin is None or limite <= fin


def indentation(ligne):
    return len(ligne) - len(ligne.lstrip())


def etat_du_fichier(chemin, increment):
    """Rend les lignes du fichier telles qu'elles etaient a cet increment.

    Rend None si la classe n'existait pas encore.
    """
    limite = rang(increment)
    brut = chemin.read_text(encoding="utf-8").split("\n")

    # Le premier marqueur du fichier dit quand la classe apparait.
    apparition = 1
    for ligne in brut:
        trouve = MARQUEUR.match(ligne)
        if trouve:
            apparition = rang(trouve.group(1))
            break
    if apparition > limite:
        return None

    sortie = []
    i = 0
    while i < len(brut):
        ligne = brut[i]
        variante = VARIANTE.match(ligne)
        if variante:
            if visible(variante, limite, decalage=1):
                sortie.append(variante.group(1) + variante.group(4))
            i += 1
            continue

        seul = MARQUEUR.match(ligne)

        if seul:
            # Marqueur seul : il commande le bloc qui suit.
            if visible(seul, limite):
                i += 1          # on garde le bloc, sans le marqueur
                continue
            i = fin_du_bloc(brut, i + 1)
            continue

        trouve = MARQUEUR.search(ligne)
        if trouve:
            if visible(trouve, limite):
                sortie.append(MARQUEUR.sub("", ligne).rstrip())
            i += 1
            continue

        sortie.append(ligne.rstrip())
        i += 1

    return nettoyer(sortie)


def fin_du_bloc(lignes, depart):
    """Indice de la ligne suivant le bloc commencant a `depart`.

    Un bloc se termine a l'accolade fermante de meme indentation que sa
    premiere ligne. Une declaration sans accolade — un champ, une constante —
    se termine au premier point-virgule.
    """
    while depart < len(lignes) and (not lignes[depart].strip()
                                    or lignes[depart].lstrip().startswith("@")
                                    or lignes[depart].lstrip().startswith("//@")):
        depart += 1
    if depart >= len(lignes):
        return depart

    marge = indentation(lignes[depart])
    if "{" not in lignes[depart]:
        i = depart
        while i < len(lignes) and ";" not in lignes[i]:
            i += 1
        return i + 1

    i = depart

    profondeur = 0
    while i < len(lignes):
        if lignes[i].lstrip().startswith("//@"):
            i += 1          # une variante est un commentaire : elle ne compte pas
            continue
        profondeur += lignes[i].count("{") - lignes[i].count("}")
        if profondeur == 0 and "}" in lignes[i] and indentation(lignes[i]) == marge:
            return i + 1
        i += 1
    return i


def nettoyer(lignes):
    """Comprime les lignes vides laissees par les blocs retires."""
    compact = []
    for ligne in lignes:
        if not ligne.strip() and (not compact or not compact[-1].strip()):
            continue
        compact.append(ligne)
    while compact and not compact[-1].strip():
        compact.pop()
    return compact


def sans_commentaires(texte):
    """Retire commentaires et litteraux : « Jeu de Nim » ne cite pas Jeu."""
    texte = re.sub(r"/\*.*?\*/", "", texte, flags=re.S)
    texte = re.sub(r"//[^\n]*", "", texte)
    return re.sub(r'"(?:[^"\\]|\\.)*"', '""', texte)


def fichiers():
    return sorted(SOURCE.rglob("*.java"))


def etat_du_projet(increment):
    """Rend {chemin relatif -> lignes} pour tout ce qui existe a cet increment."""
    projet = {}
    for chemin in fichiers():
        lignes = etat_du_fichier(chemin, increment)
        if lignes is not None:
            projet[str(chemin.relative_to(SOURCE))] = lignes
    return projet


# ---------------------------------------------------------------------
#  Controles
# ---------------------------------------------------------------------

COMPILATEUR = ["java", "-m", "jdk.compiler/com.sun.tools.javac.Main"]
PAQUET = Path("be/ephec/gamehub")


def compiler_etat(increment, projet):
    """Ecrit l'etat dans un dossier temporaire et le compile.

    Rend None si tout va bien, le message du compilateur sinon, et la
    chaine "javafx" si l'etat depend de bibliotheques absentes.
    """
    if any("javafx" in "\n".join(lignes) for lignes in projet.values()):
        return "javafx"

    with tempfile.TemporaryDirectory() as travail:
        racine = Path(travail) / "src"
        for fichier, lignes in projet.items():
            cible = racine / PAQUET / fichier
            cible.parent.mkdir(parents=True, exist_ok=True)
            # Les lignes portent deja leur instruction package : en ajouter
            # une seconde produirait une erreur de compilation qui n'existe
            # que dans le controle.
            cible.write_text("\n".join(lignes) + "\n", encoding="utf-8")

        sources = [str(f) for f in racine.rglob("*.java")]
        resultat = subprocess.run(
            COMPILATEUR + ["-d", str(Path(travail) / "classes"), "-nowarn"] + sources,
            capture_output=True, text=True, cwd=racine)

        if resultat.returncode != 0:
            return resultat.stderr.strip() or resultat.stdout.strip()
    return None


def verifier():
    increments = set()
    for chemin in fichiers():
        for ligne in chemin.read_text(encoding="utf-8").split("\n"):
            trouve = MARQUEUR.search(ligne)
            if trouve:
                increments.add(rang(trouve.group(1)))
                if trouve.group(2):
                    increments.add(rang(trouve.group(2)))
    increments = sorted(increments)
    if not increments:
        sys.exit("Aucun marqueur //@G.n trouve. Le code n'est pas annote.")

    problemes = []
    classes_par_increment = {}

    for n in range(1, max(increments) + 1):
        increment = f"G.{n}"
        projet = etat_du_projet(increment)
        classes_par_increment[n] = {Path(f).stem for f in projet}

        for fichier, lignes in projet.items():
            texte = sans_commentaires("\n".join(lignes))
            ouvrantes, fermantes = texte.count("{"), texte.count("}")
            if ouvrantes != fermantes:
                problemes.append(
                    f"{increment} / {fichier} : {ouvrantes} accolade(s) ouvrante(s) "
                    f"pour {fermantes} fermante(s)")

        # Une classe ne doit pas etre citee avant d'exister.
        connues = classes_par_increment[n]
        for fichier, lignes in projet.items():
            texte = sans_commentaires("\n".join(lignes))
            for autre in {Path(f).stem for f in fichiers()} - connues:
                if re.search(r"\b" + re.escape(autre) + r"\b", texte):
                    problemes.append(
                        f"{increment} / {fichier} : cite {autre}, qui n'existe pas encore")

    # --- la preuve : chaque etat doit compiler -------------------------
    sautes = []
    for n in range(1, max(increments) + 1):
        increment = f"G.{n}"
        projet = etat_du_projet(increment)
        if not projet:
            continue
        souci = compiler_etat(increment, projet)
        if souci == "javafx":
            sautes.append(increment)
        elif souci:
            premiere = souci.split("\n")[0]
            problemes.append(f"{increment} : ne compile pas — {premiere}")

    if problemes:
        print(f"{len(problemes)} probleme(s) :\n")
        for p in problemes[:40]:
            print("   " + p)
        if len(problemes) > 40:
            print(f"   … et {len(problemes) - 40} autre(s)")
        sys.exit(1)

    compiles = max(increments) - len(sautes)
    print(f"Les {max(increments)} etats se reconstituent, et {compiles} d'entre eux COMPILENT.")
    if sautes:
        print(f"Non compiles, faute de JavaFX : {', '.join(sautes)}.")


def main():
    if RACINE is None:
        sys.exit("Racine du projet introuvable : aucun pom.xml au-dessus de "
                 f"{Path(__file__).resolve().parent}")

    print(f"Projet : {RACINE}")

    if "--verifier" in sys.argv:
        verifier()
        return

    arguments = [a for a in sys.argv[1:] if not a.startswith("--")]
    if not arguments:
        sys.exit(__doc__)

    increment = arguments[0] if arguments[0].startswith("G.") else f"G.{arguments[0]}"
    projet = etat_du_projet(increment)

    print(f"\nEtat a {increment} — {len(projet)} fichier(s)\n")
    for fichier in sorted(projet):
        if "--liste" in sys.argv:
            print(f"   {fichier}  ({len(projet[fichier])} lignes)")
        else:
            print(f"{'=' * 70}\n{fichier}\n{'=' * 70}")
            print("\n".join(projet[fichier]))
            print()


if __name__ == "__main__":
    main()
