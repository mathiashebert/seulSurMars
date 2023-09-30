package com.bansheesoftware.seulsurmars.domain;

public class Action {

    public enum ActionType {
        DEPLACER, RETIRER,
        TIMER, GAME_OVER, DESSINER
    }

    public ActionType type;
    public int x;
    public int y;
    public double duree;
    public int inventaire;
    public String graphisme;


    private Action() {

    }

    public static Action deplacer(int x, int y) {
        Action action = new Action();
        action.type = ActionType.DEPLACER;
        action.x = x;
        action.y = y;
        return action;
    }

    public static Action timer(int duree) {
        Action action = new Action();
        action.type = ActionType.TIMER;
        action.duree = duree;
        return action;
    }

    public static Action gameOver() {
        Action action = new Action();
        action.type = ActionType.GAME_OVER;
        return action;
    }

    public static Action retirer() {
        Action action = new Action();
        action.type = ActionType.RETIRER;
        return action;
    }

    public static Action dessiner(Objet objet) {
        Action action = new Action();
        action.type = ActionType.DESSINER;
        action.x = objet.x;
        action.y = objet.y;
        action.graphisme = objet.graphisme.name();
        action.inventaire = -1;
        return action;
    }

    public static Action dessiner(Objet objet, int inventaire) {
        Action action = dessiner(objet);
        action.inventaire = inventaire;
        return action;
    }

    public static Action dessiner(Decors decors) {
        Action action = new Action();
        action.type = ActionType.DESSINER;
        action.x = decors.x;
        action.y = decors.y;;
        action.graphisme = decors.graphisme.name();
        action.inventaire = -1;
        return action;
    }

    public static Action dessiner(Salle salle) {
        Action action = new Action();
        action.type = ActionType.DESSINER;
        action.x = salle.x;
        action.y = salle.y;;
        action.graphisme = salle.graphisme.name();
        action.inventaire = -1;
        return action;
    }
}