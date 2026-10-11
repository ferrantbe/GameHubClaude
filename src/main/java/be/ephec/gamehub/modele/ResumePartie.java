package be.ephec.gamehub.modele;

import java.time.LocalDateTime;

/**
 * G.8 — CORRIGE.
 *
 * Reponse a la question de l'enonce : ce record se cree dans
 * Partie.terminer, parce que c'est le seul moment ou toutes ses donnees
 * existent en meme temps — le resultat vient d'arriver, la date de fin
 * aussi.
 *
 * Un record convient ici pour la meme raison qu'en ENU.4 : c'est un
 * instantane, figé, qu'on transporte et qu'on affiche. Il n'a aucun
 * comportement.
 */
//@G.8
public record ResumePartie(String pseudoGagnant,
                           LocalDateTime debut,
                           LocalDateTime fin,
                           TypeJeu typeJeu) {

    @Override
    public String toString() {
        return typeJeu + " — " + pseudoGagnant + " (de " + debut + " a " + fin + ")";
    }
}
