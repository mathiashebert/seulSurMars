package com.bansheesoftware.seulsurmars.service.game;

import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.objet.Objet;

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
                monde.inventaire = null;
                objet.get().graphisme = Objet.GRAPHISME.decompteexplosion;
                objet.get().animation = 3;
                return true;
            }
        }

        return false;
    }
}
