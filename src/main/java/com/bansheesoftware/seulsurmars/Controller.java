package com.bansheesoftware.seulsurmars;

import com.bansheesoftware.seulsurmars.domain.Action;
import com.bansheesoftware.seulsurmars.domain.Monde;
import com.bansheesoftware.seulsurmars.service.CreerMondeService;
import com.bansheesoftware.seulsurmars.service.Service;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("game")
public class Controller {

    private final Service service;
    private final CreerMondeService creerMondeService;

    public Controller(Service service, CreerMondeService creerMondeService) {
        this.service = service;
        this.creerMondeService = creerMondeService;
    }

    @PostMapping(value = "touche")
    public List<Action> action(@RequestBody Map<String, String> body) {
        String key = body.get("touche");
        if (key == null) {
            return new ArrayList<>();
        }
        Service.Touche touche = null;
        switch (key) {
            case "ArrowLeft":
                touche = Service.Touche.LEFT;
                break;
            case "ArrowRight":
                touche = Service.Touche.RIGHT;
                break;
            case "Space":
                touche = Service.Touche.SPACE;
                break;
            case "Digit1":
                touche = Service.Touche.DIGIT1;
                break;
            case "Digit2":
                touche = Service.Touche.DIGIT2;
                break;
            case "Digit3":
                touche = Service.Touche.DIGIT3;
                break;
            case "Digit4":
                touche = Service.Touche.DIGIT4;
                break;
            case "Digit5":
                touche = Service.Touche.DIGIT5;
                break;
            case "Digit6":
                touche = Service.Touche.DIGIT6;
                break;
            case "Digit7":
                touche = Service.Touche.DIGIT7;
                break;
            case "Digit8":
                touche = Service.Touche.DIGIT8;
                break;
            case "Digit9":
                touche = Service.Touche.DIGIT9;
                break;
            case "Digit0":
                touche = Service.Touche.DIGIT0;
                break;
            default:
                return new ArrayList<>();
        }

        List<Action> actions = service.action(touche);
        return (actions);
    }

    @PostMapping(value = "timer")
    public List<Action> timer(@RequestBody Map<String, String> body) {
        String timer = body.get("timer");
        if (timer == null) {
            return new ArrayList<>();
        }

        List<Action> actions = service.timer(timer);
        return (actions);
    }

    private List<Map<String, String>> actionsToMap(List<Action> actions) {
        List<Map<String, String>> list = actions.stream().map(action -> {
            Map<String, String> map = new HashMap<>();
            map.put("id", action.id);
            map.put("x", String.valueOf(action.x));
            map.put("y", String.valueOf(action.y));
            map.put("type", String.valueOf(action.type));
            map.put("duree", String.valueOf(action.duree));
            return map;
        }).collect(Collectors.toList());
        return list;
    }

    @GetMapping
    public Monde init() {
        return creerMondeService.creerMonde();
    }
}
