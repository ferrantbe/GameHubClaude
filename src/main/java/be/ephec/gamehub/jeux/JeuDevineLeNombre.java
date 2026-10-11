package be.ephec.gamehub.jeux;

import be.ephec.gamehub.modele.Joueur;
import be.ephec.gamehub.modele.ResultatPartie;
import be.ephec.gamehub.modele.TypeJeu;

import java.util.Random;
import java.util.Scanner;

/**
 * G.21 — CORRIGE, avec la justification demandee par l'enonce.
 *
 * ═══════════════════════════════════════════════════════════════════
 *  LA PISTE RETENUE : ignorer le second joueur, et l'assumer
 * ═══════════════════════════════════════════════════════════════════
 *
 * Le contrat impose jouer(Joueur j1, Joueur j2) et un ResultatPartie a
 * trois valeurs. Ce jeu n'a qu'un joueur, et deux issues.
 *
 * POURQUOI CELLE-CI. Parce qu'un seul jeu solitaire ne justifie pas de
 * modifier un contrat qui fonctionne pour tous les autres. Elargir
 * ResultatPartie obligerait les quatre jeux existants a ignorer deux
 * valeurs qui ne les concernent pas ; creer un JeuSolo obligerait
 * GameHub a tester le type du jeu, ce que l'interface Jeu servait
 * justement a eviter.
 *
 * CE QU'ELLE COUTE, et il faut le dire. La signature ment : elle promet
 * deux joueurs alors qu'un seul est utilise. Un lecteur qui ne verrait
 * que la declaration croirait a un jeu a deux. C'est precisement ce que
 * CC-NOM.4 reproche aux signatures trompeuses.
 *
 * ON PAIE CE MENSONGE PAR DE LA DOCUMENTATION, ce qui est le pire des
 * remedes — un commentaire ne s'execute pas, et personne ne garantit
 * qu'il sera lu.
 *
 * A PARTIR DE QUAND CHANGER D'AVIS. Au deuxieme jeu solitaire. La regle
 * empirique est simple : une exception se tolere, deux forment un motif,
 * et un motif se modelise. Le jour ou un second jeu solo arrive,
 * l'interface JeuSolo devient la bonne reponse — et ce jour-la, il n'y
 * aura que deux classes a adapter.
 *
 * ═══════════════════════════════════════════════════════════════════
 */
//@G.28
public class JeuDevineLeNombre implements Jeu, JeuConfigurable {

    private static final int BORNE_MAXIMALE = 100;
    private static final int ESSAIS_PAR_DEFAUT = 10;

    private final Random hasard = new Random();
    private final Scanner clavier = new Scanner(System.in);

    private int essaisAutorises = ESSAIS_PAR_DEFAUT;

    @Override
    public TypeJeu getType() {
        return TypeJeu.DEVINE_LE_NOMBRE;
    }

    /**
     * JeuConfigurable permet de regler le nombre d'essais avant de jouer.
     * Ce n'etait pas demande, mais cela montre que le jeu s'insere dans
     * le hub par les deux interfaces prevues, sans traitement special.
     */
    @Override
    public void configure(Scanner entree) {
        System.out.print("Combien d'essais ? (defaut " + ESSAIS_PAR_DEFAUT + ") ");
        String saisie = entree.nextLine().trim();
        if (!saisie.isEmpty()) {
            essaisAutorises = Integer.parseInt(saisie);
        }
    }

    /**
     * Le second joueur est IGNORE. Voir la justification en tete de
     * classe : c'est le prix de la piste retenue.
     *
     * @param joueur1 le seul joueur, celui qui devine
     * @param joueur2 ignore — ce jeu se joue seul
     * @return JOUEUR1_GAGNE s'il trouve, MATCH_NUL sinon
     */
    @Override
    public ResultatPartie jouer(Joueur joueur1, Joueur joueur2) {
        int cible = hasard.nextInt(BORNE_MAXIMALE) + 1;

        System.out.println(joueur1.getPseudo() + ", je pense a un nombre entre 1 et "
                + BORNE_MAXIMALE + ". Vous avez " + essaisAutorises + " essais.");

        for (int essai = 1; essai <= essaisAutorises; essai++) {
            System.out.print("Essai " + essai + " : ");
            int proposition = lireProposition();

            if (proposition == cible) {
                System.out.println("Trouve en " + essai + " essai(s) !");
                return ResultatPartie.JOUEUR1_GAGNE;
            }
            System.out.println(proposition < cible ? "Plus grand." : "Plus petit.");
        }

        System.out.println("Perdu. C'etait " + cible + ".");
        return ResultatPartie.MATCH_NUL;
    }

    /**
     * Une saisie qui n'est pas un nombre ne doit pas faire planter la
     * partie. On redemande, sans consommer d'essai — se tromper de touche
     * n'est pas jouer un coup.
     */
    private int lireProposition() {
        while (true) {
            String saisie = clavier.nextLine().trim();
            try {
                return Integer.parseInt(saisie);
            } catch (NumberFormatException ignoree) {
                System.out.print("Ce n'est pas un nombre. Reessayez : ");
            }
        }
    }
}
