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
    return fetchApi('http://localhost:8080/game/timer', {id: ID, timer: timer});
}
function callToucheApi(touche) {
    return fetchApi('http://localhost:8080/game/touche', {id: ID, touche: touche});
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
            console.log(data); /*
            const actions = [];
            for (let [key, value] of Object.entries(data)) {
                actions.push(new Action(value.type, key, parseInt(value.x), parseInt(value.y), parseInt(value.duree), parseInt(value.inventaire), value.graphisme))
            }
            console.log(actions);*/
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
let ID;

let MOUVEMENT = false;
let ACTION_SUIVANTE = null;

const TIMERS = {};
const INVENTAIRE = [];


function creerPlateau() {

    PLATEAU = document.getElementById('plateau');
    document.getElementById("inventaire").style.width = LARGEUR_FENETRE+'em';

    return fetch('http://localhost:8080/game', {
        headers: {
            'Content-type': 'application/json; charset=UTF-8',
        }
    })
        .then(function(response){
            return response.json()})
        .then(function(data)
        {
            ID = data.id;
            PLATEAU.style.width = data.largeur+'em';
            PLATEAU.style.height = data.hauteur+'em';

            POSITION_X = data.positionX;
            POSITION_Y = data.positionY;

            for(let index in data.salles) {
                const a = data.salles[index];
                creerSalle(a.x, a.y, a.largeur, a.hauteur);
            }

            for(let i=0; i<data.largeur; i++) {
                for(let j=0; j<data.hauteur; j++) {
                    creerTile(i,j,data.positions[i][j].graphisme);
                }
            }

            draw(data);

            return data;
        }).catch(error => console.error('Error:', error));

}

function draw(data) {

    for(let index in data.decors) {
        const a = data.decors[index];
        creerElement('decor', a.id, a.x, a.y, a.graphisme);
    }

    // dessiner les objets
    for(let index in data.objets) {
        const o = data.objets[index];
        creerElement('objet', o.id, o.x, o.y, o.graphisme);

        // cas special d'une animation
        if(o.animation > 0) {
            document.getElementById(o.id).classList.add('animation');
            document.getElementById(o.id).style.animationDuration = o.animation + 's';

            TIMERS[o.id] = setTimeout(function () {
                removeTimer(o.id);
                callTimerApi(o.id).then(function (actions) {
                    appliquerAction(actions, false);
                });
            }, o.animation*1000);
        }

        // cas particulier : quand l'objet est retiré de l'inventaire, il faut lui laisser la classe "inventaire" pendant 500 ms
        if(INVENTAIRE[0] === o.id && data.inventaire !== o.id) {
            document.getElementById(o.id).classList.add("inventaire");

            setTimeout(function () {
                document.getElementById(o.id).classList.remove('inventaire');
            }, 500)
        }
    }

    // dessiner l'inventaire
    if(data.inventaire) {
        const dessin = document.getElementById(data.inventaire.id);
        dessin.classList.add('inventaire');
        recentrerInventaire(dessin, 0);
        INVENTAIRE[0] = data.inventaire.id;
    } else {
        INVENTAIRE[0] = null;
    }

    // retirer les objets qui ne sont plus dans la liste d'objets, ni dans l'inventaire
    document.querySelectorAll('.objet').forEach(value => {
        const id = value.getAttribute('id');
        if(data.objets.filter(o => o.id === id).length === 0 && INVENTAIRE[0] !== id) {
            removeTimer(id);
        }
    });

    // dessiner l'ambiance des salles
    for(let index in data.salles) {
        dessinerSalle(data.salles[index], data);
    }

    // dessiner les timers
    dessinerTimer('oxygene', data.timerOxygene);
    dessinerTimer('nourriture', data.timerNourriture);

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

function creerSalle(i, j, largeur, hauteur) {
    let tile = document.createElement('div');
    tile.setAttribute('id', 'salle-'+i+'-'+j);
    PLATEAU.appendChild(tile);
    tile.style.bottom = (j+1) + 'em';
    tile.style.left = (i+1) + 'em';
    tile.style.width = (largeur-2) + 'em';
    tile.style.height = (hauteur-2) + 'em';
    tile.classList.add('salle');

    let inside = document.createElement('div');
    tile.appendChild(inside);
    inside.style.width = LARGEUR_FENETRE + 'em';
    inside.style.height = HAUTEUR_FENETRE + 'em';
    inside.classList.add('effet-salle');
    // inside.style.background = 'radial-gradient(circle at '+(LARGEUR_FENETRE/2)+'em '+(HAUTEUR_FENETRE/2)+'em, transparent, black 1.5em, black)';
}

function creerElement(base, id, i,j,clazz) {
    if(base === "objet") {
        creerImage(id, i, j, base+' '+clazz);
    } else {
        creerImage(id+'-background', i, j, base+' background '+clazz);
        creerImage(id+'-foreground', i, j, base+' foreground '+clazz);
    }
}
function creerImage(id, i,j,clazz) {
    let tile = document.getElementById(id);
    if (tile === null) {
        tile = document.createElement('div');
        tile.setAttribute('id', id);
        PLATEAU.appendChild(tile);
    }
    tile.style.bottom = j + 'em';
    tile.style.left = i + 'em';
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

    // recentrer le plateau
    document.getElementById("plateau").style.bottom= offsetY+'em';
    document.getElementById("plateau").style.left= offsetX+'em';

    // replacer le hero
    HERO.style.left = POSITION_X+'em';
    HERO.style.bottom = POSITION_Y+'em';

    // repositionner l'inventaire
    document.getElementById("inventaire").style.bottom= -offsetY+'em';
    document.getElementById("inventaire").style.left= -offsetX+'em';

    for(let i=0; i<10; i++) {
        if(INVENTAIRE[i]) {
            recentrerInventaire(document.getElementById(INVENTAIRE[i]), i);
        }
    }

    // repositionner les effets de salle
    Array.from(document.getElementsByClassName('effet-salle')).forEach((el) => {
        const salle = el.parentNode;
        el.style.bottom = (-parseInt(salle.style.bottom) -offsetY) + 'em';
        el.style.left = (-parseInt(salle.style.left) -offsetX) + 'em';
    });



}

function recentrerInventaire(element, index) {

    const offsetX = (LARGEUR_FENETRE -1)/2 - POSITION_X;
    const offsetY = (HAUTEUR_FENETRE -1)/2 - POSITION_Y;

    element.style.bottom= (-offsetY)+'em';
    element.style.left= (-offsetX+index)+'em';
}



function creerHero() {
    HERO = document.createElement('div');
    HERO.setAttribute('id', 'hero');
    HERO.style.left = POSITION_X+'em';
    HERO.style.bottom = POSITION_Y+'em';

    document.getElementById("plateau").appendChild(HERO);
}


document.addEventListener('keydown', function(e) {
    touche(e.code);

}, false);

async function touche(key) {
    console.log(key);

    // si on est en mouvement, et qu'il y a déjà une action suivante de prévue, on ne fait rien
    if(MOUVEMENT && ACTION_SUIVANTE !== null) {
        return;
    }
    const monde = await callToucheApi(key);
    // si on est en mouvement, mais d'autre action prévue, on note la suivante
    if(MOUVEMENT) {
        ACTION_SUIVANTE = monde;
        return;
    }
    // si on n'est pas en mouvement
    appliquerAction(monde, true);
}

function appliquerAction(data, block) {
    if(!data || !data.status) {return ;}

    if(data.status === 'gameOver') {
        document.getElementById('gameover').style.opacity = 1;
    }


    if(block) {
        deplacerHero(data.positionX, data.positionY);
    }

    draw(data);

}


function dessinerSalle(action, data) {
    const salle = document.getElementById(action.id);
    if(!salle) {
        return;
    }
    const effetSalle = salle.getElementsByClassName('effet-salle').item(0);

    if(action.graphisme.includes('SOMBRE')) {
        effetSalle.style.background = 'radial-gradient(circle at '+(LARGEUR_FENETRE/2)+'em '+(HAUTEUR_FENETRE/2)+'em, transparent, black 1.5em, black)';
        let mask = 'linear-gradient(rgb(0, 0, 0) 0px, rgb(0, 0, 0) 0px)';

        console.log(data.objets);
        for(let index in data.objets) {
            const value = data.objets[index];
            if(value.graphisme === 'feu' || value.graphisme === 'explosion') {
                console.log("feu !", value);
                const px = value.x - action.x - 0.5;
                const py= action.y + action.hauteur - value.y - 1.5;
                mask += ', radial-gradient(circle at '+px+'em '+py+'em, rgb(0, 0, 0) 0, rgba(0, 0, 0, 0) 1em) no-repeat';
            }
        }
        console.log(mask);

/*
        const lights = action.graphisme.split(" ");
        for(let i = 1; i< lights.length; i++) {
            const position = lights[i];
            const px = position.split("-")[0];
            const py= position.split("-")[1];
            console.log(position);
            console.log(mask);
            mask += ', radial-gradient(circle at '+px+'em '+py+'em, rgb(0, 0, 0) 0, rgba(0, 0, 0, 0) 1em) no-repeat';
            console.log(mask);
        }
*/
        salle.style['-webkit-mask'] = mask;
        salle.style['-webkit-mask-composite'] = 'xor';
    } else if(action.graphisme.includes('ALARME')) {

    } else {
        effetSalle.style.background = 'transparent';
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
            appliquerAction(ACTION_SUIVANTE, true);
            ACTION_SUIVANTE = null;
        }
    }, 500);


}

function dessinerTimer(id, duree) {

    if(duree === 0) {
        removeTimer(id);
    } else if( !TIMERS[id] ) {
        const elem = document.createElement('div');
        elem.setAttribute('id', id);
        elem.classList.add('timer');
        elem.style.animationDuration = duree + 's';
        elem.classList.add('launched');
        document.getElementById(id + '-timer').appendChild(elem);

        TIMERS[id] = setTimeout(function(){
            removeTimer(id)
            callTimerApi(id).then(function (actions) {
                appliquerAction(actions, false);
            });
        }, duree *  1000);
    }
}

function removeTimer(id) {
    if(document.getElementById(id)) {
        document.getElementById(id).remove();
    }
    clearTimeout(TIMERS[id]);
    TIMERS[id] = undefined;
}