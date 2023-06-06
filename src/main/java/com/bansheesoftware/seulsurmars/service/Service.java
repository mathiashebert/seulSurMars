package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.*;

import java.util.*;

@org.springframework.stereotype.Service
public class Service {

    private int POSITION_Y;
    private int POSITION_X;

    Monde monde; // package pour pouvoir être modifié dans les tests
    private int numTimer = 1;
    private Map<String, String> timers = new HashMap<>();

    public Service(CreerMondeService creerMondeService) {
        monde = creerMondeService.creerMonde();

        POSITION_X = monde.positionX;
        POSITION_Y = monde.positionY;
    }

    public enum Touche {
        LEFT, RIGHT, SPACE
    }

    public List<Action> action(Touche touche) {
        List<Action> list = new ArrayList<>();
        int oldY = POSITION_Y;
        int oldX = POSITION_X;
        switch (touche) {
            case LEFT:
                if(POSITION_X > 0) {
                    if(monde.positions.get(POSITION_X-1).get(POSITION_Y).type.equals(Position.POSTION_TYPE.SOL) || trouverAscenseur(POSITION_X-1, POSITION_Y) != null) {
                        POSITION_X --;
                        list.add(Action.graphique("hero", POSITION_X, POSITION_Y));
                    }
                }
                break;
            case RIGHT:
                if(POSITION_X < monde.largeur -1) {
                    if(monde.positions.get(POSITION_X+1).get(POSITION_Y).type.equals(Position.POSTION_TYPE.SOL) || trouverAscenseur(POSITION_X+1, POSITION_Y) != null) {
                        POSITION_X ++;
                        list.add(Action.graphique("hero", POSITION_X, POSITION_Y));
                    }
                }
                break;
            case SPACE:
                Ascenseur ascenseur = trouverAscenseur(POSITION_X, POSITION_Y);
                if(ascenseur != null) {
                    if(ascenseur.y == ascenseur.hauteurBas) {
                        POSITION_Y = ascenseur.hauteurHaut;
                        ascenseur.y = POSITION_Y;
                        list.add(Action.graphique("hero", POSITION_X, POSITION_Y));
                        list.add(Action.graphique(ascenseur.id, POSITION_X, POSITION_Y));
                    } else {
                        POSITION_Y = ascenseur.hauteurBas;
                        ascenseur.y = POSITION_Y;
                        list.add(Action.graphique("hero", POSITION_X, POSITION_Y));
                        list.add(Action.graphique(ascenseur.id, POSITION_X, POSITION_Y));
                    }

                }

                break;
            default:
                return new ArrayList<>();
        }

        if(oldY != POSITION_Y || oldX != POSITION_X) {
            if(isInterieur(oldX, oldY) && !isInterieur(POSITION_X, POSITION_Y)) {
                String id = "timer"+numTimer;
                ++numTimer;
                list.add(Action.timer(id, 60));
                timers.put(id, "oxygen");
            }
            else if(!isInterieur(oldX, oldY) && isInterieur(POSITION_X, POSITION_Y)) {
                Set<String> keys = timers.keySet();
                for(String key : keys) {
                    if(timers.get(key).equals("oxygen")) {
                        timers.remove(key);
                        list.add(Action.timer(key, 0));
                    }
                }
            }
        }

        return list;
    }

    public List<Action> timer(String id) {
        List list = new ArrayList<>();
        if(timers.containsKey(id) && timers.get(id).equals("oxygen")) {
            list.add(Action.gameOver());
        }
        return list;
    }

    private Ascenseur trouverAscenseur(int x, int y) {
        return monde.ascenseurs.stream().filter(ascenseur -> ascenseur.x == x && ascenseur.y == y).findAny().orElse(null);
    }

    private boolean isInterieur(int x, int y) {
        for(Salle salle : monde.salles) {
            if(x >= salle.x && x < salle.x + salle.largeur && y >= salle.y && y < salle.y + salle.hauteur ) {
                return true;
            }
        }
        return false;
    }
}
