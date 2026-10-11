package be.ephec.gamehub.jeux.grille;

/**
 * G.29 — CORRIGE.
 *
 * Une grille rectangulaire ou l'on gagne en alignant N marques.
 *
 * POURQUOI CETTE CLASSE EXISTE AVANT LE PUISSANCE 4. Le morpion aurait pu
 * garder sa grille pour lui : trois lignes, trois colonnes, huit
 * alignements a verifier. On sait pourtant qu'un second jeu de grille
 * arrive a l'increment suivant, et qu'il posera exactement la meme
 * question — des marques alignees, dans quatre directions.
 *
 * Ecrire la recherche d'alignement ICI, une fois, n'est donc pas de
 * l'anticipation en l'air : le second cas est connu. Au prochain
 * increment, le puissance 4 n'aura rien a en redire.
 *
 * CE QU'ELLE NE SAIT PAS FAIRE. Poser une marque. Le morpion la pose ou
 * l'on veut, le puissance 4 la laisse tomber au fond d'une colonne :
 * c'est la seule chose qui les distingue vraiment, et c'est donc la seule
 * que chaque sous-classe ecrit.
 */
//@G.29
public abstract class GrilleAlignement {

    /** cases[colonne][ligne]. La ligne 0 est en BAS. */
    private final Marque[][] cases;
    private final int alignement;

    protected GrilleAlignement(int colonnes, int lignes, int alignement) {
        this.cases = new Marque[colonnes][lignes];
        this.alignement = alignement;
        for (int colonne = 0; colonne < colonnes; colonne++) {
            for (int ligne = 0; ligne < lignes; ligne++) {
                cases[colonne][ligne] = Marque.VIDE;
            }
        }
    }

    public int getColonnes() {
        return cases.length;
    }

    public int getLignes() {
        return cases[0].length;
    }

    public int getAlignement() {
        return alignement;
    }

    public Marque lire(int colonne, int ligne) {
        return cases[colonne][ligne];
    }

    /** Reservee aux sous-classes : elles seules decident ou poser. */
    protected void ecrire(int colonne, int ligne, Marque marque) {
        cases[colonne][ligne] = marque;
    }

    protected boolean dansLaGrille(int colonne, int ligne) {
        return colonne >= 0 && colonne < getColonnes()
                && ligne >= 0 && ligne < getLignes();
    }

    public boolean estPleine() {
        for (Marque[] colonne : cases) {
            for (Marque marque : colonne) {
                if (marque == Marque.VIDE) {
                    return false;
                }
            }
        }
        return true;
    }

    /**
     * Rend la marque gagnante, ou VIDE si personne n'a encore gagne.
     *
     * Quatre directions suffisent : horizontale, verticale, et les deux
     * diagonales. Les quatre autres sont les memes parcourues a l'envers —
     * les verifier reviendrait a compter deux fois.
     */
    public Marque gagnant() {
        int[][] directions = {{1, 0}, {0, 1}, {1, 1}, {1, -1}};

        for (int colonne = 0; colonne < getColonnes(); colonne++) {
            for (int ligne = 0; ligne < getLignes(); ligne++) {
                Marque marque = lire(colonne, ligne);
                if (marque == Marque.VIDE) {
                    continue;
                }
                for (int[] direction : directions) {
                    if (aligneDepuis(colonne, ligne, direction[0], direction[1], marque)) {
                        return marque;
                    }
                }
            }
        }
        return Marque.VIDE;
    }

    private boolean aligneDepuis(int colonne, int ligne, int pasColonne, int pasLigne,
                                 Marque marque) {
        for (int i = 1; i < alignement; i++) {
            int c = colonne + i * pasColonne;
            int l = ligne + i * pasLigne;
            if (!dansLaGrille(c, l) || lire(c, l) != marque) {
                return false;
            }
        }
        return true;
    }

    /** Une grille dessinee, la ligne du haut en premier. */
    @Override
    public String toString() {
        StringBuilder dessin = new StringBuilder();
        for (int ligne = getLignes() - 1; ligne >= 0; ligne--) {
            dessin.append("|");
            for (int colonne = 0; colonne < getColonnes(); colonne++) {
                dessin.append(lire(colonne, ligne)).append("|");
            }
            dessin.append("\n");
        }
        dessin.append(" ");
        for (int colonne = 0; colonne < getColonnes(); colonne++) {
            dessin.append(colonne + 1).append(" ");
        }
        return dessin.toString();
    }
}
