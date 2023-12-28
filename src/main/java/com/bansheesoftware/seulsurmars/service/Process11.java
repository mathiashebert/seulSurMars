package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.*;

import java.util.Optional;

/**
 * brancher et debrancher une ampoule electrique
 */
public class Process11 implements Processor {

    @Override
    public boolean process(GameService.Touche touche, Monde monde) {
        if(GameService.Touche.OBJET.equals(touche)) {
            Optional<Objet> objet = trouverObjet(monde, monde.positionX, monde.positionY).filter(objet1 -> objet1.graphisme.equals(Objet.GRAPHISME.inflammable));
            Optional<Objet> inventaire = Optional.ofNullable(monde.inventaire).filter(objet1 -> objet1.graphisme.equals(Objet.GRAPHISME.electrique));

            if(objet.isPresent() && inventaire.isPresent()) {
                monde.objets.remove(objet.get());
                monde.inventaire = null;
                monde.animations.add(new Animation("animation-"+monde.increment(), monde.positionX, monde.positionY, Animation.GRAPHISME.feu));
                monde.objets.add(new Objet("objet-"+monde.increment(), monde.positionX, monde.positionY, Objet.GRAPHISME.bouteille));
                return true;
            }
        }

        return false;
    }
}
