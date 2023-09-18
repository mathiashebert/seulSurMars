package com.bansheesoftware.seulsurmars;

import com.bansheesoftware.seulsurmars.domain.Action;
import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.service.CreerMondeService;
import com.bansheesoftware.seulsurmars.service.GameService;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("game")
public class GameController {

    private final GameService gameService;
    private final CreerMondeService creerMondeService;

    public GameController(GameService gameService, CreerMondeService creerMondeService) {
        this.gameService = gameService;
        this.creerMondeService = creerMondeService;
    }

    @PostMapping(value = "touche")
    public Map<String, Action> action(@RequestBody Map<String, String> body) {
        String key = body.get("touche");
        if (key == null) {
            return new HashMap<>();
        }
        GameService.Touche touche = null;
        switch (key) {
            case "ArrowLeft":
                touche = GameService.Touche.LEFT;
                break;
            case "ArrowRight":
                touche = GameService.Touche.RIGHT;
                break;
            case "Space":
                touche = GameService.Touche.SPACE;
                break;
            case "Digit1":
                touche = GameService.Touche.DIGIT1;
                break;
            case "Digit2":
                touche = GameService.Touche.DIGIT2;
                break;
            case "Digit3":
                touche = GameService.Touche.DIGIT3;
                break;
            case "Digit4":
                touche = GameService.Touche.DIGIT4;
                break;
            case "Digit5":
                touche = GameService.Touche.DIGIT5;
                break;
            case "Digit6":
                touche = GameService.Touche.DIGIT6;
                break;
            case "Digit7":
                touche = GameService.Touche.DIGIT7;
                break;
            case "Digit8":
                touche = GameService.Touche.DIGIT8;
                break;
            case "Digit9":
                touche = GameService.Touche.DIGIT9;
                break;
            default:
                return new HashMap<>();
        }

        Map<String, Action> actions = gameService.action(touche);
        return (actions);
    }

    @PostMapping(value = "timer")
    public Map<String, Action> timer(@RequestBody Map<String, String> body) {
        String timer = body.get("timer");
        if (timer == null) {
            return new HashMap<>();
        }

        Map<String, Action> actions = gameService.timer(timer);
        return (actions);
    }

    @GetMapping
    public Monde init() {
        return creerMondeService.creerMonde();
    }
}
