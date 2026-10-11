package be.ephec.gamehub.jeux.bataille;

/**
 * G.22 — CORRIGE.
 *
 * Reprise telle quelle de ENU.3 : une enum avec un champ et un
 * constructeur. Elle n'intervient pas dans les regles de la bataille,
 * ou seule la valeur compte — mais une carte sans couleur n'est pas une
 * carte.
 */
//@G.21
public enum Couleur {

    PIQUE("Pique"),
    COEUR("Coeur"),
    CARREAU("Carreau"),
    TREFLE("Trefle");

    private final String libelle;

    Couleur(String libelle) {
        this.libelle = libelle;
    }

    public String getLibelle() {
        return libelle;
    }

    @Override
    public String toString() {
        return libelle;
    }
}
