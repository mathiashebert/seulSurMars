package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.*;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

class GameServiceTest {

    private GameService creerService1() {
        CreerMondeService creerMondeService = new CreerMondeService() {
            public Monde creerMonde() {
                Monde monde = creerMonde(3, 1, 0, 1, 0);
                return monde;
            }
        };
        return new GameService(creerMondeService);
    }

    private void verifierActionDeplacer(Map<String, Action> actions, String id, int x, int y) {
        Action action = actions.get(id);
        Assertions.assertEquals(Action.ActionType.DEPLACER, action.type);
        Assertions.assertEquals(   x, action.x);
        Assertions.assertEquals(   y, action.y);
    }

    private void verifierActionAjouter(Map<String, Action> actions, String id, int x, int y) {
        Action action = actions.get(id);
        Assertions.assertEquals(Action.ActionType.AJOUTER, action.type);
        Assertions.assertEquals(   x, action.x);
        Assertions.assertEquals(   y, action.y);
    }
    private void verifierActionRetirer(Map<String, Action> actions, String id) {
        Action action = actions.get(id);
        Assertions.assertEquals(Action.ActionType.RETIRER, action.type);
    }
    private void verifierActionTimer(Map<String, Action> actions, String id, int duree) {
        Action action = actions.get(id);
        Assertions.assertEquals(Action.ActionType.TIMER, action.type);
        Assertions.assertEquals(   duree, action.duree);
    }
    private void verifierActionGameOver(Map<String, Action> actions) {
        Action action = actions.get("hero");
        Assertions.assertEquals(Action.ActionType.GAME_OVER, action.type);
    }
    private void verifierActionInventaire(Map<String, Action> actions, String id, int inventaire) {
        Action action = actions.get(id);
        Assertions.assertEquals(Action.ActionType.INVENTAIRE, action.type);
        Assertions.assertEquals(   inventaire, action.inventaire);
    }

    @Test
    public void gauche() {
        Map<String, Action> actions = creerService1().action(GameService.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 0, 0);
    }

    @Test
    public void droite() {
        Map<String, Action> actions = creerService1().action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 0);
    }

    @Test
    public void gauche_limite() {
        GameService gameService = creerService1();
        Map<String, Action> actions = gameService.action(GameService.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 0, 0);

        actions = gameService.action(GameService.Touche.LEFT);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void droite_limite() {
        GameService gameService = creerService1();
        Map<String, Action> actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 0);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void gauche_sol() {
        GameService gameService = creerService1();
        gameService.monde.position(0, 0, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.vide);
        Map<String, Action> actions = gameService.action(GameService.Touche.LEFT);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void droite_sol() {
        GameService gameService = creerService1();
        gameService.monde.position(2, 0, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.vide);
        Map<String, Action> actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(0, actions.size());
    }

    private GameService creerService2() {
        CreerMondeService creerMondeService = new CreerMondeService() {
            public Monde creerMonde() {
                Monde monde = creerMonde(3, 3, 1, 1, 1);
                creerAscenseur(monde, "mon_ascenseur", 0,1,0,1);
                creerAscenseur(monde,"mon_ascenseur", 2,1,1,2);
                return monde;
            }
        };
        return new GameService(creerMondeService);
    }

    @Test
    public void ascenseur_vers_le_bas() {
        GameService gameService = creerService2();

        Map<String, Action> actions = gameService.action(GameService.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 0, 1);

        actions = gameService.action(GameService.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 0, 0);
        verifierActionDeplacer(actions, "mon_ascenseur", 0, 0);
    }

    @Test
    public void ascenseur_vers_le_haut() {
        GameService gameService = creerService2();

        Map<String, Action> actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 1);

        actions = gameService.action(GameService.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 2);
        verifierActionDeplacer(actions, "mon_ascenseur", 2, 2);
    }

    @Test
    public void ascenseur_vers_le_bas_puis_haut() {
        GameService gameService = creerService2();

        Map<String, Action> actions = gameService.action(GameService.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 0, 1);

        actions = gameService.action(GameService.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 0, 0);
        verifierActionDeplacer(actions, "mon_ascenseur", 0, 0);

        actions = gameService.action(GameService.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 0, 1);
        verifierActionDeplacer(actions, "mon_ascenseur", 0, 1);
    }

    @Test
    public void ascenseur_vers_le_haut_puis_bas() {
        GameService gameService = creerService2();

        Map<String, Action> actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 1);

        actions = gameService.action(GameService.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 2);
        verifierActionDeplacer(actions, "mon_ascenseur", 2, 2);

        actions = gameService.action(GameService.Touche.SPACE);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 1);
        verifierActionDeplacer(actions, "mon_ascenseur", 2, 1);
    }

    private GameService creerService3() {
        CreerMondeService creerMondeService = new CreerMondeService() {
            public Monde creerMonde() {
                Monde monde = creerMonde(4, 3, 1, 1, 1);
                creerSalle(monde,0,0,3,3, false, true);

                return monde;
            }
        };
        return new GameService(creerMondeService);
    }

    @Test
    public void sortir_entrer() {
        GameService gameService = creerService3();

        Map<String, Action> actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 1);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 3, 1);
        verifierActionTimer(actions, "oxygen", 30);

        actions = gameService.action(GameService.Touche.LEFT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 1);
        verifierActionTimer(actions, "oxygen", 0);

        actions = gameService.timer("oxygen");
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void sortir_mourir() {
        GameService gameService = creerService3();

        Map<String, Action> actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 1);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 3, 1);
        verifierActionTimer(actions, "oxygen", 30);

        actions = gameService.timer("oxygen");
        Assertions.assertEquals(1, actions.size());
        verifierActionGameOver(actions);
    }


    private GameService creerService4() {
        CreerMondeService creerMondeService = new CreerMondeService() {
            public Monde creerMonde() {
                Monde monde = creerMonde(5, 1, 0, 0, 0);
                monde.objets.add(new Objet("bouteille1", 2, 0, Objet.GRAPHISME.bouteille));
                monde.objets.add(new Objet("bouteille2", 3, 0, Objet.GRAPHISME.bouteille));
                return monde;
            }
        };
        return new GameService(creerMondeService);
    }

    @Test
    public void ramasserInventaireVide() {
        GameService gameService = creerService4();
        Map<String, Action> actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 1, 0);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 0);
        verifierActionInventaire(actions, "bouteille1", 0);
    }
    @Test
    public void ramasserPosition1() {
        GameService gameService = creerService4();
        gameService.monde.inventaire[0] = new Objet("objet1", 0, 0, Objet.GRAPHISME.bouteille);

        Map<String, Action> actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 1, 0);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 0);
        verifierActionInventaire(actions, "bouteille1", 1);
    }
    @Test
    public void ramasserPosition0() {
        GameService gameService = creerService4();
        gameService.monde.inventaire[1] = new Objet("objet1", 0, 0, Objet.GRAPHISME.bouteille);

        Map<String, Action> actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 1, 0);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 0);
        verifierActionInventaire(actions, "bouteille1", 0);
    }
    @Test
    public void ramasserInventairePlein() {
        GameService gameService = creerService4();
        gameService.monde.inventaire[0] = new Objet("objet1", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[1] = new Objet("objet2", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[2] = new Objet("objet3", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[3] = new Objet("objet4", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[4] = new Objet("objet5", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[5] = new Objet("objet6", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[6] = new Objet("objet7", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[7] = new Objet("objet8", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[8] = new Objet("objet9", 0, 0, Objet.GRAPHISME.bouteille);

        Map<String, Action> actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 1, 0);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 0);
    }

    @Test
    public void deposerCaseVide() {
        GameService gameService = creerService4();
        gameService.monde.inventaire[0] = new Objet("objet1", 0, 0, Objet.GRAPHISME.bouteille);

        Map<String, Action> actions = gameService.action(GameService.Touche.DIGIT1);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "objet1", 0, 0);
    }

    @Test
    public void deposerCaseOccupee() {
        GameService gameService = creerService4();
        gameService.monde.inventaire[0] = new Objet("objet1", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.objets.add(new Objet("bouteille3", 0, 0, Objet.GRAPHISME.bouteille));

        Map<String, Action> actions = gameService.action(GameService.Touche.DIGIT1);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void inventaire1() {
        GameService gameService = creerService4();
        Map<String, Action> actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 1, 0);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 0);
        verifierActionInventaire(actions, "bouteille1", 0);

        actions = gameService.action(GameService.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 1, 0);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 0);

        actions = gameService.action(GameService.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 1, 0);

        actions = gameService.action(GameService.Touche.DIGIT1);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "bouteille1", 1, 0);

        actions = gameService.action(GameService.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 0, 0);

        actions = gameService.action(GameService.Touche.DIGIT1);
        Assertions.assertEquals(0, actions.size());

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 1, 0);
        verifierActionInventaire(actions, "bouteille1", 0);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 0);

        actions = gameService.action(GameService.Touche.DIGIT1);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "bouteille1", 2, 0);

    }

    @Test
    public void inventaire2() {
        GameService gameService = creerService4();
        Map<String, Action> actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 1, 0);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 0);
        verifierActionInventaire(actions, "bouteille1", 0);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 3, 0);
        verifierActionInventaire(actions, "bouteille2", 1);

        actions = gameService.action(GameService.Touche.DIGIT1);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "bouteille1", 3, 0);

        actions = gameService.action(GameService.Touche.DIGIT2);
        Assertions.assertEquals(0, actions.size());

        actions = gameService.action(GameService.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 0);

        actions = gameService.action(GameService.Touche.DIGIT2);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "bouteille2", 2, 0);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 3, 0);
        verifierActionInventaire(actions, "bouteille1", 0);

        actions = gameService.action(GameService.Touche.LEFT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 2, 0);
        verifierActionInventaire(actions, "bouteille2", 1);
    }

    @Test
    public void potager() {
        GameService gameService = creerService1();
        gameService.monde.decors.add(new Decors("potager", 1, 0, Decors.GRAPHISME.potager));
        gameService.monde.inventaire[0] = new Objet("bouteille", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[1] = new Objet("bouteille-2", 0, 0, Objet.GRAPHISME.bouteille);
        Map<String, Action> actions = gameService.action(GameService.Touche.DIGIT1);
        Assertions.assertEquals(2, actions.size());
        verifierActionRetirer(actions, "bouteille");
        verifierActionTimer(actions, "potager", 10);

        actions = gameService.timer("potager");
        Assertions.assertEquals(2, actions.size());
        verifierActionAjouter(actions, "tomate1", 1, 0);
        verifierActionTimer(actions, "potager", 0);

        actions = gameService.action(GameService.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 0, 0);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 1, 0);
        verifierActionInventaire(actions, "tomate1", 0);

        actions = gameService.action(GameService.Touche.DIGIT2);
        Assertions.assertEquals(2, actions.size());
        verifierActionRetirer(actions, "bouteille-2");
        verifierActionTimer(actions, "potager", 10);

        actions = gameService.timer("potager");
        Assertions.assertEquals(2, actions.size());
        verifierActionAjouter(actions, "tomate2", 1, 0);
        verifierActionTimer(actions, "potager", 0);

        actions = gameService.action(GameService.Touche.LEFT);
        Assertions.assertEquals(1, actions.size());
        verifierActionDeplacer(actions, "hero", 0, 0);

        actions = gameService.action(GameService.Touche.RIGHT);
        Assertions.assertEquals(2, actions.size());
        verifierActionDeplacer(actions, "hero", 1, 0);
        verifierActionInventaire(actions, "tomate2", 1);
    }

    @Test
    public void potagerEnCours() {
        GameService gameService = creerService1();
        gameService.monde.decors.add(new Decors("potager", 1, 0, Decors.GRAPHISME.potager));
        gameService.monde.inventaire[0] = new Objet("bouteille", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.timers.put("potager", "tomate1");
        Map<String, Action> actions = gameService.action(GameService.Touche.DIGIT1);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void potagerOccupe() {
        GameService gameService = creerService1();
        gameService.monde.decors.add(new Decors("potager", 1, 0, Decors.GRAPHISME.potager));
        gameService.monde.inventaire[0] = new Objet("bouteille", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.objets.add(new Objet("tomate", 1, 0, Objet.GRAPHISME.tomate));
        Map<String, Action> actions = gameService.action(GameService.Touche.DIGIT1);
        Assertions.assertEquals(2, actions.size());
        verifierActionRetirer(actions, "bouteille");
        verifierActionTimer(actions, "potager", 10);

        actions = gameService.timer("potager");
        Assertions.assertEquals(1, actions.size());
        verifierActionTimer(actions, "potager", 0);
    }

    @Test
    public void hydrazine() {
        GameService gameService = creerService1();
        gameService.monde.decors.add(new Decors("hydrazine", 1, 0, Decors.GRAPHISME.hydrazine));
        Map<String, Action> actions = gameService.action(GameService.Touche.SPACE);
        Assertions.assertEquals(1, actions.size());
        verifierActionInventaire(actions, "hydrogene1", 0);
    }

    @Test
    public void hydrazineInventairePlein() {
        GameService gameService = creerService1();
        gameService.monde.decors.add(new Decors("hydrazine", 1, 0, Decors.GRAPHISME.hydrazine));
        gameService.monde.inventaire[0] = new Objet("objet1", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[1] = new Objet("objet2", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[2] = new Objet("objet3", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[3] = new Objet("objet4", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[4] = new Objet("objet5", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[5] = new Objet("objet6", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[6] = new Objet("objet7", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[7] = new Objet("objet8", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[8] = new Objet("objet9", 0, 0, Objet.GRAPHISME.bouteille);
        Map<String, Action> actions = gameService.action(GameService.Touche.SPACE);
        Assertions.assertEquals(0, actions.size());
    }

    @Test
    public void fontaine() {
        GameService gameService = creerService1();
        gameService.monde.decors.add(new Decors("fontaine", 1, 0, Decors.GRAPHISME.fontaine));
        Map<String, Action> actions = gameService.action(GameService.Touche.SPACE);
        Assertions.assertEquals(1, actions.size());
        verifierActionInventaire(actions, "bouteille1", 0);
    }

    @Test
    public void fontaineInventairePlein() {
        GameService gameService = creerService1();
        gameService.monde.decors.add(new Decors("fontaine", 1, 0, Decors.GRAPHISME.fontaine));
        gameService.monde.inventaire[0] = new Objet("objet1", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[1] = new Objet("objet2", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[2] = new Objet("objet3", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[3] = new Objet("objet4", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[4] = new Objet("objet5", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[5] = new Objet("objet6", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[6] = new Objet("objet7", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[7] = new Objet("objet8", 0, 0, Objet.GRAPHISME.bouteille);
        gameService.monde.inventaire[8] = new Objet("objet9", 0, 0, Objet.GRAPHISME.bouteille);
        Map<String, Action> actions = gameService.action(GameService.Touche.SPACE);
        Assertions.assertEquals(0, actions.size());
    }


}