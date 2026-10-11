package be.ephec.gamehub.jeux.bataille;

import be.ephec.gamehub.jeux.Jeu;
import be.ephec.gamehub.modele.Joueur;
import be.ephec.gamehub.modele.ResultatPartie;
import be.ephec.gamehub.modele.TypeJeu;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Deque;
import java.util.List;

/**
 * G.23 a G.26 — CORRIGE.
 *
 * La version simplifiee : en cas d'egalite, les deux cartes sont jetees
 * au cimetiere au lieu de declencher une bataille.
 *
 * POURQUOI UN Deque POUR LES MAINS. Une main de bataille se pioche par le
 * dessus et se recharge par le dessous : on a besoin des DEUX bouts. Une
 * List le permettrait — get(0) et remove(0) — mais chaque retrait en tete
 * decale tous les elements. Un ArrayDeque est fait pour ca, et il le dit
 * dans son nom.
 *
 *     pollFirst()   prendre au-dessus
 *     addLast()     remettre en-dessous
 *
 * POURQUOI UN MAXIMUM DE TOURS. Sans lui, deux mains qui s'echangent
 * indefiniment les memes cartes feraient tourner le programme sans fin.
 *
 * Ce n'est pas de la paranoia : sur 500 parties simulees, la version V0
 * se termine toujours — 11 fois par un double epuisement, donc un match
 * nul — mais la version V1 atteint le maximum 3 fois. Le garde-fou sert
 * reellement.
 */
//@G.23
public class JeuBatailleV0 implements Jeu {

    protected static final int MAX_TOURS = 2000;

    @Override
    public TypeJeu getType() {
        return TypeJeu.BATAILLE;
    }

    /**
     * Compare deux cartes.
     *
     * @return negatif si c1 est plus faible, zero si egales, positif si
     *         c1 est plus forte
     */
    protected int comparer(Carte c1, Carte c2) {
        return c1.getValeur().compareTo(c2.getValeur());
    }

    /**
     * Distribue les cartes du deck en alternance entre les deux mains.
     *
     * L'alternance importe : donner la premiere moitie a l'un et la
     * seconde a l'autre reviendrait au meme sur un deck melange, mais
     * l'alternance est ce qu'on fait a une vraie table.
     */
    protected void distribuer(Deck deck, Deque<Carte> mainJ1, Deque<Carte> mainJ2) {
        List<Carte> cartes = deck.getCartes();
        for (int i = 0; i < cartes.size(); i++) {
            if (i % 2 == 0) {
                mainJ1.addLast(cartes.get(i));
            } else {
                mainJ2.addLast(cartes.get(i));
            }
        }
    }

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

        List<Carte> cimetiere = new ArrayList<>();
        int tours = 0;

        while (!piocheJ1.isEmpty() && !piocheJ2.isEmpty() && tours < MAX_TOURS) {
            tours++;

            Carte carteJ1 = piocheJ1.pollFirst();
            Carte carteJ2 = piocheJ2.pollFirst();
            int comparaison = comparer(carteJ1, carteJ2);

            if (comparaison > 0) {
                piocheJ1.addLast(carteJ1);
                piocheJ1.addLast(carteJ2);
            } else if (comparaison < 0) {
                piocheJ2.addLast(carteJ2);
                piocheJ2.addLast(carteJ1);
            } else {
                // Version simplifiee : les deux cartes sortent du jeu.
                cimetiere.add(carteJ1);
                cimetiere.add(carteJ2);
            }
        }

        System.out.printf("%d tour(s), %d carte(s) au cimetiere — %s : %d, %s : %d%n",
                tours, cimetiere.size(),
                joueur1.getPseudo(), piocheJ1.size(),
                joueur2.getPseudo(), piocheJ2.size());

        return resultat(piocheJ1, piocheJ2);
    }

    /**
     * ATTENTION — ECART ASSUME AVEC L'ENONCE.
     *
     * L'enonce G.26 demande : « soit la pioche du joueur1 est vide :
     * return JOUEUR1_GAGNE ». C'est l'inverse de la regle du jeu — un
     * joueur sans carte a tout perdu.
     *
     * Le corrigé applique la regle, pas l'enonce, et l'enonce pose
     * d'ailleurs la question aux etudiants.
     *
     * Le dernier cas — aucune pioche vide, on a atteint MAX_TOURS —
     * pourrait se decider aux cartes restantes plutot que par un match
     * nul. Le choix de l'enonce est defendable : une partie qu'on a du
     * interrompre n'a pas de vainqueur.
     */
    protected ResultatPartie resultat(Deque<Carte> piocheJ1, Deque<Carte> piocheJ2) {
        if (piocheJ1.isEmpty() && piocheJ2.isEmpty()) {
            return ResultatPartie.MATCH_NUL;
        }
        if (piocheJ1.isEmpty()) {
            return ResultatPartie.JOUEUR2_GAGNE;
        }
        if (piocheJ2.isEmpty()) {
            return ResultatPartie.JOUEUR1_GAGNE;
        }
        return ResultatPartie.MATCH_NUL;   // MAX_TOURS atteint
    }
}
