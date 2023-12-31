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
            const actions = [];
            for (let [key, value] of Object.entries(data)) {
                actions.push(new Action(value.type, key, parseInt(value.x), parseInt(value.y), parseInt(value.duree), parseInt(value.inventaire), value.graphisme))
            }
            console.log(actions);
            return actions;
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

            for(let index in data.decors) {
                const a = data.decors[index];
                creerElement('decors', a.id, a.x, a.y, a.graphisme);
            }

            for(let index in data.objets) {
                const o = data.objets[index];
                creerElement('objet', o.id, o.x, o.y, o.graphisme);
            }


            return data;
        }).catch(error => console.error('Error:', error));

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
    const actions = await callToucheApi(key);
    // si on est en mouvement, mais d'autre action prévue, on note la suivante
    if(MOUVEMENT) {
        ACTION_SUIVANTE = actions;
        return;
    }
    // si on n'est pas en mouvement
    appliquerAction(actions, true);
}

function appliquerAction(actions, block) {
    if(actions === null) {return ;}

    const deplacements = actions.filter(a => a.type === 'DEPLACER' && a.id === 'hero');
    if(deplacements && deplacements.length && deplacements[0]) {
        deplacerHero(deplacements[0].x, deplacements[0].y);
    } else if(block) {
        deplacerHero(POSITION_X, POSITION_Y);
    }

    for(let action of actions) {
        const index = INVENTAIRE.indexOf(action.id);
        switch (action.type) {
            case "DEPLACER":
                if(action.id === 'hero') {
              //      deplacerHero(action.x, action.y);
                } else if(index > -1) {
              //      document.getElementById(action.id).style.bottom= action.y+'em';
              //      document.getElementById(action.id).style.left= action.x+'em';
              //      setTimeout(function () {
              //          document.getElementById(action.id).classList.remove('inventaire');
              //      }, 500)
              //      INVENTAIRE[index] = null;
                } else {
                    document.getElementById(action.id+'-background').style.bottom= action.y+'em';
                    document.getElementById(action.id+'-background').style.left= action.x+'em';
                    document.getElementById(action.id+'-foreground').style.bottom= action.y+'em';
                    document.getElementById(action.id+'-foreground').style.left= action.x+'em';
                }
                break;

            case "TIMER":
                // dessinerTimer(action);
                break;

            case "GAME_OVER":
                document.getElementById("gameover").style.opacity = "1";
                break;

            case "RETIRER":
                if(index > -1) {
                    INVENTAIRE[index] = null;
                }
                document.getElementById(action.id).remove();
                break;

            case "DESSINER":
                if(action.id.indexOf('objet') >= 0) {
                    dessinerObjet(action, index);
                } else if(action.id.indexOf('decors') >= 0) {
                    dessinerDecors(action);
                }  else if(action.id.indexOf('salle') >= 0) {
                    dessinerSalle(action);
                }
                break;


        }
        dessinerTimer(action);

    }

}

function dessinerObjet(action, index) {
    let dessin = document.getElementById(action.id);
    if(!dessin) {
        creerElement('objet', action.id, action.x, action.y, action.graphisme);
        dessin = document.getElementById(action.id);
    } else {
        dessin.style.bottom= action.y+'em';
        dessin.style.left= action.x+'em';
        dessin.className= 'objet '+action.graphisme;
    }
    if(action.inventaire > -1) {
        setTimeout(function(){
            dessin.classList.add('inventaire');
            INVENTAIRE[action.inventaire] = action.id;
            recentrerInventaire(dessin, action.inventaire);
        }, 100);
    } else {
        if (index > -1) {
            setTimeout(function () {
                document.getElementById(action.id).classList.remove('inventaire');
            }, 500)
            INVENTAIRE[index] = null;
        }
    }
}

function dessinerDecors(action) {
    let background = document.getElementById(action.id+'-background');
    let foreground = document.getElementById(action.id+'-foreground');

    background.className = 'decors '+action.graphisme+' background';
    background.style.bottom= action.y+'em';
    background.style.left= action.x+'em';

    foreground.style.bottom= action.y+'em';
    foreground.style.left= action.x+'em';
    foreground.className = 'decors '+action.graphisme+' foreground';
}

function dessinerSalle(action) {
    const salle = document.getElementById(action.id);
    const effetSalle = salle.getElementsByClassName('effet-salle').item(0);
    console.log("dessiner salle", action, effetSalle);

    if(action.graphisme.includes('SOMBRE')) {
        effetSalle.style.background = 'radial-gradient(circle at '+(LARGEUR_FENETRE/2)+'em '+(HAUTEUR_FENETRE/2)+'em, transparent, black 1.5em, black)';
        let mask = 'linear-gradient(rgb(0, 0, 0) 0px, rgb(0, 0, 0) 0px)';


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

function dessinerTimer(action) {
    let elem = document.getElementById(action.id + '-timer');
    if(elem) {
        elem.remove();
    }
    if(action.duree > 0) {
        elem = document.createElement('div');
        elem.setAttribute('id', action.id + '-timer');
        elem.classList.add('timer');
        elem.style.animationDuration = action.duree + 's';
        elem.classList.add('launched');
        let idPorteur = action.id;
        if(idPorteur.indexOf("objet") < 0) {
            idPorteur += '-foreground';
        }
        document.getElementById(idPorteur).appendChild(elem);

        TIMERS[action.id] = setTimeout(function(){
            callTimerApi(action.id).then(function (actions) {
                appliquerAction(actions, false);
            });
        }, action.duree *  1000);
    } else if(action.duree < 0) {
        TIMERS[action.id] = setTimeout(function(){
            callTimerApi(action.id).then(function (actions) {
                appliquerAction(actions, false);
            });
        }, action.duree *  -1000);
    } else {
        clearTimeout(TIMERS[action.id]);
    }
}

class Action {
    id;
    x;
    y;
    type;
    duree;
    inventaire;
    graphisme;


    constructor(type, id, x, y, duree, inventaire, graphisme) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.type = type;
        this.duree = duree;
        this.inventaire = inventaire;
        this.graphisme = graphisme;
    }
}