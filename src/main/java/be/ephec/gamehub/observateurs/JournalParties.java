package be.ephec.gamehub.observateurs;

import be.ephec.gamehub.modele.Partie;

/**
 * G.13 — CORRIGE.
 *
 * Un observateur qui ecrit sur la console. Il ne sait rien du jeu en
 * cours, ne le modifie pas, et pourrait etre remplace par un observateur
 * qui ecrit dans un fichier sans qu'une ligne de Partie change.
 *
 * Le compteur de coups est un etat propre a l'observateur. Il montre
 * qu'un observateur peut avoir sa propre memoire, ce qu'un simple
 * affichage ne laisserait pas deviner.
 */
//@G.13
public class JournalParties implements ObservateurPartie {

    private int coups = 0;

    @Override
    public void onDebut(Partie partie) {
        coups = 0;
        System.out.println("[journal] debut — " + partie);
    }

    @Override
    public void onCoup(Partie partie) {
        coups++;
        System.out.println("[journal] coup " + coups);
    }

    @Override
    public void onFin(Partie partie) {
        System.out.println("[journal] fin apres " + coups + " coup(s) — " + partie);
    }
}
