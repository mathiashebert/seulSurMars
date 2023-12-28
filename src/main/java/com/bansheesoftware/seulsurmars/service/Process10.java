package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.Decors;
import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Objet;
import com.bansheesoftware.seulsurmars.domain.Salle;

import java.util.Optional;

/**
 * brancher et debrancher une ampoule electrique
 */
public class Process10 implements Processor {

    @Override
    public boolean process(GameService.Touche touche, Monde monde) {
        if(GameService.Touche.DECOR.equals(touche)) {
            Optional<Decors> decor = trouverDecors(monde, monde.positionX, monde.positionY);
            Optional<Objet> objet = trouverObjet(monde, monde.positionX, monde.positionY);
            Optional<Salle> salle = trouverSalle(monde, monde.positionX, monde.positionY);
            Optional<Objet> inventaire = Optional.ofNullable(monde.inventaire).filter(objet1 -> objet1.graphisme.equals(Objet.GRAPHISME.electrique));

            if(decor.filter(decors -> decors.graphisme.equals(Decors.GRAPHISME.ampouleAllumee)).isPresent() && objet.isEmpty() && salle.isPresent()) {
                decor.get().graphisme = Decors.GRAPHISME.ampouleEteinte;
                monde.objets.add( new Objet("objet-"+monde.increment(), monde.positionX, monde.positionY, Objet.GRAPHISME.electrique));
                salle.get().graphisme = Salle.GRAPHISME.SOMBRE;
                return true;
            }

            if(decor.filter(decors -> decors.graphisme.equals(Decors.GRAPHISME.ampouleEteinte)).isPresent() && inventaire.isPresent() && salle.isPresent()) {
                monde.inventaire = null;
                decor.get().graphisme = Decors.GRAPHISME.ampouleAllumee;
                salle.get().graphisme = Salle.GRAPHISME.NORMALE;
                return true;
            }
        }

        return false;
    }
}
