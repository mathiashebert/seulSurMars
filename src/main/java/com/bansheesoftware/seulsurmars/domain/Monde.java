package com.bansheesoftware.seulsurmars.domain;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class Monde {
    public int largeur;
    public int hauteur;

    public List<List<Position>> positions;


    public int positionX = 2;
    public int positionY = 2;

    // public List<Ascenseur> ascenseurs = new ArrayList<>();
    public List<Objet> objets = new ArrayList<>();
    public List<Decors> decors = new ArrayList<>();

    public List<Salle> salles = new ArrayList<>();

    public Objet[] inventaire = new Objet[9];
    public Map<String, String> timers = new HashMap<>();

    private int increment = 0;

    public int increment() {
        return ++increment;
    }


    public Monde(int largeur, int hauteur) {
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
}