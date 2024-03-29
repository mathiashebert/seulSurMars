package com.bansheesoftware.seulsurmars.domain;

public class Objet {
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

    public Objet clone() {
        Objet objet = new Objet(id, x, y, graphisme);
        objet.animation = this.animation;
        return objet;
    }
}