package com.bansheesoftware.seulsurmars.service.game;

import com.bansheesoftware.seulsurmars.domain.*;
import com.bansheesoftware.seulsurmars.domain.decor.Decor;
import com.bansheesoftware.seulsurmars.domain.decor.Tourelle;
import com.bansheesoftware.seulsurmars.domain.objet.Electrique;
import com.bansheesoftware.seulsurmars.domain.objet.Objet;

import java.util.Optional;

/**
 * brancher et debrancher une tourelle
 */
public class Process14 implements Processor {

    @Override
    public boolean process(GameService.Touche touche, Monde monde) {
        if(GameService.Touche.DECOR.equals(touche)) {
            Optional<Decor> decor = trouverDecor(monde, monde.positionX, monde.positionY);
            Optional<Objet> objet = trouverObjet(monde, monde.positionX, monde.positionY);
            Optional<Salle> salle = trouverSalle(monde, monde.positionX, monde.positionY);
            Optional<Objet> inventaire = Optional.ofNullable(monde.inventaire).filter(objet1 -> objet1.graphisme.equals(Objet.GRAPHISME.electrique));

            if(decor.filter(decors -> decors.graphisme.equals(Decor.GRAPHISME.tourelleFermee)).isPresent() && objet.isEmpty() && salle.isPresent()) {
                decor.get().graphisme = Decor.GRAPHISME.tourelleCassee;
                monde.objets.add( new Electrique("objet-"+monde.increment(), monde.positionX, monde.positionY));
                return true;
            }

            if(decor.filter(decors -> decors.graphisme.equals(Decor.GRAPHISME.tourelleCassee)).isPresent() && inventaire.isPresent() && salle.isPresent()) {
                monde.inventaire = null;
                decor.get().graphisme = Decor.GRAPHISME.tourelleFermee;
                if(salle.get().graphisme.equals(Salle.GRAPHISME.ALARME)) {
                    ((Tourelle) decor.get()).animer(monde);
                }
                return true;
            }
        }

        return false;
    }
}
