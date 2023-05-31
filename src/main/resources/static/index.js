fetch('http://localhost:8080/game', {
    method: 'POST',
    body: JSON.stringify({
        title:'sdsfd',
        body:'sdfsdfsf',

    }),
    headers: {
        'Content-type': 'application/json; charset=UTF-8',
    }
})
    .then(function(response){
        return response.json()})
    .then(function(data)
    {
        console.log(data)
    }).catch(error => console.error('Error:', error));



const TILE_SIZE = 96;
const LARGEUR = 20;
const HAUTEUR = 15;
const LARGEUR_FENETRE = 9;
const HAUTEUR_FENETRE = 9;
let POSITION_Y = 9;
let POSITION_X = 10;

let PLATEAU;
let HERO;

let MOUVEMENT = false;
let ACTION_SUIVANTE = null;


function creerPlateau() {

    PLATEAU = document.createElement('div');
    PLATEAU.setAttribute('id', 'plateau');
    PLATEAU.style.width = LARGEUR+'em';
    PLATEAU.style.height = HAUTEUR+'em';

    document.getElementById("fenetre").appendChild(PLATEAU);


    for(let i = 0; i<LARGEUR; i++) {
        for(let j = 0; j <9; j++) {
            creerTile(i,j,'roche');
        }
        creerTile(i,9, 'sol');
    }
}

document.addEventListener('DOMContentLoaded', function() {

    creerPlateau();
    retaillerFenetre();
    creerHero();
    recentrerPlateau();

}, false);

function creerTile(i,j,clazz) {
    const tile = document.createElement('div');
    tile.classList.add('tile');
    tile.classList.add(clazz);
    tile.style.bottom = j+'em';
    tile.style.left = i+'em';
    tile.setAttribute('id', 'tile-'+i+'-'+j);
    PLATEAU.appendChild(tile);
}

function retaillerFenetre() {
    const fenetre = document.getElementById('fenetre');
    fenetre.style.fontSize = TILE_SIZE+'px';
    fenetre.style.width = (TILE_SIZE*LARGEUR_FENETRE) + 'px';
    fenetre.style.height = (TILE_SIZE*HAUTEUR_FENETRE) + 'px';

}
function recentrerPlateau() {
    const offsetX = (LARGEUR_FENETRE -1)/2 - POSITION_X;
    const offsetY = (HAUTEUR_FENETRE -1)/2 - POSITION_Y;

    document.getElementById("plateau").style.bottom= offsetY+'em';
    document.getElementById("plateau").style.left= offsetX+'em';

    HERO.style.left = POSITION_X+'em';
    HERO.style.bottom = POSITION_Y+'em';

}

function creerHero() {
    HERO = document.createElement('div');
    HERO.setAttribute('id', 'hero');
    HERO.style.left = POSITION_X+'em';
    HERO.style.bottom = POSITION_Y+'em';

    document.getElementById("plateau").appendChild(HERO);
}


document.addEventListener('keydown', function(e) {

    console.log(e.code, e.key);
    touche(e.key);

}, false);

function toucheToAction(key) {
    if(key === 'ArrowLeft') {
        return new Action('hero', POSITION_X-1, POSITION_Y);
    } else if(key === 'ArrowRight') {
        return new Action('hero', POSITION_X+1, POSITION_Y);
    } else {
        return null;
    }
}

function touche(key) {
    // si on est en mouvement, et qu'il y a déjà une action suivante de prévue, on ne fait rien
    if(MOUVEMENT && ACTION_SUIVANTE !== null) {
        return;
    }
    // si on est en mouvement, mais d'autre action prévue, on note la suivante
    if(MOUVEMENT) {
        ACTION_SUIVANTE = toucheToAction(key);
        return;
    }
    // si on n'est pas en mouvement
    appliquerAction(toucheToAction(key));
}

function appliquerAction(action) {
    if(action === null) {return ;}

    console.log(action);
    if(action.id === 'hero') {
        deplacerHero(action.x);
    }
}

function deplacerHero(x) {

    if(x < POSITION_X) {
        HERO.classList.add('left');
    } else {
        HERO.classList.remove('left');
    }

    POSITION_X = x;

    recentrerPlateau();
    HERO.classList.add('mouvement');
    MOUVEMENT = true;
    setTimeout(function () {
        MOUVEMENT = false;
        HERO.classList.remove('mouvement');
        if(ACTION_SUIVANTE !== null) {
            appliquerAction(ACTION_SUIVANTE);
            ACTION_SUIVANTE = null;
        }
    }, 1000);


}

class Action {
    id;
    x;
    y;


    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }
}