package com.bansheesoftware.seulsurmars.domain.decor;

public class Terminal extends Decor {


    public Terminal(String id, int x, int y, GRAPHISME graphisme) {
        super(id, x, y, graphisme);

        if(!graphisme.equals(GRAPHISME.terminal) && !graphisme.equals(GRAPHISME.terminalCasse))
            throw new RuntimeException("mauvais graphisme");
    }

    @Override
    public Terminal duplique() {
        return new Terminal(id, x, y, graphisme);
    }
}
