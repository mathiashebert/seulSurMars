package com.bansheesoftware.seulsurmars.domain;

public class Objet {
    public String id;
    public int x;
    public int y;
    public GRAPHISME graphisme;

    public enum GRAPHISME {
        bouteille, oxygene, tomate, hydrogene, inflammable
    }

    public Objet(String id, int x, int y, GRAPHISME graphisme) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.graphisme = graphisme;
    }
}