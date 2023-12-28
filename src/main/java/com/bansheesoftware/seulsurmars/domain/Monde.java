package com.bansheesoftware.seulsurmars.domain;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Monde {

    private final int id;

    public int largeur;
    public int hauteur;

    public List<List<Position>> positions;

    public int positionX = 2;
    public int positionY = 2;

    public List<Objet> objets = new ArrayList<>();
    public List<Decors> decors = new ArrayList<>();
    public List<Animation> animations = new ArrayList<>();

    public List<Salle> salles = new ArrayList<>();

    public Objet inventaire;

    private int increment = 0;

    public int increment() {
        return ++increment;
    }
    public int initIncrement(int i) {
        return increment = i;
    }


    public Monde(int id, int largeur, int hauteur) {
        this.id = id;
        this.largeur = largeur;
        this.hauteur = hauteur;

        positions = new ArrayList<>(largeur);
        for(int i=0; i<largeur; i++) {
            positions.add(new ArrayList<>(hauteur));
            for(int j=0; j<hauteur; j++) {
                positions.get(i).add(new Position(i,j, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.vide));
            }
        }
    }

    public Monde position(int x, int y, Position.POSTION_TYPE type, Position.GRAPHISME graphisme) {
        positions.get(x).get(y).type = type;
        positions.get(x).get(y).graphisme = graphisme;
        return this;
    }

    public int getId() {
        return id;
    }

    public Monde clone() {
        Monde clone = new Monde(this.id, this.largeur, this.hauteur);

        for(int i = 0; i<this.positions.size(); i++) {
            for(int j = 0; j<this.positions.get(i).size(); j++) {
                clone.positions.get(i).get(j).type = this.positions.get(i).get(j).type;
                clone.positions.get(i).get(j).graphisme = this.positions.get(i).get(j).graphisme;
            }
        }
        clone.positionX = this.positionX;
        clone.positionY = this.positionY;

        for(int i = 0; i<this.objets.size(); i++) {
            clone.objets.add(this.objets.get(i).clone());
        }
        for(int i = 0; i<this.decors.size(); i++) {
            clone.decors.add(this.decors.get(i).clone());
        }
        for(int i = 0; i<this.salles.size(); i++) {
            clone.salles.add(this.salles.get(i).clone());
        }
        for(int i = 0; i<this.animations.size(); i++) {
            clone.animations.add(this.animations.get(i).clone());
        }

        if(this.inventaire != null) {
            clone.inventaire = this.inventaire.clone();
        }

        clone.increment = this.increment;

        return clone;

    }
}