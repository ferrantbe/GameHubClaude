package be.ephec.gamehub.modele;

/**
 * G.31 — CORRIGE.
 *
 * Une chose pour chaque joueur. Le fil rouge en gardait jusqu'ici dans
 * deux champs jumeaux, avec un operateur ternaire pour choisir le bon a
 * chaque endroit ou l'on s'en servait.
 *
 * Une Paire<T> stockerait exactement la meme chose. ParJoueur dit en plus
 * A QUOI servent ses deux elements : le premier est celui du joueur 1, et
 * la methode selon() repond a la seule question qu'on lui pose jamais,
 * « lequel est a lui de jouer ? ». Le nom porte le sens que les champs
 * jumeaux laissaient deviner. Voir CC-NOM.1.
 *
 * La classe est generique : la meme sert pour des strategies, des joueurs,
 * des pioches, sans un seul transtypage. Elle est aussi immuable : on
 * remplace une ParJoueur, on ne la modifie pas.
 */
//@G.31
public class ParJoueur<T> {

    private final T duPremier;
    private final T duSecond;

    public ParJoueur(T duPremier, T duSecond) {
        this.duPremier = duPremier;
        this.duSecond = duSecond;
    }

    public T duPremier() {
        return duPremier;
    }

    public T duSecond() {
        return duSecond;
    }

    /** L'element du joueur dont c'est le tour. */
    public T selon(boolean auTourDuPremier) {
        return auTourDuPremier ? duPremier : duSecond;
    }
}
