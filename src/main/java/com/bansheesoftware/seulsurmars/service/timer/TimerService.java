package com.bansheesoftware.seulsurmars.service.timer;

import com.bansheesoftware.seulsurmars.domain.*;
import com.bansheesoftware.seulsurmars.domain.decor.Decor;
import com.bansheesoftware.seulsurmars.domain.decor.Tourelle;
import com.bansheesoftware.seulsurmars.domain.objet.Objet;

import java.util.*;
import java.util.stream.Collectors;

@org.springframework.stereotype.Service
public class TimerService {

    public TimerService() {

    }

    public void action(Monde monde) {
        Salle salle = trouverSalle(monde, monde.positionX, monde.positionY);

        // gérer le fait de sortir d'une salle
        if(salle != null) {
            monde.timerOxygene = 0; // si on est dedans, il n'y a pas de timer d'oxygène
        }
        else {
            monde.timerOxygene = 30; // si on est dehors, le timer d'oxygène est initialisé à 30 secondes
        }

        // entrée dans une salle sous alarme
        if(salle != null) {
            if(salle.graphisme.equals(Salle.GRAPHISME.ALARME)) {
                Optional<Decor> tourelle = trouverDecor(monde, salle, Decor.GRAPHISME.tourelleFermee);
                tourelle.ifPresent(decor -> ((Tourelle) decor).animer(monde));
            }
        }
    }

    public void timer(Monde monde, String timer) {

        if(timer.equals("oxygene")) {
            if(avoirOxygene(monde)) {
                monde.inventaire = null;
            } else {
                monde.status = Monde.Status.gameOver;
                monde.timerOxygene = 0;
            }
        }

        else if(timer.equals("nourriture")) {
            if(avoirNourriture(monde)) {
                monde.inventaire = null;
            } else {
                monde.status = Monde.Status.gameOver;
                monde.timerNourriture = 0;
            }
        } else {
            timerObjet(monde, timer);
            timerDecor(monde, timer);

        }

    }

    private void timerObjet(Monde monde, String timer) {
        Objet objet = monde.objets.stream().filter(o -> o.id.equals(timer)).findAny().orElse(null);
        if(objet != null) {
            switch (objet.graphisme) {
                case tomatequipousse:
                    objet.graphisme = Objet.GRAPHISME.tomate;
                    objet.animation = 0;
                    break;
                case cupcakequicuit:
                    objet.graphisme = Objet.GRAPHISME.cupcake;
                    objet.animation = 0;
                    break;
                case decompteexplosion:
                    objet.graphisme = Objet.GRAPHISME.explosion;
                    objet.animation = 1;
                    break;
                case explosion:
                    objet.animation = 0;
                    monde.objets.remove(objet);
                    break;
                case decomptefeu:
                    objet.graphisme = Objet.GRAPHISME.feu;
                    objet.animation = 1;
                    break;
                case feu:
                    objet.graphisme = Objet.GRAPHISME.bouteille;
                    objet.animation = 0;

                    trouverObjetAutour(monde, objet.x, objet.y).stream()
                            .filter(Objet::isInflammable)
                            .forEach(objet1 -> {objet1.graphisme = Objet.GRAPHISME.feu; objet1.animation = 1;});

                    trouverObjetAutour(monde, objet.x, objet.y).stream()
                            .filter(Objet::isExplosif)
                            .forEach(objet1 -> {objet1.graphisme = Objet.GRAPHISME.explosion; objet1.animation = 1;});

                    trouverDecorAutour(monde, objet.x, objet.y).stream()
                            .filter(Decor::isInflammable)
                            .forEach(decor1 -> {
                                decor1.graphisme = Decor.GRAPHISME.detruit;
                                //Objet newObjet = new Objet("objet-"+monde.increment(), decor1.x, decor1.y, Objet.GRAPHISME.feu);
                                //newObjet.animation = 1;
                                //monde.objets.add(newObjet);
                            });

                    trouverDecorAutour(monde, objet.x, objet.y).stream()
                            .filter(Decor::isExplosif)
                            .forEach(decor1 -> {
                               decor1.graphisme = Decor.GRAPHISME.detruit;
                                //Objet newObjet = new Objet("objet-"+monde.increment(), decor1.x, decor1.y, Objet.GRAPHISME.explosion);
                                //newObjet.animation = 1;
                                //monde.objets.add(newObjet);
                            });

                    if(isHeroAutour(monde, objet.x, objet.y)) {
                        monde.status = Monde.Status.gameOver;
                    }

                    break;
            }
        }

    }
    private void timerDecor(Monde monde, String timer) {
        Decor decor = monde.decors.stream().filter(o -> o.id.equals(timer)).findAny().orElse(null);
        if(decor != null) {

            switch (decor.graphisme) {
                case tourelleOuverture:
                case tourelleFermeture:
                case tourelleVisee:
                case tourelleMiseEnVeille:
                    ((Tourelle) decor).animer(monde);
                    break;
            }
        }
    }

    private Salle trouverSalle(Monde monde, int x, int y) {
        return monde.salles.stream().filter(salle -> x >= salle.x && x < salle.x + salle.largeur && y >= salle.y && y < salle.y + salle.hauteur).findAny().orElse(null);
    }

    private Optional<Decor> trouverDecor(Monde monde, Salle salle, Decor.GRAPHISME graphisme) {
        return monde.decors.stream()
                .filter(decor -> decor.graphisme.equals(graphisme))
                .filter(decor ->
                        salle.x <= decor.x &&
                                salle.x + salle.largeur >= decor.x &&
                                salle.y <= decor.y &&
                                salle.y + salle.hauteur >= decor.y).findAny();
    }
    private List<Objet> trouverObjetAutour(Monde monde, int x, int y) {
        return monde.objets.stream()
                .filter(o -> isAutour(o.x, o.y, x, y))
                    .collect(Collectors.toList());
    }
    private List<Decor> trouverDecorAutour(Monde monde, int x, int y) {
        return monde.decors.stream()
                .filter(o -> isAutour(o.x, o.y, x, y))
                .collect(Collectors.toList());
    }
    private boolean isHeroAutour(Monde monde, int x, int y) {
        return isAutour(monde.positionX, monde.positionY, x, y);
    }

    private boolean isAutour(int x1, int y1, int x2, int y2) {
        return (x1 == x2 || x1-1 == x2 || x1+1 == x2) &&
                (y1 == y2 || y1-1 == y2 || y1+1 == y2);
    }

    private boolean avoirOxygene(Monde monde) {
        return Optional.ofNullable(monde.inventaire)
                .filter(objet -> objet.graphisme.equals(Objet.GRAPHISME.oxygene))
                .isPresent();
    }

    private boolean avoirNourriture(Monde monde) {
        return Optional.ofNullable(monde.inventaire)
                .filter(objet -> objet.graphisme.equals(Objet.GRAPHISME.tomate) || objet.graphisme.equals(Objet.GRAPHISME.cupcake))
                .isPresent();
    }

}
