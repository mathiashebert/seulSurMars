// Jeu : Une Maison sur la Lune
// Fichier principal JavaScript

const suits = ['hearts', 'clubs', 'diamonds', 'spades'];
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

let deck = [];
let drawPiles = [[], [], [], []];
let currentPileIndex = 0;
let astronauts = []; // Liste des astronautes avec leurs positions et ressources
let boardResources = {}; // ex: { "2-3": { food: 1, energy: 2 } }
let selectedAstronaut = null;
let possibleTargets = [];


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
}

function drawInitialLayout() {
    const board = document.getElementById('board');
    board.innerHTML = '';
    const grid = [];
/*
    for (let y = 0; y < boardSize; y++) {
        for (let x = 0; x < boardSize; x++) {
            const div = document.createElement('div');
            div.classList.add('card');
            div.dataset.x = x;
            div.dataset.y = y;
            const special = Object.entries(specialPositions).find(([_, pos]) => pos[0] === y && pos[1] === x);
            div.textContent = special ? special[0] : '';
            board.appendChild(div);
        }
    }*/

    for (let row = 0; row < boardSize; row++) {
        const rowEl = document.createElement('div');
        //rowEl.className = 'row';
        for (let col = 0; col < boardSize; col++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = row;
            cell.dataset.col = col;
            cell.innerHTML = '';
            board.appendChild(cell);
            //rowEl.appendChild(cell);
        }
        //board.appendChild(rowEl);
    }

    // Positionnement des 4 as au centre (carré 2x2)
    placeCard(2, 2, { suit: 'hearts', value: 'A' });
    placeCard(2, 3, { suit: 'clubs', value: 'A' });
    placeCard(3, 2, { suit: 'diamonds', value: 'A' });
    placeCard(3, 3, { suit: 'spades', value: 'A' });
}

function placeCard(row, col, card) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    if (cell) {
        cell.innerHTML = `${card.value} ${getSuitSymbol(card.suit)}`;
        cell.classList.add('card');
        cell.dataset.suit = card.suit;
        cell.dataset.value = card.value;
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


    for (let i = 0; i < astronauts.length; i++) {
        const astro = astronauts[i];
        const cell = document.querySelector(`.cell[data-row="${astro.row}"][data-col="${astro.col}"]`);
        if (cell) {
            const token = document.createElement('div');
            token.className = 'astronaut';
            token.innerText = '👨‍🚀';
            token.draggable = true;
            token.dataset.index = i;
            token.addEventListener('dragstart', (e) => {
                selectedAstronaut = i;
                const targets = new Set();
                pathfinder(astro.row, astro.col, 3, targets);
                targets.delete(`${astro.row}-${astro.col}`);
                possibleTargets = [];

                targets.forEach(target => {
                    const x = target.split('-')[0];
                    const y = target.split('-')[1];
                    document.querySelector(`.cell[data-row="${x}"][data-col="${y}"]`).classList.add('possible-target');
                    possibleTargets.push(target);
                })
            });
            cell.appendChild(token);

            if (astro.food > 0) {
                const food = document.createElement('div');
                food.className = 'resource-token';
                food.innerText = `🥬${astro.food}`;
                token.appendChild(food);
            }
            if (astro.energy > 0) {
                const energy = document.createElement('div');
                energy.className = 'resource-token';
                energy.innerText = `🔋${astro.energy}`;
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

function addResourceToCell(row, col, type, amount = 1) {
    const key = `${row}-${col}`;
    if (!boardResources[key]) boardResources[key] = { food: 0, energy: 0 };
    boardResources[key][type] = Math.min((boardResources[key][type] || 0) + amount, 3);
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
            cell.appendChild(food);
        }
        if (resources.energy > 0) {
            const energy = document.createElement('div');
            energy.className = 'resource-token';
            energy.innerText = `🔋${resources.energy}`;
            cell.appendChild(energy);
        }
    }
}


function setupDragAndDrop() {
    document.querySelectorAll('.cell').forEach(cell => {
        cell.addEventListener('dragover', (e) => e.preventDefault());
        cell.addEventListener('drop', (e) => {

            document.querySelectorAll(`.cell`).forEach(c => {c.classList.remove('possible-target')});

            if (selectedAstronaut === null) return;
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            const astro = astronauts[selectedAstronaut];

            if( ! possibleTargets.includes(row+'-'+col) ) {
                log("Déplacement invalide.");
                selectedAstronaut = null;
                return;
            }

            if(astro.energy <= 0) {
                log("Pas d'energie.");
                selectedAstronaut = null;
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
                console.log(deck);
                placeCard(row, col, card);
            }

            renderAstronauts();
            selectedAstronaut = null;
        });
    });
}

function pathfinder(x, y, dist, targets) {
    targets.add(`${x}-${y}`);

    if(dist <= 0) return;

    const cell = document.querySelector(`.cell[data-row="${x}"][data-col="${y}"]`)
    const hasCard = cell.classList.contains('card');
    if(!hasCard) return;

    if(x > 0) pathfinder(x-1, y, dist-1, targets);
    if(y < boardSize-1) pathfinder(x, y+1, dist-1, targets);
    if(x < boardSize-1) pathfinder(x+1, y, dist-1, targets);
    if(y > 0) pathfinder(x, y-1, dist-1, targets);

}

function log(message) {
    logMessage(message);
}

document.addEventListener('DOMContentLoaded', () => {
    initializeGame();
});
