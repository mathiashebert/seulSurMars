package com.bansheesoftware.seulsurmars.domain;

public class Position {
    public int x;
    public int y;
    public POSTION_TYPE type;
    public GRAPHISME graphisme;

    public enum POSTION_TYPE {
        SOL, VIDE
    }
    public enum GRAPHISME {
        vide, sol, roche, mur1, mur2, mur3, mur4, mur5, mur6, mur7, mur8, porte, dalle, carreau
    }

    public Position(int x, int y, POSTION_TYPE type, GRAPHISME graphisme) {
        this.x = x;
        this.y = y;
        this.type = type;
        this.graphisme = graphisme;
    }
}