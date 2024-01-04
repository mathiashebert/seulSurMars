package com.bansheesoftware.seulsurmars.service.timer;

import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Objet;
import com.bansheesoftware.seulsurmars.domain.Salle;

import java.util.*;

@org.springframework.stereotype.Service
public class TimerService {

    public TimerService() {

    }

    public void action(Monde monde) {
        // gérer le fait de sortir d'une salle
        Salle salle = trouverSalle(monde, monde.positionX, monde.positionY);
        if(salle != null) {
            monde.timerOxygene = 0; // si on est dedans, il n'y a pas de timer d'oxygène
        }
        else {
            monde.timerOxygene = 10; // si on est dehors, le timer d'oxygène est initialisé à 10 secondes
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
                    case decomptefeu:
                        objet.graphisme = Objet.GRAPHISME.feu;
                        objet.animation = 1;
                        break;
                    case feu:
                        objet.graphisme = Objet.GRAPHISME.bouteille;
                        objet.animation = 0;
                        break;
                }
            }
        }



    }


    private Salle trouverSalle(Monde monde, int x, int y) {
        return monde.salles.stream().filter(salle -> x >= salle.x && x < salle.x + salle.largeur && y >= salle.y && y < salle.y + salle.hauteur).findAny().orElse(null);
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
