package be.ephec.gamehub;

import be.ephec.gamehub.jeux.Jeu;   //@G.15
import be.ephec.gamehub.jeux.JeuConfigurable;   //@G.20
import be.ephec.gamehub.jeux.JeuFactory;   //@G.15
import be.ephec.gamehub.modele.Joueur;
import be.ephec.gamehub.modele.Partie;
import be.ephec.gamehub.modele.ResultatPartie;   //@G.15
import be.ephec.gamehub.modele.TypeJeu;   //@G.6
import be.ephec.gamehub.observateurs.JournalParties;   //@G.13

import java.util.Scanner;

/**
 * G.3, G.9 — CORRIGE, complete au fil des increments.
 *
 * CE QUE CETTE CLASSE NE CONNAIT PAS, et c'est le resultat de tout le fil
 * rouge : aucune classe concrete de jeu. Elle manipule un Jeu, demande a
 * la JeuFactory de le construire, et n'a jamais besoin de savoir lequel.
 *
 * Ajouter un jeu ne demande aucune ligne ici.
 *
 * ATTENTION — L'APPEL A JAVAFX. Depuis G.22, le catalogue contient un jeu
 * graphique. Lancer une fenetre JavaFX exige que la plateforme soit
 * demarree, ce qui n'est pas le cas dans un programme console ordinaire.
 * C'est une des consequences annoncees du choix fait en G.22 : voir la
 * justification en tete de JeuDemineur, et le mot sur le Lanceur dans le
 * memento technique.
 */
//@G.3
public class GameHub {

    public static void main(String[] args) {
        Scanner clavier = new Scanner(System.in);

        Joueur joueur1 = demanderJoueur(clavier, "premier");
        Joueur joueur2 = demanderJoueur(clavier, "second");

        TypeJeu type = demanderTypeDeJeu(clavier);   //@G.7
        Jeu jeu = new JeuFactory().creer(type);   //@G.15

        // Le hub ne sait pas si ce jeu se configure : il demande.
        //@G.20
        if (jeu instanceof JeuConfigurable configurable) {
            configurable.configure(clavier);
        }

        //@G.3-G.6 Partie partie = new Partie(joueur1, joueur2);
        Partie partie = new Partie(joueur1, joueur2, type);   //@G.7
        partie.ajouterObservateur(new JournalParties());   //@G.13

        System.out.println("\n" + partie);

        ResultatPartie resultat = jeu.jouer(joueur1, joueur2);   //@G.15
        partie.terminer(resultat);   //@G.15

        System.out.println("\n" + partie);
        System.out.println("Resume : " + partie.getResume());   //@G.9
    }

    private static Joueur demanderJoueur(Scanner clavier, String rang) {
        System.out.print("Pseudo du " + rang + " joueur : ");
        String pseudo = clavier.nextLine().trim();
        System.out.print("Email du " + rang + " joueur : ");
        String email = clavier.nextLine().trim();
        return new Joueur(pseudo, email);
    }

    /**
     * Le menu se construit a partir de values() : ajouter un jeu au
     * catalogue le fait apparaitre ici sans qu'on touche a cette methode.
     * C'est la meme idee qu'en ENU.1.
     */
    //@G.7
    private static TypeJeu demanderTypeDeJeu(Scanner clavier) {
        System.out.println("\nJeux disponibles :");
        TypeJeu[] catalogue = TypeJeu.values();
        for (int i = 0; i < catalogue.length; i++) {
            System.out.println("  " + (i + 1) + ". " + catalogue[i]);
        }

        while (true) {
            System.out.print("Votre choix : ");
            try {
                int choix = Integer.parseInt(clavier.nextLine().trim());
                if (choix >= 1 && choix <= catalogue.length) {
                    return catalogue[choix - 1];
                }
            } catch (NumberFormatException ignoree) {
                // on redemande
            }
            System.out.println("Choix invalide.");
        }
    }
}
