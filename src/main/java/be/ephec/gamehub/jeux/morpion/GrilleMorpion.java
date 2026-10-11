package be.ephec.gamehub.jeux.morpion;

import be.ephec.gamehub.jeux.grille.GrilleAlignement;
import be.ephec.gamehub.jeux.grille.Marque;

/**
 * G.29 — CORRIGE.
 *
 * Trois sur trois, trois alignes pour gagner. La classe ne contient que
 * ce qui lui est propre : poser une marque sur une case libre.
 *
 * Tout le reste — la memoire de la grille, la recherche d'alignement,
 * l'affichage — vient de la classe mere.
 */
//@G.29
public class GrilleMorpion extends GrilleAlignement {

    public GrilleMorpion() {
        super(3, 3, 3);
    }

    /**
     * Pose une marque, et rend false si la case n'etait pas libre.
     *
     * Rendre false plutot que lever une exception : un coup invalide au
     * morpion est une erreur de l'utilisateur, pas un defaut du programme.
     * Voir CC-ERR.2 du memento.
     */
    public boolean poser(int colonne, int ligne, Marque marque) {
        if (!dansLaGrille(colonne, ligne) || lire(colonne, ligne) != Marque.VIDE) {
            return false;
        }
        ecrire(colonne, ligne, marque);
        return true;
    }
}
