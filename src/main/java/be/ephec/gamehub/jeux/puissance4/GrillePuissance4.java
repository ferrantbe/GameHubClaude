package be.ephec.gamehub.jeux.puissance4;

import be.ephec.gamehub.jeux.grille.GrilleAlignement;
import be.ephec.gamehub.jeux.grille.Marque;

/**
 * G.30 — CORRIGE.
 *
 * Sept colonnes, six lignes, quatre marques alignees pour gagner.
 *
 * COMPTEZ LES LIGNES QUE VOUS N'AVEZ PAS ECRITES. Pas de tableau, pas de
 * recherche d'alignement, pas d'affichage, pas de test de grille pleine.
 * Tout cela a ete ecrit une fois, a l'increment precedent, pour un jeu
 * qui n'avait pourtant ni la meme taille ni la meme regle.
 *
 * Ce qui reste ici est le seul comportement propre au puissance 4 : une
 * marque tombe au fond de sa colonne.
 */
//@G.30
public class GrillePuissance4 extends GrilleAlignement {

    public GrillePuissance4() {
        super(7, 6, 4);
    }

    /**
     * Laisse tomber une marque dans une colonne, et rend false si la
     * colonne est pleine ou n'existe pas.
     *
     * On cherche la premiere case libre EN PARTANT DU BAS : c'est la
     * gravite, et c'est tout le jeu.
     */
    public boolean laisserTomber(int colonne, Marque marque) {
        if (colonne < 0 || colonne >= getColonnes()) {
            return false;
        }
        for (int ligne = 0; ligne < getLignes(); ligne++) {
            if (lire(colonne, ligne) == Marque.VIDE) {
                ecrire(colonne, ligne, marque);
                return true;
            }
        }
        return false;
    }
}
