package com.bansheesoftware.seulsurmars.service.game;

import com.bansheesoftware.seulsurmars.domain.Decor;
import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Objet;

import java.util.Optional;

/**
 * créer de l'hydrogène avec de l'hydrazine
 */
public class Process4 implements Processor {

    @Override
    public boolean process(GameService.Touche touche, Monde monde) {
        if(GameService.Touche.DECOR.equals(touche)) {
            Optional<Decor> decors = trouverDecor(monde, monde.positionX, monde.positionY).filter(decors1 -> decors1.graphisme.equals(Decor.GRAPHISME.hydrazine));
            Optional<Objet> objet = trouverObjet(monde, monde.positionX, monde.positionY);
            if(decors.isPresent() && objet.isEmpty()) {
                monde.objets.add( new Objet("objet-"+monde.increment(), monde.positionX, monde.positionY, Objet.GRAPHISME.hydrogene));
                return true;
            }
        }

        return false;
    }
}
