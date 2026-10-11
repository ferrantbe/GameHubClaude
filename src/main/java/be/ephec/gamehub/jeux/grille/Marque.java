package be.ephec.gamehub.jeux.grille;

/**
 * G.29 — CORRIGE.
 *
 * Ce qu'une case peut contenir. VIDE en fait partie : sans elle, il
 * faudrait un null, et chaque lecture devrait s'en mefier.
 *
 * Elle vit dans le package grille, et non dans morpion, parce qu'elle ne
 * doit rien au morpion. Le puissance 4 l'emploiera telle quelle.
 */
//@G.29
public enum Marque {

    VIDE(" "),
    JOUEUR1("X"),
    JOUEUR2("O");

    private final String symbole;

    Marque(String symbole) {
        this.symbole = symbole;
    }

    @Override
    public String toString() {
        return symbole;
    }
}
