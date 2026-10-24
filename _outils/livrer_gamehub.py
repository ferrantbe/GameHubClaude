#!/usr/bin/env python3
"""
livrer_gamehub.py — le fil rouge, livre module par module (24/10/2026).

    python3 _outils/livrer_gamehub.py POO        l'archive du module POO
    python3 _outils/livrer_gamehub.py --toutes   les quinze archives
    python3 _outils/livrer_gamehub.py --verifier compile chaque etat livre

Les etudiants gerent deux projets :

    GameHub              le leur, ou ils ecrivent les increments
    GameHub_correction   la correction officielle, remplacee a chaque seance

Chaque archive (GameHub_Module02_POO.zip, ..., GameHub_fin.zip) contient
un dossier racine GameHub_correction/ : decompressee
dans le dossier parent, elle remplace la correction precedente et ne peut pas
toucher au projet personnel. Elle contient la correction de TOUS les increments
des modules precedents, c'est-a-dire le point de depart du module : l'etat
initial d'un increment est l'etat final du precedent. Le module POO recoit un
projet vide ; la derniere archive (GameHub_fin.zip) la correction finale.

Les modules et leurs increments sont dans livraisons_gamehub.json. L'etat du
code a un increment donne est reconstruit par etats_gamehub.py, a partir des
marqueurs //@G.n du corrige. Une classe de test n'est livree qu'a partir de
l'increment ou elle compile (cle « tests » du manifeste).
"""
import json
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

ICI = Path(__file__).resolve().parent
RACINE = ICI.parent
sys.path.insert(0, str(ICI))
import etats_gamehub  # noqa: E402

DOSSIER = "GameHub_correction"
PAQUET = Path("src/main/java/be/ephec/gamehub")
TESTS = RACINE / "src/test/java/be/ephec/gamehub"
DOCUMENTS = ["GameHub_enonces.docx", "Git_pour_GameHub.docx"]
COMPILATEUR = ["java", "-m", "jdk.compiler/com.sun.tools.javac.Main"]


def manifeste():
    return json.loads((ICI / "livraisons_gamehub.json").read_text(encoding="utf-8"))


def rang(increment):
    return int(increment.split(".")[1])


def dernier_livre(m, num):
    """Le dernier increment corrige au module num : celui des modules d'avant."""
    faits = [i for s in m["modules"] if s["num"] < num for i in s["increments"]]
    return max(faits, key=rang) if faits else None


def lisez_moi(seance, dernier, m):
    suivants = seance["increments"]
    a_faire = (f"Ce module : {suivants[0]} à {suivants[-1]}." if len(suivants) > 1
               else f"Ce module : {suivants[0]}." if suivants else
               "C'est la correction finale du fil rouge.")
    etat = f"la correction de G.1 à {dernier}" if dernier else "aucun code : c'est le projet de départ, vide"
    titre = "correction finale" if seance["module"] == "fin" else f"module {seance['module']}"
    return f"""# GameHub_correction - {titre}

Ce projet contient {etat}. {a_faire}

## Deux projets GameHub

Vous gérez deux projets, côte à côte dans le même dossier :

    GameHub              le vôtre : vous y écrivez les incréments
    GameHub_correction   celui-ci : la correction officielle

Au début de chaque module, une nouvelle archive remplace GameHub_correction
par la correction à jour. Décompressez-la dans le dossier qui contient vos deux
projets : elle ne touche jamais à votre GameHub.

**Au premier module (POO)**, copiez ce dossier une fois sous le nom GameHub :
ce sera votre projet. Ensuite, n'y recopiez rien sans y réfléchir.

## Ouvrir les deux projets

Ouvrez chacun dans sa propre fenêtre IntelliJ (File, Open, son pom.xml).
Ne les ouvrez pas comme deux modules d'un même projet : ils contiennent les
mêmes classes, et IntelliJ les mélangerait.

## Comparer votre code à la correction

Dans votre projet, clic droit sur un fichier, puis Compare With…, et
choisissez le même fichier dans GameHub_correction : les différences
s'affichent côte à côte. C'est la meilleure façon de lire une correction.

## Recopier une classe

Si vous êtes bloqué, vous pouvez recopier une classe de la correction dans
votre projet. Attention : si vos choix diffèrent de ceux de la correction, la
classe recopiée peut demander d'autres classes, ou d'autres méthodes, que
votre projet n'a pas. Recopier une classe, c'est parfois aussi recopier ce
dont elle dépend.

## Votre projet sous Git

Votre GameHub gagne à être sous Git : commitez à la fin de chaque incrément,
et vous pourrez toujours revenir en arrière. Voir _documents/Git_pour_GameHub.docx.

Les énoncés de tous les incréments sont dans _documents/GameHub_enonces.docx.
"""


def nom_archive(seance):
    return "GameHub_fin.zip" if seance["module"] == "fin" else f"GameHub_Module{seance['num']:02d}_{seance['module']}.zip"


def contenu(num):
    """Les entrees de l'archive : (chemin dans l'archive, octets)."""
    m = manifeste()
    seance = next(s for s in m["modules"] if s["num"] == num)
    dernier = dernier_livre(m, num)
    entrees = [(f"{DOSSIER}/pom.xml", (RACINE / "pom.xml").read_bytes())]
    gi = RACINE / ".gitignore"
    if gi.is_file():
        texte = gi.read_text(encoding="utf-8").replace("# Dépôt d'exemple généré par _outils/depot_gamehub.py (contient son propre .git)\ndepot/\n", "")
        entrees.append((f"{DOSSIER}/.gitignore", texte.encode("utf-8")))
    entrees.append((f"{DOSSIER}/README.md", lisez_moi(seance, dernier, m).encode("utf-8")))
    for doc in DOCUMENTS:
        f = RACINE / "_documents" / doc
        if f.is_file():
            entrees.append((f"{DOSSIER}/_documents/{doc}", f.read_bytes()))
    if dernier:
        for rel, lignes in etats_gamehub.etat_du_projet(dernier).items():
            entrees.append((f"{DOSSIER}/{PAQUET}/{rel}", "\n".join(lignes).encode("utf-8")))
        for test, depuis in m.get("tests", {}).items():
            if rang(depuis) <= rang(dernier):
                f = next(TESTS.rglob(test))
                entrees.append((f"{DOSSIER}/src/test/java/be/ephec/gamehub/{f.relative_to(TESTS)}", f.read_bytes()))
    else:
        entrees.append((f"{DOSSIER}/{PAQUET}/.gitkeep", b""))
    return entrees, dernier


def ecrire(num):
    entrees, dernier = contenu(num)
    seance = next(s for s in manifeste()["modules"] if s["num"] == num)
    sortie = RACINE / "livraisons" / nom_archive(seance)
    sortie.parent.mkdir(exist_ok=True)
    with zipfile.ZipFile(sortie, "w", zipfile.ZIP_DEFLATED) as z:
        for chemin, octets in entrees:
            z.writestr(chemin, octets)
    java = sum(1 for c, _ in entrees if c.endswith(".java"))
    print(f"{sortie.relative_to(RACINE)} : correction jusqu'a {dernier or '(rien)'}, {java} fichiers Java")


def verifier():
    """Compile chaque etat livre, tests compris (JavaFX excepte, faute de
    bibliotheque : la fenetre se verifie dans IntelliJ)."""
    m, erreurs = manifeste(), 0
    for s in m["modules"]:
        entrees, dernier = contenu(s["num"])
        if not dernier:
            continue
        with tempfile.TemporaryDirectory() as d:
            sources = []
            for chemin, octets in entrees:
                if chemin.endswith(".java") and "/fenetre/" not in chemin and "/test/" not in chemin:
                    f = Path(d) / chemin
                    f.parent.mkdir(parents=True, exist_ok=True)
                    f.write_bytes(octets)
                    sources.append(str(f))
            r = subprocess.run(COMPILATEUR + ["-d", str(Path(d) / "classes")] + sources, capture_output=True, text=True)
            etat = "compile" if r.returncode == 0 else "ERREUR\n" + r.stderr[:600]
            erreurs += r.returncode != 0
            print(f"{nom_archive(s):26s} (jusqu'a {dernier:5s}) : {etat}")
    sys.exit(1 if erreurs else 0)


def main():
    if "--verifier" in sys.argv:
        verifier()
    elif "--toutes" in sys.argv:
        for s in manifeste()["modules"]:
            ecrire(s["num"])
    elif len(sys.argv) > 1:
        code = sys.argv[1].upper()
        s = next((s for s in manifeste()["modules"] if s["module"].upper() == code), None)
        if s is None:
            sys.exit(f"module inconnu : {sys.argv[1]}")
        ecrire(s["num"])
    else:
        print(__doc__)


if __name__ == "__main__":
    main()
