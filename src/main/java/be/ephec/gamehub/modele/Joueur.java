package be.ephec.gamehub.modele;

/**
 * G.1 — CORRIGE.
 *
 * Les deux champs sont final : l'enonce demande des donnees immuables, et
 * final le fait respecter par le compilateur plutot que par la discipline.
 *
 * Le format du toString — pseudo <email> — est celui des adresses de
 * courrier. Il est reutilise tel quel par Partie.toString, qui se
 * contente de concatener des Joueur : c'est l'appel a toString qui fait
 * le travail, sans qu'on l'ecrive.
 */
//@G.1
public class Joueur {

    private final String pseudo;
    private final String email;

    public Joueur(String pseudo, String email) {
        this.pseudo = pseudo;
        this.email = email;
    }

    public String getPseudo() {
        return pseudo;
    }

    public String getEmail() {
        return email;
    }

    @Override
    public String toString() {
        return pseudo + " <" + email + ">";
    }
}
