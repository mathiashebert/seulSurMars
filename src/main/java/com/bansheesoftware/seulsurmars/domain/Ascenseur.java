package com.bansheesoftware.seulsurmars.domain;

public class Ascenseur {
    public String id;
    public int x;
    public int y;
    public int hauteurBas;
    public int hauteurHaut;

    public Ascenseur(String id, int x, int y, int hauteurBas, int hauteurHaut) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.hauteurBas = hauteurBas;
        this.hauteurHaut = hauteurHaut;
    }
}