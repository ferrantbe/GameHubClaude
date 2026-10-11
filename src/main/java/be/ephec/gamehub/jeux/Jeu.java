package be.ephec.gamehub.jeux;

import be.ephec.gamehub.modele.Joueur;
import be.ephec.gamehub.modele.ResultatPartie;
import be.ephec.gamehub.modele.TypeJeu;

/**
 * ATTENTION — CETTE INTERFACE N'A PAS D'ENONCE NUMEROTE.
 *
 * Elle est decrite dans le deck 04, slide 25, mais aucun exercice G.x ne
 * la fait ecrire. Elle figure ici parce que tout ce qui suit en depend :
 * G.14 a G.20 (la Bataille) comme G.21 et G.22.
 *
 * Elle REMPLACE la classe abstraite Jeu de G.10, dont la signature etait
 * differente — void jouer() avec un champ partie. Les deux conceptions
 * sont incompatibles, et c'est la seconde qui a ete retenue.
 *
 * Responsabilites, telles que le deck les enonce :
 *   TypeJeu getType()
 *   ResultatPartie jouer(Joueur j1, Joueur j2)
 */
//@G.14
public interface Jeu {

    TypeJeu getType();

    ResultatPartie jouer(Joueur joueur1, Joueur joueur2);
}
