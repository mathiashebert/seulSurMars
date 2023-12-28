package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.Decors;
import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Objet;

import java.util.Optional;


/**
 * créer de l'oxygène avec un recycleur d'air
 */
public class Process5 implements Processor {

    @Override
    public boolean process(GameService.Touche touche, Monde monde) {
        if(GameService.Touche.DECOR.equals(touche)) {
            Optional<Decors> decors = trouverDecors(monde, monde.positionX, monde.positionY).filter(decors1 -> decors1.graphisme.equals(Decors.GRAPHISME.recycleurAir));
            Optional<Objet> objet = trouverObjet(monde, monde.positionX, monde.positionY);
            if(decors.isPresent() && objet.isEmpty()) {
                monde.objets.add( new Objet("objet-"+monde.increment(), monde.positionX, monde.positionY, Objet.GRAPHISME.oxygene));
                return true;
            }
        }

        return false;
    }
}
