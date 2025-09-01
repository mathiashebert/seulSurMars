// Jeu : Une Maison sur la Lune
// Fichier principal JavaScript

const suits = ['hearts', 'clubs', 'diamonds', 'spades'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '1', 'J', 'Q', 'K'];

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
    alienSignalCount: 0,     // Nombre de signaux sur l'antenne
    alienAdventureStep: 0,    // 0 = pas commencé, 1 = phase Signal Alien active, 2 = invasion
    alienCount: 0,    // Nombre total d’aliens sur le plateau
}
let vegetationAdventure = {
    vegetationPosition:null,      // { row, col }
    vegetationAdventureStep: 0,
}
let electricAdventure = {
    shortcutPosition: null,
    firePositions: [],
    smokePosition: null,
    electricStep: 0,
}
let sickAdventure = {
    sickStep: 0,
    mortuary: null,
    pandemicLocation: null,
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


function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
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

function initializeDrawPiles() {
    const pileDefinitions = [
        ['A'],
        ['J'],
        ['Q'],
        ['K']
    ];

    for (let i = 0; i < 4; i++) {
        drawPiles[i] = deck.filter(card => pileDefinitions[i].includes(card.value));
        shuffle(drawPiles[i]);
    }
    deck = [];
    for (let i = 0; i < 4; i++) {
        deck.push(...drawPiles[i]);
    }
}

function initializeGame() {
    initGrid();
    createDeck();
    initializeDrawPiles();
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
        // todo  : victoire
        alert('fin de la partie : le deck est terminé. bravo !!!!')
        return;
    }
    const card = deck.shift();
    if(['J', 'Q', 'K'].includes(card.value)) {

        logMessage(`${card.value} ${getSuitSymbol(card.suit)}`)

        // pique : l'aventure des aliens
        if(card.suit === 'spades') {
            if(card.value === 'J') { // signal alien
                startAlienSignalAdventure();
                alert("signal Alien");
            }
            if(card.value === 'Q') { // offensive alien
                revealInvasionAlien();
                alert("Invasion Alien");
            }
            if(card.value === 'K') { // base alien
                triggerEThome();
                alert("E.T. téléphone maison");
            }
        }

        // treffle : l'aventure végétale
        if (card.suit === 'clubs') {
            if(card.value === 'J') {
                startVegetationAdventure();
                alert("Mutation végétale");
            }
            if(card.value === 'Q') {
                startLuxuriance();
                alert("Luxuriance");
            }
            if(card.value === 'K') {
                triggerRoots();
                alert("Enracinement");
            }
        }

        // carreau : l'incendie
        if(card.suit === 'diamonds') {
            if(card.value === 'J') {
                startShortCut();
                alert("Court-circuit");
            }
            if(card.value === 'Q') {
                startFire();
                alert("Incendie");
            }
            if(card.value === 'K') {
                explosion();
                alert("Explosion");
            }
        }

        // coeur : l'épidémie
        if(card.suit === 'hearts') {
            if(card.value === 'J') {
                startDisease();
                alert("Patient 0");
            }
            if(card.value === 'Q') {
                diseaseGetWorse();
                alert("Epidémie");
            }
            if(card.value === 'K') {
                diseaseGetWorst();
                alert("Symptômes graves");
            }
        }
    }
    return card;
}

function attackAlien() {
    if (!alienAdventure.alienPosition) {
        log("Aucun alien à attaquer ici.");
        return;
    }

    let astro = astronauts.find(a => alienAdventure.alienPosition.row === a.row && a.col === alienAdventure.alienPosition.col);

    if(!astro) {
        log("Pas d'astronaute pour attaquer");
    }
    if (astro.energy <= 0) {
        log("Pas assez d'énergie pour attaquer un alien.");
        return;
    }
    astro.energy--;


    // intercepter le signal
    if(alienAdventure.alienAdventureStep === 1) {
        alienAdventure.alienAdventureStep = 1.5;
        redrawGridCell(getGridElement(alienAdventure.alienPosition.row, alienAdventure.alienPosition.col));
        log(`Le signal a été intercepté`);
    }

    // attaquer un alien
    if(alienAdventure.alienAdventureStep === 2) {
        if (alienAdventure.alienCount <= 1) {
            log("Impossible de retirer le dernier alien.");
            return;
        }

        alienAdventure.alienCount--;
        redrawGridCell(getGridElement(alienAdventure.alienPosition.row, alienAdventure.alienPosition.col));
    }
}

function startVegetationAdventure() {
    // Récupère toutes les positions de serres déjà construites
    const greenHouse = getOneActiveLocationAtRandom('clubs');

    if (!greenHouse) {
        log("Aucune serre construite pour placer la mutation végétale.");
        return;
    }

    // Choisir une serre au hasard
    vegetationAdventure.vegetationPosition = greenHouse;
    vegetationAdventure.vegetationAdventureStep = 1;

    // Ajouter une icône de plante sur la cellule
    const row = vegetationAdventure.vegetationPosition.row;
    const col = vegetationAdventure.vegetationPosition.col;
    redrawGridCell(getGridElement(row, col));
    log(`Une mutation génétique est apparue sur la serre ${row},${col}.`);
}

function startLuxuriance() {
    vegetationAdventure.vegetationAdventureStep = 2;

    moveVegetation();
}

function triggerRoots() {
    vegetationAdventure.vegetationAdventureStep = 3;

    // remplacer toutes les cartes où il y a de la végétation, par des serres
    for(let key in grid) {
        const position = grid[key]
        if(position.food > 0) {
            position.type = TYPE.JUNGLE;
            position.suit = 'clubs'; // cette position est maintenant une 'serre'
        }
    }



}

function startShortCut() {
    // Récupère toutes les positions de serres déjà construites
    const solarPanel= getOneActiveLocationAtRandom('diamonds');

    if (solarPanel == null) {
        log("Aucune panneau solaire pour placer le court circuit.");
        return;
    }

    // Choisir un panneau solaire au hasard
    electricAdventure.shortcutPosition = solarPanel;
    setFire(electricAdventure.shortcutPosition.row, electricAdventure.shortcutPosition.col);

    electricAdventure.electricStep = 1;

    // Ajouter une icône de feu sur la cellule
    const row =electricAdventure.shortcutPosition.row;
    const col =electricAdventure.shortcutPosition.col;

    log(`un court circuit risque de provouer d'importants dégats sur le panneau solaire: ${row},${col}.`);
}

function startFire() {
    electricAdventure.electricStep = 2;

    // cas où l'incendie avait été éteint lors du court circuit
    if(electricAdventure.smokePosition) {
        // alors on remet simplement un "feu" là où il y a eu le court circuit
        setFire(electricAdventure.smokePosition.row, electricAdventure.smokePosition.col);
        electricAdventure.smokePosition = null;
    }
    // cas où l'incendie n'a pas été maitrisé
    else {
        firePropagation();
    }

    log("lincendie devient incontrolable");
}

function setFire(row, col) {
    electricAdventure.firePositions.push({row:row, col: col});
    setFood(row, col, 0);
    setEnergy(row, col, 0);

}
function firePropagation() {

    const newFire = [];

    // etape 0 : s'il y a de la fumée, elle devient du feu
    if(electricAdventure.smokePosition) {
        setFire(electricAdventure.smokePosition.row, electricAdventure.smokePosition.col);
        electricAdventure.smokePosition = null;
    }

    // etape 1 : traiter les cases déjà en feu
    for (let i in electricAdventure.firePositions) {
        const firePosition = electricAdventure.firePositions[i];
        const row = firePosition.row;
        const col = firePosition.col;

        cleanPosition(row, col, false);

        extendFire(row-1, col, newFire);
        extendFire(row+1, col, newFire);
        extendFire(row, col-1, newFire);
        extendFire(row, col+1, newFire);
    }

    // etape 2 : mettre en feu les cases adjacentes
    for (let i in newFire) {
        if(!isOnFire(newFire[i].row, newFire[i].col)) setFire(newFire[i].row, newFire[i].col);
    }
}

function extendFire(row, col, newFire) {
    if(!getGridElement(row, col)) return;
    if(isOnFire(row, col)) return;
    newFire.push({row: row, col: col});
}

function cleanPosition(row, col, explosion) {
    // fonction qui gère un incendie, voir une explosion
    const astro = astronauts.find(e => e.row === row && e.col === col);
    if (astro) {
        log("un astronaute meurt dans l'incendie");
        oneAstronautDie(astro);
    }

    const position = getGridElement(row, col);
    position.food = 0;
    position.energy = 0;
    position.type = TYPE.CONSTRUCTION;
    if(explosion) {
        position.type = TYPE.EXPLODED;
        position.suit = null;
    }
}

function explosion() {
    firePropagation();
    for (let i in electricAdventure.firePositions) {
        const firePosition = electricAdventure.firePositions[i];
        const row = firePosition.row;
        const col = firePosition.col;
        cleanPosition(row, col, true);
    }
    electricAdventure.electricStep = 3;
    electricAdventure.firePositions = [];
}

function startDisease() {
    log("Un astronaute est tombé malade. Pour l'instant les symptômes ne sont pas graves : quelques bouton et un peu de fièvre. Cependant, c'est peut-être contagieux.");
    const target = findOneAstronautAtRandom();
    if(target) {
        target.sick = true;
    }

    sickAdventure.sickStep = 1;
}

function diseaseGetWorse() {
    log("Les symptômes semblent s'aggraver : les malades ressentent une grande fatigue.");

    sickAdventure.sickStep = 2;
}

function diseaseGetWorst() {
    log("Les symptômes semblent s'aggraver encore : les malades ont maintenant beaucoup de mal à se deplacer. Cependant, un remède a été trouvé. Les malades peuvent être soignés dans n'importe quel module habitable");

    sickAdventure.sickStep = 3;
    sickAdventure.mortuary = null;
    sickAdventure.pandemicLocation = null;
}

function contaminate() {
    if(sickAdventure.sickStep < 1) return; // véirfier que l'aventure a commencé

    const newSickAstornauts = [];
    // propager la contamination
    for(let i in astronauts) {
        const astro = astronauts[i];
        if(!astro.sick && isCloseToContamination(astro.row, astro.col)) {
            newSickAstornauts.push(astro);
        }
    }
    for(let i in newSickAstornauts) {
        newSickAstornauts[i].sick = true;
    }
}

function isCloseToContamination(row, col) {
    if(sickAdventure.sickStep === 0) return false;

    if(sickAdventure.mortuary) {
        if(Math.abs(sickAdventure.mortuary.row-row) <= 1 && Math.abs(sickAdventure.mortuary.col-col) <= 1) {
            return true
        }
    }
    if(sickAdventure.pandemicLocation) {
        if(Math.abs(sickAdventure.pandemicLocation.row-row) <= 1 && Math.abs(sickAdventure.pandemicLocation.col-col) <= 1) {
            return true
        }
    }

    for(let i in astronauts) {
        const astro = astronauts[i];
        if(astro.sick && Math.abs(astro.row-row) <= 1 && Math.abs(astro.col-col) <= 1) {
            return true
        }
    }
}


function handleCallingStart(suit) {

    const astro = dragAndDropAction.astronaut;
    if(!astro) return;

    dragAndDropAction.action = suit;

    if(suit === 'astronaut') {
        console.log("appeler un nouvel astro ?")
        const targets = Object.values(grid).filter(position => position.suit === 'hearts' && isFree(position) && isActive(position)
            && distance(astro.row, astro.col, position) <= 2)
        dragAndDropAction.possibleTargets = targets;
        console.log(targets);


    } else {
        const targets = Object.values(grid).filter(position => (position.type === TYPE.EMPTY || position.type === TYPE.CONSTRUCTION || position.type === TYPE.EXPLODED)
            && distance(astro.row, astro.col, position) <= 2)
        dragAndDropAction.possibleTargets = targets;
    }

    document.querySelectorAll(`.cell`).forEach(c => {
        c.classList.remove('possible-target')
    });

    log("début d'appel : "+suit);
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

    if(isCloseToSuit(row, col, 'spades', 2)) {
        cell.classList.add('communication');
    }

    // rendu de l'astronaute
    const astroIndex = astronauts.findIndex(a => a.row === row && a.col === col);
    let astronaut = null;
    if (astroIndex >= 0) {
        astronaut = astronauts[astroIndex];
        drawAstronautInCell(astronaut, cell, astroIndex);

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
            icon.addEventListener('click', () => construction(cell));
            break;
        }
        case TYPE.BUILT: {
            // afficher l'icone de l'antenne
            if(position.suit === "spades") {
                const icon = createIcon(cell, 'action-token call-icon', '📡', 'antenne de communication');
                if(astronaut) {
                    icon.addEventListener('click', () => {
                        log("utiliser l'antenne");
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
    if(alienAdventure.alienAdventureStep > 0) {
        // signal alien
        if (alienAdventure.alienAdventureStep === 1 && samePosition(row, col, alienAdventure.alienPosition)) {
            const icon = createIcon(cell, 'action-token alien-signal-icon', `🛸 ${alienAdventure.alienSignalCount}`, `Signal alien : ${alienAdventure.alienSignalCount}`);
            icon.addEventListener('click', () => attackAlien());
        } else if (alienAdventure.alienAdventureStep === 2 && samePosition(row, col, alienAdventure.alienPosition)) {
            const icon = createIcon(cell, 'action-token alien-group-icon', ((alienAdventure.alienCount > 1) ? '👽' : '🕳️') + alienAdventure.alienCount, `Groupe alien : ${alienAdventure.alienCount}`);
            icon.addEventListener('click', () => attackAlien());
        }
    }

    // dessiner la végétation
    if(vegetationAdventure.vegetationAdventureStep > 0) {
        if(samePosition(row, col, vegetationAdventure.vegetationPosition)) {
            createIcon(cell, 'status-token plant-mutation-icon', '🌱', 'Mutation Végétale');
        }

    }

    // dessiner le feu
    if(electricAdventure.electricStep > 0) {
        if(samePosition(row, col, electricAdventure.smokePosition)) {
            // cas où il y a eu un court circuit traité, on met une icone de fumée pour signaler l'endroit
            createIcon(cell, 'status-token smoke-icon', '☁️', 'Fumée');
        }

        if(positionInArray(row, col, electricAdventure.firePositions)) {
            const icon = createIcon(cell, 'action-token fire-icon', '️🔥', 'Incendie');
            icon.addEventListener('click', () => extinguishFire(cell));
        }
    }

    // dessiner la pandémie
    if(sickAdventure.sickStep > 0) {
        // dessiner la morgue
        if(samePosition(row, col, sickAdventure.mortuary)) {
            createIcon(cell, 'status-token mortuary-icon', '️⚰️', 'Morgue');
        }

        if(samePosition(row, col, sickAdventure.pandemicLocation)) {
            createIcon(cell, 'status-token biohazard-icon', '️☣️', 'Foyer de l\'épidémie');

        }

        if(sickAdventure.sickStep === 3 && position.suit === 'hearts' && isAdjacentToSuit(row, col, 'hearts')
            && !samePosition(row, col, sickAdventure.mortuary
            && !samePosition((row, col, sickAdventure.pandemicLocation)))) {
            cell.classList.add('hearts2');
            // un module habitable actif qui est à côté d'un autre module habitable : ça donne une infirmerie
            createIcon(cell, 'action-token hospital-icon', '💉', 'Infirmerie');
        }
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

function positionInArray(row, col, array) {
    return array.filter(loc => loc.row === row && loc.col === col).length > 0;
}
function samePosition(row, col, position) {
    return position && position.row === row && position.col === col;
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
    const dist = astro.sick && sickAdventure.sickStep >= 3 ? 1 : 3; // en cas de maladie et de péripétie avancée, l'astronaute ne peut se déplacer ue de 1 case, sinon par défaut il peut se déplacer de 3 cases
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

function drawAstronautInCell(astro, cell, i) {
    cell.classList.add('occupied');

    const token = document.createElement('div');
    token.className = 'astronaut';
    token.draggable = true;
    token.dataset.index = i;

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

function extinguishFire(cell) {
    const astro = cell.querySelector(`.astronaut`);
    if(astro) {
        const astronaut = astronauts[parseInt(astro.dataset.index)];
        const row = astronaut.row;
        const col = astronaut.col;
        if(astronaut.energy <= 0) {
          log("pas d'energie.")
        } else {
            astronaut.energy --; // on enlève un point d'energie à l'astronaute

            electricAdventure.firePositions = electricAdventure.firePositions.filter(value => value.row !== row || value.col !== col); // on garde les autres feux uniquement
            if(electricAdventure.firePositions.length === 0) {
                electricAdventure.smokePosition = {row: row, col: col};
            }

            redrawGridCell(getGridElement(row, col))
        }


    } else {
        log("pas d'astraunaute pour eteindre le feu");
    }
}

function moveVegetation() {
    const expansionOrder = [
        {row: 2, col: 3},
        {row: 3, col: 3},
        {row: 3, col: 2},
        {row: 2, col: 2}, {row: 1, col: 2},
        {row: 1, col: 3}, {row: 1, col: 4},
        {row: 2, col: 4}, {row: 3, col: 4}, {row: 4, col: 4},
        {row: 4, col: 3}, {row: 4, col: 2}, {row: 4, col: 1},
        {row: 3, col: 1}, {row: 2, col: 1}, {row: 1, col: 1}, {row: 0, col: 1},
        {row: 0, col: 2}, {row: 0, col: 3}, {row: 0, col: 4}, {row: 0, col: 5},
        {row: 1, col: 5}, {row: 2, col: 5}, {row: 3, col: 5}, {row: 4, col: 5}, {row: 5, col: 5},
        {row: 5, col: 4}, {row: 5, col: 3}, {row: 5, col: 2}, {row: 5, col: 1}, {row: 5, col: 0},
        {row: 4, col: 0}, {row: 3, col: 0}, {row: 2, col: 0}, {row: 1, col: 0}, {row: 0, col: 0}
    ]

    for(let i=0; i<expansionOrder.length-1; i++) {
        const location = expansionOrder[i];
        const nextLocation = expansionOrder[i+1];

        const amount = getFood(location.row, location.col);

        if(amount > 1) {
            setFood(location.row, location.col, 1);
            const nextAmount = getFood(nextLocation.row, nextLocation.col) + amount -1;  // amount-1 représente l'excédent
            setFood(nextLocation.row, nextLocation.col, nextAmount);
        }
    }
}

function startAlienSignalAdventure() {
    const antenna = getOneActiveLocationAtRandom('spades');
    if (antenna == null) {
        log("Aucune antenne construite pour placer le signal alien.");
        return;
    }

    // Choisir une antenne au hasard
    alienAdventure.alienPosition = antenna;
    alienAdventure.alienSignalCount = 1;
    alienAdventure.alienAdventureStep = 1;

    // Ajouter une icône 🛸 sur la cellule
    const row = alienAdventure.alienPosition.row;
    const col = alienAdventure.alienPosition.col;
    log(`Signal alien détecté sur l'antenne en ${row},${col}.`);
}
function revealInvasionAlien() {
    alienAdventure.alienAdventureStep = 2;
    alienAdventure.alienCount = alienAdventure.alienSignalCount || 1;

    log(`Invasion alien ! ${alienAdventure.alienCount} aliens débarquent.`);
}
function triggerEThome() {
    const { alienCount } = alienAdventure;
    if (!alienCount || alienCount <= 0) {
        log("Aucun alien à répartir.");
        return;
    }

    // Mettre à jour l’état
    alienAdventure.alienAdventureStep = 3;
    alienAdventure.alienCount = 0;
    alienAdventure.alienPosition = null; // Plus de position unique

    // Choisir X antennes au hasard
    const chosenAntennas = getSeveralLocationsAtRandom(alienCount, 'spades');
    chosenAntennas.forEach(position => {
        const row = position.row;
        const col = position.col;
        position.type = TYPE.BUNKER;

        // Si astronaute présent → il meurt
        const astroIndex = astronauts.findIndex(a => a.row === row && a.col === col);
        if (astroIndex >= 0) {
            log(`Un astronaute est tué par un alien sur ${row},${col}`);
            astronauts.splice(astroIndex, 1);
        }
    });
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
    placeCard(2, 2, {suit: 'hearts', value: 'A'});
    placeCard(2, 3, {suit: 'clubs', value: 'A'});
    placeCard(3, 2, {suit: 'diamonds', value: 'A'});
    placeCard(3, 3, {suit: 'spades', value: 'A'});

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

function buildCard(position) {
    position.type = TYPE.BUILT;
    redrawGridCell(position);
}

function placeCard(row, col, card) {
    const position = getGridElement(row, col);
    startConstruction(position, card.suit);
    endConstruction(position);
}

function startConstruction(position, suit) {
    position.suit = suit;
    position.type = TYPE.CONSTRUCTION;
}
function endConstruction(position) {
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
                addFoodToCell(position.row, position.col);
            }

            // Ajouter un jeton énergie si panneau solaire (diamonds ♦)
            if (position.suit === 'diamonds') {
                addEnergyToCell(position.row, position.col);
            }
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

            // soigner la maladie /// todo si c'est un hopital
            if(astro.sick && sickAdventure.sickStep >= 3) {
                astro.sick = 0;
            }
        } else {
            astro.food--;
            astro.energy = Math.min(astro.energy + 2, maxEnergy);
        }

        if (astro.food < 0) {
            log("Un astronaute est mort faute de ravitaillement.");
            // Retirer l'astronaute
            astronautsDied.push(astro);
        }
    }
    astronautsDie(astronautsDied)

}

function isOnFire(row, col) {
    return electricAdventure.firePositions.filter(el => el.row === row && el.col === col).length > 0
}
function isActive(position) {
    if(!position) return false;
    const row = position.row;
    const col = position.col;

    if(position.type !== TYPE.BUILT) return false;
    if(isOnFire(row, col)) return false;
    if(samePosition(row, col, sickAdventure.mortuary)) return false;
    if(samePosition(row, col, sickAdventure.pandemicLocation)) return false;
    if(position.suit === 'hearts') { // pour être actif, un module habitable doit être à côté d'un panneau solaire et d'une serre
        if(!isAdjacentToSuit(row, col, 'diamonds')) return false;
        if(!isAdjacentToSuit(row, col, 'clubs')) return false;
    }
    if(position.suit === 'spades') {  // pour être actif, une antenne doit être à côté d'un panneau solaire
        if(!isAdjacentToSuit(row, col, 'diamonds')) return false;
    }
    return true;
}

function getKey(row, col) {
    return `${row}-${col}`
}
function getFood(row, col) {
    if(row < 0 || row > boardSize-1 || col < 0 || col > boardSize-1) return 0;
    return getGridElement(row, col).food;
}
function setFood(row, col, food) {
    getGridElement(row, col).food = food;
}
function getEnergy(row, col) {
    if(row < 0 || row > boardSize-1 || col < 0 || col > boardSize-1) return 0;
    return getGridElement(row, col).energy;
}
function setEnergy(row, col, energy) {
    getGridElement(row, col).energy = energy;
}

function runAdventurePhase() {
    revealCardFromDeck();
    // Alien Signal en cours
    if (alienAdventure.alienAdventureStep === 1) {
        alienAdventure.alienSignalCount ++;
        log(`Un nouveau signal alien a été détecté ! Total : ${alienAdventure.alienSignalCount}`);
    }

    if (alienAdventure.alienAdventureStep === 2) {
        // +1 alien
        alienAdventure.alienCount++;

        const target = findOneAstronautAtRandom();
        if (target) {
            alienAdventure.alienPosition = { row: target.row, col: target.col };

            // Combat
            let totalRes = target.food + target.energy;
            if (totalRes < alienAdventure.alienCount) {
                log(`Un astronaute a été submergé par ${alienAdventure.alienCount} aliens !`);
                oneAstronautDie(target);
            } else {
                let toRemove = alienAdventure.alienCount;
                if (target.food >= toRemove) {
                    target.food -= toRemove;
                } else {
                    toRemove -= target.food;
                    target.food = 0;
                    target.energy = Math.max(0, target.energy - toRemove);
                }
                log(`Un astronaute perd ${alienAdventure.alienCount} ressources. suite à l'attaque alien`);
            }
        }
    }

    if (vegetationAdventure.vegetationAdventureStep === 2) {
        moveVegetation();

        const astronautsDied = [];
        for(let i=0; i<astronauts.length; i++) {
            const astro = astronauts[i];

            // vérifier si l'astronaute est sur une case avec de la vegetation, et adjacent à une case avec de la vegetation
            const astroOnPlant = getFood(astro.row, astro.col) > 0;
            const danger = getFood(astro.row-1, astro.col) ? 1 : 0
            + getFood(astro.row+1, astro.col) ? 1 : 0
            + getFood(astro.row, astro.col-1) ? 1 : 0
            + getFood(astro.row, astro.col+1) ? 1 : 0;
            if(astroOnPlant && danger >= 2) {
                // l'astronaute meurt étouffé par les plantes
                astronautsDied.push(astro);
                logMessage("un astronaute meurt étouffé par les plantes");
            }
        }
        astronautsDie(astronautsDied);
    }

    if(sickAdventure.sickStep === 2 && !sickAdventure.pandemicLocation) {
        sickAdventure.pandemicLocation = getOneActiveLocationAtRandom('hearts');
        log("un Module habitable a été identifié comme foyer de l'épidémie. Il est placé en quarantaine. Attention aux risques de contamination.");
    }
    if(sickAdventure.sickStep > 0) {
        contaminate();
    }

    if(electricAdventure.electricStep === 2) {
        firePropagation();
    }
    // Ici on pourra ajouter les autres péripéties plus tard...
}

function findOneAstronautAtRandom() {
    if (astronauts.length > 0) {
        const targetIndex = Math.floor(Math.random() * astronauts.length);
        return astronauts[targetIndex];
    }
    return null;
}

function addFoodToCell(row, col) {
    const specialMutation = samePosition(row, col, vegetationAdventure.vegetationPosition);
    const max = specialMutation? 4 : 3;
    const amount = specialMutation ? 2 : 1;

    const food = getFood(row, col) + amount;
    setFood(row, col, Math.min(food, max));
}
function addEnergyToCell(row, col) {
    const max = 3;
    const amount = 1;

    const energy = getEnergy(row, col) + amount;
    setEnergy(row, col, Math.min(energy, max));
}

function collectResource(row, col, type) {
    let astronaut = astronauts.find(a => a.row === row && a.col === col);

    if (!astronaut) {
        log("Aucun astronaute sur cette case pour ramasser une ressource.");
        return;
    }

    const position = getGridElement(row, col);
    if (position[type] <= 0) {
        log("Plus aucune ressource à ramasser");
        return;
    }

    // cas particulier de la mutation vegetale
    const specialVegetationMutation = type === 'food' && samePosition(row, col, vegetationAdventure.vegetationPosition);
    if(specialVegetationMutation) {
        if (astronaut.energy <= 0) {
            log("L'astronaute n'a pas d'energie");
            return;
        }
        astronaut.energy --;

        if(position.food === 1) {
            // on ramasse la le dernier jeton de ravitaillement, donc on elève la mutation
            vegetationAdventure.vegetationPosition = null;
            document.querySelector('.plant-mutation')?.remove();
        }
    }

    if (astronaut.food + astronaut.energy >= astronautLimit(astronaut)) {
        log("L'astronaute a atteint sa limite de ressources.");
        return;
    }

    astronaut[type]++;
    position[type] --;
    redrawGridCell(position)
}

function astronautLimit(astro) {
    // la limite de ressource d'unastronaute vaut 5
    // ou 3 s'il est malade et que l'étape de la péripétie vaut au moins 2
    return astro.sick && sickAdventure.sickStep >= 2 ? 3 : 5
}


function discardResource(astronaut, type) {

    if (astronaut[type] <= 0) {
        log("L'astronaute n'a plus de stock à jeter");
        return;
    }

    astronaut[type]--;
    renderEverything();
}

function handleEndDragAndDrop(cell) {
    console.log(cell);
    if(!dragAndDropAction.astronaut || !dragAndDropAction.action) return; // rien à faire

    if (!cell.classList.contains("possible-target")) {
        log("destination invalide.");
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
        log("Pas d'energie.");
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
        dropCapsule(cell);
        log("Nouvel astronaute appelé sur un module habitable.");
    } else {
        const position = getGridElement(row, col);
        dropCapsule(position.dom);

        startConstruction(position, dragAndDropAction.action);

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

function construct(astro, suit) {
    if(astro.energy <= 0) {
        log("Pas d'energie.");
        return;
    }
    astro.energy --;

    const position = getGridElement(astro.row, astro.col);
    dropCapsule(position.dom);

    startConstruction(position, suit);

    renderEverything();
}

function movement(cell, astro) {

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (astro.energy <= 0) {
        log("Pas d'energie.");
        return;
    }

    astro.row = row;
    astro.col = col;
    astro.energy--;

    renderEverything();
}

function calling(cell, astro) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if(astro.energy <= 0) {
        log("Pas d'energie.");
        return;
    }
    if(isOnFire(row, col)) {
        log("impossible d'utiliser l'antenne car elle est en feu.");
        return;
    }
    astro.energy--;



}

function construction(cell) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    const astro = astronauts.find(a => a.row === row && a.col === col);
    if(!astro) {
        log("Pas d'astronaute pour construire ici");
        return;
    }
    if(astro.energy <= 0) {
        log("Pas d'energie");
        return;
    }
    astro.energy--;

    buildCard(getGridElement(row, col));
    renderEverything();
}

function pathfinder(x, y, dist, targets, start) {

    const position = getGridElement(x, y);
    if (position.type === TYPE.BUNKER) return; // interdit

    if(isFree(position)) {
        targets.add(getKey(x,y));
    }

    if(dist <= 0) return;

    if(!start) {
        if(position.type === TYPE.EMPTY || position.type === TYPE.EXPLODED || position.type === TYPE.JUNGLE) return;
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

function log(message) {
    logMessage(message);
}

function oneAstronautDie(astro) {
    astronautsDie([astro]);
}
function astronautsDie(astronautsDied) {
    astronauts = astronauts.filter(x => !astronautsDied.includes(x));

    // si un des astronautes qui est mort était malade, et qu'il n'y a pas encore de morgue
    if(astronautsDied.filter(a => a.sick).length > 0 && !sickAdventure.mortuary && sickAdventure.sickStep < 3) {
        // Choisir un module habitable au hasard
        sickAdventure.mortuary = getOneActiveLocationAtRandom('hearts');

        if(sickAdventure.mortuary) {
            log("En attendant d'en savoir d'aventage sur la maladie, un module habitable est réquisitionné comme morgue. Attention au risque de contamination.");
        }
    }
}

function getOneActiveLocationAtRandom(suit) {
    const location = Object.values(grid).filter(position => position.suit === suit && isActive(position));
    if (location.length === 0) {
        return null;
    }
    return location[Math.floor(Math.random() * location.length)];
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
function isAdjacentToSuit(row, col, suit) {;
    return isCloseToSuit(row, col, suit, 1)
}
function isCloseToSuit(row, col, suit, dist) {
    const closePositions = Object.values(grid).filter(position =>  distance(row, col, position) <= dist);
    for(let position of closePositions) {
        if(isSuitActive(position, suit)) return true;
    }
    return false;
}
function distance(row, col, position) {
    return Math.abs(position.row-row)+Math.abs(position.col-col);
}

function isSuitActive(position, suit) {
    if(!position) return false;

    if(position.type !== TYPE.BUILT) return false;
    if(isOnFire(position.row, position.col)) return false;
    return suit === position.suit;
}

function dropCapsule(targetCell) {
    const rect = targetCell.getBoundingClientRect();

    // Crée l’image
    const img = document.createElement("div");
    //img.src = "./img-moon/capsule.png"; // ton fichier
    img.className = "capsule";

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
