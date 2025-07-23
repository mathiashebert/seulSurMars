package com.bansheesoftware.seulsurmars.domain.decor;

public class Ampoule extends Decor {


    public Ampoule(String id, int x, int y, GRAPHISME graphisme) {
        super(id, x, y, graphisme);

        if(!graphisme.equals(GRAPHISME.ampouleEteinte) && !graphisme.equals(GRAPHISME.ampouleAllumee))
            throw new RuntimeException("mauvais graphisme");
    }

    @Override
    public Ampoule duplique() {
        return new Ampoule(id, x, y, graphisme);
    }
}
