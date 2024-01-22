package com.bansheesoftware.seulsurmars.service.game;

import com.bansheesoftware.seulsurmars.domain.*;

import java.util.*;

@org.springframework.stereotype.Service
public class GameService {
    List<Processor> processors = new ArrayList<>();

    public GameService() {

    }

    public enum Touche {
        LEFT, RIGHT, DECOR, OBJET,
    }

    public void action(Touche touche, Monde monde) {

        for(Processor processor : processors) {
            if(processor.process(touche, monde)) {
                break;
            }
        }
    }
}
