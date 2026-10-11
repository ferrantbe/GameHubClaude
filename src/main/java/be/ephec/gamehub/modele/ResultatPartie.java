package be.ephec.gamehub.modele;

/**
 * G.6 — CORRIGE.
 *
 * Trois valeurs, et pas une de plus : c'est exactement ce qu'un jeu a
 * deux joueurs peut produire.
 *
 * Cette enum est le point de friction de G.21 : un jeu solitaire n'a
 * aucune des trois a proposer.
 */
//@G.6
public enum ResultatPartie {

    JOUEUR1_GAGNE("Le joueur 1 gagne"),
    JOUEUR2_GAGNE("Le joueur 2 gagne"),
    MATCH_NUL("Match nul");

    private final String libelle;

    ResultatPartie(String libelle) {
        this.libelle = libelle;
    }

    @Override
    public String toString() {
        return libelle;
    }
}
