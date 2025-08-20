// Jeu : Une Maison sur la Lune
// Fichier principal JavaScript

const suits = ['hearts', 'clubs', 'diamonds', 'spades'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '1', 'J', 'Q', 'K'];

let deck = [];
let drawPiles = [[], [], [], []];
let astronauts = []; // Liste des astronautes avec leurs positions et ressources
let boardResources = {}; // ex: { "2-3": { food: 1, energy: 2 } }
let selectedAstronaut = null;
let selectedDiscardCard = null;
let discardPile = [];

let alienAdventure = {
    alienPosition:null,      // { row, col }
    alienSignalCount: 0,     // Nombre de signaux sur l'antenne
    alienAdventureStep: 0,    // 0 = pas commencé, 1 = phase Signal Alien active, 2 = invasion
    alienCount: 0,    // Nombre total d’aliens sur le plateau
    bunkers: []         // positions des bases aliens où on ne peut pas se rendre
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
    morgLocation: null,
    pandemicLocation: null,
}


/*
note : à l'interieur d'une case je peux avoir
les resources
l'astronaute
l'antenne

les aliens
le signal alien

la mutation genetique

le feu
le brasier

la morgue
le foyen épidémique
l'hopital

 */


function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function initializeDrawPiles() {
    const pileDefinitions = [
        ['2', '3', '4'],
        ['5', '6', 'J'],
        ['7', '8', 'Q'],
        ['9', '1', 'K']
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
    createDeck();
    initializeDrawPiles();
    drawInitialLayout();
    placeInitialAstronaut();
    setupDragAndDrop();

    // première phase de resource (début du tour 1)
    runResourcePhase();

}

function revealCardFromDeck() {
    if(deck.length === 0) {
        // todo  : victoire
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
        document.querySelector('.alien-signal')?.remove();
        alienAdventure.alienAdventureStep = 1.5;

        log(`Le signal a été intercepté`);
    }

    // attaquer un alien
    if(alienAdventure.alienAdventureStep === 2) {
        if (alienAdventure.alienCount <= 1) {
            log("Impossible de retirer le dernier alien.");
            return;
        }

        alienAdventure.alienCount--;
        renderAliensIcon();
        renderAstronauts();
    }


}

function discardFromDeck(number) {
    for(let i= 0; i<number; i++) {
        discardPile.push(revealCardFromDeck());
    }
}

function startVegetationAdventure() {
    // Récupère toutes les positions de serres déjà construites
    const greenHouses = Array.from(document.querySelectorAll('.card[data-suit="clubs"]'))
        .map(cell => ({
            row: parseInt(cell.dataset.row),
            col: parseInt(cell.dataset.col)
        }));

    if (greenHouses.length === 0) {
        log("Aucune serre construite pour placer la mutation végétale.");
        return;
    }

    // Choisir une serre au hasard
    vegetationAdventure.vegetationPosition = greenHouses[Math.floor(Math.random() * greenHouses.length)];
    vegetationAdventure.vegetationAdventureStep = 1;

    // Ajouter une icône 🥬 sur la cellule
    const cell = document.querySelector(`.cell[data-row="${vegetationAdventure.vegetationPosition.row}"][data-col="${vegetationAdventure.vegetationPosition.col}"]`);
    if (cell) {
        drawVegetationInCell(cell);
    }

    log(`Une mutation génétique est apparue sur la serre ${vegetationAdventure.vegetationPosition.row},${vegetationAdventure.vegetationPosition.col}.`);
}

function startLuxuriance() {
    vegetationAdventure.vegetationAdventureStep = 2;

    moveVegetation();

    renderResources();
    renderAstronauts();
}

function triggerRoots() {
    vegetationAdventure.vegetationAdventureStep = 3;

    // remplacer toutes les cartes où il y a de la végétation, par des serres
    for(let key in boardResources) {
        const row = key.split("-")[0];
        const col = key.split('-')[1];
        if(getFood(row, col) > 0) {
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);

            const alien = cell.classList.contains('alien') || (alienAdventure.alienPosition && alienAdventure.alienPosition.col === col && alienAdventure.alienPosition.row === row);

            redrawCell(row, col, { value: '0', suit: 'clubs'}, false, alien, true);
        }
    }



}

function startShortCut() {
    // Récupère toutes les positions de serres déjà construites
    const solarPanels = Array.from(document.querySelectorAll('.card[data-suit="diamonds"]')).map(cell => ({
            row: parseInt(cell.dataset.row),
            col: parseInt(cell.dataset.col)
        }));

    if (solarPanels.length === 0) {
        log("Aucune panneau solaire pour placer le court circuit.");
        return;
    }

    // Choisir un panneau solaire au hasard
    electricAdventure.shortcutPosition = solarPanels[Math.floor(Math.random() * solarPanels.length)];
    electricAdventure.firePositions.push({...electricAdventure.shortcutPosition});

    electricAdventure.electricStep = 1;

    // Ajouter une icône 🥬 sur la cellule
    const cell = document.querySelector(`.cell[data-row="${electricAdventure.shortcutPosition.row}"][data-col="${electricAdventure.shortcutPosition.col}"]`);
    if (cell) {
        drawFireInCell(cell);
    }

    const row =electricAdventure.firePositions.row;
    const col =electricAdventure.firePositions.col;
    log(`un court circuit risque de provouer d'importants dégats sur le panneau solaire: ${row},${col}.`);
}

function startFire() {
    electricAdventure.electricStep = 2;

    // cas où l'incendie avait été éteint lors du court circuit
    if(electricAdventure.smokePosition) {
        // alors on remet simplement un "feu" là où il y a eu le court circuit
        electricAdventure.firePositions.push(electricAdventure.smokePosition);
        electricAdventure.smokePosition = null;
    }
    // cas où l'incendie n'a pas été maitrisé
    else {
        firePropagation();
    }

    log("lincendie devient incontrolable");
    drawFires();

}

function firePropagation() {

    const newFire = [];

    // etape 1 : traiter les cases déjà en feu
    for (let i in electricAdventure.firePositions) {
        const firePosition = electricAdventure.firePositions[i];
        const row = firePosition.row;
        const col = firePosition.col;

        cleanPosition(row, col, false);

        if(row > 0 && !isOnFire(row-1, col)) newFire.push(row-1, col);
        if(row < boardSize-1 && !isOnFire(row+1, col)) newFire.push(row+1, col);
        if(col > 0 && !isOnFire(row, col-1)) newFire.push(row, col-1);
        if(col < boardSize-1 && !isOnFire(row, col+1)) newFire.push(row, col+1);
    }

    // etape 2 : mettre en feu les cases adjacentes
    for (let i in newFire) {
        if(!isOnFire(newFire[i].row, newFire[i].col)) electricAdventure.firePositions.push(newFire);
    }

    drawFires();
}

function cleanPosition(row, col, explosition) {
    const astro = astronauts.find(e => e.row === row && e.col === col);
    if (astro) {
        log("un astronaute meurt dans l'incendie");
        oneAstronautDie(astro);
    }

    setEnergy(row, col, 0);
    setFood(row, col, 0);

    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        let card = null;
        if(!explosition) {
            card = {value: cell.dataset.value, suit: cell.dataset.suit};
        }
        redrawCell(row, col, card, true, cell.classList.contains('alien'), cell.classList.contains('jungle'));
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
}

function startDisease() {
    log("Un astronaute est tombé malade. Pour l'instant les symptômes ne sont pas graves : quelques bouton et un peu de fièvre. Cependant, c'est peut-être contagieux.");
    const target = findOneAstronautAtRandom();
    if(target) {
        target.sick = true;
        renderAstronauts();
        contaminate(); // vérifier si le premier astronaute déclenche déjà la contamination
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
}

function contaminate() {
    if(sickAdventure.sickStep < 1) return; // véirfier que l'aventure a ommencé

    let newSick = false;
    // propager la contamination
    for(let i in astronauts) {
        const astro = astronauts[i];
        if(!astro.sick && isCloseToContamination(astro.row, astro.col)) {
            astro.sick = true;
            newSick = true;
        }
    }

    // boucle recursive : tant qu'il y a des nouveaux malades, on continue
    if(newSick) {
        renderAstronauts();
        contaminate();
    }
}

function isCloseToContamination(row, col) {
    if(sickAdventure.sickStep === 0) return false;

    if(sickAdventure.morgLocation) {
        if(Math.abs(sickAdventure.morgLocation.row-row) <= 1 && Math.abs(sickAdventure.morgLocation.col-col) <= 1) {
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


/*
note : à l'interieur d'une case je peux avoir
les resources x
l'astronaute x
l'antenne x

les aliens x
le signal alien x

la mutation genetique

le feu
le brasier

la morgue
le foyen épidémique
l'hopital

 */
function redrawCell(row, col, card, construction, alien, vegetation) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cell.className = 'cell';

    if(!card) {
        return;
    }

    cell.innerHTML = `${card.value} ${getSuitSymbol(card.suit)}`;
    cell.dataset.card = `${card.value} ${card.suit}`;
    cell.dataset.value = card.value;
    cell.dataset.suit = card.suit;
    cell.classList.add('card');

    // afficher les resources
    drawResourcesInCell(row, col, cell);

    // rendu de l'astronaute
    const astroIndex = astronauts.findIndex(a => a.row === row && a.col === col);
    let astro = null;
    if (astroIndex >= 0) {
        drawAstronautInCell(astronauts[astroIndex], cell, astroIndex);
    }

    // si la case n'est pas encore construite
    if(construction) {

        drawConstructionInCell(cell);
    }

    // ajout d'une icone d'appel, draggable, en cas d'antenne de communication
    if (!construction && card.suit === 'spades') {
        drawAntennaInCell(cell);
    }

    // gestion des aliens sur la case
    if(alien && alienAdventure.alienAdventureStep > 0) {
        drawAlienInCell(cell);
    }

    if(vegetation) {
        drawVegetationInCell(cell);
    }

    drawFireOrSmokeInCell(row, col, cell);

    drawPandemicInCell(row, col, cell);
}

function drawFireOrSmokeInCell(row, col, cell) {
    if(electricAdventure.electricStep === 1.5 && electricAdventure.smokePosition
        && electricAdventure.smokePosition.row === row && electricAdventure.smokePosition.col === col) {
        drawSmokeInCell(cell);
    }
    if(electricAdventure.firePositions.filter( loc => loc.row === row && loc.col === col).length > 0) {
        if(electricAdventure.electricStep === 2 && electricAdventure.firePositions.length === 1) {
            drawSmokeInCell(cell);
        } else {
            drawFireInCell(cell);
        }
    }
}

function drawPandemicInCell(row, col, cell) {
    if(sickAdventure.morgLocation
        && sickAdventure.morgLocation.row === row && sickAdventure.morgLocation.col === col) {
        drawMorgInCell(cell);
    }
    else if(sickAdventure.pandemicLocation
        && sickAdventure.pandemicLocation.row === row && sickAdventure.pandemicLocation.col === col) {
        drawPandemicInCell(cell);
    }
    else if(sickAdventure.sickStep === 3 && cell.dataset.suit === 'hearts') {
        drawHospitalInCell(cell);
    }
}

function drawResourcesInCell(row, col, cell) {
    const resources = boardResources[getKey(row, col)];
    if (resources.food > 0) {
        const food = document.createElement('div');
        food.className = 'resource-token';
        food.innerText = `🥬${resources.food}`;
        food.addEventListener('click', () => collectResource(row, col, 'food'));
        cell.appendChild(food);
    }
    if (resources.energy > 0) {
        const energy = document.createElement('div');
        energy.className = 'resource-token';
        energy.innerText = `🔋${resources.energy}`;
        energy.addEventListener('click', () => collectResource(row, col, 'energy'));
        cell.appendChild(energy);
    }
}

function drawAstronautInCell(astro, cell, i) {
    cell.classList.add('occupied');

    const token = document.createElement('div');
    token.className = 'astronaut';
    token.innerText = '👨‍🚀';
    token.draggable = true;
    token.dataset.index = i;
    token.addEventListener('dragstart', (e) => {
        selectedAstronaut = i;
        const targets = new Set();
        const dist = astro.sick && sickAdventure.sickStep >= 3 ? 1 : 3; // en cas de maladie et de péripétie avancée, l'astronaute ne peut se déplacer ue de 1 case, sinon par défaut il peut se déplacer de 3 cases
        pathfinder(astro.row, astro.col, dist, targets);

        targets.forEach(target => {
            const x = target.split('-')[0];
            const y = target.split('-')[1];
            document.querySelector(`.cell[data-row="${x}"][data-col="${y}"]`).classList.add('possible-target');
        })
    });
    cell.appendChild(token);

    if (astro.food > 0) {
        const food = document.createElement('div');
        food.className = 'resource-token';
        food.innerText = `🥬${astro.food}`;
        food.addEventListener('click', () => discardResource(astro, 'food'));
        token.appendChild(food);
    }
    if (astro.energy > 0) {
        const energy = document.createElement('div');
        energy.className = 'resource-token';
        energy.innerText = `🔋${astro.energy}`;
        energy.addEventListener('click', () => discardResource(astro, 'energy'));
        token.appendChild(energy);
    }
    if(astro.sick) {
        const sick = document.createElement('div');
        sick.className = 'sick-token';
        sick.innerText = `🦠`;
        token.appendChild(sick);
    }
}

function drawConstructionInCell(cell) {
    cell.classList.add('construction');

    const icon = document.createElement('div');
    icon.className = 'build-icon';
    icon.innerText = '🔧';
    icon.title = 'Construire ici';
    icon.addEventListener('click', () => construction(cell));
    cell.appendChild(icon);
}

function drawAntennaInCell(cell) {
    const icon = document.createElement('div');
    icon.className = 'call-icon';
    icon.innerText = '📡';
    icon.setAttribute('draggable', 'true');
    icon.addEventListener('dragstart', e => {
        e.dataTransfer.setData('text/plain', 'call');

        const astro = cell.querySelector(`.astronaut`);
        if(astro) {
            selectedAstronaut = astro.dataset.index;

            // les modules habitables sont des cibles potentielles (si libre et actif)
            document.querySelectorAll('.card[data-suit="hearts"]').forEach(el => {
                if( isFree(parseInt(el.dataset.row), parseInt(el.dataset.col)) && isActive(el.dataset.row, el.dataset.col)) {
                    el.classList.add('possible-target' );
                }

            });
        }

    });
    cell.appendChild(icon);
}

function drawAlienInCell(cell) {
    // signal alien
    if (alienAdventure.alienAdventureStep === 1) {
        const icon = document.createElement('div');
        icon.className = 'alien-signal';
        icon.innerText = `🛸 ${alienAdventure.alienSignalCount}`;
        icon.title = `Signal alien : ${alienAdventure.alienSignalCount}`;
        cell.appendChild(icon);
        icon.addEventListener('click', () => attackAlien());
    } else if (alienAdventure.alienAdventureStep === 2) {
        const icon = document.createElement('div');
        icon.className = 'alien-icon';
        icon.innerText = ((alienAdventure.alienCount > 1) ? '👽' : '🕳️') + alienAdventure.alienCount;
        cell.appendChild(icon);

        icon.addEventListener('click', () => attackAlien());
    } else if (alienAdventure.alienAdventureStep === 3) {
        const icon = document.createElement('div');
        icon.className = 'alien-icon';
        icon.innerText = '👽';
        cell.appendChild(icon);

        // Marquer la case comme interdite
        cell.classList.add('alien');
    }
}

function drawVegetationInCell(cell) {
    if(vegetationAdventure.vegetationAdventureStep === 1 || vegetationAdventure.vegetationAdventureStep === 2) {
        const icon = document.createElement('div');
        icon.className = 'plant-mutation';
        icon.innerText = `🌱`;
        icon.title = `Mutation Végétale`;
        cell.appendChild(icon);
    }
    if(vegetationAdventure.vegetationAdventureStep === 3) {
        cell.classList.add('jungle');
        const icon = document.createElement('div');
        icon.className = 'jungle-icon';
        icon.innerText = `🌴`;
        icon.title = `Jungle`;
        cell.appendChild(icon);
    }
}

function drawFireInCell(cell) {
    const icon = document.createElement('div');
    icon.className = 'fire-icon';
    icon.innerText = `🔥`;
    icon.title = `fire`;
    cell.appendChild(icon);
    icon.addEventListener('click', () => extinguishFire(cell));
}

function extinguishFire(cell) {
    const astro = cell.querySelector(`.astronaut`);
    if(astro) {
        const astronaut = astronauts[parseInt(astro.dataset.index)];
        if(astronaut.energy <= 0) {
          log("pas d'energie.")
        } else if(electricAdventure.electricStep === 2 && electricAdventure.firePositions.length === 1) {
            // lors de la phase 2, on ne peut pas enlever le dernier incendie
            log("impossible d'eteindre la dernière case avec un incendie");
        } else {
            astronaut.energy --; // on enlève un point d'energie à l'astronaute

            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if(electricAdventure.electricStep === 1) {
                electricAdventure.smokePosition = {row: row, col: col};
                electricAdventure.firePositions = [];
                electricAdventure.electricStep = 1.5;
            } else {
                electricAdventure.firePositions = electricAdventure.firePositions.filter(value => value.row !== row || value.col !== col); // on garde les autres feux uniquement
            }

            drawFires();
        }


    } else {
        log("pas d'astraunaute pour eteindre le feu");
    }
}

function drawFires() {
    document.querySelectorAll('.fire-icon').forEach(e => e.remove());
    document.querySelectorAll('.smoke-icon').forEach(e => e.remove());

    if(electricAdventure.electricStep === 1.5) {
        const smokePosition = electricAdventure.smokePosition;
        const cell = document.querySelector(`.cell[data-row="${smokePosition.row}"][data-col="${smokePosition.col}"]`);
        if(cell) {
            drawSmokeInCell(cell);
        }
    }
    for(let i in electricAdventure.firePositions) {
        const firePosition = electricAdventure.firePositions[i];
        const cell = document.querySelector(`.cell[data-row="${firePosition.row}"][data-col="${firePosition.col}"]`);
        if(cell) {
            if(electricAdventure.electricStep === 2 && electricAdventure.firePositions.length === 1) {
                drawSmokeInCell(cell);
            } else {
                drawFireInCell(cell);
            }
        }

    }
}

function drawSmokeInCell(cell) {
    const icon = document.createElement('div');
    icon.className = 'smoke-icon';
    icon.innerText = `☁️`;
    icon.title = `smoke`;
    cell.appendChild(icon);
}
function drawMorgInCell(cell) {
    const icon = document.createElement('div');
    icon.className = 'morg-icon';
    icon.innerText = `⚰️`;
    icon.title = `Morgue`;
    cell.appendChild(icon);
}
function drawPandemicInCell(cell) {
    const icon = document.createElement('div');
    icon.className = 'biohazard-icon';
    icon.innerText = `☣️️`;
    icon.title = `Foyer de l'épidémie`;
    cell.appendChild(icon);
}
function drawHospitalInCell(cell) {
    const icon = document.createElement('div');
    icon.className = 'hospital-icon';
    icon.innerText = `💉️`;
    icon.title = `Infirmerie`;
    cell.appendChild(icon);
}

String.prototype.replaceAt = function(index, replacement) {
    return this.substring(0, index) + replacement + this.substring(index + replacement.length);
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
    // Récupère toutes les positions d'antennes déjà construites
    const antennas = Array.from(document.querySelectorAll('.card[data-suit="spades"]'))
        .map(cell => ({
            row: parseInt(cell.dataset.row),
            col: parseInt(cell.dataset.col)
        }));

    if (antennas.length === 0) {
        log("Aucune antenne construite pour placer le signal alien.");
        return;
    }

    // Choisir une antenne au hasard
    alienAdventure.alienPosition = antennas[Math.floor(Math.random() * antennas.length)];
    alienAdventure.alienSignalCount = 1;
    alienAdventure.alienAdventureStep = 1;

    // Ajouter une icône 🛸 sur la cellule
    const cell = document.querySelector(`.cell[data-row="${alienAdventure.alienPosition.row}"][data-col="${alienAdventure.alienPosition.col}"]`);
    if (cell) {
        drawAlienInCell(cell);

    }

    log(`Signal alien détecté sur l'antenne en ${alienAdventure.alienPosition.row},${alienAdventure.alienPosition.col}.`);
}
function revealInvasionAlien() {
    alienAdventure.alienAdventureStep = 2;
    alienAdventure.alienCount = alienAdventure.alienSignalCount || 1;
    renderAliensIcon();
    log(`Invasion alien ! ${alienAdventure.alienCount} aliens débarquent.`);
}
function triggerEThome() {
    const { alienCount } = alienAdventure;
    if (!alienCount || alienCount <= 0) {
        log("Aucun alien à répartir.");
        return;
    }

    // Retirer l’icône alien existante
    if (alienAdventure.alienPosition) {
        const oldCell = document.querySelector(`.cell[data-row="${alienAdventure.alienPosition.row}"][data-col="${alienAdventure.alienPosition.col}"]`);
        oldCell?.querySelector('.alien-icon')?.remove();
    }

    // Mettre à jour l’état
    alienAdventure.alienAdventureStep = 3;
    alienAdventure.alienCount = 0;
    alienAdventure.alienPosition = null; // Plus de position unique

    // Choisir X antennes au hasard
    const antennas = [...document.querySelectorAll('.cell[data-suit="spades"]')];
    shuffle(antennas); // Réutiliser ta fonction shuffle

    const chosenAntennas = antennas.slice(0, alienCount);
    chosenAntennas.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        alienAdventure.bunkers.push({row: row, col: col});

        // Si astronaute présent → il meurt
        const astroIndex = astronauts.findIndex(a => a.row === row && a.col === col);
        if (astroIndex >= 0) {
            log(`Un astronaute est tué par un alien sur ${row},${col}`);
            astronauts.splice(astroIndex, 1);
        }

        // Mettre un icône alien
        drawAlienInCell(cell);
    });
}

function drawInitialLayout() {
    const board = document.getElementById('board');
    board.innerHTML = '';

    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.innerHTML = '';
            board.appendChild(cell);
        }
    }

    // Positionnement des 4 as au centre (carré 2x2)
    placeCard(2, 2, {suit: 'hearts', value: 'A'});
    placeCard(2, 3, {suit: 'clubs', value: 'A'});
    placeCard(3, 2, {suit: 'diamonds', value: 'A'});
    placeCard(3, 3, {suit: 'spades', value: 'A'});

    // pile de defausse
    const discard = document.getElementById('discard');
    discard.innerHTML = '';

    for (let row = 0; row < discardSize; row++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.innerHTML = '';
        cell.dataset.index = ''+row;
        discard.appendChild(cell);

        cell.setAttribute('draggable', 'true');
        cell.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', 'recycle');
            selectedDiscardCard = cell;

            document.querySelectorAll('.card.construction.occupied').forEach(el => {
                el.classList.add('possible-target' )
            });
        });
    }
}
function prepareCard(cell, card) {
    cell.innerHTML = `${card.value} ${getSuitSymbol(card.suit)}`;
    cell.dataset.card = `${card.value} ${card.suit}`;
    cell.classList.add('card');

    drawConstructionInCell(cell);
}

function buildCard(cell) {
    const card = {value : cell.dataset.card.split(' ')[0], suit : cell.dataset.card.split(' ')[1]};
    cell.classList.remove('construction');

    cell.classList.add('card');
    cell.dataset.suit = card.suit;
    cell.dataset.value = card.value;

    cell.querySelectorAll('.build-icon').forEach(el => el.remove());

    // ajout d'une icone d'appel, draggable, en cas d'antenne de communication
    if (card.suit === 'spades') {
        drawAntennaInCell(cell);
    }
}

function placeCard(row, col, card) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        prepareCard(cell, card);
        buildCard(cell);
    }
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
    astronauts.push({ row, col, energy: 0, food: 0 });
    renderAstronauts();
    logMessage("Astronaute initial placé sur l'as de cœur.");
}

function renderAstronauts() {
    // Supprimer les anciens
    document.querySelectorAll('.astronaut').forEach(el => el.remove());
    document.querySelectorAll('.cell').forEach(el => el.classList.remove('occupied'));


    for (let i = 0; i < astronauts.length; i++) {
        const astro = astronauts[i];
        const cell = document.querySelector(`.cell[data-row="${astro.row}"][data-col="${astro.col}"]`);
        if (cell) {
            drawAstronautInCell(astro, cell, i);
        }
    }
}

function runResourcePhase() {
    // Ajouter ressources aux cartes
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
            const suit = cell?.dataset.suit;
            const value = cell?.dataset.value;

            if (!suit) continue;

            if(isOnFire(row, col)) continue; // en cas d'incendie, pas de production

            // Ajouter un jeton ravitaillement si serre (clubs ♣)
            if (suit === 'clubs') {
                addFoodToCell(row, col);
            }

            // Ajouter un jeton énergie si panneau solaire (diamonds ♦)
            if (suit === 'diamonds') {
                addEnergyToCell(row, col);
            }
        }
    }

    renderResources();

    const astronautsDied = [];
    for (let astro of astronauts) {
        let cell = document.querySelector(`.cell[data-row="${astro.row}"][data-col="${astro.col}"]`);
        const suit = cell?.dataset.suit;
        const value = cell?.dataset.value;
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Vérifie si le module habitable est actif
        let onActiveHabitat = suit === 'hearts' && isActive(row, col);

        let maxEnergy = astronautLimit(astro) - astro.food;
        if (onActiveHabitat) {
            astro.energy = Math.min(astro.energy + 3, maxEnergy);

            // soigner la maladie
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
    renderAstronauts();

}

function isOnFire(row, col) {
    return electricAdventure.firePositions.filter(el => el.row === row && el.col === col).length > 0
}
function isActive(row, col) {
    if(isOnFire(row, col)) return false;
    if(sickAdventure.morgLocation && sickAdventure.morgLocation.row === row && sickAdventure.morgLocation.col === col) return false;
    if(sickAdventure.pandemicLocation && sickAdventure.pandemicLocation.row === row && sickAdventure.pandemicLocation.col === col) return false;
    return true;
}

function getCardKey(card) {
    return getKey(card.row, card.col);
}
function getKey(row, col) {
    return `${row}-${col}`
}
function getFood(row, col) {
    if(!boardResources[getKey(row, col)]) return 0;
    if(!boardResources[getKey(row, col)]['food']) return 0;
    return boardResources[getKey(row, col)]['food']
}
function setFood(row, col, food) {
    if(!boardResources[getKey(row, col)]) {
        boardResources[getKey(row, col)] = {food: 0, energy: 0};
    }
    boardResources[getKey(row, col)]['food'] = food;
}
function getEnergy(row, col) {
    if(!boardResources[getKey(row, col)]) return 0;
    if(!boardResources[getKey(row, col)]['energy']) return 0;
    return boardResources[getKey(row, col)]['energy']
}
function setEnergy(row, col, energy) {
    if(!boardResources[getKey(row, col)]) {
        boardResources[getKey(row, col)] = {food: 0, energy: 0};
    }
    boardResources[getKey(row, col)]['energy'] = energy;
}

function runAdventurePhase() {
    // Alien Signal en cours
    if (alienAdventure.alienAdventureStep === 1 && alienAdventure.alienPosition) {

        // Mettre à jour l'affichage
        const cell = document.querySelector(`.cell[data-row="${alienAdventure.alienPosition.row}"][data-col="${alienAdventure.alienPosition.col}"]`);
        if(cell) {
            drawAlienInCell(cell)
        }

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
            renderAstronauts();
            renderAliensIcon();
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

        renderResources();
        renderAstronauts();
    }

    if(sickAdventure.sickStep > 1 && !sickAdventure.pandemicLocation) {
        sickAdventure.pandemicLocation = getOneActiveHabitationAtRandom();
        log("un Module habitable a été identifié comme foyer de l'épidémie. Il est placé en quarantaine. Attention aux risques de contamination.");
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

function runDiscardPhase() {
    let pileIndex = 1;
    if(deck.length <= 36) pileIndex = 2;
    if(deck.length <= 24) pileIndex = 3;
    if(deck.length <= 12) pileIndex = 4;

    discardFromDeck(pileIndex);
    renderDiscardPile();
}

function addFoodToCell(row, col) {
    const specialMutation =
        vegetationAdventure.vegetationPosition
        && vegetationAdventure.vegetationPosition.row === row
        && vegetationAdventure.vegetationPosition.col === col;
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

function renderDiscardPile() {
    const lastCards = discardPile.slice(-1*discardSize).reverse(); // dernières cartes, plus récentes en haut

    for (let i = 0; i < discardSize; i++) {

        const cell = document.querySelector(`#discard .cell[data-index="${i}"]`)

        if(cell) {
            cell.innerHTML = '';
            const card = lastCards[i];
            cell.dataset.card = null;

            if(card) {
                cell.innerHTML = `${card.value} ${getSuitSymbol(card.suit)}`;
                cell.dataset.card = `${card.value} ${card.suit}`;
            }
        }
    }
}


function renderResources() {
    // Supprimer les anciens affichages
    document.querySelectorAll('.resource-token').forEach(e => e.remove());

    for (let key in boardResources) {
        const [row, col] = key.split('-').map(Number);
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (!cell) continue;

        drawResourcesInCell(row, col, cell);
    }
}

function collectResource(row, col, type) {
    let astronaut = astronauts.find(a => a.row === row && a.col === col);

    if (!astronaut) {
        log("Aucun astronaute sur cette case pour ramasser une ressource.");
        return;
    }

    const key = getKey(row, col);
    if (boardResources[key][type] <= 0) {
        log("Plus aucune ressource à ramasser");
        return;
    }

    // cas particulier de la mutation vegetale
    const specialVegetationMutation = type === 'food'
        && vegetationAdventure.vegetationPosition
        && vegetationAdventure.vegetationPosition.row === row
        && vegetationAdventure.vegetationPosition.col === col;
    if(specialVegetationMutation) {
        if (astronaut.energy <= 0) {
            log("L'astronaute n'a pas d'energie");
            return;
        }
        astronaut.energy --;

        if(boardResources[key][type] === 1) {
            // on ramasse la le dernier jeton de ravitallement, donc on elève la mutation
            vegetationAdventure.vegetationPosition = null;
            document.querySelector('.plant-mutation')?.remove();
        }
    }

    if (astronaut.food + astronaut.energy >= astronautLimit(astronaut)) {
        log("L'astronaute a atteint sa limite de ressources.");
        return;
    }

    astronaut[type]++;
    boardResources[key][type] --;
    renderResources();
    renderAstronauts();
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
    renderResources();
    renderAstronauts();
}


function setupDragAndDrop() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('dragover', (e) => e.preventDefault());
        cell.addEventListener('drop', (e) => {
            const data = e.dataTransfer.getData('text/plain');

            if (data === 'recycle' && selectedDiscardCard) {
                const astronaut = cell.querySelector('.astronaut');
                if (astronaut) {
                    selectedAstronaut = parseInt(astronaut.dataset.index);
                }
            }

            if (selectedAstronaut === null) return;

            const astro = astronauts[selectedAstronaut];
            selectedAstronaut = null;


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


            if (data === 'call') {
                calling(cell, astro);
            } else if(data === 'recycle') {
                recycle(cell, astro, selectedDiscardCard);
            }  else {
                movement(cell, astro);
            }

        });
    });
}

function recycle(cell, astro, selectedDiscardCard) {
    if(astro.energy <= 0) {
        log("Pas d'energie.");
        return;
    }
    astro.energy --;

    const cardToDiscard = cell.dataset.card;
    const cardToInstall = selectedDiscardCard.dataset.card;

    setCard(selectedDiscardCard, cardToDiscard);
    setCard(cell, cardToInstall);

    // remettre l'icone de construction
    const icon = document.createElement('div');
    icon.className = 'build-icon';
    icon.innerText = '🔧';
    icon.title = 'Construire ici';
    icon.addEventListener('click', () => construction(cell));
    cell.appendChild(icon);

    renderAstronauts();
}

function setCard(cell, data) {
    const card = {value : data.split(' ')[0], suit : data.split(' ')[1]};
    cell.dataset.card = data;
    cell.innerHTML = `${card.value} ${getSuitSymbol(card.suit)}`;
}

function movement(cell, astro) {

    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if (astro.energy <= 0) {
        log("Pas d'energie.");
        return;
    }

    const hasCard = cell.classList.contains('card');

    let adventure = false;

    if (!hasCard) {
        log("Le mouvement s'arrête sur une case vide.");
        let card = revealCardFromDeck();
        if (card == null) return; // c'est la fin de la partie
        adventure = ['J', 'Q', 'K'].includes(card.value);
        if (!adventure) {
            prepareCard(cell, card);
        }

    }
    // effectuer le mouvement
    if (!adventure) {
        astro.row = row;
        astro.col = col;
        astro.energy--;

        renderAstronauts();

        contaminate();
    }
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

    astronauts.push({ row, col, energy: 0, food: 0 });
    renderAstronauts();
    log("Nouvel astronaute appelé sur un module habitable.");

    contaminate();

}

function renderAliensIcon() {
    if (!alienAdventure.alienPosition) return;
    const cell = document.querySelector(`.cell[data-row="${alienAdventure.alienPosition.row}"][data-col="${alienAdventure.alienPosition.col}"]`);
    if (!cell) return;
    document.querySelectorAll('.alien-icon').forEach(el => el.remove());

    const icon = document.createElement('div');
    icon.className = 'alien-icon';
    icon.innerText = ((alienAdventure.alienCount > 1) ? '👽' : '🕳️') + alienAdventure.alienCount;
    cell.appendChild(icon);

    icon.addEventListener('click', () => attackAlien());
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

    buildCard(cell);
    renderAstronauts();
}

function pathfinder(x, y, dist, targets) {

    const cell = document.querySelector(`.cell[data-row="${x}"][data-col="${y}"]`)
    if (cell.classList.contains('alien')) return; // interdit

    if(isFree(x,y)) {
        targets.add(getKey(x,y));
    }

    if(dist <= 0) return;

    const hasCard = cell.classList.contains('card');
    const isJungle = cell.classList.contains('jungle');
    if(!hasCard || isJungle) return;

    if(x > 0) pathfinder(x-1, y, dist-1, targets);
    if(y < boardSize-1) pathfinder(x, y+1, dist-1, targets);
    if(x < boardSize-1) pathfinder(x+1, y, dist-1, targets);
    if(y > 0) pathfinder(x, y-1, dist-1, targets);

}

function isFree(row, col) {
    // pour l'instant, on verifie s'il y a un astronaute dessus
    return !astronauts.find(a => a.row === row && a.col === col)
}

function log(message) {
    logMessage(message);
}

function oneAstronautDie(astro) {
    astronautsDie([astro]);
}
function astronautsDie(astronautsDied) {
    astronauts.filter(x => !astronautsDied.includes(x));

    // si un des astronautes qui est mort était malade, et qu'il n'y a pas encore de morgue
    if(astronautsDied.filter(a => a.sick).length > 0 && !sickAdventure.morgLocation) {
        // Choisir un module habitable au hasard
        sickAdventure.morgLocation = getOneActiveHabitationAtRandom();

        if(sickAdventure.morgLocation) {
            log("En attendant d'en savoir d'aventage sur la maladie, un module habitable est réquisitionné comme morgue. Attention au risque de contamination.");
            const cell = document.querySelector(`.cell[data-row="${sickAdventure.morgLocation.row}"][data-col="${sickAdventure.morgLocation.col}"]`);
            drawMorgInCell(cell);
        }
    }
}

function getOneActiveHabitationAtRandom() {
    const habitations = Array.from(document.querySelectorAll('.card[data-suit="hearts"]'))
        .map(cell => ({
            row: parseInt(cell.dataset.row),
            col: parseInt(cell.dataset.col)
        }))
        .filter(loc => isActive(loc.row, loc.col));

    if (habitations.length === 0) {
        return null;
    }
    return habitations[Math.floor(Math.random() * habitations.length)];
}

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});
