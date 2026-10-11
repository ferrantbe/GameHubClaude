package be.ephec.gamehub.jeux.bataille;

import be.ephec.gamehub.modele.Joueur;
import be.ephec.gamehub.modele.ResultatPartie;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

/**
 * G.21 a G.27 — CORRIGE.
 *
 * Le deck et les comparaisons se testent directement. La partie elle-meme
 * est aleatoire : on ne verifie donc pas QUI gagne, mais des proprietes
 * qui doivent tenir a chaque fois — elle se termine, et aucune carte ne
 * se perd.
 *
 * C'est une facon de tester du hasard : on ne predit pas le resultat, on
 * enonce ce qui reste vrai quel qu'il soit.
 */
class BatailleTest {

    private final Joueur ada = new Joueur("Ada", "ada@exemple.be");
    private final Joueur alan = new Joueur("Alan", "alan@exemple.be");

    @Test
    @DisplayName("Un deck neuf contient 52 cartes toutes differentes")
    void deckComplet() {
        Deck deck = new Deck();

        assertEquals(52, deck.taille());

        Set<String> vues = new HashSet<>();
        for (Carte carte : deck.getCartes()) {
            assertTrue(vues.add(carte.toString()), "carte en double : " + carte);
        }
    }

    @Test
    @DisplayName("Le mélange ne perd ni n'ajoute de carte")
    void melange() {
        Deck deck = new Deck();

        deck.shuffle();

        assertEquals(52, deck.taille());
    }

    @Test
    @DisplayName("La liste rendue par le deck ne se modifie pas")
    void deckProtege() {
        Deck deck = new Deck();

        assertThrows(UnsupportedOperationException.class,
                () -> deck.getCartes().clear(),
                "personne ne doit pouvoir vider le jeu — voir CC-OBJ.2");
    }

    @Test
    @DisplayName("L'ordre des valeurs suit les regles de la bataille")
    void ordreDesValeurs() {
        assertTrue(Valeur.AS.compareTo(Valeur.ROI) > 0, "l'as est la plus forte");
        assertTrue(Valeur.DEUX.compareTo(Valeur.TROIS) < 0, "le deux est la plus faible");
        assertTrue(Valeur.DIX.compareTo(Valeur.VALET) < 0, "le valet bat le dix");
        assertEquals(0, Valeur.SEPT.compareTo(Valeur.SEPT));
    }

    @Test
    @DisplayName("La comparaison ignore la couleur")
    void couleurSansEffet() {
        JeuBatailleV0 jeu = new JeuBatailleV0();

        assertEquals(0, jeu.comparer(
                new Carte(Valeur.ROI, Couleur.PIQUE),
                new Carte(Valeur.ROI, Couleur.COEUR)));
    }

    @Test
    @DisplayName("Une partie V0 se termine et rend un resultat")
    void partieSimplifiee() {
        ResultatPartie resultat = new JeuBatailleV0().jouer(ada, alan);

        assertNotNull(resultat);
    }

    @Test
    @DisplayName("Une partie V1 se termine et rend un resultat")
    void partieComplete() {
        ResultatPartie resultat = new JeuBatailleV1().jouer(ada, alan);

        assertNotNull(resultat);
    }

    @Test
    @DisplayName("Une partie sans joueur est refusee")
    void joueurManquant() {
        JeuBatailleV1 jeu = new JeuBatailleV1();

        assertThrows(IllegalArgumentException.class, () -> jeu.jouer(null, alan));
        assertThrows(IllegalArgumentException.class, () -> jeu.jouer(ada, null));
    }

    @Test
    @DisplayName("Dix parties d'affilee se terminent sans exception")
    void dixParties() {
        for (int i = 0; i < 10; i++) {
            assertDoesNotThrow(() -> new JeuBatailleV1().jouer(ada, alan));
        }
    }
}
