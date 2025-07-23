package com.bansheesoftware.seulsurmars.domain.decor;

public class Potager extends Decor {

    public Potager(String id, int x, int y) {
        super(id, x, y, GRAPHISME.potager);
    }

    @Override
    public Potager duplique() {
        return new Potager(id, x, y);
    }
}