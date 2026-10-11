#!/usr/bin/env python3
"""
diagrammes_gamehub.py — dessine les diagrammes de classes du fil rouge.

Chaque diagramme montre l'etat CUMULE du projet a un increment donne, avec
les elements nouveaux mis en evidence. C'est le but : garder une vue
d'ensemble pendant qu'on ajoute des classes semaine apres semaine.

Sortie : des PNG dans _diagrammes/.
"""

import matplotlib
matplotlib.use("Agg")

import matplotlib.pyplot as plt
from matplotlib.patches import FancyArrowPatch, Rectangle
from pathlib import Path

SORTIE = Path(__file__).resolve().parent.parent / "_diagrammes"
SORTIE.mkdir(exist_ok=True)

ACCENT = "#1F4E79"
NEUF = "#7B9E4B"
GRIS = "#8A8A8A"
FOND_NEUF = "#EEF4E6"
FOND = "#FFFFFF"
FOND_PALI = "#F4F4F4"

# Echelle : combien de pouces vaut une unite de donnees. Elle fixe le
# rapport entre les unites du dessin et la taille des polices, et c'est
# elle qui garantit que le texte tient dans les cadres.
POUCES_PAR_UNITE = 0.62
POINTS_PAR_UNITE = POUCES_PAR_UNITE * 72

# Un diagramme est ramene a la largeur du texte, 6,4 pouces. Plus il est
# large en natif, plus il retrecit — et plus sa police devient illisible.
# Au-dela de cette limite, le corps du texte passerait sous 7,5 points.
LARGEUR_MAX_UNITES = 12.6

HAUTEUR_LIGNE = 0.30
MARGE = 0.16

# ---------------------------------------------------------------------
#  Mesurer le texte plutot que l'estimer
# ---------------------------------------------------------------------
# Estimer la largeur d'une chaine par un nombre de caracteres fois une
# constante donne toujours tort : « StrategieNimFactory » en gras est bien
# plus large que « lilliputien » de meme longueur. On demande donc a
# matplotlib de mesurer, une fois pour toutes.

_figure_mesure = plt.figure(figsize=(1, 1))
_rendu = _figure_mesure.canvas.get_renderer()
_cache = {}


def largeur_texte(texte, taille, gras=False, mono=False, italique=False):
    """Largeur reelle du texte, en unites de dessin."""
    cle = (texte, taille, gras, mono, italique)
    if cle not in _cache:
        artiste = _figure_mesure.text(
            0, 0, texte, fontsize=taille,
            fontweight="bold" if gras else "normal",
            family="monospace" if mono else "sans-serif",
            style="italic" if italique else "normal")
        points = artiste.get_window_extent(renderer=_rendu).width \
            / _figure_mesure.dpi * 72
        artiste.remove()
        _cache[cle] = points / POINTS_PAR_UNITE
    return _cache[cle]


class Boite:
    """Une classe, interface ou enum du diagramme."""

    def __init__(self, nom, x, y, membres=(), stereotype=None,
                 neuf=False, pali=False):
        self.nom = nom
        self.x = x
        self.y = y
        self.membres = list(membres)
        self.stereotype = stereotype
        self.neuf = neuf
        self.pali = pali

    @property
    def largeur(self):
        """La plus large des trois familles de texte decide."""
        besoins = [largeur_texte(self.nom, 9.2, gras=True)]
        if self.stereotype:
            besoins.append(largeur_texte(f"«{self.stereotype}»", 7.2, italique=True))
        besoins += [largeur_texte(m, 7.6, mono=True) for m in self.membres]
        return max(1.6, max(besoins) + 2 * MARGE)

    @property
    def hauteur(self):
        lignes = 1 + (1 if self.stereotype else 0) + len(self.membres)
        return lignes * HAUTEUR_LIGNE + 2 * MARGE + (0.06 if self.membres else 0)

    def centre(self):
        return self.x + self.largeur / 2, self.y - self.hauteur / 2

    def bord(self, vers):
        """Point du bord de la boite en direction d'un point donne."""
        cx, cy = self.centre()
        dx, dy = vers[0] - cx, vers[1] - cy
        if dx == 0 and dy == 0:
            return cx, cy
        demi_l, demi_h = self.largeur / 2, self.hauteur / 2
        if abs(dx) * demi_h > abs(dy) * demi_l:
            t = demi_l / abs(dx)
        else:
            t = demi_h / abs(dy)
        return cx + dx * t, cy + dy * t


def dessiner_boite(ax, boite):
    couleur_bord = NEUF if boite.neuf else (GRIS if boite.pali else ACCENT)
    couleur_fond = FOND_NEUF if boite.neuf else (FOND_PALI if boite.pali else FOND)
    epaisseur = 1.8 if boite.neuf else 1.0

    ax.add_patch(Rectangle((boite.x, boite.y - boite.hauteur),
                           boite.largeur, boite.hauteur,
                           facecolor=couleur_fond, edgecolor=couleur_bord,
                           linewidth=epaisseur, zorder=2))

    y = boite.y - MARGE - HAUTEUR_LIGNE * 0.72
    centre_x = boite.x + boite.largeur / 2

    if boite.stereotype:
        ax.text(centre_x, y, f"«{boite.stereotype}»", ha="center", va="center",
                fontsize=7.2, style="italic",
                color=GRIS if boite.pali else couleur_bord, zorder=3)
        y -= HAUTEUR_LIGNE

    ax.text(centre_x, y, boite.nom, ha="center", va="center",
            fontsize=9.2, fontweight="bold",
            color=GRIS if boite.pali else couleur_bord, zorder=3)
    y -= HAUTEUR_LIGNE

    if boite.membres:
        separateur = y + HAUTEUR_LIGNE * 0.42
        ax.plot([boite.x, boite.x + boite.largeur], [separateur, separateur],
                color=couleur_bord, linewidth=0.8, zorder=3)
        for membre in boite.membres:
            ax.text(boite.x + MARGE, y, membre, ha="left", va="center",
                    fontsize=7.6, family="monospace",
                    color=GRIS if boite.pali else "#333333", zorder=3)
            y -= HAUTEUR_LIGNE


STYLES = {
    # (style de trait, tete de fleche, remplissage)
    "herite":     ("-",  "-|>", "white"),   # extends
    "implemente": ("--", "-|>", "white"),   # implements
    "utilise":    ("--", "->",  None),      # dependance
    "possede":    ("-",  "->",  None),      # association
}


def dessiner_lien(ax, depuis, vers, genre="utilise", etiquette=None, neuf=False):
    trait, tete, _ = STYLES[genre]
    couleur = NEUF if neuf else GRIS

    depart = depuis.bord(vers.centre())
    arrivee = vers.bord(depuis.centre())

    fleche = FancyArrowPatch(depart, arrivee,
                             arrowstyle=tete, linestyle=trait,
                             mutation_scale=13, linewidth=1.1,
                             color=couleur, shrinkA=0, shrinkB=0, zorder=1)
    ax.add_patch(fleche)

    if etiquette:
        mx = (depart[0] + arrivee[0]) / 2
        my = (depart[1] + arrivee[1]) / 2
        ax.text(mx, my + 0.10, etiquette, ha="center", va="bottom",
                fontsize=6.8, style="italic", color=couleur,
                bbox=dict(boxstyle="round,pad=0.12", facecolor="white",
                          edgecolor="none"), zorder=4)


def dessiner(nom_fichier, boites, liens=(), titre=None):
    """La taille de la figure se DEDUIT de l'etendue du dessin.

    Sans cela, matplotlib elargit les limites pour respecter l'aspect
    carre, l'echelle change, et le texte deborde des cadres.
    """
    xs, ys = [], []
    for b in boites.values():
        xs += [b.x - 0.35, b.x + b.largeur + 0.35]
        ys += [b.y - b.hauteur - 0.35, b.y + 0.35]
    x0, x1 = min(xs), max(xs)
    y0, y1 = min(ys), max(ys)
    if titre:
        y1 += 0.75

    fig = plt.figure(
        figsize=((x1 - x0) * POUCES_PAR_UNITE, (y1 - y0) * POUCES_PAR_UNITE))

    # Les axes occupent TOUTE la figure. Avec les marges par defaut de
    # matplotlib, la zone de dessin serait plus petite que la figure :
    # l'echelle se comprimerait, et le texte deborderait des cadres.
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_axis_off()

    for boite in boites.values():
        dessiner_boite(ax, boite)
    for depuis, vers, genre, etiquette, neuf in liens:
        dessiner_lien(ax, boites[depuis], boites[vers], genre, etiquette, neuf)

    if titre:
        ax.text(x0 + 0.2, y1 - 0.32, titre, ha="left", va="center",
                fontsize=10.5, fontweight="bold", color=ACCENT)

    ax.set_xlim(x0, x1)
    ax.set_ylim(y0, y1)
    ax.set_aspect("equal", adjustable="box")

    chemin = SORTIE / nom_fichier
    fig.savefig(chemin, dpi=190, facecolor="white")
    plt.close(fig)
    return chemin


# =====================================================================
#  Les diagrammes, dans l'ordre du fascicule
# =====================================================================

def g03():
    b = {
        "Joueur": Boite("Joueur", 0, 3.2,
                        ["- pseudo : String", "- email : String",
                         "+ getPseudo()", "+ getEmail()", "+ toString()"], neuf=True),
        "Partie": Boite("Partie", 4.2, 3.2,
                        ["- joueur1 : Joueur", "- joueur2 : Joueur",
                         "+ toString()"], neuf=True),
        "GameHub": Boite("GameHub", 4.2, 0.9, ["+ main(String[])"], neuf=True),
    }
    liens = [("Partie", "Joueur", "possede", "2", True),
             ("GameHub", "Partie", "utilise", "cree", True)]
    return dessiner("g03.png", b, liens,
                    "G.1 a G.3 — les trois premieres classes")


def g05():
    b = {
        "hub": Boite("be.ephec.gamehub", 0, 2.6, ["GameHub"], stereotype="package"),
        "modele": Boite("be.ephec.gamehub.modele", 0, 1.0,
                        ["Joueur", "Partie"], stereotype="package", neuf=True),
    }
    liens = [("hub", "modele", "utilise", None, True)]
    return dessiner("g05.png", b, liens,
                    "G.5 — le decoupage en packages")


def g09():
    b = {
        "Joueur": Boite("Joueur", 0, 3.6, ["- pseudo", "- email"]),
        "Partie": Boite("Partie", 4.0, 4.3,
                        ["- typeJeu : TypeJeu", "- resultat : ResultatPartie",
                         "- dateHeureDebut", "- dateHeureFin",
                         "+ terminer(ResultatPartie)"]),
        "TypeJeu": Boite("TypeJeu", 9.2, 4.3,
                         ["NIM", "MORPION", "PUISSANCE4"],
                         stereotype="enumeration", neuf=True),
        "Resultat": Boite("ResultatPartie", 9.2, 2.5,
                          ["JOUEUR1_GAGNE", "JOUEUR2_GAGNE", "MATCH_NUL"],
                          stereotype="enumeration", neuf=True),
        "Resume": Boite("ResumePartie", 4.0, 1.3,
                        ["pseudoGagnant", "debut", "fin", "typeJeu"],
                        stereotype="record", neuf=True),
        "GameHub": Boite("GameHub", 0, 1.3, ["+ main(String[])"]),
    }
    liens = [("Partie", "Joueur", "possede", "2", False),
             ("Partie", "TypeJeu", "possede", None, True),
             ("Partie", "Resultat", "possede", None, True),
             ("Partie", "Resume", "utilise", "cree", True),
             ("GameHub", "Partie", "utilise", None, False)]
    return dessiner("g09.png", b, liens,
                    "G.6 a G.9 — les enumerations et le record")


def g13():
    b = {
        "Partie": Boite("Partie", 0, 4.4,
                        ["- observateurs : List<ObservateurPartie>",
                         "+ ajouterObservateur(...)", "+ retirerObservateur(...)",
                         "- notifierDebut()", "- notifierCoup()", "- notifierFin()"]),
        "Obs": Boite("ObservateurPartie", 6.8, 4.4,
                     ["+ onDebut(Partie)", "+ onCoup(Partie)", "+ onFin(Partie)"],
                     stereotype="interface", neuf=True),
        "Journal": Boite("JournalParties", 6.8, 1.7,
                         ["- coups : int", "+ onDebut(Partie)"], neuf=True),
        "Jeu": Boite("Jeu", 0, 1.4,
                     ["# partie : Partie", "+ jouer()"],
                     stereotype="abstract", neuf=True),
    }
    liens = [("Partie", "Obs", "possede", "0..*", True),
             ("Journal", "Obs", "implemente", None, True),
             ("Jeu", "Partie", "possede", None, True)]
    return dessiner("g13.png", b, liens,
                    "G.10 a G.13 — la classe abstraite et les observateurs")


def g15():
    b = {
        "GameHub": Boite("GameHub", 0, 3.8, ["+ main(String[])"]),
        "Jeu": Boite("Jeu", 4.6, 4.2,
                     ["+ getType() : TypeJeu",
                      "+ jouer(Joueur, Joueur) : ResultatPartie"],
                     stereotype="interface", neuf=True),
        "Factory": Boite("JeuFactory", 4.6, 1.9,
                         ["+ creer(TypeJeu) : Jeu"], neuf=True),
        "Ancien": Boite("Jeu", 0, 1.9,
                        ["# partie : Partie", "+ jouer()"],
                        stereotype="abstract — supprimee", pali=True),
    }
    liens = [("GameHub", "Jeu", "utilise", None, True),
             ("GameHub", "Factory", "utilise", None, True),
             ("Factory", "Jeu", "utilise", "cree", True)]
    return dessiner("g15.png", b, liens,
                    "G.14 et G.15 — l'interface remplace la classe abstraite")


def g20():
    b = {
        "Jeu": Boite("Jeu", 0, 6.0, ["+ getType()", "+ jouer(Joueur, Joueur)"],
                     stereotype="interface"),
        "Conf": Boite("JeuConfigurable", 0, 3.9, ["+ configure(Scanner)"],
                      stereotype="interface", neuf=True),
        "JeuNim": Boite("JeuNim", 4.5, 5.6,
                        ["- allumettesInitiales : int", "- regles : ReglesNim",
                         "- strategieJoueur1", "- strategieJoueur2"], neuf=True),
        "Pile": Boite("Pile", 8.6, 6.2,
                      ["- allumettes : int", "+ restantes()", "+ retirer(int)"], neuf=True),
        "Regles": Boite("ReglesNim", 8.6, 4.1,
                        ["- maximumParTour : int", "+ maximumRetirable(Pile)",
                         "+ coupValide(Pile, int)"], neuf=True),
        "Strat": Boite("StrategieNim", 4.0, 2.3,
                       ["+ combienRetirer(Pile, ReglesNim)"],
                       stereotype="interface", neuf=True),
        "Timide": Boite("StrategieTimide", 0, 0.6, [], neuf=True),
        "Alea": Boite("StrategieAleatoire", 3.5, 0.6, [], neuf=True),
        "Malin": Boite("StrategieMaligne", 7.6, 0.6, [], neuf=True),
        "SFact": Boite("StrategieNimFactory", 8.6, 2.1,
                       ["+ creer(TypeStrategieNim)"], neuf=True),
    }
    liens = [("JeuNim", "Jeu", "implemente", None, True),
             ("JeuNim", "Conf", "implemente", None, True),
             ("JeuNim", "Pile", "utilise", None, True),
             ("JeuNim", "Regles", "possede", None, True),
             ("JeuNim", "Strat", "possede", "2", True),
             ("Timide", "Strat", "implemente", None, True),
             ("Alea", "Strat", "implemente", None, True),
             ("Malin", "Strat", "implemente", None, True),
             ("SFact", "Strat", "utilise", "cree", True)]
    return dessiner("g20.png", b, liens,
                    "G.16 a G.20 — le jeu de Nim et ses strategies")


def g27():
    b = {
        "Jeu": Boite("Jeu", 0, 4.6, ["+ getType()", "+ jouer(Joueur, Joueur)"],
                     stereotype="interface"),
        "V0": Boite("JeuBatailleV0", 3.8, 5.2,
                    ["# MAX_TOURS : int", "# comparer(Carte, Carte)",
                     "# distribuer(...)", "# resultat(...)"],
                    neuf=True),
        "V1": Boite("JeuBatailleV1", 3.8, 2.3,
                    ["- resoudreBataille(...)", "- ramasser(...)"], neuf=True),
        "Deck": Boite("Deck", 8.4, 5.5,
                      ["- cartes : List<Carte>", "+ shuffle()"], neuf=True),
        "Carte": Boite("Carte", 8.6, 3.5,
                       ["- valeur", "- couleur"], neuf=True),
        "Valeur": Boite("Valeur", 8.6, 1.5,
                        ["DEUX ... AS"], stereotype="enumeration", neuf=True),
        "Couleur": Boite("Couleur", 8.6, -0.5,
                         ["PIQUE ... TREFLE"], stereotype="enumeration", neuf=True),
    }
    liens = [("V0", "Jeu", "implemente", None, True),
             ("V1", "V0", "herite", None, True),
             ("V0", "Deck", "utilise", None, True),
             ("Deck", "Carte", "possede", "52", True),
             ("Carte", "Valeur", "possede", None, True),
             ("Carte", "Couleur", "possede", None, True)]
    return dessiner("g27.png", b, liens,
                    "G.21 a G.27 — le jeu de bataille")


def g28():
    b = {
        "Jeu": Boite("Jeu", 0, 4.4, ["+ getType()", "+ jouer(Joueur, Joueur)"],
                     stereotype="interface"),
        "Devine": Boite("JeuDevineLeNombre", 4.4, 5.4,
                        ["- essaisAutorises : int"], neuf=True),
    }
    liens = [("Devine", "Jeu", "implemente", None, True)]
    return dessiner("g28.png", b, liens,
                    "G.28 — un jeu qui se joue seul")


def g30():
    b = {
        "Jeu": Boite("Jeu", 0, 7.4, ["+ jouer(Joueur, Joueur)"],
                     stereotype="interface"),
        "JeuMorpion": Boite("JeuMorpion", 0, 4.8, [], neuf=True),
        "JeuP4": Boite("JeuPuissance4", 0, 1.9, [], neuf=True),
        "Base": Boite("GrilleAlignement", 4.4, 8.0,
                      ["- cases : Marque[][]", "- alignement : int",
                       "+ gagnant()", "+ estPleine()", "# ecrire(int, int, Marque)"],
                      stereotype="abstraite", neuf=True),
        "Morpion": Boite("GrilleMorpion", 2.9, 4.0,
                         ["+ poser(int, int, Marque)"], neuf=True),
        "P4": Boite("GrillePuissance4", 7.7, 1.6,
                    ["+ laisserTomber(int, Marque)"], neuf=True),
        "Marque": Boite("Marque", 9.8, 7.2, ["VIDE", "JOUEUR1", "JOUEUR2"],
                        stereotype="enumeration", neuf=True),
    }
    liens = [("JeuMorpion", "Jeu", "implemente", None, True),
             ("JeuP4", "Jeu", "implemente", None, True),
             ("Morpion", "Base", "herite", None, True),
             ("P4", "Base", "herite", None, True),
             ("JeuMorpion", "Morpion", "utilise", None, True),
             ("JeuP4", "P4", "utilise", None, True),
             ("Base", "Marque", "utilise", None, True)]
    return dessiner("g30.png", b, liens,
                    "G.29 et G.30 — une grille ecrite une fois, deux jeux")


def ensemble():
    b = {
        "hub": Boite("be.ephec.gamehub", 0, 5.6, ["GameHub"], stereotype="package"),
        "modele": Boite("…modele", 4.6, 6.4,
                        ["Joueur", "Partie", "TypeJeu",
                         "ResultatPartie", "ResumePartie"], stereotype="package"),
        "obs": Boite("…observateurs", 0, 3.6,
                     ["ObservateurPartie", "JournalParties"], stereotype="package"),
        "jeux": Boite("…jeux", 4.6, 3.4,
                      ["Jeu", "JeuConfigurable", "JeuFactory",
                       "JeuDevineLeNombre"], stereotype="package"),
        "nim": Boite("…jeux.nim", 0, 0.9,
                     ["Pile", "ReglesNim", "JeuNim", "StrategieNim…"],
                     stereotype="package"),
        "bataille": Boite("…jeux.bataille", 4.6, 0.9,
                          ["Deck", "Carte", "Valeur",
                           "JeuBatailleV0", "JeuBatailleV1"], stereotype="package"),
        "grille": Boite("…jeux.grille", 9.4, 6.4,
                        ["Marque", "GrilleAlignement"], stereotype="package"),
        "morpion": Boite("…jeux.morpion", 9.4, 4.4,
                         ["GrilleMorpion", "JeuMorpion"], stereotype="package"),
        "p4": Boite("…jeux.puissance4", 9.4, 2.6,
                    ["GrillePuissance4", "JeuPuissance4"], stereotype="package"),
    }
    liens = [("hub", "modele", "utilise", None, False),
             ("hub", "jeux", "utilise", None, False),
             ("hub", "obs", "utilise", None, False),
             ("jeux", "nim", "utilise", None, False),
             ("jeux", "bataille", "utilise", None, False),
             ("jeux", "morpion", "utilise", None, False),
             ("jeux", "p4", "utilise", None, False),
             ("morpion", "grille", "utilise", None, False),
             ("p4", "grille", "utilise", None, False),
             ("modele", "obs", "utilise", None, False)]
    return dessiner("ensemble.png", b, liens,
                    "L'ensemble, a la fin du fil rouge")


if __name__ == "__main__":
    for fabrique in (g03, g05, g09, g13, g15, g20, g27, g28, g30, ensemble):
        chemin = fabrique()
        print(f"  {chemin.name}")
