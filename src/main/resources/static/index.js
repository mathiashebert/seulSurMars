// Jeu : Une Maison sur la Lune
// Fichier principal JavaScript

const suits = ['hearts', 'clubs', 'diamonds', 'spades'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

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
    alienCount: 0    // Nombre total d’aliens sur le plateau
}

let vegetationAdventure = {
    vegetationPosition:null,      // { row, col }
    vegetationAdventureStep: 0,
}


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
        ['9', '10', 'K']
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

        // treffles : l'aventure des aliens
        if(card.value === 'J' && card.suit === 'spades') { // signal alien
            startAlienSignalAdventure();
        }
        if(card.value === 'Q' && card.suit === 'spades') { // offensive alien
            revealInvasionAlien();
        }
        if(card.value === 'K' && card.suit === 'spades') { // base alien
            triggerEThome();
        }

        if(card.value === 'J' && card.suit === 'clubs') {
            startVegetationAdventure();
        }

        // todo peripetie
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
        log(`Un alien éliminé. Il en reste ${alienAdventure.alienCount}.`);
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

    // Ajouter une icône 🛸 sur la cellule // todo changer l'icone
    const cell = document.querySelector(`.cell[data-row="${vegetationAdventure.vegetationPosition.row}"][data-col="${vegetationAdventure.vegetationPosition.col}"]`);
    if (cell) {
        const icon = document.createElement('div');
        icon.className = 'plant-mutation';
        icon.innerText = `🥬`; // todo changer l'icone
        icon.title = `Mutation Végétale`;
        cell.appendChild(icon);
    }

    log(`Une mutation génétique est apparue sur la serre ${vegetationAdventure.vegetationPosition.row},${vegetationAdventure.vegetationPosition.col}.`);
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
        const icon = document.createElement('div');
        icon.className = 'alien-signal';
        icon.innerText = `🛸 ${alienAdventure.alienSignalCount}`;
        icon.title = `Signal alien : ${alienAdventure.alienSignalCount}`;
        cell.appendChild(icon);
        icon.addEventListener('click', () => attackAlien());

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

    // Choisir X antennes au hasard
    const antennas = [...document.querySelectorAll('.cell[data-suit="spades"]')];
    shuffle(antennas); // Réutiliser ta fonction shuffle

    const chosenAntennas = antennas.slice(0, alienCount);
    chosenAntennas.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        // Si astronaute présent → il meurt
        const astroIndex = astronauts.findIndex(a => a.row === row && a.col === col);
        if (astroIndex >= 0) {
            log(`Un astronaute est tué par un alien sur ${row},${col}`);
            astronauts.splice(astroIndex, 1);
        }

        // Mettre un icône alien
        const icon = document.createElement('div');
        icon.className = 'alien-icon';
        icon.innerText = '👽';
        cell.appendChild(icon);

        // Marquer la case comme interdite
        cell.classList.add('alien');
    });

    // Mettre à jour l’état
    alienAdventure.alienAdventureStep = 3;
    alienAdventure.alienCount = 0;
    alienAdventure.alienPosition = null; // Plus de position unique
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
    cell.classList.add('construction');

    const icon = document.createElement('div');
    icon.className = 'build-icon';
    icon.innerText = '🔧';
    icon.title = 'Construire ici';
    icon.addEventListener('click', () => construction(cell));
    cell.appendChild(icon);
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
        const icon = document.createElement('div');
        icon.className = 'call-icon';
        icon.innerText = '📡';
        icon.setAttribute('draggable', 'true');
        icon.addEventListener('dragstart', e => {
            e.dataTransfer.setData('text/plain', 'call');

            const astro = cell.querySelector(`.astronaut`);
            if(astro) {
                selectedAstronaut = astro.dataset.index;

                // les modules habitables sont des cibles potentielles
                // todo doit être actif, et libre
                document.querySelectorAll('.card[data-suit="hearts"]').forEach(el => {
                    if( isFree(parseInt(el.dataset.row), parseInt(el.dataset.col))) el.classList.add('possible-target' )

                });
            }

        });
        cell.appendChild(icon);
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
            cell.classList.add('occupied');

            const token = document.createElement('div');
            token.className = 'astronaut';
            token.innerText = '👨‍🚀';
            token.draggable = true;
            token.dataset.index = i;
            token.addEventListener('dragstart', (e) => {
                selectedAstronaut = i;
                const targets = new Set();
                pathfinder(astro.row, astro.col, 3, targets);

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

            if (!suit || !value) continue;

            // Ajouter un jeton ravitaillement si serre (clubs ♣)
            if (suit === 'clubs') {
                addResourceToCell(row, col, 'food');
                log(`+1 ravitaillement ajouté à la serre en ${row},${col}`);
            }

            // Ajouter un jeton énergie si panneau solaire (diamonds ♦)
            if (suit === 'diamonds') {
                addResourceToCell(row, col, 'energy');
                log(`+1 énergie ajoutée au panneau solaire en ${row},${col}`);
            }
        }
    }

    renderResources();

    const astronautsDied = [];
    for (let astro of astronauts) {
        let cell = document.querySelector(`.cell[data-row="${astro.row}"][data-col="${astro.col}"]`);
        const suit = cell?.dataset.suit;
        const value = cell?.dataset.value;

        // Vérifie si le module habitable est actif
        let isHabitat = (suit === 'hearts' && value !== undefined);
        let onActiveHabitat = isHabitat; // Simplification pour la V1

        let maxResource = 5 - astro.food;
        if (onActiveHabitat) {
            astro.energy = Math.min(astro.energy + 3, maxResource);
            log("Astronaute sur module actif : gagne 3 énergie.");
        } else {
            astro.food--;
            astro.energy = Math.min(astro.energy + 2, maxResource);
            log("Astronaute consomme 1 ravitaillement, gagne 2 énergie.");
        }

        if (astro.food < 0) {
            log("Un astronaute est mort faute de ravitaillement.");
            // Retirer l'astronaute
            astronautsDied.push(astro);
        }
    }
    astronauts = astronauts.filter(x => !astronautsDied.includes(x))
    renderAstronauts();

}

function runAdventurePhase() {
    // Alien Signal en cours
    if (alienAdventure.alienAdventureStep === 1 && alienAdventure.alienPosition) {

        // Mettre à jour l'affichage
        const cell = document.querySelector(`.cell[data-row="${alienAdventure.alienPosition.row}"][data-col="${alienAdventure.alienPosition.col}"]`);
        const icon = cell.querySelector('.alien-signal');
        if (icon) {
            alienAdventure.alienSignalCount++;
            icon.innerText = `🛸 ${alienAdventure.alienSignalCount}`;
            icon.title = `Signal alien : ${alienAdventure.alienSignalCount}`;
        }

        log(`Un nouveau signal alien a été détecté ! Total : ${alienAdventure.alienSignalCount}`);
    }

    if (alienAdventure.alienAdventureStep === 2) {
        // +1 alien
        alienAdventure.alienCount++;
        log(`Renfort alien : ${alienAdventure.alienCount} au total !`);

        if (astronauts.length > 0) {
            const targetIndex = Math.floor(Math.random() * astronauts.length);
            const target = astronauts[targetIndex];
            alienAdventure.alienPosition = { row: target.row, col: target.col };

            // Combat
            let totalRes = target.food + target.energy;
            if (totalRes < alienAdventure.alienCount) {
                log(`Un astronaute a été submergé par ${alienAdventure.alienCount} aliens !`);
                astronauts.splice(targetIndex, 1);
            } else {
                let toRemove = alienAdventure.alienCount;
                if (target.food >= toRemove) {
                    target.food -= toRemove;
                } else {
                    toRemove -= target.food;
                    target.food = 0;
                    target.energy = Math.max(0, target.energy - toRemove);
                }
                log(`Un astronaute perd ${alienAdventure.alienCount} ressources.`);
            }
            renderAstronauts();
            renderAliensIcon();
        }
    }

    // Ici on pourra ajouter les autres péripéties plus tard...
}

function runDiscardPhase() {
    let pileIndex = 1;
    if(deck.length <= 36) pileIndex = 2;
    if(deck.length <= 24) pileIndex = 3;
    if(deck.length <= 12) pileIndex = 4;

    discardFromDeck(pileIndex);
    renderDiscardPile();
}

function addResourceToCell(row, col, type) {
    const key = `${row}-${col}`;
    if (!boardResources[key]) boardResources[key] = { food: 0, energy: 0 };

    const specialMutation = type === 'food'
        && vegetationAdventure.vegetationPosition
        && vegetationAdventure.vegetationPosition.row === row
        && vegetationAdventure.vegetationPosition.col === col;
    const max = specialMutation? 4 : 3;
    const amount = specialMutation ? 2 : 1;

    boardResources[key][type] = Math.min((boardResources[key][type] || 0) + amount, max);
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

        const resources = boardResources[key];
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
}

function collectResource(row, col, type) {
    let astronaut = astronauts.find(a => a.row === row && a.col === col);

    if (!astronaut) {
        log("Aucun astronaute sur cette case pour ramasser une ressource.");
        return;
    }

    const key = `${row}-${col}`;
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

        if(boardResources[key][type] == 1) {
            // on ramasse la le dernier jeton de ravitallement, donc on elève la mutation
            vegetationAdventure.vegetationPosition = null;
            document.querySelector('.plant-mutation')?.remove();
        }
    }

    if (astronaut.food + astronaut.energy >= 5) {
        log("L'astronaute a atteint sa limite de ressources.");
        return;
    }

    astronaut[type]++;
    boardResources[key][type] --;
    log(`Astronaute ramasse 1 ${type}.`);
    renderResources();
    renderAstronauts();
}


function discardResource(astronaut, type) {

    if (astronaut[type] <= 0) {
        log("L'astronaute n'a plus de stock à jeter");
        return;
    }

    astronaut[type]--;
    log(`Astronaute jette 1 ${type}.`);
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

    console.log(cardToDiscard, cardToInstall);

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

    if(astro.energy <= 0) {
        log("Pas d'energie.");
        return;
    }

    const hasCard = cell.classList.contains('card');

    astro.row = row;
    astro.col = col;
    astro.energy--;
    log(`Astronaute déplacé vers ${row},${col} (énergie restante : ${astro.energy})`);

    if (!hasCard) {
        log("Le mouvement s'arrête sur une case vide.");
        const card = deck.shift();
        prepareCard(cell, card);
    }

    renderAstronauts();
}

function calling(cell, astro) {
    const row = parseInt(cell.dataset.row);
    const col = parseInt(cell.dataset.col);

    if(astro.energy <= 0) {
        log("Pas d'energie.");
        return;
    }
    astro.energy--;

    astronauts.push({ row, col, energy: 0, food: 0 });
    renderAstronauts();
    log("Nouvel astronaute appelé sur un module habitable.");

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
        targets.add(`${x}-${y}`);
    }

    if(dist <= 0) return;

    const hasCard = cell.classList.contains('card');
    if(!hasCard) return;

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

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});
