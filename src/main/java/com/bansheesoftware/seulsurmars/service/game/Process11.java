package com.bansheesoftware.seulsurmars.service.game;

import com.bansheesoftware.seulsurmars.domain.*;
import com.bansheesoftware.seulsurmars.domain.objet.Objet;

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
                monde.inventaire = null;
                objet.get().graphisme = Objet.GRAPHISME.decomptefeu;
                objet.get().animation = 3;
                return true;
            }
        }

        return false;
    }
}
