// Jeu : Une Maison sur la Lune
// Fichier principal JavaScript

const suits = ['hearts', 'clubs', 'diamonds', 'spades'];

let deck = [];
let astronauts = []; // Liste des astronautes avec leurs positions et ressources

let nbAliens = 0;

let dragAndDropAction = {
    astronaut: null,
    action: null,
    possibleTargets: []
}; // { astronaut, action, possible-targets }

let grid = [] // grille qui représente toutes les cases (6x6)

const TYPE = {
    EMPTY: 'empty',
    CONSTRUCTION: 'construction',
    BUILT: 'built',
    JUNGLE: 'jungle',
    BUNKER: 'bunker',
    EXPLODED: 'exploded'
};


function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let i in [1,2,3,4]) {
            deck.push(suit);
        }
    }
    shuffle(deck);
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

    // première phase de resource (début du tour 1)
    runResourcePhase();

    renderEverything();
}

function renderEverything() {
    for(let key in grid) {
        redrawGridCell(grid[key]);
    }

    document.querySelector('.construction-deck').classList.remove('calling');

}

function revealCardFromDeck() {
    if(deck.length === 0) {
        createDeck();
    }
    const suit = deck.shift();

    logMessage(`péripétie ${getSuitSymbol(suit)}`)

    // pique : l'aventure des aliens
    if(suit === 'spades') {
        if(nbAliens > 0) {
            alert("E.T. téléphone maison");
        }
        alien_bunker();
    }

    // treffle : l'aventure végétale
    if (suit === 'clubs') {
        const jungles = Object.values(grid).filter(value => vegetation_readyToJungle(value.row, value.col));
        if(jungles > 0) {
            alert("Les plantes deviennent incontrolable");
        }
        jungles.forEach(value => value.type = TYPE.JUNGLE);
    }

    // carreau : l'incendie
    if(suit === 'diamonds') {
        const explosions = Object.values(grid).filter(value => value.fire);
        if( explosions.length > 0) {
            alert("explosion");
            explosions.forEach(value => fire_clean(value, true));
        }
    }

    // coeur : l'épidémie
    if(suit === 'hearts') {
        const astroGettingBad = astronauts.filter(value => value.sick && !value.verySick);
        if(astroGettingBad.length > 0) {
            alert("L'état des malades empire");
            astroGettingBad.forEach(value => value.verySick = true);
        }
    }

    return suit;
}

function vegetation_readyToJungle(position) {
    return position.food > 0
        && getAdjacentPositions(position).filter(value => value.food > 0).length === 4;
}

function alien_attack() {
    if(nbAliens === 0) return;

    Object.values(grid).forEach(value => value.alien = false); // retirer les aliens s'il y en a déjà

    const target = findOneAstronautAtRandom();
    if (target) {
        const position = getGridElement(target.row, target.col);
        position.alien = true;
        dropCapsule(position.dom, 'alien');

        // Combat
        let totalRes = target.food + target.energy;
        if (totalRes < nbAliens) {
            logMessage(`Un astronaute a été submergé par ${nbAliens} aliens !`);
            oneAstronautDie(target);
        } else {
            let toRemove = nbAliens;
            if (target.food >= toRemove) {
                target.food -= toRemove;
            } else {
                toRemove -= target.food;
                target.food = 0;
                target.energy = Math.max(0, target.energy - toRemove);
            }
            logMessage(`Un astronaute perd ${nbAliens} ressources. suite à l'attaque alien`);
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
    nbAliens --;

    renderEverything();
}
function alien_bunker() {
    if(nbAliens === 0) return;

    // Choisir X antennes au hasard
    const chosenAntennas = getSeveralLocationsAtRandom(nbAliens, 'spades');
    chosenAntennas.forEach(position => {
        position.type = TYPE.BUNKER;

        // Si astronaute présent → il meurt
        const astro = getAstronaut(position);
        if (astro >= 0) {
            logMessage(`Un astronaute est tué par un alien`);
            oneAstronautDie(astro);
        }
    });

    nbAliens -= chosenAntennas.length; // ne devrait jamais être négatif

}

function fire_set(newFire) {
    newFire.fire = true;
    newFire.food = 0;
    newFire.energy = 0;

}
function fire_propagation() {

    const newFires = [];

    // etape 1 : traiter les cases déjà en feu
    for (let firePosition of Object.values(grid).filter(value => value.fire)) {
        const row = firePosition.row;
        const col = firePosition.col;

        fire_clean(firePosition, false);

        fire_extend(row-1, col, newFires);
        fire_extend(row+1, col, newFires);
        fire_extend(row, col-1, newFires);
        fire_extend(row, col+1, newFires);
    }

    // etape 2 : mettre en feu les cases adjacentes
    for (let newFire of newFires) {
        if(!newFire.fire) fire_set(newFire);
    }
}
function fire_extend(row, col, newFire) {
    const position = getGridElement(row, col);
    if(!position) return;
    if(position.fire) return;
    newFire.push(position);
}
function fire_clean(position, explosion) {
    // fonction qui gère un incendie, voir une explosion

    position.food = 0;
    position.energy = 0;
    position.type = TYPE.CONSTRUCTION;
    if(explosion) {
        position.type = TYPE.EXPLODED;
        position.suit = null;

        const astro = astronauts.find(e => e.row === position.row && e.col === position.col);
        if (astro) {
            logMessage("un astronaute meurt dans l'explosion");
            oneAstronautDie(astro);
        }
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
function sick_isHosptial(position) {
    // on est un hopital si on est un module habitable adjacent à au moins 2 autres modules habitables
    const row = position.row;
    const col = position.col;
    const adjacentCureValue =
        sick_cureValue(row-1, col)
        + sick_cureValue(row+1, col)
        + sick_cureValue(row, col-1)
        + sick_cureValue(row, col+1);
    return sick_cureValue(row, col) === 1 && adjacentCureValue >= 2;
}
function sick_cureValue(row, col) {
    const position = getGridElement(row, col);
    if(position && position.type === TYPE.BUILT && position.suit === 'hearts') return 1;
    return 0;
}

function getAstronaut(position) {
    return astronauts.find(value => value.row === position.row && value.col === position.col);
}

function handleCallingStart(suit) {

    const astro = dragAndDropAction.astronaut;
    if(!astro) return;

    dragAndDropAction.action = suit;

    if(suit === 'astronaut') {
        const targets = Object.values(grid).filter(position => position.suit === 'hearts' && isFree(position) && isActive(position)
            && distance(astro.row, astro.col, position) <= 2)
        dragAndDropAction.possibleTargets = targets;


    } else {
        const targets = Object.values(grid).filter(position => (position.type === TYPE.EMPTY || position.type === TYPE.CONSTRUCTION || position.type === TYPE.EXPLODED)
            && distance(astro.row, astro.col, position) <= 2)
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
        case TYPE.CONSTRUCTION: {
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
                ;
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
    if(position.alien && nbAliens > 0) {
        const icon = createIcon(cell, 'action-token alien-group-icon', '👽 '+nbAliens, 'Groupe alien');
        if(astronaut) {
            icon.addEventListener('click', () => alien_removeAlien(position, astronaut));
        }
    }

    // déssiner la mutation végétale
    if(position.mutation) {
        createIcon(cell, 'status-token plant-mutation-icon', '🌱', 'Mutation Végétale'); // todo prendre un icone de gêne
    }

    // dessiner l'incendie
    if(position.fire) {
        const icon = createIcon(cell, 'action-token fire-icon', '️🔥', 'Incendie');
        icon.addEventListener('click', () => fire_extinguish(position));
    }
    if(position.malfunction) {
        createIcon(cell, 'status-token shortcut-icon', '️🔥', 'Court-circuit'); // todo changer l'icone
    }


    // dessiner l'épidémie
    if(position.infectious) {
        createIcon(cell, 'status-token biohazard-icon', '️☣️', 'Foyer inféctieux');
    }
    if(sick_isHosptial(position)) {
        cell.classList.add('hearts2');
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
    prepareConstructionDeck(deck, 'hearts');
    prepareConstructionDeck(deck, 'clubs');
    prepareConstructionDeck(deck, 'diamonds');
    prepareConstructionDeck(deck, 'spades');
    prepareConstructionDeck(deck, 'astronaut');
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

    runAdventurePhase();
    runProblemsPhase();
    runIncidentPhase();

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

            // soigner la maladie
            if(sick_isHosptial(position)) {
                astro.sick = false;
                astro.verySick = false;
            }
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
    if(position.fire || position.malfunction) return false;
    if(position.suit === 'hearts') { // pour être actif, un module habitable doit être à côté d'un panneau solaire et d'une serre (actifs)
        const adj= getAdjacentPositions(position);
        if(adj.filter(value => value.suit === 'diamonds' && isActive(value)).length === 0) return false;
        if(adj.filter(value => value.suit === 'clubs' && isActive(value)).length === 0) return false;
    }
    return true;
}

function getKey(row, col) {
    return `${row}-${col}`
}

function runAdventurePhase() {
    revealCardFromDeck();
}

function runProblemsPhase() {
    for(let position of Object.values(grid)) {
        if(position.malfunction) {
            position.malfunction = false;
            position.fire = true;
        }
        if(position.signal) {
            nbAliens ++;
        }
    }

    sick_contaminate();

    fire_propagation();

    // mutation végétale ???

    renderEverything();

    // résoudre l'attaque alien après le rendu, car il y a une descente de capsule
    alien_attack();
}
function runIncidentPhase() {
    for(let position of Object.values(grid)) {
        if(position.type === TYPE.BUILT) {
            const incident = Math.floor(Math.random() * 6);
            if(incident === 0) { // une chance sur 6

                if(position.suit === 'heart') { // incident du module habitable : nouveau foyer infectieux
                    position.infectious = true;
                } else if(position.suit === 'diamonds') { // incident du panneau solaire : malfonction éléctrique (futur incendie)
                    position.malfunction = true;
                    position.energy = 0;
                } else if(position.suit === 'clubs') { // incident de la serre : mutation génétique
                    position.mutation = true;
                    position.food ++;
                } else if(position.suit === 'spades') { // incident de l'antenne : signal alien
                    position.signal = true;
                    nbAliens ++;
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
    const max = specialMutation? 5 : 3;
    const amount = specialMutation ? 3 : 1;

    let food = position.food + amount;
    while(food > max) {
        if(specialMutation) {
            vegetation_setFoodToRandomAdjacentPosition(position.row, position.col);
        }
        food --;
    }

    position.food = food;
}

function vegetation_setFoodToRandomAdjacentPosition(position) {
    const positions = getAdjacentPositions(position).filter(value => value.food === 0);
    if(positions.length > 0) {
        const index = Math.floor(Math.random()*positions.length);
        positions[index].food ++;
    }
}

function getAdjacentPositions(position) {
    const row = position.row;
    const col = position.col;

    const positions = [];
    positions.push(getGridElement(row-1, col));
    positions.push(getGridElement(row+1, col));
    positions.push(getGridElement(row, col-1));
    positions.push(getGridElement(row, col+1));
    return positions.filter(value => value !== null);
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

    if(dragAndDropAction.action === 'move') {
        // mouvement d'un astronaute
        astro.row = row;
        astro.col = col;
        renderEverything();

    } else if(dragAndDropAction.action === 'astronaut') {
        astronauts.push({ row, col, energy: 0, food: 0, sick: false });
        dropCapsule(cell, 'rocket');
        logMessage("Nouvel astronaute appelé sur un module habitable.");
    } else {
        const position = getGridElement(row, col);
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
    if (position.type === TYPE.BUNKER || position.type === TYPE.EMPTY) return; // interdit de se rendre sur un bunker alien ou sur une case pas encore construite

    if(isFree(position)) {
        targets.add(getKey(x,y));
    }

    if(dist <= 0) return;

    if(!start) {
        if(position.type === TYPE.EXPLODED || position.type === TYPE.JUNGLE) return; // un cratère ou une jungle met fin au mouvement
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
