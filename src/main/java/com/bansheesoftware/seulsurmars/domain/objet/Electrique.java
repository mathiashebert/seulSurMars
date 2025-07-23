package com.bansheesoftware.seulsurmars.domain.objet;

public class Electrique extends Objet {
    public Electrique(String id, int x, int y) {
        super(id, x, y, GRAPHISME.electrique);
    }

    @Override
    public Electrique duplique() {
        return new Electrique(id, x, y);
    }
}
