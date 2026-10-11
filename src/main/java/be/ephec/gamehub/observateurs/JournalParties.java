package be.ephec.gamehub.observateurs;

import be.ephec.gamehub.modele.Partie;
import be.ephec.gamehub.modele.ResumePartie;   //@G.35
import be.ephec.gamehub.modele.TypeJeu;   //@G.35

import java.io.BufferedReader;   //@G.35
import java.io.File;   //@G.35
import java.io.FileReader;   //@G.35
import java.io.FileWriter;   //@G.35
import java.io.IOException;   //@G.35
import java.io.PrintWriter;   //@G.35
import java.time.LocalDateTime;   //@G.35
import java.util.ArrayList;   //@G.35
import java.util.List;   //@G.35

/**
 * G.13 et G.35 — CORRIGE.
 *
 * Un observateur qui ecrit sur la console. Il ne sait rien du jeu en
 * cours, ne le modifie pas, et pourrait etre remplace par un observateur
 * qui ecrit dans un fichier sans qu'une ligne de Partie change.
 *
 * Le compteur de coups est un etat propre a l'observateur. Il montre
 * qu'un observateur peut avoir sa propre memoire, ce qu'un simple
 * affichage ne laisserait pas deviner.
 *
 * G.35 — LE JOURNAL SE SOUVIENT. Le hub ne joue qu'une partie par
 * lancement : sans fichier, aucune partie ne survit a la suivante. Chaque
 * partie terminee s'ajoute donc, sur une ligne, a la fin d'un fichier
 * texte, et historique() relit ce fichier au lancement suivant.
 *
 * Le format est un choix, et il se discute : quatre champs separes par un
 * point-virgule, dans l'ordre type, gagnant, debut, fin. Le type est ecrit
 * par son nom de constante, NIM, et non par son libelle, « Jeu de Nim » :
 * c'est le nom que valueOf sait relire.
 *
 * Une erreur d'ecriture ne doit pas faire perdre la partie qu'on vient de
 * jouer : elle est signalee, et le hub continue. Voir CC-ERR.2.
 */
//@G.13
public class JournalParties implements ObservateurPartie {

    /** Le fichier du journal, dans le dossier de lancement du programme. */   //@G.35
    public static final String FICHIER_PAR_DEFAUT = "parties.txt";   //@G.35
    private static final String SEPARATEUR = ";";   //@G.35

    private final String fichier;   //@G.35
    private int coups = 0;

    //@G.35
    public JournalParties() {
        this(FICHIER_PAR_DEFAUT);
    }

    /** Un autre fichier : pour les tests, ou pour tenir deux journaux. */   //@G.35
    //@G.35
    public JournalParties(String fichier) {
        this.fichier = fichier;
    }

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
        ecrire(partie.getResume());   //@G.35
    }

    //@G.35
    private void ecrire(ResumePartie resume) {
        try (PrintWriter sortie = new PrintWriter(new FileWriter(fichier, true))) {
            sortie.println(enLigne(resume));
        } catch (IOException e) {
            System.out.println("[journal] partie non enregistree : " + e.getMessage());
        }
    }

    /** Les parties deja jouees, dans l'ordre ou elles l'ont ete. */   //@G.35
    //@G.35
    public List<ResumePartie> historique() {
        List<ResumePartie> parties = new ArrayList<>();
        File source = new File(fichier);
        if (!source.exists()) {
            return parties;   // premier lancement : rien a relire
        }
        try (BufferedReader entree = new BufferedReader(new FileReader(source))) {
            String ligne;
            while ((ligne = entree.readLine()) != null) {
                parties.add(depuisLigne(ligne));
            }
        } catch (IOException e) {
            System.out.println("[journal] historique illisible : " + e.getMessage());
        }
        return parties;
    }

    //@G.35
    private String enLigne(ResumePartie resume) {
        return resume.typeJeu().name() + SEPARATEUR
                + resume.pseudoGagnant() + SEPARATEUR
                + resume.debut() + SEPARATEUR
                + resume.fin();
    }

    //@G.35
    private ResumePartie depuisLigne(String ligne) {
        String[] champs = ligne.split(SEPARATEUR);
        return new ResumePartie(champs[1],
                LocalDateTime.parse(champs[2]),
                LocalDateTime.parse(champs[3]),
                TypeJeu.valueOf(champs[0]));
    }
}
