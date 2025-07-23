package com.bansheesoftware.seulsurmars.domain.objet;

import com.bansheesoftware.seulsurmars.domain.decor.RecycleurAir;

public class Explosif extends Objet {
    public Explosif(String id, int x, int y) {
        super(id, x, y, GRAPHISME.explosif);
    }


    @Override
    public Explosif duplique() {
        return new Explosif(id, x, y);
    }
}
