package be.ephec.gamehub.jeux.bataille;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * G.21 — CORRIGE.
 *
 * Le Deck de ENU.3, avec un tableau remplace par une List. Trois choses
 * changent, et la troisieme est la plus parlante.
 *
 *   LE CHAMP : Carte[] devient List<Carte>. Plus d'indice a gerer, plus
 *   de taille a calculer d'avance.
 *
 *   LE CONSTRUCTEUR : la double boucle ne calcule plus de position, elle
 *   ajoute. Comparez avec ENU.3, ou il fallait un compteur.
 *
 *   LE MELANGE : Collections.shuffle(cartes) remplace l'algorithme ecrit
 *   a la main. Une ligne au lieu de six, et ecrite par des gens dont
 *   c'est le metier.
 *
 * C'est exactement le propos du theme COL : on ne choisit pas une
 * collection par habitude, on la choisit sur ce qu'elle apporte.
 */
//@G.21
public class Deck {

    private final List<Carte> cartes = new ArrayList<>();

    public Deck() {
        for (Couleur couleur : Couleur.values()) {
            for (Valeur valeur : Valeur.values()) {
                cartes.add(new Carte(valeur, couleur));
            }
        }
    }

    public void shuffle() {
        Collections.shuffle(cartes);
    }

    public int taille() {
        return cartes.size();
    }

    /**
     * Rend une vue NON MODIFIABLE : personne ne doit pouvoir retirer une
     * carte du jeu sans passer par le deck. Voir CC-OBJ.2.
     */
    public List<Carte> getCartes() {
        return Collections.unmodifiableList(cartes);
    }
}
