package be.ephec.gamehub.fenetre;

import be.ephec.gamehub.jeux.nim.Pile;
import be.ephec.gamehub.jeux.nim.ReglesNim;
import be.ephec.gamehub.jeux.nim.StrategieMaligne;
import be.ephec.gamehub.jeux.nim.StrategieNim;
import javafx.application.Application;
import javafx.beans.property.IntegerProperty;   //@G.34
import javafx.beans.property.SimpleIntegerProperty;   //@G.34
import javafx.geometry.Pos;
import javafx.scene.Scene;
import javafx.scene.control.Button;
import javafx.scene.control.Label;
import javafx.scene.input.KeyEvent;
import javafx.scene.layout.HBox;
import javafx.scene.layout.VBox;
import javafx.stage.Stage;

/**
 * G.33 et G.34 — CORRIGE.
 *
 * Le jeu de Nim dans une fenetre : vous contre la machine.
 *
 * CE QUI NE CHANGE PAS. Pile, ReglesNim et les strategies sont reprises
 * telles quelles, sans une ligne modifiee. Elles ne savaient rien de la
 * console ; elles ne savent rien de la fenetre.
 *
 * CE QUI DISPARAIT. JeuNim n'est pas utilise : sa methode jouer est une
 * boucle while qui va jusqu'au bout de la partie sans s'arreter. Une
 * fenetre ne peut pas l'attendre. La boucle n'est pas recrite ailleurs :
 * chaque clic EST un tour de boucle. Le programme ne mene plus la partie,
 * il attend le coup suivant.
 *
 * G.34 — LES BOUTONS SAVENT QUAND SE TAIRE. Une IntegerProperty suit la
 * pile, et chaque bouton se desactive par un binding : « Prendre 3 » est
 * grise des qu'il reste moins de trois allumettes, et tous le sont a la
 * fin. La regle est declaree une fois par bouton, et plus aucun
 * gestionnaire n'a a s'en occuper.
 */
//@G.33
public class FenetreNim extends Application {

    /**
     * Quatorze et non treize, le nombre de JeuNim : contre la strategie
     * maligne, celui qui commence a treize allumettes perd toujours. A
     * quatorze, vous pouvez gagner, a condition de jouer juste.
     */
    private static final int ALLUMETTES = 14;

    private final ReglesNim regles = new ReglesNim();
    private final StrategieNim machine = new StrategieMaligne();
    private final Pile pile = new Pile(ALLUMETTES);
    private final IntegerProperty restantes = new SimpleIntegerProperty(ALLUMETTES);   //@G.34

    private Label etat;
    private Label message;

    // Le main est dans LanceurFenetreNim. Voir TEC-FX.4.

    @Override
    public void start(Stage fenetre) {
        etat = new Label();
        message = new Label("A vous de jouer : cliquez, ou tapez 1, 2 ou 3.");

        HBox boutons = new HBox(10);
        for (int nombre = 1; nombre <= regles.getMaximumParTour(); nombre++) {
            boutons.getChildren().add(bouton(nombre));
        }
        boutons.setAlignment(Pos.CENTER);

        VBox racine = new VBox(15, etat, boutons, message);
        racine.setAlignment(Pos.CENTER);
        racine.setStyle("-fx-padding: 20;");
        racine.addEventHandler(KeyEvent.KEY_TYPED, this::toucheFrappee);

        etat.textProperty().bind(restantes.asString("%d allumettes"));   //@G.34
        pileAChange();

        fenetre.setScene(new Scene(racine, 460, 180));
        fenetre.setTitle("GameHub - le Nim");
        fenetre.show();
    }

    private Button bouton(int nombre) {
        Button bouton = new Button("Prendre " + nombre);
        bouton.setOnAction(evenement -> joueurRetire(nombre));
        bouton.disableProperty().bind(restantes.lessThan(nombre));   //@G.34
        return bouton;
    }

    private void toucheFrappee(KeyEvent evenement) {
        String touche = evenement.getCharacter();
        if (touche.length() == 1 && Character.isDigit(touche.charAt(0))) {
            int nombre = touche.charAt(0) - '0';
            if (nombre >= 1 && nombre <= regles.getMaximumParTour()) {
                joueurRetire(nombre);
            }
        }
    }

    /**
     * Un tour de la boucle de JeuNim : le coup du joueur, puis celui de la
     * machine. Celui qui prend la derniere allumette a perdu.
     */
    private void joueurRetire(int nombre) {
        if (!regles.coupValide(pile, nombre)) {
            message.setText("Coup impossible : il reste " + pile.restantes() + " allumette(s).");
            return;
        }
        retirer(nombre);
        if (pile.estVide()) {
            message.setText("Vous avez pris la derniere allumette : vous avez perdu.");
            return;
        }

        int coup = coupDeLaMachine();
        retirer(coup);
        if (pile.estVide()) {
            message.setText("La machine retire " + coup + " et prend la derniere : vous avez gagne !");
        } else {
            message.setText("La machine retire " + coup + ". A vous.");
        }
    }

    /** Comme JeuNim : une strategie propose, les regles disposent. */
    private int coupDeLaMachine() {
        int propose = machine.combienRetirer(pile, regles);
        return regles.coupValide(pile, propose) ? propose : 1;
    }

    private void retirer(int nombre) {
        pile.retirer(nombre);
        pileAChange();
    }

    /** Le seul endroit ou l'ecran apprend que la pile a change. */
    private void pileAChange() {
        //@G.33-G.33 etat.setText(pile.restantes() + " allumettes");
        restantes.set(pile.restantes());   //@G.34
    }
}
