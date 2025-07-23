package com.bansheesoftware.seulsurmars.domain.objet;

public abstract class Objet {
    public String id;
    public int x;
    public int y;
    public GRAPHISME graphisme;
    public int animation = 0;

    public enum GRAPHISME {
        bouteille, oxygene, tomate, hydrogene, inflammable, sucre, cupcake, explosif, electrique,
        tomatequipousse, cupcakequicuit, decompteexplosion, decomptefeu, explosion, feu
    }

    public Objet(String id, int x, int y, GRAPHISME graphisme) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.graphisme = graphisme;
    }

    public boolean isInflammable() {
        return graphisme.equals(GRAPHISME.inflammable) ||
                graphisme.equals(GRAPHISME.oxygene) ||
                graphisme.equals(GRAPHISME.hydrogene);
    }
    public boolean isExplosif() {
        return graphisme.equals(GRAPHISME.explosif);

    }

    public abstract Objet duplique();
}