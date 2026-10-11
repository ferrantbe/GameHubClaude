package be.ephec.gamehub.fenetre;

import javafx.application.Application;

/**
 * G.33 — FOURNIE. C'est elle qu'il faut lancer, pas FenetreNim.
 *
 * Une classe qui herite d'Application refuse de demarrer quand JavaFX est
 * sur le classpath, ce que fait Maven. Celle-ci n'herite de rien : le
 * controle ne se declenche pas, et Application.launch demarre JavaFX.
 * L'explication complete est dans le memento technique, TEC-FX.4.
 *
 * C'est la DEUXIEME porte d'entree du projet. GameHub, le hub console,
 * reste ce qu'il etait : ouvrir une fenetre depuis une console demanderait
 * de demarrer JavaFX a la main, sur un autre fil d'execution.
 */
//@G.33
public class LanceurFenetreNim {

    public static void main(String[] args) {
        Application.launch(FenetreNim.class, args);
    }
}
