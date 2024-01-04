package com.bansheesoftware.seulsurmars.service.game;

import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Objet;

import java.util.Optional;

/**
 * allumer un mélange oxygene/sucre (explosif)
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
                Objet explosion = new Objet("objet-"+monde.increment(), monde.positionX, monde.positionY, Objet.GRAPHISME.decompteexplosion);
                explosion.animation = 1;
                monde.objets.add(explosion);
                return true;
            }
        }

        return false;
    }
}
