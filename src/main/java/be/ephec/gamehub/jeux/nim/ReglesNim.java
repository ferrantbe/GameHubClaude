package be.ephec.gamehub.jeux.nim;

/**
 * G.16 — CORRIGE.
 *
 * Les regles, separees de la pile et des joueurs.
 *
 * Les avoir isolees ici permet trois choses : jouer une variante en
 * changeant un seul objet, tester les regles sans jouer de partie, et
 * ecrire une strategie qui les interroge au lieu de les supposer.
 */
//@G.16
public class ReglesNim {

    public static final int MAXIMUM_PAR_DEFAUT = 3;

    private final int maximumParTour;

    public ReglesNim() {
        this(MAXIMUM_PAR_DEFAUT);
    }

    public ReglesNim(int maximumParTour) {
        if (maximumParTour < 1) {
            throw new IllegalArgumentException(
                    "On retire au moins une allumette par tour");
        }
        this.maximumParTour = maximumParTour;
    }

    public int getMaximumParTour() {
        return maximumParTour;
    }

    /**
     * Le nombre maximum reellement retirable dans l'etat courant : on ne
     * peut pas retirer trois allumettes d'une pile qui n'en a que deux.
     */
    public int maximumRetirable(Pile pile) {
        return Math.min(maximumParTour, pile.restantes());
    }

    public boolean coupValide(Pile pile, int nombre) {
        return nombre >= 1 && nombre <= maximumRetirable(pile);
    }
}
