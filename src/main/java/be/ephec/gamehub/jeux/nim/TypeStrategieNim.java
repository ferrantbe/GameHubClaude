package be.ephec.gamehub.jeux.nim;

/**
 * G.19 — CORRIGE.
 *
 * Le catalogue des strategies proposables a l'utilisateur. Meme role que
 * TypeJeu pour les jeux, et meme benefice : le menu se construit a partir
 * de values(), et ajouter une strategie le fait apparaitre sans toucher
 * a l'affichage.
 */
//@G.19
public enum TypeStrategieNim {

    TIMIDE("Timide"),
    ALEATOIRE("Aleatoire"),
    MALIGNE("Maligne");

    private final String nom;

    TypeStrategieNim(String nom) {
        this.nom = nom;
    }

    @Override
    public String toString() {
        return nom;
    }
}
