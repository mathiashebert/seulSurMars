package com.bansheesoftware.seulsurmars.service.timer;

import com.bansheesoftware.seulsurmars.domain.Animation;
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

    public void action(Monde monde, Set<String> timers) {
        // gérer le fait de sortir d'une salle
        Salle salle = trouverSalle(monde, monde.positionX, monde.positionY);
        if(salle != null) {
            timers.remove(RESPIRER); // si on est dedans, il n'y a pas de timer d'oxygène
        }
        else if(!timers.contains(RESPIRER) ) {
            timers.add(RESPIRER);
        }

        for(Objet objet: monde.objets) {
            if(objet.delai > 0 && !timers.contains(objet.id)) {
                timers.add(objet.id);
                new Thread(() -> delaiObjet(timers, objet)).start();
            }
        }

        for(Animation animation: monde.animations) {
            if(animation.delai > 0 && !timers.contains(animation.id)) {
                timers.add(animation.id);
                new Thread(() -> delaiAnimation(timers, animation)).start();
            }
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

    private void delaiObjet(Set<String> timers, Objet objet) {
        try {
            Thread.sleep(objet.delai*1000);
            objet.delai = 0;
            timers.remove(objet.id);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
    private void delaiAnimation(Set<String> timers, Animation animation) {
        try {
            Thread.sleep(animation.delai*1000);
            animation.delai = 0;
            timers.remove(animation.id);
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
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
