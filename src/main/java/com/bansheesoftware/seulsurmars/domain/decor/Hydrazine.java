package com.bansheesoftware.seulsurmars.domain.decor;

public class Hydrazine extends Decor {

    public Hydrazine(String id, int x, int y) {
        super(id, x, y, GRAPHISME.hydrazine);
    }


    @Override
    public Hydrazine duplique() {
        return new Hydrazine(id, x, y);
    }
}