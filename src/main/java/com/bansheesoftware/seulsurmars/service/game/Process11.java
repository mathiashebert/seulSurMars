package com.bansheesoftware.seulsurmars.service.game;

import com.bansheesoftware.seulsurmars.domain.*;

import java.util.Optional;

/**
 * allumer un mélange oxygene/hydrogène (inflammable)
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
                Animation feu = new Animation("animation-"+monde.increment(), monde.positionX, monde.positionY, Animation.GRAPHISME.feu, 1);
                feu.delai = 2;
                monde.animations.add(feu);
                Objet eau = new Objet("objet-"+monde.increment(), monde.positionX, monde.positionY, Objet.GRAPHISME.bouteille);
                eau.delai = 2;
                monde.objets.add(eau);
                Animation electrique = new Animation("animation-"+monde.increment(), monde.positionX, monde.positionY, Animation.GRAPHISME.electrique, 2);
                monde.animations.add(electrique);

                return true;
            }
        }

        return false;
    }
}
