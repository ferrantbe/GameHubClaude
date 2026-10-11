package be.ephec.gamehub;

import be.ephec.gamehub.jeux.Jeu;   //@G.15
import be.ephec.gamehub.jeux.JeuConfigurable;   //@G.20
import be.ephec.gamehub.jeux.JeuFactory;   //@G.15
import be.ephec.gamehub.modele.Joueur;
import be.ephec.gamehub.modele.Partie;
import be.ephec.gamehub.modele.ResultatPartie;   //@G.15
import be.ephec.gamehub.modele.ResumePartie;   //@G.35
import be.ephec.gamehub.modele.TypeJeu;   //@G.6
import be.ephec.gamehub.observateurs.JournalParties;   //@G.13

import java.util.List;   //@G.35
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
 * AUCUNE FENETRE ICI. Le hub est une application console, et il le reste.
 * La fenetre du Nim (G.33) est une application a part, avec son propre
 * lanceur : l'ouvrir depuis ce menu demanderait de demarrer JavaFX a la
 * main, sur un autre fil d'execution.
 *
 * G.35 : le hub ne joue qu'une partie par lancement. C'est le journal,
 * ecrit dans un fichier, qui se souvient des precedentes.
 */
//@G.3
public class GameHub {

    public static void main(String[] args) {
        Scanner clavier = new Scanner(System.in);
        JournalParties journal = new JournalParties();   //@G.35
        afficherHistorique(journal);   //@G.35

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
        //@G.13-G.34 partie.ajouterObservateur(new JournalParties());
        partie.ajouterObservateur(journal);   //@G.35

        System.out.println("\n" + partie);

        ResultatPartie resultat = jeu.jouer(joueur1, joueur2);   //@G.15
        partie.terminer(resultat);   //@G.15

        System.out.println("\n" + partie);
        System.out.println("Resume : " + partie.getResume());   //@G.9
    }

    /**   //@G.35
     * G.35 — les parties des lancements precedents, relues dans le fichier   //@G.35
     * du journal. Au tout premier lancement, il n'y en a aucune.   //@G.35
     */   //@G.35
    //@G.35
    private static void afficherHistorique(JournalParties journal) {
        List<ResumePartie> parties = journal.historique();
        if (parties.isEmpty()) {
            System.out.println("Aucune partie jouee jusqu'ici.");
            return;
        }
        System.out.println("Parties precedentes :");
        for (ResumePartie resume : parties) {
            System.out.println("  " + resume);
        }
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
