package be.ephec.gamehub.jeux.nim;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

/**
 * G.16 a G.19 — CORRIGE : les regles et les strategies se testent sans
 * qu'aucune partie ne se joue.
 *
 * C'est le benefice direct de les avoir separees de JeuNim. Une strategie
 * est une fonction de la pile et des regles vers un nombre : rien de plus
 * facile a verifier.
 */
class StrategieNimTest {

    private final ReglesNim regles = new ReglesNim();

    @Test
    @DisplayName("Une pile refuse un retrait impossible")
    void pileRefuseLimpossible() {
        Pile pile = new Pile(3);

        assertThrows(IllegalArgumentException.class, () -> pile.retirer(4));
        assertThrows(IllegalArgumentException.class, () -> pile.retirer(0));
        assertEquals(3, pile.restantes(), "un retrait refuse ne change rien");
    }

    @Test
    @DisplayName("Le maximum retirable tient compte de ce qui reste")
    void maximumRetirable() {
        assertEquals(3, regles.maximumRetirable(new Pile(10)));
        assertEquals(2, regles.maximumRetirable(new Pile(2)),
                "on ne retire pas trois allumettes d'une pile qui en a deux");
    }

    @Test
    @DisplayName("La timide retire toujours une allumette")
    void timide() {
        StrategieNim timide = new StrategieTimide();

        assertEquals(1, timide.combienRetirer(new Pile(20), regles));
        assertEquals(1, timide.combienRetirer(new Pile(1), regles));
    }

    @Test
    @DisplayName("L'aleatoire reste dans les clous")
    void aleatoire() {
        StrategieNim aleatoire = new StrategieAleatoire();

        for (int essai = 0; essai < 200; essai++) {
            Pile pile = new Pile(2);
            int retire = aleatoire.combienRetirer(pile, regles);

            assertTrue(retire >= 1 && retire <= 2,
                    "avec deux allumettes, on retire une ou deux — jamais trois");
        }
    }

    @Test
    @DisplayName("La maligne laisse une position perdante a l'adversaire")
    void maligne() {
        StrategieNim maligne = new StrategieMaligne();

        // Positions gagnantes : elle ramene le reste a 1 modulo 4.
        assertEquals(2, maligne.combienRetirer(new Pile(7), regles));
        assertEquals(3, maligne.combienRetirer(new Pile(4), regles));
        assertEquals(2, maligne.combienRetirer(new Pile(3), regles));

        for (int restantes : new int[]{7, 4, 3, 10, 12, 20}) {
            int retire = maligne.combienRetirer(new Pile(restantes), regles);
            assertEquals(1, (restantes - retire) % 4,
                    "depuis " + restantes + ", elle doit laisser 1 modulo 4");
        }
    }

    @Test
    @DisplayName("Depuis une position perdante, la maligne joue le minimum")
    void malignePositionPerdante() {
        StrategieNim maligne = new StrategieMaligne();

        for (int restantes : new int[]{5, 9, 13}) {
            assertEquals(1, maligne.combienRetirer(new Pile(restantes), regles),
                    "en " + restantes + " elle ne peut rien forcer : elle joue 1");
        }
    }

    @Test
    @DisplayName("La fabrique rend une strategie pour chaque type")
    void fabrique() {
        StrategieNimFactory fabrique = new StrategieNimFactory();

        for (TypeStrategieNim type : TypeStrategieNim.values()) {
            assertNotNull(fabrique.creer(type), type + " n'a pas de strategie");
        }
    }

    @Test
    @DisplayName("Aucune strategie ne propose un coup interdit")
    void aucunCoupInterdit() {
        StrategieNimFactory fabrique = new StrategieNimFactory();

        for (TypeStrategieNim type : TypeStrategieNim.values()) {
            StrategieNim strategie = fabrique.creer(type);
            for (int restantes = 1; restantes <= 20; restantes++) {
                Pile pile = new Pile(restantes);
                int retire = strategie.combienRetirer(pile, regles);

                assertTrue(regles.coupValide(pile, retire),
                        type + " propose " + retire + " sur " + restantes + " restantes");
            }
        }
    }
}
