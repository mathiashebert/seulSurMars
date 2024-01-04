package com.bansheesoftware.seulsurmars.service.game;

import com.bansheesoftware.seulsurmars.domain.Decor;
import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Objet;

import java.util.Optional;

/**
 * faire cuire un cupcake avec du sucre et un four
 */
public class Process7 implements Processor {

    @Override
    public boolean process(GameService.Touche touche, Monde monde) {
        if(GameService.Touche.DECOR.equals(touche)) {
            Optional<Decor> decors = trouverDecor(monde, monde.positionX, monde.positionY).filter(decors1 -> decors1.graphisme.equals(Decor.GRAPHISME.four));
            Optional<Objet> objet = trouverObjet(monde, monde.positionX, monde.positionY);
            Optional<Objet> inventaire = Optional.ofNullable(monde.inventaire).filter(objet1 -> objet1.graphisme.equals(Objet.GRAPHISME.sucre));
            if(decors.isPresent() && objet.isEmpty() && inventaire.isPresent()) {
                monde.inventaire = null;
                Objet cupcake = new Objet("objet-"+monde.increment(), monde.positionX, monde.positionY, Objet.GRAPHISME.cupcakequicuit);
                cupcake.animation = 3;
                monde.objets.add(cupcake);
                return true;
            }
        }

        return false;
    }
}
