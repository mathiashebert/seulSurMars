package com.bansheesoftware.seulsurmars;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("game")
public class Controller {

    @PostMapping
    public List<String> action() {
        List<String> list =  new ArrayList<>();
        list.add("toto");
        list.add("tata");
        return list;
    }
}
