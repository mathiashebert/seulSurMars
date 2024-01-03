package com.bansheesoftware.seulsurmars.service.game;

import com.bansheesoftware.seulsurmars.domain.*;

import java.util.*;

@org.springframework.stereotype.Service
public class GameService {
    List<Processor> processors = new ArrayList<>();

    public GameService() {
        processors.add(new Process1());
        processors.add(new Process2());
        processors.add(new Process3());
        processors.add(new Process4());
        processors.add(new Process5());
        processors.add(new Process6());
        processors.add(new Process7());
        processors.add(new Process8());
        processors.add(new Process9());
        processors.add(new Process10());
        processors.add(new Process11());
        processors.add(new Process12());
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
