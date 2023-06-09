package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.*;

import java.util.*;

@org.springframework.stereotype.Service
public class Service {

    private int POSITION_Y;
    private int POSITION_X;
    private Objet[] inventaire = new Objet[10];

    Monde monde; // package pour pouvoir être modifié dans les tests
    private Map<String, String> timers = new HashMap<>();

    public Service(CreerMondeService creerMondeService) {
        monde = creerMondeService.creerMonde();

        POSITION_X = monde.positionX;
        POSITION_Y = monde.positionY;
    }

    public enum Touche {
        LEFT, RIGHT, SPACE,
        DIGIT1, DIGIT2, DIGIT3, DIGIT4, DIGIT5, DIGIT6, DIGIT7, DIGIT8, DIGIT9, DIGIT0
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
            case DIGIT0:
                deposerObjet(0).ifPresent(action -> list.add(action));
                break;
            case DIGIT1:
                deposerObjet(1).ifPresent(action -> list.add(action));
                break;
            case DIGIT2:
                deposerObjet(2).ifPresent(action -> list.add(action));
                break;
            case DIGIT3:
                deposerObjet(3).ifPresent(action -> list.add(action));
                break;
            case DIGIT4:
                deposerObjet(4).ifPresent(action -> list.add(action));
                break;
            case DIGIT5:
                deposerObjet(5).ifPresent(action -> list.add(action));
                break;
            case DIGIT6:
                deposerObjet(6).ifPresent(action -> list.add(action));
                break;
            case DIGIT7:
                deposerObjet(7).ifPresent(action -> list.add(action));
                break;
            case DIGIT8:
                deposerObjet(8).ifPresent(action -> list.add(action));
                break;
            case DIGIT9:
                deposerObjet(9).ifPresent(action -> list.add(action));
                break;
            default:
                return new ArrayList<>();
        }

        if(oldY != POSITION_Y || oldX != POSITION_X) {
            // gérer l'oxygène
            if(isInterieur(oldX, oldY) && !isInterieur(POSITION_X, POSITION_Y)) {
                String id = "oxygen";
                list.add(Action.timer(id, 30));
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

            // ramasser un objet
            Objet objet = trouverObjet(POSITION_X, POSITION_Y);
            if(objet != null) {
                Integer index = null;
                for(int i=0; i<10; i++) {
                    if(inventaire[i] == null) {
                        index = i;
                        break;
                    }
                }
                if(index != null) {
                    inventaire[index] = objet;
                    list.add(Action.inventaire(objet.id, index));
                    monde.objets.remove(objet);
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
    private Objet trouverObjet(int x, int y) {
        return monde.objets.stream().filter(objet -> objet.x == x && objet.y == y).findAny().orElse(null);
    }

    private boolean isInterieur(int x, int y) {
        for(Salle salle : monde.salles) {
            if(x >= salle.x && x < salle.x + salle.largeur && y >= salle.y && y < salle.y + salle.hauteur ) {
                return true;
            }
        }
        return false;
    }

    private Optional<Action> deposerObjet(int index) {
        if(inventaire[index] != null && trouverObjet(POSITION_X, POSITION_Y) == null) {
            Objet o = inventaire[index];
            o.x = POSITION_X;
            o.y = POSITION_Y;
            monde.objets.add(o);
            inventaire[index] = null;
            return Optional.of(Action.graphique(o.id, POSITION_X, POSITION_Y));
        }
        return Optional.empty();
    }
}
