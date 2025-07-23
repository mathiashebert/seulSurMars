package com.bansheesoftware.seulsurmars.domain.decor;

public class RecycleurAir extends Decor {

    public RecycleurAir(String id, int x, int y) {
        super(id, x, y, GRAPHISME.recycleurAir);
    }

    @Override
    public RecycleurAir duplique() {
        return new RecycleurAir(id, x, y);
    }
}