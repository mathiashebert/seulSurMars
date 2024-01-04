package com.bansheesoftware.seulsurmars;

import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.service.creermonde.CreerMondeService;
import com.bansheesoftware.seulsurmars.service.game.GameService;
import com.bansheesoftware.seulsurmars.service.timer.TimerService;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@RestController
@RequestMapping("game")
public class GameController {

    private final GameService gameService;
    private final TimerService timerService;
    private final CreerMondeService creerMondeService;

    Map<Integer, Monde> mondes = new ConcurrentHashMap<>();

    public GameController(GameService gameService, TimerService timerService, CreerMondeService creerMondeService) {
        this.gameService = gameService;
        this.timerService = timerService;
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

        gameService.action(touche, monde);
        timerService.action(monde);

        return (monde);
    }

    @PostMapping(value = "timer")
    public Monde timer(@RequestBody Map<String, String> body) {
        String timer = body.get("timer");
        int id = Integer.valueOf(body.get("id"));
        Monde monde = mondes.get(id);
        if (timer == null) {
            return monde;
        }

        timerService.timer(monde, timer);
        return monde;
    }

    @GetMapping
    public Monde init() {
        Monde monde =  creerMondeService.creerMonde();
        mondes.put(monde.getId(), monde);
        return monde;
    }
}
