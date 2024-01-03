package com.bansheesoftware.seulsurmars.service.game;

import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Objet;

import java.util.Optional;

/**
 * melanger sucre et oxygene
 */
public class Process9 implements Processor {

    @Override
    public boolean process(GameService.Touche touche, Monde monde) {
        if(GameService.Touche.OBJET.equals(touche)) {
            Optional<Objet> objet = trouverObjet(monde, monde.positionX, monde.positionY);
            Optional<Objet> inventaire = Optional.ofNullable(monde.inventaire);
            if(
                    objet.filter(objet1 -> objet1.graphisme.equals(Objet.GRAPHISME.oxygene)).isPresent() && inventaire.filter(objet1 -> objet1.graphisme.equals(Objet.GRAPHISME.sucre)).isPresent()
            ||      objet.filter(objet1 -> objet1.graphisme.equals(Objet.GRAPHISME.sucre)).isPresent() && inventaire.filter(objet1 -> objet1.graphisme.equals(Objet.GRAPHISME.oxygene)).isPresent()
            ) {
                monde.inventaire = null;
                monde.objets.remove(objet.get());
                monde.objets.add( new Objet("objet-"+monde.increment(), monde.positionX, monde.positionY, Objet.GRAPHISME.explosif));
                return true;
            }
        }

        return false;
    }
}
