package be.ephec.gamehub.observateurs;

import be.ephec.gamehub.modele.Partie;

/**
 * G.11 — CORRIGE.
 *
 * Trois moments dans la vie d'une partie, trois methodes. La partie ne
 * saura jamais qui l'observe ni ce qu'il en fait : c'est le patron
 * Observateur, deja rencontre en ITF.4.
 *
 * REMARQUE SUR LE NOM. L'enonce G.11 appelle cette interface
 * ObservateurPartie, mais G.12 ecrit List<Observateur>. Les deux noms
 * designent la meme chose ; on garde ObservateurPartie, qui dit ce qu'on
 * observe.
 */
//@G.11
public interface ObservateurPartie {

    void onDebut(Partie partie);

    void onCoup(Partie partie);

    void onFin(Partie partie);
}
