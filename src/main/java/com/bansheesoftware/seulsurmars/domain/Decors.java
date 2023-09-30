package com.bansheesoftware.seulsurmars.domain;

public class Decors {
    public String id;
    public int x;
    public int y;
    public GRAPHISME graphisme;

    public enum GRAPHISME {
        ascenseur, potager, hydrazine, fontaine, recycleurAir, four, ampouleEteinte, ampouleAllumee
    }

    public Decors(String id, int x, int y, GRAPHISME graphisme) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.graphisme = graphisme;
    }
}