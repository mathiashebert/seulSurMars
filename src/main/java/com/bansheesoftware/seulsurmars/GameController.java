package com.bansheesoftware.seulsurmars;

import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.service.CreerMondeService;
import com.bansheesoftware.seulsurmars.service.GameService;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("game")
public class GameController {

    private final GameService gameService;
    private final CreerMondeService creerMondeService;

    Map<Integer, Monde> mondes = new ConcurrentHashMap<>();

    public GameController(GameService gameService, CreerMondeService creerMondeService) {
        this.gameService = gameService;
        this.creerMondeService = creerMondeService;
    }

    @PostMapping(value = "touche")
    public Monde action(@RequestBody Map<String, String> body) {
        String key = body.get("touche");
        int id = Integer.valueOf(body.get("id"));
        Monde monde = mondes.get(id);
        if (key == null) {
            return monde;
        }
        GameService.Touche touche;
        switch (key) {
            case "ArrowLeft":
                touche = GameService.Touche.LEFT;
                break;
            case "ArrowRight":
                touche = GameService.Touche.RIGHT;
                break;
            case "Space":
                touche = GameService.Touche.DECOR;
                break;
            case "Enter":
                touche = GameService.Touche.OBJET;
                break;
            default:
                return monde;
        }

        // TODO : gérer les timers
        gameService.action(touche, monde);
        // TODO : gérer la fin de partie
        return (monde);
    }
/*
    @PostMapping(value = "timer")
    public Map<String, Action> timer(@RequestBody Map<String, String> body) {
        String timer = body.get("timer");
        if (timer == null) {
            return new HashMap<>();
        }

        Map<String, Action> actions = gameService.timer(timer);
        return (actions);
    }*/

    @GetMapping
    public Monde init() {
        Monde monde =  creerMondeService.creerMonde();
        mondes.put(monde.getId(), monde);
        return monde;
    }
}
