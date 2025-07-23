package com.bansheesoftware.seulsurmars.service.game;

import com.bansheesoftware.seulsurmars.domain.*;
import com.bansheesoftware.seulsurmars.domain.decor.Decor;
import com.bansheesoftware.seulsurmars.domain.objet.Objet;

import java.util.Optional;

public interface Processor {

    boolean process(GameService.Touche touche, Monde monde);

    default Optional<Decor> trouverDecor(Monde monde, int x, int y) {
        return monde.decors.stream().filter(decor -> decor.x == x && decor.y == y).findAny();
    }
    default Optional<Objet> trouverObjet(Monde monde, int x, int y) {
        return monde.objets.stream().filter(objet -> objet.x == x && objet.y == y).findAny();
    }
    default Optional<Salle> trouverSalle(Monde monde, int x, int y) {
        return monde.salles.stream().filter(salle ->
                salle.x <= x &&
                salle.x + salle.largeur >= x &&
                salle.y <= y &&
                salle.y + salle.hauteur >= y).findAny();
    }
    default Optional<Decor> trouverDecors(Monde monde, Salle salle, Decor.GRAPHISME graphisme) {
        return monde.decors.stream()
                .filter(decor -> decor.graphisme.equals(graphisme))
                .filter(decor ->
                salle.x <= decor.x &&
                        salle.x + salle.largeur >= decor.x &&
                        salle.y <= decor.y &&
                        salle.y + salle.hauteur >= decor.y).findAny();
    }


}
