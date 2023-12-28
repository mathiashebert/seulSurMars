package com.bansheesoftware.seulsurmars.domain;

public class Ascenseur extends Decor {
    public int hauteurBas;
    public int hauteurHaut;

    public Ascenseur(String id, int x, int y, int hauteurBas, int hauteurHaut) {
        super(id, x, y, GRAPHISME.ascenseur);
        this.hauteurBas = hauteurBas;
        this.hauteurHaut = hauteurHaut;
    }
}