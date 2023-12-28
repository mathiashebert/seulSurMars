package com.bansheesoftware.seulsurmars.domain;

public class Animation {
    public String id;
    public int x;
    public int y;
    public GRAPHISME graphisme;

    public enum GRAPHISME {
        feu, explosion
    }

    public Animation(String id, int x, int y, GRAPHISME graphisme) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.graphisme = graphisme;
    }

    public Animation clone() {
        return new Animation(id, x, y, graphisme);
    }
}