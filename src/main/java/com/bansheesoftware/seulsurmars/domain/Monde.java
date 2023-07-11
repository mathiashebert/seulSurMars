package com.bansheesoftware.seulsurmars.domain;

import java.util.ArrayList;
import java.util.List;

public class Monde {
    public int largeur;
    public int hauteur;

    public List<List<Position>> positions;


    public int positionX = 2;
    public int positionY = 2;

    public List<Ascenseur> ascenseurs = new ArrayList<>();
    public List<Objet> objets = new ArrayList<>();
    public List<Decors> decors = new ArrayList<>();

    public List<Salle> salles = new ArrayList<>();


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

    public Monde ascenseur(String id, int x, int y, int hauteurBas, int hauteurHaut) {
        ascenseurs.add(new Ascenseur(id, x,y, hauteurBas, hauteurHaut));
        return this;
    }
}