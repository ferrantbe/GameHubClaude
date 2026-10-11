package be.ephec.gamehub.jeux.nim;

/**
 * G.17 — CORRIGE.
 *
 * Une seule methode : decider combien d'allumettes retirer. C'est une
 * interface fonctionnelle, et elle pourrait donc s'implementer par une
 * lambda — ce que fera peut-etre un etudiant arrive au theme LAM.
 *
 * Elle recoit les REGLES en plus de la pile. Une strategie qui supposerait
 * « le maximum est trois » cesserait de fonctionner a la premiere
 * variante ; celle-ci demande.
 */
@FunctionalInterface
//@G.17
public interface StrategieNim {

    int combienRetirer(Pile pile, ReglesNim regles);
}
