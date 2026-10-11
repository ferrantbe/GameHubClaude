package be.ephec.gamehub.jeux.puissance4;

import be.ephec.gamehub.jeux.Jeu;
import be.ephec.gamehub.jeux.grille.Marque;
import be.ephec.gamehub.modele.Joueur;
import be.ephec.gamehub.modele.ResultatPartie;
import be.ephec.gamehub.modele.TypeJeu;

import java.util.Scanner;

/**
 * G.30 — CORRIGE.
 *
 * La boucle de partie est celle du morpion, a une difference pres : on ne
 * demande qu'une colonne, puisque la ligne est decidee par la gravite.
 *
 * UNE QUESTION A SE POSER. Cette boucle ressemble beaucoup a celle de
 * JeuMorpion. Faut-il l'extraire a son tour ?
 *
 * La reponse retenue ici est NON, et elle merite d'etre argumentee. Les
 * deux boucles se ressemblent, mais elles ne demandent pas la meme chose
 * a l'utilisateur, et une classe mere commune devrait prevoir les deux
 * cas — donc une methode abstraite « demander un coup », donc une
 * abstraction de plus pour economiser une quinzaine de lignes.
 *
 * La duplication de la GRILLE valait d'etre supprimee : une centaine de
 * lignes, et un algorithme ou l'on se trompe. Celle-ci ne le vaut pas.
 * Savoir ou s'arreter fait partie du metier.
 */
//@G.30
public class JeuPuissance4 implements Jeu {

    private final Scanner clavier = new Scanner(System.in);

    @Override
    public TypeJeu getType() {
        return TypeJeu.PUISSANCE4;
    }

    @Override
    public ResultatPartie jouer(Joueur joueur1, Joueur joueur2) {
        GrillePuissance4 grille = new GrillePuissance4();
        Marque marque = Marque.JOUEUR1;

        while (grille.gagnant() == Marque.VIDE && !grille.estPleine()) {
            System.out.println();
            System.out.println(grille);

            Joueur joueur = (marque == Marque.JOUEUR1) ? joueur1 : joueur2;
            System.out.println(joueur + ", a vous (" + marque + ")");

            if (!grille.laisserTomber(demanderColonne() - 1, marque)) {
                System.out.println("Colonne pleine ou inexistante. Recommencez.");
                continue;
            }
            marque = (marque == Marque.JOUEUR1) ? Marque.JOUEUR2 : Marque.JOUEUR1;
        }

        System.out.println();
        System.out.println(grille);
        return resultat(grille.gagnant());
    }

    private int demanderColonne() {
        while (true) {
            System.out.print("Colonne (1 a 7) : ");
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
