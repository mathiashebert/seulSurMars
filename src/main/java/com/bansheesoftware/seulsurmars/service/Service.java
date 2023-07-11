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
                        list.add(Action.deplacer("hero", POSITION_X, POSITION_Y));
                    }
                }
                break;
            case RIGHT:
                if(POSITION_X < monde.largeur -1) {
                    if(monde.positions.get(POSITION_X+1).get(POSITION_Y).type.equals(Position.POSTION_TYPE.SOL) || trouverAscenseur(POSITION_X+1, POSITION_Y) != null) {
                        POSITION_X ++;
                        list.add(Action.deplacer("hero", POSITION_X, POSITION_Y));
                    }
                }
                break;
            case SPACE:
                Decors decors = trouverDecors(POSITION_X, POSITION_Y);
                if(decors != null) switch (decors.graphisme) {
                    case ascenseur:
                        Ascenseur ascenseur = trouverAscenseur(POSITION_X, POSITION_Y);
                        if(ascenseur != null) {
                            if (ascenseur.y == ascenseur.hauteurBas) {
                                POSITION_Y = ascenseur.hauteurHaut;
                            } else {
                                POSITION_Y = ascenseur.hauteurBas;
                            }
                            ascenseur.y = POSITION_Y;
                            decors.y = ascenseur.y;
                            list.add(Action.deplacer("hero", POSITION_X, POSITION_Y));
                            list.add(Action.deplacer(ascenseur.id, POSITION_X, POSITION_Y));
                        }
                        break;
                    case hydrazine:
                        Objet objet = new Objet("hydrogen", POSITION_X, POSITION_Y, Objet.GRAPHISME.hydrogene);
                        ajouterObjetDansInventaire(objet, list);
                        break;
                }

                break;
            case DIGIT1:
                deposerObjet(0).ifPresent(action -> list.add(action));
                break;
            case DIGIT2:
                deposerObjet(1).ifPresent(action -> list.add(action));
                break;
            case DIGIT3:
                deposerObjet(2).ifPresent(action -> list.add(action));
                break;
            case DIGIT4:
                deposerObjet(3).ifPresent(action -> list.add(action));
                break;
            case DIGIT5:
                deposerObjet(4).ifPresent(action -> list.add(action));
                break;
            case DIGIT6:
                deposerObjet(5).ifPresent(action -> list.add(action));
                break;
            case DIGIT7:
                deposerObjet(6).ifPresent(action -> list.add(action));
                break;
            case DIGIT8:
                deposerObjet(7).ifPresent(action -> list.add(action));
                break;
            case DIGIT9:
                deposerObjet(8).ifPresent(action -> list.add(action));
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
                ajouterObjetDansInventaire(objet, list);
            }
        }

        return list;
    }

    public List<Action> timer(String id) {
        List list = new ArrayList<>();
        if(timers.containsKey(id) && timers.get(id).equals("oxygen")) {
            list.add(Action.gameOver());
        }
        if(timers.containsKey(id) && timers.get(id).equals("tomate")) {
            Decors d = monde.decors.stream().filter(decors -> decors.id.equals(id)).findAny().orElse(null);
            if(d != null) {
                monde.objets.add(new Objet("tomate", d.x, d.y, Objet.GRAPHISME.tomate));
                list.add(Action.timer(id, 0));
                list.add(Optional.of(Action.ajouter("tomate", d.x, d.y, Objet.GRAPHISME.tomate.name())));
            }

        }
        return list;
    }

    private Ascenseur trouverAscenseur(int x, int y) {
        return monde.decors.stream()
                .filter(ascenseur -> ascenseur.x == x && ascenseur.y == y)
                .filter(decors -> decors.graphisme.equals(Decors.GRAPHISME.ascenseur))
                .filter(decors -> decors instanceof Ascenseur)
                .map(decors -> (Ascenseur) decors)
                .findAny().orElse(null);
    }
    private Decors trouverDecors(int x, int y) {
        return monde.decors.stream().filter(decors -> decors.x == x && decors.y == y).findAny().orElse(null);
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

            Decors decors = trouverDecors(POSITION_X, POSITION_Y);
            if(o.graphisme.equals(Objet.GRAPHISME.bouteille) && decors !=null && decors.graphisme.equals(Decors.GRAPHISME.potager)) {
                timers.put(decors.id, "tomate");
                return Optional.of(Action.timer(decors.id, 10));
            }

            o.x = POSITION_X;
            o.y = POSITION_Y;
            monde.objets.add(o);
            inventaire[index] = null;
            return Optional.of(Action.deplacer(o.id, POSITION_X, POSITION_Y));
        }
        return Optional.empty();
    }

    private void ajouterObjetDansInventaire(Objet objet, List<Action> list) {
        Integer index = null;
        for(int i=0; i<9; i++) {
            if(inventaire[i] == null) {
                index = i;
                break;
            }
        }
        if(index != null) {
            inventaire[index] = objet;

            if(monde.objets.indexOf(objet) > -1) {
                monde.objets.remove(objet);
            } else {
                list.add(Action.ajouter(objet.id, objet.x, objet.y, objet.graphisme.name()));
            }

            list.add(Action.inventaire(objet.id, index));
        }
    }
}
