package be.ephec.gamehub.jeux.nim;

import java.util.Random;

/**
 * G.19 — CORRIGE.
 *
 * Elle retire un nombre au hasard, dans ce que les regles autorisent.
 *
 * Le Random est un champ, cree une fois. En creer un a chaque appel
 * fonctionnerait, mais deux instances construites dans la meme
 * milliseconde partiraient de la meme graine et joueraient a l'identique.
 */
//@G.19
public class StrategieAleatoire implements StrategieNim {

    private final Random hasard = new Random();

    @Override
    public int combienRetirer(Pile pile, ReglesNim regles) {
        return hasard.nextInt(regles.maximumRetirable(pile)) + 1;
    }

    @Override
    public String toString() {
        return "Aleatoire — retire au hasard";
    }
}
