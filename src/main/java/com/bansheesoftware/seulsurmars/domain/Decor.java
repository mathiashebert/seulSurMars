package com.bansheesoftware.seulsurmars.domain;

public class Decor {
    public String id;
    public int x;
    public int y;
    public GRAPHISME graphisme;

    public enum GRAPHISME {
        ascenseur, potager, hydrazine, fontaine, recycleurAir, four, ampouleEteinte, ampouleAllumee
    }

    public Decor(String id, int x, int y, GRAPHISME graphisme) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.graphisme = graphisme;
    }

    public Decor clone() {
        return new Decor(id, x, y, graphisme);
    }
}