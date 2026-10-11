package be.ephec.gamehub.jeux;

import be.ephec.gamehub.jeux.bataille.JeuBatailleV1;   //@G.27
import be.ephec.gamehub.jeux.morpion.JeuMorpion;   //@G.29
import be.ephec.gamehub.jeux.puissance4.JeuPuissance4;   //@G.30
import be.ephec.gamehub.jeux.nim.JeuNim;   //@G.18
import be.ephec.gamehub.jeux.nim.ReglesNim;   //@G.18
import be.ephec.gamehub.modele.TypeJeu;

/**
 * ATTENTION — PAS D'ENONCE NUMEROTE. Decrite dans le deck 04, slide 26.
 *
 * Le patron Fabrique. Son interet tient en une phrase : GameHub ne
 * connait que le type Jeu, et delegue la construction. Aucun import de
 * classe concrete de jeu n'apparait dans GameHub.
 *
 * C'est le seul endroit du programme qui connaisse toutes les classes de
 * jeux. Ajouter un jeu, c'est ajouter une valeur a TypeJeu et un cas ici.
 */
//@G.15
public class JeuFactory {

    /** Le nombre d'allumettes d'une partie de Nim, par defaut. */
    private static final int ALLUMETTES_NIM = 13;   //@G.18

    public Jeu creer(TypeJeu type) {
        //@G.15-G.17 throw new UnsupportedOperationException("Aucun jeu n'existe encore");
        //@G.18
        return switch (type) {
            case NIM -> new JeuNim(ALLUMETTES_NIM, new ReglesNim());
            case BATAILLE -> new JeuBatailleV1();   //@G.27
            case DEVINE_LE_NOMBRE -> new JeuDevineLeNombre();   //@G.28
            case MORPION -> new JeuMorpion();   //@G.29
            case PUISSANCE4 -> new JeuPuissance4();   //@G.30

            // Un switch sur une enumeration doit couvrir toutes ses
            // valeurs. Ce cas absorbe celles qui n'ont pas encore de jeu.
            default -> throw new UnsupportedOperationException(
                    type + " n'est pas encore implemente");
        };
    }
}
