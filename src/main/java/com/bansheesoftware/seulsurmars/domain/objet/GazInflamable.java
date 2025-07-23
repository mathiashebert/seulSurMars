package com.bansheesoftware.seulsurmars.domain.objet;

public class GazInflamable extends Objet {
    public GazInflamable(String id, int x, int y) {
        super(id, x, y, GRAPHISME.inflammable);
    }

    @Override
    public GazInflamable duplique() {
        return new GazInflamable(id, x, y);
    }
}
