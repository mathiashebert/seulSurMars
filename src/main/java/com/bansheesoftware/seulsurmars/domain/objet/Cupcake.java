package com.bansheesoftware.seulsurmars.domain.objet;

import com.bansheesoftware.seulsurmars.domain.decor.RecycleurAir;

public class Cupcake extends Objet {

    public Cupcake(String id, int x, int y, int animation) {
        super(id, x, y, GRAPHISME.cupcake);

        if(animation > 0) {
            this.animation = animation;
            this.graphisme = GRAPHISME.cupcakequicuit;
        }

    }


    @Override
    public Cupcake duplique() {
        return new Cupcake(id, x, y, animation);
    }
}
