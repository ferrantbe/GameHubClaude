package be.ephec.gamehub.jeux.bataille;

import be.ephec.gamehub.modele.Joueur;
import be.ephec.gamehub.modele.ResultatPartie;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

/**
 * G.27 — CORRIGE.
 *
 * La vraie bataille : en cas d'egalite, chaque joueur pose une carte face
 * cachee puis une carte visible, et on recompare. Si les nouvelles cartes
 * visibles sont encore egales, on recommence — d'ou la boucle.
 *
 * TOUT SE JOUE AUTOUR DU POT. Les cartes deposees ne disparaissent plus :
 * elles s'accumulent dans une List, et le vainqueur de la confrontation
 * ramasse le tout. Une bataille a rallonge peut faire changer dix cartes
 * de main d'un coup.
 *
 * CETTE CLASSE HERITE DE JeuBatailleV0 et n'en redefinit qu'une methode.
 * Elle reutilise la comparaison, la distribution, le calcul du resultat
 * et le maximum de tours. C'est exactement ce que le theme ABS cherchait
 * a faire comprendre : ce qui est commun reste en haut.
 *
 * LES DEUX CAS LIMITES, qui font toute la difficulte :
 *
 *   un joueur n'a plus assez de cartes pour miser pendant la bataille.
 *   Il ne peut pas suivre : il perd, et l'autre ramasse le pot ;
 *
 *   les deux se retrouvent a court en meme temps. Personne ne ramasse,
 *   et le pot est perdu pour tout le monde.
 */
//@G.27
public class JeuBatailleV1 extends JeuBatailleV0 {

    /** Nombre de cartes posees face cachee a chaque tour de bataille. */
    private static final int CARTES_CACHEES = 1;

    @Override
    public ResultatPartie jouer(Joueur joueur1, Joueur joueur2) {
        if (joueur1 == null || joueur2 == null) {
            throw new IllegalArgumentException("Une bataille se joue a deux joueurs");
        }

        Deck deck = new Deck();
        deck.shuffle();

        Deque<Carte> piocheJ1 = new ArrayDeque<>();
        Deque<Carte> piocheJ2 = new ArrayDeque<>();
        distribuer(deck, piocheJ1, piocheJ2);

        int tours = 0;
        int batailles = 0;

        while (!piocheJ1.isEmpty() && !piocheJ2.isEmpty() && tours < MAX_TOURS) {
            tours++;

            List<Carte> pot = new ArrayList<>();
            Carte carteJ1 = piocheJ1.pollFirst();
            Carte carteJ2 = piocheJ2.pollFirst();
            pot.add(carteJ1);
            pot.add(carteJ2);

            int comparaison = comparer(carteJ1, carteJ2);

            if (comparaison == 0) {
                batailles++;
                comparaison = resoudreBataille(piocheJ1, piocheJ2, pot);
            }

            ramasser(comparaison, pot, piocheJ1, piocheJ2);
        }

        System.out.printf("%d tour(s) dont %d bataille(s) — %s : %d, %s : %d%n",
                tours, batailles,
                joueur1.getPseudo(), piocheJ1.size(),
                joueur2.getPseudo(), piocheJ2.size());

        return resultat(piocheJ1, piocheJ2);
    }

    /**
     * Resout une bataille, en boucle tant que les cartes visibles restent
     * egales.
     *
     * @return positif si le joueur 1 l'emporte, negatif si c'est le
     *         joueur 2, zero si aucun des deux ne peut suivre
     */
    private int resoudreBataille(Deque<Carte> piocheJ1, Deque<Carte> piocheJ2, List<Carte> pot) {
        while (true) {
            boolean j1PeutSuivre = piocheJ1.size() > CARTES_CACHEES;
            boolean j2PeutSuivre = piocheJ2.size() > CARTES_CACHEES;

            // Il faut CARTES_CACHEES cartes a poser, plus une a retourner.
            if (!j1PeutSuivre && !j2PeutSuivre) {
                return 0;
            }
            if (!j1PeutSuivre) {
                return -1;
            }
            if (!j2PeutSuivre) {
                return 1;
            }

            for (int i = 0; i < CARTES_CACHEES; i++) {
                pot.add(piocheJ1.pollFirst());
                pot.add(piocheJ2.pollFirst());
            }

            Carte visibleJ1 = piocheJ1.pollFirst();
            Carte visibleJ2 = piocheJ2.pollFirst();
            pot.add(visibleJ1);
            pot.add(visibleJ2);

            int comparaison = comparer(visibleJ1, visibleJ2);
            if (comparaison != 0) {
                return comparaison;
            }
            // Encore egales : on recommence, et le pot continue de grossir.
        }
    }

    /**
     * Le vainqueur ramasse tout le pot.
     *
     * Les cartes sont melangees avant d'etre remises sous la pioche.
     * Sans cela, un cycle peut s'installer : les memes cartes reviennent
     * dans le meme ordre, indefiniment, et seul MAX_TOURS arrete la
     * partie. Un vrai joueur ne range pas ses plis dans un ordre choisi.
     *
     * Meme avec ce melange, 3 parties sur 500 atteignent MAX_TOURS lors
     * des simulations. La bataille est un jeu qui peut ne pas finir, et
     * c'est une propriete du jeu, pas un defaut du programme.
     */
    private void ramasser(int comparaison, List<Carte> pot,
                          Deque<Carte> piocheJ1, Deque<Carte> piocheJ2) {
        if (comparaison == 0) {
            return;   // personne ne peut suivre : le pot est perdu
        }

        java.util.Collections.shuffle(pot);
        Deque<Carte> gagnant = comparaison > 0 ? piocheJ1 : piocheJ2;
        for (Carte carte : pot) {
            gagnant.addLast(carte);
        }
    }
}
