package com.bansheesoftware.seulsurmars.domain;

public class Salle {
    public int x;
    public int y;
    public int largeur;
    public int hauteur;
    public GRAPHISME graphisme;

    public enum GRAPHISME {
        NORMALE, SOMBRE, ALARME
    }

    public Salle(int x, int y, int largeur, int hauteur) {
        this.x = x;
        this.y = y;
        this.largeur = largeur;
        this.hauteur = hauteur;
        this.graphisme = GRAPHISME.NORMALE;
    }

    public String id() {
        return "salle-"+x+"-"+y;
    }
}