package be.ephec.gamehub.jeux.nim;

import be.ephec.gamehub.jeux.Jeu;
import be.ephec.gamehub.jeux.JeuConfigurable;   //@G.20
import be.ephec.gamehub.modele.Joueur;
import be.ephec.gamehub.modele.ResultatPartie;
import be.ephec.gamehub.modele.TypeJeu;

import java.util.Scanner;   //@G.20

/**
 * G.18 et G.20 — CORRIGE.
 *
 * Le premier jeu concret du hub. Il implemente DEUX interfaces, et
 * chacune dit quelque chose de different :
 *
 *   Jeu              il sait se jouer et rendre un resultat ;
 *   JeuConfigurable  il accepte d'etre regle avant qu'on y joue.
 *
 * GameHub ne connait que la premiere. Il teste la seconde et n'appelle
 * configure que si elle est presente — un jeu qui ne se configure pas
 * n'a rien a declarer.
 *
 * CE QUE CETTE CLASSE NE CONTIENT PAS, et c'est le resultat des trois
 * increments precedents : aucune regle de decision. Elle ne sait pas
 * combien retirer, elle demande a une strategie. Elle ne sait pas ce qui
 * est permis, elle demande aux regles. Elle orchestre.
 *
 * LA REGLE DU JEU : celui qui retire la DERNIERE allumette a perdu.
 */
//@G.18
//@G.18-G.19 public class JeuNim implements Jeu {
public class JeuNim implements Jeu, JeuConfigurable {   //@G.20

    private final int allumettesInitiales;
    private final ReglesNim regles;

    private StrategieNim strategieJoueur1 = new StrategieTimide();
    private StrategieNim strategieJoueur2 = new StrategieTimide();

    public JeuNim(int allumettesInitiales, ReglesNim regles) {
        this.allumettesInitiales = allumettesInitiales;
        this.regles = regles;
    }

    @Override
    public TypeJeu getType() {
        return TypeJeu.NIM;
    }

    /**
     * G.20 — demande a l'utilisateur la strategie de chaque joueur, et
     * delegue la construction a la fabrique.
     */
    //@G.20
    @Override
    public void configure(Scanner entree) {
        strategieJoueur1 = demanderStrategie(entree, "premier");
        strategieJoueur2 = demanderStrategie(entree, "second");
    }

    //@G.20
    private StrategieNim demanderStrategie(Scanner entree, String rang) {
        TypeStrategieNim[] catalogue = TypeStrategieNim.values();

        System.out.println("\nStrategie du " + rang + " joueur :");
        for (int i = 0; i < catalogue.length; i++) {
            System.out.println("  " + (i + 1) + ". " + catalogue[i]);
        }

        while (true) {
            System.out.print("Votre choix : ");
            try {
                int choix = Integer.parseInt(entree.nextLine().trim());
                if (choix >= 1 && choix <= catalogue.length) {
                    return new StrategieNimFactory().creer(catalogue[choix - 1]);
                }
            } catch (NumberFormatException ignoree) {
                // on redemande
            }
            System.out.println("Choix invalide.");
        }
    }

    @Override
    public ResultatPartie jouer(Joueur joueur1, Joueur joueur2) {
        Pile pile = new Pile(allumettesInitiales);
        boolean auTourDuPremier = true;

        System.out.println("\n" + allumettesInitiales
                + " allumettes. Celui qui retire la derniere a perdu.");

        while (!pile.estVide()) {
            StrategieNim strategie = auTourDuPremier ? strategieJoueur1 : strategieJoueur2;
            Joueur joueur = auTourDuPremier ? joueur1 : joueur2;

            int retire = coupValide(strategie, pile);
            pile.retirer(retire);

            System.out.printf("%-12s retire %d — il en reste %d%n",
                    joueur.getPseudo(), retire, pile.restantes());

            if (pile.estVide()) {
                // Celui qui vient de jouer a pris la derniere : il perd.
                return auTourDuPremier
                        ? ResultatPartie.JOUEUR2_GAGNE
                        : ResultatPartie.JOUEUR1_GAGNE;
            }
            auTourDuPremier = !auTourDuPremier;
        }

        return ResultatPartie.MATCH_NUL;   // inatteignable, la pile part non vide
    }

    /**
     * Une strategie mal ecrite pourrait proposer un coup interdit. Le jeu
     * ne lui fait pas confiance : il verifie, et ramene dans les clous
     * plutot que de laisser la Pile lever une exception.
     *
     * C'est une frontiere : a l'interieur du jeu on se fie a son propre
     * code, mais une strategie peut venir de n'importe ou — y compris
     * d'un etudiant qui en ecrit une quatrieme.
     */
    private int coupValide(StrategieNim strategie, Pile pile) {
        int propose = strategie.combienRetirer(pile, regles);
        if (regles.coupValide(pile, propose)) {
            return propose;
        }
        return Math.min(Math.max(propose, 1), regles.maximumRetirable(pile));
    }
}
