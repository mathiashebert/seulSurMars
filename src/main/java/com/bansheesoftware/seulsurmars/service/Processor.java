package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.*;

import java.util.Optional;

public interface Processor {

    boolean process(GameService.Touche touche, Monde monde);

    default Optional<Decors> trouverDecors(Monde monde, int x, int y) {
        return monde.decors.stream().filter(decors -> decors.x == x && decors.y == y).findAny();
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


}
