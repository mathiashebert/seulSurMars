package com.bansheesoftware.seulsurmars.domain.objet;

public class Oxygene extends Objet {
    public Oxygene(String id, int x, int y) {
        super(id, x, y, GRAPHISME.oxygene);
    }

    @Override
    public Oxygene duplique() {
        return new Oxygene(id, x, y);
    }
}
