package com.bansheesoftware.seulsurmars.domain;

public class Action {

    public enum ActionType {
        AJOUTER, DEPLACER, RETIRER,
        TIMER, GAME_OVER, INVENTAIRE
    }

    public ActionType type;
    public int x;
    public int y;
    public int duree;
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
    public static Action inventaire(int inventaire) {
        Action action = new Action();
        action.type = ActionType.INVENTAIRE;
        action.inventaire = inventaire;
        return action;
    }
    public static Action gameOver() {
        Action action = new Action();
        action.type = ActionType.GAME_OVER;
        return action;
    }
    public static Action ajouter(int x, int y, String graphisme) {
        Action action = new Action();
        action.type = ActionType.AJOUTER;
        action.x = x;
        action.y = y;
        action.graphisme = graphisme;
        return action;
    }
    public static Action retirer() {
        Action action = new Action();
        action.type = ActionType.RETIRER;
        return action;
    }
}