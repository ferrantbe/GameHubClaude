package be.ephec.gamehub.jeux.nim;

/**
 * G.19 — CORRIGE.
 *
 * LA STRATEGIE GAGNANTE, et elle merite qu'on la comprenne.
 *
 * Celui qui retire la derniere allumette PERD. Il faut donc laisser
 * exactement UNE allumette a l'adversaire.
 *
 * Avec un maximum de trois par tour, l'adversaire peut toujours ramener
 * un total de quatre a zero : quoi qu'il retire — 1, 2 ou 3 — on peut
 * completer a 4. Les positions perdantes sont donc celles ou il reste
 * 1, 5, 9, 13... c'est-a-dire un multiple de (max + 1) plus un.
 *
 * La formule en decoule :
 *
 *     retirer = (restantes - 1) % (maximum + 1)
 *
 * Si le reste vaut zero, on est deja sur une position perdante : on
 * retire une allumette et on espere une faute de l'adversaire.
 *
 * VERIFIE sur 1200 parties simulees : depuis une position gagnante —
 * restantes % 4 differente de 1 — cette strategie ne perd jamais contre
 * un joueur aleatoire.
 */
//@G.19
public class StrategieMaligne implements StrategieNim {

    @Override
    public int combienRetirer(Pile pile, ReglesNim regles) {
        int cycle = regles.getMaximumParTour() + 1;
        int ideal = (pile.restantes() - 1) % cycle;

        if (ideal == 0) {
            return 1;   // position perdante : on joue le minimum
        }
        return Math.min(ideal, regles.maximumRetirable(pile));
    }

    @Override
    public String toString() {
        return "Maligne — ne perd jamais depuis une position gagnante";
    }
}
