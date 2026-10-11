package be.ephec.gamehub.jeux.bataille;

/**
 * G.22 — CORRIGE.
 *
 * Une carte ne change jamais : deux champs final, aucun setter. Un record
 * aurait convenu tout aussi bien — c'est d'ailleurs un bon sujet de
 * discussion avec ENU.4 sous les yeux.
 */
//@G.21
public class Carte {

    private final Valeur valeur;
    private final Couleur couleur;

    public Carte(Valeur valeur, Couleur couleur) {
        this.valeur = valeur;
        this.couleur = couleur;
    }

    public Valeur getValeur() {
        return valeur;
    }

    public Couleur getCouleur() {
        return couleur;
    }

    @Override
    public String toString() {
        return valeur + " de " + couleur;
    }
}
