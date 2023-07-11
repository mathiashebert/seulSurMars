package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.Action;
import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.domain.Objet;
import com.bansheesoftware.seulsurmars.domain.Position;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class ServiceTest {

    private Service creerService1() {
        CreerMondeService creerMondeService = new CreerMondeService() {
            public Monde creerMonde() {
                Monde monde = creerMonde(3, 1, 0, 1, 0);
                return monde;
            }
        };
        return new Service(creerMondeService);
    }

    private void verifierActionDeplacer(Action action, String id, int x, int y) {
        Assertions.assertEquals(Action.ActionType.DEPLACER, action.type);
        Assertions.assertEquals(   id, action.id);
        Assertions.assertEquals(   x, action.x);
        Assertions.assertEquals(   y, action.y);
    }
    private void verifierActionTimer(Action action, String id, int duree) {
        Assertions.assertEquals(Action.ActionType.TIMER, action.type);
        Assertions.assertEquals(   id, action.id);
        Assertions.assertEquals(   duree, action.duree);
    }
    private void verifierActionGameOver(Action action) {
        Assertions.assertEquals(Action.ActionType.GAME_OVER, action.type);
    }
    private void verifierActionInventaire(Action action, String id, int inventaire) {
        Assertions.assertEquals(Action.ActionType.INVENTAIRE, action.type);
        Assertions.assertEquals(   id, action.id);
        Assertions.assertEquals(   inventaire, action.inventaire);
    }

    @Test
    public void gauche() {
        List<Action> actions = creerService1().action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 0, 0);
    }

    @Test
    public void droite() {
        List< Action> actions = creerService1().action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 0);
    }

    @Test
    public void gauche_limite() {
        Service service = creerService1();
        List< Action> actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 0, 0);

        actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void droite_limite() {
        Service service = creerService1();
        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 0);

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void gauche_sol() {
        Service service = creerService1();
        service.monde.position(0, 0, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.vide);
        List< Action> actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void droite_sol() {
        Service service = creerService1();
        service.monde.position(2, 0, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.vide);
        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(0, actions.size());
    }

    private Service creerService2() {
        CreerMondeService creerMondeService = new CreerMondeService() {
            public Monde creerMonde() {
                Monde monde = creerMonde(3, 3, 1, 1, 1);
                creerAscenseur(monde, "mon_ascenseur", 0,1,0,1);
                creerAscenseur(monde,"mon_ascenseur", 2,1,1,2);
                return monde;
            }
        };
        return new Service(creerMondeService);
    }

    @Test
    public void ascenseur_vers_le_bas() {
        Service service = creerService2();

        List< Action> actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 0, 1);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 0, 0);
        verifierActionDeplacer(actions.get(1), "mon_ascenseur", 0, 0);
    }

    @Test
    public void ascenseur_vers_le_haut() {
        Service service = creerService2();

        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 1);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 2);
        verifierActionDeplacer(actions.get(1), "mon_ascenseur", 2, 2);
    }

    @Test
    public void ascenseur_vers_le_bas_puis_haut() {
        Service service = creerService2();

        List< Action> actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 0, 1);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 0, 0);
        verifierActionDeplacer(actions.get(1), "mon_ascenseur", 0, 0);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 0, 1);
        verifierActionDeplacer(actions.get(1), "mon_ascenseur", 0, 1);
    }

    @Test
    public void ascenseur_vers_le_haut_puis_bas() {
        Service service = creerService2();

        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 1);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 2);
        verifierActionDeplacer(actions.get(1), "mon_ascenseur", 2, 2);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 1);
        verifierActionDeplacer(actions.get(1), "mon_ascenseur", 2, 1);
    }

    private Service creerService3() {
        CreerMondeService creerMondeService = new CreerMondeService() {
            public Monde creerMonde() {
                Monde monde = creerMonde(4, 3, 1, 1, 1);
                creerSalle(monde,0,0,3,3, false, true);

                return monde;
            }
        };
        return new Service(creerMondeService);
    }

    @Test
    public void sortir_entrer() {
        Service service = creerService3();

        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 1);

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 3, 1);
        verifierActionTimer(actions.get(1), "oxygen", 30);

        actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 1);
        verifierActionTimer(actions.get(1), "oxygen", 0);

        actions = service.timer("oxygen");
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void sortir_mourir() {
        Service service = creerService3();

        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 1);

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 3, 1);
        verifierActionTimer(actions.get(1), "oxygen", 30);

        actions = service.timer("oxygen");
        Assertions.assertEquals(1, actions.size());
        verifierActionGameOver(actions.get(0));
    }


    private Service creerService4() {
        CreerMondeService creerMondeService = new CreerMondeService() {
            public Monde creerMonde() {
                Monde monde = creerMonde(5, 1, 0, 0, 0);
                monde.objets.add(new Objet("bouteille1", 2, 0, Objet.GRAPHISME.bouteille));
                monde.objets.add(new Objet("bouteille2", 3, 0, Objet.GRAPHISME.bouteille));
                return monde;
            }
        };
        return new Service(creerMondeService);
    }

    @Test
    public void inventaire1() {
        Service service = creerService4();
        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 1, 0);

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 0);
        verifierActionInventaire(actions.get(1), "bouteille1", 0);

        actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 1, 0);

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 0);

        actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 1, 0);

        actions = service.action(Service.Touche.DIGIT1);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "bouteille1", 1, 0);

        actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 0, 0);

        actions = service.action(Service.Touche.DIGIT1);
        Assertions.assertEquals(0, actions.size());

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 1, 0);
        verifierActionInventaire(actions.get(1), "bouteille1", 0);

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 0);

        actions = service.action(Service.Touche.DIGIT1);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "bouteille1", 2, 0);

    }

    @Test
    public void inventaire2() {
        Service service = creerService4();
        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 1, 0);

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 0);
        verifierActionInventaire(actions.get(1), "bouteille1", 0);

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 3, 0);
        verifierActionInventaire(actions.get(1), "bouteille2", 1);

        actions = service.action(Service.Touche.DIGIT1);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "bouteille1", 3, 0);

        actions = service.action(Service.Touche.DIGIT2);
        Assertions.assertEquals(0, actions.size());

        actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 0);

        actions = service.action(Service.Touche.DIGIT2);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions.get(0), "bouteille2", 2, 0);

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 3, 0);
        verifierActionInventaire(actions.get(1), "bouteille1", 0);

        actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions.get(0), "hero", 2, 0);
        verifierActionInventaire(actions.get(1), "bouteille2", 1);
    }


}