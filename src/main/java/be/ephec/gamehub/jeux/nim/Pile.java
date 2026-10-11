package be.ephec.gamehub.jeux.nim;

/**
 * G.16 — CORRIGE.
 *
 * Une pile d'allumettes. Elle ne connait AUCUNE regle : elle ne sait pas
 * combien on a le droit d'en retirer, ni qui gagne. Elle compte, c'est
 * tout.
 *
 * Ce depouillement est volontaire. Les regles vivent dans ReglesNim, ou
 * elles peuvent changer sans toucher a la pile — et ou elles se testent
 * sans qu'aucune partie ne se joue.
 */
//@G.16
public class Pile {

    private int allumettes;

    public Pile(int allumettesInitiales) {
        if (allumettesInitiales < 1) {
            throw new IllegalArgumentException(
                    "Une pile compte au moins une allumette, pas " + allumettesInitiales);
        }
        this.allumettes = allumettesInitiales;
    }

    public int restantes() {
        return allumettes;
    }

    public boolean estVide() {
        return allumettes == 0;
    }

    /**
     * Retire des allumettes.
     *
     * La pile refuse un retrait impossible plutot que de descendre sous
     * zero. Une pile a -2 allumettes n'existe pas, et laisser l'objet
     * dans cet etat repousserait le probleme jusqu'a un endroit ou plus
     * personne ne saurait d'ou il vient. Voir CC-ERR.1.
     */
    public void retirer(int nombre) {
        if (nombre < 1 || nombre > allumettes) {
            throw new IllegalArgumentException(
                    "Retrait impossible : " + nombre + " sur " + allumettes + " restantes");
        }
        allumettes -= nombre;
    }
}
