package com.bansheesoftware.seulsurmars.domain.objet;

import com.bansheesoftware.seulsurmars.domain.decor.RecycleurAir;

public class Tomate extends Objet {

    public Tomate(String id, int x, int y, GRAPHISME graphisme) {
        super(id, x, y, graphisme);

        if(! graphisme.equals(GRAPHISME.tomate) && !graphisme.equals(GRAPHISME.tomatequipousse))
            throw new RuntimeException("mauvais graphisme");
    }


    @Override
    public Tomate duplique() {
        return new Tomate(id, x, y, graphisme);
    }
}
