package com.bansheesoftware.seulsurmars.domain.decor;

import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Salle;

import java.util.Optional;

public class Tourelle extends Decor {

    public Tourelle(String id, int x, int y) {
        super(id, x, y, GRAPHISME.tourelleFermee);
    }

    public void animer(Monde monde) {

        Optional<Salle> memeSalle = monde.salles.stream()
                .filter(salle -> salle.interieur(x, y)) // salle qui contient la tourelle
                .filter(salle -> salle.interieur(monde.positionX, monde.positionY)) // salle qui contient le hero
                .findAny();

        // la tourelle est en mode "alerte" si elle est dans la même salle que le hero, et que cette salle est en mode alarme
        boolean alert = memeSalle.isPresent()
                && memeSalle.get().graphisme.equals(Salle.GRAPHISME.ALARME);

        animer(alert);

        if(graphisme.equals(GRAPHISME.tourelleOuverte)) {
            monde.status = Monde.Status.gameOver;
        }
    }


    private void animer(boolean alert) {
        switch (graphisme) {
            case tourelleFermee:
                if(alert) {
                    graphisme = GRAPHISME.tourelleOuverture;
                    animation = 1;
                }
                break;
            case tourelleOuverture:
                graphisme = GRAPHISME.tourelleVisee;
                animation = 1;
                break;
            case tourelleVisee:
                if(alert) {
                    graphisme = GRAPHISME.tourelleOuverte;
                    animation = 0;
                } else {
                    graphisme = GRAPHISME.tourelleFermeture;
                    animation = 1;
                }
                break;
            case tourelleFermeture:
                graphisme = GRAPHISME.tourelleMiseEnVeille;
                animation = 1;
                break;
            case tourelleMiseEnVeille:
                if(alert) {
                    graphisme = GRAPHISME.tourelleOuverture;
                    animation = 1;
                } else {
                    graphisme = GRAPHISME.tourelleFermee;
                    animation = 0;
                }
                break;
        }
    }

    @Override
    public Tourelle duplique() {
        return new Tourelle(id, x, y);
    }
}