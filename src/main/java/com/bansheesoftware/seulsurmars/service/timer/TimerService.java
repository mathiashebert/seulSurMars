package com.bansheesoftware.seulsurmars.service.timer;

import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Objet;
import com.bansheesoftware.seulsurmars.domain.Salle;

import java.util.*;

@org.springframework.stereotype.Service
public class TimerService {

    public static final String RESPIRER = "respirer";
    public static final String MANGER = "manger";

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

    public void timer(Monde monde, Set<String> timers, String timer) {
        if(timer.equals(RESPIRER)) {
            if(avoirOxygene(monde)) {
                monde.inventaire = null;
            } else {
                throw new RuntimeException("game over");
            }
        }

        if(timer.equals(MANGER)) {
            if(avoirNourriture(monde)) {
                monde.inventaire = null;
            } else {
                throw new RuntimeException("game over");
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
