package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.*;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@org.springframework.stereotype.Service
public class CreerMondeService {
    private AtomicInteger increment = new AtomicInteger(0);


    public Monde creerMonde() {
        Monde monde = creerMonde(10, 10, 6, 6, 6);

        creerSalle(monde, 3,5, 6, 4, true, true);
        creerSalle(monde, 3,0, 6, 4, false, false);

        creerAscenseur(monde, "decors-1", 5, 6, 1, 6);

        monde.objets.add(new Objet("objet-1", 4, 6, Objet.GRAPHISME.sucre));
        monde.objets.add(new Objet("objet-2", 3, 6, Objet.GRAPHISME.bouteille));
        monde.objets.add(new Objet("objet-3", 2, 6, Objet.GRAPHISME.bouteille));
        monde.objets.add(new Objet("objet-4", 4, 1, Objet.GRAPHISME.oxygene));
        monde.objets.add(new Objet("objet-5", 6, 1, Objet.GRAPHISME.hydrogene));

        monde.decors.add(new Decors("decors-2", 0, 6, Decors.GRAPHISME.potager));
        monde.decors.add(new Decors("decors-3", 4, 1, Decors.GRAPHISME.ampouleAllumee));
        monde.decors.add(new Decors("decors-4", 1, 6, Decors.GRAPHISME.hydrazine));
        monde.decors.add(new Decors("decors-5", 6, 1, Decors.GRAPHISME.recycleurAir));

        return monde;
    }

    public Monde creerMonde(int largeur, int hauteur, int niveauSol, int positionX, int positionY) {

        Monde monde = new Monde(increment.getAndIncrement(), largeur, hauteur);
        monde.positionX = positionX;
        monde.positionY = positionY;
        for(int i=0; i<monde.largeur; i++) {
            monde.position(i, niveauSol, Position.POSTION_TYPE.SOL, Position.GRAPHISME.sol);
        }
        for(int i=0; i<monde.largeur; i++) {
            for(int j=0; j<niveauSol; j++) {
                monde.position(i, j, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.roche);
            }
        }

        return monde;
    }

    public void creerAscenseur(Monde monde, String id, int x, int y, int hauteurBas, int hauteurHaut) {
        monde.position(x, hauteurBas, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.carreau);
        monde.position(x, hauteurHaut, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.carreau);
        monde.decors.add(new Ascenseur(id, x, y, hauteurBas, hauteurHaut));
    }

    public void creerSalle(Monde monde, int x, int y, int largeur, int hauteur, boolean porteGauche, boolean porteDroite) {
        // colonne de gauche
        monde.position(x, y, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.mur6);
        monde.position(x, y+1, porteGauche?Position.POSTION_TYPE.SOL: Position.POSTION_TYPE.VIDE, porteGauche? Position.GRAPHISME.porte:Position.GRAPHISME.mur4);
        for(int j=y+2; j<y+hauteur-1; j++) {
            monde.position(x, j, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.mur4);
        }
        monde.position(x, y+hauteur-1, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.mur1);

        // milieu
        for(int i = x+1; i < x + largeur-1; i++) {
            monde.position(i, y, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.mur7);
            monde.position(i, y+1, Position.POSTION_TYPE.SOL, Position.GRAPHISME.dalle);
            for (int j = y + 2; j < y + hauteur - 1; j++) {
                monde.position(i, j, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.carreau);
            }
            monde.position(i, y + hauteur - 1, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.mur2);
        }

        // colonne de droite
        monde.position(x+largeur-1, y, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.mur8);
        monde.position(x+largeur-1, y+1, porteDroite?Position.POSTION_TYPE.SOL: Position.POSTION_TYPE.VIDE, porteDroite? Position.GRAPHISME.porte:Position.GRAPHISME.mur5);
        for(int j=y+2; j<y+hauteur-1; j++) {
            monde.position(x+largeur-1, j, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.mur5);
        }
        monde.position(x+largeur-1, y+hauteur-1, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.mur3);

        monde.salles.add(new Salle(x, y, largeur, hauteur));
    }
}
