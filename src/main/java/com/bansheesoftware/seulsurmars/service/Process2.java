package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.Ascenseur;
import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Position;

import java.util.Optional;

/**
 * gérer les déplacement droite gauche, sur un ascenseur, ou l'utilisation haut bas de l'ascenseur avec la touche "DECOR"
 */
public class Process2 implements Processor {

    @Override
    public boolean process(GameService.Touche touche, Monde monde) {
        if(GameService.Touche.LEFT.equals(touche)) {
            if(monde.positionX > 0) {
                Optional<Ascenseur> ascenseur = trouverDecor(monde, monde.positionX-1, monde.positionY)
                        .filter(decors1 -> decors1 instanceof Ascenseur)
                        .map(decors -> (Ascenseur) decors);
                if(ascenseur.isPresent()) {
                    monde.positionX --;
                    return true;
                }
            }

        }
        if(GameService.Touche.RIGHT.equals(touche)) {
            if(monde.positionX < monde.largeur-1) {
                Optional<Ascenseur> ascenseur = trouverDecor(monde, monde.positionX+1, monde.positionY)
                        .filter(decors1 -> decors1 instanceof Ascenseur)
                        .map(decors -> (Ascenseur) decors);
                if(ascenseur.isPresent()) {
                    monde.positionX ++;
                    return true;
                }
            }

        }
        if(GameService.Touche.DECOR.equals(touche)) {
            Ascenseur ascenseur = trouverDecor(monde, monde.positionX, monde.positionY)
                    .filter(decors1 -> decors1 instanceof Ascenseur)
                    .map(decors -> (Ascenseur) decors)
                    .orElse(null);
            if(ascenseur != null) {

                if(ascenseur.y == ascenseur.hauteurBas) {
                    ascenseur.y = ascenseur.hauteurHaut;
                    monde.positionY = ascenseur.hauteurHaut;
                    return true;
                }
                if(ascenseur.y == ascenseur.hauteurHaut) {
                    ascenseur.y = ascenseur.hauteurBas;
                    monde.positionY = ascenseur.hauteurBas;
                    return true;
                }
            }
        }
        return false;
    }
}
