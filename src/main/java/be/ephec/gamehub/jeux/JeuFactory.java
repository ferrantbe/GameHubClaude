package be.ephec.gamehub.jeux;

import be.ephec.gamehub.jeux.bataille.JeuBatailleV1;   //@G.27
import be.ephec.gamehub.jeux.morpion.JeuMorpion;   //@G.29
import be.ephec.gamehub.jeux.puissance4.JeuPuissance4;   //@G.30
import be.ephec.gamehub.jeux.nim.JeuNim;   //@G.18
import be.ephec.gamehub.jeux.nim.ReglesNim;   //@G.18
import be.ephec.gamehub.modele.TypeJeu;

import java.util.Map;   //@G.32
import java.util.function.Supplier;   //@G.32

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

    // G.32 — la facon de fabriquer chaque jeu, rangee par type. Une valeur   //@G.32
    // n'est pas un jeu, c'est de quoi en fabriquer un neuf a chaque appel.   //@G.32
    private static final Map<TypeJeu, Supplier<Jeu>> CATALOGUE = Map.of(   //@G.32
            TypeJeu.NIM, () -> new JeuNim(ALLUMETTES_NIM, new ReglesNim()),   //@G.32
            TypeJeu.BATAILLE, JeuBatailleV1::new,   //@G.32
            TypeJeu.DEVINE_LE_NOMBRE, JeuDevineLeNombre::new,   //@G.32
            TypeJeu.MORPION, JeuMorpion::new,   //@G.32
            TypeJeu.PUISSANCE4, JeuPuissance4::new);   //@G.32

    public Jeu creer(TypeJeu type) {
        //@G.15-G.17 throw new UnsupportedOperationException("Aucun jeu n'existe encore");
        //@G.18-G.31 return switch (type) {
            //@G.18-G.31 case NIM -> new JeuNim(ALLUMETTES_NIM, new ReglesNim());
            //@G.27-G.31 case BATAILLE -> new JeuBatailleV1();
            //@G.28-G.31 case DEVINE_LE_NOMBRE -> new JeuDevineLeNombre();
            //@G.29-G.31 case MORPION -> new JeuMorpion();
            //@G.30-G.31 case PUISSANCE4 -> new JeuPuissance4();
            //@G.18-G.31 // Un switch sur une enumeration doit couvrir toutes ses
            //@G.18-G.31 // valeurs. Ce cas absorbe celles qui n'ont pas encore de jeu.
            //@G.18-G.31 default -> throw new UnsupportedOperationException(
                    //@G.18-G.31 type + " n'est pas encore implemente");
        //@G.18-G.31 };
        Supplier<Jeu> fabrication = CATALOGUE.get(type);   //@G.32
        if (fabrication == null) {   //@G.32
            throw new UnsupportedOperationException(type + " n'est pas encore implemente");   //@G.32
        }   //@G.32
        return fabrication.get();   //@G.32
    }
}
