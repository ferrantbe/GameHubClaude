package be.ephec.gamehub.jeux.bataille;

/**
 * G.22 — CORRIGE.
 *
 * L'ORDRE DE DECLARATION EST TOUT L'EXERCICE.
 *
 * En ENU.3, l'enum Value commencait par AS, parce qu'on la lisait comme
 * un jeu de cartes ordinaire. Ici elle commence par DEUX et finit par AS,
 * parce qu'a la bataille l'as est la carte la plus forte.
 *
 * Ce simple changement d'ordre fait que
 *
 *     c1.getValeur().compareTo(c2.getValeur())
 *
 * rend exactement ce que les regles du jeu demandent : negatif si la
 * premiere carte est plus faible, positif si elle est plus forte.
 *
 * compareTo sur une enum compare les ordinal(), c'est-a-dire les
 * positions de declaration. On n'ecrit donc aucune comparaison : l'ordre
 * dans lequel on a tape les constantes fait le travail.
 */
//@G.21
public enum Valeur {

    DEUX("2"), TROIS("3"), QUATRE("4"), CINQ("5"), SIX("6"), SEPT("7"),
    HUIT("8"), NEUF("9"), DIX("10"), VALET("Valet"), DAME("Dame"),
    ROI("Roi"), AS("As");

    private final String libelle;

    Valeur(String libelle) {
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
