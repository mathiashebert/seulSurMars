package com.bansheesoftware.seulsurmars.service.game;

import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Objet;

/**
 * ramasser déposer un objet avec la touche "OBJET"
 */
public class Process3 implements Processor {

    @Override
    public boolean process(GameService.Touche touche, Monde monde) {
        if(GameService.Touche.OBJET.equals(touche)) {
            Objet objet = trouverObjet(monde, monde.positionX, monde.positionY)
                    .orElse(null);
            if(objet != null && objet.delai == 0 && monde.inventaire == null) {
                monde.inventaire = objet;
                monde.objets.remove(objet);
                return true;
            }
            if(objet == null && monde.inventaire != null) {
                monde.inventaire.x = monde.positionX;
                monde.inventaire.y = monde.positionY;
                monde.objets.add(monde.inventaire);
                monde.inventaire = null;
                return true;
            }
        }
        return false;
    }
}
