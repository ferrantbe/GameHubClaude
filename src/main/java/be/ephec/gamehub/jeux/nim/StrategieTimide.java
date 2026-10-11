package be.ephec.gamehub.jeux.nim;

/**
 * G.17 — CORRIGE.
 *
 * La strategie la plus simple possible : une allumette a la fois. Elle
 * existe pour que JeuNim ait quelque chose a appeler avant que les autres
 * ne soient ecrites.
 */
//@G.17
public class StrategieTimide implements StrategieNim {

    @Override
    public int combienRetirer(Pile pile, ReglesNim regles) {
        return 1;
    }

    @Override
    public String toString() {
        return "Timide — retire toujours une allumette";
    }
}
