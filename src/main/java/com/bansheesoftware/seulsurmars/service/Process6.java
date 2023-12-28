package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.Decors;
import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Objet;

import java.util.Optional;

/**
 * faire pousser une tomate avec de l'eau et un potager
 */
public class Process6 implements Processor {

    @Override
    public boolean process(GameService.Touche touche, Monde monde) {
        if(GameService.Touche.DECOR.equals(touche)) {
            Optional<Decors> decors = trouverDecors(monde, monde.positionX, monde.positionY).filter(decors1 -> decors1.graphisme.equals(Decors.GRAPHISME.potager));
            Optional<Objet> objet = trouverObjet(monde, monde.positionX, monde.positionY);
            Optional<Objet> inventaire = Optional.ofNullable(monde.inventaire).filter(objet1 -> objet1.graphisme.equals(Objet.GRAPHISME.bouteille));
            if(decors.isPresent() && objet.isEmpty() && inventaire.isPresent()) {
                monde.inventaire = null;
                monde.objets.add( new Objet("objet-"+monde.increment(), monde.positionX, monde.positionY, Objet.GRAPHISME.tomate));
                return true;
            }
        }

        return false;
    }
}
