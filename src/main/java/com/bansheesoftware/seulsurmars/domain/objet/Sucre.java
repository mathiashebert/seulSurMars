package com.bansheesoftware.seulsurmars.domain.objet;

public class Sucre extends Objet {
    public Sucre(String id, int x, int y) {
        super(id, x, y, GRAPHISME.sucre);
    }

    @Override
    public Sucre duplique() {
        return new Sucre(id, x, y);
    }
}
