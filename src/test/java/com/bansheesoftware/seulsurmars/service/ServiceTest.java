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

    private Service creerService() {
        Service service = new Service();
        service.POSITION_X = 1;
        service.POSITION_Y = 0;

        service.monde = new Monde(3,2);
        service.monde.position(0,0, Position.POSTION_TYPE.SOL, Position.GRAPHISME.sol);
        service.monde.position(1,0, Position.POSTION_TYPE.SOL, Position.GRAPHISME.sol);
        service.monde.position(2,0, Position.POSTION_TYPE.SOL, Position.GRAPHISME.sol);

        return  service;
    }

    @Test
    public void left() {
        List<Action> actions = creerService().action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        Assertions.assertEquals(   "hero", actions.get(0).id);
        Assertions.assertEquals(   0, actions.get(0).x);
        Assertions.assertEquals(   0, actions.get(0).y);
    }

    @Test
    public void right() {
        List< Action> actions = creerService().action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        Assertions.assertEquals(   "hero", actions.get(0).id);
        Assertions.assertEquals(   2, actions.get(0).x);
        Assertions.assertEquals(   0, actions.get(0).y);
    }

    @Test
    public void left_boundary() {
        Service service = creerService();
        List< Action> actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        Assertions.assertEquals(   "hero", actions.get(0).id);
        Assertions.assertEquals(   0, actions.get(0).x);
        Assertions.assertEquals(   0, actions.get(0).y);

        actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void right_boudary() {
        Service service = creerService();
        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        Assertions.assertEquals(   "hero", actions.get(0).id);
        Assertions.assertEquals(   2, actions.get(0).x);
        Assertions.assertEquals(   0, actions.get(0).y);

        actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void left_sol() {
        Service service = creerService();
        service.monde.position(0, 0, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.vide);
        List< Action> actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void right_sol() {
        Service service = creerService();
        service.monde.position(2, 0, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.vide);
        List< Action> actions = service.action(Service.Touche.RIGHT);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void ascenseur_bas() {
        Service service = creerService();
        service.monde.position(0,0, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.vide);
        service.monde.ascenseur("mon_ascenseur", 0,0,0,1);

        List< Action> actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        Assertions.assertEquals(   "hero", actions.get(0).id);
        Assertions.assertEquals(   0, actions.get(0).x);
        Assertions.assertEquals(   0, actions.get(0).y);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        Assertions.assertEquals(   "hero", actions.get(0).id);
        Assertions.assertEquals(   0, actions.get(0).x);
        Assertions.assertEquals(   1, actions.get(0).y);

        Assertions.assertEquals(   "mon_ascenseur", actions.get(1).id);
        Assertions.assertEquals(   0, actions.get(1).x);
        Assertions.assertEquals(   1, actions.get(1).y);
    }

    @Test
    public void ascenseur_haut() {
        Service service = creerService();
        service.monde.position(0,0, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.vide);
        service.monde.position(1,1, Position.POSTION_TYPE.SOL, Position.GRAPHISME.sol);
        service.monde.ascenseur("mon_ascenseur", 0,1,0,1);
        service.POSITION_Y = 1;

        List< Action> actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        Assertions.assertEquals(   "hero", actions.get(0).id);
        Assertions.assertEquals(   0, actions.get(0).x);
        Assertions.assertEquals(   1, actions.get(0).y);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        Assertions.assertEquals(   "hero", actions.get(0).id);
        Assertions.assertEquals(   0, actions.get(0).x);
        Assertions.assertEquals(   0, actions.get(0).y);

        Assertions.assertEquals(   "mon_ascenseur", actions.get(1).id);
        Assertions.assertEquals(   0, actions.get(1).x);
        Assertions.assertEquals(   0, actions.get(1).y);
    }

    @Test
    public void ascenseur_haut_bas() {
        Service service = creerService();
        service.monde.position(0,0, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.vide);
        service.monde.position(1,1, Position.POSTION_TYPE.SOL, Position.GRAPHISME.sol);
        service.monde.ascenseur("mon_ascenseur", 0,1,0,1);
        service.POSITION_Y = 1;

        List< Action> actions = service.action(Service.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        Assertions.assertEquals(   "hero", actions.get(0).id);
        Assertions.assertEquals(   0, actions.get(0).x);
        Assertions.assertEquals(   1, actions.get(0).y);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        Assertions.assertEquals(   "hero", actions.get(0).id);
        Assertions.assertEquals(   0, actions.get(0).x);
        Assertions.assertEquals(   0, actions.get(0).y);

        Assertions.assertEquals(   "mon_ascenseur", actions.get(1).id);
        Assertions.assertEquals(   0, actions.get(1).x);
        Assertions.assertEquals(   0, actions.get(1).y);

        actions = service.action(Service.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        Assertions.assertEquals(   "hero", actions.get(0).id);
        Assertions.assertEquals(   0, actions.get(0).x);
        Assertions.assertEquals(   1, actions.get(0).y);

        Assertions.assertEquals(   "mon_ascenseur", actions.get(1).id);
        Assertions.assertEquals(   0, actions.get(1).x);
        Assertions.assertEquals(   1, actions.get(1).y);
    }

}