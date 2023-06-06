package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.Action;
import com.bansheesoftware.seulsurmars.domain.Monde;
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

    private void verifierActionGraphique(Action action, String id, int x, int y) {
        Assertions.assertEquals(Action.ActionType.GRAPHISME, action.type);
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

    @Test
    public void left() {
        List<Action> actions = creerService1().action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 0, 0);
    }

    @Test
    public void right() {
        List< Action> actions = creerService1().action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 2, 0);
    }

    @Test
    public void left_boundary() {
        Service service = creerService1();
        List< Action> actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 0, 0);

        actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void right_boudary() {
        Service service = creerService1();
        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 2, 0);

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void left_sol() {
        Service service = creerService1();
        service.monde.position(0, 0, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.vide);
        List< Action> actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void right_sol() {
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
        verifierActionGraphique(actions.get(0), "hero", 0, 1);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 0, 0);
        verifierActionGraphique(actions.get(1), "mon_ascenseur", 0, 0);
    }

    @Test
    public void ascenseur_vers_le_haut() {
        Service service = creerService2();

        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        Assertions.assertEquals(Action.ActionType.GRAPHISME, actions.get(0).type);
        verifierActionGraphique(actions.get(0), "hero", 2, 1);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 2, 2);
        verifierActionGraphique(actions.get(1), "mon_ascenseur", 2, 2);
    }

    @Test
    public void ascenseur_vers_le_bas_puis_haut() {
        Service service = creerService2();

        List< Action> actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 0, 1);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 0, 0);
        verifierActionGraphique(actions.get(1), "mon_ascenseur", 0, 0);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 0, 1);
        verifierActionGraphique(actions.get(1), "mon_ascenseur", 0, 1);
    }

    @Test
    public void ascenseur_vers_le_haut_puis_bas() {
        Service service = creerService2();

        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 2, 1);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 2, 2);
        verifierActionGraphique(actions.get(1), "mon_ascenseur", 2, 2);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 2, 1);
        verifierActionGraphique(actions.get(1), "mon_ascenseur", 2, 1);
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
        verifierActionGraphique(actions.get(0), "hero", 2, 1);

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 3, 1);
        verifierActionTimer(actions.get(1), "timer1", 60);

        actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(2, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 2, 1);
        verifierActionTimer(actions.get(1), "timer1", 0);

        actions = service.timer("timer1");
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void sortir_mourir() {
        Service service = creerService3();

        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 2, 1);

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionGraphique(actions.get(0), "hero", 3, 1);
        verifierActionTimer(actions.get(1), "timer1", 60);

        actions = service.timer("timer1");
        Assertions.assertEquals(1, actions.size());
        verifierActionGameOver(actions.get(0));
    }


}