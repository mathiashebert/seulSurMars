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

    creerSalle(8, 8, 5, 4, true, true);

    creer_image('decors', 'ascenseur1-background', 'background', 9, 9, 'ascenseur');
    creer_image('decors', 'ascenseur1-foreground', 'foreground', 9, 9, 'ascenseur');


}

document.addEventListener('DOMContentLoaded', function() {

    creerPlateau();
    retaillerFenetre();
    creerHero();
    recentrerPlateau();

}, false);

function creer_image(base, id, couche, i,j,clazz) {
    let tile = document.getElementById(id);
    if (tile === null) {
        tile = document.createElement('div');
        tile.setAttribute('id', id);
        PLATEAU.appendChild(tile);
        tile.style.bottom = j + 'em';
        tile.style.left = i + 'em';
    }
    tile.className = base + ' ' + couche + ' ' + clazz;
}
function creerTile(i,j,clazz) {
    creer_image('tile', 'tile-background-' + i + '-' + j, 'background', i, j, clazz);
    creer_image('tile', 'tile-foreground-' + i + '-' + j, 'foreground', i, j, clazz);
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
    }, 500);


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


function creerSalle(x,y, largeur, hauteur, porteGauche, porteDroite) {

    // colonne de gauche
    creerTile(x,y, 'mur5');
    if(porteGauche) {
        creerTile(x,y+1, 'porte');
    } else {
        creerTile(x,y+1, 'mur1');
    }
    for(let j = y+2; j<y+hauteur-1; j++) {
        creerTile(x,j, 'mur1');
    }
    creerTile(x,y+hauteur-1, 'mur3');

    //colonnes à l'interieur de la salle
    for(let i = x+1; i < x+largeur-1; i++) {
        creerTile(i,y, 'mur2');
        creerTile(i,y+1, 'dalle');
        for(let j = y+2; j<y+hauteur-1; j++) {
            creerTile(i,j, 'carreau');
        }
        creerTile(i, y+hauteur-1, 'mur2');
    }

    // colonne de droite
    creerTile(x+largeur-1,y, 'mur6');
    if(porteDroite) {
        creerTile(x+largeur-1,y+1, 'porte');
    } else {
        creerTile(x+largeur-1,y+1, 'mur1');
    }
    for(let j = y+2; j<y+hauteur-1; j++) {
        creerTile(x+largeur-1,j, 'mur1');
    }
    creerTile(x+largeur-1,y+hauteur-1, 'mur4');
}