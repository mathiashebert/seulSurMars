package com.bansheesoftware.seulsurmars.domain.decor;

public abstract class Decor {
    public String id;
    public int x;
    public int y;
    public GRAPHISME graphisme;
    public int animation = 0;


    public enum GRAPHISME {
        ascenseur, potager, hydrazine, fontaine, recycleurAir, four, ampouleEteinte, ampouleAllumee, terminal, terminalCasse,
        tourelleFermee, tourelleOuverture, tourelleOuverte, tourelleFermeture, tourelleVisee, tourelleMiseEnVeille, tourelleCassee,
        detruit
    }

    public Decor(String id, int x, int y, GRAPHISME graphisme) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.graphisme = graphisme;
    }

    public boolean isInflammable() {
        return graphisme.equals(GRAPHISME.potager);
    }
    public boolean isExplosif() {
        return graphisme.equals(GRAPHISME.hydrazine);

    }

    public abstract Decor duplique();
}