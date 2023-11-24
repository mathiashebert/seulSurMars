package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.*;

import java.util.*;

@org.springframework.stereotype.Service
public class GameService {

    private int POSITION_Y;
    private int POSITION_X;

    Monde monde; // package pour pouvoir être modifié dans les tests

    public GameService(CreerMondeService creerMondeService) {
        monde = creerMondeService.creerMonde();

        POSITION_X = monde.positionX;
        POSITION_Y = monde.positionY;
    }

    public enum Touche {
        LEFT, RIGHT, SPACE,
        DIGIT1, DIGIT2, DIGIT3, DIGIT4, DIGIT5, DIGIT6, DIGIT7, DIGIT8, DIGIT9
    }

    public Map<String, Action> action(Touche touche) {
        Map<String, Action> resultat = new HashMap<>();
        int oldY = POSITION_Y;
        int oldX = POSITION_X;
        Objet objet;
        switch (touche) {
            case LEFT:
                if(POSITION_X > 0) {
                    if(monde.positions.get(POSITION_X-1).get(POSITION_Y).type.equals(Position.POSTION_TYPE.SOL) || trouverAscenseur(POSITION_X-1, POSITION_Y) != null) {
                        POSITION_X --;
                        resultat.put("hero", Action.deplacer(POSITION_X, POSITION_Y));
                    }
                }
                break;
            case RIGHT:
                if(POSITION_X < monde.largeur -1) {
                    if(monde.positions.get(POSITION_X+1).get(POSITION_Y).type.equals(Position.POSTION_TYPE.SOL) || trouverAscenseur(POSITION_X+1, POSITION_Y) != null) {
                        POSITION_X ++;
                        resultat.put("hero", Action.deplacer(POSITION_X, POSITION_Y));
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
                            resultat.put("hero", Action.deplacer(POSITION_X, POSITION_Y));
                            resultat.put(ascenseur.id, Action.deplacer(POSITION_X, POSITION_Y));
                        }
                        break;
                    case hydrazine:
                        objet = new Objet("objet"+monde.increment(), POSITION_X, POSITION_Y, Objet.GRAPHISME.hydrogene);
                        ajouterObjetDansInventaire(objet, resultat);
                        break;
                    case fontaine:
                        objet = new Objet("objet"+monde.increment(), POSITION_X, POSITION_Y, Objet.GRAPHISME.bouteille);
                        ajouterObjetDansInventaire(objet, resultat);
                        break;
                    case recycleurAir:
                        objet = new Objet("objet"+monde.increment(), POSITION_X, POSITION_Y, Objet.GRAPHISME.oxygene);
                        ajouterObjetDansInventaire(objet, resultat);
                        break;
                    case ampouleAllumee:
                        objet = new Objet("objet"+monde.increment(), POSITION_X, POSITION_Y, Objet.GRAPHISME.electrique);
                        ajouterObjetDansInventaire(objet, resultat);
                        decors.graphisme = Decors.GRAPHISME.ampouleEteinte;
                        resultat.put(decors.id, Action.dessiner(decors));
                        Salle salle = trouverSalle(POSITION_X, POSITION_Y);
                        if(salle != null) {
                            salle.graphisme = Salle.GRAPHISME.SOMBRE;
                            resultat.put(salle.id(), Action.dessiner(salle, monde));
                        }
                        break;
                }

                break;
            case DIGIT1:
                resultat.putAll(deposerObjet(0));
                break;
            case DIGIT2:
                resultat.putAll(deposerObjet(1));
                break;
            case DIGIT3:
                resultat.putAll(deposerObjet(2));
                break;
            case DIGIT4:
                resultat.putAll(deposerObjet(3));
                break;
            case DIGIT5:
                resultat.putAll(deposerObjet(4));
                break;
            case DIGIT6:
                resultat.putAll(deposerObjet(5));
                break;
            case DIGIT7:
                resultat.putAll(deposerObjet(6));
                break;
            case DIGIT8:
                resultat.putAll(deposerObjet(7));
                break;
            case DIGIT9:
                resultat.putAll(deposerObjet(8));
                break;
            default:
                return new HashMap<>();
        }

        if(oldY != POSITION_Y || oldX != POSITION_X) {
            // gérer l'oxygène
            if(isInterieur(oldX, oldY) && !isInterieur(POSITION_X, POSITION_Y)) {
                String id = "oxygen";
                resultat.put(id, Action.timer(30));
                monde.timers.put(id, "oxygen");
            }
            else if(!isInterieur(oldX, oldY) && isInterieur(POSITION_X, POSITION_Y)) {
                Set<String> keys = new HashSet<>(monde.timers.keySet());
                for(String key : keys) {
                    if(monde.timers.get(key).equals("oxygen")) {
                        monde.timers.remove(key);
                        resultat.put(key, Action.timer(0));
                    }
                }
            }

            // ramasser un objet
            objet = trouverObjet(POSITION_X, POSITION_Y);
            if(objet != null && !objet.ancre) {
                ajouterObjetDansInventaire(objet, resultat);
            }
        }

        return resultat;
    }

    public Map<String, Action> timer(String id) {
        Map<String, Action> resultat = new HashMap<>();
        if(!monde.timers.containsKey(id)) {
            return  resultat;
        }
        else if(monde.timers.get(id).equals("oxygen")) {
            resultat.put("hero", Action.gameOver());
            resultat.put(id, Action.timer(0));
            monde.timers.remove(id);
        }
        else if(monde.timers.get(id).equals("tomate")) {
            resultat.put(id, Action.timer(0));
            monde.timers.remove(id);
            Decors d = monde.decors.stream().filter(decors -> decors.id.equals(id)).findAny().orElse(null);
            if(d != null) {
                if(trouverObjet(d.x, d.y) == null) {
                    Objet objet = new Objet("objet"+monde.increment(), d.x, d.y, Objet.GRAPHISME.tomate);
                    monde.objets.add(objet);
                    resultat.put(objet.id, Action.dessiner(objet));
                }
            }
        }
        else if(monde.timers.get(id).equals("cupcake")) {
            resultat.put(id, Action.timer(0));
            monde.timers.remove(id);
            Decors d = monde.decors.stream().filter(decors -> decors.id.equals(id)).findAny().orElse(null);
            if(d != null) {
                if(trouverObjet(d.x, d.y) == null) {
                    Objet objet = new Objet("objet"+monde.increment(), d.x, d.y, Objet.GRAPHISME.cupcake);
                    monde.objets.add(objet);
                    resultat.put(objet.id, Action.dessiner(objet));
                }
            }
        }
        else if(monde.timers.get(id).equals("flamme")) {
            Objet o = monde.objets.stream().filter(objet -> objet.id.equals(id)).findAny().orElse(null);
            if(o != null) {
                o.graphisme = Objet.GRAPHISME.feu;
                resultat.put(o.id, Action.dessiner(o));
                resultat.get(o.id).duree = -1.3;
                Salle salle = trouverSalle(o.x, o.y);
                if(salle != null) {
                    resultat.put(salle.id(), Action.dessiner(salle, monde));
                }
                monde.timers.put(o.id, "retirer");
            }
        }
        else if(monde.timers.get(id).equals("retirer")) {
            resultat.put(id, Action.retirer());
            Objet o = monde.objets.stream().filter(objet -> objet.id.equals(id)).findAny().orElse(null);
            if(o != null) {
                monde.objets.remove(o);
                if(o.graphisme.equals(Objet.GRAPHISME.feu)) {
                    Salle salle = trouverSalle(o.x, o.y);
                    if(salle != null) {
                        resultat.put(salle.id(), Action.dessiner(salle, monde));
                    }
                }
            }

        }
        return resultat;
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
    private Salle trouverSalle(int x, int y) {
        return monde.salles.stream().filter(salle -> x >= salle.x && x < salle.x + salle.largeur && y >= salle.y && y < salle.y + salle.hauteur).findAny().orElse(null);
    }

    private boolean isInterieur(int x, int y) {
        return trouverSalle(x, y) != null;
    }

    private Map<String, Action> deposerObjet(int index) {
        Map<String, Action> actions = new HashMap<>();
        if(this.monde.inventaire[index] != null) {
            Objet o = this.monde.inventaire[index];

            Decors decors = trouverDecors(POSITION_X, POSITION_Y);
            Decors.GRAPHISME dGraphisme = decors == null ? null : decors.graphisme;
            Objet objet = trouverObjet(POSITION_X, POSITION_Y);
            Objet.GRAPHISME oGraphisme = objet == null ? null : objet.graphisme;


            // combiner potager + bouteille
            if(o.graphisme.equals(Objet.GRAPHISME.bouteille) && Decors.GRAPHISME.potager.equals(dGraphisme)) {
                if(monde.timers.containsKey(decors.id)) {
                    return new HashMap<>();
                }
                monde.timers.put(decors.id, "tomate");
                this.monde.inventaire[index] = null;
                actions.put(o.id, Action.retirer());
                actions.put(decors.id, Action.timer(10));
                return actions;
            }

            // combiner four + sucre
            if(o.graphisme.equals(Objet.GRAPHISME.sucre) && Decors.GRAPHISME.four.equals(dGraphisme)) {
                if(monde.timers.containsKey(decors.id)) {
                    return new HashMap<>();
                }
                monde.timers.put(decors.id, "cupcake");
                this.monde.inventaire[index] = null;
                actions.put(o.id, Action.retirer());
                actions.put(decors.id, Action.timer(5));
                return actions;
            }

            // combiner ampoule eteinte + fil electrique
            if(o.graphisme.equals(Objet.GRAPHISME.electrique) && Decors.GRAPHISME.ampouleEteinte.equals(dGraphisme)) {
                this.monde.inventaire[index] = null;
                actions.put(o.id, Action.retirer());
                decors.graphisme = Decors.GRAPHISME.ampouleAllumee;
                actions.put(decors.id, Action.dessiner(decors));
                Salle salle = trouverSalle(POSITION_X, POSITION_Y);
                if(salle != null) {
                    salle.graphisme = Salle.GRAPHISME.NORMALE;
                    actions.put(salle.id(), Action.dessiner(salle, monde));
                }
                return actions;
            }

            // combiner hydrogen + oxygen (ou inverse)
            if(o.graphisme.equals(Objet.GRAPHISME.oxygene) && Objet.GRAPHISME.hydrogene.equals(oGraphisme)
            || o.graphisme.equals(Objet.GRAPHISME.hydrogene) && Objet.GRAPHISME.oxygene.equals(oGraphisme)) {
                this.monde.inventaire[index] = null;
                actions.put(o.id, Action.retirer());
                actions.put(objet.id, Action.retirer());
                Objet inflammable = new Objet("objet"+monde.increment(), POSITION_X, POSITION_Y, Objet.GRAPHISME.inflammable);
                actions.put(inflammable.id, Action.dessiner(inflammable));
                monde.objets.add(inflammable);
                monde.objets.remove(objet);
                return actions;
            }

            // combiner sucre + oxygen (ou inverse)
            if(o.graphisme.equals(Objet.GRAPHISME.oxygene) && Objet.GRAPHISME.sucre.equals(oGraphisme)
                    || o.graphisme.equals(Objet.GRAPHISME.sucre) && Objet.GRAPHISME.oxygene.equals(oGraphisme)) {
                this.monde.inventaire[index] = null;
                actions.put(o.id, Action.retirer());
                actions.put(objet.id, Action.retirer());
                Objet inflammable = new Objet("objet"+monde.increment(), POSITION_X, POSITION_Y, Objet.GRAPHISME.explosif);
                actions.put(inflammable.id, Action.dessiner(inflammable));
                monde.objets.add(inflammable);
                monde.objets.remove(objet);
                return actions;
            }


            // combiner electrique + inflammable
            if(o.graphisme.equals(Objet.GRAPHISME.electrique) && Objet.GRAPHISME.inflammable.equals(oGraphisme)) {
                if(monde.timers.containsKey(objet.id)) {
                    return new HashMap<>();
                }
                monde.timers.put(objet.id, "flamme");
                this.monde.inventaire[index] = null;
                actions.put(o.id, Action.retirer());
                objet.ancre = true;
                actions.put(objet.id, Action.timer(3));
                return actions;
            }

            // cas par défaut : deposer l'objet à condition que la case soit libre
            if(objet == null) {
                o.x = POSITION_X;
                o.y = POSITION_Y;
                monde.objets.add(o);
                this.monde.inventaire[index] = null;
                actions.put(o.id, Action.dessiner(o));
            }
        }
        return actions;
    }

    private void ajouterObjetDansInventaire(Objet objet, Map<String, Action> map) {
        Integer index = null;
        for(int i=0; i<9; i++) {
            if(this.monde.inventaire[i] == null) {
                index = i;
                break;
            }
        }
        if(index != null) {
            this.monde.inventaire[index] = objet;

            if(monde.objets.indexOf(objet) > -1) {
                monde.objets.remove(objet);
            }
            map.put(objet.id, Action.dessiner(objet, index));
        }
    }
}
