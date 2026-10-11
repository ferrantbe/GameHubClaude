package be.ephec.gamehub.modele;

import be.ephec.gamehub.observateurs.ObservateurPartie;   //@G.12

import java.time.LocalDateTime;   //@G.4
import java.util.ArrayList;   //@G.12
import java.util.List;   //@G.12

/**
 * G.2, G.4, G.7, G.12 — CORRIGE.
 *
 * Cette classe a grandi par couches, et chaque couche a son exercice :
 *
 *   G.2   les deux joueurs et le toString ;
 *   G.4   les dates de debut et de fin ;
 *   G.7   le type de jeu et le resultat ;
 *   G.12  la liste d'observateurs et les notifications.
 *
 * DEUX POINTS MERITENT L'ATTENTION.
 *
 * La date de debut est prise dans le CONSTRUCTEUR, celle de fin dans
 * terminer. Une partie commence donc au moment ou l'objet existe : il n'y
 * a aucun instant ou une Partie serait sans date de debut.
 *
 * Les methodes de notification sont PRIVEES. Personne d'autre que la
 * partie n'a le droit de declarer qu'un coup a ete joue.
 *
 * UNE REMARQUE SUR L'ENONCE G.12. Il demande d'appeler notifierDebut
 * dans le constructeur. Or les observateurs s'ajoutent APRES la
 * construction : au moment ou notifierDebut s'execute, la liste est vide
 * et personne n'est prevenu.
 *
 * Le code ci-dessous suit l'enonce a la lettre, et l'appel est donc sans
 * effet. Trois facons de le corriger, selon ce qu'on prefere :
 *
 *   passer les observateurs au constructeur ;
 *   prevenir un observateur au moment ou il s'abonne ;
 *   ou deplacer le debut dans une methode demarrer(), appelee par le jeu.
 *
 * C'est exactement le genre de decalage qu'on ne voit qu'en executant.
 */
//@G.2
public class Partie {

    private final Joueur joueur1;
    private final Joueur joueur2;
    private final TypeJeu typeJeu;   //@G.7
    private final LocalDateTime dateHeureDebut;   //@G.4
    private final List<ObservateurPartie> observateurs = new ArrayList<>();   //@G.12

    private LocalDateTime dateHeureFin;   //@G.4
    private ResultatPartie resultat;   //@G.7
    private ResumePartie resume;   //@G.8

    //@G.2-G.6 public Partie(Joueur joueur1, Joueur joueur2) {
    public Partie(Joueur joueur1, Joueur joueur2, TypeJeu typeJeu) {   //@G.7
        this.joueur1 = joueur1;
        this.joueur2 = joueur2;
        this.typeJeu = typeJeu;   //@G.7
        this.dateHeureDebut = LocalDateTime.now();   //@G.4
        notifierDebut();   //@G.12
    }

    //@G.12
    public void ajouterObservateur(ObservateurPartie observateur) {
        observateurs.add(observateur);
    }

    //@G.12
    public void retirerObservateur(ObservateurPartie observateur) {
        observateurs.remove(observateur);
    }

    /**
     * Appelee par le jeu a chaque coup. C'est le seul point d'entree
     * public des notifications : le jeu signale, la partie previent.
     */
    //@G.12
    public void coupJoue() {
        notifierCoup();
    }

    /**
     * G.7 : c'est terminer qui recoit le resultat et l'enregistre.
     * G.8 : c'est aussi ici que le ResumePartie se fabrique, parce que
     * c'est le seul moment ou toutes ses donnees existent.
     */
    //@G.4
    //@G.4-G.6 public void terminer() {
    public void terminer(ResultatPartie resultat) {   //@G.7
        this.resultat = resultat;   //@G.7
        this.dateHeureFin = LocalDateTime.now();
        this.resume = new ResumePartie(pseudoDuGagnant(), dateHeureDebut, dateHeureFin, typeJeu);   //@G.8
        notifierFin();   //@G.12
    }

    //@G.8
    private String pseudoDuGagnant() {
        return switch (resultat) {
            case JOUEUR1_GAGNE -> joueur1.getPseudo();
            case JOUEUR2_GAGNE -> joueur2.getPseudo();
            case MATCH_NUL -> "aucun";
        };
    }

    //@G.12
    private void notifierDebut() {
        for (ObservateurPartie observateur : observateurs) {
            observateur.onDebut(this);
        }
    }

    //@G.12
    private void notifierCoup() {
        for (ObservateurPartie observateur : observateurs) {
            observateur.onCoup(this);
        }
    }

    //@G.12
    private void notifierFin() {
        for (ObservateurPartie observateur : observateurs) {
            observateur.onFin(this);
        }
    }

    public Joueur getJoueur1() {
        return joueur1;
    }

    public Joueur getJoueur2() {
        return joueur2;
    }

    //@G.7
    public TypeJeu getTypeJeu() {
        return typeJeu;
    }

    //@G.4
    public LocalDateTime getDateHeureDebut() {
        return dateHeureDebut;
    }

    //@G.4
    public LocalDateTime getDateHeureFin() {
        return dateHeureFin;
    }

    //@G.7
    public ResultatPartie getResultat() {
        return resultat;
    }

    //@G.8
    public ResumePartie getResume() {
        return resume;
    }

    @Override
    public String toString() {
        //@G.2-G.6 return "Partie entre " + joueur1 + " et " + joueur2;
        return "Partie " + typeJeu + " entre " + joueur1 + " et " + joueur2   //@G.7
                + " commencee a " + dateHeureDebut   //@G.7
                + (resultat != null ? " — resultat : " + resultat : "");   //@G.7
    }
}
