package com.bansheesoftware.seulsurmars.domain.objet;

public class Hydrogene extends Objet {
    public Hydrogene(String id, int x, int y) {
        super(id, x, y, GRAPHISME.hydrogene);
    }

    @Override
    public Hydrogene duplique() {
        return new Hydrogene(id, x, y);
    }
}
