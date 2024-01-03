package com.bansheesoftware.seulsurmars.domain;

public class Animation {
    public String id;
    public int x;
    public int y;
    public GRAPHISME graphisme;
    public int delai = 0;
    public int duree = 1;

    public enum GRAPHISME {
        feu, explosion, tomate, four, electrique
    }

    public Animation(String id, int x, int y, GRAPHISME graphisme, int duree) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.graphisme = graphisme;
        this.duree = duree;
    }

    public Animation clone() {
        Animation animation = new Animation(id, x, y, graphisme, duree);
        animation.delai = this.delai;
        return animation;
    }
}