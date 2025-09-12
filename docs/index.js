// Jeu : Une Maison sur la Lune
// Fichier principal JavaScript

const suits = ['hearts', 'clubs', 'diamonds', 'spades'];

let deck = [];
let drawPiles = [[], [], [], []];
let astronauts = []; // Liste des astronautes avec leurs positions et ressources

let dragAndDropAction = {
    astronaut: null,
    action: null,
    possibleTargets: []
}; // { astronaut, action, possible-targets }

let alienAdventure = {
    alienPosition:null,      // { row, col }
    alienAdventureStep: 0,    // 0 = pas commencé, 1 = phase Signal Alien active, 2 = invasion
    alienCount: 0,    // Nombre total d’aliens sur le plateau
}
let vegetationAdventure = {
    mutationPosition:null,      // { row, col }
    vegetationAdventureStep: 0,
}
let electricAdventure = {
    firePositions: [],
    smokePosition: null,
    electricStep: 0,
}
let sickAdventure = {
    sickStep: 0,
    mortuary: null,
    pandemicLocations: null,
}

let grid = [] // grille qui représente toutes les cases (6x6)

const TYPE = {
    EMPTY: 'empty',
    CONSTRUCTION: 'construction',
    BUILT: 'built',
    JUNGLE: 'jungle',
    BUNKER: 'bunker',
    EXPLODED: 'exploded'
};

const callingActions = ['hearts', 'clubs', 'diamonds', 'spades', 'astronaut', 'supply'];

const antennaRange = 3;

const problemLevel = {
    hearts: 0,
    clubs: 0,
    diamonds: 0,
    spades: 0

}

function createDeck() {
    const pileDefinitions = [
        ['A'],
        ['J'],
        ['Q'],
        ['K']
    ];

    for (let i = 0; i < 4; i++) {
        for (let s of suits) {
            drawPiles[i].push({value: pileDefinitions[i], suit: s});

        }
        shuffle(drawPiles[i]);
    }
    deck = [];
    for (let i = 0; i < 4; i++) {
        deck.push(...drawPiles[i]);
    }
}

function initGrid() {
    for(let row=0; row<boardSize; row++) {
        for(let col=0; col<boardSize; col++) {
            const key = `${row}-${col}`;
            grid[key] = {
                row: row,
                col: col,
                suit: null,
                food: 0,
                energy: 0,
                type: TYPE.EMPTY,
                nbAliens: 0,

                signal: false,
                infectious: false,
                mutation: false,

                dom: null
            }
        }
    }
}

function getGridElement(row, col) {
    const key = `${row}-${col}`;
    return grid[key];
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initializeGame() {
    initGrid();
    createDeck();

    drawInitialLayout();
    placeInitialAstronaut();
    setupDragAndDrop();

    //////////////
    // test purpose only
    ////////////

    /////////

    // première phase de resource (début du tour 1)
    runResourcePhase();




    renderEverything();
}

function renderEverything() {
    for(let key in grid) {
        redrawGridCell(grid[key]);
    }

    document.querySelector('.construction-deck').classList.remove('calling');
    for(let suit of suits) {
        document.querySelector('.adventure-pannel-item.'+suit).innerHTML = problemLevel[suit];

    }

}

function revealCardFromDeck() {
    if(deck.length === 0) {
        // todo  : victoire
        alert('fin de la partie : le deck est terminé. bravo !!!!')
        return;
    }
    const card = deck.shift();

    logMessage(`${card.value} ${getSuitSymbol(card.suit)}`)

    problemLevel[card.suit] ++;
    return card;
}

function plant_adventure() {

    const mutations = Object.values(grid).filter(value => value.mutation);
    for(let position of mutations) {
        const targets = plant_pathfinder(position);
        const astronautTargets = targets
            .map(value => value[value.length-1])
            .map(value => getAstronaut(value))
            .filter(value => value !== undefined);

        if(astronautTargets.length > 0) {
            const targetIndex = Math.floor(Math.random() * astronautTargets.length);
            const astro = astronautTargets[targetIndex];
            oneAstronautDie(astro);
            logMessage("un astronaut meurt étouffé par les plantes");
        }
    }

}
function plant_pathfinder(position, targets = {}, path = []) {
    const x = position.row;
    const y = position.col;
    const newPath = [...path, position];
    targets[getKey(x,y)] = newPath;

    // recupérer les positions adjacentes, avec de la nourriture, et pas encore explorées par le pathfinder
    const adj = getAdjacentPositions(position).filter(value => value.food > 0 && !targets[getKey(value.row, value.col)]);
    for(let location of adj) {
        plant_pathfinder(location, targets, newPath)
    }

    return Object.values(targets);

}
function plant_incident(position) {
    const level = problemLevel['clubs'];
    if(level > 0) {
        position.mutation = true;

        // on met un minimum de nourriture sur la position
        if(position.food < level) {
            position.food = level;
        }
    }
}
function plant_setFoodToRandomAdjacentPosition(position) {
    const locationsAccessibleViaPlantPath = plant_pathfinder(position).map(value => value[value.length-1])
    const targetMap = {}
    for(let locationAccessible of locationsAccessibleViaPlantPath) {
        getAdjacentPositions(locationAccessible).filter(value => value.food === 0).forEach(value => targetMap[getKey(value.row, value.col)] = value);
    }
    const targets = Object.values(targetMap);

    if(targets.length === 0) return; // si aucune case sans nourriture n'est accessible, alors on s'arrête là
    const targetsWithAstronaut = targets.filter(value => !isFree(value));
    let target;
    // on prend en priorité une case avec un astronaute
    if(targetsWithAstronaut.length > 0) {
        const index = Math.floor(Math.random()*targetsWithAstronaut.length);
        target = targetsWithAstronaut[index];
    } else {
        const index = Math.floor(Math.random()*targets.length);
        target = targets[index];
    }
    if(target) target.food ++;
}

function alien_incident(position) {
    const level = problemLevel['spades'];
    if(level > 0) {
        alien_oneAttack(level, position)
    }
}
function alien_adventure() {
    //const newAliens = Object.values(grid).filter(value => value.signal).length;
    //alienLevel += newAliens;

    alien_allAttack();
}
function alien_oneAttack(groupSize, position) {
    position.nbAliens += groupSize;
    dropCapsule(position.dom, 'alien');

    const target = getAstronaut(position);
    if (target) {
//        const position = getGridElement(target.row, target.col);

        // Combat
        let totalRes = target.food + target.energy;
        if (totalRes <= groupSize) {
            logMessage(`Un astronaute a été submergé par ${groupSize} aliens !`);
            oneAstronautDie(target);
        } else {
            let toRemove = groupSize;
            if (target.food >= toRemove) {
                target.food -= toRemove;
            } else {
                toRemove -= target.food;
                target.food = 0;
                target.energy = Math.max(0, target.energy - toRemove);
            }
            logMessage(`Un astronaute perd ${groupSize} ressources. suite à l'attaque alien`);
        }
    }
}
function alien_allAttack() {
    if(problemLevel["spades"] === 0) return;

    const alienGroups = [];
    Object.values(grid).forEach(value => {
        if(value.nbAliens > 0) {
            alienGroups.push(value.nbAliens);
            value.nbAliens = 0;
        }
    });

    for(let groupSize of alienGroups) {
        const astro = findOneAstronautAtRandom();
        if(astro) {
            const position = getGridElement(astro.row, astro.col);
            alien_oneAttack(groupSize, position);

        }
    }




}
function alien_removeSignal(position, astronaut) {
    if(astronaut.energy <= 0) {
        logMessage("pas assez d'energie");
        return;
    }
    astronaut.energy --;
    position.signal = false;

    renderEverything();
}
function alien_removeAlien(position, astronaut) {
    if(astronaut.energy <= 0) {
        logMessage("pas assez d'energie");
        return;
    }
    astronaut.energy --;
    position.nbAliens --;

    renderEverything();
}

function fire_incident(position) {
    const level = problemLevel["diamonds"];
    if(level === 0) return;
    if(position.fire || position.type === TYPE.EXPLODED) return;
    position.fire = true;

    if(level === 1) return;
    for(let i=1; i<level; i++) {
        const adj = getAdjacentPositions(position).filter(value => !value.fire && value.type !== TYPE.EXPLODED);
        if(adj.length === 0) return; // plus aucune position adjacente où mettre le feu
        const index = Math.floor(Math.random()*adj.length);
        const target = adj[index];
        target.fire = true;
    }
}
function fire_adventure() {
    fire_propagation();
}

function fire_adventure1() {
    const location= getOneActiveLocationAtRandom('diamonds');

    if (location == null) {
        logMessage("Aucune panneau solaire pour placer le court circuit.");
        return;
    }

    // Choisir un panneau solaire au hasard
    electricAdventure.shortcutPosition = location;
    fire_set(location);

    electricAdventure.electricStep = 1;

    // Ajouter une icône de feu sur la cellule
    logMessage(`un court circuit risque de provouer d'importants dégats sur le panneau solaire : ${location.row},${location.col}.`);
}
function fire_adventure2() {
    electricAdventure.electricStep = 2;
    fire_propagation();
}
function fire_adventure3() {
    const fireBeforeExplosion = Object.values(grid).filter(value => value.fire);
    if(electricAdventure.smokePosition) {
        fireBeforeExplosion.push(electricAdventure.smokePosition);
    }

    fire_propagation();

    for(let position of fire_propagation) {
        position.type = TYPE.EXPLODED;
        position.suit = null;
    }

}
function fire_set(newFire) {
    newFire.fire = true;
    newFire.food = 0;
    newFire.energy = 0;

}
function fire_propagation() {

    for (let firePosition of Object.values(grid).filter(value => value.fire)) {
        // 1/ on détruit les astronautes et les batiments où il y avait du feu
        fire_clean(firePosition);
        // 2 / on met le feu aux positions adjacentes
        getAdjacentPositions(firePosition)
            .filter(value => value.type !== TYPE.EXPLODED && !value.fire)
            .forEach(value => value.fire = true);
    }
}
function fire_extend(row, col, newFire) {
    const position = getGridElement(row, col);
    if(!position) return;
    if(position.fire) return;
    newFire.push(position);
}
function fire_clean(position) {
    // fonction qui gère un incendie, voir une explosion

    position.food = 0;
    position.energy = 0;
    if(position.type === TYPE.BUILT) {
        position.type = TYPE.CONSTRUCTION;
    } else {
        position.type = TYPE.EXPLODED;
        position.suit = null;
        position.fire = false;
    }
    const astro = astronauts.find(e => e.row === position.row && e.col === position.col);
    if (astro) {
        logMessage("un astronaute meurt dans l'explosion");
        oneAstronautDie(astro);
    }
}
function fire_extinguish(position) {
    const astronaut = getAstronaut(position);
    if(astronaut) {
        if(astronaut.energy <= 0) {
            logMessage("pas d'energie.")
        } else {
            astronaut.energy --; // on enlève un point d'energie à l'astronaute
            position.fire = false;
            renderEverything();
        }
    } else {
        logMessage("pas d'astraunaute pour eteindre le feu");
    }
}

function plantAdventure1() {
    const location= getOneActiveLocationAtRandom('clubs');

    if (location == null) {
        logMessage("Aucune serre pour placer la mutation.");
        return;
    }

    vegetationAdventure.mutationPosition = location;
    if(location.food < 3) location.food = 3;

    vegetationAdventure.mutationPosition = 1;

    // Ajouter une icône de feu sur la cellule
    logMessage(`Une mutation génétique s'est développée sur les plantes de la serre : ${location.row},${location.col}.`);
}
function plantAdventure2() {
    vegetationAdventure.mutationPosition = 2;

    // Ajouter une icône de feu sur la cellule
    logMessage(`Les plantes dans les serres se developpent de plus en plus vite, risquant parfois d'atouffer les astronautes`);
}
function plantAdventure3() {
    for(let location of Object.values(grid).filter(value => value.food > 0)) {
        const plantValue = getAdjacentPositions().filter(value => value.food > 0).length;
        // si il y a une plante, et qu'on est adjacent à au moins 2 autres plantes, alors ça se transforme en jungle
        if(plantValue >= 2) {
            location.type = TYPE.JUNGLE;

            // s'il y avait un astronaut ici, il meurt
            const astro = getAstronaut(location);
            if(astro) {
                oneAstronautDie(astro);
            }
        }
    }
    vegetationAdventure.mutationPosition = 3;

    // Ajouter une icône de feu sur la cellule
    logMessage(`Les plantes s'enracinnent`);
}

function sickAdventure1() {
    const location= getOneActiveLocationAtRandom('hearts');
    location.infectious = true;
    sickAdventure.sickStep = 1;
    logMessage(`Une étrange épidémie semble se developper dans un module habitable : ${location.row},${location.col}.`);
}
function sickAdventure2() {
    const location= getOneActiveLocationAtRandom('hearts');
    location.infectious = true;
    sickAdventure.sickStep = 2;
    logMessage(`Une étrange épidémie semble se developper dans un module habitable : ${location.row},${location.col}.`);
}

function sick_incident(position) {
    position.infectious = true;
    const astro = getAstronaut(position);
    if(astro) {
        astro.sick = true;
    }
}
function sick_contaminate() {
    const newSickAstornauts = [];
    // propager la contamination
    for(let i in astronauts) {
        const astro = astronauts[i];
        if(!astro.sick && sick_isCloseToContamination(astro.row, astro.col)) {
            newSickAstornauts.push(astro);
        }
    }
    for(let i in newSickAstornauts) {
        newSickAstornauts[i].sick = true;
    }
}
function sick_isCloseToContamination(row, col) {
    return sick_isContagious(row, col)
        || sick_isContagious(row-1, col)
        || sick_isContagious(row+1, col)
        || sick_isContagious(row, col-1)
        || sick_isContagious(row, col+1);
}
function sick_isContagious(row, col) {
    const position = getGridElement(row, col);
    if(position && position.infectious) {
        return true;
    }
    const astro = getAstronaut(position);
    if(astro && astro.sick) {
        return true;
    }
    return false;

}
function sick_cureValue(row, col) {
    const position = getGridElement(row, col);
    if(position && position.type === TYPE.BUILT && position.suit === 'hearts') return 1;
    return 0;
}

function getAstronaut(position) {
    if(!position) return null;
    return astronauts.find(value => value.row === position.row && value.col === position.col);
}

function handleCallingStart(suit) {

    const astro = dragAndDropAction.astronaut;
    if(!astro) return;

    dragAndDropAction.action = suit;

    if(suit === 'astronaut') {
        const targets = Object.values(grid).filter(position => position.suit === 'hearts' && isFree(position) && isActive(position)
            && distance(astro.row, astro.col, position) <= antennaRange)
        dragAndDropAction.possibleTargets = targets;
    }
    else if(suit === 'supply') {
        const targets = Object.values(grid).filter(position => position.suit !== 'spades' && distance(astro.row, astro.col, position) <= antennaRange && position.type !== TYPE.EMPTY);
        dragAndDropAction.possibleTargets = targets;
    }

    else {
        const targets = Object.values(grid).filter(position => distance(astro.row, astro.col, position) <= antennaRange && position.type !== TYPE.BUILT);
        dragAndDropAction.possibleTargets = targets;
    }

    document.querySelectorAll(`.cell`).forEach(c => {
        c.classList.remove('possible-target')
    });

    logMessage("début d'appel : "+suit);
    for(let position of dragAndDropAction.possibleTargets) {
        position.dom.classList.add('possible-target');
    }

}

function redrawGridCell(position) {
    const cell = position.dom;
    const row = position.row;
    const col = position.col;

    cell.className = 'cell';
    cell.innerHTML = '';

    if(isCloseToAntena(row, col)) {
        cell.classList.add('communication');
    }

    // rendu de l'astronaute
    const astronaut = getAstronaut(position);
    if (astronaut) {
        drawAstronautInCell(astronaut, cell);
    }

    cell.classList.add(position.type);
    switch (position.type) {
        case TYPE.EMPTY: {
            // case vide
            break;
        }
        case TYPE.CONSTRUCTION:
        case TYPE.BUNKER:
        {
            // afficher l'icone de construction
            cell.classList.add('construction');
            const icon = createIcon(cell, 'action-token build-icon', '🔧', 'Construire ici');
            if(astronaut) {
                icon.addEventListener('click', () => {
                    if(astronaut.energy <= 0) {
                        logMessage("Pas d'energie");
                        return;
                    }
                    astronaut.energy--;
                    position.type = TYPE.BUILT;
                    renderEverything();
                });
            }

            break;
        }
        case TYPE.BUILT: {
            // afficher l'icone de l'antenne
            if(position.suit === "spades") {
                const icon = createIcon(cell, 'action-token call-icon', '📡', 'antenne de communication');
                if(astronaut) {
                    icon.addEventListener('click', () => {
                        dragAndDropAction.astronaut = astronaut;
                        document.querySelector('.construction-deck').classList.add('calling');
                    })
                }

            }
            if(position.nbAliens > 0) {
                cell.classList.add('alien');
            }
        }
    }

    if(position.suit) {
        cell.classList.add(position.suit);

        if(isActive(position)) {
            cell.classList.add('active');
        }
    }

    drawGridResourcesInCell(position);

    // dessiner les aliens
    if(position.signal) {
        const icon = createIcon(cell, 'action-token alien-signal-icon', '🛸', 'Signal alien');
        if(astronaut) {
            icon.addEventListener('click', () => alien_removeSignal(position, astronaut));
        }
    }
    if(position.nbAliens > 0) {
        const icon = createIcon(cell, 'action-token alien-group-icon', '👽 '+position.nbAliens, 'Groupe alien');
        if(astronaut) {
            icon.addEventListener('click', () => alien_removeAlien(position, astronaut));
        }
    }

    // déssiner la mutation végétale
    if(position.mutation) {
        cell.classList.add('mutation')
        createIcon(cell, 'status-token plant-mutation-icon', '🧬', 'Mutation Végétale');
    }

    // dessiner l'incendie
    if(position.fire) {
        const icon = createIcon(cell, 'action-token fire-icon', '️🔥', 'Incendie');
        icon.addEventListener('click', () => fire_extinguish(position));
    }


    // dessiner l'épidémie
    if(position.infectious) {
        createIcon(cell, 'status-token biohazard-icon', '️☣️', 'Foyer inféctieux');
    }

}

function createIcon(cell, className, innerText, title) {
    const icon = document.createElement('div');
    icon.className = className;
    icon.innerText = innerText;
    icon.title = title;
    cell.appendChild(icon);
    return icon;
}

function drawGridResourcesInCell(position) {
    if (position.food > 0) {
        const icon = createIcon(position.dom, 'resource-token resource-token-food', `🥬${position.food}`, 'ravitaillement');
        icon.addEventListener('click', () => collectResource(position.row, position.col, 'food'));
    }
    if (position.energy > 0) {
        const icon = createIcon(position.dom, 'resource-token resource-token-energy', `🔋${position.energy}`, 'batterie');
        icon.addEventListener('click', () => collectResource(position.row, position.col, 'energy'));
    }
}

function handleStartMoving(astro) {
    const targets = new Set();
    const dist = astro.verySick >= 3 ? 1 : 3; // en cas de maladie et de péripétie avancée, l'astronaute ne peut se déplacer ue de 1 case, sinon par défaut il peut se déplacer de 3 cases
    pathfinder(astro.row, astro.col, dist, targets, true);

    const possibleTargets = [];
    targets.forEach(target => {
        const x = target.split('-')[0];
        const y = target.split('-')[1];
        possibleTargets.push(getGridElement(x, y));
        getGridElement(x, y).dom.classList.add('possible-target');
    });

    dragAndDropAction.astronaut = astro;
    dragAndDropAction.action = 'move';
    dragAndDropAction.possibleTargets = possibleTargets;

}

function drawAstronautInCell(astro, cell) {
    cell.classList.add('occupied');

    const token = document.createElement('div');
    token.className = 'astronaut';
    token.draggable = true;

    // Souris
    token.setAttribute('draggable', 'true');
    token.addEventListener('dragstart', () =>  {
        handleStartMoving(astro)
    });
    // Mobile
    token.addEventListener("touchstart", (e) => {
        e.preventDefault();
        handleStartMoving(astro);
    });
    token.addEventListener("touchend", (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if(target.classList.contains('cell')) {
            handleEndDragAndDrop(target);
        }
    });

    cell.appendChild(token);

    if (astro.food > 0) {
        const food = document.createElement('div');
        food.className = 'resource-token resource-token-food';
        food.innerText = `${astro.food}`;
        food.addEventListener('click', () => discardResource(astro, 'food'));
        token.appendChild(food);
    }
    if (astro.energy > 0) {
        const energy = document.createElement('div');
        energy.className = 'resource-token resource-token-energy';
        energy.innerText = `${astro.energy}`;
        energy.addEventListener('click', () => discardResource(astro, 'energy'));
        token.appendChild(energy);
    }
    if(astro.sick) {
        token.classList.add('sick');
        if(astro.verySick) {
            token.classList.add('verySick');
        }

    }
}

function drawInitialLayout() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    for(let key in grid) {
        const position = grid[key];

        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = position.row;
        cell.dataset.col = position.col;
        cell.innerHTML = '';
        board.appendChild(cell);

        position.dom = cell;
    }

    // Positionnement des 4 as au centre (carré 2x2)
    placeCard(2, 2, 'hearts');
    placeCard(2, 3, 'clubs');
    placeCard(3, 2, 'diamonds');
    placeCard(3, 3, 'spades');

    // pile de cnstruction
    const deck = document.getElementById('construction-deck');
    deck.innerHTML = '';

    callingActions.forEach(value => prepareConstructionDeck(deck, value));
}

function prepareConstructionDeck(deck, suit) {
    const cell = document.createElement('div');
    cell.className = 'cell';
    cell.classList.add('construction');
    cell.classList.add(suit);
    cell.innerHTML = '';
    cell.dataset.suit = suit;
    deck.appendChild(cell);

    cell.setAttribute('draggable', 'true');
    cell.addEventListener('dragstart', () =>  {
        handleCallingStart(cell.dataset.suit)
    });
    // Mobile
    cell.addEventListener("touchstart", (e) => {
        e.preventDefault();
        handleCallingStart(cell.dataset.suit);
    });
    cell.addEventListener("touchend", (e) => {
        e.preventDefault();
        const touch = e.changedTouches[0];
        const target = document.elementFromPoint(touch.clientX, touch.clientY);
        if(target.classList.contains('cell')) {
            handleEndDragAndDrop(target);
        }
    });
}

function placeCard(row, col, suit) {
    const position = getGridElement(row, col);
    position.suit = suit;
    position.type = TYPE.BUILT;
}

function getSuitSymbol(suit) {
    switch (suit) {
        case 'hearts': return '♥';
        case 'clubs': return '♣';
        case 'diamonds': return '♦';
        case 'spades': return '♠';
    }
}

function placeInitialAstronaut() {
    const row = 2;
    const col = 2;
    astronauts = [];
    astronauts.push({ row, col, energy: 0, food: 0, sick: false });
    logMessage("Astronaute initial placé sur l'as de cœur.");
}


function logMessage(msg) {
    console.log(msg);

    const p = document.createElement('p');
    p.textContent = msg;
    logPanel.appendChild(p);
    logPanel.scrollTop = logPanel.scrollHeight;
}

function nextTurn() {
    logMessage("Début d'un nouveau tour...");

    // Logique de ressources, péripéties, actions à implémenter ici
    runResourcePhase();

    runCalamityPhase(); // reveller une carte du deck
    runAdventurePhase(); // appliquer les "problèmes" qu'on a chaque tour (la contamination, la propgation du feu, l'attaque alien, la vegetation).
    runIncidentPhase(); // on tire au hasard des nouveaux lieux problématiques

    renderEverything();
}

function resetGame() {
    logPanel.innerHTML = '';
    logMessage("Partie réinitialisée.");
    initializeGame();
}

function runResourcePhase() {
    // Ajouter ressources aux cartes
    for(let key in grid) {
        const position = grid[key];
        if(position.suit && isActive(position)) {
            // Ajouter un jeton ravitaillement si serre (clubs ♣)
            if (position.suit === 'clubs') {
                addFoodToCell(position);
            }

            // Ajouter un jeton énergie si panneau solaire (diamonds ♦)
            if (position.suit === 'diamonds') {
                addEnergyToCell(position, position);
            }
        }
        if(position.type === TYPE.JUNGLE) {
            addFoodToCell(position);
        }
    }

    const astronautsDied = [];
    for (let astro of astronauts) {
        const position = getGridElement(astro.row, astro.col);
        // Vérifie si le module habitable est actif
        let onActiveHabitat = position.suit === 'hearts' && isActive(position);

        let maxEnergy = astronautLimit(astro) - astro.food;
        if (onActiveHabitat) {
            astro.energy = Math.min(astro.energy + 3, maxEnergy);
        } else {
            astro.food--;
            astro.energy = Math.min(astro.energy + 2, maxEnergy);
        }

        if (astro.food < 0) {
            logMessage("Un astronaute est mort faute de ravitaillement.");
            // Retirer l'astronaute
            astronautsDied.push(astro);
        }
    }
    astronautsDie(astronautsDied)

}

function isActive(position) {
    if(!position) return false;
    if(position.type !== TYPE.BUILT) return false;
    //if(position.fire) return false;
    if(position.suit === 'hearts') { // pour être actif, un module habitable doit être à côté d'un panneau solaire et d'une serre
        const adj = getAdjacentPositions(position);
        if(adj.filter(value => value.suit === 'diamonds' && isActive(value)).length === 0) return false;
        if(adj.filter(value => value.suit === 'clubs' && isActive(value)).length === 0) return false;
    }
    return true;
}

function getKey(row, col) {
    return `${row}-${col}`
}

function runCalamityPhase() {
    revealCardFromDeck();
}

function runAdventurePhase() {
    // adventurePhase, c'est ce qui se passe chaque tour, dans la continuité des incidents précédents


    // les aliens se deplacent (et attaquent)
    alien_adventure();
    // les plantes attaques les astronautes si possible
    plant_adventure();
    // l'incendie se propage
    fire_adventure();

    renderEverything();
}
function runIncidentPhase() {
    for(let position of Object.values(grid)) {
        if(position.type === TYPE.BUILT) {
            const incident = Math.floor(Math.random() * 6);
            if(incident === 0) { // une chance sur 6
                console.log("incident sur la case ", position);
/*
                if(position.suit === 'hearts') { // incident du module habitable : nouveau foyer infectieux
                    position.infectious = true;
                }
                else if(position.suit === 'diamonds') { // incident du panneau solaire : malfonction éléctrique (futur incendie)
                    fire_set(position);
                }
                else if(position.suit === 'clubs') { // incident de la serre : mutation génétique
                    position.mutation = true;
                    position.food ++;
                }*/
                if(position.suit === 'spades') { // nouveau groupe alien sur l'antenne
                    alien_incident(position);
                }
                else if(position.suit === 'clubs') { // mutation des plantes dans une serre
                    plant_incident(position);
                }
                else if(position.suit === 'diamonds') { // incendi sur un panneau solaire
                    fire_incident(position);
                }
                else if(position.suit === 'hearts') { // un module habitable devient foyer d'infectation
                    sick_incident(position);
                }
            }
        }
    }
}

function findOneAstronautAtRandom() {
    if (astronauts.length > 0) {
        const targetIndex = Math.floor(Math.random() * astronauts.length);
        return astronauts[targetIndex];
    }
    return null;
}

function addFoodToCell(position) {
    const specialMutation = position.mutation;
    const plantLevel = problemLevel['clubs'];
    let max = 3;
    let amount = 1;
    if(specialMutation) {
        max += plantLevel;
        amount += plantLevel;
    }

    let food = position.food + amount;

    while(food > max) {
        if(specialMutation) {
            plant_setFoodToRandomAdjacentPosition(position);
        }
        food --;
    }

    position.food = food;
}


function getAdjacentPositions(position) {
    const row = position.row;
    const col = position.col;

    const positions = [];
    positions.push(getGridElement(row-1, col));
    positions.push(getGridElement(row+1, col));
    positions.push(getGridElement(row, col-1));
    positions.push(getGridElement(row, col+1));
    return positions.filter(value => value !== null && value !== undefined && value.type !== TYPE.EMPTY);
}

function addEnergyToCell(position) {
    const max = 3;
    const amount = 1;

    let energy = position.energy + amount;
    if(energy > max) {
        energy = max;
    }
    position.energy = energy;
}

function collectResource(row, col, type) {
    let astronaut = astronauts.find(a => a.row === row && a.col === col);

    if (!astronaut) {
        logMessage("Aucun astronaute sur cette case pour ramasser une ressource.");
        return;
    }

    const position = getGridElement(row, col);
    if (position[type] <= 0) {
        logMessage("Plus aucune ressource à ramasser");
        return;
    }

    // cas particulier de la mutation vegetale
    const specialVegetationMutation = type === 'food' && position.mutation && position.food <= 3;
    if(specialVegetationMutation) { // pour retirer les 3 derniers jetons de plante d'une case où il y a une mutation, ça demande de l'energie
        if (astronaut.energy <= 0) {
            logMessage("L'astronaute n'a pas d'energie");
            return;
        }
        astronaut.energy --;

        if(position.food === 1) {
            // on ramasse la le dernier jeton de ravitaillement, donc on elève la mutation
            position.mutation = false;
        }
    }

    if (astronaut.food + astronaut.energy >= astronautLimit(astronaut)) {
        logMessage("L'astronaute a atteint sa limite de ressources.");
        return;
    }

    astronaut[type]++;
    position[type] --;
    redrawGridCell(position)
}

function astronautLimit(astro) {
    // la limite de ressource d'unastronaute vaut 5
    // ou 3 s'il est malade et que l'étape de la péripétie vaut au moins 2
    return astro.sick ? 3 : 5
}


function discardResource(astronaut, type) {

    if (astronaut[type] <= 0) {
        logMessage("L'astronaute n'a plus de stock à jeter");
        return;
    }

    astronaut[type]--;
    renderEverything();
}

function handleEndDragAndDrop(cell) {
    if(!dragAndDropAction.astronaut || !dragAndDropAction.action) return; // rien à faire

    if (!cell.classList.contains("possible-target")) {
        logMessage("destination invalide.");
        document.querySelectorAll(`.cell`).forEach(c => {
            c.classList.remove('possible-target')
        });
        return;
    }

    document.querySelectorAll(`.cell`).forEach(c => {
        c.classList.remove('possible-target')
    });

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);
    const astro = dragAndDropAction.astronaut

    if (astro.energy <= 0) {
        logMessage("Pas d'energie.");
        return;
    }

    astro.energy--;

    const position = getGridElement(row, col);

    if(dragAndDropAction.action === 'move') {
        // mouvement d'un astronaute
        astro.row = row;
        astro.col = col;
        renderEverything();

    }
    else if(dragAndDropAction.action === 'astronaut') {
        astronauts.push({ row, col, energy: 0, food: 0, sick: false });
        dropCapsule(cell, 'rocket');
        logMessage("Nouvel astronaute appelé sur un module habitable.");
    }
    else if(dragAndDropAction.action === 'supply') {
        position.food++;
        position.energy++;
        position.infectious = false;
        dropCapsule(cell, 'rocket');
        logMessage("Envoie de ravitaillement");
    }
    else {
        dropCapsule(position.dom, 'rocket');
        position.suit = dragAndDropAction.action;
        position.type = TYPE.CONSTRUCTION;
    }

    dragAndDropAction.astronaut = null;
    dragAndDropAction.action = null;

}

function setupDragAndDrop() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('dragover', (e) => e.preventDefault());
        cell.addEventListener('drop', (e) => {

            handleEndDragAndDrop(cell);

        });
    });
}

function pathfinder(x, y, dist, targets, start) {

    const position = getGridElement(x, y);
    if (position.type === TYPE.EMPTY) return; // interdit de se rendre sur un bunker alien ou sur une case pas encore construite

    if(isFree(position)) {
        targets.add(getKey(x,y));
    }

    if(dist <= 0) return;

    if(!start) {
        if(position.type === TYPE.EXPLODED || position.type === TYPE.JUNGLE || position.type === TYPE.BUNKER) return; // un cratère ou une jungle met fin au mouvement
    }

    if(x > 0) pathfinder(x-1, y, dist-1, targets);
    if(y < boardSize-1) pathfinder(x, y+1, dist-1, targets);
    if(x < boardSize-1) pathfinder(x+1, y, dist-1, targets);
    if(y > 0) pathfinder(x, y-1, dist-1, targets);

}

function isFree(position) {
    // pour l'instant, on verifie s'il y a un astronaute dessus
    return !astronauts.find(a => a.row === position.row && a.col === position.col)
}

function oneAstronautDie(astro) {
    astronautsDie([astro]);
}
function astronautsDie(astronautsDied) {
    astronauts = astronauts.filter(x => !astronautsDied.includes(x));
}

function getSeveralLocationsAtRandom(number, suit) {
    const locations = Object.values(grid).filter(loc => loc.suit === suit);
    shuffle(locations);

    if(locations.length <= number) {
        return locations;
    } else {
        return locations.slice(0, number);
    }

}
function getOneActiveLocationAtRandom(suit) {
    const locations = Object.values(grid).filter(loc => loc.suit === suit && isActive(loc));
    if(locations.length === 0) return null;

    const targetIndex = Math.floor(Math.random() * locations.length);
    return locations[targetIndex];
}

function isCloseToAntena(row, col) {
    return Object.values(grid)
        .filter(position => position.type === 'spades')
        .filter(position =>  distance(row, col, position) <= 2)
        .filter(position => isActive(position))
        .length > 0;
}
function distance(row, col, position) {
    return Math.abs(position.row-row)+Math.abs(position.col-col);
}


function dropCapsule(targetCell, className) {
    const rect = targetCell.getBoundingClientRect();

    // Crée l’image
    const img = document.createElement("div");
    img.className = "capsule "+className;

    // Positionner horizontalement au centre de la cellule
    const x = rect.left + rect.width / 2 - 40; // 40 = moitié de largeur img
    const y = rect.top + rect.height / 2 - 40;

    img.style.left = x + "px";
    img.style.setProperty("--targetY", y + "px");

    document.body.appendChild(img);

    // Nettoyage après l’animation
    img.addEventListener("animationend", () => {
        img.remove();
        renderEverything();
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
    renderEverything();
    logMessage("Bienvenue sur la Lune !");

});
