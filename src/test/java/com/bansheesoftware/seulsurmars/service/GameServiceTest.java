package com.bansheesoftware.seulsurmars.service;

import com.bansheesoftware.seulsurmars.domain.*;
import com.bansheesoftware.seulsurmars.service.creermonde.CreerMondeService;
import com.bansheesoftware.seulsurmars.service.game.GameService;
import org.junit.jupiter.api.*;

@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class GameServiceTest {

    /**
     * OBJECTIF 1 : déplacement gauche et droite
     *
     * la touche droite déplace le hero d'une position vers la droite
     * la touche gauche déplace le héro d'une position vers la gauche
     * à condition de rester dans les limites du plateau
     * à condition que la position d'arrivée soit de type "SOL" et non "VIDE"
     */

    @Test
    @Order(1)
    public void gauche() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.LEFT, monde);
        expected.positionX = 0;
        this.verifierMonde(expected, monde);
    }

    @Test
    @Order(2)
    public void droite() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.RIGHT, monde);
        expected.positionX = 2;
        this.verifierMonde(expected, monde);
    }

    @Test
    @Order(3)
    public void gauche_limite() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.LEFT, monde);
        expected.positionX = 0;
        this.verifierMonde(expected, monde);

        gameService.action(GameService.Touche.LEFT, monde);
        this.verifierMonde(expected, monde);
    }

    @Test
    @Order(4)
    public void droite_limite() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.RIGHT, monde);
        expected.positionX = 2;
        this.verifierMonde(expected, monde);

        gameService.action(GameService.Touche.RIGHT, monde);
        this.verifierMonde(expected, monde);
    }

    @Test
    @Order(5)
    public void gauche_sol() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.position(0, 0, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.vide);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.LEFT, monde);
        this.verifierMonde(expected, monde);
    }

    @Test
    @Order(6)
    public void droite_sol() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.position(2, 0, Position.POSTION_TYPE.VIDE, Position.GRAPHISME.vide);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.RIGHT, monde);
        this.verifierMonde(expected, monde);
    }

    /**
     * OBJECTIF 2 : ascenseurs
     *
     * l'ascenseur est un decors de type "ascenseur" et de classe "Ascenseur"
     * comme les autres décors, il possède une position (x,y). Mais il a également une hauteurHaut et une HauteurBas
     * lors de son utilisation (avec la touche DECOR), s'il est en positionHaut, alors il passe en positionBas, avec le héro
     * inversement, s'il est en positionBas, il passe en positionHaut, avec le héro
     * s'il y a un objet sur la même position, il est egalement déplacé
     *
     * note : il est possible de se déplacer vers une position "vide" (non "sol"), s'il y a un ascenseur
     */

    @Test
    @Order(7)
    public void ascenseur_vers_le_bas() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde2();
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.LEFT, monde);
        expected.positionX = 0;
        this.verifierMonde(expected, monde);

        gameService.action(GameService.Touche.DECOR, monde);
        expected.positionY = 0;
        expected.decors.get(0).y = 0;
        this.verifierMonde(expected, monde);
    }

    @Test
    @Order(8)
    public void ascenseur_vers_le_haut() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde2();
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.RIGHT, monde);
        expected.positionX = 2;
        this.verifierMonde(expected, monde);

        gameService.action(GameService.Touche.DECOR, monde);
        expected.positionY = 2;
        expected.decors.get(1).y = 2;
        this.verifierMonde(expected, monde);
    }

    @Test
    @Order(9)
    public void ascenseur_vers_le_bas_puis_haut() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde2();
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.LEFT, monde);
        expected.positionX = 0;
        this.verifierMonde(expected, monde);

        gameService.action(GameService.Touche.DECOR, monde);
        expected.positionY = 0;
        expected.decors.get(0).y = 0;
        this.verifierMonde(expected, monde);

        gameService.action(GameService.Touche.DECOR, monde);
        expected.positionY = 1;
        expected.decors.get(0).y = 1;
        this.verifierMonde(expected, monde);
    }

    @Test
    @Order(10)
    public void ascenseur_vers_le_haut_puis_bas() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde2();
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.RIGHT, monde);
        expected.positionX = 2;
        this.verifierMonde(expected, monde);

        gameService.action(GameService.Touche.DECOR, monde);
        expected.positionY = 2;
        expected.decors.get(1).y = 2;
        this.verifierMonde(expected, monde);

        gameService.action(GameService.Touche.DECOR, monde);
        expected.positionY = 1;
        expected.decors.get(1).y = 1;
        this.verifierMonde(expected, monde);
    }

    /**
     * OBJECTIF 3 : ramasser/déposer un objet
     *
     * s'il ne porte pas d'objet, le hero peut rammaser un objet sur la position où il se trouve, en appuyant sur la touche "OBJET"
     * s'il a déjà un objet, il dépose cet objet sur la position où il se trouve
     * s'il a déjà un objet, et qu'il y a déjà un objet sur la position, la touche "entrer" n'a aucun effet
     */

    @Test
    @Order(11)
    public void ramasser() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.objets.add(new Objet("objet-1", 1, 0, Objet.GRAPHISME.sucre));
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.OBJET, monde);
        expected.inventaire = expected.objets.get(0).clone();
        expected.objets.clear();
        this.verifierMonde(expected, monde);
    }

    @Test
    @Order(12)
    public void deposer() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.inventaire = new Objet("objet-1", 1, 0, Objet.GRAPHISME.sucre);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.OBJET, monde);
        expected.inventaire = null;
        expected.objets.add(new Objet("objet-1", 1, 0, Objet.GRAPHISME.sucre));
        this.verifierMonde(expected, monde);
    }

    @Test
    @Order(13)
    public void deposerMaisOccupe() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.inventaire = new Objet("objet-1", 1, 0, Objet.GRAPHISME.sucre);
        monde.objets.add(new Objet("objet-2", 1, 0, Objet.GRAPHISME.hydrogene));
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.OBJET, monde);
        this.verifierMonde(expected, monde);
    }

    @Test
    @Order(13)
    public void ramasserMaisDelai() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.objets.add(new Objet("objet-1", 1, 0, Objet.GRAPHISME.sucre));
        monde.objets.get(0).delai = 1;
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.OBJET, monde);
        this.verifierMonde(expected, monde);
    }

    /**
     * OBJECTIF 4 : utiliser de l'hydrazine
     *
     * si le hero est sur la même position qu'un decor "hydrazine" (H2N4)
     * la touche "DECOR" créer un objet "hydrogene" sur cette position
     * (s'il n'y a pas déjà un objet sur cette position)
     *
     */

    @Test
    @Order(14)
    public void hydrazine() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.decors.add(new Decor("decors-1", 1, 0, Decor.GRAPHISME.hydrazine));
        monde.initIncrement(1);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        expected.objets.add(new Objet("objet-2", 1, 0, Objet.GRAPHISME.hydrogene));
        verifierMonde(expected, monde);
    }

    @Test
    @Order(15)
    public void hydrazineMaisOccupe() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.decors.add(new Decor("decors-1", 1, 0, Decor.GRAPHISME.hydrazine));
        monde.objets.add(new Objet("objet-2", 1, 0, Objet.GRAPHISME.tomate));
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        verifierMonde(expected, monde);
    }

    /**
     * OBJECTIF 5 : utiliser un recycleur d'oxygène
     *
     * si le hero est sur la même position qu'un decor "recycleurAir",
     * la touche "DECOR" créer un objet "oxygene" sur cette position
     * (s'il n'y a pas déjà un objet sur cette position)
     */

    @Test
    @Order(16)
    public void recycleurAir() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.decors.add(new Decor("decors-1", 1, 0, Decor.GRAPHISME.recycleurAir));
        monde.initIncrement(1);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        expected.objets.add(new Objet("objet-2", 1, 0, Objet.GRAPHISME.oxygene));
        verifierMonde(expected, monde);
    }

    @Test
    @Order(17)
    public void recycleurAirMaisOccupe() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.decors.add(new Decor("decors-1", 1, 0, Decor.GRAPHISME.recycleurAir));
        monde.objets.add(new Objet("objet-2", 1, 0, Objet.GRAPHISME.tomate));
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        verifierMonde(expected, monde);
    }

    /**
     * OBJECTIF 6 : faire pousser une tomate
     *
     * si le hero utilise un decor "potager", et qu'il a de l'eau
     * cela crée un objet "tomate" sur cette position, avec un delai de 10 secondes
     * (s'il n'y a pas déjà un objet sur cette position, sinon aucun effet)
     */

    @Test
    @Order(18)
    public void potagerSansEau() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.decors.add(new Decor("decors-1", 1, 0, Decor.GRAPHISME.potager));
        monde.initIncrement(1);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        verifierMonde(expected, monde);
    }


    @Test
    @Order(19)
    public void potagerAvecEau() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.decors.add(new Decor("decors-1", 1, 0, Decor.GRAPHISME.potager));
        monde.inventaire = new Objet("objet-2", 1, 0, Objet.GRAPHISME.bouteille);
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        expected.inventaire = null;
        expected.objets.add(new Objet("objet-3", 1, 0, Objet.GRAPHISME.tomate));
        expected.objets.get(0).delai = 10;
        verifierMonde(expected, monde);
    }

    @Test
    @Order(20)
    public void potagerAvecEauMaisOccupe() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.decors.add(new Decor("decors-1", 1, 0, Decor.GRAPHISME.potager));
        monde.inventaire = new Objet("objet-2", 1, 0, Objet.GRAPHISME.bouteille);
        monde.objets.add(new Objet("objet-3", 1, 0, Objet.GRAPHISME.hydrogene));
        monde.initIncrement(3);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        verifierMonde(expected, monde);
    }

    /**
     * OBJECTIF 7 : faire cuire un cupcake
     *
     * si le hero utilise un decor "four", et qu'il a du sucre,
     * cela crée un objet "cupcake" sur cette position, avec un delai de 2 secondes
     * (s'il n'y a pas déjà un objet sur cette position, sinon aucun effet)
     */

    @Test
    @Order(21)
    public void fourSansSucre() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.decors.add(new Decor("decors-1", 1, 0, Decor.GRAPHISME.four));
        monde.initIncrement(1);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        verifierMonde(expected, monde);
    }


    @Test
    @Order(22)
    public void fourAvecSucre() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.decors.add(new Decor("decors-1", 1, 0, Decor.GRAPHISME.four));
        monde.inventaire = new Objet("objet-2", 1, 0, Objet.GRAPHISME.sucre);
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        expected.inventaire = null;
        expected.objets.add(new Objet("objet-3", 1, 0, Objet.GRAPHISME.cupcake));
        expected.objets.get(0).delai = 2;
        verifierMonde(expected, monde);
    }

    @Test
    @Order(23)
    public void fourAvecSucreMaisOccupe() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.decors.add(new Decor("decors-1", 1, 0, Decor.GRAPHISME.four));
        monde.inventaire = new Objet("objet-2", 1, 0, Objet.GRAPHISME.sucre);
        monde.objets.add(new Objet("objet-3", 1, 0, Objet.GRAPHISME.hydrogene));
        monde.initIncrement(3);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        verifierMonde(expected, monde);
    }

    /**
     * OBJECTIF 8 : mélanger de l'hydrogène et de l'oxygène
     *
     * si le hero est sur la même position qu'un objet "oxygene", et qu'il dépose de l'hydrogène, cela crée un objet "inflammable" sur cette position
     * (et vice-versa)
     */

    @Test
    @Order(24)
    public void melangeHydrogeneOxygene() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.inventaire = new Objet("objet-1", 1, 0, Objet.GRAPHISME.oxygene);
        monde.objets.add(new Objet("objet-2", 1, 0, Objet.GRAPHISME.hydrogene));
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.OBJET, monde);
        expected.inventaire = null;
        expected.objets.clear();
        expected.objets.add(new Objet("objet-3", 1, 0, Objet.GRAPHISME.inflammable));
        verifierMonde(expected, monde);
    }

    @Test
    @Order(25)
    public void melangeOxygeneHydrogene() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.inventaire = new Objet("objet-1", 1, 0, Objet.GRAPHISME.hydrogene);
        monde.objets.add(new Objet("objet-2", 1, 0, Objet.GRAPHISME.oxygene));
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.OBJET, monde);
        expected.inventaire = null;
        expected.objets.clear();
        expected.objets.add(new Objet("objet-3", 1, 0, Objet.GRAPHISME.inflammable));
        verifierMonde(expected, monde);
    }

    /**
     * OBJECTIF 9 : mélanger du sucre et de l'oxygène
     *
     * si le hero est sur la même position qu'un objet "oxygene", et qu'il dépose du sucre, cela crée un objet "explosif" sur cette position
     * (et vice-versa)
     */

    @Test
    @Order(26)
    public void melangeSucreOxygene() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.inventaire = new Objet("objet-1", 1, 0, Objet.GRAPHISME.oxygene);
        monde.objets.add(new Objet("objet-2", 1, 0, Objet.GRAPHISME.sucre));
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.OBJET, monde);
        expected.inventaire = null;
        expected.objets.clear();
        expected.objets.add(new Objet("objet-3", 1, 0, Objet.GRAPHISME.explosif));
        verifierMonde(expected, monde);
    }

    @Test
    @Order(27)
    public void melangeOxygeneSucre() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde1();
        monde.inventaire = new Objet("objet-1", 1, 0, Objet.GRAPHISME.sucre);
        monde.objets.add(new Objet("objet-2", 1, 0, Objet.GRAPHISME.oxygene));
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.OBJET, monde);
        expected.inventaire = null;
        expected.objets.clear();
        expected.objets.add(new Objet("objet-3", 1, 0, Objet.GRAPHISME.explosif));
        verifierMonde(expected, monde);
    }

    /**
     * OBJECTIF 10 : débrancher/brancher une ampoule
     *
     * si le hero est sur la même position qu'un decor "ampouleAllumee", la touche "DECOR" permet de créer un objet "electrique"
     * et transforme le decor en "ampouleEteinte"
     *
     * Inversement, si le héro dépose un objet "electrique" en étant sur la même position qu'un decor "ampouleEteinte"
     * l'objet est utilisé, et transform le decro en "ampouleAllumee"
     *
     * on part du principe qu'une ampoule est toujours dans une salle
     */

    @Test
    @Order(28)
    public void debrancherAmpoule() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde3();
        monde.decors.add(new Decor("decor-1", 2, 2, Decor.GRAPHISME.ampouleAllumee));
        monde.initIncrement(1);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        expected.decors.get(0).graphisme = Decor.GRAPHISME.ampouleEteinte;
        expected.objets.add(new Objet("objet-2", 2, 2, Objet.GRAPHISME.electrique));
        expected.salles.get(0).graphisme = Salle.GRAPHISME.SOMBRE;
        verifierMonde(expected, monde);
    }

    @Test
    @Order(29)
    public void debrancherAmpouleMaisOccupe() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde3();
        monde.decors.add(new Decor("decor-1", 2, 2, Decor.GRAPHISME.ampouleAllumee));
        monde.objets.add(new Objet("objet-2", 2, 2, Objet.GRAPHISME.hydrogene));
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        verifierMonde(expected, monde);
    }

    @Test
    @Order(30)
    public void brancherAmpouleAvecFilElectrique() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde3();
        monde.decors.add(new Decor("decor-1", 2, 2, Decor.GRAPHISME.ampouleEteinte));
        monde.inventaire = new Objet("objet-2", 1, 0, Objet.GRAPHISME.electrique);
        monde.salles.get(0).graphisme = Salle.GRAPHISME.SOMBRE;
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        expected.decors.get(0).graphisme = Decor.GRAPHISME.ampouleAllumee;
        expected.inventaire = null;
        expected.salles.get(0).graphisme = Salle.GRAPHISME.NORMALE;
        verifierMonde(expected, monde);
    }

    @Test
    @Order(31)
    public void brancherAmpouleSansFilElectrique() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde3();
        monde.decors.add(new Decor("decor-1", 2, 2, Decor.GRAPHISME.ampouleEteinte));
        monde.salles.get(0).graphisme = Salle.GRAPHISME.SOMBRE;
        monde.initIncrement(1);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.DECOR, monde);
        verifierMonde(expected, monde);
    }

    /**
     * OBJECTIF 11 : combiner "inflamable" et "electrique"
     *
     * si le hero est sur la même position qu'un objet "inflamable", et qu'il dépose un objet "electrique"
     * cela crée une animation "feu" et crée un objet "bouteille" (avec un delai de 2 secondes)
     * (et PAS vice-versa)
     */

    @Test
    @Order(32)
    public void brulerInflamableAvecFilElectrique() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde3();
        monde.objets.add(new Objet("objet-1", 2, 2, Objet.GRAPHISME.inflammable));
        monde.inventaire = new Objet("objet-2", 2, 2, Objet.GRAPHISME.electrique);
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.OBJET, monde);
        expected.objets.clear();
        expected.inventaire = null;
        expected.animations.add(new Animation("animation-3", 2, 2, Animation.GRAPHISME.feu));
        expected.objets.add(new Objet("objet-4", 2, 2, Objet.GRAPHISME.bouteille));
        expected.animations.get(0).delai = 2;
        expected.objets.get(0).delai = 2;
        verifierMonde(expected, monde);
    }

    @Test
    @Order(33)
    public void brulerInflamableInverses() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde3();
        monde.objets.add(new Objet("objet-1", 2, 2, Objet.GRAPHISME.electrique));
        monde.inventaire = new Objet("objet-2", 2, 2, Objet.GRAPHISME.inflammable);
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.OBJET, monde);
        verifierMonde(expected, monde);
    }


    /**
     * OBJECTIF 12 : combiner "explosif" et "electrique"
     *
     * si le hero est sur la même position qu'un objet "explosif", et qu'il dépose un objet "electrique"
     * cela crée une animation "explosion" (avec un delai de 2 secondes)
     * (et vice-versa)
     */

    @Test
    @Order(34)
    public void brulerExplosifAvecFilElectrique() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde3();
        monde.objets.add(new Objet("objet-1", 2, 2, Objet.GRAPHISME.explosif));
        monde.inventaire = new Objet("objet-2", 2, 2, Objet.GRAPHISME.electrique);
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.OBJET, monde);
        expected.objets.clear();
        expected.inventaire = null;
        expected.animations.add(new Animation("animation-3", 2, 2, Animation.GRAPHISME.explosion));
        expected.animations.get(0).delai = 2;
        verifierMonde(expected, monde);
    }

    @Test
    @Order(35)
    public void brulerExplosifInverses() {
        GameService gameService = new GameService();
        Monde monde = new CreerMondeService().creerMonde3();
        monde.objets.add(new Objet("objet-1", 2, 2, Objet.GRAPHISME.electrique));
        monde.inventaire = new Objet("objet-2", 2, 2, Objet.GRAPHISME.explosif);
        monde.initIncrement(2);
        Monde expected = monde.clone();

        gameService.action(GameService.Touche.OBJET, monde);
        verifierMonde(expected, monde);
    }


    /////////////////

    private void verifierMonde(Monde expected, Monde actual) {
        Assertions.assertEquals(expected.getId(), actual.getId());
        Assertions.assertEquals(expected.largeur, actual.largeur);
        Assertions.assertEquals(expected.hauteur, actual.hauteur);
        Assertions.assertEquals(expected.positionX, actual.positionX);
        Assertions.assertEquals(expected.positionY, actual.positionY);

        Assertions.assertEquals(expected.positions.size(), actual.positions.size());
        for(int i=0; i<expected.positions.size(); i++) {
            Assertions.assertEquals(expected.positions.get(i).size(), actual.positions.get(i).size());
            for(int j=0; j<expected.positions.get(i).size(); j++) {
                Assertions.assertEquals(expected.positions.get(i).get(j).x, actual.positions.get(i).get(j).x);
                Assertions.assertEquals(expected.positions.get(i).get(j).y, actual.positions.get(i).get(j).y);
                Assertions.assertEquals(expected.positions.get(i).get(j).type, actual.positions.get(i).get(j).type);
                Assertions.assertEquals(expected.positions.get(i).get(j).graphisme, actual.positions.get(i).get(j).graphisme);
            }
        }

        Assertions.assertEquals(expected.decors.size(), actual.decors.size());
        for(int i=0; i<expected.decors.size(); i++) {
            Assertions.assertEquals(expected.decors.get(i).x, actual.decors.get(i).x);
            Assertions.assertEquals(expected.decors.get(i).y, actual.decors.get(i).y);
            Assertions.assertEquals(expected.decors.get(i).id, actual.decors.get(i).id);
            Assertions.assertEquals(expected.decors.get(i).graphisme, actual.decors.get(i).graphisme);
        }

        Assertions.assertEquals(expected.objets.size(), actual.objets.size());
        for(int i=0; i<expected.objets.size(); i++) {
            Assertions.assertEquals(expected.objets.get(i).x, actual.objets.get(i).x);
            Assertions.assertEquals(expected.objets.get(i).y, actual.objets.get(i).y);
            Assertions.assertEquals(expected.objets.get(i).id, actual.objets.get(i).id);
            Assertions.assertEquals(expected.objets.get(i).graphisme, actual.objets.get(i).graphisme);
            Assertions.assertEquals(expected.objets.get(i).delai, actual.objets.get(i).delai);
        }

        Assertions.assertEquals(expected.animations.size(), actual.animations.size());
        for(int i=0; i<expected.animations.size(); i++) {
            Assertions.assertEquals(expected.animations.get(i).x, actual.animations.get(i).x);
            Assertions.assertEquals(expected.animations.get(i).y, actual.animations.get(i).y);
            Assertions.assertEquals(expected.animations.get(i).id, actual.animations.get(i).id);
            Assertions.assertEquals(expected.animations.get(i).graphisme, actual.animations.get(i).graphisme);
            Assertions.assertEquals(expected.animations.get(i).delai, actual.animations.get(i).delai);
        }

        Assertions.assertEquals(expected.salles.size(), actual.salles.size());
        for(int i=0; i<expected.salles.size(); i++) {
            Assertions.assertEquals(expected.salles.get(i).x, actual.salles.get(i).x);
            Assertions.assertEquals(expected.salles.get(i).y, actual.salles.get(i).y);
            Assertions.assertEquals(expected.salles.get(i).hauteur, actual.salles.get(i).hauteur);
            Assertions.assertEquals(expected.salles.get(i).largeur, actual.salles.get(i).largeur);
            Assertions.assertEquals(expected.salles.get(i).graphisme, actual.salles.get(i).graphisme);
        }

        if(expected.inventaire == null) {
            Assertions.assertNull(actual.inventaire);
        } else {
            Assertions.assertNotNull(actual.inventaire);
            Assertions.assertEquals(expected.inventaire.x, actual.inventaire.x);
            Assertions.assertEquals(expected.inventaire.y, actual.inventaire.y);
            Assertions.assertEquals(expected.inventaire.id, actual.inventaire.id);
            Assertions.assertEquals(expected.inventaire.graphisme, actual.inventaire.graphisme);
        }

    }

}