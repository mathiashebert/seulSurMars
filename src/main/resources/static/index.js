/*fetch('http://localhost:8080/game', {
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
        console.log(data);
        return data;
    }).catch(error => console.error('Error:', error));
*/

function callTimerApi(timer) {
    return fetchApi('http://localhost:8080/game/timer', {timer: timer});
}
function callToucheApi(touche) {
    return fetchApi('http://localhost:8080/game/touche', {touche: touche});
}
function fetchApi(url, params) {
    return fetch(url, {
        method: 'POST',
        body: JSON.stringify(params),
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    })
        .then(function(response){
            return response.json()})
        .then(function(data)
        {
            data = data.map(value => new Action(value.type, value.id, parseInt(value.x), parseInt(value.y), parseInt(value.duree)));
            console.log(data);
            return data;
        }).catch(error => console.error('Error:', error));
}



const TILE_SIZE = 96;
const LARGEUR = 20;
const HAUTEUR = 15;
const LARGEUR_FENETRE = 9;
const HAUTEUR_FENETRE = 9;
let POSITION_Y = 1;
let POSITION_X = 1;

let PLATEAU;
let HERO;

let MOUVEMENT = false;
let ACTION_SUIVANTE = null;

const TIMERS = {};


function creerPlateau() {

    PLATEAU = document.createElement('div');
    PLATEAU.setAttribute('id', 'plateau');

    document.getElementById("fenetre").appendChild(PLATEAU);


    return fetch('http://localhost:8080/game', {
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    })
        .then(function(response){
            return response.json()})
        .then(function(data)
        {
            PLATEAU.style.width = data.largeur+'em';
            PLATEAU.style.height = data.hauteur+'em';

            POSITION_X = data.positionX;
            POSITION_Y = data.positionY;

            for(let i=0; i<data.largeur; i++) {
                for(let j=0; j<data.hauteur; j++) {
                    creerTile(i,j,data.positions[i][j].graphisme);
                }
            }

            for(let index in data.ascenseurs) {
                const a = data.ascenseurs[index];
                creerElement('decors', a.id, a.x, a.y, 'ascenseur');
            }


            return data;
        }).catch(error => console.error('Error:', error));

/*
    for(let i = 0; i<LARGEUR; i++) {
        for(let j = 0; j <9; j++) {
            creerTile(i,j,'roche');
        }
        creerTile(i,9, 'sol');
    }

    creerSalle(8, 8, 5, 5, true, true);
    creerElement('tile', 'tile-9-9', 9, 9, 'carreau');

    creerElement('decors', 'ascenseur1', 9, 9, 'ascenseur');

    */


}

document.addEventListener('DOMContentLoaded', function() {

    retaillerFenetre();
    creerPlateau().then(function () {
        creerHero();
        recentrerPlateau();
        setTimeout(function () {
            document.getElementById("fenetre").classList.add("ready");
        }, 500);
    });

}, false);

function creerElement(base, id, i,j,clazz) {
    creerImage(id+'-background', i, j, base+' background '+clazz);
    creerImage(id+'-foreground', i, j, base+' foreground '+clazz);
}
function creerImage(id, i,j,clazz) {
    let tile = document.getElementById(id);
    if (tile === null) {
        tile = document.createElement('div');
        tile.setAttribute('id', id);
        PLATEAU.appendChild(tile);
        tile.style.bottom = j + 'em';
        tile.style.left = i + 'em';
    }
    tile.className = clazz;
}
function creerTile(i,j,clazz) {
    creerElement('tile', 'tile-' + i + '-' + j, i, j, clazz);
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
    touche(e.code);

}, false);

async function touche(key) {
    // si on est en mouvement, et qu'il y a déjà une action suivante de prévue, on ne fait rien
    if(MOUVEMENT && ACTION_SUIVANTE !== null) {
        return;
    }
    const actions = await callToucheApi(key);
    // si on est en mouvement, mais d'autre action prévue, on note la suivante
    if(MOUVEMENT) {
        ACTION_SUIVANTE = actions;
        return;
    }
    // si on n'est pas en mouvement
    appliquerAction(actions);
}

function appliquerAction(actions) {
    console.log("aapliquer", actions);
    if(actions === null) {return ;}

    for(let action of actions) {
        console.log("type ?", action.type);
        switch (action.type) {
            case "GRAPHISME":
                if(action.id === 'hero') {
                    deplacerHero(action.x, action.y);
                } else {
                    document.getElementById(action.id+'-background').style.bottom= action.y+'em';
                    document.getElementById(action.id+'-background').style.left= action.x+'em';
                    document.getElementById(action.id+'-foreground').style.bottom= action.y+'em';
                    document.getElementById(action.id+'-foreground').style.left= action.x+'em';
                }
                break;

            case "TIMER":
                if(action.duree > 0) {
                    TIMERS[action.id] = setTimeout(function(){
                        callTimerApi(action.id).then(function (actions) {
                            appliquerAction(actions);
                        });
                    }, action.duree * 100);
                } else {
                    clearTimeout(TIMERS[action.id]);
                }
                break;

            case "GAME_OVER":
                document.getElementById("fenetre").classList.add("gameOver");

                break;


        }

    }

}

function deplacerHero(x, y) {
    if(x < POSITION_X) {
        HERO.classList.add('left');
        HERO.classList.add('mouvement');
    } else if(x > POSITION_X) {
        HERO.classList.remove('left');
        HERO.classList.add('mouvement');
    }

    POSITION_X = x;
    POSITION_Y = y;

    recentrerPlateau();
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
    type;
    duree;


    constructor(type, id, x, y, duree) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.duree = duree;
    }
}


function creerSalle(x,y, largeur, hauteur, porteGauche, porteDroite) {

    // colonne de gauche
    creerTile(x,y, 'mur6');
    if(porteGauche) {
        creerTile(x,y+1, 'porte');
    } else {
        creerTile(x,y+1, 'mur4');
    }
    for(let j = y+2; j<y+hauteur-1; j++) {
        creerTile(x,j, 'mur4');
    }
    creerTile(x,y+hauteur-1, 'mur1');

    //colonnes à l'interieur de la salle
    for(let i = x+1; i < x+largeur-1; i++) {
        creerTile(i,y, 'mur7');
        creerTile(i,y+1, 'dalle');
        for(let j = y+2; j<y+hauteur-1; j++) {
            creerTile(i,j, 'carreau');
        }
        creerTile(i, y+hauteur-1, 'mur2');
    }

    // colonne de droite
    creerTile(x+largeur-1,y, 'mur8');
    if(porteDroite) {
        creerTile(x+largeur-1,y+1, 'porte');
    } else {
        creerTile(x+largeur-1,y+1, 'mur5');
    }
    for(let j = y+2; j<y+hauteur-1; j++) {
        creerTile(x+largeur-1,j, 'mur5');
    }
    creerTile(x+largeur-1,y+hauteur-1, 'mur3');
}