package com.bansheesoftware.seulsurmars.domain.decor;

public class Four extends Decor {
    public Four(String id, int x, int y) {
        super(id, x, y, GRAPHISME.four);
    }

    @Override
    public Four duplique() {
        return new Four(id, x, y);
    }
}
