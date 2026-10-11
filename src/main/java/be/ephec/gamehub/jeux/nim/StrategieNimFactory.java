package be.ephec.gamehub.jeux.nim;

/**
 * G.19 — CORRIGE.
 *
 * La meme fabrique que JeuFactory, un etage plus bas. C'est volontaire :
 * le motif se repete, et le reconnaitre une deuxieme fois vaut mieux que
 * de le decouvrir une fois.
 *
 * JeuNim ne connait donc aucune classe de strategie concrete, exactement
 * comme GameHub ne connait aucune classe de jeu.
 */
//@G.19
public class StrategieNimFactory {

    public StrategieNim creer(TypeStrategieNim type) {
        return switch (type) {
            case TIMIDE -> new StrategieTimide();
            case ALEATOIRE -> new StrategieAleatoire();
            case MALIGNE -> new StrategieMaligne();
        };
    }
}
