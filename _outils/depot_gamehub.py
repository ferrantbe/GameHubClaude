#!/usr/bin/env python3
"""
depot_gamehub.py — fabrique un depot Git du fil rouge, un commit par increment.

    python3 _outils/depot_gamehub.py                dans _demos/depot_gamehub/
    python3 _outils/depot_gamehub.py /un/autre/chemin

Pourquoi un depot GENERE, et non un depot ecrit a la main
---------------------------------------------------------
Un depot ou chaque increment serait un vrai commit semble la solution
evidente, et elle a un defaut redhibitoire : corriger une faute reperee a
G.29 demande de la repercuter sur vingt commits anterieurs, donc un rebase
interactif avec un conflit possible a chaque etape.

Ici, la source reste unique — le code annote de solutions/ — et le depot en
est un PRODUIT. On corrige a un seul endroit, on relance ce script, et les
vingt-neuf commits sont refaits.

Ce qu'on y gagne
----------------
Un etudiant peut faire  git checkout G.7  et avoir le projet tel qu'il devait
etre a cet instant. Et  git diff G.6 G.7  montre exactement ce que l'increment
ajoute — ce qu'aucun document ne montre aussi bien.

Ce qu'il faut savoir avant de le distribuer
-------------------------------------------
Donner ce depot aux etudiants suppose qu'ils sachent, au minimum, cloner et
changer de version. C'est peu, mais ce n'est pas rien — et le cours avait
decide de ne pas demander Git aux etudiants. A rouvrir, ou pas.
"""

import json
import shutil
import subprocess
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from etats_gamehub import RACINE, etat_du_projet, rang   # noqa: E402

TITRES = Path(__file__).resolve().parent / "gamehub_increments.json"


def git(depot, *arguments):
    resultat = subprocess.run(["git", *arguments], cwd=depot,
                              capture_output=True, text=True)
    if resultat.returncode != 0:
        raise RuntimeError(f"git {' '.join(arguments)} : {resultat.stderr.strip()}")
    return resultat.stdout


DOCUMENTS = ["Git_pour_GameHub.docx",
             "GameHub_enonces.docx",
             "GameHub_Solution_Par_Question.docx",
             "GameHub_Solution_Finale.docx"]


def fiche(code, entree):
    """Le texte accompagnant un commit : ce que l'increment demande."""
    lignes = [f"# {code} — {entree['titre']}", ""]
    if entree.get("resume"):
        lignes += [entree["resume"], ""]
    if entree.get("fichiers"):
        lignes.append("## Classes creees ou modifiees")
        lignes.append("")
        lignes += [f"* `{f}`" for f in entree["fichiers"]]
        lignes.append("")
    lignes += [
        "## Voir ce qui a change",
        "",
        "```",
        f"git diff {precedent(code)} {code}",
        "```",
        "",
        "L'enonce complet est dans `_documents/GameHub_enonces.docx`, a la",
        "derniere version du depot.",
        "",
    ]
    return "\n".join(lignes)


def precedent(code):
    n = rang(code)
    return f"G.{n - 1}" if n > 1 else "le commit initial"


def construire(destination):
    titres = json.loads(TITRES.read_text(encoding="utf-8"))

    if destination.exists():
        shutil.rmtree(destination)
    destination.mkdir(parents=True)

    # -b main : sans cela, la branche s'appellerait master ou main selon
    # la configuration de la machine, et le README mentirait.
    git(destination, "init", "-q", "-b", "main")
    git(destination, "config", "user.name", "Fil rouge GameHub")
    git(destination, "config", "user.email", "gamehub@ephec.local")

    # Le README de l'etudiant vit a la racine du projet de travail, sous un
    # nom qui dit qu'il est publie : il se relit et se corrige comme un
    # fichier, sans toucher au script.
    shutil.copy(RACINE / "README_publiable.md", destination / "README.md")
    git(destination, "add", ".")
    git(destination, "commit", "-q", "-m", "Le depot, avant le premier increment")

    paquet = destination / "src" / "main" / "java" / "be" / "ephec" / "gamehub"
    poses = []

    for code in sorted(titres, key=rang):
        projet = etat_du_projet(code)
        if not projet:
            continue

        if paquet.exists():
            shutil.rmtree(paquet)
        for fichier, lignes in projet.items():
            cible = paquet / fichier
            cible.parent.mkdir(parents=True, exist_ok=True)
            cible.write_text("\n".join(lignes) + "\n", encoding="utf-8")

        # La fiche de l'increment accompagne le code, dans le commit.
        (destination / "ETAPE.md").write_text(fiche(code, titres[code]),
                                              encoding="utf-8")

        git(destination, "add", "-A")
        etat = git(destination, "status", "--porcelain")
        if not etat.strip():
            continue        # cet increment ne change aucun fichier

        git(destination, "commit", "-q", "-m", f"{code} — {titres[code]['titre']}")
        git(destination, "tag", code)
        poses.append(code)

    # Les documents rejoignent la derniere version : un etudiant qui reste
    # sur main les a sous la main, et celui qui remonte le temps garde la
    # fiche de l'increment ou il se trouve.
    documents = destination / "_documents"
    documents.mkdir(exist_ok=True)
    source_documents = RACINE / "_documents"
    copies = 0
    for nom in DOCUMENTS:
        origine = source_documents / nom
        if origine.is_file():
            shutil.copy2(origine, documents / nom)
            copies += 1

    diagrammes = destination / "_diagrammes"
    diagrammes.mkdir(exist_ok=True)
    for image in sorted((RACINE / "_diagrammes").glob("*.png")):
        shutil.copy2(image, diagrammes / image.name)

    (destination / "ETAPE.md").unlink(missing_ok=True)
    git(destination, "add", "-A")
    if git(destination, "status", "--porcelain").strip():
        git(destination, "commit", "-q", "-m",
            "Les documents et les diagrammes du fil rouge")

    return poses, copies


def main():
    if RACINE is None:
        sys.exit("Racine du projet introuvable.")

    destination = Path(sys.argv[1]) if len(sys.argv) > 1 \
        else RACINE / "depot"

    print(f"Projet : {RACINE}")
    poses, documents = construire(destination)

    print(f"\n{len(poses)} version(s) dans {destination}")
    print(f"{documents} document(s) joints a la derniere version\n")
    for code in poses:
        print(f"   {code}")
    print("\n   git checkout G.7      pour voir le projet a cet increment")
    print("   git diff G.6 G.7      pour voir ce qu'il a ajoute")


if __name__ == "__main__":
    main()
