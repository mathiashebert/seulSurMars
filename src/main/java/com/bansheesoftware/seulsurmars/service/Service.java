package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.Action;
import com.bansheesoftware.seulsurmars.domain.Ascenseur;
import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Position;

import java.util.ArrayList;
import java.util.List;

@org.springframework.stereotype.Service
public class Service {

    int POSITION_Y = 0;
    int POSITION_X = 0;

    Monde monde; // package pour pouvoir être modifié dans les tests

    public Service() {
        monde = new Monde(20, 15);
        for(int i=0; i<20; i++) {
            monde.position(i, 9, Position.POSTION_TYPE.SOL, Position.GRAPHISME.sol);
        }
        POSITION_X = 10;
        POSITION_Y = 9;

        monde.ascenseur("ascenseur1", 9, 9, 9, 11);
    }

    public enum Touche {
        LEFT, RIGHT, SPACE
    }

    public List<Action> action(Touche touche) {
        List<Action> list = new ArrayList<>();
        switch (touche) {
            case LEFT:
                if(POSITION_X > 0) {
                    if(monde.positions.get(POSITION_X-1).get(POSITION_Y).type.equals(Position.POSTION_TYPE.SOL) || trouverAscenseur(POSITION_X-1, POSITION_Y) != null) {
                        POSITION_X --;
                        list.add(new Action("hero", POSITION_X, POSITION_Y));
                    }
                }
                break;
            case RIGHT:
                if(POSITION_X < monde.largeur -1) {
                    if(monde.positions.get(POSITION_X+1).get(POSITION_Y).type.equals(Position.POSTION_TYPE.SOL) || trouverAscenseur(POSITION_X+1, POSITION_Y) != null) {
                        POSITION_X ++;
                        list.add(new Action("hero", POSITION_X, POSITION_Y));
                    }
                }
                break;
            case SPACE:
                Ascenseur ascenseur = trouverAscenseur(POSITION_X, POSITION_Y);
                if(ascenseur != null) {
                    if(ascenseur.y == ascenseur.hauteurBas) {
                        POSITION_Y = ascenseur.hauteurHaut;
                        ascenseur.y = POSITION_Y;
                        list.add(new Action("hero", POSITION_X, POSITION_Y));
                        list.add(new Action(ascenseur.id, POSITION_X, POSITION_Y));
                    } else {
                        POSITION_Y = ascenseur.hauteurBas;
                        ascenseur.y = POSITION_Y;
                        list.add(new Action("hero", POSITION_X, POSITION_Y));
                        list.add(new Action(ascenseur.id, POSITION_X, POSITION_Y));
                    }

                }

                break;
        }
        // list.add(new Action("hero", POSITION_X, POSITION_Y));
        return list;
    }

    private Ascenseur trouverAscenseur(int x, int y) {
        return monde.ascenseurs.stream().filter(ascenseur -> ascenseur.x == x && ascenseur.y == y).findAny().orElse(null);
    }
}
