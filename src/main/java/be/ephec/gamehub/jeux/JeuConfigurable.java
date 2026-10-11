package be.ephec.gamehub.jeux;

import java.util.Scanner;

/**
 * ATTENTION — PAS D'ENONCE NUMEROTE. Decrite dans le deck 04, slide 32.
 *
 * Une interface de MARQUAGE avec une methode : elle signale qu'un jeu
 * accepte d'etre configure avant qu'on y joue. GameHub teste si le jeu
 * l'implemente, et n'appelle configure que dans ce cas.
 */
//@G.20
public interface JeuConfigurable {

    void configure(Scanner entree);
}
