package com.bansheesoftware.seulsurmars;

import com.bansheesoftware.seulsurmars.domain.Action;
import com.bansheesoftware.seulsurmars.service.Service;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("game")
public class Controller {

    private final Service service;

    public Controller(Service service) {
        this.service = service;
    }

    @PostMapping
    public List<Map<String, String>> action(@RequestBody Map<String, String> body) {
        String key = body.get("touche");
        if(key == null) {
            return new ArrayList<>();
        }
        Service.Touche touche = null;
        switch (key) {
            case "ArrowLeft":
                touche = Service.Touche.LEFT; break;
            case "ArrowRight":
                touche = Service.Touche.RIGHT; break;
            case "Space":
                touche = Service.Touche.SPACE; break;
            default:
                return new ArrayList<>();
        }

        List<Action> actions = service.action(touche);
        List<Map<String, String>> list = actions.stream().map(action -> {
            Map<String, String> map =  new HashMap<>();
            map.put("id", action.id);
            map.put("x", String.valueOf(action.x));
            map.put("y", String.valueOf(action.y));
            return map;
        }).collect(Collectors.toList());
        return list;
    }
}
