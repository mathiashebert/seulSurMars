package com.bansheesoftware.seulsurmars.domain.objet;

public class Bouteille extends Objet {
    public Bouteille(String id, int x, int y) {
        super(id, x, y, GRAPHISME.bouteille);
    }

    @Override
    public Bouteille duplique() {
        return new Bouteille(id, x, y);
    }
}
