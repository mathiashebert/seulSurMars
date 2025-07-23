package com.bansheesoftware.seulsurmars.service.creermonde;

import com.bansheesoftware.seulsurmars.domain.*;
import com.bansheesoftware.seulsurmars.domain.decor.*;
import com.bansheesoftware.seulsurmars.domain.objet.*;

import java.util.concurrent.atomic.AtomicInteger;

@org.springframework.stereotype.Service
public class CreerMondeService {
    private final AtomicInteger increment = new AtomicInteger(0);


    public Monde creerMonde() {
        Monde monde = creerMonde(50, 10, 6, 6, 6);

        creerSalle(monde, 3,5, 8, 4, true, true);
        creerSalle(monde, 3,0, 10, 4, false, false);
        creerSalle(monde, 12,5, 6, 4, true, true);

        monde.salles.get(2).graphisme = Salle.GRAPHISME.ALARME;

        creerAscenseur(monde, "decors-1", 5, 6, 1, 6);

        monde.objets.add(new Sucre("objet-1", 0, 6));
        monde.objets.add(new Electrique("objet-2", 1, 6));
        monde.objets.add(new Oxygene("objet-3", 2, 6));
        monde.objets.add(new Oxygene("objet-4", 4, 6));
        monde.objets.add(new Hydrogene("objet-5", 5, 6));
        monde.objets.add(new Electrique("objet-7", 6, 6));
        /*monde.decors.add(new Terminal("decor-7.1", 13, 6, Decor.GRAPHISME.terminalCasse));

        monde.decors.add(new Potager("decor-8", 0, 6));
        monde.decors.add(new Potager("decor-10", 1, 6));
        monde.decors.add(new Ampoule("decor-9", 4, 1, Decor.GRAPHISME.ampouleAllumee));
        monde.decors.add(new RecycleurAir("decor-11", 6, 6));
        monde.decors.add(new Hydrazine("decor-12", 7, 6));*/

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

    public Monde creerMonde1() {
        Monde monde = creerMonde(3, 1, 0, 1, 0);
        return monde;
    }


    public Monde creerMonde2() {
        Monde monde = creerMonde(3, 3, 1, 1, 1);
        creerAscenseur(monde, "decors1", 0,1,0,1);
        creerAscenseur(monde,"decors2", 2,1,1,2);
        return monde;
    }

    public Monde creerMonde3() {
        Monde monde = creerMonde(5, 5, 2, 2, 2);
        creerSalle(monde, 1, 1, 3, 3, true, true);
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
