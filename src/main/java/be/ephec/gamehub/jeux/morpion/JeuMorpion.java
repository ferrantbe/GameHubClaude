package be.ephec.gamehub.jeux.morpion;

import be.ephec.gamehub.jeux.Jeu;
import be.ephec.gamehub.jeux.grille.Marque;
import be.ephec.gamehub.modele.Joueur;
import be.ephec.gamehub.modele.ResultatPartie;
import be.ephec.gamehub.modele.TypeJeu;

import java.util.Scanner;

/**
 * G.29 — CORRIGE.
 *
 * Le premier jeu du hub ou deux humains jouent chacun leur tour. Le Nim
 * faisait jouer deux strategies, la bataille ne demandait rien a
 * personne : ici, il faut lire le clavier a chaque coup.
 *
 * LA BOUCLE DE PARTIE, une bonne fois. On la retrouvera au puissance 4 :
 *
 *     tant que personne n'a gagne et que la grille n'est pas pleine
 *         demander un coup au joueur courant
 *         le poser, ou redemander
 *         changer de joueur
 *
 * Remarquez que la condition d'arret interroge la GRILLE, pas le jeu. Le
 * jeu ne sait pas ce qu'est un alignement, et n'a pas a le savoir.
 */
//@G.29
public class JeuMorpion implements Jeu {

    private final Scanner clavier = new Scanner(System.in);

    @Override
    public TypeJeu getType() {
        return TypeJeu.MORPION;
    }

    @Override
    public ResultatPartie jouer(Joueur joueur1, Joueur joueur2) {
        GrilleMorpion grille = new GrilleMorpion();
        Marque marque = Marque.JOUEUR1;

        while (grille.gagnant() == Marque.VIDE && !grille.estPleine()) {
            System.out.println();
            System.out.println(grille);

            Joueur joueur = (marque == Marque.JOUEUR1) ? joueur1 : joueur2;
            System.out.println(joueur + ", a vous (" + marque + ")");

            if (!jouerUnCoup(grille, marque)) {
                System.out.println("Case occupee ou hors grille. Recommencez.");
                continue;                     // le joueur ne change pas
            }
            marque = (marque == Marque.JOUEUR1) ? Marque.JOUEUR2 : Marque.JOUEUR1;
        }

        System.out.println();
        System.out.println(grille);
        return resultat(grille.gagnant());
    }

    private boolean jouerUnCoup(GrilleMorpion grille, Marque marque) {
        int colonne = demander("Colonne (1 a 3) : ");
        int ligne = demander("Ligne (1 a 3, 1 en bas) : ");
        return grille.poser(colonne - 1, ligne - 1, marque);
    }

    /** Redemande tant que ce n'est pas un nombre. Voir EXC.4. */
    private int demander(String question) {
        while (true) {
            System.out.print(question);
            if (clavier.hasNextInt()) {
                return clavier.nextInt();
            }
            clavier.next();
            System.out.println("Ce n'est pas un nombre.");
        }
    }

    private ResultatPartie resultat(Marque gagnant) {
        return switch (gagnant) {
            case JOUEUR1 -> ResultatPartie.JOUEUR1_GAGNE;
            case JOUEUR2 -> ResultatPartie.JOUEUR2_GAGNE;
            case VIDE -> ResultatPartie.MATCH_NUL;
        };
    }
}
