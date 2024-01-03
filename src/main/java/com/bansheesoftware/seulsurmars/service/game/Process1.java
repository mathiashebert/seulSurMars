package com.bansheesoftware.seulsurmars.service.game;

import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Position;

/**
 * gérer les déplacement droite gauche, sur du sol
 */
public class Process1 implements Processor {

    @Override
    public boolean process(GameService.Touche touche, Monde monde) {
        if(GameService.Touche.LEFT.equals(touche)) {
            if(monde.positionX > 0) {
                Position destination = monde.positions.get(monde.positionX -1).get(monde.positionY);
                if(Position.POSTION_TYPE.SOL.equals(destination.type)) {
                    monde.positionX --;
                    return true;
                }
            }

        }
        if(GameService.Touche.RIGHT.equals(touche)) {
            if(monde.positionX < monde.largeur-1) {
                Position destination = monde.positions.get(monde.positionX +1).get(monde.positionY);
                if(Position.POSTION_TYPE.SOL.equals(destination.type)) {
                    monde.positionX ++;
                    return true;
                }
            }

        }
        return false;
    }
}
