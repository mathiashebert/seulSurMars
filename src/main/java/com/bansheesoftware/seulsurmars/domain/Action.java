package com.bansheesoftware.seulsurmars.domain;

public class Action {

    public enum ActionType {
        GRAPHISME, TIMER, GAME_OVER
    }

    public ActionType type;
    public String id;
    public int x;
    public int y;
    public int duree;


    private Action() {

    }
    public static Action graphique(String id, int x, int y) {
        Action action = new Action();
        action.type = ActionType.GRAPHISME;
        action.id = id;
        action.x = x;
        action.y = y;
        return action;
    }
    public static Action timer(String id, int duree) {
        Action action = new Action();
        action.type = ActionType.TIMER;
        action.id = id;
        action.duree = duree;
        return action;
    }
    public static Action gameOver() {
        Action action = new Action();
        action.type = ActionType.GAME_OVER;
        action.id = ActionType.GAME_OVER.toString();
        return action;
    }
}