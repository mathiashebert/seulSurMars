package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.Animation;
import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Objet;

import java.util.Optional;

/**
 * brancher et debrancher une ampoule electrique
 */
public class Process12 implements Processor {

    @Override
    public boolean process(GameService.Touche touche, Monde monde) {
        if(GameService.Touche.OBJET.equals(touche)) {
            Optional<Objet> objet = trouverObjet(monde, monde.positionX, monde.positionY).filter(objet1 -> objet1.graphisme.equals(Objet.GRAPHISME.explosif));
            Optional<Objet> inventaire = Optional.ofNullable(monde.inventaire).filter(objet1 -> objet1.graphisme.equals(Objet.GRAPHISME.electrique));

            if(objet.isPresent() && inventaire.isPresent()) {
                monde.objets.remove(objet.get());
                monde.inventaire = null;
                monde.animations.add(new Animation("animation-"+monde.increment(), monde.positionX, monde.positionY, Animation.GRAPHISME.explosion));
                return true;
            }
        }

        return false;
    }
}
