package be.ephec.gamehub.modele;

/**
 * G.6 — CORRIGE.
 *
 * Une enum avec un champ et un constructeur : le libelle destine a
 * l'utilisateur est separe du nom de la constante. NIM se lit bien, mais
 * PUISSANCE4 s'afficherait mal dans un menu.
 *
 * BATAILLE a ete ajoutee en G.14, quand le jeu de bataille est arrive.
 * C'est le genre d'ajout qui ne coute rien ici, et qui casserait tout si
 * le cycle des jeux etait ecrit en cascade de conditions.
 */
//@G.6
public enum TypeJeu {

    NIM("Jeu de Nim"),
    MORPION("Morpion"),
    PUISSANCE4("Puissance 4"),
    BATAILLE("Jeu de bataille"),   //@G.21

    /**
     * G.21 : le premier jeu solitaire du catalogue. C'est lui qui met en
     * defaut le contrat Jeu, prevu pour deux joueurs.
     */
    DEVINE_LE_NOMBRE("Devine le nombre"),   //@G.28

    /** G.22 : le premier jeu graphique. */

    // Le point-virgule termine la liste des constantes. Il est sur sa
    // propre ligne pour que la liste reste valide a tous les increments :
    // une virgule finale avant lui est legale en Java.
    ;

    private final String nom;

    TypeJeu(String nom) {
        this.nom = nom;
    }

    public String getNom() {
        return nom;
    }

    @Override
    public String toString() {
        return nom;
    }
}
